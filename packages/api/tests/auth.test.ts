/** Auth module — register/login/logout/me + the forgot/reset password flow. */
import { describe, expect, it } from "vitest";
import { api, registerUser, PASSWORD, unique } from "./helpers";

describe("POST /auth/register", () => {
  it("creates a user, a session token, and the standard envelope", async () => {
    const res = await api("/auth/register", {
      method: "POST",
      body: { name: "Ada", email: `ada-${unique()}@example.com`, password: PASSWORD },
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      data: { user: { id: string; email: string }; token: string };
    };
    expect(body.data.user.id).toMatch(/^.+-{1}.+-{1}.+-{1}.+$/); // uuid-ish
    expect(body.data.token).toMatch(/^sess-/);
  });

  it("rejects a duplicate email with 400", async () => {
    const u = await registerUser();
    const res = await api("/auth/register", {
      method: "POST",
      body: { name: "Copy", email: u.email, password: PASSWORD },
    });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid payload with 400", async () => {
    const res = await api("/auth/register", {
      method: "POST",
      body: { name: "Ada", email: "not-an-email", password: "short" },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("validation_error");
  });
});

describe("POST /auth/login", () => {
  it("returns a session token for valid credentials", async () => {
    const u = await registerUser();
    const res = await api("/auth/login", {
      method: "POST",
      body: { email: u.email, password: PASSWORD },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { token: string; user: { email: string } } };
    expect(body.data.token).toMatch(/^sess-/);
    expect(body.data.user.email).toBe(u.email);
  });

  it("rejects a wrong password with 401", async () => {
    const u = await registerUser();
    const res = await api("/auth/login", {
      method: "POST",
      body: { email: u.email, password: "wrong-password" },
    });
    expect(res.status).toBe(401);
  });

  it("rejects an unknown email with 401", async () => {
    const res = await api("/auth/login", {
      method: "POST",
      body: { email: `ghost-${unique()}@example.com`, password: PASSWORD },
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /auth/me", () => {
  it("returns 401 without a token", async () => {
    expect((await api("/auth/me")).status).toBe(401);
  });

  it("returns 401 for an unknown token", async () => {
    const res = await api("/auth/me", { token: "sess-does-not-exist" });
    expect(res.status).toBe(401);
  });

  it("returns the session user with a Bearer token", async () => {
    const u = await registerUser();
    const res = await api("/auth/me", { token: u.token });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { email: string } };
    expect(body.data.email).toBe(u.email);
  });
});

describe("POST /auth/logout", () => {
  it("invalidates the session", async () => {
    const u = await registerUser();
    const res = await api("/auth/logout", { method: "POST", token: u.token });
    expect(res.status).toBe(200);
    expect((await api("/auth/me", { token: u.token })).status).toBe(401);
  });
});

describe("forgot / reset password", () => {
  it("rotates the password and revokes all sessions", async () => {
    const u = await registerUser();

    const forgot = await api("/auth/forgot-password", {
      method: "POST",
      body: { email: u.email },
    });
    expect(forgot.status).toBe(200);
    const { data } = (await forgot.json()) as { data: { ok: boolean; resetPath: string } };
    expect(data.ok).toBe(true);
    // non-production returns the reset link so the flow is testable end-to-end
    const token = new URLSearchParams(data.resetPath.split("?")[1]).get("token");
    expect(token).toBeTruthy();

    const newPassword = "br4nd-new-pass!";
    const reset = await api("/auth/reset-password", {
      method: "POST",
      body: { token, password: newPassword },
    });
    expect(reset.status).toBe(200);

    // every session (including the pre-reset one) was revoked
    expect((await api("/auth/me", { token: u.token })).status).toBe(401);

    const oldLogin = await api("/auth/login", {
      method: "POST",
      body: { email: u.email, password: PASSWORD },
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await api("/auth/login", {
      method: "POST",
      body: { email: u.email, password: newPassword },
    });
    expect(newLogin.status).toBe(200);

    // reset tokens are single-use
    const replay = await api("/auth/reset-password", {
      method: "POST",
      body: { token, password: "an0ther-pass!" },
    });
    expect(replay.status).toBe(400);
  });

  it("answers 200 for unknown emails without leaking existence", async () => {
    const res = await api("/auth/forgot-password", {
      method: "POST",
      body: { email: `ghost-${unique()}@example.com` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { ok: boolean } };
    expect(body.data.ok).toBe(true);
  });
});
