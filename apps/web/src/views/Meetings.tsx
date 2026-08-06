/** Meetings view — master/detail split: filterable list + rich detail pane. */
import { useState, type ReactNode } from "react";
import { useApp } from "../store.js";

type PersonId = "ay" | "mk" | "lc" | "dp" | "sr" | "jb";
type MeetingType = "standup" | "review" | "planning" | "client" | "other";
type MeetStatus = "scheduled" | "completed" | "cancelled";

const P: Record<PersonId, { name: string; initials: string; color: string; role: string }> = {
  ay: { name: "Aisha Yusuf", initials: "AY", color: "a", role: "Product Manager" },
  mk: { name: "Marco Keller", initials: "MK", color: "b", role: "Tech Lead" },
  lc: { name: "Lin Chen", initials: "LC", color: "c", role: "Engineer" },
  dp: { name: "Diego Pereira", initials: "DP", color: "d", role: "Engineer" },
  sr: { name: "Sara Reinhardt", initials: "SR", color: "e", role: "QA" },
  jb: { name: "Jonas Berg", initials: "JB", color: "f", role: "Designer" },
};

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

interface ActionItem {
  d: string;
  who: PersonId;
  due: string;
  done: boolean;
  linked?: string;
}
interface Meeting {
  id: string;
  t: string;
  ty: MeetingType;
  st: MeetStatus;
  when: string;
  dur: number;
  loc: string;
  org: PersonId;
  people: PersonId[];
  agenda: string[];
  notes: ReactNode;
  actions: ActionItem[];
}

const CAL = "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z";

const MEETINGS: Meeting[] = [
  {
    id: "m1", t: "SSO design sync", ty: "planning", st: "scheduled",
    when: "Mar 23 · 10:00", dur: 45, loc: "Zoom · alabs.demos/sso", org: "mk",
    people: ["mk", "lc", "dp", "ay"],
    agenda: [
      "Walk the SSO sign-in & sign-out flows (10m)",
      "PKCE vs. client-secret decision (10m)",
      "Audit-log write path and immutability (15m)",
      "Feature-flag rollout plan (10m)",
    ],
    notes: (
      <>
        <p>
          Settled on <b>PKCE</b> for every public client; confidential server-side apps keep a client secret.
          The audit log will use an append-only table with a per-row hash chain — no in-place updates, ever.
        </p>
        <div className="callout warn">
          <svg className="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d={CAL} />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>
            <b>Blocker.</b> IdP sandbox credentials are still with Ops — Marco chasing today. PKCE verifier
            generation is unblocked in the meantime.
          </span>
        </div>
      </>
    ),
    actions: [
      { d: "Provision the IdP sandbox environment", who: "mk", due: "Mar 24", done: false, linked: "101" },
      { d: "Draft the PKCE flow diagram for the wiki", who: "lc", due: "Mar 25", done: false },
      { d: "Confirm the feature-flag name with stakeholders", who: "ay", due: "Mar 22", done: true },
    ],
  },
  {
    id: "m2", t: "Daily standup", ty: "standup", st: "scheduled",
    when: "Mar 23 · 09:15", dur: 15, loc: "Recurring · #engineering", org: "lc",
    people: ["ay", "mk", "lc", "dp", "sr"],
    agenda: ["Round-robin: yesterday · today · blockers (15m)"],
    notes: (
      <p className="small muted">
        Notes are captured live during the standup and posted to <span className="mono">#engineering</span>.
      </p>
    ),
    actions: [],
  },
  {
    id: "m3", t: "Client demo — v2.0 beta preview", ty: "client", st: "scheduled",
    when: "Mar 27 · 14:00", dur: 60, loc: "Google Meet · shared with Northwind", org: "ay",
    people: ["ay", "mk", "jb"],
    agenda: [
      "Sprint 13–14 recap (10m)",
      "Live demo: SSO sign-in + audit log (25m)",
      "Design System v1 components (10m)",
      "Q&A and beta feedback (15m)",
    ],
    notes: (
      <p>
        Aisha drives the demo, Marco owns the audit-log deep-dive, Jonas walks the new component library.
        <b> Demo script is locked</b> — no ad-hoc features.
      </p>
    ),
    actions: [
      { d: "Polish the demo dataset on staging", who: "dp", due: "Mar 26", done: false },
      { d: "Prepare the beta feedback intake form", who: "ay", due: "Mar 26", done: false },
    ],
  },
  {
    id: "m4", t: "Sprint 14 planning", ty: "planning", st: "completed",
    when: "Mar 11 · 13:00", dur: 90, loc: "Conference room B", org: "ay",
    people: ["ay", "mk", "lc", "dp", "sr", "jb"],
    agenda: [
      "Review Sprint 13 outcomes (15m)",
      "Capacity check (10m)",
      "Pull SSO + audit-log scope into the sprint (45m)",
      "Lock the sprint goal and exit criteria (20m)",
    ],
    notes: (
      <p>
        Goal locked: <b>ship OAuth2 SSO behind a feature flag and land the immutable audit-log store.</b>
        Client-portal scaffolding stays visible but read-only. 52 points committed across 23 issues.
      </p>
    ),
    actions: [
      { d: "Break ATL-101 into PKCE + token-refresh subtasks", who: "mk", due: "Mar 13", done: true, linked: "101" },
      { d: "Write the audit-log ADR", who: "mk", due: "Mar 14", done: true },
    ],
  },
  {
    id: "m5", t: "Audit-log architecture review", ty: "review", st: "completed",
    when: "Mar 15 · 11:00", dur: 60, loc: "Zoom", org: "mk",
    people: ["mk", "lc", "dp"],
    agenda: [
      "Hash-chain vs. Merkle-tree trade-offs (20m)",
      "Retention and partitioning (15m)",
      "Read path for reporting (15m)",
      "Decisions & follow-ups (10m)",
    ],
    notes: (
      <p>
        Settled on a simple forward hash-chain — cheaper to verify and good enough for the threat model.
        Partition by month; reporting reads from a nightly materialized view.
      </p>
    ),
    actions: [{ d: "Spike: hash-chain verification query", who: "lc", due: "Mar 19", done: true }],
  },
  {
    id: "m6", t: "Backlog grooming", ty: "standup", st: "cancelled",
    when: "Mar 18 · 16:00", dur: 30, loc: "Recurring · #engineering", org: "sr",
    people: ["ay", "mk", "lc"],
    agenda: ["Triage the inbox queue"],
    notes: <p className="small muted">Cancelled — merged into the Sprint 14 mid-sprint check-in.</p>,
    actions: [],
  },
];

function Av({ id, cls = "" }: { id: PersonId; cls?: string }) {
  const p = P[id];
  return <span className={`av ${p.color} ${cls}`}>{p.initials}</span>;
}
function AvStack({ ids }: { ids: PersonId[] }) {
  const shown = ids.slice(0, 4);
  const extra = ids.length > 4 ? ids.length - 4 : 0;
  return (
    <span className="av-g">
      {shown.map((id) => (
        <Av key={id} id={id} cls="sm" />
      ))}
      {extra > 0 && <span className="av more sm">+{extra}</span>}
    </span>
  );
}

export function Meetings() {
  const { setView, openTask, toast } = useApp();
  const [view, setMeetView] = useState<"upcoming" | "past" | "all">("upcoming");
  const [current, setCurrent] = useState<string>("m1");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const passes = (m: Meeting) =>
    view === "all" ? true : view === "upcoming" ? m.st === "scheduled" : m.st !== "scheduled";
  const items = MEETINGS.filter(passes);
  const m = MEETINGS.find((x) => x.id === current) ?? MEETINGS[0]!;
  const ty = MTYPE[m.ty];
  const st = MSTATUS[m.st];
  const doneN = m.actions.filter((a) => (checked[`${m.id}:${a.d}`] ?? a.done)).length;

  const jumpTask = (linked: string, label: string) => {
    setView("tasks");
    toast(`Opening ATL-${linked} · ${label}`);
    openTask(linked);
  };

  return (
    <section className="view active">
      <div className="toolbar">
        <div className="seg">
          {(["upcoming", "past", "all"] as const).map((v) => (
            <button key={v} className={view === v ? "on" : ""} onClick={() => setMeetView(v)}>
              {v[0]!.toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }} className="row">
          <button className="btn subtle sm" data-od-id="meet-filter" onClick={() => toast("Filter by type")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Types
          </button>
          <button className="btn primary sm" data-od-id="meet-schedule" onClick={() => toast("Schedule meeting")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            {items.length === 0 && <div className="tiny faint" style={{ padding: "16px 14px" }}>No meetings here.</div>}
            {items.map((it) => {
              const ity = MTYPE[it.ty];
              const ist = MSTATUS[it.st];
              return (
                <div
                  key={it.id}
                  className={`meet-item ${it.id === current ? "sel" : ""}`}
                  onClick={() => setCurrent(it.id)}
                >
                  <div className="row between">
                    <span className={`tag ${ity.cls}`}>{ity.label}</span>
                    <span className={`status ${ist.tone}`}>
                      <span className="d"></span>
                      {ist.label}
                    </span>
                  </div>
                  <div className="mt-title">{it.t}</div>
                  <div className="mt-meta">
                    <span className="ic">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {it.when}
                    </span>
                    <span className="ic">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {it.dur}m
                    </span>
                  </div>
                  <div className="row between" style={{ marginTop: 8 }}>
                    <AvStack ids={it.people} />
                    <span className="tiny mono muted">{P[it.org].name.split(" ")[0]} leads</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* detail */}
        <div data-od-id="meet-detail">
          <div className="card meet-detail">
            <div className="meet-head">
              <div className="row" style={{ gap: 8 }}>
                <span className={`tag ${ty.cls}`}>{ty.label}</span>
                <span className={`status ${st.tone}`}>
                  <span className="d"></span>
                  {st.label}
                </span>
              </div>
              <h2>{m.t}</h2>
              <div className="meet-facts">
                <span className="fact">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {m.when} · {m.dur} min
                </span>
                <span className="fact">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                  </svg>
                  {m.loc}
                </span>
                <span className="fact">
                  <Av id={m.org} />
                  Organized by <b style={{ color: "var(--fg-strong)", marginLeft: 3 }}>{P[m.org].name}</b>
                </span>
              </div>
            </div>

            <div className="grid g2">
              <div>
                <div className="section-title">
                  <h2>Agenda</h2>
                </div>
                <ol className="agenda">
                  {m.agenda.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="row between">
                  <div className="section-title" style={{ margin: 0 }}>
                    <h2>Participants</h2>
                  </div>
                  <span className="muted tiny">{m.people.length} invited</span>
                </div>
                <div className="stack" style={{ gap: 8 }}>
                  {m.people.map((p) => (
                    <div key={p} className="row" style={{ gap: 9, fontSize: 13 }}>
                      <Av id={p} cls="sm" />
                      <span>{P[p].name}</span>
                      {p === m.org && <span className="tiny muted">· organizer</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="section-title" style={{ margin: "18px 0 8px" }}>
              <h2>Notes</h2>
            </div>
            <div className="rpt-body">{m.notes}</div>

            <div className="row between" style={{ margin: "18px 0 8px" }}>
              <div className="section-title" style={{ margin: 0 }}>
                <h2>Action items</h2>
              </div>
              <span className="muted tiny">{doneN}/{m.actions.length} done</span>
            </div>

            {m.actions.length === 0 && <div className="tiny faint">No action items yet for this meeting.</div>}
            {m.actions.map((a, i) => {
              const key = `${m.id}:${a.d}`;
              const done = checked[key] ?? a.done;
              return (
                <div key={i} className={`act-item ${done ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    className="ckbox ck"
                    checked={done}
                    onChange={() => {
                      setChecked((c) => ({ ...c, [key]: !done }));
                      toast("Action item updated");
                    }}
                  />
                  <div className="ai-body">
                    <div className="ai-top">
                      <b>{a.d}</b>
                      {a.linked && (
                        <span className="tag i" style={{ cursor: "pointer" }} onClick={() => jumpTask(a.linked!, a.d)}>
                          ATL-{a.linked}
                        </span>
                      )}
                    </div>
                    <div className="ai-meta">
                      <Av id={a.who} cls="sm" />
                      <span>{P[a.who].name}</span>
                      <span>·</span>
                      <span>Due {a.due}</span>
                      {done && (
                        <span className="status ok">
                          <span className="d"></span>Done
                        </span>
                      )}
                    </div>
                  </div>
                  {!done && (
                    <button className="btn ghost sm" onClick={() => toast("Action item converted to a task")}>
                      → Task
                    </button>
                  )}
                </div>
              );
            })}

            <div className="row" style={{ gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <button className="btn subtle sm" onClick={() => toast("Edit notes")}>Edit notes</button>
              <button className="btn subtle sm" onClick={() => toast("Add action item")}>Add action item</button>
              <button className="btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => toast("Notes copied")}>
                Copy notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
