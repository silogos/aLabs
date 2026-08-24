/** Demo seed: document spaces, pages (native ProseMirror JSON), and the
 *  files catalog. Guarded on an empty spaces table; returns whether the
 *  docs were already seeded (other halves reuse the flag). */
import type { Content, Space } from "@pmin/core";
import * as docRepo from "./doc-repo";
import type { SeedCtx } from "./seed-shared";

export async function seedDocs(ctx: SeedCtx): Promise<boolean> {
  const { atlas } = ctx;
  const docSeeded = (await docRepo.listSpaces(atlas.id)).length > 0;
  if (docSeeded) return true;

  const spaces = (name: string, icon: string, order: number) =>
    docRepo.insertSpace({ projectId: atlas.id, name, icon, order });
  const product = await spaces("Product", "📐", 0);
  const engineering = await spaces("Engineering", "⚙️", 1);
  const design = await spaces("Design", "🎨", 2);
  const client = await spaces("Client", "🤝", 3);
  const legal = await spaces("Legal", "⚖️", 4);

  const marco = ctx.usersByShort.mk;
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

  const jonas = ctx.usersByShort.jb;
  const aisha = ctx.usersByShort.ay;
  const diego = ctx.usersByShort.dp;
  const lin = ctx.usersByShort.lc;
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

  return false;
}
