/**
 * In-memory repository — the runtime data layer for the modules that have
 * not migrated to Postgres yet (workspace, projects, tasks, documents, …).
 *
 * The auth domain (users, sessions, accounts, password resets) lives in
 * Postgres via Drizzle — see db/pg.ts + db/auth-repo.ts. The collections
 * here mirror the remaining tables of the Drizzle schema in `@pmin/core/db`
 * and will move over module by module.
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

/** project_visits row — per-user project visit history (recents). */
export interface ProjectVisit {
  userId: string;
  projectId: string;
  visitedAt: string;
}

export interface Store {
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
  projectVisits: ProjectVisit[];
  /** workspace role name → permission keys */
  rolePermissions: Record<string, string[]>;
  /** seeded = seed() is idempotent */
  seeded: boolean;
}

export const store: Store = {
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
  projectVisits: [],
  rolePermissions: {},
  seeded: false,
};

/** Re-exported for modules that still import these from the store module. */
export type { User };
