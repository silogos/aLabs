/** Task schemas — tasks, config (statuses/labels/types), links, comments. */
import { z } from "zod";
import { id, iso } from "./common";
import { paginationQuery } from "./common";
import { TaskPriority } from "../enums";

export const taskStatusSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  color: z.string().nullable(),
  order: z.number().int(),
  isDefault: z.boolean(),
});
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskLabelSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  color: z.string().nullable(),
});
export type TaskLabel = z.infer<typeof taskLabelSchema>;

export const taskTypeSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
});
export type TaskType = z.infer<typeof taskTypeSchema>;

export const taskStatusCreate = z.object({
  name: z.string(),
  color: z.string().optional(),
});
export const taskLabelCreate = z.object({
  name: z.string(),
  color: z.string().optional(),
});
export const taskTypeCreate = z.object({ name: z.string() });

/* ---- task links (cross-issue relationships) ---- */

const taskLinkType = z.enum(["blocks", "blocked_by", "relates_to"]);

export const taskLinkSchema = z.object({
  id,
  projectId: id,
  sourceId: id,
  targetId: id,
  type: taskLinkType,
  createdAt: iso,
});
export type TaskLink = z.infer<typeof taskLinkSchema>;

export const taskLinkCreate = z.object({
  targetId: id,
  type: taskLinkType,
});

export const commentCreate = z.object({
  body: z.string().min(1).max(5000),
});

export const taskSchema = z.object({
  id,
  projectId: id,
  title: z.string(),
  description: z.string().nullable(),
  statusId: id,
  assigneeId: id.nullable(),
  reporterId: id.nullable(),
  priority: TaskPriority,
  typeId: id.nullable(),
  parentId: id.nullable(),
  epicId: id.nullable(),
  iterationId: id.nullable(),
  milestoneId: id.nullable(),
  dueDate: iso.nullable(),
  order: z.number().int(),
  labels: z.array(taskLabelSchema).default([]),
  estimate: z.number().int().nullable(),
  createdAt: iso,
  updatedAt: iso,
  links: z.array(taskLinkSchema).default([]),
});
export type Task = z.infer<typeof taskSchema>;

export const taskCreate = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  statusId: id.optional(),
  priority: TaskPriority.optional(),
  assigneeId: id.nullable().optional(),
  typeId: id.nullable().optional(),
  parentId: id.nullable().optional(),
  epicId: id.nullable().optional(),
  iterationId: id.nullable().optional(),
  milestoneId: id.nullable().optional(),
  dueDate: iso.nullable().optional(),
  labelIds: z.array(id).optional(),
  estimate: z.number().int().nonnegative().nullable().optional(),
});
export const taskUpdate = taskCreate.partial().extend({
  updatedAt: iso.optional(), // optimistic concurrency
});

/** GET /tasks query — pagination + filters. */
export const taskListQuery = paginationQuery.extend({
  statusId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  labelId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  priority: z.string().optional(),
  iterationId: z.string().uuid().optional(),
  q: z.string().optional(),
});
export type TaskListQuery = z.infer<typeof taskListQuery>;
