"use client";

/** Member quick-view drawer over the members list — the same pattern as the
 *  task drawer: /{orgSlug}/members/{userId} mounts this drawer on top of the
 *  persistent directory backdrop. Header follows the task/project drawer
 *  convention: a three-dot actions menu (Open profile) + close. Portals to
 *  document.body for the same z-index reasons as TaskDrawer. */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApp, viewPath } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";

export function MemberDrawer() {
  const { org } = useApp();
  const router = useRouter();
  const params = useParams<{ orgSlug: string; userId: string }>();
  const userId = params?.userId;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const { data: profile, isError } = useQuery({
    queryKey: qk.memberProfile(org?.id, userId),
    queryFn: () => workspaceService.memberProfile(org!.id, userId!),
    enabled: !!org && !!userId,
  });

  if (!org || !userId) return null;

  const close = () => router.push(`/${org.slug}/members`);
  const openProfile = () => router.push(`/${org.slug}/members/${userId}/profile`);

  if (!profile) {
    return createPortal(
      <aside className="drawer show" role="dialog" aria-label="Member details">
        <div className="dh">
          <div className="db">{isError ? "Member not found." : "Loading…"}</div>
          <button className="x" onClick={close} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </aside>,
      document.body,
    );
  }

  return createPortal(
    <aside className="drawer show" role="dialog" aria-label={`${profile.user.name} — member details`}>
      <div className="dh">
        <div className="dh-main">
          <div className="dh-top" style={{ alignItems: "center", gap: 8 }}>
            <Avatar user={profile.user} size="sm" />
            <span className="chip muted">{profile.role.name}</span>
            <span className={`status ${profile.status === "active" ? "ok" : "neutral"}`}>
              <span className="d" />
              {profile.status}
            </span>
          </div>
          <h3>{profile.user.name}</h3>
          <div className="tiny mono faint">{profile.user.email}</div>
        </div>
        <div className="hacts">
          <div className="hmenu">
            <button
              className="x"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Member actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="12" cy="19" r="1.6" />
              </svg>
            </button>
            {menuOpen && (
              <div className="menu-pop down" role="menu">
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    openProfile();
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4,21c0,-4,4,-6,8,-6s8,2,8,6" />
                  </svg>
                  Open profile
                </button>
              </div>
            )}
          </div>
          <button className="x" onClick={close} aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="db">
        <div className="profile-row">
          <span className="k">Organization</span>
          <span className="v">{org.name}</span>
        </div>
        <div className="profile-row">
          <span className="k">Workspace role</span>
          <span className="v">{profile.role.name}</span>
        </div>
        <div className="profile-row">
          <span className="k">Joined</span>
          <span className="v">{profile.joinedAt ? dateShort(profile.joinedAt) : "—"}</span>
        </div>

        <div className="panel-head" style={{ marginTop: 14, paddingLeft: 0, paddingRight: 0 }}>
          <h3>Projects</h3>
          <span className="muted">{profile.projects.length}</span>
        </div>
        <div>
          {profile.projects.map((p) => (
            <div
              key={p.id}
              className="mrow"
              style={{ alignItems: "center", gap: 10, cursor: "pointer", paddingLeft: 0, paddingRight: 0 }}
              onClick={() => router.push(viewPath("dashboard", org.slug, p.slug))}
            >
              <div style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{p.name}</div>
              <span className="chip muted">{p.role}</span>
            </div>
          ))}
          {profile.projects.length === 0 && (
            <div className="tiny faint">Not on any project in this workspace yet.</div>
          )}
        </div>
      </div>
    </aside>,
    document.body,
  );
}
