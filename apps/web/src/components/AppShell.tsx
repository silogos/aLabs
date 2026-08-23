/** App shell — sidebar + topbar + routed view + global overlays. The active
 *  view comes from the URL (store derives it from the pathname); this
 *  component renders the persistent chrome around whatever page is routed. */
import { useEffect, type ReactNode } from "react";
import { useApp, type View } from "../store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TaskDrawer } from "./TaskDrawer";
import { TaskModal } from "./TaskModal";
import { RelModal } from "./RelModal";
import { CommandPalette } from "./CommandPalette";
import { Toasts } from "./Toasts";
import { NavModals } from "./SwitcherModals";
import { MobileNav } from "./MobileNav";

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
  }, [setCmdkOpen, closeTask, setCreateOpen, closeRelPicker, mNavOpen, navModal, setMNavOpen, setNavModal]);

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
      <NavModals />
      <MobileNav />
      {taskId && <TaskDrawer id={taskId} />}
      {relPickerId && <RelModal />}
      {createOpen && <TaskModal />}
      {cmdkOpen && <CommandPalette />}
      <Toasts />
    </div>
  );
}
