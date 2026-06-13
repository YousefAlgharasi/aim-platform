# Phase 3 — Curriculum Data Model Map

## Purpose

This document defines the planned Phase 3 data model for curriculum and content relationships in the AIM Platform.

The goal is to make relationships between courses, levels, chapters, lessons, skills, objectives, lesson assets, questions, choices, mappings, and content status transitions explicit before migrations are created.

This is a documentation-only task. It does not create migrations, change Prisma schema files, seed data, backend services, admin UI, Flutter views, or runtime learning behavior.

## Scope

This data model map is limited to the Curriculum and Content System:

- curriculum hierarchy;
- lesson metadata and status;
- skills and objectives;
- lesson skill/objective mappings;
- lesson assets;
- question bank records;
- question choices and correct answer definitions;
- question skill/objective mappings;
- content lifecycle state;
- curriculum audit events.

This document does not model onboarding, placement execution, learner lesson delivery, practice attempts, learning sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App features.

## Source Documents

This map follows:

```text
docs/phase-3/curriculum-content-system-charter.md
docs/phase-3/curriculum-source-of-truth.md
docs/phase-3/curriculum-api-map.md
services/backend-api/prisma/schema.prisma
```

Existing Phase 2 auth, role, permission, and ownership models remain authoritative for who may read or change curriculum content.

## Model Design Principles

Phase 3 curriculum tables should follow these principles:

1. use backend-owned database records as the source of truth;
2. preserve the canonical hierarchy `Course -> Level -> Chapter -> Lesson`;
3. keep content status as persisted lifecycle state, not client state;
4. require persisted skill mapping before lesson publication;
5. separate admin-safe data from learner-safe data;
6. keep correct answer definitions server-side and protected;
7. preserve auditability for privileged content changes;
8. avoid direct client writes to database records.

## Shared Field Conventions

Unless a later migration task documents a reason to differ, Phase 3 tables should use these shared fields.

| Field | Type intent | Purpose |
|---|---|---|
| `id` | UUID primary key | Stable backend identifier |
| `status` | String or enum | Content lifecycle state |
| `created_at` | Timestamp with time zone | Creation time |
| `updated_at` | Timestamp with time zone | Last update time |
| `created_by_user_id` | UUID nullable FK to `users.id` | Author/editor attribution |
| `updated_by_user_id` | UUID nullable FK to `users.id` | Last editor attribution |
| `published_at` | Timestamp nullable | Publication time when applicable |
| `published_by_user_id` | UUID nullable FK to `users.id` | Publisher attribution |
| `archived_at` | Timestamp nullable | Archive time when applicable |
| `archived_by_user_id` | UUID nullable FK to `users.id` | Archiver attribution |

User attribution fields should reference the internal AIM `users.id`, not Supabase Auth UID.

## Shared Status Values

Content lifecycle status should be explicit and backend-owned.

| Status | Meaning |
|---|---|
| `draft` | Editable content not ready for review |
| `in_review` | Submitted for review |
| `approved` | Approved but not currently published |
| `published` | Available to approved downstream readers |
| `archived` | Removed from active editing/delivery surfaces but retained for traceability |

Later implementation tasks may use database enum types or constrained strings, but clients must not invent additional status values locally.

## Entity Relationship Overview

```text
Course
  -> Level
    -> Chapter
      -> Lesson
        -> LessonAsset
        -> LessonSkill
        -> LessonObjective

Skill
  -> LessonSkill
  -> QuestionSkill

Objective
  -> LessonObjective
  -> QuestionObjective

Question
  -> QuestionChoice
  -> QuestionSkill
  -> QuestionObjective
```

Curriculum audit events reference any managed entity by entity type and entity ID.

## Course Model

Table intent:

```text
courses
```

Purpose:

Top-level curriculum container.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable course ID |
| `title` | Text | Required |
| `slug` | Text unique | Optional human-readable stable key |
| `description` | Text nullable | Admin/content metadata |
| `status` | Lifecycle status | Defaults to `draft` |
| `sort_order` | Integer | Backend-owned ordering |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one course has many levels;
- course status changes should be backend-authorized;
- course deletion should be avoided or restricted once children exist.

Indexes and constraints:

- unique `slug` when present;
- index `status`;
- index `sort_order`.

## Level Model

Table intent:

```text
levels
```

Purpose:

Ordered subdivision within a course.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable level ID |
| `course_id` | UUID FK to `courses.id` | Required |
| `title` | Text | Required |
| `code` | Text nullable | Example: `A1`, `A2`, or internal code |
| `description` | Text nullable | Admin/content metadata |
| `status` | Lifecycle status | Defaults to `draft` |
| `sort_order` | Integer | Order within course |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one level belongs to one course;
- one level has many chapters.

Indexes and constraints:

- index `course_id`;
- unique `(course_id, code)` when `code` is present;
- unique or validated `(course_id, sort_order)` when ordering must be strict.

## Chapter Model

Table intent:

```text
chapters
```

Purpose:

Ordered subdivision within a level.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable chapter ID |
| `level_id` | UUID FK to `levels.id` | Required |
| `title` | Text | Required |
| `slug` | Text nullable | Optional within level |
| `description` | Text nullable | Admin/content metadata |
| `status` | Lifecycle status | Defaults to `draft` |
| `sort_order` | Integer | Order within level |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one chapter belongs to one level;
- one chapter has many lessons.

Indexes and constraints:

- index `level_id`;
- unique `(level_id, slug)` when `slug` is present;
- unique or validated `(level_id, sort_order)` when ordering must be strict.

## Lesson Model

Table intent:

```text
lessons
```

Purpose:

Lesson metadata, content body/reference, and lifecycle state.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable lesson ID |
| `chapter_id` | UUID FK to `chapters.id` | Required |
| `title` | Text | Required |
| `slug` | Text nullable | Optional within chapter |
| `summary` | Text nullable | Admin/preview metadata |
| `content_body` | JSON or text nullable | Backend-owned content payload when stored directly |
| `content_ref` | Text nullable | External/content storage reference when used |
| `status` | Lifecycle status | Defaults to `draft` |
| `sort_order` | Integer | Order within chapter |
| `validation_state` | JSON nullable | Last backend validation summary, if persisted |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one lesson belongs to one chapter;
- one lesson has many lesson assets;
- one lesson has many lesson skill links;
- one lesson has many lesson objective links.

Publish rule:

```text
A lesson must not enter published status unless at least one required lesson-skill link exists.
```

Indexes and constraints:

- index `chapter_id`;
- index `status`;
- unique `(chapter_id, slug)` when `slug` is present;
- unique or validated `(chapter_id, sort_order)` when ordering must be strict.

## Skill Model

Table intent:

```text
skills
```

Purpose:

Backend-owned skill catalog used by lessons and questions.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable skill ID |
| `key` | Text unique | Machine-readable skill key |
| `name` | Text | Required display name |
| `description` | Text nullable | Skill definition |
| `status` | Lifecycle status | Defaults to `draft` or active equivalent |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one skill has many lesson skill links;
- one skill has many question skill links.

Indexes and constraints:

- unique `key`;
- index `status`.

## Objective Model

Table intent:

```text
objectives
```

Purpose:

Backend-owned learning/content objective catalog used by lessons and questions.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable objective ID |
| `key` | Text unique nullable | Machine-readable objective key |
| `title` | Text | Required |
| `description` | Text nullable | Objective detail |
| `status` | Lifecycle status | Defaults to `draft` or active equivalent |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one objective has many lesson objective links;
- one objective has many question objective links.

Indexes and constraints:

- unique `key` when present;
- index `status`.

## Lesson Skill Link Model

Table intent:

```text
lesson_skills
```

Purpose:

Many-to-many mapping between lessons and skills.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `lesson_id` | UUID FK to `lessons.id` | Required |
| `skill_id` | UUID FK to `skills.id` | Required |
| `is_primary` | Boolean | Optional primary skill marker |
| `created_at` | Timestamp with time zone | Link creation time |
| `created_by_user_id` | UUID nullable FK to `users.id` | Link author attribution |

Relationships:

- many lessons can link to many skills;
- publish validation depends on this table.

Indexes and constraints:

- composite primary key or unique `(lesson_id, skill_id)`;
- index `skill_id`;
- optional partial uniqueness for one primary skill per lesson if primary skills are required.

## Lesson Objective Link Model

Table intent:

```text
lesson_objectives
```

Purpose:

Many-to-many mapping between lessons and objectives.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `lesson_id` | UUID FK to `lessons.id` | Required |
| `objective_id` | UUID FK to `objectives.id` | Required |
| `created_at` | Timestamp with time zone | Link creation time |
| `created_by_user_id` | UUID nullable FK to `users.id` | Link author attribution |

Indexes and constraints:

- composite primary key or unique `(lesson_id, objective_id)`;
- index `objective_id`.

## Lesson Asset Model

Table intent:

```text
lesson_assets
```

Purpose:

Backend-owned references to assets attached to lesson content.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable asset ID |
| `lesson_id` | UUID FK to `lessons.id` | Required |
| `asset_type` | Text or enum | Example: image, audio, video, document, embed |
| `title` | Text nullable | Admin label |
| `storage_ref` | Text nullable | Server-side storage reference or approved external reference |
| `public_url` | Text nullable | Only when safe and approved |
| `alt_text` | Text nullable | Accessibility metadata |
| `status` | Lifecycle status | Defaults to `draft` |
| `sort_order` | Integer nullable | Order within lesson |
| shared audit fields | See shared conventions | For traceability |

Rules:

- private storage credentials must never be stored in client-visible fields;
- asset references must be shaped by backend APIs before reaching clients.

Indexes and constraints:

- index `lesson_id`;
- index `status`;
- index `asset_type`.

## Question Model

Table intent:

```text
questions
```

Purpose:

Question bank prompt, type, status, and protected answer metadata.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable question ID |
| `question_type` | Text or enum | Multiple choice, single choice, short answer, etc. |
| `prompt` | Text or JSON | Required question prompt |
| `explanation` | Text nullable | Admin/reviewer or learner-safe explanation depending response shaping |
| `status` | Lifecycle status | Defaults to `draft` |
| `difficulty_label` | Text nullable | Content metadata only, not adaptive runtime decision |
| `answer_definition` | JSON nullable/protected | Server-side correct answer definition |
| `validation_state` | JSON nullable | Last backend validation summary, if persisted |
| shared audit fields | See shared conventions | For traceability |

Relationships:

- one question has many choices;
- one question has many skill links;
- one question has many objective links.

Rules:

- correct answer definitions are protected and never trusted from learner clients;
- question publish validation must verify choices, answer definition, and required mappings.

Indexes and constraints:

- index `status`;
- index `question_type`;
- avoid indexing protected answer data unless a specific implementation need is documented.

## Question Choice Model

Table intent:

```text
question_choices
```

Purpose:

Answer choices for choice-based question types.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable choice ID |
| `question_id` | UUID FK to `questions.id` | Required |
| `choice_key` | Text | Stable per-question choice key |
| `label` | Text or JSON | Choice text/content |
| `sort_order` | Integer | Display order |
| `is_correct` | Boolean or nullable protected field | Admin/server-side only when used |
| `feedback` | Text nullable | Optional per-choice feedback |
| `created_at` | Timestamp with time zone | Creation time |
| `updated_at` | Timestamp with time zone | Last update time |

Rules:

- learner-safe APIs must not expose `is_correct` before answer submission in later phases;
- correctness may also be stored in `questions.answer_definition` when better for question type.

Indexes and constraints:

- index `question_id`;
- unique `(question_id, choice_key)`;
- unique or validated `(question_id, sort_order)`.

## Question Skill Link Model

Table intent:

```text
question_skills
```

Purpose:

Many-to-many mapping between questions and skills.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `question_id` | UUID FK to `questions.id` | Required |
| `skill_id` | UUID FK to `skills.id` | Required |
| `created_at` | Timestamp with time zone | Link creation time |
| `created_by_user_id` | UUID nullable FK to `users.id` | Link author attribution |

Indexes and constraints:

- composite primary key or unique `(question_id, skill_id)`;
- index `skill_id`.

## Question Objective Link Model

Table intent:

```text
question_objectives
```

Purpose:

Many-to-many mapping between questions and objectives.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `question_id` | UUID FK to `questions.id` | Required |
| `objective_id` | UUID FK to `objectives.id` | Required |
| `created_at` | Timestamp with time zone | Link creation time |
| `created_by_user_id` | UUID nullable FK to `users.id` | Link author attribution |

Indexes and constraints:

- composite primary key or unique `(question_id, objective_id)`;
- index `objective_id`.

## Curriculum Audit Event Model

Table intent:

```text
curriculum_audit_events
```

Purpose:

Trace privileged curriculum and content management actions.

Key fields:

| Field | Type intent | Notes |
|---|---|---|
| `id` | UUID PK | Stable event ID |
| `actor_user_id` | UUID nullable FK to `users.id` | Internal AIM user who acted |
| `entity_type` | Text | Course, level, chapter, lesson, skill, objective, asset, question, choice, mapping |
| `entity_id` | UUID | ID of affected entity |
| `action` | Text | Created, updated, linked, unlinked, submitted, approved, published, unpublished, archived, restored |
| `before_state` | JSON nullable | Safe snapshot or diff |
| `after_state` | JSON nullable | Safe snapshot or diff |
| `metadata` | JSON nullable | Request ID or operational context |
| `created_at` | Timestamp with time zone | Event time |

Rules:

- do not store tokens, credentials, private storage secrets, or raw sensitive request payloads;
- audit reads require restricted backend permissions.

Indexes and constraints:

- index `actor_user_id`;
- index `(entity_type, entity_id)`;
- index `action`;
- index `created_at`.

## Relationship Cardinality Summary

| Relationship | Cardinality | Join table |
|---|---|---|
| Course -> Level | One to many | None |
| Level -> Chapter | One to many | None |
| Chapter -> Lesson | One to many | None |
| Lesson -> LessonAsset | One to many | None |
| Lesson <-> Skill | Many to many | `lesson_skills` |
| Lesson <-> Objective | Many to many | `lesson_objectives` |
| Question -> QuestionChoice | One to many | None |
| Question <-> Skill | Many to many | `question_skills` |
| Question <-> Objective | Many to many | `question_objectives` |

## Deletion and Archive Rules

Curriculum/content records should prefer archive over hard delete once referenced.

Recommended behavior:

- hard delete may be allowed only for draft records with no dependent records;
- published or previously published records should archive instead of delete;
- child records should prevent parent deletion unless explicitly archived or migrated;
- mapping rows may be removed through backend-owned write operations when status rules allow it;
- every destructive or lifecycle action should create an audit event.

## Safe Field and Secret Rules

The model must not store real secrets in curriculum/content fields.

Never store or expose:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- raw access or refresh tokens.

Asset records may store server-side storage references, but backend response shaping must decide whether a public or signed URL is safe for a given audience.

## Phase 3 Boundary Rules

This data model must not include:

- learner progress;
- lesson completion;
- practice attempts;
- session attempts;
- placement results;
- mastery calculations;
- weakness records;
- retention schedules;
- recommendations;
- AI Teacher exchanges;
- Student Web App records.

Those belong to later phases or separate system areas.

## Migration Task Expectations

Future migration tasks should:

- use the existing backend database direction and Prisma/Postgres conventions;
- create tables in dependency order;
- add foreign keys for hierarchy and mappings;
- add unique constraints for stable keys and mapping tables;
- add indexes for parent IDs, status, type, and audit queries;
- keep answer/correctness fields protected from learner-safe responses;
- include rollback or migration safety notes where the migration system supports them;
- avoid seeding full learner delivery content unless a later task explicitly allows it.

## Final Data Model Decision

Phase 3 curriculum/content data is centered on backend-owned hierarchy records, lifecycle status, skill/objective mappings, asset references, question bank records, and audit events.

The model deliberately excludes learner delivery, adaptive runtime, progress, practice, recommendations, AI Teacher, onboarding, placement execution, and Student Web App data.
