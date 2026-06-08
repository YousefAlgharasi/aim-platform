# AIM API Planning Baseline

## Purpose

This document defines the planning-level API baseline for the AIM platform before any implementation begins. It specifies the API surface for the mobile app, admin dashboard, AIM Engine internal contract, and AI Teacher gateway. It is the reference document for Phase 1 backend and mobile engineering, ensuring all API boundaries align with the AIM Engine contract, data model, and role-based access rules.

## Scope

Phase 0 planning documentation only. No backend runtime code, FastAPI routes, database migrations, Flutter code, or API gateway implementation is produced here. All entity references map to `docs/data/initial-data-model.md`. All AIM Engine input/output contracts reference `docs/aim-engine/boundary-and-io-contract.md`.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Present. AIM Engine input/output contracts define the internal API surface documented here. |
| P0-016 | `docs/data/initial-data-model.md` | Present. Entity model defines the request/response shapes for all API groups. |

---

## API Architecture Overview

```
Flutter Mobile App
        │
        │  HTTPS REST (JSON)
        ▼
┌──────────────────────────────┐
│      Backend API Layer       │  FastAPI  ·  Python
│   (Auth + Business Logic)    │
└───────────┬──────────────────┘
            │  Internal service calls (function calls, not HTTP)
            ▼
┌──────────────────────────────┐
│       AIM Engine Module      │  Python  ·  Backend-internal
│  (All adaptive AI logic)     │
└───────────┬──────────────────┘
            │  Async trigger (internal)
            ▼
┌──────────────────────────────┐
│    AI Teacher Gateway        │  Backend-internal  ·  LLM proxy
│  (LLM calls, key protected)  │
└──────────────────────────────┘

Admin Dashboard
        │
        │  HTTPS REST (JSON)  ·  Separate auth token scope
        ▼
Backend API Layer  (same service, scoped endpoints)
```

**Rules:**
- Flutter never calls the AIM Engine directly.
- Flutter never calls the AI Teacher gateway directly.
- AI provider keys live only in the backend environment.
- Admin dashboard endpoints share the same backend service but use a separate auth token scope (`role: pilot_admin`, `project_owner`).

---

## Authentication and Authorization

### Auth Provider

- Supabase Auth handles identity for all user types.
- The backend validates Supabase JWT on every request.
- Role enforcement is always backend-side. Client-supplied role claims are never trusted.

### Token Scope

| Consumer | Token Type | Role Claim Checked |
|---|---|---|
| Flutter mobile app | Supabase JWT (student) | `student` |
| Admin dashboard | Supabase JWT (internal) | `pilot_admin`, `project_owner` |
| Content manager tools | Supabase JWT (internal) | `content_manager` |
| Human reviewer tools | Supabase JWT (internal) | `human_reviewer` |
| Backend-to-AIM Engine | Internal service call | No HTTP token — same process |
| Backend-to-AI Teacher | Internal service call | No HTTP token — same process |

### Common Headers (all external requests)

```
Authorization: Bearer <supabase_jwt>
Content-Type: application/json
Accept: application/json
```

---

## API Group Overview

| # | Group | Base Path | Primary Consumer | Auth Required |
|---|---|---|---|---|
| 1 | Auth | `/auth` | Mobile, Admin | Partial |
| 2 | Student | `/students` | Mobile | Yes |
| 3 | Lessons | `/lessons` | Mobile | Yes |
| 4 | Sessions | `/sessions` | Mobile | Yes |
| 5 | AIM Engine | `/aim` | Mobile (read), Admin | Yes |
| 6 | Reviews | `/reviews` | Mobile | Yes |
| 7 | Goals | `/goals` | Mobile | Yes |
| 8 | Admin — Students | `/admin/students` | Admin Dashboard | Yes (admin scope) |
| 9 | Admin — Content | `/admin/content` | Admin Dashboard | Yes (admin scope) |
| 10 | Admin — Reports | `/admin/reports` | Admin Dashboard | Yes (admin scope) |
| 11 | Admin — Overrides | `/admin/overrides` | Admin Dashboard | Yes (admin scope) |

---

## Group 1 — Auth (`/auth`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/session` | Validate Supabase JWT and return backend session context (role, student_profile_id, feature flags). | None (JWT is the auth) |
| `POST` | `/auth/sign-out` | Invalidate active backend session. | Required |
| `GET` | `/auth/me` | Return current authenticated user's role, display name, and student_profile_id (if student). | Required |

### `POST /auth/session` Response Shape

```json
{
  "user_id": "uuid",
  "role": "student",
  "display_name": "string",
  "student_profile_id": "uuid or null",
  "is_placement_complete": true,
  "placement_band": 2
}
```

---

## Group 2 — Student Profile (`/students`)

Student-owned endpoints. All paths are scoped to the authenticated student; cross-student access is blocked by the backend.

| Method | Path | Description |
|---|---|---|
| `GET` | `/students/me` | Return authenticated student's profile (display name, placement band, enrollment info). |
| `GET` | `/students/me/skill-states` | Return all `StudentSkillState` records for the student. Used by progress screen. |
| `GET` | `/students/me/skill-states/{skill_id}` | Return a single skill state for the student. |
| `GET` | `/students/me/progress` | Return a `ProgressReport` summary generated by AIM Engine. |

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
      "weakness_score": 0.21,
      "learning_style": "example_first",
      "last_reviewed_at": "2026-06-01T14:00:00Z"
    }
  ],
  "overall_progress_pct": 48.0,
  "current_band": 2
}
```

**Learner-safe rule:** `frustration_score`, `forgetting_lambda`, and `prerequisite_gap_flag` are not included in the student-facing response. They are available in the admin-scoped endpoint only.

---

## Group 3 — Lessons (`/lessons`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/lessons/{lesson_id}` | Return a lesson with its blocks and content payload. Only published lessons served. |
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

---

## Group 4 — Sessions (`/sessions`)

Session lifecycle and attempt submission endpoints.

| Method | Path | Description |
|---|---|---|
| `POST` | `/sessions` | Start a new learning session. Returns `session_id`. |
| `GET` | `/sessions/{session_id}` | Return current session state (status, progress). |
| `POST` | `/sessions/{session_id}/attempts` | Batch-submit question attempts for the session. |
| `POST` | `/sessions/{session_id}/ai-teacher` | Record an AI Teacher invocation event in the session. |
| `POST` | `/sessions/{session_id}/complete` | Mark the session complete and trigger AIM Engine processing. |
| `POST` | `/sessions/{session_id}/abandon` | Mark the session abandoned. Records partial attempt data. |

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

Accepts a batch of attempts. One call per session-end (or mid-session checkpoint).

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

Triggers AIM Engine processing synchronously. Returns the AIM output.

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

---

## Group 5 — AIM Engine Outputs (`/aim`)

Read-only endpoints that expose AIM Engine outputs to the mobile app and admin dashboard.

| Method | Path | Description |
|---|---|---|
| `GET` | `/aim/students/me/next-action` | Return the current AIM recommendation for the authenticated student. |
| `GET` | `/aim/students/me/recommendations` | Return recommendation history with outcome tracking data. |
| `GET` | `/aim/students/me/remediation` | Return any active remediation triggers for the student. |

### `GET /aim/students/me/next-action` Response

```json
{
  "student_id": "uuid",
  "recommended_lesson_id": "uuid",
  "lesson_type": "review",
  "primary_skill_ids": ["uuid"],
  "recommendation_reason": "retention_review",
  "action_type": "REVIEW",
  "confidence_score": 0.87,
  "learner_message": "Refresh this skill before moving on.",
  "generated_at": "2026-06-07T10:05:00Z"
}
```

**Note:** `confidence_score` is not shown to the student in the mobile UI. It is included here for admin dashboard display. The mobile app shows only `learner_message` and the lesson card.

---

## Group 6 — Review Schedule (`/reviews`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/reviews/students/me/due` | Return skills currently due for review (retention below 70%). |
| `GET` | `/reviews/students/me/schedule` | Return full review schedule with predicted review dates. |

### `GET /reviews/students/me/due` Response

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

---

## Group 7 — Micro-Goals (`/goals`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/goals/students/me` | Return current active micro-goals (daily, weekly, monthly). |

### `GET /goals/students/me` Response

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
    },
    {
      "goal_id": "uuid",
      "goal_type": "weekly",
      "skill_name": "Present Perfect",
      "goal_text": "Reach 80% mastery on Present Perfect.",
      "is_achieved": false,
      "target_date": "2026-06-14"
    }
  ]
}
```

---

## Group 8 — Admin: Students (`/admin/students`)

Requires `pilot_admin` or `project_owner` role. All student data is accessible within the pilot cohort.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/students` | List all pilot students with profile and placement status. |
| `GET` | `/admin/students/{student_id}` | Full student profile including placement, AIM state, and session history. |
| `GET` | `/admin/students/{student_id}/skill-states` | Full `StudentSkillState` including `frustration_score`, `forgetting_lambda`, and `prerequisite_gap_flag`. |
| `GET` | `/admin/students/{student_id}/sessions` | Session history with completion status, behavioral signals, and AIM processing results. |
| `GET` | `/admin/students/{student_id}/recommendations` | Full recommendation history with outcome tracking. |
| `GET` | `/admin/students/{student_id}/next-action` | Same as student endpoint but includes `confidence_score` and full AIM debug output. |

### `GET /admin/students/{student_id}/skill-states` Response

Includes all `StudentSkillState` fields, including fields not exposed to the student.

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

---

## Group 9 — Admin: Content (`/admin/content`)

Requires `content_manager`, `pilot_admin`, or `project_owner` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/content/lessons` | List all lessons (published and draft). |
| `GET` | `/admin/content/lessons/{lesson_id}` | Full lesson detail including draft status, version, and review flags. |
| `GET` | `/admin/content/questions` | List all questions with skill, difficulty, and quality flag status. |
| `GET` | `/admin/content/quality-flags` | List unresolved content quality flags for review. |
| `PATCH` | `/admin/content/quality-flags/{flag_id}` | Resolve a content quality flag with a resolution note. |

---

## Group 10 — Admin: Reports (`/admin/reports`)

Requires `pilot_admin` or `project_owner` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/reports/cohort-summary` | Cohort-level progress summary: completion rates, average mastery, common weaknesses. |
| `GET` | `/admin/reports/students/{student_id}/progress` | Full progress report for a student (all time or by date range). |
| `GET` | `/admin/reports/aim-recommendations` | Recommendation log across all students, filterable by `action_type` and `recommendation_reason`. |
| `GET` | `/admin/reports/audit-log` | Scoped audit log entries, filterable by `action`, `entity_type`, and date range. |

### `GET /admin/reports/cohort-summary` Response

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

---

## Group 11 — Admin: Overrides (`/admin/overrides`)

Requires `pilot_admin` or `project_owner` role. All overrides are audit-logged automatically.

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/overrides/students/{student_id}/reset-placement` | Reset a student's placement and re-initialize skill states. |
| `POST` | `/admin/overrides/students/{student_id}/reset-skill` | Reset a specific skill state for a student. |
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

---

## AIM Engine Internal API

The AIM Engine is a Python module within the backend service. It is not an HTTP service. It is called via internal function calls from the backend API layer. The following describes the internal call contracts.

### Internal Call 1: `aim.process_placement_result(placement_result)`

Called after a student completes the placement test.

**Input:** `PlacementTestResult` entity fields as defined in `docs/aim-engine/boundary-and-io-contract.md` Input 1.
**Returns:** Initialized `StudentSkillState` list for the student's entry band.
**Side effects:** Writes `StudentSkillState` records. Emits an `AIMRecommendation` (first lesson).

### Internal Call 2: `aim.process_session_result(session_result)`

Called when the backend receives `POST /sessions/{id}/complete`.

**Input:** `LearningSession` + `QuestionAttempt[]` + `SessionBehavioralSignal` + `AITeacherInvocation[]`.
**Returns:** Updated `StudentSkillState[]`, new `AIMRecommendation`, any `RemediationTrigger`, updated `ReviewSchedule`.
**Side effects:** Writes updated states, recommendation, and triggers. Logs to `AuditLog`.

### Internal Call 3: `aim.process_ai_teacher_invocation(invocation)`

Called after each AI Teacher interaction is recorded via `POST /sessions/{id}/ai-teacher`.

**Input:** `AITeacherInvocation` entity fields.
**Returns:** Updated `frustration_score_contribution` signal for the session.

### Internal Call 4: `aim.apply_admin_override(override)`

Called when an admin override endpoint is hit.

**Input:** `AdminOverride` entity fields.
**Returns:** Confirmation of state change applied.
**Side effects:** Writes updated `StudentSkillState`. Writes `AdminOverride` entity. Writes `AuditLog` entry.

---

## AI Teacher Gateway Internal API

The AI Teacher gateway is a backend-internal proxy for LLM calls. It is not exposed externally.

### Internal Call: `ai_teacher.explain(hook_type, skill_id, question_context)`

**Input:**

| Field | Type | Description |
|---|---|---|
| `hook_type` | enum | One of: `explain_more`, `give_example`, `explain_step`, `explain_why`, `retry_with_help`. |
| `skill_id` | UUID | Skill being explained. |
| `question_context` | object | The question the student was on, the student's answer, and correctness. |
| `student_band` | int | Student's current placement band. Influences explanation complexity. |
| `invocation_count` | int | Number of AI Teacher calls this session. Influences response length and depth. |

**Returns:** `{ explanation_text: string, estimated_tokens_used: int }`

**Rules:**
- AI provider keys are read from backend environment only.
- Response is stored in the session audit log for human review.
- No raw LLM response is forwarded to Flutter. Only `explanation_text` is returned.
- Explanations must follow rules in `docs/ai-teacher/behavior-rules.md`.

---

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
| `409` | `CONFLICT` | e.g., session already completed, duplicate attempt batch. |
| `422` | `UNPROCESSABLE` | Request shape valid but business rules violated. |
| `500` | `SERVER_ERROR` | Unexpected internal error. |
| `503` | `AIM_UNAVAILABLE` | AIM Engine processing failed after retries. Session data preserved. |

---

## API Conventions

| Convention | Rule |
|---|---|
| IDs | All IDs are UUIDs. Never use sequential integers in external responses. |
| Timestamps | Always UTC ISO 8601 (`2026-06-07T10:00:00Z`). |
| Pagination | List endpoints use `limit` + `offset` query params. Default limit: 50. Max limit: 200. |
| Learner-safe filtering | Student-facing endpoints never expose `frustration_score`, `forgetting_lambda`, `weakness_score`, or `prerequisite_gap_flag` in responses. |
| Soft deletes | No hard deletes for student data. Use `is_active: false` or `completion_status: abandoned`. |
| Versioning | API version prefix is `/v1/` in Phase 1. Omitted from this document for brevity but must be added at implementation. |

---

## What the Mobile App Must Never Do

| Prohibited | Reason |
|---|---|
| Call AIM Engine endpoints directly | AIM Engine is backend-internal only. |
| Call AI Teacher gateway | AI provider keys must not be in the client. |
| Compute mastery or difficulty scores locally | Client-side computation is inconsistent and manipulable. |
| Store AI provider keys | Security non-negotiable. |
| Decide next lesson without a backend API call | Selection requires full skill state history held server-side. |
| Read another student's data | Every student endpoint is scoped to the authenticated user. |

---

## Non-Goals

- This document does not implement FastAPI routes.
- This document does not define OpenAPI/Swagger specs (deferred to Phase 1 implementation).
- This document does not define WebSocket or real-time push endpoints (post-MVP).
- This document does not define rate limiting policies (Phase 1 engineering decision).
- This document does not create a Student Web App.
- This document does not move AIM Engine logic into Flutter.

---

## Assumptions

- All external API traffic uses HTTPS. HTTP is not supported.
- Backend is a single FastAPI service in MVP. Microservice decomposition is post-MVP.
- The mobile app is React web for the first pilot. The same API contract applies when Flutter is built.
- Supabase Auth JWT is passed on every authenticated request. The backend validates it independently.
- AIM Engine processing on session complete is synchronous in MVP (inline with the API response). Async processing is a post-MVP resilience improvement for high-load scenarios.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should session attempt submission support mid-session checkpoints (progressive batches), or only full batch on complete? | MVP assumes full batch at session complete. Progressive checkpoints are a post-MVP resilience feature for interrupted sessions. |
| Should `GET /aim/students/me/next-action` be called proactively by the app on launch, or only after session complete? | Recommend on both: app launch (to prime the dashboard) and post-session (to refresh the recommendation). Confirm during Phase 1 frontend planning. |
| Should the admin dashboard use the same backend API or a separate admin API service? | Same backend service with role-scoped endpoints in MVP. Separate service is a post-MVP scaling option. |
| Should the `ProgressReport` endpoint compute on demand or serve a pre-generated snapshot? | Serve pre-generated snapshot (cached at session end). On-demand recompute is available only for admin export endpoints. |
| What is the maximum batch size for `POST /sessions/{id}/attempts`? | Open. Suggest 100 attempts per call for MVP. This covers the maximum expected questions per session. |

---

## Related Documents

- `docs/aim-engine/boundary-and-io-contract.md` — AIM Engine input/output contracts this API exposes externally.
- `docs/data/initial-data-model.md` — Entity model driving all request/response shapes.
- `docs/product/roles-and-permissions.md` — Role-based access rules all API groups enforce.
- `docs/journeys/student-journey.md` — Student session flow calling Groups 3, 4, 5, 6, 7.
- `docs/journeys/admin-journey.md` — Admin dashboard operations calling Groups 8, 9, 10, 11.
- `docs/ai-teacher/behavior-rules.md` — AI Teacher behavior rules the gateway enforces.
- `docs/security/ai-safety-privacy-rules.md` (P0-022) — Data minimization and key protection rules all groups must follow.

---

## Acceptance Notes

- Dependencies checked: P0-014 (`docs/aim-engine/boundary-and-io-contract.md` present) and P0-016 (`docs/data/initial-data-model.md` present).
- This document covers 11 API groups, internal AIM Engine call contracts, AI Teacher gateway contract, error conventions, mobile app prohibitions, assumptions, non-goals, and open questions.
- No FastAPI code, database migrations, Flutter code, OpenAPI specs, or runtime implementation was added.
- Task is ready to mark Done in Notion.
