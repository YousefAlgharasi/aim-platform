# Phase 14 Readiness Checklist — From Phase 13

This document records what Phase 13 (Notifications and Reminders)
has prepared for Phase 14 (Payments and Billing), and what handoff
items remain. No payment logic, billing code, or payment provider
integration is implemented here.

---

## 1. Notification infrastructure ready for payment events

Phase 13 built a complete notification pipeline that Phase 14 can
reuse for payment-related notifications (receipts, billing reminders,
payment failures, subscription updates).

### What is ready

| Component | Status | Phase 14 usage |
|---|---|---|
| `NotificationQueueService.enqueue()` | Ready | Enqueue payment receipt/failure/reminder notifications |
| `NotificationTemplateService` | Ready | Add `payment_receipt`, `billing_reminder`, `payment_failed` template keys |
| `NotificationEligibilityService` | Ready | Checks preferences + quiet hours before payment notifications |
| `NotificationDeliveryWorker` | Ready | Dispatches payment notifications via push/email/in_app |
| `NotificationRetryService` | Ready | Retries failed payment notification deliveries |
| `NotificationAuditService` | Ready | Logs payment notification events with sensitive-data filtering |
| `NotificationDigestService` | Ready | Can aggregate payment notifications into digest summaries |
| Provider adapters (push/email) | Placeholder (no-op) | Must wire real adapters before payment notifications go live |

### What Phase 14 needs to add

1. **New notification templates**: Create `notification_templates` rows
   for payment-related template keys (`payment_receipt`,
   `billing_reminder`, `payment_failed`, `subscription_renewed`,
   `subscription_cancelled`) with appropriate title/body templates
   per channel and locale.

2. **New notification category**: Add `payment` to `NOTIFICATION_CATEGORIES`
   in `notification-enums.ts` so users can control payment notification
   preferences independently.

3. **Payment reminder integration**: Create a `PaymentReminderIntegration`
   (similar to `DeadlineReminderIntegration`) that creates reminder
   schedules for upcoming billing dates and fires payment reminder
   notifications.

4. **Real provider adapters**: Wire FCM/APNs (push) and SendGrid/SES
   (email) adapters before payment notifications go live. The interface
   contracts (`PushProviderAdapter`, `EmailProviderAdapter`) are defined
   and ready.

---

## 2. Rate limiter gap

The `NotificationRateLimitService` is implemented with per-channel
hourly/daily caps but is **not wired into the dispatch path**.
`NotificationQueueService.enqueue()` checks eligibility (preferences +
quiet hours) but never calls `isRateLimited()`.

### Phase 14 action required

Before enabling payment notifications at scale, wire
`NotificationRateLimitService` into `NotificationQueueService.enqueue()`
to prevent notification flooding. This is especially important for
payment failure retries, which could generate many notifications in
a short window.

---

## 3. Worker/digest automation gap

`NotificationDeliveryWorker.processQueue()` and
`NotificationDigestService.createDailyDigest()`/`createWeeklyDigest()`
are callable methods but no cron job or interval trigger calls them
automatically.

### Phase 14 action required

Before production deployment, set up scheduled triggers (NestJS
`@Cron()` decorators, external cron, or a queue-based scheduler)
for:
- Worker polling (e.g., every 30 seconds)
- Daily digest creation (e.g., 8:00 AM user timezone)
- Weekly digest creation (e.g., Monday 8:00 AM user timezone)

---

## 4. Provider secrets management

No real push or email provider is wired yet. When Phase 14 adds
real providers:

### Requirements

- Load provider credentials from the existing secrets-management
  pattern used in `backend-api` (environment variables via config
  service), not inline `process.env` reads inside the notifications
  feature folder.
- Never log full API keys, tokens, or raw provider response bodies.
- The no-op adapter pattern (`NoopPushProviderAdapter`,
  `NoopEmailProviderAdapter`) should remain available for
  development and testing environments.

---

## 5. Database readiness

All notification tables are created and ready:

| Table | Migration | Ready for Phase 14 |
|---|---|---|
| `notification_templates` | Yes | Add payment template rows |
| `notification_preferences` | Yes | Works for new payment category |
| `device_tokens` | Yes | No changes needed |
| `notification_events` | Yes | No changes needed |
| `reminder_schedules` | Yes | Add payment reminder schedules |
| `notification_delivery_attempts` | Yes | No changes needed |
| `notification_digests` | Yes | No changes needed |
| `notification_quiet_hours` | Yes | No changes needed |
| `notification_audit_logs` | Yes | No changes needed |

No schema changes are required for Phase 14 to start using the
notification system for payment events.

---

## 6. UI readiness

### Student mobile (Flutter)

The notification inbox, preferences, and reminder settings UI are
ready. When a `payment` category is added:
- Inbox will display payment notifications automatically (backend-driven).
- Preferences page will show a new payment toggle automatically
  (if backend returns it in the preference list).
- No Flutter code changes required.

### Parent web dashboard

Same as mobile — the parent notification inbox and settings will
pick up new payment categories automatically from backend data.
No web code changes required.

### Admin web

The admin notification monitor and template viewer will display
payment notifications and templates automatically. No admin code
changes required.

---

## 7. Security and privacy readiness

| Rule | Status | Phase 14 notes |
|---|---|---|
| Backend authority preserved | Yes | Payment notifications must be enqueued server-side only |
| Payload safety | Yes | Payment templates must not include full card numbers, CVVs, or raw billing API responses |
| Audit logging | Yes | Payment notification events will be auto-logged with sensitive-data filtering |
| Rate limiting | Not wired | Must wire before payment notification volume |
| Provider secret safety | Yes (no-op) | Must follow secrets-management pattern when wiring real providers |

---

## 8. Handoff checklist

| Item | Owner | Priority | Status |
|---|---|---|---|
| Wire rate limiter into dispatch path | Phase 14 | P0 | Not started |
| Set up worker/digest cron automation | Phase 14 | P0 | Not started |
| Wire real push provider (FCM/APNs) | Phase 14 | P0 | Not started |
| Wire real email provider (SendGrid/SES) | Phase 14 | P0 | Not started |
| Add payment notification category | Phase 14 | P0 | Not started |
| Create payment notification templates | Phase 14 | P1 | Not started |
| Create PaymentReminderIntegration | Phase 14 | P1 | Not started |
| Migrate admin UI to AIM design system | Future | P2 | Not started |
| Add AIM notification-dot component | Future | P2 | Not started |

---

## 9. What Phase 13 does NOT hand off

Phase 13 does **not** implement, prototype, or stub any of the following:
- Payment processing logic
- Billing API integration
- Subscription management
- Payment provider SDKs (Stripe, PayPal, etc.)
- Payment database tables or migrations
- Payment UI screens
- Payment-related environment variables or secrets

These are entirely Phase 14 scope.
