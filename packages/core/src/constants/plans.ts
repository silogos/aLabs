/**
 * Plans + default task config — seed the `plans` table and per-project defaults.
 * From `docs/tech/05-seed-data.md`.
 */
import type { PlanName } from "../enums.js";

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
    projectLimit: 3,
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
