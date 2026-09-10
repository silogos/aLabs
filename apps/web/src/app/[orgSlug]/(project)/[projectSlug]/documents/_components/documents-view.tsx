/** Documents view — space/page tree + a Tiptap-powered rich text editor with persistence. */
import { documentsService } from "@/services/documents";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";

import { initials, colorFor } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { timeAgo } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { RichTextEditor } from "@pmin/editor";
import type { Content, Page, Space } from "@pmin/core";

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
        toast("Couldn't save document: " + (e as Error).message);
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
        <span className={`av sm ${colorFor(page.editedBy?.id ?? "")}`}>
          {initials(page.editedBy?.name ?? "—")}
        </span>
        <span>
          Edited by <b style={{ color: "var(--fg)" }}>{page.editedBy?.name ?? "—"}</b> ·{" "}
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
  const [treeQ, setTreeQ] = useState("");
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [confirmDel, setConfirmDel] = useState<Page | null>(null);
  const [spaceModal, setSpaceModal] = useState(false);
  const [spaceName2, setSpaceName2] = useState("");
  const [spaceErr, setSpaceErr] = useState(false);
  const [confirmDelSpace, setConfirmDelSpace] = useState<Space | null>(null);

  const apiPages: Page[] = pageData?.items ?? [];
  const active = apiPages.find((p) => p.id === activePageId) ?? apiPages[0] ?? null;
  const spaceName = (sid: string) => spaces?.find((s) => s.id === sid)?.name ?? "—";

  const createSpace = async () => {
    const name = spaceName2.trim();
    if (!name) {
      setSpaceErr(true);
      return;
    }
    try {
      await documentsService.createSpace(pid, { name, icon: "📁" });
      await qc.invalidateQueries({ queryKey: qk.spaces(pid) });
      setSpaceModal(false);
      setSpaceName2("");
      setSpaceErr(false);
      toast(`Space “${name}” created`);
    } catch (e) {
      toast("Couldn't create space: " + (e as Error).message);
    }
  };

  const deletePage = async () => {
    const p = confirmDel;
    if (!p) return;
    setConfirmDel(null);
    try {
      await documentsService.removePage(pid, p.id);
      await qc.invalidateQueries({ queryKey: qk.pages(pid) });
      if (activePageId === p.id) setActivePageId(null);
      toast("Document deleted");
    } catch (e) {
      toast("Couldn't delete document: " + (e as Error).message);
    }
  };

  const deleteSpace = async () => {
    const s = confirmDelSpace;
    if (!s) return;
    setConfirmDelSpace(null);
    try {
      await documentsService.removeSpace(pid, s.id);
      await qc.invalidateQueries({ queryKey: qk.spaces(pid) });
      await qc.invalidateQueries({ queryKey: qk.pages(pid) });
      if (active?.spaceId === s.id) setActivePageId(null);
      toast(`Space “${s.name}” deleted`);
    } catch (e) {
      toast("Couldn't delete space: " + (e as Error).message);
    }
  };

  const newPage = async () => {
    // New documents land in the active document's space; projects created
    // before spaces were auto-seeded (and any space-less project) get a
    // General space on first page creation.
    let firstSpace = active?.spaceId ?? (spaces ?? [])[0]?.id;
    if (!firstSpace) {
      try {
        const s = await documentsService.createSpace(pid, { name: "General", icon: "📁" });
        await qc.invalidateQueries({ queryKey: qk.spaces(pid) });
        firstSpace = s.id;
      } catch (e) {
        toast("Couldn't create space: " + (e as Error).message);
        return;
      }
    }
    try {
      const p = await documentsService.createPage(pid, {
        spaceId: firstSpace,
        title: "Untitled",
        icon: "📄",
      });
      await qc.invalidateQueries({ queryKey: qk.pages(pid) });
      setActivePageId(p.id);
      toast("New document created");
    } catch (e) {
      toast("Couldn't create document: " + (e as Error).message);
    }
  };

  return (
    <>
      <section className="view active">
      <div className="toolbar">
        <button className="btn subtle sm">All spaces</button>
        {(spaces ?? []).map((s, i) => (
          <button key={s.id} className={`chip btn ${i === 0 ? "on" : ""}`}>
            {s.name}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn ghost sm" onClick={() => toast("Import — coming soon")}>
            Import
          </button>
          <button className="btn primary sm" onClick={newPage}>
            {IcPlus}New document
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
            <input placeholder="Search documents…" value={treeQ} onChange={(e) => setTreeQ(e.target.value)} />
          </div>
          {(spaces ?? []).map((s) => {
            const isCol = collapsed[s.id];
            const sp = apiPages.filter(
              (p) => p.spaceId === s.id && p.title.toLowerCase().includes(treeQ.toLowerCase()),
          );
            return (
              <div className={`space ${isCol ? "collapsed" : ""}`} key={s.id}>
                <div
                  className="space-h"
                  onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))}
                >
                  <span className="emo">{s.icon ?? "📄"}</span>
                  <span className="lbl" title={s.name}>
                    {s.name}
                  </span>
                  <button
                    className="del"
                    title="Delete space"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelSpace(s);
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
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
                      <span className="lbl" title={p.title}>
                        {p.title}
                      </span>
                      <button
                        className="del"
                        title="Delete document"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDel(p);
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
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
          <button className="tree-add" onClick={() => setSpaceModal(true)}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New space
          </button>
        </aside>

        <div className="doc-main">
          <div className="doc-topbar">
            <div className="doc-crumbs">
              <span>{active ? spaceName(active.spaceId) : "—"}</span>
              <span className="sep">/</span>
              <b>{active?.title ?? "—"}</b>
            </div>
            <div className="right">
              <button className="tbtn" title="Star" onClick={() => toast("Star — coming soon")}>
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
              <button className="tbtn" title="Share" onClick={() => toast("Share — coming soon")}>
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
              <button className="tbtn" title="History" onClick={() => toast("History — coming soon")}>
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
              <div className="muted">No documents yet — create one to start writing.</div>
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
            onClick={() => toast("Upload — coming soon")}
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

      {confirmDel && (
        <Modal
          title="Delete document"
          onClose={() => setConfirmDel(null)}
          onBackdrop={() => setConfirmDel(null)}
        >
          <div className="mb">
            <p className="muted" style={{ fontSize: 13 }}>
              Delete <b>{confirmDel.title}</b>? It moves to the server&apos;s soft-delete state —
              the tree updates immediately.
            </p>
          </div>
          <div className="mf">
            <button className="btn ghost" onClick={() => setConfirmDel(null)}>
              Cancel
            </button>
            <button
              className="btn primary"
              style={{ background: "var(--danger)" }}
              onClick={deletePage}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {confirmDelSpace && (
        <Modal
          title="Delete space"
          onClose={() => setConfirmDelSpace(null)}
          onBackdrop={() => setConfirmDelSpace(null)}
        >
          <div className="mb">
            <p className="muted" style={{ fontSize: 13 }}>
              Delete <b>{confirmDelSpace.name}</b> and every document inside it? Both are
              soft-deleted on the server.
            </p>
          </div>
          <div className="mf">
            <button className="btn ghost" onClick={() => setConfirmDelSpace(null)}>
              Cancel
            </button>
            <button
              className="btn primary"
              style={{ background: "var(--danger)" }}
              onClick={deleteSpace}
            >
              Delete space
            </button>
          </div>
        </Modal>
      )}

      {spaceModal && (
        <Modal
          title="New space"
          onClose={() => setSpaceModal(false)}
          onBackdrop={() => setSpaceModal(false)}
        >
          <div className="mb">
            <label className="flab">Space name</label>
            <input
              className={`fld ${spaceErr ? "err" : ""}`}
              autoFocus
              value={spaceName2}
              onChange={(e) => {
                setSpaceName2(e.target.value);
                setSpaceErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && createSpace()}
              placeholder="e.g. Engineering"
            />
            {spaceErr && <div className="fld-err show">Please enter a name.</div>}
            <p className="muted tiny" style={{ marginTop: 8 }}>
              Spaces group documents in the tree — they act as folders.
            </p>
          </div>
          <div className="mf">
            <button className="btn ghost" onClick={() => setSpaceModal(false)}>
              Cancel
            </button>
            <button className="btn primary" onClick={createSpace}>
              Create space
            </button>
          </div>
        </Modal>
      )}
    </>
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
