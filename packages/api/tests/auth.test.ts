/** Auth module — register/login/logout/me + the forgot/reset password flow. */
import { describe, expect, it } from "vitest";
import { api, registerUser, PASSWORD, unique } from "./helpers";
import { insertOAuthState, consumeOAuthState } from "../src/db/auth-repo";

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

describe("POST /auth/change-password", () => {
  it("rotates the password, keeps the current session, revokes others", async () => {
    const u = await registerUser();

    // a second device signs in before the change
    const other = await api("/auth/login", {
      method: "POST",
      body: { email: u.email, password: PASSWORD },
    });
    const otherToken = ((await other.json()) as { data: { token: string } }).data.token;

    const newPassword = "r0tated-pass!";
    const change = await api("/auth/change-password", {
      method: "POST",
      token: u.token,
      body: { currentPassword: PASSWORD, password: newPassword },
    });
    expect(change.status).toBe(200);

    // current device stays signed in, the other session is revoked
    expect((await api("/auth/me", { token: u.token })).status).toBe(200);
    expect((await api("/auth/me", { token: otherToken })).status).toBe(401);

    expect(
      (
        await api("/auth/login", {
          method: "POST",
          body: { email: u.email, password: PASSWORD },
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await api("/auth/login", {
          method: "POST",
          body: { email: u.email, password: newPassword },
        })
      ).status,
    ).toBe(200);
  });

  it("rejects a wrong current password with 400", async () => {
    const u = await registerUser();
    const res = await api("/auth/change-password", {
      method: "POST",
      token: u.token,
      body: { currentPassword: "wrong-password", password: "n3w-password!" },
    });
    expect(res.status).toBe(400);
    // the password is unchanged
    expect(
      (
        await api("/auth/login", {
          method: "POST",
          body: { email: u.email, password: PASSWORD },
        })
      ).status,
    ).toBe(200);
  });

  it("rejects a short new password with 400", async () => {
    const u = await registerUser();
    const res = await api("/auth/change-password", {
      method: "POST",
      token: u.token,
      body: { currentPassword: PASSWORD, password: "short" },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("validation_error");
  });

  it("requires a session", async () => {
    const res = await api("/auth/change-password", {
      method: "POST",
      body: { currentPassword: PASSWORD, password: "n3w-password!" },
    });
    expect(res.status).toBe(401);
  });
});

describe("google oauth state", () => {
  it("persists a single-use state when the flow starts", async () => {
    const prevId = process.env.GOOGLE_CLIENT_ID;
    const prevSecret = process.env.GOOGLE_CLIENT_SECRET;
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-secret";
    try {
      const start = await api("/auth/oauth/google");
      expect(start.status).toBe(302);
      const location = start.headers.get("location")!;
      expect(location).toContain("accounts.google.com");
      const state = new URL(location).searchParams.get("state");
      expect(state).toBeTruthy();

      // single-use: the first consume validates, a replay is rejected
      expect(await consumeOAuthState(state!)).toBe(true);
      expect(await consumeOAuthState(state!)).toBe(false);
    } finally {
      process.env.GOOGLE_CLIENT_ID = prevId;
      process.env.GOOGLE_CLIENT_SECRET = prevSecret;
    }
  });

  it("rejects the callback for an unknown state", async () => {
    const res = await api("/auth/oauth/google/callback?code=x&state=no-such-state");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("authError=invalid_state");
  });

  it("rejects an expired state", async () => {
    const state = `st-${unique()}`;
    await insertOAuthState({ state, expiresAt: new Date(Date.now() - 1000) });
    expect(await consumeOAuthState(state)).toBe(false);
  });
});
