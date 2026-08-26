/** Tasks/planning reads — the board data layer. `useBoard()` fetches the
 *  project's tasks + config + planning data through React Query and derives
 *  the whole view-model purely from the cache (see model.ts). Views never
 *  touch the services directly; mutations live in mutations.ts and write
 *  optimistically into these same keys. */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TaskDetail } from "@pmin/core";
import { tasksService } from "@/services/tasks";
import { planningService } from "@/services/planning";
import { qk } from "@/lib/query-keys";
import { useApp } from "@/providers/app-provider";
import {
  buildMaps,
  deriveBoard,
  ptsTotal,
  type DerivedBoard,
  type Sprint,
  type TaskRow,
} from "./model";

export interface Board extends DerivedBoard {
  /** true once the task list has loaded (rows may legitimately be empty) */
  ready: boolean;
  taskById: (id: number) => TaskRow | undefined;
  subsOf: (id: number) => TaskRow[];
  childrenOf: (id: number) => TaskRow[];
  allTasks: () => TaskRow[];
  iterTasks: (sp: string) => TaskRow[];
  committedPts: (sp: string) => number;
  donePts: (sp: string) => number;
  sprintRows: () => { k: string; total: number }[];
  sprintStatusLabel: (sp: string) => string;
  /** A valid sprint key for the current dataset — falls back to the active
   *  (or newest) iteration when a held key predates the data. */
  resolveSprint: (key: string) => string;
  isPlannable: (sp: string) => boolean;
}

export function useBoard(): Board {
  const { project } = useApp();
  const pid = project?.id ?? "";
  const enabled = !!project;

  const tasksQ = useQuery({
    queryKey: qk.tasks(pid),
    queryFn: () => tasksService.list(pid),
    enabled,
  });
  const statusesQ = useQuery({
    queryKey: qk.statuses(pid),
    queryFn: () => tasksService.statuses(pid),
    enabled,
  });
  const typesQ = useQuery({
    queryKey: qk.types(pid),
    queryFn: () => tasksService.types(pid),
    enabled,
  });
  const labelsQ = useQuery({
    queryKey: qk.labels(pid),
    queryFn: () => tasksService.labels(pid),
    enabled,
  });
  const iterationsQ = useQuery({
    queryKey: qk.iterations(pid),
    queryFn: () => planningService.iterations(pid),
    enabled,
  });
  const milestonesQ = useQuery({
    queryKey: qk.milestones(pid),
    queryFn: () => planningService.milestones(pid),
    enabled,
  });

  const derived = useMemo(
    () =>
      deriveBoard(
        tasksQ.data?.items ?? [],
        buildMaps(statusesQ.data ?? [], typesQ.data ?? [], labelsQ.data ?? []),
        iterationsQ.data ?? [],
        milestonesQ.data ?? [],
      ),
    [tasksQ.data, statusesQ.data, typesQ.data, labelsQ.data, iterationsQ.data, milestonesQ.data],
  );

  return useMemo(() => {
    const { rows, sprints, sprintIds } = derived;
    const taskById = (id: number) => rows.find((t) => t.id === id);
    const sprintStatusLabel = (sp: string) =>
      ({ planned: "Planned", active: "Active", completed: "Completed" })[
        sprints[sp]?.st ?? "planned"
      ];
    return {
      ...derived,
      ready: tasksQ.isSuccess,
      taskById,
      subsOf: (id) => rows.filter((t) => t.parent === id).sort((a, b) => a.id - b.id),
      childrenOf: (id) => rows.filter((t) => t.epic === id && t.ty !== "subtask"),
      allTasks: () => rows,
      iterTasks: (sp) => rows.filter((t) => !t.parent && t.ty !== "epic" && t.sp === sp),
      committedPts: (sp) => {
        const s = sprints[sp];
        if (s?.st === "completed") return s.committed ?? 0;
        return ptsTotal(rows.filter((t) => !t.parent && t.ty !== "epic" && t.sp === sp));
      },
      donePts: (sp) => {
        const s = sprints[sp];
        if (s?.st === "completed") return s.completed ?? 0;
        return ptsTotal(
          rows.filter((t) => !t.parent && t.ty !== "epic" && t.sp === sp && t.s === "done"),
        );
      },
      sprintRows: () => [
        ...sprintIds.map((k) => ({
          k,
          total: rows.filter((t) => !t.parent && t.ty !== "epic" && t.sp === k).length,
        })),
        { k: "backlog", total: rows.filter((t) => !t.parent && t.ty !== "epic" && !t.sp).length },
      ],
      sprintStatusLabel,
      resolveSprint: (key: string) =>
        sprints[key] ? key : (sprintIds.find((k) => sprints[k]?.st === "active") ?? sprintIds.at(-1) ?? key),
      isPlannable: (sp: string) => {
        const s: Sprint | undefined = sprints[sp];
        return !!s && (s.st === "planned" || s.st === "active");
      },
    };
  }, [derived, tasksQ.isSuccess]);
}

/** Task detail (subtasks + comments) for the drawer. */
export function useTaskDetail(uuid: string | undefined) {
  const { project } = useApp();
  const pid = project?.id ?? "";
  return useQuery({
    queryKey: qk.task(pid, uuid ?? ""),
    queryFn: () => tasksService.get(pid, uuid!),
    enabled: !!project && !!uuid,
  });
}

export type { TaskDetail };
