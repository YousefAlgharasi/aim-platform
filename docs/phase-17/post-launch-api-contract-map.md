# Phase 17 — Post-Launch API Contract Map

**Task:** P17-009
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document backend APIs required by student/parent/admin support and operations UI. Align post-launch APIs with UI implementation.

## API Authority Rule

Backend is the final authority for all operations state. UI displays backend-provided data only. No client-side computation of support status, incident status, maintenance state, feature flag rollout, release note publishing, or operational health.

## User-Facing APIs

### Support Tickets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/support-tickets` | User JWT | Create a new support ticket |
| GET | `/api/support-tickets` | User JWT | List current user's tickets |
| GET | `/api/support-tickets/:id` | User JWT + ownership | Get a single ticket (own only) |
| POST | `/api/support-tickets/:id/comments` | User JWT + ownership | Add a comment to own ticket |

**Request: Create Ticket**
```json
{
  "category": "bug_report | account_issue | learning_issue | billing_issue | general | other",
  "severity": "low | medium | high | critical",
  "subject": "string (max 500)",
  "description": "string"
}
```

**Response: Ticket**
```json
{
  "id": "uuid",
  "requesterId": "uuid",
  "category": "string",
  "severity": "string",
  "status": "open | in_progress | waiting_on_user | resolved | closed",
  "assignedTo": "uuid | null",
  "subject": "string",
  "description": "string",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### User Feedback

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/feedback` | User JWT | Submit feedback |
| GET | `/api/feedback/mine` | User JWT | List own feedback |

**Request: Create Feedback**
```json
{
  "category": "bug_report | suggestion | compliment | complaint | other",
  "rating": "1-5 (optional)",
  "title": "string (max 300)",
  "body": "string",
  "sourceSurface": "mobile_app | admin_dashboard | parent_dashboard | api"
}
```

**Response: Feedback**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "category": "string",
  "rating": "number | null",
  "title": "string",
  "body": "string",
  "sourceSurface": "string",
  "status": "new | under_review | accepted | declined | implemented",
  "createdAt": "ISO 8601"
}
```

### Feature Requests

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/feature-requests` | User JWT | Submit a feature request |
| GET | `/api/feature-requests` | User JWT | List feature requests (public) |
| GET | `/api/feature-requests/:id` | User JWT | Get a single feature request |
| POST | `/api/feature-requests/:id/vote` | User JWT | Vote on a feature request |

**Request: Create Feature Request**
```json
{
  "title": "string (max 300)",
  "description": "string"
}
```

**Response: Feature Request**
```json
{
  "id": "uuid",
  "submittedBy": "uuid",
  "title": "string",
  "description": "string",
  "status": "new | under_review | planned | in_progress | completed | declined",
  "priority": "low | medium | high | critical | null",
  "voteCount": "number",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### Release Notes (Public)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/release-notes` | User JWT | List published release notes |
| GET | `/api/release-notes/:id` | User JWT | Get a single published release note |

**Response: Release Note**
```json
{
  "id": "uuid",
  "version": "string",
  "title": "string",
  "body": "string | null",
  "audience": "all | students | parents | admins | internal",
  "publishedAt": "ISO 8601 | null",
  "createdAt": "ISO 8601"
}
```

### Operational Status (Public)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/operational-status` | Public or User JWT | List all component statuses |

**Response: Operational Status**
```json
{
  "id": "uuid",
  "component": "string",
  "status": "string",
  "description": "string | null",
  "updatedAt": "ISO 8601"
}
```

## Admin-Only APIs

### Support Ticket Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/api/admin/support-tickets/:id/status` | Admin JWT | Update ticket status |
| PATCH | `/api/admin/support-tickets/:id/assign` | Admin JWT | Assign ticket to agent |
| GET | `/api/admin/support-tickets` | Admin JWT | List all tickets |

### Feedback Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/feedback` | Admin JWT | List all feedback |
| PATCH | `/api/admin/feedback/:id/status` | Admin JWT | Triage feedback |

### Feature Request Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/api/admin/feature-requests/:id/triage` | Admin JWT | Triage feature request |

### Incident Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/incidents` | Admin JWT | Create incident |
| PATCH | `/api/admin/incidents/:id/status` | Admin JWT | Update incident status |
| GET | `/api/admin/incidents` | Admin JWT | List incidents |

### Maintenance Windows

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/maintenance-windows` | Admin JWT | Schedule maintenance |
| PATCH | `/api/admin/maintenance-windows/:id/status` | Admin JWT | Update maintenance status |
| GET | `/api/admin/maintenance-windows` | Admin JWT | List maintenance windows |

### Release Notes Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/release-notes` | Admin JWT | Create draft |
| POST | `/api/admin/release-notes/:id/publish` | Admin JWT | Publish release note |
| POST | `/api/admin/release-notes/:id/archive` | Admin JWT | Archive release note |

### Operational Status Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | `/api/admin/operational-status/:component` | Admin JWT | Set component status |

### Feature Flags Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/feature-flags` | Admin JWT | Create flag |
| PATCH | `/api/admin/feature-flags/:id` | Admin JWT | Update flag state |
| GET | `/api/admin/feature-flags` | Admin JWT | List all flags |

## Error Contract

All endpoints return standard error format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

| Code | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized (ownership or role) |
| 404 | Resource not found |
| 500 | Internal server error |

## Pagination

List endpoints support:
- `?page=1&pageSize=20` (default page=1, pageSize=20, max pageSize=100)

Response includes pagination metadata:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Verdict

**READY** — Post-launch API contract map documented. All endpoints follow backend authority rules. No secrets exposed.
