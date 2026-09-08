"use client";

/** Settings view — project-scoped settings only (Profile · Project).
 *  Workspace/organization management now lives in its own area at /org
 *  (Overview · Projects · Members · Activity · Settings · Billing). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/app-provider";
import { ProfileSection } from "./profile-section";
import { ProjectSection } from "./project-section";

type Tab = "profile" | "project";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "project", label: "Project" },
];

export function SettingsView() {
  const { user, project, org } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Settings</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {project ? `Profile and settings for ${project.name}` : "Your profile"}
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
            onClick={() => router.push("/org")}
            data-od-id="settings-open-org"
          >
            Open org dashboard
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ paddingLeft: 0 }}>
        <div className="seg">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "on" : ""}
              onClick={() => setTab(t.id)}
              disabled={t.id === "project" ? !project : false}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!user && <div className="tiny faint">Loading…</div>}
      {user && tab === "profile" && <ProfileSection />}
      {user && project && tab === "project" && <ProjectSection />}
    </section>
  );
}
