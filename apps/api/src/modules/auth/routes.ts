/** Auth routes — session-based, demo-friendly. */
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { store } from "../../db/store.js";
import { uuidv7, registerInput, loginInput } from "@pmin/core";
import { badRequest, unauthorized } from "../../lib/errors.js";
import { data } from "../../lib/responses.js";
import { parseBody } from "../../lib/validate.js";
import type { Vars } from "../../lib/ctx.js";

export const auth = new Hono<{ Variables: Vars }>();

auth.post("/register", async (c) => {
  const input = parseBody(await c.req.json(), registerInput);
  const existing = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existing) throw badRequest("Email already registered");
  const user = {
    id: uuidv7(),
    name: input.name,
    email: input.email,
    image: null,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.users.push(user);

  // Every user gets a personal workspace (an org of one) on signup — see
  // docs/foundation/04-plans-workspaces.md and ADR 0007. Personal orgs block
  // invites and cap projects; the routing/permission spine is unchanged.
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.organizations.push(personalOrg);
  store.members.push({
    id: uuidv7(),
    organizationId: personalOrg.id,
    userId: user.id,
    role: ownerRole,
    status: "active" as const,
    joinedAt: new Date().toISOString(),
    user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const token = "sess-" + uuidv7();
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  setCookie(c, "alabs_session", token, { httpOnly: true, sameSite: "Lax", path: "/" });
  return data(c, { user, token }, 201);
});

auth.post("/login", async (c) => {
  const input = parseBody(await c.req.json(), loginInput);
  const user = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (!user) throw unauthorized("Invalid credentials");
  const token = "sess-" + uuidv7();
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  setCookie(c, "alabs_session", token, { httpOnly: true, sameSite: "Lax", path: "/" });
  return data(c, { user, token });
});

auth.post("/logout", async (c) => {
  const auth = c.req.header("authorization");
  const token = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  if (token) store.sessions = store.sessions.filter((s) => s.token !== token);
  return data(c, { ok: true });
});

auth.get("/me", async (c) => {
  const user = c.get("user");
  if (!user) throw unauthorized();
  return data(c, user);
});
