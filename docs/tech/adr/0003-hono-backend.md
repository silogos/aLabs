# ADR 0003: Hono as the HTTP backend

Date: 2025-01-01
Status: Accepted

---

# Context

The API needs to run anywhere via Docker, including edge-like and low-resource self-hosted environments, while staying simple to reason about.

# Decision

Use Hono for the HTTP layer. Keep the system a modular monolith, not microservices.

# Consequences

Lightweight runtime, fast cold starts, portable. A single codebase to test and deploy. The module-folder convention keeps the monolith from becoming a ball of mud.

# Alternatives

- NestJS. Rejected: heavier, more opinionated than needed.
- Express. Rejected: older middleware model, weaker typing story.
- Microservices. Rejected: operational overhead unjustified at this stage.
