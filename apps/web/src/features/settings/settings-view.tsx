"use client";

/** Project settings view — project administration only (General · Members ·
 *  Danger zone). The user's own profile and notifications live at /user, and
 *  organization management lives at /org: three separate surfaces. */
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/app-provider";
import { ProjectSection } from "./project-section";

export function SettingsView() {
  const { project, org } = useApp();
  const router = useRouter();

  if (!project)
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Project settings</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Administration for {project.name}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 16, maxWidth: 720 }}>
        <div className="panel-head">
          <h3>Workspace</h3>
        </div>
        <div className="panel-body row between wrap" style={{ gap: 10 }}>
          <span className="small muted">
            {org?.name} is managed in the org dashboard — members, roles, billing and audit
            activity live there now.
          </span>
          <button
            className="btn subtle sm"
            onClick={() => router.push(org ? `/${org.slug}` : "/")}
            data-od-id="settings-open-org"
          >
            Open org dashboard
          </button>
        </div>
      </div>

      <ProjectSection />
    </section>
  );
}
