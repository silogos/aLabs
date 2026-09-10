/** Global app state: active tenant, current view, overlays, toasts.
 *
 *  Tenant selection is URL-first: /{orgSlug}/{projectSlug}/{view} is the
 *  source of truth (shareable links), mirrored into the alabs-org /
 *  alabs-project localStorage prefs so tenant-less surfaces (/, /user,
 *  /notifications) and fresh reloads land on the last-visited pair.
 *
 *  Switching model (per the nav design):
 *   - project switcher = frequent, this-org projects only;
 *   - org switcher = identity-level, rare — lands on the org's *derived*
 *     landing project: most-recently-visited project in that org, else the
 *     first project by createdAt.
 *  Every switch POSTs /users/me/recents (server-persisted visit history). */
import { authService } from "@/services/auth";
import { workspaceService } from "@/services/workspace";
import type { Organization, Project, User } from "@pmin/core";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setActiveProjectKey } from "@/lib/serial";
import { qk } from "@/lib/query-keys";

export type View =
  | "dashboard"
  | "tasks"
  | "documents"
  | "planning"
  | "meetings"
  | "reports"
  | "agreements"
  | "settings";
export type NavModal = "acct" | "proj" | "org" | null;

/** URL per view — the route is the source of truth (no view in storage).
 *  Values are bare view names; full paths are /{orgSlug}/{projectSlug}/{view}. */
export const VIEW_PATH: Record<View, string> = {
  dashboard: "dashboard",
  tasks: "tasks",
  documents: "documents",
  planning: "planning",
  meetings: "meetings",
  reports: "reports",
  agreements: "agreements",
  settings: "settings",
};

const VIEW_NAMES = new Set<string>(Object.values(VIEW_PATH));
const isViewName = (s: string): s is View => VIEW_NAMES.has(s);

/** First path segment that can never be an org slug (static routes win). */
const STATIC_ROOTS = new Set([
  "user",
  "notifications",
  "tasks",
  "projects",
  "orgs",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "api",
  "uploads",
]);

/** Tenant slugs from a pathname:
 *   /{orgSlug}/{projectSlug}/{view} → both (project surface — exactly 3
 *     segments with a known view third, so org pages like /{org}/settings
 *     stay project-less);
 *   /{orgSlug}…                      → org only (org surface);
 *   /, /user, /tasks, /orgs, /login… → {} (tenant-less roots — these
 *     static pages are exactly one segment; deeper paths fall through to
 *     the [orgSlug] route, e.g. /tasks/proj/tasks for an org "tasks"). */
export function tenantFromPath(pathname: string): { orgSlug?: string; projectSlug?: string } {
  const segs = pathname.split("/").filter(Boolean);
  if (!segs.length) return {};
  if (segs.length === 1 && STATIC_ROOTS.has(segs[0])) return {};
  if (segs.length >= 3 && isViewName(segs[2])) return { orgSlug: segs[0], projectSlug: segs[1] };
  return { orgSlug: segs[0] };
}

/** Full path for a project view — the canonical shareable URL shape. */
export function viewPath(view: View, orgSlug: string, projectSlug: string): string {
  return `/${orgSlug}/${projectSlug}/${VIEW_PATH[view]}`;
}

/** Open task from a pathname: /{orgSlug}/{projectSlug}/tasks/{taskNumber}.
 *  The drawer itself is the [taskId] route — this tells chrome (scrim, Esc)
 *  whether one is open. */
export function taskFromPath(pathname: string): string | null {
  const segs = pathname.split("/").filter(Boolean);
  return segs.length === 4 && segs[2] === "tasks" ? segs[3] : null;
}

/** Active view from /{orgSlug}/{projectSlug}/{view}; anything else → dashboard. */
const viewFromPath = (p: string): View => {
  const segs = p.split("/").filter(Boolean);
  const v = segs[2];
  return v && isViewName(v) ? v : "dashboard";
};

interface Toast {
  id: number;
  msg: string;
}

export interface RecentEntry {
  project: Project;
  organization: Organization;
  visitedAt: string;
}

interface AppState {
  user: User | undefined;
  org: Organization | undefined;
  project: Project | undefined;
  orgs: Organization[] | undefined;
  projects: Project[] | undefined;
  recents: RecentEntry[] | undefined;
  /** Nav-switcher state (design: separated switchers + mobile sheet). */
  navModal: NavModal; // centered switcher/account modals
  mNavOpen: boolean; // mobile bottom-sheet nav
  switchProject: (p: Project, opts?: { silent?: boolean }) => void;
  switchOrg: (id: string) => void;
  setNavModal: (m: NavModal) => void;
  setMNavOpen: (b: boolean) => void;
  view: View;
  collapsed: boolean; // sidebar rail collapse (manual toggle)
  createOpen: boolean;
  cmdkOpen: boolean;
  relPickerId: string | null; // open the link-issue picker (drawer Relationships)
  toasts: Toast[];
  setView: (v: View) => void;
  setCollapsed: (b: boolean) => void;
  openTask: (id: string | number) => void;
  closeTask: () => void;
  setCreateOpen: (b: boolean) => void;
  setCmdkOpen: (b: boolean) => void;
  openRelPicker: (id: string) => void;
  closeRelPicker: () => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<AppState | null>(null);

const lsGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const lsSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};
const lsDel = (k: string) => {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
};

/** Landing rule: most-recently-visited project in this org → else first by createdAt. */
export function landingProject(
  projects: Project[],
  recents: RecentEntry[] | undefined,
): Project | undefined {
  for (const r of recents ?? []) {
    const p = projects.find((x) => x.id === r.project.id);
    if (p) return p;
  }
  return [...projects].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const view = viewFromPath(pathname);
  const [collapsed, setCollapsedState] = useState<boolean>(() => lsGet("alabs-collapsed") === "1");
  const [createOpen, setCreateOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [relPickerId, setRelPickerId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // last-visited tenant (persisted); null → derived from the org list / landing rule
  const [orgPref, setOrgPref] = useState<string | null>(() => lsGet("alabs-org"));
  const [projPref, setProjPref] = useState<string | null>(() => lsGet("alabs-project"));
  const [navModal, setNavModal] = useState<NavModal>(null);
  const [mNavOpen, setMNavOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: user, error: meError } = useQuery({ queryKey: qk.me(), queryFn: authService.me });
  const { data: orgs } = useQuery({ queryKey: qk.orgs(), queryFn: workspaceService.orgs });
  const { data: recents } = useQuery({
    queryKey: qk.recents(),
    queryFn: () => workspaceService.recents(5),
  });

  // Session died server-side (expired, revoked by a password reset, DB reset):
  // the proxy only checks cookie presence, so sign out client-side first —
  // clearing the cookie server-side avoids the /login ⇄ /dashboard proxy loop.
  useEffect(() => {
    if (meError && (meError as Error & { status?: number }).status === 401) {
      let cancelled = false;
      void authService
        .logout()
        .catch(() => {})
        .finally(() => {
          if (cancelled) return;
          queryClient.clear();
          router.replace("/login");
        });
      return () => {
        cancelled = true;
      };
    }
  }, [meError, queryClient, router]);

  const org = orgs?.find((o) => o.id === orgPref) ?? orgs?.[0];
  const { data: projects } = useQuery({
    // "" keys the not-yet-loaded state (query disabled) — org! must never
    // evaluate in the key or the first render crashes
    queryKey: qk.projects(org?.id ?? ""),
    queryFn: () => workspaceService.projects(org!.id),
    enabled: !!org,
  });
  const project = useMemo(
    () =>
      projects?.length
        ? (projects.find((p) => p.id === projPref) ?? landingProject(projects, recents))
        : undefined,
    [projects, projPref, recents],
  );
  // keep the module-level key in sync for taskSerial() (plain helpers, toasts)
  useEffect(() => {
    if (project) setActiveProjectKey(project.key);
  }, [project?.key]);

  // ---- URL-first tenant: /{orgSlug}/{projectSlug}/{view} drives the prefs ----
  // Mirrored into localStorage so tenant-less surfaces (/, /user,
  // /notifications) and fresh reloads keep the last-visited pair.
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const urlTenant = useMemo(() => tenantFromPath(pathname), [pathname]);
  useEffect(() => {
    if (!urlTenant.orgSlug || !orgs) return;
    const urlOrg = orgs.find((o) => o.slug === urlTenant.orgSlug);
    if (!urlOrg || urlOrg.id === orgPref) return;
    setOrgPref(urlOrg.id);
    lsSet("alabs-org", urlOrg.id);
    // org-only URLs land on the org's landing project (like switchOrg)
    if (!urlTenant.projectSlug) {
      setProjPref(null);
      lsDel("alabs-project");
    }
  }, [urlTenant, orgs, orgPref]);
  useEffect(() => {
    if (!urlTenant.projectSlug || !projects) return;
    const urlProject = projects.find((p) => p.slug === urlTenant.projectSlug);
    if (!urlProject || urlProject.id === projPref) return;
    setProjPref(urlProject.id);
    lsSet("alabs-project", urlProject.id);
  }, [urlTenant, projects, projPref]);

  // Stale slugs (renamed, no access, typo) → land on / with a toast. The
  // lists only return what the user can access, so "not in the list" covers
  // both unknown and forbidden (404-not-403 on the web side too).
  useEffect(() => {
    if (!urlTenant.orgSlug || !orgs) return;
    if (orgs.some((o) => o.slug === urlTenant.orgSlug)) return;
    toast("Workspace not found");
    router.replace("/");
  }, [urlTenant, orgs, router, toast]);
  useEffect(() => {
    if (!urlTenant.projectSlug || !projects) return;
    if (projects.some((p) => p.slug === urlTenant.projectSlug)) return;
    toast("Project not found");
    router.replace("/");
  }, [urlTenant, projects, router, toast]);

  const setView = useCallback(
    (v: View) => {
      if (org && project) router.push(viewPath(v, org.slug, project.slug));
    },
    [router, org, project],
  );
  const setCollapsed = useCallback((b: boolean) => {
    setCollapsedState(b);
    lsSet("alabs-collapsed", b ? "1" : "0");
  }, []);

  const openTask = useCallback(
    (id: string | number) => {
      if (org && project)
        router.push(`${viewPath("tasks", org.slug, project.slug)}/${id}`);
    },
    [router, org, project],
  );
  const closeTask = useCallback(() => {
    if (org && project) router.push(viewPath("tasks", org.slug, project.slug));
  }, [router, org, project]);
  const openRelPicker = useCallback((id: string) => setRelPickerId(id), []);
  const closeRelPicker = useCallback(() => setRelPickerId(null), []);

  // ---- nav switchers (design: project = frequent, this-org only; org = identity) ----
  const switchProject = useCallback(
    (p: Project, opts?: { silent?: boolean }) => {
      setProjPref(p.id);
      setOrgPref(p.organizationId);
      lsSet("alabs-project", p.id);
      lsSet("alabs-org", p.organizationId);
      setNavModal(null);
      setMNavOpen(false);
      const o = orgs?.find((x) => x.id === p.organizationId);
      router.push(o ? viewPath("dashboard", o.slug, p.slug) : "/");
      if (!opts?.silent) toast(`Switched to ${p.name}`);
      // server-persisted visit history (fire-and-forget)
      void workspaceService
        .touchProject(p.id)
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: qk.recents() }));
    },
    [orgs, queryClient, router, toast],
  );

  // An org switch lands on the org's landing project once its list resolves.
  const pendingOrgName = useRef<string | null>(null);
  const switchOrg = useCallback(
    (id: string) => {
      const o = orgs?.find((x) => x.id === id);
      if (!o) return;
      setNavModal(null);
      if (o.id === org?.id) return;
      setOrgPref(id);
      lsSet("alabs-org", id);
      setProjPref(null);
      lsDel("alabs-project");
      pendingOrgName.current = o.name;
    },
    [orgs, org],
  );
  useEffect(() => {
    if (!pendingOrgName.current || !projects) return;
    const orgName = pendingOrgName.current;
    pendingOrgName.current = null;
    const landing = landingProject(projects, recents);
    if (landing) {
      switchProject(landing, { silent: true });
      toast(`Switched to ${orgName}`);
    } else {
      toast(`${orgName} has no projects yet`);
    }
  }, [projects, recents, switchProject, toast]);

  // Views own their data via React Query keyed on the active project (see
  // features/*/queries.ts) — switching projects just busts the cache below.

  const value: AppState = {
    user,
    org,
    project,
    orgs,
    projects,
    recents,
    navModal,
    mNavOpen,
    switchProject,
    switchOrg,
    setNavModal,
    setMNavOpen,
    view,
    collapsed,
    setCollapsed,
    createOpen,
    cmdkOpen,
    relPickerId,
    toasts,
    setView,
    openTask,
    closeTask,
    setCreateOpen,
    setCmdkOpen,
    openRelPicker,
    closeRelPicker,
    toast,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
