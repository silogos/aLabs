/**
 * Plans + default task config — seed the `plans` table and per-project defaults.
 * From `docs/tech/05-seed-data.md`.
 */
import type { PlanName } from "../enums";

/**
 * Max active projects in a personal (free, single-member) workspace.
 * "Active" = not archived and not soft-deleted. This is the single source of
 * truth for the personal-org project cap AND the `free` plan's project_limit —
 * the free seed references it so the two cannot drift. See
 * `docs/foundation/04-plans-workspaces.md` and ADR 0007.
 */
export const PERSONAL_PROJECT_LIMIT = 2;

export interface PlanSeed {
  name: PlanName;
  price: string;
  currency: string;
  projectLimit: number | null;
  features: Record<string, boolean>;
}

export const PLAN_SEEDS: PlanSeed[] = [
  {
    name: "free",
    price: "0",
    currency: "USD",
    projectLimit: PERSONAL_PROJECT_LIMIT,
    features: { core_modules: true },
  },
  {
    name: "professional",
    price: "49",
    currency: "USD",
    projectLimit: null,
    features: { core_modules: true, client_portal: true, advanced_reporting: true },
  },
  {
    name: "enterprise",
    price: "0",
    currency: "USD",
    projectLimit: null,
    features: {
      core_modules: true,
      client_portal: true,
      advanced_reporting: true,
      self_hosted: true,
      sso: true,
      audit_logs: true,
      advanced_permissions: true,
    },
  },
];

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
