# Glossary

Version: 1.0.0
Status: Draft

---

# Purpose

A shared vocabulary so product, domain, and engineering docs do not conflate concepts.

---

# Foundation

- **User** — a person who can access the platform. Global; may join many organizations. Owned by Better Auth.
- **Session** — an authenticated login session. Managed by Better Auth.
- **Account** — an authentication provider account. Managed by Better Auth. No business logic depends on it.

- **Organization** — the tenant boundary. Owns projects. Fully isolated.
- **Workspace** — synonym for the Organization context (roles, members, invitations).
- **Member (Organization Member)** — a user's membership in an organization.
- **Invitation** — a pending offer for a user to join an organization by email.
- **Role** — a set of permissions. Has a scope: **Workspace Role** or **Project Role**.
- **Permission** — a capability key in the form `<module>:<action>`.

- **Project** — a unit of work inside an organization. The container that scopes modules.
- **Project Member** — an organization member added to a project with a project role.
- **Tenant** — the active organization or project context of a request.

---

# Modules

- **Task** — a unit of work in a project.
- **TaskStatus** — a workflow state of a task (project-defined).
- **Space** — a top-level container for document pages.
- **Page** — a document. Rich text stored as a block model.
- **Block** — one node in a page's content (paragraph, heading, list, etc.).
- **File** — an uploaded attachment.
- **Iteration** — a fixed-length working period containing tasks.
- **Milestone** — a significant project checkpoint.
- **Meeting** — a recorded meeting with agenda, notes, and action items.
- **Action Item** — a trackable outcome of a meeting; may convert to a Task.
- **Agreement** — a contract, SOW, NDA, or proposal linked to a project.
- **ClientUser** — an external user invited to a project's client portal.
- **ClientShare** — a visibility rule controlling what clients see.
- **Notification** — an in-app or email message to a user about an event.
- **Plan** — a billing tier (Free, Professional, Enterprise).
- **Subscription** — an organization's active plan.
- **Invoice** — a billing record.

---

# Technical

- **TenantContext** — the request middleware that resolves and verifies the active tenant and attaches it to the request.
- **Effective Permission** — the union of a user's workspace-role and project-role permissions.
- **Soft Delete** — marking a row deleted via `deleted_at` without removing it.
- **Cursor** — an opaque token encoding position for pagination.
- **Core (`@pmin/core`)** — the shared package holding types, zod schemas, Drizzle schema, and enums.
- **Foundation** — the Identity, Workspace, and Project domains that every module depends on.
- **Module** — a business capability layered on Foundation.
- **AI Add-on** — the optional, paid AI layer. Never required; output always requires human review.
