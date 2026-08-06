# Architecture Decision Records

Version: 1.0.0

---

# Purpose

ADRs capture WHY a technical decision was made, so the team and AI tooling do not relitigate settled choices.

Each ADR is immutable once Accepted. A superseded decision gets a new ADR that references the old one.

---

# Format

```text
# ADR 000X: Title
Date: YYYY-MM-DD
Status: Accepted

# Context
Why this decision is being made now.

# Decision
What we decided.

# Consequences
What follows from the decision.

# Alternatives
What else was considered and rejected.
```

---

# Index

| #   | Decision                                       |
| --- | ---------------------------------------------- |
| 0001| Record architecture decisions                  |
| 0002| Monorepo with pnpm workspaces + Turborepo      |
| 0003| Hono as the HTTP backend                       |
| 0004| Drizzle as the ORM                             |
| 0005| Better Auth for authentication                 |
| 0006| AI is an isolated, optional add-on             |
| 0007| Personal workspaces as single-member orgs       |
