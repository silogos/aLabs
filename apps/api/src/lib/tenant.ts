/**
 * Tenant context middleware — `tenantContext` per the request lifecycle
 * (`docs/tech/01-architecture.md`).
 *
 *   1. resolve :organizationId → verify caller is a member (else 404, never 403)
 *   2. optionally resolve :projectId → verify it belongs to that org + caller is
 *      a project member; compute the *effective* permission set =
 *      workspace role ∪ project role
 */
import type { MiddlewareHandler } from "hono";
import { store } from "../db/store.js";
import { notFound } from "./errors.js";
import type { Vars, TenantContext, Ctx } from "./ctx.js";

/** Organization-scoped tenant resolution. */
export const orgContext: MiddlewareHandler<{ Variables: Vars }> = async (c, next) => {
  const user = c.get("user");
  if (!user) return await next();
  const organizationId = c.req.param("organizationId");
  const org = store.organizations.find((o) => o.id === organizationId);
  if (!org) throw notFound();
  const member = store.members.find((m) => m.organizationId === org.id && m.userId === user.id);
  // 404 (not 403) to avoid leaking existence outside the tenant.
  if (!member) throw notFound();
  const ctx: TenantContext = {
    organizationId: org.id,
    workspaceRole: member.role.name,
    permissions: new Set(store.rolePermissions[member.role.name] ?? []),
  };
  c.set("tenant", ctx);
  await next();
};

/** Project-scoped tenant resolution. Expects :projectId. */
export const projectContext: MiddlewareHandler<{ Variables: Vars }> = async (c, next) => {
  const user = c.get("user");
  if (!user) return await next();
  const projectId = c.req.param("projectId");
  const project = store.projects.find((p) => p.id === projectId && !p.deletedAt);
  if (!project) throw notFound();
  // must be an org member to access any project
  const orgMember = store.members.find(
    (m) => m.organizationId === project.organizationId && m.userId === user.id,
  );
  if (!orgMember) throw notFound();
  const wsPerms = new Set(store.rolePermissions[orgMember.role.name] ?? []);
  // project role (optional): union into effective permissions
  const projectRoleName = "Member"; // demo: every org member is a project Member
  for (const p of store.rolePermissions[projectRoleName] ?? []) wsPerms.add(p);
  const ctx: TenantContext = {
    organizationId: project.organizationId,
    projectId: project.id,
    workspaceRole: orgMember.role.name,
    projectRole: projectRoleName,
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
