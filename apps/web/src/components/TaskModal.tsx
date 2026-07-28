/** Create-task modal. */
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api.js";
import { useApp } from "../store.js";
import type { TaskPriority } from "@pmin/core";

export function TaskModal() {
  const { project, setCreateOpen, toast } = useApp();
  const pid = project!.id;
  const qc = useQueryClient();
  const { data: statuses } = useQuery({ queryKey: ["statuses", pid], queryFn: () => api.statuses(pid) });
  const { data: types } = useQuery({ queryKey: ["types", pid], queryFn: () => api.types(pid) });

  const [title, setTitle] = useState("");
  const [statusId, setStatusId] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [typeId, setTypeId] = useState<string>("");

  const create = async () => {
    const t = await api.createTask(pid, {
      title: title.trim() || "New task",
      statusId: statusId || undefined,
      priority,
      typeId: typeId || null,
    });
    qc.invalidateQueries({ queryKey: ["tasks", pid] });
    qc.invalidateQueries({ queryKey: ["dashboard", pid] });
    setCreateOpen(false);
    setTitle("");
    toast(`Created ${t.title}`);
  };

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
      <div className="mh">
        <h3>Create task</h3>
        <button className="x" onClick={() => setCreateOpen(false)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mb">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="Task title"
          style={{
            width: "100%",
            height: 40,
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            padding: "0 12px",
            fontSize: 14,
            marginBottom: 14,
            background: "var(--surface)",
            color: "var(--fg)",
          }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="stack" style={{ gap: 5, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            Status
            <select
              style={selectStyle}
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
            >
              <option value="">To Do</option>
              {(statuses ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="stack" style={{ gap: 5, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            Priority
            <select
              style={selectStyle}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label className="stack" style={{ gap: 5, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            Type
            <select style={selectStyle} value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              <option value="">—</option>
              {(types ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mf">
        <button className="btn ghost" onClick={() => setCreateOpen(false)}>
          Cancel
        </button>
        <button className="btn primary" onClick={create}>
          Create task
        </button>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  height: 34,
  border: "1px solid var(--border-strong)",
  borderRadius: 7,
  padding: "0 9px",
  background: "var(--surface)",
  color: "var(--fg)",
};
