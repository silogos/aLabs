/** App shell — sidebar + topbar + routed view + feature-less global overlays.
 *  The active view comes from the URL (provider derives it from the pathname);
 *  this component renders the persistent chrome around whatever page is routed.
 *  Task overlays live in features/tasks/overlays and are mounted by the (app)
 *  layout, keeping this shell free of feature imports. */
import { useEffect, type ReactNode } from "react";
import { useApp, type View } from "@/providers/app-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CommandPalette } from "@/components/command-palette";
import { Toasts } from "@/components/toasts";
import { SwitcherModals } from "@/components/switcher-modals";
import { MobileNav } from "@/components/mobile-nav";

const TITLES: Record<View, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  documents: "Documents",
  planning: "Planning",
  meetings: "Meetings",
  reports: "Reports",
  agreements: "Agreements",
};

export function AppShell({ children }: { children: ReactNode }) {
  const {
    view,
    taskId,
    createOpen,
    cmdkOpen,
    closeTask,
    setCreateOpen,
    setCmdkOpen,
    closeRelPicker,
    relPickerId,
    project,
    collapsed,
    navModal,
    setNavModal,
    mNavOpen,
    setMNavOpen,
  } = useApp();

  // global keyboard: ⌘K command palette, Esc closes overlays (nav stack first)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen(true);
      }
      if (e.key === "Escape") {
        if (mNavOpen) setMNavOpen(false);
        else if (navModal) setNavModal(null);
        else {
          setCmdkOpen(false);
          closeRelPicker();
          closeTask();
          setCreateOpen(false);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    setCmdkOpen,
    closeTask,
    setCreateOpen,
    closeRelPicker,
    mNavOpen,
    navModal,
    setMNavOpen,
    setNavModal,
  ]);

  if (!project) {
    return (
      <div className="app">
        <div className="main" style={{ display: "grid", placeItems: "center" }}>
          <div className="muted">Loading workspace…</div>
        </div>
      </div>
    );
  }

  const overlayOpen = taskId || createOpen || cmdkOpen || relPickerId || navModal || mNavOpen;

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <Sidebar />
      <div className="main">
        <Topbar title={TITLES[view]} />
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
          if (navModal) {
            setNavModal(null);
            return;
          }
          if (relPickerId) {
            closeRelPicker();
            return;
          }
          closeTask();
          setCreateOpen(false);
          setCmdkOpen(false);
        }}
      />
      <SwitcherModals />
      <MobileNav />
      {cmdkOpen && <CommandPalette />}
      <Toasts />
    </div>
  );
}
