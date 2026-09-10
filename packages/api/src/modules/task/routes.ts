/** Task routes — list (filtered), CRUD, statuses/labels/types.
 *  Task rows, config, and comments live in Postgres (db/task-repo.ts). */
import { Hono } from "hono";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as taskRepo from "../../db/task-repo";
import * as docRepo from "../../db/doc-repo";
import {
  taskCreate,
  taskUpdate,
  taskSchema,
  taskLinkCreate,
  taskLinkSchema,
  commentCreate,
  taskStatusCreate,
  taskLabelCreate,
  taskTypeCreate,
  taskListQuery,
  paginate,
  uuidv7,
} from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { created, data, noContent, paginated } from "../../lib/responses";
import { parseJsonBody, parseQuery, pickDefined } from "../../lib/validate";
import { projectContext, projectIdOf } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import { UPLOADS_DIR, ATTACHMENT_MAX_BYTES, attachmentTypeAllowed, imageExt } from "../../lib/uploads";
import type { Vars, Ctx } from "../../lib/ctx";

export const task = new Hono<{ Variables: Vars }>();

task.use("*", projectContext);

// ---- list ----
task.get("/tasks", requirePermission("task:view"), async (c) => {
  const q = parseQuery(c.req.query(), taskListQuery);
  const pid = projectIdOf(c);
  const rows = await taskRepo.listTasks(pid, { ...q, includeSubtasks: q.includeSubtasks === "true" });
  taskRepo.attachLinks(rows, await taskRepo.listProjectLinks(pid));
  return paginated(c, paginate(rows.map((r) => taskSchema.parse(r)), q));
});

task.post("/tasks", requirePermission("task:create"), async (c) => {
  const pid = projectIdOf(c);
  const user = c.get("user")!;
  const input = await parseJsonBody(c, taskCreate);
  const defaultStatus = await taskRepo.findDefaultStatus(pid);
  if (!defaultStatus) throw badRequest("Project has no default task status");
  const status = input.statusId ? await taskRepo.findStatus(pid, input.statusId) : defaultStatus;
  if (input.statusId && !status) throw notFound("Status not found");
  if (input.labelIds) {
    const found = await taskRepo.findLabels(pid, input.labelIds);
    if (found.length !== input.labelIds.length) throw badRequest("Unknown label id");
  }
  const created_ = await taskRepo.insertTask({
    projectId: pid,
    title: input.title,
    description: input.description ?? null,
    statusId: status?.id ?? defaultStatus.id,
    assigneeId: input.assigneeId ?? null,
    reporterId: user.id,
    priority: input.priority ?? "medium",
    typeId: input.typeId ?? null,
    parentId: input.parentId ?? null,
    epicId: input.epicId ?? null,
    iterationId: input.iterationId ?? null,
    milestoneId: input.milestoneId ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    order: await taskRepo.countProjectTasks(pid),
    estimate: input.estimate ?? null,
    labelIds: input.labelIds ?? [],
    actorId: user.id,
  });
  return created(c, taskSchema.parse(created_));
});

// ---- statuses / labels / types (static sub-paths BEFORE :id) ----
task.get("/tasks/statuses", requirePermission("task:view"), async (c) =>
  data(c, await taskRepo.listStatuses(projectIdOf(c))),
);
task.post("/tasks/statuses", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = await parseJsonBody(c, taskStatusCreate);
  return created(c, await taskRepo.insertStatus({ projectId: pid, name: body.name, color: body.color ?? null }));
});
task.get("/tasks/labels", requirePermission("task:view"), async (c) =>
  data(c, await taskRepo.listLabels(projectIdOf(c))),
);
task.post("/tasks/labels", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = await parseJsonBody(c, taskLabelCreate);
  return created(c, await taskRepo.insertLabel({ projectId: pid, name: body.name, color: body.color ?? null }));
});
task.get("/tasks/types", requirePermission("task:view"), async (c) =>
  data(c, await taskRepo.listTypes(projectIdOf(c))),
);
task.post("/tasks/types", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = await parseJsonBody(c, taskTypeCreate);
  return created(c, await taskRepo.insertType(pid, body.name));
});

// ---- cross-issue links (static sub-path BEFORE :id) ----
task.get("/tasks/:id/links", requirePermission("task:view"), async (c) => {
  const t = await findTask(c);
  const links = await taskRepo.listProjectLinks(t.projectId);
  return data(c, links.filter((l) => l.sourceId === t.id || l.targetId === t.id));
});

task.post("/tasks/:id/links", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const input = await parseJsonBody(c, taskLinkCreate);
  const link = await taskRepo.addTaskLink({
    projectId: projectIdOf(c),
    taskId: t.id,
    targetId: input.targetId,
    type: input.type,
  });
  if (!link) throw badRequest("Cannot link a task to itself or across projects");
  return created(c, taskLinkSchema.parse(link));
});

task.delete("/tasks/:id/links/:linkId", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const ok = await taskRepo.deleteTaskLink(projectIdOf(c), t.id, c.req.param("linkId")!);
  if (!ok) throw notFound();
  return noContent(c);
});

// ---- comments ----
task.post("/tasks/:id/comments", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const input = await parseJsonBody(c, commentCreate);
  return created(c, await taskRepo.insertComment({ taskId: t.id, userId: c.get("user")!.id, body: input.body }));
});

// ---- activity feed (creation + status events + comments, newest first) ----
task.get("/tasks/:id/activity", requirePermission("task:view"), async (c) => {
  const t = await findTask(c);
  return data(c, await taskRepo.listTaskActivity(t.id));
});

// ---- attachments (multipart upload → files catalog + task link) ----
task.post("/tasks/:id/attachments", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const user = c.get("user")!;
  const body = await c.req.parseBody();
  const file = body["file"];
  if (!(file instanceof File)) throw badRequest("Missing 'file' part");
  if (!attachmentTypeAllowed(file.type)) throw badRequest("Unsupported file type");
  if (file.size > ATTACHMENT_MAX_BYTES) throw badRequest("File too large (10 MB max)");

  const ext = imageExt(file.type, file.name);
  const fid = uuidv7();
  const fname = `${fid}${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(join(UPLOADS_DIR, fname), Buffer.from(await file.arrayBuffer()));
  const f = await docRepo.insertFile({
    projectId: t.projectId,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url: `/uploads/${fname}`,
    uploadedBy: user.id,
  });
  return created(c, await taskRepo.insertAttachment({ taskId: t.id, fileId: f.id, uploadedBy: user.id }));
});

task.delete("/tasks/:id/attachments/:attachmentId", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const ok = await taskRepo.softDeleteAttachment(t.id, c.req.param("attachmentId")!);
  if (!ok) throw notFound();
  return noContent(c);
});

task.get("/tasks/:id", requirePermission("task:view"), async (c) => {
  return data(c, await serializeTask(await findTask(c)));
});

task.patch("/tasks/:id", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const input = await parseJsonBody(c, taskUpdate);
  // optimistic concurrency
  if (input.updatedAt && input.updatedAt !== t.updatedAt) throw conflict("Task was modified");
  if (input.statusId) {
    const ns = await taskRepo.findStatus(projectIdOf(c), input.statusId);
    if (!ns) throw notFound("Status not found");
  }
  if (input.labelIds) {
    const found = await taskRepo.findLabels(projectIdOf(c), input.labelIds);
    if (found.length !== input.labelIds.length) throw badRequest("Unknown label id");
  }
  const patch: Parameters<typeof taskRepo.patchTask>[2] = pickDefined(input, [
    "title",
    "description",
    "statusId",
    "assigneeId",
    "priority",
    "typeId",
    "parentId",
    "epicId",
    "iterationId",
    "milestoneId",
    "estimate",
  ]);
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.labelIds) patch.labelIds = input.labelIds;
  const updated = await taskRepo.patchTask(t.id, t.updatedAt!, patch, c.get("user")!.id);
  if (!updated) throw conflict("Task was modified");
  return data(c, await serializeTask(updated));
});

task.delete("/tasks/:id", requirePermission("task:delete"), async (c) => {
  const t = await findTask(c);
  await taskRepo.softDeleteTask(t.id);
  return noContent(c);
});

/* ---- helpers ---- */

async function findTask(c: Ctx) {
  const t = await taskRepo.getTask(c.req.param("id")!);
  if (!t || t.projectId !== projectIdOf(c)) throw notFound();
  return t;
}

async function serializeTask(t: taskRepo.TaskWithMeta) {
  taskRepo.attachLinks([t], await taskRepo.listProjectLinks(t.projectId));
  return {
    ...t,
    subtasks: await taskRepo.listSubtasks(t.id),
    comments: await taskRepo.listComments(t.id),
    attachments: await taskRepo.listAttachments(t.id),
  };
}
