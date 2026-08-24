/** Meeting routes — meetings, participants, and action items.
 *  Rows live in Postgres (db/misc-repo.ts). */
import { Hono } from "hono";
import {
  meetingCreate,
  meetingUpdate,
  actionItemCreate,
  actionItemUpdate,
  MEETING_TRANSITIONS,
  canTransition,
} from "@pmin/core";
import * as miscRepo from "../../db/misc-repo";
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
    type: input.type,
    scheduledAt: new Date(input.scheduledAt),
    duration: input.duration,
    location: input.location,
    participantIds: input.participantIds,
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
  const { participantIds, status, agenda, notes, scheduledAt, ...rest } = input;
  await miscRepo.patchMeeting(m.id, {
    ...rest,
    ...(status !== undefined ? { status } : {}),
    ...(agenda !== undefined ? { agenda } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
    ...(participantIds !== undefined ? { participantIds } : {}),
  });
  return data(c, await miscRepo.getMeeting(pidOf(c), m.id));
});
meeting.delete("/meetings/:id", requirePermission("meeting:delete"), async (c) => {
  const m = await miscRepo.getMeeting(pidOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  await miscRepo.softDeleteMeeting(m.id);
  return noContent(c);
});

/* Action items — nested create (per contract), flat patch by item id. */
meeting.post("/meetings/:id/action-items", requirePermission("meeting:update"), async (c) => {
  const m = await miscRepo.getMeeting(pidOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  const input = parseBody(await c.req.json(), actionItemCreate);
  const item = await miscRepo.insertActionItem({
    meetingId: m.id,
    description: input.description,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  });
  return created(c, item);
});
meeting.patch("/action-items/:id", requirePermission("meeting:update"), async (c) => {
  const found = await miscRepo.getActionItem(pidOf(c), c.req.param("id")!);
  if (!found) throw notFound();
  const input = parseBody(await c.req.json(), actionItemUpdate);
  const { dueDate, ...rest } = input;
  await miscRepo.patchActionItem(found.item.id, {
    ...rest,
    ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
  });
  const fresh = await miscRepo.getActionItem(pidOf(c), found.item.id);
  return data(c, fresh?.item ?? null);
});
