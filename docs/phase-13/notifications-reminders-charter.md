# Phase 13 — Notifications and Reminders Charter

## Purpose

Phase 13 gives AIM a backend-controlled notification and reminder system: templates,
preferences, device tokens, in-app notifications, push delivery readiness, reminder
schedules, quiet hours, rate limits, queues, delivery attempts, retries, digests,
learning/deadline reminders, parent summaries, audit logs, and the student/parent/admin
UI that displays them.

## In Scope

- Notification templates (locale, channel, safe content metadata).
- Student and parent notification preferences (channel + category).
- Device token registration for push delivery (no provider keys committed).
- In-app notification feed (read/dismissed state).
- Reminder schedules: learning plans, review/spaced-repetition, deadlines, streaks.
- Quiet hours per student/parent account.
- Rate limiting and queueing for outbound notifications.
- Delivery attempts, retry/backoff, and delivery state tracking.
- Digest grouping (daily/weekly summaries) to avoid notification spam.
- Notification audit logs (safe, non-sensitive).
- Student mobile, parent, and admin notification UI (admin is read-only unless a
  task explicitly grants otherwise).

## Out of Scope

- Payments (Phase 14).
- Voice AI, AI Teacher, AI Prompt Management, AI Cost Control.
- Student Web App.
- Parent Dashboard expansion beyond notification-related surfaces.
- Admin Dashboard expansion beyond read-only notification oversight.
- Full analytics dashboards.

Any of the above may only be touched as readiness documentation when a specific
task explicitly requests it — never as implementation.

## Channels

- In-app (always available, backend-authoritative read/dismissed state).
- Push (mobile device tokens, provider-abstracted).
- Email (existing Phase 12 parent notification preference channel, extended for
  Phase 13 categories where applicable).

SMS is not in scope for Phase 13.

## Privacy Rules

- Notification payloads must never include secrets, provider keys, service-role
  keys, database credentials, full sensitive answers, private child data, raw AIM
  outputs, or sensitive assessment payloads.
- Parent-facing notifications must respect Phase 12 consent and child-scope rules
  (see `docs/phase-12/parent-data-retention-rules.md` and
  `docs/phase-12/parent-privacy-consent-rules.md`).
- Templates and audit logs store safe, non-sensitive content only.

## Delivery Boundaries (Backend Authority)

The backend is the sole source of truth for:

- Notification eligibility and final schedule state.
- Quiet-hour evaluation and override decisions.
- Rate-limit evaluation and bypass.
- Delivery state (queued, sent, failed, retried, delivered, dismissed, read).
- Device token validity and ownership.
- Recipient access scope (student vs. parent vs. admin, and parent-child scope).

UI clients (student mobile, parent, admin) may only:

- Register device tokens through protected backend APIs.
- Display backend-approved notifications and reminder settings.
- Update preferences through protected backend APIs.
- Mark in-app notifications read/dismissed through backend APIs.

No client may compute or assert final notification, schedule, or delivery state.

## Dependencies

- P12-077 — Parent Data Retention Rules (Phase 12 privacy/consent foundation that
  Phase 13 parent notifications must respect).

## Design System

All Phase 13 UI must use the approved AIM design system at
`docs/design/source/aim-design-system` — tokens, typography, spacing, radius/
elevation, shared components, responsive layout, Arabic/RTL readiness, and
accessibility-safe states. No one-off styling.
