/**
 * Invitation accept routes — the invitee-facing flow (create / list / cancel
 * and the admin-driven accept live in modules/organization/routes.ts).
 *
 * Mounted at /invitations, outside orgContext on purpose: the invitee is by
 * definition not a member yet, so the token itself is the capability. The
 * preview is public — it discloses no more than the invite email already
 * does (org name, role, status); accept requires the session of exactly the
 * invited user. Contract: docs/foundation/02-organization.md.
 */
import { Hono } from "hono";
import * as orgRepo from "../../db/org-repo";
import { badRequest, forbidden, notFound } from "../../lib/errors";
import { data } from "../../lib/responses";
import { requireAuth } from "../../lib/auth";
import type { Vars } from "../../lib/ctx";

export const invitation = new Hono<{ Variables: Vars }>();

// Public preview for the accept page — the invitee may need to sign in or
// register before they can accept, so no session is required to see what
// the link is about.
invitation.get("/:token", async (c) => {
  const inv = await orgRepo.getInvitationByToken(c.req.param("token"));
  if (!inv) throw notFound();
  const org = await orgRepo.getOrganization(inv.organizationId);
  if (!org) throw notFound();
  return data(c, {
    organizationName: org.name,
    email: inv.email,
    roleName: inv.roleName,
    status: inv.status,
    expiresAt: inv.expiresAt,
  });
});

// Invitee self-accept — materializes the membership (status active, same as
// the admin-driven path) and flips the invitation to accepted. Email-bound:
// the signed-in user must be the invited account.
invitation.post("/:token/accept", requireAuth, async (c) => {
  const user = c.get("user")!;
  const inv = await orgRepo.getInvitationByToken(c.req.param("token"));
  if (!inv) throw notFound();
  if (inv.status !== "pending") throw badRequest(`Invitation is already ${inv.status}`);
  if (inv.email !== user.email.toLowerCase())
    throw forbidden("This invitation was sent to a different email address");
  if (await orgRepo.getActiveMemberByEmail(inv.organizationId, inv.email))
    throw badRequest("Already a member");
  const role =
    (await orgRepo.findRoleByName("workspace", inv.roleName)) ??
    (await orgRepo.requireSystemRole("workspace", "Member"));
  await orgRepo.insertMember({
    organizationId: inv.organizationId,
    userId: user.id,
    roleId: role.id,
  });
  await orgRepo.updateInvitationStatus(inv.id, "accepted");
  const org = await orgRepo.getOrganization(inv.organizationId);
  if (!org) throw notFound();
  return data(c, { ok: true, organization: org });
});
