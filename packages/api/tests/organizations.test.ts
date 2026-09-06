/** Organization module — CRUD, members/roles, invitations, soft delete. */
import { describe, expect, it } from "vitest";
import { api, registerUser, setupOrg, unique } from "./helpers";

describe("POST /organizations", () => {
  it("creates an org and makes the creator its Owner", async () => {
    const owner = await registerUser();
    const res = await api("/organizations", {
      method: "POST",
      token: owner.token,
      body: { name: "Acme", slug: `acme-${unique()}` },
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { data: { id: string; type: string; slug: string } };
    expect(body.data.type).toBe("team");

    const members = await api(`/organizations/${body.data.id}/members`, { token: owner.token });
    const { data } = (await members.json()) as {
      data: { role: { name: string }; user: { id: string } }[];
    };
    expect(data).toHaveLength(1);
    expect(data[0].user.id).toBe(owner.user.id);
    expect(data[0].role.name).toBe("Owner");
  });

  it("rejects a duplicate slug with 400", async () => {
    const { token, slug } = await setupOrg();
    const res = await api("/organizations", {
      method: "POST",
      token,
      body: { name: "Clone", slug },
    });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid slug with 400", async () => {
    const owner = await registerUser();
    const res = await api("/organizations", {
      method: "POST",
      token: owner.token,
      body: { name: "Bad", slug: "Not A Slug" },
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /organizations", () => {
  it("lists only orgs the user belongs to", async () => {
    const { token, orgId } = await setupOrg();
    const res = await api("/organizations", { token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { id: string }[] };
    expect(data.some((o) => o.id === orgId)).toBe(true);
  });

  it("requires auth", async () => {
    expect((await api("/organizations")).status).toBe(401);
  });
});

describe("GET /organizations/:id", () => {
  it("returns the org for a member", async () => {
    const { token, orgId } = await setupOrg();
    const res = await api(`/organizations/${orgId}`, { token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { id: string } };
    expect(data.id).toBe(orgId);
  });

  it("returns 404 for a non-member (never 403 — existence stays hidden)", async () => {
    const { orgId } = await setupOrg();
    const outsider = await registerUser();
    const res = await api(`/organizations/${orgId}`, { token: outsider.token });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /organizations/:id", () => {
  it("updates fields", async () => {
    const { token, orgId } = await setupOrg();
    const res = await api(`/organizations/${orgId}`, {
      method: "PATCH",
      token,
      body: { name: "Renamed", description: "New description" },
    });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { name: string; description: string } };
    expect(data.name).toBe("Renamed");
    expect(data.description).toBe("New description");
  });
});

describe("members & roles", () => {
  it("promotes a Member to Admin", async () => {
    const org = await setupOrg();
    const member = await registerUser();
    const acceptRes = await acceptInvitation(org, member.email);
    expect(acceptRes.status).toBe(200);

    const members = await api(`/organizations/${org.orgId}/members`, { token: org.token });
    const { data } = (await members.json()) as {
      data: { id: string; role: { name: string }; user: { email: string } }[];
    };
    const target = data.find((m) => m.user.email === member.email)!;

    const res = await api(`/organizations/${org.orgId}/members/${target.id}`, {
      method: "PATCH",
      token: org.token,
      body: { roleName: "Admin" },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { role: { name: string } } };
    expect(body.data.role.name).toBe("Admin");
  });

  it("blocks demoting the last Owner with 400", async () => {
    const org = await setupOrg();
    const members = await api(`/organizations/${org.orgId}/members`, { token: org.token });
    const { data } = (await members.json()) as { data: { id: string; role: { name: string } }[] };
    const owner = data.find((m) => m.role.name === "Owner")!;

    const res = await api(`/organizations/${org.orgId}/members/${owner.id}`, {
      method: "PATCH",
      token: org.token,
      body: { roleName: "Member" },
    });
    expect(res.status).toBe(400);
  });

  it("blocks removing the last Owner with 400", async () => {
    const org = await setupOrg();
    const members = await api(`/organizations/${org.orgId}/members`, { token: org.token });
    const { data } = (await members.json()) as { data: { id: string; role: { name: string } }[] };
    const owner = data.find((m) => m.role.name === "Owner")!;

    const res = await api(`/organizations/${org.orgId}/members/${owner.id}`, {
      method: "DELETE",
      token: org.token,
    });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown role name with 400", async () => {
    const org = await setupOrg();
    const member = await registerUser();
    await inviteAndAccept(org, member.email);
    const members = await api(`/organizations/${org.orgId}/members`, { token: org.token });
    const { data } = (await members.json()) as {
      data: { id: string; user: { email: string } }[];
    };
    const target = data.find((m) => m.user.email === member.email)!;

    const res = await api(`/organizations/${org.orgId}/members/${target.id}`, {
      method: "PATCH",
      token: org.token,
      body: { roleName: "Nonexistent" },
    });
    expect(res.status).toBe(400);
  });
});

describe("invitations", () => {
  it("creates, lists (paginated), and rejects duplicates", async () => {
    const org = await setupOrg();
    const email = `invitee-${unique()}@example.com`;

    const create = await api(`/organizations/${org.orgId}/invitations`, {
      method: "POST",
      token: org.token,
      body: { email, roleName: "Member" },
    });
    expect(create.status).toBe(201);
    const { data } = (await create.json()) as { data: { id: string; status: string } };
    expect(data.status).toBe("pending");

    const duplicate = await api(`/organizations/${org.orgId}/invitations`, {
      method: "POST",
      token: org.token,
      body: { email, roleName: "Member" },
    });
    expect(duplicate.status).toBe(400);

    const list = await api(`/organizations/${org.orgId}/invitations`, { token: org.token });
    expect(list.status).toBe(200);
    const paginated = (await list.json()) as {
      items: { id: string; email: string; status: string }[];
      hasMore: boolean;
    };
    expect(paginated.items.some((i) => i.id === data.id && i.email === email)).toBe(true);
    expect(typeof paginated.hasMore).toBe("boolean");
  });

  it("accepts an invitation once the invitee has registered", async () => {
    const org = await setupOrg();
    const invitee = await registerUser();
    await inviteAndAccept(org, invitee.email);

    // the invitee can now see the org
    const res = await api(`/organizations/${org.orgId}`, { token: invitee.token });
    expect(res.status).toBe(200);
  });

  it("rejects accepting before the invitee registers with 400", async () => {
    const org = await setupOrg();
    const email = `not-registered-${unique()}@example.com`;
    await inviteAndAccept(org, email, 400);
  });

  it("cancels a pending invitation", async () => {
    const org = await setupOrg();
    const email = `cancel-me-${unique()}@example.com`;
    const { invitationId } = await createInvitation(org, email);

    const res = await api(`/organizations/${org.orgId}/invitations/${invitationId}`, {
      method: "PATCH",
      token: org.token,
      body: { action: "cancel" },
    });
    expect(res.status).toBe(200);

    // cancelled invitations can't be accepted afterwards
    const accept = await api(`/organizations/${org.orgId}/invitations/${invitationId}`, {
      method: "PATCH",
      token: org.token,
      body: { action: "accept" },
    });
    expect(accept.status).toBe(400);
  });
});

describe("DELETE /organizations/:id", () => {
  it("soft-deletes: the org disappears from the list and 404s", async () => {
    const { token, orgId } = await setupOrg();

    const del = await api(`/organizations/${orgId}`, { method: "DELETE", token });
    expect(del.status).toBe(204);

    expect((await api(`/organizations/${orgId}`, { token })).status).toBe(404);
    const list = await api("/organizations", { token });
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((o) => o.id === orgId)).toBe(false);
  });
});

/* ---------------- helpers ---------------- */

async function createInvitation(org: { token: string; orgId: string }, email: string) {
  const res = await api(`/organizations/${org.orgId}/invitations`, {
    method: "POST",
    token: org.token,
    body: { email, roleName: "Member" },
  });
  const { data } = (await res.json()) as { data: { id: string } };
  return { invitationId: data.id, status: res.status };
}

async function acceptInvitation(org: { token: string; orgId: string }, email: string) {
  const { invitationId } = await createInvitation(org, email);
  return api(`/organizations/${org.orgId}/invitations/${invitationId}`, {
    method: "PATCH",
    token: org.token,
    body: { action: "accept" },
  });
}

/** Invite + accept; `expectedStatus` lets tests assert the must-register rule. */
async function inviteAndAccept(
  org: { token: string; orgId: string },
  email: string,
  expectedStatus = 200,
) {
  const res = await acceptInvitation(org, email);
  expect(res.status).toBe(expectedStatus);
  return res;
}
