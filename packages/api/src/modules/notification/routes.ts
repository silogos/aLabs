/** Notification routes — user-scoped (not tenant-scoped).
 *  Rows live in Postgres (db/notification-repo.ts); read-marking and
 *  preference writes are owner-scoped. */
import { Hono } from "hono";
import { notificationPreferenceSchema } from "@pmin/core";
import * as notificationRepo from "../../db/notification-repo";
import { noContent, data } from "../../lib/responses";
import { notFound } from "../../lib/errors";
import { requireAuth } from "../../lib/auth";
import { parseJsonBody } from "../../lib/validate";
import type { Vars } from "../../lib/ctx";

export const notification = new Hono<{ Variables: Vars }>();
notification.use("*", requireAuth);

notification.get("/", async (c) => {
  const user = c.get("user")!;
  return data(c, await notificationRepo.listNotifications(user.id));
});

notification.patch("/:id/read", async (c) => {
  const user = c.get("user")!;
  const n = await notificationRepo.markNotificationRead(user.id, c.req.param("id")!);
  if (!n) throw notFound();
  return data(c, n);
});

notification.patch("/read-all", async (c) => {
  const user = c.get("user")!;
  await notificationRepo.markAllNotificationsRead(user.id);
  return noContent(c);
});

notification.get("/preferences", async (c) => {
  const user = c.get("user")!;
  return data(c, await notificationRepo.listNotificationPreferences(user.id));
});

notification.patch("/preferences", async (c) => {
  const user = c.get("user")!;
  const input = await parseJsonBody(c, notificationPreferenceSchema);
  return data(c, await notificationRepo.upsertNotificationPreference(user.id, input));
});
