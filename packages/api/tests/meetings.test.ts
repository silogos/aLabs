/** Meeting module — meetings, participants, and action items. */
import { describe, expect, it } from "vitest";
import { api, registerUser, setupProject, unique } from "./helpers";

interface MeetingRow {
  id: string;
  title: string;
  status: string;
  participants: { id: string }[];
}

async function createMeeting(
  p: { token: string; projectId: string },
  title: string,
  extra: Record<string, unknown> = {},
) {
  const res = await api(`/projects/${p.projectId}/meetings`, {
    method: "POST",
    token: p.token,
    body: {
      title,
      type: "review",
      scheduledAt: "2026-09-10T09:00:00.000Z",
      duration: 60,
      ...extra,
    },
  });
  if (res.status !== 201) {
    throw new Error(`createMeeting failed: ${res.status} ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: MeetingRow };
  return data;
}

describe("POST /projects/:projectId/meetings", () => {
  it("creates a meeting and embeds the participants", async () => {
    const p = await setupProject();
    const me = await api("/auth/me", { token: p.token });
    const { data: user } = (await me.json()) as { data: { id: string } };

    const meeting = await createMeeting(p, `Review ${unique()}`, {
      participantIds: [user.id],
    });
    expect(meeting.status).toBe("scheduled");
    expect(meeting.participants.map((x) => x.id)).toContain(user.id);
  });

  it("rejects an invalid type with 400", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/meetings`, {
      method: "POST",
      token: p.token,
      body: {
        title: "Bad type",
        type: "workation",
        scheduledAt: "2026-09-10T09:00:00.000Z",
      },
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-member of the org", async () => {
    const p = await setupProject();
    const outsider = await registerUser();
    const res = await api(`/projects/${p.projectId}/meetings`, {
      method: "POST",
      token: outsider.token,
      body: { title: "Sneaky", scheduledAt: "2026-09-10T09:00:00.000Z" },
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /projects/:projectId/meetings", () => {
  it("lists meetings and returns one by id", async () => {
    const p = await setupProject();
    const meeting = await createMeeting(p, "Listed");

    const list = await api(`/projects/${p.projectId}/meetings`, { token: p.token });
    expect(list.status).toBe(200);
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((m) => m.id === meeting.id)).toBe(true);

    const get = await api(`/projects/${p.projectId}/meetings/${meeting.id}`, { token: p.token });
    expect(get.status).toBe(200);
    const got = (await get.json()) as { data: { id: string } };
    expect(got.data.id).toBe(meeting.id);
  });
});

describe("PATCH /projects/:projectId/meetings/:id", () => {
  it("updates fields", async () => {
    const p = await setupProject();
    const meeting = await createMeeting(p, "Before");
    const res = await api(`/projects/${p.projectId}/meetings/${meeting.id}`, {
      method: "PATCH",
      token: p.token,
      body: { title: "After", location: "Room 42", agenda: ["Intro", "Demo"] },
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { title: string; location: string; agenda: string[] };
    };
    expect(data.title).toBe("After");
    expect(data.location).toBe("Room 42");
    expect(data.agenda).toEqual(["Intro", "Demo"]);
  });

  it("follows the status machine (scheduled → completed; completed is terminal)", async () => {
    const p = await setupProject();
    const meeting = await createMeeting(p, "Machine");
    const patch = (status: string) =>
      api(`/projects/${p.projectId}/meetings/${meeting.id}`, {
        method: "PATCH",
        token: p.token,
        body: { status },
      });

    expect((await patch("completed")).status).toBe(200);
    const reopen = await patch("scheduled");
    expect(reopen.status).toBe(409);
  });
});

describe("action items", () => {
  it("creates an action item, marks it done, and embeds it in the meeting", async () => {
    const p = await setupProject();
    const meeting = await createMeeting(p, "With actions");

    const create = await api(`/projects/${p.projectId}/meetings/${meeting.id}/action-items`, {
      method: "POST",
      token: p.token,
      body: { description: "Send the recap", dueDate: "2026-09-11" },
    });
    expect(create.status).toBe(201);
    const { data: item } = (await create.json()) as { data: { id: string; done: boolean } };
    expect(item.done).toBe(false);

    const patch = await api(`/projects/${p.projectId}/action-items/${item.id}`, {
      method: "PATCH",
      token: p.token,
      body: { done: true },
    });
    expect(patch.status).toBe(200);
    const patched = (await patch.json()) as { data: { done: boolean } };
    expect(patched.data.done).toBe(true);

    const detail = await api(`/projects/${p.projectId}/meetings/${meeting.id}`, {
      token: p.token,
    });
    const { data } = (await detail.json()) as { data: { actionItems: { id: string }[] } };
    expect(data.actionItems.some((a) => a.id === item.id)).toBe(true);
  });
});

describe("DELETE /projects/:projectId/meetings/:id", () => {
  it("soft-deletes the meeting", async () => {
    const p = await setupProject();
    const meeting = await createMeeting(p, "Doomed");
    const del = await api(`/projects/${p.projectId}/meetings/${meeting.id}`, {
      method: "DELETE",
      token: p.token,
    });
    expect(del.status).toBe(204);
    expect(
      (await api(`/projects/${p.projectId}/meetings/${meeting.id}`, { token: p.token })).status,
    ).toBe(404);
  });
});
