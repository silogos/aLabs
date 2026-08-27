/** Project section — project general settings + project members.
 *  Gates actions on the current user's project membership role.permissions
 *  (cosmetic; the API is the source of truth). */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { useApp } from "@/providers/app-provider";
import { useProjectMembers } from "./queries";
import { qk } from "@/lib/query-keys";
import { Avatar } from "@/components/ui/avatar";
import { PROJECT_ROLES, PERM, hasPerm } from "./model";
import type { ProjectStatus, ProjectVisibility } from "@pmin/core";

const STATUS_OPTIONS: ProjectStatus[] = ["active", "on_hold", "archived"];
const VIS_OPTIONS: ProjectVisibility[] = ["organization", "private"];

export function ProjectSection() {
  const { project, user, toast } = useApp();
  const qc = useQueryClient();
  const { data: members } = useProjectMembers(project?.id);

  const me = members?.find((m) => m.userId === user?.id);
  const canUpdate = hasPerm(me?.role.permissions, PERM.projectUpdate);
  const canManage = hasPerm(me?.role.permissions, PERM.projectManageMembers);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: qk.projects(project?.organizationId ?? "") });
    await qc.invalidateQueries({ queryKey: qk.projectMembers(project?.id) });
  };

  // --- general ---
  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [key, setKey] = useState(project?.key ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [icon, setIcon] = useState(project?.icon ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [visibility, setVisibility] = useState<ProjectVisibility>(
    project?.visibility ?? "organization",
  );
  const [saving, setSaving] = useState(false);
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
              <input className="fld" value={icon} disabled={!canUpdate}
                onChange={(e) => setIcon(e.target.value)} maxLength={20} />
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn primary" disabled={!canUpdate || saving}
              onClick={() => void saveProject()}>
              {saving ? "Saving…" : "Save"}
            </button>
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
    </div>
  );
}
