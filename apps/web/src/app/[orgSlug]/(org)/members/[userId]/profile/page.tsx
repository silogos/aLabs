import { MemberProfileView } from "@/features/org/member-profile-view";

/** Full member profile — /{orgSlug}/members/{userId}/profile. Reached from
 *  the member drawer's "Open profile" action (and deep links). */
export default function MemberProfilePage() {
  return <MemberProfileView />;
}
