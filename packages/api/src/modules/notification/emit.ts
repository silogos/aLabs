/** In-app notification emitters — the write side modules call after their
 *  mutations (the read side lives in routes.ts). Type strings are the ones
 *  the UI maps to icons: assign, comment, invite. Notifications are
 *  user-scoped, so every recipient must be a real user row — emitters skip
 *  silently when there is nobody to notify (self-action, unknown email).
 *
 *  Titles ship twice: `title` (plain varchar(200)) and `titleSegments`
 *  (spans whose targets the client renders as inline links — actor →
 *  members page, task text → task). Routing data only, never URLs. */
import * as notificationRepo from "../../db/notification-repo";
import * as authRepo from "../../db/auth-repo";
import * as orgRepo from "../../db/org-repo";
import * as projectRepo from "../../db/project-repo";
import type { Invitation, NotificationTarget, NotificationTitleSegment } from "@pmin/core";
import type { TaskWithMeta } from "../../db/task-repo";

/** titles land in varchar(200); bodies render as one quote line */
const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1)}…`);

/** Org+project slugs for a task, resolved once per emission. */
async function taskLocale(
  task: TaskWithMeta,
): Promise<{ orgSlug: string; projectSlug: string } | null> {
  const project = await projectRepo.getProject(task.projectId);
  if (!project) return null;
  const org = await orgRepo.getOrganization(project.organizationId);
  return org ? { orgSlug: org.slug, projectSlug: project.slug } : null;
}

/** Routing data for a task notification — slugs + the task's ORDER number
 *  (the number clients render their task routes from; never the UUID).
 *  Raw data only: the client formats its own URLs. */
function taskTarget(
  task: TaskWithMeta,
  locale: { orgSlug: string; projectSlug: string } | null,
): NotificationTarget | null {
  return locale ? { kind: "task", ...locale, order: task.order } : null;
}

/** Title spans linking the actor (→ the org's members page — the only
 *  roster surface) followed by the plain rest of the sentence. */
function actorFirstSegments(
  actor: string,
  rest: string,
  members: NotificationTarget | null,
): NotificationTitleSegment[] {
  return [
    { text: actor, target: members },
    { text: rest },
  ];
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
  const locale = await taskLocale(task);
  const name = await actorName(actorId);
  await notificationRepo.insertNotification({
    userId: task.assigneeId,
    type: "assign",
    title: `${name} assigned you a task`,
    titleSegments: actorFirstSegments(
      name,
      " assigned you a task",
      locale ? { kind: "members", orgSlug: locale.orgSlug } : null,
    ),
    body: task.title,
    target: taskTarget(task, locale),
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
  const locale = await taskLocale(task);
  const name = await actorName(actorId);
  const target = taskTarget(task, locale);
  const taskText = clip(task.title, 100);
  const titleSegments: NotificationTitleSegment[] = [
    { text: name, target: locale ? { kind: "members", orgSlug: locale.orgSlug } : null },
    { text: " commented on " },
    { text: taskText, target },
  ];
  for (const userId of recipients) {
    await notificationRepo.insertNotification({
      userId,
      type: "comment",
      title: `${name} commented on ${taskText}`,
      titleSegments,
      body: clip(body, 280),
      target,
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
  const name = await actorName(actorId);
  await notificationRepo.insertNotification({
    userId: invitee.id,
    type: "invite",
    title: `${name} invited you to join ${org.name}`,
    titleSegments: actorFirstSegments(name, ` invited you to join ${org.name}`, {
      kind: "members",
      orgSlug: org.slug,
    }),
    body: `Workspace invitation · role: ${invitation.roleName}`,
    target: { kind: "members", orgSlug: org.slug },
  });
}
