# AIM Engine Boundary and IO Contract

## Purpose

This document defines the boundary, ownership, inputs, outputs, and integration contract for the AIM Engine.

It ensures that adaptive intelligence remains backend-owned and that all clients consume backend-approved AIM outputs without calculating or duplicating AIM logic locally.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Python AIM Engine runtime code.
- NestJS Backend API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AI Teacher Gateway runtime code.
- Admin dashboard runtime code.
- A separate Student Web App.

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

React Web and FastAPI belong to the completed MVP pilot context.

Post-MVP Phase 1 uses Flutter Mobile as the learner client and NestJS + TypeScript as the Backend API.

The AIM Engine remains Python/backend-owned in both contexts. It must not run in Flutter Mobile, React Web, admin UI, or any other client.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for AIM/client/safety rules. |
| P0-015 | `docs/data/session-data-capture.md` | Checked for session and attempt evidence fields. |
| P0-016 | `docs/data/initial-data-model.md` | Checked for entity references. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for backend integration boundary. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for safety, privacy, and credential boundaries. |

## Boundary Summary

The AIM Engine is responsible for adaptive learning decisions.

The Backend API is responsible for authentication, authorization, request validation, orchestration, persistence, and exposing safe API responses.

Clients are responsible for display and interaction only.

```text
Flutter Mobile Learner Client
Completed React Web Pilot Surface, if referenced historically
Admin / Internal UI Surfaces
        │
        │ HTTPS API requests
        ▼
Post-MVP Backend API
NestJS + TypeScript
Auth + authorization + orchestration
        │
        │ Backend-internal integration
        ▼
Python AIM Engine
Adaptive intelligence
        │
        │ Backend-internal integration when needed
        ▼
AI Teacher Gateway
Backend-only provider proxy
```

## Ownership Rules

| Area | Owner | Rule |
|---|---|---|
| Mastery calculation | Python AIM Engine | Never calculated locally by clients. |
| Student level decision | Python AIM Engine | Never calculated locally by clients. |
| Weakness detection | Python AIM Engine | Never calculated locally by clients. |
| Difficulty adaptation | Python AIM Engine | Never calculated locally by clients. |
| Retention scheduling | Python AIM Engine | Never calculated locally by clients. |
| Recommendation generation | Python AIM Engine + backend resolver | Never generated locally by clients. |
| Decision conflict resolution | Backend/AIM decision pipeline | Final action authority remains backend-owned. |
| AI Teacher Gateway | Backend-only | Clients never call provider APIs directly. |
| Provider credentials | Backend/server environment | Never exposed to clients. |
| Client display | Flutter Mobile / client surfaces | Render backend-approved outputs only. |

## Client Prohibitions

All clients, including Flutter Mobile, completed React Web pilot surfaces, admin UI surfaces, and future clients, must not:

- Run AIM Engine logic.
- Duplicate AIM Engine logic.
- Approximate AIM Engine logic.
- Calculate mastery.
- Calculate student level.
- Calculate weakness.
- Calculate difficulty.
- Calculate retention.
- Generate recommendations locally.
- Override backend recommendation authority.
- Call the AIM Engine directly.
- Call the AI Teacher Gateway directly.
- Store AI provider keys.
- Store privileged backend credentials.
- Apply clinical, medical, or diagnostic learner labels.

## Allowed Client Responsibilities

Clients may:

- Display lessons, questions, feedback, recommendations, progress, and review schedules.
- Collect learner actions and session evidence.
- Send attempts, hint usage, skips, answer changes, and AI Teacher interaction events to the backend.
- Cache backend-approved display data when safe.
- Retry failed submissions without calculating AIM decisions locally.
- Render learner-safe messages returned by the backend.

## Core AIM Engine Responsibilities

The AIM Engine may include the following backend-owned modules:

| Module | Responsibility |
|---|---|
| SkillGraph | Maintains skill relationships, prerequisites, and learning path structure. |
| PerformanceAnalyzer | Analyzes accuracy, consistency, retries, hints, skips, and evidence quality. |
| MasteryCalculator | Calculates mastery using no-speed scoring rules. |
| WeaknessDetector | Detects skill weaknesses and prerequisite gaps. |
| ErrorPatternClassifier | Classifies repeated learner error patterns. |
| DifficultyAdapter | Chooses safe difficulty movement based on evidence thresholds. |
| RetentionTracker | Updates spaced review and retention needs. |
| EmotionalStateDetector | Detects educational behavior signals such as frustration or hesitation without clinical diagnosis. |
| RecommendationEngine | Produces next lesson, review, remediation, or challenge recommendations. |
| DecisionConflictResolver | Resolves competing signals into one final action. |
| FairnessAuditor | Checks that adaptation does not rely on unsafe or unfair signals. |
| PromptAdapter | Produces backend-approved AI Teacher instruction context when needed. |

## Required Input Groups

### Input Group 1 — Placement Result

| Field | Description |
|---|---|
| `student_id` | Backend-owned student identifier. |
| `placement_test_id` | Placement assessment identifier. |
| `answers` | Placement answers and correctness. |
| `skill_results` | Skill-level placement evidence. |
| `initial_band` | Conservative starting band. |
| `created_at` | Timestamp. |

### Input Group 2 — Learning Session

| Field | Description |
|---|---|
| `session_id` | Backend-owned session identifier. |
| `student_id` | Student identifier. |
| `lesson_id` | Lesson identifier. |
| `skill_ids` | Skills practiced in the session. |
| `session_type` | Placement, practice, review, remediation, or challenge. |
| `started_at` | Session start timestamp. |
| `completed_at` | Session completion timestamp, if completed. |
| `completion_status` | Completed, abandoned, or interrupted. |

### Input Group 3 — Question Attempts

| Field | Description |
|---|---|
| `question_id` | Question identifier. |
| `skill_id` | Skill targeted by the question. |
| `difficulty` | Backend/content-defined difficulty. |
| `attempt_number` | Attempt count for the question. |
| `submitted_answer` | Learner answer. |
| `is_correct` | Correctness after validation. |
| `hint_used` | Whether learner used a hint. |
| `skip_flag` | Whether learner skipped. |
| `answer_changed_flag` | Whether learner changed answer before submission. |
| `response_time_seconds` | Time evidence captured by client or backend. |
| `ai_teacher_invoked_before_attempt` | Whether AI Teacher help was used before answer. |

### Input Group 4 — Session Behavior Evidence

| Field | Description |
|---|---|
| `retry_count` | Number of retries. |
| `hint_count` | Number of hints used. |
| `skip_count` | Number of skips. |
| `answer_change_count` | Number of answer changes. |
| `response_time_distribution` | Time evidence for behavior analysis only. |
| `ai_teacher_invocation_count` | Number of help requests. |

### Input Group 5 — Historical Student State

| Field | Description |
|---|---|
| `student_skill_states` | Existing backend-owned skill states. |
| `previous_recommendations` | Previous recommendations and outcomes. |
| `review_schedule` | Existing retention/review schedule. |
| `known_weaknesses` | Existing weakness records. |
| `known_error_patterns` | Existing error patterns. |

## Speed and Response Time Rule

The AIM Engine may receive and analyze speed-related evidence, but only as educational behavior evidence.

Allowed speed-related uses:

- hesitation signal
- rushing signal
- possible guessing signal
- fatigue or distraction signal
- low confidence signal
- session behavior analysis

Forbidden speed-related uses:

- direct mastery increase
- direct mastery decrease
- direct student level change
- direct difficulty increase
- direct recommendation upgrade
- using speed as a replacement for correctness, retention, consistency, or difficulty performance

Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.

## Mastery Contract

Mastery must follow a no-speed formula family.

```text
mastery_raw =
  accuracy_score * 0.40 +
  consistency_score * 0.20 +
  retention_score * 0.15 +
  difficulty_performance_score * 0.20 +
  evidence_quality_score * 0.05

mastery_adjusted =
  mastery_raw - hint_penalty - retry_penalty - skip_penalty

reliability = min(1.0, valid_attempt_count / 10)

final_mastery =
  previous_mastery * (1 - reliability)
  + mastery_adjusted * reliability
```

Final mastery must:

- Not increase by more than 12 points per session.
- Not decrease by more than 15 points per session.
- Be clamped between 0 and 100.
- Exclude `response_time`, `avg_response_time`, and `speed_score`.

## Difficulty Adaptation Contract

Difficulty may increase only when all required evidence is strong.

| Metric | Required Condition |
|---|---|
| Mastery | `>= 85` |
| Consistency | `>= 75` |
| Reliability | `>= 0.70` |
| Weakness score | `< 50` |
| Frustration score | `< 60` |
| Retention | `>= 70` |

Difficulty must not increase when:

- Reliability is low.
- Frustration is high.
- Prerequisite gaps are severe.
- Weakness evidence is strong.
- Retention is weak.
- The only positive signal is speed.
- The client attempts to infer or override difficulty.

## Required Output Groups

### Output Group 1 — Updated Skill State

| Field | Description | Client Exposure |
|---|---|---|
| `student_id` | Student identifier. | Internal or scoped |
| `skill_id` | Skill identifier. | Safe |
| `mastery` | Backend-calculated mastery. | Learner-safe summary only |
| `confidence` | Backend confidence in current state. | Optional safe summary |
| `attempts` | Attempt count. | Safe summary |
| `retention` | Retention estimate. | Learner-safe summary only |
| `weakness_score` | Internal weakness value. | Admin/internal only or transformed |
| `frustration_score` | Educational behavior signal. | Admin/internal only |
| `current_difficulty` | Backend-selected current difficulty. | Safe label only |
| `last_reviewed_at` | Review timestamp. | Safe |

### Output Group 2 — Recommendation

| Field | Description | Client Exposure |
|---|---|---|
| `recommendation_id` | Recommendation identifier. | Internal or safe |
| `student_id` | Student identifier. | Scoped |
| `action_type` | Review, continue, remediate, challenge, pause, or retry. | Safe |
| `recommended_lesson_id` | Next lesson ID. | Safe |
| `recommendation_reason` | Backend reason code. | Safe if transformed |
| `learner_message` | Safe message for learner. | Safe |
| `confidence_score` | Internal confidence in recommendation. | Admin/internal only |
| `generated_at` | Timestamp. | Safe |

### Output Group 3 — Review Schedule

| Field | Description | Client Exposure |
|---|---|---|
| `skill_id` | Skill identifier. | Safe |
| `scheduled_review_date` | Next review date. | Safe |
| `is_due` | Whether review is due. | Safe |
| `retention_estimate` | Backend retention estimate. | Learner-safe summary only |

### Output Group 4 — Weakness and Error Pattern Records

| Field | Description | Client Exposure |
|---|---|---|
| `weakness_id` | Weakness record identifier. | Internal |
| `skill_id` | Skill identifier. | Safe if transformed |
| `weakness_type` | Educational weakness type. | Safe if learner-friendly |
| `error_pattern` | Classified error pattern. | Learner-safe wording only |
| `severity` | Internal severity. | Admin/internal only |
| `created_at` | Timestamp. | Internal |

### Output Group 5 — AI Teacher Instruction Context

| Field | Description | Client Exposure |
|---|---|---|
| `skill_id` | Skill being explained. | Safe |
| `learner_band` | Learner level band. | Safe if transformed |
| `misconception_hint` | Educational misconception context. | Backend/internal |
| `allowed_help_type` | Help action. | Safe |
| `safety_constraints` | Safety instructions. | Backend/internal |
| `response_style` | Explanation style. | Backend/internal |

AI Teacher instruction context is backend-owned. Flutter Mobile and other clients must not generate provider prompts locally.

## Learner-Safe Output Rules

Learner-facing outputs must:

- Be simple and encouraging.
- Explain next steps clearly.
- Use educational language.
- Avoid clinical, medical, or diagnostic labels.
- Avoid raw hidden AIM internals.
- Avoid shame-based or intelligence-based labels.
- Avoid exposing provider prompts or raw provider outputs.
- Avoid implying speed directly controls level or mastery.

Allowed learner-safe messages:

- "Review this skill before moving on."
- "This lesson will help strengthen your basics."
- "You are ready for a slightly harder challenge."
- "Let’s practice this idea with another example."
- "Refresh this skill today."

Forbidden learner-facing messages:

- "You have a disorder."
- "You are psychologically frustrated."
- "You are slow, so your level dropped."
- "You are fast, so your mastery increased."
- "The AI diagnosed your learning problem."

## Backend Integration Contract

The post-MVP NestJS + TypeScript Backend API must:

- Validate authentication and authorization before calling AIM Engine.
- Validate ownership of student/session records.
- Validate request shape and required evidence.
- Persist attempts and session evidence before AIM processing.
- Call the Python AIM Engine through backend-internal integration only.
- Persist AIM outputs after processing.
- Return learner-safe response shapes to clients.
- Restrict internal AIM fields to authorized admin/reviewer roles.
- Audit sensitive admin actions and overrides.

## Recommended Session Completion Pipeline

```text
1. Client submits attempts to Backend API.
2. Backend validates auth, ownership, session state, and payload shape.
3. Backend persists attempts and session behavior evidence.
4. Backend calls Python AIM Engine internally.
5. AIM Engine analyzes performance and evidence quality.
6. AIM Engine calculates mastery using no-speed scoring rules.
7. AIM Engine updates skill state.
8. AIM Engine detects weaknesses and error patterns.
9. AIM Engine updates retention/review schedule.
10. AIM Engine evaluates difficulty movement safely.
11. AIM Engine resolves decision conflicts.
12. AIM Engine generates recommendation.
13. Backend persists updated state, recommendation, review schedule, and audit data.
14. Backend returns learner-safe response to client.
```

## AI Teacher Gateway Boundary

AI Teacher Gateway is backend-only.

Rules:

- Clients never call AI providers directly.
- Clients never hold provider API keys.
- Clients never generate provider prompts.
- Backend controls prompt construction and safety instructions.
- Backend stores or audits AI Teacher events according to privacy rules.
- AI Teacher output must not override AIM Engine recommendation authority.
- AI Teacher output must use educational, non-clinical, non-medical, non-diagnostic language.

## Admin and Reviewer Boundary

Admin and reviewer surfaces may access more detailed internal AIM outputs only when role-authorized.

Admin/reviewer surfaces must not:

- Expose privileged credentials.
- Edit AIM logic from the UI.
- Override backend decisions without audit logs.
- Apply diagnostic labels to learners.
- Export sensitive learner data without role permission.
- Treat speed as direct mastery, student level, or difficulty evidence.

## Data Persistence Expectations

The backend should persist:

- learning sessions
- question attempts
- AI Teacher invocation events
- session behavior evidence
- student skill states
- weakness records
- error pattern records
- review schedules
- AIM recommendations
- recommendation outcomes
- admin overrides
- audit logs

Persistence belongs to backend services and database layers, not clients.

## Non-Goals

This document does not:

- Implement the AIM Engine.
- Implement the Backend API.
- Implement Flutter Mobile.
- Implement React Web.
- Implement admin UI.
- Create database migrations.
- Create an AI Teacher Gateway.
- Create a separate Student Web App.
- Define final deployment topology.
- Move AIM logic into clients.
- Define clinical or diagnostic learner categories.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- AIM Engine can be integrated as a backend service/module behind the Backend API.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- Clients are online for authoritative AIM processing.
- Any offline retry behavior must not calculate AIM decisions locally.

## Open Questions

| Question | Current Handling |
|---|---|
| Should the Python AIM Engine run as an in-process module, internal service, or job worker behind NestJS? | Open Phase 1 engineering decision. It must remain backend-only in all cases. |
| Should session completion be synchronous or asynchronous? | Early Phase 1 may use synchronous response; async processing can be added for resilience. |
| Which AIM debug fields should admin/reviewer roles see? | Define minimum safe admin fields before implementation. |
| Which recommendation outcome events are required for Phase 1? | Define during analytics/reporting implementation planning. |
| How much explanation should learners see about mastery changes? | Use learner-safe summaries only. Avoid raw AIM internals. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/api/api-planning-baseline.md`
- `docs/data/session-data-capture.md`
- `docs/data/initial-data-model.md`
- `docs/analytics/reports-scope.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/ai-teacher/behavior-rules.md`
- `docs/mobile/mobile-sitemap.md`

## Acceptance Notes

- This document has a title, purpose, scope, current product direction, boundary summary, ownership rules, input groups, output groups, backend integration contract, AI Teacher Gateway boundary, assumptions, open questions, and related documents.
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
