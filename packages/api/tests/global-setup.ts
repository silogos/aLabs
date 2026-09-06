/**
 * Global setup — make sure the test database exists before any test imports
 * the app (pg.ts throws at import time without a reachable DATABASE_URL).
 *
 * Uses the dockerized instance's default database as the admin connection;
 * override with TEST_DATABASE_ADMIN_URL / TEST_DATABASE_URL if needed.
 * Requires the Postgres container: `pnpm dev:db`.
 */
import postgres from "postgres";

const ADMIN_URL =
  process.env.TEST_DATABASE_ADMIN_URL ?? "postgres://alabs:alabs@localhost:5432/alabs";
const TEST_DB =
  process.env.TEST_DATABASE_URL?.split("/").pop() ?? "alabs_test";

export default async function () {
  const sql = postgres(ADMIN_URL, { max: 1, onnotice: () => {} });
  try {
    const exists = await sql`select 1 from pg_database where datname = ${TEST_DB}`;
    if (exists.length === 0) {
      // identifiers can't be parameterized — the name is our own constant
      await sql.unsafe(`create database ${TEST_DB}`);
    }
  } catch (err) {
    throw new Error(
      `Could not prepare the test database "${TEST_DB}". ` +
        `Is the Postgres container running? Start it with \`pnpm dev:db\`.\n` +
        `Underlying error: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}
