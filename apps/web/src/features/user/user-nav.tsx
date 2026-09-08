"use client";

/** User nav model — sections + icons for the /user rail and mobile sheet.
 *  Mirrors ORG_SECTIONS in features/org/org-nav.tsx (same icon language);
 *  the user area is its own surface: paths, not project views. */
import type { ReactNode } from "react";

export interface UserNavItem {
  id: string;
  label: string;
  path: string;
}

export const USER_SECTIONS: { label: string; items: UserNavItem[] }[] = [
  {
    label: "Account",
    items: [
      { id: "user-profile", label: "Profile", path: "/user" },
      { id: "user-notifications", label: "Notifications", path: "/user/notifications" },
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

export const USER_ICONS: Record<string, ReactNode> = {
  "user-profile": I(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4,21c0,-4,4,-6,8,-6s8,2,8,6" />
    </>,
  ),
  "user-notifications": I(
    <>
      <path d="M18,8a6,6,0,0,0,-12,0c0,7,-3,9,-3,9h18s-3,-2,-3,-9" />
      <path d="M13.7,21a2,2,0,0,1,-3.4,0" />
    </>,
  ),
};

export const USER_BACK_ICON = I(
  <>
    <path d="M19,12H5M12,19l-7,-7,7,-7" />
  </>,
);

export const USER_FLAT_ITEMS = USER_SECTIONS.flatMap((s) => s.items);

/** Active user section from a /user/* pathname ("/user" itself → Profile). */
export function userActiveId(pathname: string): string {
  const exact = USER_FLAT_ITEMS.find((n) => n.path === pathname);
  if (exact) return exact.id;
  // nested match — "/user" must not prefix-capture its own children
  const nested = USER_FLAT_ITEMS.find(
    (n) => n.path !== "/user" && pathname.startsWith(`${n.path}/`),
  );
  return nested?.id ?? "user-profile";
}

export const USER_TITLES: Record<string, string> = Object.fromEntries(
  USER_FLAT_ITEMS.map((n) => [n.id, n.label]),
);
