/** Members — the org's user list, shared by meetings/agreements/reports/
 *  documents/nav and the people registry. One query, one key. */
import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";

export function useMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: qk.members(orgId),
    queryFn: () => workspaceService.members(orgId!),
    enabled: !!orgId,
  });
}
