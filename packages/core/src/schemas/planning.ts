/** Planning schemas — iterations + milestones. */
import { z } from "zod";
import { id, iso } from "./common";
import { IterationStatus, MilestoneStatus } from "../enums";

export const iterationSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  goal: z.string().nullable(),
  startDate: iso,
  endDate: iso,
  status: IterationStatus,
  progress: z.number(),
  committedPoints: z.number().int(),
  completedPoints: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});
export type Iteration = z.infer<typeof iterationSchema>;

export const iterationCreate = z.object({
  name: z.string().min(1).max(120),
  goal: z.string().optional(),
  startDate: iso,
  endDate: iso,
});
export const iterationUpdate = iterationCreate.partial().extend({
  status: IterationStatus.optional(),
});

export const milestoneSchema = z.object({
  id,
  projectId: id,
  name: z.string(),
  description: z.string().nullable(),
  dueDate: iso.nullable(),
  status: MilestoneStatus,
  progress: z.number(),
  totalTasks: z.number().int(),
  doneTasks: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const milestoneCreate = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  dueDate: iso.nullable().optional(),
});
export const milestoneUpdate = milestoneCreate.partial().extend({
  status: MilestoneStatus.optional(),
});
