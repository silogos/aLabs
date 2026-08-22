/** Task routes — list (filtered), CRUD, statuses/labels/types. */
import { Hono } from "hono";
import { z } from "zod";
import { store } from "../../db/store";
import {
  uuidv7,
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
task.get("/tasks", requirePermission("task:view"), (c) => {
  const q = parseQuery(c.req.query(), taskListQuery);
  const pid = projectIdOf(c);
  let rows = store.tasks.filter(
    (t) => t.projectId === pid && !t.deletedAt && !t.parentId, // top-level tasks
  );
  if (q.statusId) rows = rows.filter((t) => t.statusId === q.statusId);
  if (q.assigneeId) rows = rows.filter((t) => t.assigneeId === q.assigneeId);
  if (q.typeId) rows = rows.filter((t) => t.typeId === q.typeId);
  if (q.priority) rows = rows.filter((t) => t.priority === q.priority);
  if (q.iterationId) rows = rows.filter((t) => t.iterationId === q.iterationId);
  if (q.labelId) rows = rows.filter((t) => t.labels.some((l) => l.id === q.labelId));
  if (q.q) {
    const s = q.q.toLowerCase();
    rows = rows.filter((t) => t.title.toLowerCase().includes(s));
  }
  rows = rows.sort((a, b) => a.order - b.order);
  return paginated(c, paginate(rows.map((r) => taskSchema.parse(r)), q));
});

task.post("/tasks", requirePermission("task:create"), async (c) => {
  const pid = projectIdOf(c);
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), taskCreate);
  const defaultStatus = store.taskStatuses.find((s) => s.projectId === pid && s.isDefault);
  const status = input.statusId
    ? store.taskStatuses.find((s) => s.id === input.statusId && s.projectId === pid)
    : defaultStatus;
  if (input.statusId && !status) throw notFound("Status not found");
  const labels = (input.labelIds ?? [])
    .map((id: string) => store.taskLabels.find((l) => l.id === id && l.projectId === pid))
    .filter(Boolean);
  const created_ = {
    id: uuidv7(),
    projectId: pid,
    title: input.title,
    description: input.description ?? null,
    statusId: status?.id ?? defaultStatus!.id,
    assigneeId: input.assigneeId ?? null,
    reporterId: user.id,
    priority: input.priority ?? "medium",
    typeId: input.typeId ?? null,
    parentId: input.parentId ?? null,
    iterationId: input.iterationId ?? null,
    milestoneId: input.milestoneId ?? null,
    dueDate: input.dueDate ?? null,
    order: store.tasks.filter((t) => t.projectId === pid).length,
    labels,
    estimate: input.estimate ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.tasks.push(created_);
  return created(c, taskSchema.parse(created_));
});

// ---- statuses / labels / types (static sub-paths BEFORE :id) ----
task.get("/tasks/statuses", requirePermission("task:view"), (c) =>
  data(
    c,
    store.taskStatuses
      .filter((s) => s.projectId === projectIdOf(c))
      .sort((a, b) => a.order - b.order),
  ),
);
task.post("/tasks/statuses", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = parseBody(await c.req.json(), z.object({ name: z.string(), color: z.string().optional() }));
  const s = { id: uuidv7(), projectId: pid, name: body.name, color: body.color ?? null, order: 0, isDefault: false };
  store.taskStatuses.push(s);
  return created(c, s);
});
task.get("/tasks/labels", requirePermission("task:view"), (c) =>
  data(c, store.taskLabels.filter((l) => l.projectId === projectIdOf(c))),
);
task.post("/tasks/labels", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = parseBody(await c.req.json(), z.object({ name: z.string(), color: z.string().optional() }));
  const l = { id: uuidv7(), projectId: pid, name: body.name, color: body.color ?? null };
  store.taskLabels.push(l);
  return created(c, l);
});
task.get("/tasks/types", requirePermission("task:view"), (c) =>
  data(c, store.taskTypes.filter((t) => t.projectId === projectIdOf(c))),
);
task.post("/tasks/types", requirePermission("task:update"), async (c) => {
  const pid = projectIdOf(c);
  const body = parseBody(await c.req.json(), z.object({ name: z.string() }));
  const t = { id: uuidv7(), projectId: pid, name: body.name };
  store.taskTypes.push(t);
  return created(c, t);
});

task.get("/tasks/:id", requirePermission("task:view"), (c) => {
  const t = findTask(c);
  return data(c, serializeTask(t));
});

task.patch("/tasks/:id", requirePermission("task:update"), async (c) => {
  const t = findTask(c);
  const input = parseBody(await c.req.json(), taskUpdate);
  // optimistic concurrency
  if (input.updatedAt && input.updatedAt !== t.updatedAt) throw conflict("Task was modified");
  if (input.statusId) {
    const pid = projectIdOf(c);
    const ns = store.taskStatuses.find((s) => s.id === input.statusId && s.projectId === pid);
    if (!ns) throw notFound("Status not found");
  }
  if (input.labelIds) {
    const pid = projectIdOf(c);
    t.labels = input.labelIds
      .map((id: string) => store.taskLabels.find((l) => l.id === id && l.projectId === pid)!)
      .filter(Boolean);
  }
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
    "dueDate",
    "estimate",
  ] as const) {
    if (input[k] !== undefined) (t as Record<string, unknown>)[k] = input[k];
  }
  t.updatedAt = new Date().toISOString();
  return data(c, serializeTask(t));
});

task.delete("/tasks/:id", requirePermission("task:delete"), (c) => {
  const t = findTask(c);
  t.deletedAt = new Date().toISOString();
  return noContent(c);
});

/* ---- helpers ---- */

function findTask(c: Ctx) {
  const pid = projectIdOf(c);
  const id = c.req.param("id");
  const t = store.tasks.find((x) => x.id === id && x.projectId === pid && !x.deletedAt);
  if (!t) throw notFound();
  return t;
}

function serializeTask(t: (typeof store.tasks)[number]) {
  return {
    ...t,
    subtasks: store.tasks
      .filter((s) => s.parentId === t.id && !s.deletedAt)
      .sort((a, b) => a.order - b.order),
    comments: store.comments
      .filter((cm) => cm.taskId === t.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}
