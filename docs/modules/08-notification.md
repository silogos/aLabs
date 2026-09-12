# Notification Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation

---

# Overview

The Notification module delivers in-app and email notifications.

It is a cross-cutting service consumed by all other modules.

---

# Objectives

- Notify users of relevant events
- Centralize notification delivery
- Respect user preferences
- Keep an audit of delivered notifications

---

# Responsibilities

Notification module is responsible for:

- In-app notifications
- Email notifications
- Notification preferences
- Unread state

Notification module is NOT responsible for:

- Defining business events (other modules)
- Push notifications (Future)

---

# Domain Model

Entities

- Notification
- NotificationPreference

---

# Notification

| Field         | Type     | Required | Description                                   |
| ------------- | -------- | -------- | --------------------------------------------- |
| id            | UUID     | Yes      | Primary identifier                            |
| userId        | UUID     | Yes      | Recipient                                     |
| type          | String   | Yes      | Event type                                    |
| title         | String   | Yes      | Plain title — canonical (search, email, fallback) |
| titleSegments | Array?   | No       | Title spans; some carry a target the client renders as an inline link |
| body          | String?  | No       | Detail                                        |
| target        | Object?  | No       | Routing data — clients format URLs            |
| readAt        | DateTime | No       | Read timestamp                                |
| createdAt     | DateTime | Yes      | Creation timestamp                            |

---

# NotificationPreference

| Field    | Type    | Required | Description                  |
| -------- | ------- | -------- | ---------------------------- |
| id       | UUID    | Yes      | Primary identifier           |
| userId   | UUID    | Yes      | Owner                        |
| channel  | Enum    | Yes      | InApp, Email                 |
| type     | String  | Yes      | Event type                   |
| enabled  | Boolean | Yes      | Enabled flag                 |

---

# Features

## In-App

- Notification center
- Unread badge
- Mark as read
- Click-through: clicking an item marks it read (when unread) and navigates to its deep link; items without a link only mark read

## Email

- Send transactional emails
- Respect preferences

## Preferences

- Per-channel, per-type opt-in or opt-out

## Triggers

Other modules emit events; the notification service delivers them. Emitters live in `packages/api/src/modules/notification/emit.ts`; type strings match the kinds the UI renders.

| Type    | Emitted when                                    | Recipients                                              |
| ------- | ----------------------------------------------- | ------------------------------------------------------- |
| `assign`   | Task created or reassigned to a user         | The new assignee (never the actor)                      |
| `comment`  | Comment posted on a task (`POST /tasks/:id/comments`) | Task assignee + reporter (never the author, deduped) |
| `invite`   | Workspace invitation created                 | The invitee, only if they already have an account       |

The demo seed additionally creates `mention` and `due` notifications; those types have no runtime emitter yet.

## Targets

Notifications ship **routing data, never URLs** — the backend never learns a client's route scheme. `target` is a discriminated object (`NotificationTarget` in `packages/core/src/schemas/notification.ts`):

| kind       | Payload                                        | Emitted by            |
| ---------- | ---------------------------------------------- | --------------------- |
| `task`     | `{ orgSlug, projectSlug, order }`              | `assign`, `comment`   |
| `members`  | `{ orgSlug }`                                  | `invite`              |

Each client formats its own links. The web app builds them in `apps/web/src/lib/notification-path.ts` (`notificationPath`): task → `/{orgSlug}/{projectSlug}/tasks/{order}` (the segment is the task's **order number**, never the UUID — the task drawer resolves `Number(param)`), members → `/{orgSlug}/members`. Slugs in the payload are data, not routing; the API's own routes still only ever see UUIDs (ADR 0009).

Titles also ship as **segments** (`titleSegments`, mirroring the plain `title`): `{ text, target? }` spans where a target marks an entity inside the sentence — the actor's name links to the members page, the task title/serial links to the task. The web renders these through `apps/web/src/components/notification-title.tsx` (`NotificationTitle`): entity spans become inline links (accent-colored, middle/cmd-click native), everything else stays plain; clicking an entity marks the notification read and navigates to that entity, while clicking elsewhere on the item goes to the primary `target`.

---

# API Endpoints

```http
GET   /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
GET   /notifications/preferences
PATCH /notifications/preferences
```

---

# Permissions

Notifications are scoped to the owning user. No role-based permission beyond authentication.

---

# UI Screens

- Notification dropdown and center
- Preferences page

---

# Out of Scope

- Push notifications (mobile)
- SMS
- Chat and messaging

---

# Future Enhancements

- Push notifications
- Digest emails
- Slack integration

---

# Dependencies

- Foundation
- Email service

---

# Acceptance Criteria

- Events from other modules produce notifications
- Users see unread notifications in-app
- Users can configure preferences
- Email respects preferences
