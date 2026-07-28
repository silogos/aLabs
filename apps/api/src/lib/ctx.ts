/** Hono context bindings — per-request resolved state. */
import type { Context } from "hono";
import type { User } from "@pmin/core";

export interface TenantContext {
  organizationId: string;
  projectId?: string;
  /** effective workspace role name */
  workspaceRole: string;
  /** effective project role name (if project resolved) */
  projectRole?: string;
  /** union of permissions granted by workspace ∪ project role */
  permissions: Set<string>;
}

export interface Vars {
  user?: User;
  tenant?: TenantContext;
}

/** A context carrying our Variables. Helpers accept this. */
export type Ctx = Context<{ Variables: Vars }>;
