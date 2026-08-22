/** Planning routes — iterations, milestones, timeline. */
import { Hono } from "hono";
import { store } from "../../db/store";
import { uuidv7, iterationCreate, iterationUpdate, milestoneCreate, milestoneUpdate } from "@pmin/core";
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
planning.get("/planning/iterations", requirePermission("planning:view"), (c) =>
  data(
    c,
    store.iterations
      .filter((i) => i.projectId === pidOf(c))
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
  ),
);
planning.post("/planning/iterations", requirePermission("planning:manage"), async (c) => {
  const pid = pidOf(c);
  const input = parseBody(await c.req.json(), iterationCreate);
  const it = {
    id: uuidv7(),
    projectId: pid,
    name: input.name,
    goal: input.goal ?? null,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "planned" as const,
    committedPoints: 0,
    completedPoints: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.iterations.push(it);
  return created(c, it);
});
planning.patch("/planning/iterations/:id", requirePermission("planning:manage"), async (c) => {
  const it = store.iterations.find((i) => i.id === c.req.param("id") && i.projectId === pidOf(c));
  if (!it) throw notFound();
  const input = parseBody(await c.req.json(), iterationUpdate);
  if (input.status && input.status !== it.status) {
    if (!canTransition(ITERATION_TRANSITIONS, it.status, input.status))
      throw conflict(`Cannot transition iteration from ${it.status} to ${input.status}`);
  }
  Object.assign(it, input, { updatedAt: new Date().toISOString() });
  return data(c, it);
});

// ---- milestones ----
planning.get("/planning/milestones", requirePermission("planning:view"), (c) =>
  data(c, store.milestones.filter((m) => m.projectId === pidOf(c))),
);
planning.post("/planning/milestones", requirePermission("planning:manage"), async (c) => {
  const pid = pidOf(c);
  const input = parseBody(await c.req.json(), milestoneCreate);
  const m = {
    id: uuidv7(),
    projectId: pid,
    name: input.name,
    description: input.description ?? null,
    dueDate: input.dueDate ?? null,
    status: "planned" as const,
    totalTasks: 0,
    doneTasks: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.milestones.push(m);
  return created(c, m);
});
planning.patch("/planning/milestones/:id", requirePermission("planning:manage"), async (c) => {
  const m = store.milestones.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c));
  if (!m) throw notFound();
  const input = parseBody(await c.req.json(), milestoneUpdate);
  if (input.status && input.status !== m.status) {
    if (!canTransition(MILESTONE_TRANSITIONS, m.status, input.status))
      throw conflict(`Cannot transition milestone from ${m.status} to ${input.status}`);
  }
  Object.assign(m, input, { updatedAt: new Date().toISOString() });
  return data(c, m);
});

// ---- timeline (gantt) ----
planning.get("/planning/timeline", requirePermission("planning:view"), (c) => {
  const pid = pidOf(c);
  const its = store.iterations.filter((i) => i.projectId === pid);
  const ms = store.milestones.filter((m) => m.projectId === pid);
  const starts = its.map((i) => i.startDate).sort();
  const ends = its.map((i) => i.endDate).sort();
  return data(c, {
    iterations: its,
    milestones: ms,
    window: { start: starts[0] ?? null, end: ends.at(-1) ?? null },
  });
});
