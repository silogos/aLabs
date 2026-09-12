/** In-app notification emitters — the write side modules call after their
 *  mutations (the read side lives in routes.ts). Type strings are the ones
 *  the UI maps to icons: assign, comment, invite. Notifications are
 *  user-scoped, so every recipient must be a real user row — emitters skip
 *  silently when there is nobody to notify (self-action, unknown email). */
import * as notificationRepo from "../../db/notification-repo";
import * as authRepo from "../../db/auth-repo";
import * as orgRepo from "../../db/org-repo";
import * as projectRepo from "../../db/project-repo";
import type { Invitation } from "@pmin/core";
import type { TaskWithMeta } from "../../db/task-repo";

/** titles land in varchar(200); bodies render as one quote line */
const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1)}…`);

/** Deep link to a task — /:orgSlug/:projectSlug/tasks/:taskId */
async function taskLink(task: TaskWithMeta): Promise<string | null> {
  const project = await projectRepo.getProject(task.projectId);
  if (!project) return null;
  const org = await orgRepo.getOrganization(project.organizationId);
  return org ? `/${org.slug}/${project.slug}/tasks/${task.id}` : null;
}

/** Actor display name for titles — authenticated users always resolve, the
 *  fallback only guards against a mid-request delete. */
async function actorName(actorId: string): Promise<string> {
  const [actor] = await authRepo.getUsersByIds([actorId]);
  return actor?.name ?? "Someone";
}

/** Task assigned (create or reassign) — notifies only the new assignee,
 *  never the actor. Clearing the assignee emits nothing. */
export async function notifyTaskAssigned(task: TaskWithMeta, actorId: string): Promise<void> {
  if (!task.assigneeId || task.assigneeId === actorId) return;
  await notificationRepo.insertNotification({
    userId: task.assigneeId,
    type: "assign",
    title: `${await actorName(actorId)} assigned you a task`,
    body: task.title,
    link: await taskLink(task),
  });
}

/** Task comment — notifies the assignee and the reporter (deduped),
 *  excluding the comment author. */
export async function notifyTaskCommented(
  task: TaskWithMeta,
  actorId: string,
  body: string,
): Promise<void> {
  const recipients = [...new Set([task.assigneeId, task.reporterId])]
    .filter((id): id is string => !!id && id !== actorId);
  if (recipients.length === 0) return;
  const name = await actorName(actorId);
  const link = await taskLink(task);
  for (const userId of recipients) {
    await notificationRepo.insertNotification({
      userId,
      type: "comment",
      title: `${name} commented on ${clip(task.title, 100)}`,
      body: clip(body, 280),
      link,
    });
  }
}

/** Invitation created — notifies the invitee only if they already have an
 *  account (users self-register; email delivery is deferred). */
export async function notifyInvitationCreated(
  invitation: Invitation,
  actorId: string,
): Promise<void> {
  const invitee = await authRepo.getUserByEmail(invitation.email);
  if (!invitee || invitee.id === actorId) return;
  const org = await orgRepo.getOrganization(invitation.organizationId);
  if (!org) return;
  await notificationRepo.insertNotification({
    userId: invitee.id,
    type: "invite",
    title: `${await actorName(actorId)} invited you to join ${org.name}`,
    body: `Workspace invitation · role: ${invitation.roleName}`,
    link: `/${org.slug}/members`,
  });
}
