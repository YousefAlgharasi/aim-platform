# Phase 11 — Admin Route and Permission Map

**Task:** P11-004
**Depends on:** P11-002 (Admin Capability Map), P2 roles/permissions outputs

---

## Overview

This document maps every admin route to the roles permitted to access it and the backend guard that enforces authorization. The admin UI never evaluates permissions locally — all enforcement happens server-side through NestJS guards.

---

## Role Reference

| Role | Enum Value | Description |
|---|---|---|
| STUDENT | `student` | Learner — no admin access |
| PARENT | `parent` | Parent — no admin access |
| TEACHER | `teacher` | Teacher — limited admin read access |
| CONTENT_EDITOR | `content_editor` | Manages curriculum and question bank |
| REVIEWER | `reviewer` | Reviews content — read-only admin access |
| ADMIN | `admin` | Full admin access except system-level operations |
| SUPER_ADMIN | `super_admin` | Unrestricted access |

### Admin-Eligible Roles

Only the following roles may access `/admin/*` routes:

- `TEACHER` — read-only access to student data within their scope
- `CONTENT_EDITOR` — read/write access to curriculum and question bank
- `REVIEWER` — read-only access to content for review
- `ADMIN` — full read/write access to all admin routes
- `SUPER_ADMIN` — full read/write access to all admin routes, plus system-level operations

`STUDENT` and `PARENT` are never permitted on any `/admin/*` route.

---

## Guard Architecture

All admin routes are protected by two layers:

1. **`JwtAuthGuard`** — validates the Supabase JWT and extracts the user identity
2. **`@RequireRoles(...)` decorator + `RolesGuard`** — checks the user's role against the allowed roles for the route

Unauthorized access returns `403 FORBIDDEN`. Ownership-scoped routes return `404 NOT_FOUND` to prevent existence leaking.

---

## Route Permission Map

### 1. Users & Roles

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/users` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/users/:id` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/users/:id/status` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/users/:id/role` | PATCH | SUPER_ADMIN | RolesGuard |
| `/admin/users/:id/enrollments` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/users/:id/assessments` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/users/:id/placements` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/roles` | GET | ADMIN, SUPER_ADMIN | RolesGuard |

**Notes:**
- Role assignment is SUPER_ADMIN only to prevent privilege escalation
- TEACHER can view enrollment/assessment history for students they teach

---

### 2. Curriculum — Courses

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/courses` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/courses/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/courses` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/courses/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/courses/:id/publish` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/courses/:id/unpublish` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/courses/:id/archive` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/courses/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

**Notes:**
- Publish/unpublish/archive/delete are restricted to ADMIN+ to prevent accidental content disruption
- CONTENT_EDITOR can create and edit but not publish or delete

---

### 3. Curriculum — Chapters

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/courses/:id/chapters` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/chapters/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/chapters` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/chapters/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/chapters/:id/order` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/chapters/:id/publish` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/chapters/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 4. Curriculum — Lessons

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/chapters/:id/lessons` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/lessons/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/lessons` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/lessons/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/lessons/:id/publish` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/lessons/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 5. Curriculum — Lesson Content Blocks

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/lessons/:id/content-blocks` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER | RolesGuard |
| `/admin/content-blocks/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER | RolesGuard |
| `/admin/content-blocks` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/content-blocks/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/content-blocks/:id/order` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/content-blocks/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 6. Skills

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/skills` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/skills/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/skills` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/skills/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/skills/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 7. Question Bank

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/questions` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER | RolesGuard |
| `/admin/questions/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER | RolesGuard |
| `/admin/questions` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/questions/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/questions/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/questions/:id/validate` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER | RolesGuard |
| `/admin/questions/:id/skills` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |

---

### 8. Assessments — Quizzes & Exams

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/assessments` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/assessments/:id` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER, TEACHER | RolesGuard |
| `/admin/assessments` | POST | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/assessments/:id` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/assessments/:id/questions` | PATCH | ADMIN, SUPER_ADMIN, CONTENT_EDITOR | RolesGuard |
| `/admin/assessments/:id/publish` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/assessments/:id/unpublish` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/assessments/:id/preview` | GET | ADMIN, SUPER_ADMIN, CONTENT_EDITOR, REVIEWER | RolesGuard |
| `/admin/assessments/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 9. Deadlines

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/deadlines` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/deadlines/:id` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/deadlines` | POST | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/deadlines/:id` | PATCH | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/deadlines/:id` | DELETE | ADMIN, SUPER_ADMIN | RolesGuard |

**Notes:**
- TEACHER can view deadlines but cannot create, edit, or delete them

---

### 10. Assessment Results

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/assessment-results` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/assessment-results/:id` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |

**Notes:**
- Read-only — no mutation routes exist
- TEACHER access is scoped to their students by the backend

---

### 11. Placement Results

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/placement-results` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/placement-results/:id` | GET | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 12. Student Progress

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/students/:id/progress` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/students/:id/lessons` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |

**Notes:**
- TEACHER access is scoped to their students by the backend

---

### 13. Skill States

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/students/:id/skill-states` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |
| `/admin/students/:id/skill-states/:skillId` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |

---

### 14. Weaknesses

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/students/:id/weaknesses` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |

---

### 15. Recommendations

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/students/:id/recommendations` | GET | ADMIN, SUPER_ADMIN, TEACHER | RolesGuard |

---

### 16. Session Summaries

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/session-summaries` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/session-summaries/:id` | GET | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 17. AIM Audit Logs

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/audit-logs` | GET | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 18. Platform Activity Logs

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/activity-logs` | GET | ADMIN, SUPER_ADMIN | RolesGuard |

---

### 19. Basic Operational Reports

| Route | Method | Allowed Roles | Guard |
|---|---|---|---|
| `/admin/reports/enrollments` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/reports/assessments` | GET | ADMIN, SUPER_ADMIN | RolesGuard |
| `/admin/reports/active-users` | GET | ADMIN, SUPER_ADMIN | RolesGuard |

---

## Permission Summary by Role

| Role | Read Routes | Mutate Routes | Total |
|---|---|---|---|
| SUPER_ADMIN | All | All | All |
| ADMIN | All | All except role assignment | All - 1 |
| CONTENT_EDITOR | Curriculum, Skills, Questions, Assessments | Create/Edit curriculum, skills, questions, assessments | ~30 |
| REVIEWER | Curriculum, Questions, Assessments (read-only) | None | ~15 |
| TEACHER | Student data, Assessments, Deadlines, Curriculum (read-only) | None | ~20 |
| STUDENT | None | None | 0 |
| PARENT | None | None | 0 |

---

## Privilege Escalation Prevention

1. **Role assignment** (`PATCH /admin/users/:id/role`) is restricted to SUPER_ADMIN only
2. **User status changes** (activate/deactivate) require ADMIN+
3. **Publish/unpublish/archive** actions on curriculum and assessments require ADMIN+ — CONTENT_EDITOR cannot publish
4. **Delete operations** on all resources require ADMIN+
5. **Backend enforces all checks** — the admin UI never evaluates role membership or permission locally

---

## Admin UI Enforcement Rules

1. The admin UI must check the user's role (received from backend auth response) to show/hide navigation items and action buttons
2. The admin UI must **never** grant access based on client-side role evaluation — the backend rejects unauthorized requests regardless of what the UI shows
3. Hidden UI elements are a UX convenience, not a security boundary — the backend guard is the security boundary
4. All role-based UI filtering uses the role string returned by the backend, never a locally computed value

---

*Route permission map created: Phase 11 P11-004*
*Depends on: P11-002 (Admin Capability Map)*
## 1. Role Definitions

Roles are defined in the backend at:
```
services/backend-api/src/auth/authorization/authorization.constants.ts
```

| Role | Value | Description |
|---|---|---|
| `student` | `AuthorizedRole.STUDENT` | Learner — no admin access |
| `parent` | `AuthorizedRole.PARENT` | Parent — no admin access |
| `teacher` | `AuthorizedRole.TEACHER` | Teacher — no admin access |
| `content_editor` | `AuthorizedRole.CONTENT_EDITOR` | Can manage curriculum content |
| `reviewer` | `AuthorizedRole.REVIEWER` | Read-only review access |
| `admin` | `AuthorizedRole.ADMIN` | Full admin access |
| `super_admin` | `AuthorizedRole.SUPER_ADMIN` | Full admin + destructive ops |

### Admin-eligible roles for Phase 11

All admin dashboard routes require at minimum one of:
- `admin`
- `super_admin`

Some routes also permit `content_editor` or `reviewer` for scoped access (noted per route).

---

## 2. Permission Enforcement Rules

1. **JWT guard** — every admin request must carry a valid JWT; backend verifies via `SupabaseJwtVerifier`
2. **Role guard** — every admin endpoint uses `@Roles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)` (or scoped roles)
3. **Admin UI** — redirects to `/admin/login` if no valid session; shows 403 forbidden state if role is insufficient
4. **Client never computes role** — UI reads role from backend session response only; never derives role from JWT claims directly

---

## 3. Admin Route → Permission Map

### 3.1 Auth / Shell

| Route | Page | Min Role | Notes |
|---|---|---|---|
| `/admin/login` | Login | public | Unauthenticated access only |
| `/admin` | Dashboard home | `admin` | Redirect to `/admin/login` if no session |
| `/admin/*` (all) | Any admin page | `admin` | Global guard on admin shell |

---

### 3.2 Users

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/users` | Users list | `admin` | Read |
| `GET /admin/users/:id` | User detail | `admin` | Read |
| `PATCH /admin/users/:id/status` | Activate/deactivate | `admin` | Mutate |
| `PATCH /admin/users/:id/role` | Assign/remove role | `super_admin` | Mutate — role assignment requires super_admin |
| `GET /admin/users/:id/enrollments` | User enrollments | `admin` | Read |
| `GET /admin/users/:id/assessments` | User assessment history | `admin` | Read |
| `GET /admin/users/:id/placements` | User placement history | `admin` | Read |
| `GET /admin/roles` | Roles list | `admin` | Read |

---

### 3.3 Curriculum — Courses

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/courses` | Courses list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/courses/:id` | Course detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/courses` | Create course | `admin`, `content_editor` | Mutate |
| `PATCH /admin/courses/:id` | Edit course | `admin`, `content_editor` | Mutate |
| `PATCH /admin/courses/:id/publish` | Publish course | `admin` | Mutate — publish requires admin |
| `PATCH /admin/courses/:id/unpublish` | Unpublish course | `admin` | Mutate |
| `PATCH /admin/courses/:id/archive` | Archive course | `admin` | Mutate |
| `DELETE /admin/courses/:id` | Delete course | `super_admin` | Mutate — delete requires super_admin |

---

### 3.4 Curriculum — Chapters

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/courses/:id/chapters` | Chapters list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/chapters/:id` | Chapter detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/chapters` | Create chapter | `admin`, `content_editor` | Mutate |
| `PATCH /admin/chapters/:id` | Edit chapter | `admin`, `content_editor` | Mutate |
| `PATCH /admin/chapters/:id/order` | Reorder chapters | `admin`, `content_editor` | Mutate |
| `PATCH /admin/chapters/:id/publish` | Publish/unpublish | `admin` | Mutate |
| `DELETE /admin/chapters/:id` | Delete chapter | `super_admin` | Mutate |

---

### 3.5 Curriculum — Lessons

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/chapters/:id/lessons` | Lessons list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/lessons/:id` | Lesson detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/lessons` | Create lesson | `admin`, `content_editor` | Mutate |
| `PATCH /admin/lessons/:id` | Edit lesson | `admin`, `content_editor` | Mutate |
| `PATCH /admin/lessons/:id/publish` | Publish/unpublish | `admin` | Mutate |
| `DELETE /admin/lessons/:id` | Delete lesson | `super_admin` | Mutate |

---

### 3.6 Curriculum — Content Blocks

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/lessons/:id/content-blocks` | Content blocks list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/content-blocks/:id` | Content block detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/content-blocks` | Create content block | `admin`, `content_editor` | Mutate |
| `PATCH /admin/content-blocks/:id` | Edit content block | `admin`, `content_editor` | Mutate |
| `PATCH /admin/content-blocks/:id/order` | Reorder blocks | `admin`, `content_editor` | Mutate |
| `DELETE /admin/content-blocks/:id` | Delete content block | `super_admin` | Mutate |

---

### 3.7 Skills

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/skills` | Skills list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/skills/:id` | Skill detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/skills` | Create skill | `admin`, `content_editor` | Mutate |
| `PATCH /admin/skills/:id` | Edit skill | `admin`, `content_editor` | Mutate |
| `DELETE /admin/skills/:id` | Delete skill | `super_admin` | Mutate |

---

### 3.8 Question Bank

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/questions` | Questions list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/questions/:id` | Question detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/questions` | Create question | `admin`, `content_editor` | Mutate |
| `PATCH /admin/questions/:id` | Edit question | `admin`, `content_editor` | Mutate |
| `POST /admin/questions/:id/validate` | Validate question | `admin`, `content_editor`, `reviewer` | Read |
| `PATCH /admin/questions/:id/skills` | Tag question skills | `admin`, `content_editor` | Mutate |
| `DELETE /admin/questions/:id` | Delete question | `super_admin` | Mutate |

---

### 3.9 Assessments

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/assessments` | Assessments list | `admin`, `content_editor`, `reviewer` | Read |
| `GET /admin/assessments/:id` | Assessment detail | `admin`, `content_editor`, `reviewer` | Read |
| `POST /admin/assessments` | Create assessment | `admin`, `content_editor` | Mutate |
| `PATCH /admin/assessments/:id` | Edit assessment | `admin`, `content_editor` | Mutate |
| `PATCH /admin/assessments/:id/questions` | Add questions | `admin`, `content_editor` | Mutate |
| `GET /admin/assessments/:id/preview` | Preview assessment | `admin`, `content_editor`, `reviewer` | Read |
| `PATCH /admin/assessments/:id/publish` | Publish assessment | `admin` | Mutate |
| `PATCH /admin/assessments/:id/unpublish` | Unpublish assessment | `admin` | Mutate |
| `DELETE /admin/assessments/:id` | Delete assessment | `super_admin` | Mutate |

---

### 3.10 Deadlines

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/deadlines` | Deadlines list | `admin` | Read |
| `GET /admin/deadlines/:id` | Deadline detail | `admin` | Read |
| `POST /admin/deadlines` | Create deadline | `admin` | Mutate |
| `PATCH /admin/deadlines/:id` | Edit deadline | `admin` | Mutate |
| `DELETE /admin/deadlines/:id` | Delete deadline | `super_admin` | Mutate |

---

### 3.11 Assessment Results

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/assessment-results` | Results list | `admin`, `reviewer` | Read only |
| `GET /admin/assessment-results/:id` | Result detail | `admin`, `reviewer` | Read only |

---

### 3.12 Placement Results

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/placement-results` | Placements list | `admin`, `reviewer` | Read only |
| `GET /admin/placement-results/:id` | Placement detail | `admin`, `reviewer` | Read only |

---

### 3.13 Student Progress

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/students/:id/progress` | Progress summary | `admin`, `reviewer` | Read only |
| `GET /admin/students/:id/lessons` | Lesson completion | `admin`, `reviewer` | Read only |

---

### 3.14 Skill States

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/students/:id/skill-states` | Skill states list | `admin`, `reviewer` | Read only |
| `GET /admin/students/:id/skill-states/:skillId` | Skill state detail | `admin`, `reviewer` | Read only |

---

### 3.15 Weaknesses

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/students/:id/weaknesses` | Weaknesses list | `admin`, `reviewer` | Read only |

---

### 3.16 Recommendations

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/students/:id/recommendations` | Recommendations list | `admin`, `reviewer` | Read only |

---

### 3.17 Session Summaries

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/session-summaries` | Session summaries list | `admin` | Read only |
| `GET /admin/session-summaries/:id` | Session summary detail | `admin` | Read only |

---

### 3.18 AIM Audit Logs

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/audit-logs` | Audit logs list | `admin` | Read only |

---

### 3.19 Activity Logs

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/activity-logs` | Activity logs list | `admin` | Read only |

---

### 3.20 Reports

| Route | Page | Min Role | Action |
|---|---|---|---|
| `GET /admin/reports/enrollments` | Enrollment report | `admin`, `reviewer` | Read only |
| `GET /admin/reports/assessments` | Assessment report | `admin`, `reviewer` | Read only |
| `GET /admin/reports/active-users` | Active users report | `admin`, `reviewer` | Read only |

---

## 4. Role Hierarchy Summary

| Role | Dashboard | Users | Curriculum (R) | Curriculum (W) | Publish | Delete | Results | Logs |
|---|---|---|---|---|---|---|---|---|
| `student` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `parent` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `teacher` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `reviewer` | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `content_editor` | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `admin` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| `super_admin` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 5. Implementation Requirements

### Backend (NestJS)

Every admin controller must use:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
```

Scoped endpoints (content_editor, reviewer) add those roles to the decorator:
```typescript
@Roles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN, AuthorizedRole.CONTENT_EDITOR)
```

### Admin UI (Next.js)

The admin shell middleware must:
1. Check for valid session on every route under `/admin/*`
2. Redirect to `/admin/login` if no session
3. Call `GET /admin/auth/me` to fetch role from backend
4. Show 403 forbidden state if role is insufficient for the current page
5. Never compute role from raw JWT token claims in the UI

---

## 6. Stop Conditions

Stop and report a blocker if:
- An admin endpoint lacks a JWT guard
- An admin endpoint lacks a role guard
- The admin UI computes or caches role locally without backend verification
- A destructive action (delete) is available to `admin` instead of `super_admin` only

---

*Route/permission map created: Phase 11 P11-004*
*Depends on: P11-002, P2 roles/permissions outputs*
