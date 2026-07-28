# ADR 0002: Monorepo with pnpm workspaces + Turborepo

Date: 2025-01-01
Status: Accepted

---

# Context

The product has a React web app, a Hono API, and shared domain logic (types, zod schemas, Drizzle schema, enums). Code must be shared without publishing packages.

# Decision

Use a single Git repository with pnpm workspaces and Turborepo. Apps live under `apps/`, shared code under `packages/`. Internal packages use the `@pmin/*` scope.

# Consequences

Shared code changes are available everywhere instantly. One CI pipeline. One set of dependency versions. Cross-app type safety end to end.

# Alternatives

- Polyrepo. Rejected: duplicate types, version drift, slower sharing.
- npm workspaces. Rejected: slower installs than pnpm.
