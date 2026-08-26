/** `@pmin/core/db` — flat re-export of the Drizzle schema (tables + the
 *  `schema` object). Kept flat on purpose: a nested namespace export would
 *  hand drizzle() a null-prototype object it cannot walk (crashes the
 *  standalone server under plain Node ESM). */
export * from "./schema";
