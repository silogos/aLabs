# Workspace switcher & mobile nav — plan

> **Status:** draft (Plan mode). Review/edit this file, then hand off to Design mode to build.
> **Scope:** prototype only — `designs/app/alabs-app.html`. No backend/code changes in this pass.
> **One line:** split the single unified org/project switcher into two scope-appropriate switchers, make both scale-ready (search + recents), and rebuild the mobile menu so it isn't a flat dump of every project + nav item.

---

## 1. Background — what exists today (grounded in the file)

- **Desktop switcher is *unified*.** `#switch-modal` (560px) is a two-column grid: Organization list (left) → that org's Projects (right). Two entry points: the rail pill `#proj-switch`, and `data-acct-switch` inside the account modal.
- **Mobile menu is a flat dump.** `buildMobileNav()` renders, in one scroll: a "Project" label + **all projects cross-org** (ignores org boundaries) → **cloned nav groups** (Overview / Workspace / Collaboration / Settings ≈ 10 items) → "Account" + Sign out. Today that's ~16 items; with 15 projects + 6 orgs it's ~30+.
- **Org switching on mobile is invisible** — it only happens via Account → switcher, which is buried at the bottom of that long scroll.
- **Data model is already correct.** `ORGS[].defaultProj` + `PROJECTS[].org` exist; the org→project link is real (matches `schema.ts`'s `organizationId` index). No recents / pinned / search concept anywhere yet.
- **Real app already has `apps/web/src/components/CommandPalette.tsx`** (⌘K) — long-term convergence target, out of scope for this prototype pass.

## 2. Decisions locked (from our conversation)

1. **Separate org switcher and project switcher.** They have different frequencies and belong in different places.
   - **Project switcher = frequent (many×/day)** → fast path, stays in the rail.
   - **Org switcher = rare (≈weekly) / identity context** → lives near sign-out, inside the account modal.
2. **Search + recents** are the answer to "what happens when there are too many." A flat list breaks at ~8 projects / ~6 orgs; search + a recents row scales it to 100+ gracefully.
3. **Mobile menu must stop being a flat dump.** Switching should be a deliberate action, not a wall of list rows.

## 3. Design — Desktop

### 3a. Project switcher (frequent)
- **Entry points:** rail pill `#proj-switch` (fast) **+** keep one inside the account/menu area for discoverability.
- **Scope:** **this org's projects only** — no org column (that's the whole point of separating).
- **Layout (replaces `#switch-modal` two-column):** single list —
  - `🔍 Search projects` field (top)
  - **Recent** (top 3, with a subtle "Recent" label) — the 80% bounce-between-few case
  - **All projects in `<org name>`** (filtered live by search)
- **Selecting:** redirects to that project, stays within the current org.

### 3b. Org switcher (rare / identity)
- **Entry point:** inside the account modal, as "Switch workspace" (sits above Profile / Notifications / Appearance, near Sign out).
- **Scope:** all orgs. Selecting → `setOrg()` lands on that org's default project.
- **Layout:** `🔍 Search` + org list (only needs search if/when orgs ≥ ~6; see open Q2).
- **One nuance:** from the org switcher you may want to pick a *specific* project, not the default. Decision needed (open Q4): (a) org selection always lands on default project, full stop; or (b) selecting an org expands its projects inline so you can pick one.

## 4. Design — Mobile menu (the core of your latest ask)

**Problem:** today's sheet = projects + nav + account, all flat, ~16 rows today, ~30+ at scale.

**Three IA options — pick one (open Q1):**

| | What it is | Pros | Cons |
|---|---|---|---|
| **A — Scope-first (recommended)** | Sheet shows: a **current-context pill** (org + project) at top → **nav items only** (Overview/Workspace/Collaboration/Settings) → account. Project/org switching = a deliberate button that opens the **same** project/org switcher modal, centered over the sheet. | Matches desktop "switching is deliberate"; menu stays focused on daily navigation; **reuses the same switcher UI (DRY)**; shortest visible list. | Switching takes one extra tap. |
| **B — Collapsible sections** | Keep everything, but make Project / Org **accordions** (collapsed by default); nav always expanded. | Nothing removed; familiar pattern. | Just hides the problem; still a long sheet when expanded. |
| **C — Tabs** | Top tabs `[ Navigate | Switch ]`. Navigate = nav items. Switch = project + org lists. | Two short lists instead of one long one. | Adds a mode; duplicates the switcher concept; mobile tab affordance is fiddly. |

**Lean: A.** It's the only one that actually fixes the length problem and stays consistent with the desktop model (switchers are deliberate, reuse the same component).

### Mobile target (with option A)
Visible rows ≈ **context pill (1) + nav (~10) + account (1) + sign out (1) ≈ 12**, no project dump. Switching = tap context pill (or a "Switch" row) → project switcher modal → pick → sheet closes, you're on the new project.

## 5. Scale behavior — search & recents

- **Search field:** always render (cheap at small N, ready for large N) — `open Q2` if you'd rather gate it behind a count threshold.
- **Recents:** top **3** projects, maintained as a simple `recentProjects[]` updated on each `setProject()`. In-memory for the prototype; `localStorage` optional (`open Q3`).
- **Scale demo / acceptance:** temporarily inflate demo data to **15 projects / 6 orgs** and confirm search + recents keep both switchers usable (no wall of rows).

## 6. Data / model additions (prototype only)

- `recentProjects` (and optionally `recentOrgs`) — small arrays updated on switch; persisted to `localStorage` if Q3 says yes.
- No schema or backend change. (Future: converge switcher with `CommandPalette.tsx` ⌘K — noted, not built here.)

## 7. Files affected

- `designs/app/alabs-app.html` — CSS (new `.proj-switch`/`.org-switch`/`.recent`/`.switch-search` styles, mobile `.m-context` pill), HTML (split the two modals, restructure `#m-sheet`), JS (separate `renderProjectSwitcher`/`renderOrgSwitcher`, `recentProjects`, mobile `buildMobileNav` rewrite). One file, end to end.

## 8. Acceptance checks

- [ ] Desktop rail pill opens a **project-only** switcher (no org column); search + recents present; selecting redirects + stays in org.
- [ ] Account modal → **org switcher** (search when orgs large); selecting lands on default project (or expands projects — per Q4).
- [ ] Mobile menu ≤ ~12 visible rows; switching reachable in ≤ 2 taps; no flat project+nav dump.
- [ ] Scale demo (15 projects / 6 orgs): both switchers stay usable via search + recents.
- [ ] Overlay stack intact: Escape order, scrim-click, `anyOverlayOpen()`/`closeAll()` all cover the split modals + mobile sheet.
- [ ] No orphaned references to the old unified two-column `#switch-modal` layout.

## 9. Open questions (answer/edit these, then I build)

1. **Mobile IA:** **A** (scope-first, recommended) / B (accordions) / C (tabs)?
2. **Search field:** always-on (lean), or only when projects ≥ 8 / orgs ≥ 6?
3. **Recents:** count = **3** (lean) or 5? Persist to `localStorage` in the prototype, or in-memory only?
4. **Org switcher depth:** selecting an org (a) always lands on its default project, or (b) expands that org's projects inline so you can pick a specific one?
5. **Keep a unified "search across all orgs" deep path** (Linear-style ⌘K) as an extra option, or fully separate and drop the unified surface?

## 10. Next step

Edit the open questions above (or just reply with your picks), then I'll move to Design mode and build this against the locked decisions — `designs/app/alabs-app.html` only.
