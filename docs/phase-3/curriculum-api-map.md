# Phase 3 — Curriculum API Map

## Purpose

This document defines the required Phase 3 backend API surface for curriculum and content management in the AIM Platform.

The goal is to prevent random, duplicated, or inconsistent endpoint design while preserving the source-of-truth rules in:

```text
docs/phase-3/curriculum-source-of-truth.md
```

This is a documentation-only task. It does not implement endpoints, database migrations, backend services, admin screens, Flutter views, or runtime learning behavior.

## Scope

This API map is limited to the Curriculum and Content System:

- courses;
- levels;
- chapters;
- lessons;
- skills;
- objectives;
- lesson assets;
- question bank content;
- content status workflow;
- publishing, unpublishing, archive, and restore controls;
- curriculum audit visibility for authorized admins or reviewers.

This document does not define learner delivery, onboarding, placement execution, practice attempts, learning sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App APIs.

## API Design Principles

All Phase 3 curriculum management endpoints must:

1. validate the authenticated user through the backend auth foundation;
2. resolve the internal AIM user before applying permissions;
3. enforce backend role or permission checks for administrative operations;
4. validate hierarchy, status, skill links, objective links, assets, and question correctness in the backend;
5. return only fields safe for the requesting audience;
6. audit privileged content lifecycle actions;
7. reject unauthorized or invalid requests even if Admin Dashboard local state claims the action is allowed.

Admin Dashboard checks are UX-only. Backend authorization and validation are final.

## Endpoint Groups

| Group | Purpose |
|---|---|
| Courses | Top-level curriculum containers |
| Levels | Ordered course subdivisions |
| Chapters | Ordered level subdivisions |
| Lessons | Lesson metadata, content state, and publication lifecycle |
| Skills | Skill catalog used by lessons and questions |
| Objectives | Objective catalog and mapping targets |
| Lesson Assets | Asset references owned by lesson content |
| Lesson Mappings | Lesson-to-skill and lesson-to-objective relationships |
| Question Bank | Questions, choices, answers, explanations, tags, and status |
| Question Mappings | Question-to-skill and question-to-objective relationships |
| Content Workflow | Review, approve, publish, unpublish, archive, and restore operations |
| Curriculum Audit | Protected audit history for content management actions |

## Permission Model Names

Implementation tasks may refine exact permission constants, but endpoint design should assume backend-owned permissions like:

| Permission | Purpose |
|---|---|
| `curriculum.read` | Read admin-safe curriculum content |
| `curriculum.write` | Create and update curriculum hierarchy/content |
| `curriculum.review` | Review and approve content |
| `curriculum.publish` | Publish or unpublish content |
| `curriculum.archive` | Archive or restore content |
| `question_bank.read` | Read admin-safe question bank content |
| `question_bank.write` | Create and update question bank content |
| `question_bank.review` | Review and approve question bank content |
| `question_bank.publish` | Publish or unpublish question bank content |
| `curriculum.audit.read` | Read curriculum audit events |

Super-admin style roles may imply these permissions, but endpoint handlers must still rely on backend authorization rather than Admin Dashboard state.

## Standard Response Rules

All endpoints should use project-standard response envelopes where available.

Admin management responses may include:

- stable IDs;
- names and titles;
- slugs when applicable;
- status;
- ordering;
- parent IDs;
- skill and objective links;
- safe asset references;
- timestamps;
- reviewer/editor metadata when permitted;
- validation errors returned by backend services.

Responses must not include:

- service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- raw access or refresh tokens;
- unpublished answer keys to learner-facing clients;
- internal moderation notes outside authorized admin/reviewer contexts.

## Courses API

### `GET /curriculum/courses`

Lists courses for curriculum management.

Auth:

```text
Authenticated user + curriculum.read
```

Backend checks:

- validate session;
- enforce `curriculum.read`;
- return admin-safe course fields only.

### `POST /curriculum/courses`

Creates a course.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- title is required;
- slug is unique when provided;
- initial status is allowed;
- no client-controlled publish state bypass.

### `GET /curriculum/courses/:courseId`

Returns one course with optional summary children.

Auth:

```text
Authenticated user + curriculum.read
```

Backend checks:

- verify course exists;
- return admin-safe fields.

### `PATCH /curriculum/courses/:courseId`

Updates course metadata.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- immutable fields remain protected;
- slug uniqueness is preserved;
- status transitions use workflow endpoints when publication state changes.

## Levels API

### `GET /curriculum/courses/:courseId/levels`

Lists levels in a course.

Auth:

```text
Authenticated user + curriculum.read
```

Backend checks:

- verify course exists;
- return levels in canonical backend order.

### `POST /curriculum/courses/:courseId/levels`

Creates a level under a course.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- parent course exists;
- title or code is required;
- ordering is backend-owned.

### `PATCH /curriculum/levels/:levelId`

Updates a level.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- parent changes are explicit and valid;
- order changes are persisted by backend-owned logic.

## Chapters API

### `GET /curriculum/levels/:levelId/chapters`

Lists chapters in a level.

Auth:

```text
Authenticated user + curriculum.read
```

Backend checks:

- verify level exists;
- return chapters in canonical backend order.

### `POST /curriculum/levels/:levelId/chapters`

Creates a chapter under a level.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- parent level exists;
- title is required;
- ordering is backend-owned.

### `PATCH /curriculum/chapters/:chapterId`

Updates chapter metadata.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- parent changes are explicit and valid;
- status changes follow allowed lifecycle rules.

## Lessons API

### `GET /curriculum/chapters/:chapterId/lessons`

Lists lessons in a chapter.

Auth:

```text
Authenticated user + curriculum.read
```

Backend checks:

- verify chapter exists;
- return lessons in canonical backend order;
- include status, mapping summary, and validation summary when permitted.

### `POST /curriculum/chapters/:chapterId/lessons`

Creates a lesson under a chapter.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- parent chapter exists;
- title is required;
- default state is draft or equivalent;
- skill links are not required for creation but are required before publish.

### `GET /curriculum/lessons/:lessonId`

Returns admin-safe lesson details.

Auth:

```text
Authenticated user + curriculum.read
```

May include:

- metadata;
- content body or content reference;
- status;
- skill links;
- objective links;
- asset references;
- validation summary;
- audit summary when permitted.

### `PATCH /curriculum/lessons/:lessonId`

Updates draft or editable lesson metadata/content.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- editable status is enforced;
- content fields match backend contract;
- status changes that imply review/publish use workflow endpoints.

### `POST /curriculum/lessons/:lessonId/validate`

Runs backend-owned lesson validation.

Auth:

```text
Authenticated user + curriculum.read
```

Validation must check:

- required fields;
- parent hierarchy;
- required skill links;
- objective links when required;
- asset references;
- publish eligibility.

This endpoint reports eligibility; it does not publish content.

## Skills API

### `GET /curriculum/skills`

Lists skills.

Auth:

```text
Authenticated user + curriculum.read
```

Backend checks:

- return admin-safe skill fields;
- support filtering by course, level, chapter, status, or search when implemented.

### `POST /curriculum/skills`

Creates a skill.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- name is required;
- code or slug is unique when used;
- parent or category links are valid when supplied.

### `PATCH /curriculum/skills/:skillId`

Updates a skill.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- prevent breaking published lesson/question mappings without explicit workflow handling.

## Objectives API

### `GET /curriculum/objectives`

Lists objectives.

Auth:

```text
Authenticated user + curriculum.read
```

### `POST /curriculum/objectives`

Creates an objective.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- objective text or title is required;
- linked skill/course/chapter references exist when supplied.

### `PATCH /curriculum/objectives/:objectiveId`

Updates an objective.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- prevent invalidating published mappings without explicit workflow handling.

## Lesson Mapping API

### `PUT /curriculum/lessons/:lessonId/skills`

Replaces lesson skill links.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- lesson exists;
- every skill exists;
- duplicate links are rejected or normalized;
- published lessons require workflow rules before changing mappings.

### `PUT /curriculum/lessons/:lessonId/objectives`

Replaces lesson objective links.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- lesson exists;
- every objective exists;
- objective links are compatible with the lesson's skills or hierarchy when rules exist.

## Lesson Assets API

### `GET /curriculum/lessons/:lessonId/assets`

Lists safe asset references for a lesson.

Auth:

```text
Authenticated user + curriculum.read
```

### `POST /curriculum/lessons/:lessonId/assets`

Creates or links a lesson asset reference.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- lesson exists;
- asset type is allowed;
- private storage credentials are never accepted from or returned to clients;
- asset status follows lesson/content lifecycle.

### `PATCH /curriculum/assets/:assetId`

Updates an asset reference.

Auth:

```text
Authenticated user + curriculum.write
```

### `DELETE /curriculum/assets/:assetId`

Removes or detaches an asset reference when allowed.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- published content rules are respected;
- audit event is recorded.

## Question Bank API

### `GET /question-bank/questions`

Lists admin-safe question bank entries.

Auth:

```text
Authenticated user + question_bank.read
```

Supports implementation-defined filters for:

- status;
- type;
- skill;
- objective;
- lesson;
- tag;
- search.

### `POST /question-bank/questions`

Creates a question.

Auth:

```text
Authenticated user + question_bank.write
```

Backend validation:

- prompt is required;
- question type is allowed;
- initial status is draft or equivalent;
- choices and answer definitions are validated by question type;
- learner-facing answer leakage is prevented.

### `GET /question-bank/questions/:questionId`

Returns admin-safe question details.

Auth:

```text
Authenticated user + question_bank.read
```

May include correct answer data only for authorized admin/reviewer contexts.

### `PATCH /question-bank/questions/:questionId`

Updates question metadata or content.

Auth:

```text
Authenticated user + question_bank.write
```

Backend validation:

- editable status is enforced;
- answer definitions remain valid;
- published question changes follow workflow rules.

### `POST /question-bank/questions/:questionId/validate`

Runs backend-owned question validation.

Auth:

```text
Authenticated user + question_bank.read
```

Validation must check:

- prompt;
- choices;
- correct answer definition;
- skill links;
- objective links when required;
- publish eligibility;
- learner-safe field separation.

## Question Choice API

### `PUT /question-bank/questions/:questionId/choices`

Replaces answer choices for a question.

Auth:

```text
Authenticated user + question_bank.write
```

Backend validation:

- question exists;
- choices match question type;
- correct answer references valid choices;
- no client-only correctness decisions are accepted.

## Question Mapping API

### `PUT /question-bank/questions/:questionId/skills`

Replaces question skill links.

Auth:

```text
Authenticated user + question_bank.write
```

Backend validation:

- question exists;
- every skill exists;
- duplicate links are rejected or normalized.

### `PUT /question-bank/questions/:questionId/objectives`

Replaces question objective links.

Auth:

```text
Authenticated user + question_bank.write
```

Backend validation:

- question exists;
- every objective exists;
- objective links are compatible with selected skills when rules exist.

## Content Workflow API

Workflow endpoints centralize status transitions so clients cannot bypass validation.

### `POST /curriculum/lessons/:lessonId/submit-review`

Moves a lesson from draft to review when valid.

Auth:

```text
Authenticated user + curriculum.write
```

Backend validation:

- lesson is editable;
- required fields are present;
- required skill links exist.

### `POST /curriculum/lessons/:lessonId/approve`

Approves a reviewed lesson.

Auth:

```text
Authenticated user + curriculum.review
```

### `POST /curriculum/lessons/:lessonId/publish`

Publishes a lesson.

Auth:

```text
Authenticated user + curriculum.publish
```

Backend validation:

- lesson exists;
- lesson is in an allowed pre-publish state;
- required skill links exist;
- required objective links and assets pass validation when applicable;
- audit event is recorded.

If a lesson can publish without required skills, the implementation must stop and be reported as blocked.

### `POST /curriculum/lessons/:lessonId/unpublish`

Unpublishes a lesson.

Auth:

```text
Authenticated user + curriculum.publish
```

Backend validation:

- downstream references are handled according to the implementation contract;
- audit event is recorded.

### `POST /curriculum/lessons/:lessonId/archive`

Archives a lesson.

Auth:

```text
Authenticated user + curriculum.archive
```

Backend validation:

- lesson exists;
- archive transition is allowed;
- audit event is recorded.

### `POST /curriculum/lessons/:lessonId/restore`

Restores an archived lesson to an allowed non-published state.

Auth:

```text
Authenticated user + curriculum.archive
```

### Question Workflow Endpoints

Question bank workflow mirrors lesson workflow:

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /question-bank/questions/:questionId/submit-review` | `question_bank.write` | Submit a question for review |
| `POST /question-bank/questions/:questionId/approve` | `question_bank.review` | Approve a reviewed question |
| `POST /question-bank/questions/:questionId/publish` | `question_bank.publish` | Publish a valid question |
| `POST /question-bank/questions/:questionId/unpublish` | `question_bank.publish` | Remove a question from published availability |
| `POST /question-bank/questions/:questionId/archive` | `question_bank.write` or archive-specific permission | Archive a question |
| `POST /question-bank/questions/:questionId/restore` | `question_bank.write` or archive-specific permission | Restore an archived question |

Question publish validation must confirm valid choices, correct answer definition, and required skill/objective links.

## Curriculum Audit API

### `GET /curriculum/audit-events`

Lists curriculum/content audit events.

Auth:

```text
Authenticated user + curriculum.audit.read
```

Backend checks:

- restrict access to authorized admin/reviewer roles;
- support filters by entity type, entity ID, actor, action, and date when implemented;
- return safe audit fields only.

Audit events should be recorded for:

- create;
- update;
- mapping changes;
- submit review;
- approve;
- publish;
- unpublish;
- archive;
- restore;
- delete or detach asset;
- question answer changes.

## Learner-Safe Read APIs

Learner delivery is out of scope for Phase 3.

If a later Phase 3 task explicitly requires a read-only preview for approved content, it must be separate from admin management APIs and must:

- expose only backend-approved learner-safe fields;
- exclude unpublished answer keys;
- exclude internal review notes;
- exclude privileged audit details;
- avoid progress, completion, recommendations, sessions, or AIM runtime behavior.

No learner-facing API in Phase 3 may become lesson delivery or practice execution.

## Validation Summary

Backend-owned validation must cover:

| Area | Required validation |
|---|---|
| Hierarchy | Parent exists, order is backend-owned, parent-child relation is valid |
| Status | Transition is allowed for current state and caller permission |
| Lesson publish | Required fields, required skill links, objective/asset rules where applicable |
| Skill mapping | Referenced skills exist and duplicate/invalid links are rejected |
| Objective mapping | Referenced objectives exist and compatibility rules pass |
| Assets | Type, ownership, safe reference, and private credential handling |
| Question choices | Type-compatible choices and correct answer definition |
| Question publish | Prompt, answer, skill/objective mapping, and learner-safe field separation |
| Audit | Privileged lifecycle actions create traceable audit events |

## Stop Conditions

Stop and report a blocker if implementation discovers:

- a write, publish, archive, import, export, or audit endpoint without backend auth and role/permission checks;
- a lesson publish path that does not require skill linkage;
- question correctness decided only by client logic;
- Admin Dashboard bypassing backend authority;
- real secrets or privileged credentials;
- onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

## Testing Expectations for Implementation Tasks

This map is documentation-only, so this task records documentation review as its check.

Future implementation tasks should add backend tests for:

- protected write/publish/archive endpoints rejecting unauthorized callers;
- role or permission guards on management endpoints;
- lesson publish validation rejecting lessons without required skills;
- question validation rejecting invalid choices or answer definitions;
- safe response shaping for admin-safe and learner-safe contexts;
- audit events for privileged lifecycle actions.

## Final API Map Decision

Phase 3 curriculum APIs must be backend-owned, protected, validated, and separated by audience.

Admin Dashboard may manage content through these APIs, but it must not become the authority for curriculum truth, publication, authorization, answer correctness, or private asset access.
