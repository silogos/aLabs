/** Reports view — Overview KPIs/charts and a standard-reports gallery, both
 *  generated from live data (dashboard, iterations, milestones, statuses,
 *  activity) instead of hardcoded arrays. */
import { planningService } from "@/services/planning";
import { reportsService } from "@/services/reports";
import { workspaceService } from "@/services/workspace";
import type { Dashboard, Iteration, Milestone } from "@pmin/core";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/providers/app-provider";
import { registerPeople, personOf } from "@/features/tasks/store";

function Spark({ color, vals }: { color: string; vals: number[] }) {
  if (vals.length < 2) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const pts = vals
    .map((v, i) => {
      const x = Math.round((i / (vals.length - 1)) * 200);
      const y = Math.round(24 - ((v - min) / span) * 18);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 200 28" width="100%" height="28" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
}

const CAL = "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z";
const dayFmt = (iso: string | null) =>
  iso
    ? new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";
const todayFmt = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

function Kpi({
  label,
  val,
  delta,
  deltaUp,
  sub,
  col,
  series,
}: {
  label: string;
  val: string;
  delta: string;
  deltaUp: boolean;
  sub: string;
  col: string;
  series?: number[];
}) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="val" style={{ color: col }}>
        {val}
      </div>
      <div className="sub">
        <span className={deltaUp ? "up" : "dn"}>{delta}</span> {sub}
      </div>
      <div className="spark">{series && <Spark color={col} vals={series} />}</div>
    </div>
  );
}

export function ReportsView() {
  const { project, toast } = useApp();
  const pid = project!.id;
  const [tab, setTab] = useState<"overview" | "reports">("overview");
  const [current, setCurrent] = useState<string>("status");

  const { data: dash } = useQuery({
    queryKey: ["dashboard", pid],
    queryFn: () => reportsService.dashboard(pid),
  });
  const { data: iterations } = useQuery({
    queryKey: ["iterations", pid],
    queryFn: () => planningService.iterations(pid),
  });
  const { data: milestones } = useQuery({
    queryKey: ["milestones", pid],
    queryFn: () => planningService.milestones(pid),
  });
  const { data: statuses } = useQuery({
    queryKey: ["progress", pid],
    queryFn: () => reportsService.progress(pid),
  });
  const { data: activity } = useQuery({
    queryKey: ["activity-full", pid],
    queryFn: () => reportsService.activity(pid),
  });
  const { data: members } = useQuery({
    queryKey: ["members", project?.organizationId],
    queryFn: () => workspaceService.members(project!.organizationId),
    enabled: !!project,
  });

  useEffect(() => {
    if (members) registerPeople(members.map((m) => m.user));
  }, [members]);

  /* ---- derived series (all real: iteration points, sprint counts) ---- */
  const sprints = useMemo(
    () => [...(iterations ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(-5),
    [iterations],
  );
  const completedSprints = useMemo(
    () => sprints.filter((s) => s.status === "completed" && s.committedPoints > 0),
    [sprints],
  );
  const avg = (xs: number[]) => (xs.length ? xs.reduce((n, x) => n + x, 0) / xs.length : 0);
  const last3 = completedSprints.slice(-3);
  const prev3 = completedSprints.slice(-6, -3);
  const velocity = Math.round(avg(last3.map((s) => s.completedPoints)));
  const velocityPrev = Math.round(avg(prev3.map((s) => s.completedPoints)));
  const sayDo = Math.round(
    (avg(last3.map((s) => s.completedPoints)) /
      Math.max(1, avg(last3.map((s) => s.committedPoints)))) *
      100,
  );
  const activeSprint = sprints.find((s) => s.status === "active") ?? null;
  const completion =
    activeSprint && activeSprint.committedPoints > 0
      ? Math.round((activeSprint.completedPoints / activeSprint.committedPoints) * 100)
      : 0;
  const sprintDay = activeSprint
    ? Math.max(
        1,
        Math.ceil((Date.now() - +new Date(activeSprint.startDate + "T00:00:00")) / 864e5) + 1,
      )
    : 0;
  const sprintLen = activeSprint
    ? Math.max(
        1,
        Math.round(
          (+new Date(activeSprint.endDate + "T00:00:00") -
            +new Date(activeSprint.startDate + "T00:00:00")) /
            864e5,
        ),
      )
    : 0;

  const exportFmt = (fmt: string) => toast(`Exported · ${fmt.toUpperCase()}`);

  const REPORTS = [
    { id: "status", t: "Status report", sub: "Weekly project snapshot · auto-generated" },
    { id: "progress", t: "Progress report", sub: "Milestone & sprint progress" },
    { id: "activity", t: "Activity report", sub: "Team activity log" },
  ];
  const r = REPORTS.find((x) => x.id === current) ?? REPORTS[0]!;

  const statusMax = Math.max(1, ...(statuses ?? []).map((s) => s.count));
  const statusTotal = (statuses ?? []).reduce((n, s) => n + s.count, 0);
  const veloMax = Math.max(
    1,
    ...sprints.map((s) => Math.max(s.committedPoints, s.completedPoints)),
  );

  return (
    <section className="view active">
      <div className="toolbar">
        <div className="seg">
          <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}>
            Overview
          </button>
          <button className={tab === "reports" ? "on" : ""} onClick={() => setTab("reports")}>
            Reports
          </button>
        </div>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn subtle sm" onClick={() => exportFmt("pdf")}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export PDF
          </button>
          <button className="btn subtle sm" onClick={() => exportFmt("csv")}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {tab === "overview" ? (
        <>
          {/* KPI row — velocity/completion sparklines are real per-sprint series */}
          <div className="grid g4" style={{ marginBottom: 14 }} data-od-id="report-kpis">
            <Kpi
              label="Velocity"
              val={`${velocity} pts`}
              delta={
                velocity >= velocityPrev
                  ? `▲ ${velocity - velocityPrev}`
                  : `▼ ${velocityPrev - velocity}`
              }
              deltaUp={velocity >= velocityPrev}
              sub="3-sprint avg"
              col="var(--accent)"
              series={completedSprints.map((s) => s.completedPoints)}
            />
            <Kpi
              label="Say / do"
              val={`${sayDo}%`}
              delta={sayDo >= 80 ? "▲ healthy" : "▼ stretched"}
              deltaUp={sayDo >= 80}
              sub="completed vs committed"
              col="var(--ok)"
              series={completedSprints.map((s) =>
                s.committedPoints ? Math.round((s.completedPoints / s.committedPoints) * 100) : 0,
              )}
            />
            <Kpi
              label="Open tasks"
              val={String(dash?.kpis.active ?? 0)}
              delta={`${dash?.kpis.inProgress ?? 0} in progress`}
              deltaUp={false}
              sub={`active now`}
              col="var(--accent)"
            />
            <Kpi
              label="Overdue"
              val={String(dash?.kpis.overdue ?? 0)}
              delta={dash?.kpis.overdue ? "▲ needs attention" : "▲ none"}
              deltaUp={!dash?.kpis.overdue}
              sub={`${dash?.kpis.doneThisIteration ?? 0} done this sprint`}
              col={dash?.kpis.overdue ? "var(--warn)" : "var(--ok)"}
            />
          </div>

          <div className="grid g2" data-od-id="report-charts">
            <div className="card">
              <div className="panel-head">
                <h3>Tasks by status</h3>
                <span className="muted">{statusTotal} total</span>
              </div>
              <div className="panel-body">
                {!statuses && <div className="tiny faint">Loading…</div>}
                {statuses?.map((s) => (
                  <div className="stbar-row" key={s.id}>
                    <span className="lbl">{s.name}</span>
                    <span className="track">
                      <i
                        style={{
                          width: `${Math.round((s.count / statusMax) * 100)}%`,
                          background: s.color,
                        }}
                      ></i>
                    </span>
                    <span className="n">{s.count}</span>
                  </div>
                ))}
                {statuses?.length === 0 && <div className="tiny faint">No tasks yet.</div>}
              </div>
            </div>
            <div className="card">
              <div className="panel-head">
                <h3>Velocity</h3>
                <span className="muted">last {sprints.length || 0} sprints</span>
              </div>
              <div className="panel-body">
                <div className="velo">
                  {sprints.map((v) => (
                    <div key={v.id} className={`vcol ${v.status === "active" ? "vnow" : ""}`}>
                      <div className="vbars">
                        <div
                          className="vbar plan"
                          style={{ height: Math.round((v.committedPoints / veloMax) * 112) }}
                        ></div>
                        <div
                          className="vbar done"
                          style={{ height: Math.round((v.completedPoints / veloMax) * 112) }}
                        ></div>
                      </div>
                      <span className="vlbl">{v.name.replace("Sprint ", "S").split(" — ")[0]}</span>
                    </div>
                  ))}
                  {sprints.length === 0 && <div className="tiny faint">No iterations yet.</div>}
                </div>
                <div className="row" style={{ gap: 14, marginTop: 10 }}>
                  <span className="tiny mono muted">▒ Committed</span>
                  <span className="tiny mono" style={{ color: "var(--accent)" }}>
                    █ Completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }} data-od-id="report-workload">
            <div className="panel-head">
              <h3>Workload by assignee</h3>
              <span className="muted">{activeSprint?.name ?? "all tasks"}</span>
            </div>
            <div className="panel-body">
              {!dash && <div className="tiny faint">Loading…</div>}
              {dash?.workload.map((w) => (
                <div className="work-row" key={w.userId}>
                  <span className={`av sm ${w.color}`}>{w.initials}</span>
                  <span className="nm">{w.name}</span>
                  <div className="wbar">
                    <i
                      style={{
                        width: `${Math.min(100, Math.round((w.assigned / w.capacity) * 100))}%`,
                      }}
                      className={w.assigned > w.capacity ? "over" : ""}
                    ></i>
                  </div>
                  <span className="n">{w.assigned}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid g3" style={{ marginBottom: 14 }} data-od-id="report-cards">
            {REPORTS.map((x) => (
              <div
                key={x.id}
                className={`rpt-card ${x.id === current ? "sel" : ""}`}
                onClick={() => setCurrent(x.id)}
              >
                <div className="rc-top">
                  <div
                    className="rc-ic"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <div>
                    <h4>{x.t}</h4>
                    <div className="rc-sub">{x.sub}</div>
                  </div>
                </div>
                <div className="row between">
                  <span className="tiny mono muted">Live · {todayFmt()}</span>
                  <span className="tiny" style={{ color: "var(--accent)" }}>
                    {x.id === current ? "Viewing" : "Open"} →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" data-od-id="report-viewer">
            <div className="panel-head">
              <h3>{r.t}</h3>
              <span className="muted">Generated {todayFmt()}</span>
              <div className="right">
                <button className="btn subtle sm" onClick={() => toast(`Exported ${r.t} · PDF`)}>
                  Export PDF
                </button>
                <button className="btn subtle sm" onClick={() => toast(`Exported ${r.t} · CSV`)}>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="panel-body rpt-body">
              {reportBody(r.id, {
                activeSprint,
                sprintDay,
                sprintLen,
                milestones,
                activity,
                last3,
                sayDo,
                velocity,
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------------- report bodies — generated from live data ---------------- */

type BodyCtx = {
  activeSprint: Iteration | null;
  sprintDay: number;
  sprintLen: number;
  milestones: Milestone[] | undefined;
  activity: Dashboard["activity"] | undefined;
  last3: Iteration[];
  sayDo: number;
  velocity: number;
};

const KIND_LABEL: Record<string, string> = {
  move: "status moves",
  doc: "document edits",
  com: "comments",
  done: "tasks completed",
  mile: "milestone updates",
};

function milestoneRisk(m: {
  dueDate: string | null;
  progress: number;
  status: string;
}): "reached" | "risk" | "ok" {
  if (m.status === "reached") return "reached";
  if (m.dueDate) {
    const days = Math.round((+new Date(m.dueDate + "T00:00:00") - Date.now()) / 864e5);
    if (days <= 14 && m.progress < 90) return "risk";
  }
  return "ok";
}

function reportBody(id: string, ctx: BodyCtx): React.ReactNode {
  const { activeSprint, sprintDay, sprintLen, milestones, activity, last3, sayDo, velocity } = ctx;

  if (id === "progress") {
    return (
      <>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Due</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(milestones ?? []).map((m) => {
              const risk = milestoneRisk(m);
              return (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td className="mono">{dayFmt(m.dueDate)}</td>
                  <td>
                    <div
                      className={`bar ${risk === "risk" ? "warn" : risk === "reached" ? "ok" : ""}`}
                      style={{ margin: 0, width: 130 }}
                    >
                      <i style={{ width: `${m.progress}%` }}></i>
                    </div>
                  </td>
                  <td>
                    {risk === "reached" ? (
                      <span className="status ok">
                        <span className="d"></span>Reached
                      </span>
                    ) : risk === "risk" ? (
                      <span className="status warn">
                        <span className="d"></span>At risk
                      </span>
                    ) : (
                      <span className="status neutral">
                        <span className="d"></span>On track
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {milestones?.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No milestones defined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <h3>Sprint velocity</h3>
        <p>
          Rolling 3-sprint average is <b>{velocity} pts</b> completed against{" "}
          <b>
            {Math.round(
              last3.reduce((n, s) => n + s.committedPoints, 0) / Math.max(1, last3.length),
            )}{" "}
            pts
          </b>{" "}
          planned — a <b>{sayDo}%</b> say/do ratio.
          {activeSprint
            ? ` ${activeSprint.name} is mid-flight at ${activeSprint.completedPoints} of ${activeSprint.committedPoints} pts.`
            : ""}
        </p>
      </>
    );
  }

  if (id === "activity") {
    const rows = activity ?? [];
    const week = rows.filter((a) => Date.now() - +new Date(a.when) <= 7 * 864e5);
    const byActor = new Map<string, number>();
    for (const a of week) byActor.set(a.actorId, (byActor.get(a.actorId) ?? 0) + 1);
    const top = [...byActor.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3);
    const kindCount = (k: string) => week.filter((a) => a.kind === k).length;
    return (
      <>
        <h3>Last 7 days</h3>
        <ul>
          <li>
            <b>{week.length}</b> events across <b>{byActor.size}</b> contributors.
          </li>
          <li>
            <b>{kindCount("done")}</b> {KIND_LABEL.done} · <b>{kindCount("com")}</b>{" "}
            {KIND_LABEL.com} · <b>{kindCount("doc")}</b> {KIND_LABEL.doc} ·{" "}
            <b>{kindCount("move")}</b> {KIND_LABEL.move}.
          </li>
          {top.length > 0 && (
            <li>
              Most active:{" "}
              {top.map(([uid, n], i) => (
                <span key={uid}>
                  {i > 0 && ", "}
                  <b>
                    {personOf(uid)?.name ?? "Unknown"} ({n})
                  </b>
                </span>
              ))}
              .
            </li>
          )}
        </ul>
        <div className="callout info">
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
          <span>
            Reporting aggregates read-only data from Task, Planning, and Meeting modules — nothing
            is duplicated.
          </span>
        </div>
      </>
    );
  }

  // status report
  const risky = (milestones ?? []).filter((m) => milestoneRisk(m) === "risk");
  const done = (activity ?? []).filter(
    (a) => a.kind === "done" && Date.now() - +new Date(a.when) <= 7 * 864e5,
  );
  return (
    <>
      <h3>Summary</h3>
      <p>
        {activeSprint ? (
          <>
            <b>{activeSprint.name}</b> is on day <b>{sprintDay}</b> of <b>{sprintLen}</b> at{" "}
            <b>{Math.round(activeSprint.progress)}% completion</b> — {activeSprint.completedPoints}{" "}
            of {activeSprint.committedPoints} points done.
          </>
        ) : (
          <>No active sprint — tasks continue from the backlog.</>
        )}{" "}
        {risky.length > 0 && (
          <>
            The <b>{risky[0]!.name}</b> milestone is <b>at risk</b>: {risky[0]!.progress}% complete,
            due {dayFmt(risky[0]!.dueDate)}.
          </>
        )}
      </p>
      <h3>This week</h3>
      <ul>
        <li>
          <b>Completed</b> —{" "}
          {done.length
            ? done
                .slice(0, 3)
                .map((d) => d.target)
                .join(", ")
            : "no completions recorded"}
          .
        </li>
        <li>
          <b>In flight</b> —{" "}
          {activeSprint
            ? `${activeSprint.committedPoints - activeSprint.completedPoints} committed points remain in ${activeSprint.name}.`
            : "—"}
        </li>
      </ul>
      {risky.length > 0 && <h3>Risks</h3>}
      {risky.map((m) => (
        <div className="callout warn" key={m.id}>
          <svg
            className="ci"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d={CAL} />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>
            <b>{m.name} at risk.</b> {m.progress}% complete with {m.doneTasks}/{m.totalTasks} tasks
            done and the cutoff on {dayFmt(m.dueDate)}.
          </span>
        </div>
      ))}
    </>
  );
}
