/** Activity feed repository — Postgres (Drizzle). Seeded demo events today;
 *  modules write here as they gain audit trails. */
import { desc, eq } from "drizzle-orm";
import { db } from "./pg";
import { activity } from "@pmin/core/db";
import { uuidv7 } from "@pmin/core";

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
