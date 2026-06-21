# Phase 13 — Notification Domain Map

Domain model for the notification/reminder system. This map precedes implementation
and defines entities, ownership, and relationships. Backend owns every entity below;
no client may write authoritative state directly.

## Entities

### NotificationTemplate
- Reusable, locale- and channel-scoped content for a notification category/event type.
- Fields: id, key, channel (in_app | push | email), locale, status (active | disabled),
  category, title_template, body_template (safe placeholders only — no embedded
  secrets or raw AIM output), created_at, updated_at.
- Owned by backend admin tooling. Read-only to all other clients.

### NotificationPreference
- Per-user (student or parent), per-channel, per-category opt-in/opt-out.
- Fields: id, user_id, user_type, channel, category, enabled, created_at, updated_at.
- Extends the Phase 12 `parent_notification_preferences` concept to cover students
  and the full Phase 13 category set.
- Writable by the owning user only, through backend APIs. Backend enforces ownership.

### DeviceToken
- Mobile push registration.
- Fields: id, user_id, platform (ios | android), token, status (active | revoked |
  stale), last_seen_at, created_at, updated_at.
- Registered by the owning client through a protected backend API. Backend owns
  validity/rotation/disable decisions — client cannot mark a token authoritative.

### NotificationEvent
- A single notification instance directed at a recipient (in-app + push fan-out).
- Fields: id, recipient_id, recipient_type, template_id, category, channel,
  payload (privacy-safe JSON), state (scheduled | queued | sent | failed |
  delivered | dismissed | read), created_at, updated_at.
- Backend is sole writer of `state`. Client may only request "mark read/dismissed"
  through a backend API that re-validates ownership before mutating state.

### ReminderSchedule
- Backend-controlled recurring or one-off reminder plan.
- Fields: id, owner_id, owner_type, kind (learning_plan | review | deadline |
  streak | custom), cadence (cron-like or interval descriptor), next_run_at,
  status (active | paused | completed | cancelled), created_at, updated_at.
- Client may request creation of a custom reminder; backend validates and owns the
  resulting schedule's authoritative state.

### NotificationDeliveryAttempt
- One attempt to deliver a NotificationEvent over a channel.
- Fields: id, notification_event_id, channel, provider (abstracted, e.g. "fcm",
  "apns", "smtp"), attempt_number, status (pending | success | failed),
  error_code (safe, non-sensitive), created_at.
- Provider secrets/credentials are never stored on this row — only a provider name
  and safe error metadata.

### NotificationDigest
- Grouped daily/weekly summary of NotificationEvents for a recipient.
- Fields: id, recipient_id, recipient_type, period (daily | weekly), period_start,
  period_end, event_ids (references, not raw payload duplication), state
  (pending | sent), created_at.

### NotificationQuietHours
- Per-user quiet-hour window.
- Fields: id, user_id, user_type, start_time, end_time, timezone, created_at,
  updated_at.
- Backend evaluates quiet hours at dispatch time; client display is read-only.

### NotificationAuditLog
- Safe, non-sensitive trace of scheduling/preference/delivery/token events.
- Fields: id, actor_id, actor_type, action, entity_type, entity_id, metadata (safe
  JSON, no secrets/PII), created_at.

## Relationships

- `NotificationEvent.template_id` → `NotificationTemplate.id`
- `NotificationEvent.recipient_id` → `User.id` (student or parent)
- `NotificationDeliveryAttempt.notification_event_id` → `NotificationEvent.id`
- `NotificationDigest.event_ids` → `NotificationEvent.id[]`
- `ReminderSchedule.owner_id` → `User.id` (student, or parent for child-scoped
  reminders, subject to Phase 12 consent/child-scope rules)
- `DeviceToken.user_id` → `User.id`
- `NotificationPreference.user_id` → `User.id`
- `NotificationQuietHours.user_id` → `User.id`
- `NotificationAuditLog.actor_id` → `User.id` (or `system` for backend-initiated
  actions)

## Ownership Summary

| Entity | Backend writes | Client writes |
|---|---|---|
| NotificationTemplate | content, status | none |
| NotificationPreference | none (validates) | enabled flag, via API |
| DeviceToken | status, validity | token registration, via API |
| NotificationEvent | state, payload | read/dismissed request, via API |
| ReminderSchedule | next_run_at, status | creation request (custom), via API |
| NotificationDeliveryAttempt | all fields | none |
| NotificationDigest | all fields | none |
| NotificationQuietHours | none (validates) | window values, via API |
| NotificationAuditLog | all fields | none |
