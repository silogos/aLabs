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

/** Config names land in varchar(50) columns — bound here so an oversized
 *  name is a 400, not a raw DB error. */
const configName = z.string().trim().min(1).max(50);
/** Status/label colors: hex or the CSS custom-property refs the seed uses. */
const configColor = z
  .string()
  .max(20)
  .regex(/^#[0-9a-fA-F]{3,8}$|^var\(--[a-z0-9-]+\)$/);

export const taskStatusCreate = z.object({
  name: configName,
  color: configColor.optional(),
});
export const taskLabelCreate = z.object({
  name: configName,
  color: configColor.optional(),
});
export const taskTypeCreate = z.object({ name: configName });

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

export const commentSchema = z.object({
  id,
  taskId: id,
  userId: id,
  body: z.string(),
  createdAt: iso,
});
export type Comment = z.infer<typeof commentSchema>;

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

/** GET /tasks/:id — task with its subtasks, comments, and attachments. */
export type TaskDetail = Task & {
  subtasks: Task[];
  comments: Comment[];
  attachments: TaskAttachment[];
};

/** Attachment on a task — a files-catalog row linked via task_attachments. */
export const taskAttachmentSchema = z.object({
  id,
  taskId: id,
  fileId: id,
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  uploadedBy: id.nullable(),
  createdAt: iso,
});
export type TaskAttachment = z.infer<typeof taskAttachmentSchema>;

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
  priority: TaskPriority.optional(),
  iterationId: z.string().uuid().optional(),
  q: z.string().optional(),
  /** "true" to include subtask rows (parented tasks) alongside top-level ones. */
  includeSubtasks: z.enum(["true", "false"]).optional(),
});
export type TaskListQuery = z.infer<typeof taskListQuery>;

/* ---- request-body types (single home: derived where the zod instance matches) ---- */
export type TaskCreateInput = z.input<typeof taskCreate>;
export type TaskUpdateInput = z.input<typeof taskUpdate>;
export type TaskListFilters = Partial<z.input<typeof taskListQuery>>;
export type TaskLinkCreateInput = z.input<typeof taskLinkCreate>;
export type CommentCreateInput = z.input<typeof commentCreate>;

/** GET /tasks/:id/activity item — merged, newest-first event feed: the
 *  creation event (from the task row), status transitions
 *  (task_status_events), and comments. */
export const taskActivityItemSchema = z.object({
  id,
  type: z.enum(["created", "status", "comment"]),
  actorId: id.nullable(),
  actorName: z.string().nullable(),
  createdAt: iso,
  fromStatusName: z.string().nullable(),
  toStatusName: z.string().nullable(),
  body: z.string().nullable(),
});
export type TaskActivityItem = z.infer<typeof taskActivityItemSchema>;
