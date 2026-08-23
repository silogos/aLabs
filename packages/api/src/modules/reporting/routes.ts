/** Reporting routes — dashboard aggregation, progress, activity, export. */
import { Hono } from "hono";
import { store } from "../../db/store";
import * as authRepo from "../../db/auth-repo";
import * as projectRepo from "../../db/project-repo";
import * as taskRepo from "../../db/task-repo";
import * as planningRepo from "../../db/planning-repo";
import { projectSchema } from "@pmin/core";
import { data } from "../../lib/responses";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const reporting = new Hono<{ Variables: Vars }>();
reporting.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

reporting.get("/reporting/dashboard", requirePermission("reporting:view"), async (c) => {
  const pid = pidOf(c);
  const pgProject = await projectRepo.getProject(pid);
  if (!pgProject) throw new Error("project disappeared from tenant context");
  const project = projectSchema.parse(pgProject);
  const topTasks = await taskRepo.listTasks(pid);
  const statuses = await taskRepo.listStatuses(pid);
  const byStatus = (name: string) => {
    const s = statuses.find((x) => x.name === name);
    return topTasks.filter((t) => s && t.statusId === s.id);
  };
  const iteration = (await planningRepo.listIterations(pid)).find((i) => i.status === "active") ?? null;
  const iterationTasks = iteration
    ? topTasks.filter((t) => t.iterationId === iteration.id)
    : topTasks;
  const active = topTasks.filter((t) => byStatus("Done").every((d) => d.id !== t.id)).length;
  const overdue = topTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && byStatus("Done").every((d) => d.id !== t.id),
  ).length;
  const doneThisIteration = iterationTasks.filter((t) =>
    byStatus("Done").some((d) => d.id === t.id),
  ).length;

  // workload (demo capacity = 12) — users come from Postgres (insertion order)
  const users = await authRepo.listUsers();
  const workload = users.map((u, i) => {
    const assigned = topTasks.filter((t) => t.assigneeId === u.id && byStatus("Done").every((d) => d.id !== t.id)).length;
    const colors = ["a", "b", "c", "d", "e", "f"];
    const idx = i % colors.length;
    return {
      userId: u.id,
      name: u.name,
      initials: u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
      color: colors[idx]!,
      assigned,
      capacity: 12,
    };
  });

  return data(c, {
    project,
    kpis: {
      active,
      inProgress: byStatus("In Progress").length,
      overdue,
      doneThisIteration,
      activeTrend: [55, 50, 53, 61, 58, 63, 60, 63],
      inProgressTrend: [13, 14, 16, 15, 19, 17, 20, 21],
      overdueTrend: [2, 3, 4, 3, 4, 3, 5, 4],
      doneTrend: [4, 9, 12, 17, 21, 26, 30, 34],
    },
    sprint: iteration
      ? {
          id: iteration.id,
          name: iteration.name,
          committedPoints: iteration.committedPoints,
          completedPoints: iteration.completedPoints,
          progress: iteration.progress,
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
        }
      : null,
    activity: store.activity
      .filter((a) => a.projectId === pid)
      .sort((a, b) => b.when.localeCompare(a.when))
      .slice(0, 8),
    workload,
  });
});

reporting.get("/reporting/progress", requirePermission("reporting:view"), async (c) => {
  const pid = pidOf(c);
  const rows = await taskRepo.listTasks(pid);
  const statuses = (await taskRepo.listStatuses(pid)).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    count: rows.filter((t) => t.statusId === s.id).length,
  }));
  return data(c, { statuses });
});

reporting.get("/reporting/activity", requirePermission("reporting:view"), (c) => {
  const pid = pidOf(c);
  return data(c, store.activity.filter((a) => a.projectId === pid).sort((a, b) => b.when.localeCompare(a.when)));
});

reporting.get("/reporting/export", requirePermission("reporting:export"), (c) =>
  data(c, { format: c.req.query("format") ?? "csv", url: null }),
);
