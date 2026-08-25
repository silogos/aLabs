/** Meetings service — meetings and their action items. */
import { z } from "zod";
import { meetingCreate, meetingUpdate, actionItemCreate, actionItemUpdate } from "@pmin/core";
import type { Meeting, ActionItem } from "@pmin/core";
import { req } from "@/lib/http";

export const meetingsService = {
  list: (pid: string) => req<{ data: Meeting[] }>(`/projects/${pid}/meetings`).then((x) => x.data),

  create: (pid: string, body: z.input<typeof meetingCreate>) =>
    req<{ data: Meeting }>(`/projects/${pid}/meetings`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  update: (pid: string, id: string, patch: z.input<typeof meetingUpdate>) =>
    req<{ data: Meeting }>(`/projects/${pid}/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  remove: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/meetings/${id}`, { method: "DELETE" }).then(() => undefined),

  addActionItem: (pid: string, meetingId: string, body: z.input<typeof actionItemCreate>) =>
    req<{ data: ActionItem }>(`/projects/${pid}/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateActionItem: (pid: string, id: string, patch: z.input<typeof actionItemUpdate>) =>
    req<{ data: ActionItem }>(`/projects/${pid}/action-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),
};
