# ADR 0006: AI is an isolated, optional add-on

Date: 2025-01-01
Status: Accepted

---

# Context

A core product principle is "AI Optional": every feature must work without AI, and AI is a paid enhancement. If AI leaks into core domain logic, disabling it breaks the product.

# Decision

Treat AI as a separate module that depends on other modules only in a read-only way. AI endpoints return drafts that are never persisted without human review. No core module imports AI code.

# Consequences

The platform runs fully with AI disabled. AI compute cost is isolated to the add-on. Core modules stay free of provider coupling.

# Alternatives

- Embed AI in each module. Rejected: violates the principle and couples every module to a provider.
- Central AI service that mutates state. Rejected: removes the human-review gate.
