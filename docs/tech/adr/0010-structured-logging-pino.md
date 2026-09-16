# ADR 0010: Structured logging with pino

Date: 2026-09-16
Status: Accepted

---

# Context

Server-side diagnostics were scattered `console.log`/`console.error` calls plus Hono's plain-text `logger()` middleware — unstructured output that can't be filtered by level or parsed by tooling, and no shared place to add logging. The MVP go-live cleanup (#59, task 8) asked for structured logging with **no third-party service attached**.

# Decision

Use pino in `@pmin/api` only, behind one shared configured logger (`packages/api/src/lib/logger.ts`): JSON lines to stdout, level from `LOG_LEVEL` (debug outside production, info in production). A request-completion middleware in `app.ts` logs `method`/`path`/`status`/`duration_ms` per request; thrown errors are serialized under `err`. No transports, no hosted service — log shipping stays a deployment concern.

# Consequences

- Machine-parseable, level-filterable logs in every environment with zero vendor coupling.
- One import site and one convention for all API logging (Conventions → Logging).
- Raw JSON lines are less readable in a terminal; pipe through `npx pino-pretty` when you want formatted output.
- pino is a server-external package in the Next build (same stance as postgres/drizzle-orm).

# Alternatives

- Hosted log platform (Datadog, Logtail, …). Rejected for now: the vendor pick is explicitly deferred (#59 out-of-scope list).
- Hand-rolled JSON-line logger (as done for auth). Rejected: logging needs well-solved library machinery (levels, error serialization, redaction, performance) with no project-specific constraints pushing against a library.
- winston. Rejected: heavier API and callback-based transports; pino is the Node default for structured logging.
