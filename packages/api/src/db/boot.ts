/** Boot gate — one awaited promise between server start and first request:
 *  migrations → auth seed (Postgres) → demo seed (in-memory).
 *
 *  A Postgres advisory lock serializes boot across module instances (Next dev
 *  + Turbopack can instantiate this module more than once; migrations and the
 *  demo seed are idempotent, but concurrent CREATE TYPE would race). The app's
 *  first middleware awaits `ready`; the no-op catch keeps an early rejection
 *  from crashing the process before any request surfaces it. */
import { client, initDb } from "./pg";
import { seedAuth } from "./seed-auth";
import { seed } from "./seed";
import { store } from "./store";
import type { User } from "@pmin/core";

/** Arbitrary constant identifying this app's boot lock. */
const BOOT_LOCK_KEY = 91_827_364;

export const ready: Promise<User[]> = (async () => {
  const conn = await client.reserve();
  try {
    await conn`select pg_advisory_lock(${BOOT_LOCK_KEY})`;
    await initDb();
    const users = await seedAuth();
    if (!store.seeded) seed(users);
    return users;
  } finally {
    await conn`select pg_advisory_unlock(${BOOT_LOCK_KEY})`.catch(() => {});
    await conn.release();
  }
})();

ready.catch(() => {
  /* surfaced per-request by the middleware awaiting `ready` */
});
