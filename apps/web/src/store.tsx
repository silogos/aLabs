/** Global app state: active tenant (real org/project ids, persisted as the
 *  last-visited pair), current view, overlays, toasts.
 *
 *  Switching model (per the nav design):
 *   - project switcher = frequent, this-org projects only;
 *   - org switcher = identity-level, rare — lands on the org's *derived*
 *     landing project: most-recently-visited project in that org, else the
 *     first project by createdAt.
 *  Every switch POSTs /users/me/recents (server-persisted visit history). */
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type User, type Project, type Organization } from "./api";
import { setActiveProjectKey } from "./components/ui";
import { hydrateProject } from "./views/tasks-store";

export type View = "dashboard" | "tasks" | "documents" | "planning" | "meetings" | "reports" | "agreements";
export type NavModal = "acct" | "proj" | "org" | null;

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
  taskId: string | null; // open drawer
  createOpen: boolean;
  cmdkOpen: boolean;
  relPickerId: string | null; // open the link-issue picker (drawer Relationships)
  toasts: Toast[];
  setView: (v: View) => void;
  setCollapsed: (b: boolean) => void;
  openTask: (id: string) => void;
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
export function landingProject(projects: Project[], recents: RecentEntry[] | undefined): Project | undefined {
  for (const r of recents ?? []) {
    const p = projects.find((x) => x.id === r.project.id);
    if (p) return p;
  }
  return [...projects].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>(() => (lsGet("alabs-view") as View) || "dashboard");
  const [collapsed, setCollapsedState] = useState<boolean>(() => lsGet("alabs-collapsed") === "1");
  const [taskId, setTaskId] = useState<string | null>(null);
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
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: api.orgs });
  const { data: recents } = useQuery({ queryKey: ["recents"], queryFn: () => api.recents(5) });

  const org = orgs?.find((o) => o.id === orgPref) ?? orgs?.[0];
  const { data: projects } = useQuery({
    queryKey: ["projects", org?.id],
    queryFn: () => api.projects(org!.id),
    enabled: !!org,
  });
  const project = useMemo(
    () => (projects?.length ? projects.find((p) => p.id === projPref) ?? landingProject(projects, recents) : undefined),
    [projects, projPref, recents],
  );
  // keep the module-level key in sync for taskSerial() (plain helpers, toasts)
  if (project) setActiveProjectKey(project.key);

  const setView = useCallback((v: View) => {
    setViewState(v);
    lsSet("alabs-view", v);
  }, []);
  const setCollapsed = useCallback((b: boolean) => {
    setCollapsedState(b);
    lsSet("alabs-collapsed", b ? "1" : "0");
  }, []);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const openTask = useCallback((id: string) => setTaskId(id), []);
  const closeTask = useCallback(() => setTaskId(null), []);
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
      setViewState("dashboard");
      lsSet("alabs-view", "dashboard");
      if (!opts?.silent) toast(`Switched to ${p.name}`);
      // server-persisted visit history (fire-and-forget)
      void api
        .touchProject(p.id)
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: ["recents"] }));
    },
    [queryClient, toast],
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

  // Swap the Tasks/Planning demo dataset to the active project's real rows
  // (Atlas keeps its rich built-in demo set — see tasks-store.ts header).
  const pid = project?.id;
  useEffect(() => {
    if (!project || !pid) return;
    let cancelled = false;
    void (async () => {
      try {
        const [page, statuses, members] = await Promise.all([
          api.tasks(pid),
          api.statuses(pid),
          api.members(project.organizationId),
        ]);
        if (cancelled) return;
        hydrateProject(
          project.key,
          page.items,
          statuses,
          members.map((m) => m.user),
        );
      } catch {
        /* offline/failure → keep the current dataset */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pid, project?.key, project?.organizationId]);

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
    taskId,
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
