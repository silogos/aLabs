/**
 * Drizzle Kit config — for generating + running migrations against the schema
 * source of truth in `packages/core/src/db/schema.ts` (enums in ../enums.ts).
 *
 *   pnpm db:generate
 *   pnpm db:migrate
 *
 * The app auto-migrates on boot (packages/api/src/db/pg.ts); these scripts
 * are the manual authoring path.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // enums listed explicitly — kit 0.31 misses cross-file pgEnums otherwise
  schema: ["./packages/core/src/db/schema.ts", "./packages/core/src/enums.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  // unnamed columns infer snake_case (created_at, …) per the data-model doc
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://alabs:alabs@localhost:5432/alabs",
  },
});
