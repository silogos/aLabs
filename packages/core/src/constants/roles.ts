/**
 * Default roles — system roles (`is_system = true`).
 *
 * Workspace roles:   scope `workspace`, organization_id null.
 * Project roles:     scope `project`, organization_id null.
 *
 * From `docs/tech/05-seed-data.md`.
 */
import { ALL_PERMISSIONS, PERMISSION_GROUPS, type PermissionKey } from "./permissions";

export type SystemRoleName =
  | "Owner"
  | "Admin"
  | "Project Manager"
  | "Member"
  | "Viewer"
  | "Project Admin";

const P = PERMISSION_GROUPS;

const VIEW_AND_EXPORT: PermissionKey[] = [
  ...P.project.filter((k) => k === "project:view"),
  ...P.task.filter((k) => k.endsWith(":view")),
  ...P.document.filter((k) => k.endsWith(":view")),
  ...P.planning.filter((k) => k.endsWith(":view")),
  ...P.meeting.filter((k) => k.endsWith(":view")),
  ...P.agreement.filter((k) => k.endsWith(":view")),
  ...P.reporting, // view + export
];

export interface SystemRole {
  name: SystemRoleName;
  scope: "workspace" | "project";
  permissions: PermissionKey[];
}

export const SYSTEM_WORKSPACE_ROLES: SystemRole[] = [
  { name: "Owner", scope: "workspace", permissions: ALL_PERMISSIONS },
  {
    name: "Admin",
    scope: "workspace",
    permissions: ALL_PERMISSIONS.filter((k) => k !== "organization:delete"),
  },
  {
    name: "Project Manager",
    scope: "workspace",
    permissions: [
      ...P.project,
      ...P.task,
      ...P.document,
      ...P.planning,
      ...P.meeting,
      ...P.agreement,
      ...P.reporting,
      ...P.portal,
    ],
  },
  {
    name: "Member",
    scope: "workspace",
    permissions: [
      "project:view",
      ...P.task,
      ...P.document,
      "planning:view",
      "meeting:view",
      "reporting:view",
    ],
  },
  { name: "Viewer", scope: "workspace", permissions: VIEW_AND_EXPORT },
];

export const SYSTEM_PROJECT_ROLES: SystemRole[] = [
  {
    name: "Project Admin",
    scope: "project",
    permissions: [
      "project:view",
      "project:update",
      "project:manage-members",
      ...P.task,
      ...P.document,
      ...P.planning,
      ...P.meeting,
      ...P.agreement,
      ...P.reporting,
    ],
  },
  {
    name: "Project Manager",
    scope: "project",
    permissions: [
      "project:view",
      ...P.task,
      ...P.document,
      ...P.planning,
      ...P.meeting,
      ...P.reporting,
    ],
  },
  {
    name: "Member",
    scope: "project",
    permissions: [
      "project:view",
      ...P.task,
      ...P.document,
      "planning:view",
      "meeting:view",
      "reporting:view",
    ],
  },
  {
    name: "Viewer",
    scope: "project",
    permissions: [
      "project:view",
      "task:view",
      "document:view",
      "planning:view",
      "meeting:view",
      "agreement:view",
      "reporting:view",
    ],
  },
];
