/**
 * Page content block model — `pages.content` is a jsonb array of blocks.
 *
 * Each block is a discriminated union on `type`. The API validates incoming
 * `content` against this union before persisting; the web app renders it.
 *
 * See `docs/tech/03-data-model.md` → "Page Content Block Model".
 */
import { z } from "zod";

export const blockBase = z.object({ id: z.string() });

export const paragraphBlock = blockBase.extend({
  type: z.literal("paragraph"),
  data: z.object({ text: z.string() }),
});
export const headingBlock = blockBase.extend({
  type: z.union([z.literal("heading1"), z.literal("heading2"), z.literal("heading3")]),
  data: z.object({ text: z.string() }),
});
export const listBlock = blockBase.extend({
  type: z.union([z.literal("bulletList"), z.literal("orderedList")]),
  data: z.object({ items: z.array(z.string()) }),
});
export const todoBlock = blockBase.extend({
  type: z.literal("todo"),
  data: z.object({ text: z.string(), checked: z.boolean() }),
});
export const quoteBlock = blockBase.extend({
  type: z.literal("quote"),
  data: z.object({ text: z.string() }),
});
export const codeBlock = blockBase.extend({
  type: z.literal("code"),
  data: z.object({ language: z.string(), text: z.string() }),
});
export const dividerBlock = blockBase.extend({
  type: z.literal("divider"),
  data: z.object({}).strict(),
});
export const calloutBlock = blockBase.extend({
  type: z.literal("callout"),
  data: z.object({
    variant: z.union([z.literal("info"), z.literal("warning"), z.literal("success")]),
    text: z.string(),
  }),
});
export const imageBlock = blockBase.extend({
  type: z.literal("image"),
  data: z.object({ fileId: z.string(), caption: z.string().optional() }),
});

export const block = z.union([
  paragraphBlock,
  headingBlock,
  listBlock,
  todoBlock,
  quoteBlock,
  codeBlock,
  dividerBlock,
  calloutBlock,
  imageBlock,
]);

export type Block = z.infer<typeof block>;
export const contentSchema = z.array(block);
export type PageContent = Block[];
