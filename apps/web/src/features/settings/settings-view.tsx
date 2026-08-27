/** Settings view — single tabbed route (Profile · Workspace · Project)
 *  acting on the active org/project from AppProvider. UI-only; the API is
 *  the source of truth for permissions and validation. */
import { useState } from "react";
import { useApp } from "@/providers/app-provider";
import { ProfileSection } from "./profile-section";
import { WorkspaceSection } from "./workspace-section";
import { ProjectSection } from "./project-section";

type Tab = "profile" | "workspace" | "project";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "workspace", label: "Workspace" },
  { id: "project", label: "Project" },
];

export function SettingsView() {
  const { user, org, project } = useApp();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <section className="view active">
      <div className="panel-head">
        <h3>Settings</h3>
      </div>
      <div className="toolbar" style={{ paddingLeft: 0 }}>
        <div className="seg">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "on" : ""}
              onClick={() => setTab(t.id)}
              disabled={t.id === "workspace" ? !org : t.id === "project" ? !project : false}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!user && <div className="tiny faint">Loading…</div>}
      {user && tab === "profile" && <ProfileSection />}
      {user && org && tab === "workspace" && <WorkspaceSection />}
      {user && project && tab === "project" && <ProjectSection />}
    </section>
  );
}
