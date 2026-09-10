/** Task module — CRUD, config (statuses/labels/types), links, comments. */
import { describe, expect, it } from "vitest";
import { api, registerUser, setupProject, unique } from "./helpers";

interface TaskRow {
  id: string;
  projectId: string;
  title: string;
  statusId: string;
  priority: string;
  updatedAt: string;
}

/** Create a task; throws on non-201 so happy-path tests fail loudly. */
async function createTask(p: { token: string; projectId: string }, title: string) {
  const res = await api(`/projects/${p.projectId}/tasks`, {
    method: "POST",
    token: p.token,
    body: { title },
  });
  if (res.status !== 201) {
    throw new Error(`createTask failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: TaskRow };
  return data;
}

describe("POST /projects/:projectId/tasks", () => {
  it("creates a task with the project's default status and priority", async () => {
    const p = await setupProject();
    const task = await createTask(p, `Fix login ${unique()}`);
    expect(task.projectId).toBe(p.projectId);
    expect(task.statusId).toBeTruthy();
    expect(task.priority).toBe("medium");

    // the default status comes from the seeded per-project config
    const statuses = await api(`/projects/${p.projectId}/tasks/statuses`, { token: p.token });
    const { data } = (await statuses.json()) as { data: { id: string; isDefault: boolean }[] };
    const def = data.find((s) => s.isDefault);
    expect(def?.id).toBe(task.statusId);
  });

  it("rejects an empty title with 400", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/tasks`, {
      method: "POST",
      token: p.token,
      body: { title: "" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown status with 404", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/tasks`, {
      method: "POST",
      token: p.token,
      body: { title: "Bad status", statusId: "0197d3b0-0000-7000-8000-000000000000" },
    });
    expect(res.status).toBe(404);
  });

  it("rejects an unknown label id with 400", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/tasks`, {
      method: "POST",
      token: p.token,
      body: { title: "Bad label", labelIds: ["0197d3b0-0000-7000-8000-000000000000"] },
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-member of the org", async () => {
    const p = await setupProject();
    const outsider = await registerUser();
    const res = await api(`/projects/${p.projectId}/tasks`, {
      method: "POST",
      token: outsider.token,
      body: { title: "Sneaky" },
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /projects/:projectId/tasks", () => {
  it("lists tasks paginated and filters by status", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Filterable");

    const list = await api(`/projects/${p.projectId}/tasks?limit=50`, { token: p.token });
    expect(list.status).toBe(200);
    const body = (await list.json()) as { items: TaskRow[]; hasMore: boolean };
    expect(body.items.some((t) => t.id === task.id)).toBe(true);

    const filtered = await api(`/projects/${p.projectId}/tasks?statusId=${task.statusId}`, {
      token: p.token,
    });
    const filteredBody = (await filtered.json()) as { items: TaskRow[] };
    expect(filteredBody.items.every((t) => t.statusId === task.statusId)).toBe(true);
  });
});

describe("GET /projects/:projectId/tasks/:id", () => {
  it("returns the task with its comments and subtasks", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Detail view");
    await api(`/projects/${p.projectId}/tasks/${task.id}/comments`, {
      method: "POST",
      token: p.token,
      body: { body: "First comment" },
    });

    const res = await api(`/projects/${p.projectId}/tasks/${task.id}`, { token: p.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { id: string; comments: { body: string }[]; subtasks: unknown[] };
    };
    expect(data.id).toBe(task.id);
    expect(data.comments.map((c) => c.body)).toContain("First comment");
    expect(data.subtasks).toHaveLength(0);
  });
});

describe("PATCH /projects/:projectId/tasks/:id", () => {
  it("updates fields", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Before patch");
    const res = await api(`/projects/${p.projectId}/tasks/${task.id}`, {
      method: "PATCH",
      token: p.token,
      body: { title: "After patch", priority: "urgent" },
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { title: string; priority: string } };
    expect(data.title).toBe("After patch");
    expect(data.priority).toBe("urgent");
  });

  it("detects a stale updatedAt with 409 (optimistic concurrency)", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Concurrent edit");
    const res = await api(`/projects/${p.projectId}/tasks/${task.id}`, {
      method: "PATCH",
      token: p.token,
      body: { title: "Clobbered", updatedAt: "2020-01-01T00:00:00.000Z" },
    });
    expect(res.status).toBe(409);
  });

  it("rejects an unknown label id with 400", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Label patch");
    const res = await api(`/projects/${p.projectId}/tasks/${task.id}`, {
      method: "PATCH",
      token: p.token,
      body: { labelIds: ["0197d3b0-0000-7000-8000-000000000000"] },
    });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /projects/:projectId/tasks/:id", () => {
  it("soft-deletes the task", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Doomed");
    const del = await api(`/projects/${p.projectId}/tasks/${task.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);
    expect((await api(`/projects/${p.projectId}/tasks/${task.id}`, { token: p.token })).status).toBe(
      404,
    );
  });
});

describe("task config (statuses / labels / types)", () => {
  it("creates and lists custom statuses, labels, and types", async () => {
    const p = await setupProject();
    const suffix = unique();

    const status = await api(`/projects/${p.projectId}/tasks/statuses`, {
      method: "POST",
      token: p.token,
      body: { name: `QA ${suffix}`, color: "#ff0000" },
    });
    expect(status.status).toBe(201);

    const label = await api(`/projects/${p.projectId}/tasks/labels`, {
      method: "POST",
      token: p.token,
      body: { name: `bug ${suffix}`, color: "#00ff00" },
    });
    expect(label.status).toBe(201);

    const type = await api(`/projects/${p.projectId}/tasks/types`, {
      method: "POST",
      token: p.token,
      body: { name: `Feature ${suffix}` },
    });
    expect(type.status).toBe(201);

    const [statuses, labels, types] = await Promise.all([
      api(`/projects/${p.projectId}/tasks/statuses`, { token: p.token }),
      api(`/projects/${p.projectId}/tasks/labels`, { token: p.token }),
      api(`/projects/${p.projectId}/tasks/types`, { token: p.token }),
    ]);
    expect(((await statuses.json()) as { data: { name: string }[] }).data.some((s) => s.name === `QA ${suffix}`)).toBe(true);
    expect(((await labels.json()) as { data: { name: string }[] }).data.some((l) => l.name === `bug ${suffix}`)).toBe(true);
    expect(((await types.json()) as { data: { name: string }[] }).data.some((t) => t.name === `Feature ${suffix}`)).toBe(true);
  });
});

describe("task links", () => {
  it("links two tasks, refuses self-links, and unlinks", async () => {
    const p = await setupProject();
    const a = await createTask(p, "Blocker");
    const b = await createTask(p, "Blocked");

    const link = await api(`/projects/${p.projectId}/tasks/${a.id}/links`, {
      method: "POST",
      token: p.token,
      body: { targetId: b.id, type: "blocks" },
    });
    expect(link.status).toBe(201);
    const linkRow = (await link.json()) as { data: { id: string; targetId: string } };
    expect(linkRow.data.targetId).toBe(b.id);

    const self = await api(`/projects/${p.projectId}/tasks/${a.id}/links`, {
      method: "POST",
      token: p.token,
      body: { targetId: a.id, type: "relates_to" },
    });
    expect(self.status).toBe(400);

    const del = await api(`/projects/${p.projectId}/tasks/${a.id}/links/${linkRow.data.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);
  });
});

describe("task comments", () => {
  it("creates a comment that shows up on the task detail", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Commented");
    const res = await api(`/projects/${p.projectId}/tasks/${task.id}/comments`, {
      method: "POST",
      token: p.token,
      body: { body: "Looks good to me" },
    });
    expect(res.status).toBe(201);

    const detail = await api(`/projects/${p.projectId}/tasks/${task.id}`, { token: p.token });
    const { data } = (await detail.json()) as { data: { comments: { body: string }[] } };
    expect(data.comments.map((c) => c.body)).toContain("Looks good to me");
  });

  it("rejects an empty comment with 400", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Empty comment");
    const res = await api(`/projects/${p.projectId}/tasks/${task.id}/comments`, {
      method: "POST",
      token: p.token,
      body: { body: "" },
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /projects/:projectId/tasks/:id/activity", () => {
  it("returns creation, status transition, and comment events newest-first", async () => {
    const p = await setupProject();
    const task = await createTask(p, "Watched");

    const statuses = await api(`/projects/${p.projectId}/tasks/statuses`, { token: p.token });
    const { data: statusRows } = (await statuses.json()) as {
      data: { id: string; name: string }[];
    };
    const other = statusRows.find((s) => s.id !== task.statusId)!;
    await api(`/projects/${p.projectId}/tasks/${task.id}`, {
      method: "PATCH",
      token: p.token,
      body: { statusId: other.id },
    });
    await api(`/projects/${p.projectId}/tasks/${task.id}/comments`, {
      method: "POST",
      token: p.token,
      body: { body: "Activity comment" },
    });

    const res = await api(`/projects/${p.projectId}/tasks/${task.id}/activity`, {
      token: p.token,
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { id: string; type: string; actorName: string | null; toStatusName: string | null; body: string | null; createdAt: string }[];
    };
    const types = data.map((e) => e.type);
    expect(types).toContain("created");
    expect(types).toContain("status");
    expect(types).toContain("comment");
    // newest first
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1]!.createdAt >= data[i]!.createdAt).toBe(true);
    }
    const statusEvent = data.find((e) => e.type === "status")!;
    expect(statusEvent.toStatusName).toBe(other.name);
    expect(statusEvent.actorName).toBeTruthy();
  });
});
