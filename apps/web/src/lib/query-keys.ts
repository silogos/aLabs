/** Query-key registry — every React Query cache key is built here so an
 *  invalidation can prefix-match a whole entity family (e.g. qk.tasks(pid)
 *  busts ["tasks", pid] and every filtered variant under it). One endpoint,
 *  one key: the same fetch must never live under two different keys. */
export const qk = {
  me: () => ["me"] as const,
  orgs: () => ["orgs"] as const,
  projects: (orgId: string) => ["projects", orgId] as const,
  recents: () => ["recents"] as const,
  notifications: () => ["notifications"] as const,
  members: (orgId: string | undefined) => ["members", orgId] as const,

  tasks: (pid: string) => ["tasks", pid] as const,
  statuses: (pid: string) => ["statuses", pid] as const,
  iterations: (pid: string) => ["iterations", pid] as const,
  milestones: (pid: string) => ["milestones", pid] as const,

  meetings: (pid: string) => ["meetings", pid] as const,
  agreements: (pid: string) => ["agreements", pid] as const,

  spaces: (pid: string) => ["spaces", pid] as const,
  pages: (pid: string) => ["pages", pid] as const,
  files: (pid: string) => ["files", pid] as const,

  dashboard: (pid: string) => ["dashboard", pid] as const,
  progress: (pid: string) => ["progress", pid] as const,
  activity: (pid: string) => ["activity", pid] as const,
};
