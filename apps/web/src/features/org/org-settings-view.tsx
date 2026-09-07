"use client";

/** Org settings — general organization profile (name, description, website,
 *  timezone, language) and the danger zone (soft delete, owner-gated by the
 *  API; typing the org name confirms). Replaces the old settings "Workspace"
 *  tab now that org management is its own area. */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";
import { workspaceService } from "@/services/workspace";
import { authService } from "@/services/auth";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { PERM, hasPerm } from "@/features/settings/model";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function OrgSettingsView() {
  const { org, orgs, user, toast, switchOrg } = useApp();
  const qc = useQueryClient();
  const router = useRouter();
  const { data: members } = useMembers(org?.id);

  const me = members?.find((m) => m.userId === user?.id);
  const canUpdate = hasPerm(me?.role.permissions, PERM.orgUpdate);
  const canDelete = hasPerm(me?.role.permissions, PERM.orgDelete);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // re-sync the form only when this org (or its server state) actually changes
  const syncKey = org ? `${org.id}|${org.updatedAt}` : "";
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    if (!org || syncKey === lastSync) return;
    setName(org.name);
    setDescription(org.description ?? "");
    setWebsite(org.website ?? "");
    setTimezone(org.timezone || "UTC");
    setLanguage(org.language || "en");
    setLastSync(syncKey);
  }, [org, syncKey, lastSync]);

  if (!org) {
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      await workspaceService.updateOrg(org.id, {
        name: name.trim(),
        description: description.trim(),
        website: website.trim() || null,
        timezone: timezone.trim() || "UTC",
        language: language.trim() || "en",
      });
      await qc.invalidateQueries({ queryKey: qk.orgs() });
      toast("Organization saved");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    // the next org to land in, computed before the delete invalidates caches
    const next = (orgs ?? []).find((o) => o.id !== org.id);
    try {
      await workspaceService.deleteOrg(org.id);
      await qc.invalidateQueries({ queryKey: qk.orgs() });
      await qc.removeQueries({ queryKey: qk.projects(org.id) });
      await qc.removeQueries({ queryKey: qk.members(org.id) });
      setDeleteOpen(false);
      if (next) {
        switchOrg(next.id);
        toast(`${org.name} deleted`);
      } else {
        // no remaining membership — end the session
        await authService.logout().catch(() => {});
        qc.clear();
        router.replace("/login");
      }
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Organization settings</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Profile and preferences for {org.name}
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 14, maxWidth: 720 }}>
        <div className="card">
          <div className="panel-head">
            <h3>General</h3>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="flab">Name</label>
              <input
                className="fld"
                value={name}
                disabled={!canUpdate}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="flab">Slug</label>
                <input className="fld mono" value={org.slug} disabled title="Slugs are immutable" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="flab">Type</label>
                <input
                  className="fld"
                  value={org.type === "personal" ? "Personal workspace" : "Team workspace"}
                  disabled
                  title="Set at creation"
                />
              </div>
            </div>
            <div>
              <label className="flab">Description</label>
              <textarea
                className="fld"
                rows={3}
                value={description}
                disabled={!canUpdate}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="flab">Website</label>
              <input
                className="fld"
                value={website}
                disabled={!canUpdate}
                placeholder="https://"
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="flab">Timezone</label>
                <input
                  className="fld"
                  value={timezone}
                  disabled={!canUpdate}
                  placeholder="UTC"
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="flab">Language</label>
                <input
                  className="fld"
                  value={language}
                  disabled={!canUpdate}
                  placeholder="en"
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button
                className="btn primary"
                disabled={!canUpdate || saving || !name.trim()}
                onClick={() => void save()}
                data-od-id="org-settings-save"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <span className="tiny faint" style={{ alignSelf: "center" }}>
                Created {dateShort(org.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="panel-head">
            <h3>Danger zone</h3>
          </div>
          <div className="panel-body">
            <div className="row between wrap" style={{ gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Delete this organization</div>
                <div className="tiny faint" style={{ marginTop: 2 }}>
                  Soft-deletes the org — every project under it becomes unreachable. Owners only.
                </div>
              </div>
              <button
                className="btn danger sm"
                disabled={!canDelete}
                title={canDelete ? undefined : "Only Owners can delete the workspace"}
                onClick={() => setDeleteOpen(true)}
                data-od-id="org-settings-delete"
              >
                Delete organization
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete organization"
        description={
          <>
            This will delete <b>{org.name}</b> and every project under it. Type the organization
            name to confirm.
          </>
        }
        requireText={org.name}
        confirmLabel="Delete forever"
        busyLabel="Deleting…"
        danger
        busy={deleting}
        onConfirm={() => void doDelete()}
        onClose={() => setDeleteOpen(false)}
        data-od-id="org-delete-modal"
      />
    </section>
  );
}
