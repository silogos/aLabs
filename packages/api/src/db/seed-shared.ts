/** Shared context for the demo seed halves (seed-tasks/-planning/-docs/
 *  -collab) — user/project handles, the relative demo calendar, and the
 *  Atlas task config (statuses/types/labels) resolved once up front. */
import type { TaskStatus, TaskType, User } from "@pmin/core";
import type { ProjectWithMeta } from "./project-repo";

/** The demo calendar — the design's "today" is Mar 22; offsets apply from
 *  runtime-today so the board never looks stale. */
export function makeCalendar() {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const TODAY = startOfDay(new Date());
  const dayIso = (offset: number) =>
    new Date(TODAY.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
  const OFFSET: Record<string, number> = {
    "Mar 18": -4, "Mar 19": -3, "Mar 20": -2, "Mar 21": -1, "Mar 22": 0,
    "Mar 23": 1, "Mar 24": 2, "Mar 25": 3, "Mar 26": 4, "Mar 27": 5,
    "Mar 28": 6, "Mar 29": 7, "Apr 01": 10, "Apr 02": 11,
    "Apr 10": 19, "Apr 12": 21, "Apr 15": 24, "Apr 16": 25,
    "Apr 18": 27, "Apr 20": 29, "Apr 25": 34, "Apr 28": 37,
  };
  const dueIso = (label: string) => (OFFSET[label] !== undefined ? dayIso(OFFSET[label]!) : null);
  return { dayIso, dueIso };
}

/** Atlas board columns (the design uses 5 — richer than the 3 defaults). */
export const STATUS_DEFS: Array<{ name: string; order: number; color: string; isDefault: boolean }> = [
  { name: "Backlog", order: 0, color: "var(--faint)", isDefault: false },
  { name: "To Do", order: 1, color: "var(--muted)", isDefault: true },
  { name: "In Progress", order: 2, color: "var(--info)", isDefault: false },
  { name: "In Review", order: 3, color: "var(--violet)", isDefault: false },
  { name: "Done", order: 4, color: "var(--ok)", isDefault: false },
];

export type DemoShort = "ay" | "mk" | "lc" | "dp" | "sr" | "jb";

export interface SeedCtx {
  atlas: ProjectWithMeta;
  /** every seeded project, keyed by key for the side-project seeds */
  projectByKey(key: string): ProjectWithMeta;
  usersByShort: Record<DemoShort, User>;
  aisha: User;
  /** tasks already existed (seed halves guard their writes on this) */
  pgSeeded: boolean;
  dayIso(offset: number): string;
  dueIso(label: string): string | null;
  statusByShort: Record<"backlog" | "todo" | "progress" | "review" | "done", TaskStatus>;
  statusByName(name: string): TaskStatus;
  typeByShort: Record<"task" | "bug" | "feat" | "epic", TaskType>;
  labelIdByName(name: string): string;
}
