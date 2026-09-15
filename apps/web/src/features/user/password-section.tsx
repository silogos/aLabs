/** Password section — change the signed-in user's password. Keeps this
 *  device signed in; the API revokes every other session. */
import { useState } from "react";
import { authService } from "@/services/auth";
import { useApp } from "@/providers/app-provider";

export function PasswordSection() {
  const { toast } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (password !== confirm) {
      toast("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword, password });
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
      toast("Password changed");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="panel-head">
        <h3>Password</h3>
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="flab">Current password</label>
          <input
            className="fld"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="flab">New password</label>
          <input
            className="fld"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="tiny faint" style={{ marginTop: 4 }}>
            At least 8 characters. Other signed-in devices will be signed out.
          </div>
        </div>
        <div>
          <label className="flab">Confirm new password</label>
          <input
            className="fld"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn primary"
            disabled={saving || !currentPassword || !password || !confirm}
            onClick={() => void save()}
          >
            {saving ? "Changing…" : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}
