/** Planning service — iterations (sprints) and milestones. */
import type {
  Iteration,
  Milestone,
  IterationCreateInput,
  IterationUpdateInput,
  MilestoneCreateInput,
  MilestoneUpdateInput,
} from "@pmin/core";
import { req } from "@/lib/http";

export const planningService = {
  /* ---- iterations (sprints) ---- */
  iterations: (pid: string) =>
    req<{ data: Iteration[] }>(`/projects/${pid}/planning/iterations`).then((x) => x.data),

  createIteration: (pid: string, body: IterationCreateInput) =>
    req<{ data: Iteration }>(`/projects/${pid}/planning/iterations`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateIteration: (pid: string, id: string, patch: IterationUpdateInput) =>
    req<{ data: Iteration }>(`/projects/${pid}/planning/iterations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  /* ---- milestones ---- */
  milestones: (pid: string) =>
    req<{ data: Milestone[] }>(`/projects/${pid}/planning/milestones`).then((x) => x.data),

  createMilestone: (pid: string, body: MilestoneCreateInput) =>
    req<{ data: Milestone }>(`/projects/${pid}/planning/milestones`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateMilestone: (pid: string, id: string, patch: MilestoneUpdateInput) =>
    req<{ data: Milestone }>(`/projects/${pid}/planning/milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  deleteMilestone: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/planning/milestones/${id}`, {
      method: "DELETE",
    }).then(() => undefined),
};
