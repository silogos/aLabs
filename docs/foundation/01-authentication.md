# Authentication Domain

Version: 1.2.0

Status: MVP

Priority: Critical

Depends On:

- Product
- Foundation

---

# Overview

The Authentication domain is responsible for identifying users and establishing secure sessions within the platform.

Authentication only answers one question:

> "Who is the current user?"

It does not manage organizations, projects, roles, or permissions. Those responsibilities belong to other domains.

The authentication system must be simple, secure, and extensible for future enterprise features.

---

# Objectives

- Allow users to create an account.
- Allow users to securely sign in.
- Maintain authenticated sessions.
- Protect private resources.
- Provide the authenticated user's identity.
- Support future enterprise authentication without major refactoring.

---

# Responsibilities

Authentication is responsible for:

- User registration
- User login
- User logout
- Session management
- Current authenticated user
- Password verification
- Password hashing

Authentication is NOT responsible for:

- Organizations
- Roles
- Permissions
- Invitations
- Billing
- Notifications
- User preferences
- Profile management beyond basic identity

---

# Domain Model

Authentication consists of five entities, all persisted in Postgres (Drizzle):

- User
- Session
- Account (one per provider: `credential` or `google`)
- Password Reset (single-use token)
- OAuth State (single-use CSRF nonce for the Google flow)

---

# User

Represents a person who can access the platform.

Fields

| Field         | Type     | Required | Description               |
| ------------- | -------- | -------- | ------------------------- |
| id            | UUID     | Yes      | Primary identifier        |
| name          | String   | Yes      | Full name                 |
| email         | String   | Yes      | Unique email              |
| image         | String?  | No       | Avatar URL                |
| emailVerified | Boolean  | Yes      | Email verification status |
| createdAt     | DateTime | Yes      | Creation timestamp        |
| updatedAt     | DateTime | Yes      | Last update timestamp     |

---

# Session

Represents an authenticated login session.

Fields

| Field     | Type     |
| --------- | -------- |
| id        | UUID     |
| userId    | UUID     |
| token     | String   |
| expiresAt | DateTime |
| createdAt | DateTime |

Sessions are hand-rolled: opaque `sess-` tokens stored in the `sessions`
table (7-day TTL) and sent as the httpOnly `alabs_session` cookie; a Bearer
token is also accepted (API clients/tests). No third-party auth library.

---

# Account

Authentication provider account — one row per `(userId, provider)`.

- `credential`: stores the scrypt password hash (`scrypt:<salt>:<hash>`).
- `google`: stores the provider-side subject id (`sub`), no password hash.

---

# Password Reset

Single-use, one-hour reset token mailed as a link (logged to the console
until an email provider is selected). Fields: `token`, `userId`,
`expiresAt`, `usedAt`.

---

# OAuth State

Single-use CSRF nonce for the Google SSO redirect flow — persisted in the
`oauth_states` table (10-minute TTL, consumed on callback) so multi-instance
deployments share it. Expired rows are trimmed opportunistically on insert.

---

# Authentication Flow

Register

↓

Create User

↓

Create Session

↓

Redirect Dashboard

---

Login

↓

Validate Credentials

↓

Create Session

↓

Redirect Dashboard

---

Logout

↓

Destroy Session

↓

Redirect Login

---

# Features

## Register

Users can create a new account.

Requirements

- Name required
- Email required
- Password required
- Email must be unique
- Password securely hashed

Acceptance Criteria

- User account created successfully.
- Session created automatically.
- User redirected to dashboard.

---

## Login

Users authenticate using email and password.

Acceptance Criteria

- Invalid credentials return appropriate error.
- Valid credentials create a session.
- Existing sessions persist after refresh.

---

## Logout

Users can terminate the current session.

Acceptance Criteria

- Session destroyed.
- User redirected to login.
- Protected pages become inaccessible.

---

## Session

The application must know the authenticated user at all times.

Requirements

- Persistent sessions
- Automatic session validation
- Session expiration handling

---

## Change Password

Signed-in users can change their password without the email round-trip.

Acceptance Criteria

- Current password is verified first; a mismatch returns 400.
- The new password replaces the credential account's scrypt hash.
- Every session except the current device is revoked.
- Accounts without a credential account (Google-only) are rejected with a
  pointer to the forgot-password flow.

---

## Current User

The frontend must be able to retrieve the authenticated user.

Example response

```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "image": null
}
```

---

# Validation Rules

## Register

Name

- Required
- 2–100 characters

Email

- Required
- Valid email format
- Unique

Password

- Minimum 8 characters

---

## Login

Email

Required

Password

Required

---

# UI Screens

## Login

Contains

- Logo
- Email
- Password
- Login button
- Link to Register
- Google sign-in button (shown when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set)

---

## Register

Contains

- Name
- Email
- Password
- Create Account button
- Link to Login

---

## Forgot / Reset Password

- `/forgot-password` — email field; always confirms (never reveals existence).
- `/reset-password?token=…` — new password form.

---

## Change Password

- Password card on the profile page (`/user`) — current + new password.

---

# Navigation

Guest

```text
/login

/register
```

Authenticated

```text
/
```

The user dashboard at `/` is the post-login landing (recents + workspaces). Unauthorized users attempting to access protected routes should be redirected to Login.

---

# API Endpoints

## Register

POST

```http
/auth/register
```

---

## Login

POST

```http
/auth/login
```

---

## Logout

POST

```http
/auth/logout
```

---

## Current User

GET

```http
/auth/me
```

---

## Google SSO — Start

GET

```http
/auth/oauth/google
```

Redirects to Google's consent screen with a fresh `state` nonce persisted to
the `oauth_states` table. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
(returns 503 otherwise).

---

## Google SSO — Callback

GET

```http
/auth/oauth/google/callback
```

Google redirects here with `?code&state`. Validates the state against
`oauth_states` (single-use, 10-minute TTL), exchanges the code, upserts the
user by email, creates a session, and redirects to the web app (`WEB_URL`).

---

## Change Password

POST

```http
/auth/change-password
```

Body: `{ "currentPassword": "...", "password": "..." }` (min 8 chars; session
required). Verifies the current password, rotates the scrypt hash, and revokes
every session except the current one.

---

## Forgot Password

POST

```http
/auth/forgot-password
```

Body: `{ "email": "..." }`. Always returns 200 (never reveals whether the email exists). Emails a one-hour, single-use reset token — logged to the console until an email provider is selected; returned as `resetPath` outside production so the flow is testable.

---

## Reset Password

POST

```http
/auth/reset-password
```

Body: `{ "token": "...", "password": "..." }` (min 8 chars). Invalidates all of the user's sessions.

---

# Error Handling

Examples

Duplicate email

```text
Email already exists.
```

Invalid credentials

```text
Invalid email or password.
```

Unauthorized

```text
Authentication required.
```

Session expired

```text
Your session has expired.
Please sign in again.
```

---

# Security Requirements

Passwords must never be stored in plain text.

Passwords must be hashed.

Sessions must be secure.

Authentication endpoints must validate all input.

Rate limiting should be supported in the future.

HTTPS is required in production.

---

# Non-Functional Requirements

Performance

- Login response under 500 ms
- Session lookup under 100 ms

Reliability

- Sessions survive browser refresh.
- Graceful handling of expired sessions.

Scalability

- Compatible with multiple authentication providers in the future.

---

# Future Enhancements

Not included in MVP.

- Email Verification
- Magic Link
- GitHub Login
- Microsoft Login
- Two-Factor Authentication (2FA)
- Single Sign-On (SAML/OIDC, enterprise)
- Passkeys
- Session Management UI
- Device History

Implemented past MVP:

- Forgot Password (v1.1)
- Reset Password (v1.1)
- Google Login (v1.1)
- Change Password while signed in (v1.2)

---

# Out of Scope

This module does NOT implement:

- Organization
- Workspace
- Project
- Task
- Role
- Permission
- Invitation
- Billing
- AI

Those belong to other domains.

---

# Dependencies

Requires

- PostgreSQL
- Drizzle ORM
- Hono
- React
- node:crypto (scrypt)

---

# Acceptance Criteria

Authentication is complete when:

- Users can register.
- Users can log in.
- Users can log out.
- Sessions persist after refresh.
- Protected routes require authentication.
- Current user information is available to the frontend.
- Authentication logic is isolated from Organization and Project domains.
