# Project Domain

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Product
- Foundation

---

# Overview

The Project domain represents a unit of work inside an Organization.

Organizations own Projects.

Projects own all business modules (Task, Documents, Planning, and so on).

A Project is the container that scopes every other module's data.

---

# Objectives

Provide:

- Project lifecycle
- Project membership
- Project roles and permissions
- Project settings

---

# Entity Relationships

Organization

↓

Project

↓

Project Member

↓

Business Modules

---

# Project

Represents a project.

Fields

- id
- organizationId
- name
- slug
- key
- description
- icon
- status
- visibility
- createdAt
- updatedAt

Status

- Active
- On Hold
- Archived

Visibility

- Organization (visible to organization members)
- Private (visible to project members only)

`key` is a short prefix used for human-readable task identifiers (for example `PROJ-123`). It is unique within an organization.

---

# Project Member

Represents a user's membership inside a project.

Fields

- id
- projectId
- userId
- roleId
- status
- joinedAt

Status

- Active
- Suspended

Only organization members can become project members.

---

# Project Role

Project-level roles.

Default Roles

- Project Admin
- Project Manager
- Member
- Viewer

Future

Organizations can create custom project roles.

---

# Permission

Project permissions are assigned to Project Roles.

Permission checks follow the model:

```text
Workspace Roles → Project Roles → Permissions
```

Examples (project scope)

- project:view
- project:update
- project:archive
- project:delete
- project:manage-members
- task:create
- document:update

A user's effective permission is the union of their workspace role and their project role.

---

# Project Settings

General

- Name
- Description
- Icon
- Key
- Status

Modules

- Enable or disable business modules per project

Danger Zone

- Archive
- Delete

---

# Project Hierarchy

Every business module belongs to exactly one project.

Business modules

- Task
- Documents
- Planning
- Meeting
- Agreement
- Reporting
- Client Portal

Notification, Billing, and AI are cross-cutting or organization-scoped and do not belong to a single project.

---

# User Stories

As an Organization Owner

I can create a project.

---

As a Project Admin

I can manage project members.

---

As a Project Manager

I can configure project settings.

---

As a Member

I can contribute to project modules.

---

# Features

## Create Project

- Create within an organization
- Auto-generate slug and key

## Project Members

- Add organization members to a project
- Assign project roles
- Remove members

## Archive and Delete

- Archive inactive projects
- Permanently delete with confirmation

## Settings

- Update project details
- Toggle module availability

---

# API Endpoints

```http
GET    /organizations/:organizationId/projects
POST   /organizations/:organizationId/projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
GET    /projects/:projectId/members
POST   /projects/:projectId/members
PATCH  /projects/:projectId/members/:id
DELETE /projects/:projectId/members/:id
```

---

# UI Screens

- Project list (within organization)
- Project creation
- Project dashboard
- Project settings

---

# Out of Scope

This domain does NOT implement:

- Task
- Documents
- Planning
- Any other business module
- Billing (organization-level)

---

# Future Enhancements

- Custom project roles
- Project templates
- Project duplication
- Module-level enablement defaults

---

# Dependencies

- Foundation
- Organization

---

# Acceptance Criteria

- Projects can be created within an organization.
- Projects can be updated and archived.
- Organization members can be added as project members.
- Project roles control access to project modules.
- Every business module is scoped to a project.
