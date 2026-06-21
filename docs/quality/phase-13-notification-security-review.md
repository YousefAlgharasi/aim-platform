# Phase 13 Notification Security Review

Scope: review of `services/backend-api/src/features/notifications/*`
covering permissions, device tokens, provider secrets, payload safety,
rate limits, and audit logs.

## Permissions / ownership

- All parent-facing controllers (`inbox.controller.ts`,
  `preferences.controller.ts`, `reminders.controller.ts`,
  `device-token.controller.ts`) are guarded by
  `SupabaseJwtAuthGuard` + `NotificationOwnershipGuard`, and derive the
  acting user from `@CurrentUser()` — no endpoint accepts a caller-supplied
  user id or child id to act on someone else's notification data.
- `NotificationOwnershipGuard` itself only verifies the request is
  authenticated; the actual per-resource ownership check happens one
  layer down, at the SQL level:
  - `updateScheduleStatus(scheduleId, userId, status)` —
    `WHERE id = $2 AND user_id = $3`
  - `updateEventStatus` (mark read/dismiss) — scoped by `userId`
  - `disableDeviceToken(tokenId, userId)` — `WHERE id = $1 AND user_id = $2`
  - This means a caller cannot pause/cancel/resume another user's
    reminder, mark another user's notification read, or disable
    another user's device token, even though the guard name suggests
    the guard itself enforces it. **Recommendation:** rename or extend
    `NotificationOwnershipGuard` to make explicit that ownership is
    enforced at the repository layer, not the guard layer, so future
    contributors don't assume the guard alone is sufficient and skip
    the `WHERE ... AND user_id = $n` clause when adding new mutation
    endpoints.
- Admin endpoints (`notifications-admin.controller.ts`) are guarded by
  `SupabaseJwtAuthGuard` + `NotificationAdminGuard`, which checks
  `user.role === 'admin'`. `findAttemptsByEventId` (used only by this
  admin controller) intentionally has no per-user scoping, which is
  correct for an admin-only, read-only audit view.

## Device tokens

- `isValidPlatform`/`isValidDeviceToken` validate platform enum and
  token length (1–512 chars) before persisting.
- Token registration/disable both go through `DeviceTokenService`,
  which always scopes by the authenticated `userId`.
- The no-op push provider adapter logs only the first 8 characters of
  a token (`payload.token.substring(0, 8)`), not the full token — no
  full device token is ever written to logs.

## Provider secrets

- No `process.env` reads exist anywhere under
  `features/notifications/` — the current push/email provider
  adapters (`NoopPushProviderAdapter`, `NoopEmailProviderAdapter`) are
  placeholder no-op implementations with no real provider API keys
  wired in yet. There is nothing to leak today.
- **Recommendation for whoever wires a real provider adapter later:**
  load provider credentials from the existing secrets-management
  pattern used elsewhere in `backend-api` (not inline `process.env`
  reads inside this feature folder), and ensure no adapter ever logs a
  full token, API key, or raw provider response body.

## Payload safety

- `containsSensitiveData()` in `notification-validation.helpers.ts`
  scans audit-log metadata for patterns like `secret`, `password`,
  `api_key`, `service_role`, `private_key`, `credential` before
  persisting, and `NotificationAuditService.log()` drops metadata
  entirely (writes `null`) if any pattern matches, rather than
  attempting to redact in place. This is a conservative, safe default.
- Notification titles/bodies are always rendered server-side from
  approved templates (`NotificationTemplateService.renderTemplate`)
  with caller-supplied `variables` substituted into
  `{{placeholder}}` slots — the caller never supplies raw title/body
  text directly, which prevents arbitrary content (including secrets
  or unapproved copy) from reaching a notification payload through the
  enqueue path.

## Rate limits

- `NotificationRateLimitService.isRateLimited(userId, channel)` exists
  with sane per-channel hourly/daily caps (push: 10/hr, 50/day; in_app:
  20/hr, 100/day; email: 5/hr, 20/day).
- **Finding (should be addressed before relying on it):** this service
  is not referenced anywhere outside its own file —
  `NotificationQueueService.enqueue()` only calls
  `NotificationEligibilityService.checkEligibility()` (preferences +
  quiet hours) and never calls `isRateLimited()`. The rate limiter is
  fully implemented but **not wired into the dispatch path**, so it
  currently provides no actual protection against notification
  flooding. This should be tracked as a follow-up fix: inject
  `NotificationRateLimitService` into `NotificationQueueService` and
  short-circuit `enqueue()` (similar to the existing
  `eligible`/`reason` pattern) when a channel's rate limit is hit.

## Quiet hours / preference enforcement

- `NotificationEligibilityService.checkEligibility()` is correctly
  invoked from `NotificationQueueService.enqueue()` before any event is
  created, checking both per-category channel preference
  (`NotificationPreferenceService.isEnabled`) and quiet hours
  (`isInQuietHours`, timezone-aware via `Intl.DateTimeFormat`) — both
  reasons are server-side, not delegated to any client.

## Audit logs

- Every mutation endpoint reviewed (mark read, dismiss, token
  register/disable, schedule pause/cancel) calls
  `NotificationAuditService.log()` after the mutation succeeds, with
  the sensitive-data scrub described above applied to any metadata.

## Summary of findings

| Area | Status |
|---|---|
| Per-user ownership enforcement on mutations | Pass (enforced at repository/SQL layer) |
| Admin endpoint access control | Pass |
| Device token validation | Pass |
| Provider secret exposure | Pass (no real provider wired yet; no secrets present to leak) |
| Audit log payload safety | Pass |
| Template-based payload rendering | Pass |
| Quiet hours / preference enforcement | Pass |
| Rate limiting | **Fail — implemented but not wired into the dispatch path** |

**Overall: Conditional pass.** No payload-safety, ownership, or secret-handling
issues found. The one real gap — rate limiting not being invoked from
`NotificationQueueService.enqueue()` — should be fixed before this
system is exposed to untrusted volume (e.g., before a real push/email
provider is wired in), but does not block Phase 13's documentation/UI
work landing.
