# Phase 1 — System Foundation Charter

## Purpose

This document is the official bridge between Phase 0 planning and Phase 1 implementation. It locks the decisions, boundaries, stack, and rules that every Phase 1 task must follow before writing a single line of code.

It resolves conflicts between existing Phase 0 documents, separates completed MVP pilot context from Phase 1 targets, and defines what is forbidden in Phase 1 to prevent scope drift, architecture violations, and safety regressions.

**Every Phase 1 task must read this document before starting work.**

## Scope

This is planning/charter documentation only.

This document does not:

- Implement backend code.
- Implement Flutter Mobile code.
- Implement AIM Engine runtime code.
- Implement Admin Dashboard runtime code.
- Create database migrations.
- Create a Student Web App.
- Create API controllers, services, or OpenAPI specs.
- Create CI/CD pipelines, Docker files, or deployment configs.

Those are Phase 1 implementation tasks that must use this document as their authority source.

---

## 1. What Is Phase 1?

**Phase 1 is: "System Foundation"**

Phase 1 establishes the structural skeleton of the AIM platform. It proves that every layer of the system can be wired together correctly, safely, and with the right boundaries enforced from day one.

Phase 1 is complete when every component has a working skeleton, the boundaries between components are enforced, and the non-negotiables from Phase 0 are active in the codebase — not just in documentation.

### Phase 1 Is NOT:

- Full feature implementation
- Student Web App implementation
- Full production deployment
- Full admin dashboard (production-grade)
- Full AI Teacher production rollout
- Full AIM algorithm rewrite
- Offline-first learning
- Payment or subscription system
- Teacher/classroom management
- Multi-tenant organization platform
- Public marketing site
- Full parent portal
- Full advanced analytics warehouse

---

## 2. Active Phase 1 Stack

The following technology decisions are **locked for Phase 1**. They may only be changed by a documented product or engineering decision approved by the project owner.

| Area | Phase 1 Decision | Notes |
|---|---|---|
| Learner client | Flutter Mobile | Only approved post-MVP learner client. |
| Backend API | NestJS + TypeScript | Only approved post-MVP Backend API. |
| AIM Engine | Python backend service/module | Backend-owned only. No client-side logic. |
| Database | Supabase PostgreSQL | Default unless changed by documented decision. |
| Auth | Supabase Auth | Default unless changed by documented decision. |
| Admin surface | Internal Admin Dashboard foundation only | Not a full production admin suite. Not a Student Web App. |
| AI Teacher | Backend-only gateway foundation | No client AI calls. No provider keys in clients. |
| Student Web App | **Deferred — Optional — Phase 7 or later** | Must NOT be created in Phase 1. |

### Completed MVP Pilot Stack (Historical Context Only)

These technologies are preserved as evidence of the completed pilot. They must NOT be described as Phase 1 targets or reintroduced as Phase 1 deliverables.

| Layer | Completed MVP Pilot Technology |
|---|---|
| Learner interface | React Web |
| Backend API | FastAPI |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AIM Engine | Python backend AIM Engine |
| Cohort | 5 Arabic-speaking A1 English learners |
| Duration | 2 weeks |

---

## 3. Student Web App — Decision Locked

**Phase 7 — Student Web App is optional and deferred. It is not part of Phase 1 System Foundation.**

Phase 1 must not create:

- `apps/student-web/` directory or equivalent
- Any React/Next.js student learner app
- Student Web App routes, screens, or navigation
- Student Web App deployment configuration
- Student Web App-specific API scope

**React Web references in Phase 0 documents are historical MVP pilot context only.** They describe what was used during the completed pilot, not what should be built in Phase 1.

A task that creates a Student Web App in Phase 1 must be stopped and treated as a scope violation.

---

## 4. Source of Truth and Conflict Resolution

When two Phase 0 documents contradict each other, Phase 1 must follow this priority hierarchy. The higher-ranked document wins.

| Priority | Document | Authority |
|---|---|---|
| 1 (Highest) | `docs/product/non-negotiables.md` | Product and technical hard rules. Cannot be overridden by any other document. |
| 2 | `docs/product/vision.md` | Product direction and platform intent. |
| 3 | `docs/product/mvp-scope.md` and `docs/product/out-of-scope.md` | What was in/out of the completed MVP pilot and what remains deferred. |
| 4 | `docs/aim-engine/boundary-and-io-contract.md` | AIM Engine ownership, inputs, outputs, and integration contract. |
| 5 | `docs/api/api-planning-baseline.md` | Backend API surface, auth, ownership, and response shape rules. |
| 6 | `docs/data/initial-data-model.md` and `docs/data/session-data-capture.md` | Entity model and session evidence fields. |
| 7 | `docs/mobile/mobile-sitemap.md` | Flutter Mobile screen and navigation structure. |
| 8 | `docs/security/ai-safety-privacy-rules.md` | Safety, privacy, credential, and data minimization rules. |
| 9 | Journey, content, analytics, notification, and admin sitemap documents | Role journeys, content rules, reporting scope, notification scope, admin scope. |
| 10 (Lowest) | Historical MVP pilot notes and older planning fragments | Historical context only. Must not override current Phase 1 direction. |

**Rule:** If a lower-priority document conflicts with a higher-priority document, Phase 1 must follow the higher-priority document and record the conflict as an open decision or QA note. Do not silently resolve conflicts — document them.

---

## 5. Known Conflict Patterns and Resolutions

The following conflicts were identified across Phase 0 documents. Phase 1 must follow the resolution column without exception.

| # | Conflict | Phase 1 Resolution |
|---|---|---|
| 1 | **FastAPI vs NestJS** — Some older notes or external references treat FastAPI as the backend API. | FastAPI belongs to the completed MVP pilot only. **NestJS + TypeScript is the Phase 1 Backend API.** Any task that creates FastAPI routes for Phase 1 is wrong. |
| 2 | **React Web vs Flutter Mobile** — Some planning fragments reference React Web as the learner client. | React Web belongs to the completed MVP pilot only. **Flutter Mobile is the Phase 1 learner client.** React Web must not be rebuilt or extended as a learner surface in Phase 1. |
| 3 | **Student Web App references** — Some documents mention a possible future Student Web App. | **Student Web App is deferred/optional Phase 7.** Do not implement it in Phase 1. Do not create `apps/student-web` or any equivalent directory. |
| 4 | **Flutter AIM logic** — Some feature descriptions could be misread as requiring Flutter to calculate or infer adaptive outcomes. | **Flutter must not calculate mastery, level, weakness, difficulty, retention, or recommendations.** Flutter renders backend-approved outputs only. |
| 5 | **Speed/response time** — Some descriptions of attempt events include `response_time_seconds` in a way that implies it affects outcomes. | **Response time is educational behavior evidence only.** It must not directly affect mastery, student level, or direct difficulty increase. Speed evidence may inform signals such as hesitation, rushing, or possible guessing — nothing more. |
| 6 | **AI Teacher chatbot scope** — Some references describe the AI Teacher in ways that suggest general conversational AI capability. | **AI Teacher is not a general chatbot.** It is lesson-scoped, backend-only, validated before delivery, and must use educational, non-clinical language only. Clients never call AI providers directly. |
| 7 | **Parent features** — Some journey documents describe parent views in detail. | **Parent features are conditional.** They must not block Phase 1 foundation unless the project owner explicitly approves them with consent, linking, and privacy controls resolved. |
| 8 | **Notifications** — Some documents imply Flutter handles notification logic. | **Backend owns notification eligibility, timing, and payload text.** Flutter handles device permission, rendering, and routing to authenticated screens only. Flutter must not receive sensitive learner data in notification payloads. |
| 9 | **Admin Dashboard scope** — Some documents describe rich admin features. | **Phase 1 includes admin foundation and internal operations only.** Full production institute management is later scope. Phase 1 admin must not become a full learner management SaaS in Phase 1. |
| 10 | **AIM Engine direct access** — Any description that implies clients can call the AIM Engine at a URL or endpoint. | **Clients never call the AIM Engine directly.** Clients call the NestJS Backend API only. The Backend API calls the Python AIM Engine backend-internally. |

---

## 6. System Boundaries

### Flutter Mobile

Flutter Mobile is the Phase 1 learner client. It is a display and interaction layer only.

**Flutter Mobile may:**

- Render screens, navigation, and learner UI.
- Handle authentication UI using Supabase Auth client libraries.
- Submit attempts, hint events, skips, and session events to the Backend API.
- Display backend-approved lessons.
- Display backend-approved feedback.
- Display backend-approved recommendations.
- Display backend-approved progress and review schedules.
- Store temporary UI state (e.g., current screen, in-progress session state) in memory.
- Retry failed attempt submissions safely without computing local AIM decisions.
- Handle notification device permission, rendering, and routing to authenticated screens.

**Flutter Mobile must NOT:**

- Calculate mastery.
- Calculate student level.
- Calculate weakness.
- Calculate difficulty.
- Calculate retention.
- Generate recommendations.
- Infer, approximate, or duplicate any AIM Engine logic.
- Call AI providers or AI Teacher Gateway directly.
- Store AI provider API keys.
- Store Supabase service role keys or any privileged backend credentials.
- Receive sensitive raw learner scores or internal AIM fields in notification payloads.
- Override backend-selected recommendation actions.

**Enforcement rule:** A Phase 1 Flutter task that introduces client-side mastery, level, weakness, difficulty, retention, or recommendation logic must be rejected and reworked before merge.

---

### Backend API — NestJS + TypeScript

**Backend API must:**

- Validate Supabase JWT on every authenticated request.
- Enforce backend-side role authorization (never trust client-supplied role claims).
- Enforce ownership checks — students access only their own data.
- Validate all request payloads before processing.
- Persist session and attempt evidence before calling the AIM Engine.
- Call the Python AIM Engine through backend-internal integration only.
- Call the AI Teacher Gateway through backend-internal integration only.
- Return learner-safe response shapes to clients.
- Hide internal-only AIM fields (e.g., weakness score, frustration score, raw mastery internals) from student and parent responses.
- Expose internal AIM fields only to authorized admin/reviewer roles.
- Audit sensitive admin actions and internal overrides.

**Backend API must NOT:**

- Expose AI provider keys in response bodies, logs, or client-visible headers.
- Allow clients to directly trigger AIM Engine endpoints.
- Allow clients to directly trigger AI Teacher Gateway endpoints.
- Trust client-supplied role or ownership claims without backend validation.
- Return raw AIM internals to learner-scoped clients.

---

### AIM Engine — Python Backend Service/Module

**AIM Engine must:**

- Remain in Python, hosted as a backend service or module — never in client apps.
- Own mastery calculation exclusively (no-speed formula).
- Own weakness detection.
- Own difficulty adaptation decisions.
- Own retention and spaced review scheduling.
- Own recommendation generation.
- Own decision conflict resolution — final action authority.
- Treat `response_time_seconds` only as behavioral evidence (hesitation, rushing, possible guessing, fatigue, low confidence).
- Produce outputs consumed by the Backend API only.

**AIM Engine must NOT:**

- Be called directly by Flutter Mobile.
- Be called directly by admin UI.
- Be called directly by any client surface.
- Calculate mastery using speed as a direct component.
- Apply clinical, medical, or diagnostic labels to learners.

---

### AI Teacher Gateway

**AI Teacher Gateway must:**

- Remain backend-only.
- Never expose AI provider API keys to any client.
- Remain scoped to the current lesson, skill, or question context.
- Validate AI output before returning it to the Backend API.
- Use educational, non-clinical, non-medical, non-diagnostic language in all learner-facing output.
- Follow backend-constructed prompt instructions and safety constraints.

**AI Teacher Gateway must NOT:**

- Allow clients to construct or submit raw provider prompts.
- Allow clients to call AI provider APIs directly.
- Override AIM Engine recommendation authority.
- Return clinical, psychological, shame-based, or intelligence-based language.

---

## 7. Phase 1 Foundation Acceptance Gates

Phase 1 foundation is **not complete** until all of the following are verified:

| Gate | Required Condition |
|---|---|
| G-01 | Phase 0 QA documents are completed or explicitly waived by the project owner. |
| G-02 | Repository project structure is created and matches the active Phase 1 architecture. |
| G-03 | NestJS + TypeScript Backend API skeleton exists with authentication middleware wired. |
| G-04 | Python AIM Engine service/module skeleton exists and is callable from the Backend API. |
| G-05 | Flutter Mobile app shell exists with navigation structure matching `docs/mobile/mobile-sitemap.md`. |
| G-06 | Admin Dashboard shell exists as internal/admin foundation only — not as a learner-facing app or Student Web App. |
| G-07 | Shared API contracts or conventions are documented (request/response shape, error format, auth header). |
| G-08 | Database migration foundation exists without premature full schema implementation. |
| G-09 | Environment/config strategy exists — how secrets are injected per environment, no secrets in code. |
| G-10 | Docker or local development strategy exists so contributors can run the system locally. |
| G-11 | CI quality pipeline exists (lint, type-check, basic test runner at minimum). |
| G-12 | No `apps/student-web` or equivalent Student Web App exists. |
| G-13 | No client-side AIM logic exists in Flutter Mobile or any other client. |
| G-14 | No AI provider keys appear in any client config, build output, or environment file committed to the repository. |
| G-15 | No speed-as-mastery logic exists anywhere in the codebase. |
| G-16 | All implementation decisions align with the Phase 0 documents at the priority level defined in Section 4 of this charter. |

---

## 8. Required Pre-Check for Every Phase 1 Task

Before starting any Phase 1 task, the agent or developer must verify every item in this checklist. If any item fails, stop and document the conflict before proceeding.

```
Phase 1 Task Pre-Check

[ ] Read docs/phase-1/system-foundation-charter.md (this document).
[ ] Read the relevant Phase 0 docs for the component being implemented.
[ ] Confirm task does NOT create a Student Web App or apps/student-web.
[ ] Confirm task does NOT move AIM Engine logic into Flutter or any other client.
[ ] Confirm task does NOT expose AI provider keys in clients or client-visible config.
[ ] Confirm task does NOT use speed as a mastery, level, or direct difficulty signal.
[ ] Confirm task follows the active Phase 1 stack (Flutter / NestJS / Python / Supabase).
[ ] Confirm task uses backend-owned authorization and ownership checks.
[ ] Confirm task has clearly defined output files or code artifacts.
[ ] Confirm task has a Done Test — a specific condition that proves the task is complete.

If any conflict is found between this task and Phase 0 documents:
→ Stop.
→ Document the conflict as an open decision or QA note.
→ Do not silently choose a direction.
→ Escalate to the project owner before proceeding.
```

---

## 9. Phase 1 Non-Goals

The following items are explicitly NOT goals for Phase 1 System Foundation. Creating work in these areas in Phase 1 is a scope violation.

| Non-Goal | Status |
|---|---|
| Student Web App | Deferred — Optional — Phase 7 or later. Do not create. |
| Full production deployment | Deferred. Local/staging environment is sufficient for Phase 1 foundation. |
| Payment or subscription system | Deferred. No billing in Phase 1. |
| Multi-school or multi-tenant platform | Deferred. Single-cohort foundation only. |
| Full teacher or classroom management system | Deferred. Individual learner experience first. |
| Full parent portal | Conditional. Do not implement unless explicitly approved with privacy controls. |
| Full AI-generated content pipeline | Deferred. Curated and reviewed content first. |
| Client-side AIM algorithm | Forbidden. Backend-only. |
| Client-side recommendation engine | Forbidden. Backend-only. |
| Clinical, medical, or diagnostic learner labels | Forbidden. Educational-only language required. |
| Speed-based mastery or speed-based level change | Forbidden. Speed is behavioral evidence only. |
| Full advanced analytics data warehouse | Deferred. Lightweight pilot reporting first. |
| Public marketing site | Deferred unless separately approved. |
| Offline-first AIM decisions | Forbidden in Phase 1. AIM decisions require authoritative backend processing. |
| Voice or audio-only AI features | Deferred unless explicitly approved. |
| App store release | Out of Phase 1 foundation scope. |

---

## 10. Forbidden Actions in Phase 1

The following actions must fail any code review or task acceptance gate:

- **Creating `apps/student-web/` or any equivalent directory.** Phase 1 tasks must fail if they introduce a Student Web App.
- **Placing AIM mastery, level, weakness, difficulty, retention, or recommendation logic in Flutter Mobile or any other client.** Phase 1 tasks must fail if they introduce client-side AIM calculation.
- **Storing AI provider API keys in any client config, build artifact, `.env` committed to the repository, or CI environment visible to the client.** Phase 1 tasks must fail if they expose provider credentials to client environments.
- **Using `response_time`, `avg_response_time`, or `speed_score` as a direct mastery, level, or difficulty input.** Phase 1 tasks must fail if they introduce speed-as-mastery logic.
- **Routing clients directly to the AIM Engine or AI Teacher Gateway.** Clients call the Backend API only.
- **Using FastAPI as the Phase 1 Backend API.** FastAPI is completed MVP pilot history.
- **Using React Web as the Phase 1 learner client.** React Web is completed MVP pilot history.
- **Applying clinical, medical, psychological, or diagnostic labels to learners in code, prompts, reports, or UI text.**

---

## 11. Phase 1 Stack Decision Lock Summary

These decisions are locked. They require a written, project-owner-approved change decision to modify.

| Decision | Locked Value |
|---|---|
| Phase 1 learner client | Flutter Mobile |
| Phase 1 Backend API | NestJS + TypeScript |
| Phase 1 AIM Engine location | Python backend service/module |
| Phase 1 database | Supabase PostgreSQL |
| Phase 1 auth | Supabase Auth |
| Student Web App in Phase 1 | Forbidden |
| AIM logic in clients | Forbidden |
| AI provider keys in clients | Forbidden |
| Speed as direct mastery/level/difficulty signal | Forbidden |
| Clients calling AIM Engine directly | Forbidden |
| Clients calling AI Teacher Gateway directly | Forbidden |
| Clinical/diagnostic learner labels | Forbidden |

---

## 12. Missing or Pending Documents

The following documents were expected but are either absent or not yet fully complete as of Phase 0. Phase 1 tasks that depend on these areas should treat them as open decisions and escalate before implementation:

| Document | Status | Phase 1 Impact |
|---|---|---|
| `docs/product/roles-and-permissions.md` | Present — verify completeness for all Phase 1 roles | Role-based access control implementation |
| `docs/journeys/parent-journey.md` | Present — parent features are conditional | Do not implement parent features without approval |
| `docs/learning/placement-test-strategy.md` | Present — item count thresholds are open | Placement implementation must wait for threshold lock-in |
| Deployment/hosting topology | Open decision (OD-020) | Deployment planning needed before production |
| Exact admin Phase 1 module list | Open decision (OD-012) | Minimum admin modules must be defined before dashboard implementation |
| Notification mandatory types | Conditionally decided (OD-016) | Implement only approved notification types |
| Parent access inclusion/exclusion | Conditionally decided (OD-011) | Await explicit approval |

---

## 13. Open Decisions Remaining at Phase 1 Start

These decisions must be resolved or explicitly deferred before the Phase 1 tasks that depend on them are created:

| Decision ID | Decision | Required Before |
|---|---|---|
| OD-011 | Is parent/guardian access in Phase 1? | Any parent API, data model, or UI task |
| OD-012 | What is the minimum admin dashboard scope? | Admin dashboard implementation tasks |
| OD-013 | What is the exact human review trigger threshold? | Review queue implementation |
| OD-014 | What is the exact A1 lesson count for Phase 1 content seed? | Content implementation |
| OD-015 | What are the exact placement item counts and thresholds? | Placement test implementation |
| OD-017 | Should a notification inbox exist in Phase 1? | Notification inbox implementation |
| OD-019 | What analytics are shown to admins/reviewers? | Admin analytics/reporting implementation |
| OD-020 | What is the deployment provider and topology? | Production release |

---

## 14. Is Phase 1 Task-List Creation Now Safe?

Phase 1 task-list creation is safe **when all of the following are true**:

| Check | Status |
|---|---|
| This charter document exists and is merged to `main` | ✅ Complete after this commit |
| Phase 0 QA documents exist and have been reviewed | See `docs/quality/` — verify completion |
| Active Phase 1 stack is locked (Flutter / NestJS / Python / Supabase) | ✅ Locked in this document |
| Student Web App is explicitly deferred | ✅ Locked in this document |
| Conflict-resolution hierarchy is defined | ✅ Defined in Section 4 |
| Known conflicts are resolved | ✅ Resolved in Section 5 |
| System boundaries are defined | ✅ Defined in Section 6 |
| Acceptance gates are defined | ✅ Defined in Section 7 |
| Forbidden actions are defined | ✅ Defined in Section 10 |

**Result:** Phase 1 task-list creation is safe to proceed after this charter is merged and Phase 0 QA documents are confirmed complete or explicitly waived.

---

## Related Documents

- `docs/product/non-negotiables.md` — Hard rules for the entire platform
- `docs/product/vision.md` — Product direction and platform intent
- `docs/product/mvp-scope.md` — Completed MVP pilot scope
- `docs/product/out-of-scope.md` — Excluded and deferred items
- `docs/product/open-decisions.md` — Tracked open decisions
- `docs/product/risk-register.md` — Risk register and mitigation controls
- `docs/aim-engine/boundary-and-io-contract.md` — AIM Engine IO contract
- `docs/api/api-planning-baseline.md` — Backend API planning baseline
- `docs/data/initial-data-model.md` — Entity model
- `docs/data/session-data-capture.md` — Session evidence fields
- `docs/mobile/mobile-sitemap.md` — Flutter Mobile screen structure
- `docs/admin/admin-dashboard-sitemap.md` — Admin dashboard modules
- `docs/security/ai-safety-privacy-rules.md` — Safety and privacy rules
- `docs/quality/phase-1-readiness-gap-analysis.md` — Phase 1 readiness gap analysis

## Acceptance Notes

- This document defines Phase 1 as "System Foundation."
- Student Web App is explicitly deferred as optional Phase 7 or later.
- Completed MVP pilot stack (React Web, FastAPI) is separated from Phase 1 target stack (Flutter Mobile, NestJS + TypeScript).
- Conflict-resolution hierarchy is defined with 10 priority levels.
- Ten known conflict cases are resolved with explicit Phase 1 rules.
- System boundaries for Flutter Mobile, Backend API, AIM Engine, and AI Teacher Gateway are defined.
- Sixteen Phase 1 foundation acceptance gates are defined.
- A required pre-check checklist is defined for every Phase 1 task.
- Phase 1 non-goals are listed explicitly.
- Forbidden actions are stated as enforceable rules, not vague guidance.
- No runtime code, Student Web App, Flutter AIM logic, database migration, or backend implementation was created.
