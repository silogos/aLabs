/** Response helpers — wrap payloads in the standard envelopes. */
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Paginated } from "@pmin/core";

export const data = <T>(c: Context, body: T, status: ContentfulStatusCode = 200) =>
  c.json({ data: body }, status);

export const paginated = <T>(c: Context, p: Paginated<T>) => c.json(p, 200);

export const noContent = (c: Context) => c.body(null, 204);

export const created = <T>(c: Context, body: T) => data(c, body, 201);
