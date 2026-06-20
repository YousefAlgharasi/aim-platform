# Phase 11 — Curriculum Admin API Review

**Task:** P11-020  
**Date:** 2026-06-20  
**Scope:** Verify existing curriculum admin APIs cover courses, chapters, lessons, content blocks, publishing, and skills. Identify missing backend endpoints before UI work.

---

## 1. Architecture Overview

Curriculum endpoints use **permission-based authorization** (PermissionGuard) rather than role-based gates. No dedicated admin curriculum controllers exist — the admin dashboard consumes the same `/curriculum/*` endpoints via permission checks.

**Authentication:** Supabase JWT (SupabaseJwtAuthGuard)  
**Authorization:** PermissionGuard with `@RequirePermissions()` decorator  
**Audit:** All changes logged to `curriculum_audit_logs` table

---

## 2. Endpoint Coverage Matrix

### 2.1 Entity CRUD

| Entity | List | Read | Create | Update | Archive | File |
|---|---|---|---|---|---|---|
| Courses | GET `/curriculum/courses` | GET `/curriculum/courses/:id` | POST `/curriculum/courses` | PATCH `/curriculum/courses/:id` | via workflow | `courses.controller.ts` |
| Levels | GET `/curriculum/courses/:courseId/levels` | GET `.../:id` | POST `...` | PATCH `.../:id` | via workflow | `levels.controller.ts` |
| Chapters | GET `/curriculum/chapters` | GET `/curriculum/chapters/:id` | POST `/curriculum/chapters` | PATCH `/curriculum/chapters/:id` | via workflow | `chapters.controller.ts` |
| Lessons | GET `/curriculum/lessons` | GET `/curriculum/lessons/:id` | POST `/curriculum/lessons` | PATCH `/curriculum/lessons/:id` | via workflow | `lessons.controller.ts` |
| Skills | GET `/curriculum/skills` | GET `.../:id`, GET `.../by-key/:key` | POST `/curriculum/skills` | PATCH `/curriculum/skills/:id` | via workflow | `skills.controller.ts` |
| Objectives | GET `/curriculum/objectives` | GET `.../:id`, GET `.../by-key/:key` | POST `/curriculum/objectives` | PATCH `/curriculum/objectives/:id` | via workflow | `objectives.controller.ts` |
| Questions | GET `/curriculum/questions` | GET `/curriculum/questions/:id` | POST `/curriculum/questions` | PATCH `/curriculum/questions/:id` | via workflow | `question-bank.controller.ts` |
| Lesson Assets | GET `/curriculum/lesson-assets` | GET `.../:id` | POST `...` | PATCH `.../:id` | POST `.../:id/archive` | `lesson-assets.controller.ts` |

All entity endpoints require `curriculum.content.read.draft` for reads and `curriculum.content.update` for writes.

### 2.2 Linking/Association Endpoints

| Association | List | Create | Delete | File |
|---|---|---|---|---|
| Lesson-Skills | GET `/curriculum/lessons/:id/skills` | POST `.../skills` | DELETE `.../skills/:skillId` | `lesson-skills.controller.ts` |
| Lesson-Objectives | GET `/curriculum/lessons/:id/objectives` | POST `.../objectives` | DELETE `.../objectives/:objectiveId` | `lesson-objectives.controller.ts` |
| Question-Skills | GET `/curriculum/questions/:id/skills` | POST `.../skills` | DELETE `.../skills/:skillId` | `question-skills.controller.ts` |

Question-skill linking uses separate permission: `curriculum.skill_links.manage`.

### 2.3 Publishing & Status Workflow

**Controller:** `content-status-workflow.controller.ts`

| Action | Route | Permission | Restriction |
|---|---|---|---|
| Publish | PATCH `/curriculum/workflow/:entityType/:entityId/publish` | `curriculum.content.publish` | — |
| Archive | PATCH `/curriculum/workflow/:entityType/:entityId/archive` | `curriculum.content.archive` | — |
| Restore | PATCH `/curriculum/workflow/:entityType/:entityId/restore` | `curriculum.content.restore` | SUPER_ADMIN only |

Supported entity types: courses, levels, chapters, lessons, skills, objectives, questions.

Status flow: `draft` → `published` → `archived` (restore back to `draft` requires SUPER_ADMIN).

### 2.4 Audit Log

| Route | Permission |
|---|---|
| GET `/curriculum/audit-logs` | `curriculum.audit.read` |

Filterable by: entityType, entityId, eventType, actorUserId.

---

## 3. Permission Model

| Permission Key | Purpose | Roles |
|---|---|---|
| `curriculum.content.read.published` | Read published content | All |
| `curriculum.content.read.draft` | Read all statuses (admin-facing) | ADMIN, SUPER_ADMIN, REVIEWER |
| `curriculum.content.update` | Create/update entities | ADMIN, SUPER_ADMIN |
| `curriculum.content.publish` | Publish entities | ADMIN, SUPER_ADMIN |
| `curriculum.content.archive` | Archive entities | ADMIN, SUPER_ADMIN |
| `curriculum.content.restore` | Restore archived to draft | SUPER_ADMIN only |
| `curriculum.skill_links.manage` | Link/unlink skills to questions | ADMIN, SUPER_ADMIN |
| `curriculum.audit.read` | Access audit logs | ADMIN, SUPER_ADMIN |

---

## 4. Frontend API Client Coverage

| Entity | Frontend Client | Status |
|---|---|---|
| Courses | `admin-courses-api.ts` | Covered (list, create, update) |
| Chapters | `admin-chapters-api.ts` | Covered (list, create, update) |
| Lessons | `admin-lessons-api.ts` | Covered (list, create, update) |
| Levels | `admin-levels-api.ts` | Covered (list, create, update) |
| Skills | `admin-skills-api.ts` | Covered (list, create, update) |
| Objectives | `admin-objectives-api.ts` | Covered (list, create, update) |
| Questions | `admin-question-bank-api.ts` | Covered (list, create, update) |
| Lesson-Skills | `admin-lesson-skills-api.ts` | Covered (list, add, remove) |
| Content Status | `admin-content-status-api.ts` | Covered (publish, archive, restore) |
| Lesson-Objectives | — | **Missing frontend client** |
| Question-Skills | — | **Missing frontend client** |
| Audit Logs | — | **Missing frontend client** |

---

## 5. Gaps and Missing Endpoints

### Backend — No Gaps Found
All required CRUD operations for courses, chapters, lessons, levels, skills, objectives, and questions are present. Publishing and archiving are centralized in the workflow controller. No hard-delete endpoints exist (by design — archive is used instead).

### Frontend — Missing API Clients

| Gap | Backend Endpoint Exists | Priority |
|---|---|---|
| Lesson-Objectives linking client | Yes (`/curriculum/lessons/:id/objectives`) | Medium — needed for full lesson management UI |
| Question-Skills linking client | Yes (`/curriculum/questions/:id/skills`) | Medium — needed for question-skill association UI |
| Curriculum audit log viewer client | Yes (`/curriculum/audit-logs`) | Low — operational visibility |

### Publish Validation
Lessons have a `GET /curriculum/lessons/:id/publish-validation` endpoint that checks publish readiness. No frontend client wraps this endpoint yet.

---

## 6. Conclusion

**Backend API coverage is complete.** All curriculum entity types have full CRUD (create, read, update) and centralized status workflow (publish, archive, restore). No missing backend endpoints block UI work.

**Frontend gaps** are limited to three API clients (lesson-objectives linking, question-skills linking, audit log viewer) and publish validation. These are needed for full feature parity but do not block initial curriculum management UI implementation.

**No authorization gaps found.** All endpoints use PermissionGuard with appropriate permission checks. Write operations restricted to ADMIN/SUPER_ADMIN. Restore restricted to SUPER_ADMIN only.
