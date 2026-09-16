/**
 * Auth routes — session-based.
 *
 * Contract: docs/foundation/01-authentication.md. Users, sessions, accounts,
 * OAuth states, and password resets live in Postgres (db/auth-repo.ts);
 * passwords are scrypt hashes (lib/passwords.ts). OAuth state is persisted
 * so multi-instance deployments share the CSRF nonces.
 */
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { randomBytes } from "node:crypto";
import * as authRepo from "../../db/auth-repo";
import {
  registerInput,
  loginInput,
  forgotPasswordInput,
  resetPasswordInput,
  changePasswordInput,
} from "@pmin/core";
import { badRequest, unauthorized } from "../../lib/errors";
import { extractToken, SESSION_COOKIE } from "../../lib/auth";
import { webUrl } from "../../lib/urls";
import { logger } from "../../lib/logger";
import { hashPassword, verifyPassword } from "../../lib/passwords";
import { created, data } from "../../lib/responses";
import { parseJsonBody } from "../../lib/validate";
import type { Vars } from "../../lib/ctx";

export const auth = new Hono<{ Variables: Vars }>();

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

/* ---------------- helpers ---------------- */

async function issueSession(c: Parameters<typeof setCookie>[0], userId: string) {
  const token = "sess-" + randomBytes(24).toString("base64url");
  await authRepo.insertSession({
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, sameSite: "Lax", path: "/" });
  return token;
}

/* ---------------- email + password ---------------- */

auth.post("/register", async (c) => {
  const input = await parseJsonBody(c, registerInput);
  const existing = await authRepo.getUserByEmail(input.email);
  if (existing) throw badRequest("Email already registered");

  const user = await authRepo.createUserWithWorkspace({
    name: input.name,
    email: input.email,
    image: null,
    emailVerified: false,
    passwordHash: await hashPassword(input.password),
  });

  const token = await issueSession(c, user.id);
  return created(c, { user, token });
});

auth.post("/login", async (c) => {
  const input = await parseJsonBody(c, loginInput);
  const user = await authRepo.getUserByEmail(input.email);
  const account = user ? await authRepo.findAccount(user.id, "credential") : null;
  const ok = account?.passwordHash
    ? await verifyPassword(input.password, account.passwordHash)
    : false;
  if (!user || !ok) throw unauthorized("Invalid email or password");

  const token = await issueSession(c, user.id);
  return data(c, { user, token });
});

auth.post("/logout", async (c) => {
  const token = extractToken(c.req.raw);
  if (token) await authRepo.deleteSession(token);
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
  const input = await parseJsonBody(c, forgotPasswordInput);
  const user = await authRepo.getUserByEmail(input.email);

  // Always 200 — never reveal whether the email exists.
  if (!user) return data(c, { ok: true });

  const token = randomBytes(24).toString("base64url");
  await authRepo.insertPasswordReset({
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });
  const resetUrl = `/reset-password?token=${token}`;

  // No email provider wired yet (EMAIL_* is unselected — see .env.example), so
  // log the link as the stand-in. Returned outside production so the flow is
  // testable end-to-end.
  logger.info({ email: user.email, resetPath: resetUrl }, "password reset link (no email provider)");
  return data(c, {
    ok: true,
    ...(process.env.NODE_ENV !== "production" ? { resetPath: resetUrl } : {}),
  });
});

auth.post("/reset-password", async (c) => {
  const input = await parseJsonBody(c, resetPasswordInput);
  const reset = await authRepo.findValidPasswordReset(input.token);
  if (!reset) throw badRequest("Invalid or expired reset token");

  const account = await authRepo.findAccount(reset.userId, "credential");
  const passwordHash = await hashPassword(input.password);
  if (account) {
    await authRepo.updateAccountPassword(account.id, passwordHash);
  } else {
    await authRepo.insertAccount({ userId: reset.userId, provider: "credential", passwordHash });
  }

  // Single-use token + kill every active session (they may be compromised).
  await authRepo.markPasswordResetUsed(input.token);
  await authRepo.revokeUserSessions(reset.userId);

  return data(c, { ok: true });
});

/* ---------------- change password (signed in) ---------------- */

auth.post("/change-password", async (c) => {
  const user = c.get("user");
  if (!user) throw unauthorized();

  const input = await parseJsonBody(c, changePasswordInput);
  const account = await authRepo.findAccount(user.id, "credential");
  if (!account?.passwordHash) {
    throw badRequest("This account has no password set. Use forgot password to create one.");
  }
  if (!(await verifyPassword(input.currentPassword, account.passwordHash))) {
    throw badRequest("Current password is incorrect");
  }

  await authRepo.updateAccountPassword(account.id, await hashPassword(input.password));

  // Keep this device signed in; revoke every other session in case the
  // password was changed because it leaked.
  const token = extractToken(c.req.raw);
  if (token) await authRepo.revokeOtherUserSessions(user.id, token);

  return data(c, { ok: true });
});

/* ---------------- Google SSO ---------------- */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

const googleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
};

/** The OAuth redirect URI registered with Google. The app serves the API
 *  under /api (Next.js in-process mount), so the callback lives there. */
const googleRedirectUri = () => `${webUrl()}/api/auth/oauth/google/callback`;

/** Kick off the flow: redirect to Google's consent screen. */
auth.get("/oauth/google", async (c) => {
  const cfg = googleConfig();
  if (!cfg) {
    return c.redirect(`${webUrl()}/login?authError=google_not_configured`);
  }

  const state = randomBytes(24).toString("base64url");
  await authRepo.insertOAuthState({ state, expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS) });

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
  // Google redirects back with `error` when the user cancels the consent
  // screen (access_denied) or when the provider rejects the request. Map the
  // known value to a friendly reason and collapse anything else to a generic
  // one — never echo the raw provider string into the redirect URL.
  if (error) {
    const reason = error === "access_denied" ? "google_canceled" : "google_error";
    return fail(reason);
  }
  if (!code || !state) return fail("missing_code_or_state");

  const stateOk = await authRepo.consumeOAuthState(state);
  if (!stateOk) return fail("invalid_state");

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
  if (!tokenRes.ok) {
    logger.error({ status: tokenRes.status, statusText: tokenRes.statusText }, "google token exchange failed");
    return fail("token_exchange_failed");
  }
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) {
    logger.error("google token exchange returned no access_token");
    return fail("token_exchange_failed");
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) {
    logger.error({ status: profileRes.status, statusText: profileRes.statusText }, "google userinfo failed");
    return fail("userinfo_failed");
  }
  const profile = (await profileRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };
  if (!profile.email) return fail("email_missing");

  // Upsert by email; link the Google account to the user.
  let user = await authRepo.getUserByEmail(profile.email);
  if (!user) {
    user = await authRepo.createUserWithWorkspace({
      name: profile.name ?? profile.email.split("@")[0]!,
      email: profile.email,
      image: profile.picture ?? null,
      emailVerified: profile.email_verified ?? true,
    });
  }
  await authRepo.upsertProviderAccount({
    userId: user.id,
    provider: "google",
    providerAccountId: profile.sub,
  });

  await issueSession(c, user.id);
  return c.redirect(webUrl());
});
