# Phase 13 — Notification API Contract Map

**Dependency:** P13-002 (Notification Domain Map)

## Purpose

Document backend APIs used by mobile (student), parent, and admin notification
UIs. This contract aligns backend and frontend before implementation. All
endpoints require authentication; ownership/scope is re-validated server-side on
every request per `docs/phase-13/notification-authority-rules.md`.

## Base URL

```
/api/v1/notifications
```

## Authentication

```
Authorization: Bearer <jwt>
```

The JWT must contain a valid `user_id` and `role` (`student`, `parent`, or
`admin`). Endpoints below are grouped by required role.

## Common Response Shapes

### Success

```json
{ "data": { ... }, "meta": { "timestamp": "ISO-8601" } }
```

### Paginated

```json
{ "data": [ ... ], "meta": { "timestamp": "ISO-8601", "page": 1, "pageSize": 20, "total": 42 } }
```

### Error

```json
{ "error": { "code": "string", "message": "string" }, "meta": { "timestamp": "ISO-8601" } }
```

## Student/Parent Endpoints (role: student | parent)

| Method | Path | Purpose | Backend Authority Notes |
|---|---|---|---|
| GET | `/feed` | List in-app notifications for the caller | Returns only the caller's own events |
| PATCH | `/feed/:id/read` | Mark a notification read | Backend re-validates ownership before mutating state |
| PATCH | `/feed/:id/dismiss` | Mark a notification dismissed | Backend re-validates ownership before mutating state |
| GET | `/preferences` | Read the caller's notification preferences | Own data only |
| PUT | `/preferences` | Update channel/category enabled flags | Backend validates ownership; client cannot set other backend-owned fields |
| GET | `/quiet-hours` | Read the caller's quiet-hour window | Own data only |
| PUT | `/quiet-hours` | Update quiet-hour window | Backend validates format/ownership; does not affect already-queued dispatch decisions retroactively |
| POST | `/device-tokens` | Register a device token | Backend assigns `status` after validating ownership; never trusts client-submitted status |
| DELETE | `/device-tokens/:id` | Unregister a device token (caller's own) | Backend validates ownership before deletion |
| GET | `/reminders` | List the caller's reminder schedules | Own data only; backend-owned `next_run_at`/`status` are read-only fields |
| POST | `/reminders` | Request a custom reminder | Backend validates and assigns final schedule; client-submitted cadence/time is a request, not a guarantee |
| PATCH | `/reminders/:id` | Pause/cancel a caller-owned custom reminder | Backend validates ownership; system-generated reminders (learning_plan, deadline) are not client-cancellable |

## Parent-Specific Endpoints (role: parent)

| Method | Path | Purpose | Backend Authority Notes |
|---|---|---|---|
| GET | `/parent/children/:childId/digest` | Read latest parent summary digest for a linked child | Backend enforces active link + consent (`progress_view`/`report_view`/`full_access`) before returning data |

## Admin Endpoints (role: admin, read-only unless explicitly extended)

| Method | Path | Purpose | Backend Authority Notes |
|---|---|---|---|
| GET | `/admin/templates` | List notification templates | Read-only |
| GET | `/admin/events` | List notification events (oversight) | Read-only; payload remains privacy-safe per Notification Privacy Rules |
| GET | `/admin/delivery-attempts` | List delivery attempts (oversight) | Read-only; no provider credentials in response |
| GET | `/admin/audit-logs` | List notification audit logs | Read-only |

Admin write access to templates (create/update/disable) is out of scope for
Phase 13 unless a specific task explicitly grants it.

## Validation Rules Referenced

All request DTOs are validated per `docs/phase-13/notification-validation-rules`
output (P13-021) once implemented; no endpoint accepts client-submitted
schedule/delivery/eligibility/quiet-hour-override fields as authoritative.
