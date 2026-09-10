"use client";

/** Tasks surface layout — the board is the persistent backdrop for both
 * /{org}/{project}/tasks and /{org}/{project}/tasks/{taskNumber}: navigating
 * to a task deep link opens the drawer via the child page without remounting
 * the board (filters, view mode and scroll survive). */
import type { ReactNode } from "react";
import { TasksView } from "@/features/tasks/tasks-view";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TasksView />
      {children}
    </>
  );
}
