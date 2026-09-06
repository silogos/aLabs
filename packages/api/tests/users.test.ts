/** User module — profile writes + project recents (visit history). */
import { describe, expect, it } from "vitest";
import { api, createProject, registerUser, setupOrg, setupProject } from "./helpers";

describe("PATCH /users/me", () => {
  it("updates the profile name", async () => {
    const u = await registerUser();
    const res = await api("/users/me", { method: "PATCH", token: u.token, body: { name: "New Name" } });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: { name: string; email: string } };
    expect(data.name).toBe("New Name");
    expect(data.email).toBe(u.email);
  });

  it("rejects an invalid payload with 400", async () => {
    const u = await registerUser();
    const res = await api("/users/me", { method: "PATCH", token: u.token, body: { name: "" } });
    expect(res.status).toBe(400);
  });

  it("requires auth", async () => {
    expect((await api("/users/me", { method: "PATCH", body: { name: "X" } })).status).toBe(401);
  });
});

describe("GET /users/me/recents", () => {
  it("returns an empty list for a fresh user", async () => {
    const u = await registerUser();
    const res = await api("/users/me/recents", { token: u.token });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as { data: unknown[] };
    expect(data).toHaveLength(0);
  });

  it("lists touched projects with their org embedded", async () => {
    const p = await setupProject();
    const touch = await api("/users/me/recents", {
      method: "POST",
      token: p.token,
      body: { projectId: p.projectId },
    });
    expect(touch.status).toBe(200);

    const res = await api("/users/me/recents", { token: p.token });
    const { data } = (await res.json()) as {
      data: { project: { id: string }; organization: { id: string } }[];
    };
    expect(data.some((r) => r.project.id === p.projectId)).toBe(true);
    expect(data[0].organization.id).toBe(p.orgId);
  });
});

describe("POST /users/me/recents", () => {
  it("returns 404 for a project outside the caller's orgs", async () => {
    const p = await setupProject();
    const outsider = await registerUser();
    const res = await api("/users/me/recents", {
      method: "POST",
      token: outsider.token,
      body: { projectId: p.projectId },
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown project", async () => {
    const u = await registerUser();
    const res = await api("/users/me/recents", {
      method: "POST",
      token: u.token,
      body: { projectId: "0197d3b0-0000-7000-8000-000000000000" },
    });
    expect(res.status).toBe(404);
  });

  it("keeps orgs the user left invisible even if the project exists", async () => {
    // project exists, org exists, but caller is not a member → still 404
    const org = await setupOrg();
    const outsider = await registerUser();
    const project = await createProject(org.token, org.orgId);
    const res = await api("/users/me/recents", {
      method: "POST",
      token: outsider.token,
      body: { projectId: project.id },
    });
    expect(res.status).toBe(404);
  });
});
