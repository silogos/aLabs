/**
 * Shared API contract helpers — the standard response shapes from
 * `docs/tech/04-api-contract.md`.
 *
 *   Single resource : { data }
 *   List (paginated): { items, nextCursor, hasMore }
 *   Error           : { error: { code, message, details } }
 */
import { z } from "zod";

/* ---- pagination ---- */

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuery>;

export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  });
}
export type Paginated<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };

export function paginate<T extends { id: string; createdAt: string }>(
  rows: T[],
  opts: { limit: number; cursor?: string },
): Paginated<T> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  let start = 0;
  if (opts.cursor) {
    const idx = rows.findIndex((r) => encodeCursor(r.createdAt, r.id) === opts.cursor);
    start = idx === -1 ? 0 : idx + 1;
  }
  const slice = rows.slice(start, start + limit);
  const hasMore = start + limit < rows.length;
  const last = slice[slice.length - 1];
  return {
    items: slice,
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
    hasMore,
  };
}

function encodeCursor(createdAt: string, id: string): string {
  return encodeURIComponent(JSON.stringify({ t: createdAt, i: id }));
}

/* ---- single resource ---- */

export function data<T extends z.ZodTypeAny>(item: T) {
  return z.object({ data: item });
}

/* ---- error envelope ---- */

export const errorCode = z.enum([
  "validation_error",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "unprocessable",
  "rate_limited",
  "internal_error",
  "service_unavailable",
]);
export type ErrorCode = z.infer<typeof errorCode>;

export const errorEnvelope = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;

export const ERROR_STATUS: Record<ErrorCode, number> = {
  validation_error: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unprocessable: 422,
  rate_limited: 429,
  internal_error: 500,
  service_unavailable: 503,
};

/** State-machine helper: returns true if `to` is in `transitions[from]`. */
export function canTransition<S extends string>(
  transitions: Record<S, readonly S[]>,
  from: S,
  to: S,
): boolean {
  return transitions[from]?.includes(to) ?? false;
}
