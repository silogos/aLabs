/** App shell — sidebar + topbar + active view + global overlays. */
import { useEffect } from "react";
import { useApp, type View } from "./store";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./views/Dashboard";
import { Tasks } from "./views/Tasks";
import { Documents } from "./views/Documents";
import { Planning } from "./views/Planning";
import { Meetings } from "./views/Meetings";
import { Reports } from "./views/Reports";
import { Agreements } from "./views/Agreements";
import { TaskDrawer } from "./components/TaskDrawer";
import { TaskModal } from "./components/TaskModal";
import { RelModal } from "./components/RelModal";
import { CommandPalette } from "./components/CommandPalette";
import { Toasts } from "./components/Toasts";
import { NavModals } from "./components/SwitcherModals";
import { MobileNav } from "./components/MobileNav";

const TITLES: Record<View, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  documents: "Documents",
  planning: "Planning",
  meetings: "Meetings",
  reports: "Reports",
  agreements: "Agreements",
};

export default function App() {
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
        <main className="content">
          {view === "dashboard" && <Dashboard />}
          {view === "tasks" && <Tasks />}
          {view === "documents" && <Documents />}
          {view === "planning" && <Planning />}
          {view === "meetings" && <Meetings />}
          {view === "reports" && <Reports />}
          {view === "agreements" && <Agreements />}
        </main>
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
