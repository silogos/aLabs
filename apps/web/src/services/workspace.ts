/** Workspace service — organizations, projects, members, project visit history. */
import type { Organization, Project, Member } from "@pmin/core";
import { req } from "@/lib/http";

export const workspaceService = {
  orgs: () => req<{ data: Organization[] }>("/organizations").then((x) => x.data),

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
};
