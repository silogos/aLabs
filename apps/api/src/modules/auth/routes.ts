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
  const token = "sess-" + uuidv7();
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  setCookie(c, "helix_session", token, { httpOnly: true, sameSite: "Lax", path: "/" });
  return data(c, { user, token }, 201);
});

auth.post("/login", async (c) => {
  const input = parseBody(await c.req.json(), loginInput);
  const user = store.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (!user) throw unauthorized("Invalid credentials");
  const token = "sess-" + uuidv7();
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  setCookie(c, "helix_session", token, { httpOnly: true, sameSite: "Lax", path: "/" });
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
