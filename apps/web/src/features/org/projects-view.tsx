"use client";

/** Org projects — the organization's project portfolio: search + status
 *  filter, create (shared modal). Rows open the project drawer (right side)
 *  with full details and every status/delete action; the table itself stays
 *  read-only. Gated on the member's workspace role. */
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { PERM, hasPerm } from "@/features/settings/model";
import { NewProjectModal } from "./new-project-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import { hueFor, projColor } from "@/components/nav-data";
import { ProjectStatus } from "./overview-view";
import type { Project } from "@pmin/core";

type Filter = "all" | "active" | "on_hold" | "archived";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "on_hold", label: "On hold" },
  { id: "archived", label: "Archived" },
];

export function OrgProjectsView() {
  const { org, projects, user, switchProject, toast } = useApp();
  const qc = useQueryClient();
  const { data: members } = useMembers(org?.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const me = members?.find((m) => m.userId === user?.id);
  const canCreate = hasPerm(me?.role.permissions, PERM.projectCreate);
  const canUpdate = hasPerm(me?.role.permissions, PERM.projectUpdate);
  const canDelete = hasPerm(me?.role.permissions, PERM.projectDelete);

  /** Derived from the live list so the drawer stays fresh after mutations —
   *  and closes by itself when the project is deleted. */
  const selected = useMemo(
    () => projects?.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Innermost surface first: confirm dialog, then the action menu, then the drawer.
      if (confirmDelete) setConfirmDelete(false);
      else if (menuOpen) setMenuOpen(false);
      else setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, menuOpen, confirmDelete]);

  const refresh = async () => {
    if (org) await qc.invalidateQueries({ queryKey: qk.projects(org.id) });
  };

  const setStatus = async (p: Project, status: "active" | "on_hold" | "archived") => {
    if (!org) return;
    setBusyId(p.id);
    try {
      await workspaceService.updateProject(org.id, p.id, { status });
      await refresh();
      toast(`${p.name} → ${status === "on_hold" ? "on hold" : status === "active" ? "active" : "archived"}`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: Project) => {
    if (!org) return;
    setBusyId(p.id);
    try {
      await workspaceService.deleteProject(org.id, p.id);
      await refresh();
      toast(`${p.name} deleted`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusyId(null);
      setConfirmDelete(false);
    }
  };

  const setIcon = async (p: Project, icon: string | null) => {
    if (!org) return;
    setBusyId(p.id);
    try {
      await workspaceService.updateProject(org.id, p.id, { icon: icon ?? null });
      await refresh();
      toast(icon ? "Icon updated" : "Icon reset to initial");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (projects ?? [])
      .filter((p) => filter === "all" || p.status === filter)
      .filter(
        (p) =>
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [projects, filter, q]);

  if (!org || !projects) {
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Projects</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Every project in {org.name} — {projects.filter((p) => p.status === "active").length}{" "}
            active of {projects.length}
          </div>
        </div>
        <button
          className="btn primary sm"
          disabled={!canCreate}
          title={canCreate ? undefined : "You don't have permission to create projects"}
          onClick={() => setNewOpen(true)}
          data-od-id="org-projects-new"
        >
          New project
        </button>
      </div>

      <div className="toolbar" style={{ paddingLeft: 0, marginBottom: 12 }}>
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="fld"
          style={{ width: 220 }}
          placeholder="Search name or key…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="dt" data-od-id="org-projects-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedId(p.id);
                    setMenuOpen(false);
                    setConfirmDelete(false);
                  }}
                >
                  <td>
                    <div className="row" style={{ gap: 9, minWidth: 0 }}>
                      <span className="pico" style={{ background: projColor(hueFor(p.id)) }}>
                        {p.icon ?? p.name[0]}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="tiny faint mono">
                          {p.key} · {p.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <ProjectStatus status={p.status} />
                  </td>
                  <td>
                    <span className="chip muted">{p.visibility === "organization" ? "Organization" : "Private"}</span>
                  </td>
                  <td className="mono tiny" style={{ color: "var(--muted)" }}>
                    {dateShort(p.createdAt)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="tiny faint" style={{ padding: "10px 0" }}>
                      {q || filter !== "all"
                        ? "No projects match these filters."
                        : "No projects yet — create the first one."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <>
          <div className="scrim show" onClick={() => setSelectedId(null)} />
          <ProjectDrawer
            project={selected}
            busy={busyId === selected.id}
            canUpdate={canUpdate}
            canDelete={canDelete}
            menuOpen={menuOpen}
            onMenuOpen={setMenuOpen}
            onConfirmDelete={setConfirmDelete}
            onOpen={() => {
              setMenuOpen(false);
              switchProject(selected);
            }}
            onStatus={(s) => void setStatus(selected, s)}
            onIcon={(icon) => void setIcon(selected, icon)}
            onClose={() => setSelectedId(null)}
          />
          <ConfirmDialog
            open={confirmDelete}
            title="Delete project"
            description={
              <>
                This will soft-delete <b>{selected.name}</b>. It disappears from every list until
                restored — nothing is permanently erased.
              </>
            }
            confirmLabel="Yes, delete"
            busyLabel="Deleting…"
            danger
            busy={busyId === selected.id}
            onConfirm={() => void remove(selected)}
            onClose={() => setConfirmDelete(false)}
            data-od-id="org-project-delete-dialog"
          />
        </>
      )}

      <NewProjectModal open={newOpen} onClose={() => setNewOpen(false)} />
    </section>
  );
}

/** Project drawer — details (meta grid + description); all actions live in
 *  the popup menu on the footer's split "Open project" button. */
function ProjectDrawer({
  project,
  busy,
  canUpdate,
  canDelete,
  menuOpen,
  onMenuOpen,
  onConfirmDelete,
  onOpen,
  onStatus,
  onIcon,
  onClose,
}: {
  project: Project;
  busy: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  menuOpen: boolean;
  onMenuOpen: (v: boolean) => void;
  onConfirmDelete: (v: boolean) => void;
  onOpen: () => void;
  onStatus: (s: "active" | "on_hold" | "archived") => void;
  onIcon: (icon: string | null) => void;
  onClose: () => void;
}) {
  const hasActions = canUpdate || canDelete;
  return (
    <aside className="drawer show" data-od-id="org-project-drawer">
      <div className="dh">
        <IconPicker
          value={project.icon}
          fallback={project.name[0]}
          color={projColor(hueFor(project.id))}
          size={38}
          radius={10}
          disabled={!canUpdate || busy}
          onChange={onIcon}
          title={canUpdate ? "Change icon" : "Read-only"}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dh-top row" style={{ gap: 8 }}>
            <ProjectStatus status={project.status} />
            <span className="tid mono">{project.key}</span>
          </div>
          <h3>{project.name}</h3>
        </div>
        <button className="x" onClick={onClose} title="Close (Esc)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="db">
        {project.description ? (
          <p className="small" style={{ color: "var(--fg)", margin: "0 0 16px" }}>
            {project.description}
          </p>
        ) : null}

        <div className="tiny muted" style={{ letterSpacing: 0.04, textTransform: "uppercase", marginBottom: 10 }}>
          Details
        </div>
        <div className="meta-grid">
          <div className="k">Status</div>
          <div className="v">
            <ProjectStatus status={project.status} />
          </div>
          <div className="k">Visibility</div>
          <div className="v">
            <span className="chip muted">{project.visibility === "organization" ? "Organization" : "Private"}</span>
          </div>
          <div className="k">Project key</div>
          <div className="v mono">{project.key}</div>
          <div className="k">Slug</div>
          <div className="v mono">{project.slug}</div>
          <div className="k">Created</div>
          <div className="v mono">{dateShort(project.createdAt)}</div>
        </div>
      </div>
      <div className="df">
        <div className="split">
                  <button className="go" onClick={onOpen} title="Switch into this project's workspace">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7" />
                      <path d="M9 7h8v8" />
                    </svg>
                    Open project
                  </button>
                  {hasActions && (
                    <button
                      className="caret"
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      title="Project actions"
                      disabled={busy}
                      onClick={() => onMenuOpen(!menuOpen)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </button>
                  )}
                  {menuOpen && hasActions && (
                    <div className="menu-pop" role="menu" data-od-id="org-project-actions-menu">
                      {canUpdate && project.status === "active" && (
                        <button role="menuitem" onClick={() => { onMenuOpen(false); onStatus("on_hold"); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                          Put on hold
                        </button>
                      )}
                      {canUpdate && project.status === "on_hold" && (
                        <button role="menuitem" onClick={() => { onMenuOpen(false); onStatus("active"); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                            <path d="M8 5.5v13l11-6.5z" />
                          </svg>
                          Resume project
                        </button>
                      )}
                      {canUpdate && project.status !== "archived" && (
                        <button role="menuitem" onClick={() => { onMenuOpen(false); onStatus("archived"); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="5" rx="1" />
                            <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
                          </svg>
                          Archive
                        </button>
                      )}
                      {canUpdate && project.status === "archived" && (
                        <button role="menuitem" onClick={() => { onMenuOpen(false); onStatus("active"); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                          Restore
                        </button>
                      )}
                      {canDelete && (
                        <>
                          <div className="sep" />
                          <button role="menuitem" className="danger" onClick={() => { onMenuOpen(false); onConfirmDelete(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
                            </svg>
                            Delete project…
                          </button>
                        </>
                      )}
                    </div>
                  )}
            </div>
        <div className="tiny faint" style={{ marginLeft: "auto" }}>
          Switches into the project workspace
        </div>
      </div>
    </aside>
  );
}
