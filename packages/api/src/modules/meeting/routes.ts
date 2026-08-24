/** Meeting routes — meetings, participants, and action items.
 *  Rows live in Postgres (db/meeting-repo.ts). */
import { Hono } from "hono";
import {
  meetingCreate,
  meetingUpdate,
  actionItemCreate,
  actionItemUpdate,
  MEETING_TRANSITIONS,
  canTransition,
} from "@pmin/core";
import * as meetingRepo from "../../db/meeting-repo";
import { conflict, notFound } from "../../lib/errors";
import { created, data, noContent } from "../../lib/responses";
import { parseJsonBody } from "../../lib/validate";
import { projectContext, projectIdOf } from "../../lib/tenant";
import { requirePermission } from "../../lib/permission";
import type { Vars } from "../../lib/ctx";

export const meeting = new Hono<{ Variables: Vars }>();
meeting.use("*", projectContext);


meeting.get("/meetings", requirePermission("meeting:view"), async (c) =>
  data(c, await meetingRepo.listMeetings(projectIdOf(c))),
);
meeting.post("/meetings", requirePermission("meeting:create"), async (c) => {
  const input = await parseJsonBody(c, meetingCreate);
  const m = await meetingRepo.insertMeeting({
    projectId: projectIdOf(c),
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
  const m = await meetingRepo.getMeeting(projectIdOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  return data(c, m);
});
meeting.patch("/meetings/:id", requirePermission("meeting:update"), async (c) => {
  const m = await meetingRepo.getMeeting(projectIdOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  const input = await parseJsonBody(c, meetingUpdate);
  if (input.status && input.status !== m.status) {
    if (!canTransition(MEETING_TRANSITIONS, m.status, input.status)) throw conflict("Invalid status transition");
  }
  const { participantIds, status, agenda, notes, scheduledAt, ...rest } = input;
  await meetingRepo.patchMeeting(m.id, {
    ...rest,
    ...(status !== undefined ? { status } : {}),
    ...(agenda !== undefined ? { agenda } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
    ...(participantIds !== undefined ? { participantIds } : {}),
  });
  return data(c, await meetingRepo.getMeeting(projectIdOf(c), m.id));
});
meeting.delete("/meetings/:id", requirePermission("meeting:delete"), async (c) => {
  const m = await meetingRepo.getMeeting(projectIdOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  await meetingRepo.softDeleteMeeting(m.id);
  return noContent(c);
});

/* Action items — nested create (per contract), flat patch by item id. */
meeting.post("/meetings/:id/action-items", requirePermission("meeting:update"), async (c) => {
  const m = await meetingRepo.getMeeting(projectIdOf(c), c.req.param("id")!);
  if (!m) throw notFound();
  const input = await parseJsonBody(c, actionItemCreate);
  const item = await meetingRepo.insertActionItem({
    meetingId: m.id,
    description: input.description,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  });
  return created(c, item);
});
meeting.patch("/action-items/:id", requirePermission("meeting:update"), async (c) => {
  const found = await meetingRepo.getActionItem(projectIdOf(c), c.req.param("id")!);
  if (!found) throw notFound();
  const input = await parseJsonBody(c, actionItemUpdate);
  const { dueDate, ...rest } = input;
  await meetingRepo.patchActionItem(found.item.id, {
    ...rest,
    ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
  });
  const fresh = await meetingRepo.getActionItem(projectIdOf(c), found.item.id);
  return data(c, fresh?.item ?? null);
});
