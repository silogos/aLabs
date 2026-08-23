/** Workspace repository — Postgres (Drizzle) implementation for organizations,
 *  roles, organization members, and invitations. Domain shapes stay
 *  zod-inferred from @pmin/core: Members embed their Role and User,
 *  Invitations expose roleName — both hydrated via joins here. */
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./pg";
import { organizations, roles, organizationMembers, invitations } from "@pmin/core/db";
import { uuidv7, type Organization, type Role, type Member, type Invitation, type User } from "@pmin/core";
import { getUserByEmail, getUsersByIds } from "./auth-repo";

type OrgRow = typeof organizations.$inferSelect;
type RoleRow = typeof roles.$inferSelect;
type MemberRow = typeof organizationMembers.$inferSelect;

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

const toOrg = (r: OrgRow): Organization & { deletedAt: string | null } => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  type: r.type,
  logo: r.logo,
  description: r.description,
  timezone: r.timezone,
  language: r.language,
  website: r.website,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

export const toRole = (r: RoleRow): Role => ({
  id: r.id,
  organizationId: r.organizationId,
  scope: r.scope,
  name: r.name,
  isSystem: r.isSystem,
  permissions: r.permissions ?? [],
});

/** Hydrate member rows with their role (and optionally user) in one pass. */
const toMember = (m: MemberRow, role: RoleRow, user?: User): Member => ({
  id: m.id,
  organizationId: m.organizationId,
  userId: m.userId,
  role: toRole(role),
  status: m.status,
  joinedAt: iso(m.joinedAt),
  user: user!,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

/* ---------------- roles ---------------- */

export async function findRoleByName(
  scope: "workspace" | "project",
  name: string,
): Promise<Role | null> {
  const [row] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.scope, scope), eq(roles.name, name), isNull(roles.organizationId)))
    .limit(1);
  return row ? toRole(row) : null;
}

export async function listRoles(): Promise<Role[]> {
  const rows = await db.select().from(roles).orderBy(asc(roles.scope), asc(roles.id));
  return rows.map(toRole);
}

/** Insert a system role unless it exists. Existence check (not a unique
 *  constraint — this drizzle-orm can't express NULLS NOT DISTINCT) is safe
 *  because boot is serialized by the advisory lock. */
export async function insertRoleIfAbsent(role: Omit<Role, "id">): Promise<void> {
  const existing = await findRoleByName(role.scope, role.name);
  if (existing) return;
  await db.insert(roles).values({
    id: uuidv7(),
    organizationId: role.organizationId,
    scope: role.scope,
    name: role.name,
    isSystem: role.isSystem,
    permissions: role.permissions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/* ---------------- organizations ---------------- */

export async function getOrganization(id: string): Promise<Organization | null> {
  const [row] = await db
    .select()
    .from(organizations)
    .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)))
    .limit(1);
  return row ? toOrg(row) : null;
}

/** All non-deleted orgs — used by the in-memory seed for id references. */
export async function listOrganizations(): Promise<Organization[]> {
  const rows = await db
    .select()
    .from(organizations)
    .where(isNull(organizations.deletedAt))
    .orderBy(asc(organizations.createdAt), asc(organizations.id));
  return rows.map(toOrg);
}

/** Orgs where the user holds an active membership (tenant list for switchers). */
export async function listOrganizationsForUser(userId: string): Promise<Organization[]> {
  const rows = await db
    .select({ org: organizations })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "active"),
        isNull(organizations.deletedAt),
      ),
    )
    .orderBy(asc(organizations.createdAt), asc(organizations.id));
  return rows.map((r) => toOrg(r.org));
}

export async function slugTaken(slug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  return !!row;
}

export async function insertOrganization(input: {
  name: string;
  slug: string;
  type: "team" | "personal";
  description?: string | null;
  website?: string | null;
}): Promise<Organization> {
  const now = new Date();
  const [row] = await db
    .insert(organizations)
    .values({
      id: uuidv7(),
      name: input.name,
      slug: input.slug,
      type: input.type,
      logo: null,
      description: input.description ?? null,
      timezone: "UTC",
      language: "en",
      website: input.website ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toOrg(row!);
}

export async function updateOrganization(
  id: string,
  patch: { name?: string; description?: string | null; website?: string | null; timezone?: string; language?: string },
): Promise<Organization> {
  const [row] = await db
    .update(organizations)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();
  return toOrg(row!);
}

export async function softDeleteOrganization(id: string): Promise<void> {
  await db
    .update(organizations)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(organizations.id, id));
}

/* ---------------- members ---------------- */

/** Active membership with role — the tenant-context hot path. */
export async function getActiveMember(
  orgId: string,
  userId: string,
): Promise<{ id: string; role: Role } | null> {
  const [row] = await db
    .select({ member: organizationMembers, role: roles })
    .from(organizationMembers)
    .innerJoin(roles, eq(roles.id, organizationMembers.roleId))
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "active"),
      ),
    )
    .limit(1);
  return row ? { id: row.member.id, role: toRole(row.role) } : null;
}

export async function listOrgMembers(orgId: string): Promise<Member[]> {
  const rows = await db
    .select({ member: organizationMembers, role: roles })
    .from(organizationMembers)
    .innerJoin(roles, eq(roles.id, organizationMembers.roleId))
    .where(eq(organizationMembers.organizationId, orgId))
    .orderBy(asc(organizationMembers.createdAt));
  const users = await getUsersByIds(rows.map((r) => r.member.userId));
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => toMember(r.member, r.role, byId.get(r.member.userId)));
}

export async function getOrgMember(orgId: string, memberId: string): Promise<Member | null> {
  const [row] = await db
    .select({ member: organizationMembers, role: roles })
    .from(organizationMembers)
    .innerJoin(roles, eq(roles.id, organizationMembers.roleId))
    .where(
      and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)),
    )
    .limit(1);
  if (!row) return null;
  const [user] = await getUsersByIds([row.member.userId]);
  return toMember(row.member, row.role, user);
}

export async function insertMember(input: {
  organizationId: string;
  userId: string;
  roleId: string;
  status?: "active" | "pending" | "suspended";
}): Promise<void> {
  const now = new Date();
  await db.insert(organizationMembers).values({
    id: uuidv7(),
    organizationId: input.organizationId,
    userId: input.userId,
    roleId: input.roleId,
    status: input.status ?? "active",
    joinedAt: input.status === undefined || input.status === "active" ? now : null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateMemberRole(memberId: string, roleId: string): Promise<void> {
  await db
    .update(organizationMembers)
    .set({ roleId, updatedAt: new Date() })
    .where(eq(organizationMembers.id, memberId));
}

export async function deleteMember(memberId: string): Promise<void> {
  await db.delete(organizationMembers).where(eq(organizationMembers.id, memberId));
}

/** Count of active Owner-role members — the demote/remove guard. */
export async function countActiveOwners(orgId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(organizationMembers)
    .innerJoin(roles, eq(roles.id, organizationMembers.roleId))
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.status, "active"),
        eq(roles.name, "Owner"),
        eq(roles.scope, "workspace"),
      ),
    );
  return row?.n ?? 0;
}

/** Active member whose user has this email (duplicate-invite checks). */
export async function getActiveMemberByEmail(
  orgId: string,
  email: string,
): Promise<Member | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const [row] = await db
    .select({ member: organizationMembers, role: roles })
    .from(organizationMembers)
    .innerJoin(roles, eq(roles.id, organizationMembers.roleId))
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.status, "active"),
      ),
    )
    .limit(1);
  return row ? toMember(row.member, row.role, user) : null;
}

/* ---------------- invitations ---------------- */

type InvitationRow = typeof invitations.$inferSelect;

const toInvitation = (r: InvitationRow, roleName: string): Invitation => ({
  id: r.id,
  organizationId: r.organizationId,
  email: r.email,
  status: r.status,
  roleName,
  expiresAt: r.expiresAt.toISOString(),
  createdAt: r.createdAt.toISOString(),
});

export async function listOrgInvitations(orgId: string): Promise<Invitation[]> {
  const rows = await db
    .select({ invitation: invitations, role: roles })
    .from(invitations)
    .innerJoin(roles, eq(roles.id, invitations.roleId))
    .where(eq(invitations.organizationId, orgId))
    .orderBy(asc(invitations.createdAt));
  return rows.map((r) => toInvitation(r.invitation, r.role.name));
}

export async function getOrgInvitation(
  orgId: string,
  invitationId: string,
): Promise<Invitation | null> {
  const [row] = await db
    .select({ invitation: invitations, role: roles })
    .from(invitations)
    .innerJoin(roles, eq(roles.id, invitations.roleId))
    .where(and(eq(invitations.id, invitationId), eq(invitations.organizationId, orgId)))
    .limit(1);
  return row ? toInvitation(row.invitation, row.role.name) : null;
}

export async function hasPendingInvitation(orgId: string, email: string): Promise<boolean> {
  const [row] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.organizationId, orgId),
        eq(invitations.email, email.toLowerCase()),
        eq(invitations.status, "pending"),
      ),
    )
    .limit(1);
  return !!row;
}

export async function insertInvitation(input: {
  organizationId: string;
  email: string;
  roleId: string;
  expiresAt: Date;
  /** Opaque token (email delivery is deferred; kept NOT NULL for that future). */
  token: string;
}): Promise<void> {
  const now = new Date();
  await db.insert(invitations).values({
    id: uuidv7(),
    organizationId: input.organizationId,
    email: input.email.toLowerCase(),
    roleId: input.roleId,
    token: input.token,
    expiresAt: input.expiresAt,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateInvitationStatus(
  invitationId: string,
  status: Invitation["status"],
): Promise<void> {
  await db
    .update(invitations)
    .set({ status, updatedAt: new Date() })
    .where(eq(invitations.id, invitationId));
}
