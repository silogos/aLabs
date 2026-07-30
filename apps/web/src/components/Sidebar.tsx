/** Sidebar rail — brand, project switcher, nav, account menu. */
import { useEffect, useRef, useState } from "react";
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

const PROJECTS = [
  { id: "atlas", dot: "A", hue: 258, name: "Atlas Platform 2.0" },
  { id: "mobile", dot: "M", hue: 190, name: "Mobile App v1" },
  { id: "dw", dot: "D", hue: 145, name: "Data Warehouse" },
  { id: "mktg", dot: "M", hue: 340, name: "Marketing Site" },
] as const;

const ORGS = [
  { id: "nw", dot: "N", hue: 265, name: "Northwind Software House" },
  { id: "as", dot: "A", hue: 195, name: "Amin Studio" },
  { id: "ai", dot: "A", hue: 25, name: "Acme Internal" },
] as const;

const CheckIcon = (
  <svg className="chk" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export function Sidebar() {
  const { view, setView, org, project, user, projLabel, setProjLabel, orgLabel, setOrgLabel, toast } =
    useApp();
  const pid = project?.id;
  const tasksQ = useQuery({ queryKey: ["count", "tasks", pid], queryFn: () => api.tasks(pid!), enabled: !!pid });
  const docsQ = useQuery({ queryKey: ["count", "docs", pid], queryFn: () => api.pages(pid!), enabled: !!pid });
  const navCount = (id: View) =>
    id === "tasks" ? tasksQ.data?.items.length ?? null : id === "documents" ? docsQ.data?.items.length ?? null : null;

  // Project switcher — local selection, defaults to the API project, mirrored into the
  // store display override so the topbar breadcrumb updates. Data queries stay anchored
  // to the real project (MVP: labels + context only).
  const [projId, setProjId] = useState<string>(
    () => PROJECTS.find((p) => p.name === project?.name)?.id ?? "atlas",
  );
  const selProj = PROJECTS.find((p) => p.id === projId) ?? PROJECTS[0];
  const selOrgId = orgLabel ? ORGS.find((o) => o.name === orgLabel)?.id ?? "nw" : "nw";
  const selOrg = ORGS.find((o) => o.id === selOrgId) ?? ORGS[0];

  const [projOpen, setProjOpen] = useState(false);
  const [meOpen, setMeOpen] = useState(false);
  const projRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click / Esc.
  useEffect(() => {
    if (!projOpen && !meOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (projOpen && projRef.current && !projRef.current.contains(t)) setProjOpen(false);
      if (meOpen && footRef.current && !footRef.current.contains(t)) setMeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProjOpen(false);
        setMeOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [projOpen, meOpen]);

  const switchProject = (p: (typeof PROJECTS)[number]) => {
    setProjId(p.id);
    setProjLabel({ name: p.name, icon: p.dot });
    setProjOpen(false);
    toast(`Switched to ${p.name}`);
  };
  const switchOrg = (o: (typeof ORGS)[number]) => {
    setOrgLabel(o.name);
    setMeOpen(false);
    toast(`Switched to ${o.name}`);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo">H</span>
        <b>Helix</b>
        <span>v1.1</span>
      </div>

      {/* Project switcher */}
      <div className="ws-wrap" ref={projRef}>
        <button
          className={`ws-switch ${projOpen ? "on" : ""}`}
          data-od-id="project-switch"
          onClick={() => setProjOpen((v) => !v)}
        >
          <span className="dot" style={{ background: `oklch(48% .10 ${selProj.hue})` }}>
            {selProj.dot}
          </span>
          <span className="meta">
            <b>{selProj.name}</b>
            <small>Project</small>
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </button>
        {projOpen && (
          <div className="proj-pop show" data-od-id="project-switcher">
            <div className="me-grp">Projects</div>
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                className={`sw-item ${p.id === projId ? "cur" : ""}`}
                onClick={() => switchProject(p)}
              >
                <span className="pdot" style={{ background: `oklch(48% .10 ${p.hue})` }}>
                  {p.dot}
                </span>
                <span className="nm">{p.name}</span>
                {p.id === projId && CheckIcon}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="nav-group">
        {NAV.map((n) => {
          const c = navCount(n.id);
          return (
            <button
              key={n.id}
              className={`nav-item ${view === n.id ? "active" : ""}`}
              onClick={() => setView(n.id)}
              data-od-id={`nav-${n.id}`}
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
        <button className="nav-item dim" data-od-id="nav-clients">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 21h18M5 21V7l8-4 8 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
          </svg>
          <span>Client portal</span>
        </button>
      </div>

      <div className="spacer"></div>
      <div className="nav-foot" ref={footRef}>
        <button
          className={`user ${meOpen ? "on" : ""}`}
          data-od-id="user-menu"
          onClick={() => setMeOpen((v) => !v)}
        >
          {user ? (
            <span className={`av ${colorFor(user.id)}`}>
              {user.name[0]}
              <span className="pres"></span>
            </span>
          ) : (
            <span className="av b">
              A<span className="pres"></span>
            </span>
          )}
          <span className="meta">
            <b>{user?.name ?? "Aisha Yusuf"}</b>
            <small>Product Manager</small>
          </span>
          <svg
            className="chev"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--rail-faint)" }}
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        {meOpen && (
          <div className="me-pop show" data-od-id="user-menu-pop">
            <div className="me-id">
              <span className="av">{user ? user.name[0] : "A"}</span>
              <span className="txt">
                <b>{user?.name ?? "Aisha Yusuf"}</b>
                <small>{user?.email ?? "aisha@northwind.io"} · Product Manager</small>
              </span>
            </div>
            <div className="me-sep"></div>
            <div className="me-grp">Organization</div>
            {ORGS.map((o) => (
              <button key={o.id} className={`sw-item ${o.id === selOrgId ? "cur" : ""}`} onClick={() => switchOrg(o)}>
                <span className="pdot" style={{ background: `oklch(48% .10 ${o.hue})` }}>
                  {o.dot}
                </span>
                <span className="nm">{o.name}</span>
                {o.id === selOrgId && CheckIcon}
              </button>
            ))}
            <div className="me-sep"></div>
            <div className="me-grp">Account</div>
            <button className="me-row" onClick={() => { setMeOpen(false); toast("Profile settings — coming soon"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
              Profile settings
            </button>
            <button className="me-row" onClick={() => { setMeOpen(false); toast("Notifications — coming soon"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
              Notifications
            </button>
            <button className="me-row" onClick={() => { setMeOpen(false); toast("Appearance — coming soon"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
              Appearance
            </button>
            <div className="me-sep"></div>
            <button className="me-row danger" onClick={() => { setMeOpen(false); toast("Signed out of Helix"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
