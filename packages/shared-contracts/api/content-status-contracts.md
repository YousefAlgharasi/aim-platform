# Content Status Contract

> Phase 3 — P3-015
> Scope: Curriculum & Content System only.

---

## 1. Overview

This document defines the shared contract for content status across all curriculum entities in the AIM platform. Every content entity — course, level, chapter, lesson, skill, objective, lesson asset, and question — carries a `status` field that controls visibility and mutability.

This contract provides the canonical enum definition, lifecycle rules, allowed transitions, publish requirements per entity, and API response shapes. All backend and admin implementations must conform to this contract.

**Source:** `docs/phase-3/content-status-lifecycle.md` (P3-007)

**Out-of-scope:** Learner delivery, onboarding, placement, practice attempts, sessions, AIM runtime, dashboard recommendations, progress reports, AI Teacher, Student Web App.

---

## 2. Status Enum

```ts
type CurriculumContentStatus = 'draft' | 'published' | 'archived';
```

| Value | Learner-visible | Admin-editable | Default |
|---|---|---|---|
| `draft` | ❌ No | ✅ Yes | ✅ Yes — all new records |
| `published` | ✅ Yes | ⚠️ Limited (see Section 4) | ❌ No |
| `archived` | ❌ No | ❌ No (read-only) | ❌ No |

---

## 3. Status Definitions

### 3.1 `draft`

- Set automatically by the backend on all newly created content items.
- Never visible to learners under any circumstance.
- Fully editable by authorized admin roles.
- A content item may remain in draft indefinitely until it meets publish requirements.

### 3.2 `published`

- The only status that makes content learner-visible.
- Content must pass all entity-specific publish requirements (see Section 5) before transitioning.
- Once published, **direct field mutation is not permitted**. To update published content, an admin must: archive it → duplicate as new draft → edit draft → re-publish.
- Publishing is a deliberate, backend-enforced action triggered by an explicit publish endpoint — it is never automatic.

### 3.3 `archived`

- Applied to published content that is no longer active, or to draft content that is permanently abandoned.
- Not visible to learners.
- Not editable by admins — archived records are read-only.
- Not deleted — retained for audit and rollback.
- Can be restored to `draft` by `SUPER_ADMIN` only, as an exceptional operation.

---

## 4. Allowed Transitions

```
draft ──► published
draft ──► archived
published ──► archived
archived ──► draft   (SUPER_ADMIN only, exceptional)
```

**Forbidden transitions:**

| Transition | Reason |
|---|---|
| `published → draft` | Must go through `archived` first |
| `archived → published` | Must go through `draft` first |

---

## 5. Publish Requirements per Entity

A content item may only transition to `published` when ALL of the following conditions are satisfied for its entity type:

### Course
- Non-empty `title` and `description`.
- At least one published `Level`.

### Level
- Non-empty `title`.
- Parent `Course` is published.
- At least one published `Chapter`.

### Chapter
- Non-empty `title`.
- Parent `Level` is published.
- At least one published `Lesson`.

### Lesson
- Non-empty `title` and `description`.
- Linked to at least one published `Skill`.
- Has at least one published `LessonAsset`.

> **Critical rule:** A lesson must never be published without at least one linked published skill. This is a hard stop enforced at the backend publish endpoint. See `docs/phase-3/lesson-skill-linking-rules.md` (P3-006).

### Skill
- Non-empty `key` and `title`.
- Linked to at least one `Objective`.

### Objective
- Non-empty `text`.
- Parent `Skill` is published.

### LessonAsset
- Non-empty `url` or `content` (at least one must be present).
- Parent `Lesson` exists.

### Question (Question Bank)
- Non-empty `stem`.
- At least one valid correct answer defined.
- Linked to at least one published `Skill` with a primary mapping.

---

## 6. Enforcement Rules

1. **Backend is the final authority.** Status transitions are validated and executed only by the backend API. The admin UI sends a publish or archive request; it never sets the `status` field directly.
2. **`status` is not client-writable.** Clients must not submit `status` in create or update payloads. The backend ignores or rejects any client-supplied `status` on mutation endpoints.
3. **Publish endpoint is protected.** `POST /admin/content/:id/publish` requires `ADMIN` or `SUPER_ADMIN` role (Phase 2 RoleGuard). Unauthenticated or learner-role requests are rejected.
4. **Archive endpoint is protected.** `POST /admin/content/:id/archive` requires `ADMIN` or `SUPER_ADMIN` role.
5. **Restore-to-draft is restricted.** Only `SUPER_ADMIN` may restore archived content to `draft`. This must be recorded in the audit trail.
6. **Learner queries filter by status.** All backend endpoints serving content to learners apply `WHERE status = 'published'` at the query level.
7. **Cascade visibility.** A lesson is only learner-visible if the lesson, its chapter, its level, and its course are all `published`. A single unpublished ancestor hides all descendants.

---

## 7. Database Schema

The `status` column applies uniformly across all curriculum tables:

```sql
status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'))
```

- `NOT NULL` with default `'draft'`.
- `CHECK` constraint prevents invalid values at the database level.
- Indexed for learner-facing queries:

```sql
CREATE INDEX ON <table_name> (status);
```

---

## 8. API Response Shapes

### 8.1 Status Field in Any Content Response

```json
{
  "id": "uuid",
  "status": "draft",
  "...": "other entity fields"
}
```

### 8.2 Publish Action Request

```
POST /admin/content/{entity}/{id}/publish
```

No request body required. The backend validates all publish requirements and transitions the status.

### 8.3 Publish Action Response (200 OK)

```json
{
  "id": "uuid",
  "status": "published",
  "updated_at": "2026-06-14T10:00:00Z"
}
```

### 8.4 Archive Action Request

```
POST /admin/content/{entity}/{id}/archive
```

No request body required.

### 8.5 Archive Action Response (200 OK)

```json
{
  "id": "uuid",
  "status": "archived",
  "updated_at": "2026-06-14T10:00:00Z"
}
```

### 8.6 Restore-to-Draft Action Request (SUPER_ADMIN only)

```
POST /admin/content/{entity}/{id}/restore
```

### 8.7 Restore-to-Draft Response (200 OK)

```json
{
  "id": "uuid",
  "status": "draft",
  "updated_at": "2026-06-14T10:00:00Z"
}
```

---

## 9. Status Transition Error Codes

| Code | Trigger |
|---|---|
| `CONTENT_ALREADY_PUBLISHED` | Publish requested on an already-published item |
| `CONTENT_ALREADY_ARCHIVED` | Archive requested on an already-archived item |
| `CONTENT_PUBLISH_REQUIREMENTS_NOT_MET` | One or more publish requirements fail |
| `CONTENT_PUBLISH_MISSING_SKILL` | Lesson publish attempted without a linked published skill |
| `CONTENT_PUBLISH_MISSING_ASSET` | Lesson publish attempted without a published asset |
| `CONTENT_ARCHIVED_NOT_EDITABLE` | Mutation attempted on an archived item |
| `CONTENT_RESTORE_FORBIDDEN` | Restore-to-draft attempted by non-SUPER_ADMIN |
| `CONTENT_INVALID_TRANSITION` | Forbidden transition attempted (e.g. `published → draft`) |

---

## 10. Relation to Other Contracts

| Contract | Relation |
|---|---|
| `lesson-contracts.md` (P3-010) | Lessons use `CurriculumContentStatus`; publish gate enforced here |
| `skill-objective-contracts.md` (P3-011) | Skills and objectives use `CurriculumContentStatus` |
| `lesson-asset-contracts.md` (P3-013) | Assets use `CurriculumContentStatus`; publish blocked without assets |
| `question-bank-contracts.md` (P3-014) | Questions use `CurriculumContentStatus` |
| `course-level-chapter-contracts.md` (P3-009) | Courses, levels, chapters all use this status enum |
| `role-permission-contracts.md` | Publish and archive require `ADMIN` or `SUPER_ADMIN` |
| `errors.md` | All error codes follow the standard error shape |
| `response-envelope.md` | All responses wrap in the standard envelope |
