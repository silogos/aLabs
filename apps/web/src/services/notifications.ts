/** Notifications service — the authenticated user's notification feed. */
import type { Notification } from "@pmin/core";
import { req } from "@/lib/http";

export const notificationsService = {
  list: () => req<{ data: Notification[] }>("/notifications").then((x) => x.data),
  markRead: (id: string) =>
    req<{ data: Notification }>(`/notifications/${id}/read`, { method: "PATCH" }).then(
      (x) => x.data,
    ),
  markAllRead: () =>
    req<{ data: { ok: boolean } }>("/notifications/read-all", { method: "PATCH" }).then(
      (x) => x.data,
    ),
};
