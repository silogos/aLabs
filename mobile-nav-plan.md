# Mobile top bar & nav sheet — consolidation plan

> **Status:** draft (Plan mode). Review/edit this file, then hand off to Design mode to build.
> **Scope:** prototype only — `designs/app/alabs-app.html`. Desktop untouched.
> **One line:** on mobile (≤880px), collapse the two stacked bars (brand bar + breadcrumb topbar) into a single 52px bar, move project-switching into that bar, and make the bottom sheet **nav-only** — killing the redundant identity/context duplication and cutting chrome.

---

## 1. Background — what exists today (grounded in the file)

On mobile (≤880px) the app renders **two bars before any content**, then the page:

1. **Brand bar (52px)** — `.brand-row` (flex:1): `.brand` (colored logo box + **aLabs** + **Workspace** subtitle) on the left · `.m-trigger` hamburger on the right. **Static identity, not tappable.**
2. **Breadcrumb topbar** — `<header class="topbar">` (project pill + current-view breadcrumb). **Not hidden on mobile** — sits directly below the brand bar.

That's ~96px of chrome on a phone before content. The problem: **identity is shown twice.** "aLabs / Workspace" sits in bar #1; the *current project* sits in bar #2. Both nearly-static. Org/project name appears redundantly, stacked vertically.

**The bottom sheet** (`#m-sheet`, opened by the hamburger) is internally clean now (scope-first: `.m-context` pill → nav items → account → sign out), but the `.m-context` pill **duplicates the bar's job** — it surfaces project+org, which the bar already (should) surface.

**Key costs today:**
- Project-switch = hamburger → context pill → modal (3 gestures for the most common nav action).
- Account = hamburger → scroll to sheet bottom → Account (3 gestures).
- Two stacked bars eat ~96px of the most precious mobile resource (vertical space).

## 2. The recommendation — single 52px bar (Linear/GitHub mobile model)

Collapse to **one bar** that does three jobs at once: identity, fast context-switch, and account access.

```
┌──────────────────────────────────────────────┐
│ [●] Atlas Platform 2.0          (○)  (☰)     │  52px
│     Northwind                                  │
└──────────────────────────────────────────────┘
        ↑ tappable → project          ↑ avatar  ↑ hamburger
          switcher                    → account  → nav sheet
```

**Left:** logo + **current project (tappable → project switcher modal)**, with org as a muted subtitle.
**Right:** **avatar (→ account modal)** + **hamburger (→ nav sheet)**.

This is the pattern Linear, GitHub, and Figma mobile use: the *current context* in the header *is* the switcher trigger, and identity/access live in the bar.

## 3. What changes — the four moves

| # | Move | Detail |
|---|---|---|
| 1 | **One bar replaces two** | `.brand-row` becomes the single mobile bar. The breadcrumb `<header class="topbar">` is **hidden on mobile** (`display:none` ≤880px). |
| 2 | **Project switcher lives in the bar** | The bar's left side is a tappable pill: `logo + project name + org subtitle` → opens `#proj-modal` (the existing project switcher). 1 tap instead of 3. |
| 3 | **Avatar in the bar → account** | A 28px avatar button on the right → opens `#acct-modal` directly. Removes the sheet-bottom detour. |
| 4 | **Sheet becomes nav-only** | Drop `.m-context` from the sheet (its job moved to the bar). Sheet shows: **nav items only** (Overview / Workspace / Collaboration / Settings) + sign-out. Shorter, focused. |

## 4. What gets removed / relocated

- **Breadcrumb topbar** → hidden on mobile (its project info folds into the bar; current-view is evident from page content).
- **`.m-context` pill** → removed from the sheet (bar handles project-switching).
- **"aLabs / Workspace" static brand text** → replaced by `logo + project + org` (project is the *useful* identity on mobile; the product name is secondary once you're inside).

## 5. Edge cases / state behavior

- **Collapsed-state rules** (`.app.collapsed …`) are desktop-only and already excluded from mobile via the media query — no change needed.
- **Org-switching on mobile** stays via **avatar → account → Switch workspace** (deliberate 2-tap path for a rare/identity action — consistent with desktop, per the switcher plan's locked decision).
- **Bar height**: stays 52px to match current brand bar; content reflows within it.
- **Search + recents** in `#proj-modal` already built (from switcher plan) — reused as-is, no rework.
- **Sheet still closes on nav-item tap / scrim / Escape** — existing overlay stack untouched.

## 6. Files affected

- `designs/app/alabs-app.html` only:
  - **CSS** — hide `.topbar` ≤880px; restyle `.brand-row` to host the tappable project pill + avatar + hamburger; remove `.m-context` rules (orphaned).
  - **HTML** — restructure `.brand-row` (project pill left, avatar + hamburger right); strip `.m-context` from `#m-sheet`.
  - **JS** — wire the bar's project pill → `openProjectSwitcher()`; wire the bar's avatar → `openAcctModal()`; simplify `buildMobileNav()` to nav-only.

## 7. Acceptance checks

- [ ] Mobile (≤880px) shows **one** 52px bar; breadcrumb topbar is hidden.
- [ ] Tapping the project pill in the bar opens `#proj-modal` (1 tap).
- [ ] Tapping the avatar in the bar opens `#acct-modal` (1 tap).
- [ ] Tapping the hamburger opens the nav sheet — **nav items + sign-out only**, no `.m-context` pill, no account detour.
- [ ] No identity duplicated (org/project shown once, in the bar).
- [ ] Org-switching reachable via avatar → account → Switch workspace (≤2 taps).
- [ ] Overlay stack intact: Escape order (mobile sheet → project → org → account), scrim-click, `anyOverlayOpen()`/`closeAll()`.
- [ ] Desktop (>880px) visually and behaviorally unchanged.
- [ ] No orphaned `.m-context` references.

## 8. Open questions (answer/edit these, then I build)

1. **Bar left-side content:** **(a)** logo + project name + org subtitle (lean — shows full context) / **(b)** logo + project name only (org hidden) / **(c)** logo + "org · project" single line?
2. **Current-view location** (breadcrumb is being hidden): **(a)** drop it entirely — page content makes it obvious (lean) / **(b)** keep a tiny view-name chip in the bar (e.g. "Tasks") / **(c)** keep the breadcrumb as a thin secondary row?
3. **Avatar in bar:** **(a)** yes, on the right next to hamburger (lean — 1-tap account) / **(b)** no, account stays sheet-only (keep current hamburger-only right side)?
4. **Sheet content:** **(a)** nav items + sign-out only (lean) / **(b)** keep account row too as a fallback / **(c)** nav items only, move sign-out into account modal exclusively?
5. **Product name ("aLabs"):** **(a)** drop from the bar on mobile (lean — project is the identity) / **(b)** keep a small "aLabs" mark in the bar corner?

## 9. Next step

Edit the open questions above (or reply with your picks), then I'll move to Design mode and build this against the locked decisions — `designs/app/alabs-app.html` only, desktop untouched. My picks if you want to just say "go with your leans": **a · a · a · a · a**.
