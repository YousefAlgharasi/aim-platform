# Phase 3 — Curriculum Source of Truth

## Purpose

This document defines the source of truth for Phase 3 curriculum and content data in the AIM Platform.

It prevents conflicts between database records, backend APIs, Admin Dashboard screens, Flutter content views, and later learning features by making ownership explicit before implementation expands.

Phase 3 remains limited to the Curriculum and Content System. This document does not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

## Source-of-Truth Decision

The **Backend API and database together are the source of truth** for curriculum and content state.

| Area | Source of truth | Notes |
|---|---|---|
| Curriculum hierarchy | Backend API backed by database records | Courses, levels, chapters, and lessons must be read and changed through backend-owned contracts. |
| Content status | Backend API backed by database records | Draft, review, approved, published, archived, and equivalent states must not be decided by clients. |
| Publishing eligibility | Backend validation | Lessons and questions may publish only when backend validation passes. |
| Skill mapping | Backend API backed by database relationships | Lesson-to-skill and question-to-skill mappings are authoritative only when persisted by backend-owned writes. |
| Objective mapping | Backend API backed by database relationships | Lesson and question objective links are managed as curriculum content relationships. |
| Lesson assets | Backend API backed by database/storage references | Clients may display approved references, not own private storage credentials or privileged asset state. |
| Question bank ownership | Backend API backed by database records | Question content, choices, correct answers, explanations, tags, and status belong to the curriculum/content backend. |
| Audit history | Backend audit logging | Admin UI may display audit history only through protected backend APIs. |

## Ownership Boundaries

### Database

The database persists authoritative curriculum and content records:

- courses;
- levels;
- chapters;
- lessons;
- skills;
- objectives;
- lesson assets;
- lesson-skill links;
- lesson-objective links;
- questions;
- question choices;
- question-skill links;
- question-objective links;
- content status and lifecycle metadata;
- audit events for curriculum management actions.

Database records should not be treated as an invitation for clients to write directly. Privileged writes must go through the Backend API so auth, permission, ownership, validation, and audit rules are applied consistently.

### Backend API

The Backend API owns:

- public and admin-safe curriculum contracts;
- validation for hierarchy, status, skill mapping, objective mapping, assets, and question correctness;
- publish, unpublish, archive, and restore decisions;
- role and permission enforcement for curriculum management;
- safe field shaping for each consumer;
- audit logging for content changes;
- conflict handling when admin requests are invalid or stale.

The backend is the final authority even when Admin Dashboard or Flutter Mobile caches, previews, or renders curriculum data.

### Admin Dashboard

The Admin Dashboard is a management client only.

It may:

- render curriculum hierarchy returned by protected backend APIs;
- submit create, update, review, publish, unpublish, archive, and restore requests to backend endpoints;
- display backend validation errors;
- show backend-approved status, skill links, objective links, asset references, question content, and audit events.

It must not:

- bypass backend APIs for privileged curriculum writes;
- treat local role or permission state as final authority;
- mark content published when backend validation rejects it;
- store or expose service-role keys, database credentials, JWT secrets, AI provider keys, private storage credentials, or raw tokens;
- create learner delivery, practice, session, progress, recommendation, AI Teacher, onboarding, placement, or Student Web App flows.

### Flutter Mobile

Flutter Mobile may later display backend-approved learner-safe curriculum data, but Phase 3 does not implement learner delivery.

In Phase 3, Flutter Mobile must not become the source of truth for:

- curriculum hierarchy;
- lesson availability;
- lesson completion;
- skill mastery;
- level placement;
- difficulty;
- weakness detection;
- retention scheduling;
- recommendations;
- progress conclusions.

Any future Flutter content view must treat backend responses as read-only presentation data and must not calculate curriculum authority or learning intelligence locally.

### Downstream Learning Features

Later onboarding, placement, learner delivery, practice, sessions, AIM runtime, progress reporting, recommendations, and AI Teacher features may consume curriculum/content data only through backend-approved contracts.

Downstream features must not rewrite the meaning of curriculum status, skill mapping, question correctness, or publish eligibility. If a later phase needs a new derived field or runtime interpretation, it must be added through an explicit backend-owned contract.

## Curriculum Hierarchy Rules

The canonical hierarchy is:

```text
Course -> Level -> Chapter -> Lesson
```

Rules:

- A course owns one or more levels.
- A level belongs to one course and owns one or more chapters.
- A chapter belongs to one level and owns one or more lessons.
- A lesson belongs to one chapter.
- Ordering is authoritative only when stored through backend-owned records.
- Clients may sort or group for display, but they must not redefine canonical parentage or order.

If a task needs a hierarchy variation, it must update the backend/database contract and documentation rather than letting a client invent local structure.

## Content Status Rules

Content status is authoritative only when persisted by backend-owned writes.

Expected lifecycle states may include:

- draft;
- in review;
- approved;
- published;
- archived.

Rules:

- Draft content is editable by authorized curriculum roles only.
- Review and approval transitions require backend permission checks.
- Published content must pass backend validation.
- Archived content must remain traceable for audit and references.
- Clients may show status badges, but they must not decide final status.

## Skill and Objective Mapping Rules

Skill and objective mappings are part of curriculum truth.

Rules:

- A publishable lesson must have the required skill linkage defined by Phase 3 contracts.
- Lesson objective links must be persisted through backend-owned relationships.
- Question skill and objective links must be persisted through backend-owned relationships.
- Admin UI may help select links, but backend validation decides whether mappings are complete.
- Flutter Mobile and downstream learning features must not create authoritative skill/objective mappings locally.

If a lesson can be published without required skills, the task must stop and be reported as blocked.

## Question Bank Rules

Question bank content is owned by the curriculum/content backend.

Authoritative question data includes:

- question prompt;
- question type;
- answer choices;
- correct answer definition;
- explanation or feedback;
- status;
- skill and objective links;
- tags or metadata;
- review and audit fields.

Rules:

- Correct answers must not be trusted from clients.
- Admin UI may submit question edits only through protected backend APIs.
- Learner-facing clients may receive only learner-safe question fields.
- Question validation must be backend-owned.
- Practice attempts and scoring are out of scope for Phase 3.

## Asset Rules

Lesson assets are authoritative only through backend-approved asset records or references.

Rules:

- Private storage credentials must stay server-side.
- Clients may receive safe asset URLs or references only when approved by backend policy.
- Admin UI may upload or link assets only through protected backend flows.
- Asset state must follow the same content lifecycle boundaries as the lesson or content item it supports.

## Safe Field Rules

Every curriculum/content API must shape responses for the intended consumer.

| Consumer | Allowed source-of-truth relationship |
|---|---|
| Admin Dashboard | Protected management view with backend-enforced roles and permissions |
| Flutter Mobile | Learner-safe read view only when a later task explicitly allows it |
| AIM Engine or runtime systems | Backend-approved contract in later phases only |
| Public or unauthenticated consumers | No privileged curriculum management fields |

Responses must not expose:

- service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- raw access or refresh tokens;
- unpublished answer keys to learner-facing clients;
- internal moderation notes outside authorized admin/reviewer contexts.

## Conflict Resolution

When two surfaces disagree, use this precedence:

1. Backend validation and authorization result.
2. Persisted database state changed through backend-owned writes.
3. Backend-shaped API response for the current user and purpose.
4. Admin Dashboard or Flutter local UI state.

Client state is always disposable. If local UI state conflicts with backend state, the backend state wins.

## Phase 3 Stop Conditions

Stop and report a blocker if any task introduces or discovers:

- a content API that writes, publishes, archives, imports, exports, or audits content without backend protection;
- Admin UI that bypasses backend authority;
- lesson publication without required skill linkage;
- question correctness determined only by client logic;
- real secrets or privileged credentials;
- onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

## Final Source-of-Truth Statement

For Phase 3, curriculum and content truth lives in backend-owned contracts and database records, not in Admin Dashboard state, Flutter state, downstream learning features, seeds, mocks, or local client calculations.

All curriculum/content implementation tasks must preserve that authority boundary.
