# Phase 3 - Curriculum Hierarchy Contracts

## Purpose

This document defines the shared API contracts for courses, levels, and chapters in the Phase 3 Curriculum and Content System.

The goal is to keep the Backend API, Admin Dashboard, and future safe content consumers aligned on curriculum hierarchy shapes before implementation begins.

This is a documentation-only contract. It does not implement backend endpoints, migrations, admin UI, Flutter views, learner delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App work.

## Source Documents

This contract follows:

```text
docs/phase-3/curriculum-content-system-charter.md
docs/phase-3/curriculum-source-of-truth.md
docs/phase-3/curriculum-api-map.md
docs/phase-3/curriculum-data-model-map.md
docs/phase-3/content-publishing-permissions.md
```

The Backend API and database remain the source of truth for hierarchy state, ordering, status, publication, and authorization.

## Canonical Hierarchy

The canonical curriculum hierarchy is:

```text
Course -> Level -> Chapter -> Lesson
```

This contract covers the first three layers:

- Course
- Level
- Chapter

Lesson contracts are defined separately in the Phase 3 lesson contract task.

## Shared Rules

All hierarchy records must follow these rules:

- IDs are backend-owned stable UUIDs.
- Slugs and codes are stable public-ish identifiers only when backend generated or validated.
- Display labels are never used as primary identifiers.
- Ordering is backend-owned and persisted.
- Status is backend-owned and follows the content status lifecycle.
- Admin Dashboard may display and submit changes, but backend validation is final.
- Clients must not directly write hierarchy records to the database.

## Shared Status Values

Hierarchy contracts should use the Phase 3 content status lifecycle values:

| Value | Meaning |
|---|---|
| `draft` | Editable content not ready for review |
| `in_review` | Submitted for review |
| `approved` | Approved but not currently published |
| `published` | Active and available to approved downstream readers |
| `archived` | Hidden from active editing/delivery views but retained for traceability |

Status values are not client-owned. A client may request a transition only through backend-protected workflow APIs.

## Shared Audit Fields

Admin-safe hierarchy responses may include audit metadata when the current user has permission.

| Field | Type | Required | Notes |
|---|---|---|---|
| `createdAt` | ISO datetime string | Yes | Backend creation time |
| `updatedAt` | ISO datetime string | Yes | Backend update time |
| `createdByUserId` | UUID string or null | No | Internal AIM user ID, not Supabase Auth UID |
| `updatedByUserId` | UUID string or null | No | Internal AIM user ID, not Supabase Auth UID |
| `publishedAt` | ISO datetime string or null | No | Present when published |
| `archivedAt` | ISO datetime string or null | No | Present when archived |

Responses must not include service-role keys, database credentials, JWT secrets, AI provider keys, private storage credentials, raw tokens, or privileged backend internals.

## Course Summary Contract

Use this shape for course list items and parent references.

```ts
type CourseSummary = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  status: CurriculumContentStatus;
  sortOrder: number;
  levelCount?: number;
  createdAt: string;
  updatedAt: string;
};
```

Field rules:

| Field | Rule |
|---|---|
| `id` | Backend UUID; required |
| `slug` | Unique when present; not a display label |
| `title` | Human-readable course title |
| `description` | Optional admin-safe summary |
| `status` | Backend-owned lifecycle state |
| `sortOrder` | Backend-owned ordering across courses |
| `levelCount` | Optional aggregate for admin lists |

## Course Detail Contract

Use this shape for admin-safe course detail views.

```ts
type CourseDetail = CourseSummary & {
  levels?: LevelSummary[];
  audit?: CurriculumAuditSummary;
};
```

Rules:

- `levels` may be omitted unless requested by an include parameter.
- `audit` may be returned only for authorized admin/reviewer contexts.
- Course detail must not include child lessons directly unless a later task defines an explicit expanded hierarchy response.

## Create Course Request

```ts
type CreateCourseRequest = {
  title: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
};
```

Backend validation:

- `title` is required.
- `slug` must be unique when provided.
- `sortOrder` is normalized by backend logic when omitted.
- Client-supplied status is ignored or rejected unless a later task explicitly allows it.

## Update Course Request

```ts
type UpdateCourseRequest = {
  title?: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
};
```

Backend validation:

- immutable fields cannot be changed.
- status changes must use workflow endpoints.
- ordering conflicts must be resolved by backend logic.

## Level Summary Contract

Use this shape for level list items and child references.

```ts
type LevelSummary = {
  id: string;
  courseId: string;
  code: string | null;
  slug: string | null;
  title: string;
  description: string | null;
  status: CurriculumContentStatus;
  sortOrder: number;
  chapterCount?: number;
  createdAt: string;
  updatedAt: string;
};
```

Field rules:

| Field | Rule |
|---|---|
| `id` | Backend UUID; required |
| `courseId` | Parent course UUID; required |
| `code` | Stable level label such as `A1`; unique within course when present |
| `slug` | Optional backend-validated stable key |
| `title` | Human-readable level title |
| `status` | Backend-owned lifecycle state |
| `sortOrder` | Order within the parent course |

## Level Detail Contract

```ts
type LevelDetail = LevelSummary & {
  course?: CourseSummary;
  chapters?: ChapterSummary[];
  audit?: CurriculumAuditSummary;
};
```

Rules:

- `course` and `chapters` are optional includes.
- `chapters` must be returned in backend-owned order.
- Admin Dashboard must not infer missing chapters from local state.

## Create Level Request

```ts
type CreateLevelRequest = {
  courseId: string;
  title: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
};
```

Backend validation:

- parent course must exist.
- `title` is required.
- `code` and `slug` must be unique within the parent course when present.
- ordering is backend-owned.

## Update Level Request

```ts
type UpdateLevelRequest = {
  title?: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
};
```

Backend validation:

- parent changes require a separate explicit operation if allowed.
- status changes must use workflow endpoints.
- ordering conflicts must be resolved by backend logic.

## Chapter Summary Contract

Use this shape for chapter list items and child references.

```ts
type ChapterSummary = {
  id: string;
  levelId: string;
  slug: string | null;
  title: string;
  description: string | null;
  status: CurriculumContentStatus;
  sortOrder: number;
  lessonCount?: number;
  createdAt: string;
  updatedAt: string;
};
```

Field rules:

| Field | Rule |
|---|---|
| `id` | Backend UUID; required |
| `levelId` | Parent level UUID; required |
| `slug` | Unique within level when present |
| `title` | Human-readable chapter title |
| `status` | Backend-owned lifecycle state |
| `sortOrder` | Order within the parent level |
| `lessonCount` | Optional aggregate for admin lists |

## Chapter Detail Contract

```ts
type ChapterDetail = ChapterSummary & {
  level?: LevelSummary;
  course?: CourseSummary;
  lessonSummaries?: LessonHierarchySummary[];
  audit?: CurriculumAuditSummary;
};
```

Rules:

- `lessonSummaries` may include only safe lesson hierarchy fields.
- Full lesson content belongs to the lesson contract, not this hierarchy contract.
- Archived lessons may be omitted from default views unless admin filters request them.

## Create Chapter Request

```ts
type CreateChapterRequest = {
  levelId: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
};
```

Backend validation:

- parent level must exist.
- `title` is required.
- `slug` must be unique within the parent level when present.
- ordering is backend-owned.

## Update Chapter Request

```ts
type UpdateChapterRequest = {
  title?: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
};
```

Backend validation:

- parent changes require a separate explicit operation if allowed.
- status changes must use workflow endpoints.
- ordering conflicts must be resolved by backend logic.

## Hierarchy Tree Contract

Use this shape when an admin workflow needs the full hierarchy skeleton.

```ts
type CurriculumHierarchyTree = {
  courses: Array<
    CourseSummary & {
      levels: Array<
        LevelSummary & {
          chapters: ChapterSummary[];
        }
      >;
    }
  >;
};
```

Rules:

- This tree is for hierarchy navigation and admin planning.
- It must not include full lesson content.
- It must not include learner progress, completion, recommendations, or session state.
- It must be shaped by backend permissions.

## Lesson Hierarchy Summary

The hierarchy contract may reference lessons only with safe summary fields.

```ts
type LessonHierarchySummary = {
  id: string;
  chapterId: string;
  slug: string | null;
  title: string;
  status: CurriculumContentStatus;
  sortOrder: number;
  skillLinkCount: number;
};
```

Rules:

- `skillLinkCount` helps Admin Dashboard detect missing mappings.
- A published lesson must have at least one backend-owned skill link.
- Full lesson content and lesson assets are defined in separate contracts.

## Audit Summary Contract

```ts
type CurriculumAuditSummary = {
  lastAction: string | null;
  lastActorUserId: string | null;
  lastChangedAt: string | null;
};
```

Rules:

- Audit details are admin/reviewer-safe only.
- Audit fields must reference internal AIM user IDs, not Supabase Auth UIDs.
- Full audit event lists belong to protected audit APIs.

## Error Codes

Implementation tasks may refine exact error codes, but hierarchy APIs should support these categories:

| Code | Meaning |
|---|---|
| `CURRICULUM_PARENT_NOT_FOUND` | Parent course or level does not exist |
| `CURRICULUM_SLUG_CONFLICT` | Slug is not unique in the required scope |
| `CURRICULUM_ORDER_CONFLICT` | Requested order conflicts with existing records |
| `CURRICULUM_STATUS_TRANSITION_INVALID` | Status change must use a valid workflow |
| `CURRICULUM_PERMISSION_DENIED` | Caller lacks backend permission |

Error responses must not expose credentials, raw tokens, private storage references, or internal security details.

## Safe Field Rules

Hierarchy contracts must never include:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- raw access or refresh tokens;
- learner progress or mastery;
- recommendation data;
- practice/session attempts.

## Stop Conditions

Stop and report a blocker if implementation discovers:

- hierarchy writes that bypass backend auth and permission checks;
- Admin Dashboard acting as the source of truth for hierarchy state;
- client-generated IDs replacing backend-owned IDs;
- status transitions performed outside backend workflow rules;
- real secrets or privileged credentials;
- onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

## Final Contract Decision

Courses, levels, and chapters are backend-owned curriculum hierarchy records.

Admin Dashboard and future clients may consume these contracts, but backend APIs and database records remain the final authority for identity, ordering, status, safe fields, and permissions.
