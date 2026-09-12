/**
 * Plan limits + default per-project task config. From
 * `docs/tech/05-seed-data.md` and `docs/foundation/04-plans-workspaces.md`.
 */

/**
 * Max active projects in a personal (free, single-member) workspace.
 * "Active" = not archived and not soft-deleted. See ADR 0007.
 */
export const PERSONAL_PROJECT_LIMIT = 2;

export interface TaskStatusSeed {
  name: string;
  order: number;
  isDefault: boolean;
  color: string;
}

/** The design's 5 board columns (docs/modules/01-task.md, TaskStatus).
 *  Colors are CSS custom-property refs — the web theme defines them. */
export const DEFAULT_TASK_STATUSES: TaskStatusSeed[] = [
  { name: "Backlog", order: 0, isDefault: false, color: "var(--faint)" },
  { name: "To Do", order: 1, isDefault: true, color: "var(--muted)" },
  { name: "In Progress", order: 2, isDefault: false, color: "var(--info)" },
  { name: "In Review", order: 3, isDefault: false, color: "var(--violet)" },
  { name: "Done", order: 4, isDefault: false, color: "var(--ok)" },
];

export const DEFAULT_TASK_TYPES = ["Epic", "Story", "Task", "Bug", "Subtask"];
