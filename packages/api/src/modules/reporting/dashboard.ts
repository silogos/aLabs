/** Dashboard aggregation for GET /projects/:id/reporting/dashboard.
 *  KPIs + workload are computed from live rows; the trend arrays and sprint
 *  burndown are demo constants from the design prototype until history
 *  accrues (follow-up: derive them from real data). */
import * as authRepo from "../../db/auth-repo";
import * as taskRepo from "../../db/task-repo";
import * as planningRepo from "../../db/planning-repo";
import type { Dashboard } from "@pmin/core";
import type { TaskWithMeta } from "../../db/task-repo";
import type { Iteration } from "@pmin/core";

const WORKLOAD_COLORS = ["a", "b", "c", "d", "e", "f"];
const DEMO_CAPACITY = 12;

export async function buildDashboard(pid: string): Promise<Omit<Dashboard, "project" | "activity">> {
  const topTasks = await taskRepo.listTasks(pid);
  const statuses = await taskRepo.listStatuses(pid);
  const doneIds = new Set(
    statuses.filter((s) => s.name === "Done").flatMap((s) => topTasks.filter((t) => t.statusId === s.id).map((t) => t.id)),
  );
  const inProgress = statuses.find((s) => s.name === "In Progress");
  const isNotDone = (t: TaskWithMeta) => !doneIds.has(t.id);

  const iteration = (await planningRepo.listIterations(pid)).find((i) => i.status === "active") ?? null;
  const iterationTasks = iteration ? topTasks.filter((t) => t.iterationId === iteration.id) : topTasks;
  const active = topTasks.filter(isNotDone).length;
  const overdue = topTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && isNotDone(t)).length;
  const doneThisIteration = iterationTasks.filter((t) => doneIds.has(t.id)).length;

  // workload (demo capacity) — users come from Postgres (insertion order)
  const users = await authRepo.listUsers();
  const workload = users.map((u, i) => ({
    userId: u.id,
    name: u.name,
    initials: u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    color: WORKLOAD_COLORS[i % WORKLOAD_COLORS.length]!,
    assigned: topTasks.filter((t) => t.assigneeId === u.id && isNotDone(t)).length,
    capacity: DEMO_CAPACITY,
  }));

  return {
    kpis: {
      active,
      inProgress: inProgress ? topTasks.filter((t) => t.statusId === inProgress.id).length : 0,
      overdue,
      doneThisIteration,
      // demo trend data — see file header
      activeTrend: [55, 50, 53, 61, 58, 63, 60, 63],
      inProgressTrend: [13, 14, 16, 15, 19, 17, 20, 21],
      overdueTrend: [2, 3, 4, 3, 4, 3, 5, 4],
      doneTrend: [4, 9, 12, 17, 21, 26, 30, 34],
    },
    sprint: iteration ? { ...sprintSummary(iteration) } : null,
    workload,
  };
}

function sprintSummary(iteration: Iteration) {
  return {
    id: iteration.id,
    name: iteration.name,
    committedPoints: iteration.committedPoints,
    completedPoints: iteration.completedPoints,
    progress: iteration.progress,
    // demo burndown — see file header
    burndown: [
      { day: 1, remaining: 52 },
      { day: 2, remaining: 50 },
      { day: 3, remaining: 45 },
      { day: 4, remaining: 47 },
      { day: 5, remaining: 40 },
      { day: 6, remaining: 41 },
      { day: 7, remaining: 33 },
      { day: 8, remaining: 34 },
      { day: 9, remaining: 28 },
      { day: 10, remaining: 27 },
    ],
  };
}
