"use client";

/** User profile view — profile editor + account info + sign out. The third
 *  surface after the project workspace (/dashboard…) and the org area (/org). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { authService } from "@/services/auth";
import { dateShort } from "@/lib/format";
import { ProfileSection } from "./profile-section";

export function ProfileView() {
  const { user, toast } = useApp();
  const qc = useQueryClient();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await authService.logout();
    } catch {
      /* session is cleared client-side regardless */
    }
    qc.clear();
    router.replace("/login");
  };

  if (!user) {
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
          <div className="h2">Your profile</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Profile and account preferences for {user.name}
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 14, maxWidth: 720 }}>
        <ProfileSection />

        <div className="card">
          <div className="panel-head">
            <h3>Account</h3>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="small muted">Email</span>
              <span className="small mono">{user.email}</span>
            </div>
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="small muted">Email verified</span>
              <span className={`status ${user.emailVerified ? "ok" : "neutral"}`}>
                <span className="d" />
                {user.emailVerified ? "Verified" : "Not verified"}
              </span>
            </div>
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="small muted">Member since</span>
              <span className="small">{dateShort(user.createdAt)}</span>
            </div>
            <div className="row between wrap" style={{ gap:10, marginTop: 4 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Sign out</div>
                <div className="tiny faint" style={{ marginTop: 2 }}>
                  End this session on this device.
                </div>
              </div>
              <button
                className="btn danger sm"
                disabled={signingOut}
                onClick={() => void signOut()}
                data-od-id="user-signout"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
