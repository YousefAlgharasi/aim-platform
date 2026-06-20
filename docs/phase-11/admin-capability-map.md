# Phase 11 — Admin Capability Map

**Task:** P11-002
**Depends on:** P11-001 (Admin Dashboard Charter)

---

## Overview

This document maps every admin capability needed in Phase 11. Each capability defines:
- What the admin can do
- Whether it is read-only or a mutating action
- The backend API that owns the authority
- Whether admin UI computes or just displays

---

## 1. Users & Roles

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all users (paginated, filterable) | Read | `GET /admin/users` | Display only |
| View user detail (profile, roles, status) | Read | `GET /admin/users/:id` | Display only |
| Activate / deactivate user | Mutate | `PATCH /admin/users/:id/status` | Trigger action |
| Assign role to user | Mutate | `PATCH /admin/users/:id/role` | Trigger action |
| Remove role from user | Mutate | `PATCH /admin/users/:id/role` | Trigger action |
| View user's enrollment history | Read | `GET /admin/users/:id/enrollments` | Display only |
| View user's assessment history | Read | `GET /admin/users/:id/assessments` | Display only |
| View user's placement history | Read | `GET /admin/users/:id/placements` | Display only |
| List all roles and permissions | Read | `GET /admin/roles` | Display only |

**Not allowed in admin UI:**
- Locally decide if a user is admin
- Compute effective permissions from role names

---

## 2. Curriculum — Courses

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all courses (paginated, filterable) | Read | `GET /admin/courses` | Display only |
| View course detail | Read | `GET /admin/courses/:id` | Display only |
| Create course | Mutate | `POST /admin/courses` | Form → API |
| Edit course metadata | Mutate | `PATCH /admin/courses/:id` | Form → API |
| Publish course | Mutate | `PATCH /admin/courses/:id/publish` | Trigger action |
| Unpublish course | Mutate | `PATCH /admin/courses/:id/unpublish` | Trigger action |
| Archive course | Mutate | `PATCH /admin/courses/:id/archive` | Trigger action |
| Delete course | Mutate | `DELETE /admin/courses/:id` | Trigger action |

---

## 3. Curriculum — Chapters

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List chapters for a course | Read | `GET /admin/courses/:id/chapters` | Display only |
| View chapter detail | Read | `GET /admin/chapters/:id` | Display only |
| Create chapter | Mutate | `POST /admin/chapters` | Form → API |
| Edit chapter metadata | Mutate | `PATCH /admin/chapters/:id` | Form → API |
| Reorder chapters | Mutate | `PATCH /admin/chapters/:id/order` | Trigger action |
| Publish / unpublish chapter | Mutate | `PATCH /admin/chapters/:id/publish` | Trigger action |
| Delete chapter | Mutate | `DELETE /admin/chapters/:id` | Trigger action |

---

## 4. Curriculum — Lessons

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List lessons for a chapter | Read | `GET /admin/chapters/:id/lessons` | Display only |
| View lesson detail | Read | `GET /admin/lessons/:id` | Display only |
| Create lesson | Mutate | `POST /admin/lessons` | Form → API |
| Edit lesson metadata | Mutate | `PATCH /admin/lessons/:id` | Form → API |
| Publish / unpublish lesson | Mutate | `PATCH /admin/lessons/:id/publish` | Trigger action |
| Delete lesson | Mutate | `DELETE /admin/lessons/:id` | Trigger action |

---

## 5. Curriculum — Lesson Content Blocks

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List content blocks for a lesson | Read | `GET /admin/lessons/:id/content-blocks` | Display only |
| View content block detail | Read | `GET /admin/content-blocks/:id` | Display only |
| Create content block | Mutate | `POST /admin/content-blocks` | Form → API |
| Edit content block | Mutate | `PATCH /admin/content-blocks/:id` | Form → API |
| Reorder content blocks | Mutate | `PATCH /admin/content-blocks/:id/order` | Trigger action |
| Delete content block | Mutate | `DELETE /admin/content-blocks/:id` | Trigger action |

---

## 6. Skills

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all skills | Read | `GET /admin/skills` | Display only |
| View skill detail | Read | `GET /admin/skills/:id` | Display only |
| Create skill | Mutate | `POST /admin/skills` | Form → API |
| Edit skill metadata | Mutate | `PATCH /admin/skills/:id` | Form → API |
| Delete skill | Mutate | `DELETE /admin/skills/:id` | Trigger action |

**Not allowed in admin UI:**
- Compute or assign mastery level locally
- Modify student skill state directly

---

## 7. Question Bank

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all questions (paginated, filterable) | Read | `GET /admin/questions` | Display only |
| View question detail | Read | `GET /admin/questions/:id` | Display only |
| Create question | Mutate | `POST /admin/questions` | Form → API |
| Edit question | Mutate | `PATCH /admin/questions/:id` | Form → API |
| Delete question | Mutate | `DELETE /admin/questions/:id` | Trigger action |
| Validate question structure | Read | `POST /admin/questions/:id/validate` | Display result |
| Tag question with skills | Mutate | `PATCH /admin/questions/:id/skills` | Form → API |

**Not allowed in admin UI:**
- Grade any student answer
- Compute question difficulty locally

---

## 8. Assessments — Quizzes & Exams

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all assessments | Read | `GET /admin/assessments` | Display only |
| View assessment detail | Read | `GET /admin/assessments/:id` | Display only |
| Create assessment | Mutate | `POST /admin/assessments` | Form → API |
| Edit assessment settings | Mutate | `PATCH /admin/assessments/:id` | Form → API |
| Add questions to assessment | Mutate | `PATCH /admin/assessments/:id/questions` | Form → API |
| Publish assessment | Mutate | `PATCH /admin/assessments/:id/publish` | Trigger action |
| Unpublish assessment | Mutate | `PATCH /admin/assessments/:id/unpublish` | Trigger action |
| Preview assessment | Read | `GET /admin/assessments/:id/preview` | Display only |
| Delete assessment | Mutate | `DELETE /admin/assessments/:id` | Trigger action |

**Not allowed in admin UI:**
- Grade assessment attempts
- Compute pass/fail locally

---

## 9. Deadlines

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all deadlines | Read | `GET /admin/deadlines` | Display only |
| View deadline detail | Read | `GET /admin/deadlines/:id` | Display only |
| Create deadline | Mutate | `POST /admin/deadlines` | Form → API |
| Edit deadline | Mutate | `PATCH /admin/deadlines/:id` | Form → API |
| Delete deadline | Mutate | `DELETE /admin/deadlines/:id` | Trigger action |

**Not allowed in admin UI:**
- Decide if a deadline has passed locally
- Compute late/expired/on-time status locally

---

## 10. Assessment Results

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all assessment results | Read | `GET /admin/assessment-results` | Display only |
| View result detail | Read | `GET /admin/assessment-results/:id` | Display only |
| Filter by student / assessment / date | Read | query params | Display only |

**Not allowed in admin UI:**
- Recalculate or override scores
- Change pass/fail status

---

## 11. Placement Results

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List all placement results | Read | `GET /admin/placement-results` | Display only |
| View placement result detail | Read | `GET /admin/placement-results/:id` | Display only |

**Not allowed in admin UI:**
- Recalculate placement scores
- Override placement level

---

## 12. Student Progress

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| View student progress summary | Read | `GET /admin/students/:id/progress` | Display only |
| View lesson completion status | Read | `GET /admin/students/:id/lessons` | Display only |

**Not allowed in admin UI:**
- Compute progress percentages locally
- Mark lessons complete directly

---

## 13. Skill States

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List student skill states | Read | `GET /admin/students/:id/skill-states` | Display only |
| View skill state detail | Read | `GET /admin/students/:id/skill-states/:skillId` | Display only |

**Not allowed in admin UI:**
- Compute mastery locally
- Mutate skill state directly

---

## 14. Weaknesses

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List student weaknesses | Read | `GET /admin/students/:id/weaknesses` | Display only |

**Not allowed in admin UI:**
- Identify or flag weaknesses locally

---

## 15. Recommendations

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List student recommendations | Read | `GET /admin/students/:id/recommendations` | Display only |

**Not allowed in admin UI:**
- Generate recommendations locally
- Override AIM-generated recommendations

---

## 16. Session Summaries

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List AIM session summaries | Read | `GET /admin/session-summaries` | Display only |
| View session summary detail | Read | `GET /admin/session-summaries/:id` | Display only |

---

## 17. AIM Audit Logs

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List AIM audit log entries | Read | `GET /admin/audit-logs` | Display only |
| Filter by user / action / date | Read | query params | Display only |

---

## 18. Platform Activity Logs

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| List platform activity log entries | Read | `GET /admin/activity-logs` | Display only |
| Filter by user / event type / date | Read | query params | Display only |

---

## 19. Basic Operational Reports

| Capability | Type | Backend Authority | UI Role |
|---|---|---|---|
| View enrollment summary report | Read | `GET /admin/reports/enrollments` | Display only |
| View assessment completion report | Read | `GET /admin/reports/assessments` | Display only |
| View active users report | Read | `GET /admin/reports/active-users` | Display only |

**Not allowed in admin UI:**
- Compute report metrics locally from raw data

---

## Capability Boundary Summary

| Category | Read Capabilities | Mutating Capabilities | Client Authority |
|---|---|---|---|
| Users & Roles | 5 | 4 | None |
| Courses | 2 | 6 | None |
| Chapters | 2 | 5 | None |
| Lessons | 2 | 4 | None |
| Content Blocks | 2 | 4 | None |
| Skills | 2 | 3 | None |
| Question Bank | 3 | 4 | None |
| Assessments | 3 | 6 | None |
| Deadlines | 2 | 3 | None |
| Assessment Results | 3 | 0 | None |
| Placement Results | 2 | 0 | None |
| Student Progress | 2 | 0 | None |
| Skill States | 2 | 0 | None |
| Weaknesses | 1 | 0 | None |
| Recommendations | 1 | 0 | None |
| Session Summaries | 2 | 0 | None |
| AIM Audit Logs | 2 | 0 | None |
| Activity Logs | 2 | 0 | None |
| Reports | 3 | 0 | None |

All capabilities above are implemented through protected backend APIs. Admin UI never computes authoritative values locally.

---

*Capability map created: Phase 11 P11-002*
*Depends on: P11-001 (Admin Dashboard Charter)*
