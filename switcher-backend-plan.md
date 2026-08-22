# Switcher/nav backend — make workspace & project switching real

> **Status:** BUILT ✅ — one pass (backend + frontend wiring, Q4 default), seed scale Q1=4 orgs/7 projects,
> recents cap Q2=5 server / 3 UI, non-Atlas content Q3=statuses + 4 tasks each. Acceptance checks §6 passing.
> **Scope:** API + core + seed + docs. (Frontend wiring spec'd as the consumer contract below; can be the same pass — Q4.)
> **One line:** the ported switchers currently run on static demo arrays and cosmetic label swaps — give them a real backend: a multi-org seed world, server-persisted project recents, and a derived org landing project.

---

## 1. Background — what exists today (grounded in the code)

The nav/switcher UI is already ported to the real app (uncommitted): `SwitcherModals.tsx`, `MobileNav.tsx`, `navData.tsx`, reworked `Sidebar.tsx`/`store.tsx`. But it's a **simulated switcher**:

- **Static demo data.** `apps/web/src/components/navData.tsx` exports hardcoded `PROJECTS` (4) and `ORGS` (4) with fake ids (`nw`, `atlas`, `personal`…). The real API has **one seeded org** (Northwind, `seed.ts:89`) with **one project** (Atlas, `seed.ts:127`) — plus Aisha's auto-personal org is *not* created in seed (personal orgs only get created in the signup route, `auth/routes.ts:28-48`).
- **Switching is cosmetic.** `store.tsx` keeps a parallel demo context (`projId`/`orgId`/in-memory `recentProjects`) and `switchProject()` only swaps `projLabel` — comments literally say *"MVP display overrides … underlying data queries stay anchored to the real org/project"* (`orgs?.[0]`, `projects?.[0]`). No query keys change; no data actually switches.
- **Recents are in-memory only** (`useState`, lost on reload) and reference fake project ids.
- **No "default project" concept server-side.** The demo `ORGS[].defaultProj` has no schema counterpart.
- **The API surface that does exist is correct and sufficient for listing:** `GET /organizations` returns the user's member orgs (incl. `type: "personal" | "team"`), `GET /organizations/:orgId/projects` returns per-org projects (with `key` + `icon` — the two fields the switcher rows render). What's missing is recents persistence, a landing-project rule, and a world worth switching between.

## 2. Decisions locked (from the nav plans + code)

1. **Project switcher = this-org projects only; org switcher = identity-level** — already built in the UI; the backend just feeds it real lists.
2. **Recents: top 3 in the UI** (switcher-nav-plan §5) — so the server persists an ordered visit history per user.
3. **Landing project for an org is derived, not stored:** most-recently-visited project in that org → else first project by `createdAt`. No schema column; the demo `defaultProj` semantics emerge from data.
4. **Cross-org recents must respect the 404-not-403 tenancy rule** (README): a project outside the user's orgs is invisible, not forbidden.

## 3. Technical design

### 3a. Seed a multi-org world — `apps/api/src/db/seed.ts`

Aisha becomes a member of 4 orgs / 7 projects, mirroring the demo arrays so the ported UI looks identical with real data:

| Org (type) | Projects (key) |
|---|---|
| Personal (personal) | Notes (NOT) |
| Northwind Software House (team) | Atlas Platform 2.0 (ATL) — existing, keep · Mobile App v1 (MOB) |
| Amin Studio (team) | Data Warehouse (DWH) · Brand Refresh (BRD) |
| Acme Internal (team) | Marketing Site (MKT) · Ops Automation (OPS) |

- Reuse the existing per-project seeding for Atlas only (statuses, tasks, docs, planning stay Atlas-anchored). **Other projects get minimal shape**: task statuses + a couple of tasks each, so switching doesn't land on an empty board.
- Memberships: Aisha `Owner`/`Member` in each org (reuse `makeMember`); other seeded humans stay Northwind-only.
- **Pre-seed 2 recents** for Aisha (Atlas, then Mobile) so the "Recent" group renders on first load.
- Create Aisha's personal org explicitly in seed (signup path doesn't run for seeded users).

### 3b. Recents — table, store, schemas, routes

**Drizzle** (`packages/core/src/db/schema.ts`):

```ts
export const projectVisits = pgTable("project_visits", {
  userId: uuid("user_id").notNull().references(() => users.id),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  visitedAt: ts().notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.projectId] }),
  index("project_visit_user_idx").on(t.userId, t.visitedAt),
]);
```

**In-memory store** (`apps/api/src/db/store.ts`): `projectVisits: { userId, projectId, visitedAt }[]`, reset by `seed()` like everything else.

**zod** (`packages/core/src/schemas`): `recentTouch = { projectId: uuid }`.

**Routes** — new tiny module `apps/api/src/modules/user/routes.ts`, mounted in `app.ts`:

```
GET  /users/me/recents?limit=3   → { data: [{ project, organization }] }  most-recent-first
POST /users/me/recents           body { projectId }  → touch (upsert visitedAt), 200 { data: { project } }
```

- `requireAuth` only (cross-org by nature — no tenant context middleware).
- POST verifies: project exists **and** its org has a membership row for the user → else **404**.
- Server caps history at **5** per user (prune oldest beyond 5); GET honors `limit` (default 3, max 5).
- GET embeds the org per project (the UI groups/labels rows with org context).

### 3c. Landing project rule (derived — no endpoint needed)

`landing(orgId) = argmax(visitedAt) of user's visits in org` → else first project in org by `createdAt`. Computed client-side from data it already has (orgs + projects + recents); documented here so both sides implement the same rule.

### 3d. Row colors — hash, not a column

The UI colors dots via `projColor(hue)`. Instead of adding a color column, derive hue **deterministically from the entity id** (e.g. `hash(id) % 360`) in `navData.tsx`. Stable across reloads, zero backend change.

### 3e. Docs

- `docs/tech/03-data-model.md` — add `project_visits` row to the table catalog.
- `docs/tech/04-api-contract.md` — new **User** section: the two routes above.

## 4. Consumer contract (the frontend swap this enables — spec, not scope creep)

For reference; build in the same pass if Q4 says so:

- `api.ts`: add `recents()` + `touchProject(pid)`.
- `store.tsx`: delete the demo context (`projId`/`orgId` strings, `recentProjects` state, `projLabel`/`orgLabel` overrides, `projTouched` sync effect). Active org/project become real ids: `orgs` query → selected `orgId`; `projects(orgId)` query → selected `projectId` (persisted to localStorage as the "last visited"); all data queries re-key off them.
- `switchProject(id)`: set active project id → invalidate/recall queries → `touchProject(id)` (fire-and-forget) → invalidate `["recents"]`.
- `switchOrg(id)`: resolve landing per §3c → `switchProject(landing)` (toast "no projects yet" if none).
- `navData.tsx`: delete `PROJECTS`/`ORGS` arrays + `projForOrg`; keep nav sections/icons; hue via id-hash (§3d).
- `SwitcherModals.tsx` / `MobileNav.tsx` / `Sidebar.tsx`: rows render from query data (`key`, `icon`, org `type`); no logic changes otherwise.

## 5. Files touched

| File | Action |
|---|---|
| `packages/core/src/db/schema.ts` | **Edit** — add `projectVisits` table |
| `packages/core/src/schemas/index.ts` | **Edit** — add `recentTouch` |
| `apps/api/src/db/store.ts` | **Edit** — `projectVisits` array + type |
| `apps/api/src/db/seed.ts` | **Edit** — multi-org world, minimal non-Atlas projects, personal org, pre-seeded recents |
| `apps/api/src/modules/user/routes.ts` | **New** — GET/POST `/users/me/recents` |
| `apps/api/src/app.ts` | **Edit** — mount `users` module, add to endpoint list |
| `docs/tech/03-data-model.md` · `docs/tech/04-api-contract.md` | **Edit** — table row + User routes |

## 6. Acceptance checks

- [ ] `GET /organizations` → 4 orgs for Aisha, incl. `type: "personal"`; non-member orgs absent.
- [ ] `GET /organizations/:orgId/projects` → correct per-org lists; keys/icons present.
- [ ] `POST /users/me/recents {projectId}` → 200; repeat POST moves it to front; `GET /users/me/recents` → most-recent-first, embedded org, capped at `limit`.
- [ ] POST with a projectId from a non-member org → **404** (tenancy rule).
- [ ] Non-Atlas projects render a usable (non-crashing) Tasks board — statuses exist.
- [ ] `pnpm typecheck` passes; docs updated.
- [ ] App still auto-logs in and the dashboard loads against the new seed.

## 7. Open questions (answer inline, or say "go with defaults")

1. **Seed scale:** 4 orgs / 7 projects (mirrors the demo arrays — *recommended*), or inflate to the 6-org/15-project scale-demo from the nav plan?
2. **Recents cap server-side:** 5 (*recommended*; UI shows 3) — or keep 3 end-to-end?
3. **Non-Atlas project content:** statuses + ~4 tasks each (*recommended*) — or completely empty shells?
4. **Pass structure:** backend + frontend wiring in **one pass** (*recommended* — the swap in §4 is small), or backend-only, then port separately?

## 8. Next step

Answer Q1–Q4 (defaults are fine), then build in order: **schema/store (3b) → user routes → seed world (3a) → docs (3e) → frontend swap (§4)**.
