/** Documents routes — spaces, pages (with revisions), files, search. */
import { Hono } from "hono";
import { z } from "zod";
import { store } from "../../db/store.js";
import {
  uuidv7,
  spaceCreate,
  pageCreate,
  pageUpdate,
  contentSchema,
  paginationQuery,
  paginate,
} from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { created, data, noContent, paginated } from "../../lib/responses.js";
import { parseBody, parseQuery } from "../../lib/validate.js";
import { projectContext, currentTenant } from "../../lib/tenant.js";
import { requirePermission } from "../../lib/permission.js";
import type { Vars, Ctx } from "../../lib/ctx.js";

export const documents = new Hono<{ Variables: Vars }>();
documents.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

// ---- spaces ----
documents.get("/documents/spaces", requirePermission("document:view"), (c) =>
  data(c, store.spaces.filter((s) => s.projectId === pidOf(c) && !s.deletedAt).sort((a, b) => a.order - b.order)),
);
documents.post("/documents/spaces", requirePermission("document:create"), async (c) => {
  const pid = pidOf(c);
  const input = parseBody(await c.req.json(), spaceCreate);
  const s = {
    id: uuidv7(),
    projectId: pid,
    name: input.name,
    icon: input.icon ?? null,
    order: store.spaces.filter((s) => s.projectId === pid).length,
    createdAt: new Date().toISOString(),
    deletedAt: null as string | null,
  };
  store.spaces.push(s);
  return created(c, s);
});

// ---- pages ----
documents.get("/documents/pages", requirePermission("document:view"), (c) => {
  const q = parseQuery(c.req.query(), paginationQuery);
  const rows = store.pages
    .filter((p) => p.projectId === pidOf(c) && !p.deletedAt)
    .sort((a, b) => a.title.localeCompare(b.title));
  return paginated(c, paginate(rows, q));
});
documents.post("/documents/pages", requirePermission("document:create"), async (c) => {
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), pageCreate);
  const space = store.spaces.find((s) => s.id === input.spaceId && s.projectId === pidOf(c));
  if (!space) throw notFound("Space not found");
  const page = {
    id: uuidv7(),
    projectId: pidOf(c),
    spaceId: input.spaceId,
    parentId: input.parentId ?? null,
    title: input.title,
    content: [],
    icon: input.icon ?? null,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    editedBy: user,
  };
  store.pages.push(page);
  return created(c, page);
});
documents.get("/documents/pages/:id", requirePermission("document:view"), (c) => {
  const p = findPage(c);
  return data(c, p);
});
documents.patch("/documents/pages/:id", requirePermission("document:update"), async (c) => {
  const user = c.get("user")!;
  const p = findPage(c);
  const input = parseBody(await c.req.json(), pageUpdate);
  if (input.updatedAt && input.updatedAt !== p.updatedAt) throw conflict("Page was modified");
  if (input.content) {
    const parsed = contentSchema.safeParse(input.content);
    if (!parsed.success) throw badRequest("Invalid page content");
  }
  for (const k of ["spaceId", "parentId", "title", "icon"] as const) {
    if (input[k] !== undefined) (p as Record<string, unknown>)[k] = input[k];
  }
  if (input.content) p.content = input.content;
  p.updatedAt = new Date().toISOString();
  p.editedBy = user;
  return data(c, p);
});
documents.delete("/documents/pages/:id", requirePermission("document:delete"), (c) => {
  const p = findPage(c);
  p.deletedAt = new Date().toISOString();
  return noContent(c);
});
documents.get("/documents/pages/:id/revisions", requirePermission("document:view"), (c) =>
  data(c, []),
);

// ---- files ----
documents.post("/documents/files", requirePermission("file:upload"), async (c) => {
  const user = c.get("user")!;
  const body = parseBody(
    await c.req.json(),
    z.object({ name: z.string(), mimeType: z.string(), size: z.number(), url: z.string() }),
  );
  const f = {
    id: uuidv7(),
    projectId: pidOf(c),
    name: body.name,
    mimeType: body.mimeType,
    size: body.size,
    url: body.url,
    uploadedBy: user,
    createdAt: new Date().toISOString(),
    deletedAt: null as string | null,
  };
  store.files.push(f);
  return created(c, f);
});
documents.get("/documents/files", requirePermission("document:view"), (c) =>
  data(c, store.files.filter((f) => f.projectId === pidOf(c) && !f.deletedAt)),
);

// ---- search ----
documents.get("/documents/search", requirePermission("document:view"), (c) => {
  const q = (c.req.query("q") ?? "").toLowerCase();
  const rows = store.pages
    .filter((p) => p.projectId === pidOf(c) && !p.deletedAt && p.title.toLowerCase().includes(q))
    .slice(0, 20);
  return data(c, rows);
});

function findPage(c: Ctx) {
  const id = c.req.param("id");
  const p = store.pages.find((x) => x.id === id && x.projectId === pidOf(c) && !x.deletedAt);
  if (!p) throw notFound();
  return p;
}
