"use client";

/** User dashboard (/) — the signed-in landing: recently visited projects
 *  plus every org with its projects, each linking into the slug URLs
 *  /{orgSlug}/{projectSlug}/dashboard. Mirrors the org overview's row
 *  language (pico dots, mrow rows, status pills). */
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Organization, Project } from "@pmin/core";
import { useApp } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { timeAgo } from "@/lib/format";
import { hueFor, projColor } from "@/components/nav-data";
import { ProjectStatus } from "@/features/org/overview-view";

export function UserDashboardView() {
  const { user, orgs, recents } = useApp();
  const router = useRouter();

  if (!user || !orgs)
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );

  const open = (orgSlug: string, projectSlug: string) =>
    router.push(`/${orgSlug}/${projectSlug}/dashboard`);

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Welcome back, {user.name.split(" ")[0]}</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {orgs.length} {orgs.length === 1 ? "workspace" : "workspaces"} · pick up where you
            left off, or jump into a project.
          </div>
        </div>
      </div>

      {recents?.length ? (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="panel-head">
            <h3>Jump back in</h3>
            <span className="muted">recently visited</span>
          </div>
          <div className="panel-body flush">
            {recents.map((r) => (
              <button
                key={r.project.id}
                className="mrow"
                style={{ alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}
                onClick={() => open(r.organization.slug, r.project.slug)}
              >
                <span className="pico" style={{ background: projColor(hueFor(r.project.id)) }}>
                  {r.project.icon ?? r.project.name[0]}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.project.name}</div>
                  <div className="tiny faint">
                    {r.organization.name} · <span className="mono">/{r.organization.slug}/{r.project.slug}</span>
                  </div>
                </div>
                <span className="tiny faint">{timeAgo(r.visitedAt)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {orgs.map((o) => (
        <OrgSection key={o.id} org={o} onOpen={open} />
      ))}
    </section>
  );
}

function OrgSection({
  org,
  onOpen,
}: {
  org: Organization;
  onOpen: (orgSlug: string, projectSlug: string) => void;
}) {
  const router = useRouter();
  const { data: projects } = useQuery({
    queryKey: qk.projects(org.id),
    queryFn: () => workspaceService.projects(org.id),
  });

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="panel-head">
        <span className="pico">{org.name[0]}</span>
        <h3>{org.name}</h3>
        <span className="muted mono">/{org.slug}</span>
        <div className="right">
          <button
            className="btn ghost sm"
            onClick={() => router.push(`/${org.slug}`)}
          >
            Open workspace
          </button>
        </div>
      </div>
      <div className="panel-body flush">
        {(projects ?? []).map((p: Project) => (
          <button
            key={p.id}
            className="mrow"
            style={{ alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}
            onClick={() => onOpen(org.slug, p.slug)}
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
        {projects?.length === 0 && (
          <div className="tiny faint" style={{ padding: 14 }}>
            No projects yet.
          </div>
        )}
        {!projects && (
          <div className="tiny faint" style={{ padding: 14 }}>
            Loading projects…
          </div>
        )}
      </div>
    </div>
  );
}
