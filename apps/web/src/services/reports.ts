/** Reports service — dashboard KPIs, status progress, activity feed. */
import type { Dashboard } from "@pmin/core";
import { req } from "@/lib/http";

export const reportsService = {
  dashboard: (pid: string) =>
    req<{ data: Dashboard }>(`/projects/${pid}/reporting/dashboard`).then((x) => x.data),

  progress: (pid: string) =>
    req<{ data: { statuses: { id: string; name: string; color: string; count: number }[] } }>(
      `/projects/${pid}/reporting/progress`,
    ).then((x) => x.data.statuses),

  activity: (pid: string) =>
    req<{ data: Dashboard["activity"] }>(`/projects/${pid}/reporting/activity`).then((x) => x.data),
};
