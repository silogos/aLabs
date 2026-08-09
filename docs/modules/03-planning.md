# Planning Module

Version: 1.1.0
Status: Draft
Priority: Medium
Depends On:
- Foundation
- Task (the iteration link is `task.iteration_id`)

---

# Overview

The Planning module organizes work over time.

It builds on Tasks to provide iterations (sprints), milestones, timelines, and
velocity. **It does not duplicate task data** — it reads and writes a single
field on each task: `iteration_id` (null = Backlog). That one field is the entire
bridge between the Task module and Planning.

```text
            PLAN (before)               DO (during)              CLOSE (after)
     ┌────────────────────┐       ┌────────────────────┐    ┌────────────────────┐
     │   PLANNING         │       │      TASKS         │    │   PLANNING         │
     │ decide the sprint  │──commit──▶ do the work      │──▶│  review the result │
     │ pull in backlog    │       │ move cards          │    │  plan next one     │
     │ set capacity       │       │ log progress        │    │                    │
     └────────────────────┘       └────────────────────┘    └────────────────────┘
```

---

# Objectives

- Group tasks into iterations (sprints)
- Drive the sprint lifecycle: Planned → Active → Completed
- Visualize work over time (timeline / Gantt)
- Plan releases and milestones
- Track velocity across iterations

---

# Responsibilities

Planning module is responsible for:

- Iteration (sprint) CRUD and lifecycle transitions
- Milestones
- Timeline / Gantt view (zoom + date-range controls)
- Backlog grooming UI (committing/uncommitting tasks to iterations)
- Velocity tracking (committed vs. completed story points)

Planning module is NOT responsible for:

- Task definition or status updates (Task module) — Planning only sets
  `task.iteration_id`; it never re-creates a task
- Reporting (Reporting module)

---

# Domain Model

Entities

- Iteration
- Milestone

The link to Task is a single column on `tasks`: **`iteration_id`** (nullable;
null = Backlog). See the Task module for the full `tasks` table.

---

# Iteration

A fixed-length working period (sprint) containing a set of tasks. Tasks belong
to an iteration solely via `tasks.iteration_id`; there is no join table.

| Field            | Type     | Required | Description                                              |
| ---------------- | -------- | -------- | -------------------------------------------------------- |
| id               | UUID     | Yes      | Primary identifier                                       |
| projectId        | UUID     | Yes      | Owning project                                           |
| name             | String   | Yes      | Iteration name                                           |
| goal             | String?  | No       | One-sentence sprint goal                                 |
| startDate        | DateTime | Yes      | Start date                                               |
| endDate          | DateTime | Yes      | End date                                                 |
| status           | Enum     | Yes      | `planned` \| `active` \| `completed`                     |
| committedPoints  | Integer? | No       | Sum of story points committed (denormalized cache)       |
| completedPoints  | Integer? | No       | Sum of story points completed (denormalized cache)       |
| createdAt        | DateTime | Yes      | Creation timestamp                                       |
| updatedAt        | DateTime | Yes      | Last update timestamp                                    |

> **Lifecycle rule — one active at a time.** An iteration moves
> `planned → active → completed` (see State Machines). **Only one iteration per
> project may be `active`.** Starting a new iteration auto-completes the current
> one.
>
> **`committedPoints` / `completedPoints`** are denormalized caches of:
> - committed = `SUM(story_points) WHERE iteration_id = :id AND parent_id IS NULL`
> - completed = same, plus `AND status_id = (done)`
>
> They can be recomputed from tasks; storing them avoids an aggregate query on
> every board/dashboard render. The seed computes them at seed-time.

---

# Milestone

A significant project checkpoint that may span multiple iterations.

| Field        | Type     | Required | Description                  |
| ------------ | -------- | -------- | ---------------------------- |
| id           | UUID     | Yes      | Primary identifier           |
| projectId    | UUID     | Yes      | Owning project               |
| name         | String   | Yes      | Milestone name               |
| description  | String?  | No       | Details                      |
| dueDate      | DateTime | No       | Target date                  |
| status       | Enum     | Yes      | `planned` \| `reached`       |

Tasks link to a milestone via `tasks.milestone_id`.

---

# State Machines

```text
iteration:  planned → active → completed      (only one active per project)
milestone:  planned → reached
```

`ITERATION_TRANSITIONS` is defined in `packages/core/src/constants/state-machines.ts`
and matches the above exactly. Any other transition returns `409 conflict`.

---

# Features

## Iterations (sprints)

- Create / edit / delete iterations
- **Lifecycle transitions** with Start / Complete actions on the iteration tab
  and detail card (`planned → active → completed`; one active per project)
- Iteration detail card shows: goal, date range, day progress, committed vs.
  completed story points, status breakdown, team members
- Selecting an iteration tab **switches the detail data** (not just a highlight)

## Backlog grooming

- The backlog is **`tasks WHERE iteration_id IS NULL`** — the same pool shown in
  the Task module's Backlog view (single source of truth)
- Commit work to the next sprint by setting `task.iteration_id` (drag in the
  Planning backlog, or pick the sprint in the task detail)
- Committed points update live against team capacity

## Milestones

- Group work under milestones (`task.milestone_id`)
- Track milestone progress (child tasks done / total)
- Render as bars on the timeline

## Timeline (Gantt)

- **One timeline per project**, not multiple — a single canonical Gantt showing
  all iterations + milestones together
- **Range controls** in the header: a date-range pill + prev/next arrows + Today
- **Zoom levels**: Day / Week / Month (sprint-level default)
- **Filters** (lenses on the same timeline): All / by Epic / by Team
- A "Today" line marks the current date
- Bars are data-driven from `iterations` + `milestones` (+ optional `task.due`
  for task bars)

## Velocity

- Committed vs. completed story points across the last N iterations
- Feeds the Dashboard sprint-health widgets and the Reports overview KPIs
- Computed from `iteration.committedPoints` / `completedPoints` (or aggregated
  live from tasks)

---

# Task ↔ Iteration integration

The whole integration is **one field**: `tasks.iteration_id`.

| Action | Where it happens | Effect |
| --- | --- | --- |
| Put a task in a sprint | Task detail → Sprint dropdown, **or** Planning → drag into sprint | Sets `iteration_id`; instantly appears in the Board's sprint filter and the List's Sprint group |
| Move work forward | Task Board → drag the card | Iteration progress (completed points) updates in Planning |
| Pull a task out of the sprint | Task detail → Sprint → Backlog | Clears `iteration_id`; returns to Backlog |
| See sprint health | Planning → iteration card | Read-only — go to Tasks to act |

Planning never re-creates a task. It owns the **timeline**; Tasks owns the
**tasks**. The two modules never sync explicitly — they share data.

---

# API Endpoints

```http
# Iterations
GET    /projects/:projectId/planning/iterations
POST   /projects/:projectId/planning/iterations
GET    /projects/:projectId/planning/iterations/:id
PATCH  /projects/:projectId/planning/iterations/:id        # status transitions
DELETE /projects/:projectId/planning/iterations/:id

# Milestones
GET    /projects/:projectId/planning/milestones
POST   /projects/:projectId/planning/milestones
PATCH  /projects/:projectId/planning/milestones/:id

# Timeline (computed)
GET    /projects/:projectId/planning/timeline

# Velocity (computed)
GET    /projects/:projectId/planning/velocity
```

Committing a task to a sprint is a Task update (`PATCH .../tasks/:id` with
`iterationId`), not a Planning call.

---

# Permissions

- planning:view
- planning:manage (create/edit/start/complete iterations & milestones)

---

# UI Screens

- **Iterations** (default) — iteration tabs + detail card; backlog panel
- **Timeline** — Gantt with zoom / date-range / filters
- (Velocity appears on the Dashboard and in Reports; not a standalone screen)

---

# Out of Scope

- Resource allocation / capacity forecasting beyond committed-vs-capacity
- Automatic scheduling / auto-assignment

---

# Future Enhancements

- AI delivery forecast (AI add-on)
- Capacity planning per team member
- Multi-team program increments

---

# Dependencies

- Foundation
- Task (`iteration_id` / `milestone_id` / `story_points` link targets)

---

# Acceptance Criteria

- Iterations can be created, scheduled, and transitioned through their lifecycle
- Only one iteration is active at a time per project
- Tasks can be committed to / pulled from an iteration (`iteration_id`)
- Backlog grooming in Planning and the Task Backlog view show the same items
- Milestones track progress and render on the timeline
- Timeline visualizes scheduled work with zoom + date-range controls
- Velocity reflects committed vs. completed story points

> **Sync note:** the Planning screen in the current UI mock (`designs/app/alabs-app.html`)
> still renders hardcoded rows and is **not yet wired** to the real
> `iterations`/`tasks` data — its buttons (New iteration, Plan sprint, Start/
> Complete, Gantt drag) are placeholders. The data model and state machine above
> are the target spec for making that screen real.
