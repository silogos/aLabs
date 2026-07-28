# Client Portal Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation
- Task
- Documents
- Reporting

---

# Overview

The Client Portal gives external clients controlled visibility into a project.

It is a key differentiator of the platform.

The portal is a restricted view of project data, not a second product.

---

# Objectives

- Share project progress with clients
- Share selected documents
- Collect client feedback
- Maintain a professional client experience

---

# Responsibilities

Client Portal module is responsible for:

- Client users and access
- Shared views (filtered tasks, milestones, reports)
- Client feedback and comments
- Public sharing links

Client Portal module is NOT responsible for:

- Internal task management (Task module)
- Full document editing (Documents module)
- Billing (Billing module)

---

# Domain Model

Entities

- ClientUser
- ClientShare

---

# ClientUser

An external user invited to a project's portal.

| Field      | Type     | Required | Description                       |
| ---------- | -------- | -------- | --------------------------------- |
| id         | UUID     | Yes      | Primary identifier                |
| projectId  | UUID     | Yes      | Owning project                    |
| email      | String   | Yes      | Client email                      |
| name       | String   | Yes      | Client name                       |
| status     | Enum     | Yes      | Invited, Active, Disabled         |
| createdAt  | DateTime | Yes      | Creation timestamp                |

---

# ClientShare

Controls what a client can see.

| Field      | Type    | Required | Description                                  |
| ---------- | ------- | -------- | -------------------------------------------- |
| id         | UUID    | Yes      | Primary identifier                           |
| projectId  | UUID    | Yes      | Owning project                               |
| resource   | Enum    | Yes      | Tasks, Milestones, Reports, Documents        |
| visible    | Boolean | Yes      | Visibility flag                              |

---

# Features

## Client Access

- Invite clients by email
- Clients access a branded portal

## Shared Views

- Toggle which modules clients can see
- Share milestones and progress
- Share selected documents

## Feedback

- Clients comment on shared items
- Internal team responds

## Public Links (Future)

- Read-only shareable links

---

# API Endpoints

Internal management endpoints:

```http
GET    /projects/:projectId/portal/clients
POST   /projects/:projectId/portal/clients
PATCH  /projects/:projectId/portal/clients/:id
GET    /projects/:projectId/portal/shares
PATCH  /projects/:projectId/portal/shares
```

Client-facing endpoints (separate auth scope):

```http
GET /portal/projects/:projectId/overview
GET /portal/projects/:projectId/milestones
```

---

# Permissions

- portal:manage (internal role)
- portal:view (client role)

---

# UI Screens

- Internal: client management
- External: client portal view

---

# Out of Scope

- Client task editing
- Client document authoring
- White-label branding (Enterprise tier)

---

# Future Enhancements

- Public share links
- White-labeling (Enterprise)
- Client-side agreement acceptance

---

# Dependencies

- Foundation
- Task
- Documents
- Reporting

---

# Acceptance Criteria

- Clients can be invited to a project portal
- Internal team controls what clients see
- Clients can view shared progress and documents
- Clients can leave feedback
