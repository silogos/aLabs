/** Planning module — iterations, milestones, and the gantt timeline. */
import { describe, expect, it } from "vitest";
import { api, registerUser, setupProject, unique } from "./helpers";

async function createIteration(p: { token: string; projectId: string }, name: string) {
  const res = await api(`/projects/${p.projectId}/planning/iterations`, {
    method: "POST",
    token: p.token,
    body: { name, startDate: "2026-09-01", endDate: "2026-09-14" },
  });
  if (res.status !== 201) {
    throw new Error(`createIteration failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: { id: string; name: string; status: string } };
  return data;
}

describe("iterations", () => {
  it("creates and lists iterations", async () => {
    const p = await setupProject();
    const name = `Sprint ${unique()}`;
    const iteration = await createIteration(p, name);
    expect(iteration.status).toBe("planned");

    const list = await api(`/projects/${p.projectId}/planning/iterations`, { token: p.token });
    expect(list.status).toBe(200);
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((i) => i.id === iteration.id)).toBe(true);
  });

  it("rejects a missing date with 400", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/planning/iterations`, {
      method: "POST",
      token: p.token,
      body: { name: "No dates", endDate: "2026-09-14" }, // startDate is required
    });
    expect(res.status).toBe(400);
  });

  it("follows the status machine (planned → active → completed)", async () => {
    const p = await setupProject();
    const iteration = await createIteration(p, "Machine");
    const patch = (status: string) =>
      api(`/projects/${p.projectId}/planning/iterations/${iteration.id}`, {
        method: "PATCH",
        token: p.token,
        body: { status },
      });

    expect((await patch("active")).status).toBe(200);
    expect((await patch("completed")).status).toBe(200);
    const back = await patch("active"); // completed is terminal
    expect(back.status).toBe(409);
  });

  it("updates the goal", async () => {
    const p = await setupProject();
    const iteration = await createIteration(p, "Goalless");
    const res = await api(`/projects/${p.projectId}/planning/iterations/${iteration.id}`, {
      method: "PATCH",
      token: p.token,
      body: { goal: "Ship the beta" },
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { goal: string } };
    expect(data.goal).toBe("Ship the beta");
  });

  it("returns 404 for a non-member of the org", async () => {
    const p = await setupProject();
    const outsider = await registerUser();
    expect(
      (await api(`/projects/${p.projectId}/planning/iterations`, { token: outsider.token })).status,
    ).toBe(404);
  });
});

describe("milestones", () => {
  async function createMilestone(p: { token: string; projectId: string }, name: string) {
    const res = await api(`/projects/${p.projectId}/planning/milestones`, {
      method: "POST",
      token: p.token,
      body: { name, dueDate: "2026-10-01" },
    });
    if (res.status !== 201) {
      throw new Error(`createMilestone failed: ${res.status} ${await res.text()}`);
    }
    const { data } = (await res.json()) as { data: { id: string; status: string } };
    return data;
  }

  it("creates, reaches, and refuses reopening a milestone", async () => {
    const p = await setupProject();
    const milestone = await createMilestone(p, `Launch ${unique()}`);
    expect(milestone.status).toBe("planned");

    const reach = await api(`/projects/${p.projectId}/planning/milestones/${milestone.id}`, {
      method: "PATCH",
      token: p.token,
      body: { status: "reached" },
    });
    expect(reach.status).toBe(200);

    const reopen = await api(`/projects/${p.projectId}/planning/milestones/${milestone.id}`, {
      method: "PATCH",
      token: p.token,
      body: { status: "planned" },
    });
    expect(reopen.status).toBe(409);
  });

  it("deletes a milestone", async () => {
    const p = await setupProject();
    const milestone = await createMilestone(p, "Doomed");
    const del = await api(`/projects/${p.projectId}/planning/milestones/${milestone.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);

    const list = await api(`/projects/${p.projectId}/planning/milestones`, { token: p.token });
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((m) => m.id === milestone.id)).toBe(false);
  });
});

describe("GET /projects/:projectId/planning/timeline", () => {
  it("derives the window from the iterations' date range", async () => {
    const p = await setupProject();
    await createIteration(p, "Windowed");

    const res = await api(`/projects/${p.projectId}/planning/timeline`, { token: p.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { iterations: unknown[]; milestones: unknown[]; window: { start: string | null; end: string | null } };
    };
    expect(data.iterations.length).toBeGreaterThanOrEqual(1);
    expect(data.window.start).toBe("2026-09-01");
    expect(data.window.end).toBe("2026-09-14");
  });
});
