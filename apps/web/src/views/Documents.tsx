/** Documents view — space/page tree, rendered page content, files. */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api.js";
import { useApp } from "../store.js";
import { initials, colorFor, timeAgo } from "../components/ui.js";
import type { Block, Page } from "@pmin/core";

export function Documents() {
  const { project, toast } = useApp();
  const pid = project!.id;
  const { data: spaces } = useQuery({ queryKey: ["spaces", pid], queryFn: () => api.spaces(pid) });
  const { data: pageData } = useQuery({ queryKey: ["pages", pid], queryFn: () => api.pages(pid) });
  const { data: files } = useQuery({ queryKey: ["files", pid], queryFn: () => api.files(pid) });
  const { data: members } = useQuery({ queryKey: ["members", project?.organizationId], queryFn: () => api.members(project!.organizationId), enabled: !!project });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const pages = pageData?.items ?? [];
  // group pages by space
  const bySpace = (sid: string) => pages.filter((p) => p.spaceId === sid);
  const active = pages.find((p) => p.id === activePageId) ?? pages.find((p) => p.title === "Architecture") ?? pages[0];

  return (
    <section className="view active">
      <div className="toolbar">
        <button className="btn subtle sm">All spaces</button>
        <button className="chip btn on">Engineering</button>
        <button className="chip btn">Product</button>
        <button className="chip btn">Design</button>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn ghost sm" onClick={() => toast("Import — pick a file")}>Import</button>
          <button className="btn primary sm" onClick={() => toast("New page — pick a space")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New page
          </button>
        </div>
      </div>

      <div className="docs-grid">
        <aside className="doc-tree">
          <div className="tree-search">
            <span className="ico">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input placeholder="Search documents…" />
          </div>
          {(spaces ?? []).map((s) => {
            const isCollapsed = collapsed[s.id];
            const sp = bySpace(s.id);
            return (
              <div className={`space ${isCollapsed ? "collapsed" : ""}`} key={s.id}>
                <div className="space-h" onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))}>
                  <span className="emo">{s.icon ?? "📄"}</span>
                  {s.name}
                  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  {sp.length === 0 && !isCollapsed && (
                    <div className="page-item" style={{ color: "var(--faint)" }}>— empty —</div>
                  )}
                </div>
              </div>
            );
          })}
        </aside>

        <div className="doc-main">
          <div className="doc-topbar">
            <div className="doc-crumbs">
              <span>{spaces?.find((s) => s.id === active?.spaceId)?.name ?? "—"}</span>
              <span className="sep">/</span>
              <b>{active?.title ?? "—"}</b>
            </div>
            <div className="right">
              <button className="tbtn" title="Star">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                </svg>
              </button>
              <button className="tbtn" title="Share">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
              </button>
              <button className="tbtn" title="History">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3v5h5M3.1 9a9 9 0 1 0 2.1-3.6L3 8" /><path d="M12 7v5l3 2" />
                </svg>
              </button>
              {(members ?? []).slice(0, 3).map((m) => (
                <span key={m.user.id} className={`av sm ${colorFor(m.user.id)}`} title={m.user.name}>
                  {initials(m.user.name)}
                </span>
              ))}
              <button className="btn sm" style={{ marginLeft: 6 }}>Edit</button>
            </div>
          </div>
          <div className="doc-content">
            {active ? <PageView page={active} /> : <div className="muted">Select a page.</div>}
          </div>
        </div>
      </div>

      {/* Files */}
      <div style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>Files & attachments</h2>
          <span className="link" style={{ marginLeft: "auto" }} onClick={() => toast("Upload — pick a file")}>Upload</span>
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

function PageView({ page }: { page: Page }) {
  return (
    <>
      <h1>
        <span>{page.icon ?? "📄"}</span>
        {page.title}
      </h1>
      <div className="byline">
        Edited by <b style={{ color: "var(--fg)" }}>{page.editedBy?.name ?? "—"}</b> · {timeAgo(page.updatedAt)}
      </div>
      {(page.content ?? []).map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading1":
    case "heading2":
    case "heading3":
      return <h2>{block.data.text}</h2>;
    case "paragraph":
      return <p>{block.data.text}</p>;
    case "bulletList":
      return (
        <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
          {block.data.items.map((it, i) => (
            <li key={i} style={{ fontSize: 13.5, color: "var(--fg)", marginBottom: 4 }}>{it}</li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol style={{ paddingLeft: 20, margin: "8px 0" }}>
          {block.data.items.map((it, i) => (
            <li key={i} style={{ fontSize: 13.5, color: "var(--fg)", marginBottom: 4 }}>{it}</li>
          ))}
        </ol>
      );
    case "todo":
      return (
        <div className={`doc-check ${block.data.checked ? "done" : ""}`}>
          <input type="checkbox" className="ck" defaultChecked={block.data.checked} />
          {block.data.text}
        </div>
      );
    case "quote":
      return <blockquote className="callout info"><span>{block.data.text}</span></blockquote>;
    case "code":
      return <pre className="codeblock">{block.data.text}</pre>;
    case "divider":
      return <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />;
    case "callout": {
      const variant = block.data.variant === "warning" ? "warn" : block.data.variant === "success" ? "info" : "info";
      return (
        <div className={`callout ${variant}`}>
          <svg className="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>{block.data.text}</span>
        </div>
      );
    }
    case "image":
      return (
        <figure style={{ margin: "14px 0" }}>
          <img src={block.data.fileId} alt={block.data.caption ?? ""} style={{ maxWidth: "100%", borderRadius: 8 }} />
          {block.data.caption && <figcaption className="tiny muted">{block.data.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

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
