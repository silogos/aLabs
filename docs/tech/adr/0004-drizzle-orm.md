# ADR 0004: Drizzle as the ORM

Date: 2025-01-01
Status: Accepted

---

# Context

The data model is relational and multi-tenant with strict scoping. We want SQL-level control and type safety without hiding the database.

# Decision

Use Drizzle ORM. Schemas live in `@pmin/core`. Migrations run via Drizzle Kit.

# Consequences

SQL-first, predictable queries, full type safety. Manual control over indexes and constraints, which matters for tenant-scoped queries.

# Alternatives

- Prisma. Rejected: heavier runtime, generated client friction, less SQL transparency.
- Raw SQL / query builder only. Rejected: loses end-to-end typing.
