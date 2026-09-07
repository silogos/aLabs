/** Workspace service — organizations, projects, members, project visit history. */
import type {
  Organization,
  Project,
  Member,
  Invitation,
  ProjectMember,
  Paginated,
} from "@pmin/core";
import { req } from "@/lib/http";

type OrgUpdate = {
  name?: string;
  description?: string | null;
  website?: string | null;
  timezone?: string;
  language?: string;
};

export interface OrgActivityEntry {
  id: string;
  kind: "move" | "doc" | "com" | "done" | "mile";
  projectId: string;
  actorId: string;
  actorName: string | null;
  target: string;
  when: string;
  whenLabel: string;
  projectName: string;
  projectKey: string;
}

type ProjectUpdateBody = {
  name?: string;
  slug?: string;
  key?: string;
  description?: string;
  icon?: string | null;
  status?: "active" | "on_hold" | "archived";
  visibility?: "organization" | "private";
};

type ProjectMemberAddBody = { email: string; roleName?: string };
type ProjectMemberUpdateBody = { roleName?: string; status?: "active" };

export const workspaceService = {
  orgs: () => req<{ data: Organization[] }>("/organizations").then((x) => x.data),

  orgActivity: (orgId: string, limit = 100) =>
    req<{ data: OrgActivityEntry[] }>(`/organizations/${orgId}/activity?limit=${limit}`).then(
      (x) => x.data,
    ),

  deleteOrg: (orgId: string) =>
    req<void>(`/organizations/${orgId}`, { method: "DELETE" }).then(() => undefined),

  projects: (orgId: string) =>
    req<{ data: Project[] }>(`/organizations/${orgId}/projects`).then((x) => x.data),

  members: (orgId: string) =>
    req<{ data: Member[] }>(`/organizations/${orgId}/members`).then((x) => x.data),

  /** Project visit history ("recents"). */
  recents: (limit = 3) =>
    req<{ data: { project: Project; organization: Organization; visitedAt: string }[] }>(
      `/users/me/recents?limit=${limit}`,
    ).then((x) => x.data),

  touchProject: (pid: string) =>
    req<{ data: { project: Project; visitedAt: string } }>("/users/me/recents", {
      method: "POST",
      body: JSON.stringify({ projectId: pid }),
    }).then((x) => x.data),

  // --- Organization management ---

  updateOrg: (orgId: string, body: OrgUpdate) =>
    req<{ data: Organization }>(`/organizations/${orgId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateMemberRole: (orgId: string, memberId: string, body: { roleName: string }) =>
    req<{ data: Member }>(`/organizations/${orgId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  removeMember: (orgId: string, memberId: string) =>
    req<void>(`/organizations/${orgId}/members/${memberId}`, {
      method: "DELETE",
    }).then(() => undefined),

  invitations: (orgId: string) =>
    req<Paginated<Invitation>>(`/organizations/${orgId}/invitations`).then(
      (x) => x.items,
    ),

  createInvitation: (orgId: string, body: { email: string; roleName: string }) =>
    req<{ data: Invitation }>(`/organizations/${orgId}/invitations`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  actOnInvitation: (
    orgId: string,
    invitationId: string,
    body: { action: "accept" | "cancel" },
  ) =>
    req<{ data: Invitation }>(`/organizations/${orgId}/invitations/${invitationId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  // --- Project management ---

  createProject: (
    orgId: string,
    body: { name: string; slug: string; key: string; description?: string; icon?: string },
  ) =>
    req<{ data: Project }>(`/organizations/${orgId}/projects`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  deleteProject: (orgId: string, projectId: string) =>
    req<void>(`/organizations/${orgId}/projects/${projectId}`, {
      method: "DELETE",
    }).then(() => undefined),

  updateProject: (orgId: string, projectId: string, body: ProjectUpdateBody) =>
    req<{ data: Project }>(`/organizations/${orgId}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  projectMembers: (projectId: string) =>
    req<{ data: ProjectMember[] }>(`/projects/${projectId}/members`).then(
      (x) => x.data,
    ),

  addProjectMember: (projectId: string, body: ProjectMemberAddBody) =>
    req<{ data: ProjectMember }>(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  updateProjectMember: (
    projectId: string,
    memberId: string,
    body: ProjectMemberUpdateBody,
  ) =>
    req<{ data: ProjectMember }>(`/projects/${projectId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then((x) => x.data),

  removeProjectMember: (projectId: string, memberId: string) =>
    req<void>(`/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    }).then(() => undefined),
};
