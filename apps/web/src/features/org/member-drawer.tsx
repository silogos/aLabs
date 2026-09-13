"use client";

/** Member quick-view drawer over the members list — the same pattern as the
 *  task drawer: /{orgSlug}/members/{userId} mounts this drawer on top of the
 *  persistent directory backdrop. "Open profile" (header action) jumps to
 *  the full GitLab-style profile page. Portals to document.body for the same
 *  z-index reasons as TaskDrawer. */
import { createPortal } from "react-dom";
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
          <button className="x" onClick={openProfile} title="Open profile" aria-label="Open profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="12" cy="8" r="4" />
              <path d="M4,21c0,-4,4,-6,8,-6s8,2,8,6" />
              <path d="M18 14l3 3l-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="x" onClick={close} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
