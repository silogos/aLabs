/** Reporting schemas — the dashboard aggregate returned by
 *  GET /projects/:id/reporting/dashboard. */
import { z } from "zod";
import { id, iso } from "./common";
import { projectSchema } from "./project";

export const dashboardSchema = z.object({
  project: projectSchema,
  kpis: z.object({
    active: z.number().int(),
    inProgress: z.number().int(),
    overdue: z.number().int(),
    doneThisIteration: z.number().int(),
    activeTrend: z.array(z.number()),
    inProgressTrend: z.array(z.number()),
    overdueTrend: z.array(z.number()),
    doneTrend: z.array(z.number()),
  }),
  sprint: z
    .object({
      id: id.nullable(),
      name: z.string().nullable(),
      committedPoints: z.number().int(),
      completedPoints: z.number().int(),
      progress: z.number(),
      burndown: z.array(z.object({ day: z.number(), remaining: z.number() })),
    })
    .nullable(),
  activity: z.array(
    z.object({
      id: id,
      kind: z.enum(["move", "doc", "com", "done", "mile"]),
      projectId: id.optional(),
      actorId: id,
      target: z.string(),
      when: iso,
      whenLabel: z.string(),
    }),
  ),
  workload: z.array(
    z.object({
      userId: id,
      name: z.string(),
      initials: z.string(),
      color: z.string(),
      assigned: z.number().int(),
      capacity: z.number().int(),
    }),
  ),
});
export type Dashboard = z.infer<typeof dashboardSchema>;
