/** Dashboard view — KPIs, sprint health, my tasks, milestones, activity, workload. */
import { planningService } from "@/services/planning";
import { reportsService } from "@/services/reports";
import { tasksService } from "@/services/tasks";
import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "../store";
import {
  Avatar,
  Prio,
  StatusPill,
  TypeTag,
  colorFor,
  dueLabel,
  initials,
  isOverdue,
  taskSerial,
  timeAgo,
} from "../components/ui";

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 200;
      const y = 28 - ((v - min) / range) * 24 - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 200 28" width="100%" height="28" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
}

export function Dashboard() {
  const { project, user, setView, openTask } = useApp();
  const pid = project!.id;
  const { data } = useQuery({
    queryKey: ["dashboard", pid],
    queryFn: () => reportsService.dashboard(pid),
  });
  const { data: statuses } = useQuery({
    queryKey: ["statuses", pid],
    queryFn: () => tasksService.statuses(pid),
  });
  const statusName = (id: string) => statuses?.find((s) => s.id === id)?.name ?? "—";
  const { data: myTasksPage } = useQuery({
    queryKey: ["tasks", pid, "me"],
    queryFn: () => tasksService.list(pid, { assigneeId: user?.id }),
    enabled: !!user,
  });

  if (!data)
    return (
      <section className="view active">
        <div className="muted">Loading…</div>
      </section>
    );
  const k = data.kpis;
  const sprint = data.sprint;

  return (
    <section className="view active">
      <div className="row between wrap" style={{ marginBottom: 14, gap: 12 }}>
        <div>
          <div className="h2">Welcome back, {user?.name?.split(" ")[0] ?? "Aisha"}</div>
          <div className="small muted" style={{ marginTop: 3 }}>
            Here&apos;s how <b style={{ color: "var(--fg)" }}>{data.project.name}</b> is tracking
            today, {todayLabel()}.
          </div>
        </div>
        <div className="row">
          {sprint && (
            <span className="status info">
              <span className="d"></span>
              {(sprint.name ?? "Sprint").split("—")[0]?.trim()} · Active
            </span>
          )}
          <button className="btn subtle sm" onClick={() => setView("planning")}>
            Open planning
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi
          label="Active tasks"
          value={k.active}
          sub="vs last sprint"
          trend="up"
          spark={<Spark data={k.activeTrend} color="var(--accent)" />}
        />
        <Kpi
          label="In progress"
          value={k.inProgress}
          sub="moved today"
          trend="up"
          spark={<Spark data={k.inProgressTrend} color="var(--info)" />}
        />
        <Kpi
          label="Overdue"
          value={k.overdue}
          sub="needs attention"
          trend="dn"
          danger
          spark={<Spark data={k.overdueTrend} color="var(--danger)" />}
        />
        <Kpi
          label="Done this sprint"
          value={k.doneThisIteration}
          sub="completed"
          trend="up"
          spark={<Spark data={k.doneTrend} color="var(--ok)" />}
        />
      </div>

      <div className="dash-grid">
        <div className="stack" style={{ gap: 14 }}>
          {/* Sprint health */}
          {sprint && (
            <div className="card">
              <div className="panel-head">
                <h3>{sprint.name ?? "Sprint"}</h3>
                <div className="right">
                  <span className="status info">
                    <span className="d"></span>Active
                  </span>
                  <button className="btn ghost sm" onClick={() => setView("planning")}>
                    Plan
                  </button>
                </div>
              </div>
              <div
                className="panel-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 22,
                  alignItems: "center",
                }}
              >
                <div className="row" style={{ gap: 18 }}>
                  <div
                    className="ring"
                    style={{
                      ["--p" as string]: sprint.progress,
                      ["--c" as string]: "var(--accent)",
                    }}
                  >
                    <b>{sprint.progress}%</b>
                  </div>
                  <div className="stack" style={{ gap: 6, fontSize: 12.5 }}>
                    <div className="muted tiny">Committed</div>
                    <b className="mono" style={{ fontSize: 16 }}>
                      {sprint.committedPoints} pts
                    </b>
                    <div className="muted tiny" style={{ marginTop: 4 }}>
                      Completed
                    </div>
                    <b className="mono" style={{ fontSize: 16, color: "var(--ok)" }}>
                      {sprint.completedPoints} pts
                    </b>
                  </div>
                </div>
                <Burndown data={sprint.burndown} total={sprint.committedPoints} />
              </div>
            </div>
          )}

          {/* My tasks */}
          <div className="card">
            <div className="panel-head">
              <h3>My tasks</h3>
              <span className="muted">{myTasksPage?.items.length ?? 0} assigned</span>
              <div className="right">
                <button className="btn ghost sm" onClick={() => setView("tasks")}>
                  View all
                </button>
              </div>
            </div>
            <div className="panel-body flush">
              {(myTasksPage?.items ?? []).slice(0, 6).map((t) => (
                <div className="mtask" key={t.id} onClick={() => openTask(t.id)}>
                  <span className="tid">{taskSerial(t.order)}</span>
                  <span className="tt">{t.title}</span>
                  <StatusPill name={statusName(t.statusId)} />
                  <span
                    className={`mono tiny ${isOverdue(t.dueDate) ? "" : ""}`}
                    style={{ color: isOverdue(t.dueDate) ? "var(--danger)" : "var(--faint)" }}
                  >
                    {dueLabel(t.dueDate)}
                  </span>
                </div>
              ))}
              {(myTasksPage?.items ?? []).length === 0 && (
                <div className="tiny faint" style={{ padding: 12 }}>
                  Nothing assigned to you. 🎉
                </div>
              )}
            </div>
          </div>

          {/* Milestones */}
          <Milestones pid={pid} />
        </div>

        {/* Right rail */}
        <div className="stack" style={{ gap: 14 }}>
          <NotificationsCard />

          <div className="card">
            <div className="panel-head">
              <h3>Recent activity</h3>
            </div>
            <div className="panel-body">
              <div className="feed">
                {data.activity.map((a) => {
                  const u = data.workload.find((w) => w.userId === a.actorId);
                  const icon = FEED[a.kind];
                  return (
                    <div className="feed-item" key={a.id}>
                      <div className={`feed-ic ${a.kind}`}>{icon}</div>
                      <div className="feed-body">
                        <b>{u?.name?.split(" ")[0] ?? "Someone"}</b> {VERB[a.kind]}{" "}
                        <b>{a.target}</b>
                        <div className="when">{a.whenLabel || timeAgo(a.when)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="panel-head">
              <h3>Team workload</h3>
              <span className="muted">Active sprint</span>
            </div>
            <div className="panel-body">
              {data.workload.map((w) => {
                const pct = Math.min(100, Math.round((w.assigned / w.capacity) * 100));
                const over = w.assigned > w.capacity;
                return (
                  <div className="work-row" key={w.userId}>
                    <span className={`av sm ${w.color}`}>{w.initials}</span>
                    <span className="nm">
                      {w.name.split(" ")[0]} {w.name.split(" ")[1]?.[0]}.
                    </span>
                    <div className="wbar">
                      <i style={{ width: `${pct}%` }} className={over ? "over" : ""}></i>
                    </div>
                    <span className="n">{w.assigned}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function statusNameUnused() {
  return "";
}
function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Kpi({
  label,
  value,
  sub,
  trend,
  danger,
  spark,
}: {
  label: string;
  value: number;
  sub: string;
  trend: "up" | "dn";
  danger?: boolean;
  spark: React.ReactNode;
}) {
  return (
    <div className="card kpi">
      <div className="label">{label}</div>
      <div className="val" style={danger ? { color: "var(--danger)" } : undefined}>
        {value}
      </div>
      <div className="sub">
        <span className={trend === "up" ? "up" : "dn"}>{trend === "up" ? "▲" : "▼"}</span> {sub}
      </div>
      <div className="spark">{spark}</div>
    </div>
  );
}

function Burndown({ data, total }: { data: { day: number; remaining: number }[]; total: number }) {
  if (!data.length) return null;
  const SPRINT_DAYS = 14;
  const lastDay = data.at(-1)?.day ?? 0;
  const remaining = Math.max(0, SPRINT_DAYS - lastDay);
  const w = 340;
  const h = 110;
  const maxY = total;
  const days = data.length;
  const x = (i: number) => (i / (days - 1)) * w;
  const y = (v: number) => h - (v / maxY) * (h - 10) - 5;
  const pts = data.map((d, i) => `${x(i)},${y(d.remaining)}`).join(" ");
  return (
    <div>
      <div className="row between" style={{ marginBottom: 6 }}>
        <span className="small muted">Burndown</span>
        <span className="tiny mono muted">{remaining} days remaining</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        <defs>
          <linearGradient id="burn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="oklch(54% 0.18 258 / .22)" />
            <stop offset="1" stopColor="oklch(54% 0.18 258 / 0)" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={h - 5}
          x2={w}
          y2="5"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <polyline
          fill="none"
          stroke="var(--faint)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          points={`0,5 ${w},${h - 5}`}
        />
        <polygon
          fill="url(#burn)"
          points={`0,${y(data[0]!.remaining)} ${pts} ${w},${h - 5} 0,${h - 5}`}
        />
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          points={pts}
        />
      </svg>
      <div className="row" style={{ gap: 14, marginTop: 6 }}>
        <span className="tiny mono muted">— Ideal</span>
        <span className="tiny mono" style={{ color: "var(--accent)" }}>
          ● Actual
        </span>
      </div>
    </div>
  );
}

function Milestones({ pid }: { pid: string }) {
  const { data } = useQuery({
    queryKey: ["milestones", pid],
    queryFn: () => planningService.milestones(pid),
  });
  return (
    <div className="card">
      <div className="panel-head">
        <h3>Upcoming milestones</h3>
      </div>
      <div className="panel-body">
        {(data ?? []).map((m) => {
          const tone = m.progress < 40 ? "ok" : m.progress < 70 ? "neutral" : "warn";
          return (
            <div className="ms-item" key={m.id}>
              <div className="ms-ic">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 21h18M5 21V8l7-4 7 4v13" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <div className="ms-body">
                <b>{m.name}</b>
                <small>
                  Due {dueLabel(m.dueDate)} · {m.doneTasks}/{m.totalTasks} tasks
                </small>
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
        {(data ?? []).length === 0 && (
          <div className="tiny faint" style={{ padding: 12 }}>
            No milestones yet.
          </div>
        )}
      </div>
    </div>
  );
}

const VERB: Record<string, string> = {
  move: "moved",
  doc: "updated",
  com: "commented on",
  done: "closed",
  mile: "created milestone",
};
const FEED: Record<string, React.ReactNode> = {
  move: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
    </svg>
  ),
  com: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  ),
  mile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    </svg>
  ),
};

/* ============================ Notifications card ============================ */
type NotifKind = "mention" | "assign" | "review" | "due" | "reply" | "invite" | "deadline";
interface Notif {
  id: string;
  kind: NotifKind;
  unread: boolean;
  time: string;
  body: ReactNode;
}

const NOTIF_ICONS: Record<NotifKind, ReactNode> = {
  mention: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.5 7.6" />
    </svg>
  ),
  assign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  due: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  reply: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 14l-5-5 5-5" />
      <path d="M4 9h11a5 5 0 0 1 5 5v2" />
    </svg>
  ),
  invite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 7l9 6 9-6M12 13v5M9 16h6" />
    </svg>
  ),
  deadline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="13" r="8" />
      <path d="M5 3 2 6M22 6l-3-3M12 9v4l2 2" />
    </svg>
  ),
};

const INITIAL_NOTIFS: Notif[] = [
  {
    id: "mention",
    kind: "mention",
    unread: true,
    time: "8m",
    body: (
      <>
        <b>Marco K.</b> mentioned you on <span className="ref">ATL-101</span>
        <span className="quote">“Can you review the SSO token refresh logic before the demo?”</span>
      </>
    ),
  },
  {
    id: "assign",
    kind: "assign",
    unread: true,
    time: "25m",
    body: (
      <>
        <b>Sara R.</b> assigned <span className="ref">ATL-122</span> to you ·{" "}
        <span style={{ color: "var(--danger)" }}>P1</span>
      </>
    ),
  },
  {
    id: "review",
    kind: "review",
    unread: true,
    time: "1h",
    body: (
      <>
        <b>Diego P.</b> requested your review on <b>Audit-log spec</b>
      </>
    ),
  },
  {
    id: "due",
    kind: "due",
    unread: true,
    time: "2h",
    body: (
      <>
        <span className="ref">ATL-108</span> is due <b style={{ color: "var(--warn)" }}>tomorrow</b>
      </>
    ),
  },
  {
    id: "reply",
    kind: "reply",
    unread: false,
    time: "3h",
    body: (
      <>
        <b>Lin C.</b> replied in <b>Sprint planning</b>
      </>
    ),
  },
  {
    id: "invite",
    kind: "invite",
    unread: false,
    time: "5h",
    body: (
      <>
        <b>Jonas B.</b> invited you to <b>SSO design sync</b>
      </>
    ),
  },
  {
    id: "deadline",
    kind: "deadline",
    unread: false,
    time: "6h",
    body: (
      <>
        Sprint 14 ends in <b>4 days</b>
      </>
    ),
  },
];

function NotificationsCard() {
  const { toast } = useApp();
  const [items, setItems] = useState<Notif[]>(INITIAL_NOTIFS);
  const unread = items.filter((n) => n.unread).length;

  const markAll = () => {
    if (unread === 0) return;
    setItems((xs) => xs.map((n) => ({ ...n, unread: false })));
    toast("Marked all as read");
  };

  return (
    <div className="card" data-od-id="dashboard-notifications">
      <div className="panel-head">
        <h3>Notifications</h3>
        <span className="muted">{unread > 0 ? `${unread} unread` : "All caught up"}</span>
        <div className="right">
          <button className="btn ghost sm" onClick={markAll}>
            Mark all read
          </button>
        </div>
      </div>
      <div className="panel-body flush">
        <div className="notif-list">
          {items.map((n) => (
            <div key={n.id} className={`notif-item ${n.unread ? "unread" : "read"}`}>
              <span className="notif-dot" />
              <span className={`notif-ic ${n.kind}`}>{NOTIF_ICONS[n.kind]}</span>
              <div className="notif-body">{n.body}</div>
              <span className="notif-time">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
