# AIM Session Data Capture

## Purpose

This document defines every data point captured during an AIM learner session, including lesson events, question attempts, session lifecycle events, behavioral evidence, AI Teacher invocation metadata, and AIM Engine analytics inputs.

It is the canonical planning reference for backend engineering, AIM Engine integration, analytics, reporting, and Flutter Mobile learner-session behavior in post-MVP Phase 1.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AIM Engine algorithms.
- AI Teacher Gateway code.
- Admin dashboard runtime code.
- A separate Student Web App.

All skill IDs reference `docs/learning/english-skill-tree.md`. All AIM Engine inputs reference `docs/aim-engine/boundary-and-io-contract.md`. Student journey context references `docs/journeys/student-journey.md`.

## Current Product Direction

| Area | Confirmed Direction |
|---|---|
| Completed MVP pilot learner interface | React Web |
| Completed MVP pilot backend API | FastAPI |
| Completed MVP pilot AIM Engine | Python backend AIM Engine |
| Completed MVP pilot database | Supabase PostgreSQL |
| Completed MVP pilot auth | Supabase Auth |
| Post-MVP Phase 1 learner client | Flutter Mobile |
| Post-MVP Phase 1 Backend API | NestJS + TypeScript |
| Post-MVP Phase 1 AIM Engine | Python AIM Engine as a backend service/module |
| Post-MVP Phase 1 database/auth | Supabase PostgreSQL/Auth unless changed by a later documented decision |
| Post-MVP Student Web App | No separate Student Web App is planned unless a later documented product decision changes this |

## Phase Clarification

The completed MVP pilot used React Web and FastAPI.

Post-MVP Phase 1 uses Flutter Mobile and NestJS + TypeScript.

The same backend-owned data capture contract applies to all clients. Flutter Mobile, completed React Web pilot surfaces, admin UI surfaces, and any future clients may collect and submit session evidence, but they must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for data/AIM/client guardrails. |
| P0-005 | `docs/journeys/student-journey.md` | Present. Defines session stages, attempt events, and adaptive result flow captured here. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Present. Defines AIM Engine input contracts populated from captured data. |
| P0-016 | `docs/data/initial-data-model.md` | Checked for entity and relationship mapping. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for session and attempt API flow. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for privacy and safe-use rules. |

## Data Capture Overview

Data captured during a session is organized into five categories.

| Category | Description | Primary Consumer |
|---|---|---|
| Session Lifecycle | Session start, end, status, and timing events | Backend, AIM Engine, Analytics |
| Question Attempt | Per-question interaction evidence | Backend, AIM Engine, Analytics |
| Behavioral Evidence | Derived educational behavior signals from attempt patterns | AIM Engine |
| AI Teacher Invocation | AI Teacher interaction metadata within a session | Backend, AIM Engine, Safety Review |
| Content and Quality Signals | Question and lesson metadata captured alongside attempts | AIM Engine, Human Reviewer, Content Manager |

## Category 1 — Session Lifecycle

Captured once per session at start and at end.

### Session Start Record

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | UUID | Yes | Unique identifier for this session. |
| `student_id` | UUID | Yes | Student who owns this session. |
| `lesson_id` | UUID | Yes | Lesson being practiced. |
| `started_at` | datetime UTC ISO 8601 | Yes | Wall-clock time when the learner entered the session. |
| `session_type` | enum | Yes | One of `intro`, `skill_practice`, `review`, `remediation`, `placement`. |
| `device_class` | enum | No | One of `mobile`, `tablet`, `desktop`, `unknown`. Used for session quality context only. Not used as mastery or adaptive logic. |
| `time_of_day_bucket` | enum | Yes | Derived from `started_at` and learner timezone. Used as behavioral context only. |
| `timezone_offset_minutes` | int | No | Learner timezone offset in minutes from UTC. |
| `assigned_difficulty_band` | int | Yes | Difficulty band assigned by backend AIM recommendation. |
| `prerequisite_skills_met` | bool | Yes | Whether required prerequisites were satisfied at session start. |

### Session End Record

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | UUID | Yes | Matches session start `session_id`. |
| `completed_at` | datetime UTC ISO 8601 | Yes | Wall-clock time when session ended, was submitted, abandoned, or timed out. |
| `completion_status` | enum | Yes | One of `completed`, `abandoned`, `partial`. |
| `total_time_seconds` | int | Yes | Wall time from `started_at` to `completed_at`. |
| `active_time_seconds` | int | No | Estimated active engagement time, excluding idle/background gaps where supported. |
| `blocks_completed` | int | Yes | Number of lesson blocks reached before session end. |
| `total_questions_served` | int | Yes | Total questions delivered in the session. |
| `total_questions_answered` | int | Yes | Questions where the learner submitted at least one answer. |
| `total_questions_skipped` | int | Yes | Questions skipped without an attempt. |
| `early_exit_flag` | bool | Yes | True if session ended with fewer than the minimum useful evidence threshold. Educational behavior evidence only. |
| `remediation_triggered` | bool | Yes | Whether a remediation block was served. |
| `ai_teacher_invocations` | int | Yes | Count of AI Teacher calls during the session. |

## Category 2 — Question Attempt

One record per question interaction during a session. A learner may have multiple attempt records for the same question if retries occur.

| Field | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | UUID | Yes | Unique identifier for this attempt record. |
| `session_id` | UUID | Yes | Parent session. |
| `student_id` | UUID | Yes | Student who owns the attempt. |
| `question_id` | UUID | Yes | Presented question. |
| `skill_id` | UUID | Yes | Primary assessed skill. |
| `concept_id` | UUID or null | No | Sub-concept within the skill, if content metadata provides it. |
| `question_difficulty` | int | Yes | Difficulty level assigned by content/backend. |
| `session_position` | int | Yes | 1-indexed question position inside the session. |
| `attempt_number` | int | Yes | 1-indexed attempt number for this question. |
| `submitted_answer` | string or null | Yes | Raw submitted answer. Null if skipped. |
| `is_correct` | bool or null | Yes | Correctness after validation. Null if skipped. |
| `response_time_seconds` | int | Yes | Time from question display to answer submission. Captured as educational behavior evidence only. |
| `hint_used` | bool | Yes | Whether learner used a hint. |
| `skip_flag` | bool | Yes | Whether learner skipped the question. |
| `answer_changed_flag` | bool | Yes | Whether learner changed answer before submission. |
| `retry_flag` | bool | Yes | Whether this attempt is a retry. |
| `ai_teacher_invoked_before_attempt` | bool | Yes | Whether AI Teacher help was used before this attempt. |
| `recorded_at` | datetime UTC ISO 8601 | Yes | Timestamp when attempt was recorded. |

## Response Time Handling Rules

Response time is captured as educational behavior evidence only.

Response time, average response time, and speed score must not:

- Directly calculate mastery.
- Directly change student level.
- Directly increase difficulty.
- Penalize slow correct learners.
- Reward fast guessing.
- Replace correctness, consistency, retention, difficulty performance, or evidence quality.
- Be shown to learners as a performance, intelligence, or mastery metric.

Response time may inform backend-owned educational behavior signals such as:

- hesitation signal
- sudden slowdown signal
- rushing signal
- possible guessing signal
- fatigue or distraction signal
- low confidence signal
- session quality context

## Category 3 — Behavioral Evidence

Derived signals are computed from attempt data within or after a session. They are backend/AIM Engine signals and must not be treated as clinical or diagnostic indicators.

| Signal | Derivation Rule | Stored At |
|---|---|---|
| `hesitation_index` | Count of questions where `response_time_seconds > 2x session_avg_response_time` divided by `total_questions_answered`. | Session end record |
| `sudden_slowdown_flag` | True if `session_avg_response_time > 1.5x student_historical_avg_response_time` for this skill. | Session end record |
| `rushing_flag` | True if more than 30% of incorrect attempts had `response_time_seconds < 0.2x session_avg_response_time`. | Session end record |
| `early_exit_flag` | True if session ended before useful evidence threshold. | Session end record |
| `repeated_errors_flag` | True if learner made repeated incorrect attempts on related concepts. | Session end record |
| `frustration_score_contribution` | Educational behavior contribution from repeated errors, slowdown, early exit, and other approved evidence. | Session end record |

### Behavioral Evidence Boundary Rules

- Behavioral evidence supports educational adaptation only.
- Behavioral evidence must not be used for clinical, medical, psychological, or diagnostic claims.
- `frustration_score_contribution` is a session-level contribution, not a diagnosis.
- AIM Engine may smooth and weight behavioral evidence backend-side.
- Learners and parents must not see raw behavioral scores.
- Admin/internal views may use operational labels only, such as "High frustration signal."

## Category 4 — AI Teacher Invocation

One record per AI Teacher interaction during a session. A session may have zero or many.

| Field | Type | Required | Description |
|---|---|---|---|
| `invocation_id` | UUID | Yes | Unique identifier for this AI Teacher call. |
| `session_id` | UUID | Yes | Parent session. |
| `student_id` | UUID | Yes | Student who owns the session. |
| `lesson_id` | UUID | Yes | Current lesson. |
| `skill_id` | UUID | Yes | Skill targeted by the AI Teacher interaction. |
| `question_id` | UUID or null | No | Question active when AI Teacher was invoked, if applicable. |
| `hook_type` | enum | Yes | One of `explain_more`, `give_example`, `explain_step`, `explain_why`, `retry_with_help`. |
| `invocation_position_in_session` | int | Yes | Count of AI Teacher calls in this session at invocation time. |
| `attempt_result_after` | bool or null | No | Whether learner answered correctly after this interaction. |
| `response_time_after_seconds` | int or null | No | Response time after invocation, if a follow-up attempt occurred. |
| `invoked_at` | datetime UTC ISO 8601 | Yes | When AI Teacher was invoked. |

### AI Teacher Capture Rules

- Flutter Mobile and other clients call only the Backend API.
- Clients never call AI providers directly.
- Clients never store AI provider keys.
- Backend records invocation metadata.
- Backend controls AI Teacher Gateway and provider prompts.
- Raw provider prompts and privileged credentials are never exposed to clients.

## Category 5 — Content and Quality Signals

Metadata captured alongside attempts to support content quality review, question flagging, and fairness auditing.

| Field | Type | Captured At | Description |
|---|---|---|---|
| `question_version_id` | UUID | Per attempt | Question version at presentation time. |
| `question_type` | enum | Per attempt | Example values: `multiple_choice`, `fill_blank`, `true_false`, `reorder`, `match`. |
| `common_error_tag` | string or null | Per incorrect attempt | Predefined error category from question metadata. |
| `question_quality_flag` | bool | Post-session backend | Set if question attempt patterns suggest content quality issue. |
| `session_quality_flag` | bool | Session end | Set if session evidence is too weak or unreliable. |
| `fairness_audit_flag` | bool | Session end | Set if attempt record may not reflect true learner ability. |

## Data Flow Summary

| Data Source | Flows Into | Notes |
|---|---|---|
| Session start record | Backend session store, AIM Engine input | Session metadata required by AIM Engine. |
| Question attempt records | Backend attempt store, AIM Engine input | Main practice evidence. |
| Behavioral evidence | AIM Engine state update | Educational behavior signals only. |
| AI Teacher invocation records | Backend audit, AIM Engine input | Helps detect help-dependence and support needs. |
| Content and quality signals | Human reviewer queue, admin/internal views | Supports content audit and quality management. |
| Session end record | AIM Engine input, analytics, admin/internal reporting | Used for completion and session quality. |

## Learner-Safe Rules for Data Use

| Rule | Detail |
|---|---|
| Response time is behavior evidence only | It must not directly increase difficulty, reduce mastery, change student level, or be shown as a performance metric. |
| Frustration signals are educational only | They support safer, more supportive adaptation. They are not clinical diagnoses. |
| No clinical or diagnostic labels | Data capture must not produce labels such as disorder, anxiety, disability, or diagnosis. |
| Learners must not see raw behavioral data | Learners see safe feedback translations, not raw internal scores. |
| Parents must not see raw behavioral data | Parent views, if approved, show summary-only progress. |
| Audit data is scoped | AIM audit fields are accessible only to authorized internal roles. |
| Clients do not calculate AIM state | Clients submit evidence and render backend-approved outputs only. |

## Storage and Retention Notes

These are planning-level notes. Actual schema, indexing, partitioning, and retention policy implementation belongs to Phase 1 backend engineering.

| Data Category | Expected Volume | Retention Note |
|---|---|---|
| Session lifecycle records | 1 per session per student | Retained for longitudinal analytics according to final retention policy. |
| Question attempt records | 10–30 per session | High volume; may require indexing or partitioning later. |
| Behavioral evidence records | 1 per session | Stored with session end or related behavior table. |
| AI Teacher invocation records | 0–10 per session | Retained for quality audit and AIM Engine state update according to privacy policy. |
| Content quality signals | 1 per attempt or derived event | Retained for content management and review. |

## Non-Goals

This document does not:

- Implement database tables or migrations.
- Create a Student Web App.
- Implement Flutter Mobile data collection.
- Implement React Web data collection.
- Implement backend API endpoints.
- Implement AIM Engine algorithms.
- Define final retention periods or deletion workflows.
- Move AIM Engine logic into any client.
- Allow clients to calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- The same backend-owned session evidence contract applies to completed React Web pilot surfaces, Flutter Mobile, admin/internal surfaces, and any future clients.
- Response time is captured server-side when possible or treated as approximate when client-reported.
- Skipped questions are recorded with `submitted_answer = null`, `is_correct = null`, and `skip_flag = true`.
- A session with `completion_status = abandoned` still stores all attempt records captured before exit.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Open Questions

| Question | Current Handling |
|---|---|
| Should idle time within a session be subtracted from `response_time_seconds`? | Open. Early Phase 1 may capture wall-clock response time; idle exclusion can be added later. |
| Should `device_class` affect AIM Engine logic? | No. It is captured for diagnostics/session quality only. |
| How many retries on a single question should be allowed before forcing a skip? | Defer to lesson content structure and frontend session rules. |
| Should question order within a session be randomized or fixed? | Defer to lesson content structure and session design. |
| Should AI Teacher invocations beyond a threshold pause the session? | AIM Engine can flag high invocation count; UI behavior is a frontend/product decision. |
| What exact retention periods apply to session and attempt data? | Open for security/privacy implementation planning. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/journeys/student-journey.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/learning/english-skill-tree.md`
- `docs/content/lesson-content-structure.md`
- `docs/product/roles-and-permissions.md`
- `docs/data/initial-data-model.md`
- `docs/api/api-planning-baseline.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/analytics/reports-scope.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-005, P0-014, P0-016, P0-017, and P0-022.
- This document defines five capture categories: session lifecycle, question attempt, behavioral evidence, AI Teacher invocation, and content/quality signals.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
