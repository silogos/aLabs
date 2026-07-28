# Documentation

Version: 1.0.0

---

# Purpose

This directory holds the product and engineering documentation for the platform.

It is the source of truth for vision, scope, domains, and module contracts.

---

# Structure

```text
docs/
├── 00-product.md              Product vision, principles, business model
├── README.md                  This file
├── foundation/                Foundation layer: Identity, Workspace, Project
│   ├── 00-foundation.md
│   ├── 01-authentication.md
│   ├── 02-organization.md
│   └── 03-project.md
├── modules/                   Business modules layered on Foundation
│   ├── 00-modules.md
│   ├── 01-task.md
│   ├── 02-documents.md
│   ├── 03-planning.md
│   ├── 04-meeting.md
│   ├── 05-agreement.md
│   ├── 06-reporting.md
│   ├── 07-client-portal.md
│   ├── 08-notification.md
│   ├── 09-billing.md
│   └── 10-ai.md
└── tech/                      HOW the platform is built
    ├── 00-tech.md
    ├── 01-architecture.md
    ├── 02-conventions.md
    ├── 03-data-model.md
    ├── 04-api-contract.md
    ├── 05-seed-data.md
    ├── 06-glossary.md
    └── adr/                   Architecture Decision Records
```

---

# Reading Order

1. **Product** — `00-product.md` — vision, principles, scope, business model
2. **Foundation overview** — `foundation/00-foundation.md` — shared infrastructure
3. **Foundation domains** — Authentication → Organization → Project
4. **Modules overview** — `modules/00-modules.md` — business capabilities
5. **Module specs** — individual module contracts
6. **Technical docs** — `tech/00-tech.md` — how it is built: architecture, conventions, data model, API contract

---

# Document Status

## Product

| Document | Status |
| -------- | ------ |
| 00-product.md | Draft |

## Foundation

| Document | Status | Priority |
| -------- | ------ | -------- |
| 00-foundation.md | Draft | Critical |
| 01-authentication.md | MVP | Critical |
| 02-organization.md | Draft | Critical |
| 03-project.md | Draft | Critical |

## Modules

| Document | Status | Priority |
| -------- | ------ | -------- |
| 00-modules.md | Draft | — |
| 01-task.md | Draft | High |
| 02-documents.md | Draft | High |
| 03-planning.md | Draft | Medium |
| 04-meeting.md | Draft | Medium |
| 05-agreement.md | Draft | Medium |
| 06-reporting.md | Draft | Medium |
| 07-client-portal.md | Draft | Medium |
| 08-notification.md | Draft | Medium |
| 09-billing.md | Draft | Medium |
| 10-ai.md | Draft | Low |

## Technical

| Document | Status | Priority |
| -------- | ------ | -------- |
| tech/00-tech.md | Draft | — |
| tech/01-architecture.md | Draft | Critical |
| tech/02-conventions.md | Draft | Critical |
| tech/03-data-model.md | Draft | Critical |
| tech/04-api-contract.md | Draft | Critical |
| tech/05-seed-data.md | Draft | Medium |
| tech/06-glossary.md | Draft | — |
| tech/adr/* | Accepted | — |

---

# Conventions

Each spec document carries a metadata header:

- **Version** — semantic version of the document
- **Status** — Draft, MVP, Approved
- **Priority** — Critical, High, Medium, Low
- **Depends On** — documents that must be read or built first

Entity fields are described in tables. API endpoints use HTTP method and path. Permissions follow the `<module>:<action>` convention.

---

# Data Hierarchy

```text
User → Organization → Project → Business Modules
```

- A User is global and may belong to many organizations.
- An Organization is the tenant boundary and is fully isolated.
- A Project belongs to exactly one organization.
- Every business module is scoped to exactly one project (except Notification, Billing, and AI, which are cross-cutting or organization-scoped).

---

# Pending Decisions

Open questions that affect scope or business but are not yet resolved.

## Scope

1. **Integrations** — Slack, GitHub, GitLab, Figma. In scope for v1 or deferred? Not currently described by any document.
2. **Files** — modeled as part of the Documents module. Confirm this is not a standalone module.
3. **White-labeling** — referenced as an Enterprise feature of Client Portal. Confirm scope.
4. **Project roles** — default set is Project Admin, Project Manager, Member, Viewer. Confirm or simplify.

## Business

5. **Pricing** — Professional and Enterprise tier prices, and the Free-tier project limit. Currently TBD in `00-product.md`.
6. **Ideal Customer Profile** — team size assumption (5–100, sweet spot 10–50) in `00-product.md`. To be confirmed.
7. **Competitors** — named incumbents in Positioning are illustrative. Confirm or refine.

## Compliance

8. **Certifications** — SOC 2 / ISO 27001 targets listed as TBD in `00-product.md`. Confirm roadmap.
