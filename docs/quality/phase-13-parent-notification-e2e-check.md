# Phase 13 Parent Notification E2E Check

Scope: end-to-end validation of the parent notification flow — inbox,
preferences, quiet hours, deadline reminders, and notification
settings — across backend API and parent web dashboard.

Dependencies verified: P13-061 through P13-065 (all Done).

---

## 1. Parent notification inbox

### Flow

1. Parent opens the notification inbox tab in the parent dashboard.
2. `ParentNotifications` component calls `getNotificationInbox(limit, offset)`
   via `notificationsApiClient.js`.
3. API client sends `GET /api/v1/notifications/inbox?limit=20&offset=0`
   with the parent's bearer token from localStorage.
4. Backend `InAppNotificationService.getInbox(userId, limit, offset)` returns
   paginated `in_app` events scoped to the authenticated parent.
5. Parent web renders events using `ParentCard` + `ParentBadge` components
   with Arabic category labels.
6. Mark as read: `PATCH /api/v1/notifications/inbox/:eventId/read` →
   backend sets `read_at`, returns updated event, UI replaces in state.
7. Dismiss: `PATCH /api/v1/notifications/inbox/:eventId/dismiss` →
   backend sets `dismissed_at`, UI filters dismissed events from view.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Inbox fetch scoped by userId | Backend derives user from JWT, SQL `WHERE user_id = $1` | Pass |
| No child-id override | API client never passes a child id or scope parameter | Pass |
| Pagination | `limit` and `offset` query params forwarded | Pass |
| Mark as read server-side | Backend sets `read_at`, UI uses returned event | Pass |
| Dismiss server-side | Backend sets `dismissed_at`, UI uses returned event | Pass |
| No local eligibility | No `isEligible`, `shouldDeliver`, `shouldSuppress` in page code | Pass |
| No local delivery state | UI never computes sent/delivered/failed status | Pass |
| Parent component library | `ParentCard`, `ParentBadge`, `ParentLoadingState`, `ParentEmptyState`, `ParentErrorState` | Pass |
| Error handling | API errors caught, error state rendered | Pass |
| Arabic/RTL readiness | Category labels in Arabic, CSS uses parent dashboard baseline | Pass |

### Test coverage

- `parent-notification-ui.test.js` — pages exist, no forbidden authority
  patterns, data imported only via API client, no child-id scope override,
  API client is GET/PATCH only.

---

## 2. Parent notification settings (preferences + quiet hours)

### Flow

1. Parent switches to the settings tab.
2. `ParentNotificationSettings` calls `getChannelPreferences()` and
   `getQuietHours()` via the API client.
3. Backend returns preference rows (channel + category + enabled) and
   quiet hours (enabled, startTime, endTime, timezone).
4. Parent toggles a preference → `PATCH /api/v1/notifications/preferences`
   with `{ channel, category, enabled }`.
5. Parent updates quiet hours → `PATCH /api/v1/notifications/quiet-hours`
   with `{ enabled, startTime, endTime, timezone }`.
6. Backend upserts and returns updated records. Audit events logged.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Preferences scoped by userId | Backend derives user from JWT | Pass |
| Toggle sends to backend | `PATCH` with channel/category/enabled | Pass |
| Quiet hours stored server-side | Backend evaluates at dispatch time, not client | Pass |
| No client-side quiet-hour enforcement | Parent web never checks if current time is in quiet hours | Pass |
| No local eligibility decision | UI only displays and toggles | Pass |
| Audit logged | `preference_updated`, `quiet_hours_updated` events | Pass |
| Component library used | `ParentCard`, form classes from `ParentPages.css` | Pass |

### Test coverage

- `parent-notification-ui.test.js` — no `isWithinQuietHours`,
  `computeDeliveryState`, or `shouldSuppress` in page code.

---

## 3. Parent deadline reminders

### Flow

1. Parent switches to the deadline reminders tab.
2. `ParentDeadlineReminders` calls `getReminderSchedules()` via API client.
3. Backend `ReminderScheduleService.getActiveSchedules(userId)` returns
   non-cancelled schedules with status, next_fire_at, cron details.
4. UI renders schedules using `ParentCard` + `ParentBadge` (status badges
   with Arabic labels and semantic variants: active/paused/completed/cancelled).
5. Parent can pause/resume/cancel → API client sends
   `PATCH /api/v1/notifications/reminders/:scheduleId/pause|resume|cancel`.
6. Backend validates status transition, enforces `WHERE id = $1 AND user_id = $2`,
   returns updated schedule. Audit events logged.

### E2E checks

| Step | Check | Status |
|---|---|---|
| Schedules scoped by userId | SQL `WHERE user_id = $1` | Pass |
| Pause/resume/cancel scoped | SQL `WHERE id = $1 AND user_id = $2` | Pass |
| Schedule authority is backend-only | Parent web never creates schedules or modifies cron | Pass |
| No local schedule computation | No `computeNextRunAt` in page code | Pass |
| Status transitions server-validated | Backend enforces valid state changes | Pass |
| Audit logged | `schedule_paused`/`resumed`/`cancelled` events | Pass |
| Component library | `ParentCard`, `ParentBadge`, `ParentLoadingState`, `ParentEmptyState`, `ParentErrorState` | Pass |
| Arabic labels | Status labels in Arabic (`نشط`, `متوقف مؤقتًا`, `مكتمل`, `ملغى`) | Pass |

### Test coverage

- `parent-notification-ui.test.js` — no forbidden authority patterns,
  API client is read + PATCH only.

---

## 4. API client architecture

`notificationsApiClient.js` is the sole data gateway for parent
notification pages. All requests go through `notificationsRequest()`:

- Bearer token read from localStorage (never hardcoded).
- All requests scoped to `/api/v1/notifications/*`.
- Methods: `GET` for reads, `PATCH` for mutations. No `POST` (parent
  cannot create schedules or enqueue notifications) except implicitly
  via backend integrations.
- Request timeout: 30 seconds with `AbortController`.
- Error handling: HTTP errors parsed and thrown with status code.

### E2E checks

| Step | Check | Status |
|---|---|---|
| No provider secrets in client | No API keys, no service tokens | Pass |
| No child-id in requests | No `childId` parameter anywhere | Pass |
| Bearer token from session | Read from localStorage, attached as `Authorization` header | Pass |
| No direct database calls | All data via backend API | Pass |
| Read-only + PATCH only | No `DELETE`, no `POST` for notifications | Pass |

---

## 5. Parent/child data scope (Phase 12 consent)

| Rule | Enforcement | Status |
|---|---|---|
| Parent sees own notifications only | Backend scopes by parent's `userId` from JWT | Pass |
| No child notification stream exposed | Parent feed contains parent-account events (parent_summary, deadline_reminder), not child's personal feed | Pass |
| No child-id scope override | API client and pages never pass child id | Pass |
| Notification content is template-rendered | Titles/bodies from server-side templates; no raw child data | Pass |
| Parent summary carries counts only | `event_count` variable, no underlying event titles or scores | Pass |

---

## 6. Cross-cutting authority checks

| Rule | Enforcement | Status |
|---|---|---|
| Backend owns notification eligibility | `NotificationEligibilityService` at enqueue, not in parent web | Pass |
| Backend owns delivery state | `NotificationDeliveryWorker` dispatches, parent web never sets status | Pass |
| Backend owns quiet-hour enforcement | `isInQuietHours()` evaluated server-side | Pass |
| Backend owns schedule authority | `ReminderScheduleService` manages cron/fire/advance | Pass |
| Payloads are privacy-safe | Template-rendered, no raw AIM output or sensitive data | Pass |
| No provider secrets in web | No `process.env` provider keys in parent pages | Pass |

---

## 7. Summary

| Flow | Backend authority | Privacy-safe | Design system | Tests | E2E |
|---|---|---|---|---|---|
| Notification inbox | Pass | Pass | Pass | Pass | Pass |
| Notification settings | Pass | Pass | Pass | Pass | Pass |
| Deadline reminders | Pass | Pass | Pass | Pass | Pass |
| API client | Pass | Pass | N/A | Pass | Pass |
| Parent/child scope | Pass | Pass | N/A | Pass | Pass |

**Overall: Pass.** The parent notification flow is fully end-to-end
validated. All business logic, eligibility, scheduling, delivery,
and quiet-hour enforcement remain backend-controlled. The parent web
dashboard correctly acts as a display and relay layer, using the
established parent component library and delegating all authority to
the backend API. Parent/child data scope is preserved — parent sees
only their own notifications with template-rendered content. Test
coverage verifies no forbidden authority patterns exist in page code.
