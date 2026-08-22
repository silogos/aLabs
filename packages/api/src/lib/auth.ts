/** Session + auth resolution. Demo-friendly: auto-authenticates as the seed user. */
import type { MiddlewareHandler } from "hono";
import { store } from "../db/store";
import { unauthorized } from "./errors";
import type { Vars } from "./ctx";

function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)alabs_session=([^;]+)/);
  if (m) return m[1]!;
  return null;
}

export { extractToken };

/** Resolve the current user. `require: false` returns null instead of throwing. */
export function resolveUser(req: Request, require = true) {
  const token = extractToken(req);
  const now = Date.now();
  const session = token
    ? store.sessions.find((s) => s.token === token && Date.parse(s.expiresAt) > now)
    : null;
  if (session) {
    return store.users.find((u) => u.id === session.userId) ?? null;
  }
  // Demo fallback: auto-login as the first seeded user so the prototype just works.
  const demo = store.users[0];
  if (demo) return demo;
  if (require) throw unauthorized();
  return null;
}

export const requireAuth: MiddlewareHandler<{ Variables: Vars }> = async (c, next) => {
  const user = resolveUser(c.req.raw, true);
  if (user) c.set("user", user);
  await next();
};
