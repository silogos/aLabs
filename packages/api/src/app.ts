/**
 * Hono app — mounts every module and wires the request lifecycle
 * (auth → tenant → permission → validate → handler → response/error).
 *
 * The app is host-agnostic: it runs standalone (src/serve.ts) or mounted
 * in-process by the Next.js server under /api. Same-origin only — no CORS.
 */
import { Hono } from "hono";
import { logger } from "hono/logger";
import { readFile } from "node:fs/promises";
import { basename, join, normalize } from "node:path";
import { ApiError } from "./lib/errors";
import { resolveUser } from "./lib/auth";
import { UPLOADS_DIR, uploadMime } from "./lib/uploads";
import { ready } from "./db/boot";
import type { Vars } from "./lib/ctx";

import { auth } from "./modules/auth/routes";
import { organization } from "./modules/organization/routes";
import { project, projectMembers } from "./modules/project/routes";
import { task } from "./modules/task/routes";
import { documents } from "./modules/documents/routes";
import { planning } from "./modules/planning/routes";
import { meeting } from "./modules/meeting/routes";
import { agreement } from "./modules/agreement/routes";
import { reporting } from "./modules/reporting/routes";
import { notification } from "./modules/notification/routes";
import { users } from "./modules/user/routes";

export const app = new Hono<{ Variables: Vars }>();

app.use("*", logger());

// boot gate: migrations + auth seed (Postgres) + demo seed before any request
app.use("*", async (_c, next) => {
  await ready;
  await next();
});

// global user resolution (best-effort; routes that need auth enforce it)
app.use("*", async (c, next) => {
  const user = await resolveUser(c.req.raw, false);
  if (user) c.set("user", user);
  await next();
});

// Serve uploaded files (images written by the documents/files upload route)
// from local disk. Web-standard Response so it works in any host runtime.
app.get("/uploads/*", async (c) => {
  // normalize + basename keep the path inside UPLOADS_DIR (no traversal)
  const file = join(UPLOADS_DIR, basename(normalize(c.req.path)));
  try {
    const buf = await readFile(file);
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": uploadMime(file),
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return c.json({ error: { code: "not_found", message: "File not found" } }, 404);
  }
});

app.get("/", (c) =>
  c.json({
    name: "aLabs API",
    product: "Atlas Platform 2.0",
    version: "0.1.0",
    ok: true,
    endpoints: [
      "/auth",
      "/users",
      "/organizations",
      "/organizations/:organizationId/projects",
      "/projects/:projectId/tasks",
      "/projects/:projectId/documents/*",
      "/projects/:projectId/planning/*",
      "/projects/:projectId/reporting/*",
      "/notifications",
    ],
  }),
);

app.route("/auth", auth);
app.route("/users", users);
app.route("/organizations", organization);
app.route("/organizations/:organizationId/projects", project);
app.route("/projects/:projectId", projectMembers);
app.route("/projects/:projectId", task);
app.route("/projects/:projectId", documents);
app.route("/projects/:projectId", planning);
app.route("/projects/:projectId", meeting);
app.route("/projects/:projectId", agreement);
app.route("/projects/:projectId", reporting);
app.route("/notifications", notification);

// Standard error envelope for any thrown ApiError; everything else → 500.
app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(err.toJSON(), err.httpStatus as 400);
  }
  console.error(err);
  return c.json(
    { error: { code: "internal_error", message: err.message || "Unexpected error" } },
    500,
  );
});

app.notFound((c) =>
  c.json({ error: { code: "not_found", message: "Route not found" } }, 404),
);
