"use client";

/** Org activity — the audit feed across every project in the organization
 *  (new /organizations/:id/activity endpoint), filterable by event kind and
 *  project. */
import { useState } from "react";
import { useApp } from "@/providers/app-provider";
import { useOrgActivity } from "./queries";
import { timeAgo, dateTime } from "@/lib/format";

const KINDS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "move", label: "Moves" },
  { id: "doc", label: "Docs" },
  { id: "com", label: "Comments" },
  { id: "done", label: "Closed" },
  { id: "mile", label: "Milestones" },
];

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

export function OrgActivityView() {
  const { org, projects } = useApp();
  const { data: activity, isError } = useOrgActivity(org?.id, 200);
  const [kind, setKind] = useState("all");
  const [projectId, setProjectId] = useState("all");

  const rows = (activity ?? [])
    .filter((a) => kind === "all" || a.kind === kind)
    .filter((a) => projectId === "all" || a.projectId === projectId);

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
          <div className="h2">Activity</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Audit feed across all {projects?.length ?? 0} projects in {org.name}
          </div>
        </div>
      </div>

      <div className="toolbar" style={{ paddingLeft: 0, marginBottom: 12 }}>
        <div className="seg">
          {KINDS.map((k) => (
            <button key={k.id} className={kind === k.id ? "on" : ""} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>
        <select
          className="fld"
          style={{ width: "auto", marginLeft: "auto" }}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="all">All projects</option>
          {(projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ maxWidth: 860 }}>
        <div className="panel-head">
          <h3>Events</h3>
          <span className="muted">{rows.length}</span>
        </div>
        <div className="panel-body">
          {isError && (
            <div className="tiny" style={{ color: "var(--danger)" }}>
              You don&apos;t have permission to view this feed.
            </div>
          )}
          <div className="feed">
            {rows.map((a) => (
              <div className="feed-item" key={a.id}>
                <div className={`feed-ic ${a.kind}`}>{FEED_ICON[a.kind]}</div>
                <div className="feed-body">
                  <b>{a.actorName ?? "Someone"}</b> {VERB[a.kind]} <b>{a.target}</b>{" "}
                  <span className="tag b mono">{a.projectKey}</span>
                  <div className="when">
                    {a.whenLabel || timeAgo(a.when)} · {dateTime(a.when)}
                  </div>
                </div>
              </div>
            ))}
            {rows.length === 0 && !isError && (
              <div className="tiny faint" style={{ padding: 4 }}>
                {activity?.length
                  ? "No events match these filters."
                  : "No activity in this organization yet — events appear as the team works."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
