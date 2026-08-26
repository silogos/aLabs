/** Notification routes — user-scoped (not tenant-scoped).
 *  Rows live in Postgres (db/notification-repo.ts); read-marking is owner-scoped. */
import { Hono } from "hono";
import * as notificationRepo from "../../db/notification-repo";
import { noContent, data } from "../../lib/responses";
import { notFound } from "../../lib/errors";
import { requireAuth } from "../../lib/auth";
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

notification.get("/preferences", (c) => data(c, {}));
notification.patch("/preferences", (c) => data(c, {}));
