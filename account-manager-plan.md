# Account manager — users, orgs, projects, members & invitations

> **Status:** BUILT ✅ — all acceptance checks passing (see §6).
> **Scope:** API + core + seed + docs. Backend only (no web changes).
> **One line:** close the gap between the contract/foundation docs and the API — user profile update, org-member role management + soft-delete, a real invitation flow for **both** org and project membership, and the entirely-missing project-members layer (real roles, real effective permissions, real visibility).

---

## 1. Background — what exists today (grounded in the code)

**The docs promise all of this already.** `docs/tech/04-api-contract.md` lists `PATCH Org/members/:id` and full `GET/POST/PATCH/DELETE Prj/members`; `docs/foundation/03-project.md` specifies add/assign/remove project members; `project_members` is a fully specified Drizzle table (`schema.ts:184`) documented in `03-data-model.md:155`; `invitations` likewise (`schema.ts:139`).

**What the API actually serves:**

- **Users** — `GET /auth/me` exists; no profile update anywhere.
- **Organizations** — CRUD minus `DELETE` (the `organization:delete` permission is unused).
- **Org members** — GET + email direct-add POST + unscoped DELETE. **No role-change PATCH.** "Invitations" are a read-only derivation of pending members — `POST/PATCH Org/invitations` don't exist.
- **Project members — entirely absent at runtime.** No store array, no type, no routes. Connected rot: `projectContext` hardcodes every org member as project "Member" (fake union); project-create looks up "Project Admin" and never uses it (dead code).
- **Visibility is a dead column** — `organization | private` never checked in `projectContext`.
- **Seed** — 6 Northwind members, zero project memberships.

## 2. Decisions locked (user, this session)

| # | Decision |
|---|---|
| D1 | **Invitations are THE membership flow** — for org (`POST/PATCH /organizations/:id/invitations`) and project (pending `projectMembers` rows). The email direct-add `POST Org/members` is **removed**. |
| D2 | **Accounts are self-serve:** users register (`POST /auth/register` → personal workspace, existing behavior). Accepting an org invitation requires the user to already exist → else `400 "must register first"`. |
| D3 | **`DELETE /organizations/:id` = soft delete** (`deletedAt`), guarded by `organization:delete` (Owner-only). All org lookups gain `!deletedAt`. |
| D4 | Reads stay at **`GET /auth/me`**; the new `users` module is write-only (`PATCH /users/me`). |
| D5 | **Project invite key = email**, resolved against *active org members* → not found → **404** (leak rule). |
| D6 | Project invitation = `projectMembers` row with `status: "pending"`; accept = PATCH `status: "active"` (enum supports it). Admin-driven (email delivery deferred). |
| D7 | From the prior draft: real membership layer + true permission union; visibility gate (private → must have active membership, else 404); last-Owner guard on demote/remove; role-scope checks (`400`); creator becomes Project Admin; personal orgs block member changes. |

## 3. Technical design

### 3a. Core schemas — `packages/core/src/schemas/index.ts`

```ts
export const userUpdate = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().nullable().optional(),
});

export const memberUpdate = z.object({ roleName: z.string().min(1) });

export const projectMemberSchema = z.object({
  id, projectId: id, userId: id, role: roleSchema, status: MemberStatus,
  joinedAt: iso.nullable(), user: userSchema, createdAt: iso, updatedAt: iso,
});
export type ProjectMember = z.infer<typeof projectMemberSchema>;

export const projectMemberAdd = z.object({
  email: z.string().email(),
  roleName: z.string().optional(),          // default "Member", scope must be "project"
});
export const projectMemberUpdate = z.object({
  roleName: z.string().min(1).optional(),   // role change (active members)
  status: z.literal("active").optional(),   // accept a pending invitation
});

export const invitationAction = z.object({ action: z.enum(["accept", "cancel"]) });
```

### 3b. Store — `apps/api/src/db/store.ts`

- `projectMembers: ProjectMember[]`
- `invitations: Invitation[]` (type already exists in core)
- `organizations: (Organization & Meta)[]` — soft-delete support

### 3c. `projectContext` rewrite — `apps/api/src/lib/tenant.ts`

```
1. resolve project (not deleted)                              → else 404
2. resolve ACTIVE org membership                              → else 404
3. resolve ACTIVE projectMemberships row
4. visibility "private" && no active membership               → 404
5. effective = ws perms ∪ (pm ? project-role perms : ∅)
   tenant = { organizationId, projectId, workspaceRole,
              projectRole: pm?.role.name, permissions }
```

`orgContext` gains `!deletedAt` on the org lookup + `status === "active"` on membership.

### 3d. Organization routes — `apps/api/src/modules/organization/routes.ts`

- **`DELETE /:organizationId`** — `requirePermission("organization:delete")`; sets `deletedAt`; members lose access on next request (orgContext 404s).
- **`PATCH /:organizationId/members/:memberId`** — `member:update`, body `memberUpdate`. Guards: row belongs to this org (404); personal org (400); role `scope: "workspace"` (400); demoting the last active Owner (400).
- **`DELETE /:organizationId/members/:memberId`** — harden: org-scoped (404), personal org (400), last-Owner (400).
- **`POST /:organizationId/invitations`** — `member:create`, body `invitationInput` (existing). Personal org → 400. Already-active member email → 400. Pending duplicate (same email, still pending) → 400. Creates `{status: "pending", expiresAt: +7d}`.
- **`GET /:organizationId/invitations`** — now reads `store.invitations` (drops the derive-from-pending-members hack), paginated.
- **`PATCH /:organizationId/invitations/:invitationId`** — `member:create`, body `invitationAction`:
  - `cancel` → status `"cancelled"`.
  - `accept` → invitation must be `pending` (else 400); user must exist by email (else 400, D2); not already a member (else 400); creates **active** member with the invitation's role; invitation → `"accepted"`.
- **Remove `POST /:organizationId/members`** (D1).
- Slug-uniqueness check and `GET /` list gain `!deletedAt`.

### 3e. Project-member routes — `apps/api/src/modules/project/routes.ts`

All under `projectContext`:

- **`GET /:projectId/members`** — all rows (any viewer; rows embed `status`).
- **`POST /:projectId/members`** — `project:manage-members`, body `projectMemberAdd`. Resolve email → **active org member** (else 404, D5); duplicate `(projectId, userId)` any-status → 400; role `scope: "project"` (400). Creates row `status: "pending"` — **the project invitation** (D6). 201.
- **`PATCH /:projectId/members/:memberId`** — `project:manage-members`, body `projectMemberUpdate`. Row must belong to this project (404). `roleName` → scope check (400). `status: "active"` → row must be `pending` (else 400); sets active + `joinedAt`.
- **`DELETE /:projectId/members/:memberId`** — removes the row (decline/leave/remove), org-scoped 404 first.
- **Fix dead code:** project `POST` pushes a `projectMembers` row — creator = **Project Admin**.

### 3f. User module — `apps/api/src/modules/user/routes.ts` (new)

- **`PATCH /users/me`** — `requireAuth`, body `userUpdate`, mutates session user. Mounted at `/users` in `app.ts` (+ endpoints list).

### 3g. Seed — `apps/api/src/db/seed.ts`

Atlas project memberships for all six Northwind members: **Aisha → Project Admin**, the other five → **Member** (active). No seeded invitations (flows exercised via API). Behavior-neutral for the demo.

### 3h. Docs

- `docs/tech/04-api-contract.md` — new **User** section (`PATCH /users/me`); Org section: drop `POST Org/members`, annotate invitations (accept requires registered user); Prj/members: annotate POST (invite by email → pending) and PATCH (role / accept).
- `README.md` — implemented-areas row mentions members + invitations.

## 4. Files touched

| File | Action |
|---|---|
| `packages/core/src/schemas/index.ts` | **Edit** — `userUpdate`, `memberUpdate`, `projectMemberSchema` + type, `projectMemberAdd/Update`, `invitationAction` |
| `apps/api/src/db/store.ts` | **Edit** — `projectMembers`, `invitations`, `organizations: (Organization & Meta)[]` |
| `apps/api/src/lib/tenant.ts` | **Edit** — `projectContext` rewrite; `orgContext` hardening |
| `apps/api/src/modules/organization/routes.ts` | **Edit** — member PATCH, hardened DELETE, org soft-DELETE, real invitations, remove direct-add |
| `apps/api/src/modules/project/routes.ts` | **Edit** — Prj/members CRUD (invite/accept), creator-as-Project-Admin |
| `apps/api/src/modules/user/routes.ts` | **New** — `PATCH /users/me` |
| `apps/api/src/app.ts` | **Edit** — mount `users` |
| `apps/api/src/db/seed.ts` | **Edit** — Atlas project memberships |
| `docs/tech/04-api-contract.md`, `README.md` | **Edit** |

## 5. Consumer contract (web — later, not this pass)

`api.ts`: `updateMe`, `projectMembers(pid)`, `inviteProjectMember(pid, {email, roleName})`, `acceptProjectInvitation(pid, memberId)`, `updateProjectMember`, `removeProjectMember`, `orgInvitations/create/cancel/accept`, `updateOrgMemberRole`. A Settings → Members surface is Design-mode work.

## 6. Acceptance checks

- [ ] `GET /projects/:id/members` → 6 seeded Atlas rows (Aisha = Project Admin).
- [ ] Org invite: `POST Org/invitations {email}` → 201 pending; duplicate pending → 400; personal org → 400; active member email → 400.
- [ ] Org accept: `PATCH Org/invitations/:id {action:"accept"}` → member appears active with invitation role; unregistered email → 400; re-accept → 400; cancel → `"cancelled"`.
- [ ] Project invite: `POST Prj/members {email}` → 201 `pending`; email not an active org member → **404**; workspace-scope role → 400; duplicate → 400.
- [ ] Project accept: `PATCH Prj/members/:id {status:"active"}` → active + `joinedAt`; accepting an active row → 400; role change via `{roleName:"Viewer"}` → 200.
- [ ] Member role: `PATCH Org/members/:id` promote → 200; demote last Owner → **400**; DELETE last Owner → **400**; cross-org memberId → **404**; personal org → 400.
- [ ] Org soft delete: `DELETE /organizations/:id` (Owner) → 204; `GET /organizations` omits it; org routes → 404. Non-Owner → 403.
- [ ] `PATCH /users/me {name}` → 200, reflected by `GET /auth/me`.
- [ ] **Visibility gate:** project `visibility: "private"` → org member without membership → 404 everywhere under the project; with active membership → 200; pending-only → 404.
- [ ] **Regression:** demo app unchanged — board/tasks/documents/planning load; assignee pickers (`api.members`) still return the 6 members.
- [ ] `pnpm typecheck` passes.

## 7. Next step

Build in order: **schemas (3a) → store (3b) → tenant (3c) → org routes (3d) → project routes (3e) → user module (3f) → seed (3g) → docs (3h) → verify**.
