# Helix

A documentation-first project management platform — **Atlas Platform 2.0**.

Unifies delivery (tasks, planning), knowledge (documents), and client
communication in one place. Built on the design in [`helix-app.html`](./helix-app.html)
and the specs in [`docs/`](./docs).

> Status: prototype — the four primary views (Dashboard, Tasks, Documents,
> Planning) are fully wired to a working API. The full module catalog
> (Meetings, Agreements, Reporting, Client Portal, Notifications, Billing, AI)
> is scaffolded in the API per `docs/tech/04-api-contract.md`.

---

## Quick start

```bash
pnpm install
pnpm dev               # runs the API (8788) and web (5173) together
```

Then open **http://localhost:5173**. The API auto-logs you in as the seeded demo
user (Aisha, Owner of Northwind → Atlas Platform 2.0), so the workspace is live
immediately.

- Run one app: `pnpm dev:api` / `pnpm dev:web`
- Type-check everything: `pnpm typecheck`
- Production build: `pnpm build`

The web dev server proxies `/api` → `http://localhost:8788` (configurable via
`VITE_API_URL`).

## What's implemented

| Area | Status |
| ---- | ------ |
| Dashboard — KPIs, sprint health + burndown, my tasks, milestones, activity, workload | ✅ live (real data) |
| Tasks — Kanban board with drag-and-drop + list table | ✅ live |
| Documents — space/page tree, block-based page renderer, files | ✅ live |
| Planning — iterations, milestones, backlog, velocity, timeline (Gantt) | ✅ live |
| Task drawer — meta, subtasks, comments, status change | ✅ live |
| Command palette (⌘K), create-task modal, toasts | ✅ live |
| Auth, Organization, Project, Meeting, Agreement, Reporting, Notification | ✅ API routes |
| Billing, Client Portal, AI | scaffolded in API |

## Architecture

A modular monolith deployed as two apps over a shared `core` package, backed by
PostgreSQL. Everything is Docker-able so the same build runs SaaS and
self-hosted.

```
apps/
  api/    Hono REST API (request lifecycle: auth → tenant → permission → validate → handler)
  web/    React 19 + Vite dashboard (React Query, the design's CSS verbatim)
packages/
  core/   Shared source of truth: enums, Drizzle schema, zod schemas, blocks, constants
```

All internal packages use the `@pmin/*` namespace.

- **Source of truth for the DB** — `packages/core/src/db/schema.ts` (Drizzle,
  mirrors `docs/tech/03-data-model.md` table-for-table).
- **Source of truth for validation** — `packages/core/src/schemas` (zod,
  consumed by both the API and the web app).
- **Runtime store** — the API runs against an in-memory repository seeded with
  the Helix demo data (no Postgres required). A Drizzle repository can drop in
  behind the same service layer; set `DATABASE_URL` and run Drizzle Kit.

### Request lifecycle

```
1. requireAuth        → resolves session, attaches ctx.user
2. tenantContext      → resolves :organizationId / :projectId, verifies membership
3. requirePermission  → RBAC check (effective = workspace ∪ project role)
4. validateBody       → zod parse
5. handler            → service → repository (tenant-scoped)
6. response           → standard envelope
```

A resource outside the caller's tenant returns `404` (never `403`) to avoid
leaking existence. See `docs/tech/`.

## Documentation

- **Product** — [`docs/00-product.md`](docs/00-product.md)
- **Architecture** — [`docs/tech/01-architecture.md`](docs/tech/01-architecture.md)
- **Conventions** — [`docs/tech/02-conventions.md`](docs/tech/02-conventions.md)
- **Data model** — [`docs/tech/03-data-model.md`](docs/tech/03-data-model.md)
- **API contract** — [`docs/tech/04-api-contract.md`](docs/tech/04-api-contract.md)

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Frontend | React 19, TypeScript, Vite, React Query |
| Backend | Hono |
| Database | PostgreSQL |
| ORM | Drizzle |
| Auth | Better Auth (session-based; demo auto-login) |
| Validation | zod (shared) |
| Build | pnpm workspaces + Turborepo |
| Deploy | Docker / docker-compose |

## License

Proprietary. © Helix.
