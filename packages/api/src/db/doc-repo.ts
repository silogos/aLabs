/** Documents repository — Postgres (Drizzle) for spaces, pages, and files.
 *  Domain shapes stay zod-inferred: pages embed their last editor (User) and
 *  files their uploader — both hydrated via joins here. Page content is the
 *  ProseMirror doc stored as jsonb. */
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./pg";
import { spaces, pages, files } from "@pmin/core/db";
import { uuidv7, type Space, type Page, type FileRef, type Content, type User } from "@pmin/core";
import { iso, userMap } from "./mapping";

type SpaceRow = typeof spaces.$inferSelect;
type PageRow = typeof pages.$inferSelect;
type FileRow = typeof files.$inferSelect;

/* ---------------- spaces ---------------- */

const toSpace = (r: SpaceRow): Space => ({
  id: r.id,
  projectId: r.projectId,
  name: r.name,
  icon: r.icon,
  order: r.order,
});

export async function listSpaces(projectId: string): Promise<Space[]> {
  const rows = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.projectId, projectId), isNull(spaces.deletedAt)))
    .orderBy(asc(spaces.order));
  return rows.map(toSpace);
}

export async function getSpace(projectId: string, id: string): Promise<Space | null> {
  const [row] = await db
    .select()
    .from(spaces)
    .where(and(eq(spaces.id, id), eq(spaces.projectId, projectId), isNull(spaces.deletedAt)))
    .limit(1);
  return row ? toSpace(row) : null;
}

export async function countSpaces(projectId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(spaces)
    .where(and(eq(spaces.projectId, projectId), isNull(spaces.deletedAt)));
  return row?.n ?? 0;
}

/** Soft-delete a space and every live page inside it, atomically. */
export async function softDeleteSpace(projectId: string, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const now = new Date();
    await tx
      .update(spaces)
      .set({ deletedAt: now })
      .where(and(eq(spaces.id, id), eq(spaces.projectId, projectId)));
    await tx
      .update(pages)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(pages.spaceId, id), isNull(pages.deletedAt)));
  });
}

export async function insertSpace(input: {
  projectId: string;
  name: string;
  icon?: string | null;
  order?: number;
}): Promise<Space> {
  const [row] = await db
    .insert(spaces)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      name: input.name,
      icon: input.icon ?? null,
      order: input.order ?? 0,
      createdAt: new Date(),
    })
    .returning();
  return toSpace(row!);
}

/* ---------------- pages ---------------- */

export type PageWithMeta = Page & { deletedAt: string | null };

const toPage = (r: PageRow, editedBy?: User | null): PageWithMeta => ({
  id: r.id,
  projectId: r.projectId,
  spaceId: r.spaceId,
  parentId: r.parentId,
  title: r.title,
  content: r.content as Content,
  icon: r.icon,
  editedBy: editedBy ?? null,
  order: r.order,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

/** Hydrate the embedded last-editor for a set of page rows. */
async function withEditors(rows: PageRow[]): Promise<PageWithMeta[]> {
  const byId = await userMap(rows.map((r) => r.editedBy));
  return rows.map((r) => toPage(r, r.editedBy ? byId.get(r.editedBy) ?? null : null));
}

export async function listPages(projectId: string): Promise<PageWithMeta[]> {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.projectId, projectId), isNull(pages.deletedAt)))
    .orderBy(asc(pages.createdAt));
  return withEditors(rows);
}

export async function getPage(projectId: string, id: string): Promise<PageWithMeta | null> {
  const [row] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, id), eq(pages.projectId, projectId), isNull(pages.deletedAt)))
    .limit(1);
  if (!row) return null;
  return (await withEditors([row]))[0]!;
}

export async function insertPage(input: {
  projectId: string;
  spaceId: string;
  parentId?: string | null;
  title?: string;
  icon?: string | null;
  content: Content;
  editedBy?: string | null;
}): Promise<PageWithMeta> {
  const now = new Date();
  const [row] = await db
    .insert(pages)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      spaceId: input.spaceId,
      parentId: input.parentId ?? null,
      title: input.title ?? "Untitled",
      content: input.content,
      icon: input.icon ?? null,
      editedBy: input.editedBy ?? null,
      order: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return (await withEditors([row!]))[0]!;
}

/** Optimistic concurrency: `expectedUpdatedAt` must match or return null. */
export async function patchPage(
  id: string,
  expectedUpdatedAt: string,
  patch: {
    spaceId?: string;
    parentId?: string | null;
    title?: string;
    icon?: string | null;
    content?: Content;
  },
  editedBy?: string,
): Promise<PageWithMeta | null> {
  const [row] = await db
    .update(pages)
    .set({ ...patch, editedBy: editedBy ?? undefined, updatedAt: new Date() })
    .where(and(eq(pages.id, id), eq(pages.updatedAt, new Date(expectedUpdatedAt))))
    .returning();
  if (!row) return null;
  return getPage(row.projectId, id);
}

export async function softDeletePage(id: string): Promise<void> {
  await db
    .update(pages)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(pages.id, id));
}

/* ---------------- files ---------------- */

export type FileWithMeta = FileRef & { deletedAt: string | null };

const toFile = (r: FileRow, uploadedBy?: User | null): FileWithMeta => ({
  id: r.id,
  projectId: r.projectId,
  name: r.name,
  mimeType: r.mimeType,
  size: r.size,
  url: r.url,
  uploadedBy: uploadedBy ?? null,
  createdAt: r.createdAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

export async function listFiles(projectId: string): Promise<FileWithMeta[]> {
  const rows = await db
    .select()
    .from(files)
    .where(and(eq(files.projectId, projectId), isNull(files.deletedAt)))
    .orderBy(asc(files.createdAt));
  const byId = await userMap(rows.map((r) => r.uploadedBy));
  return rows.map((r) => toFile(r, r.uploadedBy ? byId.get(r.uploadedBy) ?? null : null));
}

export async function insertFile(input: {
  projectId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy?: string | null;
}): Promise<FileWithMeta> {
  const [row] = await db
    .insert(files)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      name: input.name,
      mimeType: input.mimeType,
      size: input.size,
      url: input.url,
      uploadedBy: input.uploadedBy ?? null,
      createdAt: new Date(),
    })
    .returning();
  return toFile(row!, null);
}
