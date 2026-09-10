import { describe, expect, it } from "vitest";
import type { Iteration, Milestone, Task, TaskLabel, TaskStatus, TaskType } from "@pmin/core";
import { buildMaps, colsOf, deriveBoard } from "./model";

/** Minimal task_statuses rows shaped like the API's. */
const st = (id: string, name: string, order: number, isDefault = false): TaskStatus => ({
  id,
  projectId: "p1",
  name,
  color: null,
  order,
  isDefault,
});

const THREE_STATUSES = [
  st("s-todo", "To Do", 0, true),
  st("s-prog", "In Progress", 1),
  st("s-done", "Done", 2),
];

const FIVE_STATUSES = [
  st("s-back", "Backlog", 0),
  st("s-todo", "To Do", 1, true),
  st("s-prog", "In Progress", 2),
  st("s-rev", "In Review", 3),
  st("s-done", "Done", 4),
];

const TYPES: TaskType[] = [
  { id: "ty-epic", projectId: "p1", name: "Epic" },
  { id: "ty-task", projectId: "p1", name: "Task" },
];

const LABELS: TaskLabel[] = [];

describe("colsOf", () => {
  it("derives one column per configured status, in order", () => {
    const cols = colsOf(THREE_STATUSES);
    expect(cols.map((c) => c.name)).toEqual(["To Do", "In Progress", "Done"]);
    expect(cols.map((c) => c.id)).toEqual(["s-todo", "s-prog", "s-done"]);
  });

  it("uses the status color when present and a short-id fallback when not", () => {
    const withColor = colsOf([{ ...THREE_STATUSES[0]!, color: "#ff0000" }]);
    expect(withColor[0]!.dot).toBe("#ff0000");
    expect(colsOf(THREE_STATUSES)[0]!.dot).toBe("var(--muted)"); // "To Do" fallback
  });

  it("falls back to a neutral short id for custom status names", () => {
    const cols = colsOf([st("s-x", "Waiting on QA", 0, true)]);
    expect(cols[0]!.name).toBe("Waiting on QA");
    expect(cols[0]!.short).toBe("todo");
  });
});

describe("buildMaps", () => {
  it("exposes the project's default status id", () => {
    expect(buildMaps(THREE_STATUSES, TYPES, LABELS).defaultStatusId).toBe("s-todo");
    expect(buildMaps(FIVE_STATUSES, TYPES, LABELS).defaultStatusId).toBe("s-todo");
  });

  it("keeps full status rows keyed by id", () => {
    const maps = buildMaps(THREE_STATUSES, TYPES, LABELS);
    expect(maps.statusById.get("s-done")?.name).toBe("Done");
  });
});

describe("deriveBoard", () => {
  const task = (over: Partial<Task>): Task =>
    ({
      id: "t1",
      projectId: "p1",
      title: "Example",
      statusId: "s-todo",
      priority: "medium",
      order: 1,
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...over,
    }) as Task;

  it("rows carry the status row uuid (su) alongside the display short id", () => {
    const maps = buildMaps(THREE_STATUSES, TYPES, LABELS);
    const board = deriveBoard(
      [task({ id: "t1", statusId: "s-done", order: 3 })],
      maps,
      [] as Iteration[],
      [] as Milestone[],
    );
    expect(board.rows[0]!.su).toBe("s-done");
    expect(board.rows[0]!.s).toBe("done");
  });

  it("cards land in the column derived from their status id — a 3-status project has no Backlog/In Review columns", () => {
    const maps = buildMaps(THREE_STATUSES, TYPES, LABELS);
    const board = deriveBoard(
      [task({ id: "t1", statusId: "s-todo", order: 1 })],
      maps,
      [] as Iteration[],
      [] as Milestone[],
    );
    const cols = colsOf(THREE_STATUSES);
    // every column id resolves to a real status the PATCH layer can send
    for (const c of cols) expect(maps.statusById.has(c.id)).toBe(true);
    expect(cols.some((c) => c.name === "Backlog")).toBe(false);
    expect(board.rows[0]!.su).toBe("s-todo");
  });
});
