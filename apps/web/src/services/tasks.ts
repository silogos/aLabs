/**
 * Tasks service — rows, config (statuses/labels/types), comments, links.
 * Request bodies derive from the same zod schemas the API validates with.
 */
import { z } from "zod";
import { taskCreate, taskUpdate, taskListQuery, taskLinkCreate, commentCreate } from "@pmin/core";
import type { Task, TaskDetail, TaskStatus, TaskLabel, TaskType, Paginated } from "@pmin/core";
import { req } from "@/lib/http";

export type TaskCreateInput = z.input<typeof taskCreate>;
export type TaskUpdateInput = z.input<typeof taskUpdate>;
export type TaskFilters = Partial<z.input<typeof taskListQuery>>;

export const tasksService = {
  list: (pid: string, filters: TaskFilters = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters))
      if (v !== undefined && v !== "") qs.set(k, String(v));
    qs.set("limit", "100");
    return req<Paginated<Task>>(`/projects/${pid}/tasks?${qs}`);
  },

  get: (pid: string, id: string) =>
    req<{ data: TaskDetail }>(`/projects/${pid}/tasks/${id}`).then((x) => x.data),

  create: (pid: string, body: TaskCreateInput) =>
    req<{ data: Task }>(`/projects/${pid}/tasks`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  update: (pid: string, id: string, patch: TaskUpdateInput) =>
    req<{ data: Task }>(`/projects/${pid}/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((x) => x.data),

  remove: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/tasks/${id}`, { method: "DELETE" }).then(() => undefined),

  addComment: (pid: string, taskId: string, body: z.input<typeof commentCreate>) =>
    req<{ data: TaskDetail["comments"][number] }>(`/projects/${pid}/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  addLink: (pid: string, taskId: string, body: z.input<typeof taskLinkCreate>) =>
    req<{ data: { id: string } }>(`/projects/${pid}/tasks/${taskId}/links`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  removeLink: (pid: string, taskId: string, linkId: string) =>
    req<void>(`/projects/${pid}/tasks/${taskId}/links/${linkId}`, {
      method: "DELETE",
    }).then(() => undefined),

  /* ---- project task config ---- */
  statuses: (pid: string) =>
    req<{ data: TaskStatus[] }>(`/projects/${pid}/tasks/statuses`).then((x) => x.data),
  labels: (pid: string) =>
    req<{ data: TaskLabel[] }>(`/projects/${pid}/tasks/labels`).then((x) => x.data),
  types: (pid: string) =>
    req<{ data: TaskType[] }>(`/projects/${pid}/tasks/types`).then((x) => x.data),
};
