/** Task repository — Postgres (Drizzle) for tasks, statuses, types, labels
 *  (join table), and task comments. Domain shapes stay zod-inferred: tasks
 *  embed their labels array (joined + grouped here); the list endpoint keeps
 *  its cursor envelope by paginating the fetched rows in memory (prototype
 *  volumes). */
import { and, asc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "./pg";
import {
  tasks,
  taskStatuses,
  taskTypes,
  taskLabels,
  taskLabelLinks,
  taskLinks,
  taskComments,
} from "@pmin/core/db";
import { uuidv7, type Task, type TaskStatus, type TaskType, type TaskLabel, type TaskLink } from "@pmin/core";

type TaskRow = typeof tasks.$inferSelect;
type StatusRow = typeof taskStatuses.$inferSelect;
type TypeRow = typeof taskTypes.$inferSelect;
type LabelRow = typeof taskLabels.$inferSelect;
type CommentRow = typeof taskComments.$inferSelect;

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export type TaskWithMeta = Task & { deletedAt: string | null };

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
}

/* ---------------- statuses / types / labels ---------------- */

const toStatus = (r: StatusRow): TaskStatus => ({
  id: r.id,
  projectId: r.projectId,
  name: r.name,
  color: r.color,
  order: r.order,
  isDefault: r.isDefault,
});

const toType = (r: TypeRow): TaskType => ({ id: r.id, projectId: r.projectId, name: r.name });

const toLabel = (r: LabelRow): TaskLabel => ({
  id: r.id,
  projectId: r.projectId,
  name: r.name,
  color: r.color,
});

export async function listStatuses(projectId: string): Promise<TaskStatus[]> {
  const rows = await db
    .select()
    .from(taskStatuses)
    .where(eq(taskStatuses.projectId, projectId))
    .orderBy(asc(taskStatuses.order));
  return rows.map(toStatus);
}

export async function findStatus(projectId: string, statusId: string): Promise<TaskStatus | null> {
  const [row] = await db
    .select()
    .from(taskStatuses)
    .where(and(eq(taskStatuses.projectId, projectId), eq(taskStatuses.id, statusId)))
    .limit(1);
  return row ? toStatus(row) : null;
}

export async function findDefaultStatus(projectId: string): Promise<TaskStatus | null> {
  const [row] = await db
    .select()
    .from(taskStatuses)
    .where(and(eq(taskStatuses.projectId, projectId), eq(taskStatuses.isDefault, true)))
    .limit(1);
  return row ? toStatus(row) : null;
}

export async function insertStatus(input: {
  projectId: string;
  name: string;
  color?: string | null;
  order?: number;
  isDefault?: boolean;
}): Promise<TaskStatus> {
  const [row] = await db
    .insert(taskStatuses)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      name: input.name,
      color: input.color ?? null,
      order: input.order ?? 0,
      isDefault: input.isDefault ?? false,
      createdAt: new Date(),
    })
    .returning();
  return toStatus(row!);
}

export async function listTypes(projectId: string): Promise<TaskType[]> {
  const rows = await db
    .select()
    .from(taskTypes)
    .where(eq(taskTypes.projectId, projectId))
    .orderBy(taskTypes.createdAt);
  return rows.map(toType);
}

export async function insertType(projectId: string, name: string): Promise<TaskType> {
  const [row] = await db
    .insert(taskTypes)
    .values({ id: uuidv7(), projectId, name, createdAt: new Date() })
    .returning();
  return toType(row!);
}

export async function listLabels(projectId: string): Promise<TaskLabel[]> {
  const rows = await db
    .select()
    .from(taskLabels)
    .where(eq(taskLabels.projectId, projectId))
    .orderBy(taskLabels.createdAt);
  return rows.map(toLabel);
}

export async function findLabels(projectId: string, ids: string[]): Promise<TaskLabel[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(taskLabels)
    .where(and(eq(taskLabels.projectId, projectId), inArray(taskLabels.id, ids)));
  return rows.map(toLabel);
}

export async function insertLabel(input: {
  projectId: string;
  name: string;
  color?: string | null;
}): Promise<TaskLabel> {
  const [row] = await db
    .insert(taskLabels)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      name: input.name,
      color: input.color ?? null,
      createdAt: new Date(),
    })
    .returning();
  return toLabel(row!);
}

/* ---------------- tasks ---------------- */

const baseTask = (r: TaskRow): TaskWithMeta => ({
  id: r.id,
  projectId: r.projectId,
  title: r.title,
  description: r.description,
  statusId: r.statusId,
  assigneeId: r.assigneeId,
  reporterId: r.reporterId,
  priority: r.priority,
  typeId: r.typeId,
  parentId: r.parentId,
  iterationId: r.iterationId,
  milestoneId: r.milestoneId,
  dueDate: iso(r.dueDate),
  order: r.order,
  estimate: r.estimate,
  labels: [],
  links: [],
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

/** Attach embedded labels (join + group) to a set of task rows. */
async function withLabels(rows: TaskRow[]): Promise<TaskWithMeta[]> {
  if (rows.length === 0) return [];
  const links = await db
    .select({ taskId: taskLabelLinks.taskId, label: taskLabels })
    .from(taskLabelLinks)
    .innerJoin(taskLabels, eq(taskLabels.id, taskLabelLinks.labelId))
    .where(inArray(taskLabelLinks.taskId, rows.map((r) => r.id)));
  const byTask = new Map<string, TaskLabel[]>();
  for (const l of links) {
    const arr = byTask.get(l.taskId) ?? [];
    arr.push(toLabel(l.label));
    byTask.set(l.taskId, arr);
  }
  return rows.map((r) => ({ ...baseTask(r), labels: byTask.get(r.id) ?? [] }));
}

export interface TaskFilters {
  statusId?: string;
  assigneeId?: string;
  typeId?: string;
  priority?: string;
  iterationId?: string;
  labelId?: string;
  q?: string;
}

/** Top-level (non-subtask), non-deleted rows — filters mirror the old
 *  in-memory list. Returns everything; the route paginates for the envelope. */
export async function listTasks(
  projectId: string,
  f: TaskFilters = {},
): Promise<TaskWithMeta[]> {
  const conds = [eq(tasks.projectId, projectId), isNull(tasks.parentId), isNull(tasks.deletedAt)];
  if (f.statusId) conds.push(eq(tasks.statusId, f.statusId));
  if (f.assigneeId) conds.push(eq(tasks.assigneeId, f.assigneeId));
  if (f.typeId) conds.push(eq(tasks.typeId, f.typeId));
  if (f.priority) conds.push(eq(tasks.priority, f.priority as Task["priority"]));
  if (f.iterationId) conds.push(eq(tasks.iterationId, f.iterationId));
  if (f.q) conds.push(sql`lower(${tasks.title}) like ${`%${f.q.toLowerCase()}%`}`);
  let rows = await db
    .select()
    .from(tasks)
    .where(and(...conds))
    .orderBy(asc(tasks.order));
  let out = await withLabels(rows);
  if (f.labelId) out = out.filter((t) => t.labels.some((l) => l.id === f.labelId));
  return out;
}

/** All rows for a project (incl. subtasks) — create-order + counts. */
export async function countProjectTasks(projectId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));
  return row?.n ?? 0;
}

export async function getTask(id: string): Promise<TaskWithMeta | null> {
  const [row] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
    .limit(1);
  if (!row) return null;
  return (await withLabels([row]))[0]!;
}

export async function insertTask(input: {
  projectId: string;
  title: string;
  description?: string | null;
  statusId: string;
  assigneeId?: string | null;
  reporterId?: string | null;
  priority?: Task["priority"];
  typeId?: string | null;
  parentId?: string | null;
  iterationId?: string | null;
  milestoneId?: string | null;
  dueDate?: Date | null;
  order?: number;
  estimate?: number | null;
  labelIds?: string[];
  /** Seed control (demo rows carry their own timestamps). */
  createdAt?: Date;
}): Promise<TaskWithMeta> {
  const now = input.createdAt ?? new Date();
  const [row] = await db
    .insert(tasks)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      statusId: input.statusId,
      assigneeId: input.assigneeId ?? null,
      reporterId: input.reporterId ?? null,
      priority: input.priority ?? "medium",
      typeId: input.typeId ?? null,
      parentId: input.parentId ?? null,
      iterationId: input.iterationId ?? null,
      milestoneId: input.milestoneId ?? null,
      dueDate: input.dueDate ?? null,
      order: input.order ?? 0,
      estimate: input.estimate ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  await setLabelLinks(row!.id, input.labelIds ?? []);
  return (await withLabels([row!]))[0]!;
}

/** Replace the label set (delete + insert — small sets). */
export async function setLabelLinks(taskId: string, labelIds: string[]): Promise<void> {
  await db.delete(taskLabelLinks).where(eq(taskLabelLinks.taskId, taskId));
  if (labelIds.length === 0) return;
  await db
    .insert(taskLabelLinks)
    .values(labelIds.map((labelId) => ({ taskId, labelId })))
    .onConflictDoNothing();
}

/** Optimistic concurrency: `expectedUpdatedAt` must match or return null. */
export async function patchTask(
  id: string,
  expectedUpdatedAt: string,
  patch: {
    title?: string;
    description?: string | null;
    statusId?: string;
    assigneeId?: string | null;
    priority?: Task["priority"];
    typeId?: string | null;
    iterationId?: string | null;
    milestoneId?: string | null;
    dueDate?: Date | null;
    order?: number;
    estimate?: number | null;
    labelIds?: string[];
  },
): Promise<TaskWithMeta | null> {
  const [row] = await db
    .update(tasks)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.updatedAt, new Date(expectedUpdatedAt))))
    .returning();
  if (!row) return null;
  if (patch.labelIds) await setLabelLinks(row.id, patch.labelIds);
  return getTask(id);
}

export async function softDeleteTask(id: string): Promise<void> {
  await db
    .update(tasks)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(tasks.id, id));
}

/** Subtasks of a task (not deleted, board order). */
export async function listSubtasks(taskId: string): Promise<TaskWithMeta[]> {
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.parentId, taskId), isNull(tasks.deletedAt)))
    .orderBy(asc(tasks.order));
  return withLabels(rows);
}

/* ---------------- task links (cross-issue relationships) ---------------- */

export type TaskLinkTypeValue = TaskLink["type"];

/** All links touching a project's tasks (both directions). */
export async function listProjectLinks(projectId: string): Promise<TaskLink[]> {
  const rows = await db.select().from(taskLinks).where(eq(taskLinks.projectId, projectId));
  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    sourceId: r.sourceId,
    targetId: r.targetId,
    type: r.type,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Attach `links` (both directions) to serialized tasks. */
export function attachLinks(rows: TaskWithMeta[], links: TaskLink[]): void {
  for (const t of rows) {
    t.links = links.filter((l) => l.sourceId === t.id || l.targetId === t.id);
  }
}

/**
 * Create a link. "blocked_by" is normalized to a directed `blocks` row
 * (source blocks target); "relates_to" is stored once per pair (deduped in
 * both directions). Returns the existing row when the link already exists.
 */
export async function addTaskLink(input: {
  projectId: string;
  taskId: string;
  targetId: string;
  type: TaskLinkTypeValue;
}): Promise<TaskLink | null> {
  if (input.taskId === input.targetId) return null;
  const target = await getTask(input.targetId);
  if (!target || target.projectId !== input.projectId) return null;

  const [source, targetId, type] =
    input.type === "blocked_by"
      ? ([input.targetId, input.taskId, "blocks"] as const)
      : ([input.taskId, input.targetId, input.type] as const);

  // relates_to is directionless — reuse the inverse row if present
  if (type === "relates_to") {
    const existing = await listProjectLinks(input.projectId);
    const inv = existing.find(
      (l) => l.type === "relates_to" && l.sourceId === targetId && l.targetId === source,
    );
    if (inv) return inv;
  }

  const id = uuidv7();
  const [row] = await db
    .insert(taskLinks)
    .values({
      id,
      projectId: input.projectId,
      sourceId: source,
      targetId,
      type,
      createdAt: new Date(),
    })
    .onConflictDoNothing({ target: [taskLinks.sourceId, taskLinks.targetId, taskLinks.type] })
    .returning();
  if (row) {
    return {
      id: row.id,
      projectId: row.projectId,
      sourceId: row.sourceId,
      targetId: row.targetId,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
    };
  }
  // conflict — return the existing row
  const existing = await listProjectLinks(input.projectId);
  return existing.find(
    (l) => l.sourceId === source && l.targetId === targetId && l.type === type,
  ) ?? null;
}

/** Delete a link touching the task (either end). Unknown ids are a no-op. */
export async function deleteTaskLink(projectId: string, taskId: string, linkId: string): Promise<boolean> {
  const res = await db
    .delete(taskLinks)
    .where(
      and(
        eq(taskLinks.id, linkId),
        eq(taskLinks.projectId, projectId),
        or(eq(taskLinks.sourceId, taskId), eq(taskLinks.targetId, taskId)),
      ),
    )
    .returning();
  return res.length > 0;
}

/* ---------------- comments ---------------- */

const toComment = (r: CommentRow): Comment => ({
  id: r.id,
  taskId: r.taskId,
  userId: r.userId,
  body: r.body,
  createdAt: r.createdAt.toISOString(),
});

export async function listComments(taskId: string): Promise<Comment[]> {
  const rows = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(asc(taskComments.createdAt));
  return rows.map(toComment);
}

export async function insertComment(input: {
  taskId: string;
  userId: string;
  body: string;
  createdAt?: Date;
}): Promise<void> {
  await db.insert(taskComments).values({
    id: uuidv7(),
    taskId: input.taskId,
    userId: input.userId,
    body: input.body,
    createdAt: input.createdAt ?? new Date(),
  });
}
