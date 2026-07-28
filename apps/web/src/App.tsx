/** App shell — sidebar + topbar + active view + global overlays. */
import { useEffect } from "react";
import { useApp, type View } from "./store.js";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";
import { Dashboard } from "./views/Dashboard.js";
import { Tasks } from "./views/Tasks.js";
import { Documents } from "./views/Documents.js";
import { Planning } from "./views/Planning.js";
import { Meetings } from "./views/Meetings.js";
import { Reports } from "./views/Reports.js";
import { Agreements } from "./views/Agreements.js";
import { TaskDrawer } from "./components/TaskDrawer.js";
import { TaskModal } from "./components/TaskModal.js";
import { CommandPalette } from "./components/CommandPalette.js";
import { Toasts } from "./components/Toasts.js";

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
  const { view, taskId, createOpen, cmdkOpen, closeTask, setCreateOpen, setCmdkOpen, project } =
    useApp();

  // global keyboard: ⌘K command palette, Esc closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen(true);
      }
      if (e.key === "Escape") {
        setCmdkOpen(false);
        closeTask();
        setCreateOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setCmdkOpen, closeTask, setCreateOpen]);

  if (!project) {
    return (
      <div className="app">
        <div className="main" style={{ display: "grid", placeItems: "center" }}>
          <div className="muted">Loading workspace…</div>
        </div>
      </div>
    );
  }

  const overlayOpen = taskId || createOpen || cmdkOpen;

  return (
    <div className="app">
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
      <div className={`scrim ${overlayOpen ? "show" : ""}`} onClick={() => { closeTask(); setCreateOpen(false); setCmdkOpen(false); }} />
      {taskId && <TaskDrawer id={taskId} />}
      {createOpen && <TaskModal />}
      {cmdkOpen && <CommandPalette />}
      <Toasts />
    </div>
  );
}
