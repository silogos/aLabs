# Data Model

Version: 1.1.0
Status: Draft
Priority: Critical
Depends On:
- Conventions
- Architecture

---

# Purpose

The precise database schema. Use this when generating Drizzle table definitions, migrations, and types.

Column types follow `02-conventions.md`: `uuid` PKs (UUID v7), `timestamptz`, snake_case plural tables.

Audit columns `created_by` / `updated_by` are omitted below for brevity but apply to every user-mutated entity.

> **Schema sync status (v1.1, in sync):** the Drizzle implementation in
> `packages/core/src/db/schema.ts` matches this spec, with two deliberate
> naming deviations: story points live in `tasks.estimate` (the product's term)
> and epics are modeled as a `task_types` row ("Epic") rather than a separate
> `tasks.epic_id` column. Cross-issue links (`task_links`) and the iteration
> point caches are implemented as specified.

---

# Identity (Better Auth)

Better Auth owns `users`, `sessions`, `accounts`, `verifications`. Domain code references `users.id`.

## users

| Column         | Type           | Constraints          |
| -------------- | -------------- | -------------------- |
| id             | uuid           | pk                   |
| name           | varchar(100)   | not null             |
| email          | varchar(255)   | not null, unique     |
| image          | text           | null                 |
| email_verified | boolean        | not null default false |
| created_at     | timestamptz    | not null default now |
| updated_at     | timestamptz    | not null default now |

---

# Workspace

## organizations

| Column       | Type          | Constraints                          |
| ------------ | ------------- | ------------------------------------ |
| id           | uuid          | pk                                   |
| name         | varchar(100)  | not null                             |
| slug         | varchar(60)   | not null, unique                     |
| type         | organization_type | not null default 'team'          |
| logo         | text          | null                                 |
| logo         | text          | null                       |
| description  | text          | null                       |
| timezone     | varchar(50)   | not null default 'UTC'     |
| language     | varchar(10)   | not null default 'en'      |
| website      | text          | null                       |
| created_at   | timestamptz   | not null default now       |
| updated_at   | timestamptz   | not null default now       |

`organization_type` enum: `personal`, `team`. A personal workspace is an org
with a single member (the owner); see `docs/foundation/04-plans-workspaces.md`
and ADR 0007. Free/paid is an **org** property — there is no `plan` column on
`users`; paid plans live on `subscriptions.organization_id`.

## organization_members

| Column         | Type         | Constraints                          |
| -------------- | ------------ | ------------------------------------ |
| id             | uuid         | pk                                   |
| organization_id| uuid         | fk organizations, indexed, not null  |
| user_id        | uuid         | fk users, indexed, not null          |
| role_id        | uuid         | fk roles, not null                   |
| status         | member_status| not null default 'pending'           |
| joined_at      | timestamptz  | null                                 |
| created_at     | timestamptz  | not null default now                 |
| updated_at     | timestamptz  | not null default now                 |

Unique `(organization_id, user_id)`.

## roles

| Column         | Type       | Constraints                                   |
| -------------- | ---------- | --------------------------------------------- |
| id             | uuid       | pk                                            |
| organization_id| uuid       | fk organizations, null (null = system default)|
| scope          | role_scope | not null                                      |
| name           | varchar(50)| not null                                      |
| is_system      | boolean    | not null default false                        |
| created_at     | timestamptz| not null default now                          |
| updated_at     | timestamptz| not null default now                          |

## role_permissions

| Column       | Type        | Constraints        |
| ------------ | ----------- | ------------------ |
| role_id      | uuid        | fk roles           |
| permission_id| uuid        | fk permissions     |

Composite pk `(role_id, permission_id)`.

## permissions

| Column      | Type         | Constraints    |
| ----------- | ------------ | -------------- |
| id          | uuid         | pk             |
| key         | varchar(80)  | not null, unique |
| description | text         | null           |

## invitations

| Column         | Type             | Constraints                          |
| -------------- | ---------------- | ------------------------------------ |
| id             | uuid             | pk                                   |
| organization_id| uuid             | fk organizations, indexed, not null  |
| email          | varchar(255)     | not null                             |
| role_id        | uuid             | fk roles, not null                   |
| token          | varchar(64)      | not null, unique                     |
| expires_at     | timestamptz      | not null                             |
| status         | invitation_status| not null default 'pending'           |
| created_at     | timestamptz      | not null default now                 |
| updated_at     | timestamptz      | not null default now                 |

Index `(organization_id, status)`.

---

# Project

## projects

| Column         | Type               | Constraints                              |
| -------------- | ------------------ | ---------------------------------------- |
| id             | uuid               | pk                                       |
| organization_id| uuid               | fk organizations, indexed, not null      |
| name           | varchar(120)       | not null                                 |
| slug           | varchar(60)        | not null                                 |
| key            | varchar(10)        | not null                                 |
| description    | text               | null                                     |
| icon           | varchar(20)        | null                                     |
| status         | project_status     | not null default 'active'                |
| visibility     | project_visibility | not null default 'organization'          |
| created_at     | timestamptz        | not null default now                     |
| updated_at     | timestamptz        | not null default now                     |
| deleted_at     | timestamptz        | null                                     |

Unique `(organization_id, slug)`. Unique `(organization_id, key)`.

## project_members

| Column     | Type         | Constraints                        |
| ---------- | ------------ | ---------------------------------- |
| id         | uuid         | pk                                 |
| project_id | uuid         | fk projects, indexed, not null     |
| user_id    | uuid         | fk users, indexed, not null        |
| role_id    | uuid         | fk roles, not null                 |
| status     | member_status| not null default 'active'          |
| joined_at  | timestamptz  | not null default now               |
| created_at | timestamptz  | not null default now               |
| updated_at | timestamptz  | not null default now               |

Unique `(project_id, user_id)`.

## project_visits `[NEW v1.1]`

Per-user project visit history — powers the "Recent projects" group in the
switchers and the derived landing project when switching workspaces
(most-recently-visited project in the org, else first project by `created_at`).

| Column     | Type         | Constraints                        |
| ---------- | ------------ | ---------------------------------- |
| user_id    | uuid         | pk, fk users                       |
| project_id | uuid         | pk, fk projects                    |
| visited_at | timestamptz  | not null default now               |

Primary key `(user_id, project_id)` — one row per user/project; `visited_at`
is upserted on each visit. The application caps the history at 5 rows per
user.

---

# Task

## tasks

| Column       | Type          | Constraints                              |
| ------------ | ------------- | ---------------------------------------- |
| id           | uuid          | pk                                       |
| project_id   | uuid          | fk projects, indexed, not null           |
| title        | varchar(255)  | not null                                 |
| description  | text          | null                                     |
| status_id    | uuid          | fk task_statuses, not null               |
| assignee_id  | uuid          | fk users, null                           |
| reporter_id  | uuid          | fk users, null                           |
| priority     | task_priority | not null default 'medium'                |
| type_id      | uuid          | fk task_types, null                      |
| parent_id    | uuid          | fk tasks, null (self-reference, subtasks) |
| epic_id      | uuid          | fk tasks, null `[NEW v1.1]` (epic grouping) |
| iteration_id | uuid          | fk iterations, null (null = Backlog)     |
| milestone_id | uuid          | fk milestones, null                      |
| story_points | integer       | null `[NEW v1.1]` (story-point estimate) |
| due_date     | timestamptz   | null                                     |
| order        | integer       | not null default 0                       |
| created_at   | timestamptz   | not null default now                     |
| updated_at   | timestamptz   | not null default now                     |
| deleted_at   | timestamptz   | null                                     |

Index `(project_id, status_id)`, `(project_id, assignee_id)`, `(project_id, iteration_id)`, `(project_id, epic_id)`.

> **Hierarchy fields:** `parent_id` is the subtask relationship (a Subtask's
> parent is a Story/Task/Bug); `epic_id` is the epic-grouping relationship (a
> Story/Task/Bug's epic is a task of type Epic). Epics have no `epic_id`.
> Subtasks inherit their parent's `iteration_id` / `milestone_id`.

## task_statuses

| Column     | Type        | Constraints                  |
| ---------- | ----------- | ---------------------------- |
| id         | uuid        | pk                           |
| project_id | uuid        | fk projects, indexed, not null |
| name       | varchar(50) | not null                     |
| color      | varchar(20) | null                         |
| order      | integer     | not null default 0           |
| is_default | boolean     | not null default false       |
| created_at | timestamptz | not null default now         |

Unique `(project_id, name)`.

## task_labels

| Column     | Type        | Constraints                  |
| ---------- | ----------- | ---------------------------- |
| id         | uuid        | pk                           |
| project_id | uuid        | fk projects, indexed, not null |
| name       | varchar(50) | not null                     |
| color      | varchar(20) | null                         |
| created_at | timestamptz | not null default now         |

## task_label_links

| Column   | Type | Constraints      |
| -------- | ---- | ---------------- |
| task_id  | uuid | fk tasks         |
| label_id | uuid | fk task_labels   |

Composite pk `(task_id, label_id)`.

## task_links `[NEW v1.1]`

Cross-issue relationships between two tasks (excludes the subtask/epic
hierarchies, which use `parent_id` / `epic_id`). Models blocks / blocked by /
relates to.

| Column     | Type            | Constraints                              |
| ---------- | --------------- | ---------------------------------------- |
| id         | uuid            | pk                                       |
| project_id | uuid            | fk projects, indexed, not null           |
| source_id  | uuid            | fk tasks, not null                       |
| target_id  | uuid            | fk tasks, not null                       |
| type       | task_link_type  | not null                                 |
| created_at | timestamptz     | not null default now                     |

Unique `(source_id, target_id, type)`. Index `(project_id, source_id)`,
`(project_id, target_id)`.

`task_link_type` enum: `blocks`, `blocked_by`, `relates_to`. `blocks` and
`blocked_by` are reciprocal — store one directed row and compute the inverse,
or store both; pick one convention per implementation.

## task_types

| Column     | Type        | Constraints                  |
| ---------- | ----------- | ---------------------------- |
| id         | uuid        | pk                           |
| project_id | uuid        | fk projects, indexed, not null |
| name       | varchar(50) | not null                     |
| created_at | timestamptz | not null default now         |

---

# Documents

## spaces

| Column     | Type        | Constraints                  |
| ---------- | ----------- | ---------------------------- |
| id         | uuid        | pk                           |
| project_id | uuid        | fk projects, indexed, not null |
| name       | varchar(120)| not null                     |
| icon       | varchar(20) | null                         |
| order      | integer     | not null default 0           |
| created_at | timestamptz | not null default now         |
| deleted_at | timestamptz | null                         |

## pages

| Column     | Type        | Constraints                    |
| ---------- | ----------- | ------------------------------ |
| id         | uuid        | pk                             |
| project_id | uuid        | fk projects, indexed, not null |
| space_id   | uuid        | fk spaces, indexed, not null   |
| parent_id  | uuid        | fk pages, null (self-reference)|
| title      | varchar(255)| not null                       |
| content    | jsonb       | not null default '[]'          |
| icon       | varchar(20) | null                           |
| order      | integer     | not null default 0             |
| created_at | timestamptz | not null default now           |
| updated_at | timestamptz | not null default now           |
| deleted_at | timestamptz | null                           |

Index `(project_id, space_id)`.

## page_revisions

| Column    | Type        | Constraints                |
| --------- | ----------- | -------------------------- |
| id        | uuid        | pk                         |
| page_id   | uuid        | fk pages, indexed, not null|
| content   | jsonb       | not null                   |
| edited_by | uuid        | fk users, not null         |
| created_at| timestamptz | not null default now       |

## files

| Column      | Type        | Constraints                  |
| ----------- | ----------- | ---------------------------- |
| id          | uuid        | pk                           |
| project_id  | uuid        | fk projects, indexed, not null |
| name        | varchar(255)| not null                     |
| mime_type   | varchar(100)| not null                     |
| size        | bigint      | not null                     |
| url         | text        | not null                     |
| uploaded_by | uuid        | fk users, not null           |
| created_at  | timestamptz | not null default now         |
| deleted_at  | timestamptz | null                         |

---

# Planning

## iterations

| Column            | Type             | Constraints                              |
| ----------------- | ---------------- | ---------------------------------------- |
| id                | uuid             | pk                                       |
| project_id        | uuid             | fk projects, indexed, not null           |
| name              | varchar(120)     | not null                                 |
| goal              | text             | null                                     |
| start_date        | date             | not null                                 |
| end_date          | date             | not null                                 |
| status            | iteration_status | not null default 'planned'               |
| committed_points  | integer          | null `[NEW v1.1]` (denormalized cache)   |
| completed_points  | integer          | null `[NEW v1.1]` (denormalized cache)   |
| created_at        | timestamptz      | not null default now                     |
| updated_at        | timestamptz      | not null default now                     |

> **Lifecycle:** `planned → active → completed`, and **only one `active`
> iteration per project** (starting a new one auto-completes the current).
> `committed_points` / `completed_points` are caches of the story-point sums over
> the iteration's tasks (committed = all non-subtask points; completed = those
> with a 'Done' status); they can be recomputed from `tasks`.

## milestones

| Column      | Type             | Constraints                  |
| ----------- | ---------------- | ---------------------------- |
| id          | uuid             | pk                           |
| project_id  | uuid             | fk projects, indexed, not null |
| name        | varchar(120)     | not null                     |
| description | text             | null                         |
| due_date    | date             | null                         |
| status      | milestone_status | not null default 'planned'   |
| created_at  | timestamptz      | not null default now         |
| updated_at  | timestamptz      | not null default now         |

---

# Meeting

## meetings

| Column      | Type          | Constraints                  |
| ----------- | ------------- | ---------------------------- |
| id          | uuid          | pk                           |
| project_id  | uuid          | fk projects, indexed, not null |
| title       | varchar(200)  | not null                     |
| type        | meeting_type  | null                         |
| scheduled_at| timestamptz   | not null                     |
| duration    | integer       | null (minutes)               |
| location    | varchar(255)  | null                         |
| agenda      | jsonb         | null                         |
| notes       | jsonb         | null                         |
| status      | meeting_status| not null default 'scheduled' |
| created_at  | timestamptz   | not null default now         |
| updated_at  | timestamptz   | not null default now         |
| deleted_at  | timestamptz   | null                         |

## action_items

| Column      | Type       | Constraints                    |
| ----------- | ---------- | ------------------------------ |
| id          | uuid       | pk                             |
| meeting_id  | uuid       | fk meetings, indexed, not null |
| task_id     | uuid       | fk tasks, null                 |
| assignee_id | uuid       | fk users, null                 |
| description | text       | not null                       |
| done        | boolean    | not null default false         |
| due_date    | timestamptz| null                           |
| created_at  | timestamptz| not null default now           |
| updated_at  | timestamptz| not null default now           |

## meeting_participants

| Column     | Type | Constraints    |
| ---------- | ---- | -------------- |
| meeting_id | uuid | fk meetings    |
| user_id    | uuid | fk users       |

Composite pk `(meeting_id, user_id)`.

---

# Agreement

## agreements

| Column        | Type             | Constraints                  |
| ------------- | ---------------- | ---------------------------- |
| id            | uuid             | pk                           |
| project_id    | uuid             | fk projects, indexed, not null |
| title         | varchar(200)     | not null                     |
| type          | agreement_type   | null                         |
| status        | agreement_status | not null default 'draft'     |
| counterparty  | varchar(200)     | not null                     |
| value         | numeric(12,2)    | null                         |
| currency      | varchar(3)       | null                         |
| start_date    | date             | null                         |
| end_date      | date             | null                         |
| signed_at     | timestamptz      | null                         |
| created_at    | timestamptz      | not null default now         |
| updated_at    | timestamptz      | not null default now         |
| deleted_at    | timestamptz      | null                         |

## agreement_attachments

| Column       | Type | Constraints  |
| ------------ | ---- | ------------ |
| agreement_id | uuid | fk agreements|
| file_id      | uuid | fk files     |

Composite pk `(agreement_id, file_id)`.

---

# Client Portal

## client_users

| Column     | Type               | Constraints                  |
| ---------- | ------------------ | ---------------------------- |
| id         | uuid               | pk                           |
| project_id | uuid               | fk projects, indexed, not null |
| email      | varchar(255)       | not null                     |
| name       | varchar(120)       | not null                     |
| status     | client_user_status | not null default 'invited'   |
| created_at | timestamptz        | not null default now         |

Unique `(project_id, email)`.

## client_shares

| Column     | Type                 | Constraints                  |
| ---------- | -------------------- | ---------------------------- |
| id         | uuid                 | pk                           |
| project_id | uuid                 | fk projects, indexed, not null |
| resource   | client_share_resource| not null                     |
| visible    | boolean              | not null default false       |
| created_at | timestamptz          | not null default now         |

Unique `(project_id, resource)`.

---

# Notification

## notifications

| Column    | Type        | Constraints                  |
| --------- | ----------- | ---------------------------- |
| id        | uuid        | pk                           |
| user_id   | uuid        | fk users, indexed, not null  |
| type      | varchar(60) | not null                     |
| title     | varchar(200)| not null                     |
| body      | text        | null                         |
| link      | text        | null                         |
| read_at   | timestamptz | null                         |
| created_at| timestamptz | not null default now         |

Index `(user_id, created_at)`.

## notification_preferences

| Column  | Type                 | Constraints                  |
| ------- | -------------------- | ---------------------------- |
| id      | uuid                 | pk                           |
| user_id | uuid                 | fk users, indexed, not null  |
| channel | notification_channel | not null                     |
| type    | varchar(60)          | not null                     |
| enabled | boolean              | not null default true        |

Unique `(user_id, channel, type)`.

---

# Billing

## plans

| Column       | Type      | Constraints          |
| ------------ | --------- | -------------------- |
| id           | uuid      | pk                   |
| name         | plan_name | not null, unique     |
| price        | numeric(10,2) | not null         |
| currency     | varchar(3)| not null             |
| project_limit| integer   | null (null = unlimited) |
| features     | jsonb     | not null default '{}'|
| created_at   | timestamptz| not null default now|

## subscriptions

| Column                  | Type                | Constraints                          |
| ----------------------- | ------------------- | ------------------------------------ |
| id                      | uuid                | pk                                   |
| organization_id         | uuid                | fk organizations, indexed, not null  |
| plan_id                 | uuid                | fk plans, not null                   |
| status                  | subscription_status | not null default 'active'            |
| current_period_end      | timestamptz         | not null                             |
| provider_subscription_id| varchar(120)        | null                                 |
| created_at              | timestamptz         | not null default now                 |
| updated_at              | timestamptz         | not null default now                 |

## invoices

| Column             | Type          | Constraints                          |
| ------------------ | ------------- | ------------------------------------ |
| id                 | uuid          | pk                                   |
| organization_id    | uuid          | fk organizations, indexed, not null  |
| amount             | numeric(12,2) | not null                             |
| currency           | varchar(3)    | not null                             |
| status             | invoice_status| not null                             |
| issued_at          | timestamptz   | not null                             |
| provider_invoice_id| varchar(120)  | null                                 |
| created_at         | timestamptz   | not null default now                 |

---

# Enums

| Enum                  | Values                                              |
| --------------------- | --------------------------------------------------- |
| member_status         | pending, active, suspended                          |
| invitation_status     | pending, accepted, expired, cancelled               |
| role_scope            | workspace, project                                  |
| project_status        | active, on_hold, archived                           |
| project_visibility    | organization, private                               |
| task_priority         | low, medium, high, urgent                           |
| task_link_type        | blocks, blocked_by, relates_to                      |
| iteration_status      | planned, active, completed                          |
| milestone_status      | planned, reached                                    |
| meeting_type          | standup, review, planning, client, other            |
| meeting_status        | scheduled, completed, cancelled                     |
| agreement_type        | sow, nda, contract, proposal, other                 |
| agreement_status      | draft, sent, accepted, rejected, expired            |
| client_user_status    | invited, active, disabled                           |
| client_share_resource | tasks, milestones, reports, documents               |
| notification_channel  | in_app, email                                       |
| plan_name             | free, professional, enterprise                      |
| subscription_status   | active, past_due, canceled                          |
| invoice_status        | paid, pending, failed                               |

---

# State Machines

Allowed transitions. Any other transition returns `409 conflict`.

```text
invitation:   pending → accepted | expired | cancelled
project:      active ⇄ on_hold;  active/on_hold → archived;  archived → active
iteration:    planned → active → completed
milestone:    planned → reached
meeting:      scheduled → completed | cancelled
agreement:    draft → sent;  sent → accepted | rejected | expired
client_user:  invited → active;  active ⇄ disabled
subscription: active → past_due;  past_due → active | canceled
```

---

# Page Content Block Model

`pages.content` is a `jsonb` array of blocks. Each block has a discriminated shape.

```ts
type Block =
  | { id: string; type: "paragraph";  data: { text: string } }
  | { id: string; type: "heading1" | "heading2" | "heading3"; data: { text: string } }
  | { id: string; type: "bulletList" | "orderedList"; data: { items: string[] } }
  | { id: string; type: "todo"; data: { text: string; checked: boolean } }
  | { id: string; type: "quote"; data: { text: string } }
  | { id: string; type: "code"; data: { language: string; text: string } }
  | { id: string; type: "divider"; data: Record<string, never> }
  | { id: string; type: "callout"; data: { variant: "info" | "warning" | "success"; text: string } }
  | { id: string; type: "image"; data: { fileId: string; caption?: string } };
```

The web app renders these blocks. The API validates incoming `content` against the block union before persisting.
