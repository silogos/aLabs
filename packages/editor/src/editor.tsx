/**
 * RichTextEditor — a reusable, aLabs-themed Tiptap editor.
 *
 * - Reads/writes native ProseMirror JSON (`@pmin/core` `Content`), so what the
 *   user edits is exactly what persists — no adapter, no mark loss.
 * - Always-visible toolbar (bold / italic / strike / code · headings · lists ·
 *   quote · link · undo/redo). No checklists.
 * - `Link` autolinks typed/pasted URLs.
 * - Pasting `alabs.app/t/ATL-105` or a bare `ATL-105` token auto-converts to a
 *   **task pill** (custom `taskLink` node) that opens the task in-app.
 * - Pasted/dropped images upload via the optional `uploadFile` prop and insert
 *   the returned URL; if `uploadFile` is omitted (or rejects) they fall back to
 *   base64 data URLs so a flaky upload never silently drops an image.
 *
 * `initialContent` is read ONCE on mount. To load different content, remount
 * via `key` (e.g. `<RichTextEditor key={pageId} ... />`). `onChange` fires on
 * every document change with the new ProseMirror doc — debounce/persist at the
 * call site.
 *
 * Base styling ships in `@pmin/editor/editor.css` (import it once at your app
 * entry). Contextual density is an opt-in `className` extension point.
 */
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { EditorView } from "@tiptap/pm/view";
import {
  Node,
  mergeAttributes,
  nodePasteRule,
  type PasteRule,
} from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import type { Content } from "@pmin/core";

/* ============================================================
 * TaskLink — an atom inline node rendered as an aLabs task pill.
 * A pasted `alabs.app/t/ATL-105` URL or a bare `ATL-105` token is
 * converted into this node via a paste rule. It stores natively
 * (type "taskLink", attrs { taskId, label }), so it round-trips with
 * zero special handling.
 * ============================================================ */
const TASK_RE = /(?:https?:\/\/\S*?\/t\/|alabs\.app\/t\/)?ATL-(\d+)/g;

export interface TaskLinkAttrs {
  taskId: number;
  label: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    taskLink: {
      /** Insert a task pill node at the current selection. */
      insertTaskLink: (attrs: TaskLinkAttrs) => ReturnType;
    };
  }
}

export const TaskLink = Node.create({
  name: "taskLink",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      taskId: { default: null },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-task-link]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-task-link": String(node.attrs.taskId),
        class: "task-pill",
        contenteditable: "false",
      }),
      node.attrs.label,
    ];
  },

  addCommands() {
    return {
      insertTaskLink:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: "taskLink", attrs }),
    };
  },

  addPasteRules(): PasteRule[] {
    return [
      nodePasteRule({
        find: TASK_RE,
        type: this.type,
        getAttributes: (match) => {
          const num = match[1] ?? match[2] ?? match[3];
          return { taskId: Number(num), label: `ATL-${num}` } as TaskLinkAttrs;
        },
      }),
    ];
  },
});

/* ============================================================
 * Image paste/drop — insert pasted/dropped image files as inline
 * <img> nodes (base64 data URL for now). Replace `readAsDataURL`
 * with a real upload call to move off base64.
 * ============================================================ */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Insert image files at the selection. If `uploadFile` is provided it is used
 *  to upload each image and the returned URL is inserted; on rejection (or when
 *  omitted) it falls back to base64. Returns synchronously whether any images
 *  were handled so ProseMirror's paste/drop contract is respected. */
function insertImageFiles(
  view: EditorView,
  files: FileList | File[],
  uploadFile?: (file: File) => Promise<string>,
): boolean {
  const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
  if (!images.length) return false;
  for (const file of images) {
    const place = (src: string) => {
      const node = view.state.schema.nodes.image.create({ src });
      view.dispatch(view.state.tr.replaceSelectionWith(node));
    };
    if (uploadFile) {
      uploadFile(file)
        .then(place)
        .catch(() => readAsDataURL(file).then(place)); // graceful base64 fallback
    } else {
      readAsDataURL(file).then(place);
    }
  }
  return true;
}

/* ============================================================
 * Toolbar icons (inline SVG — no extra dep, matches the rest of the app)
 * ============================================================ */
type IconProps = { size?: number };
const ic = (size: number, path: string) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
);
const IcBold = ({ size = 15 }: IconProps) => ic(size, '<path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/>');
const IcItalic = ({ size = 15 }: IconProps) => ic(size, '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>');
const IcStrike = ({ size = 15 }: IconProps) => ic(size, '<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/>');
const IcCode = ({ size = 15 }: IconProps) => ic(size, '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>');
const IcH1 = ({ size = 15 }: IconProps) => ic(size, '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12l3-1v7"/>');
const IcH2 = ({ size = 15 }: IconProps) => ic(size, '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-1.2-2.5-3-2.5S15 10.5 15 12"/>');
const IcBullet = ({ size = 15 }: IconProps) => ic(size, '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none"/>');
const IcOrdered = ({ size = 15 }: IconProps) => ic(size, '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 4h1v4" fill="none"/><path d="M4 14h2a1 1 0 0 0 0-2H5a1 1 0 0 1 0-2h1"/><path d="M4 18h2.5L4 21h2.5"/>');
const IcQuote = ({ size = 15 }: IconProps) => ic(size, '<path d="M3 21c3 0 7-1 7-8V5H3v7h4"/><path d="M14 21c3 0 7-1 7-8V5h-7v7h4"/>');
const IcLink = ({ size = 15 }: IconProps) => ic(size, '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>');
const IcUndo = ({ size = 15 }: IconProps) => ic(size, '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>');
const IcRedo = ({ size = 15 }: IconProps) => ic(size, '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>');

/* ============================================================
 * Component
 * ============================================================ */
export interface RichTextEditorProps {
  /** ProseMirror doc to render. Read once on mount. */
  initialContent?: Content;
  /** Editable vs read-only. @default true */
  editable?: boolean;
  /** Fired on every document change with the new ProseMirror doc. */
  onChange?: (doc: Content) => void;
  /** Placeholder for empty documents. */
  placeholder?: string;
  /** Extra class on the `.helix-editor` wrapper. */
  className?: string;
  /** Called when a user clicks a task pill — open the task in-app. */
  onOpenTask?: (taskId: number) => void;
  /** Upload a pasted/dropped image and return its URL. Omit to keep base64
   *  inline data; if this rejects, the image is inserted as base64 instead of
   *  being dropped. */
  uploadFile?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  initialContent,
  editable = true,
  onChange,
  placeholder,
  className,
  onOpenTask,
  uploadFile,
}: RichTextEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // `useEditor` memoizes its config, so read the latest uploader via a ref.
  const uploadRef = useRef(uploadFile);
  uploadRef.current = uploadFile;

  const editor = useEditor({
    editable,
    immediatelyRender: false,
    content: initialContent && (initialContent.content || initialContent.text)
      ? (initialContent as never)
      : { type: "doc", content: [{ type: "paragraph" }] },
    extensions: [
      StarterKit.configure({
        // Lists come from StarterKit; nothing else to disable.
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { class: "al-link" },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
      TaskLink,
    ],
    editorProps: {
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length) return insertImageFiles(view, files, uploadRef.current);
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length) {
          if (insertImageFiles(view, files, uploadRef.current)) {
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getJSON() as Content),
  });

  /* Task-pill click → open the task in-app (DOM delegation on the wrapper). */
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root || !onOpenTask) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-task-link]",
      );
      if (!el) return;
      const id = Number(el.getAttribute("data-task-link"));
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      onOpenTask(id);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [onOpenTask]);

  if (!editor) return null;

  return (
    <div className={"helix-editor" + (className ? " " + className : "")} ref={wrapperRef}>
      {editable && (
        <div className="al-toolbar" onMouseDown={(e) => e.preventDefault()}>
          <TBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><IcBold /></TBtn>
          <TBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><IcItalic /></TBtn>
          <TBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><IcStrike /></TBtn>
          <TBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><IcCode /></TBtn>
          <i className="al-sep" />
          <TBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><IcH1 /></TBtn>
          <TBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><IcH2 /></TBtn>
          <i className="al-sep" />
          <TBtn title="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><IcBullet /></TBtn>
          <TBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><IcOrdered /></TBtn>
          <TBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><IcQuote /></TBtn>
          <i className="al-sep" />
          <TBtn
            title="Link"
            active={editor.isActive("link")}
            onClick={() => {
              const prev = editor.getAttributes("link").href as string | undefined;
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              const url = window.prompt("Link URL", prev ?? "https://");
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }}
          >
            <IcLink />
          </TBtn>
          <i className="al-sep" />
          <TBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}><IcUndo /></TBtn>
          <TBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}><IcRedo /></TBtn>
        </div>
      )}
      <EditorContent editor={editor} className="al-content" />
    </div>
  );
}

function TBtn({ title, active, onClick, children }: { title: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={title} className={"al-tbtn" + (active ? " on" : "")} onClick={onClick} aria-pressed={active ? "true" : "false"}>
      {children}
    </button>
  );
}
