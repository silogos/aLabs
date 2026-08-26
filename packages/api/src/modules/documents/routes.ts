/** Documents routes — spaces, pages (with revisions), files, search.
 *  All rows live in Postgres (db/doc-repo.ts). */
import { Hono } from "hono";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as docRepo from "../../db/doc-repo";
import { UPLOADS_DIR, MAX_UPLOAD_BYTES, imageExt } from "../../lib/uploads";
import {
  uuidv7,
  spaceCreate,
  pageCreate,
  pageUpdate,
  pageSearchQuery,
  contentSchema,
  paginationQuery,
  paginate,
} from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { created, data, noContent, paginated } from "../../lib/responses";
import { parseJsonBody, parseQuery, pickDefined } from "../../lib/validate";
import { projectContext, projectIdOf } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const documents = new Hono<{ Variables: Vars }>();
documents.use("*", projectContext);

// ---- spaces ----
documents.get("/documents/spaces", requirePermission("document:view"), async (c) =>
  data(c, await docRepo.listSpaces(projectIdOf(c))),
);
documents.post("/documents/spaces", requirePermission("document:create"), async (c) => {
  const pid = projectIdOf(c);
  const input = await parseJsonBody(c, spaceCreate);
  const s = await docRepo.insertSpace({
    projectId: pid,
    name: input.name,
    icon: input.icon ?? null,
    order: await docRepo.countSpaces(pid),
  });
  return created(c, s);
});
documents.delete("/documents/spaces/:id", requirePermission("document:delete"), async (c) => {
  const pid = projectIdOf(c);
  const s = await docRepo.getSpace(pid, c.req.param("id")!);
  if (!s) throw notFound();
  await docRepo.softDeleteSpace(pid, s.id);
  return noContent(c);
});

// ---- pages ----
documents.get("/documents/pages", requirePermission("document:view"), async (c) => {
  const q = parseQuery(c.req.query(), paginationQuery);
  const rows = (await docRepo.listPages(projectIdOf(c))).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  return paginated(c, paginate(rows, q));
});
documents.post("/documents/pages", requirePermission("document:create"), async (c) => {
  const user = c.get("user")!;
  const input = await parseJsonBody(c, pageCreate);
  const space = await docRepo.getSpace(projectIdOf(c), input.spaceId);
  if (!space) throw notFound("Space not found");
  const page = await docRepo.insertPage({
    projectId: projectIdOf(c),
    spaceId: input.spaceId,
    parentId: input.parentId ?? null,
    title: input.title ?? "Untitled",
    icon: input.icon ?? null,
    content: { type: "doc", content: [{ type: "paragraph" }] },
    editedBy: user.id,
  });
  return created(c, page);
});
documents.get("/documents/pages/:id", requirePermission("document:view"), async (c) => {
  return data(c, await findPage(c));
});
documents.patch("/documents/pages/:id", requirePermission("document:update"), async (c) => {
  const user = c.get("user")!;
  const p = await findPage(c);
  const input = await parseJsonBody(c, pageUpdate);
  if (input.updatedAt && input.updatedAt !== p.updatedAt) throw conflict("Page was modified");
  if (input.content) {
    const parsed = contentSchema.safeParse(input.content);
    if (!parsed.success) throw badRequest("Invalid page content");
  }
  const patch: Parameters<typeof docRepo.patchPage>[2] = pickDefined(input, [
    "spaceId",
    "parentId",
    "title",
    "icon",
  ] as const);
  if (input.content) patch.content = input.content;
  const updated = await docRepo.patchPage(p.id, p.updatedAt, patch, user.id);
  if (!updated) throw conflict("Page was modified");
  return data(c, updated);
});
documents.delete("/documents/pages/:id", requirePermission("document:delete"), async (c) => {
  const p = await findPage(c);
  await docRepo.softDeletePage(p.id);
  return noContent(c);
});
documents.get("/documents/pages/:id/revisions", requirePermission("document:view"), (c) =>
  data(c, []),
);

// ---- files (multipart image upload → local disk + files catalog) ----
documents.post("/documents/files", requirePermission("file:upload"), async (c) => {
  const user = c.get("user")!;
  const pid = projectIdOf(c);
  const body = await c.req.parseBody();
  const file = body["file"];
  if (!(file instanceof File)) throw badRequest("Missing 'file' part");
  if (!file.type.startsWith("image/")) throw badRequest("Only image uploads are supported");
  if (file.size > MAX_UPLOAD_BYTES) throw badRequest("File too large (5 MB max)");

  const ext = imageExt(file.type, file.name);
  const id = uuidv7();
  const fname = `${id}${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(join(UPLOADS_DIR, fname), Buffer.from(await file.arrayBuffer()));
  const f = await docRepo.insertFile({
    projectId: pid,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url: `/uploads/${fname}`,
    uploadedBy: user.id,
  });
  return created(c, f);
});
documents.get("/documents/files", requirePermission("document:view"), async (c) =>
  data(c, await docRepo.listFiles(projectIdOf(c))),
);

// ---- search ----
documents.get("/documents/search", requirePermission("document:view"), async (c) => {
  const { q } = parseQuery(c.req.query(), pageSearchQuery);
  const needle = (q ?? "").toLowerCase();
  const rows = (await docRepo.listPages(projectIdOf(c)))
    .filter((p) => p.title.toLowerCase().includes(needle))
    .slice(0, 20);
  return data(c, rows);
});

async function findPage(c: Ctx) {
  const p = await docRepo.getPage(projectIdOf(c), c.req.param("id")!);
  if (!p) throw notFound();
  return p;
}
