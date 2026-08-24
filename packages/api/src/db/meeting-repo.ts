/** Meeting repository — Postgres (Drizzle) for meetings, participants, and
 *  action items. Participants are hydrated Users; meetings embed their action
 *  items inline (zod-inferred shapes from @pmin/core). */
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, type Tx } from "./pg";
import { meetings, meetingParticipants, actionItems } from "@pmin/core/db";
import { uuidv7, type Meeting, type ActionItem } from "@pmin/core";
import { iso, userMap } from "./mapping";

type MeetingRow = typeof meetings.$inferSelect;
type ActionItemRow = typeof actionItems.$inferSelect;

const toActionItem = (r: ActionItemRow): ActionItem => ({
  id: r.id,
  meetingId: r.meetingId,
  taskId: r.taskId,
  assigneeId: r.assigneeId,
  description: r.description,
  done: r.done,
  dueDate: iso(r.dueDate),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

const toMeeting = (
  r: MeetingRow,
  participants: Meeting["participants"],
  items: ActionItem[],
): Meeting & { deletedAt: string | null } => ({
  id: r.id,
  projectId: r.projectId,
  title: r.title,
  type: r.type,
  scheduledAt: r.scheduledAt.toISOString(),
  duration: r.duration,
  location: r.location,
  agenda: (r.agenda as string[] | null) ?? null,
  notes: (r.notes as string | null) ?? null,
  status: r.status,
  participants,
  actionItems: items,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

export type MeetingWithMeta = ReturnType<typeof toMeeting>;

async function hydrateMeetings(rows: MeetingRow[]): Promise<MeetingWithMeta[]> {
  if (rows.length === 0) return [];
  const meetingIds = rows.map((r) => r.id);
  const links = await db
    .select({ meetingId: meetingParticipants.meetingId, userId: meetingParticipants.userId })
    .from(meetingParticipants)
    .where(inArray(meetingParticipants.meetingId, meetingIds));
  const byId = await userMap(links.map((l) => l.userId));
  const items = await db
    .select()
    .from(actionItems)
    .where(inArray(actionItems.meetingId, meetingIds))
    .orderBy(actionItems.createdAt);
  return rows.map((r) =>
    toMeeting(
      r,
      links
        .filter((l) => l.meetingId === r.id && l.userId)
        .map((l) => byId.get(l.userId!))
        .filter((u): u is NonNullable<typeof u> => !!u),
      items.filter((i) => i.meetingId === r.id).map(toActionItem),
    ),
  );
}

export async function listMeetings(projectId: string): Promise<MeetingWithMeta[]> {
  const rows = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.projectId, projectId), isNull(meetings.deletedAt)))
    .orderBy(meetings.scheduledAt);
  return hydrateMeetings(rows);
}

export async function getMeeting(projectId: string, id: string): Promise<MeetingWithMeta | null> {
  const [row] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.projectId, projectId), isNull(meetings.deletedAt)))
    .limit(1);
  if (!row) return null;
  return (await hydrateMeetings([row]))[0]!;
}

async function replaceParticipants(tx: Tx, meetingId: string, userIds: string[]): Promise<void> {
  await tx.delete(meetingParticipants).where(eq(meetingParticipants.meetingId, meetingId));
  if (userIds.length > 0) {
    await tx.insert(meetingParticipants).values(userIds.map((userId) => ({ meetingId, userId })));
  }
}

export async function insertMeeting(input: {
  projectId: string;
  title: string;
  type?: Meeting["type"];
  scheduledAt: Date;
  duration?: number;
  location?: string | null;
  agenda?: string[];
  notes?: string;
  participantIds?: string[];
}): Promise<MeetingWithMeta> {
  const now = new Date();
  const id = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(meetings)
      .values({
        id: uuidv7(),
        projectId: input.projectId,
        title: input.title,
        type: input.type ?? null,
        scheduledAt: input.scheduledAt,
        duration: input.duration ?? 30,
        location: input.location ?? null,
        agenda: input.agenda ?? null,
        notes: input.notes ?? null,
        status: "scheduled",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    if (input.participantIds?.length) await replaceParticipants(tx, row!.id, input.participantIds);
    return row!.id;
  });
  // re-read so the response carries hydrated participants/action items
  return (await getMeeting(input.projectId, id))!;
}

export async function patchMeeting(
  id: string,
  patch: {
    title?: string;
    type?: Meeting["type"] | null;
    scheduledAt?: Date;
    duration?: number;
    location?: string | null;
    agenda?: string[];
    notes?: string;
    status?: Meeting["status"];
    participantIds?: string[];
  },
): Promise<void> {
  const { participantIds, ...cols } = patch;
  await db.transaction(async (tx) => {
    await tx
      .update(meetings)
      .set({ ...cols, updatedAt: new Date() })
      .where(eq(meetings.id, id));
    if (participantIds) await replaceParticipants(tx, id, participantIds);
  });
}

export async function softDeleteMeeting(id: string): Promise<void> {
  await db
    .update(meetings)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(meetings.id, id));
}

/* ---------------- action items ---------------- */

/** Tenant-checked fetch: the item must belong to a meeting of this project. */
export async function getActionItem(
  projectId: string,
  id: string,
): Promise<{ item: ActionItem; meeting: MeetingWithMeta } | null> {
  const [row] = await db
    .select({ item: actionItems, meeting: meetings })
    .from(actionItems)
    .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
    .where(and(eq(actionItems.id, id), eq(meetings.projectId, projectId)))
    .limit(1);
  if (!row) return null;
  const meeting = (await hydrateMeetings([row.meeting]))[0]!;
  return { item: toActionItem(row.item), meeting };
}

export async function insertActionItem(input: {
  meetingId: string;
  description: string;
  assigneeId?: string | null;
  dueDate?: Date | null;
  taskId?: string | null;
}): Promise<ActionItem> {
  const now = new Date();
  const [row] = await db
    .insert(actionItems)
    .values({
      id: uuidv7(),
      meetingId: input.meetingId,
      description: input.description,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ?? null,
      taskId: input.taskId ?? null,
      done: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toActionItem(row!);
}

export async function patchActionItem(
  id: string,
  patch: {
    description?: string;
    assigneeId?: string | null;
    dueDate?: Date | null;
    done?: boolean;
    taskId?: string | null;
  },
): Promise<void> {
  await db
    .update(actionItems)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(actionItems.id, id));
}
