# AIM Mobile App — API Endpoints Reference

All endpoints require `Authorization: Bearer <token>` unless marked as **Public**.

---

## 1. Health & Version

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/version` | API version check |

---

## 2. Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login with email and password. Body: `{email, password}` |
| POST | `/auth/register` | Public | Register new account. Body: `{email, password}` |
| POST | `/auth/refresh` | Public | Refresh access token. Body: `{refreshToken}` |
| POST | `/auth/test-login` | Public | Non-production test login. Body: `{role}` |
| GET | `/auth/me` | Bearer | Get current authenticated user context |
| POST | `/auth/bootstrap` | Bearer | Sync internal user record. Body: `{preferredLanguage?, timezone?}` |
| POST | `/auth/logout` | Bearer | Invalidate current session |

---

## 3. Profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile/me` | Get current user profile |
| PATCH | `/profile/me` | Update profile fields |

---

## 4. Curriculum

| Method | Path | Description |
|--------|------|-------------|
| GET | `/curriculum/courses` | List published courses. Query: `status=published` |
| GET | `/curriculum/chapters` | List chapters. Query: `levelId` |
| GET | `/curriculum/lessons` | List lessons. Query: `chapterId` |
| GET | `/curriculum/lessons/:lessonId` | Get lesson detail |
| GET | `/curriculum/lesson-assets` | Get lesson assets. Query: `lessonId`, `status=published` |
| GET | `/curriculum/questions/:questionId` | Get question detail |
| GET | `/student/chapters` | List published chapters under a level, enriched with the student's real progress (`percent`, `completedLessonCount`, `status`). Query: `levelId`. Distinct from `/curriculum/chapters` (no progress). |
| GET | `/student/lessons` | List published lessons under a chapter, enriched with the student's real `completed`/`current` markers. Query: `chapterId`. Distinct from `/curriculum/lessons` (no progress). |

---

## 5. Placement Testing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/placement/active` | Get active placement test |
| GET | `/placement/active/sections` | Get sections for active placement test |
| GET | `/placement/questions` | Get placement questions. Query: `sectionId` |
| POST | `/placement/attempts` | Start placement attempt. Body: `{placement_test_id}` |
| POST | `/placement/attempts/:id/answers` | Submit placement answer |
| POST | `/placement/attempts/:id/complete` | Complete placement attempt |
| GET | `/placement/attempts/:id/result` | Get placement attempt result |

---

## 6. Sessions & Question/Answer

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sessions/start` | Start a Q&A session |
| POST | `/sessions/:sessionId/attempt` | Submit answer attempt in session |

---

## 7. AIM Engine Results

| Method | Path | Description |
|--------|------|-------------|
| GET | `/aim/students/:studentId/skill-states` | Get student skill states |
| GET | `/aim/students/:studentId/weakness-records` | Get student weakness records |
| GET | `/aim/students/:studentId/review-schedules` | Get student review schedules |
| GET | `/aim/students/:studentId/recommendations` | Get student recommendations |
| GET | `/aim/students/:studentId/sessions/:sessionId/state` | Get session state/feedback |
| GET | `/aim/students/:studentId/difficulty-decisions` | Get latest AIM difficulty decision |

---

## 8. AI Teacher (Chat)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai-teacher/sessions` | Create AI teacher session. Body: `{contextRef}` |
| GET | `/ai-teacher/sessions` | List AI teacher sessions |
| POST | `/ai-teacher/sessions/:id/messages` | Send message. Body: `{message}` |
| GET | `/ai-teacher/sessions/:id/messages` | Get chat history |
| POST | `/ai-teacher/sessions/:id/messages/stream` | Stream AI response (SSE). Body: `{message}` |
| POST | `/ai-teacher/messages/:id/feedback` | Submit feedback. Body: `{rating}` |
| GET | `/ai-teacher/sessions/:id/safety-status` | Get session safety status |

---

## 9. Voice Teacher

| Method | Path | Description |
|--------|------|-------------|
| POST | `/voice-teacher/sessions` | Create voice session. Body: `{contextRef}` |
| GET | `/voice-teacher/sessions` | List voice sessions |
| GET | `/voice-teacher/sessions/:id/messages` | Get voice session history |
| POST | `/voice-teacher/sessions/:id/audio` | Submit audio (multipart upload) |
| GET | `/voice-teacher/audio/:audioRef` | Get audio playback (raw bytes) |
| POST | `/voice-teacher/sessions/:id/feedback` | Submit feedback. Body: `{messageId, rating, comment?}` |

---

## 10. Assessments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/student/assessments` | List assessments for student |
| GET | `/student/assessments/deadlines` | Get assessment deadlines |
| GET | `/student/assessments/:id` | Get assessment detail |
| GET | `/student/assessments/:id/history` | Get attempt history |
| POST | `/student/assessments/:id/attempts` | Start assessment attempt |
| GET | `/student/assessments/attempts/:attemptId/resume` | Resume assessment attempt |
| POST | `/student/assessments/attempts/:attemptId/submit` | Submit assessment attempt |
| GET | `/student/assessments/attempts/:attemptId/result` | Get attempt result |

---

## 11. Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/student/analytics/summary` | List analytics report definitions visible to the student |
| POST | `/student/analytics/summary/:reportKey/run` | Run a student-facing report (e.g. `student_aim_progress`) |
| GET | `/student/analytics/summary/runs/:runId` | Get the status/result of a student report run |

---

## 12. Notifications

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/notifications/device-tokens` | Register device push token. Body: `{platform, token, deviceName?}` |
| DELETE | `/api/v1/notifications/device-tokens/:tokenId` | Delete device token |
| GET | `/api/v1/notifications/preferences` | Get notification preferences |
| PATCH | `/api/v1/notifications/preferences` | Update preferences. Body: `{channel, category, enabled}` |
| GET | `/api/v1/notifications/inbox` | Get notification inbox. Query: `limit`, `offset` |
| GET | `/api/v1/notifications/inbox/unread-count` | Get unread count |
| PATCH | `/api/v1/notifications/inbox/:eventId/read` | Mark as read |
| PATCH | `/api/v1/notifications/inbox/:eventId/dismiss` | Dismiss notification |
| GET | `/api/v1/notifications/reminders` | Get reminder schedules |
| PATCH | `/api/v1/notifications/reminders/:scheduleId/pause` | Pause reminder |
| PATCH | `/api/v1/notifications/reminders/:scheduleId/resume` | Resume reminder |
| PATCH | `/api/v1/notifications/reminders/:scheduleId/cancel` | Cancel reminder |
| GET | `/api/v1/notifications/quiet-hours` | Get quiet hours settings |
| PATCH | `/api/v1/notifications/quiet-hours` | Update quiet hours. Body: `{enabled, startTime, endTime, timezone}` |

---

## 13. Planned / Not Yet Active

### Support
| Method | Path | Description |
|--------|------|-------------|
| GET | `/support/tickets` | List support tickets |
| GET | `/support/tickets/:id` | Get ticket detail |
| POST | `/support/tickets` | Create support ticket |
| GET | `/support/tickets/:id/comments` | Get ticket comments |
| POST | `/support/tickets/:id/comments` | Add comment |
| POST | `/feedback` | Submit feedback |
| GET | `/release-notes` | Get release notes |
| GET | `/release-notes/:id` | Get release note detail |
| GET | `/status` | Get operational status |

### Billing
| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/plans` | Get billing plans |
| GET | `/billing/prices` | Get pricing |
| POST | `/billing/checkout` | Create checkout session |
| GET | `/billing/checkout/:sessionId` | Get checkout status |
| GET | `/billing/subscriptions` | Get subscriptions |
| DELETE | `/billing/subscriptions/:id` | Cancel subscription |
| GET | `/billing/invoices` | Get invoices |
| GET | `/billing/entitlements` | Get entitlements |

---

## Summary

| Category | Active Endpoints |
|----------|-----------------|
| Auth | 7 |
| Profile | 2 |
| Curriculum | 6 |
| Placement | 7 |
| Sessions/Q&A | 2 |
| AIM Engine | 5 |
| AI Teacher | 7 |
| Voice Teacher | 6 |
| Assessments | 8 |
| Analytics | 3 |
| Notifications | 14 |
| **Total Active** | **67** |
| Planned (Support + Billing) | 17 |
