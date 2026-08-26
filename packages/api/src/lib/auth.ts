/** Session + auth resolution — a valid session (cookie or bearer) in
 *  Postgres or nothing. Async since the auth domain moved to Drizzle. */
import type { MiddlewareHandler } from "hono";
import * as authRepo from "../db/auth-repo";
import { unauthorized } from "./errors";
import type { Vars } from "./ctx";

/** The session cookie name — set by the auth routes, read here. */
export const SESSION_COOKIE = "alabs_session";

function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (m) return m[1]!;
  return null;
}

export { extractToken };

/** Resolve the current user. `require: false` returns null instead of throwing. */
export async function resolveUser(req: Request, require = true) {
  const token = extractToken(req);
  const user = token ? await authRepo.findSessionUser(token) : null;
  if (user) return user;
  if (require) throw unauthorized();
  return null;
}

export const requireAuth: MiddlewareHandler<{ Variables: Vars }> = async (c, next) => {
  const user = await resolveUser(c.req.raw, true);
  if (user) c.set("user", user);
  await next();
};
