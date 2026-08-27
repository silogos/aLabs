/** Profile section — edit the signed-in user's name + avatar image. */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { useApp } from "@/providers/app-provider";
import { qk } from "@/lib/query-keys";
import { Avatar } from "@/components/ui/avatar";

export function ProfileSection() {
  const { user, toast } = useApp();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [image, setImage] = useState(user?.image ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await authService.updateMe({ name, image: image || null });
      await qc.invalidateQueries({ queryKey: qk.me() });
      toast("Profile saved");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card" style={{ maxWidth:560 }}>
      <div className="panel-head">
        <h3>Profile</h3>
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap:14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar user={{ id: user.id, name }} size="lg" />
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
          <label className="flab">Avatar image URL</label>
          <input
            className="fld"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://…"
          />
          <div className="tiny faint" style={{ marginTop: 4 }}>
            Paste an image URL. Upload is coming later.
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
