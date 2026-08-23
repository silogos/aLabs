/** Planning repository — Postgres (Drizzle) for iterations and milestones.
 *  The sprint/milestone aggregates (committed/completed points, task counts,
 *  progress) are stored values seeded with the demo, matching the widgets. */
import { asc, eq } from "drizzle-orm";
import { db } from "./pg";
import { iterations, milestones } from "@pmin/core/db";
import { uuidv7, type Iteration, type Milestone } from "@pmin/core";

type IterationRow = typeof iterations.$inferSelect;
type MilestoneRow = typeof milestones.$inferSelect;

const toIteration = (r: IterationRow): Iteration => ({
  id: r.id,
  projectId: r.projectId,
  name: r.name,
  goal: r.goal,
  startDate: r.startDate,
  endDate: r.endDate,
  status: r.status,
  committedPoints: r.committedPoints,
  completedPoints: r.completedPoints,
  progress: r.progress,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

const toMilestone = (r: MilestoneRow): Milestone => ({
  id: r.id,
  projectId: r.projectId,
  name: r.name,
  description: r.description,
  dueDate: r.dueDate,
  status: r.status,
  totalTasks: r.totalTasks,
  doneTasks: r.doneTasks,
  progress: r.progress,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

/* ---------------- iterations ---------------- */

export async function listIterations(projectId: string): Promise<Iteration[]> {
  const rows = await db
    .select()
    .from(iterations)
    .where(eq(iterations.projectId, projectId))
    .orderBy(asc(iterations.startDate));
  return rows.map(toIteration);
}

export async function getIteration(id: string): Promise<Iteration | null> {
  const [row] = await db.select().from(iterations).where(eq(iterations.id, id)).limit(1);
  return row ? toIteration(row) : null;
}

export async function insertIteration(input: {
  projectId: string;
  name: string;
  goal?: string | null;
  startDate: string;
  endDate: string;
  status?: "planned" | "active" | "completed";
  committedPoints?: number;
  completedPoints?: number;
  progress?: number;
}): Promise<Iteration> {
  const now = new Date();
  const [row] = await db
    .insert(iterations)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      name: input.name,
      goal: input.goal ?? null,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status ?? "planned",
      committedPoints: input.committedPoints ?? 0,
      completedPoints: input.completedPoints ?? 0,
      progress: input.progress ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toIteration(row!);
}

export async function patchIteration(
  id: string,
  patch: {
    name?: string;
    goal?: string | null;
    startDate?: string;
    endDate?: string;
    status?: "planned" | "active" | "completed";
    committedPoints?: number;
    completedPoints?: number;
    progress?: number;
  },
): Promise<Iteration | null> {
  const [row] = await db
    .update(iterations)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(iterations.id, id))
    .returning();
  return row ? toIteration(row) : null;
}

/* ---------------- milestones ---------------- */

export async function listMilestones(projectId: string): Promise<Milestone[]> {
  const rows = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.createdAt));
  return rows.map(toMilestone);
}

export async function getMilestone(id: string): Promise<Milestone | null> {
  const [row] = await db.select().from(milestones).where(eq(milestones.id, id)).limit(1);
  return row ? toMilestone(row) : null;
}

export async function insertMilestone(input: {
  projectId: string;
  name: string;
  description?: string | null;
  dueDate?: string | null;
  status?: "planned" | "reached";
  totalTasks?: number;
  doneTasks?: number;
  progress?: number;
}): Promise<Milestone> {
  const now = new Date();
  const [row] = await db
    .insert(milestones)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      name: input.name,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      status: input.status ?? "planned",
      totalTasks: input.totalTasks ?? 0,
      doneTasks: input.doneTasks ?? 0,
      progress: input.progress ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toMilestone(row!);
}

export async function patchMilestone(
  id: string,
  patch: {
    name?: string;
    description?: string | null;
    dueDate?: string | null;
    status?: "planned" | "reached";
  },
): Promise<Milestone | null> {
  const [row] = await db
    .update(milestones)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(milestones.id, id))
    .returning();
  return row ? toMilestone(row) : null;
}
