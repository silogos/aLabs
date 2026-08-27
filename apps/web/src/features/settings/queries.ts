/** Settings queries — org detail, org invitations, project members. The
 *  active org/project/user are already in AppProvider; these are the extra
 *  reads the management surfaces need (members live in the shared
 *  useMembers hook). */
import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace";
import { qk } from "@/lib/query-keys";

export function useInvitations(orgId: string | undefined) {
  return useQuery({
    queryKey: qk.invitations(orgId),
    queryFn: () => workspaceService.invitations(orgId!),
    enabled: !!orgId,
  });
}

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: qk.projectMembers(projectId),
    queryFn: () => workspaceService.projectMembers(projectId!),
    enabled: !!projectId,
  });
}
