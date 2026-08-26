# ADR 0008: Next.js App Router as the single web deployment

Date: 2026-08-23
Status: Accepted

---

# Context

The prototype shipped as two deployables — a Vite SPA (`apps/web`) and a standalone Hono server (`apps/api`) — joined by a dev-proxy and credentialed CORS. The SPA had no URLs (view state in React state + localStorage), no auth screens despite the auth APIs existing, and the two-service split made cookies, OAuth redirects, and Docker wiring harder than the product warranted. The frontend framework was never captured in an ADR, only named in `01-architecture.md`.

# Decision

Rebuild `apps/web` on Next.js (App Router) and deploy one process: the Hono app from `@pmin/api` (now a library package at `packages/api`) is mounted in-process by a catch-all route handler that strips the `/api` prefix. The UI keeps its client-side architecture (React Query, client components, the existing hand-written CSS) — routes render client-only behind a mounted gate because the app state (localStorage prefs, mutable tasks store) assumes a browser. Views get real URLs (`/dashboard` … `/agreements`); auth screens from `designs/auth/` ship at `/login`, `/register`, `/forgot-password`, `/reset-password` behind a session-cookie gate (`proxy.ts`).

# Consequences

One origin, one port (3000), one Docker service — cookies and OAuth redirects are same-origin by construction; CORS is gone. The API keeps its own module structure and can still run standalone (`packages/api` serves via tsx) for debugging. Server-rendering is not yet exploited (no RSC data fetching) — that stays open as a follow-up. In-memory store semantics are unchanged: the seed re-runs on server restart, which remains acceptable until Postgres lands.

# Alternatives

- Keep the Vite SPA + separate API. Rejected: two services to run and wire for no product benefit at this stage.
- Rewrite the UI as server components now. Rejected: the interactive, client-fetched views would turn a refactor into a rewrite; deferred deliberately.
- Next.js with the API kept as a sibling service behind rewrites. Rejected: keeps the proxy/cookie machinery this decision exists to remove.
