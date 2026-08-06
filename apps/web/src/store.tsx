/** Global app state: active tenant, current view, overlays, toasts. */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type User, type Project, type Organization } from "./api.js";

export type View = "dashboard" | "tasks" | "documents" | "planning" | "meetings" | "reports" | "agreements";

interface Toast {
  id: number;
  msg: string;
}

interface AppState {
  user: User | undefined;
  org: Organization | undefined;
  project: Project | undefined;
  /** MVP display overrides for the sidebar switchers — labels + context only;
   *  underlying data queries stay anchored to the real org/project. */
  projLabel: { name: string; icon: string } | null;
  setProjLabel: (p: { name: string; icon: string } | null) => void;
  orgLabel: string | null;
  setOrgLabel: (s: string | null) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>(
    () => (typeof localStorage !== "undefined" && (localStorage.getItem("alabs-view") as View)) || "dashboard",
  );
  const [collapsed, setCollapsedState] = useState<boolean>(
    () => typeof localStorage !== "undefined" && localStorage.getItem("alabs-collapsed") === "1",
  );
  const [taskId, setTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [relPickerId, setRelPickerId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [projLabel, setProjLabel] = useState<{ name: string; icon: string } | null>(null);
  const [orgLabel, setOrgLabel] = useState<string | null>(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const { data: orgs } = useQuery({ queryKey: ["orgs"], queryFn: api.orgs });
  const org = orgs?.[0];
  const { data: projects } = useQuery({
    queryKey: ["projects", org?.id],
    queryFn: () => api.projects(org!.id),
    enabled: !!org,
  });
  const project = projects?.[0];

  const setView = useCallback((v: View) => {
    setViewState(v);
    try {
      localStorage.setItem("alabs-view", v);
    } catch {
      /* ignore */
    }
  }, []);
  const setCollapsed = useCallback((b: boolean) => {
    setCollapsedState(b);
    try {
      localStorage.setItem("alabs-collapsed", b ? "1" : "0");
    } catch {
      /* ignore */
    }
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

  const value: AppState = {
    user,
    org,
    project,
    projLabel,
    setProjLabel,
    orgLabel,
    setOrgLabel,
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
