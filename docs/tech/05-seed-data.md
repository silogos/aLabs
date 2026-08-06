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

Created for every new project.

| Name         | Order | isDefault |
| ------------ | ----- | --------- |
| To Do        | 0     | true      |
| In Progress  | 1     | false     |
| Done         | 2     | false     |

---

# Default Task Types

Created for every new project.

| Name    |
| ------- |
| Task    |
| Bug     |
| Feature |
| Epic    |

---

# Plans

Seed the `plans` table.

| name          | price | currency | project_limit | features                                                       |
| ------------- | ----- | -------- | ------------- | -------------------------------------------------------------- |
| free          | 0     | USD      | 2             | core modules                                                   |
| professional  | _TBD_ | USD      | null          | core modules, client_portal, advanced_reporting                |
| enterprise    | _TBD_ | USD      | null          | everything, self_hosted, sso, audit_logs, advanced_permissions |

The AI add-on is not a plan; it is a separate flag on the subscription.
