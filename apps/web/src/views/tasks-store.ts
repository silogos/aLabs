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

export const who = (id: string | undefined): string => (id && P[id] ? P[id].name : "Unassigned");

export const TY: Record<TypeId, { l: string; c: string; ic: string }> = {
  epic: { l: "Epic", c: "v", ic: '<path d="M12 3 21 12 12 21 3 12Z"/><path d="M12 9v6"/>' },
  story: { l: "Story", c: "g", ic: '<path d="M6 4h8l5 5v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M14 4v5h5"/>' },
  task: { l: "Task", c: "b", ic: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>' },
  bug: { l: "Bug", c: "r", ic: '<path d="M7 12a5 5 0 0 1 10 0v3a5 5 0 0 1-10 0Z"/><path d="M12 7V4M9 5 7.5 3.5M15 5l1.5-1.5M5 11h2M17 11h2M5.5 16 7 15.5M18.5 16 17 15.5"/>' },
  subtask: { l: "Subtask", c: "m", ic: '<rect x="5" y="9" width="13" height="10" rx="1.5"/><path d="M9 9V7a2 2 0 0 1 2-2h6"/><path d="m9 13 1.3 1.3L13 11.5"/>' },
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
  s13: { id: "s13", name: "Sprint 13", goal: "Auth foundations + billing scaffold — MFA enrollment, password rate-limiting, and the billing-webhook path stubbed.", start: "Mar 03", end: "Mar 16", from: "2025-03-03", to: "2025-03-16", st: "completed", committed: 48, completed: 45 },
  s14: { id: "s14", name: "Sprint 14", goal: "Ship OAuth2 SSO behind a feature flag and land the immutable audit-log store. Client-portal scaffolding visible but read-only.", start: "Mar 17", end: "Mar 31", from: "2025-03-17", to: "2025-03-31", st: "active", capacity: 52 },
  s15: { id: "s15", name: "Sprint 15", goal: "Client portal read-only views + reporting export to PDF/CSV.", start: "Apr 01", end: "Apr 14", from: "2025-04-01", to: "2025-04-14", st: "planned", capacity: 48 },
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
export const VELOCITY = [
  { name: "S9", committed: 38, completed: 34 },
  { name: "S10", committed: 42, completed: 40 },
  { name: "S11", committed: 44, completed: 41 },
  { name: "S12", committed: 46, completed: 44 },
  { name: "S13", committed: 48, completed: 45 },
];

/* ---- Planning helpers ---- */
export const NOW_D = new Date("2025-03-24T00:00:00");
export const pD = (s: string): Date => new Date(s + "T00:00:00");
export function shortMD(d: Date | string): string {
  return (d instanceof Date ? d : pD(d)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function daysBetween(a: string, b: string): number {
  return Math.round((pD(b).getTime() - pD(a).getTime()) / 86400000);
}
export function fmtISO(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
export const spStatusClass = (st: SprintStatus): string => ({ planned: "neutral", active: "info", completed: "ok" }[st] || "neutral");
export const sprintStatusLabel = (sp: string): string => ({ planned: "Planned", active: "Active", completed: "Completed" }[SPRINTS[sp].st]);
export const iterTasks = (sp: string): TaskRow[] => TASKS.filter((t) => !t.parent && t.ty !== "epic" && t.sp === sp);
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
  return [...Object.keys(SPRINTS).map((k) => ({ k, total: iterTasks(k).length })), { k: "backlog", total: TASKS.filter((t) => !t.parent && t.ty !== "epic" && !t.sp).length }];
}
export const isPlannable = (sp: string): boolean => {
  const s = SPRINTS[sp];
  return !!s && (s.st === "planned" || s.st === "active");
};

export const EPIC_META: Record<number, { own: string; c: string; goal: string }> = {
  200: { own: "mk", c: "v", goal: "SSO, MFA, RBAC and an immutable audit trail for org-wide security." },
  201: { own: "lc", c: "g", goal: "Subscription billing, invoicing and payment webhook resilience." },
  202: { own: "dp", c: "b", goal: "Trigram document search, dashboards and exportable reports." },
  203: { own: "jb", c: "o", goal: "Design-system migration, docs, notifications and platform infra." },
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
const REL_REVERSE: Record<RelKey, RelKey> = { blocks: "blockedBy", blockedBy: "blocks", relates: "relates" };

export interface TaskRow {
  id: number;
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
  pts: number;
  ac?: AcItem[];
  rel?: Relations;
  com?: Cmt[];
  att?: Att[];
  desc?: Content;
}

let TASKS: TaskRow[] = [
  /* ----- Executable issues (101-120) ----- */
  { id: 101, t: "Implement OAuth2 SSO flow", s: "progress", a: "mk", rep: "ay", p: "p2", ty: "story", epic: 200, sp: "s14", lb: ["sso", "security"], due: "Mar 24", pts: 8, ac: [{ text: "Spec out scopes & claims", done: true }, { text: "Authorization-code + PKCE", done: true }, { text: "Token refresh rotation", done: false }, { text: "IdP sandbox sign-off", done: false }], rel: { blocks: [], blockedBy: [105], relates: [] }, com: [{ by: "mk", when: "2h ago", text: "Blocked on the IdP sandbox credentials — chasing Ops. PKCE verifier is done." }, { by: "sr", when: "yesterday", text: "Added a regression test for expired refresh tokens. Clean on staging." }], att: [{ n: "oauth-sequence.png", sz: "240 KB", by: "mk" }] },
  { id: 102, t: "Board drag-and-drop performance", s: "progress", a: "lc", rep: "lc", p: "p3", ty: "task", epic: 203, sp: "s14", lb: ["frontend"], due: "Mar 23", pts: 5, ac: [{ text: "Profile with 500 cards", done: true }, { text: "Virtualize off-screen columns", done: false }], com: [], att: [] },
  { id: 103, t: "Fix flaky CI test on billing webhook", s: "review", a: "dp", rep: "mk", p: "p1", ty: "bug", epic: 201, sp: "s14", lb: ["ci", "billing"], due: "Mar 22", pts: 3, ac: [{ text: "Reproduce reliably", done: true }, { text: "Stabilise test fixtures", done: false }], com: [{ by: "dp", when: "5h ago", text: "Root cause: clock skew between workers. Freezing the clock in the harness." }], att: [] },
  { id: 104, t: "Design system: migrate tokens to OKLch", s: "todo", a: "jb", rep: "jb", p: "p3", ty: "task", epic: 203, sp: "s14", lb: ["design"], due: "Mar 26", pts: 5, ac: [{ text: "Audit hex usages", done: false }], com: [], att: [] },
  { id: 105, t: "Audit log: immutable event store", s: "todo", a: "mk", rep: "ay", p: "p2", ty: "story", epic: 200, sp: "s14", lb: ["security", "backend"], due: "Mar 28", pts: 8, ac: [{ text: "Append-only table design", done: false }, { text: "PII redaction rules", done: false }], rel: { blocks: [101], blockedBy: [], relates: [] }, com: [], att: [] },
  { id: 106, t: "Dashboard KPI sparkline component", s: "todo", a: "lc", rep: "ay", p: "p4", ty: "task", epic: 202, lb: ["frontend"], due: "Mar 27", pts: 3, ac: [], com: [], att: [] },
  { id: 107, t: "Role-based access at project level", s: "progress", a: "mk", rep: "ay", p: "p2", ty: "story", epic: 200, sp: "s14", lb: ["security"], due: "Apr 02", pts: 8, ac: [{ text: "Permission matrix", done: true }, { text: "Middleware guards", done: true }, { text: "UI for role assignment", done: false }], rel: { blocks: [], blockedBy: [], relates: [] }, com: [], att: [] },
  { id: 108, t: "Search index for documents (PG trigram)", s: "review", a: "dp", rep: "dp", p: "p3", ty: "story", epic: 202, sp: "s14", lb: ["search", "backend"], due: "Mar 25", pts: 5, ac: [{ text: "pg_trgm migration", done: true }, { text: "Reindex job", done: false }], rel: { blocks: [], blockedBy: [], relates: [117] }, com: [], att: [] },
  { id: 109, t: "Iteration planning: velocity chart", s: "todo", a: "lc", rep: "ay", p: "p3", ty: "story", epic: 202, lb: ["planning"], due: "Mar 29", pts: 3, ac: [], rel: { blocks: [], blockedBy: [116], relates: [] }, com: [], att: [] },
  { id: 117, t: "API: pagination contract (cursor)", s: "review", a: "dp", rep: "mk", p: "p2", ty: "task", epic: 203, sp: "s14", lb: ["api", "backend"], due: "Mar 24", pts: 3, ac: [], rel: { blocks: [], blockedBy: [], relates: [108] }, com: [], att: [] },
  { id: 116, t: "Backlog grooming: triage queue", s: "todo", a: "ay", rep: "ay", p: "p3", ty: "task", epic: 203, lb: ["process"], due: "Mar 22", pts: 2, ac: [], rel: { blocks: [109], blockedBy: [], relates: [] }, com: [], att: [] },
  { id: 118, t: "Notification digest: daily email", s: "todo", a: "lc", rep: "ay", p: "p4", ty: "story", epic: 203, lb: ["notifications"], due: "Apr 01", pts: 3, ac: [], rel: { blocks: [], blockedBy: [], relates: [113] }, com: [], att: [] },
  { id: 112, t: "Reset password rate limiting", s: "done", a: "sr", rep: "mk", p: "p1", ty: "bug", epic: 200, sp: "s13", lb: ["security", "auth"], due: "Mar 14", pts: 3, ac: [{ text: "Add sliding window", done: true }], rel: { blocks: [], blockedBy: [], relates: [] }, com: [], att: [] },
  { id: 113, t: "Meeting notes: attach tasks", s: "done", a: "lc", rep: "ay", p: "p4", ty: "task", epic: 203, sp: "s13", lb: ["meetings"], due: "Mar 12", pts: 2, ac: [], rel: { blocks: [], blockedBy: [], relates: [118] }, com: [], att: [] },
  { id: 114, t: "MFA: TOTP enrollment UX", s: "done", a: "sr", rep: "ay", p: "p2", ty: "story", epic: 200, sp: "s13", lb: ["security", "auth"], due: "Mar 13", pts: 5, ac: [], com: [], att: [] },
  { id: 115, t: "Empty states across modules", s: "done", a: "jb", rep: "jb", p: "p4", ty: "task", epic: 203, sp: "s13", lb: ["design"], due: "Mar 16", pts: 2, ac: [], com: [], att: [] },
  { id: 119, t: "Write release notes for v2.0", s: "todo", a: "ay", rep: "ay", p: "p3", ty: "task", epic: 203, lb: ["docs"], due: "Mar 27", pts: 2, ac: [], com: [], att: [] },
  { id: 120, t: "Stakeholder demo prep", s: "todo", a: "ay", rep: "mk", p: "p2", ty: "task", epic: 203, lb: ["process"], due: "Mar 25", pts: 2, ac: [], com: [], att: [] },
  /* ----- Epics ----- */
  { id: 200, t: "Identity & Access", s: "progress", a: "mk", p: "p1", ty: "epic", lb: ["security"], due: "Apr 30", pts: 0 },
  { id: 201, t: "Billing & Payments", s: "todo", a: "lc", p: "p2", ty: "epic", lb: ["billing"], due: "May 14", pts: 0 },
  { id: 202, t: "Search & Reporting", s: "progress", a: "dp", p: "p2", ty: "epic", lb: ["search"], due: "Apr 18", pts: 0 },
  { id: 203, t: "Platform Foundation", s: "progress", a: "jb", p: "p3", ty: "epic", lb: ["platform"], due: "Apr 05", pts: 0 },
  /* ----- Subtasks ----- */
  { id: 301, t: "Spec out scopes & claims", s: "done", a: "mk", p: "p3", ty: "subtask", parent: 101, lb: [], due: "Mar 20", pts: 1, com: [] },
  { id: 302, t: "Wire authorization-code grant", s: "progress", a: "mk", p: "p2", ty: "subtask", parent: 101, lb: [], due: "Mar 23", pts: 3, com: [] },
  { id: 303, t: "Token refresh rotation", s: "todo", a: "sr", p: "p3", ty: "subtask", parent: 101, lb: [], due: "Mar 25", pts: 2, com: [] },
  { id: 304, t: "Profile with 500 cards", s: "done", a: "lc", p: "p3", ty: "subtask", parent: 102, lb: [], due: "Mar 19", pts: 1, com: [] },
  { id: 305, t: "Virtualize off-screen columns", s: "todo", a: "lc", p: "p3", ty: "subtask", parent: 102, lb: [], due: "Mar 24", pts: 2, com: [] },
  { id: 306, t: "Permission matrix doc", s: "done", a: "mk", p: "p2", ty: "subtask", parent: 107, lb: [], due: "Mar 18", pts: 2, com: [] },
  { id: 307, t: "Middleware guards", s: "progress", a: "mk", p: "p2", ty: "subtask", parent: 107, lb: [], due: "Mar 27", pts: 3, com: [] },
  { id: 308, t: "UI for role assignment", s: "todo", a: "jb", p: "p3", ty: "subtask", parent: 107, lb: [], due: "Apr 01", pts: 3, com: [] },
  { id: 309, t: "Stabilise test fixtures", s: "progress", a: "dp", p: "p1", ty: "subtask", parent: 103, lb: [], due: "Mar 23", pts: 2, com: [] },
  { id: 310, t: "pg_trgm migration", s: "done", a: "dp", p: "p3", ty: "subtask", parent: 108, lb: [], due: "Mar 20", pts: 2, com: [] },
];

/* ---- read helpers ---- */
export const taskById = (id: number): TaskRow | undefined => TASKS.find((t) => t.id === id);
export const subsOf = (id: number): TaskRow[] => TASKS.filter((t) => t.parent === id).sort((a, b) => a.id - b.id);
export const childrenOf = (id: number): TaskRow[] => TASKS.filter((t) => t.epic === id && t.ty !== "subtask");
export const isWork = (t: TaskRow): boolean => !t.parent && t.ty !== "epic";
export const allTasks = (): TaskRow[] => TASKS;
export const late = (t: TaskRow): boolean => t.s !== "done" && t.due === "Mar 22";
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
  notify();
  return nextId;
}
export function addComment(id: number, text: string): void {
  const t = taskById(id);
  if (t) {
    t.com = t.com ?? [];
    t.com.push({ by: "ay", when: "just now", text });
    notify();
  }
}
/** Link two issues. Writes `key` on `taskId` and the reverse on `otherId` (bidirectional). */
export function addRelationship(taskId: number, key: RelKey, otherId: number): void {
  if (taskId === otherId) return;
  const t = taskById(taskId);
  const o = taskById(otherId);
  if (!t || !o) return;
  t.rel = t.rel ?? { blocks: [], blockedBy: [], relates: [] };
  if (!t.rel[key]!.includes(otherId)) t.rel[key]!.push(otherId);
  const rev = REL_REVERSE[key];
  o.rel = o.rel ?? { blocks: [], blockedBy: [], relates: [] };
  if (!o.rel[rev]!.includes(taskId)) o.rel[rev]!.push(taskId);
  notify();
}
/** Remove a link (and its reverse on the other issue). */
export function removeRelationship(taskId: number, key: RelKey, otherId: number): void {
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
  if (input.desc) o.desc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: input.desc }] }] };
  if (input.ty === "subtask") {
    if (input.parent) o.parent = input.parent;
  } else {
    o.rep = "ay";
    o.sp = input.sp ?? null;
    if (input.epic) o.epic = input.epic;
  }
  if (input.ty === "epic") EPIC_META[nextId] = { own: input.assignee, c: "o", goal: "" };
  TASKS.unshift(o);
  notify();
  return nextId;
}
export function bulkSetStatus(ids: number[], s: StatusId): void {
  ids.forEach((id) => {
    const t = taskById(id);
    if (t && t.ty !== "epic") t.s = s;
  });
  notify();
}
export function bulkSetAssignee(ids: number[], whoId: string): void {
  ids.forEach((id) => {
    const t = taskById(id);
    if (t && t.ty !== "epic") t.a = whoId;
  });
  notify();
}
export function bulkDelete(ids: number[]): void {
  TASKS = TASKS.filter((t) => !ids.includes(t.id));
  notify();
}

/* ---- Sprint lifecycle mutators (Planning) ---- */
export function startIter(sp: string): void {
  const cur = Object.keys(SPRINTS).find((k) => SPRINTS[k].st === "active");
  if (cur && cur !== sp) completeIter(cur, true);
  SPRINTS[sp].st = "active";
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
    if (t.s !== "done") t.sp = undefined;
  });
  notify();
  return silent ? "" : s.name + " completed · leftover returned to backlog";
}
export function revertToPlanned(sp: string): void {
  const s = SPRINTS[sp];
  if (!s || s.st !== "active") return;
  s.st = "planned";
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
  notify();
  return s.name + " reopened · Active" + note;
}
export function commitToSprint(id: number, sp: string): void {
  if (!isPlannable(sp)) return;
  const t = taskById(id);
  if (t) {
    t.sp = sp;
    notify();
  }
}
export function uncommitFromSprint(id: number): void {
  const t = taskById(id);
  if (t) {
    t.sp = undefined;
    notify();
  }
}
export function planSprintAuto(sp: string): string {
  if (!isPlannable(sp)) return "";
  const cap = SPRINTS[sp].capacity || 40;
  let pts = committedPts(sp);
  let n = 0;
  const items = TASKS.filter((t) => !t.parent && t.ty !== "epic" && !t.sp).sort((a, b) => PRIO_ORDER.indexOf(a.p) - PRIO_ORDER.indexOf(b.p));
  for (const t of items) {
    if (pts + (t.pts || 0) > cap) break;
    t.sp = sp;
    pts += t.pts || 0;
    n++;
  }
  notify();
  return n ? `Planned ${n} item${n !== 1 ? "s" : ""} into ${SPRINTS[sp].name}` : "Nothing to plan — backlog empty or capacity reached";
}
export function moveSprintDates(sp: string, fromISO: string, toISO: string): void {
  const s = SPRINTS[sp];
  s.from = fromISO;
  s.to = toISO;
  s.start = shortMD(pD(fromISO));
  s.end = shortMD(pD(toISO));
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
  const id = "s" + (Math.max(0, ...Object.keys(SPRINTS).map((k) => +k.slice(1))) + 1);
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
  notify();
}

/* ---- Milestone mutators (Planning timeline) ---- */
export interface MilestoneInput {
  t: string;
  date: string;
  risk: "on_track" | "at_risk";
}
export function addMilestone(input: MilestoneInput): string {
  const id = "ms" + (Math.max(0, ...MILESTONES.map((m) => +(m.id.slice(2)) || 0)) + 1);
  MILESTONES.push({ id, t: input.t, date: input.date, risk: input.risk, done: 0, total: 0 });
  MILESTONES.sort((a, b) => pD(a.date).getTime() - pD(b.date).getTime());
  notify();
  return id;
}
export function updateMilestone(id: string, input: MilestoneInput): void {
  const m = MILESTONES.find((x) => x.id === id);
  if (!m) return;
  m.t = input.t;
  m.date = input.date;
  m.risk = input.risk;
  MILESTONES.sort((a, b) => pD(a.date).getTime() - pD(b.date).getTime());
  notify();
}
export function deleteMilestone(id: string): void {
  const i = MILESTONES.findIndex((x) => x.id === id);
  if (i >= 0) {
    MILESTONES.splice(i, 1);
    notify();
  }
}
