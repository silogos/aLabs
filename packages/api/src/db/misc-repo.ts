/** Remaining-domain repositories — meetings, agreements, notifications, and
 *  the dashboard activity feed. Small enough to share one module; each domain
 *  keeps its zod-inferred shapes (meeting participants are hydrated Users,
 *  agreement value maps numeric → number). */
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./pg";
import { meetings, meetingParticipants, agreements, notifications, activity } from "@pmin/core/db";
import { uuidv7, type Meeting, type Agreement, type Notification } from "@pmin/core";
import { getUsersByIds } from "./auth-repo";

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

/* ---------------- meetings ---------------- */

type MeetingRow = typeof meetings.$inferSelect;

const toMeeting = (r: MeetingRow, participants: Meeting["participants"]): Meeting & { deletedAt: string | null } => ({
  id: r.id,
  projectId: r.projectId,
  title: r.title,
  type: r.type,
  scheduledAt: r.scheduledAt.toISOString(),
  duration: r.duration,
  location: r.location,
  agenda: r.agenda,
  notes: r.notes,
  status: r.status,
  participants,
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
  return rows.map((r) =>
    toMeeting(
      r,
      links
        .filter((l) => l.meetingId === r.id && l.userId)
        .map((l) => byId.get(l.userId!))
        .filter((u): u is NonNullable<typeof u> => !!u),
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

export async function insertMeeting(input: {
  projectId: string;
  title: string;
  type?: Meeting["type"];
  scheduledAt: Date;
  duration?: number;
  location?: string | null;
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
      agenda: null,
      notes: null,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toMeeting(row!, []);
}

export async function patchMeeting(
  id: string,
  patch: {
    title?: string;
    type?: Meeting["type"] | null;
    scheduledAt?: Date;
    duration?: number;
    location?: string | null;
    agenda?: Meeting["agenda"];
    notes?: Meeting["notes"];
    status?: Meeting["status"];
  },
): Promise<void> {
  await db
    .update(meetings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(meetings.id, id));
}

export async function softDeleteMeeting(id: string): Promise<void> {
  await db
    .update(meetings)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(meetings.id, id));
}

/* ---------------- agreements ---------------- */

type AgreementRow = typeof agreements.$inferSelect;

const toAgreement = (r: AgreementRow): Agreement & { deletedAt: string | null } => ({
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
  signedAt: iso(r.signedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  deletedAt: iso(r.deletedAt),
});

export type AgreementWithMeta = ReturnType<typeof toAgreement>;

export async function listAgreements(projectId: string): Promise<AgreementWithMeta[]> {
  const rows = await db
    .select()
    .from(agreements)
    .where(and(eq(agreements.projectId, projectId), isNull(agreements.deletedAt)))
    .orderBy(agreements.createdAt);
  return rows.map(toAgreement);
}

export async function getAgreement(projectId: string, id: string): Promise<AgreementWithMeta | null> {
  const [row] = await db
    .select()
    .from(agreements)
    .where(and(eq(agreements.id, id), eq(agreements.projectId, projectId), isNull(agreements.deletedAt)))
    .limit(1);
  return row ? toAgreement(row) : null;
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
      signedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return toAgreement(row!);
}

export async function patchAgreement(
  id: string,
  patch: {
    title?: string;
    status?: Agreement["status"];
    value?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    signedAt?: Date | null;
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
