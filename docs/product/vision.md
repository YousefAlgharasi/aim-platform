# AIM Product Vision

## Purpose

This document defines the product vision for AIM so Phase 0 planning and Phase 1 implementation can share one product direction.

## Scope

This vision covers the AIM learning product, platform components, MVP pilot direction, and boundaries between learner-facing apps, backend services, and the AIM Engine. It is planning documentation only and does not implement backend, frontend, database, or algorithm behavior.

## Vision Statement

AIM is an adaptive English learning platform for Arabic-speaking A1 learners. It uses structured lesson content, student attempt evidence, and the backend AIM Adaptive Intelligence Module to recommend what each learner should practice next.

The product should help a small pilot cohort learn through short guided lessons, safe adaptive feedback, and measurable progress while giving the project team enough evidence to validate the AIM algorithm before expanding the platform.

## Target Learners

| Audience | MVP Role | Need |
|---|---|---|
| Arabic-speaking A1 English learners | Primary learner | Practice beginner English with clear guidance, simple feedback, and adaptive review. |
| Pilot operator or admin | Internal operator | Monitor learner progress, content completion, and AIM recommendation behavior. |
| Content reviewer | Internal reviewer | Check lesson quality, question metadata, and adaptive suitability before pilot use. |

## Product Components

| Component | MVP Direction | Notes |
|---|---|---|
| React web frontend | First pilot learner interface | The first pilot is web and cloud based. Flutter is not part of the first pilot. |
| FastAPI backend | Product API and AIM orchestration layer | The backend owns auth integration, persistence, session flow, and AIM Engine calls. |
| AIM Engine | Python backend adaptive intelligence | AIM calculates mastery, weakness, retention, reliability, decision conflict resolution, and recommendations. |
| Supabase PostgreSQL | Cloud pilot database | Used for pilot persistence after local validation. |
| Supabase Auth | Cloud pilot authentication | JWT verification belongs on the backend. |
| A1 content package | Pilot learning material | Lessons and questions must include metadata needed by the AIM Engine. |
| Admin/debug views | Internal pilot support | Used to inspect progress, recommendation behavior, and audit signals. |

## MVP Product Outcomes

- Five Arabic-speaking A1 learners can complete a two-week web pilot.
- Learners can sign in, complete lessons, answer questions, receive adaptive results, and review progress.
- The backend records attempts and returns a complete adaptive result from the AIM pipeline.
- The project team can evaluate learning gain, recommendation usefulness, and algorithm safety.
- Speed and response time are treated only as behavioral evidence, never as direct mastery or level signals.

## Product Non-Goals

- Do not build a production-scale public learning marketplace in MVP.
- Do not build the Student Web App during Phase 0.
- Do not move AIM algorithm logic into Flutter or any client.
- Do not expose AI provider keys or privileged backend credentials to client apps.
- Do not use clinical, medical, or diagnostic language for learner behavior.
- Do not expand to mobile-first Flutter pilot before the web/cloud pilot validates the algorithm.

## Platform Direction

The first pilot platform is:

| Layer | Technology |
|---|---|
| Frontend | React web |
| Backend | FastAPI |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth with backend JWT verification |
| Algorithm | Python backend AIM Engine |
| Pilot cohort | 5 Arabic-speaking A1 English learners |
| Pilot duration | 2 weeks |

Flutter remains a later client option. When Flutter is introduced, it must consume backend outputs and must not run or duplicate AIM Engine logic.

## Product Decisions

| Decision | Status | Reason |
|---|---|---|
| Complete and validate the AIM algorithm before broader product expansion. | Accepted | The adaptive engine is the core product risk. |
| Use web/cloud pilot first. | Accepted | Faster pilot setup and easier instrumentation than mobile release flow. |
| Keep AIM Engine in Python/backend. | Accepted | Protects algorithm consistency, auditability, and credential safety. |
| Use educational behavior language only. | Accepted | Avoids unsafe or inappropriate learner labeling. |
| Treat speed as behavioral evidence only. | Accepted | Prevents unfair mastery or difficulty changes based on response time. |

## Assumptions

- Pilot learners are beginner English learners whose first language is Arabic.
- Phase 0 output is used to create implementation-ready Phase 1 tasks.
- Existing backend and AIM algorithm work remains the foundation; Phase 0 should clarify product direction, not replace architecture.
- Supabase Auth and PostgreSQL are the intended cloud pilot services unless a later documented decision changes this.

## Related Documents

- `AGENTS.md`
- `README.md`
- `docs/AIM_ALGORITHM_TEST_PLAN.md`
- `docs/AIM_023_PILOT_READINESS.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: none.
- This document has a title, purpose, scope, decisions, assumptions, non-goals, and implementation-ready platform direction.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

