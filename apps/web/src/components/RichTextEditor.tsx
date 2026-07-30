/**
 * RichTextEditor — a reusable, Helix-themed BlockNote editor bound to the
 * core page-content block model (`@pmin/core` `Block[]`).
 *
 * - Converts core blocks ↔ BlockNote internally (see lib/blocknote.ts), so
 *   callers only ever handle the core model.
 * - Styled via the `.helix-editor` scope in styles.css — fully isolated, no
 *   leakage in either direction.
 * - `initialContent` is read ONCE on mount. To load different content,
 *   remount via `key` (e.g. `<RichTextEditor key={pageId} ... />`).
 * - `onChange` fires on every document change with the new core blocks.
 *   Debounce / persist at the call site — this component stays storage-agnostic.
 */
import { BlockNoteView, lightDefaultTheme } from "@blocknote/mantine";
import type { Theme } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@pmin/core";
import { blocksToCore, coreToBlocks } from "../lib/blocknote.js";

/** BlockNote light theme retuned to the Helix design tokens (concrete oklch
 *  values — safer than `var()` refs, which BlockNote can mishandle). */
export const helixBlockNoteTheme: Theme = {
  ...lightDefaultTheme,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif",
  borderRadius: 8,
  colors: {
    ...lightDefaultTheme.colors,
    editor: { text: "oklch(22% 0.013 250)", background: "oklch(100% 0 0)" },
    menu: { text: "oklch(22% 0.013 250)", background: "oklch(100% 0 0)" },
    tooltip: { text: "oklch(98% 0 0)", background: "oklch(22% 0.013 250)" },
    hovered: { text: "oklch(22% 0.013 250)", background: "oklch(96.6% 0.003 250)" },
    selected: { text: "oklch(54% 0.18 258)", background: "oklch(96% 0.03 258)" },
    disabled: { text: "oklch(64% 0.010 250)", background: "oklch(96.6% 0.003 250)" },
    shadow: "oklch(20% 0.02 250 / 14%)",
    border: "oklch(91% 0.004 250)",
    sideMenu: "oklch(64% 0.010 250)",
  },
};

export interface RichTextEditorProps {
  /** Core page-content blocks to render. Read once on mount. */
  initialContent: Block[];
  /** Editable vs read-only. @default true */
  editable?: boolean;
  /** Fired on every document change with the new core blocks. */
  onChange?: (blocks: Block[]) => void;
  /** Placeholder for empty blocks. */
  placeholder?: string;
  /** Extra class on the `.helix-editor` wrapper. */
  className?: string;
}

export function RichTextEditor({
  initialContent,
  editable = true,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: coreToBlocks(initialContent),
    placeholder,
  });

  return (
    <div className={"helix-editor" + (className ? " " + className : "")}>
      <BlockNoteView
        editor={editor}
        theme={helixBlockNoteTheme}
        editable={editable}
        onChange={() => onChange?.(blocksToCore(editor.document))}
      />
    </div>
  );
}
