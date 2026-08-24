/**
 * Seed the demo data — mirrors the `designs/app/alabs-app.html` prototype 1:1.
 *
 * Everything seeds into Postgres via the domain repos. Users/projects come
 * from earlier PG seeds; everything here references the real DB ids.
 * Idempotent: the task/planning half guards on an empty tasks table, the
 * documents half on empty spaces.
 */
import { uuidv7 } from "@pmin/core";
import type { TaskPriority, Content, User, TaskType, Space } from "@pmin/core";
import type { ProjectWithMeta } from "./project-repo";
import * as taskRepo from "./task-repo";
import * as planningRepo from "./planning-repo";
import * as docRepo from "./doc-repo";
import * as miscRepo from "./misc-repo";

import type { TaskWithMeta } from "./task-repo";

const now = () => new Date();
const iso = (d: Date = now()) => d.toISOString();

export async function seed(users: User[], projects: ProjectWithMeta[]): Promise<void> {

  // Relative demo calendar — design "today" = Mar 22 in the original mock.
  // Offsets are applied from runtime-today so the board never looks stale.
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const TODAY = startOfDay(new Date());
  const dayIso = (offset: number) =>
    new Date(TODAY.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
  const OFFSET: Record<string, number> = {
    "Mar 18": -4, "Mar 19": -3, "Mar 20": -2, "Mar 21": -1, "Mar 22": 0,
    "Mar 23": 1, "Mar 24": 2, "Mar 25": 3, "Mar 26": 4, "Mar 27": 5,
    "Mar 28": 6, "Mar 29": 7, "Apr 01": 10, "Apr 02": 11,
    "Apr 10": 19, "Apr 12": 21, "Apr 15": 24, "Apr 16": 25,
    "Apr 18": 27, "Apr 20": 29, "Apr 25": 34, "Apr 28": 37,
  };
  const dueIso = (label: string) =>
    OFFSET[label] !== undefined ? dayIso(OFFSET[label]!) : null;

  /* ---------------- Users (from Postgres — seeded by db/seed-auth.ts) ---------------- */
  const byEmail = (email: string) => {
    const u = users.find((x) => x.email === email);
    if (!u) throw new Error(`seed: demo user ${email} missing from Postgres seed`);
    return u;
  };
  const aisha = byEmail("aisha@northwind.io");
  const marco = byEmail("marco@northwind.io");
  const lin = byEmail("lin@northwind.io");
  const diego = byEmail("diego@northwind.io");
  const sara = byEmail("sara@northwind.io");
  const jonas = byEmail("jonas@northwind.io");
  const usersByShort = { ay: aisha, mk: marco, lc: lin, dp: diego, sr: sara, jb: jonas };

  /* ---------------- Roles + organizations (from Postgres) ---------------- */
  /* ---------------- Project (from Postgres) ---------------- */
  const projectByKey = (key: string) => {
    const p = projects.find((x) => x.key === key);
    if (!p) throw new Error(`seed: demo project ${key} missing from Postgres seed`);
    return p;
  };
  const atlas = projectByKey("ATL");

  // idempotency: the PG section below only runs into an empty tasks table
  const pgSeeded = (await taskRepo.countProjectTasks(atlas.id)) > 0;

  /* ---------------- Task statuses (design uses 5 columns) — PG ---------------- */
  const statusDefs: Array<{ name: string; order: number; color: string; isDefault: boolean }> = [
    { name: "Backlog", order: 0, color: "var(--faint)", isDefault: false },
    { name: "To Do", order: 1, color: "var(--muted)", isDefault: true },
    { name: "In Progress", order: 2, color: "var(--info)", isDefault: false },
    { name: "In Review", order: 3, color: "var(--violet)", isDefault: false },
    { name: "Done", order: 4, color: "var(--ok)", isDefault: false },
  ];
  const statusList = pgSeeded
    ? await taskRepo.listStatuses(atlas.id)
    : await Promise.all(statusDefs.map((s) => taskRepo.insertStatus({ ...s, projectId: atlas.id })));
  const statusByShort: Record<string, (typeof statusList)[number]> = {
    backlog: statusList.find((s) => s.name === "Backlog")!,
    todo: statusList.find((s) => s.name === "To Do")!,
    progress: statusList.find((s) => s.name === "In Progress")!,
    review: statusList.find((s) => s.name === "In Review")!,
    done: statusList.find((s) => s.name === "Done")!,
  };
  const statusByName = (n: string) => statusList.find((s) => s.name === n)!;

  /* ---------------- Task types — PG ---------------- */
  const typeNames = ["Task", "Bug", "Feature", "Epic"];
  const typeList: TaskType[] = pgSeeded
    ? await taskRepo.listTypes(atlas.id)
    : await Promise.all(typeNames.map((name) => taskRepo.insertType(atlas.id, name)));
  const typeByName = (n: string) => typeList.find((t) => t.name === n)!;
  const typeByShort: Record<string, (typeof typeList)[number]> = {
    task: typeByName("Task"),
    bug: typeByName("Bug"),
    feat: typeByName("Feature"),
    epic: typeByName("Epic"),
  };

  /* ---------------- Task labels ---------------- */
  const labelNames = [
    "sso",
    "security",
    "frontend",
    "ci",
    "billing",
    "design",
    "backend",
    "search",
    "api",
    "process",
    "notifications",
    "meetings",
    "docs",
    "auth",
    "planning",
    "new",
  ];
  const labelList = pgSeeded
    ? await taskRepo.listLabels(atlas.id)
    : await Promise.all(labelNames.map((n) => taskRepo.insertLabel({ projectId: atlas.id, name: n })));
  const labelByName = (n: string) => labelList.find((l) => l.name === n)!;
  const labelIdByName = (n: string) => labelByName(n)!.id;

  /* ---------------- Iterations ---------------- */
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

  /* ---------------- Milestones ---------------- */
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

  /* ---------------- Tasks (mirror design TASKS[]) ---------------- */
  type DesignTask = {
    id: number;
    t: string;
    s: keyof typeof statusByShort;
    a: keyof typeof usersByShort;
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

  const designTasks: DesignTask[] = [
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

  const parents: TaskWithMeta[] = [];
  if (!pgSeeded) {
    for (const d of designTasks) {
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
        statusId: statusByShort[d.s]!.id,
        assigneeId: usersByShort[d.a].id,
        reporterId: aisha.id,
        priority: PRIO[d.p],
        typeId: typeByShort[d.ty].id,
        iterationId,
        milestoneId,
        dueDate: dueIso(d.due) ? new Date(dueIso(d.due)!) : null,
        order: d.id,
        estimate: d.pts,
        labelIds: d.lb.map(labelIdByName),
      });
      parents.push(parent);
      // subtasks → real child tasks
      for (const [n, desc, done] of d.sub) {
        await taskRepo.insertTask({
          projectId: atlas.id,
          title: desc,
          statusId: (done ? statusByName("Done") : statusByName("To Do")).id,
          assigneeId: usersByShort[d.a].id,
          reporterId: aisha.id,
          priority: PRIO[d.p],
          typeId: typeByShort[d.ty].id,
          parentId: parent.id,
          iterationId,
          milestoneId,
          dueDate: dueIso(d.due) ? new Date(dueIso(d.due)!) : null,
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
    const completed = points((t) => t.iterationId === sprint14.id && t.statusId === statusByShort.done!.id);
    await planningRepo.patchIteration(sprint14.id, {
      committedPoints: 52,
      completedPoints: completed,
      progress: Math.round((completed / 52) * 100),
    });
    await planningRepo.patchIteration(sprint13.id, { progress: 100 });
  } else {
    parents.push(...(await taskRepo.listTasks(atlas.id)));
  }

  /* ---------------- Document spaces + pages — PG ---------------- */
  const docSeeded = (await docRepo.listSpaces(atlas.id)).length > 0;
  const spaces = (name: string, icon: string, order: number) =>
    docRepo.insertSpace({ projectId: atlas.id, name, icon, order });
  if (!docSeeded) {
  const product = await spaces("Product", "📐", 0);
  const engineering = await spaces("Engineering", "⚙️", 1);
  const design = await spaces("Design", "🎨", 2);
  const client = await spaces("Client", "🤝", 3);
  const legal = await spaces("Legal", "⚖️", 4);

  const page = (space: Space | Promise<Space>, title: string, icon: string, content: Content) =>
    Promise.resolve(space).then((sp) =>
      docRepo.insertPage({
        projectId: atlas.id,
        spaceId: sp.id,
        title,
        icon,
        content,
        editedBy: marco.id,
      }),
    );

  /* ProseMirror doc builders for seed page content (native JSON — no adapter). */
  const txt = (t: string): Content => ({ type: "text", text: t });
  const para = (t: string): Content => ({ type: "paragraph", content: [txt(t)] });
  const hd = (level: number, t: string): Content => ({ type: "heading", attrs: { level }, content: [txt(t)] });
  const bq = (t: string): Content => ({ type: "blockquote", content: [para(t)] });
  const cblk = (language: string, t: string): Content => ({ type: "codeBlock", attrs: { language }, content: [txt(t)] });
  const ul = (...items: string[]): Content => ({ type: "bulletList", content: items.map((i) => ({ type: "listItem", content: [para(i)] })) });
  const doc = (...blocks: Content[]): Content => ({ type: "doc", content: blocks });

  await page(product, "Vision & positioning", "🎯", doc(
    hd(2, "Vision"),
    para("A project management platform purpose-built for software delivery — simple enough for a two-person team, scalable enough for an enterprise. Most tools track tasks or store documents. aLabs unifies delivery, documentation, planning, and client communication in one place."),
    bq("AI is an optional enhancement, never the core experience. Every feature works without it."),
    hd(2, "Differentiators"),
    ul(
      "Documentation is a first-class citizen",
      "Built-in client transparency",
      "Seat-free pricing — we charge for value",
      "Refine ICP sizing assumptions",
    ),
  ));

  await page(engineering, "Architecture", "🏛️", doc(
    bq("Source of truth. This doc governs all module work. ADRs live under Engineering → ADRs; changes here require an ADR."),
    hd(2, "Hierarchy"),
    para("aLabs is strictly hierarchical: User → Organization → Project → Modules. Every business activity belongs to a Project — nothing floats free. Data is isolated per organization; multi-tenancy is enforced at the database layer, not the application layer."),
    hd(2, "Foundation & modules"),
    para("A shared Foundation (Authentication, Organization, Project) underpins every module. Delivery modules (Task, Planning) and Knowledge modules (Documents) build on it directly."),
    ul(
      "Define the tenancy boundary at the org level",
      "Scope every module to a project",
      "Document the read-replica strategy for reporting",
    ),
    hd(2, "Stack"),
    ul(
      "Frontend · React · TypeScript — large hiring pool, end-to-end type safety",
      "Backend · Hono — lightweight, edge-ready, fast",
      "Database · PostgreSQL — relational integrity for hierarchical multi-tenant data",
      "ORM · Drizzle — SQL-first, predictable, type-safe",
      "Auth · Better Auth — sessions & organizations without a managed vendor",
    ),
    bq("Open decision. Object storage & search providers are still TBD — see Pending Decisions in the README."),
  ));

  await page(engineering, "Data model", "🗄️", doc(
    hd(2, "Core entities"),
    para("Tasks, Documents, Planning, and Meetings each own their tables, scoped by projectId. There are no cross-project foreign keys."),
    cblk("sql", "-- task is the primary unit of execution\nCREATE TABLE task (\n  id          uuid PRIMARY KEY,\n  project_id  uuid NOT NULL REFERENCES project,\n  title       text NOT NULL,\n  status_id   uuid NOT NULL REFERENCES task_status,\n  assignee_id uuid,\n  priority    task_priority NOT NULL DEFAULT 'medium',\n  due_date    timestamptz,\n  CONSTRAINT within_project CHECK (...)\n);"),
    bq("Subtasks are self-referential via parent_id; progress rolls up to the parent."),
    para("See the full schema in 03-data-model.md."),
  ));

  await page(engineering, "API contract", "🔌", doc(
    hd(2, "Conventions"),
    para("RESTful, JSON, cursor-based pagination. Every route is scoped under an organization and project."),
    cblk("http", "# list tasks in a project\nGET /orgs/{orgId}/projects/{projectId}/tasks\n     ?status=progress&assignee=me&cursor={cursor}\n\n# 200 OK\n{ \"data\": [...], \"nextCursor\": \"...\", \"hasMore\": true }"),
    para("Every endpoint is guarded by a capability check: task:view, task:create, document:update, and so on. Capabilities are derived from the member's role in the org and project."),
  ));

  await page(product, "Roadmap", "🗺️", doc(
    hd(2, "Phasing"),
    para("Phase 1 Foundation → Phase 2 Task & Documents → Phase 3 Planning & Meetings → Phase 4 Client portal & Governance → Phase 5 Notifications & Billing → Phase 6 AI add-on."),
    ul(
      "Foundation shipped",
      "Task & Documents in beta",
      "Planning module — active sprint",
    ),
  ));
  await page(product, "Pricing model", "💲", doc(para("Seat-free. We charge for projects and features, not people.")));
  await page(product, "Personas", "👥", doc(para("Product Manager, Project Manager, Business Analyst, Software Engineer, QA Engineer, UI/UX Designer.")));
  await page(engineering, "ADRs", "📋", doc(para("Architecture Decision Records live here.")));
  await page(engineering, "Conventions", "📜", doc(
    hd(2, "Coding standards"),
    para("TypeScript strict mode everywhere, no any without an inline justification. Naming is camelCase for code, snake_case for database columns."),
    bq("Every architectural decision gets an ADR before the PR merges."),
  ));
  await page(design, "Design system", "🎨", doc(para("Tokens, type scale, and component primitives.")));
  await page(design, "Component library", "🧩", doc(para("React component library shared across the app.")));
  await page(client, "Northwind SOW", "📄", doc(para("Statement of work for the Atlas Platform 2.0 engagement.")));
  await page(client, "Status report — Mar", "📊", doc(para("March status report shared with the client.")));
  await page(legal, "Master services agreement", "📑", doc(para("MSA between Northwind and the client.")));

  }

  /* ---------------- Files — PG ---------------- */
  if (!docSeeded) {
    const file = (name: string, mimeType: string, size: number, icon: string, uploadedBy: string) =>
      docRepo.insertFile({
        projectId: atlas.id,
        name,
        mimeType,
        size,
        url: `files/${icon}/${name}`,
        uploadedBy,
      });
    await file("design-system.fig", "application/figma", 24100000, "fig", jonas.id);
    await file("northwind-sow.pdf", "application/pdf", 880000, "pdf", aisha.id);
    await file("data-model-v3.png", "image/png", 1200000, "img", diego.id);
    await file("openapi.yaml", "text/yaml", 96000, "yml", marco.id);
    await file("brand-guidelines.pdf", "application/pdf", 12000000, "doc", jonas.id);
    await file("assets-export.zip", "application/zip", 8400000, "zip", lin.id);
  }

  /* ---------------- Activity feed — PG ---------------- */
  if (!docSeeded) {
    const activity = (
      kind: "move" | "doc" | "com" | "done" | "mile",
      actor: keyof typeof usersByShort,
      target: string,
      whenLabel: string,
      minutesAgo: number,
    ) =>
      miscRepo.insertActivity({
        projectId: atlas.id,
        kind,
        actorId: usersByShort[actor].id,
        target,
        whenLabel,
        occurredAt: new Date(Date.now() - minutesAgo * 60_000),
      });
    await activity("move", "mk", "ATL-101", "12 minutes ago", 12);
    await activity("doc", "jb", "Design System v1", "38 minutes ago", 38);
    await activity("com", "dp", "ATL-103", "1 hour ago", 60);
    await activity("done", "sr", "ATL-112", "2 hours ago", 120);
    await activity("mile", "ay", "Security hardening", "3 hours ago", 180);
    await activity("done", "lc", "ATL-113", "5 hours ago", 300);
  }

  /* Activity history for the reports view — additive, only while the feed is
   * still the bare first-seed set, so re-seeding never duplicates rows. */
  if ((await miscRepo.listActivity(atlas.id)).length <= 6) {
    const hist = (
      kind: "move" | "doc" | "com" | "done" | "mile",
      actor: keyof typeof usersByShort,
      target: string,
      daysAgo: number,
    ) =>
      miscRepo.insertActivity({
        projectId: atlas.id,
        kind,
        actorId: usersByShort[actor].id,
        target,
        whenLabel: `${daysAgo}d ago`,
        occurredAt: new Date(Date.now() - daysAgo * 864e5 - Math.round(Math.random() * 8 * 3600_000)),
      });
    const rows: Parameters<typeof hist>[] = [
      ["done", "mk", "ATL-101", 1], ["com", "lc", "ATL-102", 1], ["move", "ay", "ATL-108", 1],
      ["doc", "jb", "Design System v1", 2], ["done", "dp", "ATL-104", 2], ["com", "sr", "ATL-112", 2],
      ["done", "lc", "ATL-106", 3], ["move", "mk", "ATL-105", 3], ["doc", "ay", "Northwind SOW", 3],
      ["done", "jb", "ATL-109", 4], ["com", "dp", "ATL-103", 4], ["mile", "ay", "v2.0 Beta release", 4],
      ["done", "sr", "ATL-110", 5], ["doc", "lc", "Data model v3", 5], ["com", "mk", "ATL-101", 5],
      ["done", "dp", "ATL-111", 6], ["move", "jb", "ATL-107", 6], ["com", "ay", "ATL-101", 6],
      ["done", "mk", "ATL-113", 6], ["doc", "sr", "Test plan", 6],
    ];
    for (const r of rows) await hist(r[0], r[1], r[2], r[3]);
  }

  /* ---------------- Notifications — PG ---------------- */
  if (!docSeeded) {
    await miscRepo.insertNotification({
      userId: aisha.id,
      type: "mention",
      title: "Marco mentioned you on ATL-101",
      body: "Can you review the PKCE verifier before EOD?",
      link: "/tasks/101",
    });
    await miscRepo.insertNotification({
      userId: aisha.id,
      type: "due",
      title: "ATL-116 is due today",
      body: "Backlog grooming: triage queue",
      link: "/tasks/116",
    });
  }

  /* ---------------- Meetings + action items — PG ---------------- */
  // mirrors the prototype's six demo meetings; scheduled relative to runtime
  // today so the Upcoming/Past split always has content on both sides.
  if ((await miscRepo.listMeetings(atlas.id)).length === 0) {
    const at = (offset: number, h: number, m = 0) =>
      new Date(`${dayIso(offset)}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`);
    const ids = (...shorts: (keyof typeof usersByShort)[]) => shorts.map((s) => usersByShort[s].id);
    const action = (
      meetingId: string,
      description: string,
      who: keyof typeof usersByShort,
      dueOffset: number | null,
      opts: { done?: boolean; taskId?: string } = {},
    ) =>
      miscRepo
        .insertActionItem({
          meetingId,
          description,
          assigneeId: usersByShort[who].id,
          dueDate: dueOffset === null ? null : new Date(`${dayIso(dueOffset)}T00:00:00.000Z`),
          taskId: opts.taskId,
        })
        .then((item) =>
          opts.done ? miscRepo.patchActionItem(item.id, { done: true }) : undefined,
        );

    const ssoTask = parents.find((t) => t.title === "Implement OAuth2 SSO flow");

    const ssoSync = await miscRepo.insertMeeting({
      projectId: atlas.id,
      title: "SSO design sync",
      type: "planning",
      scheduledAt: at(1, 10, 0),
      duration: 45,
      location: "Zoom · alabs.demos/sso",
      participantIds: ids("mk", "lc", "dp", "ay"),
      agenda: [
        "Walk the SSO sign-in & sign-out flows (10m)",
        "PKCE vs. client-secret decision (10m)",
        "Audit-log write path and immutability (15m)",
        "Feature-flag rollout plan (10m)",
      ],
      notes:
        "Settled on PKCE for every public client; confidential server-side apps keep a client secret. " +
        "The audit log will use an append-only table with a per-row hash chain — no in-place updates, ever. " +
        "Blocker: IdP sandbox credentials are still with Ops — Marco chasing today.",
    });
    await action(ssoSync.id, "Provision the IdP sandbox environment", "mk", 2, {
      taskId: ssoTask?.id,
    });
    await action(ssoSync.id, "Draft the PKCE flow diagram for the wiki", "lc", 3);
    await action(ssoSync.id, "Confirm the feature-flag name with stakeholders", "ay", 0, { done: true });

    await miscRepo.insertMeeting({
      projectId: atlas.id,
      title: "Daily standup",
      type: "standup",
      scheduledAt: at(1, 9, 15),
      duration: 15,
      location: "Recurring · #engineering",
      participantIds: ids("ay", "mk", "lc", "dp", "sr"),
      agenda: ["Round-robin: yesterday · today · blockers (15m)"],
      notes: "Notes are captured live during the standup and posted to #engineering.",
    });

    const clientDemo = await miscRepo.insertMeeting({
      projectId: atlas.id,
      title: "Client demo — v2.0 beta preview",
      type: "client",
      scheduledAt: at(5, 14, 0),
      duration: 60,
      location: "Google Meet · shared with Northwind",
      participantIds: ids("ay", "mk", "jb"),
      agenda: [
        "Sprint 13–14 recap (10m)",
        "Live demo: SSO sign-in + audit log (25m)",
        "Design System v1 components (10m)",
        "Q&A and beta feedback (15m)",
      ],
      notes:
        "Aisha drives the demo, Marco owns the audit-log deep-dive, Jonas walks the new component library. " +
        "Demo script is locked — no ad-hoc features.",
    });
    await action(clientDemo.id, "Polish the demo dataset on staging", "dp", 4);
    await action(clientDemo.id, "Prepare the beta feedback intake form", "ay", 4);

    const sprint14 = await miscRepo.insertMeeting({
      projectId: atlas.id,
      title: "Sprint 14 planning",
      type: "planning",
      scheduledAt: at(-11, 13, 0),
      duration: 90,
      location: "Conference room B",
      participantIds: ids("ay", "mk", "lc", "dp", "sr", "jb"),
      agenda: [
        "Review Sprint 13 outcomes (15m)",
        "Capacity check (10m)",
        "Pull SSO + audit-log scope into the sprint (45m)",
        "Lock the sprint goal and exit criteria (20m)",
      ],
      notes:
        "Goal locked: ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. " +
        "Client-portal scaffolding stays visible but read-only. 52 points committed across 23 issues.",
    });
    await action(sprint14.id, "Break ATL-101 into PKCE + token-refresh subtasks", "mk", -9, {
      done: true,
      taskId: ssoTask?.id,
    });
    await action(sprint14.id, "Write the audit-log ADR", "mk", -8, { done: true });
    await miscRepo.patchMeeting(sprint14.id, { status: "completed" });

    const archReview = await miscRepo.insertMeeting({
      projectId: atlas.id,
      title: "Audit-log architecture review",
      type: "review",
      scheduledAt: at(-7, 11, 0),
      duration: 60,
      location: "Zoom",
      participantIds: ids("mk", "lc", "dp"),
      agenda: [
        "Hash-chain vs. Merkle-tree trade-offs (20m)",
        "Retention and partitioning (15m)",
        "Read path for reporting (15m)",
        "Decisions & follow-ups (10m)",
      ],
      notes:
        "Settled on a simple forward hash-chain — cheaper to verify and good enough for the threat model. " +
        "Partition by month; reporting reads from a nightly materialized view.",
    });
    await action(archReview.id, "Spike: hash-chain verification query", "lc", -3, { done: true });
    await miscRepo.patchMeeting(archReview.id, { status: "completed" });

    const grooming = await miscRepo.insertMeeting({
      projectId: atlas.id,
      title: "Backlog grooming",
      type: "standup",
      scheduledAt: at(-4, 16, 0),
      duration: 30,
      location: "Recurring · #engineering",
      participantIds: ids("ay", "mk", "lc"),
      agenda: ["Triage the inbox queue"],
      notes: "Cancelled — merged into the Sprint 14 mid-sprint check-in.",
    });
    await miscRepo.patchMeeting(grooming.id, { status: "cancelled" });
  }

  /* ---------------- Agreements — PG ---------------- */
  // mirrors the prototype's seven demo agreements; term dates relative to
  // runtime today so Active / Pending / Expiring-soon all have content.
  if ((await miscRepo.listAgreements(atlas.id)).length === 0) {
    const at = (offset: number) => new Date(`${dayIso(offset)}T12:00:00.000Z`);
    const lifecycle = (
      id: string,
      status: "draft" | "sent" | "accepted" | "rejected" | "expired",
      stamps: { sent?: number; signed?: number } = {},
    ) =>
      miscRepo.patchAgreement(id, {
        status,
        ...(stamps.sent !== undefined ? { sentAt: at(stamps.sent) } : {}),
        ...(stamps.signed !== undefined ? { signedAt: at(stamps.signed) } : {}),
      });

    const msa = await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Master Services Agreement",
      type: "contract",
      counterparty: "Acme Corporation",
      value: 240000,
      currency: "USD",
      startDate: dayIso(-235),
      endDate: dayIso(130),
      ownerId: usersByShort.ay.id,
      terms:
        "Master terms governing all Atlas work — monthly net-15 billing, IP assignment on full payment, " +
        "mutual indemnification capped at fees paid in the prior 12 months, and a 30-day cure period for material breach.",
    });
    await lifecycle(msa.id, "accepted", { sent: -265, signed: -252 });

    const sow = await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Platform 2.0 Statement of Work",
      type: "sow",
      counterparty: "Acme Corporation",
      value: 180000,
      currency: "USD",
      startDate: dayIso(-150),
      endDate: dayIso(45),
      ownerId: usersByShort.ay.id,
      terms:
        "Fixed-fee SOW for the Atlas Platform 2.0 delivery across six monthly milestones. Acceptance criteria " +
        "defined per epic; any scope change requires a written amendment. GA cutoff drives the final milestone.",
    });
    await lifecycle(sow.id, "accepted", { sent: -172, signed: -170 });

    const nda = await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Mutual Non-Disclosure Agreement",
      type: "nda",
      counterparty: "Globex Industries",
      startDate: dayIso(-193),
      endDate: dayIso(537),
      ownerId: usersByShort.mk.id,
      terms:
        "Two-year mutual NDA covering evaluation of the analytics module for a potential Globex partnership. " +
        "Standard carve-outs for residual knowledge and independently developed IP; confidential info marked in writing.",
    });
    await lifecycle(nda.id, "accepted", { sent: -198, signed: -193 });

    const analytics = await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Analytics Module Statement of Work",
      type: "sow",
      counterparty: "Contoso Ltd",
      value: 96000,
      currency: "USD",
      ownerId: usersByShort.ay.id,
      terms:
        "Time-and-materials SOW for the reporting & analytics module — 480 hours over 12 weeks at the standard " +
        "rate card (Appendix A). Awaiting Contoso counter-signature; work blocked until accepted.",
    });
    await lifecycle(analytics.id, "sent", { sent: -6 });

    await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Mobile Companion App Proposal",
      type: "proposal",
      counterparty: "Initech",
      value: 54000,
      currency: "USD",
      ownerId: usersByShort.jb.id,
      terms:
        "Draft proposal for an iOS + Android companion app scoped off the Atlas API. Fixed price, 10-week build. " +
        "Scope, timeline, and rate pending internal review before sending to Initech.",
    });

    const migration = await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Data Migration SOW",
      type: "sow",
      counterparty: "Hooli",
      value: 32000,
      currency: "USD",
      startDate: dayIso(-269),
      endDate: dayIso(-176),
      ownerId: usersByShort.mk.id,
      terms:
        "One-off data migration from the Hooli legacy CRM — completed and accepted. Retained for audit; " +
        "no active obligations. Renewal not requested.",
    });
    await lifecycle(migration.id, "expired", { sent: -284, signed: -279 });

    const sla = await miscRepo.insertAgreement({
      projectId: atlas.id,
      title: "Support & SLA Addendum",
      type: "contract",
      counterparty: "Acme Corporation",
      value: 48000,
      currency: "USD",
      startDate: dayIso(-359),
      endDate: dayIso(12),
      ownerId: usersByShort.mk.id,
      terms:
        "Annual support addendum — 99.9% uptime SLA, 4-hour P1 response, 50 support hours/month included. " +
        "Expires soon; renewal quote in flight.",
    });
    await lifecycle(sla.id, "accepted", { sent: -374, signed: -369 });
  }

  /* ---------------- Epics + epic links — additive backfill ---------------- */
  // mirrors the prototype's epic layer (board epic grouping): four epic rows
  // whose descriptions carry the goal text, then children linked via epic_id.
  // Guarded by order/epicId so it no-ops once present.
  {
    const EPIC_SEED: {
      order: number;
      title: string;
      goal: string;
      owner: keyof typeof usersByShort;
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
        statusId: statusByShort[e.status].id,
        assigneeId: usersByShort[e.owner].id,
        reporterId: aisha.id,
        priority: "high",
        typeId: typeByShort.epic.id,
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

  /* ---------------- Comments (for the task drawer) ---------------- */
  if (!pgSeeded) {
    const ssoTask = parents.find((t) => t.title === "Implement OAuth2 SSO flow");
    if (ssoTask) {
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
  }

  /* ---------------- Other projects (minimal shape so switching lands on a
     usable board — statuses + a few tasks each; only Atlas is fully seeded) ---------------- */
  // projects live in Postgres — the board content (statuses + starter tasks)
  // is what this half seeds, keyed by the DB project row
  const sideProject = async (
    key: string,
    titles: [string, number][], // [title, statusIndex] — indexes into the 5 statuses
  ) => {
    const p = projectByKey(key);
    const already = (await taskRepo.listStatuses(p.id)).length > 0;
    if (already) return p;
    const statuses = await Promise.all(
      statusDefs.map((s) => taskRepo.insertStatus({ ...s, projectId: p.id })),
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
    return p;
  };

  await sideProject(
    "MOB",
    [
      ["Set up React Native scaffold", 4],
      ["Push notifications proof of concept", 2],
      ["Offline task cache", 1],
      ["App Store screenshots", 0],
    ],
  );
  await sideProject(
    "NOT",
    [
      ["Reading list: shipping for startups", 1],
      ["Weekly review template", 4],
      ["Ideas parking lot", 0],
    ],
  );
  await sideProject(
    "DWH",
    [
      ["Source-system inventory", 4],
      ["Model dim_customer v1", 2],
      ["Nightly ELT failure alerts", 1],
      ["Backfill 2025 orders", 0],
    ],
  );
  await sideProject(
    "BRD",
    [
      ["Logo explorations round 2", 2],
      ["Typography shortlist", 1],
      ["Website color tokens", 0],
      ["Stakeholder review deck", 1],
    ],
  );
  await sideProject(
    "MKT",
    [
      ["Pricing page copy", 2],
      ["CMS migration plan", 1],
      ["SEO audit fixes", 4],
      ["Launch checklist", 0],
    ],
  );
  await sideProject(
    "OPS",
    [
      ["Invoice sync job", 2],
      ["Onboarding runbook", 4],
      ["Alert routing rules", 1],
      ["Quarterly access review", 0],
    ],
  );

}
