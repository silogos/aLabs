/** Reporting routes — dashboard aggregation, progress, activity, export.
 *  The dashboard computation lives in ./dashboard.ts. */
import { Hono } from "hono";
import * as projectRepo from "../../db/project-repo";
import * as taskRepo from "../../db/task-repo";
import * as activityRepo from "../../db/activity-repo";
import { projectSchema } from "@pmin/core";
import { data } from "../../lib/responses";
import { projectContext, projectIdOf } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import { buildDashboard } from "./dashboard";
import type { Vars } from "../../lib/ctx";

export const reporting = new Hono<{ Variables: Vars }>();
reporting.use("*", projectContext);

reporting.get("/reporting/dashboard", requirePermission("reporting:view"), async (c) => {
  const pid = projectIdOf(c);
  const pgProject = await projectRepo.getProject(pid);
  if (!pgProject) throw new Error("project disappeared from tenant context");
  return data(c, {
    project: projectSchema.parse(pgProject),
    ...(await buildDashboard(pid)),
    activity: await activityRepo.listActivity(pid, 8),
  });
});

reporting.get("/reporting/progress", requirePermission("reporting:view"), async (c) => {
  const pid = projectIdOf(c);
  const rows = await taskRepo.listTasks(pid);
  const statuses = (await taskRepo.listStatuses(pid)).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    count: rows.filter((t) => t.statusId === s.id).length,
  }));
  return data(c, { statuses });
});

reporting.get("/reporting/activity", requirePermission("reporting:view"), async (c) =>
  data(c, await activityRepo.listActivity(projectIdOf(c))),
);

reporting.get("/reporting/export", requirePermission("reporting:export"), (c) =>
  data(c, { format: c.req.query("format") ?? "csv", url: null }),
);
