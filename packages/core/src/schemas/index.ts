/**
 * Domain zod schemas — the single source of truth for request/response shapes.
 * The API validates bodies against these; the web app reuses them client-side.
 *
 * One file per domain; shared envelope/pagination helpers in ./common.
 * Field types follow `docs/tech/03-data-model.md`.
 */
export * from "./common";
export * from "./auth";
export * from "./organization";
export * from "./project";
export * from "./task";
export * from "./document";
export * from "./planning";
export * from "./meeting";
export * from "./agreement";
export * from "./notification";
export * from "./reporting";
