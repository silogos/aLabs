# System Architecture

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Product
- Modules

---

# Overview

A modular monolith deployed as a single application — a Next.js server that renders the web UI and hosts the Hono API in-process under `/api` — over shared `core` and `api` packages, backed by PostgreSQL. Everything is Dockerized so the same build runs in SaaS and self-hosted Enterprise.

---

# Stack

| Layer       | Choice              |
| ----------- | ------------------- |
| Frontend    | Next.js (App Router), React 19, TypeScript |
| Backend     | Hono, mounted in-process by Next.js (`@pmin/api`) |
| Database    | PostgreSQL          |
| ORM         | Drizzle             |
| Auth        | Better Auth         |
| Validation  | zod (shared)        |
| Package Mgmt| pnpm workspaces     |
| Build       | Turborepo           |
| Deployment  | Docker              |

---

# Repository Layout

```text
pmin/
├── apps/
│   └── web/            Next.js app (UI + in-process API mount)
├── packages/
│   ├── api/            Hono REST API (host-agnostic library)
│   ├── core/           Shared domain: types, zod schemas, Drizzle schema, enums
│   └── editor/         Tiptap editor package
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

All internal packages use the `@pmin/*` namespace (`@pmin/core`).

Split a package out of `core` only when something needs independent consumption or a different build. Do not pre-split.

---

# Module Mapping

Each domain and module is a folder under `packages/api/src/modules/<module>`:

```text
modules/<module>/
├── routes.ts        Hono route definitions
├── service.ts       Business logic
├── repository.ts    Tenant-scoped data access
└── schema.ts        zod request/response schemas (re-exported from core)
```

| Module        | API folder                       | DB tables                                   |
| ------------- | -------------------------------- | ------------------------------------------- |
| Authentication| `modules/auth` (Better Auth)     | users, sessions, accounts, verifications    |
| Organization  | `modules/organization`           | organizations, organization_members, roles, role_permissions, invitations |
| Project       | `modules/project`                | projects, project_members                   |
| Task          | `modules/task`                   | tasks, task_statuses, task_labels, task_label_links, task_types |
| Documents     | `modules/documents`              | spaces, pages, page_revisions, files        |
| Planning      | `modules/planning`               | iterations, milestones                      |
| Meeting       | `modules/meeting`                | meetings, action_items, meeting_participants |
| Agreement     | `modules/agreement`              | agreements, agreement_attachments           |
| Reporting     | `modules/reporting`              | (read-only, no own tables)                  |
| Client Portal | `modules/client-portal`          | client_users, client_shares                 |
| Notification  | `modules/notification`           | notifications, notification_preferences     |
| Billing       | `modules/billing`                | plans, subscriptions, invoices              |
| AI            | `modules/ai`                     | (no persistent tables; returns drafts)      |

DB table definitions live in `packages/core/db`. The module owns its service and repository.

---

# Request Lifecycle

```text
1. Request arrives at Hono
2. requireAuth        → loads session, attaches ctx.user
3. tenantContext      → resolves :organizationId / :projectId,
                        verifies membership, attaches ctx.tenant
4. requirePermission  → RBAC check (effective = workspace ∪ project role)
5. validateBody       → zod parse
6. handler            → service → repository (tenant-scoped) → PostgreSQL
7. response           → serialized envelope
```

Any step can short-circuit with the standard error envelope (see Conventions).

---

# Multi-Tenancy Boundary

PostgreSQL is the trust boundary. Tenant isolation is enforced in application code:

- Every tenant-scoped repository query filters by `organization_id` or `project_id`.
- The active tenant is resolved once, in `tenantContext`, and trusted downstream.

Database-level Row-Level Security is **not** enabled in v1. It is a future defense-in-depth layer. Until then, never query a tenant-scoped table without the tenant filter.

---

# Frontend

- Next.js App Router with React 19; views render as client components (React Query for server state, client-only app shell).
- Real URLs per view (`/dashboard` … `/agreements`); auth screens at `/login`, `/register`, `/forgot-password`, `/reset-password`.
- The API is mounted in-process: `app/api/[[...route]]` strips the `/api` prefix and delegates to the Hono app — one origin, cookie sessions by construction.
- A tenant switcher sets the active organization/project.
- Route guards mirror API permission keys.

---

# Deployment

- `docker-compose` runs `web` (Next.js standalone — UI + API in one process) and, later, `postgres`.
- Self-hosted Enterprise uses the same compose stack.
- SaaS hosting provider to be selected.

---

# Environment

Required environment variables:

```text
DATABASE_URL
BETTER_AUTH_SECRET
```

To be selected:

```text
STORAGE_*     object storage (S3-compatible)
EMAIL_*       transactional email
PAYMENT_*     billing provider (e.g. Stripe)
AI_*          AI provider
```

Migrations run via Drizzle Kit.
