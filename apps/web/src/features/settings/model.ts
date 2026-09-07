/** Role vocabularies for the settings selects — system role names as the
 *  API expects them (roleName). Mirrors packages/core constants/roles.ts. */
export const WORKSPACE_ROLES = [
  "Owner",
  "Admin",
  "Project Manager",
  "Member",
  "Viewer",
] as const;

export const PROJECT_ROLES = [
  "Project Admin",
  "Project Manager",
  "Member",
  "Viewer",
] as const;

/** Permission keys the UI gates controls on (cosmetic; API enforces). */
export const PERM = {
  orgUpdate: "organization:update",
  orgDelete: "organization:delete",
  memberView: "member:view",
  memberCreate: "member:create",
  memberUpdate: "member:update",
  memberRemove: "member:remove",
  projectCreate: "project:create",
  projectUpdate: "project:update",
  projectDelete: "project:delete",
  projectManageMembers: "project:manage-members",
  billingManage: "billing:manage",
} as const;

export function hasPerm(permissions: string[] | undefined, key: string): boolean {
  return !!permissions?.includes(key);
}
