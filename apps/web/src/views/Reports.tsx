/** Reports view — Overview KPIs/charts, and a standard-reports gallery + viewer. */
import { useState, type ReactNode } from "react";
import { useApp } from "../store";

type PersonId = "ay" | "mk" | "lc" | "dp" | "sr" | "jb";
const PCOLOR: Record<PersonId, string> = { ay: "a", mk: "b", lc: "c", dp: "d", sr: "e", jb: "f" };

function Spark({ color, pts }: { color: string; pts: string }) {
  return (
    <svg viewBox="0 0 200 28" width="100%" height="28" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
}

const VELO = [
  { l: "S10", plan: 40, done: 36 },
  { l: "S11", plan: 44, done: 41 },
  { l: "S12", plan: 48, done: 38 },
  { l: "S13", plan: 46, done: 40 },
  { l: "S14", plan: 52, done: 34, now: true },
];
const VMAX = 58;

const STATUS_BARS = [
  { l: "Done", n: 55, c: "var(--ok)" },
  { l: "In Progress", n: 21, c: "oklch(58% 0.12 240)" },
  { l: "To Do", n: 33, c: "oklch(60% 0.02 255)" },
  { l: "In Review", n: 9, c: "oklch(54% 0.14 300)" },
  { l: "Backlog", n: 18, c: "oklch(64% 0.01 255)" },
];
const WORK: [PersonId, string, number, boolean][] = [
  ["mk", "Marco K.", 12, true],
  ["lc", "Lin C.", 10, false],
  ["dp", "Diego P.", 9, false],
  ["sr", "Sara R.", 7, false],
  ["jb", "Jonas B.", 6, false],
  ["ay", "Aisha Y.", 5, false],
];

interface Report {
  id: string;
  t: string;
  sub: string;
  when: string;
  tone: "info" | "ok" | "violet";
  ic: ReactNode;
}
const REPORTS: Report[] = [
  {
    id: "status", t: "Status report", sub: "Weekly project snapshot · auto-generated", when: "Mar 22", tone: "info",
    ic: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13l2 2 4-4" />
      </>
    ),
  },
  {
    id: "progress", t: "Progress report", sub: "Milestone & sprint progress", when: "Mar 21", tone: "ok",
    ic: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
      </>
    ),
  },
  {
    id: "activity", t: "Activity report", sub: "Team activity log", when: "Mar 20", tone: "violet",
    ic: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 2 4-5" />
      </>
    ),
  },
];

const CAL = "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z";

function reportBody(id: string): ReactNode {
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
            <tr>
              <td>v2.0 Beta</td>
              <td className="mono">Mar 28</td>
              <td><div className="bar warn" style={{ margin: 0, width: 130 }}><i style={{ width: "72%" }}></i></div></td>
              <td><span className="status warn"><span className="d"></span>At risk</span></td>
            </tr>
            <tr>
              <td>Design System v1</td>
              <td className="mono">Apr 12</td>
              <td><div className="bar" style={{ margin: 0, width: 130 }}><i style={{ width: "55%" }}></i></div></td>
              <td><span className="status neutral"><span className="d"></span>On track</span></td>
            </tr>
            <tr>
              <td>Security hardening</td>
              <td className="mono">Apr 30</td>
              <td><div className="bar ok" style={{ margin: 0, width: 130 }}><i style={{ width: "30%" }}></i></div></td>
              <td><span className="status ok"><span className="d"></span>On track</span></td>
            </tr>
          </tbody>
        </table>
        <h3>Sprint velocity</h3>
        <p>
          Rolling 5-sprint average is <b>38.6 pts</b> completed against <b>46.0 pts</b> planned — an <b>84%</b>{" "}
          say/do ratio. Sprint 14 is mid-flight at 34 of 52 pts.
        </p>
      </>
    );
  }
  if (id === "activity") {
    return (
      <>
        <h3>This week's activity</h3>
        <ul>
          <li><b>234</b> events across <b>6</b> contributors (Mar 16–22).</li>
          <li><b>34</b> tasks completed · <b>41</b> comments · <b>12</b> documents updated.</li>
          <li>Most active: <b>Marco K.</b> (61 events), <b>Lin C.</b> (48), <b>Diego P.</b> (39).</li>
        </ul>
        <div className="callout info">
          <svg className="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>
            Reporting aggregates read-only data from Task, Planning, and Meeting modules — nothing is duplicated.
          </span>
        </div>
      </>
    );
  }
  return (
    <>
      <h3>Summary</h3>
      <p>
        Sprint 14 (<b>SSO + Audit-log MVP</b>) is on day 10 of 14 at <b>65% completion</b> — 34 of 52 points done.
        The <b>v2.0 Beta</b> milestone remains <b>at risk</b> for the Mar 28 cutoff: 72% complete with 7 days
        remaining.
      </p>
      <h3>This week</h3>
      <ul>
        <li><b>Shipped</b> — PKCE verifier generation, expired-refresh-token regression test, RBAC policy scaffolding.</li>
        <li><b>In flight</b> — SSO sign-in / sign-out flows (ATL-101), immutable audit-log write path.</li>
        <li><b>Blocked</b> — IdP sandbox credentials pending from Ops.</li>
      </ul>
      <h3>Risks</h3>
      <div className="callout warn">
        <svg className="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d={CAL} />
          <path d="M12 9v4M12 17h.01" />
        </svg>
        <span>
          <b>v2.0 Beta at risk.</b> SSO is the critical path — any slip past Mar 26 pushes the release.
          Mitigation: keep client-portal write access read-only for beta.
        </span>
      </div>
      <h3>Next week</h3>
      <ul>
        <li>Complete the SSO sign-in flow + audit-log integration (target Mar 25).</li>
        <li>Client demo on Mar 27 — beta preview for Northwind.</li>
        <li>Sprint 15 planning on Mar 25.</li>
      </ul>
    </>
  );
}

export function Reports() {
  const { toast } = useApp();
  const [tab, setTab] = useState<"overview" | "reports">("overview");
  const [current, setCurrent] = useState<string>("status");
  const r = REPORTS.find((x) => x.id === current) ?? REPORTS[0]!;

  const exportFmt = (fmt: string) => toast(`Exported dashboard · ${fmt.toUpperCase()}`);

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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export PDF
          </button>
          <button className="btn subtle sm" onClick={() => exportFmt("csv")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {tab === "overview" ? (
        <>
          {/* KPI row */}
          <div className="grid g4" style={{ marginBottom: 14 }} data-od-id="report-kpis">
            <Kpi label="Velocity" val="38 pts" delta="▲ 4" sub="3-sprint avg" col="var(--accent)" pts="0,20 25,16 50,18 75,12 100,14 125,9 150,11 175,7 200,8" />
            <Kpi label="Completion" val="65%" delta="▲ 8%" sub="of committed" col="var(--ok)" pts="0,24 25,20 50,17 75,14 100,12 125,10 150,8 175,6 200,4" />
            <Kpi label="Open tasks" val="63" delta="▲ 6" sub="active now" col="var(--accent)" pts="0,14 25,18 50,12 75,16 100,11 125,14 150,9 175,12 200,8" />
            <Kpi label="Cycle time" val="2.4d" delta="▼ 0.3" sub="median" col="var(--accent)" pts="0,8 25,11 50,9 75,13 100,11 125,15 150,12 175,16 200,14" />
          </div>

          <div className="grid g2" data-od-id="report-charts">
            <div className="card">
              <div className="panel-head">
                <h3>Tasks by status</h3>
                <span className="muted">136 total</span>
              </div>
              <div className="panel-body">
                {STATUS_BARS.map((s) => (
                  <div className="stbar-row" key={s.l}>
                    <span className="lbl">{s.l}</span>
                    <span className="track">
                      <i style={{ width: `${Math.round((s.n / 55) * 100)}%`, background: s.c }}></i>
                    </span>
                    <span className="n">{s.n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="panel-head">
                <h3>Velocity</h3>
                <span className="muted">last 5 sprints</span>
              </div>
              <div className="panel-body">
                <div className="velo">
                  {VELO.map((v) => (
                    <div key={v.l} className={`vcol ${v.now ? "vnow" : ""}`}>
                      <div className="vbars">
                        <div className="vbar plan" style={{ height: Math.round((v.plan / VMAX) * 112) }}></div>
                        <div className="vbar done" style={{ height: Math.round((v.done / VMAX) * 112) }}></div>
                      </div>
                      <span className="vlbl">{v.l}</span>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ gap: 14, marginTop: 10 }}>
                  <span className="tiny mono muted">▒ Committed</span>
                  <span className="tiny mono" style={{ color: "var(--accent)" }}>█ Completed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }} data-od-id="report-workload">
            <div className="panel-head">
              <h3>Throughput by assignee</h3>
              <span className="muted">Sprint 14</span>
            </div>
            <div className="panel-body">
              {WORK.map(([id, name, n, over]) => (
                <div className="work-row" key={id}>
                  <span className={`av sm ${PCOLOR[id]}`}>{name.split(" ")[0]![0]}{name.split(" ")[1]![0]}</span>
                  <span className="nm">{name}</span>
                  <div className="wbar">
                    <i style={{ width: `${Math.round((n / 12) * 100)}%` }} className={over ? "over" : ""}></i>
                  </div>
                  <span className="n">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid g3" style={{ marginBottom: 14 }} data-od-id="report-cards">
            {REPORTS.map((x) => (
              <div key={x.id} className={`rpt-card ${x.id === current ? "sel" : ""}`} onClick={() => setCurrent(x.id)}>
                <div className="rc-top">
                  <div className="rc-ic" style={{ background: `var(--${x.tone}-bg)`, color: `var(--${x.tone})` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {x.ic}
                    </svg>
                  </div>
                  <div>
                    <h4>{x.t}</h4>
                    <div className="rc-sub">{x.sub}</div>
                  </div>
                </div>
                <div className="row between">
                  <span className="tiny mono muted">Last run · {x.when}</span>
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
              <span className="muted">Generated {r.when}</span>
              <div className="right">
                <button className="btn subtle sm" onClick={() => toast(`Exported ${r.t} · PDF`)}>
                  Export PDF
                </button>
                <button className="btn subtle sm" onClick={() => toast(`Exported ${r.t} · CSV`)}>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="panel-body rpt-body">{reportBody(r.id)}</div>
          </div>
        </>
      )}
    </section>
  );
}

function Kpi({
  label, val, delta, sub, col, pts,
}: {
  label: string; val: string; delta: string; sub: string; col: string; pts: string;
}) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="val" style={{ color: col }}>{val}</div>
      <div className="sub">
        <span className={delta.startsWith("▼") ? "dn" : "up"}>{delta}</span> {sub}
      </div>
      <div className="spark">
        <Spark color={col} pts={pts} />
      </div>
    </div>
  );
}
