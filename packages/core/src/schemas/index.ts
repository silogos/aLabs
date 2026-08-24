/**
 * Domain zod schemas — the single source of truth for request/response shapes.
 * The API validates bodies against these; the web app reuses them client-side.
 *
 * Field types follow `docs/tech/03-data-model.md`.
 */
import { z } from "zod";
import {
  MemberStatus,
  InvitationStatus,
  RoleScope,
  OrganizationType,
  ProjectStatus,
  ProjectVisibility,
  TaskPriority,
  IterationStatus,
  MilestoneStatus,
  MeetingType,
  MeetingStatus,
  AgreementType,
  AgreementStatus,
  ClientUserStatus,
  PlanName,
  type TaskLinkType,
} from "../enums";
import { contentSchema } from "../content";

const iso = z.string();
const id = z.string().uuid();

/* ---------------- Auth ---------------- */

export const userSchema = z.object({
  id,
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: iso,
  updatedAt: iso,
});
export type User = z.infer<typeof userSchema>;

export const registerInput = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});
export const loginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const forgotPasswordInput = z.object({
  email: z.string().email(),
});
export const resetPasswordInput = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(100),
});

export const userUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().nullable().optional(),
});

/* ---------------- Organization ---------------- */

export const organizationSchema = z.object({
  id,
  name: z.string(),
  slug: z.string(),
  type: OrganizationType,
  logo: z.string().nullable(),
  description: z.string().nullable(),
  timezone: z.string(),
  language: z.string(),
  website: z.string().nullable(),
  createdAt: iso,
  updatedAt: iso,
});
export type Organization = z.infer<typeof organizationSchema>;

export const organizationCreate = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  website: z.string().url().optional(),
});
export const organizationUpdate = organizationCreate.partial();

export const roleSchema = z.object({
  id,
  organizationId: id.nullable(),
  scope: RoleScope,
  name: z.string(),
  isSystem: z.boolean(),
  permissions: z.array(z.string()),
});
export type Role = z.infer<typeof roleSchema>;

export const memberUpdate = z.object({ roleName: z.string().min(1) });

export const memberSchema = z.object({
  id,
  organizationId: id,
  userId: id,
  role: roleSchema,
  status: MemberStatus,
  joinedAt: iso.nullable(),
  user: userSchema,
  createdAt: iso,
  updatedAt: iso,
});
export type Member = z.infer<typeof memberSchema>;

export const invitationInput = z.object({
  email: z.string().email(),
  roleName: z.string(),
});
export const invitationAction = z.object({ action: z.enum(["accept", "cancel"]) });
export const invitationSchema = z.object({
  id,
  organizationId: id,
  email: z.string(),
  status: InvitationStatus,
  roleName: z.string(),
  expiresAt: iso,
  createdAt: iso,
});
export type Invitation = z.infer<typeof invitationSchema>;

export const projectMemberSchema = z.object({
  id,
  projectId: id,
  userId: id,
  role: roleSchema,
  status: MemberStatus,
  joinedAt: iso.nullable(),
  user: userSchema,
  createdAt: iso,
  updatedAt: iso,
});
export type ProjectMember = z.infer<typeof projectMemberSchema>;

export const projectMemberAdd = z.object({
  email: z.string().email(),
  roleName: z.string().optional(),
});
export const projectMemberUpdate = z.object({
  roleName: z.string().min(1).optional(),
  status: z.literal("active").optional(),
});

/* ---------------- Recents (project visit history) ---------------- */

export const recentTouch = z.object({ projectId: id });

/* ---------------- Project ---------------- */

export const projectSchema = z.object({
  id,
  organizationId: id,
  name: z.string(),
  slug: z.string(),
  key: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  status: ProjectStatus,
  visibility: ProjectVisibility,
  createdAt: iso,
  updatedAt: iso,
});
export type Project = z.infer<typeof projectSchema>;

export const projectCreate = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  key: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/),
  description: z.string().optional(),
  icon: z.string().max(20).optional(),
});
export const projectUpdate = projectCreate.partial().extend({
  status: ProjectStatus.optional(),
  visibility: ProjectVisibility.optional(),
});

/* ---------------- Task ---------------- */

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

/* ---------------- Task links (cross-issue relationships) ---------------- */

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

export const taskLinkAdd = z.object({
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

/* ---------------- Documents ---------------- */

export const spaceSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  icon: z.string().nullable(),
  order: z.number().int(),
});
export type Space = z.infer<typeof spaceSchema>;

export const pageSchema = z.object({
  id,
  projectId: id,
  spaceId: id,
  parentId: id.nullable(),
  title: z.string(),
  content: contentSchema,
  icon: z.string().nullable(),
  order: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
  editedBy: userSchema.nullable(),
});
export type Page = z.infer<typeof pageSchema>;

export const spaceCreate = z.object({
  name: z.string().min(1).max(120),
  icon: z.string().max(20).optional(),
});
export const pageCreate = z.object({
  spaceId: id,
  parentId: id.nullable().optional(),
  title: z.string().min(1).max(255),
  icon: z.string().max(20).optional(),
});
export const pageUpdate = z.object({
  spaceId: id.optional(),
  parentId: id.nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  content: contentSchema.optional(),
  icon: z.string().max(20).optional(),
  updatedAt: iso.optional(),
});

export const fileSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  uploadedBy: userSchema.nullable(),
  createdAt: iso,
});
export type FileRef = z.infer<typeof fileSchema>;

/* ---------------- Planning ---------------- */

export const iterationSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  goal: z.string().nullable(),
  startDate: iso,
  endDate: iso,
  status: IterationStatus,
  progress: z.number(),
  committedPoints: z.number().int(),
  completedPoints: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});
export type Iteration = z.infer<typeof iterationSchema>;

export const iterationCreate = z.object({
  name: z.string().min(1).max(120),
  goal: z.string().optional(),
  startDate: iso,
  endDate: iso,
});
export const iterationUpdate = iterationCreate.partial().extend({
  status: IterationStatus.optional(),
});

export const milestoneSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  description: z.string().nullable(),
  dueDate: iso.nullable(),
  status: MilestoneStatus,
  progress: z.number(),
  totalTasks: z.number().int(),
  doneTasks: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const milestoneCreate = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  dueDate: iso.nullable().optional(),
});
export const milestoneUpdate = milestoneCreate.partial().extend({
  status: MilestoneStatus.optional(),
});

/* ---------------- ActionItem (declared before Meeting — referenced inline) ---------------- */

export const actionItemSchema = z.object({
  id,
  meetingId: id,
  taskId: id.nullable(),
  assigneeId: id.nullable(),
  description: z.string(),
  done: z.boolean(),
  dueDate: iso.nullable(),
  createdAt: iso,
  updatedAt: iso,
});
export type ActionItem = z.infer<typeof actionItemSchema>;

export const actionItemCreate = z.object({
  description: z.string().min(1).max(2000),
  assigneeId: id.optional(),
  dueDate: iso.optional(),
});
export const actionItemUpdate = actionItemCreate.partial().extend({
  done: z.boolean().optional(),
  taskId: id.nullable().optional(),
});

/* ---------------- Meeting ---------------- */

export const meetingSchema = z.object({
  id,
  projectId: id,
  title: z.string(),
  type: MeetingType.nullable(),
  scheduledAt: iso,
  duration: z.number().int().nullable(),
  location: z.string().nullable(),
  agenda: z.array(z.string()).nullable(),
  notes: z.string().nullable(),
  status: MeetingStatus,
  participants: z.array(userSchema).default([]),
  actionItems: z.array(actionItemSchema).default([]),
  createdAt: iso,
  updatedAt: iso,
});
export type Meeting = z.infer<typeof meetingSchema>;

export const meetingCreate = z.object({
  title: z.string().min(1).max(200),
  type: MeetingType.optional(),
  scheduledAt: iso,
  duration: z.number().int().optional(),
  location: z.string().optional(),
  participantIds: z.array(id).optional(),
});
export const meetingUpdate = meetingCreate.partial().extend({
  status: MeetingStatus.optional(),
  agenda: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/* ---------------- Agreement ---------------- */

export const agreementSchema = z.object({
  id,
  projectId: id,
  title: z.string(),
  type: AgreementType.nullable(),
  status: AgreementStatus,
  counterparty: z.string(),
  value: z.number().nullable(),
  currency: z.string().nullable(),
  startDate: iso.nullable(),
  endDate: iso.nullable(),
  sentAt: iso.nullable(),
  signedAt: iso.nullable(),
  owner: userSchema.nullable(),
  terms: z.string().nullable(),
  createdAt: iso,
  updatedAt: iso,
});
export type Agreement = z.infer<typeof agreementSchema>;

export const agreementCreate = z.object({
  title: z.string().min(1).max(200),
  type: AgreementType.optional(),
  counterparty: z.string().min(1).max(200),
  value: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  startDate: iso.optional(),
  endDate: iso.optional(),
  ownerId: id.optional(),
  terms: z.string().max(5000).optional(),
});
export const agreementUpdate = agreementCreate.partial().extend({
  status: AgreementStatus.optional(),
  sentAt: iso.nullable().optional(),
  signedAt: iso.nullable().optional(),
});

/* ---------------- Notification ---------------- */

export const notificationSchema = z.object({
  id,
  userId: id,
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  readAt: iso.nullable(),
  createdAt: iso,
});
export type Notification = z.infer<typeof notificationSchema>;

/* ---------------- Reporting ---------------- */

export const dashboardSchema = z.object({
  project: projectSchema,
  kpis: z.object({
    active: z.number().int(),
    inProgress: z.number().int(),
    overdue: z.number().int(),
    doneThisIteration: z.number().int(),
    activeTrend: z.array(z.number()),
    inProgressTrend: z.array(z.number()),
    overdueTrend: z.array(z.number()),
    doneTrend: z.array(z.number()),
  }),
  sprint: z
    .object({
      id: id.nullable(),
      name: z.string().nullable(),
      committedPoints: z.number().int(),
      completedPoints: z.number().int(),
      progress: z.number(),
      burndown: z.array(z.object({ day: z.number(), remaining: z.number() })),
    })
    .nullable(),
  activity: z.array(
    z.object({
      id: id,
      kind: z.enum(["move", "doc", "com", "done", "mile"]),
      projectId: id.optional(),
      actorId: id,
      target: z.string(),
      when: iso,
      whenLabel: z.string(),
    }),
  ),
  workload: z.array(
    z.object({
      userId: id,
      name: z.string(),
      initials: z.string(),
      color: z.string(),
      assigned: z.number().int(),
      capacity: z.number().int(),
    }),
  ),
});
export type Dashboard = z.infer<typeof dashboardSchema>;
