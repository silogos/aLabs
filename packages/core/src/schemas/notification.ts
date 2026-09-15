/** Notification schemas. */
import { z } from "zod";
import { id, iso } from "./common";
import { NotificationChannel } from "../enums";

/** Where a notification points — routing DATA, never a URL: the backend
 *  ships the identifiers, each client formats its own links (the web app
 *  builds /{orgSlug}/{projectSlug}/tasks/{order}, /{orgSlug}/members and
 *  /{orgSlug}/members/{userId}).
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
  z.object({
    kind: z.literal("user"),
    orgSlug: z.string(),
    userId: id,
  }),
]);
export type NotificationTarget = z.infer<typeof notificationTargetSchema>;

/** One span of a notification title — plain text, or an entity reference
 *  (actor, task serial) the client renders as an inline link. Data only:
 *  the client decides what a span links to and how it looks. */
export const notificationTitleSegmentSchema = z.object({
  text: z.string(),
  target: notificationTargetSchema.nullable().optional(),
});
export type NotificationTitleSegment = z.infer<typeof notificationTitleSegmentSchema>;

export const notificationSchema = z.object({
  id,
  userId: id,
  type: z.string(),
  /** Plain text, always present — canonical title (search, email, fallback) */
  title: z.string(),
  /** Rich title spans; null when the emitter had no entities to link */
  titleSegments: z.array(notificationTitleSegmentSchema).nullable(),
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
