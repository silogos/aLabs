# Foundation

Version: 1.0.0
Status: Draft
Priority: Critical
Depends On:
- Product

---

# Purpose

Foundation provides the shared infrastructure and business entities required by every module.

Every future module depends on Foundation.

Foundation is intentionally small and stable.

---

# Included Domains

Identity

Workspace

Project

---

# Identity

Responsible for

- Authentication
- Session
- User Profile

---

# Workspace

Responsible for

- Organization
- Members
- Invitations
- Roles
- Permissions

---

# Project

Responsible for

- Project
- Project Members
- Project Settings

---

# Relationships

User

↓

Organization

↓

Project

↓

Business Modules

---

# Business Modules

Modules are the business capabilities layered on Foundation.

The authoritative list and their dependencies live in `docs/modules/00-modules.md`.

---

# Foundation Principles

Every user belongs to zero or more organizations.

Every organization owns one or more projects.

Every project belongs to exactly one organization.

Every project-scoped module belongs to one project. Notification, Billing, and AI are cross-cutting or organization-scoped.

---

# Multi Tenancy

The platform supports multiple organizations.

Users may belong to multiple organizations.

Organizations are isolated.

Projects cannot belong to multiple organizations.

---

# Permission Model

Workspace Roles

↓

Project Roles

↓

Permissions

Permission checks should always be role-based.

---

# Deliverables

Identity

Workspace

Project

Everything else is outside Foundation.

---

# Out of Scope

All business modules. Foundation implements only Identity, Workspace, and Project.

See `docs/modules/00-modules.md`.
