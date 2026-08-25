/** Shared nav model — sections, icons, and switcher helpers.
 *  Mirrors the design prototype (designs/app/alabs-app.html). Org/project rows
 *  render from live API data (store.tsx); row colors derive from the entity id. */
import { documentsService } from "@/services/documents";
import { tasksService } from "@/services/tasks";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { View } from "../store";
import { useApp } from "../store";

/* ---------- nav sections (sidebar + mobile sheet render from this) ---------- */

export interface NavSection {
  label: string;
  items: { id: View; label: string }[];
}

export const NAV_SECTIONS: NavSection[] = [
  { label: "Overview", items: [{ id: "dashboard", label: "Dashboard" }] },
  {
    label: "Workspace",
    items: [
      { id: "tasks", label: "Tasks" },
      { id: "documents", label: "Documents" },
      { id: "planning", label: "Planning" },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { id: "meetings", label: "Meetings" },
      { id: "reports", label: "Reports" },
      { id: "agreements", label: "Agreements" },
    ],
  },
];

const I = (p: ReactNode) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    {p}
  </svg>
);

export const NAV_ICONS: Record<View, ReactNode> = {
  dashboard: I(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>,
  ),
  tasks: I(
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>,
  ),
  documents: I(
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>,
  ),
  planning: I(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h3M8 18h3" />
    </>,
  ),
  meetings: I(
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
  ),
  reports: I(
    <>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 2 4-5" />
    </>,
  ),
  agreements: I(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13l2 2 4-4" />
    </>,
  ),
};

/** Live nav counts — tasks/documents from the API (anchored to the real project),
 *  the rest are static demos. */
export function useNavCounts() {
  const { project } = useApp();
  const pid = project?.id;
  const tasksQ = useQuery({
    queryKey: ["count", "tasks", pid],
    queryFn: () => tasksService.list(pid!),
    enabled: !!pid,
  });
  const docsQ = useQuery({
    queryKey: ["count", "docs", pid],
    queryFn: () => documentsService.listPages(pid!),
    enabled: !!pid,
  });
  return {
    tasks: tasksQ.data?.items.length ?? null,
    documents: docsQ.data?.items.length ?? null,
    meetings: 3,
    agreements: 7,
  } as Partial<Record<View, number | null>>;
}

/* ---------- switcher helpers ---------- */

/** Deterministic row hue from the entity id — stable across reloads, no
 *  backend column needed. */
export const hueFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
};
export const projColor = (hue: number) => `oklch(48% .1 ${hue})`;

export const CheckIcon = (
  <svg
    className="chk"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const ChevRight = (cls = "chev") => (
  <svg
    className={cls}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ChevDown = (cls = "chev") => (
  <svg
    className={cls}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
