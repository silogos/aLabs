/**
 * Enum definitions — the single source of truth for all DB enums.
 *
 * TS string-literal unions (canonical types) paired with `pgEnum` so the
 * Drizzle schema mirrors `docs/tech/03-data-model.md` exactly.
 *
 * See `docs/tech/02-conventions.md`: DB enums are snake_case.
 */
import { pgEnum } from "drizzle-orm/pg-core";

/* ---- TS unions (canonical, used in zod schemas + code) ---- */

export type MemberStatus = "pending" | "active" | "suspended";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";
export type RoleScope = "workspace" | "project";
export type ProjectStatus = "active" | "on_hold" | "archived";
export type ProjectVisibility = "organization" | "private";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type IterationStatus = "planned" | "active" | "completed";
export type MilestoneStatus = "planned" | "reached";
export type MeetingType = "standup" | "review" | "planning" | "client" | "other";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type AgreementType = "sow" | "nda" | "contract" | "proposal" | "other";
export type AgreementStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type ClientUserStatus = "invited" | "active" | "disabled";
export type ClientShareResource = "tasks" | "milestones" | "reports" | "documents";
export type NotificationChannel = "in_app" | "email";
export type PlanName = "free" | "professional" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "canceled";
export type InvoiceStatus = "paid" | "pending" | "failed";

/* ---- pg enums (mirror DB precisely) ---- */

export const memberStatusEnum = pgEnum("member_status", ["pending", "active", "suspended"]);
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "cancelled",
]);
export const roleScopeEnum = pgEnum("role_scope", ["workspace", "project"]);
export const projectStatusEnum = pgEnum("project_status", ["active", "on_hold", "archived"]);
export const projectVisibilityEnum = pgEnum("project_visibility", ["organization", "private"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);
export const iterationStatusEnum = pgEnum("iteration_status", ["planned", "active", "completed"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["planned", "reached"]);
export const meetingTypeEnum = pgEnum("meeting_type", [
  "standup",
  "review",
  "planning",
  "client",
  "other",
]);
export const meetingStatusEnum = pgEnum("meeting_status", ["scheduled", "completed", "cancelled"]);
export const agreementTypeEnum = pgEnum("agreement_type", [
  "sow",
  "nda",
  "contract",
  "proposal",
  "other",
]);
export const agreementStatusEnum = pgEnum("agreement_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
]);
export const clientUserStatusEnum = pgEnum("client_user_status", ["invited", "active", "disabled"]);
export const clientShareResourceEnum = pgEnum("client_share_resource", [
  "tasks",
  "milestones",
  "reports",
  "documents",
]);
export const notificationChannelEnum = pgEnum("notification_channel", ["in_app", "email"]);
export const planNameEnum = pgEnum("plan_name", ["free", "professional", "enterprise"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["paid", "pending", "failed"]);

/* ---- zod-friendly enum objects (re-exported for schema validation) ---- */

import { z } from "zod";

export const MemberStatus = z.enum(["pending", "active", "suspended"]);
export const InvitationStatus = z.enum(["pending", "accepted", "expired", "cancelled"]);
export const RoleScope = z.enum(["workspace", "project"]);
export const ProjectStatus = z.enum(["active", "on_hold", "archived"]);
export const ProjectVisibility = z.enum(["organization", "private"]);
export const TaskPriority = z.enum(["low", "medium", "high", "urgent"]);
export const IterationStatus = z.enum(["planned", "active", "completed"]);
export const MilestoneStatus = z.enum(["planned", "reached"]);
export const MeetingType = z.enum(["standup", "review", "planning", "client", "other"]);
export const MeetingStatus = z.enum(["scheduled", "completed", "cancelled"]);
export const AgreementType = z.enum(["sow", "nda", "contract", "proposal", "other"]);
export const AgreementStatus = z.enum(["draft", "sent", "accepted", "rejected", "expired"]);
export const ClientUserStatus = z.enum(["invited", "active", "disabled"]);
export const ClientShareResource = z.enum(["tasks", "milestones", "reports", "documents"]);
export const NotificationChannel = z.enum(["in_app", "email"]);
export const PlanName = z.enum(["free", "professional", "enterprise"]);
export const SubscriptionStatus = z.enum(["active", "past_due", "canceled"]);
export const InvoiceStatus = z.enum(["paid", "pending", "failed"]);
