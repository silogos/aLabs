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
  memberCreate: "member:create",
  memberUpdate: "member:update",
  memberRemove: "member:remove",
  projectUpdate: "project:update",
  projectManageMembers: "project:manage-members",
} as const;

export function hasPerm(permissions: string[] | undefined, key: string): boolean {
  return !!permissions?.includes(key);
}
