"use client";

/** Org members — directory with workspace roles, invitations (create /
 *  accept / cancel), and a role legend. Ported from the old settings
 *  Workspace tab now that org management is its own area; actions gate on
 *  the current member's role permissions (API remains the source of truth). */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";
import { useInvitations } from "./queries";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WORKSPACE_ROLES, PERM, hasPerm } from "@/features/settings/model";
import type { Invitation } from "@pmin/core";

const ROLE_NOTES: Record<string, string> = {
  Owner: "Full access, including billing and deleting the workspace",
  Admin: "Everything except deleting the workspace",
  "Project Manager": "Creates and manages projects, tasks and planning",
  Member: "Works on projects they belong to",
  Viewer: "Read-only access with exports",
};

export function OrgMembersView() {
  const { org, user, toast } = useApp();
  const qc = useQueryClient();
  const { data: members, isError } = useMembers(org?.id);
  const { data: invitations } = useInvitations(org?.id);

  const me = members?.find((m) => m.userId === user?.id);
  const canManage = hasPerm(me?.role.permissions, PERM.memberUpdate);
  const canInvite = hasPerm(me?.role.permissions, PERM.memberCreate);
  const canRemove = hasPerm(me?.role.permissions, PERM.memberRemove);
  const isPersonal = org?.type === "personal";

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<string>(WORKSPACE_ROLES[3]!);
  const [invSaving, setInvSaving] = useState(false);

  const refresh = async () => {
    if (!org) return;
    await qc.invalidateQueries({ queryKey: qk.members(org.id) });
    await qc.invalidateQueries({ queryKey: qk.orgs() });
    await qc.invalidateQueries({ queryKey: qk.invitations(org.id) });
  };

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
    } finally {
      setConfirmId(null);
    }
  };

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

  if (!org) {
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
          <div className="h2">Members &amp; roles</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {members?.length ?? 0} member{members?.length === 1 ? "" : "s"} in {org.name}
            {" · "}
            {(invitations ?? []).filter((i) => i.status === "pending").length} pending invitation
            {(invitations ?? []).filter((i) => i.status === "pending").length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {isError && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="panel-body tiny" style={{ color: "var(--danger)" }}>
            You don&apos;t have permission to view the member list.
          </div>
        </div>
      )}

      <div className="stack" style={{ gap: 14, maxWidth: 980 }}>
        <div className="card">
          <div className="panel-head">
            <h3>Members</h3>
            <span className="muted">{members?.length ?? 0}</span>
          </div>
          <div className="panel-body flush">
            {(members ?? []).map((m) => (
              <div key={m.id} className="mrow" style={{ alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Avatar user={m.user} size="sm" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {m.user.name}
                    {m.userId === user?.id && <span className="tiny faint"> (you)</span>}
                  </div>
                  <div className="tiny faint">{m.user.email}</div>
                </div>
                <span className={`status ${m.status === "active" ? "ok" : "neutral"}`}>
                  <span className="d" />
                  {m.status}
                </span>
                <span className="tiny mono" style={{ color: "var(--muted)" }}>
                  joined {dateShort(m.joinedAt)}
                </span>
                <select
                  className="fld"
                  style={{ width: "auto" }}
                  value={m.role.name}
                  disabled={!canManage}
                  onChange={(e) => void setRole(m.id, e.target.value)}
                >
                  {WORKSPACE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {canRemove &&
                  (m.role.name === "Owner" ? (
                    <button className="btn ghost sm" disabled title="Owners can't be removed">
                      Remove
                    </button>
                  ) : (
                    <button className="btn ghost sm" onClick={() => setConfirmId(m.id)}>
                      Remove
                    </button>
                  ))}
              </div>
            ))}
            {members?.length === 0 && (
              <div className="tiny faint" style={{ padding: 14 }}>
                No members.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="panel-head">
            <h3>Invitations</h3>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isPersonal ? (
              <div className="tiny faint">
                Personal workspaces can&apos;t invite members — they stay single-member.
              </div>
            ) : (
              <>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <input
                    className="fld"
                    style={{ flex: 1, minWidth: 200 }}
                    type="email"
                    placeholder="Email address"
                    value={invEmail}
                    disabled={!canInvite}
                    onChange={(e) => setInvEmail(e.target.value)}
                  />
                  <select
                    className="fld"
                    style={{ width: "auto" }}
                    value={invRole}
                    disabled={!canInvite}
                    onChange={(e) => setInvRole(e.target.value)}
                  >
                    {WORKSPACE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn primary sm"
                    disabled={!canInvite || invSaving || !invEmail.includes("@")}
                    onClick={() => void invite()}
                    data-od-id="org-members-invite"
                  >
                    {invSaving ? "Sending…" : "Invite"}
                  </button>
                </div>
                <InvitationList invitations={invitations} canManage={canInvite} onAct={actOnInv} />
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="panel-head">
            <h3>Workspace roles</h3>
            <span className="muted">System roles</span>
          </div>
          <div className="panel-body flush">
            {WORKSPACE_ROLES.map((r) => (
              <div key={r} className="mrow" style={{ alignItems: "center", gap: 10 }}>
                <span className="chip muted">{r}</span>
                <span className="small" style={{ color: "var(--muted)" }}>
                  {ROLE_NOTES[r]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Remove member"
        description={
          <>
            Remove <b>{members?.find((m) => m.id === confirmId)?.user.name}</b> from {org.name}?
            They lose access to every project in this workspace until invited again.
          </>
        }
        confirmLabel="Yes, remove"
        busyLabel="Removing…"
        danger
        onConfirm={() => confirmId && void removeMember(confirmId)}
        onClose={() => setConfirmId(null)}
        data-od-id="org-member-remove-dialog"
      />
    </section>
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
    <div>
      {invitations.map((iv) => (
        <div key={iv.id} className="mrow" style={{ alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 600 }}>{iv.email}</div>
            <div className="tiny faint">
              as {iv.roleName} · expires {dateShort(iv.expiresAt)}
            </div>
          </div>
          <span
            className={`status ${iv.status === "pending" ? "info" : iv.status === "accepted" ? "ok" : "neutral"}`}
          >
            <span className="d" />
            {iv.status}
          </span>
          {canManage && iv.status === "pending" && (
            <>
              <button className="btn ghost sm" onClick={() => onAct(iv.id, "accept")}>
                Accept
              </button>
              <button className="btn ghost sm" onClick={() => onAct(iv.id, "cancel")}>
                Cancel
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
