/** User routes — profile writes + project recents (visit history).
 *  Reads of the profile live at GET /auth/me. Recents are identity-level
 *  (cross-org by nature), so these routes only require auth — no tenant
 *  middleware. Projects outside the caller's orgs stay invisible (404). */
import { Hono } from "hono";
import { userUpdate, recentTouch } from "@pmin/core";
import { store } from "../../db/store";
import * as authRepo from "../../db/auth-repo";
import * as orgRepo from "../../db/org-repo";
import { notFound } from "../../lib/errors";
import { data } from "../../lib/responses";
import { parseBody } from "../../lib/validate";
import { requireAuth } from "../../lib/auth";
import type { Vars } from "../../lib/ctx";

/** Server-side history cap per user; GET may return fewer via ?limit=. */
const HISTORY_CAP = 5;

/** Most-recently-visited projects of the user, embedded with their org. */
async function recentProjects(userId: string, limit: number) {
  const visits = store.projectVisits
    .filter((v) => v.userId === userId)
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
    .slice(0, limit);
  const out: { project: unknown; organization: unknown; visitedAt: string }[] = [];
  for (const v of visits) {
    const project = store.projects.find((p) => p.id === v.projectId && !p.deletedAt);
    if (!project) continue; // deleted project → row goes silent
    // orgs live in Postgres — deleted orgs silence the row too
    const organization = await orgRepo.getOrganization(project.organizationId);
    if (!organization) continue;
    out.push({ project, organization, visitedAt: v.visitedAt });
  }
  return out;
}

export const users = new Hono<{ Variables: Vars }>();

users.use("*", requireAuth);

users.patch("/me", async (c) => {
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), userUpdate);
  // users live in Postgres — real UPDATE, response is the fresh row
  return data(c, await authRepo.updateUserProfile(user.id, input));
});

users.get("/me/recents", async (c) => {
  const user = c.get("user")!;
  const raw = Number(c.req.query("limit") ?? 3);
  const limit = Math.min(Math.max(Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 3, 1), HISTORY_CAP);
  return data(c, await recentProjects(user.id, limit));
});

users.post("/me/recents", async (c) => {
  const user = c.get("user")!;
  const input = parseBody(await c.req.json(), recentTouch);
  const project = store.projects.find((p) => p.id === input.projectId && !p.deletedAt);
  // 404 (not 403) when the project or its org is outside the caller's reach.
  const org = project ? await orgRepo.getOrganization(project.organizationId) : null;
  const member = org ? await orgRepo.getActiveMember(org.id, user.id) : null;
  if (!project || !org || !member) throw notFound();

  const now = new Date().toISOString();
  const existing = store.projectVisits.find(
    (v) => v.userId === user.id && v.projectId === project.id,
  );
  if (existing) {
    existing.visitedAt = now;
  } else {
    store.projectVisits.push({ userId: user.id, projectId: project.id, visitedAt: now });
  }
  // prune the history beyond the cap (oldest first)
  const mine = store.projectVisits
    .filter((v) => v.userId === user.id)
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
  for (const v of mine.slice(HISTORY_CAP)) {
    store.projectVisits.splice(store.projectVisits.indexOf(v), 1);
  }
  return data(c, { project, visitedAt: now });
});
