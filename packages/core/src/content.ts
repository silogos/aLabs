/**
 * Rich-text content model — `pages.content` and `tasks.desc` store a single
 * ProseMirror document (Tiptap `JSONContent`) as jsonb.
 *
 * The editor writes native ProseMirror JSON; this package validates *shape*
 * (not a fixed node whitelist) so any extension's nodes/marks persist without
 * a core change here. `@pmin/core` deliberately has no Tiptap dependency —
 * the type below is hand-rolled to be structurally equal to
 * `@tiptap/core`'s `JSONContent`, and the web app casts between the two only
 * at the editor boundary.
 */
import { z } from "zod";

/**
 * A ProseMirror node/mark — structurally equal to `JSONContent` from
 * `@tiptap/core`. ProseMirror is permissive, so unknown attrs are allowed.
 */
export interface Content {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: Content[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
  [k: string]: unknown;
}

const markSchema: z.ZodType<NonNullable<Content["marks"]>[number]> = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Loose ProseMirror-JSON validator. Checks *shape* (`type` / `content` /
 * `marks` / `text` / `attrs`) and lets every extension's custom attrs pass
 * through. Tighten to a node whitelist later if a stable surface is wanted.
 */
export const contentSchema: z.ZodType<Content> = z
  .object({
    type: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.lazy(() => z.array(contentSchema)).optional(),
    marks: z.array(markSchema).optional(),
    text: z.string().optional(),
  })
  .passthrough();

/** A stored rich-text document is a single ProseMirror `doc` node. */
export type PageContent = Content;
