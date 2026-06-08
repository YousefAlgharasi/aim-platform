# AIM MVP Scope

## Purpose

> **Historical Baseline Note:** This document describes the completed MVP pilot scope. The MVP pilot used a React Web interface and has been closed. This document remains as the historical baseline reference for what the pilot covered. Phase 1 post-MVP scope — including the Flutter Mobile App — is documented in the technical baseline files (`docs/api/api-planning-baseline.md`, `docs/mobile/mobile-sitemap.md`). Do not mix the MVP pilot scope defined here with Phase 1 scope.

This document defines what belongs in the AIM MVP so Phase 1 implementation tasks can stay focused and avoid scope creep.

## Scope

The MVP scope covers the first validated web/cloud pilot for AIM: a small cohort of Arabic-speaking A1 English learners using React web, FastAPI, Supabase Auth, Supabase PostgreSQL, and the backend Python AIM Engine. This is planning documentation only and does not implement backend, frontend, database, Flutter, admin dashboard, or AIM Engine runtime code.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked locally and present. |
| P0-001 | `docs/product/non-negotiables.md` | Checked locally and present. |

## MVP Goal

The MVP proves whether the AIM Adaptive Intelligence Module can guide beginner English practice safely and usefully during a two-week cloud web pilot.

The MVP should answer:

- Can learners complete short A1 English lessons and attempts reliably?
- Can the backend record learning evidence and return a complete adaptive result?
- Can AIM recommendations support review, continuation, or difficulty decisions without unsafe shortcuts?
- Can the project team measure learning gain and recommendation usefulness?

## MVP Platform

| Layer | MVP Scope |
|---|---|
| Frontend | React web pilot interface |
| Backend | FastAPI API and orchestration |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth with backend JWT verification |
| AIM Engine | Python backend adaptive intelligence |
| Content | A1 English pilot lessons for Arabic-speaking learners |
| Operations | Internal pilot/admin/debug visibility |

## MVP Users

| User | In MVP | Notes |
|---|---|---|
| Student | Yes | Primary learner experience. |
| Pilot Admin | Yes | Internal pilot monitoring and support. |
| Content Manager | Yes, planning and limited internal workflow | Needed to prepare and review lesson content. |
| Human Reviewer | Yes, planning and scoped review workflow | Needed for safety and content quality review. |
| Parent or Guardian | Conditional | Include only if later scope confirms low-risk parent progress visibility. |
| Teacher/Classroom Owner | No | Future expansion. |
| Public Visitor | No runtime product scope | Marketing/invitation pages are outside learning MVP unless explicitly approved later. |

## MVP Learner Experience

The learner-facing MVP includes:

- Account sign-in for pilot learners.
- Learner dashboard with assigned lessons and progress summary.
- Short A1 lesson view.
- Question/session flow for answering lesson items.
- Answer submission with captured attempt evidence.
- Learner-safe feedback after attempts or sessions.
- Adaptive result screen showing backend-generated recommendation and next step.
- Basic progress/review view for completed lessons and skill progress.

## MVP Backend Scope

The backend MVP includes:

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

The AIM Engine MVP includes the validated adaptive pipeline needed for pilot sessions:

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

Speed may appear only as behavioral evidence such as hesitation, rushing, possible guessing, fatigue or distraction signal, or low confidence signal. Speed must not directly raise mastery, student level, or difficulty.

## MVP Content Scope

Pilot content includes:

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

Internal pilot support includes:

- View pilot learner list and completion state.
- View lesson/session progress.
- Inspect adaptive result summaries.
- Inspect AIM audit or explanation outputs for safety and quality.
- Review content metadata completeness.
- Export or view pilot metrics needed for analysis.

Admin and review tools are internal MVP support surfaces, not a production-grade admin platform.

## MVP Measurement Scope

The pilot should measure:

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

The MVP must include:

- Backend-side JWT verification.
- Backend-side role and data ownership checks.
- Server-only provider keys and privileged credentials.
- Learner-safe educational behavior language.
- Audit logging for cross-learner internal access where implemented.
- Data minimization for pilot reporting and review.

## MVP Acceptance Boundaries

MVP work is complete enough for pilot when:

- Pilot learners can sign in and complete assigned A1 learning sessions.
- The backend records attempts and returns the required adaptive result shape.
- AIM recommendations follow the decision conflict resolver.
- Mastery and difficulty behavior obey no-speed rules.
- Pilot admin/review surfaces provide enough visibility to operate and analyze the cohort.
- Content has metadata required by the AIM Engine.
- Basic security, privacy, and credential boundaries are enforced.

## Assumptions

- The first pilot has five Arabic-speaking A1 English learners.
- The first pilot runs for two weeks.
- React web is the first learner client.
- Flutter remains later scope.
- Existing backend/AIM implementation remains the technical foundation.
- Parent access can be deferred without blocking the first pilot.

## Open Questions

| Question | Current Handling |
|---|---|
| Is parent or guardian access part of MVP? | Conditional; defer unless later tasks explicitly include it. |
| Is the MVP lesson count six, ten, or another number in range? | Content planning should narrow the exact count. |
| Which admin views are mandatory for first pilot operations? | Admin journey and sitemap tasks should define the minimum viable set. |
| What is the exact pilot hosting provider for FastAPI and React? | Deployment planning should decide; Supabase is already selected for auth and database. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/phase-0-readiness-checklist.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, MVP boundaries, assumptions, non-goals by reference to `docs/product/out-of-scope.md`, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

