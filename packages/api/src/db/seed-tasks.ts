/** Demo seed: the Atlas board — design tasks + subtasks + cross-issue links,
 *  the epic layer, task comments, and the minimal side projects. Guarded by
 *  the pgSeeded flag / per-row lookups so re-seeding never duplicates. */
import type { TaskPriority } from "@pmin/core";
import * as taskRepo from "./task-repo";
import * as planningRepo from "./planning-repo";
import type { TaskWithMeta } from "./task-repo";
import type { PlanningSeed } from "./seed-planning";
import { STATUS_DEFS, type SeedCtx } from "./seed-shared";

type DesignTask = {
  id: number;
  t: string;
  s: keyof SeedCtx["statusByShort"];
  a: keyof SeedCtx["usersByShort"];
  p: "p1" | "p2" | "p3" | "p4";
  ty: "bug" | "feat" | "task" | "epic";
  lb: string[];
  due: string;
  pts: number;
  sub: [number, string, 0 | 1][];
  com: number;
};

const PRIO: Record<DesignTask["p"], TaskPriority> = {
  p1: "urgent",
  p2: "high",
  p3: "medium",
  p4: "low",
};

/** The prototype's TASKS[] — mirrors designs/app/alabs-app.html 1:1. */
const DESIGN_TASKS: DesignTask[] = [
  { id: 101, t: "Implement OAuth2 SSO flow", s: "progress", a: "mk", p: "p2", ty: "feat", lb: ["sso", "security"], due: "Mar 24", pts: 8, sub: [[1, "Spec out scopes & claims", 1], [2, "Wire authorization-code grant", 0], [3, "Token refresh rotation", 0]], com: 3 },
  { id: 102, t: "Board drag-and-drop performance", s: "progress", a: "lc", p: "p3", ty: "feat", lb: ["frontend"], due: "Mar 23", pts: 5, sub: [[1, "Profile with 500 cards", 1]], com: 2 },
  { id: 103, t: "Fix flaky CI test on billing webhook", s: "review", a: "dp", p: "p1", ty: "bug", lb: ["ci", "billing"], due: "Mar 22", pts: 3, sub: [], com: 4 },
  { id: 104, t: "Design system: migrate tokens to OKLch", s: "todo", a: "jb", p: "p3", ty: "task", lb: ["design"], due: "Mar 26", pts: 5, sub: [[1, "Audit hex usages", 0]], com: 1 },
  { id: 105, t: "Audit log: immutable event store", s: "todo", a: "mk", p: "p2", ty: "feat", lb: ["security", "backend"], due: "Mar 28", pts: 8, sub: [], com: 0 },
  { id: 106, t: "Dashboard KPI sparkline component", s: "todo", a: "lc", p: "p4", ty: "task", lb: ["frontend"], due: "Mar 27", pts: 3, sub: [], com: 0 },
  { id: 107, t: "Role-based access at project level", s: "progress", a: "mk", p: "p2", ty: "epic", lb: ["security"], due: "Apr 02", pts: 13, sub: [[1, "Permission matrix", 1], [2, "Middleware guards", 1]], com: 5 },
  { id: 108, t: "Search index for documents (PG trigram)", s: "review", a: "dp", p: "p3", ty: "feat", lb: ["search", "backend"], due: "Mar 25", pts: 5, sub: [], com: 2 },
  { id: 109, t: "Iteration planning: velocity chart", s: "todo", a: "lc", p: "p3", ty: "feat", lb: ["planning"], due: "Mar 29", pts: 3, sub: [], com: 0 },
  { id: 117, t: "API: pagination contract (cursor)", s: "review", a: "dp", p: "p2", ty: "task", lb: ["api", "backend"], due: "Mar 24", pts: 3, sub: [], com: 1 },
  { id: 116, t: "Backlog grooming: triage queue", s: "todo", a: "ay", p: "p3", ty: "task", lb: ["process"], due: "Mar 22", pts: 2, sub: [], com: 0 },
  { id: 118, t: "Notification digest: daily email", s: "todo", a: "lc", p: "p4", ty: "feat", lb: ["notifications"], due: "Apr 01", pts: 3, sub: [], com: 0 },
  { id: 112, t: "Reset password rate limiting", s: "done", a: "sr", p: "p1", ty: "bug", lb: ["security", "auth"], due: "Mar 18", pts: 3, sub: [[1, "Add sliding window", 1]], com: 2 },
  { id: 113, t: "Meeting notes: attach tasks", s: "done", a: "lc", p: "p4", ty: "task", lb: ["meetings"], due: "Mar 19", pts: 2, sub: [], com: 1 },
  { id: 114, t: "MFA: TOTP enrollment UX", s: "done", a: "sr", p: "p2", ty: "feat", lb: ["security", "auth"], due: "Mar 20", pts: 5, sub: [], com: 3 },
  { id: 115, t: "Empty states across modules", s: "done", a: "jb", p: "p4", ty: "task", lb: ["design"], due: "Mar 21", pts: 2, sub: [], com: 0 },
  { id: 119, t: "Write release notes for v2.0", s: "todo", a: "ay", p: "p3", ty: "task", lb: ["docs"], due: "Mar 27", pts: 2, sub: [], com: 0 },
  { id: 120, t: "Stakeholder demo prep", s: "todo", a: "ay", p: "p2", ty: "task", lb: ["process"], due: "Mar 25", pts: 2, sub: [], com: 0 },
  // Backlog items from planning view
  { id: 110, t: "Client portal: read-only views", s: "backlog", a: "ay", p: "p3", ty: "feat", lb: ["process"], due: "Apr 10", pts: 5, sub: [], com: 0 },
  { id: 111, t: "Document block model: table node", s: "backlog", a: "jb", p: "p3", ty: "task", lb: ["docs"], due: "Apr 12", pts: 3, sub: [], com: 0 },
  { id: 121, t: "Webhook retries with exponential backoff", s: "backlog", a: "lc", p: "p3", ty: "bug", lb: ["backend"], due: "Apr 15", pts: 5, sub: [], com: 0 },
  { id: 122, t: "Bulk-edit tasks from list view", s: "backlog", a: "dp", p: "p3", ty: "task", lb: ["frontend"], due: "Apr 16", pts: 3, sub: [], com: 0 },
  { id: 123, t: "Reporting: burndown export to PDF", s: "backlog", a: "sr", p: "p3", ty: "feat", lb: ["docs"], due: "Apr 18", pts: 5, sub: [], com: 0 },
  { id: 124, t: "Notification preferences per module", s: "backlog", a: "lc", p: "p3", ty: "feat", lb: ["notifications"], due: "Apr 20", pts: 3, sub: [], com: 0 },
  { id: 125, t: "SSO: SCIM user provisioning", s: "backlog", a: "mk", p: "p3", ty: "epic", lb: ["sso", "security"], due: "Apr 25", pts: 8, sub: [], com: 0 },
  { id: 126, t: "Empty-state illustrations (set of 6)", s: "backlog", a: "jb", p: "p3", ty: "task", lb: ["design"], due: "Apr 28", pts: 2, sub: [], com: 0 },
];

export async function seedTasks(ctx: SeedCtx, planning: PlanningSeed): Promise<TaskWithMeta[]> {
  const { atlas, pgSeeded, usersByShort, aisha } = ctx;
  const { sprint13, sprint14, v2Beta, designSystem, security } = planning;

  const parents: TaskWithMeta[] = [];
  if (!pgSeeded) {
    for (const d of DESIGN_TASKS) {
      const milestoneId =
        d.lb.includes("security") || d.lb.includes("sso") || d.lb.includes("auth")
          ? security.id
          : d.lb.includes("design")
            ? designSystem.id
            : v2Beta.id;
      const iterationId = d.s === "backlog" ? null : sprint14.id;
      const parent = await taskRepo.insertTask({
        projectId: atlas.id,
        title: d.t,
        statusId: ctx.statusByShort[d.s]!.id,
        assigneeId: usersByShort[d.a].id,
        reporterId: aisha.id,
        priority: PRIO[d.p],
        typeId: ctx.typeByShort[d.ty].id,
        iterationId,
        milestoneId,
        dueDate: ctx.dueIso(d.due) ? new Date(ctx.dueIso(d.due)!) : null,
        order: d.id,
        estimate: d.pts,
        labelIds: d.lb.map(ctx.labelIdByName),
      });
      parents.push(parent);
      // subtasks → real child tasks
      for (const [n, desc, done] of d.sub) {
        await taskRepo.insertTask({
          projectId: atlas.id,
          title: desc,
          statusId: (done ? ctx.statusByName("Done") : ctx.statusByName("To Do")).id,
          assigneeId: usersByShort[d.a].id,
          reporterId: aisha.id,
          priority: PRIO[d.p],
          typeId: ctx.typeByShort[d.ty].id,
          parentId: parent.id,
          iterationId,
          milestoneId,
          dueDate: ctx.dueIso(d.due) ? new Date(ctx.dueIso(d.due)!) : null,
          order: n,
        });
      }
    }

    // cross-issue links from the design's Relationships section:
    // 101 blocked-by 105 → 105 blocks 101; 108 relates 117; 116 blocks 109
    const byOrder = (o: number) => parents.find((p) => p.order === o);
    const link = async (sourceOrder: number, targetOrder: number, type: "blocks" | "relates_to") => {
      const src = byOrder(sourceOrder);
      const tgt = byOrder(targetOrder);
      if (src && tgt)
        await taskRepo.addTaskLink({ projectId: atlas.id, taskId: src.id, targetId: tgt.id, type });
    };
    await link(105, 101, "blocks");
    await link(108, 117, "relates_to");
    await link(116, 109, "blocks");

    // wire iteration points (stored aggregates, matching the design numbers)
    const points = (filter: (t: TaskWithMeta) => boolean) =>
      parents.filter(filter).reduce((n, t) => n + (t.estimate ?? 0), 0);
    const completed = points((t) => t.iterationId === sprint14.id && t.statusId === ctx.statusByShort.done!.id);
    await planningRepo.patchIteration(sprint14.id, {
      committedPoints: 52,
      completedPoints: completed,
      progress: Math.round((completed / 52) * 100),
    });
    await planningRepo.patchIteration(sprint13.id, { progress: 100 });
  } else {
    parents.push(...(await taskRepo.listTasks(atlas.id)));
  }
  return parents;
}

/** Epics + epic links — additive backfill mirroring the prototype's epic
 *  layer (board epic grouping): four epic rows whose descriptions carry the
 *  goal text, then children linked via epic_id. Guarded by order/epicId. */
export async function seedEpics(ctx: SeedCtx): Promise<void> {
  const { atlas, usersByShort, aisha } = ctx;
  const EPIC_SEED: {
    order: number;
    title: string;
    goal: string;
    owner: keyof SeedCtx["usersByShort"];
    status: "progress" | "todo";
  }[] = [
    { order: 200, title: "Identity & Access", goal: "SSO, MFA, RBAC and an immutable audit trail for org-wide security.", owner: "mk", status: "progress" },
    { order: 201, title: "Billing & Payments", goal: "Subscription billing, invoicing and payment webhook resilience.", owner: "lc", status: "todo" },
    { order: 202, title: "Search & Reporting", goal: "Trigram document search, dashboards and exportable reports.", owner: "dp", status: "progress" },
    { order: 203, title: "Platform Foundation", goal: "Design-system migration, docs, notifications and platform infra.", owner: "jb", status: "progress" },
  ];
  const EPIC_LINKS: [number, number][] = [
    [101, 200], [102, 203], [103, 201], [104, 203], [105, 200], [106, 202],
    [107, 200], [108, 202], [109, 202], [116, 203], [117, 203], [118, 203],
    [112, 200], [113, 203], [114, 200], [115, 203], [119, 203], [120, 203],
  ];
  const all = await taskRepo.listTasks(atlas.id);
  const byOrder = new Map(all.map((t) => [t.order, t]));
  const epicUuidByOrder = new Map<number, string>();
  for (const e of EPIC_SEED) {
    const existing = byOrder.get(e.order);
    if (existing) {
      epicUuidByOrder.set(e.order, existing.id);
      continue;
    }
    const row = await taskRepo.insertTask({
      projectId: atlas.id,
      title: e.title,
      description: e.goal,
      statusId: ctx.statusByShort[e.status].id,
      assigneeId: usersByShort[e.owner].id,
      reporterId: aisha.id,
      priority: "high",
      typeId: ctx.typeByShort.epic.id,
      order: e.order,
    });
    epicUuidByOrder.set(e.order, row.id);
  }
  for (const [childOrder, epicOrder] of EPIC_LINKS) {
    const child = byOrder.get(childOrder);
    if (child && !child.epicId) {
      await taskRepo.patchTask(child.id, child.updatedAt, {
        epicId: epicUuidByOrder.get(epicOrder)!,
      });
    }
  }
}

/** Comments for the task drawer (first seed only). */
export async function seedComments(ctx: SeedCtx, parents: TaskWithMeta[]): Promise<void> {
  if (ctx.pgSeeded) return;
  const ssoTask = parents.find((t) => t.title === "Implement OAuth2 SSO flow");
  if (!ssoTask) return;
  const marco = ctx.usersByShort.mk;
  const sara = ctx.usersByShort.sr;
  await taskRepo.insertComment({
    taskId: ssoTask.id,
    userId: marco.id,
    body: "Blocked on the IdP sandbox credentials — chasing Ops. Unblocked scope: PKCE verifier generation is done.",
    createdAt: new Date(Date.now() - 2 * 3600_000),
  });
  await taskRepo.insertComment({
    taskId: ssoTask.id,
    userId: sara.id,
    body: "Added a regression test for expired refresh tokens. Looks clean on staging.",
    createdAt: new Date(Date.now() - 26 * 3600_000),
  });
}

/** Other projects (minimal shape so switching lands on a usable board —
 *  statuses + a few tasks each; only Atlas is fully seeded). */
export async function seedSideProjects(ctx: SeedCtx): Promise<void> {
  const { aisha } = ctx;
  const sideProject = async (
    key: string,
    titles: [string, number][], // [title, statusIndex] — indexes into the 5 statuses
  ) => {
    const p = ctx.projectByKey(key);
    const already = (await taskRepo.listStatuses(p.id)).length > 0;
    if (already) return;
    const statuses = await Promise.all(
      STATUS_DEFS.map((s) => taskRepo.insertStatus({ ...s, projectId: p.id })),
    );
    for (const [i, [title, si]] of titles.entries()) {
      await taskRepo.insertTask({
        projectId: p.id,
        title,
        statusId: statuses[si]!.id,
        assigneeId: aisha.id,
        reporterId: aisha.id,
        order: i,
      });
    }
  };

  await sideProject("MOB", [
    ["Set up React Native scaffold", 4],
    ["Push notifications proof of concept", 2],
    ["Offline task cache", 1],
    ["App Store screenshots", 0],
  ]);
  await sideProject("NOT", [
    ["Reading list: shipping for startups", 1],
    ["Weekly review template", 4],
    ["Ideas parking lot", 0],
  ]);
  await sideProject("DWH", [
    ["Source-system inventory", 4],
    ["Model dim_customer v1", 2],
    ["Nightly ELT failure alerts", 1],
    ["Backfill 2025 orders", 0],
  ]);
  await sideProject("BRD", [
    ["Logo explorations round 2", 2],
    ["Typography shortlist", 1],
    ["Website color tokens", 0],
    ["Stakeholder review deck", 1],
  ]);
  await sideProject("MKT", [
    ["Pricing page copy", 2],
    ["CMS migration plan", 1],
    ["SEO audit fixes", 4],
    ["Launch checklist", 0],
  ]);
  await sideProject("OPS", [
    ["Invoice sync job", 2],
    ["Onboarding runbook", 4],
    ["Alert routing rules", 1],
    ["Quarterly access review", 0],
  ]);
}
