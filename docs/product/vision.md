# AIM Product Vision

## Purpose

This document defines the product vision for AIM so Phase 0 planning, completed MVP pilot learning, and post-MVP Phase 1 direction share one product reference.

## Scope

This vision covers the AIM learning product, platform components, completed MVP pilot outcomes, post-MVP Phase 1 platform direction, and boundaries between learner-facing clients, backend services, and the AIM Engine. It is planning documentation only and does not implement backend, frontend, database, Flutter, or algorithm behavior.

## Vision Statement

AIM is an adaptive English learning platform for Arabic-speaking A1 learners. It uses structured lesson content, student attempt evidence, and the backend AIM Adaptive Intelligence Module to recommend what each learner should practice next.

The product should help a small pilot cohort learn through short guided lessons, safe adaptive feedback, and measurable progress while giving the project team enough evidence to validate the AIM algorithm before expanding the platform into the approved post-MVP Phase 1 mobile direction.

## Target Learners

| Audience | MVP Role | Need |
|---|---|---|
| Arabic-speaking A1 English learners | Primary learner | Practice beginner English with clear guidance, simple feedback, and adaptive review. |
| Pilot operator or admin | Internal operator | Monitor learner progress, content completion, and AIM recommendation behavior. |
| Content reviewer | Internal reviewer | Check lesson quality, question metadata, and adaptive suitability before pilot use. |

## Product Components

| Component | Product Direction | Notes |
|---|---|---|
| Completed MVP pilot learner interface | React Web learner interface | Used for the completed MVP pilot only. This does not create a separate post-MVP Student Web App commitment. |
| Post-MVP Phase 1 learner client | Flutter Mobile | Approved learner client for post-MVP Phase 1. Flutter Mobile consumes backend APIs and AIM outputs only. |
| Completed MVP pilot backend API | FastAPI | Used for the completed MVP pilot API and AIM orchestration layer. |
| Post-MVP Phase 1 backend API | NestJS + TypeScript | Approved target Backend API for Phase 1 unless changed by a later documented decision. |
| AIM Engine | Python backend adaptive intelligence | AIM calculates mastery, weakness, retention, reliability, decision conflict resolution, difficulty adaptation, and recommendations. |
| Supabase PostgreSQL | Pilot and Phase 1 default database | Used for completed MVP pilot persistence and remains the Phase 1 default unless changed by a later documented decision. |
| Supabase Auth | Pilot and Phase 1 default authentication | JWT verification and privileged auth handling belong on the backend/server side. |
| A1 content package | Pilot learning material and Phase 1 foundation | Lessons and questions must include metadata needed by the AIM Engine. |
| Admin/debug views | Internal product support | Used to inspect progress, recommendation behavior, and audit signals. They are not a separate learner-facing Student Web App. |

## MVP Product Outcomes

- The completed MVP pilot used a React Web learner interface, FastAPI backend API, Python backend AIM Engine, Supabase PostgreSQL, and Supabase Auth.
- Five Arabic-speaking A1 learners could complete a two-week web pilot.
- Learners could sign in, complete lessons, answer questions, receive adaptive results, and review progress.
- The backend recorded attempts and returned a complete adaptive result from the AIM pipeline.
- The project team could evaluate learning gain, recommendation usefulness, and algorithm safety.
- Speed and response time were treated only as behavioral evidence, never as direct mastery or level signals.

## Product Non-Negotiables

- AIM Engine logic remains Python/backend-owned.
- Clients must not run or duplicate AIM Engine logic.
- Clients must not calculate mastery, weakness, difficulty, retention, or recommendations locally.
- AI provider keys and privileged credentials remain backend/server-only.
- Speed and response time are behavioral evidence only and must not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language must remain educational and non-clinical.

## Product Non-Goals

- Do not build a production-scale public learning marketplace in MVP or Phase 0.
- Do not turn Phase 0 into backend, frontend, Flutter, database, or AIM Engine implementation work.
- Do not introduce a separate Student Web App as a post-MVP Phase 1 deliverable unless a later documented product decision changes this.
- Do not treat the completed React Web MVP pilot interface as a planned post-MVP Student Web App.
- Do not move AIM algorithm logic into Flutter Mobile or any other client.
- Do not expose AI provider keys or privileged backend credentials to client apps.
- Do not use clinical, medical, or diagnostic language for learner behavior.
- Do not use speed or response time to directly change mastery, student level, or directly increase difficulty.

## Platform Direction

The completed MVP pilot stack was:

| Layer | Completed MVP Pilot Technology |
|---|---|
| Learner interface | React Web |
| Backend API | FastAPI |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth with backend JWT verification |
| Algorithm | Python backend AIM Engine |
| Pilot cohort | 5 Arabic-speaking A1 English learners |
| Pilot duration | 2 weeks |

The post-MVP Phase 1 target stack is:

| Layer | Post-MVP Phase 1 Target Technology |
|---|---|
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| Database | Supabase PostgreSQL unless changed by a later documented decision |
| Auth | Supabase Auth unless changed by a later documented decision |
| Algorithm | Python AIM Engine as a backend service/module |

No separate Student Web App is planned for post-MVP Phase 1 unless a later documented product decision changes this.

Flutter Mobile is the approved Phase 1 post-MVP learner client. It must consume backend outputs and must not run, duplicate, or approximate AIM Engine logic locally.

## Product Decisions

| Decision | Status | Reason |
|---|---|---|
| Preserve the completed MVP pilot as React Web + FastAPI + Supabase PostgreSQL/Auth + Python AIM Engine. | Accepted | The historical pilot direction remains important evidence and should not be rewritten as the Phase 1 target stack. |
| Use Flutter Mobile as the post-MVP Phase 1 learner client. | Accepted | The product direction has moved from web pilot validation to a mobile learner experience. |
| Use NestJS + TypeScript as the post-MVP Phase 1 Backend API. | Accepted | Phase 1 needs a TypeScript backend API target while keeping AIM intelligence in Python/backend. |
| Do not plan a separate post-MVP Student Web App. | Accepted | The React Web interface belongs to the completed MVP pilot unless a later documented product decision changes the roadmap. |
| Keep AIM Engine in Python/backend. | Accepted | Protects algorithm consistency, auditability, and credential safety. |
| Use educational behavior language only. | Accepted | Avoids unsafe or inappropriate learner labeling. |
| Treat speed as behavioral evidence only. | Accepted | Prevents unfair mastery, level, or direct difficulty changes based on response time. |

## Assumptions

- Pilot learners are beginner English learners whose first language is Arabic.
- Phase 0 output is used to create implementation-ready Phase 1 tasks, but Phase 0 itself remains planning work.
- Existing backend and AIM algorithm work remains the foundation; Phase 0 should clarify product direction, not replace architecture.
- Completed MVP pilot decisions remain documented for historical clarity and validation evidence.
- Post-MVP Phase 1 uses Flutter Mobile for the learner client and NestJS + TypeScript for the Backend API.
- Supabase Auth and PostgreSQL remain the intended pilot and Phase 1 services unless a later documented decision changes this.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Related Documents

- `AGENTS.md`
- `README.md`
- `docs/AIM_ALGORITHM_TEST_PLAN.md`
- `docs/AIM_023_PILOT_READINESS.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: none.
- This document has a title, purpose, scope, decisions, assumptions, non-goals, and product-level platform direction.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- No runtime source code, separate Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
