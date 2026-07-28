# Modules

Version: 1.0.0
Status: Draft

---

# Purpose

Modules are the business capabilities layered on top of Foundation.

Every module is scoped to a Project unless explicitly stated otherwise.

Foundation must exist before any module is built.

---

# Module List

| #  | Module        | Scope              | Status | Depends On                          |
| -- | ------------- | ------------------ | ------ | ----------------------------------- |
| 01 | Task          | Project            | Draft  | Foundation                          |
| 02 | Documents     | Project            | Draft  | Foundation                          |
| 03 | Planning      | Project            | Draft  | Foundation, Task                    |
| 04 | Meeting       | Project            | Draft  | Foundation                          |
| 05 | Agreement     | Project            | Draft  | Foundation, Documents               |
| 06 | Reporting     | Project            | Draft  | Foundation, Task, Planning, Meeting |
| 07 | Client Portal | Project (external) | Draft  | Foundation, Task, Documents, Reporting |
| 08 | Notification  | Cross-cutting      | Draft  | Foundation                          |
| 09 | Billing       | Organization       | Draft  | Foundation, Organization            |
| 10 | AI            | Cross-cutting      | Draft  | Business Modules                    |

---

# Scoping Rules

- Project-scoped modules require a projectId.
- Organization-scoped modules require an organizationId.
- Cross-cutting modules operate across projects and organizations.

---

# Permission Convention

Each module exposes permission keys in the form:

```text
<module>:<action>
```

Examples

- task:create
- document:update
- meeting:delete

Permissions are assigned to Workspace Roles and Project Roles.

---

# Module Independence

Each module is independently maintainable.

A module may depend on Foundation and other modules, but modules must avoid circular dependencies.

AI never blocks a module workflow.

---

# Out of Scope

Modules do NOT implement Foundation concerns:

- Authentication
- Organization
- Project
- Roles
- Permissions
