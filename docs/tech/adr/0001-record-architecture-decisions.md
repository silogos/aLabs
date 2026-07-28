# ADR 0001: Record architecture decisions

Date: 2025-01-01
Status: Accepted

---

# Context

The platform is built partly with AI assistance. Without a record of why choices were made, decisions get relitigated on every session and the codebase drifts.

# Decision

Keep ADRs in `docs/tech/adr/`. One decision per file. Sequential numbering. Immutable once Accepted.

# Consequences

Decisions are traceable. New engineers and AI agents read ADRs instead of guessing.

# Alternatives

- Document decisions in commit messages only. Rejected: hard to find.
- Do not record decisions. Rejected: causes drift.
