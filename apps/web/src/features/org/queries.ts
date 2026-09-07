"use client";

/** Org queries — the extra reads the /org views need beyond AppProvider
 *  (members live in the shared hooks/use-members). Same qk keys as before:
 *  one endpoint, one key. */
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

export function useOrgActivity(orgId: string | undefined, limit = 100) {
  return useQuery({
    queryKey: qk.orgActivity(orgId),
    queryFn: () => workspaceService.orgActivity(orgId!, limit),
    enabled: !!orgId,
  });
}
