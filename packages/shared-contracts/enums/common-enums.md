# Common Enums Contract

## Purpose

This document defines common cross-service enum values for AIM Platform Phase 1.

These enums are shared contract definitions for Backend API, Flutter Mobile, Admin Dashboard, AIM Engine integration contracts, and future OpenAPI/schema documentation.

This document is contract-only. It does not implement runtime code, TypeScript enums, Dart enums, Python enums, database migrations, or client-side AIM logic.

## Scope

This document defines common enum names, values, meanings, and usage boundaries for:

- user roles
- session statuses
- lesson types
- question types
- recommendation action types
- notification types
- content status values
- review status values
- mastery band labels
- difficulty labels
- language codes
- platform/client types

This document does not implement:

- NestJS source code.
- Flutter source code.
- Admin Dashboard source code.
- Python AIM Engine source code.
- Database enum migrations.
- Runtime validation schemas.
- Student Web App behavior.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P1-011 | `packages/shared-contracts/README.md` and shared contract folders | Checked and used as source of truth. |

## Naming Convention

Enum type names use `PascalCase`.

Enum values use `UPPER_SNAKE_CASE`.

Examples:

| Enum Type | Example Value |
|---|---|
| `UserRole` | `LEARNER` |
| `SessionStatus` | `COMPLETED` |
| `LessonType` | `PRACTICE` |
| `QuestionType` | `MULTIPLE_CHOICE` |

Rules:

- Keep enum values stable.
- Do not rename values silently after use.
- Do not expose internal-only enum values to clients unless explicitly marked client-safe.
- Do not add client-side AIM computation semantics to enum values.
- Do not use enum values to bypass backend authorization.
- Backend remains authoritative for role, ownership, AIM output, and access decisions.

## Client-Safety Classification

| Classification | Meaning |
|---|---|
| `Client-safe` | May be returned to Flutter Mobile or Admin Dashboard when relevant. |
| `Backend-only` | Must remain server-side unless a later safe-field contract exposes it. |
| `Internal-review` | May be visible only to authorized internal/admin review tools. |
| `Contract-only` | Defined for consistency; implementation may come later. |

## Enum Registry

| Enum Type | Scope | Client-Safety |
|---|---|---|
| `UserRole` | Identity and authorization | Mixed |
| `SessionStatus` | Learning sessions | Client-safe |
| `LessonType` | Content/lesson contracts | Client-safe |
| `QuestionType` | Assessment/content contracts | Client-safe |
| `RecommendationActionType` | AIM recommendation output | Client-safe summary only |
| `NotificationType` | Notification contracts | Client-safe |
| `ContentStatus` | Content management | Mixed |
| `ReviewStatus` | Internal review workflow | Internal-review |
| `DifficultyLevel` | Content and AIM contracts | Mixed |
| `MasteryBand` | Learner-safe progress banding | Client-safe only when backend-approved |
| `LanguageCode` | Localization/content language | Client-safe |
| `ClientPlatform` | Platform identification | Client-safe |
| `AuthProvider` | Auth source classification | Backend-only by default |
| `AuditEventType` | Audit/log classification | Backend-only by default |

---

## UserRole

Defines platform user roles.

| Value | Meaning | Client-Safety |
|---|---|---|
| `LEARNER` | Learner/student account. | Client-safe |
| `PARENT` | Parent or guardian account with scoped learner access. | Client-safe |
| `INSTRUCTOR` | Human instructor/teacher role if enabled later. | Internal-review |
| `CONTENT_MANAGER` | Internal content author/editor role. | Internal-review |
| `REVIEWER` | Internal human reviewer role. | Internal-review |
| `ADMIN` | Platform admin role. | Internal-review |
| `SUPER_ADMIN` | Highest privileged platform role. | Backend-only |

### Rules

- Backend API is authoritative for user role checks.
- Clients may use role values for UI display and menu hints only.
- Clients must not trust local role values for authorization.
- `SUPER_ADMIN` must not be exposed to learner-facing clients.
- Parent access must remain scoped and backend-authorized.

---

## SessionStatus

Defines lifecycle status for learner sessions.

| Value | Meaning | Client-Safety |
|---|---|---|
| `NOT_STARTED` | Session exists or is planned but has not started. | Client-safe |
| `IN_PROGRESS` | Session is currently active. | Client-safe |
| `PAUSED` | Session was paused and may resume. | Client-safe |
| `SUBMITTED` | Learner submitted answers or activity. | Client-safe |
| `PROCESSING` | Backend or AIM Engine processing is underway. | Client-safe |
| `COMPLETED` | Session is complete and results are available if allowed. | Client-safe |
| `CANCELLED` | Session was cancelled before completion. | Client-safe |
| `EXPIRED` | Session expired before valid completion. | Client-safe |
| `FAILED` | Session could not be completed due to an error. | Client-safe with safe error message only |

### Rules

- `PROCESSING` does not mean the client can calculate results locally.
- `COMPLETED` does not imply all internal AIM fields are safe to expose.
- Backend owns final session state transitions.

---

## LessonType

Defines broad lesson/content types.

| Value | Meaning | Client-Safety |
|---|---|---|
| `VIDEO` | Video-based lesson content. | Client-safe |
| `TEXT` | Text-based lesson content. | Client-safe |
| `AUDIO` | Audio-based lesson content. | Client-safe |
| `INTERACTIVE` | Interactive learning activity. | Client-safe |
| `PRACTICE` | Practice lesson or practice set. | Client-safe |
| `QUIZ` | Quiz-style learning item. | Client-safe |
| `ASSESSMENT` | Formal assessment or placement/review test. | Client-safe |
| `REVIEW` | Review/spaced repetition content. | Client-safe |
| `AI_GUIDED` | Backend AI Teacher guided lesson. | Client-safe |
| `MIXED` | Lesson includes multiple content modes. | Client-safe |

### Rules

- `AI_GUIDED` does not allow the client to call AI providers directly.
- Backend API remains the boundary for AI Teacher behavior.
- Lesson type must not determine mastery or difficulty locally.

---

## QuestionType

Defines supported question item formats.

| Value | Meaning | Client-Safety |
|---|---|---|
| `MULTIPLE_CHOICE` | One correct option from multiple choices. | Client-safe |
| `MULTI_SELECT` | Multiple correct options may be selected. | Client-safe |
| `TRUE_FALSE` | True/false question. | Client-safe |
| `FILL_BLANK` | Fill-in-the-blank answer. | Client-safe |
| `SHORT_ANSWER` | Short typed response. | Client-safe |
| `MATCHING` | Match items between two sets. | Client-safe |
| `ORDERING` | Arrange items in correct order. | Client-safe |
| `SPEAKING_PROMPT` | Speaking/voice response prompt. | Client-safe |
| `LISTENING_PROMPT` | Listening comprehension prompt. | Client-safe |
| `WRITING_PROMPT` | Writing response prompt. | Client-safe |

### Rules

- Question type describes format only.
- Question type must not reveal correct answers.
- Question type must not trigger local mastery calculation.
- Backend owns grading rules and safe result exposure.

---

## RecommendationActionType

Defines backend-approved recommendation action categories.

| Value | Meaning | Client-Safety |
|---|---|---|
| `CONTINUE_CURRENT_PATH` | Continue the current learning path. | Client-safe |
| `START_NEXT_LESSON` | Move to the next lesson. | Client-safe |
| `REVIEW_PREVIOUS_SKILL` | Review a previous skill. | Client-safe |
| `RETRY_CURRENT_LESSON` | Retry the current lesson. | Client-safe |
| `PRACTICE_WEAK_SKILL` | Practice a skill identified by backend/AIM logic. | Client-safe summary only |
| `TAKE_ASSESSMENT` | Take an assessment or checkpoint. | Client-safe |
| `TAKE_BREAK` | Take a short break or pause. | Client-safe |
| `ESCALATE_TO_REVIEW` | Route to internal review/support workflow. | Internal-review |
| `NO_ACTION` | No recommendation action. | Client-safe |

### Rules

- Recommendation actions are produced by backend/AIM logic only.
- Flutter Mobile must not calculate recommendation actions locally.
- Admin Dashboard must not override AIM recommendations unless a later approved backend workflow exists.
- Client-safe recommendation text must be generated or approved by backend.
- Do not expose hidden weakness, mastery, retention, or difficulty internals through enum values.

---

## NotificationType

Defines high-level notification categories.

| Value | Meaning | Client-Safety |
|---|---|---|
| `LESSON_REMINDER` | Reminder to continue a lesson. | Client-safe |
| `REVIEW_REMINDER` | Reminder to review learned material. | Client-safe |
| `ASSESSMENT_REMINDER` | Reminder for assessment/checkpoint. | Client-safe |
| `STREAK_REMINDER` | Reminder related to learning streak. | Client-safe |
| `PARENT_UPDATE` | Parent/guardian progress update. | Client-safe when scoped |
| `SYSTEM_ANNOUNCEMENT` | Platform/system announcement. | Client-safe |
| `ACCOUNT_SECURITY` | Account/security notification. | Client-safe |
| `ADMIN_ALERT` | Internal admin alert. | Internal-review |
| `REVIEW_QUEUE_ALERT` | Internal review queue notification. | Internal-review |

### Rules

- Notification delivery method is not finalized by this enum.
- This enum does not decide push/email/in-app implementation.
- Parent notifications must remain scoped and learner-safe.
- Security notifications must not expose sensitive backend internals.

---

## ContentStatus

Defines content lifecycle states.

| Value | Meaning | Client-Safety |
|---|---|---|
| `DRAFT` | Content is being prepared. | Internal-review |
| `IN_REVIEW` | Content is awaiting review. | Internal-review |
| `APPROVED` | Content is approved for use. | Internal-review |
| `PUBLISHED` | Content is available to learners. | Client-safe |
| `ARCHIVED` | Content is no longer active. | Internal-review |
| `REJECTED` | Content failed review. | Internal-review |

### Rules

- Learner clients should normally see only published content.
- Content status does not grant publishing permissions.
- Backend/admin authorization controls content workflow.

---

## ReviewStatus

Defines internal review workflow states.

| Value | Meaning | Client-Safety |
|---|---|---|
| `OPEN` | Review item is open. | Internal-review |
| `ASSIGNED` | Review item is assigned. | Internal-review |
| `IN_REVIEW` | Review is actively in progress. | Internal-review |
| `NEEDS_CHANGES` | Reviewer requested changes. | Internal-review |
| `ESCALATED` | Item requires higher-level decision. | Internal-review |
| `RESOLVED` | Review item is resolved. | Internal-review |
| `CLOSED` | Review item is closed. | Internal-review |

### Rules

- Review statuses are internal operations values.
- Do not expose review notes or internal review decisions directly to learners or parents.
- Any learner-facing result must be transformed into safe language by backend or approved workflow.

---

## DifficultyLevel

Defines coarse difficulty labels.

| Value | Meaning | Client-Safety |
|---|---|---|
| `BEGINNER` | Beginner-level item or path. | Client-safe |
| `EASY` | Easy item or practice level. | Client-safe |
| `MEDIUM` | Medium difficulty. | Client-safe |
| `HARD` | Hard difficulty. | Client-safe |
| `ADVANCED` | Advanced difficulty. | Client-safe |
| `ADAPTIVE` | Difficulty selected by backend/AIM logic. | Client-safe label only |

### Rules

- Difficulty level may describe content or backend-approved output.
- Flutter Mobile must not calculate difficulty from speed, attempts, or local behavior.
- Speed must not directly raise mastery, learner level, or difficulty.
- Backend/AIM Engine owns adaptive difficulty decisions.

---

## MasteryBand

Defines learner-safe mastery band labels when backend approves exposure.

| Value | Meaning | Client-Safety |
|---|---|---|
| `NEEDS_PRACTICE` | Learner should practice more. | Client-safe when backend-approved |
| `DEVELOPING` | Learner is building understanding. | Client-safe when backend-approved |
| `ON_TRACK` | Learner is progressing as expected. | Client-safe when backend-approved |
| `STRONG` | Learner shows strong performance. | Client-safe when backend-approved |
| `READY_TO_ADVANCE` | Learner appears ready for next step. | Client-safe when backend-approved |

### Rules

- Mastery bands are safe labels, not raw mastery scores.
- Raw mastery, confidence, weakness, retention, and adaptive calculations are internal unless a later safe-field contract exposes them.
- Clients must not compute mastery bands locally.
- Backend remains authoritative for progress labels.

---

## LanguageCode

Defines supported content/UI language codes.

| Value | Meaning | Client-Safety |
|---|---|---|
| `EN` | English. | Client-safe |
| `AR` | Arabic. | Client-safe |

### Rules

- Use stable language codes in contracts.
- Additional languages require documented product/localization decision.
- Language code does not decide translation provider or runtime localization implementation.

---

## ClientPlatform

Defines platform/client types.

| Value | Meaning | Client-Safety |
|---|---|---|
| `FLUTTER_MOBILE` | Flutter Mobile learner client. | Client-safe |
| `ADMIN_DASHBOARD` | Internal Admin Dashboard. | Client-safe |
| `BACKEND_API` | Backend API service. | Backend-only |
| `AIM_ENGINE` | Python AIM Engine service/module. | Backend-only |
| `AI_TEACHER_GATEWAY` | Backend AI Teacher gateway boundary. | Backend-only |

### Rules

- `FLUTTER_MOBILE` is the Phase 1 learner client.
- `ADMIN_DASHBOARD` is internal foundation scope.
- A separate Student Web App is not a Phase 1 enum target unless a later documented decision changes scope.

---

## AuthProvider

Defines possible authentication source categories.

| Value | Meaning | Client-Safety |
|---|---|---|
| `SUPABASE_AUTH` | Supabase Auth identity provider. | Backend-only by default |
| `EMAIL_PASSWORD` | Email/password auth method. | Backend-only by default |
| `PHONE_OTP` | Phone/OTP auth method. | Backend-only by default |
| `SSO` | SSO provider category. | Backend-only by default |

### Rules

- Supabase Auth remains the default Phase 1 direction unless changed by documented decision.
- Backend API owns token validation and identity mapping.
- Clients must not use provider enum values as authorization proof.

---

## AuditEventType

Defines high-level audit event categories.

| Value | Meaning | Client-Safety |
|---|---|---|
| `AUTH_EVENT` | Auth-related audit event. | Backend-only |
| `ROLE_CHANGE` | Role or permission change event. | Backend-only |
| `CONTENT_CHANGE` | Content create/update/publish/archive event. | Backend-only |
| `SESSION_EVENT` | Learner session lifecycle event. | Backend-only |
| `AIM_OUTPUT_EVENT` | Backend/AIM output event. | Backend-only |
| `AI_TEACHER_EVENT` | AI Teacher gateway event. | Backend-only |
| `REVIEW_EVENT` | Human/internal review event. | Backend-only |
| `SYSTEM_EVENT` | System or service event. | Backend-only |

### Rules

- Audit events are backend/internal.
- Do not expose raw audit events to learners or parents.
- Do not include secrets, provider keys, raw traces, or hidden AIM internals in audit event payloads.

---

## Cross-Service Usage Rules

### Backend API

Backend API may use these enums to:

- Validate request/response contracts.
- Produce consistent API responses.
- Document OpenAPI schemas later.
- Map backend/AIM output to safe client values.

Backend API must remain authoritative for:

- auth
- ownership
- roles
- session state
- recommendation action
- difficulty output
- mastery band exposure

### Flutter Mobile

Flutter Mobile may use client-safe enum values to:

- Render UI labels.
- Route UI states.
- Show safe progress or recommendation summaries from backend.
- Display content and session state.

Flutter Mobile must not use enums to:

- Calculate mastery.
- Calculate weakness.
- Calculate difficulty.
- Calculate retention.
- Calculate recommendation actions.
- Override backend authorization.
- Call AI providers directly.

### Admin Dashboard

Admin Dashboard may use relevant enum values for internal UI states and placeholders.

Admin Dashboard must not use enum values to bypass backend permissions or perform runtime AIM overrides.

### AIM Engine

AIM Engine integration contracts may use relevant enum values for backend-owned request/response boundaries.

AIM Engine output must be mediated by Backend API before reaching clients.

## Extension Rules

When adding a new enum value:

1. Add it to this document.
2. Define its meaning.
3. Define client-safety classification.
4. Confirm it does not violate Phase 1 boundaries.
5. Confirm it does not move AIM logic into clients.
6. Confirm it does not expose hidden internal fields.
7. Update related API/schema docs if needed.
8. Avoid removing or renaming existing values without migration notes.

## Non-Goals

This document does not:

- Implement TypeScript enums.
- Implement Dart enums.
- Implement Python enums.
- Implement database enum types.
- Implement runtime validation schemas.
- Implement API endpoints.
- Implement Flutter UI.
- Implement Admin Dashboard UI.
- Implement AIM Engine logic.
- Define final localization strategy.
- Define final notification provider.
- Define final ORM/migration strategy.
- Add a Student Web App.

## Acceptance Notes

- User roles are included.
- Session statuses are included.
- Lesson types are included.
- Question types are included.
- Recommendation action types are included.
- Notification types are included where applicable.
- Enums use stable `PascalCase` type names and `UPPER_SNAKE_CASE` values.
- Client-safety classifications are included.
- Phase 1 boundaries are preserved.
- Flutter Mobile does not calculate AIM outputs locally.
- Backend remains authoritative for auth, ownership, roles, recommendations, mastery exposure, and adaptive difficulty.
- No runtime code was added.
- No database migration was added.
- No Student Web App work was added.

## Related Documents

- `packages/shared-contracts/README.md`
- `packages/shared-contracts/api/response-envelope.md`
- `packages/shared-contracts/api/errors.md`
- `docs/phase-1/system-foundation-charter.md`
- `docs/phase-1/open-decisions.md`
- `docs/tasks/phase_1_task_prompts.md`
