/** Sidebar rail — brand, workspace switcher, nav, user. */
import { useQuery } from "@tanstack/react-query";
import { useApp, type View } from "../store.js";
import { api } from "../api.js";
import { colorFor } from "./ui.js";
import type { ReactNode } from "react";

const NAV: { id: View; label: string; icon: ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "documents",
    label: "Documents",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    id: "planning",
    label: "Planning",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18M8 14h3M8 18h3" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { view, setView, org, project, user } = useApp();
  const pid = project?.id;
  const tasksQ = useQuery({ queryKey: ["count", "tasks", pid], queryFn: () => api.tasks(pid!), enabled: !!pid });
  const docsQ = useQuery({ queryKey: ["count", "docs", pid], queryFn: () => api.pages(pid!), enabled: !!pid });
  const navCount = (id: View) =>
    id === "tasks" ? tasksQ.data?.items.length ?? null : id === "documents" ? docsQ.data?.items.length ?? null : null;
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo">H</span>
        <b>Helix</b>
        <span>v1.1</span>
      </div>

      <button className="ws-switch">
        <span className="dot">{org?.name?.[0] ?? "N"}</span>
        <span className="meta">
          <b>{org?.name ?? "Northwind"}</b>
          <small>{org?.description ?? "Software House"}</small>
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </button>

      <div className="nav-group">
        <div className="nav-label">{project?.name ?? "Atlas Platform 2.0"}</div>
        {NAV.map((n) => {
          const c = navCount(n.id);
          return (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => setView(n.id)}
            >
              {n.icon}
              <span>{n.label}</span>
              {c != null && <span className="count">{c}</span>}
            </button>
          );
        })}
      </div>

      <div className="nav-group">
        <div className="nav-label">More</div>
        <button
          className={`nav-item ${view === "meetings" ? "active" : ""}`}
          onClick={() => setView("meetings")}
          data-od-id="nav-meetings"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Meetings</span>
          <span className="count">3</span>
        </button>
        <button
          className={`nav-item ${view === "reports" ? "active" : ""}`}
          onClick={() => setView("reports")}
          data-od-id="nav-reports"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3v18h18" />
            <path d="M7 14l3-3 3 2 4-5" />
          </svg>
          <span>Reports</span>
        </button>
        <button
          className={`nav-item ${view === "agreements" ? "active" : ""}`}
          onClick={() => setView("agreements")}
          data-od-id="nav-agreements"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M9 13l2 2 4-4" />
          </svg>
          <span>Agreements</span>
          <span className="count">7</span>
        </button>
        <button className="nav-item dim">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 21h18M5 21V7l8-4 8 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
          </svg>
          <span>Client portal</span>
        </button>
      </div>

      <div className="spacer"></div>
      <div className="nav-foot">
        <button className="user">
          {user ? <span className={`av ${colorFor(user.id)}`}>{user.name[0]}</span> : <span className="av b">A</span>}
          <span className="meta">
            <b>{user?.name ?? "Aisha Yusuf"}</b>
            <small>Product Manager</small>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rail-faint)" }}>
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
