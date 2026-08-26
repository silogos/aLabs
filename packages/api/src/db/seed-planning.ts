/** Demo seed: iterations + milestones for Atlas. Guarded by the pgSeeded
 *  flag + per-name lookups, so re-seeding never duplicates rows. */
import * as planningRepo from "./planning-repo";
import type { SeedCtx } from "./seed-shared";
import type { Iteration, Milestone } from "@pmin/core";

export interface PlanningSeed {
  sprint11: Iteration;
  sprint12: Iteration;
  sprint13: Iteration;
  sprint14: Iteration;
  sprint15: Iteration;
  v2Beta: Milestone;
  designSystem: Milestone;
  security: Milestone;
}

export async function seedPlanning(ctx: SeedCtx): Promise<PlanningSeed> {
  const { atlas, pgSeeded, dayIso } = ctx;

  const iter = (
    name: string,
    goal: string | null,
    start: string,
    end: string,
    status: "planned" | "active" | "completed",
  ) =>
    planningRepo.insertIteration({
      projectId: atlas.id,
      name,
      goal,
      startDate: start,
      endDate: end,
      status,
    });
  const existingIters = pgSeeded ? await planningRepo.listIterations(atlas.id) : null;
  const byIterName = (n: string) => existingIters?.find((i) => i.name === n)!;
  const sprint13 =
    byIterName("Sprint 13") ??
    (await iter("Sprint 13", "Module scaffolding", dayIso(-24), dayIso(-11), "completed"));
  const sprint14 =
    byIterName("Sprint 14 — SSO + Audit-log MVP") ??
    (await iter(
      "Sprint 14 — SSO + Audit-log MVP",
      "Ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. Client-portal scaffolding visible but read-only.",
      dayIso(-10),
      dayIso(4),
      "active",
    ));
  const sprint15 =
    byIterName("Sprint 15") ?? (await iter("Sprint 15", null, dayIso(5), dayIso(18), "planned"));

  // Velocity history for the reports view — backfill completed-sprint points
  // and add the two sprints before Sprint 13. All guarded; no-op once present.
  if (sprint13.committedPoints === 0) {
    await planningRepo.patchIteration(sprint13.id, { committedPoints: 46, completedPoints: 40 });
  }
  const sprint11 =
    byIterName("Sprint 11") ??
    (await iter("Sprint 11", "Auth foundations", dayIso(-52), dayIso(-39), "completed"));
  const sprint12 =
    byIterName("Sprint 12") ??
    (await iter("Sprint 12", "Board + editor polish", dayIso(-38), dayIso(-25), "completed"));
  if (sprint11.committedPoints === 0) {
    await planningRepo.patchIteration(sprint11.id, { committedPoints: 44, completedPoints: 41 });
  }
  if (sprint12.committedPoints === 0) {
    await planningRepo.patchIteration(sprint12.id, { committedPoints: 48, completedPoints: 38 });
  }

  const ms = (
    name: string,
    desc: string,
    due: string,
    status: "planned" | "reached",
    total: number,
    done: number,
  ) =>
    planningRepo.insertMilestone({
      projectId: atlas.id,
      name,
      description: desc,
      dueDate: due,
      status,
      totalTasks: total,
      doneTasks: done,
      progress: Math.round((done / total) * 100),
    });
  const existingMs = pgSeeded ? await planningRepo.listMilestones(atlas.id) : null;
  const byMsName = (n: string) => existingMs?.find((m) => m.name === n)!;
  const v2Beta =
    byMsName("v2.0 Beta release") ??
    (await ms("v2.0 Beta release", "Public beta of aLabs 2.0", dayIso(6), "planned", 25, 18));
  const designSystem =
    byMsName("Design System v1") ??
    (await ms("Design System v1", "Component library + tokens", dayIso(21), "planned", 20, 11));
  const security =
    byMsName("Security hardening") ??
    (await ms("Security hardening", "Audit log, SSO, rate limiting", dayIso(39), "planned", 20, 6));

  return { sprint11, sprint12, sprint13, sprint14, sprint15, v2Beta, designSystem, security };
}
