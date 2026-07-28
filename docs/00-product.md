# Product Overview

Version: 1.1.0
Status: Draft

---

# Purpose

This document defines what we are building, who it is for, and why.

It is the top-level strategy document. Every foundation and module spec derives from it.

It is written for internal alignment, not for marketing.

---

# Vision

A project management platform purpose-built for software delivery.

Simple enough for a two-person team. Scalable enough for an enterprise.

Most tools either track tasks or store documents. This platform unifies delivery, documentation, planning, and client communication in one place, so every project has a single source of truth from requirement to maintenance.

Artificial Intelligence is an optional enhancement. It is never the core experience.

---

# Mission

Give software teams an affordable, documentation-first platform to deliver projects with full visibility, for the team and for the client.

We compete on clarity and value, not on seat count.

---

# Positioning

The market splits into two failures.

- Enterprise suites (Jira, the Atlassian stack) are powerful but expensive, complex, and closed to clients.
- Lightweight trackers (Trello, basic boards) are simple but lack documentation depth, planning, and enterprise controls.

We sit in the middle: structured enough for real delivery, simple enough to adopt, and open to clients by design.

Differentiators

- Documentation is a first-class citizen, not a bolt-on wiki.
- Built-in client transparency.
- Seat-free pricing. We charge for value (projects, features), not for people.
- AI that assists, never gates.

_Named competitors are illustrative and can be refined._

---

# Problems We Solve

| Problem                              | Today                                         | Our Answer                                                    |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------------------- |
| Expensive per-user pricing           | Cost scales with headcount                    | Seat-free. We charge by projects and features                 |
| Complex configuration                | Weeks to set up workflows                     | Sensible defaults. Adoptable in minutes                       |
| Documentation is an afterthought     | Docs live in a separate, ignored wiki         | Documentation is built into every project                     |
| Clients are locked out               | Progress shared via screenshots and calls     | Built-in client portal with controlled visibility             |
| Knowledge scattered across tools     | Tasks, docs, and decisions in different apps  | One source of truth per project                               |
| AI forced into every workflow        | AI you cannot turn off                        | AI is an optional add-on. Everything works without it         |

---

# Product Principles

## Project First

Every business activity belongs to a Project. Nothing floats free.

## Documentation First

Documentation is a first-class citizen. Projects preserve knowledge.

## AI Optional

Every feature works without AI. AI only enhances productivity.

## Enterprise Ready

Built for long-term, sensitive use. Security and isolation are not bolt-ons.

## Simplicity

Avoid unnecessary complexity. Sensible defaults over infinite configuration.

## Modular

Each module is independently maintainable. No circular dependencies.

---

# Target Customers

## Ideal Customer Profile

- Software delivery teams of roughly 5–100 people (sweet spot: 10–50)
- Building software for clients or for internal stakeholders
- Need both execution tracking and knowledge retention
- Currently spread across three or more tools

_ICP sizing is a working assumption to be confirmed._

## Primary Buyers

- Software House
- Digital Agency
- Startup
- Internal IT Department
- IT Consultant

## Users

- Product Manager
- Project Manager
- Business Analyst
- Software Engineer
- QA Engineer
- UI/UX Designer

## Future Markets

- Enterprise
- Government
- University

---

# Product Architecture

## Hierarchy

```text
User → Organization → Project → Modules
```

- A User is global and may join many organizations.
- An Organization is the tenant boundary. Data is isolated.
- A Project belongs to exactly one organization.
- Every module is scoped to a project (except Notification, Billing, and AI).

## Foundation

The shared layer every module depends on.

- Authentication (Identity)
- Organization (Workspace)
- Project

See `docs/foundation`.

## Modules

Business capabilities layered on Foundation.

- Delivery: Task, Planning
- Knowledge: Documents
- Collaboration: Meeting, Client Portal
- Governance: Agreement, Reporting
- Platform: Notification, Billing, AI

See `docs/modules`.

## Delivery Lifecycle

A project moves through:

```text
Requirement → Planning → Execution → Review → Delivery → Maintenance
```

Each stage maps to modules.

- Requirement → Documents, Agreement
- Planning → Planning
- Execution → Task
- Review → Meeting, Reporting
- Delivery → Client Portal, Agreement
- Maintenance → Documents, Task

## Roadmap

Phase 1 — Foundation

- Authentication, Organization, Project

Phase 2 — Core Delivery

- Task, Documents

Phase 3 — Coordination

- Planning, Meeting

Phase 4 — Client and Governance

- Agreement, Reporting, Client Portal

Phase 5 — Platform

- Notification, Billing

Phase 6 — Enhancement

- AI add-on

_Roadmap phasing is a proposal derived from module dependencies._

---

# AI Strategy

AI is never required. The platform is fully usable with AI disabled.

AI assists with synthesis, never with decisions.

- Requirement analysis
- Planning forecasts
- Meeting summaries
- Report drafts
- Document improvements

Rules

- Every AI output is a suggestion.
- Every AI output requires human review before use.
- AI never blocks a workflow.
- AI is a paid add-on.

---

# Business Model

## Principle

We monetize on value (projects and features), not on seats.

Users are free on every plan. This removes the adoption friction that incumbents exploit.

## Tiers

| Tier         | Price   | Projects         | Key Features                                      |
| ------------ | ------- | ---------------- | ------------------------------------------------- |
| Free         | $0      | Limited (_TBD_)  | Core modules, unlimited users                     |
| Professional | _TBD_   | Unlimited        | Client Portal, Advanced Reporting                 |
| Enterprise   | _TBD_   | Unlimited        | Self-hosted, SSO, Audit Logs, Advanced Permissions |

## Add-ons

AI Add-on (separate, available on any tier)

- Forecast Planning
- Smart Suggestions
- Document Assistant
- Report Assistant

## Delivery

- SaaS (hosted) is the primary go-to-market.
- Self-hosted is available on Enterprise, via Docker.

_Pricing numbers and the free-tier project limit are to be confirmed._

---

# Technology

## Principles

- Boring and proven over novel.
- Portable. Runs anywhere via Docker.
- Self-hostable from day one (enables Enterprise).
- Low runtime cost.
- Type-safe end to end.

## Stack

| Layer    | Choice              | Why                                              |
| -------- | ------------------- | ------------------------------------------------ |
| Frontend | React, TypeScript   | Large hiring pool, type safety                   |
| Backend  | Hono                | Lightweight, fast, edge-ready                    |
| Database | PostgreSQL          | Relational integrity for hierarchical multi-tenant data |
| ORM      | Drizzle             | SQL-first, type-safe, predictable                |
| Auth     | Better Auth         | Sessions, organizations, OAuth without a managed vendor |

## Infrastructure

To be selected.

- File storage — object storage (S3-compatible)
- Search — full-text index for Documents
- Email — transactional email service
- Payments — provider for Billing (e.g. Stripe)
- AI — provider for the AI add-on

## Deployment

Docker for self-hosting and portable deployment.

---

# Enterprise and Trust

Enterprise Ready is a principle, not just a tier. The platform is built for long-term, sensitive use.

## Posture

- Multi-tenant isolation by organization.
- Role-based access at workspace and project level.
- Audit-friendly design (Audit Logs in Enterprise).
- SSO ready (Enterprise).

## Data Ownership

- Customers own their data.
- Self-hosting gives full data-residency control.
- AI features never train on customer data without consent.

## Compliance

Target certifications to be defined as Enterprise demand emerges.

_TBD: SOC 2, ISO 27001._

---

# Success Criteria

We measure success by outcomes, not by engagement vanity metrics.

## Product

- Time to first project under 5 minutes.
- First task and first document created in a single session.
- Every core workflow completable without AI.

## Experience

- Fast, keyboard-friendly navigation.
- Documentation that is written and read, not avoided.
- Clients able to self-serve project status.

## Business

- Healthy free-to-paid conversion driven by project count and feature need.
- Enterprise adoption validated by self-host deployments.

---

# Out of Scope

The platform is NOT:

- ERP
- CRM
- Accounting
- HRIS
- Inventory System
- POS

We integrate with these systems where it matters. We do not replace them.

Third-party integrations (Slack, GitHub, GitLab, Figma) are scoped separately. See Pending Decisions in `docs/README.md`.
