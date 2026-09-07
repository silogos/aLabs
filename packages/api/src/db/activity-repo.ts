/** Activity feed repository — Postgres (Drizzle). Seeded demo events today;
 *  modules write here as they gain audit trails. */
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "./pg";
import { activity, projects } from "@pmin/core/db";
import { uuidv7 } from "@pmin/core";
import { userMap } from "./mapping";

export interface ActivityEntry {
  id: string;
  kind: "move" | "doc" | "com" | "done" | "mile";
  projectId: string;
  actorId: string;
  target: string;
  when: string;
  whenLabel: string;
}

export async function insertActivity(input: {
  projectId: string;
  kind: ActivityEntry["kind"];
  actorId: string;
  target: string;
  occurredAt?: Date;
  whenLabel: string;
}): Promise<void> {
  await db.insert(activity).values({
    id: uuidv7(),
    projectId: input.projectId,
    kind: input.kind,
    actorId: input.actorId,
    target: input.target,
    occurredAt: input.occurredAt ?? new Date(),
    whenLabel: input.whenLabel,
  });
}

export async function listActivity(projectId: string, limit?: number): Promise<ActivityEntry[]> {
  const rows = await db
    .select()
    .from(activity)
    .where(eq(activity.projectId, projectId))
    .orderBy(desc(activity.occurredAt))
    .limit(limit ?? 1000);
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as ActivityEntry["kind"],
    projectId: r.projectId,
    actorId: r.actorId,
    target: r.target,
    when: r.occurredAt.toISOString(),
    whenLabel: r.whenLabel,
  }));
}

/** Org-wide feed: activity across every live project in the organization,
 *  hydrated with actor name and project name/key for the org dashboard. */
export interface OrgActivityEntry extends ActivityEntry {
  actorName: string | null;
  projectName: string;
  projectKey: string;
}

export async function listOrgActivity(
  orgId: string,
  limit?: number,
): Promise<OrgActivityEntry[]> {
  const rows = await db
    .select({ a: activity, p: projects })
    .from(activity)
    .innerJoin(projects, eq(projects.id, activity.projectId))
    .where(and(eq(projects.organizationId, orgId), isNull(projects.deletedAt)))
    .orderBy(desc(activity.occurredAt))
    .limit(limit ?? 100);
  const byId = await userMap(rows.map((r) => r.a.actorId));
  return rows.map((r) => ({
    id: r.a.id,
    kind: r.a.kind as ActivityEntry["kind"],
    projectId: r.a.projectId,
    actorId: r.a.actorId,
    actorName: byId.get(r.a.actorId)?.name ?? null,
    target: r.a.target,
    when: r.a.occurredAt.toISOString(),
    whenLabel: r.a.whenLabel,
    projectName: r.p.name,
    projectKey: r.p.key,
  }));
}
