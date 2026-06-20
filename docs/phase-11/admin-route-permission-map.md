# Phase 11 — Admin Route and Permission Map

**Task:** P11-004
**Depends on:** P11-002 (Admin Capability Map), P2 roles/permissions outputs

---

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
