# Documents Module

Version: 1.0.0
Status: Draft
Priority: High
Depends On:
- Foundation

---

# Overview

Documents is a first-class module for capturing and preserving project knowledge.

The platform treats documentation as core, not an afterthought.

Documents also manages file attachments.

---

# Objectives

- Author and organize project documentation
- Structure docs hierarchically (spaces and pages)
- Support rich text editing
- Manage file attachments
- Preserve project history

---

# Responsibilities

Documents module is responsible for:

- Document (page) authoring
- Document hierarchy (spaces, pages, subpages)
- File upload and storage
- Version history
- Full-text search

Documents module is NOT responsible for:

- Agreements (Agreement module)
- Reports (Reporting module)
- Meeting notes storage (Meeting module owns its own notes)

---

# Domain Model

Entities

- Space
- Page
- File

---

# Space

Top-level container for pages.

| Field     | Type    | Required | Description        |
| --------- | ------- | -------- | ------------------ |
| id        | UUID    | Yes      | Primary identifier |
| projectId | UUID    | Yes      | Owning project     |
| name      | String  | Yes      | Space name         |
| icon      | String? | No       | Emoji or icon      |
| order     | Integer | Yes      | Display order      |

---

# Page

A document.

| Field      | Type     | Required | Description                    |
| ---------- | -------- | -------- | ------------------------------ |
| id         | UUID     | Yes      | Primary identifier             |
| projectId  | UUID     | Yes      | Owning project                 |
| spaceId    | UUID     | Yes      | Parent space                   |
| parentId   | UUID?    | No       | Parent page                    |
| title      | String   | Yes      | Page title                     |
| content    | JSON     | Yes      | Rich text body (block model)   |
| icon       | String?  | No       | Page icon                      |
| order      | Integer  | Yes      | Sort order                     |
| createdBy  | UUID     | Yes      | Author                         |
| createdAt  | DateTime | Yes      | Creation timestamp             |
| updatedAt  | DateTime | Yes      | Last update timestamp          |

---

# File

Uploaded attachment.

| Field       | Type     | Required | Description        |
| ----------- | -------- | -------- | ------------------ |
| id          | UUID     | Yes      | Primary identifier |
| projectId   | UUID     | Yes      | Owning project     |
| name        | String   | Yes      | File name          |
| mimeType    | String   | Yes      | MIME type          |
| size        | Integer  | Yes      | Bytes              |
| url         | String   | Yes      | Storage URL        |
| uploadedBy  | UUID     | Yes      | Uploader           |
| createdAt   | DateTime | Yes      | Upload timestamp   |

---

# Features

## Spaces

- Create spaces to group pages
- Reorder

## Pages

- Create, edit, delete pages
- Nest pages
- Rich text editor (block-based)
- Drag and drop reordering

## Files

- Upload attachments
- Attach files to pages or tasks
- Preview common formats

## Version History

- Track page edits
- Restore previous versions

## Search

- Full-text search across pages

---

# API Endpoints

```http
GET    /projects/:projectId/documents/spaces
POST   /projects/:projectId/documents/spaces
GET    /projects/:projectId/documents/pages
POST   /projects/:projectId/documents/pages
GET    /projects/:projectId/documents/pages/:id
PATCH  /projects/:projectId/documents/pages/:id
DELETE /projects/:projectId/documents/pages/:id
POST   /projects/:projectId/documents/files
GET    /projects/:projectId/documents/search
```

---

# Permissions

- document:view
- document:create
- document:update
- document:delete
- file:upload

---

# UI Screens

- Document tree sidebar
- Page editor
- File manager

---

# Out of Scope

- Real-time multi-user co-editing (Future)
- Comments on documents (Future)
- Export to PDF or Word (Future)

---

# Future Enhancements

- Collaborative real-time editing
- Page comments and discussions
- Templates
- Export (PDF, Markdown, Word)
- Page sharing links
- AI document assistant (AI add-on)

---

# Dependencies

- Foundation
- File storage service
- Search index

---

# Acceptance Criteria

- Spaces and pages can be created and nested
- Rich text content can be authored
- Files can be uploaded and attached
- Page history is preserved
- Documents are searchable
