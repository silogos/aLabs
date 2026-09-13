"use client";

/** Member profile — the org-scoped view of a fellow member: identity,
 *  workspace role and the projects they're part of. Opened by notification
 *  actor links and from the members list. */
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApp, viewPath } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";

export function MemberProfileView() {
  const { org, user } = useApp();
  const router = useRouter();
  const params = useParams<{ orgSlug: string; userId: string }>();
  const userId = params?.userId;

  const { data: profile, isError } = useQuery({
    queryKey: qk.memberProfile(org?.id, userId),
    queryFn: () => workspaceService.memberProfile(org!.id, userId!),
    enabled: !!org && !!userId,
  });

  if (!org) {
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="view active">
        <div className="card">
          <div className="panel-body tiny muted">
            This member isn&apos;t visible in this workspace.
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  }

  const isMe = profile.userId === user?.id;

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">{profile.user.name}</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {profile.role.name} · {org.name}
          </div>
        </div>
        <button className="btn ghost sm" onClick={() => router.push(`/${org.slug}/members`)}>
          ← Members
        </button>
      </div>

      <div className="stack" style={{ gap: 14, maxWidth: 720 }}>
        <div className="card" data-od-id="member-profile">
          <div className="panel-head">
            <h3>Profile</h3>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              <Avatar user={profile.user} size="lg" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {profile.user.name}
                  {isMe && <span className="tiny faint"> (you)</span>}
                </div>
                <div className="tiny faint">{profile.user.email}</div>
              </div>
            </div>
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="small muted">Workspace role</span>
              <span className="chip muted">{profile.role.name}</span>
            </div>
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="small muted">Status</span>
              <span className={`status ${profile.status === "active" ? "ok" : "neutral"}`}>
                <span className="d" />
                {profile.status}
              </span>
            </div>
            <div className="row between wrap" style={{ gap: 10 }}>
              <span className="small muted">Joined</span>
              <span className="small">{profile.joinedAt ? dateShort(profile.joinedAt) : "—"}</span>
            </div>
          </div>
        </div>

        <div className="card" data-od-id="member-profile-projects">
          <div className="panel-head">
            <h3>Projects</h3>
            <span className="muted">{profile.projects.length}</span>
          </div>
          <div className="panel-body flush">
            {profile.projects.map((p) => (
              <div
                key={p.id}
                className="mrow"
                style={{ alignItems: "center", gap: 10, cursor: "pointer" }}
                onClick={() => router.push(viewPath("dashboard", org.slug, p.slug))}
              >
                <div style={{ fontWeight: 600, flex: 1, minWidth: 0 }}>{p.name}</div>
                <span className="chip muted">{p.role}</span>
              </div>
            ))}
            {profile.projects.length === 0 && (
              <div className="tiny faint" style={{ padding: 14 }}>
                Not on any project in this workspace yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
