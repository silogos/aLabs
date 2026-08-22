/**
 * Auth routes — session-based, demo-friendly.
 *
 * Contract: docs/foundation/01-authentication.md. Sessions are opaque tokens
 * (cookie or Bearer) backed by the in-memory store; passwords are scrypt
 * hashes (lib/passwords.ts). Until the Postgres/Better Auth swap, OAuth state
 * and reset tokens also live in memory — fine for a single-node prototype.
 */
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { randomBytes } from "node:crypto";
import { store } from "../../db/store";
import {
  uuidv7,
  registerInput,
  loginInput,
  forgotPasswordInput,
  resetPasswordInput,
} from "@pmin/core";
import { badRequest, unauthorized, ApiError } from "../../lib/errors";
import { extractToken } from "../../lib/auth";
import { hashPassword, verifyPassword } from "../../lib/passwords";
import { data } from "../../lib/responses";
import { parseBody } from "../../lib/validate";
import type { Vars } from "../../lib/ctx";
import type { User } from "@pmin/core";

export const auth = new Hono<{ Variables: Vars }>();

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const SESSION_COOKIE = "alabs_session";

/* ---------------- helpers ---------------- */

function issueSession(c: Parameters<typeof setCookie>[0], userId: string) {
  const token = "sess-" + randomBytes(24).toString("base64url");
  store.sessions.push({
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    createdAt: new Date().toISOString(),
  });
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", path: "/" });
  return token;
}

/** Create a user + their personal workspace (org of one) — signup path shared
 * by register and Google SSO. See docs/foundation/04-plans-workspaces.md and
 * ADR 0007: personal orgs block invites and cap projects. */
function createUserWithWorkspace(input: {
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
}): User {
  const now = new Date().toISOString();
  const user: User = {
    id: uuidv7(),
    name: input.name,
    email: input.email,
    image: input.image,
    emailVerified: input.emailVerified,
    createdAt: now,
    updatedAt: now,
  };
  store.users.push(user);

  const ownerRole = store.roles.find((r) => r.name === "Owner" && r.scope === "workspace")!;
  const personalOrg = {
    id: uuidv7(),
    name: `${input.name}'s Workspace`,
    slug: `personal-${user.id.slice(-8)}`,
    type: "personal" as const,
    logo: null,
    description: null,
    timezone: "UTC",
    language: "en",
    website: null,
    createdAt: now,
    updatedAt: now,
  };
  store.organizations.push(personalOrg);
  store.members.push({
    id: uuidv7(),
    organizationId: personalOrg.id,
    userId: user.id,
    role: ownerRole,
    status: "active" as const,
    joinedAt: now,
    user,
    createdAt: now,
    updatedAt: now,
  });
  return user;
}

/* ---------------- email + password ---------------- */

auth.post("/register", async (c) => {
  const input = parseBody(await c.req.json(), registerInput);
  const existing = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existing) throw badRequest("Email already registered");

  const user = createUserWithWorkspace({
    name: input.name,
    email: input.email,
    image: null,
    emailVerified: false,
  });
  store.accounts.push({
    id: uuidv7(),
    userId: user.id,
    provider: "credential",
    providerAccountId: null,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  });

  const token = issueSession(c, user.id);
  return data(c, { user, token }, 201);
});

auth.post("/login", async (c) => {
  const input = parseBody(await c.req.json(), loginInput);
  const user = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  const account = user
    ? store.accounts.find((a) => a.userId === user.id && a.provider === "credential")
    : undefined;
  const ok = account?.passwordHash
    ? await verifyPassword(input.password, account.passwordHash)
    : false;
  if (!user || !ok) throw unauthorized("Invalid email or password");

  const token = issueSession(c, user.id);
  return data(c, { user, token });
});

auth.post("/logout", async (c) => {
  const token = extractToken(c.req.raw);
  if (token) store.sessions = store.sessions.filter((s) => s.token !== token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return data(c, { ok: true });
});

auth.get("/me", async (c) => {
  const user = c.get("user");
  if (!user) throw unauthorized();
  return data(c, user);
});

/* ---------------- forgot / reset password ---------------- */

auth.post("/forgot-password", async (c) => {
  const input = parseBody(await c.req.json(), forgotPasswordInput);
  const user = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());

  // Always 200 — never reveal whether the email exists.
  if (!user) return data(c, { ok: true });

  const token = randomBytes(24).toString("base64url");
  store.passwordResets.push({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
  });
  const resetUrl = `/reset-password?token=${token}`;

  // No email provider wired yet (EMAIL_* is unselected — see .env.example), so
  // log the link as the stand-in. Returned outside production so the flow is
  // testable end-to-end.
  console.log(`[auth] password reset for ${user.email}: ${resetUrl}`);
  return data(c, {
    ok: true,
    ...(process.env.NODE_ENV !== "production" ? { resetPath: resetUrl } : {}),
  });
});

auth.post("/reset-password", async (c) => {
  const input = parseBody(await c.req.json(), resetPasswordInput);
  const reset = store.passwordResets.find(
    (r) =>
      r.token === input.token &&
      !r.usedAt &&
      Date.parse(r.expiresAt) > Date.now(),
  );
  if (!reset) throw badRequest("Invalid or expired reset token");

  const account = store.accounts.find(
    (a) => a.userId === reset.userId && a.provider === "credential",
  );
  const passwordHash = await hashPassword(input.password);
  if (account) {
    account.passwordHash = passwordHash;
  } else {
    store.accounts.push({
      id: uuidv7(),
      userId: reset.userId,
      provider: "credential",
      providerAccountId: null,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  }

  // Single-use token + kill every active session (they may be compromised).
  reset.usedAt = new Date().toISOString();
  store.sessions = store.sessions.filter((s) => s.userId !== reset.userId);

  return data(c, { ok: true });
});

/* ---------------- Google SSO ---------------- */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

/** Pending OAuth states (CSRF protection) — state → expiresAt. */
const oauthStates = new Map<string, number>();

const googleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
};

const webUrl = () => process.env.WEB_URL ?? "http://localhost:3000";

/** The OAuth redirect URI registered with Google. The app serves the API
 *  under /api (Next.js in-process mount), so the callback lives there. */
const googleRedirectUri = () => `${webUrl()}/api/auth/oauth/google/callback`;

/** Kick off the flow: redirect to Google's consent screen. */
auth.get("/oauth/google", (c) => {
  const cfg = googleConfig();
  if (!cfg) {
    throw new ApiError(
      "service_unavailable",
      "Google SSO is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    );
  }

  const state = randomBytes(24).toString("base64url");
  oauthStates.set(state, Date.now() + OAUTH_STATE_TTL_MS);

  const redirectUri = googleRedirectUri();
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return c.redirect(url.toString());
});

/** Google redirects back here with ?code&state (or ?error). */
auth.get("/oauth/google/callback", async (c) => {
  const fail = (reason: string) => c.redirect(`${webUrl()}/login?authError=${encodeURIComponent(reason)}`);

  const code = c.req.query("code");
  const error = c.req.query("error");
  const state = c.req.query("state");
  if (error) return fail(error);
  if (!code || !state) return fail("missing_code_or_state");

  const stateExpiresAt = oauthStates.get(state);
  oauthStates.delete(state);
  if (!stateExpiresAt || stateExpiresAt < Date.now()) return fail("invalid_state");

  const cfg = googleConfig();
  if (!cfg) return fail("google_not_configured");

  // Exchange the code for an access token.
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: googleRedirectUri(),
    }),
  });
  if (!tokenRes.ok) return fail("token_exchange_failed");
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return fail("token_exchange_failed");

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) return fail("userinfo_failed");
  const profile = (await profileRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };
  if (!profile.email) return fail("email_missing");

  // Upsert by email; link the Google account to the user.
  let user = store.users.find((u) => u.email.toLowerCase() === profile.email!.toLowerCase());
  if (!user) {
    user = createUserWithWorkspace({
      name: profile.name ?? profile.email.split("@")[0]!,
      email: profile.email,
      image: profile.picture ?? null,
      emailVerified: profile.email_verified ?? true,
    });
  }
  const linked = store.accounts.find(
    (a) => a.userId === user!.id && a.provider === "google",
  );
  if (linked) {
    linked.providerAccountId = profile.sub;
  } else {
    store.accounts.push({
      id: uuidv7(),
      userId: user.id,
      provider: "google",
      providerAccountId: profile.sub,
      passwordHash: null,
      createdAt: new Date().toISOString(),
    });
  }

  issueSession(c, user.id);
  return c.redirect(webUrl());
});
