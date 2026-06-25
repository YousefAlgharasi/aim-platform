# AIM Backend API — Complete Endpoints Reference

All endpoints require `Authorization: Bearer <token>` unless marked **Public**.

---

## 1. Health & Version

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Backend health check |
| GET | `/version` | Public | Backend version metadata |
| GET | `/health/db-tables` | Public (header key) | Diagnostic: list database tables |

---

## 2. Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Login with email and password |
| POST | `/auth/register` | Public | Register a new account |
| POST | `/auth/refresh` | Public | Exchange refresh token for new session |
| POST | `/auth/test-login` | Public | Dev/staging test login by role |
| GET | `/auth/me` | Bearer | Get current authenticated user context (includes DB roles) |
| POST | `/auth/bootstrap` | Bearer | Create/sync internal user and profile records |
| POST | `/auth/logout` | Bearer | Invalidate current session server-side |

---

## 3. Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile/me` | Bearer | Get authenticated user's own profile |
| PATCH | `/profile/me` | Bearer | Update profile fields (display name, avatar, etc.) |

---

## 4. Admin — User Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List all users (paginated, searchable) |
| GET | `/admin/users/:id` | Admin | Get user detail with assigned roles |
| PATCH | `/admin/users/:id/status` | Admin | Update user status (active/disabled) |
| GET | `/admin/roles` | Admin | List all roles |
| GET | `/admin/roles/:key` | Admin | Get role detail with permissions |
| PUT | `/admin/users/:userId/roles` | Admin | Assign or change a user's role |

---

## 5. Admin — Data Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/assessments` | Admin | List assessments (paginated, filterable by type) |
| GET | `/admin/deadlines` | Admin | List assessment deadlines (paginated) |
| GET | `/admin/assessment-results` | Admin | List assessment results (filterable by student/assessment) |
| GET | `/admin/placement/results` | Admin | List placement results (paginated) |
| GET | `/admin/session-summaries` | Admin | List session summaries (filterable by student) |
| GET | `/admin/audit-logs` | Admin | List audit logs (filterable by user/action/date) |
| GET | `/admin/activity-logs` | Admin | List activity logs (filterable by user/event/date) |
| GET | `/admin/reports/enrollments` | Admin | Enrollment report (aggregate) |
| GET | `/admin/reports/assessments` | Admin | Assessment report (attempts, pass/fail, avg score) |
| GET | `/admin/reports/active-users` | Admin | Active users report (daily/weekly/monthly) |

---

## 6. Admin — AI Teacher Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/ai/prompts` | Admin | List all prompt templates |
| GET | `/admin/ai/prompts/:id` | Admin | Get prompt template by ID |
| POST | `/admin/ai/prompts` | Admin | Create draft prompt template |
| POST | `/admin/ai/prompts/:id/publish` | Admin | Publish prompt template |
| POST | `/admin/ai/prompts/:id/retire` | Admin | Retire prompt template |
| GET | `/admin/ai/model-configs` | Admin | List all model configs |
| GET | `/admin/ai/model-configs/:id` | Admin | Get model config by ID |
| POST | `/admin/ai/model-configs/:id/status` | Admin | Change model config status |
| POST | `/admin/ai/model-configs/:id/limits` | Admin | Update model config limits |
| GET | `/admin/ai/audit/logs` | Admin | List AI Teacher audit logs |
| GET | `/admin/ai/safety/events` | Admin | List rejected safety events |
| GET | `/admin/ai/safety/feedback` | Admin | List flagged feedback |
| GET | `/admin/ai/usage` | Admin | List recent AI usage/cost events |
| GET | `/admin/ai/usage/student/:studentId` | Admin | List AI usage for a student |
| GET | `/admin/ai/usage/student/:studentId/limit-status` | Admin | Get student quota status |

---

## 7. Admin — Analytics & Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/analytics/dashboard/:dashboardKey` | Admin | Get analytics dashboard data |
| GET | `/admin/analytics/reports/learning` | Admin | List learning report definitions |
| POST | `/admin/analytics/reports/learning/:reportKey/run` | Admin | Run a learning report |
| GET | `/admin/analytics/reports/learning/runs/:runId` | Admin | Get learning report run status |
| GET | `/admin/analytics/reports/assessment` | Admin | List assessment report definitions |
| POST | `/admin/analytics/reports/assessment/:reportKey/run` | Admin | Run an assessment report |
| GET | `/admin/analytics/reports/assessment/runs/:runId` | Admin | Get assessment report run status |
| GET | `/admin/analytics/reports/revenue` | Admin | List revenue report definitions |
| POST | `/admin/analytics/reports/revenue/:reportKey/run` | Admin | Run a revenue report |
| GET | `/admin/analytics/reports/revenue/runs/:runId` | Admin | Get revenue report run status |
| POST | `/analytics/exports` | Admin | Request report export |
| GET | `/analytics/exports/:exportJobId` | Admin | Get export job status |

---

## 8. Admin — Billing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/billing/subscriptions/:userId` | Admin | Get user's subscriptions |
| GET | `/admin/billing/payments/:userId` | Admin | Get user's payments |
| GET | `/admin/billing/invoices/:userId` | Admin | Get user's invoices |
| GET | `/admin/billing/refunds/:paymentId` | Admin | Get payment refunds |
| GET | `/admin/billing/provider-events` | Admin | Get billing provider events |
| GET | `/admin/billing/audit-logs` | Admin | Get billing audit logs |

---

## 9. Admin — Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/notifications/audit-logs` | Admin | List notification audit logs |
| GET | `/api/v1/admin/notifications/delivery-attempts/:eventId` | Admin | View delivery attempts for event |
| GET | `/api/v1/admin/notifications/events/:userId` | Admin | View user notification events |
| GET | `/api/v1/admin/notifications/templates` | Admin | List notification templates |
| GET | `/api/v1/admin/notifications/templates/:templateId` | Admin | Get notification template |

---

## 10. Admin — Operations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/operations/dashboard` | Admin | Operations dashboard summary |
| POST | `/admin/maintenance-windows` | Admin | Create maintenance window |
| GET | `/admin/maintenance-windows` | Admin | List all maintenance windows |
| PATCH | `/admin/maintenance-windows/:id/status` | Admin | Update maintenance window status |
| POST | `/admin/incidents` | Admin | Create incident |
| GET | `/admin/incidents` | Admin | List incidents |
| PATCH | `/admin/incidents/:id/status` | Admin | Update incident status |
| GET | `/admin/support-tickets` | Admin | List all support tickets |
| PATCH | `/admin/support-tickets/:id/status` | Admin | Update ticket status |
| PATCH | `/admin/support-tickets/:id/assign` | Admin | Assign ticket to agent |
| POST | `/admin/feature-flags` | Admin | Create feature flag |
| GET | `/admin/feature-flags` | Admin | List feature flags |
| PATCH | `/admin/feature-flags/:id` | Admin | Update feature flag |
| POST | `/admin/release-notes` | Admin | Create release note |
| GET | `/admin/release-notes` | Admin | List all release notes |
| POST | `/admin/release-notes/:id/publish` | Admin | Publish release note |
| POST | `/admin/release-notes/:id/archive` | Admin | Archive release note |

---

## 11. Curriculum (Permission-based)

### Courses
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/courses` | CURRICULUM.READ | List courses |
| GET | `/curriculum/courses/:id` | CURRICULUM.READ | Get course by ID |
| POST | `/curriculum/courses` | CURRICULUM.WRITE | Create course |
| PATCH | `/curriculum/courses/:id` | CURRICULUM.WRITE | Update course |

### Levels
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/courses/:courseId/levels` | CURRICULUM.READ | List levels for course |
| GET | `/curriculum/courses/:courseId/levels/:id` | CURRICULUM.READ | Get level by ID |
| POST | `/curriculum/courses/:courseId/levels` | CURRICULUM.WRITE | Create level |
| PATCH | `/curriculum/courses/:courseId/levels/:id` | CURRICULUM.WRITE | Update level |

### Chapters
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/chapters` | CURRICULUM.READ | List chapters |
| GET | `/curriculum/chapters/:id` | CURRICULUM.READ | Get chapter by ID |
| POST | `/curriculum/chapters` | CURRICULUM.WRITE | Create chapter |
| PATCH | `/curriculum/chapters/:id` | CURRICULUM.WRITE | Update chapter |

### Lessons
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/lessons` | CURRICULUM.READ | List lessons |
| GET | `/curriculum/lessons/:id` | CURRICULUM.READ | Get lesson by ID |
| POST | `/curriculum/lessons` | CURRICULUM.WRITE | Create lesson |
| PATCH | `/curriculum/lessons/:id` | CURRICULUM.WRITE | Update lesson |
| GET | `/curriculum/lessons/:id/publish-validation` | CURRICULUM.READ | Check lesson publish readiness |

### Skills
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/skills` | CURRICULUM.READ | List skills |
| GET | `/curriculum/skills/:id` | CURRICULUM.READ | Get skill by ID |
| GET | `/curriculum/skills/by-key/:key` | CURRICULUM.READ | Get skill by stable key |
| POST | `/curriculum/skills` | CURRICULUM.WRITE | Create skill |
| PATCH | `/curriculum/skills/:id` | CURRICULUM.WRITE | Update skill |

### Objectives
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/objectives` | CURRICULUM.READ | List objectives |
| GET | `/curriculum/objectives/:id` | CURRICULUM.READ | Get objective by ID |
| GET | `/curriculum/objectives/by-key/:key` | CURRICULUM.READ | Get objective by key |
| POST | `/curriculum/objectives` | CURRICULUM.WRITE | Create objective |
| PATCH | `/curriculum/objectives/:id` | CURRICULUM.WRITE | Update objective |

### Question Bank
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/questions` | CURRICULUM.READ | List questions |
| GET | `/curriculum/questions/:id` | CURRICULUM.READ | Get question by ID |
| POST | `/curriculum/questions` | CURRICULUM.WRITE | Create question |
| PATCH | `/curriculum/questions/:id` | CURRICULUM.WRITE | Update question |

### Lesson Assets
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/lesson-assets` | CURRICULUM.READ | List lesson assets |
| GET | `/curriculum/lesson-assets/:id` | CURRICULUM.READ | Get lesson asset by ID |
| POST | `/curriculum/lesson-assets` | CURRICULUM.WRITE | Create lesson asset |
| PATCH | `/curriculum/lesson-assets/:id` | CURRICULUM.WRITE | Update lesson asset |
| POST | `/curriculum/lesson-assets/:id/archive` | CURRICULUM.ARCHIVE | Archive lesson asset |

### Lesson-Objective Links
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/lessons/:lessonId/objectives` | CURRICULUM.READ | List objectives for lesson |
| POST | `/curriculum/lessons/:lessonId/objectives` | CURRICULUM.WRITE | Link objective to lesson |
| DELETE | `/curriculum/lessons/:lessonId/objectives/:objectiveId` | CURRICULUM.WRITE | Unlink objective from lesson |

### Lesson-Skill Links
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/lessons/:lessonId/skills` | CURRICULUM.READ | List skills for lesson |
| POST | `/curriculum/lessons/:lessonId/skills` | CURRICULUM.WRITE | Link skill to lesson |
| DELETE | `/curriculum/lessons/:lessonId/skills/:skillId` | CURRICULUM.WRITE | Unlink skill from lesson |

### Question-Skill Links
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/questions/:questionId/skills` | CURRICULUM.READ | List skills for question |
| POST | `/curriculum/questions/:questionId/skills` | SKILL_LINKS_MANAGE | Link skill to question |
| PUT | `/curriculum/questions/:questionId/skills/:skillId/primary` | SKILL_LINKS_MANAGE | Set primary skill |
| DELETE | `/curriculum/questions/:questionId/skills/:skillId` | SKILL_LINKS_MANAGE | Remove skill from question |

### Content Status Workflow
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/curriculum/workflow/:entityType/:entityId/publish` | CURRICULUM.PUBLISH | Publish curriculum entity |
| PATCH | `/curriculum/workflow/:entityType/:entityId/archive` | CURRICULUM.ARCHIVE | Archive curriculum entity |
| PATCH | `/curriculum/workflow/:entityType/:entityId/restore` | CURRICULUM.RESTORE | Restore archived entity |

### Audit Log
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/curriculum/audit-logs` | CURRICULUM.AUDIT_READ | List curriculum audit logs |

---

## 12. Placement Testing (Student)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/placement/active` | Student | Get active placement test metadata |
| GET | `/placement/sections` | Student | List placement test sections |
| GET | `/placement/questions` | Student | Get placement questions by section |
| POST | `/placement/attempts` | Student | Start placement attempt |
| POST | `/placement/attempts/:id/answers` | Student | Submit placement answer |
| POST | `/placement/attempts/:id/complete` | Student | Complete placement attempt |
| GET | `/placement/attempts/:id/result` | Student | Get placement attempt result |

---

## 13. Assessments (Student)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/student/assessments` | Student | List published assessments |
| GET | `/student/assessments/deadlines` | Student | List student's assessment deadlines |
| GET | `/student/assessments/:id` | Student | Get assessment detail and deadline state |
| GET | `/student/assessments/:id/history` | Student | List previous attempt results |
| POST | `/student/assessments/:id/attempts` | Student | Start assessment attempt |
| GET | `/student/assessments/attempts/:attemptId/resume` | Student | Resume active attempt |
| POST | `/student/assessments/attempts/:attemptId/submit` | Student | Submit attempt for backend grading |
| GET | `/student/assessments/attempts/:attemptId/result` | Student | Get backend-approved result |

---

## 14. Sessions & Question/Answer (Student)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/sessions/start` | Student | Start a new learning session |
| POST | `/sessions/:sessionId/attempt` | Student | Submit lesson attempt, triggers AIM analysis |

---

## 15. AIM Engine Results (Student)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/aim/students/:studentId/skill-states` | Student | Read student skill mastery states |
| GET | `/aim/students/:studentId/weakness-records` | Student | Read student weakness records |
| GET | `/aim/students/:studentId/review-schedules` | Student | Read spaced-repetition review schedules |
| GET | `/aim/students/:studentId/recommendations` | Student | Read active learning recommendations |
| GET | `/aim/students/:studentId/sessions/:sessionId/state` | Student | Read session AIM state/feedback |

---

## 16. AI Teacher (Student)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai-teacher/sessions` | Student | Create new AI Teacher chat session |
| GET | `/ai-teacher/sessions` | Student | List student's active chat sessions |
| POST | `/ai-teacher/sessions/:id/messages` | Student | Send message to AI Teacher |
| GET | `/ai-teacher/sessions/:id/messages` | Student | Get chat history |
| POST | `/ai-teacher/sessions/:id/messages/stream` | Student | Stream AI Teacher reply (SSE) |
| POST | `/ai-teacher/messages/:messageId/feedback` | Student | Submit feedback on AI reply |
| GET | `/ai-teacher/sessions/:id/safety-status` | Student | Get AI session safety status |

---

## 17. Voice Teacher (Student)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/voice-teacher/sessions` | Bearer | Create voice teacher session |
| GET | `/voice-teacher/sessions` | Bearer | List voice sessions |
| GET | `/voice-teacher/sessions/:sessionId/messages` | Bearer | Get voice session message history |
| POST | `/voice-teacher/sessions/:sessionId/audio` | Bearer | Submit voice audio (multipart) |
| GET | `/voice-teacher/audio/:audioRef` | Bearer | Stream voice audio playback |
| POST | `/voice-teacher/sessions/:sessionId/feedback` | Bearer | Submit voice session feedback |

---

## 18. Student Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/student/analytics/summary` | Student | Get student analytics summary report |

---

## 19. Parent Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/parent/children` | Parent | List parent's linked children |
| GET | `/api/v1/parent/dashboard-summary` | Parent | Get parent dashboard summary |
| GET | `/api/v1/parent/children/:childId/progress` | Parent | Get child's learning progress |
| GET | `/api/v1/parent/children/:childId/assessments` | Parent | Get child's assessment results |
| GET | `/api/v1/parent/children/:childId/activity` | Parent | Get child's activity log |
| GET | `/api/v1/parent/children/:childId/ai-summary` | Parent | Get child's AI Teacher usage |
| GET | `/api/v1/parent/children/:childId/ai-safety-summary` | Parent | Get child's AI safety summary |
| GET | `/api/v1/parent/children/:childId/reports` | Parent | Get child's report |
| POST | `/api/v1/parent/invitations` | Parent | Create parent-child link invitation |
| POST | `/api/v1/parent/invitations/accept` | Parent | Accept link invitation |
| POST | `/api/v1/parent/invitations/:invitationId/revoke` | Parent | Revoke invitation |
| GET | `/api/v1/parent/invitations` | Parent | List parent's invitations |
| POST | `/api/v1/parent/consents` | Parent | Grant data-sharing consent |
| POST | `/api/v1/parent/consents/revoke` | Parent | Revoke consent |
| GET | `/api/v1/parent/links/:linkId/consents` | Parent | List consents for a link |
| GET | `/api/v1/parent/notification-preferences` | Parent | Get notification preferences |
| PATCH | `/api/v1/parent/notification-preferences` | Parent | Update notification preferences |

---

## 20. Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/notifications/device-tokens` | Bearer | Register device push token |
| DELETE | `/api/v1/notifications/device-tokens/:tokenId` | Bearer | Remove device token |
| GET | `/api/v1/notifications/preferences` | Bearer | Get notification preferences |
| PATCH | `/api/v1/notifications/preferences` | Bearer | Update a notification preference |
| GET | `/api/v1/notifications/inbox` | Bearer | Get in-app notification inbox |
| GET | `/api/v1/notifications/inbox/unread-count` | Bearer | Get unread notification count |
| PATCH | `/api/v1/notifications/inbox/:eventId/read` | Bearer | Mark notification as read |
| PATCH | `/api/v1/notifications/inbox/:eventId/dismiss` | Bearer | Dismiss notification |
| GET | `/api/v1/notifications/reminders` | Bearer | Get active reminder schedules |
| PATCH | `/api/v1/notifications/reminders/:scheduleId/pause` | Bearer | Pause a reminder |
| PATCH | `/api/v1/notifications/reminders/:scheduleId/resume` | Bearer | Resume a reminder |
| PATCH | `/api/v1/notifications/reminders/:scheduleId/cancel` | Bearer | Cancel a reminder |
| GET | `/api/v1/notifications/quiet-hours` | Bearer | Get quiet hours settings |
| PATCH | `/api/v1/notifications/quiet-hours` | Bearer | Update quiet hours |

---

## 21. Billing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/billing/pricing` | Public | Get active products, prices, and plans |
| GET | `/billing/pricing/plans` | Public | Get active plans with prices |
| GET | `/billing/pricing/prices` | Public | Get active prices |
| POST | `/billing/checkout` | Bearer | Create checkout session |
| GET | `/billing/checkout/:sessionId/status` | Bearer | Get checkout session status |
| GET | `/billing/checkout/recent` | Bearer | Get recent checkout sessions |
| GET | `/billing/subscriptions` | Bearer | Get user's subscriptions and entitlements |
| GET | `/billing/subscriptions/:id` | Bearer | Get subscription by ID |
| POST | `/billing/subscriptions/:id/cancel` | Bearer | Cancel subscription |
| GET | `/billing/invoices` | Bearer | List user's invoices |
| GET | `/billing/invoices/:id` | Bearer | Get invoice by ID |
| POST | `/billing/refunds` | Bearer | Request a refund |
| GET | `/billing/refunds/:id` | Bearer | Get refund status |
| POST | `/billing/webhooks/provider` | Public (signature) | Payment provider webhook |

---

## 22. Operations (User-facing)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/feedback` | Bearer | Submit feedback |
| GET | `/feedback/mine` | Bearer | Get my submitted feedback |
| POST | `/feature-requests` | Bearer | Submit feature request |
| GET | `/feature-requests` | Bearer | List feature requests |
| GET | `/feature-requests/:id` | Bearer | Get feature request detail |
| POST | `/feature-requests/:id/vote` | Bearer | Vote on a feature request |
| POST | `/support-tickets` | Bearer | Create support ticket |
| GET | `/support-tickets` | Bearer | List my support tickets |
| GET | `/support-tickets/:id` | Bearer | Get support ticket detail |
| POST | `/support-tickets/:id/comments` | Bearer | Add comment to ticket |
| GET | `/release-notes` | Bearer | List published release notes |
| GET | `/release-notes/:id` | Bearer | Get release note detail |
| GET | `/operational-status` | Bearer | Get system component statuses |
| GET | `/maintenance-windows` | Bearer | List active/upcoming maintenance windows |

---

## Summary

| Category | Endpoints |
|----------|-----------|
| Health & Version | 3 |
| Authentication | 7 |
| Profile | 2 |
| Admin — Users & Roles | 6 |
| Admin — Data | 10 |
| Admin — AI Teacher | 15 |
| Admin — Analytics | 12 |
| Admin — Billing | 6 |
| Admin — Notifications | 5 |
| Admin — Operations | 17 |
| Curriculum | 53 |
| Placement | 7 |
| Assessments (Student) | 8 |
| Sessions & Q/A | 2 |
| AIM Engine | 5 |
| AI Teacher (Student) | 7 |
| Voice Teacher | 6 |
| Student Analytics | 1 |
| Parent Dashboard | 17 |
| Notifications | 14 |
| Billing | 14 |
| Operations (User) | 14 |
| **Total** | **~231** |
