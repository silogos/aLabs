/**
 * @pmin/core — shared domain logic + types.
 *
 * Single source of truth for: enums, DB schema (Drizzle), zod schemas,
 * rich-text content model, permissions/roles/plans constants, and state machines.
 *
 * See `docs/tech/00-tech.md`.
 */

export const VERSION = "0.1.0";

export * from "./enums";
export * from "./uuid";
export * from "./content";
export * from "./schemas/index";
export * from "./schemas/common";
export * from "./constants/permissions";
export * from "./constants/roles";
export * from "./constants/plans";
export * from "./constants/state-machines";
