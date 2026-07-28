# Meeting Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation

---

# Overview

The Meeting module records meetings related to a project.

It captures agendas, notes, decisions, and action items.

The module does not provide video conferencing.

---

# Objectives

- Schedule and document meetings
- Capture agendas and outcomes
- Track action items
- Link meetings to tasks and documents

---

# Responsibilities

Meeting module is responsible for:

- Meeting records
- Agendas
- Notes (minutes)
- Decisions
- Action items

Meeting module is NOT responsible for:

- Video conferencing
- Calendar integration (Future)
- Task execution (Task module)

---

# Domain Model

Entities

- Meeting
- ActionItem

---

# Meeting

| Field        | Type     | Required | Description                                  |
| ------------ | -------- | -------- | -------------------------------------------- |
| id           | UUID     | Yes      | Primary identifier                           |
| projectId    | UUID     | Yes      | Owning project                               |
| title        | String   | Yes      | Meeting title                                |
| type         | Enum?    | No       | Standup, Review, Planning, Client, Other     |
| scheduledAt  | DateTime | Yes      | Scheduled time                               |
| duration     | Integer? | No       | Minutes                                      |
| location     | String?  | No       | Link or place                                |
| agenda       | JSON     | No       | Agenda items                                 |
| notes        | JSON     | No       | Minutes (rich text)                          |
| status       | Enum     | Yes      | Scheduled, Completed, Cancelled              |
| createdBy    | UUID     | Yes      | Organizer                                    |
| createdAt    | DateTime | Yes      | Creation timestamp                           |
| updatedAt    | DateTime | Yes      | Last update timestamp                        |

---

# ActionItem

An outcome of a meeting that becomes trackable work.

| Field        | Type     | Required | Description                |
| ------------ | -------- | -------- | -------------------------- |
| id           | UUID     | Yes      | Primary identifier         |
| meetingId    | UUID     | Yes      | Source meeting             |
| taskId       | UUID?    | No       | Linked task (optional)     |
| assigneeId   | UUID?    | No       | Responsible user           |
| description  | String   | Yes      | What to do                 |
| done         | Boolean  | Yes      | Completion flag            |
| dueDate      | DateTime | No       | Due date                   |

---

# Features

## Schedule

- Create meetings
- Set type, time, location

## Agenda

- Define agenda items
- Reorder

## Notes

- Capture minutes during or after the meeting
- Rich text

## Action Items

- Record follow-ups
- Convert action items to tasks
- Assign and track

## Participants

- Link project members as participants

---

# API Endpoints

```http
GET    /projects/:projectId/meetings
POST   /projects/:projectId/meetings
GET    /projects/:projectId/meetings/:id
PATCH  /projects/:projectId/meetings/:id
DELETE /projects/:projectId/meetings/:id
POST   /projects/:projectId/meetings/:id/action-items
```

---

# Permissions

- meeting:view
- meeting:create
- meeting:update
- meeting:delete

---

# UI Screens

- Meeting list
- Meeting detail (agenda, notes, action items)

---

# Out of Scope

- Video and audio calls
- Calendar sync (Google, Outlook)
- Automatic transcription (Future, AI)

---

# Future Enhancements

- Calendar integration
- AI meeting summary (AI add-on)
- Recording attachments

---

# Dependencies

- Foundation
- Task (for action item conversion)
- Notification

---

# Acceptance Criteria

- Meetings can be scheduled
- Agendas and notes can be captured
- Action items can be created and converted to tasks
- Meeting history is preserved
