/** Settings queries — project members for the project settings section.
 *  The active org/project/user are already in AppProvider. (Org invitations
 *  moved to features/org/queries.ts with the org area.) */
import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: qk.projectMembers(projectId),
    queryFn: () => workspaceService.projectMembers(projectId!),
    enabled: !!projectId,
  });
}
