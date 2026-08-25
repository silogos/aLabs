/** Documents view — space/page tree + a BlockNote-powered block editor with persistence. */
import { documentsService } from "@/services/documents";
import { workspaceService } from "@/services/workspace";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";

import { initials, colorFor } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { RichTextEditor } from "@pmin/editor";
import type { Content, Page } from "@pmin/core";

const IcPlus = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/* ------------------------------------------------------------------ *
 * PageEditor — page title + a <RichTextEditor>, with debounced
 * persistence of title + content via the API. The BlockNote engine,
 * theming and core-block conversion live inside <RichTextEditor>.
 * ------------------------------------------------------------------ */
function PageEditor({ page, editMode }: { page: Page; editMode: boolean }) {
  const { project, toast, openTask } = useApp();
  const pid = project!.id;
  const qc = useQueryClient();
  const [title, setTitle] = useState(page.title);

  const contentTimer = useRef<number | undefined>(undefined);
  const handleContentChange = (doc: Content) => {
    window.clearTimeout(contentTimer.current);
    contentTimer.current = window.setTimeout(async () => {
      try {
        await documentsService.updatePage(pid, page.id, { content: doc });
        void qc.invalidateQueries({ queryKey: qk.pages(pid) });
      } catch (e) {
        toast("Couldn't save page: " + (e as Error).message);
      }
    }, 700);
  };

  const titleTimer = useRef<number | undefined>(undefined);
  const saveTitle = (t: string) => {
    setTitle(t);
    window.clearTimeout(titleTimer.current);
    titleTimer.current = window.setTimeout(async () => {
      try {
        await documentsService.updatePage(pid, page.id, { title: t.trim() || "Untitled" });
        void qc.invalidateQueries({ queryKey: qk.pages(pid) });
      } catch (e) {
        toast("Couldn't save title: " + (e as Error).message);
      }
    }, 500);
  };

  return (
    <>
      <h1 className="doc-h1">
        <span className="emo">{page.icon ?? "📄"}</span>
        <input
          className="doc-title-input"
          value={title}
          placeholder="Untitled"
          spellCheck={false}
          onChange={(e) => saveTitle(e.target.value)}
        />
      </h1>
      <div className="byline">
        <span className={`av sm ${colorFor(page.editedBy?.id ?? "marco")}`}>
          {initials(page.editedBy?.name ?? "Marco Keller")}
        </span>
        <span>
          Edited by <b style={{ color: "var(--fg)" }}>{page.editedBy?.name ?? "Marco Keller"}</b> ·{" "}
          {timeAgo(page.updatedAt)}
        </span>
        <span className="sep">·</span>
        <span>{editMode ? "Editing" : "Preview"}</span>
      </div>

      <RichTextEditor
        initialContent={page.content}
        editable={editMode}
        placeholder="Write something…"
        onChange={handleContentChange}
        onOpenTask={(id) => openTask(String(id))}
        uploadFile={(file) => documentsService.uploadFile(pid, file)}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * View
 * ------------------------------------------------------------------ */
export function DocumentsView() {
  const { project, toast } = useApp();
  const pid = project!.id;
  const qc = useQueryClient();
  const { data: spaces } = useQuery({
    queryKey: qk.spaces(pid),
    queryFn: () => documentsService.spaces(pid),
  });
  const { data: pageData } = useQuery({
    queryKey: qk.pages(pid),
    queryFn: () => documentsService.listPages(pid),
  });
  const { data: files } = useQuery({
    queryKey: qk.files(pid),
    queryFn: () => documentsService.files(pid),
  });
  const { data: members } = useMembers(project?.organizationId);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);

  const apiPages: Page[] = pageData?.items ?? [];
  const active = apiPages.find((p) => p.id === activePageId) ?? apiPages[0] ?? null;
  const spaceName = (sid: string) => spaces?.find((s) => s.id === sid)?.name ?? "—";

  const newPage = async () => {
    const firstSpace = (spaces ?? [])[0]?.id;
    if (!firstSpace) {
      toast("Create a space first");
      return;
    }
    try {
      const p = await documentsService.createPage(pid, {
        spaceId: firstSpace,
        title: "Untitled",
        icon: "📄",
      });
      await qc.invalidateQueries({ queryKey: qk.pages(pid) });
      setActivePageId(p.id);
      toast("New page created");
    } catch (e) {
      toast("Couldn't create page: " + (e as Error).message);
    }
  };

  return (
    <section className="view active">
      <div className="toolbar">
        <button className="btn subtle sm">All spaces</button>
        <button className="chip btn on">Engineering</button>
        <button className="chip btn">Product</button>
        <button className="chip btn">Design</button>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn ghost sm" onClick={() => toast("Import — pick a file")}>
            Import
          </button>
          <button className="btn primary sm" onClick={newPage}>
            {IcPlus}New page
          </button>
        </div>
      </div>

      <div className="docs-grid">
        <aside className="doc-tree">
          <div className="tree-search">
            <span className="ico">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input placeholder="Search documents…" />
          </div>
          {(spaces ?? []).map((s) => {
            const isCol = collapsed[s.id];
            const sp = apiPages.filter((p) => p.spaceId === s.id);
            return (
              <div className={`space ${isCol ? "collapsed" : ""}`} key={s.id}>
                <div
                  className="space-h"
                  onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))}
                >
                  <span className="emo">{s.icon ?? "📄"}</span>
                  {s.name}
                  <svg
                    className="chev"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                <div className="space-body">
                  {sp.map((p) => (
                    <div
                      key={p.id}
                      className={`page-item ${active?.id === p.id ? "active" : ""}`}
                      onClick={() => setActivePageId(p.id)}
                    >
                      <span className="emo">{p.icon ?? "📄"}</span>
                      {p.title}
                    </div>
                  ))}
                  {sp.length === 0 && !isCol && (
                    <div className="page-item" style={{ color: "var(--faint)" }}>
                      — empty —
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </aside>

        <div className="doc-main">
          <div className="doc-topbar">
            <div className="doc-crumbs">
              <span>{active ? spaceName(active.spaceId) : "—"}</span>
              <span className="sep">/</span>
              <b>{active?.title ?? "—"}</b>
            </div>
            <div className="right">
              <button className="tbtn" title="Star">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                </svg>
              </button>
              <button className="tbtn" title="Share">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
              </button>
              <button className="tbtn" title="History">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 3v5h5M3.1 9a9 9 0 1 0 2.1-3.6L3 8" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </button>
              {(members ?? []).slice(0, 3).map((m) => (
                <span
                  key={m.user.id}
                  className={`av sm ${colorFor(m.user.id)}`}
                  title={m.user.name}
                >
                  {initials(m.user.name)}
                </span>
              ))}
              <button
                className="btn sm"
                style={{ marginLeft: 6 }}
                onClick={() => setEditMode((m) => !m)}
                title="Toggle edit / preview"
              >
                {editMode ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
                  </svg>
                )}
                {editMode ? "Preview" : "Edit"}
              </button>
            </div>
          </div>

          <div className="doc-content">
            {active ? (
              <PageEditor key={active.id} page={active} editMode={editMode} />
            ) : (
              <div className="muted">No pages yet — create one to start writing.</div>
            )}
          </div>
        </div>
      </div>

      {/* Files */}
      <div style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>Files & attachments</h2>
          <span
            className="link"
            style={{ marginLeft: "auto" }}
            onClick={() => toast("Upload — pick a file")}
          >
            Upload
          </span>
        </div>
        <div className="files-grid">
          {(files ?? []).map((f) => (
            <div className="file-card" key={f.id}>
              <div className={`file-ic ${extKind(f.name)}`}>{extLabel(f.name)}</div>
              <b>{f.name}</b>
              <div className="fm">
                {humanSize(f.size)} · {initials(f.uploadedBy?.name ?? "?")} · {timeAgo(f.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* file helpers */
function extKind(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["fig"].includes(ext)) return "fig";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "img";
  if (["yml", "yaml"].includes(ext)) return "yml";
  if (["zip"].includes(ext)) return "zip";
  return "doc";
}
function extLabel(name: string): string {
  return (name.split(".").pop() ?? "?").toUpperCase().slice(0, 3);
}
function humanSize(n: number): string {
  if (n > 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n > 1_000) return `${Math.round(n / 1_000)} KB`;
  return `${n} B`;
}
