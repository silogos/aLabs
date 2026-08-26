/** Notification schemas. */
import { z } from "zod";
import { id, iso } from "./common";

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
