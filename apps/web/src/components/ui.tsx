/** Shared UI primitives — small presentational helpers reusing the design CSS. */
import type { TaskPriority } from "@pmin/core";
import type { User } from "../api.js";

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AV_COLORS = ["a", "b", "c", "d", "e", "f"];
export function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length]!;
}

export function Avatar({
  user,
  size = "",
  name,
}: {
  user?: Pick<User, "id" | "name">;
  size?: "sm" | "lg" | "";
  name?: string;
}) {
  const label = name ?? user?.name ?? "?";
  const cls = user ? colorFor(user.id) : "b";
  return (
    <span className={`av ${cls} ${size}`}>
      {initials(label)}
    </span>
  );
}

export const PRIORITY_CLASS: Record<TaskPriority, string> = {
  urgent: "p1",
  high: "p2",
  medium: "p3",
  low: "p4",
};
export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function Prio({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`prio ${PRIORITY_CLASS[priority]}`}>
      <span className="bars">
        <i></i>
        <i></i>
        <i></i>
      </span>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

const TYPE_CLASS: Record<string, string> = { Bug: "b", Feature: "v", Epic: "o", Task: "" };
export function TypeTag({ name }: { name: string }) {
  return <span className={`tag ${TYPE_CLASS[name] ?? ""}`}>{name}</span>;
}

/** Status pill keyed by status name → design status classes. */
const STATUS_CLASS: Record<string, string> = {
  Backlog: "neutral",
  "To Do": "neutral",
  "In Progress": "info",
  "In Review": "violet",
  Done: "ok",
};
export function StatusPill({ name }: { name: string }) {
  return (
    <span className={`status ${STATUS_CLASS[name] ?? "neutral"}`}>
      <span className="d"></span>
      {name}
    </span>
  );
}

/** Human "time ago" from an ISO string. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

/** Format an ISO date (yyyy-mm-dd or full) as "Mar 24". */
export function dueLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

/** Active project key, synced by AppProvider on each render. Module-level so
 *  plain helpers and event handlers can read it without hook plumbing. */
let activeProjectKey = "ATL";
export const setActiveProjectKey = (key: string) => {
  activeProjectKey = key;
};
export const projKey = () => activeProjectKey;

/** Display serial — `<KEY>-NNN` (active project key + task id/order). */
export function taskSerial(id: number | string): string {
  return `${activeProjectKey}-${id}`;
}
