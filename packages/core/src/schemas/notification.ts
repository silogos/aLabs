/** Notification schemas. */
import { z } from "zod";
import { id, iso } from "./common";
import { NotificationChannel } from "../enums";

/** Where a notification points — routing DATA, never a URL: the backend
 *  ships the identifiers, each client formats its own links (the web app
 *  builds /{orgSlug}/{projectSlug}/tasks/{order} and /{orgSlug}/members).
 *  Slugs are data here, not routing — the client-resolves-slugs stance of
 *  ADR 0009 still holds for the API's own routes. */
export const notificationTargetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task"),
    orgSlug: z.string(),
    projectSlug: z.string(),
    order: z.number().int(),
  }),
  z.object({
    kind: z.literal("members"),
    orgSlug: z.string(),
  }),
]);
export type NotificationTarget = z.infer<typeof notificationTargetSchema>;

export const notificationSchema = z.object({
  id,
  userId: id,
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  target: notificationTargetSchema.nullable(),
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
