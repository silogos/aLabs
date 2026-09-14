/** Notification repository — Postgres (Drizzle). Rows are user-scoped;
 *  read-marking never lets one user touch another's notifications. */
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./pg";
import { notifications, notificationPreferences } from "@pmin/core/db";
import {
  uuidv7,
  NotificationChannel,
  notifiableEventTypes,
  type Notification,
  type NotificationPreference,
} from "@pmin/core";
import { iso } from "./mapping";

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

/** Resolved preferences — one entry per notifiable type × channel, stored
 *  rows overriding the enabled-by-default fill (absent row = enabled). */
export async function listNotificationPreferences(
  userId: string,
): Promise<NotificationPreference[]> {
  const rows = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
  const byKey = new Map(rows.map((r) => [`${r.channel}:${r.type}`, r.enabled]));
  return notifiableEventTypes.flatMap((type) =>
    NotificationChannel.options.map((channel) => ({
      channel,
      type,
      enabled: byKey.get(`${channel}:${type}`) ?? true,
    })),
  );
}

/** Upsert one preference — the unique (user, channel, type) key decides
 *  insert vs flip. Scoped to the owner. */
export async function upsertNotificationPreference(
  userId: string,
  input: NotificationPreference,
): Promise<NotificationPreference> {
  const [row] = await db
    .insert(notificationPreferences)
    .values({
      id: uuidv7(),
      userId,
      channel: input.channel,
      type: input.type,
      enabled: input.enabled,
    })
    .onConflictDoUpdate({
      target: [
        notificationPreferences.userId,
        notificationPreferences.channel,
        notificationPreferences.type,
      ],
      set: { enabled: input.enabled, updatedAt: new Date() },
    })
    .returning();
  // row echoes the validated input; the cast narrows varchar → domain union
  return {
    channel: row.channel,
    type: row.type as NotificationPreference["type"],
    enabled: row.enabled,
  };
}

/** The subset of `userIds` who disabled in-app notifications for `type` —
 *  what emitters subtract from their recipient lists. */
export async function inAppOptedOut(userIds: string[], type: string): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const rows = await db
    .select({ userId: notificationPreferences.userId })
    .from(notificationPreferences)
    .where(
      and(
        inArray(notificationPreferences.userId, userIds),
        eq(notificationPreferences.channel, "in_app"),
        eq(notificationPreferences.type, type),
        eq(notificationPreferences.enabled, false),
      ),
    );
  return new Set(rows.map((r) => r.userId));
}
