"use client";

/** Org overview — real org KPIs, latest projects, members preview, and the
 *  org-wide activity feed (new /organizations/:id/activity endpoint). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/app-provider";
import { hueFor, projColor } from "@/components/nav-data";
import { useMembers } from "@/hooks/use-members";
import { useInvitations, useOrgActivity } from "./queries";
import { Avatar } from "@/components/ui/avatar";
import { dateShort, timeAgo } from "@/lib/format";
import { NewProjectModal } from "./new-project-modal";

const VERB: Record<string, string> = {
  move: "moved",
  doc: "updated",
  com: "commented on",
  done: "closed",
  mile: "created milestone",
};

const FEED_ICON: Record<string, React.ReactNode> = {
  move: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
    </svg>
  ),
  com: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  ),
  mile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    </svg>
  ),
};

export function OrgOverviewView() {
  const { org, projects, switchProject } = useApp();
  const router = useRouter();
  const { data: members } = useMembers(org?.id);
  const { data: invitations } = useInvitations(org?.id);
  const { data: activity } = useOrgActivity(org?.id, 12);
  const [newOpen, setNewOpen] = useState(false);

  if (!org || !projects) {
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  }

  const activeProjects = projects.filter((p) => p.status === "active");
  const pending = (invitations ?? []).filter((i) => i.status === "pending");
  const weekAgo = Date.now() - 7 * 86400000;
  const weekEvents = (activity ?? []).filter((a) => new Date(a.when).getTime() >= weekAgo).length;
  const recentProjects = [...projects]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">{org.name}</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {org.type === "personal" ? "Personal workspace" : "Team workspace"} ·{" "}
            <span className="mono">{org.slug}</span> · created {dateShort(org.createdAt)}
          </div>
        </div>
        <div className="row">
          <button className="btn subtle sm" onClick={() => router.push(`/${org.slug}/members`)}>
            Invite member
          </button>
          <button className="btn primary sm" onClick={() => setNewOpen(true)} data-od-id="org-overview-new-project">
            New project
          </button>
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi label="Members" value={members?.filter((m) => m.status === "active").length ?? 0} sub="active" />
        <Kpi
          label="Active projects"
          value={activeProjects.length}
          sub={`${projects.length} total`}
        />
        <Kpi label="Pending invitations" value={pending.length} sub="awaiting response" />
        <Kpi label="Activity" value={weekEvents} sub="events · last 7 days" />
      </div>

      <div className="dash-grid">
        <div className="stack" style={{ gap: 14 }}>
          <div className="card">
            <div className="panel-head">
              <h3>Projects</h3>
              <span className="muted">{projects.length}</span>
              <div className="right">
                <button className="btn ghost sm" onClick={() => router.push(`/${org.slug}/projects`)}>
                  Manage
                </button>
              </div>
            </div>
            <div className="panel-body flush">
              {recentProjects.map((p) => (
                <button
                  key={p.id}
                  className="mrow"
                  style={{ alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}
                  onClick={() => switchProject(p)}
                  data-od-id={`org-overview-project-${p.slug}`}
                >
                  <span className="pico" style={{ background: projColor(hueFor(p.id)) }}>
                    {p.icon ?? p.name[0]}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="tiny faint mono">{p.key}</div>
                  </div>
                  <ProjectStatus status={p.status} />
                </button>
              ))}
              {recentProjects.length === 0 && (
                <div className="tiny faint" style={{ padding: 14 }}>
                  No projects yet — create the first one.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="panel-head">
              <h3>Members</h3>
              <span className="muted">{members?.length ?? 0}</span>
              <div className="right">
                <button className="btn ghost sm" onClick={() => router.push(`/${org.slug}/members`)}>
                  Manage
                </button>
              </div>
            </div>
            <div className="panel-body flush">
              {(members ?? []).slice(0, 5).map((m) => (
                <div key={m.id} className="mrow" style={{ alignItems: "center", gap: 10 }}>
                  <Avatar user={m.user} size="sm" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.user.name}</div>
                    <div className="tiny faint">{m.user.email}</div>
                  </div>
                  <span className="chip muted">{m.role.name}</span>
                </div>
              ))}
              {members?.length === 0 && (
                <div className="tiny faint" style={{ padding: 14 }}>
                  No members.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="card">
            <div className="panel-head">
              <h3>Recent activity</h3>
              <span className="muted">Across all projects</span>
              <div className="right">
                <button className="btn ghost sm" onClick={() => router.push(`/${org.slug}/activity`)}>
                  View all
                </button>
              </div>
            </div>
            <div className="panel-body">
              <div className="feed">
                {(activity ?? []).slice(0, 8).map((a) => (
                  <div className="feed-item" key={a.id}>
                    <div className={`feed-ic ${a.kind}`}>{FEED_ICON[a.kind]}</div>
                    <div className="feed-body">
                      <b>{a.actorName ?? "Someone"}</b> {VERB[a.kind]} <b>{a.target}</b>{" "}
                      <span className="tag b mono">{a.projectKey}</span>
                      <div className="when">{a.whenLabel || timeAgo(a.when)}</div>
                    </div>
                  </div>
                ))}
                {(activity ?? []).length === 0 && (
                  <div className="tiny faint" style={{ padding: 4 }}>
                    No activity in this organization yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewProjectModal open={newOpen} onClose={() => setNewOpen(false)} />
    </section>
  );
}

export function ProjectStatus({ status }: { status: "active" | "on_hold" | "archived" }) {
  const cls =
    status === "active" ? "ok" : status === "on_hold" ? "warn" : "neutral";
  const label = status === "on_hold" ? "On hold" : status === "active" ? "Active" : "Archived";
  return (
    <span className={`status ${cls}`}>
      <span className="d" />
      {label}
    </span>
  );
}

function Kpi({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="val">{value}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}
