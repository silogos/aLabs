/**
 * @pmin/core — shared domain logic + types.
 *
 * Single source of truth for: enums, DB schema (Drizzle), zod schemas,
 * rich-text content model, permissions/roles/plans constants, and state machines.
 *
 * See `docs/tech/00-tech.md`.
 */

export const VERSION = "0.1.0";

export * from "./enums.js";
export * from "./uuid.js";
export * from "./content.js";
export * from "./schemas/index.js";
export * from "./schemas/common.js";
export * from "./constants/permissions.js";
export * from "./constants/roles.js";
export * from "./constants/plans.js";
export * from "./constants/state-machines.js";
