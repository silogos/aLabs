/**
 * Hono app — mounts every module and wires the request lifecycle
 * (auth → tenant → permission → validate → handler → response/error).
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ApiError } from "./lib/errors.js";
import { resolveUser } from "./lib/auth.js";
import { seed } from "./db/seed.js";
import type { Vars } from "./lib/ctx.js";

import { auth } from "./modules/auth/routes.js";
import { organization } from "./modules/organization/routes.js";
import { project } from "./modules/project/routes.js";
import { task } from "./modules/task/routes.js";
import { documents } from "./modules/documents/routes.js";
import { planning } from "./modules/planning/routes.js";
import { meeting } from "./modules/meeting/routes.js";
import { agreement } from "./modules/agreement/routes.js";
import { reporting } from "./modules/reporting/routes.js";
import { notification } from "./modules/notification/routes.js";

seed();

export const app = new Hono<{ Variables: Vars }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  }),
);

// global user resolution (best-effort; routes that need auth enforce it)
app.use("*", async (c, next) => {
  const user = resolveUser(c.req.raw, false);
  if (user) c.set("user", user);
  await next();
});

app.get("/", (c) =>
  c.json({
    name: "aLabs API",
    product: "Atlas Platform 2.0",
    version: "0.1.0",
    ok: true,
    endpoints: [
      "/auth",
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
app.route("/organizations", organization);
app.route("/organizations/:organizationId/projects", project);
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
