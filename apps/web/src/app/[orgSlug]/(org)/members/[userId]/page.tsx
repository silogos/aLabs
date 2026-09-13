import { MemberProfileView } from "@/features/org/member-profile-view";

/** Member deep link — /{orgSlug}/members/{userId}. The target of
 *  notification actor links and member-list rows. */
export default function MemberProfilePage() {
  return <MemberProfileView />;
}
