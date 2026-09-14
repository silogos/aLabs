/** Notifications service — the authenticated user's notification feed
 *  and per-type delivery preferences. */
import type { Notification, NotificationPreference } from "@pmin/core";
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
  preferences: () =>
    req<{ data: NotificationPreference[] }>("/notifications/preferences").then((x) => x.data),
  setPreference: (p: NotificationPreference) =>
    req<{ data: NotificationPreference }>("/notifications/preferences", {
      method: "PATCH",
      body: JSON.stringify(p),
    }).then((x) => x.data),
};
