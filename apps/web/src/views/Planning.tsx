/** Planning view — iterations, milestones, backlog, velocity, timeline. */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api.js";
import { useApp } from "../store.js";
import { Avatar, TypeTag, colorFor, dueLabel, initials, taskSerial } from "../components/ui.js";
import type { Iteration, Milestone, Task } from "@pmin/core";

export function Planning() {
  const { project, openTask, toast } = useApp();
  const pid = project!.id;
  const [mode, setMode] = useState<"iterations" | "timeline">("iterations");
  const { data: iterations } = useQuery({ queryKey: ["iterations", pid], queryFn: () => api.iterations(pid) });
  const { data: milestones } = useQuery({ queryKey: ["milestones", pid], queryFn: () => api.milestones(pid) });
  const { data: page } = useQuery({ queryKey: ["tasks", pid], queryFn: () => api.tasks(pid) });
  const [activeIter, setActiveIter] = useState<string | null>(null);

  const tasks = page?.items ?? [];
  const its = iterations ?? [];
  const ms = milestones ?? [];
  const current = its.find((i) => i.id === (activeIter ?? its.find((x) => x.status === "active")?.id ?? its[0]?.id));
  const backlog = tasks.filter((t) => !t.iterationId);

  return (
    <section className="view active">
      <div className="toolbar">
        <div className="seg">
          <button className={mode === "iterations" ? "on" : ""} onClick={() => setMode("iterations")}>
            Iterations
          </button>
          <button className={mode === "timeline" ? "on" : ""} onClick={() => setMode("timeline")}>
            Timeline
          </button>
        </div>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn subtle sm" onClick={() => toast("Velocity report")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3v18h18M7 14l3-3 3 2 4-5" />
            </svg>
            Velocity
          </button>
          <button className="btn primary sm" onClick={() => toast("New iteration")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New iteration
          </button>
        </div>
      </div>

      {mode === "iterations" ? (
        <>
          <div className="iter-tabs">
            {its.map((it) => (
              <div
                key={it.id}
                className={`iter-tab ${current?.id === it.id ? "on" : ""}`}
                onClick={() => setActiveIter(it.id)}
              >
                <div className="it-name">
                  <span className={`status ${iterTone(it)}`}>
                    <span className="d"></span>
                    {it.name.split("—")[0]?.trim()}
                  </span>
                </div>
                <div className="it-meta">
                  {dueLabel(it.startDate)}–{dueLabel(it.endDate)} · {cap(it.status)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid g2" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            {current && <ActiveIteration iter={current} tasks={tasks} />}
            <MilestonesCard milestones={ms} />
          </div>

          <div className="grid g2" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 14, marginTop: 14 }}>
            <Backlog tasks={backlog} onOpen={openTask} />
            <Velocity />
          </div>
        </>
      ) : (
        <Timeline iterations={its} milestones={ms} />
      )}
    </section>
  );
}

function iterTone(i: Iteration): string {
  return i.status === "active" ? "info" : i.status === "completed" ? "ok" : "neutral";
}
function cap(s: string) {
  return s[0]!.toUpperCase() + s.slice(1);
}

function ActiveIteration({ iter, tasks }: { iter: Iteration; tasks: Task[] }) {
  const inIter = tasks.filter((t) => t.iterationId === iter.id);
  const byBucket = (names: string[]) =>
    inIter.filter((t) => names.some(/* statusName unknown */ () => true)).length;
  // buckets derived from status id counts are not available without statuses;
  // show counts by a simple split for the demo.
  const todo = inIter.length;
  return (
    <div className="card">
      <div className="panel-head">
        <h3>{iter.name}</h3>
        <div className="right">
          <span className="status info"><span className="d"></span>Active</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="small muted">Progress · {iter.completedPoints} of {iter.committedPoints} pts</span>
          <span className="mono small" style={{ color: "var(--accent)", fontWeight: 600 }}>
            {iter.progress}%
          </span>
        </div>
        <div className="bar" style={{ height: 8, marginBottom: 14 }}>
          <i style={{ width: `${iter.progress}%` }}></i>
        </div>
        <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
          <span className="chip muted">{todo} tasks</span>
          <span className="chip" style={{ background: "var(--ok-bg)", borderColor: "oklch(88% 0.05 150)", color: "oklch(40% 0.11 150)" }}>
            {iter.completedPoints} pts done
          </span>
        </div>
        <div className="section-title" style={{ margin: "6px 0 8px" }}>
          <h2>Sprint goal</h2>
        </div>
        <div className="callout info" style={{ margin: 0 }}>
          <svg className="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>{iter.goal ?? "No goal set for this iteration."}</span>
        </div>
      </div>
    </div>
  );
}

function MilestonesCard({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="card">
      <div className="panel-head">
        <h3>Milestones</h3>
        <span className="muted">{milestones.length} active</span>
      </div>
      <div className="panel-body">
        {milestones.map((m) => {
          const tone = m.progress >= 70 ? "warn" : m.progress >= 40 ? "neutral" : "ok";
          return (
            <div className="ms-item" key={m.id}>
              <div className="ms-ic" style={tone === "warn" ? { background: "var(--warn-bg)", color: "var(--warn)" } : tone === "ok" ? { background: "var(--ok-bg)", color: "var(--ok)" } : undefined}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18M5 21V8l7-4 7 4v13" />
                </svg>
              </div>
              <div className="ms-body">
                <b>{m.name}</b>
                <small>Due {dueLabel(m.dueDate)} · {m.doneTasks}/{m.totalTasks} tasks</small>
                <div className={`bar ${tone === "ok" ? "ok" : tone === "warn" ? "warn" : ""}`}>
                  <i style={{ width: `${m.progress}%` }}></i>
                </div>
              </div>
              <span className={`status ${tone}`}>
                <span className="d"></span>
                {tone === "warn" ? "At risk" : "On track"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Backlog({ tasks, onOpen }: { tasks: Task[]; onOpen: (id: string) => void }) {
  return (
    <div className="card">
      <div className="panel-head">
        <h3>Backlog</h3>
        <span className="muted">{tasks.length} items</span>
      </div>
      <div className="panel-body flush">
        {tasks.map((t) => (
          <div className="backlog-item grab" key={t.id} onClick={() => onOpen(t.id)}>
            <span className="tid">{taskSerial(t.order)}</span>
            <span className="tt">{t.title}</span>
            <TypeTag name="Task" />
            {t.estimate != null && <span className="pts">{t.estimate}</span>}
            <span className={`av sm ${colorFor(t.assigneeId ?? t.id)}`}>{initials("?")}</span>
          </div>
        ))}
        {tasks.length === 0 && <div className="tiny faint" style={{ padding: 12 }}>Backlog is empty.</div>}
      </div>
    </div>
  );
}

function Velocity() {
  const plan = [78, 82, 85, 88, 92, 92];
  const act = [74, 72, 80, 83, 87, 83];
  return (
    <div className="card">
      <div className="panel-head">
        <h3>Velocity</h3>
        <span className="muted">Last 6 sprints</span>
        <div className="right"><span className="tiny mono muted">avg 45 pts</span></div>
      </div>
      <div className="panel-body">
        <div className="vel-chart">
          {plan.map((p, i) => (
            <div className="vel-group" key={i}>
              <div className="vel-bar plan" style={{ height: `${p}%` }}></div>
              <div className="vel-bar act" style={{ height: `${act[i]}%` }}></div>
            </div>
          ))}
        </div>
        <div className="vel-x">
          {["S8", "S9", "S10", "S11", "S12", "S13"].map((l) => (
            <span className="vx" key={l}>{l}</span>
          ))}
        </div>
        <div className="row" style={{ gap: 14, marginTop: 14, justifyContent: "center" }}>
          <span className="tiny mono" style={{ color: "var(--muted)" }}>▮ Committed</span>
          <span className="tiny mono" style={{ color: "var(--accent)" }}>▮ Completed</span>
        </div>
      </div>
    </div>
  );
}

function Timeline({ iterations, milestones }: { iterations: Iteration[]; milestones: Milestone[] }) {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const todayIdx = 3;
  const rows: { l: string; s: string; cls: string; start: number; len: number }[] = [];
  iterations.forEach((it, i) => {
    rows.push({
      l: it.name.split("—")[0]?.trim() ?? it.name,
      s: cap(it.status),
      cls: it.status === "completed" ? "done" : it.status === "active" ? "iter" : "task",
      start: i * 2,
      len: 2,
    });
  });
  milestones.forEach((m, i) => {
    rows.push({ l: m.name, s: dueLabel(m.dueDate), cls: "ms", start: 1 + i * 1.5, len: 2 });
  });
  const span = weeks.length;

  return (
    <div className="card">
      <div className="panel-head"><h3>Timeline</h3><span className="muted">Iterations & milestones</span></div>
      <div className="gantt">
        <div className="gantt-grid">
          <div className="gantt-axis">
            <div className="lbl">Work item</div>
            <div className="gantt-weeks" style={{ gridTemplateColumns: `repeat(${span}, 1fr)` }}>
              {weeks.map((w, i) => (
                <div key={w} className={`gantt-week ${i === todayIdx ? "today" : ""}`}>{w}</div>
              ))}
            </div>
          </div>
          {rows.map((r, idx) => (
            <div className="gantt-row" key={idx}>
              <div className="gl">
                <b>{r.l}</b>
                <small>{r.s}</small>
              </div>
              <div className="gantt-track">
                <div className="gantt-today-line" style={{ left: `${((todayIdx + 0.5) / span) * 100}%` }}></div>
                <div
                  className={`gantt-bar ${r.cls}`}
                  style={{ left: `${(r.start / span) * 100}%`, width: `${(r.len / span) * 100}%` }}
                >
                  {r.l}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
