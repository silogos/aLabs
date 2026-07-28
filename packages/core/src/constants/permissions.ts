/**
 * Permission keys — seed the `permissions` table.
 *
 * Convention `<module>:<action>` per `docs/tech/02-conventions.md`.
 * Full list from `docs/tech/05-seed-data.md`.
 */

export const PERMISSION_KEYS = [
  // Organization
  "organization:view",
  "organization:update",
  "organization:delete",
  // Members
  "member:view",
  "member:create",
  "member:update",
  "member:remove",
  // Project
  "project:create",
  "project:view",
  "project:update",
  "project:archive",
  "project:delete",
  "project:manage-members",
  // Task
  "task:view",
  "task:create",
  "task:update",
  "task:delete",
  // Documents
  "document:view",
  "document:create",
  "document:update",
  "document:delete",
  "file:upload",
  // Planning
  "planning:view",
  "planning:manage",
  // Meeting
  "meeting:view",
  "meeting:create",
  "meeting:update",
  "meeting:delete",
  // Agreement
  "agreement:view",
  "agreement:create",
  "agreement:update",
  "agreement:delete",
  // Reporting
  "reporting:view",
  "reporting:export",
  // Client Portal
  "portal:manage",
  // Billing
  "billing:manage",
  // AI
  "ai:use",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

/** Group → permission keys. Used to derive role grants. */
export const PERMISSION_GROUPS = {
  organization: ["organization:view", "organization:update", "organization:delete"],
  member: ["member:view", "member:create", "member:update", "member:remove"],
  project: [
    "project:create",
    "project:view",
    "project:update",
    "project:archive",
    "project:delete",
    "project:manage-members",
  ],
  task: ["task:view", "task:create", "task:update", "task:delete"],
  document: ["document:view", "document:create", "document:update", "document:delete", "file:upload"],
  planning: ["planning:view", "planning:manage"],
  meeting: ["meeting:view", "meeting:create", "meeting:update", "meeting:delete"],
  agreement: ["agreement:view", "agreement:create", "agreement:update", "agreement:delete"],
  reporting: ["reporting:view", "reporting:export"],
  portal: ["portal:manage"],
  billing: ["billing:manage"],
  ai: ["ai:use"],
} satisfies Record<string, readonly PermissionKey[]>;

export const ALL_PERMISSIONS: PermissionKey[] = [...PERMISSION_KEYS];
