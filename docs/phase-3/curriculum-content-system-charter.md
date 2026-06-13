# Phase 3 — Curriculum and Content System Charter

## Purpose

This charter defines the official scope boundary for **Phase 3 — Curriculum and Content System** in the AIM Platform.

Phase 3 exists to establish the curriculum and content foundation required before learner delivery, practice, sessions, runtime adaptation, and reporting work begins. It covers the authoring and management structure for courses, levels, chapters, lessons, skills, objectives, lesson assets, question bank content, content status, validation, publish controls, and curriculum review.

This document is intentionally restrictive. It prevents onboarding, placement execution, learner lesson delivery, practice attempts, learning sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher features, or Student Web App work from entering Phase 3.

## Phase Identity

| Item | Decision |
|---|---|
| Phase | Phase 3 |
| Phase name | Curriculum and Content System |
| Primary purpose | Establish backend-owned curriculum and content structure, validation, lifecycle, and admin management foundations |
| Learner client | Flutter Mobile remains the learner client direction, but learner delivery is out of scope for Phase 3 |
| Backend API | NestJS + TypeScript |
| Admin surface | Admin Dashboard may manage curriculum content only through backend-authorized APIs |
| Backend authority | Backend API and database remain the final authority for content state, publishing, roles, permissions, and ownership |
| AIM Engine scope | Out of scope except preserving boundaries and future integration contracts |
| Student Web App scope | Out of scope |

## In Scope

Phase 3 may include only the following Curriculum and Content System areas.

### Curriculum Hierarchy

- Course, level, chapter, and lesson contracts.
- Curriculum ordering and parent-child structure.
- Backend and database foundations that keep hierarchy authoritative.
- Admin-safe views for managing the hierarchy through backend APIs.

### Lesson Content

- Lesson records and metadata.
- Lesson status, review state, archive state, and publish state.
- Lesson objective mapping.
- Lesson-to-skill links required before publication.
- Lesson validation that prevents publishing invalid or skill-less lessons.

### Skills and Objectives

- Skill definitions.
- Objective definitions.
- Relationships between lessons, skills, objectives, chapters, levels, and courses.
- Backend validation for required mappings and uniqueness where applicable.

### Lesson Assets

- Contracts for lesson assets such as text, images, audio references, or other content metadata.
- Asset ownership by lesson or content module.
- Asset status and review metadata.
- Admin-managed asset references that do not expose private storage credentials.

### Question Bank

- Question bank contracts and backend foundations.
- Question choices, answer validation, explanations, tags, and skill/objective links.
- Question status, review, archive, and publish controls.
- Seeds or fixtures for content foundation only, not learner attempts or adaptive practice.

### Content Lifecycle

- Draft, review, approved, published, archived, or equivalent content states.
- Publish and unpublish controls enforced by backend authority.
- Validation rules that block unsafe or incomplete publication.
- Audit logging for curriculum management actions.

### Admin Curriculum Management

- Admin Dashboard workflows for curriculum and content management only.
- Admin UI that calls protected backend APIs rather than becoming the source of truth.
- UX affordances for editors and reviewers that remain subordinate to backend validation.

### Curriculum Security and Review

- Role and permission guards for curriculum management endpoints.
- Safe field exposure for content APIs.
- Review documents that confirm Phase 3 stayed inside curriculum/content scope.
- Checks that no secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are exposed.

## Explicitly Out of Scope

Phase 3 must not include any of the following work.

| Area | Phase 3 Decision |
|---|---|
| Onboarding | Out of scope |
| Placement execution | Out of scope |
| Learner lesson delivery | Out of scope |
| Practice attempts | Out of scope |
| Learning sessions | Out of scope |
| AIM runtime integration | Out of scope |
| AIM mastery calculation | Out of scope |
| Level decisioning | Out of scope |
| Weakness detection | Out of scope |
| Difficulty adaptation | Out of scope |
| Retention or review scheduling | Out of scope |
| Recommendation generation | Out of scope |
| Dashboard recommendations | Out of scope |
| Progress reports | Out of scope |
| AI Teacher | Out of scope |
| Student Web App | Out of scope |
| React/Next.js learner client | Out of scope |

If any Phase 3 task appears to require one of these areas, the task must stop and be reported as blocked or deferred.

## Non-Negotiable Architecture Rules

### Backend Is the Final Authority

The backend is the final authority for:

- curriculum hierarchy;
- lesson state;
- skill and objective mapping;
- question validity;
- content review status;
- publish and archive decisions;
- role checks;
- permission checks;
- ownership checks;
- audit logging.

Flutter Mobile and the Admin Dashboard may display backend-approved state, but they must not become the authority for content validity, publication, authorization, or learning decisions.

### Content APIs Must Be Protected

Any API that creates, updates, publishes, unpublishes, archives, restores, deletes, imports, exports, or audits curriculum content must require backend authentication and role or permission checks.

Read APIs must expose only fields that are safe for their intended audience. Internal moderation notes, privileged audit details, storage credentials, service keys, or draft-only administrative data must not be exposed through public or learner-facing responses.

### Admin UI Must Not Bypass Backend Authority

Admin Dashboard controls are UX only. They may guide editors and reviewers, but they must not:

- decide final publication eligibility;
- bypass backend validation;
- write directly to privileged data stores from the browser;
- rely on client-side role checks as security;
- expose service-role keys or privileged credentials;
- mark content published when backend validation fails.

### Lessons Must Not Publish Without Skills

A lesson must not be publishable unless it has the required skill linkage defined by Phase 3 contracts and backend validation.

Any task that introduces lesson publishing must include a backend guard or validation path that prevents publication of skill-less lessons.

### No Learning Intelligence in Clients

Phase 3 must not move AIM Engine or learning intelligence logic into Flutter Mobile, Admin Dashboard, or any client.

Clients must not calculate:

- mastery;
- student level;
- weakness;
- difficulty;
- retention;
- recommendations;
- learning progress conclusions.

These areas remain backend/AIM-engine concerns for later phases.

### No Speed-As-Mastery

Phase 3 must preserve the foundation rule that speed, response time, average response time, or speed score must not be used as a direct mastery, level, or difficulty-increase signal.

### Secrets Stay Server-Side

Phase 3 must not expose any of the following to Flutter Mobile, Admin Dashboard, public repository files, or other clients:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- privileged backend credentials;
- production-only secrets;
- raw access or refresh tokens.

Only public client-safe configuration may be used in clients.

### Educational, Non-Clinical Language

Any learner-facing text introduced incidentally during Phase 3 must remain educational, non-clinical, non-medical, and non-diagnostic.

## Required Backend Boundaries

Every protected backend endpoint created or changed in Phase 3 must define which checks apply.

| Endpoint type | Required backend authority |
|---|---|
| Curriculum read for admin management | Auth + role or permission check |
| Curriculum write | Auth + role or permission check |
| Lesson create/update | Auth + role or permission check + validation |
| Lesson publish/unpublish | Auth + publish permission + required content validation |
| Lesson archive/restore | Auth + role or permission check |
| Skill/objective management | Auth + role or permission check |
| Question bank management | Auth + role or permission check + answer validation |
| Asset reference management | Auth + role or permission check + safe storage handling |
| Audit log read | Auth + restricted admin/reviewer permission |

A task must not rely on Admin Dashboard checks as the only protection.

## Required Admin Boundaries

Admin Dashboard work in Phase 3 is limited to curriculum and content management foundations.

Admin UI may:

- list and edit curriculum hierarchy through protected backend APIs;
- manage lessons, skills, objectives, assets, and question bank content through protected backend APIs;
- show validation errors returned by the backend;
- provide review and publish controls that submit to backend-authorized endpoints.

Admin UI must not:

- directly bypass the Backend API for privileged content writes;
- treat local role state as final authorization;
- create learner delivery, practice, session, progress, recommendation, AI Teacher, or Student Web App flows;
- include service keys, database credentials, JWT secrets, private storage credentials, or AI provider keys.

## Relationship to Phase 2

Phase 3 starts from the Phase 2 closeout in `docs/phase-2/final-review.md`.

Phase 3 must preserve the Phase 2 decisions that:

- backend authorization remains final;
- Flutter/Admin role behavior is UX-only;
- Supabase service-role keys, JWT secrets, database credentials, provider keys, and raw tokens stay server-side;
- protected operations require backend checks before client UX;
- auth, role, permission, ownership, and safe-field boundaries are inherited by later phases.

Phase 3 may add curriculum-specific roles, permissions, or guards only when they remain backend-owned and documented.

## Done Criteria for Phase 3 Scope Compliance

A Phase 3 task is scope-compliant only when:

- the work is limited to curriculum and content system foundations;
- required dependencies are complete and pushed before the task begins;
- expected output files exist at the paths defined by the task prompt;
- content APIs are protected when they perform privileged or administrative actions;
- lesson publication cannot bypass required skill mapping;
- Admin Dashboard work uses backend authority rather than client-only authorization;
- no onboarding, placement execution, learner delivery, practice, sessions, AIM runtime, dashboard recommendations, AI Teacher, progress reports, or Student Web App work is introduced;
- no secret or privileged credential is exposed;
- checks, tests, or review notes are documented.

## Stop Conditions

A Phase 3 task must stop and report a blocker if:

- a dependency is missing, incomplete, blocked, or not pushed to GitHub;
- the exact task prompt section is missing;
- a lesson can be published without skills;
- a content API is unprotected;
- Admin UI bypasses backend authority;
- a real secret is detected;
- onboarding, placement, learner delivery, practice, sessions, AIM runtime, dashboard recommendations, AI Teacher, progress reports, or Student Web App work appears.

## Final Charter Decision

Phase 3 is approved only as a Curriculum and Content System foundation phase.

The phase may define and implement curriculum/content structure, lifecycle, validation, and admin management foundations. It must not become learner delivery, adaptive learning runtime, reporting, AI Teacher, onboarding, placement, or Student Web App implementation.
