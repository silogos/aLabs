# ADR 0009: Slug-based shareable web URLs

Date: 2026-09-10
Status: Accepted

---

# Context

Since ADR 0008 the web app has flat view URLs (`/dashboard` … `/agreements`) with no tenant in the path — the active org/project lives in `AppProvider` state backed by localStorage, so links are not shareable: pasting `/tasks` to a teammate opens *their* last project, not yours. The data model already has `organizations.slug` (globally unique) and `projects.slug` (unique per org), and the API returns both in the org/project lists the client already fetches. ADR 0007 and `foundation/04-plans-workspaces.md` deliberately keep a UUID routing spine on the API so renames never break scoping.

# Decision

Web URLs become GitLab-style and tenant-addressable, resolved client-side in `AppProvider` (URL-first, mirrored into the existing localStorage prefs — the provider remains the single tenant store):

- `/` — user dashboard (post-login landing): recents + orgs with their projects
- `/tasks`, `/projects`, `/orgs` — user-level pages (my tasks, all projects, all orgs)
- `/{orgSlug}` — org overview; `/{orgSlug}/activity|projects|members|settings|billing` — org pages
- `/{orgSlug}/{projectSlug}/dashboard|tasks|documents|planning|meetings|reports|agreements|settings` — project views
- `/{orgSlug}/{projectSlug}/tasks/{taskNumber}` — task deep link: renders the board with the detail drawer open (the drawer's open task is derived from the URL, so links are shareable and browser back closes it; `{taskNumber}` is the per-project serial, `KEY-NN`)
- `/user` (profile) and `/notifications` stay flat: user-scoped, not tenant-scoped

Route tree: one `[orgSlug]` dynamic segment with `(org)` and `(project)` route groups nested inside it, plus a `(user)` group at the root. Org pages are 1–2 segments (static names win), project URLs are always exactly 3 segments, so the two subtrees never collide — even a project named `settings` resolves (`/acme/settings/dashboard`). The API is unchanged: it keeps the UUID spine (`/organizations/:organizationId/…`, `/projects/:projectId/…`) and `tenantContext`; slugs never reach it.

Stale slug handling (renamed project, no access, typo): the client only ever sees orgs/projects it can access, so "not in the list" covers both unknown and forbidden (the 404-not-403 rule, applied on the web side) — the provider redirects to `/` with a "Workspace/Project not found" toast. Project slugs remain editable; no redirect table is kept (deliberate scope cut — links with stale slugs degrade gracefully instead of following renames).

# Consequences

URLs are shareable and deep-linkable; switching project/org navigates to the new slug URL. localStorage becomes a mirror (for tenant-less surfaces `/`, `/user`, `/notifications`, `/tasks`, `/projects`, `/orgs` and reloads) rather than the source of truth. Reserved-word edges: an org slug equal to a static root (`login`, `register`, `forgot-password`, `reset-password`, `user`, `notifications`, `tasks`, `projects`, `orgs`, `api`, `uploads`) is unreachable at `/{slug}` because static routes win; and bare 2-segment project URLs (`/{org}/{project}`) are permanently unavailable for slugs that collide with org page names (`activity`, `projects`, `members`, `settings`, `billing`) — project URLs always carry the view segment. Renaming a project slug orphans previously shared links (they fall back to `/` with a toast).

# Alternatives

- Keep flat URLs + a share mechanism (e.g. `?project=` query). Rejected: not memorable, not RESTful, duplicates the tenant concept.
- Server-side slug resolution with slug-based API routes. Rejected for now: the app is fully client-rendered with the org/project lists already on the client; the UUID spine keeps API-side tenant resolution and permissions untouched.
- Slug redirect table (old slug → new slug). Deferred: schema + API + resolution work for marginal benefit; graceful fallback covers the failure mode.
