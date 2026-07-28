# Agreement Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation
- Documents

---

# Overview

The Agreement module manages client contracts, statements of work, and formal project agreements.

It supports the platform's client-transparency differentiator.

---

# Objectives

- Store and organize agreements
- Track agreement status and lifecycle
- Link agreements to projects and clients
- Attach supporting documents

---

# Responsibilities

Agreement module is responsible for:

- Agreement records
- Agreement status lifecycle
- Agreement parties (client, provider)
- Linking agreements to documents

Agreement module is NOT responsible for:

- E-signature (Future or integration)
- Billing and invoicing (Billing module)
- Legal document generation

---

# Domain Model

Entities

- Agreement

---

# Agreement

| Field         | Type     | Required | Description                                  |
| ------------- | -------- | -------- | -------------------------------------------- |
| id            | UUID     | Yes      | Primary identifier                           |
| projectId     | UUID     | Yes      | Owning project                               |
| title         | String   | Yes      | Agreement title                              |
| type          | Enum?    | No       | SOW, NDA, Contract, Proposal, Other          |
| status        | Enum     | Yes      | Draft, Sent, Accepted, Rejected, Expired     |
| counterparty  | String   | Yes      | Client or party name                         |
| value         | Decimal? | No       | Agreement value                              |
| currency      | String?  | No       | Currency code                                |
| startDate     | DateTime | No       | Effective date                               |
| endDate       | DateTime | No       | Expiry date                                  |
| signedAt      | DateTime | No       | Acceptance date                              |
| createdBy     | UUID     | Yes      | Author                                       |
| createdAt     | DateTime | Yes      | Creation timestamp                           |
| updatedAt     | DateTime | Yes      | Last update timestamp                        |

---

# Features

## Agreement CRUD

- Create, edit, archive agreements

## Lifecycle

- Move agreements through status states
- Record acceptance

## Attachments

- Attach contract documents (from Documents module)

## Linking

- Link agreement to project and client

---

# API Endpoints

```http
GET    /projects/:projectId/agreements
POST   /projects/:projectId/agreements
GET    /projects/:projectId/agreements/:id
PATCH  /projects/:projectId/agreements/:id
DELETE /projects/:projectId/agreements/:id
```

---

# Permissions

- agreement:view
- agreement:create
- agreement:update
- agreement:delete

---

# UI Screens

- Agreement list
- Agreement detail

---

# Out of Scope

- E-signature processing
- Payment collection
- Template-based document generation

---

# Future Enhancements

- E-signature integration
- Agreement templates
- Renewal reminders
- Client-side acceptance via Client Portal

---

# Dependencies

- Foundation
- Documents
- Client Portal (for client acceptance)

---

# Acceptance Criteria

- Agreements can be created and organized
- Agreement status lifecycle is tracked
- Supporting documents can be attached
- Agreements are linked to a project
