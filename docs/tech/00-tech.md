# Technical Documentation

Version: 1.0.0
Status: Draft

---

# Purpose

The technical documentation is the HOW layer: how the platform is built.

The product, foundation, and module docs describe WHAT we are building.

This folder describes HOW it is implemented so that engineering, and AI-assisted coding, produce consistent, correct results.

---

# Structure

```text
docs/tech/
├── 00-tech.md          This index
├── 01-architecture.md  System, repo layout, request lifecycle
├── 02-conventions.md   Engineering standards (read first when coding)
├── 03-data-model.md    DB-precise schema reference
├── 04-api-contract.md  REST contract conventions + route catalog
├── 05-seed-data.md     Default roles, statuses, plans
├── 06-glossary.md      Term definitions
└── adr/                Architecture Decision Records
```

---

# Reading Order

1. **Architecture** — the big picture, repo layout, request lifecycle
2. **Conventions** — the rules every module must follow
3. **Data Model** — exact table and column definitions
4. **API Contract** — request/response shapes and the route catalog
5. **Seed Data** — the constants every environment starts with
6. **Glossary** — reference when a term is unclear
7. **ADRs** — reference for why a decision was made

---

# Relationship to Other Docs

| Folder      | Question answered |
| ----------- | ----------------- |
| `00-product` | What are we building and why? |
| `foundation` | What are the core domains? |
| `modules`    | What does each module do? |
| `tech`       | How is it built? |

---

# Status of Technical Decisions

Technical choices marked `_TBD_` in `docs/00-product.md` (file storage, search, email, payments, AI provider) are listed here as decisions to make before implementation, not as blockers for the conventions.
