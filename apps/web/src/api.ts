/**
 * API client — thin fetch wrappers around the API mounted in-process at
 * /api (same origin, so the session cookie travels with every call). The
 * active organization + project are resolved once at boot from the
 * authenticated user's memberships.
 */
import type {
  User,
  Organization,
  Project,
  Task,
  TaskStatus,
  TaskLabel,
  TaskType,
  Space,
  Page,
  FileRef,
  Iteration,
  Milestone,
  Notification,
  Dashboard,
  Paginated,
  Meeting,
  ActionItem,
  MeetingType,
  Agreement,
  AgreementType,
  AgreementStatus,
} from "@pmin/core";

/** PATCH /meetings/:id body — subset of Meeting fields (see meetingUpdate). */
export interface MeetingUpdateInput {
  title: string;
  type: MeetingType;
  scheduledAt: string;
  duration: number;
  location: string;
  participantIds: string[];
  agenda: string[];
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
}

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message ?? `Request failed (${res.status})`;
    // status on the Error lets callers branch on 401 (expired/revoked session)
    throw Object.assign(new Error(msg), { status: res.status });
  }
  return body as T;
}

const unwrap = <T>(r: Promise<{ data: T }>) => r.then((x) => x.data);

/* ---- auth + tenant ---- */
export const api = {
  me: () => req<{ data: User }>("/auth/me").then((x) => x.data),
  login: (body: { email: string; password: string }) =>
    req<{ data: { user: User; token: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  register: (body: { name: string; email: string; password: string }) =>
    req<{ data: { user: User; token: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  logout: () =>
    req<{ data: { ok: boolean } }>("/auth/logout", { method: "POST" }).then((x) => x.data),
  forgotPassword: (email: string) =>
    req<{ data: { ok: boolean; resetPath?: string } }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }).then((x) => x.data),
  resetPassword: (body: { token: string; password: string }) =>
    req<{ data: { ok: boolean } }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  orgs: () => req<{ data: Organization[] }>("/organizations").then((x) => x.data),
  projects: (orgId: string) =>
    req<{ data: Project[] }>(`/organizations/${orgId}/projects`).then((x) => x.data),
  members: (orgId: string) =>
    req<{ data: { id: string; user: User; role: { name: string } }[] }>(
      `/organizations/${orgId}/members`,
    ).then((x) => x.data),

  /* ---- recents (project visit history) ---- */
  recents: (limit = 3) =>
    req<{ data: { project: Project; organization: Organization; visitedAt: string }[] }>(
      `/users/me/recents?limit=${limit}`,
    ).then((x) => x.data),
  touchProject: (pid: string) =>
    req<{ data: { project: Project; visitedAt: string } }>("/users/me/recents", {
      method: "POST",
      body: JSON.stringify({ projectId: pid }),
    }).then((x) => x.data),

  /* ---- tasks ---- */
  tasks: (pid: string, params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    qs.set("limit", "100");
    return req<Paginated<Task>>(`/projects/${pid}/tasks?${qs}`);
  },
  task: (pid: string, id: string) =>
    req<{ data: Task & { subtasks: Task[]; comments: Comment[] } }>(
      `/projects/${pid}/tasks/${id}`,
    ).then((x) => x.data),
  createTask: (pid: string, body: Partial<Task>) =>
    req<{ data: Task }>(`/projects/${pid}/tasks`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  updateTask: (pid: string, id: string, body: Partial<Task>) =>
    req<{ data: Task }>(`/projects/${pid}/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  addTaskLink: (
    pid: string,
    taskId: string,
    body: { targetId: string; type: "blocks" | "blocked_by" | "relates_to" },
  ) =>
    req<{ data: { id: string } }>(`/projects/${pid}/tasks/${taskId}/links`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  deleteTaskLink: (pid: string, taskId: string, linkId: string) =>
    req<void>(`/projects/${pid}/tasks/${taskId}/links/${linkId}`, {
      method: "DELETE",
    }).then(() => undefined),
  statuses: (pid: string) =>
    req<{ data: TaskStatus[] }>(`/projects/${pid}/tasks/statuses`).then((x) => x.data),
  labels: (pid: string) =>
    req<{ data: TaskLabel[] }>(`/projects/${pid}/tasks/labels`).then((x) => x.data),
  types: (pid: string) =>
    req<{ data: TaskType[] }>(`/projects/${pid}/tasks/types`).then((x) => x.data),

  /* ---- documents ---- */
  spaces: (pid: string) =>
    req<{ data: Space[] }>(`/projects/${pid}/documents/spaces`).then((x) => x.data),
  pages: (pid: string) =>
    req<Paginated<Page>>(`/projects/${pid}/documents/pages?limit=100`),
  page: (pid: string, id: string) =>
    req<{ data: Page }>(`/projects/${pid}/documents/pages/${id}`).then((x) => x.data),
  updatePage: (pid: string, id: string, body: Partial<Page>) =>
    req<{ data: Page }>(`/projects/${pid}/documents/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  createPage: (
    pid: string,
    body: { spaceId: string; title?: string; icon?: string | null; parentId?: string | null },
  ) =>
    req<{ data: Page }>(`/projects/${pid}/documents/pages`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  files: (pid: string) => {
    // files live under documents/files (not in the catalog but provided)
    return req<{ data: FileRef[] } | FileRef[]>(`/projects/${pid}/documents/files`).then(
      (x) => ((x as { data?: FileRef[] }).data ?? (x as FileRef[])),
    );
  },
  /** Upload an image via multipart; returns the served URL (`/uploads/<id>`). */
  uploadFile: async (pid: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    // NOTE: do not set Content-Type — the browser sets the multipart boundary.
    const res = await fetch(`${BASE}/projects/${pid}/documents/files`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const body = (await res.json().catch(() => ({}))) as {
      data?: FileRef;
      error?: { message?: string };
    };
    if (!res.ok) {
      const msg = body?.error?.message ?? `Upload failed (${res.status})`;
      throw new Error(msg);
    }
    return body.data!.url;
  },

  /* ---- planning ---- */
  iterations: (pid: string) =>
    req<{ data: Iteration[] }>(`/projects/${pid}/planning/iterations`).then((x) => x.data),
  milestones: (pid: string) =>
    req<{ data: Milestone[] }>(`/projects/${pid}/planning/milestones`).then((x) => x.data),

  /* ---- meetings ---- */
  meetings: (pid: string) =>
    req<{ data: Meeting[] }>(`/projects/${pid}/meetings`).then((x) => x.data),
  createMeeting: (
    pid: string,
    body: {
      title: string;
      type?: MeetingType;
      scheduledAt: string;
      duration?: number;
      location?: string;
      participantIds?: string[];
    },
  ) =>
    req<{ data: Meeting }>(`/projects/${pid}/meetings`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  updateMeeting: (pid: string, id: string, body: Partial<MeetingUpdateInput>) =>
    req<{ data: Meeting }>(`/projects/${pid}/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  deleteMeeting: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/meetings/${id}`, { method: "DELETE" }).then(() => undefined),
  addActionItem: (pid: string, meetingId: string, body: { description: string; assigneeId?: string; dueDate?: string }) =>
    req<{ data: ActionItem }>(`/projects/${pid}/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  updateActionItem: (
    pid: string,
    id: string,
    body: Partial<{ description: string; assigneeId: string; dueDate: string; done: boolean; taskId: string }>,
  ) =>
    req<{ data: ActionItem }>(`/projects/${pid}/action-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  /* ---- reporting ---- */
  dashboard: (pid: string) =>
    req<{ data: Dashboard }>(`/projects/${pid}/reporting/dashboard`).then((x) => x.data),

  /* ---- agreements ---- */
  agreements: (pid: string) =>
    req<{ data: Agreement[] }>(`/projects/${pid}/agreements`).then((x) => x.data),
  createAgreement: (
    pid: string,
    body: {
      title: string;
      type?: AgreementType;
      counterparty: string;
      value?: number;
      currency?: string;
      startDate?: string;
      endDate?: string;
      ownerId?: string;
      terms?: string;
    },
  ) =>
    req<{ data: Agreement }>(`/projects/${pid}/agreements`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  updateAgreement: (
    pid: string,
    id: string,
    body: Partial<{
      title: string;
      type: AgreementType;
      counterparty: string;
      value: number;
      currency: string;
      startDate: string;
      endDate: string;
      ownerId: string;
      terms: string;
      status: AgreementStatus;
      sentAt: string | null;
      signedAt: string | null;
    }>,
  ) =>
    req<{ data: Agreement }>(`/projects/${pid}/agreements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),
  deleteAgreement: (pid: string, id: string) =>
    req<void>(`/projects/${pid}/agreements/${id}`, { method: "DELETE" }).then(() => undefined),

  /* ---- notifications ---- */
  notifications: () =>
    req<{ data: Notification[] }>("/notifications").then((x) => x.data),
};

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
}

// re-export commonly used types for components
export type {
  User,
  Organization,
  Project,
  Task,
  TaskStatus,
  TaskLabel,
  TaskType,
  Space,
  Page,
  FileRef,
  Iteration,
  Milestone,
  Dashboard,
  Meeting,
  ActionItem,
  MeetingType,
  Agreement,
  AgreementType,
  AgreementStatus,
};
export { unwrap };
