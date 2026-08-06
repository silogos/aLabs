# Rich Text Editor — BlockNote → Tiptap Migration Plan

> **Status:** READY TO BUILD — all decisions locked (2025).
> **Scope:** `apps/web` (TaskDrawer description + Documents page) + `packages/core` content model.
> **Premise:** the app is under **construction, not maintenance** — so we change the data model **wholesale**, with no adapter and no backwards-compat shim.

## Intent summary

Replace the BlockNote-based rich text editor with **Tiptap** across the aLabs web app, and **replace the core `Block[]` content model with Tiptap's native ProseMirror JSON (`JSONContent`) stored directly** in the `pages.content` and `tasks.desc` jsonb columns.

**Why no adapter / why wholesale:** an adapter only existed because `Block[]` (plain text per block, marks dropped) was structurally poorer than the editor. Since the app is greenfield, we delete `Block[]` entirely and persist the editor's native JSON. That **eliminates the persistence bug for free** — bold/italic/links/pills round-trip with zero translation, because what you edit *is* what you store.

**Why now:** BlockNote has no auto-linking, and pasting task URLs is manual. The user's Jira-style Tiptap reference showed the target UX (toolbar + ticket pills + image upload). We borrow the reference's *patterns*, not drop it in verbatim.

---

## Decisions locked (from discussion)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Engine | **Tiptap** (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) — replace BlockNote |
| D2 | Scope | **Both** TaskDrawer description **and** Documents page (one shared editor component) |
| D3 | Toolbar | **Always-visible** (Jira-reference style) — not a floating bubble |
| D4 | Checklists | **NO** `TaskList`/`TaskItem`. Bullet + ordered lists only, styled to match the app |
| D5 | Task linking | Paste `alabs.app/t/ATL-105` **or** bare token `ATL-105` → auto-convert to a styled **pill** that navigates in-app. **No separate ID-input box** |
| D6 | Web links | `Link` extension with `autolink: true` + `linkOnPaste: true` — typed/pasted URLs become clickable links automatically |
| D7 | Images | **Base64 now**, behind a real `uploadFile` hook so a backend upload route is a one-function swap later |
| D8 | Data model | **Wholesale.** Delete `Block[]`. Store Tiptap ProseMirror `JSONContent` directly. **No adapter, no backwards-compat.** |

---

## ✅ RESOLVED — inline content persistence

*(Was the plan's open blocker; resolved by D8.)*

The old `Block[]` model stored plain text per block and the BlockNote adapter dropped all marks on save — so bold/italic/links never survived a reload. **By deleting `Block[]` and persisting native ProseMirror JSON, persistence is trivially correct:** the editor reads and writes the exact structure stored in the column. No translation = no loss. Every acceptance check below that says "survives close/reopen" is now a near-trivial pass.

---

## Technical design

### 0. The new content model — `packages/core/src/content.ts` (renamed from `blocks.ts`)

Delete the `Block[]` union. Replace it with a **loose ProseMirror-JSON** validator + type. `@pmin/core` deliberately does **not** depend on Tiptap (it's a backend-shared package), so the type is hand-rolled to match `JSONContent` structurally; the web app casts it to the real `JSONContent` from `@tiptap/core` at the editor boundary.

```ts
// packages/core/src/content.ts
import { z } from "zod";

/** Hand-rolled ProseMirror JSON shape — structurally equal to @tiptap/core JSONContent. */
export interface Content {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: Content[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
  [k: string]: unknown; // ProseMirror is permissive — unknown attrs allowed
}

const mark: z.ZodType<NonNullable<Content["marks"]>[number]> = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

export const contentSchema: z.ZodType<Content> = z.object({
  type: z.string().optional(),
  attrs: z.record(z.string(), z.unknown()).optional(),
  content: z.lazy(() => z.array(contentSchema)).optional(),
  marks: z.array(mark).optional(),
  text: z.string().optional(),
}).passthrough();

/** A stored rich-text document is a single ProseMirror doc node. */
export type PageContent = Content;
```

Update `packages/core/src/index.ts`: `export * from "./content.js";` (replacing `./blocks.js`).

**Note on `passthrough()` / `z.lazy`:** ProseMirror nodes carry arbitrary `attrs` per extension, so the validator is intentionally loose — it checks *shape* (`type`/`content`/`marks`/`text`), not a fixed schema. This is correct for greenfield; tighten later if a stable node whitelist is wanted.

### 1. Editor component — `apps/web/src/components/RichTextEditor.tsx` (rewrite)

- Swap `useCreateBlockNote` → Tiptap `useEditor` + `<EditorContent>`.
- **No adapter import.** Props change to work directly on ProseMirror JSON:
  - `initialContent: Content` (a `doc` node — `editor.commands.setContent(initialContent)`)
  - `onChange?: (doc: Content) => void` → `editor.getJSON()` on every transaction
  - `editable`, `placeholder`, `className` unchanged
  - The web app casts `Content` ↔ `JSONContent` (`@tiptap/core`) at this boundary only.
- Extensions:
  - `StarterKit` (paragraph, headings, bold/italic/strike/code, bullet+ordered list, blockquote, codeblock, hr, history)
  - `Link.configure({ autolink: true, linkOnPaste: true, openOnClick: false, HTMLAttributes: { class: "al-link" } })` — `openOnClick: false` because pill/link clicks are handled by the app, not full nav.
  - **Custom `TaskLink` inline node** + **paste/typing rule** matching `ATL-\d+` and `alabs\.app/t/ATL-\d+`, inserts a pill node. Stored as a ProseMirror node (`type: "taskLink", attrs: { taskId, label }`) — persists natively, no special handling.
  - `Image` extension with an `uploadFile` hook (base64-now, upload-ready) — images are inline `image` nodes.
  - `Placeholder` ("Add a description…").
- Always-visible toolbar: **B / I / S / code** · bullet / ordered list · **link** · **undo/redo**. (No checklist button, no ID-input box.)
- Toolbar + pill clicks (`onOpenTask`) are wired via props/refs, not editor-internal nav.

### 2. TaskDrawer integration — `apps/web/src/components/TaskDrawer.tsx`
- `desc?: Block[]` → `desc?: Content` in the task type and `onDescChange`.
- Keep the existing `<RichTextEditor key={t.id}>` mount + debounced save (600ms) — only the content type changes under it.
- Thread **`onOpenTask(taskId)`** down to the editor so pill clicks open the task drawer in-app.
- Drawer-scoped CSS (`.alabs-editor.dw-desc`) carries over — compact 13px density. (The `.bn-*` selectors there become dead → pruned in step 5.)

### 3. Documents integration — `apps/web/src/views/Documents.tsx`
- `Block` → `Content`; `handleContentChange(blocks: Block[])` → `(doc: Content)`.
- Same component, full-canvas `.alabs-editor` styling stays as default. No other logic change.

### 4. API validation — `apps/api/src/modules/documents/routes.ts`
- `contentSchema` is still imported from `@pmin/core`; its *meaning* changed (loose ProseMirror JSON) but the call site (`contentSchema.safeParse`) is unchanged. No edit needed beyond re-deriving types if any are named.

### 5. Seed data — `apps/api/src/db/seed.ts`
- `page(space, title, icon, content: Block[])` → `content: Content`.
- Convert existing seed page bodies from the old `Block[]` shape to a ProseMirror `doc` node. (Greenfield → just rewrite the few seed literals; no migration query.)

### 6. Styles — `apps/web/src/styles.css`
- New classes: `.al-toolbar`, `.al-toolbar button`, `.al-link`, `.task-pill`, `.task-pill:hover`.
- Reuse `.alabs-editor` scope; keep the compact `.alabs-editor.dw-desc` overrides.
- **Prune dead BlockNote CSS:** all `.bn-*` selectors (side menu, formatting menu, slash menu, drag handle) become dead once BlockNote is gone.

### 7. Dependencies — `apps/web/package.json`
- **Add:** `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `lucide-react` (toolbar icons — check if already present).
- **Remove (same step, after editor swap is verified):** `@blocknote/react`, `@blocknote/mantine`, `@blocknote/core`.
- **Delete `apps/web/src/lib/blocknote.ts`** entirely (no call sites remain).

---

## Files touched

| File | Action |
|------|--------|
| `packages/core/src/blocks.ts` → **`content.ts`** | **Rename + rewrite** — delete `Block[]`; add loose ProseMirror `Content` type + `contentSchema` |
| `packages/core/src/index.ts` | **Edit** — re-export `./content.js` instead of `./blocks.js` |
| `packages/core/src/schemas/index.ts` | **No edit** — already imports `contentSchema` by name; meaning changes, callsite unchanged |
| `packages/core/src/db/schema.ts` | **No edit** — `content`/`desc` columns stay jsonb; only the TS type label drifts |
| `apps/api/src/modules/documents/routes.ts` | **No edit** — `contentSchema.safeParse` works unchanged |
| `apps/api/src/db/seed.ts` | **Edit** — `Block` → `Content`; rewrite seed page bodies as ProseMirror `doc` nodes |
| `apps/web/src/lib/blocknote.ts` | **Delete** |
| `apps/web/src/components/RichTextEditor.tsx` | **Rewrite** — Tiptap engine + always-visible toolbar + `TaskLink` pill node + autolink + image |
| `apps/web/src/components/TaskDrawer.tsx` | **Edit** — `desc: Block[]` → `desc: Content`; thread `onOpenTask` |
| `apps/web/src/views/Documents.tsx` | **Edit** — `Block` → `Content` in types + change handler |
| `apps/web/src/views/tasks-store.ts` | **Edit** — `desc?: Block[]` → `desc?: Content`; drop the `Block` import |
| `apps/web/src/styles.css` | **Edit** — add `.al-*` / `.task-pill`; prune dead `.bn-*` |
| `apps/web/package.json` | **Edit** — add Tiptap deps; remove BlockNote deps |

### ⚠️ Do NOT touch (name collision)
`tasks-store.ts` has `RelKey = "blocks" | "blockedBy" | "relates"` and `rel.blocks: number[]`. That `blocks` is a **task-relation key**, unrelated to the content model. Leave it entirely alone.

---

## Open questions (edit / answer these — defaults recommended)

- **Q1 — Pill click behavior:** confirm pills should **open the task drawer in-app** (needs `onOpenTask(taskId)` threaded from app → drawer → editor). *Recommended: yes.*
- **Q2 — Bare token acceptance:** should typing a bare `ATL-105` mid-sentence also become a pill, or only pasted URLs/tokens? (Bare-token autolinking mid-prose can be noisy.) *Recommended: paste + start-of-line token; bare mid-sentence stays as text.*
- **Q3 — Slash menu:** keep a `/` slash command menu (via `@tiptap/suggestion`), or toolbar-only? *Recommended: add a minimal slash menu so the placeholder "/" promise is honest.*
- **Q4 — De-risk first:** spike Tiptap in a throwaway `tiptap-preview.tsx` (autolink + pill + image) before touching production files, or build straight in? *Recommended: build straight in — the wholesale model swap is lower-risk than the adapter path it replaces.*

---

## Risks

- **Custom `TaskLink` node + paste/typing rules are the riskiest code.** ProseMirror custom-node authoring is fiddly; budget time for the regex paste/typing rule + node-view rendering. *(Persistence is not a risk — the node stores natively.)*
- **Loose API validation** (`passthrough()`) won't catch a malformed doc — acceptable for greenfield; tighten to a node whitelist later if needed.
- **Image base64 bloats `content` jsonb.** Fine for a prototype; the `uploadFile` hook is the documented exit ramp.
- **BlockNote removal** must confirm zero remaining `useCreateBlockNote` / `BlockNoteView` / `lib/blocknote` references + dead `.bn-*` CSS.

---

## Acceptance checks

- [ ] `tsc --noEmit` passes with Tiptap deps + the new `Content` model, zero `Block`/`PageContent`/`blocks.ts` references left.
- [ ] Task drawer: type a URL → it auto-links; **survives close/reopen** (trivially — native JSON).
- [ ] Task drawer: paste `alabs.app/t/ATL-105` and a bare `ATL-105` → both render as a pill; clicking the pill opens task ATL-105 in the drawer.
- [ ] Task drawer: paste an image → renders inline; **survives close/reopen**; "Description saved" toast fires.
- [ ] Task drawer: bold/italic/strike/code **persist** across save/reload (the regression the old `Block[]` model failed).
- [ ] Documents page: same editor, full-canvas styling, same persistence behavior.
- [ ] Toolbar buttons toggle active state; undo/redo work.
- [ ] No checklists (`TaskList`/`TaskItem`) anywhere.
- [ ] `lib/blocknote.ts` deleted; zero BlockNote references in code or CSS remain.

---

## Next step

1. **You:** answer **Q1–Q4** inline (defaults are fine — just say "go with defaults").
2. Hand back to Design mode to build — execution order: **core model (0) → editor component (1) → TaskDrawer (2) → Documents (3) → seed (5) → styles (6) → BlockNote deletion (7)**. API (4) needs no edit.
3. Optional de-risk per Q4: spike Tiptap in a throwaway `tiptap-preview.tsx` before touching production files.
