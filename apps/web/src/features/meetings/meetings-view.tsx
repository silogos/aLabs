/** Meetings view — master/detail split on live API data: filterable list +
 *  detail pane with agenda, notes, action items, and status actions. */
import { meetingsService } from "@/services/meetings";
import { tasksService } from "@/services/tasks";
import { workspaceService } from "@/services/workspace";
import type { ActionItem, Meeting, MeetingType, User } from "@pmin/core";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { useMembers } from "@/hooks/use-members";

import { personOf } from "@/features/tasks/store";
import { AvKey } from "@/features/tasks/tasks-ui";
import { taskSerial } from "@/lib/serial";
import { dateShort, timeShort, dateTime, toLocalDate } from "@/lib/format";
import { qk } from "@/lib/query-keys";

type MeetStatus = Meeting["status"];
type Seg = "upcoming" | "past" | "all";

const MTYPE: Record<MeetingType, { label: string; cls: string }> = {
  standup: { label: "Standup", cls: "i" },
  review: { label: "Review", cls: "v" },
  planning: { label: "Planning", cls: "b" },
  client: { label: "Client", cls: "o" },
  other: { label: "Other", cls: "" },
};
const MSTATUS: Record<MeetStatus, { label: string; tone: string }> = {
  scheduled: { label: "Scheduled", tone: "info" },
  completed: { label: "Completed", tone: "ok" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};


function AvStack({ ids }: { ids: string[] }) {
  const shown = ids.slice(0, 4);
  const extra = ids.length > 4 ? ids.length - 4 : 0;
  return (
    <span className="av-g">
      {shown.map((id) => (
        <AvKey key={id} id={id} size="sm" />
      ))}
      {extra > 0 && <span className="av more sm">+{extra}</span>}
    </span>
  );
}

export function MeetingsView() {
  const { project, toast, setView } = useApp();
  const pid = project!.id;
  const qc = useQueryClient();
  const { data: meetings, isLoading } = useQuery({
    queryKey: qk.meetings(pid),
    queryFn: () => meetingsService.list(pid),
  });
  const { data: members } = useMembers(project?.organizationId);
  // task serials for linked action-item chips (taskId → board number)
  const { data: taskPage } = useQuery({
    queryKey: qk.tasks(pid),
    queryFn: () => tasksService.list(pid),
  });


  const [seg, setSeg] = useState<Seg>("upcoming");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // meeting-tasks too: convert-to-task changes serials the chips render from
  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: qk.meetings(pid) });
    await qc.invalidateQueries({ queryKey: qk.tasks(pid) });
  };

  const all = meetings ?? [];
  const items = useMemo(() => {
    const inSeg = all.filter((m) =>
      seg === "all"
        ? true
        : seg === "upcoming"
          ? m.status === "scheduled"
          : m.status !== "scheduled",
    );
    return inSeg.sort((a, b) =>
      seg === "past"
        ? b.scheduledAt.localeCompare(a.scheduledAt)
        : a.scheduledAt.localeCompare(b.scheduledAt),
    );
  }, [all, seg]);
  const m = all.find((x) => x.id === currentId) ?? items[0] ?? all[0];

  const serialOf = (taskId: string) => {
    const t = taskPage?.items.find((x) => x.id === taskId);
    return t ? taskSerial(t.order) : null;
  };

  const setStatus = async (id: string, status: MeetStatus, label: string) => {
    try {
      await meetingsService.update(pid, id, { status });
      await refresh();
      toast(`Meeting ${label}`);
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const remove = async (id: string, title: string) => {
    try {
      await meetingsService.remove(pid, id);
      await refresh();
      toast(`"${title}" deleted`);
    } catch (e) {
      toast((e as Error).message);
    }
  };

  return (
    <section className="view active">
      <div className="toolbar">
        <div className="seg">
          {(["upcoming", "past", "all"] as Seg[]).map((v) => (
            <button key={v} className={seg === v ? "on" : ""} onClick={() => setSeg(v)}>
              {v[0]!.toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }} className="row">
          <button
            className="btn primary sm"
            data-od-id="meet-schedule"
            onClick={() => setScheduleOpen(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Schedule meeting
          </button>
        </div>
      </div>

      <div className="meet-grid" data-od-id="meet-split">
        {/* list */}
        <div className="card" data-od-id="meet-list">
          <div className="panel-head">
            <h3>Meetings</h3>
            <span className="muted">{items.length} total</span>
          </div>
          <div className="panel-body flush">
            {isLoading && (
              <div className="tiny faint" style={{ padding: "16px 14px" }}>
                Loading…
              </div>
            )}
            {!isLoading && items.length === 0 && (
              <div className="tiny faint" style={{ padding: "16px 14px" }}>
                No meetings here.
              </div>
            )}
            {items.map((it) => {
              const ity = MTYPE[it.type ?? "other"];
              const ist = MSTATUS[it.status];
              return (
                <div
                  key={it.id}
                  className={`meet-item ${it.id === m?.id ? "sel" : ""}`}
                  onClick={() => setCurrentId(it.id)}
                >
                  <div className="row between">
                    <span className={`tag ${ity.cls}`}>{ity.label}</span>
                    <span className={`status ${ist.tone}`}>
                      <span className="d"></span>
                      {ist.label}
                    </span>
                  </div>
                  <div className="mt-title">{it.title}</div>
                  <div className="mt-meta">
                    <span className="ic">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {dateTime(it.scheduledAt)}
                    </span>
                    {it.duration != null && (
                      <span className="ic">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {it.duration}m
                      </span>
                    )}
                  </div>
                  <div className="row between" style={{ marginTop: 8 }}>
                    <AvStack ids={it.participants.map((p) => p.id)} />
                    <span className="tiny muted">
                      {it.actionItems.length > 0
                        ? `${it.actionItems.filter((a) => a.done).length}/${it.actionItems.length} actions`
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* detail */}
        <div data-od-id="meet-detail">
          {!m ? (
            <div className="card meet-detail tiny faint">
              Nothing scheduled yet — use “Schedule meeting” to create the first one.
            </div>
          ) : (
            <MeetingDetail
              m={m}
              pid={pid}
              members={members?.map((x) => x.user) ?? []}
              serialOf={serialOf}
              onStatus={setStatus}
              onDelete={remove}
              refresh={refresh}
              openBoard={() => setView("tasks")}
            />
          )}
        </div>
      </div>

      {scheduleOpen && (
        <ScheduleModal
          pid={pid}
          members={members?.map((x) => x.user) ?? []}
          onClose={() => setScheduleOpen(false)}
          onCreated={async (id) => {
            await refresh();
            setCurrentId(id);
            setSeg("upcoming");
          }}
        />
      )}
    </section>
  );
}

/* ---------------- detail pane ---------------- */

function MeetingDetail({
  m,
  pid,
  members,
  serialOf,
  onStatus,
  onDelete,
  refresh,
  openBoard,
}: {
  m: Meeting;
  pid: string;
  members: User[];
  serialOf: (taskId: string) => string | null;
  onStatus: (id: string, status: MeetStatus, label: string) => void;
  onDelete: (id: string, title: string) => void;
  refresh: () => Promise<void>;
  openBoard: () => void;
}) {
  const ty = MTYPE[m.type ?? "other"];
  const st = MSTATUS[m.status];
  const doneN = m.actionItems.filter((a) => a.done).length;

  return (
    <div className="card meet-detail">
      <div className="meet-head">
        <div className="row between">
          <div className="row" style={{ gap: 8 }}>
            <span className={`tag ${ty.cls}`}>{ty.label}</span>
            <span className={`status ${st.tone}`}>
              <span className="d"></span>
              {st.label}
            </span>
          </div>
          {m.status === "scheduled" && (
            <div className="row" style={{ gap: 6 }}>
              <button
                className="btn subtle sm"
                onClick={() => onStatus(m.id, "completed", "marked completed")}
              >
                Mark completed
              </button>
              <button
                className="btn ghost sm"
                onClick={() => onStatus(m.id, "cancelled", "cancelled")}
              >
                Cancel meeting
              </button>
            </div>
          )}
        </div>
        <h2>{m.title}</h2>
        <div className="meet-facts">
          <span className="fact">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {dateTime(m.scheduledAt)} · {m.duration ?? 30} min
          </span>
          {m.location && (
            <span className="fact">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
              </svg>
              {m.location}
            </span>
          )}
          <span className="fact">
            <AvStack ids={m.participants.map((p) => p.id)} />
            {m.participants.length} participants
          </span>
        </div>
      </div>

      <div className="grid g2">
        <AgendaEditor m={m} pid={pid} refresh={refresh} />
        <div>
          <div className="section-title" style={{ margin: 0 }}>
            <h2>Participants</h2>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {m.participants.length === 0 && <div className="tiny faint">No participants yet.</div>}
            {m.participants.map((p) => (
              <div key={p.id} className="row" style={{ gap: 9, fontSize: 13 }}>
                <AvKey id={p.id} size="sm" />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NotesEditor m={m} pid={pid} refresh={refresh} />

      <div className="row between" style={{ margin: "18px 0 8px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Action items</h2>
        </div>
        <span className="muted tiny">
          {doneN}/{m.actionItems.length} done
        </span>
      </div>

      {m.actionItems.length === 0 && (
        <div className="tiny faint">No action items yet for this meeting.</div>
      )}
      {m.actionItems.map((a) => (
        <ActionItemRow
          key={a.id}
          a={a}
          pid={pid}
          serialOf={serialOf}
          refresh={refresh}
          openBoard={openBoard}
        />
      ))}

      <AddActionItem m={m} pid={pid} members={members} refresh={refresh} />

      <div
        className="row"
        style={{ gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}
      >
        <button
          className="btn ghost sm"
          style={{ color: "var(--danger)", marginLeft: "auto" }}
          onClick={() => onDelete(m.id, m.title)}
        >
          Delete meeting
        </button>
      </div>
    </div>
  );
}

/* ---------------- agenda ---------------- */

function AgendaEditor({
  m,
  pid,
  refresh,
}: {
  m: Meeting;
  pid: string;
  refresh: () => Promise<void>;
}) {
  const { toast } = useApp();
  const [items, setItems] = useState<string[]>(m.agenda ?? []);
  const [draft, setDraft] = useState("");
  useEffect(() => setItems(m.agenda ?? []), [m.id, m.agenda]);

  const save = async (next: string[]) => {
    setItems(next);
    try {
      await meetingsService.update(pid, m.id, { agenda: next });
      await refresh();
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j]!, next[i]!];
    void save(next);
  };

  return (
    <div>
      <div className="row between">
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Agenda</h2>
        </div>
        <span className="muted tiny">{items.length} items</span>
      </div>
      <ol className="agenda">
        {items.length === 0 && (
          <li style={{ color: "var(--muted)" }}>No agenda yet — add the first item below.</li>
        )}
        {items.map((a, i) => (
          <li key={i}>
            <span style={{ flex: 1 }}>{a}</span>
            <span className="row" style={{ gap: 2 }}>
              <button
                className="btn ghost xs"
                title="Move up"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="btn ghost xs"
                title="Move down"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
              >
                ↓
              </button>
              <button
                className="btn ghost xs"
                title="Remove"
                onClick={() => void save(items.filter((_, k) => k !== i))}
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="row" style={{ gap: 6, marginTop: 8 }}>
        <input
          className="fld"
          style={{ height: 30 }}
          value={draft}
          placeholder="Add an agenda item…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              void save([...items, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <button
          className="btn subtle sm"
          disabled={!draft.trim()}
          onClick={() => {
            if (!draft.trim()) return;
            void save([...items, draft.trim()]);
            setDraft("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ---------------- notes ---------------- */

function NotesEditor({
  m,
  pid,
  refresh,
}: {
  m: Meeting;
  pid: string;
  refresh: () => Promise<void>;
}) {
  const { toast } = useApp();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(m.notes ?? "");

  useEffect(() => {
    setEditing(false);
    setText(m.notes ?? "");
  }, [m.id, m.notes]);

  const save = async () => {
    try {
      await meetingsService.update(pid, m.id, { notes: text });
      await refresh();
      setEditing(false);
      toast("Notes saved");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  return (
    <>
      <div className="row between" style={{ margin: "18px 0 8px" }}>
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Notes</h2>
        </div>
        {!editing && (
          <button className="btn subtle sm" onClick={() => setEditing(true)}>
            {m.notes ? "Edit notes" : "Add notes"}
          </button>
        )}
      </div>
      {editing ? (
        <div className="stack" style={{ gap: 8 }}>
          <textarea
            className="fld"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Minutes, decisions, blockers…"
            rows={6}
            autoFocus
          />
          <div className="row" style={{ gap: 8 }}>
            <button className="btn primary sm" onClick={() => void save()}>
              Save notes
            </button>
            <button
              className="btn ghost sm"
              onClick={() => {
                setText(m.notes ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : m.notes ? (
        <div className="rpt-body">
          <p style={{ whiteSpace: "pre-wrap" }}>{m.notes}</p>
        </div>
      ) : (
        <div className="tiny faint">No notes captured yet.</div>
      )}
    </>
  );
}

/* ---------------- action items ---------------- */

function ActionItemRow({
  a,
  pid,
  serialOf,
  refresh,
  openBoard,
}: {
  a: ActionItem;
  pid: string;
  serialOf: (taskId: string) => string | null;
  refresh: () => Promise<void>;
  openBoard: () => void;
}) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const who = personOf(a.assigneeId ?? undefined);
  const serial = a.taskId ? serialOf(a.taskId) : null;

  const toggle = async () => {
    setBusy(true);
    try {
      await meetingsService.updateActionItem(pid, a.id, { done: !a.done });
      await refresh();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const convert = async () => {
    setBusy(true);
    try {
      const task = await tasksService.create(pid, {
        title: a.description,
        ...(a.assigneeId ? { assigneeId: a.assigneeId } : {}),
        ...(a.dueDate ? { dueDate: a.dueDate } : {}),
      });
      await meetingsService.updateActionItem(pid, a.id, { taskId: task.id });
      await refresh();
      toast(`Task ${taskSerial(task.order)} created from action item`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`act-item ${a.done ? "done" : ""}`}>
      <input
        type="checkbox"
        className="ckbox ck"
        checked={a.done}
        disabled={busy}
        onChange={() => void toggle()}
      />
      <div className="ai-body">
        <div className="ai-top">
          <b>{a.description}</b>
          {serial && (
            <span
              className="tag i"
              style={{ cursor: "pointer" }}
              title="Open the Tasks board"
              onClick={openBoard}
            >
              {serial}
            </span>
          )}
        </div>
        <div className="ai-meta">
          {who && (
            <>
              <AvKey id={a.assigneeId!} size="sm" />
              <span>{who.name}</span>
              <span>·</span>
            </>
          )}
          {a.dueDate && <span>Due {dateShort(a.dueDate)}</span>}
          {a.done && (
            <span className="status ok">
              <span className="d"></span>Done
            </span>
          )}
        </div>
      </div>
      {!a.done && !a.taskId && (
        <button
          className="btn ghost sm"
          disabled={busy}
          onClick={() => void convert()}
          title="Create a task from this action item"
        >
          → Task
        </button>
      )}
    </div>
  );
}

function AddActionItem({
  m,
  pid,
  members,
  refresh,
}: {
  m: Meeting;
  pid: string;
  members: User[];
  refresh: () => Promise<void>;
}) {
  const { toast } = useApp();
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState("");
  const [due, setDue] = useState("");

  const submit = async () => {
    if (!desc.trim()) return;
    try {
      await meetingsService.addActionItem(pid, m.id, {
        description: desc.trim(),
        ...(assignee ? { assigneeId: assignee } : {}),
        ...(due ? { dueDate: new Date(`${due}T00:00:00.000Z`).toISOString() } : {}),
      });
      setDesc("");
      setAssignee("");
      setDue("");
      await refresh();
      toast("Action item added");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  return (
    <div className="row" style={{ gap: 6, marginTop: 10 }}>
      <input
        className="fld"
        style={{ height: 30, flex: 1 }}
        value={desc}
        placeholder="New action item…"
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit();
        }}
      />
      <select
        className="fld"
        style={{ height: 30, width: 130 }}
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      >
        <option value="">Unassigned</option>
        {members.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        className="fld"
        style={{ height: 30, width: 140 }}
        value={due}
        onChange={(e) => setDue(e.target.value)}
      />
      <button className="btn subtle sm" disabled={!desc.trim()} onClick={() => void submit()}>
        Add
      </button>
    </div>
  );
}

/* ---------------- schedule modal ---------------- */

function ScheduleModal({
  pid,
  members,
  onClose,
  onCreated,
}: {
  pid: string;
  members: User[];
  onClose: () => void;
  onCreated: (id: string) => void | Promise<void>;
}) {
  const { toast } = useApp();
  const defaultWhen = () => {
    const d = new Date(Date.now() + 24 * 3600_000);
    d.setMinutes(0, 0, 0);
    return d;
  };
  const [w] = useState(defaultWhen);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MeetingType>("other");
  const [date, setDate] = useState(toLocalDate(w));
  const [time, setTime] = useState(`${String(w.getHours()).padStart(2, "0")}:00`);
  const [duration, setDuration] = useState("30");
  const [location, setLocation] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [err, setErr] = useState(false);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (!title.trim()) {
      setErr(true);
      return;
    }
    try {
      const m = await meetingsService.create(pid, {
        title: title.trim(),
        type,
        scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
        duration: parseInt(duration, 10) || 30,
        ...(location.trim() ? { location: location.trim() } : {}),
        participantIds: picked,
      });
      onClose();
      toast(`"${m.title}" scheduled · ${dateShort(m.scheduledAt)} ${timeShort(m.scheduledAt)}`);
      await onCreated(m.id);
    } catch (e) {
      toast((e as Error).message);
    }
  };

  return (
    <div className="scrim show" onClick={onClose} data-od-id="meet-schedule-modal">
      <div className="modal show" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <h3>Schedule meeting</h3>
          <button className="mh-x" onClick={onClose} title="Close">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb">
          <label className="flab">Title</label>
          <input
            className={`fld ${err ? "err" : ""}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErr(false);
            }}
            placeholder="e.g. Sprint 15 planning"
            autoFocus
          />
          {err && <div className="fld-err show">Please enter a title.</div>}

          <div className="frow" style={{ marginTop: 12 }}>
            <div>
              <label className="flab">Type</label>
              <select
                className="fld"
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
              >
                {(Object.keys(MTYPE) as MeetingType[]).map((t) => (
                  <option key={t} value={t}>
                    {MTYPE[t].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flab">Duration (min)</label>
              <input
                type="number"
                className="fld"
                value={duration}
                min={5}
                step={5}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="frow" style={{ marginTop: 12 }}>
            <div>
              <label className="flab">Date</label>
              <input
                type="date"
                className="fld"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="flab">Time</label>
              <input
                type="time"
                className="fld"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <label className="flab" style={{ marginTop: 12 }}>
            Location / link (optional)
          </label>
          <input
            className="fld"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Zoom · alabs.demos/room"
          />

          <label className="flab" style={{ marginTop: 12 }}>
            Participants
          </label>
          <div className="stack" style={{ gap: 6, maxHeight: 150, overflow: "auto" }}>
            {members.map((u) => (
              <label key={u.id} className="row" style={{ gap: 9, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  className="ck"
                  checked={picked.includes(u.id)}
                  onChange={() => toggle(u.id)}
                />
                <AvKey id={u.id} size="sm" />
                <span>{u.name}</span>
              </label>
            ))}
            {members.length === 0 && <div className="tiny faint">No members to invite.</div>}
          </div>
        </div>
        <div className="mf">
          <span className="left-meta">Created as Scheduled</span>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => void submit()}>
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
