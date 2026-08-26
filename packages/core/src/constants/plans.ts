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
}

export const DEFAULT_TASK_STATUSES: TaskStatusSeed[] = [
  { name: "To Do", order: 0, isDefault: true },
  { name: "In Progress", order: 1, isDefault: false },
  { name: "Done", order: 2, isDefault: false },
];

export const DEFAULT_TASK_TYPES = ["Task", "Bug", "Feature", "Epic"];
