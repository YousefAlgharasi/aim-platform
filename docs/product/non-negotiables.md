# AIM Product Non-Negotiables

## Purpose

This document defines the AIM product and technical rules that must remain true across Phase 0 planning, Phase 1 implementation planning, completed MVP pilot references, and future platform work.

## Scope

These rules apply to:

- Completed MVP pilot documentation.
- Post-MVP Phase 1 planning.
- Backend API planning.
- Flutter Mobile planning.
- AIM Engine planning.
- Admin/internal tooling.
- Any future client app.

This document is planning documentation only. It does not implement backend code, frontend code, Flutter code, database migrations, AIM Engine code, or runtime behavior.

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

## Hard Rules

| Area | Non-Negotiable | Acceptance Signal |
|---|---|---|
| AIM Engine ownership | AIM Engine logic remains Python/backend-owned. | AIM calculations happen in backend services, not in client apps. |
| Client boundary | Clients must not run, duplicate, approximate, or reimplement AIM Engine logic. | The completed React Web pilot client, post-MVP Flutter Mobile client, admin surfaces, and any future clients only render backend-approved outputs. |
| Local calculation ban | Clients must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally. | These values are produced by the backend AIM Engine and returned through backend APIs. |
| AI Teacher Gateway | AI Teacher Gateway remains backend-only. | Clients never call AI provider APIs directly. |
| Credential safety | AI provider keys and privileged backend credentials must never be exposed to clients. | Secrets exist only in backend/server environments. |
| Speed fairness | Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase. | Mastery and difficulty decisions do not use speed as a direct scoring component. |
| Speed usage | Speed may only be used as educational behavior evidence. | Speed appears only as signals such as hesitation, rushing, possible guessing, fatigue/distraction, low confidence, or session behavior analysis. |
| Decision authority | Final recommendation action must match the backend decision conflict resolver output. | The client cannot override the backend-selected recommendation action. |
| Learner safety language | Learner behavior language must remain educational, non-clinical, non-medical, and non-diagnostic. | Product copy, reports, AI explanations, and admin text do not diagnose learners. |
| Completed MVP pilot stack | React Web, FastAPI, Python backend AIM Engine, Supabase PostgreSQL, and Supabase Auth are preserved as completed MVP pilot context. | FastAPI is not described as the post-MVP Phase 1 Backend API. |
| Post-MVP Phase 1 stack | Flutter Mobile is the approved post-MVP Phase 1 learner client and NestJS + TypeScript is the post-MVP Phase 1 Backend API. | Flutter is not described as merely undecided/future in Phase 1 context. |
| Student Web App boundary | No separate Student Web App is planned for post-MVP unless a later documented product decision changes this. | React Web is described as the completed MVP pilot learner interface, not the future post-MVP student client. |
| Phase 0 boundary | Phase 0 remains planning/documentation only. | No runtime implementation is created by Phase 0 tasks. |

## Architecture Rules

- Preserve FastAPI only as the completed MVP pilot backend API.
- Use NestJS + TypeScript as the post-MVP Phase 1 Backend API unless a later documented technical decision changes this.
- Keep AIM Engine logic in Python as a backend service/module.
- Use Supabase PostgreSQL and Supabase Auth as the completed MVP pilot stack and Phase 1 default unless changed by a later documented decision.
- Keep adaptive intelligence, mastery calculation, student level decisions, weakness detection, difficulty adaptation, retention scheduling, recommendation generation, audit logs, and conflict resolution in backend services.
- Treat client apps as display and interaction layers only.
- Do not rewrite the architecture during Phase 0.
- Do not introduce a separate post-MVP Student Web App.

## Algorithm Rules

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

Difficulty may increase only when all required evidence is strong:

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
- The only positive signal is speed.
- The client attempts to infer or override backend decisions.

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
- needs review
- needs more practice

Forbidden language:

- medical diagnosis
- clinical psychological labels
- mental health claims
- disorder labels
- intelligence labels
- shame-based labels
- any statement that diagnoses a learner

## Client Boundaries

All client apps, including the completed React Web pilot client and the post-MVP Flutter Mobile client, may:

- Display lessons, questions, feedback, recommendations, and progress.
- Send attempts, answer changes, hint usage, skips, and session events to the backend.
- Render AIM outputs returned by the backend.
- Display learner-safe summaries generated or approved by the backend.

All client apps, including the completed React Web pilot client and the post-MVP Flutter Mobile client, must not:

- Calculate mastery.
- Calculate student level.
- Calculate weakness.
- Calculate difficulty.
- Calculate retention.
- Generate recommendations locally.
- Override backend recommendation authority.
- Run private AIM Engine logic.
- Duplicate AIM Engine logic.
- Approximate AIM Engine logic locally.
- Store AI provider keys.
- Store privileged backend credentials.
- Call the AI Teacher Gateway directly.
- Call AI provider APIs directly.

## Phase 0 Non-Implementation Rule

During Phase 0, work is limited to planning documents such as:

- product scope
- user journeys
- role and permission planning
- content rules
- data planning
- API planning
- security rules
- risk logs
- readiness checks
- quality audits

Phase 0 tasks must not create:

- Backend runtime code.
- React Web runtime implementation.
- Flutter Mobile app implementation.
- Database migrations.
- AIM Engine algorithm code.
- Admin dashboard runtime code.
- A separate Student Web App.

## Open Decisions

| Decision | Current Position | Owner |
|---|---|---|
| Exact hosting/deployment path for Phase 1 services | Not locked in this document. | Future deployment planning task |
| Final lesson count for MVP pilot | Target range is 6 to 10 short A1 lessons unless later content planning narrows it. | Content planning task |
| Admin dashboard depth for Phase 1 | Internal/debug support is expected; full production admin is later scope. | Admin journey and sitemap tasks |
| Parent access | Conditional until consent, linking, privacy, and product scope are approved. | Product Owner |

## Related Documents

- `docs/product/vision.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/open-decisions.md`
- `docs/product/risk-register.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: none.
- This document has a title, purpose, scope, current product direction, hard rules, architecture rules, algorithm rules, safety language, client boundaries, open decisions, related documents, and acceptance notes.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is preserved as the completed MVP pilot learner interface.
- FastAPI is preserved only as completed MVP pilot backend API context.
- Flutter Mobile is documented as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is documented as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- Client boundaries remain strict.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
