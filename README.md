# aLabs

A documentation-first project management platform — **Atlas Platform 2.0**.

Unifies delivery (tasks, planning), knowledge (documents), and client
communication in one place. Built on the design in [`designs/app/alabs-app.html`](./designs/app/alabs-app.html)
and the specs in [`docs/`](./docs).

> Status: prototype — the four primary views (Dashboard, Tasks, Documents,
> Planning) are fully wired to a working API. The full module catalog
> (Meetings, Agreements, Reporting, Client Portal, Notifications, Billing, AI)
> is scaffolded in the API per `docs/tech/04-api-contract.md`.

---

## Quick start

```bash
pnpm install
pnpm dev:db            # Postgres in Docker (required — the auth domain persists there)
pnpm dev               # Next.js on http://localhost:3000 (UI + API in one process)
```

`pnpm dev` reads `DATABASE_URL` from `apps/web/.env` — on first boot it copies
`.env.example` guidance: create the file with
`DATABASE_URL=postgres://alabs:alabs@localhost:5432/alabs` (matches the compose
service). Migrations run and the demo users seed automatically.

Then open **http://localhost:3000** and sign in with the seeded demo user:

- **aisha@northwind.io / password123** — member of four workspaces, landing on
  Northwind → Atlas Platform 2.0, so both switchers have real data. (All six
  seeded users share the password.)

- Type-check everything: `pnpm typecheck`
- Production build: `pnpm build`
- Docker: `docker compose up --build` (single service on port 3000)
- Dev database: `pnpm dev:db` (Postgres in Docker — unused by the app until the Drizzle repository lands)
- API standalone (rare, for debugging): `pnpm dev:api` — Hono on port 8788

## What's implemented

| Area | Status |
| ---- | ------ |
| Dashboard — KPIs, sprint health + burndown, my tasks, milestones, activity, workload | ✅ live (real data) |
| Tasks — Kanban board with drag-and-drop + list table | ✅ live |
| Documents — space/page tree, block-based page renderer, files | ✅ live |
| Planning — iterations, milestones, backlog, velocity, timeline (Gantt) | ✅ live |
| Task drawer — meta, subtasks, comments, status change | ✅ live |
| Command palette (⌘K), create-task modal, toasts | ✅ live |
| Workspace & project switchers, mobile nav — multi-org demo seed, server-persisted recents, derived landing project | ✅ live |
| Auth — sign-in, create account, forgot/reset password, Google SSO, sign-out; session-gated routes | ✅ live (UI + API) |
| Organization (members, invitations, soft delete), Project (members), User (profile, recents), Meeting, Agreement, Reporting, Notification | ✅ API routes |
| Billing, Client Portal, AI | scaffolded in API |

## Architecture

A modular monolith deployed as a single Next.js app: the UI renders on the App
Router and the Hono API is mounted in-process under `/api` (one origin, one
port, cookie sessions by construction). Backed by PostgreSQL (via a shared
`core` package). Everything is Docker-able so the same build runs SaaS and
self-hosted.

```
apps/
  web/    Next.js (App Router) — UI routes, client-only app shell, /api + /uploads mounts
packages/
  api/    Hono REST API as a host-agnostic library (request lifecycle: auth → tenant → permission → validate → handler)
  core/   Shared source of truth: enums, Drizzle schema, zod schemas, blocks, constants
  editor/ Tiptap editor package
```

All internal packages use the `@pmin/*` namespace.

- **Source of truth for the DB** — `packages/core/src/db/schema.ts` (Drizzle,
  mirrors `docs/tech/03-data-model.md` table-for-table).
- **Source of truth for validation** — `packages/core/src/schemas` (zod,
  consumed by both the API and the web app).
- **Data layer — Postgres via Drizzle, fully migrated.** Every domain
  persists to Postgres (auth, workspace, projects, tasks + planning,
  documents, meetings, agreements, notifications, activity) through the
  per-domain repositories in `packages/api/src/db/` — auto-migrated and
  demo-seeded on boot. `pnpm db:generate` / `pnpm db:migrate` manage
  migrations; `pnpm db:studio` opens Drizzle Studio.

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
| Frontend | Next.js (App Router), React 19, TypeScript, React Query |
| Backend | Hono (mounted in-process by Next.js) |
| Database | PostgreSQL |
| ORM | Drizzle |
| Auth | Session cookies (credential login, Google SSO, password reset; Better Auth-shaped for the swap) |
| Validation | zod (shared) |
| Build | pnpm workspaces + Turborepo |
| Deploy | Docker / docker-compose |

## License

Proprietary. © aLabs.
