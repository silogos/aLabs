/** Notification module — user-scoped list, read-marking, preferences,
 *  and the emitters other modules call (assign / comment / invite). */
import { describe, expect, it } from "vitest";
import { api, registerUser, setupOrg, setupProject, addOrgMember, createProject, unique } from "./helpers";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
}

/** Fetch the user's notification list; throws on non-200. */
async function listNotifications(token: string): Promise<NotificationRow[]> {
  const res = await api("/notifications", { token });
  if (res.status !== 200) throw new Error(`listNotifications failed: ${res.status}`);
  const { data } = (await res.json()) as { data: NotificationRow[] };
  return data;
}

/** Just the notifications of one emitted type. Members pick up an `invite`
 *  notification from the addOrgMember setup flow — filter it out. */
async function notificationsOf(token: string, type: string): Promise<NotificationRow[]> {
  return (await listNotifications(token)).filter((n) => n.type === type);
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
  return (await res.json()) as { data: { id: string } };
}

describe("GET /notifications", () => {
  it("returns an empty list for a fresh user", async () => {
    const u = await registerUser();
    const res = await api("/notifications", { token: u.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: unknown[] };
    expect(data).toHaveLength(0);
  });

  it("requires auth", async () => {
    expect((await api("/notifications")).status).toBe(401);
  });
});

describe("PATCH /notifications/:id/read", () => {
  it("returns 404 for an unknown notification", async () => {
    const u = await registerUser();
    const res = await api("/notifications/0197d3b0-0000-7000-8000-000000000000/read", {
      method: "PATCH",
      token: u.token,
    });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /notifications/read-all", () => {
  it("is idempotent and returns 204", async () => {
    const u = await registerUser();
    const first = await api("/notifications/read-all", { method: "PATCH", token: u.token });
    expect(first.status).toBe(204);
    const second = await api("/notifications/read-all", { method: "PATCH", token: u.token });
    expect(second.status).toBe(204);
  });
});

describe("preferences", () => {
  it("returns an empty object for GET and PATCH", async () => {
    const u = await registerUser();
    const get = await api("/notifications/preferences", { token: u.token });
    expect(get.status).toBe(200);
    expect(((await get.json()) as { data: unknown }).data).toEqual({});

    const patch = await api("/notifications/preferences", {
      method: "PATCH",
      token: u.token,
      body: { email: false },
    });
    expect(patch.status).toBe(200);
    expect(((await patch.json()) as { data: unknown }).data).toEqual({});
  });
});

/* ---------------- emitters (task assigned / comment / invitation) ---------------- */

describe("emitter: task assigned", () => {
  it("notifies the assignee when a task is created with one", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);
    const title = `Wire emitters ${unique()}`;
    const task = await createTask({ token: org.token, projectId: project.id }, title, {
      assigneeId: member.user.id,
    });

    const notifs = await notificationsOf(member.token, "assign");
    expect(notifs).toHaveLength(1);
    expect(notifs[0].title).toContain("assigned you a task");
    expect(notifs[0].body).toBe(title);
    expect(notifs[0].link).toBe(`/${org.slug}/${project.slug}/tasks/${task.data.id}`);

    // the actor is never notified for their own action
    expect(await listNotifications(org.token)).toHaveLength(0);
  });

  it("notifies the new assignee on reassignment, not the previous one", async () => {
    const org = await setupOrg();
    const first = await addOrgMember(org);
    const second = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: project.id }, "Reassign me", {
      assigneeId: first.user.id,
    });

    const res = await api(`/projects/${project.id}/tasks/${task.data.id}`, {
      method: "PATCH",
      token: org.token,
      body: { assigneeId: second.user.id },
    });
    expect(res.status).toBe(200);

    const secondNotifs = await notificationsOf(second.token, "assign");
    expect(secondNotifs).toHaveLength(1);

    // first was notified of the original assignment only — reassignment adds nothing
    expect(await notificationsOf(first.token, "assign")).toHaveLength(1);
  });

  it("does not notify on self-assignment", async () => {
    const p = await setupProject();
    const me = await api("/auth/me", { token: p.token });
    const { data } = (await me.json()) as { data: { id: string } };
    await createTask({ token: p.token, projectId: p.projectId }, `Own task ${unique()}`, {
      assigneeId: data.id,
    });
    expect(await listNotifications(p.token)).toHaveLength(0);
  });
});

describe("emitter: task comment", () => {
  it("notifies the assignee and reporter, never the comment author", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);
    const task = await createTask({ token: org.token, projectId: project.id }, "Comment target", {
      assigneeId: member.user.id,
    });

    // reporter (owner) comments → assignee is notified, author is not
    const byOwner = await api(`/projects/${project.id}/tasks/${task.data.id}/comments`, {
      method: "POST",
      token: org.token,
      body: { body: "Heads up, this one is urgent." },
    });
    expect(byOwner.status).toBe(201);

    const memberNotifs = await notificationsOf(member.token, "comment");
    expect(memberNotifs).toHaveLength(1);
    expect(memberNotifs[0].title).toContain("commented on");
    expect(memberNotifs[0].body).toContain("urgent");
    expect(memberNotifs[0].link).toBe(`/${org.slug}/${project.slug}/tasks/${task.data.id}`);
    expect(await notificationsOf(org.token, "comment")).toHaveLength(0);

    // assignee comments back → only the reporter is notified
    const byMember = await api(`/projects/${project.id}/tasks/${task.data.id}/comments`, {
      method: "POST",
      token: member.token,
      body: { body: "On it." },
    });
    expect(byMember.status).toBe(201);

    const ownerNotifs = await notificationsOf(org.token, "comment");
    expect(ownerNotifs).toHaveLength(1);
    expect(await notificationsOf(member.token, "comment")).toHaveLength(1);
  });

  it("emits nothing when the author comments on their own unassigned task", async () => {
    const p = await setupProject();
    const task = await createTask({ token: p.token, projectId: p.projectId }, "Solo task");
    const res = await api(`/projects/${p.projectId}/tasks/${task.data.id}/comments`, {
      method: "POST",
      token: p.token,
      body: { body: "Note to self" },
    });
    expect(res.status).toBe(201);
    expect(await listNotifications(p.token)).toHaveLength(0);
  });
});

describe("emitter: invitation created", () => {
  it("notifies a registered invitee with a link to the org members page", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    const res = await api(`/organizations/${org.orgId}/invitations`, {
      method: "POST",
      token: org.token,
      body: { email: invitee.email, roleName: "Member" },
    });
    expect(res.status).toBe(201);

    const notifs = await listNotifications(invitee.token);
    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe("invite");
    expect(notifs[0].title).toContain(`invited you to join`);
    expect(notifs[0].link).toBe(`/${org.slug}/members`);
    expect(await listNotifications(org.token)).toHaveLength(0);
  });

  it("skips silently when the invitee has no account yet", async () => {
    const org = await setupOrg();
    const res = await api(`/organizations/${org.orgId}/invitations`, {
      method: "POST",
      token: org.token,
      body: { email: `nobody-${unique()}@example.com`, roleName: "Member" },
    });
    expect(res.status).toBe(201); // invitation created; no user row to notify
  });
});
