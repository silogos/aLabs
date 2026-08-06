# Plans & Workspaces Domain

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Authentication
- Organization

---

# Overview

Plans gate what a user can do across the platform. A user always owns at least
one workspace. Workspaces are Organizations.

There are two workspace kinds:

- **Personal** — a workspace with a single member (the owner). Free, created
  automatically on signup. No invites. Capped projects.
- **Team** — a workspace with multiple members. Created on demand. Invites
  allowed. Governed by the org's subscription plan.

A user may hold **one personal workspace and any number of team workspaces**
(Notion / Figma model). Personal is never deleted; team orgs are added
alongside it.

---

# The core invariant

**Every project still belongs to an organization.** There is no separate
"personal project that hangs off the user." A personal workspace is simply an
organization where the user is the sole Owner and `type = 'personal'`.

This keeps the entire routing, scoping, and permission spine intact:

- `/organizations/:organizationId/*` resolves and authorizes the same way.
- `/projects/:projectId/*` resolves and authorizes the same way.
- `orgContext` / `projectContext` return 404 (not 403) the same way.

Adding personal workspaces changes **one column** (`organizations.type`) and
two gates. It does not add a parallel data path.

---

# Organization `type`

| Value      | Members        | Invites | Projects        | How created                    |
| ---------- | -------------- | ------- | --------------- | ------------------------------ |
| `personal` | Owner only (1) | Blocked | Capped (2 active) | Auto-created at signup        |
| `team`     | Many           | Allowed | Per plan         | `POST /organizations` (+ plan) |

Default is `team`. The personal workspace is created internally by the
register flow, never through the public create endpoint.

---

# Free tier — personal workspace rules

### Project cap

- A personal workspace may hold **at most 2 active projects**.
- "Active" = not archived and not soft-deleted
  (`status != 'archived' AND deleted_at IS NULL`).
- Archiving a project **frees** the slot; deleting does too.
- The limit is the shared constant `PERSONAL_PROJECT_LIMIT` (see
  `packages/core/src/constants/plans.ts`), also surfaced as the `free` plan's
  `project_limit` so the two cannot drift.

### Members & invites

- `POST /organizations/:id/members` is rejected with `400` when
  `org.type === 'personal'`.
- The member list for a personal org is always exactly `[owner]`.
- Therefore **cross-user assignment is impossible** — not by a rule in the
  task module, but because there is no other member to assign to. Self
  assignment still works.

### What is NOT blocked

- Creating tasks, documents, meetings, agreements, milestones, iterations —
  all work normally in a personal workspace.
- Self-assignment (`assigneeId = owner.id`) is allowed and encouraged; it is
  organization, not collaboration.

---

# Upgrade & downgrade

### Upgrade

- The personal workspace **stays personal**. It is not converted.
- Subscribing unlocks the ability to **create team organizations**
  (`POST /organizations` creates `type: 'team'`), each governed by its own
  subscription/plan.

### Downgrade

- On lapse, team orgs become **read-only** (members keep read access, writes
  gated by plan status).
- **Data is never deleted on downgrade.** Existing members stay (as read-only
  / ghost entries), existing assignments stay, existing projects stay.
- The personal workspace is always fully functional, regardless of plan.

---

# Plan model (billing)

Plans are modeled at the **organization** level, not the user level (see
`docs/modules/09-billing.md`):

- `plans` — the catalog (`free`, `professional`, `enterprise`).
- `subscriptions` — an org's active plan and period.

The personal workspace **is** the manifestation of the free tier: every user
gets one, with `PERSONAL_PROJECT_LIMIT` active projects and no invites. There
is no `plan` column on `users`.

---

# User stories

As a new user

I get a personal workspace automatically on signup

So that I can start working without configuring a team.

As a personal-workspace owner

I can create up to 2 active projects

So that I can separate workstreams.

As a personal-workspace owner

I cannot invite members or assign tasks to others

Because collaboration is a team-org feature.

As a subscribed user

I can create team organizations alongside my personal workspace

So that I can collaborate with others without losing my personal space.

---

# Acceptance criteria

- Registering a user creates exactly one personal org with the user as Owner.
- `GET /organizations` returns the personal org (and any team orgs).
- A personal org rejects `POST /organizations/:id/members`.
- A personal org rejects project creation beyond `PERSONAL_PROJECT_LIMIT`
  active projects.
- Archiving a project frees the slot.
- Renaming / archiving never breaks routing (UUID spine unchanged).
- Downgrade never deletes data.
