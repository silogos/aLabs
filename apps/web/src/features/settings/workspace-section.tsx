/** Workspace section — org general settings, members, and invitations.
 *  Gates actions on the current user's membership role.permissions
 *  (cosmetic; the API is the source of truth). */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";
import { useInvitations } from "./queries";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { WORKSPACE_ROLES, PERM, hasPerm } from "./model";
import type { Invitation } from "@pmin/core";

export function WorkspaceSection() {
  const { org, user, toast } = useApp();
  const qc = useQueryClient();
  const { data: members } = useMembers(org?.id);
  const { data: invitations } = useInvitations(org?.id);

  const me = members?.find((m) => m.userId === user?.id);
  const canUpdateOrg = hasPerm(me?.role.permissions, PERM.orgUpdate);
  const canManageMembers = hasPerm(me?.role.permissions, PERM.memberUpdate);
  const canInvite = hasPerm(me?.role.permissions, PERM.memberCreate);
  const canRemove = hasPerm(me?.role.permissions, PERM.memberRemove);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: qk.members(org?.id) });
    await qc.invalidateQueries({ queryKey: qk.orgs() });
    await qc.invalidateQueries({ queryKey: qk.invitations(org?.id) });
  };

  // --- general ---
  const [name, setName] = useState(org?.name ?? "");
  const [slug, setSlug] = useState(org?.slug ?? "");
  const [description, setDescription] = useState(org?.description ?? "");
  const [website, setWebsite] = useState(org?.website ?? "");
  const [saving, setSaving] = useState(false);
  const saveOrg = async () => {
    if (!org) return;
    setSaving(true);
    try {
      await workspaceService.updateOrg(org.id, { name, slug, description, website });
      await refresh();
      toast("Workspace saved");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // --- members ---
  const setRole = async (memberId: string, roleName: string) => {
    if (!org) return;
    try {
      await workspaceService.updateMemberRole(org.id, memberId, { roleName });
      await refresh();
      toast("Role updated");
    } catch (e) {
      toast((e as Error).message);
    }
  };
  const removeMember = async (memberId: string) => {
    if (!org) return;
    try {
      await workspaceService.removeMember(org.id, memberId);
      await refresh();
      toast("Member removed");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  // --- invitations ---
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<string>(WORKSPACE_ROLES[3]!);
  const [invSaving, setInvSaving] = useState(false);
  const invite = async () => {
    if (!org) return;
    setInvSaving(true);
    try {
      await workspaceService.createInvitation(org.id, { email: invEmail, roleName: invRole });
      await refresh();
      setInvEmail("");
      toast("Invitation sent");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setInvSaving(false);
    }
  };
  const actOnInv = async (id: string, action: "accept" | "cancel") => {
    if (!org) return;
    try {
      await workspaceService.actOnInvitation(org.id, id, { action });
      await refresh();
      toast(action === "accept" ? "Invitation accepted" : "Invitation cancelled");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const isPersonal = org?.type === "personal";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
      {/* General */}
      <div className="card">
        <div className="panel-head"><h3>General</h3></div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="flab">Name</label>
            <input className="fld" value={name} disabled={!canUpdateOrg}
              onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="flab">Slug</label>
            <input className="fld" value={slug} disabled={!canUpdateOrg}
              onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="flab">Description</label>
            <textarea className="fld" rows={3} value={description} disabled={!canUpdateOrg}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="flab">Website</label>
            <input className="fld" value={website} disabled={!canUpdateOrg}
              onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn primary" disabled={!canUpdateOrg || saving}
              onClick={() => void saveOrg()}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <div className="panel-head"><h3>Members</h3><span className="muted">{members?.length ?? 0}</span></div>
        <div className="panel-body flush">
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
              <select className="fld" style={{ width: "auto" }}
                value={m.role.name} disabled={!canManageMembers}
                onChange={(e) => void setRole(m.id, e.target.value)}>
                {WORKSPACE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button className="btn ghost sm" disabled={!canRemove}
                onClick={() => void removeMember(m.id)}>Remove</button>
            </div>
          ))}
          {(!members || members.length === 0) && (
            <div className="tiny faint" style={{ padding: "14px" }}>No members.</div>
          )}
        </div>
      </div>

      {/* Invitations */}
      <div className="card">
        <div className="panel-head"><h3>Invitations</h3></div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isPersonal ? (
            <div className="tiny faint">Personal workspaces can&apos;t invite members.</div>
          ) : (
            <>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <input className="fld" style={{ flex: 1, minWidth: 200 }} type="email"
                  placeholder="Email" value={invEmail} disabled={!canInvite}
                  onChange={(e) => setInvEmail(e.target.value)} />
                <select className="fld" style={{ width: "auto" }} value={invRole}
                  disabled={!canInvite} onChange={(e) => setInvRole(e.target.value)}>
                  {WORKSPACE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button className="btn primary sm" disabled={!canInvite || invSaving}
                  onClick={() => void invite()}>Invite</button>
              </div>
              <InvitationList invitations={invitations} canManage={canInvite}
                onAct={actOnInv} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InvitationList({
  invitations,
  canManage,
  onAct,
}: {
  invitations: Invitation[] | undefined;
  canManage: boolean;
  onAct: (id: string, action: "accept" | "cancel") => void;
}) {
  if (!invitations || invitations.length === 0)
    return <div className="tiny faint">No invitations.</div>;
  return (
    <div className="panel-body flush" style={{ paddingLeft: 0, paddingRight: 0 }}>
      {invitations.map((iv) => (
        <div key={iv.id} className="mrow" style={{ alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{iv.email}</div>
            <div className="tiny faint">as {iv.roleName} · expires {dateShort(iv.expiresAt)}</div>
          </div>
          <span className={`status ${iv.status === "pending" ? "info" : iv.status === "accepted" ? "ok" : "neutral"}`}>
            <span className="d" />{iv.status}
          </span>
          {canManage && iv.status === "pending" && (
            <>
              <button className="btn ghost sm" onClick={() => onAct(iv.id, "accept")}>Accept</button>
              <button className="btn ghost sm" onClick={() => onAct(iv.id, "cancel")}>Cancel</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
