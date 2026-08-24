/** Notification repository — Postgres (Drizzle). Rows are user-scoped;
 *  read-marking never lets one user touch another's notifications. */
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "./pg";
import { notifications } from "@pmin/core/db";
import { uuidv7, type Notification } from "@pmin/core";
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
