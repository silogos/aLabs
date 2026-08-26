/**
 * Seed the demo data — mirrors the `designs/app/alabs-app.html` prototype 1:1.
 *
 * Everything seeds into Postgres via the domain repos. Users/projects come
 * from earlier PG seeds (seed-auth/-workspace/-projects); everything here
 * references the real DB ids. Idempotent: every half guards its writes.
 * Domain halves live in seed-tasks/-planning/-docs/-collab; this file
 * resolves the shared context and orchestrates.
 */
import type { User, TaskType, TaskStatus } from "@pmin/core";
import * as taskRepo from "./task-repo";
import type { ProjectWithMeta } from "./project-repo";
import { makeCalendar, STATUS_DEFS, type SeedCtx } from "./seed-shared";
import { seedPlanning } from "./seed-planning";
import { seedTasks, seedEpics, seedComments, seedSideProjects } from "./seed-tasks";
import { seedDocs } from "./seed-docs";
import { seedCollab } from "./seed-collab";

export async function seed(users: User[], projects: ProjectWithMeta[]): Promise<void> {
  const { dayIso, dueIso } = makeCalendar();

  const byEmail = (email: string) => {
    const u = users.find((x) => x.email === email);
    if (!u) throw new Error(`seed: demo user ${email} missing from Postgres seed`);
    return u;
  };
  const aisha = byEmail("aisha@northwind.io");
  const usersByShort = {
    ay: aisha,
    mk: byEmail("marco@northwind.io"),
    lc: byEmail("lin@northwind.io"),
    dp: byEmail("diego@northwind.io"),
    sr: byEmail("sara@northwind.io"),
    jb: byEmail("jonas@northwind.io"),
  };

  const projectByKey = (key: string) => {
    const p = projects.find((x) => x.key === key);
    if (!p) throw new Error(`seed: demo project ${key} missing from Postgres seed`);
    return p;
  };
  const atlas = projectByKey("ATL");

  // idempotency: the PG section below only runs into an empty tasks table
  const pgSeeded = (await taskRepo.countProjectTasks(atlas.id)) > 0;

  // task config — statuses (the design's 5 columns), types, labels
  const statusList: TaskStatus[] = pgSeeded
    ? await taskRepo.listStatuses(atlas.id)
    : await Promise.all(STATUS_DEFS.map((s) => taskRepo.insertStatus({ ...s, projectId: atlas.id })));
  const statusByShort: SeedCtx["statusByShort"] = {
    backlog: statusList.find((s) => s.name === "Backlog")!,
    todo: statusList.find((s) => s.name === "To Do")!,
    progress: statusList.find((s) => s.name === "In Progress")!,
    review: statusList.find((s) => s.name === "In Review")!,
    done: statusList.find((s) => s.name === "Done")!,
  };
  const statusByName = (n: string) => statusList.find((s) => s.name === n)!;

  const typeNames = ["Task", "Bug", "Feature", "Epic"];
  const typeList: TaskType[] = pgSeeded
    ? await taskRepo.listTypes(atlas.id)
    : await Promise.all(typeNames.map((name) => taskRepo.insertType(atlas.id, name)));
  const typeByName = (n: string) => typeList.find((t) => t.name === n)!;
  const typeByShort: SeedCtx["typeByShort"] = {
    task: typeByName("Task"),
    bug: typeByName("Bug"),
    feat: typeByName("Feature"),
    epic: typeByName("Epic"),
  };

  const labelNames = [
    "sso", "security", "frontend", "ci", "billing", "design", "backend",
    "search", "api", "process", "notifications", "meetings", "docs", "auth",
    "planning", "new",
  ];
  const labelList = pgSeeded
    ? await taskRepo.listLabels(atlas.id)
    : await Promise.all(labelNames.map((n) => taskRepo.insertLabel({ projectId: atlas.id, name: n })));
  const labelIdByName = (n: string) => labelList.find((l) => l.name === n)!.id;

  const ctx: SeedCtx = {
    atlas,
    projectByKey,
    usersByShort,
    aisha,
    pgSeeded,
    dayIso,
    dueIso,
    statusByShort,
    statusByName,
    typeByShort,
    labelIdByName,
  };

  const planning = await seedPlanning(ctx);
  const parents = await seedTasks(ctx, planning);
  const docSeeded = await seedDocs(ctx); // true when docs already existed
  await seedCollab(ctx, parents, !docSeeded);
  await seedEpics(ctx);
  await seedComments(ctx, parents);
  await seedSideProjects(ctx);
}
