/** Meetings service — meetings and their action items. */
import type {
  Meeting,
  ActionItem,
  MeetingCreateInput,
  MeetingUpdateInput,
  ActionItemCreateInput,
  ActionItemUpdateInput,
} from "@pmin/core";
import { req } from "@/lib/http";

export const meetingsService = {
  list: (pid: string) => req<{ data: Meeting[] }>(`/projects/${pid}/meetings`).then((x) => x.data),

  create: (pid: string, body: MeetingCreateInput) =>
    req<{ data: Meeting }>(`/projects/${pid}/meetings`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  update: (pid: string, id: string, patch: MeetingUpdateInput) =>
    req<{ data: Meeting }>(`/projects/${pid}/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  remove: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/meetings/${id}`, { method: "DELETE" }).then(() => undefined),

  addActionItem: (pid: string, meetingId: string, body: ActionItemCreateInput) =>
    req<{ data: ActionItem }>(`/projects/${pid}/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateActionItem: (pid: string, id: string, patch: ActionItemUpdateInput) =>
    req<{ data: ActionItem }>(`/projects/${pid}/action-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),
};
