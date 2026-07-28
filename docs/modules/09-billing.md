# Billing Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation
- Organization

---

# Overview

The Billing module handles subscription plans and payments.

It implements the platform's business model across Free, Professional, and Enterprise tiers.

Billing is organization-scoped, not project-scoped.

---

# Objectives

- Manage organization subscriptions
- Handle payments
- Enforce plan limits
- Record invoices

---

# Responsibilities

Billing module is responsible for:

- Plans and pricing
- Subscriptions
- Payment collection
- Usage limits
- Invoices

Billing module is NOT responsible for:

- Client contract values (Agreement module)
- Feature access control (Permissions)

---

# Domain Model

Entities

- Plan
- Subscription
- Invoice

---

# Plan

| Field        | Type     | Required | Description                            |
| ------------ | -------- | -------- | -------------------------------------- |
| id           | UUID     | Yes      | Primary identifier                     |
| name         | String   | Yes      | Free, Professional, Enterprise         |
| price        | Decimal  | Yes      | Monthly price                          |
| currency     | String   | Yes      | Currency code                          |
| projectLimit | Integer? | No       | Max projects (null = unlimited)        |
| features     | JSON     | Yes      | Enabled feature flags                  |

---

# Subscription

| Field             | Type     | Required | Description                          |
| ----------------- | -------- | -------- | ------------------------------------ |
| id                | UUID     | Yes      | Primary identifier                   |
| organizationId    | UUID     | Yes      | Owning organization                  |
| planId            | UUID     | Yes      | Current plan                         |
| status            | Enum     | Yes      | Active, Past Due, Canceled           |
| currentPeriodEnd  | DateTime | Yes      | Period end                           |
| createdAt         | DateTime | Yes      | Creation timestamp                   |

---

# Invoice

| Field          | Type     | Required | Description              |
| -------------- | -------- | -------- | ------------------------ |
| id             | UUID     | Yes      | Primary identifier       |
| organizationId | UUID     | Yes      | Owning organization      |
| amount         | Decimal  | Yes      | Total                    |
| currency       | String   | Yes      | Currency code            |
| status         | Enum     | Yes      | Paid, Pending, Failed    |
| issuedAt       | DateTime | Yes      | Issue date               |

---

# Features

## Plans

- Free, Professional, Enterprise
- AI add-on

## Subscriptions

- Upgrade and downgrade
- Cancel

## Limits

- Enforce project limits by plan
- Feature gating (Client Portal, Advanced Reporting)

## Invoices

- View history
- Download

---

# API Endpoints

```http
GET  /organizations/:organizationId/billing/subscription
POST /organizations/:organizationId/billing/checkout
POST /organizations/:organizationId/billing/portal
GET  /organizations/:organizationId/billing/invoices
```

---

# Permissions

- billing:manage (Owner, Admin)

---

# UI Screens

- Plan selection
- Subscription management
- Invoice list

---

# Out of Scope

- Tax calculation engine
- Multi-currency accounting
- Refund processing UI

---

# Future Enhancements

- Usage-based pricing
- Proration handling
- Coupons

---

# Dependencies

- Foundation
- Organization
- Payment provider (Stripe)

---

# Acceptance Criteria

- Organizations can subscribe to a plan
- Plan limits are enforced
- Invoices are recorded and downloadable
- Upgrades and downgrades are supported
