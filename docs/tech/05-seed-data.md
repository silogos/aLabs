# Seed Data

Version: 1.0.0
Status: Draft
Depends On:
- Data Model

---

# Purpose

The constants every environment starts with, and where they live in code.

Seed data is idempotent. Running it twice must not duplicate rows.

---

# When Seeding Runs

Boot (`packages/api/src/db/boot.ts`) always runs migrations and seeds the
system roles — org creation, invitations and project membership resolve those
roles by name at runtime, so they must exist in every environment. The demo
dataset (Northwind users with password `password123`, demo orgs, projects and
content) seeds only when demo seeding is enabled:

| Environment                        | Demo seed |
| ---------------------------------- | --------- |
| `NODE_ENV` ≠ `production` (dev, test) | on (default) |
| `NODE_ENV=production`              | off       |

`SEED_DEMO=true/false` overrides the default in any environment (`packages/api/src/db/seed-mode.ts`):
e.g. `SEED_DEMO=false` boots a clean prod-like local database, `SEED_DEMO=true`
explicitly opts a production-mode build into demo data. Production boots with
a clean database — no demo users, no demo workspaces.

---

# Where Constants Live

| Kind                | Location                              |
| ------------------- | ------------------------------------- |
| Permissions         | `@pmin/core` enum + seed              |
| Default roles       | seed (`organizations` system roles)   |
| Plans               | seed (`plans` table)                  |
| Default task config | created per project on first access   |

---

# Permissions

The full set of permission keys. These seed the `permissions` table.

```text
# Organization
organization:view
organization:update
organization:delete

# Members
member:view
member:create
member:update
member:remove

# Project
project:create
project:view
project:update
project:archive
project:delete
project:manage-members

# Task
task:view
task:create
task:update
task:delete

# Documents
document:view
document:create
document:update
document:delete
file:upload

# Planning
planning:view
planning:manage

# Meeting
meeting:view
meeting:create
meeting:update
meeting:delete

# Agreement
agreement:view
agreement:create
agreement:update
agreement:delete

# Reporting
reporting:view
reporting:export

# Client Portal
portal:manage

# Billing
billing:manage

# AI
ai:use
```

---

# Default Workspace Roles

System roles (`is_system = true`, `organization_id = null`, `scope = workspace`).

| Role             | Granted permission groups                     |
| ---------------- | --------------------------------------------- |
| Owner            | All permissions                               |
| Admin            | All except `organization:delete`              |
| Project Manager  | project, task, document, planning, meeting, agreement, reporting, portal |
| Member           | project:view, task, document, planning:view, meeting:view, reporting:view |
| Viewer           | All `:view` and `:export` permissions         |

---

# Default Project Roles

System roles (`is_system = true`, `scope = project`).

| Role            | Granted permission groups                                          |
| --------------- | ----------------------------------------------------------------- |
| Project Admin   | All project-scoped permissions + `project:manage-members`          |
| Project Manager | project:view, task, document, planning, meeting, reporting         |
| Member          | project:view, task, document, planning:view, meeting:view, reporting:view |
| Viewer          | All project-scoped `:view` permissions                            |

---

# Default Task Statuses

Created for every new project (`DEFAULT_TASK_STATUSES` in
`packages/core/src/constants/plans.ts`) — the five board columns.

| Name         | Order | isDefault | color         |
| ------------ | ----- | --------- | ------------- |
| Backlog      |0     | false     | var(--faint)  |
| To Do        | 1     | true      | var(--muted)  |
| In Progress  | 2     | false     | var(--info)   |
| In Review    | 3     | false     | var(--violet) |
| Done         | 4     | false     | var(--ok)     |

> Migration `0011_backfill_task_config.sql` upgraded pre-existing projects:
> those still carrying the old 3-status set gained Backlog and In Review, and
> every project gained the missing default types below.

---

# Default Task Types

Created for every new project.

| Name    |
| ------- |
| Epic    |
| Story   |
| Task    |
| Bug     |
| Subtask |

---

# Plans

Seed the `plans` table.

| name          | price | currency | project_limit | features                                                       |
| ------------- | ----- | -------- | ------------- | -------------------------------------------------------------- |
| free          | 0     | USD      | 2             | core modules                                                   |
| professional  | _TBD_ | USD      | null          | core modules, client_portal, advanced_reporting                |
| enterprise    | _TBD_ | USD      | null          | everything, self_hosted, sso, audit_logs, advanced_permissions |

The AI add-on is not a plan; it is a separate flag on the subscription.
