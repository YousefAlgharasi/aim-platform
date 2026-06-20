# Phase 13 Notification Architecture Review

Scope: review of backend worker/API/UI architecture, provider abstraction,
and maintainability across `services/backend-api/src/features/notifications/`,
`apps/mobile/lib/features/notifications/`, and
`apps/web/src/features/` notification surfaces.

Dependencies reviewed:
- P13-069 — Notification Design System Review (Pass)
- P13-070 — Notification Security Review (Conditional pass; rate limiter unwired)
- P13-071 — Notification Privacy Review (Pass)

---

## 1. Backend module structure

`NotificationsModule` imports `AuthModule` and `DatabaseModule`. All
notification services, controllers, guards, and provider adapters are
registered through this single module. Provider adapters are injected
via NestJS symbols (`PUSH_PROVIDER_ADAPTER`, `EMAIL_PROVIDER_ADAPTER`),
enabling implementation swapping without touching consumer code.

**49 backend files** organized into clear layers:

| Layer | Files | Examples |
|---|---|---|
| DTOs / entities | 15 | `notification-enums.ts`, `notification-event.entity.ts`, request DTOs |
| Repository | 2 | `notification.repository.ts` (40+ methods), `notification-repository.types.ts` |
| Services | 10 | Queue, eligibility, template, preference, rate-limit, digest, audit, retry, in-app, device-token |
| Controllers | 6 | Unified + split (inbox, preferences, device-token, reminders) + admin |
| Guards | 2 | `NotificationOwnershipGuard`, `NotificationAdminGuard` |
| Worker | 1 | `notification-delivery.worker.ts` |
| Provider adapters | 4 | Push/email interfaces + no-op implementations |
| Integrations | 4 | Parent summary, learning, deadline, streak reminders |
| Validation / errors | 2 | `notification-validation.helpers.ts`, `notification-errors.ts` |
| Barrel exports | 3 | Module index, DTO index, guards index |

**Verdict: well-organized.** Separation of concerns is clean — repository
handles data access only, services encapsulate business logic, controllers
handle HTTP routing and auth, the worker handles async dispatch, and
integrations wire domain-specific reminder workflows.

---

## 2. Notification dispatch pipeline

```
Caller (integration / API)
  │
  ▼
NotificationQueueService.enqueue()
  ├── NotificationEligibilityService.checkEligibility()
  │     ├── NotificationPreferenceService.isEnabled()
  │     └── isInQuietHours() (timezone-aware)
  ├── NotificationTemplateService.resolveTemplate() + renderTemplate()
  └── NotificationRepository.createEvent() → status: 'queued' or 'scheduled'
  │
  ▼
NotificationDeliveryWorker.processQueue()
  ├── in_app  → DB status update to 'sent' (no provider call)
  ├── push    → PushProviderAdapter.send() per active device token
  └── email   → EmailProviderAdapter.send()
  │
  ▼
DeliveryAttempt logged (success / failed + error code)
  │
  ▼ (on failure)
NotificationRetryService.requeueForRetry()
  └── Exponential backoff: 1m → 2m → 4m, capped at 1h, max 3 attempts
```

**Strengths:**
- Eligibility is checked at enqueue time (server-side only), preventing
  ineligible notifications from ever reaching the queue.
- Template rendering is server-side — callers supply `templateKey` +
  `variables`, never raw title/body text.
- Retry uses exponential backoff with a cap and max-attempts limit.
- Multi-token push delivery supports partial success (event marked
  'sent' if any token succeeds).

**Finding (carried from P13-070):** `NotificationRateLimitService` is
fully implemented with per-channel hourly/daily caps (push 10/50,
in_app 20/100, email 5/20) but is **not wired into the dispatch path**.
`NotificationQueueService.enqueue()` calls `checkEligibility()` but
never calls `isRateLimited()`. This should be addressed before a real
provider is connected.

---

## 3. Provider abstraction

Two interface contracts define the provider boundary:

- `PushProviderAdapter` — `send(PushDeliveryPayload): Promise<PushDeliveryResult>`,
  `validateToken(token): Promise<boolean>`
- `EmailProviderAdapter` — `send(EmailDeliveryPayload): Promise<EmailDeliveryResult>`

Both currently have no-op implementations (`NoopPushProviderAdapter`,
`NoopEmailProviderAdapter`) that return `success: true`. Real provider
adapters (FCM, APNs, SendGrid, etc.) can be added by implementing
the interface and swapping the NestJS provider binding — no changes
needed in queue, worker, or controller code.

**Verdict: clean abstraction.** The interface contracts are minimal,
the delivery result types include `providerMessageId`, `errorCode`,
and `errorMessage` for observability, and the no-op adapters keep
development and testing friction-free.

**Recommendation:** When wiring a real provider, load credentials
from the existing secrets-management pattern used elsewhere in
`backend-api`, not from inline `process.env` reads inside this
feature folder. Ensure no adapter ever logs a full token, API key,
or raw provider response body.

---

## 4. Template system

`NotificationTemplateService` supports multi-channel (`in_app`, `push`,
`email`), multi-locale (`en`, `ar`) templates with automatic fallback
to English when the requested locale is unavailable.

Rendering is simple `{{placeholder}}` string substitution — no
expression evaluation, no conditional logic in templates. This is
intentionally restrictive: it prevents template injection and keeps
payload content fully predictable from the caller's `variables` map.

**Verdict: appropriate for current needs.** If richer template logic
is needed later (pluralization, conditional blocks), it should be
added as a controlled server-side extension, not delegated to clients.

---

## 5. Reminder integrations

Four domain-specific integrations wire `ReminderScheduleService` +
`NotificationQueueService`:

| Integration | Trigger | Channels | Template key | Variables |
|---|---|---|---|---|
| `LearningReminderIntegration` | Cron schedule | push + in_app | `learning_reminder_due` | (locale only) |
| `DeadlineReminderIntegration` | 1 day before deadline | push + in_app | `deadline_reminder` | `deadline_name` |
| `StreakReminderIntegration` | Daily 6 PM default | push + in_app | `streak_reminder` | `streak_count` |
| `ParentSummaryReminderIntegration` | Manual trigger | in_app (+ push for weekly) | `parent_weekly_summary` / `parent_daily_summary` | `event_count` |

Schedule management (create, pause, resume, cancel, advance) is
handled by `ReminderScheduleService` with cron validation (5-part
format) and `getDueSchedules()` for polling.

**Verdict: well-structured.** Each integration is self-contained,
passes only safe variables (labels, counts, ids — never raw content),
and delegates all scheduling authority to the backend.

---

## 6. Controller and guard architecture

### User-facing endpoints

All user-facing controllers are guarded by `SupabaseJwtAuthGuard` +
`NotificationOwnershipGuard`. The user is derived from `@CurrentUser()`
(JWT), never from request parameters. Per-resource ownership is
enforced at the SQL layer (`WHERE ... AND user_id = $n`).

Endpoints are split across focused controllers for modularity:

- `NotificationsController` — unified entry (14 routes)
- `InboxController` — inbox GET, unread count, mark-read, dismiss
- `PreferencesController` — preference CRUD + quiet hours
- `DeviceTokenController` — register, disable
- `RemindersController` — pause, resume, cancel

### Admin endpoints

`NotificationsAdminController` is guarded by `SupabaseJwtAuthGuard` +
`NotificationAdminGuard` (`user.role === 'admin'`). All endpoints are
**read-only** (GET only): audit logs, delivery attempts, user events,
template listing/detail.

**Verdict: correct separation.** Admin cannot mutate notification
state. User endpoints cannot cross-access other users' data. The
guard + SQL-level enforcement is defense-in-depth.

**Recommendation (carried from P13-070):** Rename or document
`NotificationOwnershipGuard` to clarify that it verifies
authentication only — actual ownership is enforced at the repository
layer. This prevents future contributors from assuming the guard
alone is sufficient when adding new mutation endpoints.

---

## 7. Data persistence

`NotificationRepository` centralizes all SQL access (40+ methods)
with typed row interfaces in `notification-repository.types.ts`.
All queries are parameterized (no string interpolation). Key tables:

- `notification_templates` — channel/locale/category keyed
- `notification_preferences` — user + channel + category
- `device_tokens` — user + platform + token + status
- `notification_events` — the core event table (queued → sent/failed/read/dismissed)
- `reminder_schedules` — cron-based recurring triggers
- `delivery_attempts` — per-event delivery audit trail
- `notification_digests` — aggregated summaries
- `quiet_hours` — per-user timezone-aware quiet windows
- `notification_audit_logs` — system-wide action log

**Verdict: single-repository pattern is manageable at current scale.**
If the feature grows significantly, splitting into per-domain
repositories (e.g., `TemplateRepository`, `EventRepository`,
`ScheduleRepository`) would improve readability without changing
the service layer.

---

## 8. Validation and error handling

`notification-validation.helpers.ts` provides enum validators
(`isValidChannel`, `isValidCategory`, `isValidLocale`,
`isValidPlatform`, `isValidReminderType`), format validators
(`isValidTimeFormat`, `isValidCronExpression`, `isValidDeviceToken`),
and a sensitive-data filter (`containsSensitiveData`).

Seven domain error classes map to appropriate HTTP status codes
(400, 403, 404, 422, 429, 502). The error taxonomy covers the
expected failure modes without over-engineering.

**Verdict: adequate.** Validators are centralized and reused across
services. Error classes are specific enough for client error handling.

---

## 9. Mobile architecture (Flutter)

26 files following clean architecture layers:

- **Data layer:** Remote datasource (HTTP client), repository
  implementation, 6 data models
- **Logic layer:** Abstract repository interface, domain entities,
  Riverpod providers (6 state notifiers: inbox, preferences, quiet
  hours, reminders, unread count, device token)
- **UI layer:** 5 pages (inbox, detail, preferences, reminder
  settings, placeholder) + notification bell widget

**Key constraint preserved:** The mobile app never computes
eligibility, quiet hours, rate limiting, or delivery status locally.
All state is fetched from and mutated through backend APIs.
`StateNotifier` classes manage local UI state (loading, error, data)
but delegate all business decisions to the server.

UI uses AIM design system components (`AIMCard`, `AIMBadge`,
`AIMButton`, `AIMEmptyState`, `AIMFullScreenLoading`,
`AIMFullScreenError`, `AimSpacing`, `AimTextStyles`) exclusively,
with one documented exception (Material 3 `Badge` for unread dot —
no AIM equivalent exists).

**Verdict: correct architecture.** Backend authority is preserved.
Design system compliance confirmed by P13-069 review.

---

## 10. Web architecture

### Parent dashboard (3 pages + API client + shell)

- `ParentNotificationsShell.js` — state machine (loading/error/empty/ready)
- `ParentNotifications.js`, `ParentNotificationSettings.js`,
  `ParentDeadlineReminders.js` — compose shared parent component library
- `notificationsApiClient.js` — authenticated HTTP client for all
  notification endpoints (inbox, preferences, quiet hours, reminders)

Uses established parent dashboard CSS tokens and component library.
Design system compliance confirmed by P13-069 review (pass relative
to existing parent dashboard baseline).

### Admin notification monitor (2 pages + API client)

- `AdminNotificationMonitor.jsx` — read-only audit log / delivery
  attempt viewer with filters
- `AdminTemplateMonitor.jsx` — template listing / detail viewer
- `adminNotificationsApiClient.js` — GET-only API client

Admin UI is read-only by design — mirrors the backend's admin
controller constraint.

**Verdict: correct.** Both web surfaces delegate all authority to the
backend and do not compute notification state locally.

---

## 11. Maintainability assessment

### Strengths

1. **Clear layering:** Repository → Service → Controller → Worker
   separation is consistent and predictable.
2. **Provider abstraction:** Adding a real push/email provider
   requires implementing one interface and changing one binding.
3. **Domain integrations:** Reminder workflows are self-contained
   and testable in isolation.
4. **Centralized validation:** All enum/format checks in one helpers
   file, reused across services.
5. **Audit trail:** Every mutation is logged with sensitive-data
   scrubbing, providing operational visibility.
6. **Multi-client consistency:** Mobile, parent web, and admin web
   all consume the same backend APIs with the same authority model.

### Areas for improvement

1. **Rate limiter not wired:** The most significant gap. Must be
   connected before production traffic or a real provider adapter.
2. **Single large repository:** `notification.repository.ts` has 40+
   methods. Consider splitting by domain if the feature grows.
3. **Guard naming:** `NotificationOwnershipGuard` name implies it
   enforces ownership, but it only verifies authentication. Ownership
   is enforced at SQL level. Rename or add documentation to prevent
   future contributor confusion.
4. **Digest triggering:** `NotificationDigestService` requires manual
   triggering. No scheduled job or cron integration exists yet to
   automate daily/weekly digest creation. This is expected for Phase 13
   (readiness, not full automation) but should be tracked for follow-up.
5. **Worker scheduling:** `NotificationDeliveryWorker.processQueue()`
   is a callable method but no cron/interval trigger is wired to call
   it automatically. Same as digests — expected for Phase 13 readiness
   but needs automation before production.
6. **Duplicate controller patterns:** Both a unified
   `NotificationsController` and split controllers (Inbox, Preferences,
   DeviceToken, Reminders) exist. This appears to be an evolution
   artifact. Consolidating to one pattern would reduce confusion.

---

## 12. Cross-review alignment

| Review | Key finding | Status in this review |
|---|---|---|
| P13-069 (Design System) | Admin UI not on AIM design system (no admin component library exists) | Confirmed — flagged exception, not a Phase 13 blocker |
| P13-069 (Design System) | Mobile unread badge uses Material 3 `Badge` | Confirmed — narrow justified exception |
| P13-070 (Security) | Rate limiter implemented but not wired | Confirmed — tracked as follow-up |
| P13-070 (Security) | Ownership guard naming ambiguity | Confirmed — tracked as follow-up |
| P13-071 (Privacy) | No sensitive content in payloads | Confirmed — template system prevents raw content injection |
| P13-071 (Privacy) | Digest carries counts only | Confirmed — no underlying content aggregated |

---

## 13. Summary

| Area | Status |
|---|---|
| Backend module structure and layering | Pass |
| Notification dispatch pipeline | Pass |
| Provider abstraction (push / email) | Pass |
| Template system | Pass |
| Reminder integrations | Pass |
| Controller / guard architecture | Pass |
| Data persistence layer | Pass |
| Validation and error handling | Pass |
| Mobile (Flutter) architecture | Pass |
| Parent web architecture | Pass |
| Admin web architecture | Pass (flagged exception: not on AIM design system) |
| Rate limiter wiring | **Not wired — follow-up required** |
| Worker / digest automation | Not automated — expected for Phase 13 readiness |

**Overall: Pass.** The Phase 13 notification architecture is well-structured,
maintainable, and correctly preserves backend authority over scheduling,
eligibility, delivery, preferences, and quiet hours across all client
surfaces. Provider abstraction is clean and ready for real adapter
integration. Two follow-up items should be tracked before production
readiness: (1) wire the rate limiter into the dispatch path, and
(2) automate worker/digest scheduling via cron or interval triggers.
