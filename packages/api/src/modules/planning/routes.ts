/** Planning routes — iterations, milestones, timeline.
 *  Rows live in Postgres (db/planning-repo.ts). */
import { Hono } from "hono";
import * as planningRepo from "../../db/planning-repo";
import { iterationCreate, iterationUpdate, milestoneCreate, milestoneUpdate } from "@pmin/core";
import { ITERATION_TRANSITIONS, MILESTONE_TRANSITIONS, canTransition } from "@pmin/core";
import { conflict, notFound } from "../../lib/errors";
import { created, data } from "../../lib/responses";
import { parseBody } from "../../lib/validate";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const planning = new Hono<{ Variables: Vars }>();
planning.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

// ---- iterations ----
planning.get("/planning/iterations", requirePermission("planning:view"), async (c) =>
  data(c, await planningRepo.listIterations(pidOf(c))),
);
planning.post("/planning/iterations", requirePermission("planning:manage"), async (c) => {
  const input = parseBody(await c.req.json(), iterationCreate);
  const it = await planningRepo.insertIteration({
    projectId: pidOf(c),
    name: input.name,
    goal: input.goal ?? null,
    startDate: input.startDate,
    endDate: input.endDate,
  });
  return created(c, it);
});
planning.patch("/planning/iterations/:id", requirePermission("planning:manage"), async (c) => {
  const it = await planningRepo.getIteration(c.req.param("id"));
  if (!it || it.projectId !== pidOf(c)) throw notFound();
  const input = parseBody(await c.req.json(), iterationUpdate);
  if (input.status && input.status !== it.status) {
    if (!canTransition(ITERATION_TRANSITIONS, it.status, input.status))
      throw conflict(`Cannot transition iteration from ${it.status} to ${input.status}`);
  }
  const updated = await planningRepo.patchIteration(it.id, input);
  return data(c, updated!);
});

// ---- milestones ----
planning.get("/planning/milestones", requirePermission("planning:view"), async (c) =>
  data(c, await planningRepo.listMilestones(pidOf(c))),
);
planning.post("/planning/milestones", requirePermission("planning:manage"), async (c) => {
  const input = parseBody(await c.req.json(), milestoneCreate);
  const m = await planningRepo.insertMilestone({
    projectId: pidOf(c),
    name: input.name,
    description: input.description ?? null,
    dueDate: input.dueDate ?? null,
  });
  return created(c, m);
});
planning.patch("/planning/milestones/:id", requirePermission("planning:manage"), async (c) => {
  const m = await planningRepo.getMilestone(c.req.param("id"));
  if (!m || m.projectId !== pidOf(c)) throw notFound();
  const input = parseBody(await c.req.json(), milestoneUpdate);
  if (input.status && input.status !== m.status) {
    if (!canTransition(MILESTONE_TRANSITIONS, m.status, input.status))
      throw conflict(`Cannot transition milestone from ${m.status} to ${input.status}`);
  }
  const updated = await planningRepo.patchMilestone(m.id, input);
  return data(c, updated!);
});

// ---- timeline (gantt) ----
planning.get("/planning/timeline", requirePermission("planning:view"), async (c) => {
  const pid = pidOf(c);
  const its = await planningRepo.listIterations(pid);
  const ms = await planningRepo.listMilestones(pid);
  const starts = its.map((i) => i.startDate).sort();
  const ends = its.map((i) => i.endDate).sort();
  return data(c, {
    iterations: its,
    milestones: ms,
    window: { start: starts[0] ?? null, end: ends.at(-1) ?? null },
  });
});
