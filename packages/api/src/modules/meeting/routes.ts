/** Meeting routes — meetings + action items. */
import { Hono } from "hono";
import { z } from "zod";
import { store } from "../../db/store";
import { uuidv7, meetingCreate, meetingUpdate } from "@pmin/core";
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

meeting.get("/meetings", requirePermission("meeting:view"), (c) =>
  data(c, store.meetings.filter((m) => m.projectId === pidOf(c) && !m.deletedAt)),
);
meeting.post("/meetings", requirePermission("meeting:create"), async (c) => {
  const input = parseBody(await c.req.json(), meetingCreate);
  const m = {
    id: uuidv7(),
    projectId: pidOf(c),
    title: input.title,
    type: input.type ?? null,
    scheduledAt: input.scheduledAt,
    duration: input.duration ?? null,
    location: input.location ?? null,
    agenda: null,
    notes: null,
    status: "scheduled" as const,
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null as string | null,
  };
  store.meetings.push(m);
  return created(c, m);
});
meeting.get("/meetings/:id", requirePermission("meeting:view"), (c) => {
  const m = store.meetings.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
  if (!m) throw notFound();
  return data(c, m);
});
meeting.patch("/meetings/:id", requirePermission("meeting:update"), async (c) => {
  const m = store.meetings.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
  if (!m) throw notFound();
  const input = parseBody(await c.req.json(), meetingUpdate);
  if (input.status && input.status !== m.status) {
    if (!canTransition(MEETING_TRANSITIONS, m.status, input.status)) throw conflict("Invalid status transition");
  }
  Object.assign(m, input, { updatedAt: new Date().toISOString() });
  return data(c, m);
});
meeting.delete("/meetings/:id", requirePermission("meeting:delete"), (c) => {
  const m = store.meetings.find((x) => x.id === c.req.param("id") && x.projectId === pidOf(c) && !x.deletedAt);
  if (!m) throw notFound();
  m.deletedAt = new Date().toISOString();
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
