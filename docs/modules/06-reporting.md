# Reporting Module

Version: 1.0.0
Status: Draft
Priority: Medium
Depends On:
- Foundation
- Task
- Planning
- Meeting

---

# Overview

The Reporting module turns project data into visibility.

It aggregates data from other modules into dashboards and exportable reports.

---

# Objectives

- Provide project dashboards
- Surface progress, velocity, and risks
- Enable exportable reports
- Support stakeholder communication

---

# Responsibilities

Reporting module is responsible for:

- Dashboards
- Standard reports
- Custom report builder (Future)
- Export (PDF, CSV)

Reporting module is NOT responsible for:

- Storing source data (owned by other modules)
- Client-facing portal (Client Portal module)

---

# Domain Model

Reporting is primarily read-only and aggregates other modules.

Entities

- SavedReport (Future)

---

# Features

## Dashboards

- Project overview (tasks by status, progress)
- Iteration progress
- Workload by assignee

## Standard Reports

- Status report
- Progress report
- Activity report

## Export

- Export to PDF
- Export to CSV

## Advanced Reporting (Professional tier)

- Custom date ranges
- Cross-project views
- Scheduling

---

# API Endpoints

```http
GET /projects/:projectId/reporting/dashboard
GET /projects/:projectId/reporting/progress
GET /projects/:projectId/reporting/activity
GET /projects/:projectId/reporting/export?format=pdf
```

---

# Permissions

- reporting:view
- reporting:export

---

# UI Screens

- Project dashboard
- Reports list
- Report viewer

---

# Out of Scope

- Real-time analytics streaming
- Custom SQL queries

---

# Future Enhancements

- Custom report builder
- Scheduled email reports
- AI report generation (AI add-on)

---

# Dependencies

- Foundation
- Task
- Planning
- Meeting

---

# Acceptance Criteria

- Project dashboard shows task progress
- Standard reports are available
- Reports can be exported to PDF and CSV
- Data reflects the current state of source modules
