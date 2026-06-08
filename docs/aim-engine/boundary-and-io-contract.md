# AIM Engine Boundary and Input Output Contract

## Purpose

This document defines the boundary of the AIM Engine: what data is sent to it, what it returns, what computations it owns exclusively, and what must not run in the Flutter client or any other layer. It is the authoritative contract between the backend, Flutter app, admin dashboard, and the AIM Engine module.

## Scope

Phase 0 planning documentation only. No backend code, AIM Engine algorithms, or Flutter code is implemented here. All skill IDs reference `docs/learning/english-skill-tree.md` (P0-009). Student journey context references `docs/journeys/student-journey.md` (P0-005). AI Teacher hooks reference `docs/ai-teacher/behavior-rules.md` (P0-013).

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-005 | `docs/journeys/student-journey.md` | Present. Defines the learning session flow that feeds data to AIM Engine. |
| P0-009 | `docs/learning/english-skill-tree.md` | Present. Canonical skill IDs used in all AIM Engine inputs and outputs. |
| P0-013 | `docs/ai-teacher/behavior-rules.md` | Present. AI Teacher interaction outputs are consumed by AIM Engine for state updates. |

---

## AIM Engine Definition

The AIM Engine is a Python backend module that owns all adaptive learning intelligence. It is the sole system responsible for:

- Computing and updating per-student, per-skill learning state (`mastery`, `confidence`, `attempts`, `avg_speed`, `retention`, `weakness_score`, `frustration_score`, `learning_style`)
- Selecting the next lesson for a student
- Triggering remediation based on skill weakness
- Scheduling review lessons based on retention decay
- Consuming placement test results and initializing student skill states
- Consuming lesson session results and updating skill states
- Generating recommendation outputs for the Flutter app and admin dashboard

The AIM Engine does not:
- Serve lesson content directly to the Flutter app (that is the backend content API)
- Render UI or interact with the student directly
- Execute AI Teacher LLM calls (those are handled by the AI Teacher gateway, which reports results back to AIM Engine)
- Store data (it reads from and writes to the backend database through the backend service layer)

---

## Architectural Position

```
Flutter App
    ↓ (REST API calls)
Backend API Layer
    ↓ (internal service calls)
AIM Engine Module  ←→  Database (StudentSkillState, LessonHistory, PlacementResult)
    ↓ (async trigger)
AI Teacher Gateway (LLM calls, returns interaction metadata to AIM Engine)
```

The Flutter client never calls the AIM Engine directly. All AIM Engine interactions are mediated by the backend API layer. AI provider keys are held only in the backend environment and are never passed to Flutter.

---

## Input Contract

### Input 1: Placement Test Result

Sent to AIM Engine immediately after a student completes the placement test.

| Field | Type | Required | Description |
|---|---|---|---|
| `student_id` | string | Yes | Unique student identifier |
| `entry_band` | int (1–4) | Yes | Placement band assigned by the placement scorer |
| `placement_score_pct` | float | Yes | Overall score as a percentage |
| `screening_score_pct` | float | Yes | Screening set score |
| `extension_score_pct` | float or null | Yes | Extension score if served, otherwise null |
| `answered_questions` | array[object] | Yes | Each object: `{question_id, skill_id, correct: bool, response_time_seconds: int, skipped: bool}` |
| `placement_completed_at` | datetime | Yes | ISO 8601 UTC |
| `total_time_seconds` | int | Yes | Wall time for the entire placement test |

**AIM Engine action on this input:** Initialize `StudentSkillState` records for all skills in the entry band. Pre-populate mastery signals based on correct answers in `answered_questions`.

---

### Input 2: Lesson Session Result

Sent to AIM Engine when a student completes or abandons a lesson.

| Field | Type | Required | Description |
|---|---|---|---|
| `student_id` | string | Yes | |
| `lesson_id` | string | Yes | |
| `completion_status` | enum | Yes | One of: `completed`, `abandoned`, `partial` |
| `started_at` | datetime | Yes | ISO 8601 UTC |
| `completed_at` | datetime | Yes | ISO 8601 UTC |
| `total_time_seconds` | int | Yes | |
| `practice_results` | array[object] | Yes | Each: `{question_id, skill_id, correct: bool, attempts: int, time_seconds: int, hint_used: bool, ai_teacher_invoked: bool}` |
| `remediation_triggered` | bool | Yes | Whether a remediation block was served during this lesson |
| `ai_teacher_invocations` | int | Yes | Total AI Teacher hook calls during the lesson |
| `blocks_completed` | int | Yes | Number of blocks the student completed before session end |

**AIM Engine action on this input:** Update `StudentSkillState` for all skills covered in the lesson. Compute mastery delta, update confidence, increment attempts, update avg_speed, update frustration_score. Evaluate whether remediation or review scheduling is needed. Select next lesson.

---

### Input 3: AI Teacher Interaction Result

Sent to AIM Engine after each AI Teacher exchange within a lesson.

| Field | Type | Required | Description |
|---|---|---|---|
| `student_id` | string | Yes | |
| `lesson_id` | string | Yes | |
| `skill_id` | string | Yes | Skill targeted in the exchange |
| `hook_type` | enum | Yes | One of: `explain_more`, `give_example`, `explain_step`, `explain_why`, `retry_with_help` |
| `attempt_result_after` | bool or null | Yes | Whether the student answered correctly after the AI Teacher interaction. Null if no follow-up attempt. |
| `response_time_after_seconds` | int or null | Yes | Student response time after AI Teacher interaction |
| `invocation_count_this_lesson` | int | Yes | Running count of AI Teacher invocations in this lesson |

**AIM Engine action on this input:** Update `frustration_score` signal. Update `learning_style` inference. If `attempt_result_after = true` after `retry_with_help`, apply a reduced mastery gain (hint-assisted correct). If `invocation_count_this_lesson ≥ 4`, flag student for potential remediation session next lesson.

---

### Input 4: Admin Override

Sent by admin dashboard actions that directly affect AIM Engine state.

| Field | Type | Required | Description |
|---|---|---|---|
| `student_id` | string | Yes | |
| `action` | enum | Yes | One of: `reset_placement`, `reset_skill_state`, `force_lesson`, `skip_lesson` |
| `target_skill_id` | string | Conditional | Required for `reset_skill_state` |
| `target_lesson_id` | string | Conditional | Required for `force_lesson` and `skip_lesson` |
| `admin_id` | string | Yes | Admin user identifier for audit log |
| `reason` | string | No | Optional free-text reason logged to audit trail |

**AIM Engine action on this input:** Execute the override. Log the action with `admin_id` and timestamp.

---

## Output Contract

### Output 1: Next Lesson Recommendation

Produced by AIM Engine after processing a lesson session result or on explicit request from the backend.

| Field | Type | Description |
|---|---|---|
| `student_id` | string | |
| `recommended_lesson_id` | string | The next lesson to serve |
| `lesson_type` | enum | `intro`, `skill`, `review`, or `remediation` |
| `primary_skill_ids` | array[string] | Skills the recommended lesson targets |
| `recommendation_reason` | enum | One of: `new_skill`, `skill_practice`, `weakness_remediation`, `retention_review`, `placement_entry` |
| `confidence_score` | float (0–1) | AIM Engine confidence in this recommendation |
| `generated_at` | datetime | ISO 8601 UTC |

---

### Output 2: Updated Student Skill State

Produced after every lesson session result and placement test result processing.

| Field | Type | Description |
|---|---|---|
| `student_id` | string | |
| `skill_states` | array[object] | Each: `{skill_id, mastery, confidence, attempts, avg_speed, retention, weakness_score, frustration_score, learning_style, last_updated_at}` |
| `overall_progress_pct` | float | Percentage of band skills with mastery ≥ 0.7 |
| `current_band` | int (1–4) | Student's current placement band |
| `band_promotion_eligible` | bool | Whether student meets criteria to advance to the next band |

---

### Output 3: Student Progress Summary

Produced on request by the backend for the Flutter app (student progress screen) and admin dashboard.

| Field | Type | Description |
|---|---|---|
| `student_id` | string | |
| `lessons_completed` | int | Total lessons completed |
| `lessons_abandoned` | int | Total lessons abandoned |
| `total_study_time_seconds` | int | Cumulative lesson time |
| `skills_introduced` | int | Skills with at least one lesson attempt |
| `skills_mastered` | int | Skills with mastery ≥ 0.7 |
| `top_weaknesses` | array[string] | Up to 3 skill IDs with highest weakness_score |
| `top_strengths` | array[string] | Up to 3 skill IDs with highest mastery |
| `current_streak_days` | int | Consecutive days with at least one completed lesson |
| `summary_generated_at` | datetime | ISO 8601 UTC |

---

### Output 4: Remediation Trigger Event

Emitted by AIM Engine when a student's weakness_score for a skill exceeds the remediation threshold (0.7).

| Field | Type | Description |
|---|---|---|
| `student_id` | string | |
| `skill_id` | string | Skill requiring remediation |
| `weakness_score` | float | Current weakness_score that triggered the event |
| `recommended_remediation_lesson_id` | string | Lesson ID of the appropriate remediation lesson |
| `triggered_at` | datetime | ISO 8601 UTC |

---

## What Must Not Run in Flutter

The following logic is exclusively owned by the AIM Engine and must not be replicated, approximated, or computed in the Flutter client:

| Prohibited Client-Side Logic | Reason |
|---|---|
| Mastery score calculation | Mastery is a sensitive signal. Client-side computation would allow manipulation and inconsistency. |
| Next lesson selection | Selection depends on full skill state history. Client does not hold this data. |
| Remediation threshold evaluation | Client does not have access to weakness_score or the remediation ruleset. |
| Frustration score inference | Inferred from multi-session behavioral patterns not available client-side. |
| Learning style classification | Requires cross-session attempt pattern analysis. |
| Placement band assignment | Depends on scoring algorithm and band thresholds that may change. |
| Retention decay calculation | Depends on time-since-last-attempt curves maintained server-side. |
| AI Teacher LLM calls | AI provider keys must never be in the Flutter client. |
| Listening (LIS) audio delivery scoring | Audio streaming and response scoring for LIS skill states must be handled server-side only. The client may play audio if infrastructure is confirmed, but scoring of listening comprehension must never be computed client-side. |
| Speaking (SPE) free-speech scoring | Speech-to-text or pronunciation scoring for SPE skills must never run in the Flutter client. All SPE scoring logic, if implemented post-MVP, must be a backend-only service. |

The Flutter app is a display and interaction layer only. It receives pre-computed recommendations, skill state summaries, and lesson content from the backend. It does not hold adaptive logic.

---

## Failure and Fallback Rules

| Failure Scenario | AIM Engine Behavior |
|---|---|
| Lesson session result arrives with missing `practice_results` | Log warning. Process what is available. Do not fail silently — emit a data quality alert for admin review. |
| AIM Engine cannot select a next lesson (no eligible lessons in bank) | Return a `null` `recommended_lesson_id` with `recommendation_reason = content_gap`. Backend surfaces a content-gap alert to admin. Student sees "No new lessons available yet." |
| AI Teacher gateway is unavailable | AI Teacher interactions are not sent to AIM Engine for that session. Lesson continues without AI Teacher updates. Missing AI Teacher data is flagged in session record. |
| Placement test result arrives for a student who already has skill states | AIM Engine checks if this is a re-placement (admin-triggered or student-requested). If yes, overwrite. If unexpected, log a conflict alert and do not overwrite without admin confirmation. |
| Database write fails during skill state update | Retry up to 3 times with exponential backoff. If all retries fail, queue the update for deferred processing. Do not drop skill state updates. |

---

## Assumptions

- The AIM Engine is a Python module within the backend service. It is not a separate microservice in MVP.
- All AIM Engine inputs and outputs are transmitted over internal service calls (function calls or internal message bus), not external HTTP. External HTTP is only for Flutter ↔ Backend API.
- The skill state fields (`mastery`, `confidence`, etc.) map directly to the `StudentSkillState` model implemented in T-03.
- The AIM Engine algorithm details (mastery delta formulas, retention decay curves, frustration thresholds) are implementation concerns for Phase 1 and are not defined in this Phase 0 document.
- Recommendation confidence scores are informational for admin dashboards; they do not gate lesson delivery in MVP.
- All seven skill categories (PHO, VOC, GRA, READ, WRITE, LIS, SPE) are valid `skill_id` prefixes in AIM Engine inputs and outputs. LIS and SPE skill states are managed identically to other categories. Gating of LIS/SPE lessons from being served to students is enforced by the content layer (`lesson_eligible`, `placement_eligible` flags), not the AIM Engine itself.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should the AIM Engine support batch processing of multiple session results (e.g., offline sync)? | Open decision. MVP assumes real-time single-session processing. Batch processing is a post-MVP resilience feature for low-connectivity scenarios. |
| Should `band_promotion_eligible` trigger an automatic band advancement or require admin approval? | Open decision. Recommend admin-approval in MVP pilot. Automatic promotion after pilot validation. |
| Should the AIM Engine emit a weekly summary event for the parent report? | Yes. Define in P0-021 (Analytics and Reports Scope). Not defined here to avoid scope overlap. |
| What is the retention decay model? (Ebbinghaus-based, flat decay, or other?) | Deferred to Phase 1 AIM Engine implementation. Phase 0 does not specify the algorithm. |
| Should remediation threshold (0.7) be configurable per skill or global? | Open decision. Global in MVP. Per-skill configuration is a post-MVP content management feature. |

---

## Related Documents

- `docs/journeys/student-journey.md` — Session flow that generates AIM Engine inputs
- `docs/learning/english-skill-tree.md` — Canonical skill IDs
- `docs/learning/placement-test-strategy.md` — Placement test output that feeds Input 1
- `docs/content/lesson-content-structure.md` — Lesson session metadata that feeds Input 2
- `docs/ai-teacher/behavior-rules.md` — AI Teacher interactions that feed Input 3
- `docs/data/session-data-capture.md` (P0-015) — Full event-level data captured alongside AIM Engine inputs
- `docs/data/initial-data-model.md` (P0-016) — Data entities AIM Engine reads and writes
- `docs/security/ai-safety-privacy-rules.md` (P0-022) — AI key protection and data minimization rules

---

## Acceptance Notes

- All three dependencies checked: P0-005, P0-009, P0-013 — all output files present and meaningful.
- This document covers the AIM Engine role definition, architectural position, four input contracts, four output contracts, explicit list of what must not run in Flutter, failure and fallback rules, and assumptions.
- No runtime source code, algorithms, database schemas, Flutter code, or API implementation was added.
- Task is ready to mark Done in Notion.
