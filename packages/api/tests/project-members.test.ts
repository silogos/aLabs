/** Project members — inviting org members into a project (pending → active). */
import { describe, expect, it } from "vitest";
import { addOrgMember, api, createProject, registerUser, setupOrg, setupProject } from "./helpers";

/** Owner invites an org member into the project; returns the pending row. */
async function inviteProjectMember(p: { token: string; projectId: string }, email: string) {
  const res = await api(`/projects/${p.projectId}/members`, {
    method: "POST",
    token: p.token,
    body: { email },
  });
  return res;
}

describe("GET /projects/:projectId/members", () => {
  it("lists members for an org member", async () => {
    const p = await setupProject();
    const res = await api(`/projects/${p.projectId}/members`, { token: p.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { user: { email: string }; status: string }[];
    };
    expect(data.length).toBeGreaterThanOrEqual(1); // the creator's membership
  });

  it("returns 404 for a non-member of the org", async () => {
    const p = await setupProject();
    const outsider = await registerUser();
    expect((await api(`/projects/${p.projectId}/members`, { token: outsider.token })).status).toBe(
      404,
    );
  });
});

describe("POST /projects/:projectId/members", () => {
  it("invites an org member as pending", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);

    const res = await inviteProjectMember({ token: org.token, projectId: project.id }, member.email);
    expect(res.status).toBe(201);
    const { data } = (await res.json()) as {
      data: { user: { email: string }; status: string; role: { name: string } };
    };
    expect(data.user.email).toBe(member.email);
    expect(data.status).toBe("pending");
    expect(data.role.name).toBe("Member");
  });

  it("returns 404 when the email is not an org member (leak rule)", async () => {
    const p = await setupProject();
    const res = await inviteProjectMember(p, `stranger-${Date.now()}@example.com`);
    expect(res.status).toBe(404);
  });

  it("rejects a duplicate membership with 400", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);

    await inviteProjectMember({ token: org.token, projectId: project.id }, member.email);
    const second = await inviteProjectMember(
      { token: org.token, projectId: project.id },
      member.email,
    );
    expect(second.status).toBe(400);
  });

  it("rejects an unknown project role with 400", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);

    const res = await api(`/projects/${project.id}/members`, {
      method: "POST",
      token: org.token,
      body: { email: member.email, roleName: "Nonexistent" },
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /projects/:projectId/members/:memberId", () => {
  it("accepts a pending invitation and then refuses re-accepting", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);
    const ctx = { token: org.token, projectId: project.id };

    const invite = await inviteProjectMember(ctx, member.email);
    const { data: row } = (await invite.json()) as { data: { id: string } };

    const accept = await api(`/projects/${project.id}/members/${row.id}`, {
      method: "PATCH",
      token: org.token,
      body: { status: "active" },
    });
    expect(accept.status).toBe(200);
    const accepted = (await accept.json()) as { data: { status: string } };
    expect(accepted.data.status).toBe("active");

    const again = await api(`/projects/${project.id}/members/${row.id}`, {
      method: "PATCH",
      token: org.token,
      body: { status: "active" },
    });
    expect(again.status).toBe(400); // only pending invitations can be accepted
  });

  it("changes the member's project role", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);
    const ctx = { token: org.token, projectId: project.id };

    const invite = await inviteProjectMember(ctx, member.email);
    const { data: row } = (await invite.json()) as { data: { id: string } };
    await api(`/projects/${project.id}/members/${row.id}`, {
      method: "PATCH",
      token: org.token,
      body: { status: "active" },
    });

    const res = await api(`/projects/${project.id}/members/${row.id}`, {
      method: "PATCH",
      token: org.token,
      body: { roleName: "Viewer" },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { role: { name: string } } };
    expect(body.data.role.name).toBe("Viewer");
  });
});

describe("DELETE /projects/:projectId/members/:memberId", () => {
  it("removes the membership", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const project = await createProject(org.token, org.orgId);

    const invite = await inviteProjectMember(
      { token: org.token, projectId: project.id },
      member.email,
    );
    const { data: row } = (await invite.json()) as { data: { id: string } };

    const del = await api(`/projects/${project.id}/members/${row.id}`, {
      method: "DELETE",
      token: org.token,
    });
    expect(del.status).toBe(204);

    const list = await api(`/projects/${project.id}/members`, { token: org.token });
    const { data } = (await list.json()) as { data: { id: string }[] };
    expect(data.some((m) => m.id === row.id)).toBe(false);
  });
});
