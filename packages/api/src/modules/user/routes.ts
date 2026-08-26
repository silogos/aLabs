/** User routes — profile writes + project recents (visit history).
 *  Reads of the profile live at GET /auth/me. Recents are identity-level
 *  (cross-org by nature), so these routes only require auth — no tenant
 *  middleware. Projects outside the caller's orgs stay invisible (404). */
import { Hono } from "hono";
import { userUpdate, recentTouch } from "@pmin/core";
import * as authRepo from "../../db/auth-repo";
import * as orgRepo from "../../db/org-repo";
import * as projectRepo from "../../db/project-repo";
import { notFound } from "../../lib/errors";
import { data } from "../../lib/responses";
import { parseJsonBody } from "../../lib/validate";
import { requireAuth } from "../../lib/auth";
import type { Vars } from "../../lib/ctx";

export const user = new Hono<{ Variables: Vars }>();

user.use("*", requireAuth);

user.patch("/me", async (c) => {
  const user = c.get("user")!;
  const input = await parseJsonBody(c, userUpdate);
  // users live in Postgres — real UPDATE, response is the fresh row
  return data(c, await authRepo.updateUserProfile(user.id, input));
});

user.get("/me/recents", async (c) => {
  const user = c.get("user")!;
  const raw = Number(c.req.query("limit") ?? 3);
  const limit = Math.min(Math.max(Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 3, 1), projectRepo.HISTORY_CAP);
  const visits = await projectRepo.listRecentVisits(user.id, limit);
  // embed the org (deleted orgs silence the row)
  const out = [];
  for (const v of visits) {
    const organization = await orgRepo.getOrganization(v.project.organizationId);
    if (!organization) continue;
    out.push({ project: v.project, organization, visitedAt: v.visitedAt });
  }
  return data(c, out);
});

user.post("/me/recents", async (c) => {
  const user = c.get("user")!;
  const input = await parseJsonBody(c, recentTouch);
  const project = await projectRepo.getProject(input.projectId);
  // 404 (not 403) when the project or its org is outside the caller's reach.
  const org = project ? await orgRepo.getOrganization(project.organizationId) : null;
  const member = org ? await orgRepo.getActiveMember(org.id, user.id) : null;
  if (!project || !org || !member) throw notFound();
  await projectRepo.touchVisit(user.id, project.id);
  return data(c, { project, visitedAt: new Date().toISOString() });
});
