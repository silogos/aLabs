/** Organization routes — workspace + members + invitations. */
import { Hono } from "hono";
import { store } from "../../db/store.js";
import {
  uuidv7,
  organizationCreate,
  organizationUpdate,
  paginationQuery,
  invitationInput,
} from "@pmin/core";
import { badRequest, notFound } from "../../lib/errors.js";
import { created, data, paginated } from "../../lib/responses.js";
import { paginate } from "@pmin/core";
import { parseBody, parseQuery } from "../../lib/validate.js";
import { orgContext } from "../../lib/tenant.js";
import { requireAuth } from "../../lib/auth.js";
import { requirePermission } from "../../lib/permission.js";
import type { Vars, Ctx } from "../../lib/ctx.js";

export const organization = new Hono<{ Variables: Vars }>();

organization.use("*", requireAuth);

// List orgs the user belongs to
organization.get("/", (c) => {
  const user = c.get("user")!;
  const orgs = store.members
    .filter((m) => m.userId === user.id)
    .map((m) => store.organizations.find((o) => o.id === m.organizationId)!)
    .filter(Boolean);
  return data(c, orgs);
});

organization.post("/", async (c) => {
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), organizationCreate);
  if (store.organizations.some((o) => o.slug === input.slug))
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

organization.post("/:organizationId/members", orgContext, requirePermission("member:create"), async (c) => {
  const input = parseBody(await c.req.json(), invitationInput);
  const org = currentOrg(c);
  // Personal workspaces are single-member by design — invites are blocked at
  // the org level so cross-user assignment is impossible by construction.
  if (org.type === "personal")
    throw badRequest("Personal workspaces cannot invite members");
  const role =
    store.roles.find((r) => r.name === input.roleName && r.scope === "workspace") ??
    store.roles.find((r) => r.name === "Member" && r.scope === "workspace")!;
  const existing = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existing && store.members.some((m) => m.organizationId === org.id && m.userId === existing.id))
    throw badRequest("Already a member");
  const user =
    existing ?? {
      id: uuidv7(),
      name: input.email.split("@")[0]!,
      email: input.email,
      image: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  if (!existing) store.users.push(user);
  const member = {
    id: uuidv7(),
    organizationId: org.id,
    userId: user.id,
    role,
    status: "active" as const,
    joinedAt: new Date().toISOString(),
    user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.members.push(member);
  return created(c, member);
});

organization.delete(
  "/:organizationId/members/:memberId",
  orgContext,
  requirePermission("member:remove"),
  (c) => {
    const id = c.req.param("memberId");
    store.members = store.members.filter((m) => m.id !== id);
    return c.body(null, 204);
  },
);

// Invitations (simplified: stored on members with pending, or derived)
organization.get("/:organizationId/invitations", orgContext, requirePermission("member:view"), (c) => {
  const q = parseQuery(c.req.query(), paginationQuery);
  const invitations = store.members
    .filter((m) => m.organizationId === currentOrg(c).id && m.status === "pending")
    .map((m) => ({
      id: m.id,
      organizationId: m.organizationId,
      email: m.user.email,
      status: "pending" as const,
      roleName: m.role.name,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: m.createdAt,
    }));
  return paginated(c, paginate(invitations, q));
});

function currentOrg(c: Ctx) {
  const t = c.get("tenant");
  const org = store.organizations.find((o) => o.id === t?.organizationId);
  if (!org) throw notFound();
  return org;
}
