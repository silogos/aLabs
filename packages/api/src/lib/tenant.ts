/**
 * Tenant context middleware — `tenantContext` per the request lifecycle
 * (`docs/tech/01-architecture.md`).
 *
 *   1. resolve :organizationId → verify caller is a member (else 404, never 403)
 *   2. optionally resolve :projectId → verify it belongs to that org + caller is
 *      a project member; compute the *effective* permission set =
 *      workspace role ∪ project role
 *
 * Org/membership rows live in Postgres (db/org-repo.ts); projects and project
 * memberships are still in-memory (next migration phase).
 */
import type { MiddlewareHandler } from "hono";
import { store } from "../db/store";
import * as orgRepo from "../db/org-repo";
import { notFound } from "./errors";
import type { Vars, TenantContext, Ctx } from "./ctx";

/** Organization-scoped tenant resolution. */
export const orgContext: MiddlewareHandler<{ Variables: Vars }> = async (c, next) => {
  const user = c.get("user");
  if (!user) return await next();
  const organizationId = c.req.param("organizationId")!;
  const org = await orgRepo.getOrganization(organizationId);
  if (!org) throw notFound();
  const member = await orgRepo.getActiveMember(org.id, user.id);
  // 404 (not 403) to avoid leaking existence outside the tenant.
  if (!member) throw notFound();
  const ctx: TenantContext = {
    organizationId: org.id,
    workspaceRole: member.role.name,
    permissions: new Set(member.role.permissions),
  };
  c.set("tenant", ctx);
  await next();
};

/** Project-scoped tenant resolution. Expects :projectId.
 *
 * Effective permissions = workspace role ∪ project role (real membership row).
 * Private projects require an active project membership — otherwise 404. */
export const projectContext: MiddlewareHandler<{ Variables: Vars }> = async (c, next) => {
  const user = c.get("user");
  if (!user) return await next();
  const projectId = c.req.param("projectId");
  const project = store.projects.find((p) => p.id === projectId && !p.deletedAt);
  if (!project) throw notFound();
  // must be an active org member to access any project
  const orgMember = await orgRepo.getActiveMember(project.organizationId, user.id);
  if (!orgMember) throw notFound();
  // project membership (optional): pending invitations grant nothing yet
  const pm = store.projectMembers.find(
    (m) => m.projectId === project.id && m.userId === user.id && m.status === "active",
  );
  if (project.visibility === "private" && !pm) throw notFound();
  const wsPerms = new Set(orgMember.role.permissions);
  if (pm) for (const p of pm.role.permissions) wsPerms.add(p);
  const ctx: TenantContext = {
    organizationId: project.organizationId,
    projectId: project.id,
    workspaceRole: orgMember.role.name,
    projectRole: pm?.role.name,
    permissions: wsPerms,
  };
  c.set("tenant", ctx);
  await next();
};

export function currentTenant(c: Ctx) {
  const t = c.get("tenant");
  if (!t) throw notFound();
  return t;
}
