/** Notification target → app route. The API ships routing data only
 *  (kind + slugs/order); the web app formats its own URLs — same stance
 *  as viewPath in the app provider (ADR 0009: clients resolve slugs). */
import type { NotificationTarget } from "@pmin/core";

export function notificationPath(target: NotificationTarget | null): string | null {
  if (!target) return null;
  switch (target.kind) {
    case "task":
      // task routes take the ORDER number — the drawer resolves Number(param)
      return `/${target.orgSlug}/${target.projectSlug}/tasks/${target.order}`;
    case "members":
      return `/${target.orgSlug}/members`;
  }
}
