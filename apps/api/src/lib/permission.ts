/** `requirePermission(key)` — RBAC check on the effective permission set. */
import type { MiddlewareHandler } from "hono";
import { forbidden } from "./errors.js";
import type { Vars } from "./ctx.js";

export function requirePermission(key: string): MiddlewareHandler<{ Variables: Vars }> {
  return async (c, next) => {
    const tenant = c.get("tenant");
    // Outside a tenant route (e.g. /auth, /notifications) → allow (auth-only).
    if (!tenant) return await next();
    if (!tenant.permissions.has(key)) throw forbidden();
    await next();
  };
}
