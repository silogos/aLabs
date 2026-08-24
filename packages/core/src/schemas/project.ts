/** Project schemas + recents (project visit history). */
import { z } from "zod";
import { id, iso } from "./common";
import { ProjectStatus, ProjectVisibility } from "../enums";

export const projectSchema = z.object({
  id,
  organizationId: id,
  name: z.string(),
  slug: z.string(),
  key: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  status: ProjectStatus,
  visibility: ProjectVisibility,
  createdAt: iso,
  updatedAt: iso,
});
export type Project = z.infer<typeof projectSchema>;

export const projectCreate = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  key: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/),
  description: z.string().optional(),
  icon: z.string().max(20).optional(),
});
export const projectUpdate = projectCreate.partial().extend({
  status: ProjectStatus.optional(),
  visibility: ProjectVisibility.optional(),
});

export const recentTouch = z.object({ projectId: id });
