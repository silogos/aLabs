/**
 * State machines — allowed transitions. Any other transition → 409 conflict.
 * From `docs/tech/03-data-model.md` → "State Machines".
 */
import type {
  ProjectStatus,
  IterationStatus,
  MilestoneStatus,
  MeetingStatus,
  AgreementStatus,
} from "../enums";

export const PROJECT_TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  active: ["on_hold", "archived"],
  on_hold: ["active", "archived"],
  archived: ["active"],
};

export const ITERATION_TRANSITIONS: Record<IterationStatus, readonly IterationStatus[]> = {
  planned: ["active"],
  active: ["completed"],
  completed: [],
};

export const MILESTONE_TRANSITIONS: Record<MilestoneStatus, readonly MilestoneStatus[]> = {
  planned: ["reached"],
  reached: [],
};

export const MEETING_TRANSITIONS: Record<MeetingStatus, readonly MeetingStatus[]> = {
  scheduled: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const AGREEMENT_TRANSITIONS: Record<AgreementStatus, readonly AgreementStatus[]> = {
  draft: ["sent"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};
