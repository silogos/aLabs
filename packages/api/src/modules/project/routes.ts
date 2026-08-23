/** Project routes — projects under an org, and project members.
 *  Project rows and memberships live in Postgres (db/project-repo.ts);
 *  per-project task config (statuses/types) is still in-memory (task phase). */
import { Hono } from "hono";
import * as orgRepo from "../../db/org-repo";
import * as projectRepo from "../../db/project-repo";
import * as taskRepo from "../../db/task-repo";
import {
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
import type { Vars } from "../../lib/ctx";

export const project = new Hono<{ Variables: Vars }>();

// List projects for an org (member sees all)
project.get("/", orgContext, requirePermission("project:view"), async (c) => {
  return data(c, await projectRepo.listOrgProjects(currentTenant(c).organizationId));
});

project.post("/", orgContext, requirePermission("project:create"), async (c) => {
  const user = c.get("user")!;
  const orgId = currentTenant(c).organizationId;
  const input = parseBody(await c.req.json(), projectCreate);
  if (await projectRepo.slugTakenInOrg(orgId, input.slug))
    throw badRequest("Slug already taken in this organization");
  if (await projectRepo.keyTakenInOrg(orgId, input.key))
    throw badRequest("Key already taken in this organization");

  // Personal workspaces are capped at PERSONAL_PROJECT_LIMIT active projects.
  // Active = not archived and not soft-deleted (archiving frees the slot).
  // See docs/foundation/04-plans-workspaces.md and ADR 0007.
  const org = await orgRepo.getOrganization(orgId);
  if (org?.type === "personal" && (await projectRepo.countActiveProjects(orgId)) >= PERSONAL_PROJECT_LIMIT)
    throw badRequest(
      `Personal workspaces are limited to ${PERSONAL_PROJECT_LIMIT} active projects`,
    );

  const proj = await projectRepo.insertProject({
    organizationId: orgId,
    name: input.name,
    slug: input.slug,
    key: input.key,
    description: input.description ?? null,
    icon: input.icon ?? null,
  });

  // default task config — created per project on first access (05-seed-data.md)
  for (const s of DEFAULT_TASK_STATUSES) {
    await taskRepo.insertStatus({
      projectId: proj.id,
      name: s.name,
      order: s.order,
      isDefault: s.isDefault,
    });
  }
  for (const name of DEFAULT_TASK_TYPES) {
    await taskRepo.insertType(proj.id, name);
  }

  // creator becomes a Project Admin (system project roles live in Postgres)
  const role = await orgRepo.findRoleByName("project", "Project Admin");
  if (!role) throw new Error("project Project Admin role missing — seed incomplete");
  await projectRepo.insertProjectMember({
    projectId: proj.id,
    userId: user.id,
    roleId: role.id,
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

projectMembers.get("/members", projectContext, async (c) => {
  return data(c, await projectRepo.listProjectMembers(currentTenant(c).projectId!));
});

projectMembers.post(
  "/members",
  projectContext,
  requirePermission("project:manage-members"),
  async (c) => {
    const projectId = currentTenant(c).projectId!;
    const input = parseBody(await c.req.json(), projectMemberAdd);
    // only active org members can be invited — 404, never 403 (leak rule)
    const orgMember = await orgRepo.getActiveMemberByEmail(
      (await mustProject(projectId)).organizationId,
      input.email,
    );
    if (!orgMember) throw notFound();
    if (await projectRepo.hasProjectMember(projectId, orgMember.userId))
      throw badRequest("Already a member or invited");
    const role = await orgRepo.findRoleByName("project", input.roleName ?? "Member");
    if (!role) throw badRequest(`Unknown project role "${input.roleName ?? "Member"}"`);
    await projectRepo.insertProjectMember({
      projectId,
      userId: orgMember.userId,
      roleId: role.id,
      status: "pending",
    });
    const rows = await projectRepo.listProjectMembers(projectId);
    return created(c, rows.at(-1)!);
  },
);

projectMembers.patch(
  "/members/:memberId",
  projectContext,
  requirePermission("project:manage-members"),
  async (c) => {
    const projectId = currentTenant(c).projectId!;
    const row = await projectRepo.getProjectMemberRow(projectId, c.req.param("memberId"));
    if (!row) throw notFound();
    const input = parseBody(await c.req.json(), projectMemberUpdate);
    let roleId: string | undefined;
    if (input.roleName) {
      const role = await orgRepo.findRoleByName("project", input.roleName);
      if (!role) throw badRequest(`Unknown project role "${input.roleName}"`);
      roleId = role.id;
    }
    if (input.status === "active") {
      if (row.status !== "pending") throw badRequest("Only pending invitations can be accepted");
    }
    await projectRepo.updateProjectMember(row.id, { roleId, status: input.status });
    return data(c, (await projectRepo.getProjectMemberRow(projectId, row.id))!);
  },
);

projectMembers.delete(
  "/members/:memberId",
  projectContext,
  requirePermission("project:manage-members"),
  async (c) => {
    const projectId = currentTenant(c).projectId!;
    const row = await projectRepo.getProjectMemberRow(projectId, c.req.param("memberId"));
    if (!row) throw notFound();
    await projectRepo.deleteProjectMember(row.id);
    return noContent(c);
  },
);

// Project-scoped routes (by :projectId across the whole org)
project.get("/:projectId", projectContext, async (c) =>
  data(c, await mustProject(currentTenant(c).projectId!)),
);

project.patch("/:projectId", projectContext, requirePermission("project:update"), async (c) => {
  const proj = await mustProject(currentTenant(c).projectId!);
  const input = parseBody(await c.req.json(), projectUpdate);
  if (input.status && input.status !== proj.status) {
    if (!canTransition(PROJECT_TRANSITIONS, proj.status, input.status))
      throw conflict(`Cannot transition project from ${proj.status} to ${input.status}`);
  }
  return data(c, await projectRepo.updateProject(proj.id, input));
});

project.delete("/:projectId", projectContext, requirePermission("project:delete"), async (c) => {
  await projectRepo.softDeleteProject(currentTenant(c).projectId!);
  return noContent(c);
});

async function mustProject(id: string): Promise<projectRepo.ProjectWithMeta> {
  const p = await projectRepo.getProject(id);
  if (!p) throw notFound();
  return p;
}
