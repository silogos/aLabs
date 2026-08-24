/** Remaining-domain repositories — meetings, agreements, notifications, and
 *  the dashboard activity feed. Small enough to share one module; each domain
 *  keeps its zod-inferred shapes (meeting participants are hydrated Users,
 *  agreement value maps numeric → number). */
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./pg";
import { meetings, meetingParticipants, actionItems, agreements, notifications, activity } from "@pmin/core/db";
import { uuidv7, type Meeting, type ActionItem, type Agreement, type Notification } from "@pmin/core";
import { getUsersByIds } from "./auth-repo";

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

/* ---------------- meetings ---------------- */

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
  const links = await db
    .select({ meetingId: meetingParticipants.meetingId, userId: meetingParticipants.userId })
    .from(meetingParticipants);
  const ids = [...new Set(links.map((l) => l.userId).filter((x): x is string => !!x))];
  const users = await getUsersByIds(ids);
  const byId = new Map(users.map((u) => [u.id, u]));
  const items = await db
    .select()
    .from(actionItems)
    .where(inArray(actionItems.meetingId, rows.map((r) => r.id)))
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

async function replaceParticipants(meetingId: string, userIds: string[]): Promise<void> {
  await db.delete(meetingParticipants).where(eq(meetingParticipants.meetingId, meetingId));
  if (userIds.length > 0) {
    await db
      .insert(meetingParticipants)
      .values(userIds.map((userId) => ({ meetingId, userId })));
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
  const [row] = await db
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
  if (input.participantIds?.length) await replaceParticipants(row!.id, input.participantIds);
  // re-read so the response carries hydrated participants/action items
  return (await getMeeting(input.projectId, row!.id))!;
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
  await db
    .update(meetings)
    .set({ ...cols, updatedAt: new Date() })
    .where(eq(meetings.id, id));
  if (participantIds) await replaceParticipants(id, participantIds);
}

export async function softDeleteMeeting(id: string): Promise<void> {
  await db
    .update(meetings)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(meetings.id, id));
}

/* ---------------- meeting action items ---------------- */

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

/* ---------------- agreements ---------------- */

type AgreementRow = typeof agreements.$inferSelect;

type AgreementWithOwner = Agreement & { owner: Agreement["owner"] } & { deletedAt: string | null };

async function hydrateOwners(rows: AgreementRow[]): Promise<AgreementWithOwner[]> {
  const ids = [...new Set(rows.map((r) => r.ownerId).filter((x): x is string => !!x))];
  const users = ids.length ? await getUsersByIds(ids) : [];
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    title: r.title,
    type: r.type,
    status: r.status,
    counterparty: r.counterparty,
    value: r.value === null ? null : Number(r.value),
    currency: r.currency,
    startDate: r.startDate,
    endDate: r.endDate,
    sentAt: iso(r.sentAt),
    signedAt: iso(r.signedAt),
    owner: r.ownerId ? byId.get(r.ownerId) ?? null : null,
    terms: r.terms,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: iso(r.deletedAt),
  }));
}

export type AgreementWithMeta = Awaited<ReturnType<typeof hydrateOwners>>[number];

export async function listAgreements(projectId: string): Promise<AgreementWithMeta[]> {
  const rows = await db
    .select()
    .from(agreements)
    .where(and(eq(agreements.projectId, projectId), isNull(agreements.deletedAt)))
    .orderBy(agreements.createdAt);
  return hydrateOwners(rows);
}

export async function getAgreement(projectId: string, id: string): Promise<AgreementWithMeta | null> {
  const [row] = await db
    .select()
    .from(agreements)
    .where(and(eq(agreements.id, id), eq(agreements.projectId, projectId), isNull(agreements.deletedAt)))
    .limit(1);
  return row ? (await hydrateOwners([row]))[0]! : null;
}

export async function insertAgreement(input: {
  projectId: string;
  title: string;
  type: Agreement["type"];
  counterparty: string;
  value?: number | null;
  currency?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  ownerId?: string | null;
  terms?: string | null;
}): Promise<AgreementWithMeta> {
  const now = new Date();
  const [row] = await db
    .insert(agreements)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      title: input.title,
      type: input.type,
      status: "draft",
      counterparty: input.counterparty,
      value: input.value === null || input.value === undefined ? null : String(input.value),
      currency: input.currency ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      ownerId: input.ownerId ?? null,
      terms: input.terms ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return (await hydrateOwners([row!]))[0]!;
}

export async function patchAgreement(
  id: string,
  patch: {
    title?: string;
    type?: Agreement["type"];
    status?: Agreement["status"];
    counterparty?: string;
    value?: number | null;
    currency?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    sentAt?: Date | null;
    signedAt?: Date | null;
    ownerId?: string | null;
    terms?: string | null;
  },
): Promise<void> {
  const { value, ...rest } = patch;
  await db
    .update(agreements)
    .set({
      ...rest,
      value: value === undefined ? undefined : value === null ? null : String(value),
      updatedAt: new Date(),
    })
    .where(eq(agreements.id, id));
}

export async function softDeleteAgreement(id: string): Promise<void> {
  await db
    .update(agreements)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(agreements.id, id));
}

/* ---------------- notifications ---------------- */

type NotificationRow = typeof notifications.$inferSelect;

const toNotification = (r: NotificationRow): Notification => ({
  id: r.id,
  userId: r.userId,
  type: r.type,
  title: r.title,
  body: r.body,
  link: r.link,
  readAt: iso(r.readAt),
  createdAt: r.createdAt.toISOString(),
});

export async function listNotifications(userId: string): Promise<Notification[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
  return rows.map(toNotification);
}

export async function insertNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  readAt?: Date | null;
  createdAt?: Date;
}): Promise<void> {
  await db.insert(notifications).values({
    id: uuidv7(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link ?? null,
    readAt: input.readAt ?? null,
    createdAt: input.createdAt ?? new Date(),
  });
}

/** Scoped to the owner — never lets one user mark another's notification. */
export async function markNotificationRead(userId: string, id: string): Promise<Notification | null> {
  const [row] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return row ? toNotification(row) : null;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

/* ---------------- activity feed ---------------- */

export interface ActivityEntry {
  id: string;
  kind: "move" | "doc" | "com" | "done" | "mile";
  projectId: string;
  actorId: string;
  target: string;
  when: string;
  whenLabel: string;
}

export async function insertActivity(input: {
  projectId: string;
  kind: ActivityEntry["kind"];
  actorId: string;
  target: string;
  occurredAt?: Date;
  whenLabel: string;
}): Promise<void> {
  await db.insert(activity).values({
    id: uuidv7(),
    projectId: input.projectId,
    kind: input.kind,
    actorId: input.actorId,
    target: input.target,
    occurredAt: input.occurredAt ?? new Date(),
    whenLabel: input.whenLabel,
  });
}

export async function listActivity(projectId: string, limit?: number): Promise<ActivityEntry[]> {
  const rows = await db
    .select()
    .from(activity)
    .where(eq(activity.projectId, projectId))
    .orderBy(desc(activity.occurredAt))
    .limit(limit ?? 1000);
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as ActivityEntry["kind"],
    projectId: r.projectId,
    actorId: r.actorId,
    target: r.target,
    when: r.occurredAt.toISOString(),
    whenLabel: r.whenLabel,
  }));
}
