/**
 * Drizzle Kit config — for generating + running migrations against the schema
 * source of truth in `packages/core/src/db/schema.ts`.
 *
 *   pnpm dlx drizzle-kit generate
 *   pnpm dlx drizzle-kit migrate
 *
 * The API runs on an in-memory store by default; this config is used when
 * wiring a real Postgres via DATABASE_URL.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/core/src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://helix:helix@localhost:5432/helix",
  },
});
