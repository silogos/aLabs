/**
 * State machines — allowed transitions. Any other transition → 409 conflict.
 * From `docs/tech/03-data-model.md` → "State Machines".
 */
import type {
  InvitationStatus,
  ProjectStatus,
  IterationStatus,
  MilestoneStatus,
  MeetingStatus,
  AgreementStatus,
  ClientUserStatus,
  SubscriptionStatus,
} from "../enums";

export const INVITATION_TRANSITIONS: Record<InvitationStatus, readonly InvitationStatus[]> = {
  pending: ["accepted", "expired", "cancelled"],
  accepted: [],
  expired: [],
  cancelled: [],
};

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

export const CLIENT_USER_TRANSITIONS: Record<ClientUserStatus, readonly ClientUserStatus[]> = {
  invited: ["active"],
  active: ["disabled"],
  disabled: ["active"],
};

export const SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, readonly SubscriptionStatus[]> = {
  active: ["past_due"],
  past_due: ["active", "canceled"],
  canceled: [],
};
