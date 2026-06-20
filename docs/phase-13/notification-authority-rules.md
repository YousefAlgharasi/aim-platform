# Phase 13 — Notification Authority Rules

These rules define backend authority for the notification/reminder system and
prevent any client (student mobile, parent, admin) from acting as the source of
truth for notification behavior.

## Backend Is Final Authority For

1. **Scheduling** — `ReminderSchedule.next_run_at` and `status` are computed and
   mutated by the backend only. A client may request a custom reminder, but the
   backend validates and owns the resulting schedule.
2. **Eligibility** — Whether a given event qualifies for a notification (e.g. a
   deadline reminder fires) is decided server-side, evaluated against preferences,
   quiet hours, and rate limits at dispatch time, not at request time.
3. **Quiet hours** — The backend evaluates the recipient's `NotificationQuietHours`
   window before dispatch. No client flag can override or bypass this evaluation.
4. **Rate limits** — The backend tracks and enforces per-user/per-channel send
   rate limits. No client request can force a send that exceeds the limit.
5. **Delivery state** — `NotificationEvent.state` and
   `NotificationDeliveryAttempt.status` are written only by backend delivery
   workers. A client cannot set a notification to "sent" or "delivered" directly.
6. **Token validity** — `DeviceToken.status` (active/revoked/stale) is decided by
   the backend based on provider feedback and rotation logic, not client claims.
7. **User access scope** — Whether a parent may see/manage a given child's
   reminders or notifications is enforced server-side per Phase 12 consent and
   child-scope rules. A client cannot expand its own scope.

## Client (UI) Is Permitted To

- Register a device token via a protected backend API (backend assigns
  `status = active` only after validating ownership).
- Read backend-approved notifications and reminder settings.
- Submit preference updates (channel/category enabled flag) via a protected
  backend API; backend validates ownership before applying.
- Submit a "mark read" / "mark dismissed" request for an in-app notification;
  backend re-validates that the requester owns the notification before mutating
  state.
- Submit quiet-hour window values via a protected backend API; backend validates
  format and ownership before persisting.
- Request creation of a custom reminder; backend validates and assigns the final
  schedule.

## Client Is Never Permitted To

- Set or imply final schedule state (`next_run_at`, `status` on
  `ReminderSchedule`).
- Set or imply final delivery state (`state` on `NotificationEvent`,
  `status` on `NotificationDeliveryAttempt`).
- Claim quiet-hour bypass or rate-limit bypass.
- Claim device token validity directly (e.g. submit `status: active` and have it
  trusted as-is).
- Claim ownership of a notification, reminder, or device token belonging to
  another user.
- Expand parent access beyond the child scope granted under Phase 12 consent.

## Enforcement Pattern

Every notification-related backend endpoint must:

1. Authenticate the caller.
2. Re-derive ownership/relationship server-side (never trust a client-submitted
   `user_id`, `parent_id`, or `recipient_id` for write operations).
3. Re-evaluate eligibility, quiet hours, and rate limits server-side at dispatch
   time, independent of any client-side state.
4. Reject any payload field that attempts to set backend-owned state
   (schedule/delivery/eligibility/quiet-hour-override/token-validity) with a safe
   validation error.

## Audit

Every scheduling, preference, delivery, and token state change is recorded in
`NotificationAuditLog` with a safe, non-sensitive metadata payload, enabling
traceability without exposing private data.
