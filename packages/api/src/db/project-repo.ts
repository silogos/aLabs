/** Project repository — Postgres (Drizzle) implementation for projects,
 *  project memberships, and the per-user visit history. Domain shapes stay
 *  zod-inferred: ProjectMember embeds its Role and User (hydrated via
 *  joins); visits power the recents + landing-project rule. */
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "./pg";
import { projects, projectMembers, projectVisits, roles } from "@pmin/core/db";
import { uuidv7, type Project, type ProjectMember, type Role, type User } from "@pmin/core";
import { toRole } from "./org-repo";
import { getUsersByIds } from "./auth-repo";

type ProjectRow = typeof projects.$inferSelect;
type MemberRow = typeof projectMembers.$inferSelect;
type RoleRow = typeof roles.$inferSelect;

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export type ProjectWithMeta = Project & { deletedAt: string | null };

const toProject = (r: ProjectRow): ProjectWithMeta => ({
  id: r.id,
  organizationId: r.organizationId,
  name: r.name,
  slug: r.slug,
  key: r.key,
  description: r.description,
  icon: r.icon,
  status: r.status,
  visibility: r.visibility,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

const toMember = (m: MemberRow, role: RoleRow, user?: User): ProjectMember => ({
  id: m.id,
  projectId: m.projectId,
  userId: m.userId,
  role: toRole(role),
  status: m.status,
  joinedAt: iso(m.joinedAt),
  user: user!,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

/* ---------------- projects ---------------- */

export async function getProject(id: string): Promise<ProjectWithMeta | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .limit(1);
  return row ? toProject(row) : null;
}

export async function listOrgProjects(organizationId: string): Promise<ProjectWithMeta[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.organizationId, organizationId), isNull(projects.deletedAt)))
    .orderBy(projects.createdAt);
  return rows.map(toProject);
}

export async function listAllProjects(): Promise<ProjectWithMeta[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(projects.createdAt);
  return rows.map(toProject);
}

export async function slugTakenInOrg(organizationId: string, slug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.organizationId, organizationId), eq(projects.slug, slug)))
    .limit(1);
  return !!row;
}

export async function keyTakenInOrg(organizationId: string, key: string): Promise<boolean> {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.organizationId, organizationId), eq(projects.key, key)))
    .limit(1);
  return !!row;
}

/** Non-archived, non-deleted count — the personal-workspace cap basis. */
export async function countActiveProjects(organizationId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(projects)
    .where(
      and(
        eq(projects.organizationId, organizationId),
        isNull(projects.deletedAt),
        ne(projects.status, "archived"),
      ),
    );
  return row?.n ?? 0;
}

export async function insertProject(input: {
  organizationId: string;
  name: string;
  slug: string;
  key: string;
  description?: string | null;
  icon?: string | null;
}): Promise<ProjectWithMeta> {
  const now = new Date();
  const [row] = await db
    .insert(projects)
    .values({
      id: uuidv7(),
      organizationId: input.organizationId,
      name: input.name,
      slug: input.slug,
      key: input.key,
      description: input.description ?? null,
      icon: input.icon ?? null,
      status: "active",
      visibility: "organization",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toProject(row!);
}

export async function updateProject(
  id: string,
  patch: { name?: string; description?: string | null; icon?: string | null; status?: "active" | "on_hold" | "archived" },
): Promise<ProjectWithMeta> {
  const [row] = await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return toProject(row!);
}

export async function softDeleteProject(id: string): Promise<void> {
  await db
    .update(projects)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(projects.id, id));
}

/* ---------------- project members ---------------- */

/** Active project membership with role — the tenant-context hot path. */
export async function getActiveProjectMember(
  projectId: string,
  userId: string,
): Promise<{ id: string; role: { name: string; permissions: string[] } } | null> {
  const [row] = await db
    .select({ member: projectMembers, role: roles })
    .from(projectMembers)
    .innerJoin(roles, eq(roles.id, projectMembers.roleId))
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
        eq(projectMembers.status, "active"),
      ),
    )
    .limit(1);
  if (!row) return null;
  return { id: row.member.id, role: { name: row.role.name, permissions: row.role.permissions ?? [] } };
}

export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const rows = await db
    .select({ member: projectMembers, role: roles })
    .from(projectMembers)
    .innerJoin(roles, eq(roles.id, projectMembers.roleId))
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(projectMembers.createdAt);
  const users = await getUsersByIds(rows.map((r) => r.member.userId));
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => toMember(r.member, r.role, byId.get(r.member.userId)));
}

export async function getProjectMemberRow(
  projectId: string,
  memberId: string,
): Promise<ProjectMember | null> {
  const [row] = await db
    .select({ member: projectMembers, role: roles })
    .from(projectMembers)
    .innerJoin(roles, eq(roles.id, projectMembers.roleId))
    .where(and(eq(projectMembers.id, memberId), eq(projectMembers.projectId, projectId)))
    .limit(1);
  if (!row) return null;
  const [user] = await getUsersByIds([row.member.userId]);
  return toMember(row.member, row.role, user);
}

export async function hasProjectMember(projectId: string, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: projectMembers.id })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);
  return !!row;
}

export async function insertProjectMember(input: {
  projectId: string;
  userId: string;
  roleId: string;
  status?: "active" | "pending" | "suspended";
}): Promise<void> {
  const now = new Date();
  await db.insert(projectMembers).values({
    id: uuidv7(),
    projectId: input.projectId,
    userId: input.userId,
    roleId: input.roleId,
    status: input.status ?? "active",
    joinedAt: input.status === "pending" ? null : now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateProjectMember(
  memberId: string,
  patch: { roleId?: string; status?: "active" },
): Promise<void> {
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.roleId) set.roleId = patch.roleId;
  if (patch.status === "active") {
    set.status = "active";
    set.joinedAt = new Date(); // accept: pending → joined
  }
  await db.update(projectMembers).set(set).where(eq(projectMembers.id, memberId));
}

export async function deleteProjectMember(memberId: string): Promise<void> {
  await db.delete(projectMembers).where(eq(projectMembers.id, memberId));
}

/* ---------------- visit history (recents) ---------------- */

/** Server-side history cap per user (same as the old in-memory prune). */
export const HISTORY_CAP = 5;

export async function listRecentVisits(
  userId: string,
  limit: number,
): Promise<{ project: ProjectWithMeta; visitedAt: string }[]> {
  const rows = await db
    .select({ visit: projectVisits, project: projects })
    .from(projectVisits)
    .innerJoin(projects, eq(projects.id, projectVisits.projectId))
    .where(and(eq(projectVisits.userId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projectVisits.visitedAt))
    .limit(limit);
  return rows.map((r) => ({
    project: toProject(r.project),
    visitedAt: r.visit.visitedAt.toISOString(),
  }));
}

/** Upsert the visit stamp (composite PK) and prune beyond the cap. */
export async function touchVisit(userId: string, projectId: string): Promise<void> {
  const now = new Date();
  await db
    .insert(projectVisits)
    .values({ userId, projectId, visitedAt: now })
    .onConflictDoUpdate({
      target: [projectVisits.userId, projectVisits.projectId],
      set: { visitedAt: now },
    });
  // keep only the newest HISTORY_CAP rows for this user
  await db.execute(sql`
    delete from project_visits v
    where v.user_id = ${userId}
      and v.visited_at < (
        select min(visited_at) from (
          select visited_at from project_visits
          where user_id = ${userId}
          order by visited_at desc
          limit ${HISTORY_CAP}
        ) recent
      )
  `);
}
