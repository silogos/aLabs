# Authentication Domain

Version: 1.1.0

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

Authentication consists of three entities.

- User
- Session
- Account (managed by Better Auth)

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
| expiresAt | DateTime |
| createdAt | DateTime |

Session persistence is handled by Better Auth.

---

# Account

Authentication provider account.

Managed by Better Auth.

No custom business logic should depend on this entity.

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

Authentication requires only two pages.

## Login

Contains

- Logo
- Email
- Password
- Login button
- Link to Register

---

## Register

Contains

- Name
- Email
- Password
- Create Account button
- Link to Login

---

# Navigation

Guest

```text
/login

/register
```

Authenticated

```text
/dashboard
```

Unauthorized users attempting to access protected routes should be redirected to Login.

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

Redirects to Google's consent screen. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (returns 503 otherwise).

---

## Google SSO — Callback

GET

```http
/auth/oauth/google/callback
```

Google redirects here with `?code&state`. Exchanges the code, upserts the user by email, creates a session, and redirects to the web app (`WEB_URL`).

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

Implemented past MVP (v1.1):

- Forgot Password
- Reset Password
- Google Login

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

- Better Auth
- PostgreSQL
- Drizzle ORM
- Hono
- React

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
