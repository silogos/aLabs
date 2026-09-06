/** Reporting module — dashboard aggregation, progress, activity, export. */
import { describe, expect, it } from "vitest";
import { api, registerUser, setupProject } from "./helpers";

/** Create one task through the real endpoint (needed for progress counts). */
async function createTask(p: { token: string; projectId: string }, title: string) {
  const res = await api(`/projects/${p.projectId}/tasks`, {
    method: "POST",
    token: p.token,
    body: { title },
  });
  const { data } = (await res.json()) as { data: { statusId: string } };
  return data;
}

describe("GET /projects/:projectId/reporting/dashboard", () => {
  it("returns the project with aggregates and a recent activity slice", async () => {
    const p = await setupProject();
    await createTask(p, "Dashboard filler");

    const res = await api(`/projects/${p.projectId}/reporting/dashboard`, { token: p.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { project: { id: string }; activity: unknown[] };
    };
    expect(data.project.id).toBe(p.projectId);
    expect(Array.isArray(data.activity)).toBe(true);
  });

  it("returns 404 for a non-member of the org", async () => {
    const p = await setupProject();
    const outsider = await registerUser();
    expect(
      (
        await api(`/projects/${p.projectId}/reporting/dashboard`, { token: outsider.token })
      ).status,
    ).toBe(404);
  });
});

describe("GET /projects/:projectId/reporting/progress", () => {
  it("counts tasks per status", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Progress filler");

    const res = await api(`/projects/${p.projectId}/reporting/progress`, { token: p.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { statuses: { id: string; count: number }[] };
    };
    const bucket = data.statuses.find((s) => s.id === task.statusId);
    expect(bucket).toBeDefined();
    expect(bucket!.count).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /projects/:projectId/reporting/activity", () => {
  it("returns the project activity feed", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/reporting/activity`, { token: p.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: unknown[] };
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("GET /projects/:projectId/reporting/export", () => {
  it("defaults to csv and echoes the requested format", async () => {
    const p = await setupProject();
    const def = await api(`/projects/${p.projectId}/reporting/export`, { token: p.token });
    expect(def.status).toBe(200);
    expect(((await def.json()) as { data: { format: string } }).data.format).toBe("csv");

    const json = await api(`/projects/${p.projectId}/reporting/export?format=json`, {
      token: p.token,
    });
    expect(((await json.json()) as { data: { format: string } }).data.format).toBe("json");
  });
});
