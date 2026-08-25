/** Tasks/planning writes — optimistic React Query mutations over the board
 *  keys. Every write patches the cache first (UI reacts instantly), then hits
 *  the service; failures roll back by re-fetching server truth and surface a
 *  toast instead of the old silent `.catch(() => {})`. */
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Iteration, IterationUpdateInput, Milestone, Paginated, Task } from "@pmin/core";
import { planningService } from "@/services/planning";
import { tasksService, type TaskUpdateInput } from "@/services/tasks";
import { qk } from "@/lib/query-keys";
import { useApp } from "@/providers/app-provider";
import { PRIO_API, dueToIso, type PrioId, type RelKey, type StatusId, type TypeId } from "./model";
import { useBoard } from "./queries";

const UUID_RE = /^[0-9a-f-]{36}$/i;
const REL_API_TYPE: Record<RelKey, "blocks" | "blocked_by" | "relates_to"> = {
  blocks: "blocks",
  blockedBy: "blocked_by",
  relates: "relates_to",
};

export interface CreateInput {
  ty: TypeId;
  title: string;
  desc?: string;
  assignee: string;
  priority: PrioId;
  sp?: string | null;
  epic?: number | null;
  parent?: number | null;
  pts: number;
  due: string;
  labels: string[];
}

export function useTaskActions() {
  const { project, toast } = useApp();
  const board = useBoard();
  const qc = useQueryClient();
  const pid = project?.id ?? "";

  /** Optimistically map an API patch onto the raw cached task. */
  const applyPatch = (t: Task, patch: object): Task => ({ ...t, ...patch }) as Task;
  const patchTasks = useCallback(
    (fn: (items: Task[]) => Task[]) => {
      if (!pid) return;
      qc.setQueryData<Paginated<Task>>(qk.tasks(pid), (page) =>
        page ? { ...page, items: fn(page.items) } : page,
      );
    },
    [pid, qc],
  );
  const uuidOf = useCallback(
    (order: number) => board.uuidByOrder.get(order),
    [board.uuidByOrder],
  );
  /** Patch one task by row order — optimistic cache write + service call. */
  const patchTask = useCallback(
    (order: number, patch: TaskUpdateInput) => {
      const uuid = uuidOf(order);
      if (!pid || !uuid) return;
      patchTasks((items) => items.map((t) => (t.id === uuid ? applyPatch(t, patch) : t)));
      tasksService.update(pid, uuid, patch).catch(() => {
        void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
        toast("Couldn't save — showing latest from server");
      });
    },
    [pid, patchTasks, qc, toast, uuidOf],
  );

  const setField = useCallback(
    (id: number, key: string, value: unknown) => {
      if (key === "s")
        patchTask(id, { statusId: board.maps.statusIdByShort.get(value as StatusId) });
      else if (key === "a")
        patchTask(id, {
          assigneeId: value && UUID_RE.test(String(value)) ? String(value) : null,
        });
      else if (key === "p") patchTask(id, { priority: PRIO_API[value as PrioId] });
      else if (key === "pts") patchTask(id, { estimate: Number(value) || null });
      else if (key === "sp") patchTask(id, { iterationId: value ? String(value) : null });
      else if (key === "epic")
        patchTask(id, { epicId: value != null ? (uuidOf(Number(value)) ?? null) : null });
      else if (key === "t") patchTask(id, { title: String(value) });
      else if (key === "due") {
        const iso = dueToIso(String(value));
        patchTask(id, { dueDate: iso ?? null });
      } else if (key === "desc") patchTask(id, { description: JSON.stringify(value) });
    },
    [board.maps, patchTask, uuidOf],
  );

  const toggleSubDone = useCallback(
    (id: number) => {
      const row = board.taskById(id);
      if (row) setField(id, "s", row.s === "done" ? "todo" : "done");
    },
    [board, setField],
  );

  const createIssue = useCallback(
    (input: CreateInput) => {
      const desc = input.desc
        ? {
            type: "doc" as const,
            content: [{ type: "paragraph" as const, content: [{ type: "text" as const, text: input.desc }] }],
          }
        : undefined;
      const body = {
        title: input.title,
        statusId:
          input.ty === "epic"
            ? board.maps.statusIdByShort.get("progress")
            : board.maps.statusIdByShort.get("todo"),
        priority: PRIO_API[input.priority],
        assigneeId: input.assignee && UUID_RE.test(input.assignee) ? input.assignee : null,
        estimate: input.pts || null,
        ...(input.ty !== "subtask" ? { typeId: board.maps.tyIdByTy.get(input.ty) } : {}),
        ...(input.ty === "subtask" && input.parent != null
          ? { parentId: uuidOf(input.parent) ?? null }
          : {}),
        ...(input.sp ? { iterationId: input.sp } : {}),
        ...(input.epic && input.ty !== "subtask" ? { epicId: uuidOf(input.epic) ?? null } : {}),
        ...(input.due && dueToIso(input.due) ? { dueDate: dueToIso(input.due)! } : {}),
        ...(desc ? { description: JSON.stringify(desc) } : {}),
        ...(input.labels.length
          ? {
              labelIds: input.labels
                .map((l) => board.maps.labelIdByName.get(l))
                .filter((x): x is string => !!x),
            }
          : {}),
      };
      const created = tasksService.create(pid, body).then((task) => {
        void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
        return task;
      });
      created.catch(() => toast("Couldn't create issue"));
      return created;
    },
    [board.maps, pid, qc, toast, uuidOf],
  );

  const addSubtask = useCallback(
    (parentId: number) => {
      const parentUuid = uuidOf(parentId);
      if (!pid || !parentUuid) return;
      const created = tasksService
        .create(pid, {
          title: "New subtask",
          parentId: parentUuid,
          statusId: board.maps.statusIdByShort.get("todo"),
        })
        .then((task) => {
          void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
          return task;
        });
      created.catch(() => toast("Couldn't add subtask"));
    },
    [board.maps, pid, qc, toast, uuidOf],
  );

  const addComment = useCallback(
    (uuid: string, text: string) => {
      if (!pid || !uuid) return;
      tasksService
        .addComment(pid, uuid, { body: text })
        .then(() => qc.invalidateQueries({ queryKey: qk.task(pid, uuid) }))
        .catch(() => toast("Couldn't post comment"));
    },
    [pid, qc, toast],
  );

  /** Link two issues. Writes `key` on `taskId` and the reverse on `otherId. */
  const addRelationship = useCallback(
    (taskId: number, key: RelKey, otherId: number) => {
      if (taskId === otherId) return;
      const taskUuid = uuidOf(taskId);
      const otherUuid = uuidOf(otherId);
      if (!pid || !taskUuid || !otherUuid) return;
      const apiType = REL_API_TYPE[key];
      const tempId = `temp-${crypto.randomUUID()}`;
      // link direction on the wire: blockedBy flips source/target
      const sourceId = key === "blockedBy" ? otherUuid : taskUuid;
      const targetId = key === "blockedBy" ? taskUuid : otherUuid;
      const link = {
        id: tempId,
        projectId: pid,
        sourceId,
        targetId,
        type: apiType,
        createdAt: new Date().toISOString(),
      };
      patchTasks((items) =>
        items.map((t) =>
          t.id === taskUuid || t.id === otherUuid ? { ...t, links: [...t.links, link] } : t,
        ),
      );
      tasksService
        .addLink(pid, taskUuid, { targetId: otherUuid, type: apiType })
        .catch(() => {
          void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
          toast("Couldn't add link — showing latest from server");
        });
    },
    [patchTasks, pid, qc, toast, uuidOf],
  );

  /** Remove a link (and its reverse on the other issue). */
  const removeRelationship = useCallback(
    (taskId: number, key: RelKey, otherId: number) => {
      const taskUuid = uuidOf(taskId);
      const otherUuid = uuidOf(otherId);
      if (!pid || !taskUuid || !otherUuid) return;
      let linkId: string | undefined;
      patchTasks((items) =>
        items.map((t) => {
          if (t.id !== taskUuid && t.id !== otherUuid) return t;
          const link = t.links.find(
            (l) =>
              (l.sourceId === taskUuid && l.targetId === otherUuid) ||
              (l.sourceId === otherUuid && l.targetId === taskUuid),
          );
          if (t.id === taskUuid) linkId = link?.id;
          return { ...t, links: t.links.filter((l) => l.id !== link?.id) };
        }),
      );
      if (linkId)
        tasksService.removeLink(pid, taskUuid, linkId).catch(() => {
          void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
          toast("Couldn't remove link — showing latest from server");
        });
    },
    [patchTasks, pid, qc, toast, uuidOf],
  );

  const bulkPatch = useCallback(
    (ids: number[], patchOf: (order: number) => TaskUpdateInput | null) => {
      const entries = ids
        .map((order) => ({ order, uuid: uuidOf(order), patch: patchOf(order) }))
        .filter((x): x is { order: number; uuid: string; patch: TaskUpdateInput } => !!x.uuid && !!x.patch);
      if (!pid || !entries.length) return;
      patchTasks((items) =>
        items.map((t) => {
          const e = entries.find((x) => x.uuid === t.id);
          return e ? applyPatch(t, e.patch) : t;
        }),
      );
      void Promise.allSettled(entries.map((e) => tasksService.update(pid, e.uuid, e.patch))).then(
        (rs) => {
          if (rs.some((r) => r.status === "rejected")) {
            void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
            toast("Some updates failed — showing latest from server");
          }
        },
      );
    },
    [patchTasks, pid, qc, toast, uuidOf],
  );

  const bulkSetStatus = useCallback(
    (ids: number[], s: StatusId) =>
      bulkPatch(ids, (order) => {
        const row = board.taskById(order);
        return row && row.ty !== "epic" ? { statusId: board.maps.statusIdByShort.get(s) } : null;
      }),
    [board, bulkPatch],
  );

  const bulkSetAssignee = useCallback(
    (ids: number[], whoId: string) =>
      bulkPatch(ids, (order) => {
        const row = board.taskById(order);
        return row && row.ty !== "epic"
          ? { assigneeId: whoId && UUID_RE.test(whoId) ? whoId : null }
          : null;
      }),
    [board, bulkPatch],
  );

  const bulkDelete = useCallback(
    (ids: number[]) => {
      const uuids = ids.map(uuidOf).filter((x): x is string => !!x);
      if (!pid || !uuids.length) return;
      patchTasks((items) => items.filter((t) => !uuids.includes(t.id)));
      void Promise.allSettled(uuids.map((uuid) => tasksService.remove(pid, uuid))).then((rs) => {
        if (rs.some((r) => r.status === "rejected")) {
          void qc.invalidateQueries({ queryKey: qk.tasks(pid) });
          toast("Some deletes failed — showing latest from server");
        }
      });
    },
    [patchTasks, pid, qc, toast, uuidOf],
  );

  return {
    setField,
    toggleSubDone,
    createIssue,
    addSubtask,
    addComment,
    addRelationship,
    removeRelationship,
    bulkSetStatus,
    bulkSetAssignee,
    bulkDelete,
  };
}

/* ---- planning (iterations + milestones) ---- */

export interface CreateSprintInput {
  name: string;
  goal: string;
  fromISO: string;
  toISO: string;
  capacity: number | null;
}
export interface MilestoneInput {
  t: string;
  date: string;
  risk: "on_track" | "at_risk";
}

export function usePlanningActions() {
  const { project, toast } = useApp();
  const board = useBoard();
  const qc = useQueryClient();
  const taskActions = useTaskActions();
  const pid = project?.id ?? "";

  const patchIterations = useCallback(
    (fn: (list: Iteration[]) => Iteration[]) => {
      if (!pid) return;
      qc.setQueryData<Iteration[]>(qk.iterations(pid), (list) => (list ? fn(list) : list));
    },
    [pid, qc],
  );
  const iterUpdate = useCallback(
    (sp: string, patch: Partial<IterationUpdateInput>) => {
      if (!pid) return;
      patchIterations((list) => list.map((i) => (i.id === sp ? { ...i, ...patch } : i)));
      planningService.updateIteration(pid, sp, patch).catch(() => {
        void qc.invalidateQueries({ queryKey: qk.iterations(pid) });
        toast("Couldn't update iteration — showing latest from server");
      });
    },
    [patchIterations, pid, qc, toast],
  );
  const patchMilestones = useCallback(
    (fn: (list: Milestone[]) => Milestone[]) => {
      if (!pid) return;
      qc.setQueryData<Milestone[]>(qk.milestones(pid), (list) => (list ? fn(list) : list));
    },
    [pid, qc],
  );

  const completeIter = useCallback(
    (sp: string, silent = false): string => {
      const s = board.sprints[sp];
      if (!s) return "";
      const items = board.iterTasks(sp);
      // leftovers (not done) return to the backlog
      items.forEach((t) => {
        if (t.s !== "done") taskActions.setField(t.id, "sp", null);
      });
      iterUpdate(sp, { status: "completed" });
      return silent ? "" : s.name + " completed · leftover returned to backlog";
    },
    [board, iterUpdate, taskActions],
  );

  const startIter = useCallback(
    (sp: string) => {
      const cur = board.sprintIds.find((k) => board.sprints[k]?.st === "active");
      if (cur && cur !== sp) completeIter(cur, true);
      iterUpdate(sp, { status: "active" });
    },
    [board, completeIter, iterUpdate],
  );

  const revertToPlanned = useCallback(
    (sp: string) => {
      if (board.sprints[sp]?.st !== "active") return;
      iterUpdate(sp, { status: "planned" }); // API may refuse (one-way machine) — server truth wins on refetch
    },
    [board.sprints, iterUpdate],
  );

  const reopenToActive = useCallback(
    (sp: string): string => {
      const s = board.sprints[sp];
      if (!s || s.st !== "completed") return "";
      const cur = board.sprintIds.find((k) => board.sprints[k]?.st === "active");
      let note = "";
      if (cur && cur !== sp) {
        iterUpdate(cur, { status: "planned" });
        note = " (" + board.sprints[cur]!.name + " moved to Planned)";
      }
      iterUpdate(sp, { status: "active" });
      return s.name + " reopened · Active" + note;
    },
    [board.sprintIds, board.sprints, iterUpdate],
  );

  const commitToSprint = useCallback(
    (id: number, sp: string) => {
      if (board.isPlannable(sp)) taskActions.setField(id, "sp", sp);
    },
    [board, taskActions],
  );
  const uncommitFromSprint = useCallback(
    (id: number) => taskActions.setField(id, "sp", null),
    [taskActions],
  );

  const planSprintAuto = useCallback(
    (sp: string): string => {
      if (!board.isPlannable(sp)) return "";
      const cap = board.sprints[sp]?.capacity || 40;
      let pts = board.committedPts(sp);
      let n = 0;
      const items = board
        .allTasks()
        .filter((t) => !t.parent && t.ty !== "epic" && !t.sp)
        .sort((a, b) => ["p1", "p2", "p3", "p4"].indexOf(a.p) - ["p1", "p2", "p3", "p4"].indexOf(b.p));
      for (const t of items) {
        if (pts + (t.pts || 0) > cap) break;
        taskActions.setField(t.id, "sp", sp);
        pts += t.pts || 0;
        n++;
      }
      return n
        ? `Planned ${n} item${n !== 1 ? "s" : ""} into ${board.sprints[sp]!.name}`
        : "Nothing to plan — backlog empty or capacity reached";
    },
    [board, taskActions],
  );

  const createSprint = useCallback(
    (input: CreateSprintInput) => {
      const created = planningService
        .createIteration(pid, {
          name: input.name,
          goal: input.goal || undefined,
          startDate: input.fromISO,
          endDate: input.toISO,
        })
        .then((it) => {
          void qc.invalidateQueries({ queryKey: qk.iterations(pid) });
          return it;
        });
      created.catch(() => toast("Couldn't create iteration"));
      return created;
    },
    [pid, qc, toast],
  );

  const updateSprint = useCallback(
    (sp: string, input: CreateSprintInput) =>
      iterUpdate(sp, {
        name: input.name,
        goal: input.goal || undefined,
        startDate: input.fromISO,
        endDate: input.toISO,
      }),
    [iterUpdate],
  );

  const addMilestone = useCallback(
    (input: MilestoneInput) => {
      const created = planningService
        .createMilestone(pid, { name: input.t, dueDate: input.date })
        .then((m) => {
          void qc.invalidateQueries({ queryKey: qk.milestones(pid) });
          return m;
        });
      created.catch(() => toast("Couldn't add milestone"));
      return created;
    },
    [pid, qc, toast],
  );

  const updateMilestone = useCallback(
    (id: string, input: MilestoneInput) => {
      if (!pid) return;
      patchMilestones((list) =>
        list.map((m) => (m.id === id ? { ...m, name: input.t, dueDate: input.date } : m)),
      );
      planningService
        .updateMilestone(pid, id, { name: input.t, dueDate: input.date })
        .catch(() => {
          void qc.invalidateQueries({ queryKey: qk.milestones(pid) });
          toast("Couldn't update milestone — showing latest from server");
        });
    },
    [patchMilestones, pid, qc, toast],
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      if (!pid) return;
      patchMilestones((list) => list.filter((m) => m.id !== id));
      planningService.deleteMilestone(pid, id).catch(() => {
        void qc.invalidateQueries({ queryKey: qk.milestones(pid) });
        toast("Couldn't delete milestone — showing latest from server");
      });
    },
    [patchMilestones, pid, qc, toast],
  );

  return {
    startIter,
    completeIter,
    revertToPlanned,
    reopenToActive,
    commitToSprint,
    uncommitFromSprint,
    planSprintAuto,
    createSprint,
    updateSprint,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
