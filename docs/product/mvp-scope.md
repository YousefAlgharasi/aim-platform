# AIM MVP Scope

## Purpose

This document defines the completed AIM MVP pilot scope so Phase 0 and Phase 1 planning can preserve the historical pilot baseline without confusing it with post-MVP Phase 1 direction.

## Historical Baseline Note

The MVP pilot described in this document is completed.

The completed MVP pilot used:

- React Web learner interface.
- FastAPI backend API.
- Python backend AIM Engine.
- Supabase PostgreSQL.
- Supabase Auth.

Post-MVP Phase 1 direction is different:

- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains a backend service/module.
- Supabase PostgreSQL/Auth remain the default unless changed by a later documented decision.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

Do not treat the completed React Web MVP pilot interface as the future post-MVP student client.

## Scope

The MVP scope covers the first validated AIM web/cloud pilot: a small cohort of Arabic-speaking A1 English learners using React Web, FastAPI, Supabase Auth, Supabase PostgreSQL, and the backend Python AIM Engine.

This document is planning documentation only. It does not implement backend code, frontend code, Flutter code, database migrations, admin dashboard runtime code, or AIM Engine runtime code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as the product direction source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked and used for product and technical guardrails. |

## MVP Goal

The MVP proved whether the AIM Adaptive Intelligence Module could guide beginner English practice safely and usefully during a two-week cloud web pilot.

The MVP answered:

- Can learners complete short A1 English lessons and attempts reliably?
- Can the backend record learning evidence and return a complete adaptive result?
- Can AIM recommendations support review, continuation, or difficulty decisions without unsafe shortcuts?
- Can the project team measure learning gain and recommendation usefulness?
- Can the system preserve strict backend-owned AIM boundaries?

## Completed MVP Pilot Platform

| Layer | Completed MVP Pilot Scope |
|---|---|
| Learner interface | React Web pilot interface |
| Backend API | FastAPI API and orchestration |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth with backend JWT verification |
| AIM Engine | Python backend adaptive intelligence |
| Content | A1 English pilot lessons for Arabic-speaking learners |
| Operations | Internal pilot/admin/debug visibility |

## Post-MVP Phase 1 Clarification

| Layer | Post-MVP Phase 1 Direction |
|---|---|
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| Database | Supabase PostgreSQL unless changed by a later documented decision |
| Auth | Supabase Auth unless changed by a later documented decision |
| AIM Engine | Python AIM Engine as a backend service/module |
| Student Web App | Not planned unless a later documented product decision changes this |

FastAPI belongs to the completed MVP pilot backend API context only. It must not be described as the post-MVP Phase 1 Backend API.

Flutter Mobile is the approved post-MVP Phase 1 learner client. It consumes backend APIs and AIM outputs only. It must not run, duplicate, approximate, or reimplement AIM Engine logic.

## MVP Users

| User | In Completed MVP Pilot | Notes |
|---|---|---|
| Student | Yes | Primary learner experience. |
| Pilot Admin | Yes | Internal pilot monitoring and support. |
| Content Manager | Yes, planning and limited internal workflow | Needed to prepare and review lesson content. |
| Human Reviewer | Yes, planning and scoped review workflow | Needed for safety and content quality review. |
| Parent or Guardian | Conditional | Include only if later scope confirms low-risk parent progress visibility. |
| Teacher/Classroom Owner | No | Future expansion. |
| Public Visitor | No runtime product scope | Marketing/invitation pages are outside learning MVP unless explicitly approved later. |

## MVP Learner Experience

The completed learner-facing MVP included:

- Account sign-in for pilot learners.
- Learner dashboard with assigned lessons and progress summary.
- Short A1 lesson view.
- Question/session flow for answering lesson items.
- Answer submission with captured attempt evidence.
- Learner-safe feedback after attempts or sessions.
- Adaptive result screen showing backend-generated recommendation and next step.
- Basic progress/review view for completed lessons and skill progress.

## MVP Backend Scope

The completed MVP backend included:

- Authenticated learner identity from Supabase Auth.
- Student profile and pilot cohort association.
- Lesson and question retrieval from approved content.
- Session creation and attempt recording.
- AIM Engine orchestration in Python/backend.
- Adaptive result persistence and API response.
- Recommendation outcome tracking where needed for pilot analysis.
- Audit/explanation logs needed to inspect AIM behavior safely.
- Admin/debug endpoints needed for pilot operations.

## MVP AIM Engine Scope

The AIM Engine MVP included the validated adaptive pipeline needed for pilot sessions:

- Attempt validation.
- Performance analysis.
- Evidence quality and reliability calculation.
- No-speed mastery calculation.
- Weakness detection.
- Error pattern classification.
- Safe emotional or behavioral signal detection.
- Retention update.
- Learning response pattern detection.
- Prerequisite gap detection.
- Transfer learning detection when enough evidence exists.
- Fairness audit.
- Decision conflict resolution as final action authority.
- Recommendation generation from the resolved decision.
- Prompt adaptation instruction.
- Outcome tracking for previous recommendations where supported.

Speed may appear only as educational behavior evidence such as hesitation, rushing, possible guessing, fatigue or distraction signal, or low confidence signal. Speed, response time, average response time, and speed score must not directly raise mastery, student level, or difficulty.

## MVP Content Scope

Pilot content included:

- Six to ten short A1 English lessons, or a narrowed count selected by content planning.
- A shared pre-test and post-test or equivalent pilot measurement.
- Questions with required metadata:
  - `skill_id`
  - concept
  - difficulty
  - prerequisites
  - common error tags
  - correct answer
  - choices where applicable
  - explanation
  - language support notes where useful for Arabic-speaking learners

## MVP Admin and Review Scope

Internal pilot support included:

- View pilot learner list and completion state.
- View lesson/session progress.
- Inspect adaptive result summaries.
- Inspect AIM audit or explanation outputs for safety and quality.
- Review content metadata completeness.
- Export or view pilot metrics needed for analysis.

Admin and review tools were internal MVP support surfaces, not a production-grade admin platform and not a separate Student Web App.

## MVP Measurement Scope

The pilot measured:

- Pre-test to post-test score change.
- Lesson completion.
- Attempt accuracy.
- Mastery change.
- Weakness reduction.
- Retention change.
- Recommendation action distribution.
- Recommendation followed rate where measurable.
- Recommendation outcome success where measurable.
- Safety issues, content issues, and poor question quality flags.

## MVP Security and Privacy Scope

The MVP included:

- Backend-side JWT verification.
- Backend-side role and data ownership checks.
- Server-only provider keys and privileged credentials.
- Learner-safe educational behavior language.
- Audit logging for cross-learner internal access where implemented.
- Data minimization for pilot reporting and review.

## MVP Acceptance Boundaries

MVP work was complete enough for pilot when:

- Pilot learners could sign in and complete assigned A1 learning sessions.
- The backend recorded attempts and returned the required adaptive result shape.
- AIM recommendations followed the decision conflict resolver.
- Mastery and difficulty behavior obeyed no-speed rules.
- Pilot admin/review surfaces provided enough visibility to operate and analyze the cohort.
- Content had metadata required by the AIM Engine.
- Basic security, privacy, and credential boundaries were enforced.

## Client and AIM Boundary Rules

All clients, including the completed React Web pilot client and the post-MVP Flutter Mobile client, may:

- Display lessons, questions, feedback, recommendations, and progress.
- Send learner actions and session evidence to the backend.
- Render backend-approved AIM outputs.

All clients, including the completed React Web pilot client and the post-MVP Flutter Mobile client, must not:

- Run or duplicate AIM Engine logic.
- Calculate mastery.
- Calculate student level.
- Calculate weakness.
- Calculate difficulty.
- Calculate retention.
- Generate recommendations locally.
- Override backend recommendation authority.
- Store AI provider keys.
- Store privileged backend credentials.
- Call the AI Teacher Gateway directly.

## Assumptions

- The completed MVP pilot had five Arabic-speaking A1 English learners.
- The completed MVP pilot ran for two weeks.
- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default for Phase 1 unless changed by a later documented decision.
- Parent access can be deferred without blocking the completed MVP pilot baseline.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Open Questions

| Question | Current Handling |
|---|---|
| Is parent or guardian access part of Phase 1? | Conditional; defer unless later tasks explicitly include it. |
| Is the MVP lesson count six, ten, or another number in range? | Content planning should narrow the exact count for future pilots. |
| Which admin views are mandatory for Phase 1 operations? | Admin journey and sitemap tasks should define the minimum viable set. |
| What is the exact Phase 1 hosting/deployment provider? | Deployment planning should decide; Supabase is already selected as the default auth/database direction unless changed later. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/out-of-scope.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/phase-0-readiness-checklist.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, completed MVP boundaries, post-MVP clarification, assumptions, and open questions.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- No clinical, medical, or diagnostic learner labels were introduced.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
