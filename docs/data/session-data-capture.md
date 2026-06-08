# AIM Session Data Capture

## Purpose

This document defines every data point captured during a student learning session — covering lesson events, question attempts, session lifecycle, behavioral signals, and AIM Engine analytics inputs. It is the canonical reference for backend engineering, AIM Engine integration, analytics, and reporting during Phase 1 and beyond.

## Scope

Phase 0 planning documentation only. No backend code, database migrations, AIM Engine algorithms, Flutter code, or API implementation is produced here. All skill IDs reference `docs/learning/english-skill-tree.md`. All AIM Engine inputs reference `docs/aim-engine/boundary-and-io-contract.md`. Student journey context references `docs/journeys/student-journey.md`.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-005 | `docs/journeys/student-journey.md` | Present. Defines session stages, attempt events, and adaptive result flow captured here. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Present. Defines AIM Engine input contracts that are populated from the data captured here. |

---

## Data Capture Overview

Data captured during a session is organized into five categories:

| Category | Description | Primary Consumer |
|---|---|---|
| Session Lifecycle | Session start, end, status, and timing events | Backend, AIM Engine, Analytics |
| Question Attempt | Per-question interaction evidence | AIM Engine, Analytics |
| Behavioral Signals | Inferred signals from attempt patterns | AIM Engine |
| AI Teacher Invocation | AI Teacher interaction metadata within a session | AIM Engine |
| Content and Quality Signals | Question and lesson metadata captured alongside attempts | AIM Engine, Human Reviewer |

---

## Category 1 — Session Lifecycle

Captured once per session at start and at end (complete, abandoned, or partial).

### Session Start Record

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | UUID | Yes | Unique identifier for this session. |
| `student_id` | UUID | Yes | The student this session belongs to. |
| `lesson_id` | UUID | Yes | The lesson being practiced. |
| `started_at` | datetime (UTC ISO 8601) | Yes | Wall-clock time when the student entered the session. |
| `session_type` | enum | Yes | One of: `intro`, `skill_practice`, `review`, `remediation`, `placement`. |
| `device_class` | enum | No | One of: `mobile`, `tablet`, `desktop`, `unknown`. Used for session quality context only. Not used in mastery or adaptive logic. |
| `time_of_day_bucket` | enum | Yes | One of: `morning` (05:00–11:59), `afternoon` (12:00–16:59), `evening` (17:00–20:59), `night` (21:00–04:59). Derived from `started_at` and student timezone. Used as behavioral context only. |
| `timezone_offset_minutes` | int | No | Student timezone offset in minutes from UTC. Supports correct `time_of_day_bucket` derivation. |
| `assigned_difficulty_band` | int (1–4) | Yes | Difficulty band the session was assigned by AIM Engine recommendation. |
| `prerequisite_skills_met` | bool | Yes | Whether all prerequisite skills for this lesson's target skill were at mastery ≥ 0.7 at session start. |

### Session End Record

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | UUID | Yes | Matches session start `session_id`. |
| `completed_at` | datetime (UTC ISO 8601) | Yes | Wall-clock time when session ended (submitted, abandoned, or timed out). |
| `completion_status` | enum | Yes | One of: `completed`, `abandoned`, `partial`. |
| `total_time_seconds` | int | Yes | Wall time from `started_at` to `completed_at`. |
| `active_time_seconds` | int | No | Estimated active engagement time, excluding idle or background gaps. |
| `blocks_completed` | int | Yes | Number of lesson blocks the student reached before session end. |
| `total_questions_served` | int | Yes | Total questions delivered in the session. |
| `total_questions_answered` | int | Yes | Questions where the student submitted at least one answer. |
| `total_questions_skipped` | int | Yes | Questions skipped without any attempt. |
| `early_exit_flag` | bool | Yes | True if session ended with fewer than 10 questions answered. Behavioral signal for frustration detection. |
| `remediation_triggered` | bool | Yes | Whether a remediation block was served during the session. |
| `ai_teacher_invocations` | int | Yes | Total count of AI Teacher calls made during the session. |

---

## Category 2 — Question Attempt

One record per question interaction during a session. A student may have multiple attempt records for the same question if retries occur.

| Field | Type | Required | Description |
|---|---|---|---|
| `attempt_id` | UUID | Yes | Unique identifier for this attempt record. |
| `session_id` | UUID | Yes | Parent session. |
| `student_id` | UUID | Yes | |
| `question_id` | UUID | Yes | The question presented. |
| `skill_id` | UUID | Yes | The primary skill this question assesses. References `english-skill-tree.md`. |
| `concept_id` | UUID or null | No | Sub-concept within the skill, if content metadata provides it. |
| `question_difficulty` | int (1–4) | Yes | Difficulty level assigned to this question in the content bank. |
| `session_position` | int | Yes | 1-indexed position of this question within the session. Supports early-session vs. late-session pattern analysis. |
| `attempt_number` | int | Yes | 1-indexed attempt number for this question within the session. 1 = first try, 2 = first retry, etc. |
| `submitted_answer` | string or null | Yes | The raw answer the student submitted. Null if skipped. Stored as text regardless of question type. |
| `is_correct` | bool or null | Yes | True if answer matches accepted correct answer(s). Null if skipped. |
| `response_time_seconds` | int | Yes | Time in seconds from question display to answer submission for this attempt. Captured as behavioral evidence only. |
| `hint_used` | bool | Yes | Whether the student used the hint for this attempt. |
| `skip_flag` | bool | Yes | Whether the student skipped this question without answering. |
| `answer_changed_flag` | bool | Yes | Whether the student changed their answer in the final 10% of their response time for this attempt. Behavioral signal for self-doubt or review. |
| `retry_flag` | bool | Yes | Whether this attempt is a retry (attempt_number > 1). |
| `ai_teacher_invoked_before_attempt` | bool | Yes | Whether the student invoked AI Teacher before submitting this attempt. |
| `recorded_at` | datetime (UTC ISO 8601) | Yes | Timestamp when this attempt was submitted and recorded. |

### Response Time Handling Rules

Response time is captured as a behavioral evidence field only. It must not:

- Directly calculate mastery.
- Increase difficulty on its own.
- Penalize a slow correct learner's mastery score.

Response time may inform:

- Hesitation Index: proportion of questions where `response_time_seconds > 2× session average`.
- Sudden Slowdown Signal: current session average vs. student historical average (frustration signal).
- Rushing Signal: `response_time_seconds < 20% of session average` on incorrect answers (potential overconfidence or guessing signal).

---

## Category 3 — Behavioral Signals

Derived signals computed from attempt data within or after a session. These are not raw captures but are listed here as they are produced during session processing and stored alongside session records.

| Signal | Derivation Rule | Stored At |
|---|---|---|
| `hesitation_index` | Count of questions where `response_time_seconds > 2× session_avg_response_time` divided by `total_questions_answered`. | Session end record. |
| `sudden_slowdown_flag` | True if `session_avg_response_time > 1.5× student_historical_avg_response_time` for this skill. | Session end record. |
| `rushing_flag` | True if more than 30% of incorrect attempts had `response_time_seconds < 0.2× session_avg_response_time`. | Session end record. |
| `early_exit_flag` | True if session ended before 10 questions were answered. | Session end record. Already defined in Category 1. |
| `repeated_errors_flag` | True if the student made 3 or more consecutive incorrect attempts on questions previously answered correctly in a prior session. | Session end record. |
| `frustration_score_contribution` | `(repeated_errors_flag × 0.4) + (sudden_slowdown_flag × 0.3) + (early_exit_flag × 0.3)`. Each flag is 0 or 1. Range: 0.0–1.0. | Session end record. Fed into AIM Engine frustration state update. |

### Frustration Score Boundary Rules

- The `frustration_score_contribution` value captured here is a session-level contribution, not the final student frustration state.
- The AIM Engine maintains the cumulative `frustration_score` per student per skill in `StudentSkillState`.
- This session contribution is one input to the AIM Engine's state update. The engine applies its own smoothing and weighting rules.

---

## Category 4 — AI Teacher Invocation

One record per AI Teacher interaction during a session. A session may have zero or many.

| Field | Type | Required | Description |
|---|---|---|---|
| `invocation_id` | UUID | Yes | Unique identifier for this AI Teacher call. |
| `session_id` | UUID | Yes | |
| `student_id` | UUID | Yes | |
| `lesson_id` | UUID | Yes | |
| `skill_id` | UUID | Yes | Skill targeted by the AI Teacher interaction. |
| `question_id` | UUID or null | No | Question the student was on when they invoked AI Teacher, if applicable. |
| `hook_type` | enum | Yes | One of: `explain_more`, `give_example`, `explain_step`, `explain_why`, `retry_with_help`. |
| `invocation_position_in_session` | int | Yes | 1-indexed count of AI Teacher calls in this session at the time of this invocation. |
| `attempt_result_after` | bool or null | Yes | Whether the student answered correctly after this interaction. Null if no follow-up attempt was made. |
| `response_time_after_seconds` | int or null | No | Student response time after this invocation, if a follow-up attempt occurred. |
| `invoked_at` | datetime (UTC ISO 8601) | Yes | When the AI Teacher was invoked. |

---

## Category 5 — Content and Quality Signals

Metadata captured alongside attempts to support content quality review, question flagging, and fairness auditing.

| Field | Type | Captured At | Description |
|---|---|---|---|
| `question_version_id` | UUID | Per attempt | Version of the question at time of presentation. Supports content quality audit when a question is edited. |
| `question_type` | enum | Per attempt | One of: `multiple_choice`, `fill_blank`, `true_false`, `reorder`, `match`. |
| `common_error_tag` | string or null | Per attempt (incorrect only) | Predefined error category tag from question metadata. Used in error pattern classification. |
| `question_quality_flag` | bool | Post-session (backend) | Set by backend if the question's attempt data in this session shows outlier patterns (e.g., all students answered correctly in under 3 seconds, suggesting too easy, or all students skipped). |
| `session_quality_flag` | bool | Session end | Set by backend if session data shows reliability issues (too few attempts, high skip rate, or suspicious timing). |
| `fairness_audit_flag` | bool | Session end | Set by backend if behavioral patterns suggest the attempt record may not reflect the learner's true ability (e.g., all skips, suspiciously uniform timings). |

---

## Data Flow Summary

The table below shows how captured data flows from the student session into backend systems.

| Data Source | Flows Into | Notes |
|---|---|---|
| Session start record | Backend session store, AIM Engine input | Session metadata required by AIM Engine Input 2 (Lesson Session Result). |
| Question attempt records | Backend attempt store, AIM Engine input | `practice_results` array in AIM Engine Input 2. |
| Behavioral signals (derived) | AIM Engine state update | Fed as `frustration_score_contribution`, `hesitation_index`, behavioral flags. |
| AI Teacher invocation records | AIM Engine input | AIM Engine Input 3 (AI Teacher Interaction Result). |
| Content and quality signals | Human Reviewer queue, Admin dashboard | Not sent directly to AIM Engine. Used for content audit and quality management. |
| Session end record | AIM Engine input, Analytics, Admin | `completion_status`, `total_time_seconds`, `blocks_completed`, `ai_teacher_invocations` map to AIM Engine Input 2. |

---

## Learner-Safe Rules for Data Use

The following rules govern how captured data may be interpreted and surfaced:

| Rule | Detail |
|---|---|
| Response time is behavioral evidence only | It must not directly increase difficulty, reduce mastery, or be shown to the student as a performance metric. |
| Frustration signals are educational only | They are used to trigger safer, supportive adaptive decisions. They are not clinical diagnoses. |
| No clinical or diagnostic labels | Data capture must not produce labels such as attention disorder, anxiety, or learning disability. |
| Learners must not see raw behavioral data | Students see learner-safe feedback translations, not raw `frustration_score_contribution` or `hesitation_index` values. |
| Audit data is scoped | AIM audit fields are accessible to internal roles only as defined in `docs/product/roles-and-permissions.md`. |

---

## Storage and Retention Notes

These are planning-level notes. Actual schema, indexing, partitioning, and retention policy implementation belongs to Phase 1 backend engineering.

| Data Category | Expected Volume | Retention Note |
|---|---|---|
| Session lifecycle records | 1 per session per student | Retained for full product lifetime. Needed for longitudinal analytics. |
| Question attempt records | 10–30 per session | High volume. May require partitioning by `student_id` and `recorded_at` in production. |
| Behavioral signal records | 1 per session (derived) | Stored with session end record. Low volume. |
| AI Teacher invocation records | 0–10 per session | Retained for quality audit and AIM Engine state update. |
| Content quality signals | 1 per attempt | Retained for content management. May be archived after content review is resolved. |

---

## Non-Goals

- This document does not implement database tables or migrations.
- This document does not create a Student Web App.
- This document does not implement Flutter data collection.
- This document does not define retention periods or GDPR deletion workflows (deferred to security and privacy planning).
- This document does not define API endpoints for attempt submission.

---

## Assumptions

- All timestamps are UTC ISO 8601. Client-side timezone is used only for `time_of_day_bucket` derivation.
- Response time is captured server-side when possible, or as client-reported value with a server-arrival delta. Client-reported values are treated as approximate.
- Pilot sessions use React web. Flutter capture follows the same contract when the mobile app is built.
- Skipped questions are recorded with `submitted_answer = null`, `is_correct = null`, `skip_flag = true`.
- A session with `completion_status = abandoned` still stores all attempt records captured up to exit.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should idle time within a session be subtracted from `response_time_seconds`? | Treat as open. MVP captures wall-clock response time. Idle exclusion is a post-MVP accuracy improvement. |
| Should `device_class` affect any AIM Engine logic? | No. Captured for diagnostics only. |
| How many retries on a single question should be allowed before the session forces a skip? | Defer to lesson content structure task (P0-011) and frontend session rules. |
| Should question order within a session be randomized or fixed? | Defer to lesson content structure task (P0-011). If randomized, `session_position` remains meaningful for within-session pattern analysis. |
| Should AI Teacher invocations beyond a threshold pause the session? | AIM Engine input contract (P0-014) flags this at ≥ 4 invocations. UI behavior is a frontend task. |

---

## Related Documents

- `docs/journeys/student-journey.md` — Session stages and attempt events this data captures.
- `docs/aim-engine/boundary-and-io-contract.md` — AIM Engine input contracts populated from this data.
- `docs/learning/english-skill-tree.md` — Skill IDs referenced in attempt records.
- `docs/content/lesson-content-structure.md` — Lesson and question metadata fields captured alongside attempts.
- `docs/product/roles-and-permissions.md` — Who may access what portion of captured data.
- `docs/data/initial-data-model.md` (P0-016) — Entity model that stores these captured fields.
- `docs/security/ai-safety-privacy-rules.md` (P0-022) — Data minimization, behavioral analysis, and safety rules.

---

## Acceptance Notes

- Dependencies checked: P0-005 (`docs/journeys/student-journey.md` present) and P0-014 (`docs/aim-engine/boundary-and-io-contract.md` present).
- This document defines five capture categories: session lifecycle, question attempt, behavioral signals, AI Teacher invocations, and content/quality signals.
- Learner-safe rules, data flow summary, storage notes, assumptions, non-goals, and open questions are all included.
- No runtime source code, Student Web App, Flutter code, database migration, or AIM Engine implementation was added.
- Task is ready to mark Done in Notion.
