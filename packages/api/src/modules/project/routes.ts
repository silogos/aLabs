/** Project routes — projects under an org, and project members. */
import { Hono } from "hono";
import { store } from "../../db/store";
import {
  uuidv7,
  projectCreate,
  projectUpdate,
  projectSchema,
  projectMemberAdd,
  projectMemberUpdate,
  DEFAULT_TASK_STATUSES,
  DEFAULT_TASK_TYPES,
} from "@pmin/core";
import { PROJECT_TRANSITIONS, canTransition, PERSONAL_PROJECT_LIMIT } from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseBody } from "../../lib/validate";
import { projectContext, orgContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const project = new Hono<{ Variables: Vars }>();

// List projects for an org (member sees all)
project.get("/", orgContext, requirePermission("project:view"), (c) => {
  const orgId = currentTenant(c).organizationId;
  const rows = store.projects.filter((p) => p.organizationId === orgId && !p.deletedAt);
  return data(c, rows);
});

project.post("/", orgContext, requirePermission("project:create"), async (c) => {
  const user = c.get("user")!;
  const orgId = currentTenant(c).organizationId;
  const input = parseBody(await c.req.json(), projectCreate);
  if (store.projects.some((p) => p.organizationId === orgId && p.slug === input.slug))
    throw badRequest("Slug already taken in this organization");
  if (store.projects.some((p) => p.organizationId === orgId && p.key === input.key))
    throw badRequest("Key already taken in this organization");

  // Personal workspaces are capped at PERSONAL_PROJECT_LIMIT active projects.
  // Active = not archived and not soft-deleted (archiving frees the slot).
  // See docs/foundation/04-plans-workspaces.md and ADR 0007.
  const org = store.organizations.find((o) => o.id === orgId && !o.deletedAt);
  if (org?.type === "personal") {
    const active = store.projects.filter(
      (p) => p.organizationId === orgId && !p.deletedAt && p.status !== "archived",
    ).length;
    if (active >= PERSONAL_PROJECT_LIMIT)
      throw badRequest(
        `Personal workspaces are limited to ${PERSONAL_PROJECT_LIMIT} active projects`,
      );
  }

  const proj = {
    id: uuidv7(),
    organizationId: orgId,
    name: input.name,
    slug: input.slug,
    key: input.key,
    description: input.description ?? null,
    icon: input.icon ?? null,
    status: "active" as const,
    visibility: "organization" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null as string | null,
  };
  store.projects.push(proj);

  // default task config — created per project on first access (05-seed-data.md)
  for (const s of DEFAULT_TASK_STATUSES) {
    store.taskStatuses.push({
      id: uuidv7(),
      projectId: proj.id,
      name: s.name,
      color: null,
      order: s.order,
      isDefault: s.isDefault,
    });
  }
  for (const name of DEFAULT_TASK_TYPES) {
    store.taskTypes.push({ id: uuidv7(), projectId: proj.id, name });
  }

  // creator becomes a Project Admin
  const role = store.roles.find((r) => r.name === "Project Admin" && r.scope === "project")!;
  store.projectMembers.push({
    id: uuidv7(),
    projectId: proj.id,
    userId: user.id,
    role,
    status: "active" as const,
    joinedAt: new Date().toISOString(),
    user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return created(c, projectSchema.parse(proj));
});

/* ---------------- Project members ----------------
 * Inviting = creating a pending membership row for an existing (active) org
 * member, keyed by email. Accept flips it to active. Admin-driven — the
 * invitee-side flow needs email delivery (deferred).
 *
 * Mounted at /projects/:projectId (contract: Prj/members), like task/documents/
 * planning — NOT under the org-scoped project mount. */
export const projectMembers = new Hono<{ Variables: Vars }>();

projectMembers.get("/members", projectContext, (c) => {
  const projectId = currentTenant(c).projectId!;
  return data(c, store.projectMembers.filter((m) => m.projectId === projectId));
});

projectMembers.post(
  "/members",
  projectContext,
  requirePermission("project:manage-members"),
  async (c) => {
    const proj = currentProject(c);
    const input = parseBody(await c.req.json(), projectMemberAdd);
    // only active org members can be invited — 404, never 403 (leak rule)
    const orgMember = store.members.find(
      (m) =>
        m.organizationId === proj.organizationId &&
        m.status === "active" &&
        m.user.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (!orgMember) throw notFound();
    if (store.projectMembers.some((m) => m.projectId === proj.id && m.userId === orgMember.userId))
      throw badRequest("Already a member or invited");
    const role = store.roles.find(
      (r) => r.name === (input.roleName ?? "Member") && r.scope === "project",
    );
    if (!role) throw badRequest(`Unknown project role "${input.roleName ?? "Member"}"`);
    const row = {
      id: uuidv7(),
      projectId: proj.id,
      userId: orgMember.userId,
      role,
      status: "pending" as const,
      joinedAt: null as string | null,
      user: orgMember.user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.projectMembers.push(row);
    return created(c, row);
  },
);

projectMembers.patch(
  "/members/:memberId",
  projectContext,
  requirePermission("project:manage-members"),
  async (c) => {
    const proj = currentProject(c);
    const row = store.projectMembers.find(
      (m) => m.id === c.req.param("memberId") && m.projectId === proj.id,
    );
    if (!row) throw notFound();
    const input = parseBody(await c.req.json(), projectMemberUpdate);
    if (input.roleName) {
      const role = store.roles.find((r) => r.name === input.roleName && r.scope === "project");
      if (!role) throw badRequest(`Unknown project role "${input.roleName}"`);
      row.role = role;
    }
    if (input.status === "active") {
      if (row.status !== "pending") throw badRequest("Only pending invitations can be accepted");
      row.status = "active";
      row.joinedAt = new Date().toISOString();
    }
    row.updatedAt = new Date().toISOString();
    return data(c, row);
  },
);

projectMembers.delete(
  "/members/:memberId",
  projectContext,
  requirePermission("project:manage-members"),
  (c) => {
    const proj = currentProject(c);
    const id = c.req.param("memberId");
    if (!store.projectMembers.some((m) => m.id === id && m.projectId === proj.id)) throw notFound();
    store.projectMembers = store.projectMembers.filter((m) => m.id !== id);
    return noContent(c);
  },
);

// Project-scoped routes (by :projectId across the whole org)
project.get("/:projectId", projectContext, (c) => data(c, currentProject(c)));

project.patch("/:projectId", projectContext, requirePermission("project:update"), async (c) => {
  const proj = currentProject(c);
  const input = parseBody(await c.req.json(), projectUpdate);
  if (input.status && input.status !== proj.status) {
    if (!canTransition(PROJECT_TRANSITIONS, proj.status, input.status))
      throw conflict(`Cannot transition project from ${proj.status} to ${input.status}`);
  }
  Object.assign(proj, input, { updatedAt: new Date().toISOString() });
  return data(c, proj);
});

project.delete("/:projectId", projectContext, requirePermission("project:delete"), (c) => {
  const proj = currentProject(c);
  proj.deletedAt = new Date().toISOString();
  return noContent(c);
});

function currentProject(c: Ctx) {
  const t = currentTenant(c);
  const p = store.projects.find((x) => x.id === t.projectId && !x.deletedAt);
  if (!p) throw notFound();
  return p;
}
