# Content Status Lifecycle Rules

> Phase 3 — P3-007
> Scope: Curriculum & Content System only.

---

## 1. Overview

Every curriculum content item (course, level, chapter, lesson, skill, objective, asset, question) carries a `status` field that controls visibility and mutability. This document defines the three valid statuses, their semantics, transition rules, and enforcement requirements.

---

## 2. Statuses

| Status | Value | Learner-visible | Editable by admin | Notes |
|---|---|---|---|---|
| Draft | `draft` | ❌ No | ✅ Yes | Default on creation |
| Published | `published` | ✅ Yes | ⚠️ Limited | Only fully-ready content |
| Archived | `archived` | ❌ No | ❌ No | Safely hidden, not deleted |

---

## 3. Status Definitions

### 3.1 Draft

- The default status for all newly created content items.
- Not visible to learners under any circumstance.
- Fully editable by authorized admin roles.
- A content item may remain in draft indefinitely until it meets publish requirements.

### 3.2 Published

- The only status that makes content learner-visible.
- Content must pass all publish requirements before transitioning to `published`.
- Once published, edits are restricted — direct field mutation is not permitted. To update published content, the admin must archive it, duplicate it as a new draft, edit the draft, and re-publish.
- Publishing is a deliberate, backend-enforced action, not an automatic transition.

### 3.3 Archived

- Content that was published and is no longer active, or draft content that is permanently abandoned.
- Not visible to learners.
- Not editable by admins (read-only).
- Not deleted — archived records are retained for audit and rollback purposes.
- Can be restored to draft by a SUPER_ADMIN only, as an exceptional operation.

---

## 4. Allowed Transitions

```text
draft ──► published
draft ──► archived
published ──► archived
archived ──► draft   (SUPER_ADMIN only, exceptional)
```

**Forbidden transitions:**

- `published → draft` (must go through archived first)
- `archived → published` (must go through draft first)

---

## 5. Publish Requirements

Before a content item can transition to `published`, all of the following must be true:

### Course
- Has a non-empty `title` and `description`.
- Contains at least one published `Level`.

### Level
- Has a non-empty `title`.
- Belongs to a published `Course`.
- Contains at least one published `Chapter`.

### Chapter
- Has a non-empty `title`.
- Belongs to a published `Level`.
- Contains at least one published `Lesson`.

### Lesson
- Has a non-empty `title` and `description`.
- Is linked to at least one published `Skill`.
- Has at least one published `LessonAsset`.

### Skill
- Has a non-empty `key` and `label`.
- Is linked to at least one `Objective`.

### Objective
- Has a non-empty `text`.
- Belongs to a published `Skill`.

### LessonAsset
- Has a non-empty `url` or `content`.
- Belongs to a published `Lesson`.

### Question (Question Bank)
- Has a non-empty `prompt` and at least two `options`.
- Has exactly one correct answer marked.
- Is linked to at least one published `Skill`.

> **Critical rule:** A lesson must never be published without at least one linked published skill. This is a hard stop condition enforced at the backend publish endpoint.

---

## 6. Enforcement Rules

1. **Backend is the final authority.** Status transitions are validated and executed only by the backend API. Admin UI sends a publish/archive request; it does not set the status field directly.

2. **No client-controlled status.** Clients (admin dashboard, Flutter) must not submit `status` as a writable field in create or update payloads. The backend ignores or rejects any client-supplied status on mutation endpoints.

3. **Publish endpoint is protected.** The publish action endpoint (`POST /admin/content/:id/publish`) requires `ADMIN` or `SUPER_ADMIN` role (Phase 2 RoleGuard). Unauthenticated or learner-role requests are rejected.

4. **Archive endpoint is protected.** The archive action endpoint (`POST /admin/content/:id/archive`) requires `ADMIN` or `SUPER_ADMIN` role.

5. **Restore-to-draft is restricted.** Only `SUPER_ADMIN` may restore archived content to draft. This must be logged in the audit trail.

6. **Learner queries filter by status.** All backend endpoints that serve content to learners apply a `WHERE status = 'published'` filter. This is enforced at the query level, not the application layer.

7. **Cascade visibility.** A lesson is only learner-visible if the lesson, its chapter, its level, and its course are all `published`. A single unpublished ancestor hides all descendants from learners.

---

## 7. Status Field in Database

```sql
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived'));
```

The `status` column:
- Is `NOT NULL` with a default of `'draft'`.
- Uses a `CHECK` constraint to prevent invalid values at the database level.
- Is indexed for learner-facing queries: `CREATE INDEX ON lessons (status)`.

---

## 8. Out-of-Scope

The following are explicitly outside the scope of this document:

- Onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime, dashboard recommendations, review/retention, progress reports, AI Teacher, Student Web App.
- Authentication, JWT validation, user roles (governed by Phase 2 boundaries).
- Payment, subscription, or access control beyond role-based publish/archive permissions.

---

## 9. References

- `docs/phase-3/curriculum-source-of-truth.md` (P3-003)
- `docs/phase-3/curriculum-data-model-map.md` (P3-005)
- `docs/phase-3/curriculum-api-map.md` (P3-004)