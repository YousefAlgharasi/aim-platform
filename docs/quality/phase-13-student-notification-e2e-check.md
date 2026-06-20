# Phase 13 Student Notification E2E Check

Scope: end-to-end validation of the student notification flow — device
token registration, notification inbox, preferences, quiet hours,
reminder settings, and unread count — across backend API and Flutter
mobile client.

Dependencies verified: P13-054 through P13-060 (all Done).

---

## 1. Device token registration

### Flow

1. Student opens the app on iOS or Android.
2. `DeviceTokenNotifier.registerToken(token)` reads the active session
   from `SessionStore`, determines platform via `Platform.isIOS`/`Platform.isAndroid`.
3. Calls `POST /api/v1/notifications/device-tokens` with `{ platform, token, deviceName }`.
4. Backend `DeviceTokenService.registerToken()` validates platform enum
   and token length (1–512 chars), upserts via `NotificationRepository.upsertDeviceToken()`.
5. Backend logs `token_registered` audit event (platform only, no full token).
6. Response returns `DeviceTokenEntity` with id, platform, status.
7. Flutter stores the result in `AppAsyncState.success`.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Token sent to backend | `POST /api/v1/notifications/device-tokens` guarded by `SupabaseJwtAuthGuard` + `NotificationOwnershipGuard` | Pass |
| User derived from JWT | `@CurrentUser()` decorator, no client-supplied userId | Pass |
| Platform validated | `isValidPlatform()` rejects non-ios/android | Pass |
| Token length validated | 1–512 chars enforced server-side | Pass |
| Duplicate token handled | Upsert with `ON CONFLICT` updates `last_seen_at` | Pass |
| Token disable | `DELETE /api/v1/notifications/device-tokens/:tokenId` scoped by `userId` | Pass |
| Audit logged | `token_registered` / `token_disabled` events created | Pass |
| Flutter no-session guard | `DeviceTokenNotifier` returns failure if no active session | Pass |
| Flutter no provider secrets | Notifier never stores/logs access token beyond single use | Pass |

### Test coverage

- `device_token_notifier_test.dart` — register success, disable success,
  no-session guard, backend failure surfacing.

---

## 2. Notification inbox

### Flow

1. Student navigates to notification inbox (`NotificationInboxPage`).
2. `NotificationInboxNotifier.load()` calls `GET /api/v1/notifications/inbox?limit=20&offset=0`.
3. Backend `InAppNotificationService.getInbox(userId, limit, offset)` returns
   paginated `in_app` events scoped to the authenticated user.
4. Flutter renders events using `AIMCard` components — title, body, category, timestamp.
5. Student taps a notification → `NotificationDetailPage` opens.
6. Mark as read: `PATCH /api/v1/notifications/inbox/:eventId/read` → backend
   sets `read_at` timestamp, returns updated event.
7. Dismiss: `PATCH /api/v1/notifications/inbox/:eventId/dismiss` → backend
   sets `dismissed_at` timestamp, returns updated event.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Inbox fetch scoped by userId | SQL `WHERE user_id = $1 AND channel = 'in_app'` | Pass |
| Pagination works | `limit` and `offset` parameters respected | Pass |
| Mark as read server-side | Backend sets `read_at`, Flutter uses returned event | Pass |
| Dismiss server-side | Backend sets `dismissed_at`, Flutter uses returned event | Pass |
| No local eligibility computation | Notifier only relays backend state | Pass |
| No local delivery state | Flutter never sets sent/delivered status | Pass |
| AIM design system | `AIMCard`, `AIMEmptyState`, `AIMFullScreenLoading`, `AIMFullScreenError` | Pass |
| Error state handling | `AppException` caught and surfaced via `setFailure()` | Pass |

### Test coverage

- `notification_state_notifiers_test.dart` — inbox load success, load failure,
  mark-as-read success, dismiss success, backend error surfacing.

---

## 3. Notification preferences

### Flow

1. Student opens preferences page (`NotificationPreferencesPage`).
2. `NotificationPreferencesNotifier.load()` calls `GET /api/v1/notifications/preferences`.
3. Backend returns all `NotificationPreference` rows for the user (channel + category + enabled).
4. Student toggles a preference → `PATCH /api/v1/notifications/preferences` with
   `{ channel, category, enabled }`.
5. Backend `NotificationPreferenceService.updatePreference()` upserts and returns
   the updated preference.
6. Backend logs `preference_updated` audit event.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Preferences scoped by userId | SQL `WHERE user_id = $1` | Pass |
| Toggle sends to backend | `PATCH` with channel/category/enabled | Pass |
| Default preference behavior | Missing preference defaults to enabled (server-side) | Pass |
| No local eligibility decision | Flutter never decides if a notification should be sent | Pass |
| Audit logged | `preference_updated` event created | Pass |

### Test coverage

- `notification_state_notifiers_test.dart` — preferences load success,
  toggle success, backend error surfacing.

---

## 4. Quiet hours

### Flow

1. Student accesses quiet hours settings (within preferences page).
2. `QuietHoursNotifier.load()` calls `GET /api/v1/notifications/quiet-hours`.
3. Backend returns `QuietHoursEntity` (enabled, startTime, endTime, timezone).
4. Student updates → `PATCH /api/v1/notifications/quiet-hours` with
   `{ enabled, startTime, endTime, timezone }`.
5. Backend `NotificationRepository.upsertQuietHours()` persists, returns updated row.
6. Backend logs `quiet_hours_updated` audit event.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Quiet hours scoped by userId | SQL `WHERE user_id = $1` | Pass |
| Time format validated | `isValidTimeFormat()` — HH:MM regex | Pass |
| Timezone stored server-side | Backend evaluates quiet hours at dispatch time | Pass |
| No client-side quiet-hour enforcement | Flutter never blocks notifications locally | Pass |
| Audit logged | `quiet_hours_updated` event created | Pass |

### Test coverage

- `notification_state_notifiers_test.dart` — quiet hours load success,
  update success, backend error surfacing.

---

## 5. Reminder settings

### Flow

1. Student opens reminder settings page (`ReminderSettingsPage`).
2. `ReminderScheduleNotifier.load()` calls `GET /api/v1/notifications/reminders`.
3. Backend `ReminderScheduleService.getActiveSchedules(userId)` returns
   non-cancelled schedules ordered by `next_fire_at`.
4. Student can pause/resume/cancel a schedule via
   `PATCH /api/v1/notifications/reminders/:scheduleId/pause|resume|cancel`.
5. Backend validates status transitions and scopes by `userId`.
6. Backend logs `schedule_paused`/`schedule_resumed`/`schedule_cancelled` audit events.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Schedules scoped by userId | SQL `WHERE user_id = $1` | Pass |
| Pause/resume/cancel scoped | SQL `WHERE id = $1 AND user_id = $2` | Pass |
| Schedule authority is backend-only | Flutter never creates/modifies cron expressions | Pass |
| Status transitions server-validated | Backend enforces valid state changes | Pass |
| No local schedule computation | Flutter only displays backend-supplied state | Pass |
| Audit logged | `schedule_paused`/`resumed`/`cancelled` events | Pass |

### Test coverage

- `notification_state_notifiers_test.dart` — reminders load success,
  pause/resume/cancel success, backend error surfacing.

---

## 6. Unread count and notification bell

### Flow

1. `UnreadCountNotifier.load()` calls `GET /api/v1/notifications/inbox/unread-count`.
2. Backend `InAppNotificationService.getUnreadCount(userId)` returns count of
   events not in `read`/`dismissed` status.
3. `NotificationBellButton` widget reads `notificationUnreadCountProvider`
   and renders a Material 3 `Badge` overlay when count > 0.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Count computed server-side | SQL `WHERE user_id = $1 AND status NOT IN ('read', 'dismissed')` | Pass |
| Flutter only displays count | No local filtering or counting | Pass |
| Badge reflects backend state | Widget rebuilds on provider state change | Pass |

### Test coverage

- `notification_state_notifiers_test.dart` — unread count load success,
  backend error surfacing.

---

## 7. Cross-cutting authority checks

| Rule | Enforcement | Status |
|---|---|---|
| Backend owns notification eligibility | `NotificationEligibilityService` called at enqueue, not in Flutter | Pass |
| Backend owns delivery state | `NotificationDeliveryWorker` dispatches, Flutter never sets delivery status | Pass |
| Backend owns quiet-hour enforcement | `isInQuietHours()` evaluated server-side at dispatch time | Pass |
| Backend owns schedule authority | `ReminderScheduleService` manages cron/fire/advance, Flutter only pauses/resumes/cancels | Pass |
| Payloads are privacy-safe | Template-rendered titles/bodies only, no raw AIM output or sensitive data | Pass |
| No provider secrets in Flutter | No `process.env`, no API keys, no service-role tokens in mobile code | Pass |
| User identity from JWT | All endpoints derive userId from `@CurrentUser()`, never from request body | Pass |

---

## 8. Summary

| Flow | Backend authority | Privacy-safe | Design system | Tests | E2E |
|---|---|---|---|---|---|
| Device token registration | Pass | Pass | Pass | Pass | Pass |
| Notification inbox | Pass | Pass | Pass | Pass | Pass |
| Notification preferences | Pass | Pass | Pass | Pass | Pass |
| Quiet hours | Pass | Pass | Pass | Pass | Pass |
| Reminder settings | Pass | Pass | Pass | Pass | Pass |
| Unread count / bell | Pass | Pass | Pass | Pass | Pass |

**Overall: Pass.** The student notification flow is fully end-to-end
validated. All business logic, eligibility, scheduling, delivery,
and quiet-hour enforcement remain backend-controlled. The Flutter
mobile client correctly acts as a display and relay layer only,
using AIM design system components and delegating all authority to
the backend API. Test coverage exists for all notifier success and
failure paths.
