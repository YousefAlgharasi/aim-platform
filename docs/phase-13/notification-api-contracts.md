# Notification API Contracts — Phase 13

## Base URL
`/api/v1/notifications`

All endpoints require `Authorization: Bearer <jwt>`. Backend validates ownership — users can only access their own data.

---

## Device Tokens

### POST /device-tokens
Register or update a push device token.

**Request:**
```json
{
  "platform": "ios" | "android" | "web",
  "token": "string (max 512)",
  "deviceName": "string (optional, max 128)"
}
```

**Response:** `DeviceTokenEntity`

**Errors:**
- `400` — Invalid platform or token
- `401` — Not authenticated

### DELETE /device-tokens/:tokenId
Disable a device token.

**Response:** `{ "success": true }`

---

## Preferences

### GET /preferences
Get all notification preferences for the authenticated user.

**Response:** `NotificationPreferenceEntity[]`

### PATCH /preferences
Update a single notification preference.

**Request:**
```json
{
  "channel": "in_app" | "push" | "email",
  "category": "learning_reminder" | "deadline_reminder" | "progress_update" | "assessment_result" | "parent_summary" | "system_alert",
  "enabled": true | false
}
```

**Response:** `NotificationPreferenceEntity`

---

## In-App Inbox

### GET /inbox
Get in-app notification inbox.

**Query:** `limit` (default 20), `offset` (default 0)

**Response:** `NotificationEventEntity[]`

### GET /inbox/unread-count
**Response:** `{ "count": number }`

### PATCH /inbox/:eventId/read
Mark notification as read.

**Response:** `NotificationEventEntity`

### PATCH /inbox/:eventId/dismiss
Dismiss a notification.

**Response:** `NotificationEventEntity`

**Errors:**
- `404` — Notification not found (wrong user or ID)

---

## Reminder Schedules

### GET /reminders
Get active reminder schedules.

**Response:** `ReminderScheduleEntity[]`

### PATCH /reminders/:scheduleId/pause
Pause a reminder schedule.

### PATCH /reminders/:scheduleId/resume
Resume a paused schedule.

### PATCH /reminders/:scheduleId/cancel
Cancel a reminder schedule.

**Errors:**
- `404` — Schedule not found

---

## Quiet Hours

### GET /quiet-hours
Get quiet hours settings.

**Response:** `QuietHoursEntity | null`

### PATCH /quiet-hours
Update quiet hours settings.

**Request:**
```json
{
  "enabled": true,
  "startTime": "22:00",
  "endTime": "07:00",
  "timezone": "Asia/Riyadh"
}
```

**Response:** `QuietHoursEntity`

---

## Admin Read-Only Endpoints

Base URL: `/api/v1/admin/notifications`

Requires `admin` role.

### GET /audit-logs
Query audit logs. Supports `eventType`, `userId`, `limit`, `offset`.

### GET /delivery-attempts/:eventId
View delivery attempts for a notification event.

### GET /events/:userId
View notification events for a user. Supports `channel`, `limit`, `offset`.

---

## Privacy Rules
- No payload contains secrets, provider keys, service tokens, or sensitive child data.
- Backend owns all scheduling, eligibility, quiet-hour enforcement, and delivery state.
- UI only displays backend-approved data.

## Error Codes
- `400` — Validation error (bad DTO)
- `401` — Not authenticated
- `403` — Forbidden (wrong ownership or role)
- `404` — Resource not found
- `429` — Rate limited
