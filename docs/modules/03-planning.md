# Planning Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation
- Task

---

# Overview

The Planning module organizes work over time.

It builds on Tasks to provide timelines, iterations, and roadmaps.

---

# Objectives

- Group tasks into iterations
- Visualize work over time
- Plan releases and milestones
- Forecast delivery

---

# Responsibilities

Planning module is responsible for:

- Iterations and Sprints
- Milestones
- Timeline and Gantt view
- Backlog prioritization
- Capacity (Future)

Planning module is NOT responsible for:

- Task definition (Task module)
- Task status updates (Task module)
- Reporting (Reporting module)

---

# Domain Model

Entities

- Iteration
- Milestone

---

# Iteration

A fixed-length working period containing a set of tasks.

| Field      | Type     | Required | Description                          |
| ---------- | -------- | -------- | ------------------------------------ |
| id         | UUID     | Yes      | Primary identifier                   |
| projectId  | UUID     | Yes      | Owning project                       |
| name       | String   | Yes      | Iteration name                       |
| goal       | String?  | No       | Iteration goal                       |
| startDate  | DateTime | Yes      | Start date                           |
| endDate    | DateTime | Yes      | End date                             |
| status     | Enum     | Yes      | Planned, Active, Completed           |

---

# Milestone

A significant project checkpoint.

| Field        | Type     | Required | Description                  |
| ------------ | -------- | -------- | ---------------------------- |
| id           | UUID     | Yes      | Primary identifier           |
| projectId    | UUID     | Yes      | Owning project               |
| name         | String   | Yes      | Milestone name               |
| description  | String?  | No       | Details                      |
| dueDate      | DateTime | No       | Target date                  |
| status       | Enum     | Yes      | Planned, Reached             |

---

# Features

## Iterations

- Create iterations
- Assign tasks to iterations
- Start and complete iterations

## Backlog

- Unassigned task pool
- Drag tasks into iterations

## Milestones

- Group tasks under milestones
- Track milestone progress

## Timeline

- Gantt-style view of tasks and iterations

---

# API Endpoints

```http
GET    /projects/:projectId/planning/iterations
POST   /projects/:projectId/planning/iterations
PATCH  /projects/:projectId/planning/iterations/:id
GET    /projects/:projectId/planning/milestones
POST   /projects/:projectId/planning/milestones
GET    /projects/:projectId/planning/timeline
```

---

# Permissions

- planning:view
- planning:manage

---

# UI Screens

- Backlog view
- Iteration board
- Timeline (Gantt)

---

# Out of Scope

- Capacity and velocity forecasting (Future)
- Resource allocation
- Automatic scheduling

---

# Future Enhancements

- Velocity tracking
- Capacity planning
- AI forecast (AI add-on)

---

# Dependencies

- Foundation
- Task

---

# Acceptance Criteria

- Iterations can be created and scheduled
- Tasks can be assigned to iterations
- Milestones track progress
- Timeline visualizes scheduled work
