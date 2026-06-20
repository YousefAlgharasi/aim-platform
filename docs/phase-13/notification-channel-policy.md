# Phase 13 — Notification Channel Policy

Defines supported notification channels, their boundaries, fallback behavior, and
explicitly disabled channels for Phase 13.

## Supported Channels

### In-App
- Always available; does not require device registration or provider integration.
- Source of truth for read/dismissed state lives in `NotificationEvent`.
- Every notification category supports in-app delivery as the baseline channel.

### Push
- Requires an active `DeviceToken` (iOS/Android) registered through a protected
  backend API.
- Delivered through a provider-abstracted dispatch layer (no provider name or
  credential is hardcoded into business logic — see Notification Authority Rules
  and Notification Privacy Rules).
- If no active device token exists for a recipient, push delivery is skipped
  (not retried as a push failure) and falls back to in-app only.

### Email
- Reuses and extends the Phase 12 parent notification channel
  (`parent_notification_preferences`) for parent-facing categories, and is
  available to students where a verified email exists.
- Subject to the same preference/quiet-hour/rate-limit evaluation as other
  channels.

## Disabled Channels (Phase 13)

- **SMS** — not implemented in Phase 13. Any reference to SMS in Phase 12
  preference scaffolding remains inert until a future phase explicitly enables it.
- **Third-party chat/webhook channels** (e.g. Slack, WhatsApp) — out of scope.

## Fallback Rules

1. If a recipient has push enabled but no active device token, the backend
   delivers in-app only and does not create a failed push delivery attempt.
2. If a channel delivery attempt fails after configured retries, the backend
   does not silently switch channels; failure is recorded on that channel's
   `NotificationDeliveryAttempt` and the in-app notification (if applicable)
   remains the durable record for the user.
3. Digest notifications (daily/weekly) are delivered through whichever channels
   the recipient has enabled for the digest category; digests do not bypass
   per-channel preferences.

## Per-Channel Authority

- Channel eligibility for a given send is always evaluated server-side against
  `NotificationPreference`, `NotificationQuietHours`, and rate limits — see
  `docs/phase-13/notification-authority-rules.md`.
- No channel may be selected or forced by client input at request time.

## Category-to-Channel Defaults

| Category | In-App | Push | Email |
|---|---|---|---|
| learning_reminder | yes | yes | no (default off) |
| deadline_reminder | yes | yes | yes |
| progress_update | yes | no (default off) | yes |
| assessment_result | yes | yes | yes |
| parent_summary | yes | no | yes |
| system_alert | yes | yes | yes |

Defaults are backend-seeded and remain user-adjustable through
`NotificationPreference`, subject to backend validation.
