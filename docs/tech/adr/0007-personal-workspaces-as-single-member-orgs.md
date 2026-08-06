# ADR 0007: Personal workspaces as single-member organizations

Date: 2025-01-01
Status: Accepted

---

# Co
The product needs a free tier: a user who has not subscribed should get a
personal workspace to try the product alone, while collaboration (invites,
multi-user assignment) is reserved for paid team organizations.

Two implementation shapes were considered:

1. A parallel "personal project" concept where a project hangs directly off
   the user, with no organization.
2. A personal workspace modeled as an organization with a single member.

The entire API is built on the invariant that every project belongs to an
organization and access is verified via organization membership
(`orgContext` / `projectContext`). Routing, foreign keys, and authorization
all assume an organization scope.

# Decision

Model the personal workspace as an **organization of one**, not as a separate
concept. Add a single column `organizations.type` (`'personal' | 'team'`,
default `'team'`). A personal workspace is an organization where the owner is
the sole member.

Concretely:

- `organizations.type` distinguishes personal from team workspaces.
- A personal org is auto-created at registration with the user as Owner.
- `POST /organizations/:id/members` is rejected when `org.type === 'personal'`.
- Project creation is capped at `PERSONAL_PROJECT_LIMIT` (2) active projects in
  a personal org.
- The free/paid signal lives on the **organization**, not on the user. The
  existing `plans` / `subscriptions` tables (org-scoped) remain the source of
  truth for paid plans; no `plan` column is added to `users`.

# Consequences

- **No parallel data path.** Every existing route, context, permission check,
  and foreign key continues to work unchanged. Personal and team workspaces
  flow through the exact same code.
- **Cross-user assignment is impossible in a personal org by construction**
  — the member list is `[owner]`, so no task-module rule is needed. This keeps
  the constraint structural instead of scattered across modules.
- **Conversion is trivial.** A personal org can be promoted to team (or kept
  forever alongside team orgs) without data migration.
- **One new column, two gates.** The surface area of the change is tiny and
  easy to audit.
- **Downgrade is safe.** Because personal workspaces are ordinary orgs, lapsing
  a subscription never has to touch them; team orgs simply become read-only.

# Alternatives

- **Personal projects hanging off the user (no org).** Rejected: it breaks the
  org-scoped invariant everywhere — `orgContext` would need a no-org branch,
  every feature module would need a "no org" path, and converting a personal
  project into a team one later would require a data migration. Strictly more
  code and more fragile for no benefit.
- **A `plan` column on `users`.** Rejected: the product already models plans at
  the organization level via `plans` / `subscriptions`. Putting a free/paid
  flag on the user would duplicate that and create two sources of truth. The
  personal-vs-team distinction is an org property, so it belongs on the org.
- **A single hardcoded "personal project" per user.** Rejected: a workspace
  that can hold only one project is not a real workspace, and it makes the
  org wrapper meaningless. A capped (2-project) personal org is strictly more
  flexible at the same cost.
