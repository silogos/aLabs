/** Documents schemas — spaces, pages, files, search. */
import { z } from "zod";
import { id, iso } from "./common";
import { userSchema } from "./auth";
import { contentSchema } from "../content";

export const spaceSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  icon: z.string().nullable(),
  order: z.number().int(),
});
export type Space = z.infer<typeof spaceSchema>;

export const pageSchema = z.object({
  id,
  projectId: id,
  spaceId: id,
  parentId: id.nullable(),
  title: z.string(),
  content: contentSchema,
  icon: z.string().nullable(),
  order: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
  editedBy: userSchema.nullable(),
});
export type Page = z.infer<typeof pageSchema>;

export const spaceCreate = z.object({
  name: z.string().min(1).max(120),
  icon: z.string().max(20).optional(),
});
export const pageCreate = z.object({
  spaceId: id,
  parentId: id.nullable().optional(),
  title: z.string().min(1).max(255),
  icon: z.string().max(20).optional(),
});
export const pageUpdate = z.object({
  spaceId: id.optional(),
  parentId: id.nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  content: contentSchema.optional(),
  icon: z.string().max(20).optional(),
  updatedAt: iso.optional(),
});

export const fileRefSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  uploadedBy: userSchema.nullable(),
  createdAt: iso,
});
export type FileRef = z.infer<typeof fileRefSchema>;

/** GET /documents/search query. */
export const pageSearchQuery = z.object({ q: z.string().optional() });
