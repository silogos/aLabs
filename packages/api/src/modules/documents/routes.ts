/** Documents routes — spaces, pages (with revisions), files, search. */
import { Hono } from "hono";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { store } from "../../db/store";
import { UPLOADS_DIR } from "../../lib/uploads";
import {
  uuidv7,
  spaceCreate,
  pageCreate,
  pageUpdate,
  contentSchema,
  paginationQuery,
  paginate,
} from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { created, data, noContent, paginated } from "../../lib/responses";
import { parseBody, parseQuery } from "../../lib/validate";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const documents = new Hono<{ Variables: Vars }>();
documents.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

// ---- file uploads (images) ----
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const IMAGE_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/x-icon": ".ico",
};
function extFromName(name: string): string | undefined {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? `.${m[1].toLowerCase()}` : undefined;
}

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
    content: { type: "doc", content: [{ type: "paragraph" }] },
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

// ---- files (multipart image upload → local disk + files catalog) ----
documents.post("/documents/files", requirePermission("file:upload"), async (c) => {
  const user = c.get("user")!;
  const pid = pidOf(c);
  const body = await c.req.parseBody();
  const file = body["file"];
  if (!(file instanceof File)) throw badRequest("Missing 'file' part");
  if (!file.type.startsWith("image/")) throw badRequest("Only image uploads are supported");
  if (file.size > MAX_UPLOAD_BYTES) throw badRequest("File too large (5 MB max)");

  const ext = IMAGE_EXT[file.type] ?? extFromName(file.name) ?? "";
  const id = uuidv7();
  const fname = `${id}${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(join(UPLOADS_DIR, fname), Buffer.from(await file.arrayBuffer()));
  const f = {
    id,
    projectId: pid,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url: `/uploads/${fname}`,
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
