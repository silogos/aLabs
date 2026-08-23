/** Task routes — list (filtered), CRUD, statuses/labels/types.
 *  Task rows, config, and comments live in Postgres (db/task-repo.ts). */
import { Hono } from "hono";
import { z } from "zod";
import * as taskRepo from "../../db/task-repo";
import {
  taskCreate,
  taskUpdate,
  taskSchema,
  paginationQuery,
  paginate,
} from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { created, data, noContent, paginated } from "../../lib/responses";
import { parseBody, parseQuery } from "../../lib/validate";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const task = new Hono<{ Variables: Vars }>();

task.use("*", projectContext);

const taskListQuery = paginationQuery.extend({
  statusId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  labelId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  priority: z.string().optional(),
  iterationId: z.string().uuid().optional(),
  q: z.string().optional(),
});

function projectIdOf(c: Ctx) {
  const t = currentTenant(c);
  return t.projectId!;
}

// ---- list ----
task.get("/tasks", requirePermission("task:view"), async (c) => {
  const q = parseQuery(c.req.query(), taskListQuery);
  const rows = await taskRepo.listTasks(projectIdOf(c), q);
  return paginated(c, paginate(rows.map((r) => taskSchema.parse(r)), q));
});

task.post("/tasks", requirePermission("task:create"), async (c) => {
  const pid = projectIdOf(c);
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), taskCreate);
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
    iterationId: input.iterationId ?? null,
    milestoneId: input.milestoneId ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    order: await taskRepo.countProjectTasks(pid),
    estimate: input.estimate ?? null,
    labelIds: input.labelIds ?? [],
  });
  return created(c, taskSchema.parse(created_));
});

// ---- statuses / labels / types (static sub-paths BEFORE :id) ----
task.get("/tasks/statuses", requirePermission("task:view"), async (c) =>
  data(c, await taskRepo.listStatuses(projectIdOf(c))),
);
task.post("/tasks/statuses", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = parseBody(await c.req.json(), z.object({ name: z.string(), color: z.string().optional() }));
  return created(c, await taskRepo.insertStatus({ projectId: pid, name: body.name, color: body.color ?? null }));
});
task.get("/tasks/labels", requirePermission("task:view"), async (c) =>
  data(c, await taskRepo.listLabels(projectIdOf(c))),
);
task.post("/tasks/labels", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = parseBody(await c.req.json(), z.object({ name: z.string(), color: z.string().optional() }));
  return created(c, await taskRepo.insertLabel({ projectId: pid, name: body.name, color: body.color ?? null }));
});
task.get("/tasks/types", requirePermission("task:view"), async (c) =>
  data(c, await taskRepo.listTypes(projectIdOf(c))),
);
task.post("/tasks/types", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = parseBody(await c.req.json(), z.object({ name: z.string() }));
  return created(c, await taskRepo.insertType(pid, body.name));
});

task.get("/tasks/:id", requirePermission("task:view"), async (c) => {
  return data(c, await serializeTask(await findTask(c)));
});

task.patch("/tasks/:id", requirePermission("task:update"), async (c) => {
  const t = await findTask(c);
  const input = parseBody(await c.req.json(), taskUpdate);
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
  const patch: Parameters<typeof taskRepo.patchTask>[2] = {};
  for (const k of [
    "title",
    "description",
    "statusId",
    "assigneeId",
    "priority",
    "typeId",
    "parentId",
    "iterationId",
    "milestoneId",
    "estimate",
  ] as const) {
    if (input[k] !== undefined) (patch as Record<string, unknown>)[k] = input[k];
  }
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.labelIds) patch.labelIds = input.labelIds;
  const updated = await taskRepo.patchTask(t.id, t.updatedAt!, patch);
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
  return {
    ...t,
    subtasks: await taskRepo.listSubtasks(t.id),
    comments: await taskRepo.listComments(t.id),
  };
}
