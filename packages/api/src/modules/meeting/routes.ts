/** Meeting routes — meetings + action items.
 *  Rows live in Postgres (db/misc-repo.ts). */
import { Hono } from "hono";
import { z } from "zod";
import * as miscRepo from "../../db/misc-repo";
import { meetingCreate, meetingUpdate } from "@pmin/core";
import { MEETING_TRANSITIONS, canTransition } from "@pmin/core";
import { conflict, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseBody } from "../../lib/validate";
import { projectContext, currentTenant } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars, Ctx } from "../../lib/ctx";

export const meeting = new Hono<{ Variables: Vars }>();
meeting.use("*", projectContext);

const pidOf = (c: Ctx) => currentTenant(c).projectId!;

meeting.get("/meetings", requirePermission("meeting:view"), async (c) =>
  data(c, await miscRepo.listMeetings(pidOf(c))),
);
meeting.post("/meetings", requirePermission("meeting:create"), async (c) => {
  const input = parseBody(await c.req.json(), meetingCreate);
  const m = await miscRepo.insertMeeting({
    projectId: pidOf(c),
    title: input.title,
    type: input.type ?? null,
    scheduledAt: new Date(input.scheduledAt),
    duration: input.duration ?? null,
    location: input.location ?? null,
  });
  return created(c, m);
});
meeting.get("/meetings/:id", requirePermission("meeting:view"), async (c) => {
  const m = await miscRepo.getMeeting(pidOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  return data(c, m);
});
meeting.patch("/meetings/:id", requirePermission("meeting:update"), async (c) => {
  const m = await miscRepo.getMeeting(pidOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  const input = parseBody(await c.req.json(), meetingUpdate);
  if (input.status && input.status !== m.status) {
    if (!canTransition(MEETING_TRANSITIONS, m.status, input.status)) throw conflict("Invalid status transition");
  }
  await miscRepo.patchMeeting(m.id, {
    ...input,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
  });
  return data(c, await miscRepo.getMeeting(pidOf(c), m.id));
});
meeting.delete("/meetings/:id", requirePermission("meeting:delete"), async (c) => {
  const m = await miscRepo.getMeeting(pidOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  await miscRepo.softDeleteMeeting(m.id);
  return noContent(c);
});
meeting.post(
  "/meetings/:id/action-items",
  requirePermission("meeting:update"),
  async (c) => {
    const body = parseBody(await c.req.json(), z.object({ description: z.string(), assigneeId: z.string().uuid().optional() }));
    return created(c, body);
  },
);
