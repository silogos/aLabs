/** Organization routes — workspace + members + invitations.
 *  All workspace rows live in Postgres (db/org-repo.ts). */
import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import * as orgRepo from "../../db/org-repo";
import * as authRepo from "../../db/auth-repo";
import {
  organizationCreate,
  organizationUpdate,
  memberUpdate,
  invitationCreate,
  invitationAction,
  paginationQuery,
  paginate,
} from "@pmin/core";
import { badRequest, notFound } from "../../lib/errors";
import { created, data, noContent, paginated } from "../../lib/responses";
import { parseJsonBody, parseQuery } from "../../lib/validate";
import { orgContext, currentTenant } from "../../lib/tenant";
import { requireAuth } from "../../lib/auth";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const organization = new Hono<{ Variables: Vars }>();

organization.use("*", requireAuth);

// List orgs the user belongs to (soft-deleted orgs disappear)
organization.get("/", async (c) => {
  const user = c.get("user")!;
  return data(c, await orgRepo.listOrganizationsForUser(user.id));
});

organization.post("/", async (c) => {
  const user = c.get("user")!;
  const input = await parseJsonBody(c, organizationCreate);
  if (await orgRepo.slugTaken(input.slug)) throw badRequest("Slug already taken");
  const org = await orgRepo.insertOrganization({
    name: input.name,
    slug: input.slug,
    type: "team",
    description: input.description ?? null,
    website: input.website ?? null,
  });
  // creator becomes Owner
  const ownerRole = await orgRepo.requireSystemRole("workspace", "Owner");
  await orgRepo.insertMember({ organizationId: org.id, userId: user.id, roleId: ownerRole.id });
  return created(c, org);
});

organization.get("/:organizationId", orgContext, async (c) => {
  const org = await orgRepo.getOrganization(currentTenant(c).organizationId);
  if (!org) throw notFound();
  return data(c, org);
});

// Soft delete — the org and everything under it becomes unreachable (404).
organization.delete(
  "/:organizationId",
  orgContext,
  requirePermission("organization:delete"),
  async (c) => {
    await orgRepo.softDeleteOrganization(currentTenant(c).organizationId);
    return noContent(c);
  },
);

organization.patch("/:organizationId", orgContext, requirePermission("organization:update"), async (c) => {
  const input = await parseJsonBody(c, organizationUpdate);
  const org = await orgRepo.updateOrganization(currentTenant(c).organizationId, input);
  return data(c, org);
});

// Members
organization.get("/:organizationId/members", orgContext, requirePermission("member:view"), async (c) => {
  return data(c, await orgRepo.listOrgMembers(currentTenant(c).organizationId));
});

// Change a member's workspace role.
organization.patch(
  "/:organizationId/members/:memberId",
  orgContext,
  requirePermission("member:update"),
  async (c) => {
    const orgId = currentTenant(c).organizationId;
    const member = await orgRepo.getOrgMember(orgId, c.req.param("memberId"));
    if (!member) throw notFound();
    if (member.role.scope !== "workspace") throw badRequest("Not a workspace membership");
    const input = await parseJsonBody(c, memberUpdate);
    const role = await orgRepo.findRoleByName("workspace", input.roleName);
    if (!role) throw badRequest(`Unknown workspace role "${input.roleName}"`);
    // an org always keeps at least one active Owner
    if (member.role.name === "Owner" && role.name !== "Owner" && (await orgRepo.countActiveOwners(orgId)) <= 1)
      throw badRequest("Cannot demote the last owner of the workspace");
    await orgRepo.updateMemberRole(member.id, role.id);
    return data(c, { ...member, role });
  },
);

organization.delete(
  "/:organizationId/members/:memberId",
  orgContext,
  requirePermission("member:remove"),
  async (c) => {
    const orgId = currentTenant(c).organizationId;
    const member = await orgRepo.getOrgMember(orgId, c.req.param("memberId"));
    if (!member) throw notFound();
    if (member.role.name === "Owner" && (await orgRepo.countActiveOwners(orgId)) <= 1)
      throw badRequest("Cannot remove the last owner of the workspace");
    await orgRepo.deleteMember(member.id);
    return noContent(c);
  },
);

/* ---------------- Invitations (the membership flow) ----------------
 * Users self-register (→ personal workspace); joining an org happens by
 * invitation. Accept requires the invitee to already have an account. */

organization.post(
  "/:organizationId/invitations",
  orgContext,
  requirePermission("member:create"),
  async (c) => {
    const input = await parseJsonBody(c, invitationCreate);
    const orgId = currentTenant(c).organizationId;
    const role =
      (await orgRepo.findRoleByName("workspace", input.roleName)) ??
      (await orgRepo.requireSystemRole("workspace", "Member"));
    if (await orgRepo.getActiveMemberByEmail(orgId, input.email))
      throw badRequest("Already a member");
    if (await orgRepo.hasPendingInvitation(orgId, input.email))
      throw badRequest("Invitation already pending");
    const invitation = await orgRepo.insertInvitation({
      organizationId: orgId,
      email: input.email,
      roleId: role.id,
      roleName: role.name,
      expiresAt: new Date(Date.now() + 7 * 86400000),
      // admin-driven flow today; the token future-proofs email delivery
      token: randomBytes(24).toString("base64url"),
    });
    return created(c, invitation);
  },
);

organization.get(
  "/:organizationId/invitations",
  orgContext,
  requirePermission("member:view"),
  async (c) => {
    const q = parseQuery(c.req.query(), paginationQuery);
    return paginated(c, paginate(await orgRepo.listOrgInvitations(currentTenant(c).organizationId), q));
  },
);

// accept (materializes the member) / cancel — admin-driven; email delivery deferred
organization.patch(
  "/:organizationId/invitations/:invitationId",
  orgContext,
  requirePermission("member:create"),
  async (c) => {
    const orgId = currentTenant(c).organizationId;
    const invitation = await orgRepo.getOrgInvitation(orgId, c.req.param("invitationId"));
    if (!invitation) throw notFound();
    if (invitation.status !== "pending")
      throw badRequest(`Invitation is already ${invitation.status}`);
    const input = await parseJsonBody(c, invitationAction);
    if (input.action === "cancel") {
      await orgRepo.updateInvitationStatus(invitation.id, "cancelled");
      return data(c, invitation);
    }
    // accept: the invitee must have registered on their own (personal workspace)
    if (await orgRepo.getActiveMemberByEmail(orgId, invitation.email))
      throw badRequest("Already a member");
    const registered = await authRepo.getUserByEmail(invitation.email);
    if (!registered) throw badRequest("User must register before accepting this invitation");
    const role =
      (await orgRepo.findRoleByName("workspace", invitation.roleName)) ??
      (await orgRepo.requireSystemRole("workspace", "Member"));
    await orgRepo.insertMember({ organizationId: orgId, userId: registered.id, roleId: role.id });
    await orgRepo.updateInvitationStatus(invitation.id, "accepted");
    return data(c, invitation);
  },
);
