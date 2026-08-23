/**
 * @pmin/editor — a reusable aLabs-themed Tiptap rich-text editor.
 *
 * Reads/writes native ProseMirror JSON (`@pmin/core` `Content`), so what the
 * user edits is exactly what persists — no adapter, no mark loss.
 *
 * Import the stylesheet once at your app entry (after your theme/tokens so the
 * custom-property cascade is in place):
 *
 *   import "@pmin/editor/editor.css";
 *
 * The stylesheet consumes these CSS custom properties (define on :root in the
 * host app): --fg, --muted, --faint, --accent, --accent-soft, --surface,
 * --surface-2, --border, --radius, --mono.
 *
 * Contextual density (e.g. a compact drawer) is an opt-in `className` extension
 * point — pass e.g. `className="dw-desc"` and style `.alabs-editor.dw-desc …`
 * in your app; those rules win by specificity over the package base.
 */
export { RichTextEditor, TaskLink } from "./editor";
export type { RichTextEditorProps, TaskLinkAttrs } from "./editor";
export type { Content } from "@pmin/core";
