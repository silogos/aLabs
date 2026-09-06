/** Project module — CRUD under an org, slug/key uniqueness, status machine. */
import { describe, expect, it } from "vitest";
import { addOrgMember, api, createProject, registerUser, setupOrg, unique } from "./helpers";

describe("POST /organizations/:orgId/projects", () => {
  it("creates a project with a per-org status config", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);
    expect(project.id).toBeTruthy();
    expect(project.slug).toMatch(/^project-/);

    // the per-project task config exists: statuses list is non-empty
    const statuses = await api(`/projects/${project.id}/tasks/statuses`, { token: org.token });
    expect(statuses.status).toBe(200);
    const { data } = (await statuses.json()) as { data: unknown[] };
    expect(data.length).toBeGreaterThan(0);
  });

  it("rejects a workspace Member without project:create with 403", async () => {
    const org = await setupOrg();
    const member = await addOrgMember(org);
    const res = await api(`/organizations/${org.orgId}/projects`, {
      method: "POST",
      token: member.token,
      body: {
        name: "Nope",
        slug: `nope-${unique()}`,
        key: `N${unique().toUpperCase().slice(0, 5)}`,
      },
    });
    expect(res.status).toBe(403);
  });

  it("rejects a duplicate slug in the same org with 400", async () => {
    const org = await setupOrg();
    const slug = `dup-${unique()}`;
    await createProject(org.token, org.orgId, { slug });
    const second = await api(`/organizations/${org.orgId}/projects`, {
      method: "POST",
      token: org.token,
      body: { name: "Dup slug", slug, key: "DSLUG" },
    });
    expect(second.status).toBe(400);
  });

  it("rejects a duplicate key in the same org with 400", async () => {
    const org = await setupOrg();
    const key = `K${unique().toUpperCase().slice(0, 6)}`;
    await createProject(org.token, org.orgId, { key });
    const second = await api(`/organizations/${org.orgId}/projects`, {
      method: "POST",
      token: org.token,
      body: { name: "Dup key", slug: `other-${unique()}`, key },
    });
    expect(second.status).toBe(400);
  });

  it("rejects a key that violates ^[A-Z0-9]+$ with 400", async () => {
    const org = await setupOrg();
    const res = await api(`/organizations/${org.orgId}/projects`, {
      method: "POST",
      token: org.token,
      body: { name: "Bad key", slug: `bad-${unique()}`, key: "lowercase" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects a non-member org with 404", async () => {
    const { orgId } = await setupOrg();
    const outsider = await registerUser();
    const res = await api(`/organizations/${orgId}/projects`, {
      method: "POST",
      token: outsider.token,
      body: { name: "Sneaky", slug: `sneaky-${unique()}`, key: "SNEAK" },
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /organizations/:orgId/projects", () => {
  it("lists the org's projects for a member", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);

    const list = await api(`/organizations/${org.orgId}/projects`, { token: org.token });
    expect(list.status).toBe(200);
    const { data } = (await list.json()) as { data: { slug: string }[] };
    expect(data.some((p) => p.slug === project.slug)).toBe(true);
  });
});

describe("GET /organizations/:orgId/projects/:projectId", () => {
  it("returns the project for a member", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);

    const get = await api(`/organizations/${org.orgId}/projects/${project.id}`, {
      token: org.token,
    });
    expect(get.status).toBe(200);
    const got = (await get.json()) as { data: { id: string; status: string } };
    expect(got.data.id).toBe(project.id);
    expect(got.data.status).toBe("active");
  });

  it("returns 404 for a non-member", async () => {
    const org = await setupOrg();
    const outsider = await registerUser();
    const project = await createProject(org.token, org.orgId);
    expect(
      (await api(`/organizations/${org.orgId}/projects/${project.id}`, { token: outsider.token }))
        .status,
    ).toBe(404);
  });
});

describe("PATCH /organizations/:orgId/projects/:projectId", () => {
  it("updates fields", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);

    const patch = await api(`/organizations/${org.orgId}/projects/${project.id}`, {
      method: "PATCH",
      token: org.token,
      body: { name: "Renamed", description: "Updated" },
    });
    expect(patch.status).toBe(200);
    const body = (await patch.json()) as { data: { name: string; description: string } };
    expect(body.data.name).toBe("Renamed");
    expect(body.data.description).toBe("Updated");
  });

  it("follows the status machine (active → on_hold → archived)", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);
    const patch = (status: string) =>
      api(`/organizations/${org.orgId}/projects/${project.id}`, {
        method: "PATCH",
        token: org.token,
        body: { status },
      });

    expect((await patch("on_hold")).status).toBe(200);
    expect((await patch("archived")).status).toBe(200);
    const hold = await patch("on_hold"); // archived → on_hold is not a legal edge
    expect(hold.status).toBe(409);
    const conflict = (await hold.json()) as { error: { code: string } };
    expect(conflict.error.code).toBe("conflict");
  });
});

describe("DELETE /organizations/:orgId/projects/:projectId", () => {
  it("soft-deletes the project", async () => {
    const org = await setupOrg();
    const project = await createProject(org.token, org.orgId);

    const del = await api(`/organizations/${org.orgId}/projects/${project.id}`, {
      method: "DELETE",
      token: org.token,
    });
    expect(del.status).toBe(204);
    expect(
      (await api(`/organizations/${org.orgId}/projects/${project.id}`, { token: org.token }))
        .status,
    ).toBe(404);
  });
});
