"use client";

/** Orgs page (/orgs) — every workspace the user belongs to, linking into
 *  /{orgSlug}. */
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@pmin/core";
import { useApp } from "@/providers/app-provider";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { dateShort } from "@/lib/format";
import { hueFor, projColor } from "@/components/nav-data";

export function OrgListView() {
  const { orgs } = useApp();
  const router = useRouter();

  if (!orgs)
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Orgs</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {orgs.length} {orgs.length === 1 ? "workspace" : "workspaces"} you belong to.
          </div>
        </div>
      </div>

      <div className="grid g3">
        {orgs.map((o) => (
          <OrgCard key={o.id} org={o} onOpen={() => router.push(`/${o.slug}`)} />
        ))}
      </div>
    </section>
  );
}

function OrgCard({ org, onOpen }: { org: Organization; onOpen: () => void }) {
  const { data: projects } = useQuery({
    queryKey: qk.projects(org.id),
    queryFn: () => workspaceService.projects(org.id),
  });

  return (
    <button className="card" style={{ padding: 14, textAlign: "left" }} onClick={onOpen}>
      <div className="row" style={{ gap: 10 }}>
        <span className="pico" style={{ background: projColor(hueFor(org.id)) }}>
          {org.name[0]}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 650 }}>{org.name}</div>
          <div className="tiny faint mono">/{org.slug}</div>
        </div>
      </div>
      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
        <span className="chip muted">{org.type === "personal" ? "Personal" : "Team"}</span>
        <span className="chip muted">
          {projects?.length ?? 0} {(projects?.length ?? 0) === 1 ? "project" : "projects"}
        </span>
      </div>
      <div className="tiny faint" style={{ marginTop: 8 }}>
        Created {dateShort(org.createdAt)}
      </div>
    </button>
  );
}
