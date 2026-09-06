/** Tests for useProjectMembers — TanStack Query wiring through the qk
 *  registry, with the workspace service mocked at the module boundary. */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ProjectMember } from "@pmin/core";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { qk } from "@/lib/query-keys";
import { workspaceService } from "@/services/workspace";
import { useProjectMembers } from "./queries";

vi.mock("@/services/workspace", () => ({
  workspaceService: { projectMembers: vi.fn() },
}));

const fetchMembers = vi.mocked(workspaceService.projectMembers);

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, Wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useProjectMembers", () => {
  it("fetches members and caches them under qk.projectMembers(pid)", async () => {
    const members = [{ id: "m1" }] as unknown as ProjectMember[];
    fetchMembers.mockResolvedValue(members);
    const { client, Wrapper } = createWrapper();

    const { result } = renderHook(() => useProjectMembers("p1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.data).toEqual(members));
    expect(fetchMembers).toHaveBeenCalledWith("p1");
    expect(client.getQueryData(qk.projectMembers("p1"))).toEqual(members);
  });

  it("stays idle and never fetches without a project id", async () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useProjectMembers(undefined), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.status).toBe("pending"));
    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMembers).not.toHaveBeenCalled();
  });
});
