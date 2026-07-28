/** Tasks view — Kanban board (drag-and-drop) + list table. */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api.js";
import { useApp } from "../store.js";
import {
  Avatar,
  Prio,
  StatusPill,
  TypeTag,
  colorFor,
  dueLabel,
  initials,
  isOverdue,
  taskSerial,
} from "../components/ui.js";
import type { Task } from "@pmin/core";

const COL_DOT: Record<string, string> = {
  Backlog: "var(--faint)",
  "To Do": "var(--muted)",
  "In Progress": "var(--info)",
  "In Review": "var(--violet)",
  Done: "var(--ok)",
};

export function Tasks() {
  const { project, openTask, setCreateOpen } = useApp();
  const pid = project!.id;
  const [mode, setMode] = useState<"board" | "table">("board");
  const { data: statuses } = useQuery({ queryKey: ["statuses", pid], queryFn: () => api.statuses(pid) });
  const { data: page } = useQuery({ queryKey: ["tasks", pid], queryFn: () => api.tasks(pid) });

  const tasks = page?.items ?? [];

  return (
    <section className="view active">
      <div className="toolbar">
        <div className="seg">
          <button className={mode === "board" ? "on" : ""} onClick={() => setMode("board")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="6" height="18" rx="1" />
              <rect x="10" y="3" width="6" height="12" rx="1" />
              <rect x="17" y="3" width="4" height="8" rx="1" />
            </svg>
            Board
          </button>
          <button className={mode === "table" ? "on" : ""} onClick={() => setMode("table")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" />
            </svg>
            List
          </button>
        </div>
        <button className="chip btn">Assignee <span className="muted">Anyone</span></button>
        <button className="chip btn">Priority <span className="muted">Any</span></button>
        <button className="chip btn">Type <span className="muted">All</span></button>
        <button className="chip btn">Labels</button>
        <button className="btn ghost sm">Filter</button>
        <div style={{ marginLeft: "auto" }} className="row">
          <span className="tiny mono muted">{tasks.length} tasks · {sumPoints(tasks)} pts</span>
          <button className="btn primary sm" onClick={() => setCreateOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New task
          </button>
        </div>
      </div>

      {mode === "board" ? (
        <Board tasks={tasks} statuses={statuses ?? []} pid={pid} onOpen={openTask} />
      ) : (
        <TableView tasks={tasks} statuses={statuses ?? []} onOpen={openTask} />
      )}
    </section>
  );
}

function sumPoints(tasks: Task[]) {
  return tasks.reduce((n, t) => n + (t.estimate ?? 0), 0);
}

function typeName(tasks: Task[], t: Task) {
  // types resolved by label heuristics not available; show nothing special
  return inferType(t);
}
function inferType(t: Task) {
  if (t.labels.some((l) => l.name === "Bug" || /bug/i.test(l.name))) return "Bug";
  return "Task";
}

function Board({
  tasks,
  statuses,
  pid,
  onOpen,
}: {
  tasks: Task[];
  statuses: { id: string; name: string }[];
  pid: string;
  onOpen: (id: string) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useApp();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const drop = async (statusId: string, statusName: string, dataTransferId: string) => {
    setOverCol(null);
    const id = dataTransferId;
    if (!id) return;
    const t = tasks.find((x) => x.id === id);
    if (!t || t.statusId === statusId) {
      setDragId(null);
      return;
    }
    await api.updateTask(pid, id, { statusId });
    qc.invalidateQueries({ queryKey: ["tasks", pid] });
    qc.invalidateQueries({ queryKey: ["dashboard", pid] });
    setDragId(null);
    toast(`${taskSerial(t.order)} → ${statusName}`);
  };

  return (
    <div className="board-scroll">
      <div className="board">
        {statuses.map((col) => {
          const items = tasks.filter((t) => t.statusId === col.id);
          const pts = items.reduce((n, t) => n + (t.estimate ?? 0), 0);
          return (
            <div className="col" key={col.id}>
              <div className="col-h">
                <span className="cd" style={{ background: COL_DOT[col.name] ?? "var(--muted)" }}></span>
                {col.name}
                <span className="cnt">{items.length}</span>
                <span className="pts">{pts}pts</span>
              </div>
              <div
                className={`col-body ${overCol === col.id ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.id);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => drop(col.id, col.name, e.dataTransfer.getData("text/id"))}
              >
                {items.map((t) => (
                  <div
                    key={t.id}
                    className={`tcard ${dragId === t.id ? "dragging" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/id", t.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(t.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => onOpen(t.id)}
                  >
                    <div className="ttop">
                      <span className="tid">{taskSerial(t.order)}</span>
                      <TypeTag name={typeName(tasks, t)} />
                    </div>
                    <div className="tt">{t.title}</div>
                    <div className="trow">
                      {t.labels.slice(0, 2).map((l) => (
                        <span className="tag" key={l.id}>{l.name}</span>
                      ))}
                    </div>
                    <div className="tmeta">
                      <Prio priority={t.priority} />
                      {t.dueDate && (
                        <span className={`due ${isOverdue(t.dueDate) && col.name !== "Done" ? "late" : ""}`}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          {dueLabel(t.dueDate)}
                        </span>
                      )}
                      <span className={`av sm ${colorFor(t.assigneeId ?? t.id)}`} style={{ marginLeft: "auto" }}>
                        {initials(assigneeLabel(t))}
                      </span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="tiny faint" style={{ padding: "8px 6px" }}>Drop tasks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function assigneeLabel(_t: Task) {
  return "?"; // assignee name not embedded on task list; avatars use stable color by id
}

function TableView({
  tasks,
  statuses,
  onOpen,
}: {
  tasks: Task[];
  statuses: { id: string; name: string }[];
  onOpen: (id: string) => void;
}) {
  const name = (id: string) => statuses.find((s) => s.id === id)?.name ?? "—";
  return (
    <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="dt">
          <thead>
            <tr>
              <th className="ck-col"></th>
              <th style={{ width: 70 }}>ID</th>
              <th>Title</th>
              <th style={{ width: 120 }}>Status</th>
              <th style={{ width: 92 }}>Priority</th>
              <th style={{ width: 90 }}>Type</th>
              <th style={{ width: 110 }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const late = isOverdue(t.dueDate) && name(t.statusId) !== "Done";
              return (
                <tr key={t.id} onClick={() => onOpen(t.id)} style={{ cursor: "pointer" }}>
                  <td className="ck-col"><input type="checkbox" className="ck" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="id">{taskSerial(t.order)}</td>
                  <td className="title">{t.title}</td>
                  <td><StatusPill name={name(t.statusId)} /></td>
                  <td><Prio priority={t.priority} /></td>
                  <td><TypeTag name={typeName(tasks, t)} /></td>
                  <td className={`mono ${late ? "due-over" : "muted"}`}>{dueLabel(t.dueDate) || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
