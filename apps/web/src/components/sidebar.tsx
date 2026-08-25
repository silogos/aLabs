/** Sidebar rail — brand, project switcher pill, nav sections, collapse + account.
 *  Design: superadmin-style header, labeled sections, bottom collapse button,
 *  switchers open centered modals (see SwitcherModals.tsx). */
import { useApp } from "@/providers/app-provider";
import { NAV_SECTIONS, NAV_ICONS, hueFor, projColor, ChevDown, useNavCounts } from "@/components/nav-data";

export function Sidebar() {
  const { view, setView, user, project, setNavModal, setMNavOpen, collapsed, setCollapsed } =
    useApp();
  const counts = useNavCounts();

  return (
    <aside className="sidebar" data-od-id="primary-nav">
      <div className="brand-row">
        <div
          className="brand"
          onClick={collapsed ? () => setCollapsed(false) : undefined}
          title={collapsed ? "Expand sidebar" : undefined}
        >
          <span className="logo" aria-label="aLabs">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M3 40 H27 M45 40 H61" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
              <path
                d="M27 40 L31 43 L36 13 L40 47 L45 40"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="meta">
            <b>aLabs</b>
            <small>Workspace</small>
          </span>
        </div>
        {/* mobile: hamburger → bottom-sheet nav (desktop-hidden) */}
        <div className="m-ctrl">
          <button
            className="m-trigger"
            data-od-id="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMNavOpen(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Project switcher pill — opens the project modal */}
      <div className="ws-wrap">
        <button
          className="ws-pill"
          data-od-id="project-switcher"
          title="Switch project"
          onClick={() => setNavModal("proj")}
        >
          <span
            className="pdot"
            style={project ? { background: projColor(hueFor(project.id)) } : undefined}
          >
            {project?.icon ?? project?.name[0] ?? "…"}
          </span>
          <span className="ws-meta">
            <b>{project?.name ?? "Loading…"}</b>
          </span>
          {ChevDown()}
        </button>
      </div>

      <div className="nav-group">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.label}>
            <div className="nav-label">{sec.label}</div>
            {sec.items.map((n) => {
              const c = counts[n.id] ?? null;
              return (
                <button
                  key={n.id}
                  className={`nav-item ${view === n.id ? "active" : ""}`}
                  onClick={() => setView(n.id)}
                  data-od-id={`nav-${n.id}`}
                >
                  {NAV_ICONS[n.id]}
                  <span>{n.label}</span>
                  {c != null && <span className="count">{c}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="spacer"></div>
      <div className="nav-foot">
        <button
          className="collapse-btn"
          data-od-id="rail-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span className="lbl">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
        <button
          className="user"
          data-od-id="user-menu"
          onClick={() => setNavModal("acct")}
          title="Account"
        >
          {user ? (
            <span className="av">
              {user.name[0]}
              <span className="pres"></span>
            </span>
          ) : (
            <span className="av">
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
      </div>
    </aside>
  );
}
