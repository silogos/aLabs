/** Notification schemas. */
import { z } from "zod";
import { id, iso } from "./common";
import { NotificationChannel } from "../enums";

export const notificationSchema = z.object({
  id,
  userId: id,
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  readAt: iso.nullable(),
  createdAt: iso,
});
export type Notification = z.infer<typeof notificationSchema>;

/** Event types with a runtime emitter (modules/notification/emit.ts) — the
 *  types preferences can gate. Demo-seed-only types (mention, due) have no
 *  emitter and therefore no preference row yet. */
export const notifiableEventTypes = ["assign", "comment", "invite"] as const;
export type NotifiableEventType = (typeof notifiableEventTypes)[number];

/** Preference shape as the API exposes it — keyed by (channel, type), the
 *  natural key, not the row uuid. GET resolves the full matrix (absent rows
 *  default to enabled); PATCH upserts one triple. */
export const notificationPreferenceSchema = z.object({
  channel: NotificationChannel,
  type: z.enum(notifiableEventTypes),
  enabled: z.boolean(),
});
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;
