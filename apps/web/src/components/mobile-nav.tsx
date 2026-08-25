/** Mobile bottom-sheet nav (≤880px; desktop-hidden).
 *  Design: account card at top toggles the panel below between Menu (nav sections)
 *  and Account (switchers + account rows + sign out); reopens on Menu. */
import { useEffect, useState } from "react";
import { useApp } from "@/providers/app-provider";
import {
  NAV_SECTIONS,
  NAV_ICONS,
  hueFor,
  projColor,
  ChevRight,
  ChevDown,
  useNavCounts,
} from "@/components/nav-data";

export function MobileNav() {
  const { mNavOpen, setMNavOpen, setNavModal, setView, view, user, project, org, toast } = useApp();
  const [sheetView, setSheetView] = useState<"menu" | "acct">("menu");
  const counts = useNavCounts();
  const name = user?.name ?? "Aisha Yusuf";
  const email = user?.email ?? "aisha@northwind.io";

  // Reopen always lands on Menu (matches the hamburger intent).
  useEffect(() => {
    if (mNavOpen) setSheetView("menu");
  }, [mNavOpen]);

  const openSwitcher = (m: "proj" | "org") => {
    setMNavOpen(false);
    setNavModal(m);
  };
  const acctRow = (key: string, label: string) => (
    <button
      className={`me-row ${key === "signout" ? "danger" : ""}`}
      onClick={() => {
        setMNavOpen(false);
        toast(key === "signout" ? "Signed out of aLabs" : `${label} — coming soon`);
      }}
    >
      {key === "profile" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      )}
      {key === "notif" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      )}
      {key === "appearance" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
        </svg>
      )}
      {key === "signout" && (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      )}
      {label}
    </button>
  );

  return (
    <aside
      className={`m-sheet ${mNavOpen ? "show" : ""}`}
      data-od-id="mobile-nav"
      aria-hidden={!mNavOpen}
    >
      <div className="m-handle"></div>
      <div className="m-head">
        <h3 className="m-title">Menu</h3>
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
          className={`m-acct ${sheetView === "acct" ? "open" : ""}`}
          onClick={() => setSheetView(sheetView === "acct" ? "menu" : "acct")}
        >
          <span className="av">
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
          <span className="tx">
            <b>{name}</b>
            <small>{email} · Product Manager</small>
          </span>
          {ChevRight()}
        </button>

        {/* Menu view — nav sections */}
        <div className="m-panel" hidden={sheetView !== "menu"}>
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.label}>
              <div className="m-lbl">{sec.label}</div>
              {sec.items.map((n) => {
                const c = counts[n.id] ?? null;
                return (
                  <button
                    key={n.id}
                    className={`nav-item ${view === n.id ? "active" : ""}`}
                    onClick={() => {
                      setView(n.id);
                      setMNavOpen(false);
                    }}
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

        {/* Account view — switchers + account rows + sign out */}
        <div className="m-panel" hidden={sheetView !== "acct"}>
          <button className="m-srow" onClick={() => openSwitcher("org")}>
            <span className="ic">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" />
              </svg>
            </span>
            <span className="tx">
              <b>Switch workspace</b>
              <small>{org?.name ?? "Workspace"}</small>
            </span>
            {ChevRight()}
          </button>
          <button className="ws-pill" onClick={() => openSwitcher("proj")}>
            {project && (
              <span className="pdot" style={{ background: projColor(hueFor(project.id)) }}>
                {project.icon ?? project.name[0]}
              </span>
            )}
            <span className="ws-meta">
              <b>{project?.name ?? "Project"}</b>
            </span>
            {ChevDown()}
          </button>
          <div className="m-lbl">Account</div>
          {acctRow("profile", "Profile settings")}
          {acctRow("notif", "Notifications")}
          {acctRow("appearance", "Appearance")}
          {acctRow("signout", "Sign out")}
        </div>
      </div>
    </aside>
  );
}
