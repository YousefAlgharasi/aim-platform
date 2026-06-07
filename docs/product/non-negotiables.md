# AIM Product Non-Negotiables

## Purpose

This document records AIM product and technical rules that later planning and implementation tasks must preserve.

## Scope

These rules apply to Phase 0 planning, Phase 1 implementation planning, backend AIM algorithm work, pilot product work, and future client applications. This is documentation only and does not change runtime behavior.

## Hard Rules

| Area | Non-Negotiable | Acceptance Signal |
|---|---|---|
| AIM Engine location | AIM algorithm logic runs only in the Python backend AIM Engine. | Clients receive AIM outputs from the backend instead of calculating mastery, level, or recommendations locally. |
| Mastery fairness | Response time, average response time, and speed score must not affect mastery, student level, or direct difficulty increase. | Mastery logic uses accuracy, consistency, retention, difficulty performance, evidence quality, penalties, reliability, caps, and clamping only. |
| Speed usage | Speed may be used only as educational behavior evidence. | Speed appears only in hesitation, rushing, possible guessing, fatigue or distraction, low confidence, or session behavior analysis. |
| Decision authority | Final recommendation action must match the decision conflict resolver output. | Recommendation action equals the resolved selected action. |
| Educational safety | AIM uses educational and behavioral language only. | No medical, clinical, or diagnostic learner labels appear in product copy, reports, or algorithm explanations. |
| Credential safety | AI provider keys and privileged backend credentials must never be exposed to clients. | Secrets exist only in backend/server environments. |
| Pilot platform | First real pilot is React web plus FastAPI plus Supabase. | Flutter is excluded from the first pilot scope. |
| Phase 0 boundary | Phase 0 is planning and documentation only. | No backend, frontend, database migration, AIM Engine, or runtime app code is implemented for Phase 0 tasks. |

## Architecture Rules

- Preserve the backend AIM ownership boundary: frontend clients send user actions and receive API outputs.
- Keep adaptive intelligence, mastery calculation, recommendation generation, audit logs, and conflict resolution in backend services.
- Use FastAPI for backend API planning and implementation.
- Use SQLAlchemy and Alembic for persistence planning and migrations when implementation starts.
- Use Supabase PostgreSQL and Supabase Auth for the cloud pilot.
- Keep local SQLite only where already supported for development or testing.
- Do not rewrite the whole architecture as part of Phase 0 or a single implementation task.

## Algorithm Rules

Mastery must be based on this no-speed formula family:

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

Difficulty may increase only when all required evidence is strong:

| Metric | Required Condition |
|---|---|
| Mastery | `>= 85` |
| Consistency | `>= 75` |
| Reliability | `>= 0.70` |
| Weakness score | `< 50` |
| Frustration score | `< 60` |
| Retention | `>= 70` |

Difficulty must not increase when reliability is low, frustration is high, prerequisite gaps are severe, or the only positive signal is speed.

## Product Safety Language

Allowed learner behavior terms:

- low confidence signal
- possible guessing
- rushing
- hesitation
- high frustration signal
- prerequisite gap
- weak retention
- concept misunderstanding

Forbidden language:

- medical diagnosis
- clinical psychological labels
- mental health claims
- any statement that diagnoses a learner

## Client Boundaries

React web and future Flutter clients may:

- Display lessons, questions, feedback, recommendations, and progress.
- Send attempts, answer changes, hint usage, skips, and session events to the backend.
- Render AIM outputs returned by the backend.

React web and future Flutter clients must not:

- Calculate mastery, student level, adaptive decisions, or recommendation authority.
- Store AI provider keys or backend service credentials.
- Override the backend decision conflict resolver.
- Run private AIM Engine logic.

## Phase 0 Non-Implementation Rule

During Phase 0, work is limited to planning documents such as product scope, journeys, content rules, data planning, API planning, security rules, risk logs, and readiness checks.

Phase 0 tasks must not create:

- Backend runtime code.
- React Student Web App implementation.
- Flutter app implementation.
- Database migrations.
- AIM Engine algorithm code.
- Admin dashboard runtime code.

## Open Decisions

| Decision | Current Position | Owner |
|---|---|---|
| Exact pilot hosting provider for FastAPI and React | Not locked in this task; Supabase is locked for auth and database. | Future deployment planning task |
| Final lesson count for MVP pilot | Target range is 6 to 10 short A1 lessons unless later content planning narrows it. | Content planning task |
| Admin dashboard depth for MVP | Internal/debug support is expected; full production admin is later scope. | Admin journey and sitemap tasks |

## Related Documents

- `AGENTS.md`
- `README.md`
- `docs/AIM_ALGORITHM_TEST_PLAN.md`
- `docs/AIM_023_PILOT_READINESS.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: none.
- This document has a title, purpose, scope, hard rules, safety language, client boundaries, and open decisions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

