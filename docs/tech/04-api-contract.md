# API Contract

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Conventions
- Data Model

---

# Purpose

The REST contract. Use this when generating route handlers, zod schemas, and client code.

Conventions (auth, tenant, pagination, errors) are defined once here and apply to every route.

---

# Transport

- JSON over HTTPS.
- `Content-Type: application/json` for request and response bodies.
- Date and UUID values are strings (ISO 8601 / canonical).

---

# Authentication

Every route except `/auth/*` requires a valid Better Auth session.

- Missing or invalid session → `401 unauthorized`.
- Authenticated but lacking permission → `403 forbidden`.

---

# Tenant Resolution

Tenant-scoped routes include the tenant in the path:

- Organization-scoped: `/organizations/:organizationId/...`
- Project-scoped: `/projects/:projectId/...`

The `tenantContext` middleware verifies the caller is a member of that tenant and attaches it to the request. A resource outside the caller's tenant returns `404 not_found` (never `403`, to avoid leaking existence).

---

# Standard Response Shapes

## Single resource

```json
{ "data": { "id": "string", "...": "..." } }
```

## List (paginated)

```json
{
  "items": [],
  "nextCursor": "string | null",
  "hasMore": false
}
```

## Error

```json
{ "error": { "code": "string", "message": "string", "details": {} } }
```

See `02-conventions.md` for the full status-code table.

---

# Pagination

Query parameters:

| Param  | Default | Max | Notes                       |
| ------ | ------- | --- | --------------------------- |
| limit  | 25      | 100 | Page size                   |
| cursor | null    | —   | Opaque `nextCursor` value   |

---

# Exemplar: Task

All project-scoped resources follow this exact pattern.

## List tasks

```http
GET /projects/:projectId/tasks?statusId=&assigneeId=&limit=25&cursor=
```

200

```json
{
  "items": [
    { "id": "...", "title": "...", "statusId": "...", "priority": "medium" }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

Filters: `statusId`, `assigneeId`, `labelId`, `typeId`, `priority`, `iterationId`, `q` (title search).

## Create task

```http
POST /projects/:projectId/tasks
```

Request (validated by zod)

```json
{
  "title": "Implement login",
  "description": "Optional",
  "statusId": "...",
  "priority": "medium",
  "assigneeId": null,
  "typeId": null,
  "parentId": null,
  "dueDate": null
}
```

201 — returns `{ data: Task }`.

400 `validation_error` on invalid input. 409 `conflict` on duplicate.

## Get task

```http
GET /projects/:projectId/tasks/:taskId
```

200 `{ data: Task }`. 404 if not in tenant.

## Update task

```http
PATCH /projects/:projectId/tasks/:taskId
```

Request is a partial Task. Send `updatedAt` for optimistic concurrency.

200 `{ data: Task }`. 409 `conflict` if `updatedAt` mismatches.

## Delete task

```http
DELETE /projects/:projectId/tasks/:taskId
```

204 no content. Soft-deletes (sets `deleted_at`).

## Permissions

| Action | Required key |
| ------ | ------------ |
| List / Get | `task:view` |
| Create | `task:create` |
| Update | `task:update` |
| Delete | `task:delete` |

---

# Route Catalog

Tenant prefix abbreviations: `Org = /organizations/:organizationId`, `Prj = /projects/:projectId`.

## Auth (Better Auth)

```http
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

## Organization

```http
GET    /organizations
POST   /organizations
GET    /organizations/:organizationId
PATCH  /organizations/:organizationId

GET    Org/members
POST   Org/members
PATCH  Org/members/:id
DELETE Org/members/:id

POST   Org/invitations
GET    Org/invitations
PATCH  Org/invitations/:id          (accept / cancel)
```

## Project

```http
GET    Org/projects
POST   Org/projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId

GET    Prj/members
POST   Prj/members
PATCH  Prj/members/:id
DELETE Prj/members/:id
```

## Task

```http
GET    Prj/tasks
POST   Prj/tasks
GET    Prj/tasks/:id
PATCH  Prj/tasks/:id
DELETE Prj/tasks/:id

GET    Prj/tasks/statuses
POST   Prj/tasks/statuses
GET    Prj/tasks/labels
POST   Prj/tasks/labels
GET    Prj/tasks/types
POST   Prj/tasks/types
```

## Documents

```http
GET    Prj/documents/spaces
POST   Prj/documents/spaces
GET    Prj/documents/pages
POST   Prj/documents/pages
GET    Prj/documents/pages/:id
PATCH  Prj/documents/pages/:id
DELETE Prj/documents/pages/:id
GET    Prj/documents/pages/:id/revisions
POST   Prj/documents/files
GET    Prj/documents/search
```

## Planning

```http
GET    Prj/planning/iterations
POST   Prj/planning/iterations
PATCH  Prj/planning/iterations/:id
GET    Prj/planning/milestones
POST   Prj/planning/milestones
PATCH  Prj/planning/milestones/:id
GET    Prj/planning/timeline
```

## Meeting

```http
GET    Prj/meetings
POST   Prj/meetings
GET    Prj/meetings/:id
PATCH  Prj/meetings/:id
DELETE Prj/meetings/:id
POST   Prj/meetings/:id/action-items
PATCH  Prj/action-items/:id
```

## Agreement

```http
GET    Prj/agreements
POST   Prj/agreements
GET    Prj/agreements/:id
PATCH  Prj/agreements/:id
DELETE Prj/agreements/:id
```

## Reporting

```http
GET    Prj/reporting/dashboard
GET    Prj/reporting/progress
GET    Prj/reporting/activity
GET    Prj/reporting/export?format=pdf|csv
```

## Client Portal (internal)

```http
GET    Prj/portal/clients
POST   Prj/portal/clients
PATCH  Prj/portal/clients/:id
GET    Prj/portal/shares
PATCH  Prj/portal/shares
```

## Client Portal (client-facing, separate auth scope)

```http
GET    /portal/projects/:projectId/overview
GET    /portal/projects/:projectId/milestones
```

## Notification

```http
GET    /notifications
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
GET    /notifications/preferences
PATCH  /notifications/preferences
```

## Billing

```http
GET    Org/billing/subscription
POST   Org/billing/checkout
POST   Org/billing/portal
GET    Org/billing/invoices
```

## AI (add-on)

```http
POST   Prj/ai/task-breakdown
POST   Prj/ai/meeting-summary
POST   Prj/ai/report-draft
POST   Prj/ai/document-improve
```

Every AI endpoint returns a draft; nothing is persisted.
