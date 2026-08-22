/** Organization routes — workspace + members + invitations. */
import { Hono } from "hono";
import { store } from "../../db/store.js";
import {
  uuidv7,
  organizationCreate,
  organizationUpdate,
  memberUpdate,
  invitationInput,
  invitationAction,
  paginationQuery,
} from "@pmin/core";
import { badRequest, notFound } from "../../lib/errors.js";
import { created, data, noContent, paginated } from "../../lib/responses.js";
import { paginate } from "@pmin/core";
import { parseBody, parseQuery } from "../../lib/validate.js";
import { orgContext } from "../../lib/tenant.js";
import { requireAuth } from "../../lib/auth.js";
import { requirePermission } from "../../lib/permission.js";
import type { Vars, Ctx } from "../../lib/ctx.js";

export const organization = new Hono<{ Variables: Vars }>();

organization.use("*", requireAuth);

// List orgs the user belongs to (soft-deleted orgs disappear)
organization.get("/", (c) => {
  const user = c.get("user")!;
  const orgs = store.members
    .filter((m) => m.userId === user.id && m.status === "active")
    .map((m) => store.organizations.find((o) => o.id === m.organizationId && !o.deletedAt)!)
    .filter(Boolean);
  return data(c, orgs);
});

organization.post("/", async (c) => {
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), organizationCreate);
  if (store.organizations.some((o) => o.slug === input.slug && !o.deletedAt))
    throw badRequest("Slug already taken");
  const org = {
    id: uuidv7(),
    name: input.name,
    slug: input.slug,
    type: "team" as const,
    logo: null,
    description: input.description ?? null,
    timezone: "UTC",
    language: "en",
    website: input.website ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.organizations.push(org);
  // creator becomes Owner
  const ownerRole = store.roles.find((r) => r.name === "Owner" && r.scope === "workspace")!;
  store.members.push({
    id: uuidv7(),
    organizationId: org.id,
    userId: user.id,
    role: ownerRole,
    status: "active",
    joinedAt: new Date().toISOString(),
    user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return created(c, org);
});

organization.get("/:organizationId", orgContext, (c) => data(c, currentOrg(c)));

// Soft delete — the org and everything under it becomes unreachable (404).
organization.delete(
  "/:organizationId",
  orgContext,
  requirePermission("organization:delete"),
  (c) => {
    const org = currentOrg(c);
    org.deletedAt = new Date().toISOString();
    return noContent(c);
  },
);

organization.patch("/:organizationId", orgContext, requirePermission("organization:update"), async (c) => {
  const org = currentOrg(c);
  const input = parseBody(await c.req.json(), organizationUpdate);
  Object.assign(org, input, { updatedAt: new Date().toISOString() });
  return data(c, org);
});

// Members
organization.get("/:organizationId/members", orgContext, requirePermission("member:view"), (c) => {
  const members = store.members.filter((m) => m.organizationId === currentOrg(c).id);
  return data(c, members);
});

// Change a member's workspace role.
organization.patch(
  "/:organizationId/members/:memberId",
  orgContext,
  requirePermission("member:update"),
  async (c) => {
    const org = currentOrg(c);
    const member = store.members.find(
      (m) => m.id === c.req.param("memberId") && m.organizationId === org.id,
    );
    if (!member) throw notFound();
    if (org.type === "personal") throw badRequest("Personal workspaces cannot change roles");
    const input = parseBody(await c.req.json(), memberUpdate);
    const role = store.roles.find((r) => r.name === input.roleName && r.scope === "workspace");
    if (!role) throw badRequest(`Unknown workspace role "${input.roleName}"`);
    // an org always keeps at least one active Owner
    if (
      member.role.name === "Owner" &&
      role.name !== "Owner" &&
      activeOwners(org.id).length <= 1
    )
      throw badRequest("Cannot demote the last owner of the workspace");
    member.role = role;
    member.updatedAt = new Date().toISOString();
    return data(c, member);
  },
);

organization.delete(
  "/:organizationId/members/:memberId",
  orgContext,
  requirePermission("member:remove"),
  (c) => {
    const org = currentOrg(c);
    const id = c.req.param("memberId");
    const member = store.members.find((m) => m.id === id && m.organizationId === org.id);
    if (!member) throw notFound();
    if (org.type === "personal") throw badRequest("Personal workspaces cannot remove members");
    if (member.role.name === "Owner" && activeOwners(org.id).length <= 1)
      throw badRequest("Cannot remove the last owner of the workspace");
    store.members = store.members.filter((m) => m.id !== id);
    return noContent(c);
  },
);

function activeOwners(orgId: string) {
  return store.members.filter(
    (m) => m.organizationId === orgId && m.status === "active" && m.role.name === "Owner",
  );
}

/* ---------------- Invitations (the membership flow) ----------------
 * Users self-register (→ personal workspace); joining an org happens by
 * invitation. Accept requires the invitee to already have an account. */

organization.post(
  "/:organizationId/invitations",
  orgContext,
  requirePermission("member:create"),
  async (c) => {
    const input = parseBody(await c.req.json(), invitationInput);
    const org = currentOrg(c);
    if (org.type === "personal") throw badRequest("Personal workspaces cannot invite members");
    const role =
      store.roles.find((r) => r.name === input.roleName && r.scope === "workspace") ??
      store.roles.find((r) => r.name === "Member" && r.scope === "workspace")!;
    const email = input.email.toLowerCase();
    if (
      store.members.some(
        (m) => m.organizationId === org.id && m.status === "active" && m.user.email.toLowerCase() === email,
      )
    )
      throw badRequest("Already a member");
    if (
      store.invitations.some(
        (i) => i.organizationId === org.id && i.email.toLowerCase() === email && i.status === "pending",
      )
    )
      throw badRequest("Invitation already pending");
    const invitation = {
      id: uuidv7(),
      organizationId: org.id,
      email: input.email,
      status: "pending" as const,
      roleName: role.name,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    store.invitations.push(invitation);
    return created(c, invitation);
  },
);

organization.get(
  "/:organizationId/invitations",
  orgContext,
  requirePermission("member:view"),
  (c) => {
    const q = parseQuery(c.req.query(), paginationQuery);
    return paginated(
      c,
      paginate(store.invitations.filter((i) => i.organizationId === currentOrg(c).id), q),
    );
  },
);

// accept (materializes the member) / cancel — admin-driven; email delivery deferred
organization.patch(
  "/:organizationId/invitations/:invitationId",
  orgContext,
  requirePermission("member:create"),
  async (c) => {
    const org = currentOrg(c);
    const invitation = store.invitations.find(
      (i) => i.id === c.req.param("invitationId") && i.organizationId === org.id,
    );
    if (!invitation) throw notFound();
    if (invitation.status !== "pending")
      throw badRequest(`Invitation is already ${invitation.status}`);
    const input = parseBody(await c.req.json(), invitationAction);
    if (input.action === "cancel") {
      invitation.status = "cancelled";
      return data(c, invitation);
    }
    // accept: the invitee must have registered on their own (personal workspace)
    const user = store.users.find(
      (u) => u.email.toLowerCase() === invitation.email.toLowerCase(),
    );
    if (!user)
      throw badRequest("User must register before accepting this invitation");
    if (store.members.some((m) => m.organizationId === org.id && m.userId === user.id))
      throw badRequest("Already a member");
    const role =
      store.roles.find((r) => r.name === invitation.roleName && r.scope === "workspace") ??
      store.roles.find((r) => r.name === "Member" && r.scope === "workspace")!;
    store.members.push({
      id: uuidv7(),
      organizationId: org.id,
      userId: user.id,
      role,
      status: "active" as const,
      joinedAt: new Date().toISOString(),
      user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    invitation.status = "accepted";
    return data(c, invitation);
  },
);

function currentOrg(c: Ctx) {
  const t = c.get("tenant");
  const org = store.organizations.find((o) => o.id === t?.organizationId);
  if (!org) throw notFound();
  return org;
}
