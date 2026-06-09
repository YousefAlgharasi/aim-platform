# Phase 1 — System Foundation Charter

## Purpose

This document is the official transition charter for Phase 1 of the AIM platform. It defines Phase 1 as System Foundation, locks the active implementation stack, prevents Phase 0/Phase 1 conflicts, establishes source-of-truth hierarchy, and documents all forbidden work for this phase.

## Phase Definition

**Phase 1 is System Foundation.**

Phase 1 builds the technical skeleton that Phase 2 (feature implementation) will run on. It does not implement full business logic, full UI features, production-grade admin systems, or a Student Web App.

Phase 0 was planning and documentation only. Phase 1 is the first implementation phase, and its scope is strictly system-level scaffolding.

## Active Phase 1 Stack

The following stack is locked for Phase 1. Any change to this stack requires a documented decision in Notion or `docs/phase-1/open-decisions.md`.

| Layer | Phase 1 Stack |
|---|---|
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| AIM Engine | Python service/module (backend-owned) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Admin surface | Internal Admin Dashboard foundation only |
| AI Teacher | Backend-only gateway foundation |
| Student Web App | Deferred — Optional — Phase 7 or later |

### Completed MVP Pilot Stack (Historical Reference)

The completed MVP pilot used a different stack. It must not be confused with the Phase 1 target:

| Layer | Completed MVP Pilot |
|---|---|
| Learner interface | React Web |
| Backend API | FastAPI |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AIM Engine | Python backend AIM Engine |

FastAPI is **not** the Phase 1 Backend API. React Web is **not** the Phase 1 learner client. These belong to the completed pilot only.

## Student Web App — Deferred

**The Student Web App is Deferred / Optional / Phase 7 or later.**

No Phase 1 task may create a React/Next.js learner web app or any Student Web App runtime code. The React Web interface created during the MVP pilot is a historical artifact, not a post-MVP Phase 1 deliverable.

Any future Student Web App requires a new documented product decision before work begins.

## Source-of-Truth Hierarchy

When documents, tasks, or team members conflict, use the following hierarchy to resolve the conflict:

| Priority | Source | Scope |
|---|---|---|
| 1 (highest) | This charter — `docs/phase-1/system-foundation-charter.md` | Phase 1 stack, boundaries, and forbidden work |
| 2 | `docs/product/non-negotiables.md` | Platform-wide hard rules |
| 3 | `docs/product/vision.md` | Product direction and stack decisions |
| 4 | `docs/aim-engine/boundary-and-io-contract.md` | AIM Engine ownership and IO contract |
| 5 | `docs/api/api-planning-baseline.md` | API planning baseline |
| 6 | `docs/mobile/mobile-sitemap.md` | Flutter Mobile screen structure |
| 7 | `docs/security/ai-safety-privacy-rules.md` | AI safety, privacy, and data rules |
| 8 | Notion Phase 1 task definitions | Individual task scope and acceptance criteria |
| 9 (lowest) | Individual task execution prompts | Implementation detail |

If a task prompt conflicts with a higher-priority source, the higher-priority source wins. Stop the task and add a blocker comment in Notion.

## Conflict-Resolution Rules

1. **Stack conflict**: If any task prompt instructs use of FastAPI as the Phase 1 Backend API, stop. NestJS + TypeScript is the Phase 1 Backend API. Add a blocker.
2. **Client conflict**: If any task prompt instructs creating a React/Next.js learner interface or Student Web App, stop. Flutter Mobile is the Phase 1 learner client. Add a blocker.
3. **AIM Engine conflict**: If any task prompt moves AIM calculations into Flutter, NestJS, admin UI, or any client, stop. AIM Engine logic is Python/backend-owned. Add a blocker.
4. **Scope creep**: If a task is completing fine but a sub-task or helper function would implement a forbidden item, skip the forbidden item and document the limitation in the Notion completion comment.
5. **Doc conflict**: If two planning documents contradict each other, escalate using the source-of-truth hierarchy above. The higher-priority document governs until a new documented decision changes the hierarchy.
6. **Stack change**: Any change to the Phase 1 stack must be documented in `docs/phase-1/open-decisions.md` before implementation begins.

## Component Boundaries

### Flutter Mobile

Flutter Mobile is the Phase 1 learner client. Its boundary is display and interaction only.

**Flutter may:**
- Display lessons, questions, feedback, recommendations, and progress.
- Send session attempts, hint usage, skips, and answer changes to the backend.
- Render backend-approved AIM outputs.
- Cache backend-approved display data when safe.

**Flutter must not:**
- Calculate mastery, student level, weakness, difficulty, retention, or recommendations.
- Call the AIM Engine directly.
- Call the AI Teacher Gateway directly.
- Store AI provider keys or privileged backend credentials.
- Run, duplicate, or approximate AIM Engine logic.
- Override backend recommendation authority.

### Backend API (NestJS + TypeScript)

The Backend API owns authentication, authorization, request validation, orchestration, persistence, and safe API response shaping.

**Backend API responsibilities:**
- Validate Supabase JWT on every authenticated request.
- Enforce role and ownership checks server-side.
- Validate session and attempt payloads.
- Persist attempts and session evidence before AIM processing.
- Call the Python AIM Engine through backend-internal integration only.
- Return learner-safe response shapes to clients.
- Restrict internal AIM fields to authorized admin/reviewer roles.

**Backend API must not:**
- Expose AI provider keys to any client.
- Return raw AIM debug internals to learner-facing surfaces.
- Allow cross-student data access.
- Bypass AIM safety rules.

### AIM Engine (Python — Backend-Owned)

The AIM Engine is the adaptive intelligence module. It is backend-owned and must never run in any client.

**AIM Engine owns:**
- Mastery calculation (no-speed formula only).
- Student level decisions.
- Weakness detection.
- Difficulty adaptation.
- Retention scheduling.
- Recommendation generation.
- Decision conflict resolution.

**AIM Engine rules:**
- `response_time_seconds`, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.
- Speed may only be used as educational behavior evidence (hesitation, rushing, possible guessing, fatigue/distraction, low confidence).
- The mastery formula must exclude `response_time`, `avg_response_time`, and `speed_score`.
- Difficulty may increase only when all required evidence thresholds are met (mastery >= 85, consistency >= 75, reliability >= 0.70, weakness score < 50, frustration score < 60, retention >= 70).

### AI Teacher Gateway

The AI Teacher Gateway is backend-only. No client may call it directly.

**AI Teacher Gateway rules:**
- Provider API keys are read from backend environment only.
- Raw provider responses are not blindly forwarded to clients.
- All responses must pass backend safety validation before delivery.
- AI Teacher output must use educational, non-clinical, non-medical, non-diagnostic language.
- AI Teacher output must not override AIM Engine recommendation authority.
- Clients never generate provider prompts.

## Phase 1 Non-Goals

The following are explicitly out of scope for Phase 1:

| Non-Goal | Reason |
|---|---|
| Student Web App | Deferred — Optional — Phase 7 or later |
| React/Next.js learner web app | React Web belongs to the completed MVP pilot only |
| FastAPI as Phase 1 Backend API | FastAPI belongs to the completed MVP pilot only |
| AIM logic in Flutter Mobile | AIM Engine is Python/backend-owned |
| Client-side mastery calculation | Backend AIM Engine is the source of truth |
| Client-side student level decisions | Backend authority only |
| Client-side weakness/difficulty/retention calculation | Backend AIM Engine only |
| AI provider keys in any client | Security non-negotiable |
| Full production admin platform | Phase 1 admin is internal foundation only |
| Full feature implementation | Phase 1 is system scaffolding, not feature delivery |
| Advanced analytics warehouse | Deferred |
| Teacher/classroom product | Future expansion |
| Payment or subscriptions | Deferred |
| Full content management system | Deferred |
| Offline-first AIM processing | Must not compromise AIM evidence integrity |
| Clinical/medical/diagnostic learner labels | Forbidden permanently |

## Acceptance Gates

A Phase 1 task is complete only when all of the following are true:

1. The output file(s) exist in the repository on the `main` branch.
2. The task does not create a Student Web App or React/Next.js learner interface.
3. The task does not use FastAPI as the Phase 1 Backend API.
4. The task does not move AIM logic into Flutter or any client.
5. The task does not expose AI provider keys, Supabase service-role keys, or privileged backend credentials.
6. The task does not use speed as a direct mastery, level, or difficulty signal.
7. The Notion task is marked Done with a completion comment.
8. The commit is pushed to `main` before the Notion task is marked Done.

Phase 1 as a whole is complete when:
- All P0 and P1 priority tasks are Done in Notion.
- No unresolved blocker comments exist on any Phase 1 task.
- The architecture compliance review (`docs/phase-1/architecture-compliance-review.md`) passes.
- The system foundation smoke test (`docs/phase-1/system-foundation-smoke-test.md`) is completed with documented status per component.
- The Phase 2 readiness checklist (`docs/phase-2/readiness-checklist.md`) exists and has no blocking items.

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/tasks/phase_1_task_prompts.md`

## Acceptance Notes

- All required source documents were read before writing this charter.
- Phase 1 stack is locked and separated from the completed MVP pilot stack.
- Student Web App is explicitly Deferred / Optional / Phase 7 or later.
- Source-of-truth hierarchy is defined and actionable.
- Conflict-resolution rules are step-by-step and cover all known conflict types.
- Component boundaries are defined for Flutter Mobile, Backend API, AIM Engine, and AI Teacher Gateway.
- Phase 1 non-goals are explicit.
- Acceptance gates are defined for individual tasks and for Phase 1 as a whole.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
