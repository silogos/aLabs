"use client";

/** Projects page (/projects) — every project across the user's orgs in one
 *  flat grid, linking into /{orgSlug}/{projectSlug}/dashboard. */
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@pmin/core";
import { useApp } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { hueFor, projColor } from "@/components/nav-data";
import { ProjectStatus } from "@/features/org/overview-view";

export function ProjectListView() {
  const { orgs } = useApp();
  const router = useRouter();

  if (!orgs)
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
          <div className="h2">Projects</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Across {orgs.length} {orgs.length === 1 ? "workspace" : "workspaces"}.
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 14 }}>
        {orgs.map((o) => (
          <OrgProjects key={o.id} org={o} onOpen={open} />
        ))}
      </div>
    </section>
  );
}

function OrgProjects({
  org,
  onOpen,
}: {
  org: Organization;
  onOpen: (orgSlug: string, projectSlug: string) => void;
}) {
  const { data: projects } = useQuery({
    queryKey: qk.projects(org.id),
    queryFn: () => workspaceService.projects(org.id),
  });

  return (
    <div className="card">
      <div className="panel-head">
        <span className="pico" style={{ background: projColor(hueFor(org.id)) }}>
          {org.name[0]}
        </span>
        <h3>{org.name}</h3>
        <span className="muted mono">/{org.slug}</span>
      </div>
      <div className="panel-body flush">
        {(projects ?? []).map((p) => (
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
              <div className="tiny faint mono">
                {p.key} · /{org.slug}/{p.slug}
              </div>
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
