/** Notification routes — user-scoped (not tenant-scoped). */
import { Hono } from "hono";
import { store } from "../../db/store.js";
import { noContent, data } from "../../lib/responses.js";
import { notFound } from "../../lib/errors.js";
import { requireAuth } from "../../lib/auth.js";
import type { Vars } from "../../lib/ctx.js";

export const notification = new Hono<{ Variables: Vars }>();
notification.use("*", requireAuth);

notification.get("/", (c) => {
  const user = c.get("user")!;
  return data(c, store.notifications.filter((n) => n.userId === user.id));
});

notification.patch("/:id/read", (c) => {
  const n = store.notifications.find((x) => x.id === c.req.param("id"));
  if (!n) throw notFound();
  n.readAt = new Date().toISOString();
  return data(c, n);
});

notification.patch("/read-all", (c) => {
  const user = c.get("user")!;
  for (const n of store.notifications.filter((x) => x.userId === user.id)) n.readAt = new Date().toISOString();
  return noContent(c);
});

notification.get("/preferences", (c) => data(c, {}));
notification.patch("/preferences", (c) => data(c, {}));
