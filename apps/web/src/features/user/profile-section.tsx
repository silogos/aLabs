/** Profile section — edit the signed-in user's name + avatar image. */
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { useApp } from "@/providers/app-provider";
import { qk } from "@/lib/query-keys";
import { Avatar } from "@/components/ui/avatar";

export function ProfileSection() {
  const { user, toast } = useApp();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await authService.updateMe({ name });
      await qc.invalidateQueries({ queryKey: qk.me() });
      toast("Profile saved");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setBusy(true);
    try {
      await authService.uploadAvatar(file);
      await qc.invalidateQueries({ queryKey: qk.me() });
      toast("Avatar updated");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeAvatar = async () => {
    setBusy(true);
    try {
      await authService.updateMe({ image: null });
      await qc.invalidateQueries({ queryKey: qk.me() });
      toast("Avatar removed");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="panel-head">
        <h3>Profile</h3>
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar user={{ id: user.id, name, image: user.image }} size="lg" />
          <div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div className="tiny faint">{user.email}</div>
          </div>
        </div>

        <div>
          <label className="flab">Name</label>
          <input className="fld" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="flab">Avatar</label>
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {user.image && (
              <button className="btn ghost" disabled={busy} onClick={() => void removeAvatar()}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAvatar(file);
              e.target.value = ""; // allow re-picking the same file
            }}
          />
          <div className="tiny faint" style={{ marginTop: 4 }}>
            PNG, JPEG, GIF, WebP or AVIF — 5 MB max.
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button className="btn primary" disabled={saving} onClick={() => void save()}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
