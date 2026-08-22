/** Postgres client (Drizzle + postgres-js) — the auth domain's data layer
 *  (first phase of the in-memory → Drizzle migration; see docs/tech/adr).
 *
 *  DATABASE_URL is required: Postgres is the data layer now. `initDb()` runs
 *  pending migrations; the app's boot gate (db/boot.ts) awaits it plus the
 *  auth seed before serving requests. */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "@pmin/core/db";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is required — Postgres is the data layer. " +
      "Start it with `pnpm dev:db` and set DATABASE_URL (see .env.example / apps/web/.env).",
  );
}

export const client = postgres(url, { max: 10 });
// snake_case column inference for columns without an explicit name —
// matches docs/tech/03-data-model.md and drizzle.config.ts
export const db = drizzle(client, { schema, casing: "snake_case" });

/** Locate the generated migrations: MIGRATIONS_DIR wins (Docker sets it);
 *  otherwise walk up from cwd until a drizzle/meta/_journal.json appears —
 *  covers `next dev` (cwd apps/web) and the standalone server (repo root). */
function findMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) return resolve(process.env.MIGRATIONS_DIR);
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "drizzle");
    if (existsSync(join(candidate, "meta", "_journal.json"))) return candidate;
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "Drizzle migrations not found — run `pnpm db:generate` or set MIGRATIONS_DIR.",
  );
}

/** Apply pending migrations (idempotent — safe on every boot/HMR reload). */
export async function initDb(): Promise<void> {
  await migrate(db, { migrationsFolder: findMigrationsDir() });
}
