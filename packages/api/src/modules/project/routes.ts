/** Project routes — projects under an org. Rows, memberships, and the
 *  per-project task config (statuses/types) live in Postgres
 *  (db/project-repo.ts); creation is atomic via createProjectWithConfig.
 *  Project members live in ./members.ts. */
import { Hono } from "hono";
import * as orgRepo from "../../db/org-repo";
import * as projectRepo from "../../db/project-repo";
import { projectCreate, projectUpdate, projectSchema } from "@pmin/core";
import { PROJECT_TRANSITIONS, canTransition, PERSONAL_PROJECT_LIMIT } from "@pmin/core";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseJsonBody } from "../../lib/validate";
import { projectContext, orgContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars } from "../../lib/ctx";

export const project = new Hono<{ Variables: Vars }>();

// List projects for an org (member sees all)
project.get("/", orgContext, requirePermission("project:view"), async (c) => {
  return data(c, await projectRepo.listOrgProjects(currentTenant(c).organizationId));
});

project.post("/", orgContext, requirePermission("project:create"), async (c) => {
  const user = c.get("user")!;
  const orgId = currentTenant(c).organizationId;
  const input = await parseJsonBody(c, projectCreate);
  if (await projectRepo.slugTakenInOrg(orgId, input.slug))
    throw badRequest("Slug already taken in this organization");
  if (await projectRepo.keyTakenInOrg(orgId, input.key))
    throw badRequest("Key already taken in this organization");

  // Personal workspaces are capped at PERSONAL_PROJECT_LIMIT active projects.
  // Active = not archived and not soft-deleted (archiving frees the slot).
  // See docs/foundation/04-plans-workspaces.md and ADR 0007.
  const org = await orgRepo.getOrganization(orgId);
  if (org?.type === "personal" && (await projectRepo.countActiveProjects(orgId)) >= PERSONAL_PROJECT_LIMIT)
    throw badRequest(
      `Personal workspaces are limited to ${PERSONAL_PROJECT_LIMIT} active projects`,
    );

  const proj = await projectRepo.createProjectWithConfig({
    organizationId: orgId,
    name: input.name,
    slug: input.slug,
    key: input.key,
    description: input.description ?? null,
    icon: input.icon ?? null,
    creatorId: user.id,
  });
  return created(c, projectSchema.parse(proj));
});

// Project-scoped routes (by :projectId across the whole org)
project.get("/:projectId", projectContext, async (c) =>
  data(c, await mustProject(currentTenant(c).projectId!)),
);

project.patch("/:projectId", projectContext, requirePermission("project:update"), async (c) => {
  const proj = await mustProject(currentTenant(c).projectId!);
  const input = await parseJsonBody(c, projectUpdate);
  if (input.status && input.status !== proj.status) {
    if (!canTransition(PROJECT_TRANSITIONS, proj.status, input.status))
      throw conflict(`Cannot transition project from ${proj.status} to ${input.status}`);
  }
  return data(c, await projectRepo.updateProject(proj.id, input));
});

project.delete("/:projectId", projectContext, requirePermission("project:delete"), async (c) => {
  await projectRepo.softDeleteProject(currentTenant(c).projectId!);
  return noContent(c);
});

async function mustProject(id: string): Promise<projectRepo.ProjectWithMeta> {
  const p = await projectRepo.getProject(id);
  if (!p) throw notFound();
  return p;
}
