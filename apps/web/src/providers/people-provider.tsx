/** People — the org's members as a renderable registry (avatars, names,
 *  picker options). Replaces the old module-level `registerPeople` store:
 *  one query (via useMembers), one context, no mutation. Colors derive
 *  stably from the user id. */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { colorFor, initials } from "@/components/ui/avatar";
import { useMembers } from "@/hooks/use-members";
import { useApp } from "@/providers/app-provider";
import type { Person } from "@/features/tasks/model";

interface People {
  byId: Record<string, Person>;
  personOf: (id: string | undefined) => Person | undefined;
  who: (id: string | undefined) => string;
  /** Picker options: [userId, name] pairs. */
  options: () => [string, string][];
}

const Ctx = createContext<People | null>(null);

const buildPeople = (users: { id: string; name: string }[]): People => {
  const byId: Record<string, Person> = {};
  for (const u of users) {
    byId[u.id] = {
      name: u.name,
      initials: initials(u.name),
      color: colorFor(u.id),
      role: "Member",
    };
  }
  return {
    byId,
    personOf: (id) => (id ? byId[id] : undefined),
    who: (id) => (id ? (byId[id]?.name ?? "Unassigned") : "Unassigned"),
    options: () => Object.entries(byId).map(([id, p]) => [id, p.name]),
  };
};

export function PeopleProvider({ children }: { children: ReactNode }) {
  const { project } = useApp();
  const { data } = useMembers(project?.organizationId);
  const value = useMemo(() => buildPeople(data?.map((m) => m.user) ?? []), [data]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePeople(): People {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePeople must be used within PeopleProvider");
  return v;
}
