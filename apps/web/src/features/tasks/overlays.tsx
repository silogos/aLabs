/** Global task overlays — relation picker, create modal. Mounted by the
 * (project) layout (not the shell) so shared chrome never imports from a
 * feature. State (relPickerId/createOpen) lives in AppProvider; the detail
 * drawer is NOT here — it is the /{org}/{project}/tasks/[taskId] route. */
import { useApp } from "@/providers/app-provider";
import { RelModal } from "./rel-modal";
import { TaskModal } from "./task-modal";

export function TaskOverlays() {
  const { relPickerId, createOpen } = useApp();
  return (
    <>
      {relPickerId && <RelModal />}
      {createOpen && <TaskModal />}
    </>
  );
}
