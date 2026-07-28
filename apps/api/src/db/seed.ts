/**
 * Seed the in-memory store with the Helix demo data — mirrors the
 * `helix-app.html` prototype 1:1 so the web app renders identically.
 *
 * Idempotent: `store.seeded` guards re-runs.
 */
import { uuidv7 } from "@pmin/core";
import {
  SYSTEM_WORKSPACE_ROLES,
  SYSTEM_PROJECT_ROLES,
} from "@pmin/core";
import type { TaskPriority, Block } from "@pmin/core";
import { store, type ActivityEntry } from "./store.js";

const now = () => new Date();
const iso = (d: Date = now()) => d.toISOString();

/** Idempotent seed. */
export function seed(): void {
  if (store.seeded) return;

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

  /* ---------------- Users ---------------- */
  const seedUser = (name: string, email: string) => {
    const u = {
      id: uuidv7(),
      name,
      email,
      image: null,
      emailVerified: true,
      createdAt: iso(),
      updatedAt: iso(),
    };
    store.users.push(u);
    return u;
  };
  const aisha = seedUser("Aisha Yusuf", "aisha@northwind.io");
  const marco = seedUser("Marco Keller", "marco@northwind.io");
  const lin = seedUser("Lin Chen", "lin@northwind.io");
  const diego = seedUser("Diego Pereira", "diego@northwind.io");
  const sara = seedUser("Sara Reinhardt", "sara@northwind.io");
  const jonas = seedUser("Jonas Berg", "jonas@northwind.io");
  const usersByShort = { ay: aisha, mk: marco, lc: lin, dp: diego, sr: sara, jb: jonas };

  /* ---------------- Roles ---------------- */
  for (const r of [...SYSTEM_WORKSPACE_ROLES, ...SYSTEM_PROJECT_ROLES]) {
    const role = {
      id: uuidv7(),
      organizationId: null,
      scope: r.scope,
      name: r.name,
      isSystem: true,
      permissions: r.permissions,
    };
    store.roles.push(role);
    store.rolePermissions[r.name] = r.permissions;
  }
  const workspaceRole = (name: string) => store.roles.find((r) => r.scope === "workspace" && r.name === name)!;

  /* ---------------- Organization ---------------- */
  const northwind = {
    id: uuidv7(),
    name: "Northwind",
    slug: "northwind",
    logo: null,
    description: "Software House",
    timezone: "UTC",
    language: "en",
    website: "https://northwind.io",
    createdAt: iso(),
    updatedAt: iso(),
  };
  store.organizations.push(northwind);

  const makeMember = (user: typeof aisha, roleName: string) => {
    const m = {
      id: uuidv7(),
      organizationId: northwind.id,
      userId: user.id,
      role: workspaceRole(roleName),
      status: "active" as const,
      joinedAt: iso(),
      user,
      createdAt: iso(),
      updatedAt: iso(),
    };
    store.members.push(m);
    return m;
  };
  makeMember(aisha, "Owner");
  makeMember(marco, "Admin");
  makeMember(lin, "Member");
  makeMember(diego, "Member");
  makeMember(sara, "Member");
  makeMember(jonas, "Member");

  /* ---------------- Project ---------------- */
  const atlas = {
    id: uuidv7(),
    organizationId: northwind.id,
    name: "Atlas Platform 2.0",
    slug: "atlas-platform-2",
    key: "ATL",
    description: "Unified delivery, documentation, planning & client portal.",
    icon: "A",
    status: "active" as const,
    visibility: "organization" as const,
    createdAt: iso(),
    updatedAt: iso(),
  };
  store.projects.push(atlas);

  /* ---------------- Task statuses (design uses 5 columns) ---------------- */
  const statusDefs: Array<{ name: string; order: number; color: string; isDefault: boolean }> = [
    { name: "Backlog", order: 0, color: "var(--faint)", isDefault: false },
    { name: "To Do", order: 1, color: "var(--muted)", isDefault: true },
    { name: "In Progress", order: 2, color: "var(--info)", isDefault: false },
    { name: "In Review", order: 3, color: "var(--violet)", isDefault: false },
    { name: "Done", order: 4, color: "var(--ok)", isDefault: false },
  ];
  for (const s of statusDefs) {
    store.taskStatuses.push({
      id: uuidv7(),
      projectId: atlas.id,
      name: s.name,
      color: s.color,
      order: s.order,
      isDefault: s.isDefault,
    });
  }
  const statusByShort: Record<string, (typeof store.taskStatuses)[number]> = {
    backlog: store.taskStatuses[0],
    todo: store.taskStatuses[1],
    progress: store.taskStatuses[2],
    review: store.taskStatuses[3],
    done: store.taskStatuses[4],
  };
  const statusByName = (n: string) => store.taskStatuses.find((s) => s.name === n)!;

  /* ---------------- Task types ---------------- */
  for (const name of ["Task", "Bug", "Feature", "Epic"]) {
    store.taskTypes.push({ id: uuidv7(), projectId: atlas.id, name });
  }
  const typeByShort: Record<string, (typeof store.taskTypes)[number]> = {
    task: store.taskTypes[0],
    bug: store.taskTypes[1],
    feat: store.taskTypes[2],
    epic: store.taskTypes[3],
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
  for (const n of labelNames) {
    store.taskLabels.push({ id: uuidv7(), projectId: atlas.id, name: n, color: null });
  }
  const labelByName = (n: string) => store.taskLabels.find((l) => l.name === n)!;

  /* ---------------- Iterations ---------------- */
  const iter = (
    name: string,
    goal: string | null,
    start: string,
    end: string,
    status: "planned" | "active" | "completed",
  ) => {
    const it = {
      id: uuidv7(),
      projectId: atlas.id,
      name,
      goal,
      startDate: start,
      endDate: end,
      status,
      committedPoints: 0,
      completedPoints: 0,
      progress: 0,
      createdAt: iso(),
      updatedAt: iso(),
    };
    store.iterations.push(it);
    return it;
  };
  const sprint13 = iter("Sprint 13", "Module scaffolding", dayIso(-24), dayIso(-11), "completed");
  const sprint14 = iter(
    "Sprint 14 — SSO + Audit-log MVP",
    "Ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. Client-portal scaffolding visible but read-only.",
    dayIso(-10),
    dayIso(4),
    "active",
  );
  const sprint15 = iter("Sprint 15", null, dayIso(5), dayIso(18), "planned");

  /* ---------------- Milestones ---------------- */
  const ms = (
    name: string,
    desc: string,
    due: string,
    status: "planned" | "reached",
    total: number,
    done: number,
  ) => {
    const m = {
      id: uuidv7(),
      projectId: atlas.id,
      name,
      description: desc,
      dueDate: due,
      status,
      totalTasks: total,
      doneTasks: done,
      progress: Math.round((done / total) * 100),
      createdAt: iso(),
      updatedAt: iso(),
    };
    store.milestones.push(m);
    return m;
  };
  const v2Beta = ms("v2.0 Beta release", "Public beta of Helix 2.0", dayIso(6), "planned", 25, 18);
  const designSystem = ms("Design System v1", "Component library + tokens", dayIso(21), "planned", 20, 11);
  const security = ms("Security hardening", "Audit log, SSO, rate limiting", dayIso(39), "planned", 20, 6);

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

  for (const d of designTasks) {
    const parent = {
      id: uuidv7(),
      projectId: atlas.id,
      title: d.t,
      description: null,
      statusId: statusByShort[d.s].id,
      assigneeId: usersByShort[d.a].id,
      reporterId: aisha.id,
      priority: PRIO[d.p],
      typeId: typeByShort[d.ty].id,
      parentId: null,
      iterationId: d.s === "backlog" ? null : sprint14.id,
      milestoneId:
        d.lb.includes("security") || d.lb.includes("sso") || d.lb.includes("auth")
          ? security.id
          : d.lb.includes("design")
            ? designSystem.id
            : v2Beta.id,
      dueDate: dueIso(d.due),
      order: d.id,
      labels: d.lb.map(labelByName),
      estimate: d.pts,
      createdAt: iso(),
      updatedAt: iso(),
    };
    store.tasks.push(parent);
    // subtasks → real child tasks
    for (const [n, desc, done] of d.sub) {
      store.tasks.push({
        id: uuidv7(),
        projectId: atlas.id,
        title: desc,
        description: null,
        statusId: (done ? statusByName("Done") : statusByName("To Do")).id,
        assigneeId: usersByShort[d.a].id,
        reporterId: aisha.id,
        priority: PRIO[d.p],
        typeId: typeByShort[d.ty].id,
        parentId: parent.id,
        iterationId: parent.iterationId,
        milestoneId: parent.milestoneId,
        dueDate: parent.dueDate,
        order: n,
        labels: [],
        estimate: null,
        createdAt: iso(),
        updatedAt: iso(),
      });
    }
  }

  // wire iteration points
  const points = (filter: (t: (typeof store.tasks)[number]) => boolean) =>
    store.tasks.filter((t) => !t.parentId && filter(t)).reduce((n, t) => n + (t.estimate ?? 0), 0);
  sprint14.committedPoints = 52;
  sprint14.completedPoints = points((t) => t.iterationId === sprint14.id && t.statusId === statusByShort.done.id);
  sprint14.progress = Math.round((sprint14.completedPoints / sprint14.committedPoints) * 100);
  sprint13.committedPoints = points((t) => t.iterationId === sprint13.id);
  sprint13.completedPoints = sprint13.committedPoints;
  sprint13.progress = 100;

  /* ---------------- Document spaces + pages ---------------- */
  const spaces = (name: string, icon: string, order: number) => {
    const s = { id: uuidv7(), projectId: atlas.id, name, icon, order, createdAt: iso() };
    store.spaces.push(s);
    return s;
  };
  const product = spaces("Product", "📐", 0);
  const engineering = spaces("Engineering", "⚙️", 1);
  const design = spaces("Design", "🎨", 2);
  const client = spaces("Client", "🤝", 3);
  const legal = spaces("Legal", "⚖️", 4);

  const page = (space: ReturnType<typeof spaces>, title: string, icon: string, content: Block[]) => {
    const p = {
      id: uuidv7(),
      projectId: atlas.id,
      spaceId: space.id,
      parentId: null,
      title,
      content,
      icon,
      order: 0,
      createdAt: iso(),
      updatedAt: iso(),
      editedBy: marco,
    };
    store.pages.push(p);
    return p;
  };

  page(product, "Vision & positioning", "🎯", [
    { id: "1", type: "heading2", data: { text: "Vision" } },
    {
      id: "2",
      type: "paragraph",
      data: {
        text: "A project management platform purpose-built for software delivery — simple enough for a two-person team, scalable enough for an enterprise. Most tools track tasks or store documents. Helix unifies delivery, documentation, planning, and client communication in one place.",
      },
    },
    {
      id: "3",
      type: "callout",
      data: { variant: "info", text: "AI is an optional enhancement, never the core experience. Every feature works without it." },
    },
    { id: "4", type: "heading2", data: { text: "Differentiators" } },
    { id: "5", type: "todo", data: { text: "Documentation is a first-class citizen", checked: true } },
    { id: "6", type: "todo", data: { text: "Built-in client transparency", checked: true } },
    { id: "7", type: "todo", data: { text: "Seat-free pricing — we charge for value", checked: true } },
    { id: "8", type: "todo", data: { text: "Refine ICP sizing assumptions", checked: false } },
  ]);

  page(engineering, "Architecture", "🏛️", [
    {
      id: "1",
      type: "callout",
      data: { variant: "info", text: "Source of truth. This doc governs all module work. ADRs live under Engineering → ADRs; changes here require an ADR." },
    },
    { id: "2", type: "heading2", data: { text: "Hierarchy" } },
    {
      id: "3",
      type: "paragraph",
      data: {
        text: "Helix is strictly hierarchical: User → Organization → Project → Modules. Every business activity belongs to a Project — nothing floats free. Data is isolated per organization; multi-tenancy is enforced at the database layer, not the application layer.",
      },
    },
    { id: "4", type: "heading2", data: { text: "Foundation & modules" } },
    {
      id: "5",
      type: "paragraph",
      data: {
        text: "A shared Foundation (Authentication, Organization, Project) underpins every module. Delivery modules (Task, Planning) and Knowledge modules (Documents) build on it directly.",
      },
    },
    { id: "6", type: "todo", data: { text: "Define the tenancy boundary at the org level", checked: true } },
    { id: "7", type: "todo", data: { text: "Scope every module to a project", checked: true } },
    { id: "8", type: "todo", data: { text: "Document the read-replica strategy for reporting", checked: false } },
    { id: "9", type: "heading2", data: { text: "Stack" } },
    {
      id: "10",
      type: "bulletList",
      data: {
        items: [
          "Frontend · React · TypeScript — large hiring pool, end-to-end type safety",
          "Backend · Hono — lightweight, edge-ready, fast",
          "Database · PostgreSQL — relational integrity for hierarchical multi-tenant data",
          "ORM · Drizzle — SQL-first, predictable, type-safe",
          "Auth · Better Auth — sessions & organizations without a managed vendor",
        ],
      },
    },
    {
      id: "16",
      type: "callout",
      data: { variant: "warning", text: "Open decision. Object storage & search providers are still TBD — see Pending Decisions in the README." },
    },
  ]);

  page(engineering, "Data model", "🗄️", [
    { id: "1", type: "heading2", data: { text: "Core entities" } },
    {
      id: "2",
      type: "paragraph",
      data: { text: "Tasks, Documents, Planning, and Meetings each own their tables, scoped by projectId. There are no cross-project foreign keys." },
    },
    {
      id: "3",
      type: "code",
      data: {
        language: "sql",
        text: "-- task is the primary unit of execution\nCREATE TABLE task (\n  id          uuid PRIMARY KEY,\n  project_id  uuid NOT NULL REFERENCES project,\n  title       text NOT NULL,\n  status_id   uuid NOT NULL REFERENCES task_status,\n  assignee_id uuid,\n  priority    task_priority NOT NULL DEFAULT 'medium',\n  due_date    timestamptz,\n  CONSTRAINT within_project CHECK (...)\n);",
      },
    },
    {
      id: "4",
      type: "callout",
      data: { variant: "info", text: "Subtasks are self-referential via parent_id; progress rolls up to the parent." },
    },
    { id: "5", type: "paragraph", data: { text: "See the full schema in 03-data-model.md." } },
  ]);

  page(engineering, "API contract", "🔌", [
    { id: "1", type: "heading2", data: { text: "Conventions" } },
    {
      id: "2",
      type: "paragraph",
      data: { text: "RESTful, JSON, cursor-based pagination. Every route is scoped under an organization and project." },
    },
    {
      id: "3",
      type: "code",
      data: {
        language: "http",
        text: "# list tasks in a project\nGET /orgs/{orgId}/projects/{projectId}/tasks\n     ?status=progress&assignee=me&cursor={cursor}\n\n# 200 OK\n{ \"data\": [...], \"nextCursor\": \"...\", \"hasMore\": true }",
      },
    },
    {
      id: "4",
      type: "paragraph",
      data: { text: "Every endpoint is guarded by a capability check: task:view, task:create, document:update, and so on. Capabilities are derived from the member's role in the org and project." },
    },
  ]);

  page(product, "Roadmap", "🗺️", [
    { id: "1", type: "heading2", data: { text: "Phasing" } },
    {
      id: "2",
      type: "paragraph",
      data: { text: "Phase 1 Foundation → Phase 2 Task & Documents → Phase 3 Planning & Meetings → Phase 4 Client portal & Governance → Phase 5 Notifications & Billing → Phase 6 AI add-on." },
    },
    { id: "3", type: "todo", data: { text: "Foundation shipped", checked: true } },
    { id: "4", type: "todo", data: { text: "Task & Documents in beta", checked: true } },
    { id: "5", type: "todo", data: { text: "Planning module — active sprint", checked: false } },
  ]);
  page(product, "Pricing model", "💲", [
    { id: "1", type: "paragraph", data: { text: "Seat-free. We charge for projects and features, not people." } },
  ]);
  page(product, "Personas", "👥", [
    { id: "1", type: "paragraph", data: { text: "Product Manager, Project Manager, Business Analyst, Software Engineer, QA Engineer, UI/UX Designer." } },
  ]);
  page(engineering, "ADRs", "📋", [
    { id: "1", type: "paragraph", data: { text: "Architecture Decision Records live here." } },
  ]);
  page(engineering, "Conventions", "📜", [
    { id: "1", type: "heading2", data: { text: "Coding standards" } },
    {
      id: "2",
      type: "paragraph",
      data: { text: "TypeScript strict mode everywhere, no any without an inline justification. Naming is camelCase for code, snake_case for database columns." },
    },
    {
      id: "3",
      type: "callout",
      data: { variant: "warning", text: "Every architectural decision gets an ADR before the PR merges." },
    },
  ]);
  page(design, "Design system", "🎨", [
    { id: "1", type: "paragraph", data: { text: "Tokens, type scale, and component primitives." } },
  ]);
  page(design, "Component library", "🧩", [
    { id: "1", type: "paragraph", data: { text: "React component library shared across the app." } },
  ]);
  page(client, "Northwind SOW", "📄", [
    { id: "1", type: "paragraph", data: { text: "Statement of work for the Atlas Platform 2.0 engagement." } },
  ]);
  page(client, "Status report — Mar", "📊", [
    { id: "1", type: "paragraph", data: { text: "March status report shared with the client." } },
  ]);
  page(legal, "Master services agreement", "📑", [
    { id: "1", type: "paragraph", data: { text: "MSA between Northwind and the client." } },
  ]);

  /* ---------------- Files ---------------- */
  const file = (name: string, mimeType: string, size: number, icon: string, uploadedBy: typeof aisha) => {
    store.files.push({
      id: uuidv7(),
      projectId: atlas.id,
      name,
      mimeType,
      size,
      url: `files/${icon}/${name}`,
      uploadedBy,
      createdAt: iso(),
    });
  };
  file("design-system.fig", "application/figma", 24100000, "fig", jonas);
  file("northwind-sow.pdf", "application/pdf", 880000, "pdf", aisha);
  file("data-model-v3.png", "image/png", 1200000, "img", diego);
  file("openapi.yaml", "text/yaml", 96000, "yml", marco);
  file("brand-guidelines.pdf", "application/pdf", 12000000, "doc", jonas);
  file("assets-export.zip", "application/zip", 8400000, "zip", lin);

  /* ---------------- Activity feed ---------------- */
  const activity = (
    kind: ActivityEntry["kind"],
    actor: keyof typeof usersByShort,
    target: string,
    whenLabel: string,
    minutesAgo: number,
  ): ActivityEntry => {
    const e = {
      id: uuidv7(),
      kind,
      projectId: atlas.id,
      actorId: usersByShort[actor].id,
      target,
      when: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      whenLabel,
    };
    store.activity.push(e);
    return e;
  };
  activity("move", "mk", "ATL-101", "12 minutes ago", 12);
  activity("doc", "jb", "Design System v1", "38 minutes ago", 38);
  activity("com", "dp", "ATL-103", "1 hour ago", 60);
  activity("done", "sr", "ATL-112", "2 hours ago", 120);
  activity("mile", "ay", "Security hardening", "3 hours ago", 180);
  activity("done", "lc", "ATL-113", "5 hours ago", 300);

  /* ---------------- Notifications ---------------- */
  store.notifications.push({
    id: uuidv7(),
    userId: aisha.id,
    type: "mention",
    title: "Marco mentioned you on ATL-101",
    body: "Can you review the PKCE verifier before EOD?",
    link: "/tasks/101",
    readAt: null,
    createdAt: iso(),
  });
  store.notifications.push({
    id: uuidv7(),
    userId: aisha.id,
    type: "due",
    title: "ATL-116 is due today",
    body: "Backlog grooming: triage queue",
    link: "/tasks/116",
    readAt: null,
    createdAt: iso(),
  });

  /* ---------------- Demo session (auto-login as Aisha) ---------------- */
  store.sessions.push({
    token: "demo-" + aisha.id,
    userId: aisha.id,
    createdAt: iso(),
  });

  /* ---------------- Comments (for the task drawer) ---------------- */
  const ssoTask = store.tasks.find((t) => t.title === "Implement OAuth2 SSO flow" && !t.parentId);
  if (ssoTask) {
    store.comments.push({
      id: uuidv7(),
      taskId: ssoTask.id,
      userId: marco.id,
      body: "Blocked on the IdP sandbox credentials — chasing Ops. Unblocked scope: PKCE verifier generation is done.",
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    });
    store.comments.push({
      id: uuidv7(),
      taskId: ssoTask.id,
      userId: sara.id,
      body: "Added a regression test for expired refresh tokens. Looks clean on staging.",
      createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    });
  }

  store.seeded = true;
}
