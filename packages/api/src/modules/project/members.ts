/** Project member routes — inviting org members into a project.
 *
 * Inviting = creating a pending membership row for an existing (active) org
 * member, keyed by email. Accept flips it to active. Admin-driven — the
 * invitee-side flow needs email delivery (deferred).
 *
 * Mounted at /projects/:projectId (contract: Prj/members), like task/documents/
 * planning — NOT under the org-scoped project mount. */
import { Hono } from "hono";
import * as orgRepo from "../../db/org-repo";
import * as projectRepo from "../../db/project-repo";
import { projectMemberAdd, projectMemberUpdate } from "@pmin/core";
import { badRequest, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseJsonBody } from "../../lib/validate";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars } from "../../lib/ctx";

export const projectMembers = new Hono<{ Variables: Vars }>();

projectMembers.get("/members", projectContext, requirePermission("project:view"), async (c) => {
  return data(c, await projectRepo.listProjectMembers(currentTenant(c).projectId!));
});

projectMembers.post(
  "/members",
  projectContext,
  requirePermission("project:manage-members"),
  async (c) => {
    const projectId = currentTenant(c).projectId!;
    const input = await parseJsonBody(c, projectMemberAdd);
    // only active org members can be invited — 404, never 403 (leak rule)
    const project = await projectRepo.getProject(projectId);
    if (!project) throw notFound();
    const orgMember = await orgRepo.getActiveMemberByEmail(project.organizationId, input.email);
    if (!orgMember) throw notFound();
    if (await projectRepo.hasProjectMember(projectId, orgMember.userId))
      throw badRequest("Already a member or invited");
    const role = await orgRepo.findRoleByName("project", input.roleName ?? "Member");
    if (!role) throw badRequest(`Unknown project role "${input.roleName ?? "Member"}"`);
    const memberId = await projectRepo.insertProjectMember({
      projectId,
      userId: orgMember.userId,
      roleId: role.id,
      status: "pending",
    });
    return created(c, (await projectRepo.getProjectMemberRow(projectId, memberId))!);
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
    const input = await parseJsonBody(c, projectMemberUpdate);
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
