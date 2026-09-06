/** Notification module — user-scoped list, read-marking, preferences. */
import { describe, expect, it } from "vitest";
import { api, registerUser } from "./helpers";

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
