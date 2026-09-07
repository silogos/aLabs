"use client";

/** Org nav model — sections + icons for the /org rail and mobile sheet.
 *  Mirrors NAV_SECTIONS in components/nav-data.tsx (same icon language),
 *  but the org area is its own surface: paths, not project views. */
import type { ReactNode } from "react";

export interface OrgNavItem {
  id: string;
  label: string;
  path: string;
}

export const ORG_SECTIONS: { label: string; items: OrgNavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "org-overview", label: "Overview", path: "/org" },
      { id: "org-activity", label: "Activity", path: "/org/activity" },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "org-projects", label: "Projects", path: "/org/projects" },
      { id: "org-members", label: "Members", path: "/org/members" },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "org-settings", label: "Settings", path: "/org/settings" },
      { id: "org-billing", label: "Billing", path: "/org/billing" },
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

export const ORG_ICONS: Record<string, ReactNode> = {
  "org-overview": I(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>,
  ),
  "org-activity": I(
    <>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </>,
  ),
  "org-projects": I(
    <>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>,
  ),
  "org-members": I(
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
  ),
  "org-settings": I(
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </>,
  ),
  "org-billing": I(
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>,
  ),
};

export const ORG_BUILDING_ICON = I(
  <>
    <path d="M3 21h18M5 21V7l7-4 7 4v14" />
    <path d="M9 9h.01M9 13h.01M15 9h.01M15 13h.01M9 21v-4h6v4" />
  </>,
);

export const ORG_BACK_ICON = I(
  <>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </>,
);

export const ORG_FLAT_ITEMS = ORG_SECTIONS.flatMap((s) => s.items);

/** Active org section from a /org/* pathname ("/org" itself → Overview). */
export function orgActiveId(pathname: string): string {
  const exact = ORG_FLAT_ITEMS.find((n) => n.path === pathname);
  if (exact) return exact.id;
  // nested match — "/org" must not prefix-capture its own children
  const nested = ORG_FLAT_ITEMS.find(
    (n) => n.path !== "/org" && pathname.startsWith(`${n.path}/`),
  );
  return nested?.id ?? "org-overview";
}

export const ORG_TITLES: Record<string, string> = Object.fromEntries(
  ORG_FLAT_ITEMS.map((n) => [n.id, n.label]),
);
