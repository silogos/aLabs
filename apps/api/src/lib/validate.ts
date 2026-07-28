/** zod validators — parse request bodies, query strings, and params. */
import type { ZodTypeAny } from "zod";
import { badRequest } from "./errors.js";

export function parseBody<T extends ZodTypeAny>(value: unknown, schema: T) {
  const res = schema.safeParse(value);
  if (!res.success) {
    throw badRequest(res.error.issues[0]?.message ?? "Invalid input", {
      issues: res.error.issues,
    });
  }
  return res.data;
}

/** Parse a query string into a typed object using a zod schema. */
export function parseQuery<T extends ZodTypeAny>(qs: Record<string, string | undefined>, schema: T) {
  const res = schema.safeParse(qs);
  if (!res.success) {
    throw badRequest(res.error.issues[0]?.message ?? "Invalid query", { issues: res.error.issues });
  }
  return res.data;
}
