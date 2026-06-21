# Phase 17: Post-Launch Operations API Contracts

## Overview

This document describes all API endpoints implemented for the AIM Platform Post-Launch Operations system. All endpoints are served from the backend API (`services/backend-api`).

---

## Authentication

All endpoints require a valid Supabase JWT in the `Authorization: Bearer <token>` header unless otherwise noted.

Admin endpoints require the authenticated user to have an `admin` or `super_admin` role.

---

## User Endpoints

### Support Tickets

**Controller:** `support-ticket.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/support-tickets` | Create a support ticket | User |
| GET | `/support-tickets` | List own support tickets | User |
| GET | `/support-tickets/:id` | Get own ticket by ID | User (ownership) |
| POST | `/support-tickets/:id/comments` | Add comment to own ticket | User (ownership) |

**POST /support-tickets**
- Request body: `CreateSupportTicketDto`
  ```json
  {
    "category": "bug_report" | "account_issue" | "learning_issue" | "billing_issue" | "general" | "other",
    "severity": "low" | "medium" | "high" | "critical",
    "subject": "string (max 500 chars)",
    "description": "string"
  }
  ```
- Response: `201 Created` — `SupportTicket` object
- Errors: `401 Unauthorized`, `400 Bad Request`

**POST /support-tickets/:id/comments**
- Request body: `CreateTicketCommentDto`
  ```json
  {
    "body": "string",
    "visibility": "public" | "internal" (optional, default: "public")
  }
  ```
- Response: `201 Created` — `SupportTicketComment` object
- Errors: `401 Unauthorized`, `404 Not Found`

### Feedback

**Controller:** `feedback.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/feedback` | Submit user feedback | User |
| GET | `/feedback/mine` | List own feedback | User |

**POST /feedback**
- Request body: `CreateFeedbackDto`
  ```json
  {
    "category": "bug_report" | "suggestion" | "compliment" | "complaint" | "other",
    "rating": 1-5 (optional),
    "title": "string (max 300 chars)",
    "body": "string",
    "sourceSurface": "mobile_app" | "admin_dashboard" | "parent_dashboard" | "api"
  }
  ```
- Response: `201 Created` — `UserFeedback` object
- Errors: `401 Unauthorized`, `400 Bad Request`

### Feature Requests

**Controller:** `feature-request.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/feature-requests` | Submit a feature request | User |
| GET | `/feature-requests` | List feature requests | User |
| GET | `/feature-requests/:id` | Get feature request by ID | User |
| POST | `/feature-requests/:id/vote` | Vote on a feature request | User |

**POST /feature-requests**
- Request body: `CreateFeatureRequestDto`
  ```json
  {
    "title": "string (max 300 chars)",
    "description": "string"
  }
  ```
- Response: `201 Created` — `FeatureRequest` object

**GET /feature-requests**
- Query params: `limit` (default 50), `offset` (default 0)
- Response: `200 OK` — `FeatureRequest[]`

### Release Notes (Public)

**Controller:** `release-notes.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/release-notes` | List published release notes | User |
| GET | `/release-notes/:id` | Get a published release note | User |

**GET /release-notes**
- Query params: `audience` (optional filter)
- Response: `200 OK` — `ReleaseNote[]`

### Operational Status (Public)

**Controller:** `operational-status.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/operational-status` | List all component statuses | User |

- Response: `200 OK` — `OperationalStatus[]`

### Maintenance Windows (Public)

**Controller:** `maintenance-window.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/maintenance-windows` | List active/upcoming windows | User |

- Response: `200 OK` — `MaintenanceWindow[]`

---

## Admin Endpoints

### Admin Support Tickets

**Controller:** `admin-support.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/admin/support-tickets` | List all tickets | Admin |
| PATCH | `/admin/support-tickets/:id/status` | Update ticket status | Admin |
| PATCH | `/admin/support-tickets/:id/assign` | Assign ticket | Admin |

**PATCH /admin/support-tickets/:id/status**
- Request body:
  ```json
  {
    "status": "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed"
  }
  ```
- Response: `200 OK` — `SupportTicket` object
- Errors: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

**PATCH /admin/support-tickets/:id/assign**
- Request body:
  ```json
  {
    "assigneeId": "uuid"
  }
  ```
- Response: `200 OK` — `SupportTicket` object

### Admin Incidents

**Controller:** `admin-incident.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/incidents` | Create an incident | Admin |
| GET | `/admin/incidents` | List all incidents | Admin |
| PATCH | `/admin/incidents/:id/status` | Update incident status | Admin |

**POST /admin/incidents**
- Request body: `CreateIncidentDto`
  ```json
  {
    "title": "string (max 500 chars)",
    "description": "string",
    "severity": "minor" | "major" | "critical",
    "startedAt": "ISO 8601 date string"
  }
  ```
- Response: `201 Created` — `IncidentRecord` object

**PATCH /admin/incidents/:id/status**
- Request body: `UpdateIncidentStatusDto`
  ```json
  {
    "status": "investigating" | "identified" | "monitoring" | "resolved" | "postmortem",
    "resolvedAt": "ISO 8601 date string (optional)",
    "postmortemUrl": "URL (optional)"
  }
  ```
- Response: `200 OK` — `IncidentRecord` object

### Admin Maintenance Windows

**Controller:** `admin-maintenance.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/maintenance-windows` | Create a maintenance window | Admin |
| GET | `/admin/maintenance-windows` | List all maintenance windows | Admin |
| PATCH | `/admin/maintenance-windows/:id/status` | Update window status | Admin |

**POST /admin/maintenance-windows**
- Request body: `CreateMaintenanceWindowDto`
  ```json
  {
    "title": "string (max 500 chars)",
    "description": "string (optional)",
    "type": "planned" | "emergency",
    "scheduledStart": "ISO 8601 date string",
    "scheduledEnd": "ISO 8601 date string",
    "affectedServices": ["string"],
    "userMessage": "string (optional)"
  }
  ```
- Response: `201 Created` — `MaintenanceWindow` object

**PATCH /admin/maintenance-windows/:id/status**
- Request body: `UpdateMaintenanceStatusDto`
  ```json
  {
    "status": "scheduled" | "in_progress" | "completed" | "cancelled",
    "actualStart": "ISO 8601 date string (optional)",
    "actualEnd": "ISO 8601 date string (optional)"
  }
  ```
- Response: `200 OK` — `MaintenanceWindow` object

### Admin Release Notes

**Controller:** `admin-release-notes.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/release-notes` | Create a release note draft | Admin |
| POST | `/admin/release-notes/:id/publish` | Publish a release note | Admin |
| POST | `/admin/release-notes/:id/archive` | Archive a release note | Admin |
| GET | `/admin/release-notes` | List all release notes (drafts included) | Admin |

**POST /admin/release-notes**
- Request body: `CreateReleaseNoteDto`
  ```json
  {
    "version": "string (max 50 chars)",
    "title": "string (max 500 chars)",
    "body": "string",
    "audience": "all" | "students" | "parents" | "admins" | "internal"
  }
  ```
- Response: `201 Created` — `ReleaseNote` object

### Admin Feature Flags

**Controller:** `admin-feature-flags.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/feature-flags` | Create a feature flag | Admin |
| GET | `/admin/feature-flags` | List all feature flags | Admin |
| PATCH | `/admin/feature-flags/:id` | Update a feature flag | Admin |

**POST /admin/feature-flags**
- Request body: `CreateFeatureFlagDto`
  ```json
  {
    "flagKey": "string (max 100 chars)",
    "name": "string (max 200 chars)",
    "description": "string (optional)"
  }
  ```
- Response: `201 Created` — `FeatureFlag` object

**PATCH /admin/feature-flags/:id**
- Request body: `UpdateFeatureFlagDto`
  ```json
  {
    "enabled": true | false (optional),
    "rolloutPercentage": 0-100 (optional),
    "audience": {} (optional)
  }
  ```
- Response: `200 OK` — `FeatureFlag` object

### Admin Operations Dashboard

**Controller:** `admin-operations-dashboard.controller.ts`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/admin/operations/dashboard` | Get operations summary | Admin |

- Response: `200 OK`
  ```json
  {
    "openTickets": 5,
    "activeIncidents": 1,
    "upcomingMaintenance": 2,
    "componentStatuses": 8,
    "summary": {
      "tickets": { "total": 42, "open": 5 },
      "incidents": { "total": 10, "active": 1 },
      "maintenance": { "upcoming": 2 },
      "components": { "total": 8 }
    }
  }
  ```

---

## Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request — invalid input, validation failure |
| 401 | Unauthorized — missing or invalid JWT token |
| 403 | Forbidden — insufficient permissions (non-admin accessing admin endpoints, ownership violation) |
| 404 | Not Found — resource does not exist |
| 500 | Internal Server Error |

---

## Guards and Decorators

- **SupabaseJwtAuthGuard**: Validates the JWT token from Supabase Auth
- **OperationsOwnershipGuard**: Ensures the user is authenticated and the resource type is recognized (used with `@OperationsResource()`)
- **OperationsAdminGuard**: Ensures the user has `admin` or `super_admin` role (used with `@OperationsAdminOnly()`)
- **@OperationsResource(resource)**: Marks a handler with a resource type for ownership validation
- **@OperationsAdminOnly()**: Marks a handler as admin-only
- **@CurrentUser()**: Extracts the authenticated user from the request
