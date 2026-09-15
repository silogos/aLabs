/** Activity module — the emitters modules call after their mutations (task
 *  status change / task comment / project created) writing rows that both
 *  feeds read: GET /projects/:id/reporting/activity and
 *  GET /organizations/:id/activity. */
import { describe, expect, it } from "vitest";
import { api, setupOrg, createProject, unique } from "./helpers";

interface ActivityRow {
  id: string;
  kind: string;
  projectId: string;
  actorId: string;
  target: string;
  when: string;
  whenLabel: string;
}

interface OrgActivityRow extends ActivityRow {
  actorName: string | null;
  projectName: string;
  projectKey: string;
}

async function projectActivity(token: string, projectId: string): Promise<ActivityRow[]> {
  const res = await api(`/projects/${projectId}/reporting/activity`, { token });
  if (res.status !== 200) throw new Error(`projectActivity failed: ${res.status}`);
  const { data } = (await res.json()) as { data: ActivityRow[] };
  return data;
}

async function orgActivity(token: string, orgId: string): Promise<OrgActivityRow[]> {
  const res = await api(`/organizations/${orgId}/activity`, { token });
  if (res.status !== 200) throw new Error(`orgActivity failed: ${res.status}`);
  const { data } = (await res.json()) as { data: OrgActivityRow[] };
  return data;
}

/** The caller's user id — rows carry it as actorId. */
async function meId(token: string): Promise<string> {
  const res = await api("/auth/me", { token });
  return ((await res.json()) as { data: { id: string } }).data.id;
}

/** Create a task; throws on non-201 so happy-path tests fail loudly. */
async function createTask(
  p: { token: string; projectId: string },
  title: string,
  body: Record<string, unknown> = {},
) {
  const res = await api(`/projects/${p.projectId}/tasks`, {
    method: "POST",
    token: p.token,
    body: { title, ...body },
  });
  if (res.status !== 201) throw new Error(`createTask failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { data: { id: string; order: number } };
}

/** Status name → id for a fresh project (seeded defaults: To Do /
 *  In Progress / Done …). */
async function statusIds(token: string, projectId: string): Promise<Record<string, string>> {
  const res = await api(`/projects/${projectId}/tasks/statuses`, { token });
  if (res.status !== 200) throw new Error(`statusIds failed: ${res.status}`);
  const { data } = (await res.json()) as { data: { id: string; name: string }[] };
  return Object.fromEntries(data.map((s) => [s.name, s.id]));
}

describe("emitter: task status change", () => {
  it("writes a move row readable from both feeds", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: project.id }, `Move me ${unique()}`);
    const statuses = await statusIds(org.token, project.id);

    const res = await api(`/projects/${project.id}/tasks/${task.data.id}`, {
      method: "PATCH",
      token: org.token,
      body: { statusId: statuses["In Progress"]! },
    });
    expect(res.status).toBe(200);

    // serial target, live actor, no pinned label (clients compute timeAgo)
    const expectedTarget = `${project.key}-${task.data.order}`;
    const feed = await projectActivity(org.token, project.id);
    const row = feed.find((a) => a.kind === "move");
    expect(row).toBeDefined();
    expect(row!.target).toBe(expectedTarget);
    expect(row!.actorId).toBe(await meId(org.token));
    expect(row!.whenLabel).toBe("");

    // the org feed hydrates the same row with actor + project names
    const orgRow = (await orgActivity(org.token, org.orgId)).find((a) => a.kind === "move");
    expect(orgRow).toMatchObject({
      target: expectedTarget,
      actorName: expect.any(String),
      projectName: project.name,
      projectKey: project.key,
    });
  });

  it("writes done when the task lands in a status named Done", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: project.id }, "Finish me");
    const statuses = await statusIds(org.token, project.id);

    const res = await api(`/projects/${project.id}/tasks/${task.data.id}`, {
      method: "PATCH",
      token: org.token,
      body: { statusId: statuses.Done! },
    });
    expect(res.status).toBe(200);

    const feed = await projectActivity(org.token, project.id);
    expect(feed.filter((a) => a.kind === "done")).toHaveLength(1);
    expect(feed.find((a) => a.kind === "move")).toBeUndefined();
  });

  it("writes nothing when the status does not change", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: project.id }, "Untouched flow");

    const res = await api(`/projects/${project.id}/tasks/${task.data.id}`, {
      method: "PATCH",
      token: org.token,
      body: { title: "Renamed, same status" },
    });
    expect(res.status).toBe(200);

    // only the project-created row exists — no task event
    const feed = await projectActivity(org.token, project.id);
    expect(feed.filter((a) => a.kind !== "proj")).toHaveLength(0);
  });

  it("keeps the project feed scoped to its own project", async () => {
    const org = await setupOrg();
    const a = await createProject(org.token, org.orgId);
    const b = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: a.id }, "Project A only");
    const statuses = await statusIds(org.token, a.id);

    const res = await api(`/projects/${a.id}/tasks/${task.data.id}`, {
      method: "PATCH",
      token: org.token,
      body: { statusId: statuses["In Progress"]! },
    });
    expect(res.status).toBe(200);

    const feedB = await projectActivity(org.token, b.id);
    expect(feedB.find((a2) => a2.kind === "move")).toBeUndefined();
  });
});

describe("emitter: task comment", () => {
  it("writes a com row for the commented task", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: project.id }, "Comment target");

    const res = await api(`/projects/${project.id}/tasks/${task.data.id}/comments`, {
      method: "POST",
      token: org.token,
      body: { body: "Leaving a trail." },
    });
    expect(res.status).toBe(201);

    const row = (await projectActivity(org.token, project.id)).find((a) => a.kind === "com");
    expect(row).toBeDefined();
    expect(row!.target).toBe(`${project.key}-${task.data.order}`);
    expect(row!.actorId).toBe(await meId(org.token));
  });
});

describe("emitter: project created", () => {
  it("writes a proj row naming the project, in both feeds", async () => {
    const org = await setupOrg();
    const name = `Feed Project ${unique()}`;
    const project = await createProject(org.token, org.orgId, { name });

    const orgRow = (await orgActivity(org.token, org.orgId)).find((a) => a.kind === "proj");
    expect(orgRow).toMatchObject({
      target: name,
      projectKey: project.key,
      actorName: expect.any(String),
    });

    // the row references the project it announces, so the project's own
    // feed carries it too
    const projFeed = await projectActivity(org.token, project.id);
    expect(projFeed.find((a) => a.kind === "proj")?.target).toBe(name);
  });
});
