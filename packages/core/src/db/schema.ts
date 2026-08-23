/**
 * Drizzle schema — the DB-precise source of truth.
 *
 * Mirrors `docs/tech/03-data-model.md` table-for-table. The API currently runs
 * against an in-memory store (see `apps/api/src/db/memory.ts`) so the app is
 * runnable without Postgres; this schema is what `drizzle-kit` would push and
 * what a real `db` repository implementation would query.
 *
 * Conventions (`docs/tech/02-conventions.md`):
 *   - uuid PKs (app-generated, UUID v7)
 *   - timestamptz, stored UTC; created_at / updated_at / deleted_at
 *   - tenant columns: organization_id / project_id, indexed, not null
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  jsonb,
  date,
  numeric,
  index,
  uniqueIndex,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

import {
  memberStatusEnum,
  invitationStatusEnum,
  roleScopeEnum,
  organizationTypeEnum,
  projectStatusEnum,
  projectVisibilityEnum,
  taskPriorityEnum,
  taskLinkTypeEnum,
  iterationStatusEnum,
  milestoneStatusEnum,
  meetingTypeEnum,
  meetingStatusEnum,
  agreementTypeEnum,
  agreementStatusEnum,
  clientUserStatusEnum,
  clientShareResourceEnum,
  notificationChannelEnum,
  planNameEnum,
  subscriptionStatusEnum,
  invoiceStatusEnum,
} from "../enums";

const ts = () => timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow();
const nullableTs = () => timestamp({ withTimezone: true, mode: "date" });

/* ============================================================= Identity
 * Better Auth owns users/sessions/accounts/verifications. We model `users`
 * here so domain code can reference it; sessions/accounts follow the same
 * shapes so credential rows migrate cleanly to Better Auth later.
 * (`verifications` is unmodeled until email verification ships.)
 */

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  image: text("image"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey(),
    token: varchar("token", { length: 128 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: ts().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_key").on(t.token), index("sessions_user_id_idx").on(t.userId)],
);

export const authAccounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** "credential" | "google" (Better Auth: provider_id) */
    provider: varchar("provider", { length: 31 }).notNull(),
    /** Provider-side subject id (Google `sub`); null for credentials. */
    providerAccountId: varchar("provider_account_id", { length: 255 }),
    /** scrypt:<salt>:<hash> — same format Better Auth uses. */
    passwordHash: text("password_hash"),
    createdAt: ts().defaultNow(),
  },
  (t) => [
    index("accounts_user_id_idx").on(t.userId),
    uniqueIndex("accounts_user_provider_key").on(t.userId, t.provider),
  ],
);

export const passwordResets = pgTable(
  "password_resets",
  {
    id: uuid("id").primaryKey(),
    token: varchar("token", { length: 128 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
    createdAt: ts().defaultNow(),
  },
  (t) => [uniqueIndex("password_resets_token_key").on(t.token)],
);

/* ============================================================= Workspace */

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  type: organizationTypeEnum("type").notNull().default("team"),
  logo: text("logo"),
  description: text("description"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  website: text("website"),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
  deletedAt: nullableTs(),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  description: text("description"),
});

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id"), // null = system default
    scope: roleScopeEnum("scope").notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    // permission keys embedded on the row (the normalized role_permissions
    // join below stays available for a future admin UI)
    permissions: text("permissions").array().notNull().default([]),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
  },
  (t) => [
    // lookup index (a unique version needs nulls-not-distinct, which this
    // drizzle-orm doesn't support yet — seeding is guarded, code takes first)
    index("roles_scope_name_idx").on(t.scope, t.name, t.organizationId),
  ],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id").notNull().references(() => roles.id),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    status: memberStatusEnum("status").notNull().default("pending"),
    joinedAt: nullableTs(),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
  },
  (t) => [
    uniqueIndex("org_member_uniq").on(t.organizationId, t.userId),
    index("org_member_user_idx").on(t.userId),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    email: varchar("email", { length: 255 }).notNull(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    token: varchar("token", { length: 64 }).notNull().unique(),
    expiresAt: ts().notNull(),
    status: invitationStatusEnum("status").notNull().default("pending"),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
  },
  (t) => [index("invitation_org_status_idx").on(t.organizationId, t.status)],
);

/* ============================================================= Project */

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 60 }).notNull(),
    key: varchar("key", { length: 10 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 20 }),
    status: projectStatusEnum("status").notNull().default("active"),
    visibility: projectVisibilityEnum("visibility").notNull().default("organization"),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
    deletedAt: nullableTs(),
  },
  (t) => [
    uniqueIndex("project_org_slug_uniq").on(t.organizationId, t.slug),
    uniqueIndex("project_org_key_uniq").on(t.organizationId, t.key),
    index("project_org_idx").on(t.organizationId),
  ],
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    status: memberStatusEnum("status").notNull().default("active"),
    // null while the invitation is pending (set on accept), like org members
    joinedAt: nullableTs(),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
  },
  (t) => [
    uniqueIndex("project_member_uniq").on(t.projectId, t.userId),
    index("project_member_user_idx").on(t.userId),
  ],
);

/** Per-user project visit history — powers "Recent projects" and the
 *  derived landing project when switching workspaces. */
export const projectVisits = pgTable(
  "project_visits",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    visitedAt: ts().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.projectId] }),
    index("project_visit_user_idx").on(t.userId, t.visitedAt),
  ],
);

/* ============================================================= Task */

export const taskTypes = pgTable("task_types", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: ts().defaultNow(),
});

export const taskStatuses = pgTable(
  "task_statuses",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 20 }),
    order: integer("order").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: ts().defaultNow(),
  },
  (t) => [uniqueIndex("task_status_name_uniq").on(t.projectId, t.name)],
);

export const taskLabels = pgTable("task_labels", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }),
  createdAt: ts().defaultNow(),
});

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    statusId: uuid("status_id")
      .notNull()
      .references(() => taskStatuses.id),
    assigneeId: uuid("assignee_id").references(() => users.id),
    reporterId: uuid("reporter_id").references(() => users.id),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    typeId: uuid("type_id").references(() => taskTypes.id),
    parentId: uuid("parent_id"),
    iterationId: uuid("iteration_id").references(() => iterations.id),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    dueDate: nullableTs(),
    order: integer("order").notNull().default(0),
    estimate: integer("estimate"),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
    deletedAt: nullableTs(),
  },
  (t) => [
    index("task_proj_status_idx").on(t.projectId, t.statusId),
    index("task_proj_assignee_idx").on(t.projectId, t.assigneeId),
    index("task_proj_iter_idx").on(t.projectId, t.iterationId),
  ],
);

export const taskLabelLinks = pgTable(
  "task_label_links",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => taskLabels.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.labelId] })],
);

/** Cross-issue relationships (blocks / blocked_by / relates_to).
 *  One directed row per link; blocked_by is the computed inverse of blocks
 *  (docs/tech/03-data-model.md: task_links). */
export const taskLinks = pgTable(
  "task_links",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    type: taskLinkTypeEnum("type").notNull(),
    createdAt: ts().defaultNow(),
  },
  (t) => [
    uniqueIndex("task_link_uniq").on(t.sourceId, t.targetId, t.type),
    index("task_link_project_source_idx").on(t.projectId, t.sourceId),
    index("task_link_project_target_idx").on(t.projectId, t.targetId),
  ],
);

/** Task comments (task drawer). */
export const taskComments = pgTable(
  "task_comments",
  {
    id: uuid("id").primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: ts().defaultNow(),
  },
  (t) => [index("task_comments_task_idx").on(t.taskId)],
);

/* ============================================================= Documents */

export const spaces = pgTable("spaces", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 120 }).notNull(),
  icon: varchar("icon", { length: 20 }),
  order: integer("order").notNull().default(0),
  createdAt: ts().defaultNow(),
  deletedAt: nullableTs(),
});

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id),
    parentId: uuid("parent_id"),
    title: varchar("title", { length: 255 }).notNull(),
    content: jsonb("content").notNull(),
    icon: varchar("icon", { length: 20 }),
    editedBy: uuid("edited_by").references(() => users.id),
    order: integer("order").notNull().default(0),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
    deletedAt: nullableTs(),
  },
  (t) => [index("page_proj_space_idx").on(t.projectId, t.spaceId)],
);

export const pageRevisions = pgTable("page_revisions", {
  id: uuid("id").primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id),
  content: jsonb("content").notNull(),
  editedBy: uuid("edited_by")
    .notNull()
    .references(() => users.id),
  createdAt: ts().defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  url: text("url").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: ts().defaultNow(),
  deletedAt: nullableTs(),
});

/* ============================================================= Planning */

export const iterations = pgTable("iterations", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 120 }).notNull(),
  goal: text("goal"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: iterationStatusEnum("status").notNull().default("planned"),
  // seeded aggregates (velocity widgets) — kept stored, not derived
  committedPoints: integer("committed_points").notNull().default(0),
  completedPoints: integer("completed_points").notNull().default(0),
  progress: integer("progress").notNull().default(0),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  status: milestoneStatusEnum("status").notNull().default("planned"),
  // seeded aggregates (milestone widgets) — kept stored, not derived
  totalTasks: integer("total_tasks").notNull().default(0),
  doneTasks: integer("done_tasks").notNull().default(0),
  progress: integer("progress").notNull().default(0),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
});

/* ============================================================= Meeting */

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  title: varchar("title", { length: 200 }).notNull(),
  type: meetingTypeEnum("type"),
  scheduledAt: ts().notNull(),
  duration: integer("duration"),
  location: varchar("location", { length: 255 }),
  agenda: jsonb("agenda"),
  notes: jsonb("notes"),
  status: meetingStatusEnum("status").notNull().default("scheduled"),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
  deletedAt: nullableTs(),
});

export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey(),
  meetingId: uuid("meeting_id")
    .notNull()
    .references(() => meetings.id),
  taskId: uuid("task_id").references(() => tasks.id),
  assigneeId: uuid("assignee_id").references(() => users.id),
  description: text("description").notNull(),
  done: boolean("done").notNull().default(false),
  dueDate: nullableTs(),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
});

export const meetingParticipants = pgTable(
  "meeting_participants",
  {
    meetingId: uuid("meeting_id").references(() => meetings.id),
    userId: uuid("user_id").references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.meetingId, t.userId] })],
);

/* ============================================================= Agreement */

export const agreements = pgTable("agreements", {
  id: uuid("id").primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  title: varchar("title", { length: 200 }).notNull(),
  type: agreementTypeEnum("type"),
  status: agreementStatusEnum("status").notNull().default("draft"),
  counterparty: varchar("counterparty", { length: 200 }).notNull(),
  value: numeric("value", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  signedAt: nullableTs(),
  createdAt: ts().defaultNow(),
  updatedAt: ts().defaultNow(),
  deletedAt: nullableTs(),
});

export const agreementAttachments = pgTable(
  "agreement_attachments",
  {
    agreementId: uuid("agreement_id").references(() => agreements.id),
    fileId: uuid("file_id").references(() => files.id),
  },
  (t) => [primaryKey({ columns: [t.agreementId, t.fileId] })],
);

/* ============================================================= Client Portal */

export const clientUsers = pgTable(
  "client_users",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    status: clientUserStatusEnum("status").notNull().default("invited"),
    createdAt: ts().defaultNow(),
  },
  (t) => [uniqueIndex("client_user_uniq").on(t.projectId, t.email)],
);

export const clientShares = pgTable(
  "client_shares",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    resource: clientShareResourceEnum("resource").notNull(),
    visible: boolean("visible").notNull().default(false),
    createdAt: ts().defaultNow(),
  },
  (t) => [uniqueIndex("client_share_uniq").on(t.projectId, t.resource)],
);

/* ============================================================= Notification */

/** Dashboard activity feed (seeded demo events today; written by modules
 *  as they gain audit trails). `whenLabel` is the display string shown in
 *  the UI next to the timestamp. */
export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    kind: varchar("kind", { length: 10 }).notNull(), // move|doc|com|done|mile
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    target: varchar("target", { length: 255 }).notNull(),
    occurredAt: ts().defaultNow(),
    whenLabel: varchar("when_label", { length: 100 }).notNull(),
  },
  (t) => [index("activity_project_when_idx").on(t.projectId, t.occurredAt)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 60 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    link: text("link"),
    readAt: nullableTs(),
    createdAt: ts().defaultNow(),
  },
  (t) => [index("notif_user_created_idx").on(t.userId, t.createdAt)],
);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    channel: notificationChannelEnum("channel").notNull(),
    type: varchar("type", { length: 60 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
  },
  (t) => [uniqueIndex("notif_pref_uniq").on(t.userId, t.channel, t.type)],
);

/* ============================================================= Billing */

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey(),
  name: planNameEnum("name").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  projectLimit: integer("project_limit"),
  features: jsonb("features").notNull().default({}),
  createdAt: ts().defaultNow(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    currentPeriodEnd: ts().notNull(),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 120 }),
    createdAt: ts().defaultNow(),
    updatedAt: ts().defaultNow(),
  },
  (t) => [index("sub_org_idx").on(t.organizationId)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: invoiceStatusEnum("status").notNull(),
    issuedAt: ts().notNull(),
    providerInvoiceId: varchar("provider_invoice_id", { length: 120 }),
    createdAt: ts().defaultNow(),
  },
  (t) => [index("invoice_org_idx").on(t.organizationId)],
);

// Note: forward-declared iterations/milestones above are defined before `tasks`
// because tasks references them; the table is hoisted by Drizzle's builder.
export type _Refs = typeof iterations & typeof milestones;

export const schema = {
  users,
  organizations,
  permissions,
  roles,
  rolePermissions,
  organizationMembers,
  invitations,
  projects,
  projectMembers,
  projectVisits,
  taskTypes,
  taskStatuses,
  taskLabels,
  taskLabelLinks,
  tasks,
  spaces,
  pages,
  pageRevisions,
  files,
  iterations,
  milestones,
  meetings,
  actionItems,
  meetingParticipants,
  agreements,
  agreementAttachments,
  clientUsers,
  clientShares,
  notifications,
  notificationPreferences,
  plans,
  subscriptions,
  invoices,
};

export type Schema = typeof schema;
