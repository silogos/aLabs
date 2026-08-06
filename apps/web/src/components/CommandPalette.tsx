/** Command palette — navigate, create, jump to a task. */
import { useMemo, useState } from "react";
import { useApp, type View } from "../store.js";
import { useTasksVersion, allTasks } from "../views/tasks-store.js";

export function CommandPalette() {
  useTasksVersion();
  const { project, setCmdkOpen, setView, setCreateOpen, openTask } = useApp();
  const [q, setQ] = useState("");
  const tasks = allTasks().filter((t) => t.ty !== "epic" && t.ty !== "subtask");

  const groups = useMemo(() => {
    const ql = q.toLowerCase();
    const nav: [string, View][] = [
      ["Go to Dashboard", "dashboard"],
      ["Go to Tasks", "tasks"],
      ["Go to Documents", "documents"],
      ["Go to Planning", "planning"],
      ["Go to Meetings", "meetings"],
      ["Go to Reports", "reports"],
      ["Go to Agreements", "agreements"],
    ];
    const filteredNav = nav.filter(([l]) => l.toLowerCase().includes(ql));
    const filteredTasks = tasks
      .filter((t) => (`ATL-${t.id}`).toLowerCase().includes(ql) || t.t.toLowerCase().includes(ql))
      .slice(0, 6)
      .map((t) => [`ATL-${t.id} · ${t.t}`, String(t.id)] as [string, string]);
    return [
      { g: "Navigate", items: filteredNav.map(([l, v]) => ({ label: l, action: () => go(v, null) })) },
      { g: "Create", items: [{ label: "New task", action: () => { setCreateOpen(true); setCmdkOpen(false); } }] },
      { g: "Tasks", items: filteredTasks.map(([l, id]) => ({ label: l, action: () => go("tasks", id) })) },
    ].filter((grp) => grp.items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tasks]);

  function go(v: View, taskId: string | null) {
    setCmdkOpen(false);
    setView(v);
    if (taskId) setTimeout(() => openTask(taskId), 80);
  }

  // project still drives the workspace context; keep the reference so the hook
  // dependency stays honest without re-querying the API for the task list.
  void project;

  return (
    <div className="modal cmdk show" onClick={(e) => e.target === e.currentTarget && setCmdkOpen(false)}>
      <div className="field">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--faint)" }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search…" />
        <span className="kbd" style={{ font: "11px var(--mono)", color: "var(--faint)", border: "1px solid var(--border)", background: "var(--surface-2)", borderRadius: 4, padding: "1px 5px" }}>
          esc
        </span>
      </div>
      <div className="res">
        {groups.length === 0 && <div className="grp">No results</div>}
        {groups.map((grp) => (
          <div key={grp.g}>
            <div className="grp">{grp.g}</div>
            {grp.items.map((it, i) => (
              <div key={i} className="ritem" onClick={it.action}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                <span>{it.label}</span>
                <span className="hint">↵</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
