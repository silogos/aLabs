# Task Module

Version: 1.0.0
Status: Draft
Priority: High
Depends On:
- Foundation

---

# Overview

The Task module handles units of work inside a Project.

Tasks are the primary mechanism for tracking execution progress.

---

# Objectives

- Create and assign work items
- Track status and progress
- Organize tasks into structures
- Link tasks to planning artifacts

---

# Responsibilities

Task module is responsible for:

- Task creation, update, deletion
- Task assignment
- Task status and priority
- Task hierarchy (subtasks)
- Task labels and types
- Task dependencies

Task module is NOT responsible for:

- Time tracking (Future)
- Iteration planning (Planning module)
- Reporting (Reporting module)
- File storage (Documents module)

---

# Domain Model

Entities

- Task
- TaskStatus
- TaskLabel
- TaskType

---

# Task

Represents a unit of work.

| Field        | Type     | Required | Description                |
| ------------ | -------- | -------- | -------------------------- |
| id           | UUID     | Yes      | Primary identifier         |
| projectId    | UUID     | Yes      | Owning project             |
| title        | String   | Yes      | Task title                 |
| description  | String?  | No       | Rich text description      |
| statusId     | UUID     | Yes      | Workflow status            |
| assigneeId   | UUID?    | No       | Assigned user              |
| reporterId   | UUID?    | No       | Creator                    |
| priority     | Enum     | Yes      | Low, Medium, High, Urgent  |
| typeId       | UUID?    | No       | Task type                  |
| parentId     | UUID?    | No       | Parent task for subtasks   |
| dueDate      | DateTime | No       | Due date                   |
| order        | Integer  | Yes      | Board ordering             |
| createdAt    | DateTime | Yes      | Creation timestamp         |
| updatedAt    | DateTime | Yes      | Last update timestamp      |

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

Default statuses: To Do, In Progress, Done.

---

# TaskLabel

| Field     | Type    | Required | Description        |
| --------- | ------- | -------- | ------------------ |
| id        | UUID    | Yes      | Primary identifier |
| projectId | UUID    | Yes      | Owning project     |
| name      | String  | Yes      | Label name         |
| color     | String? | No       | Display color      |

---

# TaskType

| Field     | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| id        | UUID   | Yes      | Primary identifier |
| projectId | UUID   | Yes      | Owning project     |
| name      | String | Yes      | Type name          |

Default types: Bug, Feature, Task, Epic.

---

# Features

## Task CRUD

- Create, read, update, delete tasks
- Inline editing

## Assignment

- Assign one user
- Reassign

## Subtasks

- Nest tasks under a parent
- Roll up progress

## Board View

- Kanban columns by status
- Drag and drop ordering

## List View

- Filterable, sortable list

## Filtering

- By status, assignee, label, type, priority, due date

---

# API Endpoints

```http
GET    /projects/:projectId/tasks
POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks/:id
PATCH  /projects/:projectId/tasks/:id
DELETE /projects/:projectId/tasks/:id
```

---

# Permissions

- task:view
- task:create
- task:update
- task:delete

---

# UI Screens

- Board view
- List view
- Task detail (drawer or page)

---

# Out of Scope

- Time tracking
- Gantt charts (Planning module)
- Capacity planning
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
- Notification (for mentions and assignments)

---

# Acceptance Criteria

- Tasks can be created within a project
- Tasks can be assigned to project members
- Tasks move through statuses
- Subtasks roll up to parent
- Board and list views are available
