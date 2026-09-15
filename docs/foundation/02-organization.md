# Organization Domain

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Product
- Foundation

---

# Overview

Organization represents a company, team, or business entity using the platform.

Organizations own Projects.

Users collaborate through Organizations.

---

# Objectives

Provide

- Multi-tenancy
- Member management
- Invitations
- Roles
- Permissions

---

# Entity Relationships

User

↓

Organization Member

↓

Organization

↓

Project

---

# Organization

Purpose

Represents a business.

Fields

- id
- name
- slug — globally unique; identifies the org in web URLs (`/{orgSlug}`, ADR 0009); immutable
- type (personal | team)
- logo
- description
- timezone
- language
- website
- createdAt
- updatedAt

Type

- personal — single-member workspace, auto-created at signup, no invites,
  capped at PERSONAL_PROJECT_LIMIT active projects (see Plans & Workspaces).
- team — multi-member workspace, created on demand, invites allowed, governed
  by the org's subscription plan.

---

# Member

Represents a user's membership inside an organization.

Fields

- id
- organizationId
- userId
- roleId
- status
- joinedAt

Status

- Pending
- Active
- Suspended

---

# Member Profile

The org-scoped view of a fellow member. Two surfaces share one payload:

- Quick-view drawer at `/{orgSlug}/members/{userId}` — opens over the members
  list (the task-drawer pattern); header action "Open profile" jumps to the
  full page. This is where notification actor links land.
- Full profile page at `/{orgSlug}/members/{userId}/profile` — GitLab-style
  two-column layout: identity card (large avatar, key facts) left, content
  sections (projects) right.

Visible to any active member of the org (no extra permission — a profile
click from a notification must never 403); outsiders get 404.

Fields

- the Member (user, workspace role, status, joinedAt)
- projects — the member's active project memberships in this org
  (id, name, slug, project role)

API: `GET /organizations/:organizationId/members/:userId/profile` — note the
param is a user id, unlike the membership-id routes for role changes and
removal.

---

# Invitation

Invite users using email.

Fields

- id
- organizationId
- email
- roleId
- token
- expiresAt
- status

Status

- Pending
- Accepted
- Expired
- Cancelled

---

# Role

Workspace-level roles.

Default Roles

- Owner
- Admin
- Project Manager
- Member
- Viewer

Future

Organizations can create custom roles.

---

# Permission

Permissions are assigned to Roles.

Examples

Organization

- organization:view
- organization:update
- organization:delete

Members

- member:view
- member:create
- member:update
- member:remove

Projects

- project:create
- project:update
- project:archive
- project:delete

---

# Organization Settings

General

Branding

Security

Members

Roles

Billing (Future)

Audit Logs (Future)

---

# User Stories

As a new user

I get a personal workspace automatically on signup.

As an Owner

I can create an organization (team workspace).

---

As an Owner

I can invite members.

---

As an Admin

I can manage members.

---

As a Member

I can participate in projects.

---

# Acceptance Criteria

Organization can be created.

Organization can be updated.

Members can be invited.

Members can accept invitations.

Roles can be assigned.

Permissions are validated before protected actions.

---

# Future Enhancements

Custom Roles

Groups

Departments

Teams

SSO

SCIM

Audit Logs

Organization Templates
