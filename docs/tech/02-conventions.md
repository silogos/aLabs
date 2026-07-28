# Engineering Conventions

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Architecture

---

# Purpose

The rules every module must follow. Read this before writing or generating any code.

These rules exist so the codebase stays consistent, multi-tenant safe, and predictable for AI-assisted development.

---

# Naming

| Thing          | Convention         | Example                    |
| -------------- | ------------------ | -------------------------- |
| DB tables      | snake_case, plural | `task_statuses`, `users`   |
| DB columns     | snake_case         | `created_at`, `project_id` |
| DB enums       | snake_case         | `task_priority`            |
| JS/TS values   | camelCase          | `projectId`                |
| TS types       | PascalCase         | `TaskStatus`               |
| Files (logic)  | kebab-case         | `task-status.ts`           |
| Files (React)  | PascalCase         | `TaskBoard.tsx`            |
| Routes         | kebab-case, plural | `/projects/:projectId/tasks` |
| Env vars       | UPPER_SNAKE        | `DATABASE_URL`             |
| Permission keys| `<module>:<action>`| `task:create`              |

---

# Identifiers

- Primary keys are **UUID v7** (time-sortable, index-friendly), app-generated.
- Column type: `uuid`. No auto-increment integers.
- Serialized to clients as strings.

---

# Timestamps

- All timestamps are `timestamptz`, stored in **UTC**.
- `created_at` — set once.
- `updated_at` — updated on every change.
- `deleted_at` — nullable, for soft delete.
- Never store naive timestamps.

---

# Multi-Tenancy

This is the most important rule. A missed scope is a data leak.

- Every org-scoped table has `organization_id` (`uuid`, FK, indexed, not null).
- Every project-scoped table has `project_id` (`uuid`, FK, indexed, not null).
- The active tenant is resolved once from the route in `tenantContext` and trusted downstream.
- Every repository query MUST filter by the active tenant. Never query a tenant-scoped table without the tenant filter.
- Enforce with a repository base that requires the tenant id, and review every new query.

---

# Soft Delete

- `deleted_at timestamptz null`. Deleted = `deleted_at is not null`.
- Apply to recoverable entities: Project, Task, Page, File, Space, Meeting, Agreement.
- Hard-delete for: notifications, expired invitations, sessions, and join tables.
- Queries exclude soft-deleted rows by default. A `withDeleted` flag opts in.

---

# Audit Columns

- `created_by` and `updated_by` (`uuid`, FK → `users`) on entities a user mutates.
- Set from `ctx.user.id`. Never trust client input for these.

---

# Validation

- **zod** schemas are the single source of truth, defined in `@pmin/core`.
- Validate every request body, query, and param.
- Use the schema's inferred type (`z.infer`) as the canonical type. Do not hand-write DTOs.
- The web app imports the same schemas for client-side validation.

---

# Pagination

- **Cursor-based**. Default page size **25**, max **100**.
- Cursor is opaque (encodes `created_at` + `id`).
- Response shape:

```json
{
  "items": [],
  "nextCursor": "opaque-string-or-null",
  "hasMore": false
}
```

---

# Error Envelope

Every error response uses one shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Title is required.",
    "details": { "field": "title" }
  }
}
```

Status codes and codes:

| Status | Code              | Meaning                                  |
| ------ | ----------------- | ---------------------------------------- |
| 400    | validation_error  | Malformed or invalid input               |
| 401    | unauthorized      | Not authenticated                        |
| 403    | forbidden         | Authenticated but lacks permission       |
| 404    | not_found         | Resource does not exist (or not in tenant) |
| 409    | conflict          | Duplicate or invalid state transition    |
| 422    | unprocessable     | Valid syntax, violates business rule     |
| 429    | rate_limited      | Too many requests                        |
| 500    | internal_error    | Unexpected server error                  |

A `404` is returned instead of `403` when a resource is outside the caller's tenant, to avoid leaking existence.

---

# Authentication and Authorization

- Better Auth manages sessions.
- `requireAuth` middleware rejects unauthenticated requests.
- `requirePermission(key)` checks the effective permission, which is the union of the user's workspace role and project role.
- A failed check returns `403 forbidden`.

---

# Serialization

- Dates serialize as ISO 8601 UTC strings.
- UUIDs serialize as strings.
- Never leak internal columns (`deleted_at`, provider ids) unless explicitly needed.

---

# Code Organization

- One folder per module under `apps/api/src/modules/<module>`.
- A module exposes a `service`. Other modules call the service, never the repository.
- No module reads another module's tables directly.
- Shared types, zod schemas, Drizzle schema, and enums live in `@pmin/core`.

---

# Concurrency

- Optimistic concurrency via `updated_at` on mutable entities where collisions matter (Task, Page). Clients send `updatedAt`; a mismatch returns `409 conflict`.

---

# Decisions Still Open

These defaults are proposals. Confirm before locking in:

- UUID v7 vs UUID v4.
- Soft delete vs hard delete as the default.
- Cursor pagination vs offset for small result sets.
- App-level tenancy vs Postgres Row-Level Security (RLS).
