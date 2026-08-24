/** Create-issue modal — type picker + progressive fields (writes to tasks store). */
import { useState } from "react";
import { useApp } from "../store";
import { useTasksVersion, TY, P, SPRINTS, EPIC_IDS, taskById, allTasks, createIssue, peopleOptions, type TypeId, type PrioId } from "../views/tasks-store";
import { TyIcon } from "../views/tasks-ui";
import { taskSerial } from "./ui";

const CREATE_TYPES: TypeId[] = ["story", "task", "bug", "epic", "subtask"];
const PLACEHOLDERS: Record<TypeId, string> = {
  story: "e.g. As a user, I can…",
  task: "e.g. Set up CI cache layer",
  bug: "e.g. Login fails on Safari 17",
  epic: "e.g. Payment System",
  subtask: "e.g. Create payment UI",
};

export function TaskModal() {
  useTasksVersion();
  const { setCreateOpen, toast, openTask } = useApp();
  const [ty, setTy] = useState<TypeId>("story");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("mk");
  const [priority, setPriority] = useState<PrioId>("p3");
  const [sprint, setSprint] = useState("");
  const [epic, setEpic] = useState("");
  const [parent, setParent] = useState("");
  const [pts, setPts] = useState(0);
  const [due, setDue] = useState("");
  const [labels, setLabels] = useState("");

  const close = () => setCreateOpen(false);

  const submit = () => {
    if (!title.trim()) return;
    const id = createIssue({
      ty,
      title: title.trim(),
      desc: desc.trim() || undefined,
      assignee,
      priority,
      sp: ty === "subtask" ? null : sprint || null,
      epic: ty === "epic" ? null : epic ? Number(epic) : null,
      parent: ty === "subtask" && parent ? Number(parent) : null,
      pts,
      due: due || "Apr 05",
      labels: labels.split(",").map((s) => s.trim()).filter(Boolean),
    });
    close();
    setTitle("");
    toast(`Created ${taskSerial(id)} (${TY[ty].l})`);
    setTimeout(() => openTask(String(id)), 120);
  };

  return (
    <div className="modal create-modal show" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="mh">
        <h3>Create issue</h3>
        <span className="status neutral"><span className="d" />Draft</span>
        <button className="x" onClick={close} style={{ marginLeft: "auto" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="mb">
        <div className="cr-type">
          {CREATE_TYPES.map((c) => (
            <button key={c} className={`cr-t ${ty === c ? "on" : ""}`} onClick={() => setTy(c)}>
              <TyIcon ty={c} size={18} />
              {TY[c].l}
            </button>
          ))}
        </div>

        {ty === "subtask" && (
          <div className="cr-note">Subtasks inherit the parent's sprint and epic — set the parent below.</div>
        )}

        <input className="fld-lg" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={PLACEHOLDERS[ty]} />

        <textarea className="fld-area" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)…" />

        <div className="cr-grid">
          {ty === "subtask" ? (
            <label className="cr-f"><span>Parent</span>
              <select className="fld" value={parent} onChange={(e) => setParent(e.target.value)}>
                <option value="">Select parent…</option>
                {allTasks().filter((t) => t.ty !== "epic" && t.ty !== "subtask").map((t) => <option key={t.id} value={t.id}>{taskSerial(t.id)} · {t.t}</option>)}
              </select>
            </label>
          ) : ty === "epic" ? null : (
            <label className="cr-f"><span>Epic</span>
              <select className="fld" value={epic} onChange={(e) => setEpic(e.target.value)}>
                <option value="">None</option>
                {EPIC_IDS.map((e) => { const et = taskById(e); return et ? <option key={e} value={e}>{et.t}</option> : null; })}
              </select>
            </label>
          )}
          <label className="cr-f"><span>Assignee</span>
            <select className="fld" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              {peopleOptions().map(([k, nm]) => <option key={k} value={k}>{nm}</option>)}
            </select>
          </label>
          <label className="cr-f"><span>Priority</span>
            <select className="fld" value={priority} onChange={(e) => setPriority(e.target.value as PrioId)}>
              {[["p1", "Urgent"], ["p2", "High"], ["p3", "Medium"], ["p4", "Low"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          {ty !== "subtask" && (
            <label className="cr-f"><span>Sprint</span>
              <select className="fld" value={sprint} onChange={(e) => setSprint(e.target.value)}>
                <option value="">Backlog</option>
                {Object.keys(SPRINTS).map((k) => <option key={k} value={k}>{SPRINTS[k].name}</option>)}
              </select>
            </label>
          )}
          <label className="cr-f"><span>Story points</span>
            <input className="fld" type="number" min={0} value={pts} onChange={(e) => setPts(Number(e.target.value))} />
          </label>
          <label className="cr-f"><span>Labels <span className="muted" style={{ fontWeight: 400 }}>(comma-separated)</span></span>
            <input className="fld" value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="frontend, api" />
          </label>
          <label className="cr-f"><span>Due date</span>
            <input className="fld" value={due} onChange={(e) => setDue(e.target.value)} placeholder="Apr 05" />
          </label>
        </div>
      </div>
      <div className="mf">
        <span className="muted tiny left-meta">Saved as Draft · nothing is sent yet</span>
        <button className="btn ghost" onClick={close}>Cancel</button>
        <button className="btn primary" onClick={submit} disabled={!title.trim()}>Create {TY[ty].l}</button>
      </div>
    </div>
  );
}
