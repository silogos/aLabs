# Task Module

Version: 1.1.0
Status: Draft
Priority: High
Depends On:
- Foundation
- Planning (iteration link via `iteration_id`)

---

# Overview

The Task module handles units of work inside a Project.

Tasks are the primary mechanism for tracking execution progress, organized in a
Jira-style work hierarchy:

```text
Epic
  └── Story / Task / Bug          ← executable work
        └── Subtask               ← decomposition of a parent issue
```

Epics group larger initiatives; Stories, Tasks, and Bugs represent executable
work; Subtasks decompose a parent issue. Every executable issue may optionally
belong to an Epic (via `epic_id`) and to an Iteration/Sprint (via `iteration_id`,
the link to the Planning module).

---

# Objectives

- Create and assign work items
- Track status, priority, and story-point estimates
- Organize tasks into the Epic → Story/Task/Bug → Subtask hierarchy
- Link issues to planning artifacts (iteration, milestone)
- Express cross-issue relationships (blocks / blocked by / relates to)

---

# Responsibilities

Task module is responsible for:

- Task creation, update, deletion
- Task assignment (assignee + reporter)
- Task status, priority, and story-point estimate
- Task hierarchy (subtasks via `parent_id`; epic grouping via `epic_id`)
- Task labels and types
- Cross-issue links (the `task_links` table)
- Inline editing, quick-create, and bulk actions in the UI

Task module is NOT responsible for:

- Time tracking (Future)
- Iteration lifecycle / sprint planning (Planning module) — Tasks only carry
  the `iteration_id` pointer; Planning owns start/complete transitions
- Reporting (Reporting module)
- File storage (Documents module — Tasks may reference files via attachments)

---

# Domain Model

Entities

- Task
- TaskStatus
- TaskLabel
- TaskType
- TaskLink (cross-issue relationships)

---

# Task

Represents a unit of work. Any task may be a parent of subtasks, a child of one
(`parent_id`), grouped under an epic (`epic_id`), or all three.

| Field        | Type     | Required | Description                                          |
| ------------ | -------- | -------- | ---------------------------------------------------- |
| id           | UUID     | Yes      | Primary identifier                                   |
| projectId    | UUID     | Yes      | Owning project                                       |
| title        | String   | Yes      | Task title                                           |
| description  | String?  | No       | Rich text description                                |
| statusId     | UUID     | Yes      | Workflow status                                      |
| assigneeId   | UUID?    | No       | Assigned user                                        |
| reporterId   | UUID?    | No       | Creator                                              |
| priority     | Enum     | Yes      | low, medium, high, urgent                            |
| typeId       | UUID?    | No       | Task type (Epic / Story / Task / Bug / Subtask)      |
| parentId     | UUID?    | No       | Parent task (subtask relationship)                   |
| epicId       | UUID?    | No       | Epic this issue belongs to (→ a task of type Epic)   |
| iterationId  | UUID?    | No       | **Sprint/Iteration link** (null = Backlog). See Planning module |
| milestoneId  | UUID?    | No       | Milestone link (Planning module)                     |
| storyPoints  | Integer? | No       | Story-point estimate (null = unestimated)            |
| dueDate      | DateTime | No       | Due date                                             |
| order        | Integer  | Yes      | Board / list ordering                                |
| createdAt    | DateTime | Yes      | Creation timestamp                                   |
| updatedAt    | DateTime | Yes      | Last update timestamp                                |

> **Hierarchy rules**
> - `parent_id` is the subtask relationship: a Subtask's `parent_id` points to
>   its parent Story/Task/Bug. Multi-level nesting beyond one depth is not
>   supported (Epic → Story → Subtask is the canonical 3-level tree).
> - `epic_id` is the epic-grouping relationship: a Story/Task/Bug's `epic_id`
>   points to a task whose type is Epic. Epics themselves have no `epic_id`.
> - Subtasks inherit their parent's `iteration_id` and `milestone_id`.

---

# TaskStatus

Project-defined workflow states.

| Field      | Type    | Required | Description        |
| ---------- | ------- | -------- | ------------------ |
| id         | UUID    | Yes      | Primary identifier |
| projectId  | UUID    | Yes      | Owning project     |
| name       | String  | Yes      | Status name        |
| color      | String? | No       | Display color      |
| order      | Integer | Yes      | Workflow order     |
| isDefault  | Boolean | Yes      | Initial status     |

Default statuses (5): Backlog, To Do, In Progress, In Review, Done.

The five map directly to the Board columns and the default List groupings.
`To Do` is the creation default (`is_default = true`); `Backlog` is the parking
column for unrefined/uncommitted work.

---

# TaskLabel

| Field     | Type    | Required | Description        |
| --------- | ------- | -------- | ------------------ |
| id        | UUID    | Yes      | Primary identifier |
| projectId | UUID    | Yes      | Owning project     |
| name      | String  | Yes      | Label name         |
| color     | String? | No       | Display color      |

A task's labels are linked through `task_label_links` (many-to-many).

---

# TaskType

| Field     | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| id        | UUID   | Yes      | Primary identifier |
| projectId | UUID   | Yes      | Owning project     |
| name      | String | Yes      | Type name          |

Default types (5): **Epic, Story, Task, Bug, Subtask**.

- **Epic** — large initiative that groups Stories/Tasks/Bugs (`epic_id`). Has its
  own detail surface (goal, owner, progress bar, child-issue rollup).
- **Story** — user-facing executable work.
- **Task** — generic executable work.
- **Bug** — defect.
- **Subtask** — decomposition of a parent Story/Task/Bug (carries `parent_id`).

> **Sync note:** the in-memory seed (`apps/api/src/db/seed.ts`) currently still
> seeds the pre-rename set `["Task", "Bug", "Feature", "Epic"]` and omits
> `Story`/`Subtask`. The product/UI spec is the five-type set above; the seed
> needs renaming `Feature → Story` and adding `Subtask` to match.

---

# TaskLink

Cross-issue relationships between two tasks (excluding the subtask/epic
hierarchies, which use `parent_id` / `epic_id`).

| Field       | Type   | Required | Description                                              |
| ----------- | ------ | -------- | -------------------------------------------------------- |
| id          | UUID   | Yes      | Primary identifier                                       |
| projectId   | UUID   | Yes      | Owning project                                           |
| sourceId    | UUID   | Yes      | The task expressing the link                             |
| targetId    | UUID   | Yes      | The task being linked to                                 |
| type        | Enum   | Yes      | `blocks` \| `blocked_by` \| `relates_to`                 |
| createdAt   | DateTime | Yes    | Creation timestamp                                       |

Unique `(sourceId, targetId, type)`. `blocks` and `blocked_by` are reciprocal:
if A blocks B, then B is blocked by A (store one directed row + compute the
inverse, or store both — implementation choice).

---

# Features

## Task CRUD

- Create, read, update, delete tasks
- Inline editing on all detail fields

## Assignment

- Assign one user, set reporter, reassign

## Subtasks & hierarchy

- Nest tasks under a parent (`parent_id`)
- Epic grouping of work (`epic_id`)
- Roll up progress (an Epic's progress = completed/total story points of its
  child issues; a parent's progress = its subtask completion)

## Board View

- Kanban columns by status (Backlog → To Do → In Progress → In Review → Done)
- Drag-and-drop status changes
- **Sprint selector** with checkboxes (filter the board to one or more
  iterations) — reads the `iteration_id` link
- Cards show: type icon, key, title, epic chip, labels, priority, subtask
  progress, story points, assignee

## List View

- Filterable, sortable table
- **Group by**: None / Epic / Status / Assignee / **Sprint** (`iteration_id`)
- **Density**: Comfortable / Compact
- **Column visibility** control
- **Bulk actions**: select rows → set status / assignee / delete
- **Subtask tree rows**: nested under the parent with tree-guide connectors and
  a subtle row band; own type icon, key, and status per child row
- Collapsible group headers

## Backlog View

- Issues with `iteration_id = null`, grouped by Epic → Issue → Subtask tree
- The same backlog the Planning module grooms (single source of truth)

## Relationships

- Blocks / Blocked by / Relates to between any two issues (TaskLink)
- Rendered in the task detail as clickable jumps to the linked issue

## Quick create

- Type picker (Epic / Story / Task / Bug / Subtask)
- Title + description required; parent (for subtasks), epic, assignee, priority,
  sprint, story points, labels, due date progressively disclosed

---

# Filtering

By status, assignee, label, type, priority, due date, **sprint**
(`iteration_id`), and **epic** (`epic_id`).

---

# API Endpoints

```http
GET    /projects/:projectId/tasks
POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks/:id
PATCH  /projects/:projectId/tasks/:id
DELETE /projects/:projectId/tasks/:id

# Cross-issue links
GET    /projects/:projectId/tasks/:id/links
POST   /projects/:projectId/tasks/:id/links
DELETE /projects/:projectId/tasks/:id/links/:linkId
```

Filter the task list by sprint with `?iterationId=:id`; group/roll-up is done
client-side off the returned set.

---

# Permissions

- task:view
- task:create
- task:update
- task:delete

---

# UI Screens

- **Board view** — kanban with sprint selector
- **List view** — enterprise table with group-by / density / column visibility /
  bulk actions / subtask tree rows
- **Backlog view** — uncommitted issues in the Epic → Issue → Subtask tree
- **Task detail** — two-column workspace: main (Description, Acceptance Criteria,
  Subtasks, Relationships, Comments, Attachments, Activity) + side panel
  (Status, Assignee, Reporter, Priority, Sprint, Epic, Labels, Story Points,
  Due Date — inline-editable)
- **Epic detail** — goal, owner, progress bar, timeline, child-issues list

---

# Out of Scope

- Time tracking
- Capacity planning (Planning module)
- Custom Gantt editing (Planning module)
- Timesheets

---

# Future Enhancements

- Custom fields
- Workload view
- Recurring tasks
- Task templates
- Time tracking

---

# Dependencies

- Foundation (Project, Members, Permissions)
- Planning (Iteration — the `iteration_id` link target; Milestone)
- Notification (for mentions and assignments)

---

# Acceptance Criteria

- Tasks can be created within a project with any of the five types
- Tasks can be assigned to project members
- Tasks move through the five statuses
- Subtasks nest under a parent and roll up to it
- Epics group child issues and roll up progress
- Tasks can be committed to an iteration (`iteration_id`) and the Board filters by it
- Story points are stored and surfaced in board/list/velocity
- Cross-issue links (blocks / blocked by / relates to) can be created and traversed
- Board, List, and Backlog views are available
