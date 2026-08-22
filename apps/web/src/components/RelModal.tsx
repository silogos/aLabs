/** Link-issue picker — opens from a task drawer's Relationships "+ Add link".
 *  Pick one of three relation types, search issues, link bidirectionally. */
import { useState } from "react";
import { useApp } from "../store.js";
import { useTasksVersion, taskById, allTasks, addRelationship, type RelKey } from "../views/tasks-store.js";
import { TyIcon } from "../views/tasks-ui.js";
import { taskSerial } from "./ui.js";

const TYPES: { key: RelKey; label: string }[] = [
  { key: "blockedBy", label: "Blocked by" },
  { key: "blocks", label: "Blocks" },
  { key: "relates", label: "Relates to" },
];

export function RelModal() {
  useTasksVersion();
  const { relPickerId, closeRelPicker, toast } = useApp();
  const [type, setType] = useState<RelKey>("blockedBy");
  const [query, setQuery] = useState("");

  const t = relPickerId ? taskById(Number(relPickerId)) : undefined;
  if (!t) return null;

  const close = () => closeRelPicker();
  const linked = t.rel?.[type] ?? [];
  const q = query.trim().toLowerCase();
  const cands = allTasks()
    .filter(
      (x) =>
        x.id !== t.id &&
        x.ty !== "subtask" &&
        x.ty !== "epic" &&
        !linked.includes(x.id) &&
        (x.t + " " + taskSerial(x.id)).toLowerCase().includes(q),
    )
    .slice(0, 40);

  const link = (otherId: number) => {
    addRelationship(t.id, type, otherId);
    toast(`Linked ${taskSerial(otherId)}`);
    close();
  };

  return (
    <div className="modal rel-modal show" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="mh">
        <h3>Link issue</h3>
        <span className="status neutral"><span className="d" />{taskSerial(t.id)}</span>
        <button className="x" onClick={close} style={{ marginLeft: "auto" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="mb">
        <div className="rp-type">
          {TYPES.map((o) => (
            <button key={o.key} className={`rp-t${type === o.key ? " on" : ""}`} onClick={() => setType(o.key)}>
              {o.label}
            </button>
          ))}
        </div>
        <input
          className="fld rp-q"
          placeholder="Search issues by key or title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="rp-list">
          {cands.length ? (
            cands.map((x) => (
              <button key={x.id} className="rp-item" onClick={() => link(x.id)}>
                <TyIcon ty={x.ty} size={14} />
                <span className="rp-key mono">{taskSerial(x.id)}</span>
                <span className="rp-tt">{x.t}</span>
              </button>
            ))
          ) : (
            <div className="rp-empty muted tiny">No issues found</div>
          )}
        </div>
      </div>
    </div>
  );
}
