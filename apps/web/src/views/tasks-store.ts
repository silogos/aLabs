/**
 * Tasks mock store — the canonical Jira-style work hierarchy for the prototype.
 *
 * The API schema (`Task`) supports parentId/iterationId/estimate, but the seed
 * data + type system don't model epics/subtasks/sprints richly enough for this
 * design, so (like Meetings/Reports/Agreements) the view reads off this local
 * mutable store. `useTasksVersion()` + the mutators are the single integration
 * point when wiring real data.
 */
import { useSyncExternalStore } from "react";
import type { Content } from "@pmin/core";
import { api } from "../api";

export type StatusId = "backlog" | "todo" | "progress" | "review" | "done";
export type TypeId = "epic" | "story" | "task" | "bug" | "subtask";
export type PrioId = "p1" | "p2" | "p3" | "p4";

export interface Person {
  name: string;
  initials: string;
  color: string;
  role: string;
}

export const P: Record<string, Person> = {
  ay: { name: "Aisha Yusuf", initials: "AY", color: "a", role: "Product Manager" },
  mk: { name: "Marco Keller", initials: "MK", color: "b", role: "Tech Lead" },
  lc: { name: "Lin Chen", initials: "LC", color: "c", role: "Engineer" },
  dp: { name: "Diego Pereira", initials: "DP", color: "d", role: "Engineer" },
  sr: { name: "Sara Reinhardt", initials: "SR", color: "e", role: "QA" },
  jb: { name: "Jonas Berg", initials: "JB", color: "f", role: "Designer" },
};

/** Runtime people registry (API org members keyed by user id) layered over the
 *  demo `P` map — hydrated per project so avatars/names resolve for real data. */
const API_PEOPLE: Record<string, Person> = {};
export function registerPeople(users: { id: string; name: string }[]): void {
  for (const u of users) {
    const initials = u.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    API_PEOPLE[u.id] = {
      name: u.name,
      initials,
      color: "a",
      role: "Member",
    };
  }
}
export const personOf = (id: string | undefined): Person | undefined =>
  (id && (API_PEOPLE[id] ?? P[id])) || undefined;

export const who = (id: string | undefined): string => personOf(id)?.name ?? "Unassigned";

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
export const SPRINTS: Record<string, Sprint> = {
  s13: {
    id: "s13",
    name: "Sprint 13",
    goal: "Auth foundations + billing scaffold — MFA enrollment, password rate-limiting, and the billing-webhook path stubbed.",
    start: "Mar 03",
    end: "Mar 16",
    from: "2025-03-03",
    to: "2025-03-16",
    st: "completed",
    committed: 48,
    completed: 45,
  },
  s14: {
    id: "s14",
    name: "Sprint 14",
    goal: "Ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. Client-portal scaffolding visible but read-only.",
    start: "Mar 17",
    end: "Mar 31",
    from: "2025-03-17",
    to: "2025-03-31",
    st: "active",
    capacity: 52,
  },
  s15: {
    id: "s15",
    name: "Sprint 15",
    goal: "Client portal read-only views + reporting export to PDF/CSV.",
    start: "Apr 01",
    end: "Apr 14",
    from: "2025-04-01",
    to: "2025-04-14",
    st: "planned",
    capacity: 48,
  },
};
export interface Milestone {
  id: string;
  t: string;
  date: string;
  risk: "at_risk" | "on_track";
  done: number;
  total: number;
}
export const MILESTONES: Milestone[] = [
  { id: "ms1", t: "v2.0 Beta", date: "2025-03-28", risk: "at_risk", done: 18, total: 25 },
  { id: "ms2", t: "Design System v1", date: "2025-04-12", risk: "on_track", done: 11, total: 20 },
  { id: "ms3", t: "Security hardening", date: "2025-04-30", risk: "on_track", done: 6, total: 20 },
];
const DEMO_MILESTONES: Milestone[] = MILESTONES.map((m) => ({ ...m }));
export const VELOCITY = [
  { name: "S9", committed: 38, completed: 34 },
  { name: "S10", committed: 42, completed: 40 },
  { name: "S11", committed: 44, completed: 41 },
  { name: "S12", committed: 46, completed: 44 },
  { name: "S13", committed: 48, completed: 45 },
];

/* ---- Planning helpers ---- */
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
export const sprintStatusLabel = (sp: string): string =>
  ({ planned: "Planned", active: "Active", completed: "Completed" })[SPRINTS[sp].st];
export const iterTasks = (sp: string): TaskRow[] =>
  TASKS.filter((t) => !t.parent && t.ty !== "epic" && t.sp === sp);
export function committedPts(sp: string): number {
  const s = SPRINTS[sp];
  if (s && s.st === "completed") return s.committed || 0;
  return ptsTotal(iterTasks(sp));
}
export function donePts(sp: string): number {
  const s = SPRINTS[sp];
  if (s && s.st === "completed") return s.completed || 0;
  return ptsTotal(iterTasks(sp).filter((t) => t.s === "done"));
}
export function sprintRows(): { k: string; total: number }[] {
  return [
    ...Object.keys(SPRINTS).map((k) => ({ k, total: iterTasks(k).length })),
    { k: "backlog", total: TASKS.filter((t) => !t.parent && t.ty !== "epic" && !t.sp).length },
  ];
}
/** A valid sprint key for the current dataset — falls back to the active (or
 *  newest) iteration when the held key predates hydration. */
export function resolveSprint(key: string): string {
  if (SPRINTS[key]) return key;
  const keys = Object.keys(SPRINTS);
  return keys.find((k) => SPRINTS[k].st === "active") ?? keys.at(-1) ?? key;
}

export const isPlannable = (sp: string): boolean => {
  const s = SPRINTS[sp];
  return !!s && (s.st === "planned" || s.st === "active");
};

export const EPIC_META: Record<number, { own: string; c: string; goal: string }> = {
  200: {
    own: "mk",
    c: "v",
    goal: "SSO, MFA, RBAC and an immutable audit trail for org-wide security.",
  },
  201: {
    own: "lc",
    c: "g",
    goal: "Subscription billing, invoicing and payment webhook resilience.",
  },
  202: { own: "dp", c: "b", goal: "Trigram document search, dashboards and exportable reports." },
  203: {
    own: "jb",
    c: "o",
    goal: "Design-system migration, docs, notifications and platform infra.",
  },
};
export const EPIC_IDS = [200, 201, 202, 203];

export interface AcItem {
  text: string;
  done: boolean;
}
export interface Cmt {
  by: string;
  when: string;
  text: string;
}
export interface Att {
  n: string;
  sz: string;
  by: string;
}
export interface Relations {
  blocks: number[];
  blockedBy: number[];
  relates: number[];
}
export type RelKey = "blocks" | "blockedBy" | "relates";
/** Reverse of each relation: blocks↔blockedBy, relates↔relates. */
const REL_REVERSE: Record<RelKey, RelKey> = {
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
  ac?: AcItem[];
  rel?: Relations;
  com?: Cmt[];
  att?: Att[];
  desc?: Content;
}

const DEMO_TASKS: TaskRow[] = [
  /* ----- Executable issues (101-120) ----- */
  {
    id: 101,
    t: "Implement OAuth2 SSO flow",
    s: "progress",
    a: "mk",
    rep: "ay",
    p: "p2",
    ty: "story",
    epic: 200,
    sp: "s14",
    lb: ["sso", "security"],
    due: "Mar 24",
    pts: 8,
    ac: [
      { text: "Spec out scopes & claims", done: true },
      { text: "Authorization-code + PKCE", done: true },
      { text: "Token refresh rotation", done: false },
      { text: "IdP sandbox sign-off", done: false },
    ],
    rel: { blocks: [], blockedBy: [105], relates: [] },
    com: [
      {
        by: "mk",
        when: "2h ago",
        text: "Blocked on the IdP sandbox credentials — chasing Ops. PKCE verifier is done.",
      },
      {
        by: "sr",
        when: "yesterday",
        text: "Added a regression test for expired refresh tokens. Clean on staging.",
      },
    ],
    att: [{ n: "oauth-sequence.png", sz: "240 KB", by: "mk" }],
  },
  {
    id: 102,
    t: "Board drag-and-drop performance",
    s: "progress",
    a: "lc",
    rep: "lc",
    p: "p3",
    ty: "task",
    epic: 203,
    sp: "s14",
    lb: ["frontend"],
    due: "Mar 23",
    pts: 5,
    ac: [
      { text: "Profile with 500 cards", done: true },
      { text: "Virtualize off-screen columns", done: false },
    ],
    com: [],
    att: [],
  },
  {
    id: 103,
    t: "Fix flaky CI test on billing webhook",
    s: "review",
    a: "dp",
    rep: "mk",
    p: "p1",
    ty: "bug",
    epic: 201,
    sp: "s14",
    lb: ["ci", "billing"],
    due: "Mar 22",
    pts: 3,
    ac: [
      { text: "Reproduce reliably", done: true },
      { text: "Stabilise test fixtures", done: false },
    ],
    com: [
      {
        by: "dp",
        when: "5h ago",
        text: "Root cause: clock skew between workers. Freezing the clock in the harness.",
      },
    ],
    att: [],
  },
  {
    id: 104,
    t: "Design system: migrate tokens to OKLch",
    s: "todo",
    a: "jb",
    rep: "jb",
    p: "p3",
    ty: "task",
    epic: 203,
    sp: "s14",
    lb: ["design"],
    due: "Mar 26",
    pts: 5,
    ac: [{ text: "Audit hex usages", done: false }],
    com: [],
    att: [],
  },
  {
    id: 105,
    t: "Audit log: immutable event store",
    s: "todo",
    a: "mk",
    rep: "ay",
    p: "p2",
    ty: "story",
    epic: 200,
    sp: "s14",
    lb: ["security", "backend"],
    due: "Mar 28",
    pts: 8,
    ac: [
      { text: "Append-only table design", done: false },
      { text: "PII redaction rules", done: false },
    ],
    rel: { blocks: [101], blockedBy: [], relates: [] },
    com: [],
    att: [],
  },
  {
    id: 106,
    t: "Dashboard KPI sparkline component",
    s: "todo",
    a: "lc",
    rep: "ay",
    p: "p4",
    ty: "task",
    epic: 202,
    lb: ["frontend"],
    due: "Mar 27",
    pts: 3,
    ac: [],
    com: [],
    att: [],
  },
  {
    id: 107,
    t: "Role-based access at project level",
    s: "progress",
    a: "mk",
    rep: "ay",
    p: "p2",
    ty: "story",
    epic: 200,
    sp: "s14",
    lb: ["security"],
    due: "Apr 02",
    pts: 8,
    ac: [
      { text: "Permission matrix", done: true },
      { text: "Middleware guards", done: true },
      { text: "UI for role assignment", done: false },
    ],
    rel: { blocks: [], blockedBy: [], relates: [] },
    com: [],
    att: [],
  },
  {
    id: 108,
    t: "Search index for documents (PG trigram)",
    s: "review",
    a: "dp",
    rep: "dp",
    p: "p3",
    ty: "story",
    epic: 202,
    sp: "s14",
    lb: ["search", "backend"],
    due: "Mar 25",
    pts: 5,
    ac: [
      { text: "pg_trgm migration", done: true },
      { text: "Reindex job", done: false },
    ],
    rel: { blocks: [], blockedBy: [], relates: [117] },
    com: [],
    att: [],
  },
  {
    id: 109,
    t: "Iteration planning: velocity chart",
    s: "todo",
    a: "lc",
    rep: "ay",
    p: "p3",
    ty: "story",
    epic: 202,
    lb: ["planning"],
    due: "Mar 29",
    pts: 3,
    ac: [],
    rel: { blocks: [], blockedBy: [116], relates: [] },
    com: [],
    att: [],
  },
  {
    id: 117,
    t: "API: pagination contract (cursor)",
    s: "review",
    a: "dp",
    rep: "mk",
    p: "p2",
    ty: "task",
    epic: 203,
    sp: "s14",
    lb: ["api", "backend"],
    due: "Mar 24",
    pts: 3,
    ac: [],
    rel: { blocks: [], blockedBy: [], relates: [108] },
    com: [],
    att: [],
  },
  {
    id: 116,
    t: "Backlog grooming: triage queue",
    s: "todo",
    a: "ay",
    rep: "ay",
    p: "p3",
    ty: "task",
    epic: 203,
    lb: ["process"],
    due: "Mar 22",
    pts: 2,
    ac: [],
    rel: { blocks: [109], blockedBy: [], relates: [] },
    com: [],
    att: [],
  },
  {
    id: 118,
    t: "Notification digest: daily email",
    s: "todo",
    a: "lc",
    rep: "ay",
    p: "p4",
    ty: "story",
    epic: 203,
    lb: ["notifications"],
    due: "Apr 01",
    pts: 3,
    ac: [],
    rel: { blocks: [], blockedBy: [], relates: [113] },
    com: [],
    att: [],
  },
  {
    id: 112,
    t: "Reset password rate limiting",
    s: "done",
    a: "sr",
    rep: "mk",
    p: "p1",
    ty: "bug",
    epic: 200,
    sp: "s13",
    lb: ["security", "auth"],
    due: "Mar 14",
    pts: 3,
    ac: [{ text: "Add sliding window", done: true }],
    rel: { blocks: [], blockedBy: [], relates: [] },
    com: [],
    att: [],
  },
  {
    id: 113,
    t: "Meeting notes: attach tasks",
    s: "done",
    a: "lc",
    rep: "ay",
    p: "p4",
    ty: "task",
    epic: 203,
    sp: "s13",
    lb: ["meetings"],
    due: "Mar 12",
    pts: 2,
    ac: [],
    rel: { blocks: [], blockedBy: [], relates: [118] },
    com: [],
    att: [],
  },
  {
    id: 114,
    t: "MFA: TOTP enrollment UX",
    s: "done",
    a: "sr",
    rep: "ay",
    p: "p2",
    ty: "story",
    epic: 200,
    sp: "s13",
    lb: ["security", "auth"],
    due: "Mar 13",
    pts: 5,
    ac: [],
    com: [],
    att: [],
  },
  {
    id: 115,
    t: "Empty states across modules",
    s: "done",
    a: "jb",
    rep: "jb",
    p: "p4",
    ty: "task",
    epic: 203,
    sp: "s13",
    lb: ["design"],
    due: "Mar 16",
    pts: 2,
    ac: [],
    com: [],
    att: [],
  },
  {
    id: 119,
    t: "Write release notes for v2.0",
    s: "todo",
    a: "ay",
    rep: "ay",
    p: "p3",
    ty: "task",
    epic: 203,
    lb: ["docs"],
    due: "Mar 27",
    pts: 2,
    ac: [],
    com: [],
    att: [],
  },
  {
    id: 120,
    t: "Stakeholder demo prep",
    s: "todo",
    a: "ay",
    rep: "mk",
    p: "p2",
    ty: "task",
    epic: 203,
    lb: ["process"],
    due: "Mar 25",
    pts: 2,
    ac: [],
    com: [],
    att: [],
  },
  /* ----- Epics ----- */
  {
    id: 200,
    t: "Identity & Access",
    s: "progress",
    a: "mk",
    p: "p1",
    ty: "epic",
    lb: ["security"],
    due: "Apr 30",
    pts: 0,
  },
  {
    id: 201,
    t: "Billing & Payments",
    s: "todo",
    a: "lc",
    p: "p2",
    ty: "epic",
    lb: ["billing"],
    due: "May 14",
    pts: 0,
  },
  {
    id: 202,
    t: "Search & Reporting",
    s: "progress",
    a: "dp",
    p: "p2",
    ty: "epic",
    lb: ["search"],
    due: "Apr 18",
    pts: 0,
  },
  {
    id: 203,
    t: "Platform Foundation",
    s: "progress",
    a: "jb",
    p: "p3",
    ty: "epic",
    lb: ["platform"],
    due: "Apr 05",
    pts: 0,
  },
  /* ----- Subtasks ----- */
  {
    id: 301,
    t: "Spec out scopes & claims",
    s: "done",
    a: "mk",
    p: "p3",
    ty: "subtask",
    parent: 101,
    lb: [],
    due: "Mar 20",
    pts: 1,
    com: [],
  },
  {
    id: 302,
    t: "Wire authorization-code grant",
    s: "progress",
    a: "mk",
    p: "p2",
    ty: "subtask",
    parent: 101,
    lb: [],
    due: "Mar 23",
    pts: 3,
    com: [],
  },
  {
    id: 303,
    t: "Token refresh rotation",
    s: "todo",
    a: "sr",
    p: "p3",
    ty: "subtask",
    parent: 101,
    lb: [],
    due: "Mar 25",
    pts: 2,
    com: [],
  },
  {
    id: 304,
    t: "Profile with 500 cards",
    s: "done",
    a: "lc",
    p: "p3",
    ty: "subtask",
    parent: 102,
    lb: [],
    due: "Mar 19",
    pts: 1,
    com: [],
  },
  {
    id: 305,
    t: "Virtualize off-screen columns",
    s: "todo",
    a: "lc",
    p: "p3",
    ty: "subtask",
    parent: 102,
    lb: [],
    due: "Mar 24",
    pts: 2,
    com: [],
  },
  {
    id: 306,
    t: "Permission matrix doc",
    s: "done",
    a: "mk",
    p: "p2",
    ty: "subtask",
    parent: 107,
    lb: [],
    due: "Mar 18",
    pts: 2,
    com: [],
  },
  {
    id: 307,
    t: "Middleware guards",
    s: "progress",
    a: "mk",
    p: "p2",
    ty: "subtask",
    parent: 107,
    lb: [],
    due: "Mar 27",
    pts: 3,
    com: [],
  },
  {
    id: 308,
    t: "UI for role assignment",
    s: "todo",
    a: "jb",
    p: "p3",
    ty: "subtask",
    parent: 107,
    lb: [],
    due: "Apr 01",
    pts: 3,
    com: [],
  },
  {
    id: 309,
    t: "Stabilise test fixtures",
    s: "progress",
    a: "dp",
    p: "p1",
    ty: "subtask",
    parent: 103,
    lb: [],
    due: "Mar 23",
    pts: 2,
    com: [],
  },
  {
    id: 310,
    t: "pg_trgm migration",
    s: "done",
    a: "dp",
    p: "p3",
    ty: "subtask",
    parent: 108,
    lb: [],
    due: "Mar 20",
    pts: 2,
    com: [],
  },
];
let TASKS: TaskRow[] = structuredClone(DEMO_TASKS);

/* ---- API hydration ----
 * The demo set above IS the Atlas Platform 2.0 dataset (the API seed mirrors
 * it). Switching to any other project swaps in that project's real API rows;
 * switching back to Atlas restores the rich demo set (sprints, epics,
 * relations, comments have no API counterpart yet — see header note). */
interface ApiTaskLike {
  id: string;
  title: string;
  description?: string | null;
  statusId: string;
  assigneeId: string | null;
  priority: string;
  typeId: string | null;
  parentId: string | null;
  epicId?: string | null;
  iterationId?: string | null;
  dueDate: string | null;
  order: number;
  estimate: number | null;
  labels: { name: string }[];
  links?: { id: string; sourceId: string; targetId: string; type: string }[];
}
const STATUS_BY_NAME: Record<string, StatusId> = {
  Backlog: "backlog",
  "To Do": "todo",
  "In Progress": "progress",
  "In Review": "review",
  Done: "done",
};
const PRIO_MAP: Record<string, PrioId> = { urgent: "p1", high: "p2", medium: "p3", low: "p4" };
const dueFmt = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

/**** API-backed mode **************************************************
 * For non-ATL projects the rows come from the API; relationship add/remove
 * mirrors to the API (optimistic — the local arrays update immediately). */
let API_PROJECT: string | null = null;
let ACTIVE_PID: string | null = null;
let UUID_BY_ORDER = new Map<number, string>();
let CURRENT_USER = "";
/** short→uuid for the seeded demo people (matched by name at hydrate time) */
let SHORT_UUID = new Map<string, string>();
const STATUS_ID_BY_SHORT = new Map<StatusId, string>();
const STATUS_SHORT_BY_ID = new Map<string, StatusId>();
const TYPE_ID_BY_TY = new Map<TypeId, string>();
const LABEL_ID_BY_NAME = new Map<string, string>();
const EPIC_UUID_BY_ORDER = new Map<number, string>();
const PRIO_API: Record<PrioId, string> = { p1: "urgent", p2: "high", p3: "medium", p4: "low" };
const API_PRIO: Record<string, PrioId> = { urgent: "p1", high: "p2", medium: "p3", low: "p4" };

/** People for pickers: hydrated API members keyed by uuid (rows store uuids),
 *  plus any demo person not present in the member list. */
export function peopleOptions(): [string, string][] {
  const apiNames = new Set(Object.values(API_PEOPLE).map((p) => p.name));
  const opts: [string, string][] = [];
  for (const [id, person] of Object.entries(API_PEOPLE)) opts.push([id, person.name]);
  for (const k of Object.keys(P)) {
    if (!apiNames.has(P[k]!.name)) opts.push([k, P[k]!.name]);
  }
  return opts;
}
const resolveUserUuid = (shortOrUuid: string): string | null =>
  SHORT_UUID.get(shortOrUuid) ??
  (API_PEOPLE[shortOrUuid] ? shortOrUuid : null) ??
  (/^[0-9a-f-]{36}$/i.test(shortOrUuid) ? shortOrUuid : null);

/** Fire-and-forget task patch (optimistic — the local row already changed). */
function wtPatch(order: number, patch: Record<string, unknown>): void {
  if (API_PROJECT !== "api") return;
  const uuid = UUID_BY_ORDER.get(order);
  if (!ACTIVE_PID || !uuid) return;
  void api.updateTask(ACTIVE_PID, uuid, patch as never).catch(() => {});
}
/** Best-effort display date ("Aug 20") → ISO; keeps the year sane. */
function dueToIso(display: string): string | null {
  const m = /^(\w{3}) (\d{1,2})$/.exec(display.trim());
  if (!m) return null;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mo = months.indexOf(m[1]!);
  if (mo < 0) return null;
  const now = new Date();
  let year = now.getFullYear();
  if (mo > now.getMonth() + 6) year -= 1; // "Dec 20" typed in January → past December
  return `${year}-${String(mo + 1).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}T00:00:00.000Z`;
}

const orderOfUuid = (m: Map<string, number>, uuid: string): number => m.get(uuid) ?? -1;

export interface HydrateExtras {
  currentUserId?: string;
  types?: { id: string; name: string }[];
  labels?: { id: string; name: string }[];
  iterations?: {
    id: string;
    name: string;
    goal: string | null;
    startDate: string;
    endDate: string;
    status: "planned" | "active" | "completed";
    committedPoints: number;
    completedPoints: number;
  }[];
  milestones?: {
    id: string;
    name: string;
    description: string | null;
    dueDate: string | null;
    status: string;
    progress: number;
    totalTasks: number;
    doneTasks: number;
  }[];
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

export function hydrateProject(
  projectKey: string,
  projectId: string | null,
  tasks: ApiTaskLike[],
  statuses: { id: string; name: string }[],
  users: { id: string; name: string }[],
  extras: HydrateExtras = {},
): void {
  void projectKey;
  registerPeople(users);
  CURRENT_USER = extras.currentUserId ?? users[0]?.id ?? "";

  // demo short ids → real user uuids (the seeded people share names)
  SHORT_UUID = new Map(
    Object.keys(P)
      .map((k) => {
        const u = users.find((x) => x.name === P[k]!.name);
        return u ? ([k, u.id] as [string, string]) : null;
      })
      .filter((x): x is [string, string] => !!x),
  );

  STATUS_ID_BY_SHORT.clear();
  STATUS_SHORT_BY_ID.clear();
  for (const s of statuses) {
    const short = STATUS_BY_NAME[s.name] ?? "todo";
    STATUS_ID_BY_SHORT.set(short, s.id);
    STATUS_SHORT_BY_ID.set(s.id, short);
  }
  TYPE_ID_BY_TY.clear();
  const TY_OF_NAME: Record<string, TypeId> = {
    Epic: "epic",
    Feature: "story",
    Story: "story",
    Task: "task",
    Bug: "bug",
  };
  for (const t of extras.types ?? []) {
    const short = TY_OF_NAME[t.name];
    if (short) TYPE_ID_BY_TY.set(short, t.id);
  }
  LABEL_ID_BY_NAME.clear();
  for (const l of extras.labels ?? []) LABEL_ID_BY_NAME.set(l.name, l.id);

  API_PROJECT = projectId ? "api" : null;
  ACTIVE_PID = projectId;
  const orderByUuid = new Map(tasks.map((t) => [t.id, t.order]));
  UUID_BY_ORDER = new Map(tasks.map((t) => [t.order, t.id]));
  EPIC_UUID_BY_ORDER.clear();

  // type short by uuid (task rows only carry typeId)
  const TY_SHORT_BY_ID = new Map(
    (extras.types ?? []).map((t) => [t.id, TY_OF_NAME[t.name] ?? "task"]),
  );

  const epicOrders: number[] = [];
  TASKS = tasks.map((t) => {
    const parent = t.parentId ? orderByUuid.get(t.parentId) : undefined;
    const tyShort = t.typeId ? (TY_SHORT_BY_ID.get(t.typeId) ?? "task") : "task";
    if (tyShort === "epic" && !parent) epicOrders.push(t.order);
    const rel = { blocks: [] as number[], blockedBy: [] as number[], relates: [] as number[] };
    for (const l of t.links ?? []) {
      if (l.type === "blocks" && l.targetId === t.id)
        rel.blockedBy.push(orderOfUuid(orderByUuid, l.sourceId));
      else if (l.type === "blocks" && l.sourceId === t.id)
        rel.blocks.push(orderOfUuid(orderByUuid, l.targetId));
      else if (l.type === "relates_to")
        rel.relates.push(orderOfUuid(orderByUuid, l.sourceId === t.id ? l.targetId : l.sourceId));
    }
    const epicOrder = t.epicId ? orderByUuid.get(t.epicId) : undefined;
    const desc = descFromApi(t.description ?? null);
    return {
      id: t.order,
      uuid: t.id,
      rel,
      t: t.title,
      s: STATUS_SHORT_BY_ID.get(t.statusId) ?? "todo",
      a: t.assigneeId ?? "",
      p: PRIO_MAP[t.priority] ?? "p3",
      ty: parent !== undefined ? ("subtask" as TypeId) : tyShort,
      lb: t.labels.map((l) => l.name),
      due: dueFmt(t.dueDate),
      dueIso: t.dueDate ?? undefined,
      desc,
      ...(parent !== undefined ? { parent } : {}),
      ...(epicOrder !== undefined && !parent && tyShort !== "epic" ? { epic: epicOrder } : {}),
      ...(t.iterationId && parent === undefined && tyShort !== "epic" ? { sp: t.iterationId } : {}),
    } as TaskRow;
  });

  // epic meta from the epic rows themselves (goal lives in the description)
  for (const k of Object.keys(EPIC_META).map(Number)) delete EPIC_META[k];
  const EPIC_COLORS = ["v", "g", "b", "o", "m", "r"];
  epicOrders.sort((a, b) => a - b);
  epicOrders.forEach((order, i) => {
    const row = TASKS.find((t) => t.id === order);
    if (!row) return;
    EPIC_UUID_BY_ORDER.set(order, UUID_BY_ORDER.get(order) ?? "");
    EPIC_META[order] = {
      own: row.a,
      c: EPIC_COLORS[i % EPIC_COLORS.length] ?? "v",
      goal:
        typeof row.desc?.content?.[0]?.content?.[0]?.text === "string"
          ? row.desc.content[0].content[0].text
          : "",
    };
  });
  EPIC_IDS.length = 0;
  EPIC_IDS.push(
    ...Object.keys(EPIC_META)
      .map(Number)
      .sort((a, b) => a - b),
  );

  // sprints from iterations (keys are iteration uuids from here on)
  for (const k of Object.keys(SPRINTS)) delete SPRINTS[k];
  const iters = [...(extras.iterations ?? [])].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
  for (const it of iters) {
    SPRINTS[it.id] = {
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

  // milestones from the planning API (risk derived like the reports rule)
  MILESTONES.length = 0;
  for (const m of extras.milestones ?? []) {
    const risk =
      m.status === "reached"
        ? ("on_track" as const)
        : m.dueDate && Date.now() - +new Date(m.dueDate) <= 14 * 864e5 && m.progress < 90
          ? ("at_risk" as const)
          : ("on_track" as const);
    MILESTONES.push({
      id: m.id,
      t: m.name,
      date: (m.dueDate ?? "").slice(0, 10),
      risk,
      done: m.doneTasks,
      total: m.totalTasks,
    });
  }
  MILESTONES.sort((a, b) => pD(a.date).getTime() - pD(b.date).getTime());

  // velocity from iterations
  VELOCITY.length = 0;
  for (const it of iters.slice(-5)) {
    VELOCITY.push({
      name: it.name.replace("Sprint ", "S"),
      committed: it.committedPoints,
      completed: it.completedPoints,
    });
  }

  notify();
}

/* ---- read helpers ---- */
export const taskById = (id: number): TaskRow | undefined => TASKS.find((t) => t.id === id);
export const subsOf = (id: number): TaskRow[] =>
  TASKS.filter((t) => t.parent === id).sort((a, b) => a.id - b.id);
export const childrenOf = (id: number): TaskRow[] =>
  TASKS.filter((t) => t.epic === id && t.ty !== "subtask");
export const isWork = (t: TaskRow): boolean => !t.parent && t.ty !== "epic";
export const allTasks = (): TaskRow[] => TASKS;
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

/* ---- subscription ---- */
let version = 0;
const listeners = new Set<() => void>();
function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function getSnapshot(): number {
  return version;
}
export function useTasksVersion(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
function notify(): void {
  version++;
  listeners.forEach((l) => l());
}

/* ---- mutators ---- */
export function setField<K extends keyof TaskRow>(id: number, key: K, value: TaskRow[K]): void {
  const t = taskById(id);
  if (t) {
    t[key] = value;
    // write-through: translate the store field to its API patch
    if (key === "s") wtPatch(id, { statusId: STATUS_ID_BY_SHORT.get(value as StatusId) });
    else if (key === "a")
      wtPatch(id, { assigneeId: value ? resolveUserUuid(String(value)) : null });
    else if (key === "p") wtPatch(id, { priority: PRIO_API[value as PrioId] });
    else if (key === "pts") wtPatch(id, { estimate: Number(value) || null });
    else if (key === "sp") wtPatch(id, { iterationId: value ? String(value) : null });
    else if (key === "epic")
      wtPatch(id, {
        epicId: value != null ? (EPIC_UUID_BY_ORDER.get(Number(value)) ?? null) : null,
      });
    else if (key === "t") wtPatch(id, { title: String(value) });
    else if (key === "due") {
      const iso = dueToIso(String(value));
      t.dueIso = iso ?? undefined;
      wtPatch(id, iso ? { dueDate: iso } : { dueDate: null });
    } else if (key === "desc") wtPatch(id, { description: JSON.stringify(value) });
    notify();
  }
}
export function toggleAc(id: number, i: number): void {
  const t = taskById(id);
  if (t?.ac?.[i]) {
    t.ac[i].done = !t.ac[i].done;
    notify();
  }
}
export function toggleSubDone(id: number): void {
  const t = taskById(id);
  if (t) {
    t.s = t.s === "done" ? "todo" : "done";
    wtPatch(id, { statusId: STATUS_ID_BY_SHORT.get(t.s) });
    notify();
  }
}
export function addSubtask(parentId: number): number {
  const parent = taskById(parentId);
  const nextId = Math.max(300, ...allTasks().map((t) => t.id)) + 1;
  TASKS.push({
    id: nextId,
    t: "New subtask",
    s: "todo",
    a: parent?.a ?? "ay",
    p: "p3",
    ty: "subtask",
    parent: parentId,
    lb: [],
    due: parent?.due ?? "Apr 05",
    pts: 1,
    com: [],
  });
  if (API_PROJECT === "api" && ACTIVE_PID) {
    const parentUuid = UUID_BY_ORDER.get(parentId);
    if (parentUuid) {
      void api
        .createTask(ACTIVE_PID, {
          title: "New subtask",
          parentId: parentUuid,
          statusId: STATUS_ID_BY_SHORT.get("todo"),
        })
        .then((created) => {
          const row = taskById(nextId);
          if (row) {
            row.uuid = created.id;
            UUID_BY_ORDER.set(created.order, created.id);
          }
        })
        .catch(() => {});
    }
  }
  notify();
  return nextId;
}
export function addComment(id: number, text: string): void {
  const t = taskById(id);
  if (t) {
    t.com = t.com ?? [];
    t.com.push({ by: CURRENT_USER || "ay", when: "just now", text });
    const uuid = UUID_BY_ORDER.get(id);
    if (API_PROJECT === "api" && ACTIVE_PID && uuid) {
      void api.addComment(ACTIVE_PID, uuid, text).catch(() => {});
    }
    notify();
  }
}
/** Link two issues. Writes `key` on `taskId` and the reverse on `otherId` (bidirectional). */
export function addRelationship(taskId: number, key: RelKey, otherId: number): void {
  if (taskId === otherId) return;
  const t = taskById(taskId);
  const o = taskById(otherId);
  if (!t || !o) return;
  void apiMirror("add", taskId, key, otherId);
  t.rel = t.rel ?? { blocks: [], blockedBy: [], relates: [] };
  if (!t.rel[key]!.includes(otherId)) t.rel[key]!.push(otherId);
  const rev = REL_REVERSE[key];
  o.rel = o.rel ?? { blocks: [], blockedBy: [], relates: [] };
  if (!o.rel[rev]!.includes(taskId)) o.rel[rev]!.push(taskId);
  notify();
}
/** Remove a link (and its reverse on the other issue). */
export function removeRelationship(taskId: number, key: RelKey, otherId: number): void {
  void apiMirror("remove", taskId, key, otherId);
  const t = taskById(taskId);
  const o = taskById(otherId);
  if (t?.rel) t.rel[key] = (t.rel[key] || []).filter((x) => x !== otherId);
  if (o?.rel) {
    const rev = REL_REVERSE[key];
    o.rel[rev] = (o.rel[rev] || []).filter((x) => x !== taskId);
  }
  notify();
}
export interface CreateInput {
  ty: TypeId;
  title: string;
  desc?: string;
  assignee: string;
  priority: PrioId;
  sp?: string | null;
  epic?: number | null;
  parent?: number | null;
  pts: number;
  due: string;
  labels: string[];
}
export function createIssue(input: CreateInput): number {
  const nextId = Math.max(...allTasks().map((t) => t.id)) + 1;
  const o: TaskRow = {
    id: nextId,
    t: input.title,
    s: input.ty === "epic" ? "progress" : "todo",
    a: input.assignee,
    p: input.priority,
    ty: input.ty,
    lb: input.labels,
    due: input.due,
    pts: input.pts,
    com: [],
    att: [],
    ac: [],
  };
  if (input.desc)
    o.desc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: input.desc }] }],
    };
  if (input.ty === "subtask") {
    if (input.parent) o.parent = input.parent;
  } else {
    o.rep = "ay";
    o.sp = input.sp ?? null;
    if (input.epic) o.epic = input.epic;
  }
  if (input.ty === "epic") EPIC_META[nextId] = { own: input.assignee, c: "o", goal: "" };
  TASKS.unshift(o);
  if (API_PROJECT === "api" && ACTIVE_PID) {
    const body: Record<string, unknown> = {
      title: input.title,
      statusId: STATUS_ID_BY_SHORT.get(o.s),
      priority: PRIO_API[input.priority],
      assigneeId: input.assignee ? resolveUserUuid(input.assignee) : null,
      estimate: input.pts || null,
      ...(input.ty !== "subtask" ? { typeId: TYPE_ID_BY_TY.get(input.ty) } : {}),
      ...(input.ty === "subtask" && input.parent != null
        ? { parentId: UUID_BY_ORDER.get(input.parent) ?? null }
        : {}),
      ...(input.sp ? { iterationId: input.sp } : {}),
      ...(input.epic && input.ty !== "subtask"
        ? { epicId: EPIC_UUID_BY_ORDER.get(input.epic) ?? null }
        : {}),
      ...(input.due && dueToIso(input.due) ? { dueDate: dueToIso(input.due) } : {}),
      ...(input.desc ? { description: JSON.stringify(o.desc) } : {}),
      ...(input.labels.length
        ? {
            labelIds: input.labels
              .map((l) => LABEL_ID_BY_NAME.get(l))
              .filter((x): x is string => !!x),
          }
        : {}),
    };
    void api
      .createTask(ACTIVE_PID, body as never)
      .then((created) => {
        o.uuid = created.id;
        UUID_BY_ORDER.set(created.order, created.id);
        if (input.ty === "epic") EPIC_UUID_BY_ORDER.set(nextId, created.id);
        notify();
      })
      .catch(() => {});
  }
  notify();
  return nextId;
}
export function bulkSetStatus(ids: number[], s: StatusId): void {
  ids.forEach((id) => {
    const t = taskById(id);
    if (t && t.ty !== "epic") t.s = s;
    wtPatch(id, { statusId: STATUS_ID_BY_SHORT.get(s) });
  });
  notify();
}
export function bulkSetAssignee(ids: number[], whoId: string): void {
  ids.forEach((id) => {
    const t = taskById(id);
    if (t && t.ty !== "epic") t.a = whoId;
    wtPatch(id, { assigneeId: whoId ? resolveUserUuid(whoId) : null });
  });
  notify();
}
export function bulkDelete(ids: number[]): void {
  TASKS = TASKS.filter((t) => !ids.includes(t.id));
  if (API_PROJECT === "api" && ACTIVE_PID) {
    for (const id of ids) {
      const uuid = UUID_BY_ORDER.get(id);
      if (uuid) void api.deleteTask(ACTIVE_PID, uuid).catch(() => {});
    }
  }
  notify();
}

/* ---- Sprint lifecycle mutators (Planning) ---- */
/** Fire-and-forget iteration patch (optimistic). */
function wtIter(sp: string, patch: Record<string, unknown>): void {
  if (API_PROJECT !== "api" || !ACTIVE_PID) return;
  void api.updateIteration(ACTIVE_PID, sp, patch as never).catch(() => {});
}

export function startIter(sp: string): void {
  const cur = Object.keys(SPRINTS).find((k) => SPRINTS[k].st === "active");
  if (cur && cur !== sp) completeIter(cur, true);
  SPRINTS[sp].st = "active";
  wtIter(sp, { status: "active" });
  notify();
}
export function completeIter(sp: string, silent = false): string {
  const s = SPRINTS[sp];
  const c = iterTasks(sp);
  const committed = ptsTotal(c);
  const done = ptsTotal(c.filter((t) => t.s === "done"));
  s.st = "completed";
  s.committed = committed;
  s.completed = done;
  c.forEach((t) => {
    if (t.s !== "done") {
      t.sp = undefined;
      wtPatch(t.id, { iterationId: null });
    }
  });
  wtIter(sp, { status: "completed", committedPoints: committed, completedPoints: done });
  notify();
  return silent ? "" : s.name + " completed · leftover returned to backlog";
}
export function revertToPlanned(sp: string): void {
  const s = SPRINTS[sp];
  if (!s || s.st !== "active") return;
  s.st = "planned";
  wtIter(sp, { status: "planned" }); // API may refuse (one-way machine) — local stands
  notify();
}
export function reopenToActive(sp: string): string {
  const s = SPRINTS[sp];
  if (!s || s.st !== "completed") return "";
  const cur = Object.keys(SPRINTS).find((k) => SPRINTS[k].st === "active");
  let note = "";
  if (cur && cur !== sp) {
    SPRINTS[cur].st = "planned";
    note = " (" + SPRINTS[cur].name + " moved to Planned)";
  }
  s.st = "active";
  if ("committed" in s) delete s.committed;
  if ("completed" in s) delete s.completed;
  wtIter(sp, { status: "active" }); // API may refuse — local stands
  notify();
  return s.name + " reopened · Active" + note;
}
export function commitToSprint(id: number, sp: string): void {
  if (!isPlannable(sp)) return;
  const t = taskById(id);
  if (t) {
    t.sp = sp;
    wtPatch(id, { iterationId: sp });
    notify();
  }
}
export function uncommitFromSprint(id: number): void {
  const t = taskById(id);
  if (t) {
    t.sp = undefined;
    wtPatch(id, { iterationId: null });
    notify();
  }
}
export function planSprintAuto(sp: string): string {
  if (!isPlannable(sp)) return "";
  const cap = SPRINTS[sp].capacity || 40;
  let pts = committedPts(sp);
  let n = 0;
  const items = TASKS.filter((t) => !t.parent && t.ty !== "epic" && !t.sp).sort(
    (a, b) => PRIO_ORDER.indexOf(a.p) - PRIO_ORDER.indexOf(b.p),
  );
  for (const t of items) {
    if (pts + (t.pts || 0) > cap) break;
    t.sp = sp;
    pts += t.pts || 0;
    n++;
  }
  notify();
  return n
    ? `Planned ${n} item${n !== 1 ? "s" : ""} into ${SPRINTS[sp].name}`
    : "Nothing to plan — backlog empty or capacity reached";
}
export function moveSprintDates(sp: string, fromISO: string, toISO: string): void {
  const s = SPRINTS[sp];
  s.from = fromISO;
  s.to = toISO;
  s.start = shortMD(pD(fromISO));
  s.end = shortMD(pD(toISO));
  wtIter(sp, { startDate: fromISO, endDate: toISO });
  notify();
}
export interface CreateSprintInput {
  name: string;
  goal: string;
  fromISO: string;
  toISO: string;
  capacity: number | null;
}
export function createSprint(input: CreateSprintInput): string {
  const id = crypto.randomUUID();
  if (API_PROJECT === "api" && ACTIVE_PID) {
    void api
      .createIteration(ACTIVE_PID, {
        name: input.name,
        goal: input.goal || undefined,
        startDate: input.fromISO,
        endDate: input.toISO,
      })
      .catch(() => {});
  }
  SPRINTS[id] = {
    id,
    name: input.name,
    goal: input.goal || "No goal set",
    start: shortMD(pD(input.fromISO)),
    end: shortMD(pD(input.toISO)),
    from: input.fromISO,
    to: input.toISO,
    st: "planned",
    capacity: input.capacity,
  };
  notify();
  return id;
}

/** Edit an existing sprint's name/goal/dates/capacity (details modal). */
export function updateSprint(sp: string, input: CreateSprintInput): void {
  const s = SPRINTS[sp];
  if (!s) return;
  s.name = input.name;
  s.goal = input.goal || "No goal set";
  s.from = input.fromISO;
  s.to = input.toISO;
  s.start = shortMD(pD(input.fromISO));
  s.end = shortMD(pD(input.toISO));
  s.capacity = input.capacity;
  wtIter(sp, {
    name: input.name,
    goal: input.goal || null,
    startDate: input.fromISO,
    endDate: input.toISO,
  });
  notify();
}

/* ---- Milestone mutators (Planning timeline) ---- */
export interface MilestoneInput {
  t: string;
  date: string;
  risk: "on_track" | "at_risk";
}
export function addMilestone(input: MilestoneInput): string {
  const id = crypto.randomUUID();
  MILESTONES.push({ id, t: input.t, date: input.date, risk: input.risk, done: 0, total: 0 });
  MILESTONES.sort((a, b) => pD(a.date).getTime() - pD(b.date).getTime());
  if (API_PROJECT === "api" && ACTIVE_PID) {
    void api.createMilestone(ACTIVE_PID, { name: input.t, dueDate: input.date }).catch(() => {});
  }
  notify();
  return id;
}
export function updateMilestone(id: string, input: MilestoneInput): void {
  const m = MILESTONES.find((x) => x.id === id);
  if (!m) return;
  m.t = input.t;
  m.date = input.date;
  m.risk = input.risk; // risk itself is display-only (derived) until the API grows a column
  MILESTONES.sort((a, b) => pD(a.date).getTime() - pD(b.date).getTime());
  if (API_PROJECT === "api" && ACTIVE_PID && !id.startsWith("ms")) {
    void api
      .updateMilestone(ACTIVE_PID, id, { name: input.t, dueDate: input.date })
      .catch(() => {});
  }
  notify();
}
export function deleteMilestone(id: string): void {
  const i = MILESTONES.findIndex((x) => x.id === id);
  if (i >= 0) {
    MILESTONES.splice(i, 1);
    if (API_PROJECT === "api" && ACTIVE_PID && !id.startsWith("ms")) {
      void api.deleteMilestone(ACTIVE_PID, id).catch(() => {});
    }
    notify();
  }
}

/** Mirror a relationship mutation to the API (hydrated projects only). */
const API_TYPE: Record<RelKey, "blocks" | "blocked_by" | "relates_to"> = {
  blocks: "blocks",
  blockedBy: "blocked_by",
  relates: "relates_to",
};
async function apiMirror(
  action: "add" | "remove",
  taskId: number,
  key: RelKey,
  otherId: number,
): Promise<void> {
  if (API_PROJECT !== "api") return;
  const pid = ACTIVE_PID;
  const taskUuid = UUID_BY_ORDER.get(taskId);
  const otherUuid = UUID_BY_ORDER.get(otherId);
  if (!pid || !taskUuid || !otherUuid) return;
  try {
    if (action === "add") {
      await api.addTaskLink(pid, taskUuid, { targetId: otherUuid, type: API_TYPE[key] });
    } else {
      // find the link row touching the pair, then delete it
      const page = await api.tasks(pid, {});
      const me = page.items.find((x) => x.id === taskUuid);
      const link = (me?.links ?? []).find(
        (l) =>
          (l.sourceId === taskUuid && l.targetId === otherUuid) ||
          (l.sourceId === otherUuid && l.targetId === taskUuid),
      );
      if (link) await api.deleteTaskLink(pid, taskUuid, link.id);
    }
  } catch {
    /* offline-tolerant: the local optimistic state stands */
  }
}
