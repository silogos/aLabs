/** Members — the org's user list, shared by meetings/agreements/reports/
 *  documents/nav. One query, one key. Until the tasks store retires it also
 *  feeds the legacy people registry (registerPeople). */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";
import { registerPeople } from "@/features/tasks/store";

export function useMembers(orgId: string | undefined) {
  const members = useQuery({
    queryKey: qk.members(orgId),
    queryFn: () => workspaceService.members(orgId!),
    enabled: !!orgId,
  });
  useEffect(() => {
    if (members.data) registerPeople(members.data.map((m) => m.user));
  }, [members.data]);
  return members;
}
