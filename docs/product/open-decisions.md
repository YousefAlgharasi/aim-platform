# AIM Phase 0 Open Decisions

## Purpose

This document tracks product, technical, safety, data, workflow, and delivery decisions that are either already decided, conditionally decided, or still open after Phase 0 planning.

It prevents Phase 1 implementation from guessing or silently changing the approved product direction.

## Scope

This is Phase 0 planning documentation only. It does not implement backend code, Flutter code, React Web code, database migrations, admin dashboard runtime code, API runtime code, AIM Engine code, or a Student Web App.

This document covers:

- Completed MVP pilot context.
- Post-MVP Phase 1 direction.
- Learner client direction.
- Backend API direction.
- AIM Engine boundaries.
- Data/auth direction.
- Parent, admin, notification, analytics, and safety decisions.
- Open implementation choices that should become Phase 1 tasks or acceptance criteria.

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

## Dependency Check

| Dependency Range | Expected Output | Status |
|---|---|---|
| P0-001 | Product vision and non-negotiables | Checked and used as source of truth. |
| P0-004 | MVP scope and out-of-scope boundary | Checked and used for completed MVP pilot boundaries. |
| P0-014 | AIM Engine boundary and IO contract | Checked and used for backend-owned AIM rules. |
| P0-017 | API planning baseline | Checked for backend/API decision impact. |
| P0-018 | Mobile sitemap | Checked for Flutter Mobile Phase 1 implications. |
| P0-022 | AI safety and privacy rules | Checked for safety/privacy decision impact. |

## Decision Status Legend

| Status | Meaning |
|---|---|
| Decided | Product or technical direction is locked unless a later documented decision changes it. |
| Conditionally Decided | Direction is likely, but implementation depends on privacy, safety, consent, cost, or operational constraints. |
| Open | Needs explicit owner decision before implementation. |
| Deferred | Not needed for completed MVP pilot or immediate Phase 1 foundation. |
| Forbidden | Not allowed because it violates product, safety, privacy, or architecture rules. |

## Decisions

| ID | Decision | Status | Current Position | Owner | Phase 1 Impact |
|---|---|---|---|---|---|
| OD-001 | What learner client should be used after the completed MVP pilot? | Decided | React Web was the completed MVP pilot learner interface. Flutter Mobile is the approved post-MVP Phase 1 learner client. | Product Owner | Phase 1 learner implementation should target Flutter Mobile. |
| OD-002 | Should a separate post-MVP Student Web App be planned? | Decided | No separate Student Web App is planned unless a later documented product decision changes this. | Product Owner | Do not create Student Web App tasks. |
| OD-003 | What backend API stack should Phase 1 use? | Decided | FastAPI was the completed MVP pilot backend API. NestJS + TypeScript is the post-MVP Phase 1 Backend API. | Engineering Lead | Phase 1 backend API tasks should use NestJS + TypeScript unless changed by a later documented decision. |
| OD-004 | Where does AIM Engine logic run? | Decided | AIM Engine logic remains Python/backend-owned as a backend service/module. | AIM Engine Lead | No client-side AIM logic. Backend integration must call or embed Python AIM Engine safely. |
| OD-005 | Can clients calculate mastery, student level, weakness, difficulty, retention, or recommendations? | Forbidden | Clients must not calculate these values locally. | Engineering Lead | Flutter Mobile, completed React Web pilot surfaces, admin tools, and future clients render backend-approved outputs only. |
| OD-006 | Can clients call AI Teacher Gateway or AI provider APIs directly? | Forbidden | AI Teacher Gateway is backend-only. AI provider keys and privileged backend credentials must never be exposed to clients. | Backend / Security Lead | All AI calls go through backend services. |
| OD-007 | Should Supabase remain the auth/database direction? | Decided | Supabase PostgreSQL/Auth were used in the completed MVP pilot and remain the Phase 1 default unless changed by a later documented decision. | Engineering Lead | Phase 1 planning should assume Supabase PostgreSQL/Auth by default. |
| OD-008 | Can speed affect mastery, student level, or direct difficulty increase? | Forbidden | Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase. | AIM Engine Lead | Preserve no-speed mastery and difficulty rules in AIM, data, API, analytics, and reports. |
| OD-009 | How may speed be used? | Decided | Speed may only be used as educational behavior evidence, such as hesitation, rushing, possible guessing, fatigue/distraction, low confidence, or session behavior analysis. | AIM Engine Lead | Do not make speed a direct scoring component. |
| OD-010 | Can learner behavior language be clinical or diagnostic? | Forbidden | Learner behavior language must remain educational, non-clinical, non-medical, and non-diagnostic. | Product / Safety Lead | AI teacher, reports, dashboards, and admin notes must use safe educational wording. |
| OD-011 | Is parent/guardian access part of Phase 1? | Conditionally Decided | Parent access is allowed only if consent, child-parent linking, privacy rules, and summary-only visibility are approved. | Product Owner | Do not implement parent features until the inclusion decision and privacy model are explicit. |
| OD-012 | What is the minimum admin dashboard scope? | Open | Internal pilot/Phase 1 support is expected, but full production admin is later scope. | Product Owner / Admin Lead | Define minimum admin modules before implementation. |
| OD-013 | What is the exact human review trigger threshold? | Open | Human review workflow is planned, but exact triggers need final rules. | Product / Reviewer Lead | Review queue and disputed-grade tasks need thresholds. |
| OD-014 | What is the final A1 lesson count for a future pilot or Phase 1 content seed? | Open | Target range is six to ten short A1 lessons unless narrowed by content planning. | Content Lead | Content tasks should choose exact count before implementation. |
| OD-015 | What are the exact placement item counts and thresholds? | Open | Placement strategy exists, but item count and threshold values need lock-in. | Learning Design / AIM Lead | Placement implementation should wait for thresholds. |
| OD-016 | Which notification types are mandatory for Phase 1? | Conditionally Decided | Notifications are useful but must follow privacy-safe payload rules and user controls. | Product / Mobile Lead | Implement only approved notification types with safe text. |
| OD-017 | Should notification inbox exist in Phase 1? | Open | Not required until notification scope is finalized. | Product / Mobile Lead | Avoid building extra notification surfaces without approval. |
| OD-018 | What analytics are shown to learners? | Conditionally Decided | Learner-facing analytics must be simple, educational, and non-diagnostic. | Product / Analytics Lead | Progress screens should avoid raw AIM internals. |
| OD-019 | What analytics are shown to admins/reviewers? | Open | Admin/reviewer analytics can expose more operational detail but must remain role-restricted and privacy-safe. | Analytics / Security Lead | Define role-based report access before dashboard implementation. |
| OD-020 | What deployment provider and topology should Phase 1 use? | Open | Supabase is the auth/database default. API, AIM Engine, and hosting deployment topology need later planning. | Engineering / DevOps Lead | Deployment planning must happen before production release. |
| OD-021 | Should AI voice features be included in early Phase 1? | Deferred | AI voice may be valuable later, but text-first learning loop and AIM correctness should come first unless explicitly approved. | Product Owner | Avoid blocking core Phase 1 on voice. |
| OD-022 | Should payment/subscription features be implemented? | Deferred | Payment is outside completed MVP pilot and not part of Phase 1 foundation unless later approved. | Product Owner | Do not build billing tasks yet. |
| OD-023 | Should teacher/classroom organization features be implemented? | Deferred | Future expansion after individual learner experience is validated. | Product Owner | Do not create organization/classroom tasks yet. |
| OD-024 | Should AI-generated lesson content be implemented? | Deferred | Curated and reviewed content should come first. | Content / AI Lead | Avoid automated content generation in early Phase 1. |
| OD-025 | Should offline-first learning be implemented? | Deferred | Offline support can be evaluated later but must not compromise AIM evidence integrity. | Mobile / Backend Lead | Do not implement offline AIM decisions locally. |

## Decision Details

### OD-001 — Learner Client Direction

React Web belongs to the completed MVP pilot context. It must be preserved as historical evidence of the completed pilot, not reintroduced as the default post-MVP learner client.

Flutter Mobile is the approved post-MVP Phase 1 learner client. Flutter Mobile must consume backend APIs and backend-approved AIM outputs only.

### OD-002 — No Separate Student Web App

No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

This rule prevents Phase 1 from splitting learner delivery across unnecessary client surfaces. Admin/internal tools may still exist, but they are not a Student Web App.

### OD-003 — Backend API Stack

FastAPI was used for the completed MVP pilot backend API. It remains valid historical context.

NestJS + TypeScript is the post-MVP Phase 1 Backend API direction unless a later documented technical decision changes this.

### OD-004 to OD-006 — AIM and AI Boundary

AIM Engine logic remains Python/backend-owned. Clients must not run or duplicate AIM Engine logic. AI Teacher Gateway remains backend-only. Provider keys and privileged credentials remain server-only.

This applies to:

- Completed React Web pilot surfaces.
- Post-MVP Flutter Mobile.
- Admin dashboard surfaces.
- Any future client app.

### OD-008 to OD-010 — Safety and Fairness

Speed is useful as behavior evidence only. It must not directly affect mastery, student level, or direct difficulty increase.

Learner-facing and internal language must remain educational and non-diagnostic.

## Phase 1 Decision Gates

Before Phase 1 implementation starts for the affected areas, the team should confirm:

| Gate | Required Confirmation |
|---|---|
| Learner client gate | Flutter Mobile is the Phase 1 learner client. |
| Backend API gate | NestJS + TypeScript is the Phase 1 Backend API. |
| AIM Engine gate | Python AIM Engine remains backend-owned. |
| Student Web App gate | No separate Student Web App is planned. |
| Data/auth gate | Supabase PostgreSQL/Auth remain default unless changed later. |
| Safety gate | No-speed mastery, backend-only AI Gateway, server-only credentials, and educational-only behavior language are preserved. |
| Parent gate | Parent access is either explicitly included with privacy controls or deferred. |
| Admin gate | Minimum internal admin support is defined before implementation. |
| Content gate | Lesson count, skill mapping, and question standards are locked before content buildout. |

## Non-Goals

This document does not:

- Create runtime implementation.
- Create a Student Web App.
- Create Flutter Mobile code.
- Create React Web code.
- Create backend API code.
- Create database migrations.
- Create AIM Engine code.
- Move AIM Engine logic into any client.
- Expose AI provider keys or privileged credentials to clients.
- Resolve every open product decision automatically.

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/risk-register.md`
- `docs/product/phase-0-final-review.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/security/ai-safety-privacy-rules.md`

## Acceptance Notes

- This document has a title, purpose, scope, current product direction, decision status legend, decision table, decision details, Phase 1 gates, non-goals, related documents, and acceptance notes.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
