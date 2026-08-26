/** Dashboard aggregation for GET /projects/:id/reporting/dashboard.
 *  KPIs + workload are computed from live rows; the KPI trend series and the
 *  sprint burndown are reconstructed from `task_status_events` — one event
 *  per status transition plus a synthetic initial event per task, so each
 *  task's status at any past point in time can be derived. Workload capacity
 *  stays a demo constant until per-user capacity is modeled. */
import * as authRepo from "../../db/auth-repo";
import * as taskRepo from "../../db/task-repo";
import * as planningRepo from "../../db/planning-repo";
import type { Dashboard } from "@pmin/core";
import type { Iteration } from "@pmin/core";
import type { TaskWithMeta } from "../../db/task-repo";

const WORKLOAD_COLORS = ["a", "b", "c", "d", "e", "f"];
const DEMO_CAPACITY =12;
const TREND_WEEKS =8;
const DAY_MS =86_400_000;

type TimelineRow = {
  id: string;
  statusId: string;
  createdAt: Date;
  deletedAt: Date | null;
  dueDate: Date | null;
  estimate: number | null;
  iterationId: string | null;
};
type EventsByTask = Map<string, { to: string; at: Date }[]>;

export async function buildDashboard(
  pid: string,
): Promise<Omit<Dashboard, "project" | "activity">> {
  const topTasks = await taskRepo.listTasks(pid);
  const statuses = await taskRepo.listStatuses(pid);
  const doneStatusId = statuses.find((s) => s.name === "Done")?.id ?? null;
  const inProgressStatusId = statuses.find((s) => s.name === "In Progress")?.id ?? null;
  const isDone = (t: TaskWithMeta) => doneStatusId !== null && t.statusId === doneStatusId;
  const isNotDone = (t: TaskWithMeta) => !isDone(t);

  const iteration = (await planningRepo.listIterations(pid)).find((i) => i.status === "active") ?? null;
  const iterationTasks = iteration ? topTasks.filter((t) => t.iterationId === iteration.id) : topTasks;
  const active = topTasks.filter(isNotDone).length;
  const overdue = topTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && isNotDone(t)).length;
  const doneThisIteration = iterationTasks.filter(isDone).length;

  const users = await authRepo.listUsers();
  const workload = users.map((u, i) => ({
    userId: u.id,
    name: u.name,
    initials: u.name.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase(),
    color: WORKLOAD_COLORS[i % WORKLOAD_COLORS.length]!,
    assigned: topTasks.filter((t) => t.assigneeId === u.id && isNotDone(t)).length,
    capacity: DEMO_CAPACITY,
  }));

  const timeline = await taskRepo.listProjectTaskTimeline(pid);
  const eventsByTask = groupEvents(await taskRepo.listTaskStatusEvents(pid));

  return {
    kpis: {
      active,
      inProgress: inProgressStatusId ? topTasks.filter((t) => t.statusId === inProgressStatusId).length :0,
      overdue,
      doneThisIteration,
      ...buildTrends(timeline, eventsByTask, doneStatusId, inProgressStatusId),
    },
    sprint: iteration ? buildSprint(iteration, timeline, eventsByTask, doneStatusId) : null,
    workload,
  };
}

function groupEvents(events: { taskId: string; toStatus: string; occurredAt: Date }[]): EventsByTask {
  const m: EventsByTask = new Map();
  for (const e of events) {
    let arr = m.get(e.taskId);
    if (!arr) {
      arr = [];
      m.set(e.taskId, arr);
    }
    arr.push({ to: e.toStatus, at: e.occurredAt });
  }
  return m;
}

/** Status of a task at epoch-ms `t`, or undefined if it had no event by then. */
function statusAt(taskId: string, t: number, eventsByTask: EventsByTask): string | undefined {
  const arr = eventsByTask.get(taskId);
  if (!arr || arr.length ===0) return undefined;
  let lo =0;
  let hi = arr.length -1;
  let res = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >>1;
    if (arr[mid]!.at.getTime() <= t) {
      res = mid;
      lo = mid +1;
    } else {
      hi = mid -1;
    }
  }
  return res < 0 ? undefined : arr[res]!.to;
}

/** Eight weekly status snapshots, oldest → newest. */
function buildTrends(
  timeline: TimelineRow[],
  eventsByTask: EventsByTask,
  doneStatusId: string | null,
  inProgressStatusId: string | null,
): Pick<Dashboard["kpis"], "activeTrend" | "inProgressTrend" | "overdueTrend" | "doneTrend"> {
  const now = Date.now();
  const activeTrend: number[] = [];
  const inProgressTrend: number[] = [];
  const overdueTrend: number[] = [];
  const doneTrend: number[] = [];
  for (let i = TREND_WEEKS -1; i >=0; i--) {
    const t = now - i *7 * DAY_MS;
    let active =0;
    let inProgress =0;
    let overdue =0;
    let done =0;
    for (const task of timeline) {
      if (task.createdAt.getTime() > t) continue;
      if (task.deletedAt && task.deletedAt.getTime() <= t) continue;
      const st = statusAt(task.id, t, eventsByTask);
      if (st === undefined) continue;
      if (doneStatusId && st === doneStatusId) {
        done++;
        continue;
      }
      active++;
      if (inProgressStatusId && st === inProgressStatusId) inProgress++;
      if (task.dueDate && task.dueDate.getTime() < t) overdue++;
    }
    activeTrend.push(active);
    inProgressTrend.push(inProgress);
    overdueTrend.push(overdue);
    doneTrend.push(done);
  }
  return { activeTrend, inProgressTrend, overdueTrend, doneTrend };
}

/** Active-iteration burndown + computed committed/completed/progress. Points
 *  when estimates exist, else task counts (so the chart isn't flat-zero for
 *  unestimated sprints). Emits ≥2 points — the FE divides by length-1. */
function buildSprint(
  iteration: Iteration,
  timeline: TimelineRow[],
  eventsByTask: EventsByTask,
  doneStatusId: string | null,
): NonNullable<Dashboard["sprint"]> {
  const iterTasks = timeline.filter((t) => t.iterationId === iteration.id && !t.deletedAt);
  const totalPoints = iterTasks.reduce((n, t) => n + (t.estimate ??0),0);
  const pointsMode = totalPoints >0;
  const weight = (t: TimelineRow) => (pointsMode ? t.estimate ??0 :1);
  const total = pointsMode ? totalPoints : iterTasks.length;

  const completedAt = (tMs: number) =>
    iterTasks.reduce((n, t) => {
      const st = statusAt(t.id, tMs, eventsByTask);
      return doneStatusId && st === doneStatusId ? n + weight(t) : n;
    },0);

  const now = Date.now();
  const startMs = new Date(iteration.startDate).getTime();
  const daysElapsed = Math.floor((now - startMs) / DAY_MS);
  const D = Math.max(1, Math.min(daysElapsed,14));

  const burndown: { day: number; remaining: number }[] = [];
  for (let d =1; d <= D; d++) {
    burndown.push({ day: d, remaining: total - completedAt(startMs + d * DAY_MS) });
  }
  while (burndown.length < 2) {
    const last = burndown.at(-1);
    burndown.push({ day: (last?.day ??0) +1, remaining: last?.remaining ?? total - completedAt(now) });
  }

  const completedPoints = completedAt(now);
  return {
    id: iteration.id,
    name: iteration.name,
    committedPoints: total,
    completedPoints,
    progress: total >0 ? Math.round((completedPoints / total) *100) :0,
    burndown,
  };
}
