# AIM API Planning Baseline

## Purpose

This document defines the planning-level API baseline for AIM. It describes the external API surface for the post-MVP Flutter Mobile learner client, admin/internal surfaces, backend-owned AIM Engine integration, and backend-only AI Teacher Gateway.

It exists to keep Phase 1 backend and client implementation aligned with the product vision, data model, AIM Engine boundary, role-based access rules, and safety/privacy constraints.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend runtime code.
- NestJS controllers, services, modules, or guards.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- OpenAPI/Swagger files.
- AI Teacher Gateway runtime code.
- AIM Engine runtime code.
- A separate Student Web App.

All entity references should map to `docs/data/initial-data-model.md`. All AIM Engine input/output contracts should map to `docs/aim-engine/boundary-and-io-contract.md`.

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

Post-MVP Phase 1 uses:

- Flutter Mobile as the learner client.
- NestJS + TypeScript as the Backend API.
- Python AIM Engine as a backend service/module.
- Supabase PostgreSQL/Auth as the default database/auth direction unless changed by a later documented decision.

References to "mobile app" in this document mean the post-MVP Flutter Mobile app unless another surface is explicitly named.

References to "backend API" in this document mean the post-MVP NestJS + TypeScript Backend API unless the completed MVP pilot is explicitly mentioned.

FastAPI may be referenced only as completed MVP pilot history.

No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as the product direction source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked and used for client/AIM/API guardrails. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Present. AIM Engine input/output contracts define the internal API surface documented here. |
| P0-016 | `docs/data/initial-data-model.md` | Present. Entity model defines the request/response shapes for all API groups. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for safety, privacy, and credential rules. |

## API Architecture Overview

```text
Post-MVP Flutter Mobile Learner Client
Admin / Internal Support Surfaces
Retained React Web Pilot Surface, if referenced historically
        │
        │ HTTPS REST/JSON
        ▼
┌─────────────────────────────────────┐
│ Post-MVP Backend API                │
│ NestJS + TypeScript                 │
│ Auth + Authorization + Orchestration│
└───────────────┬─────────────────────┘
                │ Backend-internal call
                ▼
┌─────────────────────────────────────┐
│ Python AIM Engine                   │
│ Backend-owned service/module        │
│ Adaptive intelligence only          │
└───────────────┬─────────────────────┘
                │ Backend-internal call
                ▼
┌─────────────────────────────────────┐
│ AI Teacher Gateway                  │
│ Backend-only LLM/provider proxy     │
│ Provider keys protected server-side │
└─────────────────────────────────────┘

Completed MVP pilot historical context:
React Web learner interface → FastAPI backend API → Python AIM Engine → Supabase PostgreSQL/Auth
```

## Architecture Rules

- The post-MVP Phase 1 Backend API is NestJS + TypeScript.
- FastAPI is preserved only as completed MVP pilot backend API context.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- External clients never call the AIM Engine directly.
- External clients never call the AI Teacher Gateway directly.
- External clients never compute mastery, student level, weakness, difficulty, retention, or recommendations locally.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Admin/internal endpoints use backend-enforced role scope and ownership checks.
- AIM Engine remains Python/backend-owned.
- Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.

## Authentication and Authorization

### Auth Provider

- Supabase Auth handles identity unless changed by a later documented decision.
- The Backend API validates Supabase JWT on every authenticated request.
- Role enforcement is always backend-side.
- Client-supplied role claims are never trusted without backend validation.
- User ownership checks are enforced by the backend, not by the client.

### Token Scope

| Consumer | Token Type | Role Claim Checked |
|---|---|---|
| Flutter Mobile learner client | Supabase JWT | `student` |
| Completed React Web pilot surface, if retained historically | Supabase JWT | Same backend role rules |
| Admin dashboard/internal support | Supabase JWT | `pilot_admin`, `project_owner` |
| Content manager tools | Supabase JWT | `content_manager` |
| Human reviewer tools | Supabase JWT | `human_reviewer` |
| Backend API to AIM Engine | Backend-internal call | Not exposed externally |
| Backend API to AI Teacher Gateway | Backend-internal call | Not exposed externally |

### Common Headers

```text
Authorization: Bearer <supabase_jwt>
Content-Type: application/json
Accept: application/json
```

## API Group Overview

| # | Group | Base Path | Primary Consumer | Auth Required |
|---|---|---|---|---|
| 1 | Auth | `/auth` | Flutter Mobile, Admin/Internal | Partial |
| 2 | Student Profile | `/students` | Flutter Mobile | Yes |
| 3 | Lessons | `/lessons` | Flutter Mobile | Yes |
| 4 | Sessions | `/sessions` | Flutter Mobile | Yes |
| 5 | AIM Outputs | `/aim` | Flutter Mobile read-only, Admin/Internal | Yes |
| 6 | Reviews | `/reviews` | Flutter Mobile | Yes |
| 7 | Goals | `/goals` | Flutter Mobile | Yes |
| 8 | Admin Students | `/admin/students` | Admin/Internal | Yes, admin scope |
| 9 | Admin Content | `/admin/content` | Admin/Internal | Yes, admin/content scope |
| 10 | Admin Reports | `/admin/reports` | Admin/Internal | Yes, admin scope |
| 11 | Admin Overrides | `/admin/overrides` | Admin/Internal | Yes, admin scope |

## Group 1 — Auth (`/auth`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/session` | Validate Supabase JWT and return backend session context. | JWT required in header |
| `POST` | `/auth/sign-out` | Invalidate active backend session if server-side session tracking exists. | Required |
| `GET` | `/auth/me` | Return current authenticated user's role, display name, and student profile ID if applicable. | Required |

### `POST /auth/session` Response Shape

```json
{
  "user_id": "uuid",
  "role": "student",
  "display_name": "string",
  "student_profile_id": "uuid or null",
  "is_placement_complete": true,
  "placement_band": 2,
  "feature_flags": {}
}
```

## Group 2 — Student Profile (`/students`)

Student-owned endpoints. All paths are scoped to the authenticated student. Cross-student access is blocked by the backend.

| Method | Path | Description |
|---|---|---|
| `GET` | `/students/me` | Return authenticated student's profile. |
| `GET` | `/students/me/skill-states` | Return learner-safe skill state summary for the progress screen. |
| `GET` | `/students/me/skill-states/{skill_id}` | Return learner-safe state for one skill. |
| `GET` | `/students/me/progress` | Return learner-safe progress report generated or approved by backend logic. |

### `GET /students/me/skill-states` Response Shape

```json
{
  "student_id": "uuid",
  "skill_states": [
    {
      "skill_id": "uuid",
      "skill_name": "Present Perfect",
      "mastery": 0.72,
      "confidence": 0.65,
      "attempts": 34,
      "retention": 0.81,
      "learning_style": "example_first",
      "last_reviewed_at": "2026-06-01T14:00:00Z"
    }
  ],
  "overall_progress_pct": 48.0,
  "current_band": 2
}
```

### Learner-Safe Filtering Rule

Student-facing responses must not expose raw or internal-only AIM fields such as:

- `frustration_score`
- `forgetting_lambda`
- `prerequisite_gap_flag`
- raw weakness internals
- private AIM debug output
- hidden scoring weights
- provider prompts
- internal audit logs

Learner-facing text must stay educational, non-clinical, non-medical, and non-diagnostic.

## Group 3 — Lessons (`/lessons`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/lessons/{lesson_id}` | Return a published lesson with blocks and content payload. |
| `GET` | `/lessons/{lesson_id}/questions` | Return the question list for a lesson's practice blocks. |

### `GET /lessons/{lesson_id}` Response Shape

```json
{
  "lesson_id": "uuid",
  "title": "string",
  "skill_id": "uuid",
  "skill_name": "string",
  "lesson_type": "skill_practice",
  "difficulty_level": 2,
  "estimated_duration_minutes": 10,
  "blocks": [
    {
      "block_id": "uuid",
      "block_order": 1,
      "block_type": "explanation",
      "content_payload": {}
    }
  ]
}
```

## Group 4 — Sessions (`/sessions`)

Session lifecycle and attempt submission endpoints.

| Method | Path | Description |
|---|---|---|
| `POST` | `/sessions` | Start a new learning session and return `session_id`. |
| `GET` | `/sessions/{session_id}` | Return current session state. |
| `POST` | `/sessions/{session_id}/attempts` | Submit question attempts for the session. |
| `POST` | `/sessions/{session_id}/ai-teacher` | Record an AI Teacher invocation event in the session. |
| `POST` | `/sessions/{session_id}/complete` | Mark session complete and trigger backend AIM Engine processing. |
| `POST` | `/sessions/{session_id}/abandon` | Mark the session abandoned and preserve partial evidence. |

### `POST /sessions` Request

```json
{
  "lesson_id": "uuid"
}
```

### `POST /sessions` Response

```json
{
  "session_id": "uuid",
  "lesson_id": "uuid",
  "session_type": "skill_practice",
  "started_at": "2026-06-07T10:00:00Z",
  "assigned_difficulty_band": 2
}
```

### `POST /sessions/{session_id}/attempts` Request

```json
{
  "attempts": [
    {
      "question_id": "uuid",
      "session_position": 1,
      "attempt_number": 1,
      "submitted_answer": "has been",
      "is_correct": true,
      "response_time_seconds": 12,
      "hint_used": false,
      "skip_flag": false,
      "answer_changed_flag": false,
      "ai_teacher_invoked_before_attempt": false
    }
  ]
}
```

### `POST /sessions/{session_id}/complete` Response

This endpoint triggers backend AIM Engine processing. The client receives backend-approved AIM outputs only.

```json
{
  "session_id": "uuid",
  "completion_status": "completed",
  "aim_result": {
    "recommended_lesson_id": "uuid",
    "lesson_type": "skill_practice",
    "recommendation_reason": "skill_practice",
    "action_type": "CHALLENGE",
    "learner_message": "You're ready for a slightly harder challenge."
  },
  "updated_skill_states": [
    {
      "skill_id": "uuid",
      "mastery": 0.78,
      "confidence": 0.70
    }
  ]
}
```

## Group 5 — AIM Outputs (`/aim`)

These are read-only endpoints exposing backend-approved AIM Engine outputs to clients and admin/internal surfaces.

| Method | Path | Description |
|---|---|---|
| `GET` | `/aim/students/me/next-action` | Return the current backend-selected AIM recommendation for the authenticated student. |
| `GET` | `/aim/students/me/recommendations` | Return recommendation history with safe outcome tracking data. |
| `GET` | `/aim/students/me/remediation` | Return active remediation triggers in learner-safe form. |

### `GET /aim/students/me/next-action` Response Shape

```json
{
  "student_id": "uuid",
  "recommended_lesson_id": "uuid",
  "lesson_type": "review",
  "primary_skill_ids": ["uuid"],
  "recommendation_reason": "retention_review",
  "action_type": "REVIEW",
  "learner_message": "Refresh this skill before moving on.",
  "generated_at": "2026-06-07T10:05:00Z"
}
```

### AIM Output Rules

- Flutter Mobile displays only learner-safe fields.
- Admin/internal views may show additional debug fields only with role permission.
- Clients must not infer or override the next action locally.
- The final action must match the backend decision conflict resolver.
- Speed must not directly influence mastery, student level, or direct difficulty increase.

## Group 6 — Review Schedule (`/reviews`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/reviews/students/me/due` | Return skills currently due for review. |
| `GET` | `/reviews/students/me/schedule` | Return full review schedule with predicted review dates. |

### `GET /reviews/students/me/due` Response Shape

```json
{
  "student_id": "uuid",
  "due_reviews": [
    {
      "skill_id": "uuid",
      "skill_name": "Present Simple",
      "current_retention_estimate": 0.62,
      "scheduled_review_date": "2026-06-07",
      "is_due": true
    }
  ]
}
```

## Group 7 — Micro-Goals (`/goals`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/goals/students/me` | Return current active micro-goals. |

### `GET /goals/students/me` Response Shape

```json
{
  "student_id": "uuid",
  "goals": [
    {
      "goal_id": "uuid",
      "goal_type": "daily",
      "skill_name": "Present Perfect",
      "goal_text": "Answer 5 Present Perfect questions correctly in a row.",
      "is_achieved": false,
      "target_date": "2026-06-07"
    }
  ]
}
```

## Group 8 — Admin: Students (`/admin/students`)

Requires `pilot_admin` or `project_owner` role. All access remains backend-authorized and audit-safe.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/students` | List students with profile and placement status. |
| `GET` | `/admin/students/{student_id}` | Full student profile including placement, AIM state, and session history. |
| `GET` | `/admin/students/{student_id}/skill-states` | Full `StudentSkillState`, including internal-only fields. |
| `GET` | `/admin/students/{student_id}/sessions` | Session history with completion status and AIM processing results. |
| `GET` | `/admin/students/{student_id}/recommendations` | Full recommendation history with outcome tracking. |
| `GET` | `/admin/students/{student_id}/next-action` | Current next action with admin-only debug fields. |

### `GET /admin/students/{student_id}/skill-states` Response Shape

```json
{
  "student_id": "uuid",
  "skill_states": [
    {
      "skill_id": "uuid",
      "skill_name": "Present Perfect",
      "mastery": 0.72,
      "confidence": 0.65,
      "attempts": 34,
      "avg_speed": 18.4,
      "retention": 0.81,
      "weakness_score": 0.21,
      "frustration_score": 0.30,
      "learning_style": "example_first",
      "forgetting_lambda": 0.12,
      "prerequisite_gap_flag": false,
      "last_reviewed_at": "2026-06-01T14:00:00Z",
      "updated_at": "2026-06-07T10:05:00Z"
    }
  ]
}
```

`avg_speed` may be shown to authorized internal users as behavior evidence only. It must not be treated as a direct mastery, level, or difficulty score.

## Group 9 — Admin: Content (`/admin/content`)

Requires `content_manager`, `pilot_admin`, or `project_owner` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/content/lessons` | List all lessons, published and draft. |
| `GET` | `/admin/content/lessons/{lesson_id}` | Full lesson detail including draft status, version, and review flags. |
| `GET` | `/admin/content/questions` | List all questions with skill, difficulty, and quality flag status. |
| `GET` | `/admin/content/quality-flags` | List unresolved content quality flags. |
| `PATCH` | `/admin/content/quality-flags/{flag_id}` | Resolve a content quality flag with a resolution note. |

## Group 10 — Admin: Reports (`/admin/reports`)

Requires `pilot_admin` or `project_owner` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/reports/cohort-summary` | Cohort-level progress summary: completion rates, average mastery, common weaknesses. |
| `GET` | `/admin/reports/students/{student_id}/progress` | Full progress report for a student. |
| `GET` | `/admin/reports/aim-recommendations` | Recommendation log across students. |
| `GET` | `/admin/reports/audit-log` | Scoped audit log entries. |

### `GET /admin/reports/cohort-summary` Response Shape

```json
{
  "total_students": 5,
  "placement_complete": 5,
  "sessions_completed": 48,
  "avg_mastery_all_skills": 0.61,
  "top_weaknesses": ["uuid_skill_1", "uuid_skill_2", "uuid_skill_3"],
  "top_strengths": ["uuid_skill_4", "uuid_skill_5"],
  "frustration_rate": 0.12,
  "report_generated_at": "2026-06-07T12:00:00Z"
}
```

Admin reports must remain educational and operational. They must not use medical, clinical, or diagnostic learner labels.

## Group 11 — Admin: Overrides (`/admin/overrides`)

Requires `pilot_admin` or `project_owner` role. All overrides must be audit-logged.

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/overrides/students/{student_id}/reset-placement` | Reset placement and reinitialize skill states. |
| `POST` | `/admin/overrides/students/{student_id}/reset-skill` | Reset one skill state for a student. |
| `POST` | `/admin/overrides/students/{student_id}/force-lesson` | Force the next recommended lesson to a specific lesson ID. |
| `POST` | `/admin/overrides/students/{student_id}/skip-lesson` | Skip the currently recommended lesson. |

### `POST /admin/overrides/students/{student_id}/reset-skill` Request

```json
{
  "skill_id": "uuid",
  "reason": "Optional justification text"
}
```

### `POST /admin/overrides/students/{student_id}/reset-skill` Response

```json
{
  "override_id": "uuid",
  "action": "reset_skill_state",
  "student_id": "uuid",
  "skill_id": "uuid",
  "applied_at": "2026-06-07T11:00:00Z",
  "audit_log_id": "uuid"
}
```

Admin overrides may change operational state, but they must not move AIM logic into clients or allow clients to override backend decisions.

## AIM Engine Internal API

The AIM Engine is Python/backend-owned. In post-MVP Phase 1, it may be integrated as a backend service/module behind the NestJS + TypeScript Backend API. It is not exposed directly to Flutter Mobile, admin clients, React Web pilot surfaces, or any future external client.

### Internal Call 1: `aim.process_placement_result(placement_result)`

Called after a student completes the placement test.

| Item | Description |
|---|---|
| Input | `PlacementTestResult` entity fields as defined in `docs/aim-engine/boundary-and-io-contract.md`. |
| Returns | Initialized `StudentSkillState` list for the student's entry band. |
| Side effects | Writes `StudentSkillState` records and emits first `AIMRecommendation`. |

### Internal Call 2: `aim.process_session_result(session_result)`

Called when the backend receives `POST /sessions/{id}/complete`.

| Item | Description |
|---|---|
| Input | `LearningSession`, `QuestionAttempt[]`, `SessionBehavioralSignal`, and `AITeacherInvocation[]`. |
| Returns | Updated `StudentSkillState[]`, new `AIMRecommendation`, remediation triggers, and review schedule updates. |
| Side effects | Writes updated states, recommendation, triggers, and audit logs. |

### Internal Call 3: `aim.process_ai_teacher_invocation(invocation)`

Called after each AI Teacher interaction is recorded.

| Item | Description |
|---|---|
| Input | `AITeacherInvocation` entity fields. |
| Returns | Updated educational behavior signal for the session. |
| Rule | No clinical, medical, or diagnostic language. |

### Internal Call 4: `aim.apply_admin_override(override)`

Called when an admin override endpoint is used.

| Item | Description |
|---|---|
| Input | `AdminOverride` entity fields. |
| Returns | Confirmation of state change. |
| Side effects | Writes updated state, admin override record, and audit log entry. |

## AI Teacher Gateway Internal API

The AI Teacher Gateway is a backend-internal proxy for AI provider calls. It is not exposed externally.

### Internal Call: `ai_teacher.explain(hook_type, skill_id, question_context)`

| Field | Type | Description |
|---|---|---|
| `hook_type` | enum | One of `explain_more`, `give_example`, `explain_step`, `explain_why`, `retry_with_help`. |
| `skill_id` | UUID | Skill being explained. |
| `question_context` | object | Question, student answer, correctness, and learner-safe context. |
| `student_band` | int | Student's current placement band for explanation complexity. |
| `invocation_count` | int | Number of AI Teacher calls this session. |

### AI Teacher Gateway Rules

- AI provider keys are read from backend environment only.
- Privileged credentials are never exposed to clients.
- Raw provider responses are not blindly forwarded to clients.
- Returned explanations must follow `docs/ai-teacher/behavior-rules.md`.
- The Gateway must use educational, non-clinical, non-medical, non-diagnostic language.
- Flutter Mobile and other clients call only the backend API, never the AI provider.

## API Error Responses

All API endpoints return consistent error shapes:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "detail": "string or null"
  }
}
```

### Standard Error Codes

| HTTP Status | Code | When Used |
|---|---|---|
| `400` | `INVALID_REQUEST` | Missing or malformed request fields. |
| `401` | `UNAUTHORIZED` | Missing or expired JWT. |
| `403` | `FORBIDDEN` | Authenticated but role not permitted. |
| `404` | `NOT_FOUND` | Entity does not exist or is not accessible to this user. |
| `409` | `CONFLICT` | Session already completed, duplicate attempt batch, or conflicting state. |
| `422` | `UNPROCESSABLE` | Request shape valid but business rule violated. |
| `500` | `SERVER_ERROR` | Unexpected internal error. |
| `503` | `AIM_UNAVAILABLE` | AIM Engine processing failed after retries; session data is preserved. |

## API Conventions

| Convention | Rule |
|---|---|
| IDs | All IDs are UUIDs. Never use sequential integers in external responses. |
| Timestamps | Always UTC ISO 8601, for example `2026-06-07T10:00:00Z`. |
| Pagination | List endpoints use `limit` and `offset`. Default limit: 50. Max limit: 200. |
| Learner-safe filtering | Student-facing endpoints never expose hidden AIM internals or diagnostic framing. |
| Soft deletes | Avoid hard deletes for learner data. Use inactive or abandoned states where applicable. |
| Versioning | API version prefix should be `/v1/` in implementation unless changed later. |
| Authorization | Every protected endpoint must check JWT, role, and ownership server-side. |
| Auditability | Admin overrides and sensitive internal reads should be audit-logged. |

## What External Clients Must Never Do

This applies to Flutter Mobile, completed React Web pilot surfaces if retained, admin UI surfaces, and any future client.

| Prohibited | Reason |
|---|---|
| Call AIM Engine directly | AIM Engine is backend-internal only. |
| Call AI Teacher Gateway directly | AI provider keys and privileged credentials must remain backend-only. |
| Compute mastery locally | Mastery is a backend AIM Engine output. |
| Compute student level locally | Student level depends on backend evidence and rules. |
| Compute weakness locally | Weakness detection belongs to AIM Engine. |
| Compute difficulty locally | Difficulty adaptation belongs to AIM Engine. |
| Compute retention locally | Retention scheduling belongs to AIM Engine. |
| Generate recommendations locally | Recommendation authority belongs to backend AIM decisions. |
| Decide next lesson without backend API | Next action requires backend-owned state and conflict resolution. |
| Read another student's data | Every student endpoint is scoped and ownership-checked by backend. |
| Apply clinical, medical, or diagnostic labels | AIM is educational only. |
| Store AI provider keys | Security non-negotiable. |

## Non-Goals

This document does not:

- Implement NestJS + TypeScript backend code.
- Implement FastAPI routes.
- Implement Flutter Mobile code.
- Implement React Web code.
- Define final OpenAPI/Swagger specs.
- Define WebSocket or real-time push endpoints.
- Define final rate limiting policies.
- Create a separate Student Web App.
- Move AIM Engine logic into Flutter Mobile, React Web, admin UI, or any other client.
- Expose AI provider keys or privileged backend credentials to clients.

## Assumptions

- All external API traffic uses HTTPS.
- Supabase Auth JWT is passed on every authenticated request.
- The Backend API validates Supabase JWT independently.
- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- AIM Engine processing may start synchronously for early Phase 1 and later move to async processing if needed for resilience.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Open Questions

| Question | Current Handling |
|---|---|
| Should session attempt submission support mid-session checkpoints or only full batch on completion? | Early Phase 1 can start with full batch at session complete. Progressive checkpoints are a resilience improvement. |
| Should `GET /aim/students/me/next-action` be called on app launch or only after session complete? | Recommend both: app launch for dashboard priming and post-session for fresh recommendation. |
| Should admin dashboard use the same backend API or a separate service? | Same NestJS Backend API with role-scoped endpoints unless later scaling requires separation. |
| Should `ProgressReport` compute on demand or serve a pre-generated snapshot? | Prefer snapshot generated at session end; admin export can use controlled recompute. |
| What is the maximum batch size for attempt submission? | Open. Suggested planning default: 100 attempts per request. |
| How is NestJS integrated with the Python AIM Engine? | Open implementation decision: backend-internal service/module integration must preserve Python/backend ownership and never expose AIM directly to clients. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/open-decisions.md`
- `docs/product/risk-register.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/data/initial-data-model.md`
- `docs/product/roles-and-permissions.md`
- `docs/journeys/student-journey.md`
- `docs/journeys/admin-journey.md`
- `docs/ai-teacher/behavior-rules.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-014, P0-016, and P0-022.
- This document has a title, purpose, scope, current product direction, phase clarification, architecture overview, auth rules, API groups, internal AIM contract, AI Teacher Gateway contract, error conventions, API conventions, client prohibitions, assumptions, non-goals, open questions, related documents, and acceptance notes.
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
