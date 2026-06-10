# Learner-Safe vs Internal Fields Contract

## Purpose

This document defines which AIM Platform fields may be exposed to learner, parent, admin, and internal backend surfaces during Phase 1 and later implementation.

The goal is to prevent accidental exposure of internal AIM calculations, adaptive learning signals, AI Teacher internals, authorization internals, provider details, or unsafe diagnostic fields.

This contract is documentation-only. It does not implement runtime code, database migrations, API serializers, DTOs, Flutter models, Admin Dashboard models, or AIM Engine logic.

## Scope

This document defines:

- Learner-safe fields.
- Parent-safe fields if parent access is later enabled.
- Admin/internal fields.
- Forbidden client fields.
- AIM output exposure boundaries.
- AI Teacher field exposure boundaries.
- Backend ownership rules for field filtering.

This document does not define:

- Runtime DTO implementation.
- OpenAPI decorators.
- Database migrations.
- Flutter model classes.
- Admin Dashboard model classes.
- Python AIM Engine models.
- Final localization behavior.
- Final parent dashboard implementation.
- Student Web App behavior.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P1-011 | `packages/shared-contracts/README.md` and shared contract folders | Checked and used as source of truth. |
| P1-014 | `packages/shared-contracts/enums/common-enums.md` | Checked and used as source of truth. |

## Core Rule

Backend API is the only authority for deciding which fields are exposed to any client.

Clients may render fields returned by the backend, but must not infer hidden AIM state, authorization state, ownership state, or AI Teacher internals from missing fields, status labels, enum values, timings, or error responses.

## Surface Categories

| Surface | Meaning |
|---|---|
| `Learner` | Flutter Mobile learner-facing UI. |
| `Parent` | Optional parent/guardian view if enabled later. |
| `Admin` | Internal Admin Dashboard with backend-authorized access. |
| `Internal` | Backend API, AIM Engine, database, logs, jobs, and service-to-service contracts. |

## Exposure Labels

| Label | Meaning |
|---|---|
| `Learner-safe` | May be exposed to learner clients when relevant and backend-authorized. |
| `Parent-safe` | May be exposed to parent clients when parent relationship is verified and backend-authorized. |
| `Admin-safe` | May be exposed to authorized internal/admin users. |
| `Internal-only` | Must not be exposed directly to learner or parent clients. |
| `Forbidden-client` | Must not be exposed to any external client. |
| `Derived-safe` | May be exposed only as backend-approved safe summary, label, or recommendation. |

## High-Level Exposure Matrix

| Field Category | Learner | Parent | Admin | Internal |
|---|---:|---:|---:|---:|
| Public profile basics | Yes | Scoped | Yes | Yes |
| Account security details | No | No | Limited | Yes |
| Course and lesson metadata | Yes | Scoped | Yes | Yes |
| Published content | Yes | Scoped | Yes | Yes |
| Draft/internal content | No | No | Yes | Yes |
| Safe progress summaries | Yes | Scoped | Yes | Yes |
| Raw AIM mastery fields | No | No | Limited | Yes |
| Raw weakness fields | No | No | Limited | Yes |
| Raw difficulty adaptation fields | No | No | Limited | Yes |
| Raw retention fields | No | No | Limited | Yes |
| Recommendation explanations | Derived-safe | Derived-safe | Yes | Yes |
| AI Teacher final response | Yes | Scoped | Yes | Yes |
| AI Teacher prompt/system/context internals | No | No | Limited | Yes |
| Provider secrets and credentials | No | No | No | Yes |
| Runtime traces and stack traces | No | No | No | Yes |
| Authorization internals | No | No | Limited | Yes |

---

## Learner-Safe Fields

Learner-safe fields may be exposed to Flutter Mobile when the backend confirms ownership and authorization.

### Identity and Profile

| Field | Exposure | Notes |
|---|---|---|
| `user.id` | Learner-safe | Public backend user identifier or safe UID reference. |
| `user.display_name` | Learner-safe | Safe display name. |
| `user.avatar_url` | Learner-safe | Safe avatar URL if supported. |
| `user.role` | Learner-safe | Only safe role value such as `LEARNER`. |
| `profile.preferred_language` | Learner-safe | Use `LanguageCode` values such as `EN` or `AR`. |
| `profile.timezone` | Learner-safe | Needed for schedules/reminders. |
| `profile.learning_goal` | Learner-safe | User-facing learning goal. |

### Course and Lesson

| Field | Exposure | Notes |
|---|---|---|
| `course.id` | Learner-safe | Safe course identifier. |
| `course.title` | Learner-safe | Published course title. |
| `course.description` | Learner-safe | Published course description. |
| `course.language` | Learner-safe | Uses `LanguageCode`. |
| `chapter.id` | Learner-safe | Safe chapter identifier. |
| `chapter.title` | Learner-safe | Published chapter title. |
| `lesson.id` | Learner-safe | Safe lesson identifier. |
| `lesson.title` | Learner-safe | Published lesson title. |
| `lesson.type` | Learner-safe | Uses `LessonType`. |
| `lesson.estimated_duration_minutes` | Learner-safe | Approximate duration only. |
| `lesson.published_content` | Learner-safe | Published content only. |

### Session

| Field | Exposure | Notes |
|---|---|---|
| `session.id` | Learner-safe | Safe session identifier. |
| `session.status` | Learner-safe | Uses `SessionStatus`. |
| `session.started_at` | Learner-safe | Safe timestamp. |
| `session.completed_at` | Learner-safe | Safe timestamp if completed. |
| `session.current_lesson_id` | Learner-safe | Safe lesson reference. |
| `session.safe_summary` | Learner-safe | Backend-approved summary only. |
| `session.next_action` | Learner-safe | Uses backend-approved `RecommendationActionType`. |

### Assessment and Questions

| Field | Exposure | Notes |
|---|---|---|
| `question.id` | Learner-safe | Safe question identifier. |
| `question.type` | Learner-safe | Uses `QuestionType`. |
| `question.prompt` | Learner-safe | Published learner-facing prompt. |
| `question.choices` | Learner-safe | Only visible choices; do not include correctness flags. |
| `submission.id` | Learner-safe | Safe submission identifier. |
| `submission.status` | Learner-safe | Safe submission state if needed. |
| `submission.submitted_at` | Learner-safe | Safe timestamp. |
| `result.safe_score_label` | Learner-safe | Safe label only when backend-approved. |
| `result.safe_feedback` | Learner-safe | Backend-approved learner feedback. |

### Progress

| Field | Exposure | Notes |
|---|---|---|
| `progress.completed_lessons_count` | Learner-safe | Aggregate count only. |
| `progress.total_lessons_count` | Learner-safe | Aggregate count only. |
| `progress.percent_complete` | Learner-safe | Safe aggregate percentage. |
| `progress.current_streak_days` | Learner-safe | Safe engagement metric. |
| `progress.last_activity_at` | Learner-safe | Safe timestamp. |
| `progress.mastery_band` | Derived-safe | Uses `MasteryBand`; backend-approved only. |
| `progress.safe_strengths` | Derived-safe | Safe summary labels only. |
| `progress.safe_focus_areas` | Derived-safe | Safe summary labels only. |

### Notifications

| Field | Exposure | Notes |
|---|---|---|
| `notification.id` | Learner-safe | Safe notification identifier. |
| `notification.type` | Learner-safe | Uses `NotificationType`. |
| `notification.title` | Learner-safe | Safe title. |
| `notification.body` | Learner-safe | Safe message body. |
| `notification.created_at` | Learner-safe | Safe timestamp. |
| `notification.read_at` | Learner-safe | Safe timestamp or null. |

---

## Parent-Safe Fields

Parent-safe fields may be exposed only if parent access is enabled later and the backend verifies the parent-child relationship.

Parent access is optional and scoped. Parent access must not become a shortcut for internal AIM exposure.

### Parent-Safe Learner Overview

| Field | Exposure | Notes |
|---|---|---|
| `learner.id` | Parent-safe | Safe learner identifier. |
| `learner.display_name` | Parent-safe | Safe learner display name. |
| `learner.avatar_url` | Parent-safe | Safe avatar URL if supported. |
| `learner.current_course_title` | Parent-safe | Safe current course title. |
| `learner.progress_percent` | Parent-safe | Safe aggregate. |
| `learner.completed_lessons_count` | Parent-safe | Safe aggregate. |
| `learner.current_streak_days` | Parent-safe | Safe engagement metric. |
| `learner.last_activity_at` | Parent-safe | Safe timestamp. |
| `learner.safe_progress_summary` | Parent-safe | Backend-approved summary only. |
| `learner.safe_next_recommendation` | Parent-safe | Backend-approved safe recommendation summary only. |

### Parent-Safe Notifications

| Field | Exposure | Notes |
|---|---|---|
| `parent_update.type` | Parent-safe | Uses safe `NotificationType`, such as `PARENT_UPDATE`. |
| `parent_update.title` | Parent-safe | Safe title. |
| `parent_update.body` | Parent-safe | Safe body. |
| `parent_update.created_at` | Parent-safe | Safe timestamp. |

### Parent Restrictions

Parent clients must not receive:

- Raw mastery scores.
- Raw confidence scores.
- Raw weakness scores.
- Raw retention scores.
- Raw difficulty adaptation values.
- Raw frustration or emotional inference values.
- Hidden recommendation ranking internals.
- AI Teacher prompts or system messages.
- Full answer histories unless later explicitly approved.
- Sensitive learner free-text content unless later explicitly approved.
- Internal reviewer notes.
- Admin-only audit data.

---

## Admin-Safe Fields

Admin-safe fields may be exposed only to authorized internal users through the backend.

Admin access does not mean all internal fields are safe. Some fields remain backend-only or service-only.

### Admin Content Fields

| Field | Exposure | Notes |
|---|---|---|
| `content.status` | Admin-safe | Uses `ContentStatus`. |
| `content.created_by` | Admin-safe | Internal author reference. |
| `content.updated_by` | Admin-safe | Internal editor reference. |
| `content.review_status` | Admin-safe | Uses `ReviewStatus`. |
| `content.version` | Admin-safe | Safe version number. |
| `content.review_notes` | Admin-safe | Internal only; not learner/parent safe. |

### Admin Review Fields

| Field | Exposure | Notes |
|---|---|---|
| `review.id` | Admin-safe | Safe review identifier for internal workflow. |
| `review.status` | Admin-safe | Uses `ReviewStatus`. |
| `review.assignee_id` | Admin-safe | Internal user reference. |
| `review.created_at` | Admin-safe | Safe timestamp. |
| `review.resolved_at` | Admin-safe | Safe timestamp. |
| `review.safe_context` | Admin-safe | Redacted context only. |

### Admin AIM Fields

Admin Dashboard may show selected AIM output summaries only when there is a backend-approved operational reason.

| Field | Exposure | Notes |
|---|---|---|
| `aim.safe_summary` | Admin-safe | Backend-approved summary. |
| `aim.safe_recommendation` | Admin-safe | Backend-approved recommendation. |
| `aim.pipeline_status` | Admin-safe | High-level status only. |
| `aim.model_version_label` | Admin-safe | Safe label only, not secrets or provider internals. |

Admin Dashboard must not expose raw sensitive AIM internals unless a later approved internal diagnostics contract explicitly allows them.

---

## Internal-Only Fields

Internal-only fields may exist in Backend API, AIM Engine, database, logs, and service-to-service contracts. They must not be returned directly to learner or parent clients.

### Raw AIM Fields

| Field | Exposure | Notes |
|---|---|---|
| `mastery_score` | Internal-only | Raw mastery calculation. |
| `confidence_score` | Internal-only | Internal confidence signal. |
| `weakness_score` | Internal-only | Internal weakness signal. |
| `retention_score` | Internal-only | Internal retention signal. |
| `difficulty_score` | Internal-only | Internal difficulty calculation. |
| `current_difficulty` | Internal-only | Raw adaptive difficulty state unless mapped to safe label. |
| `difficulty_delta` | Internal-only | Internal adaptation value. |
| `recommendation_rank` | Internal-only | Internal ranking detail. |
| `recommendation_score` | Internal-only | Internal scoring value. |
| `hesitation_index` | Internal-only | Internal behavior signal. |
| `retry_rate` | Internal-only | Internal behavior signal. |
| `consistency_score` | Internal-only | Internal behavior signal. |
| `frustration_score` | Internal-only | Internal affective signal. |
| `emotional_state_raw` | Internal-only | Raw emotional inference. |
| `retention_due_at` | Internal-only | Internal scheduling calculation unless safely summarized. |
| `next_review_interval` | Internal-only | Internal retention scheduling. |

### AIM Pipeline Fields

| Field | Exposure | Notes |
|---|---|---|
| `performance_analyzer_output` | Internal-only | Raw analysis output. |
| `mastery_calculator_output` | Internal-only | Raw mastery output. |
| `weakness_detector_output` | Internal-only | Raw weakness output. |
| `difficulty_adapter_output` | Internal-only | Raw difficulty output. |
| `recommendation_engine_output` | Internal-only | Raw recommendation engine output. |
| `retention_tracker_output` | Internal-only | Raw retention output. |
| `emotional_state_detector_output` | Internal-only | Raw emotional/affective output. |
| `error_pattern_classifier_output` | Internal-only | Internal classification output. |

### AI Teacher Internal Fields

| Field | Exposure | Notes |
|---|---|---|
| `system_prompt` | Internal-only | Never expose to learner/parent. |
| `developer_prompt` | Internal-only | Never expose to learner/parent. |
| `retrieved_context` | Internal-only | May contain internal content/context. |
| `provider_request` | Internal-only | Provider payload. |
| `provider_response_raw` | Internal-only | Raw provider output. |
| `safety_validator_trace` | Internal-only | Internal safety details. |
| `fallback_reason_internal` | Internal-only | Internal fallback reason. |
| `token_usage` | Internal-only | Operational/cost metric. |
| `provider_latency_ms` | Internal-only | Operational metric. |
| `model_id_internal` | Internal-only | Provider/model internal value unless mapped to safe label. |

### Auth and Authorization Internals

| Field | Exposure | Notes |
|---|---|---|
| `jwt_payload_raw` | Internal-only | Never expose raw token payload. |
| `auth_provider_subject` | Internal-only | Provider-level subject. |
| `role_resolution_trace` | Internal-only | Internal role resolution. |
| `ownership_check_trace` | Internal-only | Internal ownership resolution. |
| `permission_matrix` | Internal-only | Internal authorization policy. |
| `rls_policy_trace` | Internal-only | Database policy internals. |

---

## Forbidden Client Fields

Forbidden client fields must not be exposed to Flutter Mobile, parent clients, or public-facing clients. Many are also forbidden from Admin Dashboard unless a later internal diagnostics contract explicitly allows them.

| Field Category | Examples |
|---|---|
| Secrets and credentials | API keys, service-role keys, provider tokens, private keys, connection strings |
| Runtime traces | Stack traces, raw exception objects, framework errors, SQL errors |
| Storage internals | Table names, raw query plans, internal IDs not intended for clients |
| Provider internals | AI provider raw payloads, raw model responses, provider request metadata |
| Raw AIM calculations | mastery, weakness, retention, difficulty, frustration, confidence raw values |
| Raw behavioral signals | hesitation index, retry rate, consistency score, speed-derived internals |
| Authorization internals | role resolution traces, ownership traces, permission matrices |
| Safety internals | prompt injection traces, safety validator internals, hidden policy details |
| Review internals | reviewer private notes, escalation reasons, internal dispute commentary |

---

## AIM Output Exposure Rules

AIM outputs must be mediated by Backend API before reaching any client.

### Allowed Learner AIM Outputs

| Output | Exposure | Rule |
|---|---|---|
| `safe_feedback` | Learner-safe | Short feedback approved by backend. |
| `safe_progress_summary` | Learner-safe | No raw AIM scores. |
| `mastery_band` | Derived-safe | Uses safe `MasteryBand`; no numeric score. |
| `safe_next_action` | Learner-safe | Uses safe `RecommendationActionType`. |
| `safe_focus_areas` | Derived-safe | Human-readable labels only. |
| `safe_strengths` | Derived-safe | Human-readable labels only. |

### Forbidden Learner AIM Outputs

Learner clients must not receive:

- `mastery_score`
- `confidence_score`
- `weakness_score`
- `retention_score`
- `difficulty_score`
- `difficulty_delta`
- `recommendation_score`
- `recommendation_rank`
- `hesitation_index`
- `retry_rate`
- `consistency_score`
- `frustration_score`
- `emotional_state_raw`
- raw detector/classifier output
- raw pipeline stage outputs

### Speed Rule

Speed may be used internally as one signal only when approved by the AIM Engine logic.

Speed must not directly raise:

- learner level
- mastery
- difficulty
- recommendations

No client may calculate mastery, difficulty, weakness, retention, or recommendations from speed.

---

## AI Teacher Exposure Rules

AI Teacher output must be mediated by Backend API.

### Allowed AI Teacher Fields

| Field | Exposure | Rule |
|---|---|---|
| `message.id` | Learner-safe | Safe message identifier. |
| `message.role` | Learner-safe | Safe conversational role such as assistant/user. |
| `message.content` | Learner-safe | Final safety-filtered assistant message only. |
| `message.created_at` | Learner-safe | Safe timestamp. |
| `conversation.id` | Learner-safe | Safe conversation identifier. |
| `conversation.lesson_id` | Learner-safe | Safe lesson reference. |
| `fallback_message` | Learner-safe | Safe fallback message only. |

### Forbidden AI Teacher Fields

Clients must not receive:

- system prompts
- developer prompts
- provider payloads
- raw retrieved context
- raw provider responses
- internal safety traces
- prompt injection analysis
- provider credentials
- token/cost internals
- hidden moderation decisions
- internal fallback reasons

---

## Parent Exposure Rules

Parent surfaces may receive only backend-approved summaries.

Parent-safe outputs must be:

- scoped to the verified learner relationship
- summarized
- learner-safe
- non-diagnostic
- non-punitive
- free from raw AIM internals
- free from AI Teacher internals

Parent-safe summaries may say:

- “Needs more practice in vocabulary.”
- “Completed 3 lessons this week.”
- “Recommended next: review previous skill.”
- “On track this week.”

Parent-safe summaries must not say:

- raw weakness score
- raw frustration score
- hidden emotional classification
- raw mastery percentage unless later approved
- raw retention model output
- raw AI Teacher internal reasoning
- private reviewer notes

---

## Admin Exposure Rules

Admin Dashboard may show more operational context than learner or parent clients, but only after backend authorization.

Admin Dashboard must still not expose:

- secrets
- private keys
- provider credentials
- production connection strings
- raw stack traces in normal UI
- learner-sensitive raw data without purpose
- hidden AIM internals unless explicitly allowed by a later diagnostics contract

Admin views should prefer:

- safe summaries
- redacted context
- status labels
- audit-safe event labels
- backend-approved operational fields

---

## Error and Missing Field Rules

If a field is hidden, clients must not infer hidden internal state.

Clients must not treat a missing field as:

- proof of low mastery
- proof of weakness
- proof of retention risk
- proof of frustration
- proof of a permission policy
- proof that a hidden resource exists

Error responses must follow `packages/shared-contracts/api/errors.md`.

## API Response Rules

Backend API response DTOs must be designed around surface-specific exposure.

Recommended future DTO grouping:

| DTO Type | Purpose |
|---|---|
| `Learner*Response` | Learner-safe fields only. |
| `Parent*Response` | Parent-safe scoped summaries only. |
| `Admin*Response` | Admin-safe fields only. |
| `Internal*Contract` | Service-to-service/internal fields only. |

Rules:

- Do not reuse internal contracts as client responses.
- Do not expose database rows directly.
- Do not expose AIM Engine raw output directly.
- Do not expose AI Teacher provider output directly.
- Do not expose hidden fields and ask clients to ignore them.

## Logging and Audit Rules

Logs may contain internal details only when needed and safe.

Logs must not expose to clients:

- runtime traces
- secrets
- provider payloads
- hidden AIM calculations
- authorization internals
- prompt internals

Audit event outputs must be redacted before any admin display.

## Non-Goals

This document does not:

- Implement DTOs.
- Implement serializers.
- Implement API guards.
- Implement RLS policies.
- Implement Flutter models.
- Implement Admin Dashboard models.
- Implement AIM Engine models.
- Implement AI Teacher runtime logic.
- Implement parent dashboard workflows.
- Add Student Web App scope.

## Acceptance Notes

- Learner-safe fields are listed.
- Parent-safe fields are listed for possible future parent access.
- Admin/internal fields are listed.
- Forbidden client fields are listed.
- AIM outputs are explicitly covered.
- AI Teacher fields are explicitly covered.
- Internal AIM fields are clearly blocked from learner and parent surfaces.
- Backend remains authoritative for field exposure.
- No runtime code was added.
- No database migration was added.
- No client AIM logic was added.
- No Student Web App work was added.

## Related Documents

- `packages/shared-contracts/README.md`
- `packages/shared-contracts/enums/common-enums.md`
- `packages/shared-contracts/api/response-envelope.md`
- `packages/shared-contracts/api/errors.md`
- `docs/phase-1/system-foundation-charter.md`
- `docs/phase-1/open-decisions.md`
- `docs/tasks/phase_1_task_prompts.md`
