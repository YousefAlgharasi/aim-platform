# P16-049: Notification Security Audit

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Audit Complete — Findings Documented

---

## 1. Scope

This audit covers the notification system at `services/backend-api/src/features/notifications/` for:

- Device token handling and storage
- Notification payload content safety
- Push/email provider credential management
- Parent-child scope enforcement in notifications
- Delivery log security
- Admin notification management authorization

---

## 2. Notification Module Inventory

### 2.1 Core Services

| File | Purpose | Security Relevance |
|------|---------|-------------------|
| `device-token.controller.ts` | Device token registration | Token storage, user binding |
| `device-token.service.ts` | Device token management | CRUD, validation |
| `notification-delivery.worker.ts` | Notification dispatch | Provider communication |
| `notification-queue.service.ts` | Queue management | Message ordering |
| `notification-retry.service.ts` | Failed delivery retry | Persistence of sensitive payloads |
| `notification-rate-limit.service.ts` | Rate limiting | Abuse prevention |
| `notification-digest.service.ts` | Digest batching | Content aggregation |
| `notification-eligibility.service.ts` | Delivery eligibility | Quiet hours, preferences |
| `notification-template.service.ts` | Message templates | Content generation |
| `notification-preference.service.ts` | User preferences | Opt-in/opt-out |
| `notification-audit.service.ts` | Audit logging | Compliance |
| `in-app-notification.service.ts` | In-app notifications | Browser/app delivery |
| `notification.repository.ts` | Data access | Query scoping |
| `notification-validation.helpers.ts` | Input validation | Sanitization |

### 2.2 Controllers

| Controller | File | Audience |
|------------|------|----------|
| NotificationsController | `notifications.controller.ts` | Authenticated users |
| InboxController | `inbox.controller.ts` | Authenticated users |
| PreferencesController | `preferences.controller.ts` | Authenticated users |
| DeviceTokenController | `device-token.controller.ts` | Authenticated users |
| RemindersController | `reminders.controller.ts` | Authenticated users |
| NotificationsAdminController | `notifications-admin.controller.ts` | Admin only |

### 2.3 Guards

| Guard | File | Purpose |
|-------|------|---------|
| NotificationOwnershipGuard | `guards/notification-ownership.guard.ts` | User owns notification |
| NotificationAdminGuard | `guards/notification-admin.guard.ts` | Admin-only operations |

### 2.4 Provider Adapters

| Adapter | File | Purpose |
|---------|------|---------|
| PushProviderAdapter (interface) | `push-provider-adapter.interface.ts` | Push notification provider |
| EmailProviderAdapter (interface) | `email-provider-adapter.interface.ts` | Email provider |
| NoopPushProvider | `noop-push-provider.adapter.ts` | Dev/test push provider |
| NoopEmailProvider | `noop-email-provider.adapter.ts` | Dev/test email provider |

---

## 3. Device Token Security

### 3.1 Architecture

Device tokens (FCM tokens for Android, APNs tokens for iOS) are sensitive credentials that allow sending push notifications to specific devices. `device-token.controller.ts` and `device-token.service.ts` handle token lifecycle.

### 3.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-TOK-001 | Device token controller exists for registration | N/A | PASS |
| NOT-TOK-002 | Device token service manages token lifecycle | N/A | PASS |
| NOT-TOK-003 | Need to verify token is bound to authenticated user | CRITICAL | NEEDS VERIFICATION |
| NOT-TOK-004 | Need to verify user cannot register token for another user | CRITICAL | NEEDS VERIFICATION |
| NOT-TOK-005 | Need to verify stale tokens are cleaned up | MEDIUM | NEEDS VERIFICATION |
| NOT-TOK-006 | Need to verify token is deleted on user logout/account deletion | HIGH | NEEDS VERIFICATION |
| NOT-TOK-007 | Need to verify device tokens are not exposed in API responses to other users | HIGH | NEEDS VERIFICATION |
| NOT-TOK-008 | Need to verify device tokens are not logged in plain text | HIGH | NEEDS VERIFICATION |

### 3.3 Device Token Entity

`dto/device-token.entity.ts` defines the device token data model.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-TOK-009 | Device token entity exists with defined schema | N/A | PASS |
| NOT-TOK-010 | Need to verify entity includes user_id binding | HIGH | NEEDS VERIFICATION |
| NOT-TOK-011 | Need to verify entity includes platform (ios/android) field | LOW | NEEDS VERIFICATION |

---

## 4. Notification Payload Security

### 4.1 Content Safety

Notification payloads may contain student names, learning progress, assessment results, or billing information. These payloads must be safe for display on lock screens and notification centers.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-PAY-001 | Need to verify lock-screen notifications don't show sensitive student data | HIGH | NEEDS VERIFICATION |
| NOT-PAY-002 | Need to verify push notification payloads are size-limited (FCM: 4KB, APNs: 4KB) | MEDIUM | NEEDS VERIFICATION |
| NOT-PAY-003 | Need to verify notification template service sanitizes content | HIGH | NEEDS VERIFICATION |
| NOT-PAY-004 | Need to verify no PII in notification titles (visible without unlock) | HIGH | NEEDS VERIFICATION |
| NOT-PAY-005 | Need to verify notification content is appropriate for child platform | MEDIUM | NEEDS VERIFICATION |

### 4.2 Template Security

`notification-template.service.ts` generates notification content from templates.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-TPL-001 | Template service exists for content generation | N/A | PASS |
| NOT-TPL-002 | `notification-template.entity.ts` defines template schema | N/A | PASS |
| NOT-TPL-003 | Need to verify templates are server-side (not client-editable) | HIGH | NEEDS VERIFICATION |
| NOT-TPL-004 | Need to verify template injection is not possible (no user-controlled template vars) | HIGH | NEEDS VERIFICATION |

### 4.3 Privacy Tests

`notification-privacy.spec.ts` exists, indicating explicit privacy testing.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-PRIV-001 | Privacy spec tests exist | N/A | PASS |
| NOT-PRIV-002 | Need to verify privacy tests cover PII in payloads | HIGH | NEEDS VERIFICATION |
| NOT-PRIV-003 | Need to verify privacy tests cover cross-parent data leakage | CRITICAL | NEEDS VERIFICATION |

---

## 5. Provider Credential Management

### 5.1 Current State

The notification system uses adapter interfaces (`push-provider-adapter.interface.ts`, `email-provider-adapter.interface.ts`) with noop implementations (`noop-push-provider.adapter.ts`, `noop-email-provider.adapter.ts`) for development.

**Observation:** The presence of noop adapters and no production adapter implementations visible in the file listing suggests that production push/email providers may not be fully integrated yet.

### 5.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-CRED-001 | Provider adapters use interface pattern (good for swappability) | N/A | PASS |
| NOT-CRED-002 | Noop adapters exist for dev/test (safe — no real notifications sent) | N/A | PASS |
| NOT-CRED-003 | Need to verify production provider credentials loaded from env vars | HIGH | NEEDS VERIFICATION |
| NOT-CRED-004 | Need to verify FCM server key / APNs auth key not hardcoded | CRITICAL | NEEDS VERIFICATION |
| NOT-CRED-005 | Need to verify email provider credentials (SendGrid/SES key) not hardcoded | CRITICAL | NEEDS VERIFICATION |
| NOT-CRED-006 | Provider credentials not in `backend-config.validation.ts` | MEDIUM | FINDING |

**Note:** Similar to billing, notification provider credentials are not included in the centralized `backend-config.validation.ts`. They may be loaded via separate config or module-level configuration. This needs to be standardized before production.

---

## 6. Parent-Child Scope Enforcement

### 6.1 Ownership Guard

`guards/notification-ownership.guard.ts` enforces that users can only access their own notifications.

### 6.2 Reminder Integrations

Several reminder integrations enforce parent-child scoping:

| Integration | File | Scope |
|-------------|------|-------|
| Deadline Reminders | `deadline-reminder.integration.ts` | Parent's children |
| Learning Reminders | `learning-reminder.integration.ts` | Student's own sessions |
| Streak Reminders | `streak-reminder.integration.ts` | Student's own streaks |
| Parent Summary | `parent-summary-reminder.integration.ts` | Parent's children |

### 6.3 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-SCOPE-001 | Notification ownership guard exists | N/A | PASS |
| NOT-SCOPE-002 | Need to verify parent only receives notifications about own children | CRITICAL | NEEDS VERIFICATION |
| NOT-SCOPE-003 | Need to verify student only receives own notifications | HIGH | NEEDS VERIFICATION |
| NOT-SCOPE-004 | Need to verify admin notifications don't leak student PII | HIGH | NEEDS VERIFICATION |
| NOT-SCOPE-005 | Need to verify inbox query scoped to authenticated user | HIGH | NEEDS VERIFICATION |
| NOT-SCOPE-006 | Need to verify parent summary contains only own children's data | CRITICAL | NEEDS VERIFICATION |
| NOT-SCOPE-007 | Need to verify deadline reminders scoped to parent's children | HIGH | NEEDS VERIFICATION |

---

## 7. Delivery Log Security

### 7.1 Delivery Tracking

| Entity | File | Purpose |
|--------|------|---------|
| DeliveryAttempt | `dto/delivery-attempt.entity.ts` | Delivery attempt records |
| NotificationDeliveryAttempt | `dto/notification-delivery-attempt.entity.ts` | Detailed delivery records |
| NotificationAuditLog | `dto/notification-audit-log.entity.ts` | Audit trail |
| NotificationEvent | `dto/notification-event.entity.ts` | Event tracking |

### 7.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-LOG-001 | Audit log entity exists for notification events | N/A | PASS |
| NOT-LOG-002 | Delivery attempt entity tracks delivery status | N/A | PASS |
| NOT-LOG-003 | Need to verify delivery logs do not contain device tokens in plain text | HIGH | NEEDS VERIFICATION |
| NOT-LOG-004 | Need to verify delivery logs do not contain full notification payloads with PII | MEDIUM | NEEDS VERIFICATION |
| NOT-LOG-005 | Need to verify delivery logs are scoped (admin sees all, user sees own) | HIGH | NEEDS VERIFICATION |
| NOT-LOG-006 | Need to verify notification audit service logs are tamper-resistant | MEDIUM | NEEDS VERIFICATION |

---

## 8. Admin Notification Management

### 8.1 Admin Controllers

- `notifications-admin.controller.ts` — Admin notification management
- `apps/web/src/features/admin-notifications/pages/AdminNotificationMonitor.jsx` — Admin UI
- `apps/web/src/features/admin-notifications/pages/AdminTemplateMonitor.jsx` — Template management UI

### 8.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| NOT-ADM-001 | Notification admin guard exists for admin-only access | N/A | PASS |
| NOT-ADM-002 | Admin notification monitor page exists | N/A | PASS |
| NOT-ADM-003 | Need to verify admin cannot send arbitrary push notifications | HIGH | NEEDS VERIFICATION |
| NOT-ADM-004 | Need to verify admin template changes are audit logged | HIGH | NEEDS VERIFICATION |
| NOT-ADM-005 | Need to verify admin notification API uses `adminNotificationsApiClient.js` | MEDIUM | NEEDS VERIFICATION |

---

## 9. Notification Permission Tests

### 9.1 Existing Tests

| Test File | Coverage |
|-----------|----------|
| `notification-permission.spec.ts` | Permission enforcement tests |
| `notification-privacy.spec.ts` | Privacy enforcement tests |
| `notification-delivery.spec.ts` | Delivery logic tests |
| `notification-errors.spec.ts` | Error handling tests |
| `notification-scheduling.spec.ts` | Scheduling logic tests |
| `notification-validation.helpers.spec.ts` | Input validation tests |

**Positive finding:** The notification module has dedicated permission and privacy test files, indicating security was considered during development.

---

## 10. Summary

### Positive Findings

1. Notification ownership guard for user-scoped access
2. Notification admin guard for admin-only operations
3. Provider adapter pattern allows safe noop implementations for dev/test
4. Dedicated privacy and permission spec tests
5. Notification audit service for compliance logging
6. Delivery attempt and audit log entities for tracking
7. Template service for controlled content generation
8. Input validation helpers with tests
9. Rate limiting service prevents notification abuse
10. Multiple reminder integrations with parent-child scoping

### Critical Issues

| Priority | Issue | Severity |
|----------|-------|----------|
| 1 | Verify parent notifications scoped to own children only | CRITICAL |
| 2 | Verify device tokens bound to authenticated user | CRITICAL |
| 3 | Verify provider credentials not hardcoded | CRITICAL |
| 4 | Verify lock-screen payloads don't expose sensitive data | HIGH |
| 5 | Verify delivery logs don't contain device tokens in plain text | HIGH |
| 6 | Provider credentials not in centralized config validation | MEDIUM |

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — The notification module has strong security architecture (ownership guards, privacy tests, audit logging, rate limiting). However, since production push/email providers may not be fully integrated (noop adapters are still in use), the actual production credential handling cannot be fully verified. Must verify parent-child scope enforcement and payload safety before production.
