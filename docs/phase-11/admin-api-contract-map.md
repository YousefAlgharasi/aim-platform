# Phase 11 — Admin API Contract Map

**Task:** P11-005
**Depends on:** P11-002 (Admin Capability Map)

This document maps every backend API contract needed by the Phase 11 Admin Dashboard. All APIs are protected by JWT auth and role guards. Admin UI calls these APIs only — it never computes authoritative values locally.

---

## Conventions

- **Auth header:** `Authorization: Bearer <jwt>`
- **Base URL:** `{BACKEND_URL}/` (configured via env, never hardcoded)
- **Guard pattern:** `SupabaseJwtAuthGuard` + `RoleGuard` or `PermissionGuard` on every admin endpoint
- **Pagination:** `?page=1&limit=20` unless noted
- **Error shape:** `{ statusCode, message, error }`
- **No secrets** in request bodies or response payloads

---

## 1. Admin — Users

### List users
```
GET /admin/users?page=1&limit=20
Roles: admin, super_admin
Response: { data: SafeUserDto[], total: number, page: number, limit: number }
```

### Get user detail
```
GET /admin/users/:id
Roles: admin, super_admin
Response: AdminUserDetailDto
  {
    id, email, phone, userType, status, roles[],
    studentProfile: { id, displayName, nativeLanguage, targetLanguage, createdAt, updatedAt } | null,
    adminProfile:   { id, displayName, department, createdAt, updatedAt } | null,
    createdAt, updatedAt
  }
Note: supabase_auth_uid is NEVER returned
```

### Assign / change user role
```
PUT /admin/users/:userId/roles
Roles: admin, super_admin
Body: { roleKey: string, reason?: string }
Response: AdminRoleAssignmentResponse { userId, roleKey, assignedAt, assignedBy }
```

---

## 2. Curriculum — Courses

### List courses
```
GET /curriculum/courses?page=1&limit=20&status=published
Roles: admin, super_admin, content_editor, reviewer
Response: { data: CourseDto[], total, page, limit }
```

### Get course detail
```
GET /curriculum/courses/:id
Roles: admin, super_admin, content_editor, reviewer
Response: CourseDto { id, title, description, status, level, createdAt, updatedAt }
```

### Create course
```
POST /curriculum/courses
Roles: admin, super_admin, content_editor
Body: { title: string, description?: string, levelId?: string }
Response: CourseDto
```

### Edit course
```
PATCH /curriculum/courses/:id
Roles: admin, super_admin, content_editor
Body: Partial<{ title, description, levelId }>
Response: CourseDto
```

### Publish / unpublish / archive course
```
PATCH /curriculum/workflow/courses/:id/publish
PATCH /curriculum/workflow/courses/:id/unpublish
PATCH /curriculum/workflow/courses/:id/archive
Permission: curriculum.content.publish
Response: { id, status, updatedAt }
```

---

## 3. Curriculum — Chapters

### List chapters for course
```
GET /curriculum/chapters?courseId=:courseId
Roles: admin, super_admin, content_editor, reviewer
Response: { data: ChapterDto[], total, page, limit }
```

### Get chapter detail
```
GET /curriculum/chapters/:id
Roles: admin, super_admin, content_editor, reviewer
Response: ChapterDto { id, courseId, title, order, status, createdAt, updatedAt }
```

### Create chapter
```
POST /curriculum/chapters
Roles: admin, super_admin, content_editor
Body: { courseId, title, order? }
Response: ChapterDto
```

### Edit chapter
```
PATCH /curriculum/chapters/:id
Roles: admin, super_admin, content_editor
Body: Partial<{ title, order }>
Response: ChapterDto
```

### Publish / unpublish chapter
```
PATCH /curriculum/workflow/chapters/:id/publish
PATCH /curriculum/workflow/chapters/:id/unpublish
Permission: curriculum.content.publish
Response: { id, status, updatedAt }
```

---

## 4. Curriculum — Lessons

### List lessons for chapter
```
GET /curriculum/lessons?chapterId=:chapterId
Roles: admin, super_admin, content_editor, reviewer
Response: { data: LessonDto[], total, page, limit }
```

### Get lesson detail
```
GET /curriculum/lessons/:id
Roles: admin, super_admin, content_editor, reviewer
Response: LessonDto { id, chapterId, title, order, status, estimatedMinutes, createdAt, updatedAt }
```

### Create lesson
```
POST /curriculum/lessons
Roles: admin, super_admin, content_editor
Body: { chapterId, title, order?, estimatedMinutes? }
Response: LessonDto
```

### Edit lesson
```
PATCH /curriculum/lessons/:id
Roles: admin, super_admin, content_editor
Body: Partial<{ title, order, estimatedMinutes }>
Response: LessonDto
```

### Publish / unpublish lesson
```
PATCH /curriculum/workflow/lessons/:id/publish
PATCH /curriculum/workflow/lessons/:id/unpublish
Permission: curriculum.content.publish
Response: { id, status, updatedAt }
```

### Lesson publish validation
```
GET /curriculum/lessons/:id/publish-validation
Roles: admin, super_admin, content_editor, reviewer
Response: { valid: boolean, issues: string[] }
```

---

## 5. Curriculum — Skills

### List skills
```
GET /curriculum/skills
Roles: admin, super_admin, content_editor, reviewer
Response: { data: SkillDto[], total, page, limit }
```

### Get skill by ID
```
GET /curriculum/skills/:id
Roles: admin, super_admin, content_editor, reviewer
Response: SkillDto { id, key, name, description, createdAt, updatedAt }
```

### Get skill by key
```
GET /curriculum/skills/by-key/:key
Roles: admin, super_admin, content_editor, reviewer
Response: SkillDto
```

### Create skill
```
POST /curriculum/skills
Roles: admin, super_admin, content_editor
Body: { key: string, name: string, description?: string }
Response: SkillDto
```

### Edit skill
```
PATCH /curriculum/skills/:id
Roles: admin, super_admin, content_editor
Body: Partial<{ name, description }>
Response: SkillDto
```

---

## 6. Question Bank

### List questions
```
GET /curriculum/questions?page=1&limit=20&skillId=&type=
Roles: admin, super_admin, content_editor, reviewer
Response: { data: QuestionDto[], total, page, limit }
```

### Get question detail
```
GET /curriculum/questions/:id
Roles: admin, super_admin, content_editor, reviewer
Response: QuestionDto { id, type, stem, options[], correctAnswer, skills[], status, createdAt, updatedAt }
```

### Create question
```
POST /curriculum/questions
Roles: admin, super_admin, content_editor
Body: { type, stem, options[], correctAnswer, skillIds[] }
Response: QuestionDto
```

### Edit question
```
PATCH /curriculum/questions/:id
Roles: admin, super_admin, content_editor
Body: Partial<{ type, stem, options[], correctAnswer }>
Response: QuestionDto
```

### Tag question with skills
```
PATCH /curriculum/question-skills/:questionId
Roles: admin, super_admin, content_editor
Body: { skillIds: string[] }
Response: { questionId, skillIds[] }
```

### Publish question
```
PATCH /curriculum/workflow/questions/:id/publish
Permission: curriculum.content.publish
Response: { id, status, updatedAt }
```

---

## 7. Assessments (Admin-facing)

> Note: Student-facing assessment routes are at `/student/assessments`. Admin assessment management routes are planned in Phase 11 implementation tasks. Contracts below reflect the expected admin endpoints to be built.

### List assessments
```
GET /admin/assessments?page=1&limit=20&type=quiz|exam
Roles: admin, super_admin, content_editor, reviewer
Response: { data: AssessmentDto[], total, page, limit }
```

### Get assessment detail
```
GET /admin/assessments/:id
Roles: admin, super_admin, content_editor, reviewer
Response: AssessmentDto { id, title, type, status, questionIds[], settings, createdAt, updatedAt }
```

### Create assessment
```
POST /admin/assessments
Roles: admin, super_admin, content_editor
Body: { title, type: 'quiz'|'exam', questionIds[], settings: { timeLimit?, passMark? } }
Response: AssessmentDto
```

### Edit assessment
```
PATCH /admin/assessments/:id
Roles: admin, super_admin, content_editor
Body: Partial<{ title, questionIds[], settings }>
Response: AssessmentDto
```

### Publish / unpublish assessment
```
PATCH /admin/assessments/:id/publish
PATCH /admin/assessments/:id/unpublish
Roles: admin, super_admin
Response: { id, status, updatedAt }
```

### Preview assessment
```
GET /admin/assessments/:id/preview
Roles: admin, super_admin, content_editor, reviewer
Response: AssessmentPreviewDto { id, title, questions[], settings }
Note: Admin UI must NOT grade preview attempts
```

---

## 8. Deadlines (Admin-facing)

### List deadlines
```
GET /admin/deadlines?page=1&limit=20
Roles: admin, super_admin
Response: { data: DeadlineDto[], total, page, limit }
```

### Get deadline detail
```
GET /admin/deadlines/:id
Roles: admin, super_admin
Response: DeadlineDto { id, assessmentId, dueAt, courseId?, chapterId?, createdAt, updatedAt }
```

### Create deadline
```
POST /admin/deadlines
Roles: admin, super_admin
Body: { assessmentId, dueAt: ISO8601, courseId?, chapterId? }
Response: DeadlineDto
```

### Edit deadline
```
PATCH /admin/deadlines/:id
Roles: admin, super_admin
Body: Partial<{ dueAt, courseId, chapterId }>
Response: DeadlineDto
```

---

## 9. Assessment Results (Read-only)

### List results
```
GET /admin/assessment-results?page=1&limit=20&studentId=&assessmentId=
Roles: admin, super_admin, reviewer
Response: { data: AssessmentResultDto[], total, page, limit }
Note: score and pass/fail are returned by backend; UI displays only
```

### Get result detail
```
GET /admin/assessment-results/:id
Roles: admin, super_admin, reviewer
Response: AssessmentResultDto { id, studentId, assessmentId, score, passed, attemptedAt, ... }
```

---

## 10. Placement Results (Read-only)

### List placement results
```
GET /admin/placement-results?page=1&limit=20&studentId=
Roles: admin, super_admin, reviewer
Response: { data: PlacementResultDto[], total, page, limit }
```

### Get placement result detail
```
GET /admin/placement-results/:id
Roles: admin, super_admin, reviewer
Response: PlacementResultDto { id, studentId, level, score, placedAt }
Note: placement score is computed by backend; UI displays only
```

---

## 11. Student Progress (Read-only)

### Progress summary
```
GET /admin/students/:id/progress
Roles: admin, super_admin, reviewer
Response: { studentId, completedLessons, totalLessons, completionPct, lastActiveAt }
Note: completionPct computed by backend; UI displays only
```

### Lesson completion list
```
GET /admin/students/:id/lessons?page=1&limit=20
Roles: admin, super_admin, reviewer
Response: { data: LessonProgressDto[], total, page, limit }
```

---

## 12. Skill States (Read-only)

### List skill states
```
GET /admin/students/:id/skill-states
Roles: admin, super_admin, reviewer
Response: { data: SkillStateDto[], total }
SkillStateDto: { skillId, skillKey, masteryLevel, state, lastUpdatedAt }
Note: masteryLevel computed by backend; UI displays only
```

---

## 13. Weaknesses (Read-only)

### List weaknesses
```
GET /admin/students/:id/weaknesses
Roles: admin, super_admin, reviewer
Response: { data: WeaknessDto[] }
WeaknessDto: { skillId, skillKey, severity, detectedAt }
Note: weakness detection is backend authority; UI displays only
```

---

## 14. Recommendations (Read-only)

### List recommendations
```
GET /admin/students/:id/recommendations
Roles: admin, super_admin, reviewer
Response: { data: RecommendationDto[] }
RecommendationDto: { type, entityId, reason, generatedAt }
Note: recommendations generated by AIM Engine; UI displays only
```

---

## 15. Session Summaries (Read-only)

### List session summaries
```
GET /admin/session-summaries?page=1&limit=20&studentId=
Roles: admin, super_admin
Response: { data: SessionSummaryDto[], total, page, limit }
SessionSummaryDto: { id, studentId, startedAt, endedAt, topicsComp[], feedbackSummary }
```

### Get session summary detail
```
GET /admin/session-summaries/:id
Roles: admin, super_admin
Response: SessionSummaryDto
```

---

## 16. AIM Audit Logs (Read-only)

### List audit log entries
```
GET /admin/audit-logs?page=1&limit=20&userId=&action=&from=&to=
Roles: admin, super_admin
Response: { data: AuditLogDto[], total, page, limit }
AuditLogDto: { id, userId, action, entityType, entityId, metadata, createdAt }
```

---

## 17. Activity Logs (Read-only)

### List activity log entries
```
GET /admin/activity-logs?page=1&limit=20&userId=&eventType=&from=&to=
Roles: admin, super_admin
Response: { data: ActivityLogDto[], total, page, limit }
ActivityLogDto: { id, userId, eventType, metadata, createdAt }
```

---

## 18. Reports (Read-only)

### Enrollment report
```
GET /admin/reports/enrollments?from=&to=
Roles: admin, super_admin, reviewer
Response: { totalEnrollments, newEnrollments, activeCourses, period }
```

### Assessment completion report
```
GET /admin/reports/assessments?from=&to=
Roles: admin, super_admin, reviewer
Response: { totalAttempts, passed, failed, avgScore, period }
Note: avgScore computed by backend
```

### Active users report
```
GET /admin/reports/active-users?from=&to=
Roles: admin, super_admin, reviewer
Response: { dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers, period }
```

---

## 19. Error Contracts

All admin APIs return standard error shapes:

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Missing or invalid JWT |
| 403 | Insufficient role/permission |
| 404 | Entity not found |
| 409 | Conflict (duplicate, state mismatch) |
| 422 | Business rule violation (e.g. publish validation failed) |
| 500 | Internal server error |

Admin UI must handle all of these states and show the appropriate error/forbidden/not-found state using design system components. Never expose raw stack traces.

---

## 20. What Admin UI Must Never Send

| Forbidden field | Reason |
|---|---|
| `score` in request body | Backend computes all scores |
| `passed` in request body | Backend determines pass/fail |
| `masteryLevel` in request body | Backend determines mastery |
| `studentId` / `sessionId` resolved on client | Backend resolves from JWT |
| AI provider keys | Never in any request payload |
| `supabase_auth_uid` | Never sent by or to client |

---

*API contract map created: Phase 11 P11-005*
*Depends on: P11-002 (Admin Capability Map)*
