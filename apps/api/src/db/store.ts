/**
 * In-memory repository — the runtime data layer.
 *
 * This stands in for PostgreSQL/Drizzle so the app is fully runnable without a
 * database. The Drizzle schema in `@pmin/core/db` is the documented source of
 * truth; this store mirrors those tables with the same tenant columns and is
 * structured so a real Drizzle repository could drop in behind the same service
 * layer.
 *
 * Multi-tenancy rule (`docs/tech/02-conventions.md`): every tenant-scoped query
 * MUST filter by organization_id / project_id. The helpers here enforce that.
 */
import {
  type User,
  type Organization,
  type Project,
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
  type Member,
  type ProjectMember,
  type Invitation,
  type Role,
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

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Auth provider account — mirrors the Better Auth `accounts` table (see
 * docs/foundation/01-authentication.md). Credential accounts carry the
 * password hash; OAuth accounts carry the provider's subject id.
 */
export interface Account {
  id: string;
  userId: string;
  provider: "credential" | "google";
  providerAccountId: string | null;
  passwordHash: string | null;
  createdAt: string;
}

/** One-time password reset token (forgot-password flow). */
export interface PasswordReset {
  token: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

/** project_visits row — per-user project visit history (recents). */
export interface ProjectVisit {
  userId: string;
  projectId: string;
  visitedAt: string;
}

export interface Store {
  users: User[];
  organizations: (Organization & Meta)[];
  roles: Role[];
  members: Member[];
  invitations: Invitation[];
  projectMembers: ProjectMember[];
  projects: (Project & Meta)[];
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
  sessions: Session[];
  accounts: Account[];
  passwordResets: PasswordReset[];
  projectVisits: ProjectVisit[];
  /** workspace role name → permission keys */
  rolePermissions: Record<string, string[]>;
  /** seeded = seed() is idempotent */
  seeded: boolean;
}

export const store: Store = {
  users: [],
  organizations: [],
  roles: [],
  members: [],
  invitations: [],
  projectMembers: [],
  projects: [],
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
  sessions: [],
  accounts: [],
  passwordResets: [],
  projectVisits: [],
  rolePermissions: {},
  seeded: false,
};
