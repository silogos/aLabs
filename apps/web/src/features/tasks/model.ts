/** Tasks view-model — pure vocabulary, types, and the API→row mapping.
 *  No state, no React: everything here is a pure function over data fetched
 *  by queries.ts. `TaskRow` keeps the short display vocabulary (status/type/
 *  priority short-ids, numeric `order` as the row key) the views are written
 *  against; the API vocabulary (uuids, enum names) is translated at this
 *  boundary and nowhere else. */
import type { Content, Iteration, Milestone, Task, TaskLabel, TaskPriority, TaskStatus, TaskType } from "@pmin/core";

export type StatusId = "backlog" | "todo" | "progress" | "review" | "done";
export type TypeId = "epic" | "story" | "task" | "bug" | "subtask";
export type PrioId = "p1" | "p2" | "p3" | "p4";

export interface Person {
  name: string;
  initials: string;
  color: string;
  role: string;
}

export const TY: Record<TypeId, { l: string; c: string; ic: string }> = {
  epic: { l: "Epic", c: "v", ic: '<path d="M12 3 21 12 12 21 3 12Z"/><path d="M12 9v6"/>' },
  story: {
    l: "Story",
    c: "g",
    ic: '<path d="M6 4h8l5 5v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M14 4v5h5"/>',
  },
  task: {
    l: "Task",
    c: "b",
    ic: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  },
  bug: {
    l: "Bug",
    c: "r",
    ic: '<path d="M7 12a5 5 0 0 1 10 0v3a5 5 0 0 1-10 0Z"/><path d="M12 7V4M9 5 7.5 3.5M15 5l1.5-1.5M5 11h2M17 11h2M5.5 16 7 15.5M18.5 16 17 15.5"/>',
  },
  subtask: {
    l: "Subtask",
    c: "m",
    ic: '<rect x="5" y="9" width="13" height="10" rx="1.5"/><path d="M9 9V7a2 2 0 0 1 2-2h6"/><path d="m9 13 1.3 1.3L13 11.5"/>',
  },
};

export const ST: Record<StatusId, [string, string]> = {
  backlog: ["Backlog", "neutral"],
  todo: ["To Do", "neutral"],
  progress: ["In Progress", "info"],
  review: ["In Review", "violet"],
  done: ["Done", "ok"],
};

export const COLS: { id: StatusId; name: string; dot: string }[] = [
  { id: "backlog", name: "Backlog", dot: "var(--faint)" },
  { id: "todo", name: "To Do", dot: "var(--muted)" },
  { id: "progress", name: "In Progress", dot: "var(--info)" },
  { id: "review", name: "In Review", dot: "var(--violet)" },
  { id: "done", name: "Done", dot: "var(--ok)" },
];

export const PRIO: Record<PrioId, string> = { p1: "Urgent", p2: "High", p3: "Medium", p4: "Low" };
export const PRIO_ORDER: PrioId[] = ["p1", "p2", "p3", "p4"];

/* ---- API ↔ display vocabulary maps ---- */

export const STATUS_BY_NAME: Record<string, StatusId> = {
  Backlog: "backlog",
  "To Do": "todo",
  "In Progress": "progress",
  "In Review": "review",
  Done: "done",
};
export const PRIO_MAP: Record<string, PrioId> = {
  urgent: "p1",
  high: "p2",
  medium: "p3",
  low: "p4",
};
export const PRIO_API: Record<PrioId, TaskPriority> = {
  p1: "urgent",
  p2: "high",
  p3: "medium",
  p4: "low",
};
const TY_OF_NAME: Record<string, TypeId> = {
  Epic: "epic",
  Feature: "story",
  Story: "story",
  Task: "task",
  Bug: "bug",
};

export type SprintStatus = "planned" | "active" | "completed";
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  start: string; // display "Mar 17"
  end: string; // display "Mar 31"
  from: string; // ISO yyyy-mm-dd
  to: string; // ISO yyyy-mm-dd
  st: SprintStatus;
  capacity?: number | null;
  committed?: number; // frozen cache when completed
  completed?: number; // frozen cache when completed
}

export interface MilestoneVM {
  id: string;
  t: string;
  date: string;
  risk: "at_risk" | "on_track";
  done: number;
  total: number;
}

export interface Relations {
  blocks: number[];
  blockedBy: number[];
  relates: number[];
}
export type RelKey = "blocks" | "blockedBy" | "relates";
/** Reverse of each relation: blocks↔blockedBy, relates↔relates. */
export const REL_REVERSE: Record<RelKey, RelKey> = {
  blocks: "blockedBy",
  blockedBy: "blocks",
  relates: "relates",
};

export interface TaskRow {
  id: number;
  /** API task uuid — present on hydrated/write-through rows */
  uuid?: string;
  t: string;
  s: StatusId;
  a: string;
  rep?: string;
  p: PrioId;
  ty: TypeId;
  epic?: number;
  parent?: number;
  sp?: string | null;
  lb: string[];
  due: string;
  /** ISO due date kept alongside the display string for write-through */
  dueIso?: string;
  pts: number;
  rel?: Relations;
  desc?: Content;
}

/* ---- pure date/format helpers ---- */

export const NOW_D = new Date();
export const pD = (s: string): Date => new Date(s + "T00:00:00");
export function shortMD(d: Date | string): string {
  return (d instanceof Date ? d : pD(d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
export function daysBetween(a: string, b: string): number {
  return Math.round((pD(b).getTime() - pD(a).getTime()) / 86400000);
}
export function fmtISO(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
export const spStatusClass = (st: SprintStatus): string =>
  ({ planned: "neutral", active: "info", completed: "ok" })[st] || "neutral";

export const dueFmt = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

/** Best-effort display date ("Aug 20") → ISO; keeps the year sane. */
export function dueToIso(display: string): string | null {
  const s = display.trim();
  // DatePicker emits "YYYY-MM-DD" — accept it directly.
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return `${s}T00:00:00.000Z`;
  const m = /^(\w{3}) (\d{1,2})$/.exec(s);
  if (!m) return null;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mo = months.indexOf(m[1]!);
  if (mo < 0) return null;
  const now = new Date();
  let year = now.getFullYear();
  if (mo > now.getMonth() + 6) year -= 1; // "Dec 20" typed in January → past December
  return `${year}-${String(mo + 1).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}T00:00:00.000Z`;
}

const descFromApi = (raw: string | null): TaskRow["desc"] => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as TaskRow["desc"];
    return parsed && parsed.type ? parsed : undefined;
  } catch {
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: raw }] }],
    };
  }
};

/** Overdue = due date before today, not done. ("Aug 20"-style display dates
 *  carry no year — demo dates are current-year.) */
export const late = (t: TaskRow): boolean => {
  if (t.s === "done" || !t.due || t.due === "—") return false;
  return new Date(`${t.due} ${new Date().getFullYear()}`).getTime() < Date.now();
};
export const ptsTotal = (list: TaskRow[]): number => list.reduce((n, t) => n + (t.pts || 0), 0);
export const progOf = (list: TaskRow[]): number => {
  const d = list.filter((t) => t.s === "done").length;
  return list.length ? Math.round((d / list.length) * 100) : 0;
};
export const isWork = (t: TaskRow): boolean => !t.parent && t.ty !== "epic";

/* ---- board derivation (pure) ---- */

export interface BoardMaps {
  statusIdByShort: Map<StatusId, string>;
  statusShortById: Map<string, StatusId>;
  tyIdByTy: Map<TypeId, string>;
  tyShortById: Map<string, TypeId>;
  labelIdByName: Map<string, string>;
}

export function buildMaps(
  statuses: TaskStatus[],
  types: TaskType[],
  labels: TaskLabel[],
): BoardMaps {
  const statusIdByShort = new Map<StatusId, string>();
  const statusShortById = new Map<string, StatusId>();
  for (const s of statuses) {
    const short = STATUS_BY_NAME[s.name] ?? "todo";
    statusIdByShort.set(short, s.id);
    statusShortById.set(s.id, short);
  }
  const tyIdByTy = new Map<TypeId, string>();
  const tyShortById = new Map<string, TypeId>();
  for (const t of types) {
    const short = TY_OF_NAME[t.name];
    if (short) {
      tyIdByTy.set(short, t.id);
      tyShortById.set(t.id, short);
    }
  }
  const labelIdByName = new Map<string, string>();
  for (const l of labels) labelIdByName.set(l.name, l.id);
  return { statusIdByShort, statusShortById, tyIdByTy, tyShortById, labelIdByName };
}

export interface DerivedBoard {
  rows: TaskRow[];
  /** numeric order → API uuid (mutations resolve their write target) */
  uuidByOrder: Map<number, string>;
  sprints: Record<string, Sprint>;
  /** iteration ids sorted by start date */
  sprintIds: string[];
  milestones: MilestoneVM[];
  velocity: { name: string; committed: number; completed: number }[];
  epicIds: number[];
  epicMeta: Record<number, { own: string; c: string; goal: string }>;
  maps: BoardMaps;
}

export function deriveBoard(
  tasks: Task[],
  maps: BoardMaps,
  iterations: Iteration[],
  milestones: Milestone[],
): DerivedBoard {
  const orderByUuid = new Map(tasks.map((t) => [t.id, t.order]));
  const uuidByOrder = new Map(tasks.map((t) => [t.order, t.id]));
  const orderOfUuid = (uuid: string): number => orderByUuid.get(uuid) ?? -1;

  const epicOrders: number[] = [];
  const rows: TaskRow[] = tasks.map((t) => {
    const parent = t.parentId ? orderByUuid.get(t.parentId) : undefined;
    const tyShort = t.typeId ? (maps.tyShortById.get(t.typeId) ?? "task") : "task";
    if (tyShort === "epic" && !parent) epicOrders.push(t.order);
    const rel: Relations = { blocks: [], blockedBy: [], relates: [] };
    for (const l of t.links ?? []) {
      if (l.type === "blocks" && l.targetId === t.id) rel.blockedBy.push(orderOfUuid(l.sourceId));
      else if (l.type === "blocks" && l.sourceId === t.id) rel.blocks.push(orderOfUuid(l.targetId));
      else if (l.type === "relates_to")
        rel.relates.push(orderOfUuid(l.sourceId === t.id ? l.targetId : l.sourceId));
    }
    const epicOrder = t.epicId ? orderByUuid.get(t.epicId) : undefined;
    return {
      id: t.order,
      uuid: t.id,
      rel,
      t: t.title,
      s: maps.statusShortById.get(t.statusId) ?? "todo",
      a: t.assigneeId ?? "",
      rep: t.reporterId ?? undefined,
      p: PRIO_MAP[t.priority] ?? "p3",
      ty: parent !== undefined ? ("subtask" as TypeId) : tyShort,
      lb: t.labels.map((l) => l.name),
      due: dueFmt(t.dueDate),
      dueIso: t.dueDate ?? undefined,
      pts: t.estimate ?? 0,
      desc: descFromApi(t.description ?? null),
      ...(parent !== undefined ? { parent } : {}),
      ...(epicOrder !== undefined && !parent && tyShort !== "epic" ? { epic: epicOrder } : {}),
      ...(t.iterationId && parent === undefined && tyShort !== "epic" ? { sp: t.iterationId } : {}),
    } satisfies TaskRow;
  });

  // epic meta from the epic rows themselves (goal lives in the description)
  const epicMeta: DerivedBoard["epicMeta"] = {};
  const EPIC_COLORS = ["v", "g", "b", "o", "m", "r"];
  epicOrders.sort((a, b) => a - b);
  epicOrders.forEach((order, i) => {
    const row = rows.find((t) => t.id === order);
    if (!row) return;
    epicMeta[order] = {
      own: row.a,
      c: EPIC_COLORS[i % EPIC_COLORS.length] ?? "v",
      goal:
        typeof row.desc?.content?.[0]?.content?.[0]?.text === "string"
          ? row.desc.content[0].content[0].text
          : "",
    };
  });

  // sprints from iterations (keyed by iteration uuid)
  const sprints: Record<string, Sprint> = {};
  const iters = [...iterations].sort((a, b) => a.startDate.localeCompare(b.startDate));
  for (const it of iters) {
    sprints[it.id] = {
      id: it.id,
      name: it.name,
      goal: it.goal ?? "",
      start: shortMD(it.startDate),
      end: shortMD(it.endDate),
      from: it.startDate.slice(0, 10),
      to: it.endDate.slice(0, 10),
      st: it.status,
      capacity: null,
      ...(it.status === "completed"
        ? { committed: it.committedPoints, completed: it.completedPoints }
        : {}),
    };
  }

  // milestones (risk derived like the reports rule)
  const milestoneList: MilestoneVM[] = milestones.map((m) => ({
    id: m.id,
    t: m.name,
    date: (m.dueDate ?? "").slice(0, 10),
    risk:
      m.status === "reached"
        ? ("on_track" as const)
        : m.dueDate && Date.now() - +new Date(m.dueDate) <= 14 * 864e5 && m.progress < 90
          ? ("at_risk" as const)
          : ("on_track" as const),
    done: m.doneTasks,
    total: m.totalTasks,
  }));
  milestoneList.sort((a, b) => pD(a.date).getTime() - pD(b.date).getTime());

  const velocity = iters.slice(-5).map((it) => ({
    name: it.name.replace("Sprint ", "S"),
    committed: it.committedPoints,
    completed: it.completedPoints,
  }));

  return {
    rows,
    uuidByOrder,
    sprints,
    sprintIds: iters.map((i) => i.id),
    milestones: milestoneList,
    velocity,
    epicIds: Object.keys(epicMeta)
      .map(Number)
      .sort((a, b) => a - b),
    epicMeta,
    maps,
  };
}
