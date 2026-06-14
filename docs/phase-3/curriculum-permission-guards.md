# Phase 3 — Curriculum Permission Guards

> Phase 3 — P3-046
> Scope: Curriculum & Content System only.
> Dependencies: P2-037 (PermissionGuard), P2-038 (RoleGuard), P3-008 (Content Publishing Permission Rules)

---

## 1. Purpose

This document defines the backend permission guards that must be applied to all curriculum
management endpoints. It is the authoritative reference for Phase 3 guard implementation.

All curriculum API controllers must use the Phase 2 guard infrastructure. The backend is the
final authority for all authorization decisions. Admin Dashboard permission checks are UX-only
and must never bypass backend guards.

---

## 2. Phase 2 Guard Infrastructure

The following Phase 2 components are available and must be used as-is:

| Component | Import Path | Purpose |
|---|---|---|
| `SupabaseJwtAuthGuard` | `src/auth/supabase-jwt-auth.guard` | Validates JWT; populates `request.user` |
| `PermissionGuard` | `src/auth/authorization/permission.guard` | Checks `request.user` against required permissions |
| `RequirePermissions` | `src/auth/authorization/required-permissions.decorator` | Declares required permissions on a method or class |

### 2.1 Standard Controller Pattern

Every curriculum controller must apply guards at the class level:

```typescript
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ExampleCurriculumController { ... }
```

Individual endpoints declare required permissions with `@RequirePermissions`:

```typescript
@Get()
@RequirePermissions(CurriculumPermission.READ)
async list() { ... }

@Post()
@RequirePermissions(CurriculumPermission.WRITE)
async create() { ... }
```

---

## 3. Curriculum Permissions

All curriculum permission constants are defined in:

```text
services/backend-api/src/features/curriculum/curriculum.permissions.ts
```

| Constant | Key | Purpose |
|---|---|---|
| `CurriculumPermission.READ` | `curriculum.read` | Read curriculum content (hierarchy, metadata, draft/published status) |
| `CurriculumPermission.WRITE` | `curriculum.write` | Create and update curriculum hierarchy and content |
| `CurriculumPermission.REVIEW` | `curriculum.review` | Review and approve content (reviewer role) |
| `CurriculumPermission.PUBLISH` | `curriculum.publish` | Publish or unpublish content |
| `CurriculumPermission.ARCHIVE` | `curriculum.archive` | Archive or restore content |
| `CurriculumPermission.AUDIT_READ` | `curriculum.audit.read` | Read curriculum audit log entries |

---

## 4. Permission Map by Endpoint Group

### 4.1 Courses (`/curriculum/courses`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/courses` | `curriculum.read` | Returns all statuses to authorized readers |
| GET | `/curriculum/courses/:id` | `curriculum.read` | |
| POST | `/curriculum/courses` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/courses/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/courses/:id/publish` | `curriculum.publish` | Validates publish requirements |
| POST | `/curriculum/courses/:id/archive` | `curriculum.archive` | Terminal action |
| POST | `/curriculum/courses/:id/restore` | `curriculum.archive` | `super_admin` only; backend role check in addition to permission |

### 4.2 Levels (`/curriculum/levels`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/levels` | `curriculum.read` | Scoped to a course via query param |
| GET | `/curriculum/levels/:id` | `curriculum.read` | |
| POST | `/curriculum/levels` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/levels/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/levels/:id/publish` | `curriculum.publish` | |
| POST | `/curriculum/levels/:id/archive` | `curriculum.archive` | |

### 4.3 Chapters (`/curriculum/chapters`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/chapters` | `curriculum.read` | Scoped to a level via query param |
| GET | `/curriculum/chapters/:id` | `curriculum.read` | |
| POST | `/curriculum/chapters` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/chapters/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/chapters/:id/publish` | `curriculum.publish` | |
| POST | `/curriculum/chapters/:id/archive` | `curriculum.archive` | |

### 4.4 Lessons (`/curriculum/lessons`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/lessons` | `curriculum.read` | Scoped to a chapter via query param |
| GET | `/curriculum/lessons/:id` | `curriculum.read` | |
| POST | `/curriculum/lessons` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/lessons/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/lessons/:id/publish` | `curriculum.publish` | Rejected if no published skill link exists |
| POST | `/curriculum/lessons/:id/archive` | `curriculum.archive` | |

### 4.5 Skills (`/curriculum/skills`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/skills` | `curriculum.read` | |
| GET | `/curriculum/skills/:id` | `curriculum.read` | |
| POST | `/curriculum/skills` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/skills/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/skills/:id/publish` | `curriculum.publish` | |
| POST | `/curriculum/skills/:id/archive` | `curriculum.archive` | |

### 4.6 Objectives (`/curriculum/objectives`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/objectives` | `curriculum.read` | |
| GET | `/curriculum/objectives/:id` | `curriculum.read` | |
| POST | `/curriculum/objectives` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/objectives/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/objectives/:id/publish` | `curriculum.publish` | |
| POST | `/curriculum/objectives/:id/archive` | `curriculum.archive` | |

### 4.7 Lesson Assets (`/curriculum/lesson-assets`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/lesson-assets` | `curriculum.read` | Scoped to a lesson via query param |
| GET | `/curriculum/lesson-assets/:id` | `curriculum.read` | |
| POST | `/curriculum/lesson-assets` | `curriculum.write` | |
| PATCH | `/curriculum/lesson-assets/:id` | `curriculum.write` | |
| DELETE | `/curriculum/lesson-assets/:id` | `curriculum.write` | Soft-delete only; hard delete not permitted |

### 4.8 Lesson Skill Mappings (`/curriculum/lessons/:id/skills`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/lessons/:id/skills` | `curriculum.read` | |
| POST | `/curriculum/lessons/:id/skills` | `curriculum.write` | Adds skill link |
| DELETE | `/curriculum/lessons/:id/skills/:skillId` | `curriculum.write` | Removes skill link; blocked if lesson is published |

### 4.9 Lesson Objective Mappings (`/curriculum/lessons/:id/objectives`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/lessons/:id/objectives` | `curriculum.read` | |
| POST | `/curriculum/lessons/:id/objectives` | `curriculum.write` | |
| DELETE | `/curriculum/lessons/:id/objectives/:objectiveId` | `curriculum.write` | Blocked if lesson is published |

### 4.10 Question Bank (`/curriculum/questions`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/questions` | `curriculum.read` | Answer correctness excluded from list response |
| GET | `/curriculum/questions/:id` | `curriculum.read` | Full detail including correct answer for authorized admin |
| POST | `/curriculum/questions` | `curriculum.write` | Backend sets status to `draft` |
| PATCH | `/curriculum/questions/:id` | `curriculum.write` | Only allowed on `draft` content |
| POST | `/curriculum/questions/:id/publish` | `curriculum.publish` | Validated: must have at least one correct answer |
| POST | `/curriculum/questions/:id/archive` | `curriculum.archive` | |

### 4.11 Question Skill Mappings (`/curriculum/questions/:id/skills`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/questions/:id/skills` | `curriculum.read` | |
| POST | `/curriculum/questions/:id/skills` | `curriculum.write` | Adds skill link to question |
| DELETE | `/curriculum/questions/:id/skills/:skillId` | `curriculum.write` | Removes skill link; blocked if question is published |

### 4.12 Curriculum Audit Log (`/curriculum/audit`)

| Method | Path | Required Permission | Notes |
|---|---|---|---|
| GET | `/curriculum/audit` | `curriculum.audit.read` | Protected; not available to `student` or `support` |
| GET | `/curriculum/audit/:id` | `curriculum.audit.read` | |

---

## 5. Guard Application Rules

### 5.1 Authentication Before Permission

`SupabaseJwtAuthGuard` must always precede `PermissionGuard` in the `@UseGuards` decorator:

```typescript
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
```

This ensures the request carries a verified user identity before permission evaluation.

### 5.2 Draft-Only Mutation Rule

The backend must reject PATCH/update requests on `published` or `archived` content with
`403 Forbidden`, regardless of the caller's permissions. This check is a service-layer
responsibility, not a guard responsibility.

### 5.3 Publish Validation

Before executing any publish transition, the backend service must verify:

- For lessons: at least one published skill link exists.
- For questions: at least one correct answer is defined.

Publish transitions that fail validation must return `422 Unprocessable Entity` with a
curriculum error code (see `docs/phase-3/curriculum-error-codes.md`).

### 5.4 Restore-to-Draft Restriction

Restoring archived content to draft requires `super_admin` role in addition to
`curriculum.archive` permission. The service layer must perform a role check via the
`RolesService` before executing a restore operation.

### 5.5 Answer Correctness Excluded from Learner Responses

Even with `curriculum.read` permission, question answer correctness data must be excluded
from list endpoints. Full correctness data is only exposed in detail endpoints to authorized
admin readers, and never in any learner-facing read API.

---

## 6. Role-to-Permission Assignments

The following role-to-permission mappings apply for curriculum operations. These must be
seeded in the roles/permissions tables via a future Phase 3 seed task.

| Role | Granted Curriculum Permissions |
|---|---|
| `super_admin` | `curriculum.read`, `curriculum.write`, `curriculum.review`, `curriculum.publish`, `curriculum.archive`, `curriculum.audit.read` |
| `admin` | `curriculum.read`, `curriculum.write`, `curriculum.publish`, `curriculum.archive` |
| `reviewer` | `curriculum.read`, `curriculum.review` |
| `student` | *(none — student uses learner-facing read API, not curriculum management API)* |
| `support` | *(none)* |

---

## 7. Implementation Checklist

Each curriculum controller implementation must:

- [ ] Apply `@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)` at the class level.
- [ ] Apply `@ApiBearerAuth()` at the class level.
- [ ] Apply `@RequirePermissions(CurriculumPermission.READ)` to all GET handlers.
- [ ] Apply `@RequirePermissions(CurriculumPermission.WRITE)` to all POST/PATCH create/update handlers.
- [ ] Apply `@RequirePermissions(CurriculumPermission.PUBLISH)` to publish workflow handlers.
- [ ] Apply `@RequirePermissions(CurriculumPermission.ARCHIVE)` to archive/restore handlers.
- [ ] Apply `@RequirePermissions(CurriculumPermission.AUDIT_READ)` to audit log handlers.
- [ ] Enforce draft-only mutation in the service layer, not the controller.
- [ ] Enforce publish validation in the service layer before status transition.
- [ ] Never expose answer correctness in list endpoints.
- [ ] Never allow hard delete of curriculum content.

---

## 8. Reference Implementations

The Courses controller (`services/backend-api/src/features/curriculum/courses/courses.controller.ts`)
is the canonical reference implementation. All future curriculum controllers must follow
the same guard pattern established there.

---

## 9. Out of Scope

This document does not cover:

- Learner-facing content delivery APIs (Phase 4+).
- Onboarding or placement workflows.
- AIM runtime integration.
- Student Web App.
- Progress reports or session tracking.
- AI Teacher.
