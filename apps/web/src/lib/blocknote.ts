/**
 * Bidirectional adapter between the core page-content block model
 * (`@pmin/core` `Block[]`, validated server-side by `contentSchema`) and
 * BlockNote's editor document (`PartialBlock[]`).
 *
 * Core stores plain text per block; BlockNote uses rich-text inline content.
 * The mapping is 1:1 on the block types both models share, consecutive list
 * items are coalesced back into a single core list block on save, and
 * unsupported types fall back to the nearest faithful equivalent so the saved
 * payload always validates against `contentSchema`.
 */
import type { PartialBlock } from "@blocknote/core";
import type { Block } from "@pmin/core";

let seq = 0;
const genId = (): string => `blk-${Date.now().toString(36)}-${(seq++).toString(36)}`;

type Inline = { type: "text"; text: string; styles: Record<string, never> };

/** Core plain-text → BlockNote inline content (rich-text with no marks). */
const inline = (text: string): Inline[] =>
  text ? [{ type: "text", text, styles: {} }] : [];

/** Flatten BlockNote inline content back to a plain string (marks dropped). */
const toText = (content: unknown): string => {
  if (!Array.isArray(content)) return "";
  return content
    .map((c) => (typeof c === "string" ? c : (c as { text?: string })?.text ?? ""))
    .join("");
};

type BNProps = { level?: number; checked?: boolean; language?: string; start?: number };
const propsOf = (b: PartialBlock): BNProps => ((b as { props?: BNProps }).props ?? {}) as BNProps;
const contentOf = (b: PartialBlock): unknown => (b as { content?: unknown }).content;

type Heading = "heading1" | "heading2" | "heading3";
const levelToHeading = (lvl: number | undefined): Heading =>
  lvl === 1 ? "heading1" : lvl === 2 ? "heading2" : "heading3";

/** Core `Block[]` → BlockNote partial blocks (for `initialContent`). */
export function coreToBlocks(blocks: Block[] | null | undefined): PartialBlock[] {
  if (!blocks?.length) return [{ type: "paragraph", content: inline("") }];
  const out: PartialBlock[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "heading1": out.push({ id: b.id, type: "heading", props: { level: 1 }, content: inline(b.data.text) }); break;
      case "heading2": out.push({ id: b.id, type: "heading", props: { level: 2 }, content: inline(b.data.text) }); break;
      case "heading3": out.push({ id: b.id, type: "heading", props: { level: 3 }, content: inline(b.data.text) }); break;
      case "paragraph": out.push({ id: b.id, type: "paragraph", content: inline(b.data.text) }); break;
      case "quote": out.push({ id: b.id, type: "quote", content: inline(b.data.text) }); break;
      // BlockNote has no native callout — render as a quote (accent-railed in CSS).
      case "callout": out.push({ id: b.id, type: "quote", content: inline(b.data.text) }); break;
      case "todo": out.push({ id: b.id, type: "checkListItem", props: { checked: b.data.checked }, content: inline(b.data.text) }); break;
      case "code": out.push({ id: b.id, type: "codeBlock", props: { language: b.data.language || "text" }, content: inline(b.data.text) }); break;
      case "divider": out.push({ id: b.id, type: "divider" }); break;
      case "bulletList":
        for (const it of b.data.items) out.push({ type: "bulletListItem", content: inline(it) });
        break;
      case "orderedList":
        for (const it of b.data.items) out.push({ type: "numberedListItem", content: inline(it) });
        break;
      // No file-URL resolution yet — keep the caption as text so nothing is lost.
      case "image": out.push({ id: b.id, type: "paragraph", content: inline(b.data.caption ?? "") }); break;
      default: break;
    }
  }
  return out.length ? out : [{ type: "paragraph", content: inline("") }];
}

/** BlockNote blocks → Core `Block[]` (for persistence). Coalesces list items. */
export function blocksToCore(blocks: PartialBlock[]): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    const text = toText(contentOf(b));
    const p = propsOf(b);
    switch (b.type) {
      case "heading":
        out.push({ id: b.id ?? genId(), type: levelToHeading(p.level), data: { text } });
        break;
      case "paragraph":
        out.push({ id: b.id ?? genId(), type: "paragraph", data: { text } });
        break;
      case "quote":
        out.push({ id: b.id ?? genId(), type: "quote", data: { text } });
        break;
      case "checkListItem":
        out.push({ id: b.id ?? genId(), type: "todo", data: { text, checked: !!p.checked } });
        break;
      case "codeBlock":
        out.push({ id: b.id ?? genId(), type: "code", data: { language: p.language || "text", text } });
        break;
      case "divider":
        out.push({ id: b.id ?? genId(), type: "divider", data: {} });
        break;
      case "bulletListItem": {
        const last = out[out.length - 1];
        if (last && last.type === "bulletList") last.data.items.push(text);
        else out.push({ id: b.id ?? genId(), type: "bulletList", data: { items: [text] } });
        break;
      }
      case "numberedListItem": {
        const last = out[out.length - 1];
        if (last && last.type === "orderedList") last.data.items.push(text);
        else out.push({ id: b.id ?? genId(), type: "orderedList", data: { items: [text] } });
        break;
      }
      default:
        // image/table/etc → paragraph so the payload still validates server-side
        if (text) out.push({ id: b.id ?? genId(), type: "paragraph", data: { text } });
    }
  }
  return out;
}
