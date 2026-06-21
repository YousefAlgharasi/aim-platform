# Phase 15 — Analytics Event Taxonomy

## Purpose

Define the allowed backend analytics events and their safe metadata fields, so
event tracking is standardized and never leaks sensitive data.

## Event Envelope

Every `analytics_events` row uses this shape:

- `event_type` — string, one of the approved types below.
- `actor_role` — `student` | `parent` | `admin` | `system`.
- `actor_id` — nullable user/student id (null for system-generated events).
- `subject_type` — the entity the event is about (`lesson`, `assessment`,
  `subscription`, `notification`, `user`, ...).
- `subject_id` — id of the subject entity.
- `occurred_at` — when the underlying action happened.
- `metadata` — JSON object restricted to the allowlisted fields for that
  `event_type` (see below).

## Approved Event Types and Safe Metadata

### Learning

- `lesson.started` — metadata: `lesson_id`, `unit_id`.
- `lesson.completed` — metadata: `lesson_id`, `unit_id`, `duration_seconds`.
- `session.started` / `session.ended` — metadata: `session_type`,
  `duration_seconds`.

### Placement

- `placement.completed` — metadata: `result_level` (no raw answers).

### Curriculum

- `curriculum.unit_started` / `curriculum.unit_completed` — metadata: `unit_id`,
  `path_id`.
- `curriculum.path_assigned` — metadata: `path_id`.

### Assessments

- `assessment.assigned` — metadata: `assessment_id`, `assessment_type`.
- `assessment.submitted` — metadata: `assessment_id`, `assessment_type`.
- `assessment.scored` — metadata: `assessment_id`, `score`, `passed` (no raw
  answer content).

### Notifications

- `notification.delivered` — metadata: `category`, `channel`.
- `notification.read` — metadata: `category`, `channel`.
- `reminder.delivered` / `reminder.acted` — metadata: `reminder_type`.

### Billing

- `subscription.created` / `subscription.canceled` / `subscription.renewed` —
  metadata: `plan_key`, `status` (no payment instrument data).
- `payment.succeeded` / `payment.failed` — metadata: `amount`, `currency`,
  `status` (no provider payload, no card data).
- `invoice.issued` — metadata: `amount`, `currency`, `period_start`, `period_end`.

### Users

- `user.registered` — metadata: `role`.
- `user.login` — metadata: `role` (no credentials, no tokens).

### Analytics / Operations

- `analytics.export_requested` / `analytics.export_completed` — metadata:
  `export_type`, `scope`.
- `analytics.access_denied` — metadata: `attempted_resource`, `reason`.

## Forbidden Metadata Fields (Any Event Type)

- Raw answer text, raw transcript content, raw AI/voice output.
- Raw payment provider payloads, card numbers, payment tokens.
- Passwords, auth tokens, session secrets, service-role keys, API keys.
- Free-text PII (full name, email, phone, address) unless the event type is
  explicitly role-scoped row-level data the viewer already has legitimate
  access to (handled outside `analytics_events`, not via metadata).

## Adding a New Event Type

A new event type must:

1. Be added to this taxonomy with its allowlisted metadata fields.
2. Map to an existing or new metric definition in
   `docs/phase-15/analytics-kpi-catalog.md`.
3. Pass privacy review against `docs/phase-15/analytics-privacy-data-safety-rules.md`.

## Dependencies

- P15-002 — Analytics Domain Map.
- P15-004 — Analytics Privacy and Data Safety Rules.
