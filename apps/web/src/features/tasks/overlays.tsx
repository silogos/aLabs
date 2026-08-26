/** Global task overlays — detail drawer, relation picker, create modal.
 *  Mounted by the (app) layout (not the shell) so shared chrome never imports
 *  from a feature. State (taskId/relPickerId/createOpen) lives in AppProvider. */
import { useApp } from "@/providers/app-provider";
import { TaskDrawer } from "./task-drawer";
import { RelModal } from "./rel-modal";
import { TaskModal } from "./task-modal";

export function TaskOverlays() {
  const { taskId, relPickerId, createOpen } = useApp();
  return (
    <>
      {taskId && <TaskDrawer id={taskId} />}
      {relPickerId && <RelModal />}
      {createOpen && <TaskModal />}
    </>
  );
}
