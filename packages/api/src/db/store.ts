/**
 * In-memory repository — the runtime data layer for the modules that have
 * not migrated to Postgres yet (projects, tasks, documents, …).
 *
 * The Foundation layer is fully in Postgres: auth (users, sessions,
 * accounts, password resets — db/auth-repo.ts), workspace (organizations,
 * roles, members, invitations — db/org-repo.ts), and projects (projects,
 * memberships, visits — db/project-repo.ts). What remains here are the
 * business modules: tasks, documents, planning, meetings, agreements,
 * notifications, comments, activity.
 *
 * Multi-tenancy rule (`docs/tech/02-conventions.md`): every tenant-scoped query
 * MUST filter by organization_id / project_id. The helpers here enforce that.
 */
import {
  type User,
  type Task,
  type TaskStatus,
  type TaskLabel,
  type TaskType,
  type Iteration,
  type Milestone,
  type Space,
  type Page,
  type FileRef,
  type Notification,
  type Meeting,
  type Agreement,
} from "@pmin/core";

/** Soft-delete + audit columns present on the DB row but not always on the DTO. */
type Meta = { deletedAt?: string | null };

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  kind: "move" | "doc" | "com" | "done" | "mile";
  projectId: string;
  actorId: string;
  target: string;
  when: string;
  whenLabel: string;
}

export interface Store {
  taskStatuses: TaskStatus[];
  taskTypes: TaskType[];
  taskLabels: TaskLabel[];
  tasks: (Task & Meta)[];
  iterations: Iteration[];
  milestones: Milestone[];
  spaces: (Space & Meta)[];
  pages: (Page & Meta)[];
  files: (FileRef & Meta)[];
  notifications: Notification[];
  meetings: (Meeting & Meta)[];
  agreements: (Agreement & Meta)[];
  comments: Comment[];
  activity: ActivityEntry[];
  /** seeded = seed() is idempotent */
  seeded: boolean;
}

export const store: Store = {
  taskStatuses: [],
  taskTypes: [],
  taskLabels: [],
  tasks: [],
  iterations: [],
  milestones: [],
  spaces: [],
  pages: [],
  files: [],
  notifications: [],
  meetings: [],
  agreements: [],
  comments: [],
  activity: [],
  seeded: false,
};

/** Re-exported for modules that still import these from the store module. */
export type { User };
