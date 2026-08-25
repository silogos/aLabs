/** Badges — priority bars, type tags, and status pills keyed on the
 *  @pmin/core vocabulary (API enum/status names), reusing the design CSS. */
import type { TaskPriority } from "@pmin/core";

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
