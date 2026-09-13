"use client";

/** Member quick view — /{orgSlug}/members/{userId} opens the drawer over
 *  the members list backdrop; "Open profile" jumps to the full profile. */
import { MemberDrawer } from "@/features/org/member-drawer";

export default function MemberDrawerPage() {
  return <MemberDrawer />;
}
