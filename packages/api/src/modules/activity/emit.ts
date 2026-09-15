/** Activity feed emitters — the write side modules call after their
 *  mutations (the read side lives in db/activity-repo.ts and the
 *  reporting/org routes; the demo seed writes its own rows). Rows are plain
 *  display data for the dashboard feeds: `kind` maps to the icons/verbs the
 *  UI renders, `target` is the bold display string (task serial `<KEY>-<n>`
 *  or a project name), and live rows leave `whenLabel` empty so clients keep
 *  computing timeAgo(when) — a stored label would freeze. */
import * as activityRepo from "../../db/activity-repo";
import * as projectRepo from "../../db/project-repo";
import type { TaskWithMeta } from "../../db/task-repo";

/** Task serial `<KEY>-<order>` — the display string every feed renders.
 *  Null when the project vanished mid-request; emitters skip silently. */
async function taskSerialTarget(task: TaskWithMeta): Promise<string | null> {
  const project = await projectRepo.getProject(task.projectId);
  return project ? `${project.key}-${task.order}` : null;
}

/** Task status change — `done` when the task landed in a status named
 *  "Done" (the same convention milestone recompute uses), `move` otherwise. */
export async function emitTaskStatusChanged(
  task: TaskWithMeta,
  actorId: string,
  toStatusName: string,
): Promise<void> {
  const target = await taskSerialTarget(task);
  if (!target) return;
  await activityRepo.insertActivity({
    projectId: task.projectId,
    kind: toStatusName === "Done" ? "done" : "move",
    actorId,
    target,
  });
}

/** Task comment. */
export async function emitTaskCommented(task: TaskWithMeta, actorId: string): Promise<void> {
  const target = await taskSerialTarget(task);
  if (!target) return;
  await activityRepo.insertActivity({
    projectId: task.projectId,
    kind: "com",
    actorId,
    target,
  });
}

/** Project created — the org-wide feed's "new project" event. The row
 *  references (and only ever appears in) the project it announces. */
export async function emitProjectCreated(
  project: { id: string; name: string },
  actorId: string,
): Promise<void> {
  await activityRepo.insertActivity({
    projectId: project.id,
    kind: "proj",
    actorId,
    target: project.name,
  });
}
