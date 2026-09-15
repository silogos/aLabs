"use client";

/** Members surface layout — the directory is the persistent backdrop for
 *  /{orgSlug}/members and /{orgSlug}/members/{userId}: navigating to a
 *  member opens the quick-view drawer via the child page without remounting
 *  the list (mirrors the tasks board + task drawer pattern). */
import type { ReactNode } from "react";
import { OrgMembersView } from "@/features/org/members-view";

export default function MembersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OrgMembersView />
      {children}
    </>
  );
}
