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

## Email

- Send transactional emails
- Respect preferences

## Preferences

- Per-channel, per-type opt-in or opt-out

## Triggers

Other modules emit events; the notification service delivers them.

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
