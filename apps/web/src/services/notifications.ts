/** Notifications service — the authenticated user's notification feed. */
import type { Notification } from "@pmin/core";
import { req } from "@/lib/http";

export const notificationsService = {
  list: () => req<{ data: Notification[] }>("/notifications").then((x) => x.data),
};
