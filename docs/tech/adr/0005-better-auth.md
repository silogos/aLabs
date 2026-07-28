# ADR 0005: Better Auth for authentication

Date: 2025-01-01
Status: Accepted

---

# Context

MVP authentication is email and password with sessions. The product later needs OAuth, SSO, and 2FA for Enterprise. We want to avoid a managed auth vendor and keep data self-hostable.

# Decision

Use Better Auth. It owns `users`, `sessions`, `accounts`, `verifications`. Domain code references `users.id` and layers workspace, project, and role logic on top.

# Consequences

No managed vendor lock-in. Self-hosted from day one. Sessions and provider accounts handled for us. Future SSO and OAuth are configuration, not rewrites.

# Alternatives

- Auth0 / Clerk. Rejected: per-user pricing conflicts with our seat-free model and breaks self-hosting.
- Hand-rolled auth. Rejected: security risk and rework when SSO arrives.
