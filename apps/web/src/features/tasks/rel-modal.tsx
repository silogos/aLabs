/** Link-issue picker — opens from a task drawer's Relationships "+ Add link".
 *  Pick one of three relation types, search issues, link bidirectionally. */
import { useState } from "react";
import { useApp } from "@/providers/app-provider";
import { useBoard } from "./queries";
import { useTaskActions } from "./mutations";
import type { RelKey } from "./model";
import { TyIcon } from "./tasks-ui";
import { taskSerial } from "@/lib/serial";
import { Modal } from "@/components/ui/modal";

const TYPES: { key: RelKey; label: string }[] = [
  { key: "blockedBy", label: "Blocked by" },
  { key: "blocks", label: "Blocks" },
  { key: "relates", label: "Relates to" },
];

export function RelModal() {
  const board = useBoard();
  const { addRelationship } = useTaskActions();
  const { relPickerId, closeRelPicker, toast } = useApp();
  const [type, setType] = useState<RelKey>("blockedBy");
  const [query, setQuery] = useState("");

  const t = relPickerId ? board.taskById(Number(relPickerId)) : undefined;
  if (!t) return null;

  const close = () => closeRelPicker();
  const linked = t.rel?.[type] ?? [];
  const q = query.trim().toLowerCase();
  const cands = board.rows
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
    <Modal title="Link issue" onClose={close} className="rel-modal" onBackdrop={close} headerExtra={
      <span className="status neutral">
        <span className="d" />
        {taskSerial(t.id)}
      </span>
    }>
      <div className="mb">
        <div className="rp-type">
          {TYPES.map((o) => (
            <button
              key={o.key}
              className={`rp-t${type === o.key ? " on" : ""}`}
              onClick={() => setType(o.key)}
            >
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
    </Modal>
  );
}
