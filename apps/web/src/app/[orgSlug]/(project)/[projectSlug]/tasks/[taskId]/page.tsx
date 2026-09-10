"use client";

/** Task deep link — /{orgSlug}/{projectSlug}/tasks/{taskNumber}. The board
 * renders from the tasks layout (persistent backdrop); this page just shows
 * the detail drawer for the routed task id. */
import { useParams } from "next/navigation";
import { TaskDrawer } from "@/features/tasks/task-drawer";

export default function TaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  return taskId ? <TaskDrawer id={taskId} /> : null;
}
