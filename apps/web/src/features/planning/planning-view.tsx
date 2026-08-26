/** Planning view — interactive two-pane sprint board + timeline + velocity.
 *  Reads the shared tasks board (queries.ts) so it stays in sync with the
 *  Tasks board/list/backlog via the `task.sp` field. */
import { useState, useRef, useMemo, useEffect } from "react";
import { useApp } from "@/providers/app-provider";
import { taskSerial } from "@/lib/serial";
import {
  NOW_D,
  shortMD,
  daysBetween,
  fmtISO,
  spStatusClass,
  PRIO_ORDER,
} from "@/features/tasks/model";
import { useBoard } from "@/features/tasks/queries";
import { usePlanningActions } from "@/features/tasks/mutations";
import { TyIcon, StatusBadge, PrioBadge, AvKey } from "@/features/tasks/tasks-ui";
import { Modal } from "@/components/ui/modal";

type PlanView = "board" | "timeline" | "velocity";
type Zoom = "day" | "week" | "month";
const DAY_MS = 86400000;

function fitWindow(zoom: Zoom): [Date, Date] {
  const span = zoom === "day" ? 28 : zoom === "week" ? 70 : 180;
  const start = new Date(NOW_D.getTime() - Math.floor(span / 3) * DAY_MS);
  const end = new Date(start.getTime() + span * DAY_MS);
  return [start, end];
}
function colLabel(d: Date, zoom: Zoom): string {
  if (zoom === "month") return d.toLocaleDateString("en-US", { month: "short" });
  if (zoom === "day")
    return d.getDate() === 1
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : String(d.getDate());
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PlanningView() {
  const { toast } = useApp();
  const [planView, setPlanView] = useState<PlanView>("board");
  const [curSprint, setCurSprint] = useState<string>("");
  const [sprintModal, setSprintModal] = useState<{ editId?: string } | null>(null);
  const [msModal, setMsModal] = useState<{ editId?: string } | null>(null);

  return (
    <section className="view active" id="view-planning" data-od-id="view-planning">
      <div className="toolbar">
        <div className="seg">
          {(["board", "timeline", "velocity"] as PlanView[]).map((m) => (
            <button key={m} className={planView === m ? "on" : ""} onClick={() => setPlanView(m)}>
              {m === "board" ? "Iterations" : m === "timeline" ? "Timeline" : "Velocity"}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn primary sm" onClick={() => setSprintModal({})}>
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
            New iteration
          </button>
        </div>
      </div>

      {planView === "board" && (
        <BoardView curSprint={curSprint} setCurSprint={setCurSprint} toast={toast} />
      )}
      {planView === "timeline" && (
        <TimelineView
          onOpenSprint={(id) => setSprintModal({ editId: id })}
          onOpenMilestone={(editId) => setMsModal(editId ? { editId } : {})}
        />
      )}
      {planView === "velocity" && <VelocityView />}

      {sprintModal && (
        <SprintModal
          editId={sprintModal.editId}
          onClose={() => setSprintModal(null)}
          onCreated={(id) => {
            setCurSprint(id);
            setPlanView("board");
          }}
        />
      )}
      {msModal && (
        <MilestoneModal editId={msModal.editId} onClose={() => setMsModal(null)} toast={toast} />
      )}
    </section>
  );
}

/* ---------------- Board (two-pane: backlog ↔ sprint) ---------------- */

function BoardView({
  curSprint,
  setCurSprint,
  toast,
}: {
  curSprint: string;
  setCurSprint: (s: string) => void;
  toast: (s: string) => void;
}) {
  const board = useBoard();
  const sprintIds = board.sprintIds;
  const key = board.resolveSprint(curSprint);
  const plannable = board.isPlannable(key);

  return (
    <div id="plan-iter">
      <div className="iter-tabs">
        {sprintIds.map((k) => {
          const s = board.sprints[k];
          return (
            <div
              key={k}
              className={`iter-tab ${k === key ? "on" : ""}`}
              onClick={() => setCurSprint(k)}
            >
              <div className="it-name">
                <span className={`status ${spStatusClass(s.st)}`}>
                  <span className="d"></span>
                  {s.name}
                </span>
              </div>
              <div className="it-meta">
                {s.start} – {s.end} · {board.sprintStatusLabel(k)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="plan-split">
        <BacklogPane curSprint={key} plannable={plannable} toast={toast} />
        <SprintPane curSprint={key} plannable={plannable} toast={toast} />
      </div>
    </div>
  );
}

function SprintPane({
  curSprint,
  plannable,
  toast,
}: {
  curSprint: string;
  plannable: boolean;
  toast: (s: string) => void;
}) {
  const board = useBoard();
  const { startIter, completeIter, revertToPlanned, reopenToActive, commitToSprint } =
    usePlanningActions();
  const s = board.sprints[curSprint];
  const tasks = board.iterTasks(curSprint);
  const committed = board.committedPts(curSprint);
  const cap = s?.capacity ?? null;
  const pct = cap ? Math.min(100, Math.round((committed / cap) * 100)) : 0;
  const over = !!(cap && committed > cap);
  const avg = Math.round(
    board.velocity.reduce((n, d) => n + d.completed, 0) / Math.max(1, board.velocity.length),
  );
  if (!s) {
    return (
      <div id="plan-sprint">
        <div className="card plan-pane">
          <div className="empty-plan">No iterations yet — create the first one.</div>
        </div>
      </div>
    );
  }

  let action: React.ReactNode = null;
  if (s.st === "planned")
    action = (
      <button
        className="btn primary sm"
        onClick={() => {
          startIter(curSprint);
          toast(s.name + " started");
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Start sprint
      </button>
    );
  else if (s.st === "active")
    action = (
      <>
        <button
          className="btn ghost sm"
          onClick={() => {
            toast(completeIter(curSprint));
          }}
        >
          Complete sprint
        </button>
        <button
          className="btn subtle xs"
          title="Move this sprint back to Planned"
          onClick={() => {
            revertToPlanned(curSprint);
            toast(s.name + " moved back to Planned");
          }}
        >
          Back to Planned
        </button>
      </>
    );
  else
    action = (
      <button
        className="btn ghost sm"
        title="Reopen this sprint"
        onClick={() => {
          toast(reopenToActive(curSprint));
        }}
      >
        Reopen
      </button>
    );

  return (
    <div id="plan-sprint">
      <div
        className="card plan-pane"
        onDragOver={(e) => {
          if (plannable) e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id && plannable) {
            commitToSprint(+id, curSprint);
            toast(taskSerial(id) + " → " + s.name);
          }
        }}
      >
        <div className="panel-head">
          <h3>{s.name}</h3>
          <span className={`status ${spStatusClass(s.st)}`}>
            <span className="d"></span>
            {board.sprintStatusLabel(curSprint)}
          </span>
          <div className="right">{action}</div>
        </div>
        <div className="sp-meta">
          <div className="sp-goal">
            <svg
              className="ci"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>{s.goal}</span>
          </div>
          {cap ? (
            <div className="sp-cap">
              <div className="row between" style={{ marginBottom: 5 }}>
                <span className="tiny mono muted">
                  Committed · {committed} / {cap} pts · avg velocity {avg}
                </span>
                <span
                  className="tiny mono"
                  style={{ color: `var(--${over ? "warn" : "ok"})`, fontWeight: 600 }}
                >
                  {over
                    ? `over by ${committed - cap} pts`
                    : committed === cap
                      ? "at capacity"
                      : `room for ${cap - committed}`}
                </span>
              </div>
              <div className={`bar ${over ? "warn" : "ok"}`} style={{ height: 8 }}>
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          ) : (
            <div className="row between">
              <span className="tiny mono muted">
                {committed} pts committed · {tasks.length} issues
              </span>
              <span className="tiny mono muted">avg velocity {avg} pts</span>
            </div>
          )}
        </div>
        <div className="panel-body flush sp-list">
          {tasks.length ? (
            tasks.map((t) => (
              <SprintItem key={t.id} id={t.id} plannable={plannable} toast={toast} />
            ))
          ) : (
            <div className="empty-plan">
              {plannable
                ? "No items committed yet — pull work in from the backlog on the left, or use Plan sprint."
                : "No issues in this sprint."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SprintItem({
  id,
  plannable,
  toast,
}: {
  id: number;
  plannable: boolean;
  toast: (s: string) => void;
}) {
  const t = useBoard().taskById(id);
  const { uncommitFromSprint } = usePlanningActions();
  const { openTask } = useApp();
  if (!t) return null;
  return (
    <div
      className="sprint-item"
      draggable={plannable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        openTask(String(id));
      }}
    >
      {plannable ? (
        <button
          className="btn subtle xs"
          data-uncommit={id}
          title="Return to backlog"
          onClick={(e) => {
            e.stopPropagation();
            uncommitFromSprint(id);
            toast(taskSerial(id) + " returned to backlog");
          }}
        >
          ◀
        </button>
      ) : (
        <span className="plan-spacer" />
      )}
      <TyIcon ty={t.ty} />
      <span className="tid">{taskSerial(t.id)}</span>
      <span className="tt">{t.t}</span>
      <StatusBadge s={t.s} />
      <span className="pts">{t.pts || 0}</span>
      <AvKey id={t.a} size="sm" />
    </div>
  );
}

function BacklogPane({
  curSprint,
  plannable,
  toast,
}: {
  curSprint: string;
  plannable: boolean;
  toast: (s: string) => void;
}) {
  const { openTask } = useApp();
  const board = useBoard();
  const { uncommitFromSprint, planSprintAuto, commitToSprint } = usePlanningActions();
  const items = useMemo(
    () =>
      board.rows
        .filter((t) => !t.parent && t.ty !== "epic" && !t.sp)
        .sort((a, b) => PRIO_ORDER.indexOf(a.p) - PRIO_ORDER.indexOf(b.p)),
    [board.rows],
  );
  const unpointed = items.filter((t) => !t.pts).length;

  return (
    <div id="plan-backlog">
      <div
        className="card plan-pane"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) {
            uncommitFromSprint(+id);
            toast(taskSerial(id) + " returned to backlog");
          }
        }}
      >
        <div className="panel-head">
          <h3>Backlog</h3>
          <span className="muted tiny">
            {items.length} items{unpointed ? ` · ${unpointed} unpointed` : ""}
          </span>
          <div className="right">
            <button
              className="btn ghost sm"
              disabled={!plannable}
              title={plannable ? "" : "Select a Planned or Active sprint to plan"}
              onClick={() => toast(planSprintAuto(curSprint))}
            >
              Plan sprint
            </button>
          </div>
        </div>
        <div className="panel-body flush">
          {items.length ? (
            items.map((t) => (
              <div
                key={t.id}
                className="backlog-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(t.id));
                  e.dataTransfer.effectAllowed = "move";
                }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  openTask(String(t.id));
                }}
              >
                <TyIcon ty={t.ty} />
                <span className="tid">{taskSerial(t.id)}</span>
                <span className="tt">{t.t}</span>
                <span className={`pts ${t.pts ? "" : "unpointed"}`}>{t.pts || "?"}</span>
                <PrioBadge p={t.p} />
                {plannable ? (
                  <button
                    className="btn subtle xs"
                    data-commit={t.id}
                    title={`Move into ${board.sprints[curSprint]?.name ?? "sprint"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      commitToSprint(t.id, curSprint);
                      toast(taskSerial(t.id) + " → " + (board.sprints[curSprint]?.name ?? "sprint"));
                    }}
                  >
                    →
                  </button>
                ) : (
                  <span style={{ width: 26 }} />
                )}
              </div>
            ))
          ) : (
            <div className="empty-plan">
              Backlog is empty — every work item is committed to a sprint.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Velocity ---------------- */

function VelocityView() {
  const board = useBoard();
  const currentKey = board.sprintIds.find((k) => board.sprints[k]?.st === "active") ?? board.sprintIds.at(-1);
  const cur = currentKey
    ? {
        name: (board.sprints[currentKey]!.name ?? "").replace("Sprint ", "S"),
        committed: board.committedPts(currentKey),
        completed: board.donePts(currentKey),
      }
    : null;
  const data = cur ? [...board.velocity.filter((d) => d.name !== cur.name), cur] : board.velocity;
  const max = Math.max(1, ...data.map((d) => d.committed));
  const avg = Math.round(
    data.slice(0, -1).reduce((n, d) => n + d.completed, 0) / Math.max(1, data.length - 1),
  );
  const [tipIdx, setTipIdx] = useState<number | null>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tipPos, setTipPos] = useState<{ left: number; top: number } | null>(null);

  const d = tipIdx != null ? data[tipIdx] : null;
  const isCur = d === cur;
  const pct = d && d.committed ? Math.round((d.completed / d.committed) * 100) : 0;
  const delta = d ? d.completed - d.committed : 0;
  const note = d
    ? isCur
      ? "In progress · not final"
      : delta >= 0
        ? delta > 0
          ? `Exceeded by ${delta}`
          : "Met commitment"
        : `${Math.abs(delta)} pts short`
    : "";
  const col = d
    ? isCur
      ? "var(--info)"
      : delta >= 0
        ? "var(--ok)"
        : "var(--warn)"
    : "var(--muted)";

  return (
    <div id="plan-velocity">
      <div className="card">
        <div className="panel-head">
          <h3>Velocity</h3>
          <span className="muted">Hover a sprint for detail</span>
          <div className="right">
            <span className="tiny mono muted">
              avg {avg} pts · last {data.length}
            </span>
          </div>
        </div>
        <div className="panel-body">
          <div className="vel-chart">
            {data.map((dd, i) => (
              <div
                key={i}
                className="vel-group"
                ref={(el) => {
                  groupRefs.current[i] = el;
                }}
                onMouseEnter={() => {
                  setTipIdx(i);
                  const r = groupRefs.current[i]?.getBoundingClientRect();
                  if (r) setTipPos({ left: r.left + r.width / 2, top: r.top });
                }}
                onMouseLeave={() => setTipIdx(null)}
              >
                <div
                  className="vel-bar plan"
                  style={{ height: `${Math.round((dd.committed / max) * 100)}%` }}
                />
                <div
                  className="vel-bar act"
                  style={{ height: `${Math.round((dd.completed / max) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="vel-x">
            {data.map((dd) => (
              <span className="vx" key={dd.name}>
                {dd.name}
              </span>
            ))}
          </div>
          <div className="row" style={{ gap: 14, marginTop: 14, justifyContent: "center" }}>
            <span className="tiny mono" style={{ color: "var(--muted)" }}>
              ▮ Committed
            </span>
            <span className="tiny mono" style={{ color: "var(--accent)" }}>
              ▮ Completed
            </span>
          </div>
        </div>
      </div>
      {d && tipPos && (
        <VelTip d={d} isCur={isCur} pct={pct} note={note} col={col} anchor={tipPos} />
      )}
    </div>
  );
}

function VelTip({
  d,
  isCur,
  pct,
  note,
  col,
  anchor,
}: {
  d: { name: string; committed: number; completed: number };
  isCur: boolean;
  pct: number;
  note: string;
  col: string;
  anchor: { left: number; top: number };
}) {
  const tw = 176;
  const th = 116;
  let left = anchor.left - tw / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
  let top = anchor.top - th - 10;
  if (top < 8) top = anchor.top + 34 + 10;
  return (
    <div className="vel-tip show" style={{ left, top, minWidth: 160 }}>
      <div className="vt-head">
        <b>{d.name}</b>
        {isCur && <span className="vt-tag">Active</span>}
      </div>
      <div className="vt-row">
        <span className="vt-sw plan" />
        Committed<b>{d.committed}</b>
      </div>
      <div className="vt-row">
        <span className="vt-sw act" />
        Completed<b>{d.completed}</b>
      </div>
      <div className="vt-foot" style={{ color: col }}>
        {pct}% · {note}
      </div>
    </div>
  );
}

/* ---------------- Timeline (Gantt) ---------------- */

function TimelineView({
  onOpenSprint,
  onOpenMilestone,
}: {
  onOpenSprint: (id: string) => void;
  onOpenMilestone: (editId?: string) => void;
}) {
  const [zoom, setZoom] = useState<Zoom>("week");
  const [win, setWin] = useState<[Date, Date]>(() => fitWindow("week"));
  const board = useBoard();

  const applyZoom = (z: Zoom) => {
    setZoom(z);
    setWin(fitWindow(z));
  };
  const shift = (dir: number) => {
    const span = Math.round((win[1].getTime() - win[0].getTime()) / DAY_MS);
    setWin([
      new Date(win[0].getTime() + dir * span * DAY_MS),
      new Date(win[1].getTime() + dir * span * DAY_MS),
    ]);
  };

  const [winStart, winEnd] = win;
  const spanDays = Math.round((winEnd.getTime() - winStart.getTime()) / DAY_MS);
  const step = zoom === "day" ? 1 : zoom === "week" ? 7 : 30;
  const cols: Date[] = useMemo(() => {
    const out: Date[] = [];
    let d =
      zoom === "month"
        ? new Date(winStart.getFullYear(), winStart.getMonth(), 1)
        : new Date(winStart);
    let guard = 0;
    while (d <= winEnd && guard++ < 400) {
      out.push(new Date(d));
      d =
        zoom === "month"
          ? new Date(d.getFullYear(), d.getMonth() + 1, 1)
          : new Date(d.getTime() + step * DAY_MS);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winStart.getTime(), winEnd.getTime(), zoom]);

  const todayPct = Math.max(
    0,
    Math.min(100, (daysBetween(fmtISO(winStart), fmtISO(NOW_D)) / spanDays) * 100),
  );

  const rows: (
    | { kind: "sprint"; k: string; l: string; sub: string; a: string; b: string; cls: string }
    | { kind: "ms"; id: string; l: string; sub: string; date: string; risk: string }
  )[] = [
    ...board.sprintIds.map((k) => {
      const s = board.sprints[k];
      return {
        kind: "sprint" as const,
        k,
        l: s.name,
        sub: board.sprintStatusLabel(k),
        a: s.from,
        b: s.to,
        cls: s.st === "active" ? "iter" : s.st === "completed" ? "done" : "task",
      };
    }),
    ...board.milestones.map((m) => ({
      kind: "ms" as const,
      id: m.id,
      l: m.t,
      sub: shortMD(m.date),
      date: m.date,
      risk: m.risk,
    })),
  ];

  return (
    <div className="card">
      <div className="panel-head" id="gantt-head">
        <h3>Timeline</h3>
        <div className="gantt-tools">
          <div className="zoom">
            {(["day", "week", "month"] as Zoom[]).map((z) => (
              <button key={z} className={zoom === z ? "on" : ""} onClick={() => applyZoom(z)}>
                {z[0].toUpperCase() + z.slice(1)}
              </button>
            ))}
          </div>
          <span className="range-lbl">
            {shortMD(winStart)} – {shortMD(winEnd)}
          </span>
          <button className="btn ghost xs" onClick={() => shift(-1)}>
            ‹
          </button>
          <button className="btn ghost xs" onClick={() => setWin(fitWindow(zoom))}>
            Today
          </button>
          <button className="btn ghost xs" onClick={() => shift(1)}>
            ›
          </button>
          <button
            className="btn primary xs"
            title="Add a milestone"
            onClick={() => onOpenMilestone()}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Milestone
          </button>
        </div>
      </div>
      <div className="gantt">
        <div className="gantt-grid">
          <div className="gantt-axis">
            <div className="lbl">Work item</div>
            <div
              className="gantt-weeks"
              style={{ gridTemplateColumns: `repeat(${cols.length},1fr)` }}
            >
              {cols.map((c, i) => {
                const isToday =
                  zoom === "month"
                    ? c.getMonth() === NOW_D.getMonth() && c.getFullYear() === NOW_D.getFullYear()
                    : Math.abs(c.getTime() - NOW_D.getTime()) < (step * DAY_MS) / 2;
                return (
                  <div key={i} className={`gantt-week ${isToday ? "today" : ""}`}>
                    {colLabel(c, zoom)}
                  </div>
                );
              })}
            </div>
          </div>
          {rows.map((r, idx) => (
            <div className="gantt-row" key={idx}>
              <div className="gl">
                <b>{r.l}</b>
                <small>{r.sub}</small>
              </div>
              <div className="gantt-track">
                <div className="gantt-today-line" style={{ left: `${todayPct}%` }} />
                {r.kind === "ms" ? (
                  <div
                    className={`gantt-ms ${r.risk === "at_risk" ? "warn" : "ms"}`}
                    style={{
                      left: `${Math.max(0, Math.min(100, (daysBetween(fmtISO(winStart), r.date) / spanDays) * 100))}%`,
                    }}
                    title={`${r.l} · ${r.sub} · click to edit`}
                    onClick={() => onOpenMilestone(r.id)}
                  />
                ) : (
                  <GanttBar
                    r={r}
                    winStart={winStart}
                    spanDays={spanDays}
                    onClick={() => onOpenSprint(r.k)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GanttBar({
  r,
  winStart,
  spanDays,
  onClick,
}: {
  r: { k: string; l: string; a: string; b: string };
  winStart: Date;
  spanDays: number;
  onClick: () => void;
}) {
  const leftDays = daysBetween(fmtISO(winStart), r.a);
  const rightDays = daysBetween(fmtISO(winStart), r.b);
  const l = Math.max(0, (leftDays / spanDays) * 100);
  const rr = Math.min(100, (rightDays / spanDays) * 100);
  return (
    <div
      className="gantt-bar"
      style={{ left: `${l}%`, width: `${Math.max(3, rr - l)}%` }}
      title={`${r.l} · click for details`}
      onClick={onClick}
    >
      {r.l}
    </div>
  );
}

/* ---------------- Create sprint modal ---------------- */

function SprintModal({
  editId,
  onClose,
  onCreated,
}: {
  editId?: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { toast } = useApp();
  const board = useBoard();
  const { createSprint, updateSprint } = usePlanningActions();
  const [win] = useState<[Date, Date]>(() => fitWindow("week"));
  const [minD, maxD] = [fmtISO(win[0]), fmtISO(win[1])];
  const edit = editId ? board.sprints[editId] : undefined;
  const isEdit = !!edit;
  const [name, setName] = useState(edit?.name ?? "");
  const [goal, setGoal] = useState(
    edit && edit.goal && edit.goal !== "No goal set" ? edit.goal : "",
  );
  const [start, setStart] = useState(edit?.from ?? "");
  const [end, setEnd] = useState(edit?.to ?? "");
  const [cap, setCap] = useState(edit?.capacity ? String(edit.capacity) : "");
  const [nameErr, setNameErr] = useState(false);
  const [dateErr, setDateErr] = useState<{ msg: string; which: "start" | "end" | null }>({
    msg: "",
    which: null,
  });

  // default dates — create mode only
  useEffect(() => {
    if (isEdit) return;
    const ws = win[0].getTime();
    const we = win[1].getTime();
    let ds = new Date(NOW_D.getTime() + 21 * DAY_MS);
    let de = new Date(NOW_D.getTime() + 35 * DAY_MS);
    if (ds.getTime() < ws) ds = new Date(ws + 7 * DAY_MS);
    if (de.getTime() > we) de = new Date(we - DAY_MS);
    if (de.getTime() <= ds.getTime()) {
      const span = Math.max(7, Math.round((we - ws) / DAY_MS / 3));
      ds = new Date(ws + span * DAY_MS);
      de = new Date(ds.getTime() + 7 * DAY_MS);
      if (de.getTime() > we) de = new Date(we);
    }
    setStart(fmtISO(ds));
    setEnd(fmtISO(de));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    setNameErr(false);
    setDateErr({ msg: "", which: null });
    if (!name.trim()) {
      setNameErr(true);
      return;
    }
    const startV = start || fmtISO(new Date(NOW_D.getTime() + 7 * DAY_MS));
    const endV = end || fmtISO(new Date(NOW_D.getTime() + 21 * DAY_MS));
    if (startV < minD || endV > maxD) {
      setDateErr({
        msg: `Dates must fall within the timeline (${shortMD(win[0])} – ${shortMD(win[1])}).`,
        which: startV < minD ? "start" : "end",
      });
      return;
    }
    if (startV >= endV) {
      setDateErr({ msg: "End date must be after the start date.", which: "end" });
      return;
    }
    const capacity = parseInt(cap, 10) || null;
    const payload = {
      name: name.trim(),
      goal: goal.trim(),
      fromISO: startV,
      toISO: endV,
      capacity,
    };
    if (isEdit && editId) {
      updateSprint(editId, payload);
      onClose();
      toast(name.trim() + " updated · " + shortMD(startV) + " – " + shortMD(endV));
    } else {
      onClose();
      createSprint(payload)
        .then((it) => {
          toast(name.trim() + " created · Planned");
          onCreated(it.id);
        })
        .catch(() => undefined); // createSprint already toasts on failure
    }
  };

  const statusCls = edit ? spStatusClass(edit.st) : "neutral";
  const statusLbl = edit && editId ? board.sprintStatusLabel(editId) : "Planned";

  return (
    <div className="scrim show" onClick={onClose} data-od-id="new-sprint-modal">
      <Modal
        title={isEdit ? "Iteration details" : "New iteration"}
        onClose={onClose}
        headerExtra={
          <span className={`status ${statusCls}`}>
            <span className="d"></span>
            {statusLbl}
          </span>
        }
      >
        <div className="mb">
          <label className="flab">Sprint name</label>
          <input
            className={`fld ${nameErr ? "err" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 16"
            autoFocus
          />
          {nameErr && <div className="fld-err show">Please enter a name.</div>}

          <label className="flab" style={{ marginTop: 12 }}>
            Goal
          </label>
          <textarea
            className="fld"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="One-sentence outcome for this sprint"
            rows={2}
          />

          <div className="frow" style={{ marginTop: 12 }}>
            <div>
              <label className="flab">Start date</label>
              <input
                type="date"
                className={`fld ${dateErr.which === "start" ? "err" : ""}`}
                value={start}
                min={minD}
                max={maxD}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="flab">End date</label>
              <input
                type="date"
                className={`fld ${dateErr.which === "end" ? "err" : ""}`}
                value={end}
                min={minD}
                max={maxD}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          {dateErr.msg && (
            <div className="fld-err show" style={{ marginBottom: 0 }}>
              {dateErr.msg}
            </div>
          )}
          <div className="sp-range-hint">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Within timeline · {shortMD(win[0])} – {shortMD(win[1])}
          </div>

          <label className="flab">Capacity (story points, optional)</label>
          <input
            type="number"
            className="fld"
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            placeholder="e.g. 40"
            min={0}
          />
        </div>
        <div className="mf">
          <span className="left-meta">
            {isEdit && edit
              ? `${edit.start} – ${edit.end}${edit.capacity ? " · " + edit.capacity + " pts cap" : ""}`
              : "Created as Planned · nothing is committed yet"}
          </span>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            {isEdit ? "Save changes" : "Create as Planned"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Milestone modal (add/edit/delete) ---------------- */

function MilestoneModal({
  editId,
  onClose,
  toast,
}: {
  editId?: string;
  onClose: () => void;
  toast: (s: string) => void;
}) {
  const board = useBoard();
  const { addMilestone, updateMilestone, deleteMilestone } = usePlanningActions();
  const [win] = useState<[Date, Date]>(() => fitWindow("week"));
  const [minD, maxD] = [fmtISO(win[0]), fmtISO(win[1])];
  const edit = editId ? board.milestones.find((m) => m.id === editId) : undefined;
  const isEdit = !!edit;
  const [name, setName] = useState(edit?.t ?? "");
  const [date, setDate] = useState(edit?.date ?? "");
  const [risk, setRisk] = useState<"on_track" | "at_risk">(edit?.risk ?? "on_track");
  const [nameErr, setNameErr] = useState(false);
  const [dateErr, setDateErr] = useState("");

  // default date — create mode only
  useEffect(() => {
    if (isEdit) return;
    const ws = win[0].getTime();
    const we = win[1].getTime();
    let d = new Date(NOW_D.getTime() + 21 * DAY_MS);
    if (d.getTime() < ws) d = new Date(ws + 7 * DAY_MS);
    if (d.getTime() > we) d = new Date(we - DAY_MS);
    setDate(fmtISO(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    setNameErr(false);
    setDateErr("");
    if (!name.trim()) {
      setNameErr(true);
      return;
    }
    const dv = date || fmtISO(new Date(NOW_D.getTime() + 14 * DAY_MS));
    if (dv < minD || dv > maxD) {
      setDateErr(`Date must fall within the timeline (${shortMD(win[0])} – ${shortMD(win[1])}).`);
      return;
    }
    const payload = { t: name.trim(), date: dv, risk };
    if (isEdit && editId) {
      updateMilestone(editId, payload);
      onClose();
      toast(payload.t + " updated · " + shortMD(dv));
    } else {
      onClose();
      addMilestone(payload)
        .then(() => toast(payload.t + " added · " + shortMD(dv)))
        .catch(() => undefined); // addMilestone already toasts on failure
    }
  };

  const remove = () => {
    if (!isEdit || !editId) return;
    const m = board.milestones.find((x) => x.id === editId);
    deleteMilestone(editId);
    onClose();
    toast((m?.t ?? "Milestone") + " deleted");
  };

  return (
    <div className="scrim show" onClick={onClose} data-od-id="milestone-modal">
      <Modal
        title={isEdit ? "Milestone details" : "New milestone"}
        onClose={onClose}
        headerExtra={
          <span className={`status ${risk === "at_risk" ? "warn" : "ok"}`}>
            <span className="d"></span>
            {risk === "at_risk" ? "At risk" : "On track"}
          </span>
        }
      >
        <div className="mb">
          <label className="flab">Name</label>
          <input
            className={`fld ${nameErr ? "err" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Security hardening"
            autoFocus
          />
          {nameErr && <div className="fld-err show">Please enter a name.</div>}

          <label className="flab" style={{ marginTop: 12 }}>
            Target date
          </label>
          <input
            type="date"
            className={`fld ${dateErr ? "err" : ""}`}
            value={date}
            min={minD}
            max={maxD}
            onChange={(e) => setDate(e.target.value)}
          />
          {dateErr ? (
            <div className="fld-err show" style={{ marginBottom: 0 }}>
              {dateErr}
            </div>
          ) : (
            <div className="sp-range-hint">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Within timeline · {shortMD(win[0])} – {shortMD(win[1])}
            </div>
          )}

          <label className="flab">Status</label>
          <div className="seg">
            <button
              type="button"
              className={risk === "on_track" ? "on" : ""}
              onClick={() => setRisk("on_track")}
            >
              On track
            </button>
            <button
              type="button"
              className={risk === "at_risk" ? "on" : ""}
              onClick={() => setRisk("at_risk")}
            >
              At risk
            </button>
          </div>
        </div>
        <div className="mf">
          <span className="left-meta">
            {isEdit && edit
              ? `${shortMD(edit.date)}${edit.risk === "at_risk" ? " · At risk" : " · On track"}`
              : "A point in time on the timeline"}
          </span>
          {isEdit && (
            <button className="btn ghost" style={{ color: "var(--danger)" }} onClick={remove}>
              Delete
            </button>
          )}
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            {isEdit ? "Save changes" : "Create milestone"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
