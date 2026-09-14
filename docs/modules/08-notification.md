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

| Field      | Type     | Required | Description        |
| ---------- | -------- | -------- | ------------------ |
| id         | UUID     | Yes      | Primary identifier |
| userId     | UUID     | Yes      | Recipient          |
| type       | String   | Yes      | Event type         |
| title      | String   | Yes      | Short title        |
| body       | String?  | No       | Detail             |
| link       | String?  | No       | Deep link          |
| readAt     | DateTime | No       | Read timestamp     |
| createdAt  | DateTime | Yes      | Creation timestamp |

---

# NotificationPreference

| Field      | Type     | Required | Description                  |
| ---------- | -------- | -------- | ---------------------------- |
| id         | UUID     | Yes      | Primary identifier           |
| userId     | UUID     | Yes      | Owner                        |
| channel    | Enum     | Yes      | InApp, Email                 |
| type       | String   | Yes      | Event type                   |
| enabled    | Boolean  | Yes      | Enabled flag                 |
| createdAt  | DateTime | Yes      | Creation timestamp           |
| updatedAt  | DateTime | Yes      | Last change timestamp        |

Rows are overrides only: an absent `(userId, channel, type)` row means **enabled** — users opt out, not in. The unique key is `(userId, channel, type)`; writes upsert against it.

---

# Features

## In-App

- Notification center
- Unread badge
- Mark as read

## Email

- Send transactional emails
- Respect preferences

## Preferences

- Per-channel, per-type opt-in or opt-out
- Absent row = enabled (default opt-in); rows exist only where a user changed something
- GET resolves the full matrix (every notifiable type × channel) with defaults filled in, so the UI never reconstructs defaults client-side
- In-app emitters consult the recipient's `in_app` preference before inserting; opt-outs take effect on the next emitted event (existing notifications are untouched)
- Only types with a runtime emitter are preferencable today: `assign`, `comment`, `invite`

## Triggers

Other modules emit events; the notification service delivers them. Emitters live in `packages/api/src/modules/notification/emit.ts`; type strings match the kinds the UI renders.

| Type    | Emitted when                                    | Recipients                                              |
| ------- | ----------------------------------------------- | ------------------------------------------------------- |
| `assign`   | Task created or reassigned to a user         | The new assignee (never the actor)                      |
| `comment`  | Comment posted on a task (`POST /tasks/:id/comments`) | Task assignee + reporter (never the author, deduped) |
| `invite`   | Workspace invitation created                 | The invitee, only if they already have an account       |

The demo seed additionally creates `mention` and `due` notifications; those types have no runtime emitter yet.

Before inserting, every emitter subtracts recipients who disabled the emitted type on the `in_app` channel (`notification-repo.ts` → `inAppOptedOut`). The `email` channel has no delivery path yet — email provider pick is deferred — so email rows persist but gate nothing today.

---

# API Endpoints

```http
GET   /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
GET   /notifications/preferences
PATCH /notifications/preferences
```

`GET /notifications/preferences` → `{ data: [{ channel, type, enabled }, …] }` — the resolved matrix, owner-scoped.

`PATCH /notifications/preferences` with `{ channel, type, enabled }` upserts one preference (400 on unknown channel/type) and returns the stored triple.

---

# Permissions

Notifications are scoped to the owning user. No role-based permission beyond authentication.

---

# UI Screens

- Notification dropdown and center
- Preferences card on the notifications page — per-type in-app toggles (optimistic, rolled back on failure); email toggles arrive with email delivery

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
