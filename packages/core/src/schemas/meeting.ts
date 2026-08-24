/** Meeting schemas — action items are declared here because meetings embed
 *  them inline in responses. */
import { z } from "zod";
import { id, iso } from "./common";
import { userSchema } from "./auth";
import { MeetingType, MeetingStatus } from "../enums";

export const actionItemSchema = z.object({
  id,
  meetingId: id,
  taskId: id.nullable(),
  assigneeId: id.nullable(),
  description: z.string(),
  done: z.boolean(),
  dueDate: iso.nullable(),
  createdAt: iso,
  updatedAt: iso,
});
export type ActionItem = z.infer<typeof actionItemSchema>;

export const actionItemCreate = z.object({
  description: z.string().min(1).max(2000),
  assigneeId: id.optional(),
  dueDate: iso.optional(),
});
export const actionItemUpdate = actionItemCreate.partial().extend({
  done: z.boolean().optional(),
  taskId: id.nullable().optional(),
});

export const meetingSchema = z.object({
  id,
  projectId: id,
  title: z.string(),
  type: MeetingType.nullable(),
  scheduledAt: iso,
  duration: z.number().int().nullable(),
  location: z.string().nullable(),
  agenda: z.array(z.string()).nullable(),
  notes: z.string().nullable(),
  status: MeetingStatus,
  participants: z.array(userSchema).default([]),
  actionItems: z.array(actionItemSchema).default([]),
  createdAt: iso,
  updatedAt: iso,
});
export type Meeting = z.infer<typeof meetingSchema>;

export const meetingCreate = z.object({
  title: z.string().min(1).max(200),
  type: MeetingType.optional(),
  scheduledAt: iso,
  duration: z.number().int().optional(),
  location: z.string().optional(),
  participantIds: z.array(id).optional(),
});
export const meetingUpdate = meetingCreate.partial().extend({
  status: MeetingStatus.optional(),
  agenda: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
