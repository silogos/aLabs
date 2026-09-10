"use client";

/** Org shell — the /org area chrome: dark rail with the org switcher pill
 *  and org module nav, topbar with a back-to-project affordance, mobile
 *  bottom sheet. Reuses the app's sidebar/topbar/m-sheet classes so the
 *  two surfaces share one design system (see docs/design/brand-spec.md posture rules).
 *  Nav modals (account + switchers) and toasts come from AppProvider. */
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/providers/app-provider";
import { SwitcherModals } from "@/components/switcher-modals";
import { Toasts } from "@/components/toasts";
import { hueFor, projColor, ChevDown } from "@/components/nav-data";
import { ORG_SECTIONS, ORG_ICONS, ORG_TITLES, orgActiveId, orgPath, ORG_BACK_ICON } from "./org-nav";
import { viewPath } from "@/providers/app-provider";

export function OrgShell({ children }: { children: ReactNode }) {
  const {
    org,
    project,
    user,
    collapsed,
    setCollapsed,
    navModal,
    setNavModal,
    mNavOpen,
    setMNavOpen,
  } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const activeId = orgActiveId(pathname);

  // Esc closes the overlay stack (sheet first, then centered modals)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mNavOpen) setMNavOpen(false);
        else if (navModal) setNavModal(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mNavOpen, navModal, setMNavOpen, setNavModal]);

  // n.path is a suffix under /{orgSlug} — build the full slug path here
  const go = (path: string) => {
    router.push(orgPath(org!.slug, path));
    setMNavOpen(false);
  };
  const backToProject = () => {
    setMNavOpen(false);
    router.push(org && project ? viewPath("dashboard", org.slug, project.slug) : "/");
  };

  if (!org) {
    return (
      <div className="app">
        <div className="main" style={{ display: "grid", placeItems: "center" }}>
          <div className="muted">Loading organization…</div>
        </div>
      </div>
    );
  }

  const overlayOpen = navModal || mNavOpen;

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar" data-od-id="org-nav">
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
              <small>Organization</small>
            </span>
          </div>
          <div className="m-ctrl">
            <button
              className="m-trigger"
              data-od-id="org-mobile-menu"
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

        {/* Org switcher pill — identity-level, rare (same model as the app) */}
        <div className="ws-wrap">
          <button
            className="ws-pill"
            data-od-id="org-switcher"
            title="Switch workspace"
            onClick={() => setNavModal("org")}
          >
            <span className="pdot" style={{ background: projColor(hueFor(org.id)) }}>
              {org.name[0]}
            </span>
            <span className="ws-meta">
              <b>{org.name}</b>
            </span>
            {ChevDown()}
          </button>
        </div>

        <div className="nav-group">
          {ORG_SECTIONS.map((sec) => (
            <div key={sec.label}>
              <div className="nav-label">{sec.label}</div>
              {sec.items.map((n) => (
                <button
                  key={n.id}
                  className={`nav-item ${activeId === n.id ? "active" : ""}`}
                  onClick={() => go(n.path)}
                  data-od-id={`org-nav-${n.id.replace(/^org-/, "")}`}
                >
                  {ORG_ICONS[n.id]}
                  <span>{n.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="spacer"></div>
        <div className="nav-foot">
          <button
            className="collapse-btn"
            data-od-id="org-back-to-project"
            onClick={backToProject}
            title="Back to project"
          >
            {ORG_BACK_ICON}
            <span className="lbl">Back to project</span>
          </button>
          <button
            className="collapse-btn"
            data-od-id="org-rail-toggle"
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
          <button className="user" data-od-id="org-user-menu" onClick={() => setNavModal("acct")} title="Account">
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
              <b>{user?.name ?? "…"}</b>
              <small>Member</small>
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

      <div className="main">
        <header className="topbar" data-od-id="org-topbar">
          <div className="tb-left">
            <span className="pico" style={{ background: projColor(hueFor(org.id)) }}>
              {org.name[0]}
            </span>
            <span className="proj-name">{org.name}</span>
            <span className="sep">/</span>
            <span className="cur">{ORG_TITLES[activeId] ?? "Overview"}</span>
          </div>
          <div className="tb-right">
            <button
              className="tbtn"
              data-od-id="org-topbar-back"
              title="Back to project workspace"
              onClick={backToProject}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      {/* overlays */}
      <div
        className={`scrim ${overlayOpen ? "show" : ""}`}
        onClick={() => {
          if (mNavOpen) {
            setMNavOpen(false);
            return;
          }
          setNavModal(null);
        }}
      />
      <SwitcherModals />
      <OrgMobileNav activeId={activeId} onGo={go} onBack={backToProject} />
      <Toasts />
    </div>
  );
}

/** Mobile bottom sheet (≤880px) — org modules + switchers, mirroring the
 *  project MobileNav structure with org-scoped content. */
function OrgMobileNav({
  activeId,
  onGo,
  onBack,
}: {
  activeId: string;
  onGo: (path: string) => void;
  onBack: () => void;
}) {
  const { org, mNavOpen, setMNavOpen, setNavModal } = useApp();
  return (
    <aside
      className={`m-sheet ${mNavOpen ? "show" : ""}`}
      data-od-id="org-mobile-nav"
      aria-hidden={!mNavOpen}
    >
      <div className="m-handle"></div>
      <div className="m-head">
        <h3 className="m-title">{org?.name ?? "Organization"}</h3>
        <button className="x" aria-label="Close menu" onClick={() => setMNavOpen(false)}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="m-body">
        <button
          className="m-srow"
          onClick={() => {
            setMNavOpen(false);
            setNavModal("org");
          }}
        >
          <span className="ic">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h6M9 13h6M9 17h6" />
            </svg>
          </span>
          <span className="tx">
            <b>Switch workspace</b>
            <small>{org?.name ?? "…"}</small>
          </span>
        </button>

        {ORG_SECTIONS.map((sec) => (
          <div key={sec.label}>
            <div className="m-lbl">{sec.label}</div>
            {sec.items.map((n) => (
              <button
                key={n.id}
                className={`nav-item ${activeId === n.id ? "active" : ""}`}
                onClick={() => onGo(n.path)}
              >
                {ORG_ICONS[n.id]}
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="m-lbl">Project workspace</div>
        <button className="m-srow" onClick={onBack}>
          <span className="ic">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </span>
          <span className="tx">
            <b>Back to project</b>
            <small>Tasks, documents, planning</small>
          </span>
        </button>
      </div>
    </aside>
  );
}
