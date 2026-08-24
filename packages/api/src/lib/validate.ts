/** zod validators — parse request bodies, query strings, and params. */
import type { Context } from "hono";
import type { ZodTypeAny } from "zod";
import { badRequest } from "./errors";

export function parseBody<T extends ZodTypeAny>(value: unknown, schema: T) {
  const res = schema.safeParse(value);
  if (!res.success) {
    throw badRequest(res.error.issues[0]?.message ?? "Invalid input", {
      issues: res.error.issues,
    });
  }
  return res.data;
}

/** Parse a request's JSON body with a zod schema. */
export async function parseJsonBody<T extends ZodTypeAny>(c: Context, schema: T) {
  return parseBody(await c.req.json(), schema);
}

/** Parse a query string into a typed object using a zod schema. */
export function parseQuery<T extends ZodTypeAny>(qs: Record<string, string | undefined>, schema: T) {
  const res = schema.safeParse(qs);
  if (!res.success) {
    throw badRequest(res.error.issues[0]?.message ?? "Invalid query", { issues: res.error.issues });
  }
  return res.data;
}

/** Copy the keys that are present (≠ undefined) from `input` — the PATCH
 *  allowlist pattern shared by task and page updates. */
export function pickDefined<T extends object, K extends keyof T>(
  input: T,
  keys: readonly K[],
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) if (input[k] !== undefined) out[k] = input[k];
  return out;
}
