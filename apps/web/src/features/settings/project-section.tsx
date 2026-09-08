/** Project section — project administration: general settings, project
 *  members, and the danger zone (soft delete, gated by the current user's
 *  project role permissions; typing the project name confirms). Mirrors the
 *  org settings view's design (features/org/org-settings-view.tsx). */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { useApp, landingProject } from "@/providers/app-provider";
import { useProjectMembers } from "./queries";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { IconPicker } from "@/components/ui/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { hueFor, projColor } from "@/components/nav-data";
import { PROJECT_ROLES, PERM, hasPerm } from "./model";
import type { ProjectStatus, ProjectVisibility } from "@pmin/core";

const STATUS_OPTIONS: ProjectStatus[] = ["active", "on_hold", "archived"];
const VIS_OPTIONS: ProjectVisibility[] = ["organization", "private"];

export function ProjectSection() {
  const { project, user, projects, recents, toast, switchProject } = useApp();
  const qc = useQueryClient();
  const router = useRouter();
  const { data: members } = useProjectMembers(project?.id);

  const me = members?.find((m) => m.userId === user?.id);
  const canUpdate = hasPerm(me?.role.permissions, PERM.projectUpdate);
  const canManage = hasPerm(me?.role.permissions, PERM.projectManageMembers);
  const canDelete = hasPerm(me?.role.permissions, PERM.projectDelete);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: qk.projects(project?.organizationId ?? "") });
    await qc.invalidateQueries({ queryKey: qk.projectMembers(project?.id) });
  };

  // --- general (re-syncs only when this project or its server state changes) ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [visibility, setVisibility] = useState<ProjectVisibility>("organization");
  const [saving, setSaving] = useState(false);
  const syncKey = project ? `${project.id}|${project.updatedAt}` : "";
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    if (!project || syncKey === lastSync) return;
    setName(project.name);
    setSlug(project.slug ?? "");
    setKey(project.key ?? "");
    setDescription(project.description ?? "");
    setIcon(project.icon ?? "");
    setStatus(project.status ?? "active");
    setVisibility(project.visibility ?? "organization");
    setLastSync(syncKey);
  }, [project, syncKey, lastSync]);

  const saveProject = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await workspaceService.updateProject(project.organizationId, project.id, {
        name, slug, key, description, icon, status, visibility,
      });
      await refresh();
      toast("Project saved");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // --- danger zone ---
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const doDelete = async () => {
    if (!project) return;
    setDeleting(true);
    // the next project to land in, computed before the delete invalidates caches
    const next = landingProject(
      (projects ?? []).filter((p) => p.id !== project.id),
      recents,
    );
    try {
      await workspaceService.deleteProject(project.organizationId, project.id);
      await qc.invalidateQueries({ queryKey: qk.projects(project.organizationId) });
      await qc.removeQueries({ queryKey: qk.projectMembers(project.id) });
      setDeleteOpen(false);
      if (next) {
        switchProject(next);
      } else {
        // no projects left in this org — org management is the next stop
        router.push("/org/projects");
      }
      toast(`${project.name} deleted`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  // --- members ---
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<string>(PROJECT_ROLES[2]!);
  const [addSaving, setAddSaving] = useState(false);
  const addMember = async () => {
    if (!project) return;
    setAddSaving(true);
    try {
      await workspaceService.addProjectMember(project.id, { email: addEmail, roleName: addRole });
      await refresh();
      setAddEmail("");
      toast("Member added");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setAddSaving(false);
    }
  };
  const setProjectRole = async (memberId: string, roleName: string) => {
    if (!project) return;
    try {
      await workspaceService.updateProjectMember(project.id, memberId, { roleName });
      await refresh();
      toast("Role updated");
    } catch (e) {
      toast((e as Error).message);
    }
  };
  const acceptMember = async (memberId: string) => {
    if (!project) return;
    try {
      await workspaceService.updateProjectMember(project.id, memberId, { status: "active" });
      await refresh();
      toast("Member accepted");
    } catch (e) {
      toast((e as Error).message);
    }
  };
  const removeMember = async (memberId: string) => {
    if (!project) return;
    try {
      await workspaceService.removeProjectMember(project.id, memberId);
      await refresh();
      toast("Member removed");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  if (!project) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
      {/* General */}
      <div className="card">
        <div className="panel-head"><h3>General</h3></div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="flab">Name</label>
              <input className="fld" value={name} disabled={!canUpdate}
                onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ width: 90 }}>
              <label className="flab">Key</label>
              <input className="fld" value={key} disabled={!canUpdate}
                onChange={(e) => setKey(e.target.value.toUpperCase())} maxLength={10} />
            </div>
          </div>
          <div>
            <label className="flab">Slug</label>
            <input className="fld" value={slug} disabled={!canUpdate}
              onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="flab">Description</label>
            <textarea className="fld" rows={3} value={description} disabled={!canUpdate}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <div>
              <label className="flab">Status</label>
              <select className="fld" style={{ width: "auto" }} value={status}
                disabled={!canUpdate} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="flab">Visibility</label>
              <select className="fld" style={{ width: "auto" }} value={visibility}
                disabled={!canUpdate} onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}>
                {VIS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ width: 90 }}>
              <label className="flab">Icon</label>
              <IconPicker
                value={icon || undefined}
                fallback="＋"
                color={icon ? projColor(hueFor(icon)) : "color-mix(in oklab, var(--fg) 10%, transparent)"}
                size={32}
                radius={9}
                disabled={!canUpdate}
                onChange={(v) => setIcon(v ?? "")}
                title={canUpdate ? "Choose an icon" : "Read-only"}
              />
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn primary" disabled={!canUpdate || saving}
              onClick={() => void saveProject()}>
              {saving ? "Saving…" : "Save"}
            </button>
            <span className="tiny faint" style={{ alignSelf: "center" }}>
              Created {dateShort(project.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <div className="panel-head"><h3>Members</h3><span className="muted">{members?.length ?? 0}</span></div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <input className="fld" style={{ flex: 1, minWidth: 200 }} type="email"
              placeholder="Org member email" value={addEmail} disabled={!canManage}
              onChange={(e) => setAddEmail(e.target.value)} />
            <select className="fld" style={{ width: "auto" }} value={addRole}
              disabled={!canManage} onChange={(e) => setAddRole(e.target.value)}>
              {PROJECT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn primary sm" disabled={!canManage || addSaving}
              onClick={() => void addMember()}>Add</button>
          </div>
          <div className="panel-body flush" style={{ paddingLeft: 0, paddingRight: 0 }}>
            {members?.map((m) => (
              <div key={m.id} className="mrow" style={{ alignItems: "center", gap: 10 }}>
                <Avatar user={m.user} size="sm" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{m.user.name}</div>
                  <div className="tiny faint">{m.user.email}</div>
                </div>
                <span className={`status ${m.status === "active" ? "ok" : "neutral"}`}>
                  <span className="d" />{m.status}
                </span>
                {m.status === "pending" && canManage && (
                  <button className="btn ghost sm" onClick={() => void acceptMember(m.id)}>Accept</button>
                )}
                <select className="fld" style={{ width: "auto" }} value={m.role.name}
                  disabled={!canManage} onChange={(e) => void setProjectRole(m.id, e.target.value)}>
                  {PROJECT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button className="btn ghost sm" disabled={!canManage}
                  onClick={() => void removeMember(m.id)}>Remove</button>
              </div>
            ))}
            {(!members || members.length === 0) && (
              <div className="tiny faint" style={{ padding: "14px" }}>No project members.</div>
            )}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card">
        <div className="panel-head">
          <h3>Danger zone</h3>
        </div>
        <div className="panel-body">
          <div className="row between wrap" style={{ gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Delete this project</div>
              <div className="tiny faint" style={{ marginTop: 2 }}>
                Soft-deletes the project — its tasks, documents and plans become unreachable. Cannot be undone from here.
              </div>
            </div>
            <button
              className="btn danger sm"
              disabled={!canDelete}
              title={canDelete ? undefined : "Your project role cannot delete this project"}
              onClick={() => setDeleteOpen(true)}
              data-od-id="project-settings-delete"
            >
              Delete project
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete project"
        description={
          <>
            This will delete <b>{project.name}</b> with all of its tasks, documents and plans. Type the project name to confirm.
          </>
        }
        requireText={project.name}
        confirmLabel="Delete forever"
        busyLabel="Deleting…"
        danger
        busy={deleting}
        onConfirm={() => void doDelete()}
        onClose={() => setDeleteOpen(false)}
        data-od-id="project-delete-modal"
      />
    </div>
  );
}
