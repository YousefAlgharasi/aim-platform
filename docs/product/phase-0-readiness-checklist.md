# AIM Phase 0 Readiness Checklist

## Purpose

This checklist defines when AIM Phase 0 planning is complete enough for post-MVP Phase 1 System Foundation work to begin.

It aligns Phase 0 readiness with the current product direction in `docs/product/vision.md`.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- Admin dashboard runtime code.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

This checklist covers product, journeys, content, AIM Engine boundary, data, API, mobile/client planning, admin planning, safety/privacy, analytics, risk, and final review readiness gates.

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

## Phase Clarification

The completed MVP pilot used React Web and FastAPI.

Post-MVP Phase 1 uses Flutter Mobile and NestJS + TypeScript.

This checklist must not treat Flutter Mobile as future/undecided. Flutter Mobile is the approved post-MVP Phase 1 learner client.

This checklist must not treat FastAPI as the target post-MVP Phase 1 Backend API. FastAPI belongs to completed MVP pilot context.

## Readiness Rule

Phase 1 may start only when every required Phase 0 output is complete, internally consistent, and safe for implementation planning.

| Gate | Required Before Phase 1 |
|---|---|
| Product direction | Vision, non-negotiables, scope, and out-of-scope boundaries are documented. |
| User workflows | Student, parent, admin, content manager, and reviewer journeys are documented or explicitly deferred where conditional. |
| Learning model | Skill tree, placement strategy, lesson structure, question standards, and AI Teacher behavior rules are documented. |
| AIM boundary | AIM Engine inputs, outputs, ownership, and client restrictions are documented. |
| Data planning | Session data capture and initial entity model are documented. |
| API planning | Planning-level API baseline exists before runtime implementation. |
| Navigation planning | Flutter Mobile and internal admin sitemap planning exists before screens are built. |
| Safety and privacy | AI safety, privacy, credential, and educational-language rules are documented. |
| Reporting | Analytics and reports scope is documented. |
| Project control | Risks, open decisions, and final go/no-go review are documented. |
| QA control | Phase 0 QA audits, readiness analysis, fix plan, and final quality gate are documented. |

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for hard product and technical rules. |

## Phase 0 Task Checklist

| Task | Output | Required For Phase 1 | Done Criteria |
|---|---|---|---|
| P0-001 Confirm AIM Product Vision and Non-Negotiables | `docs/product/vision.md`; `docs/product/non-negotiables.md` | Yes | Product direction and hard rules are clear. |
| P0-002 Create Phase 0 Readiness Checklist | `docs/product/phase-0-readiness-checklist.md` | Yes | This checklist exists and defines Phase 1 entry gates. |
| P0-003 Define User Roles and Permissions Matrix | `docs/product/roles-and-permissions.md` | Yes | Roles, access boundaries, and future expansion boundaries are clear. |
| P0-004 Define Scope and Out-of-Scope Boundary | `docs/product/mvp-scope.md`; `docs/product/out-of-scope.md` | Yes | Completed MVP pilot context and post-MVP Phase 1 scope cannot be confused. |
| P0-005 Define Student Journey and Learning Session Flow | `docs/journeys/student-journey.md` | Yes | Student path from onboarding through review is documented. |
| P0-006 Define Parent or Guardian Journey | `docs/journeys/parent-journey.md` | Conditional | Parent visibility, limits, consent, and communication boundaries are documented or deferred. |
| P0-007 Define Admin Journey | `docs/journeys/admin-journey.md` | Yes | Internal admin monitoring, support, and reporting workflows are documented. |
| P0-008 Define Content Manager Journey | `docs/journeys/content-manager-journey.md` | Yes | Content inventory, lesson/question metadata, review, and publishing workflows are documented. |
| P0-009 Define Human Reviewer Journey | `docs/journeys/human-reviewer-journey.md` | Conditional | Human review responsibilities and boundaries are documented where review workflow is included. |
| P0-010 Draft English Skill Tree | `docs/learning/english-skill-tree.md` | Yes | Skill structure and prerequisites are implementation-ready. |
| P0-011 Define Placement Test Strategy | `docs/learning/placement-test-strategy.md` | Yes | Placement evidence and band rules are documented before implementation. |
| P0-012 Define Lesson Content Structure | `docs/content/lesson-content-structure.md` | Yes | Lesson and question metadata requirements are documented. |
| P0-013 Define Question Bank Standards | `docs/content/question-bank-standards.md` | Yes | Question quality, metadata, difficulty, and review rules are documented. |
| P0-014 Define AI Teacher Behavior Rules | `docs/ai-teacher/behavior-rules.md` | Yes | Tutor behavior, allowed support, and safety boundaries are documented. |
| P0-015 Define AIM Engine Boundary and Input/Output Contract | `docs/aim-engine/boundary-and-io-contract.md` | Yes | Backend/client/AIM ownership and response contracts are documented. |
| P0-016 Define Session Data Capture | `docs/data/session-data-capture.md` | Yes | Attempt, session, and analytics evidence fields are documented. |
| P0-017 Draft Initial Data Model | `docs/data/initial-data-model.md` | Yes | Initial logical data model is clear before migrations. |
| P0-018 Draft API Planning Baseline | `docs/api/api-planning-baseline.md` | Yes | API surface is planned before implementation. |
| P0-019 Define Mobile App Sitemap and Navigation Scope | `docs/mobile/mobile-sitemap.md` | Yes | Flutter Mobile learner navigation scope is documented without implementation. |
| P0-020 Define Admin Dashboard Sitemap | `docs/admin/admin-dashboard-sitemap.md` | Yes | Internal admin dashboard surfaces are planned without implementation. |
| P0-021 Define Notification Scope and Rules | `docs/product/notification-scope.md` | Conditional | Notification types, triggers, limits, and controls are documented or deferred. |
| P0-022 Define Analytics and Reports Scope | `docs/analytics/reports-scope.md` | Yes | Student, parent, admin, and AIM reporting needs are documented. |
| P0-023 Define AI Safety, Privacy, and Data Rules | `docs/security/ai-safety-privacy-rules.md` | Yes | Safety, privacy, minimization, and educational-only rules are documented. |
| P0-024 Create Risk Register and Open Decisions Log | `docs/product/risk-register.md`; `docs/product/open-decisions.md` | Yes | Known risks and unresolved decisions are visible. |
| P0-025 Phase 0 Final Review and Lock | `docs/product/phase-0-final-review.md` | Yes | Final go/no-go decision is recorded. |

## Phase 0 QA Checklist

| QA Task | Output | Required For Phase 1 | Done Criteria |
|---|---|---|---|
| P0-QA-001 Required Files Inventory | `docs/quality/phase-0-required-files-inventory.md` | Yes | Required files and paths are inventoried. |
| P0-QA-002 Duplicate Content Audit | `docs/quality/phase-0-duplicate-content-audit.md` | Yes | Duplicates and overlap risks are documented. |
| P0-QA-003 Content Completeness Audit | `docs/quality/phase-0-content-completeness-audit.md` | Yes | Completeness and readiness scoring are documented. |
| P0-QA-004 Cross-Document Consistency Audit | `docs/quality/phase-0-cross-document-consistency-audit.md` | Yes | Contradictions and canonical wording are documented. |
| P0-QA-005 Phase 1 Readiness Gap Analysis | `docs/quality/phase-1-readiness-gap-analysis.md` | Yes | Phase 1 gaps and go/no-go guidance are documented. |
| P0-QA-006 Consolidation Fix Plan | `docs/quality/phase-0-consolidation-fix-plan.md` | Yes | Targeted cleanup plan is documented. |
| P0-QA-007 Final Quality Gate | `docs/quality/phase-0-final-quality-gate.md` | Yes | Final QA status and follow-up tasks are documented. |

## Acceptance Checklist

Phase 0 is ready for Phase 1 when all of the following are true:

- [ ] Every required Phase 0 output file exists.
- [ ] Every required QA output file exists.
- [ ] Every required output file has a title, purpose, scope, and acceptance-ready content.
- [ ] No required document contains unresolved merge conflict markers.
- [ ] No required document contains empty placeholder sections.
- [ ] Product vision and non-negotiables are referenced by later planning docs where relevant.
- [ ] Completed MVP pilot context is separated from post-MVP Phase 1 direction.
- [ ] React Web is documented as completed MVP pilot learner interface only.
- [ ] FastAPI is documented as completed MVP pilot backend API only.
- [ ] Flutter Mobile is documented as the approved post-MVP Phase 1 learner client.
- [ ] NestJS + TypeScript is documented as the post-MVP Phase 1 Backend API.
- [ ] Python AIM Engine remains backend-owned.
- [ ] Supabase PostgreSQL/Auth remain the default unless changed by documented decision.
- [ ] No separate Student Web App is introduced unless a later documented product decision changes this.
- [ ] Role permissions are clear enough for backend and frontend planning.
- [ ] Student journey is clear enough to design session APIs and UI flows.
- [ ] Parent scope is approved or explicitly conditional/deferred.
- [ ] Admin, content manager, and reviewer boundaries are clear.
- [ ] English skill tree and prerequisite relationships are documented.
- [ ] Placement test strategy is documented before implementation.
- [ ] Lesson content and question metadata requirements are documented.
- [ ] AIM Engine input and output contract is documented.
- [ ] AIM Engine logic remains assigned to Python/backend only.
- [ ] Client apps consume backend-approved AIM outputs only.
- [ ] Clients do not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
- [ ] Session data capture is defined before database implementation.
- [ ] Initial data model is planned before migrations.
- [ ] API baseline is planned before runtime endpoints are implemented.
- [ ] Flutter Mobile and admin navigation are scoped before screens are built.
- [ ] Analytics and report outputs are scoped.
- [ ] Notification behavior is scoped or explicitly deferred.
- [ ] AI safety, privacy, and data minimization rules are documented.
- [ ] AI Teacher Gateway remains backend-only.
- [ ] AI provider keys and privileged backend credentials are server-only.
- [ ] Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- [ ] Speed is not allowed as a mastery, student level, or direct difficulty-increase signal.
- [ ] Risk register and open decisions log exist.
- [ ] Final Phase 0 review records a go/no-go decision for Phase 1.
- [ ] Final QA gate records approval status and follow-up tasks.

## Phase 1 Entry Criteria

Phase 1 work may begin when:

1. Required Phase 0 planning documents are complete.
2. Required QA documents are complete.
3. Final review records `Go` or a narrow conditional `Go`.
4. Any remaining open decisions are explicitly assigned to an owner or deferred from affected implementation.
5. No active Phase 0 document contradicts product non-negotiables.
6. No active Phase 0 document contradicts the completed MVP pilot versus post-MVP Phase 1 stack split.
7. The team can create implementation tasks without guessing major product, safety, data, API, AIM, or client boundary decisions.

## Allowed Phase 1 Foundation Work

The following may begin after final gate approval:

- Flutter Mobile learner foundation planning and implementation tasks.
- NestJS + TypeScript Backend API foundation planning and implementation tasks.
- Python AIM Engine integration planning.
- Supabase PostgreSQL/Auth planning and migration design.
- API contract refinement.
- Environment and secret/config planning.
- Repository hygiene and documentation cleanup.
- Data model review.
- Learner-safe reporting design.
- Admin/internal dashboard foundation planning.

## Work That Must Wait For Specific Decisions

| Workstream | Wait Reason |
|---|---|
| Parent features | Parent access, consent, linking, and visibility scope must be approved first. |
| Broad admin dashboard implementation | Admin module depth must be split into Phase 1 foundation vs later production. |
| Placement implementation | Exact item counts and thresholds must be locked. |
| Content implementation beyond seed planning | Exact lesson seed count and metadata must be confirmed. |
| Notification implementation | Notification categories, payloads, and controls must be approved. |
| Production deployment | Deployment topology and secrets plan must be finalized. |
| Separate Student Web App | Not approved under current product direction. |

## Verification Commands

Run after all main wording updates are complete:

```bash
grep -R "<<<<<<<\|=======\|>>>>>>>" docs --include="*.md"

grep -R "FastAPI" docs --include="*.md"

grep -R "future Flutter\|Flutter remains\|Flutter later\|Flutter/mobile.*future\|React web/cloud first" docs --include="*.md"

grep -R "Student Web App" docs --include="*.md"

grep -R "speed.*mastery\|avg response time.*mastery\|speed score.*mastery" docs --include="*.md"

grep -R "diagnos\|clinical\|medical" docs --include="*.md"
```

Expected interpretation:

- Conflict marker grep should return no unresolved merge markers.
- `FastAPI` may appear only as completed MVP pilot context.
- Old Flutter-future wording should not appear in active planning docs.
- `Student Web App` references should state no separate post-MVP Student Web App is planned unless later documented.
- Speed/mastery references should preserve the no-speed mastery rule.
- Clinical/medical/diagnostic terms should appear only as forbidden-language or safety-boundary wording.

## Non-Goals

This checklist does not:

- Implement a Student Web App.
- Create backend runtime code.
- Create Flutter Mobile code.
- Create React Web code.
- Create database migrations.
- Create admin dashboard runtime code.
- Move AIM Engine logic into Flutter Mobile, React Web, admin UI, or any other client.
- Replace task-specific acceptance criteria in Notion.
- Remove completed MVP pilot history.

## Assumptions

- `docs/product/vision.md` is the active product direction source of truth.
- Notion remains the task status source of truth.
- Local Markdown documents remain the detailed planning source of truth.
- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Parent access remains conditional.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 documentation may be revised if later tasks reveal conflicts, but non-negotiables require explicit documented decisions to change.

## Open Questions

| Question | Current Handling |
|---|---|
| Which conditional tasks are mandatory if their feature is deferred? | Final review should mark each conditional task as complete, deferred, or not applicable with a reason. |
| Should parent scope be included in first Phase 1 implementation? | Conditional until consent, linking, and visibility rules are approved. |
| Which admin dashboard modules are required in the first Phase 1 build? | Split into foundation, conditional, and later production tasks. |
| Who approves the final Phase 0 lock? | Final review task should name the reviewer or decision owner. |
| Should root-level later-phase docs be moved or archived? | Handle through consolidation cleanup after main active docs are aligned. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/risk-register.md`
- `docs/product/open-decisions.md`
- `docs/product/phase-0-final-review.md`
- `docs/product/roles-and-permissions.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/admin/admin-dashboard-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/api/api-planning-baseline.md`
- `docs/data/session-data-capture.md`
- `docs/data/initial-data-model.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/analytics/reports-scope.md`
- `docs/tasks/phase_0_task_prompts.md`
- `AGENTS.md`
- `README.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, readiness rule, task checklist, QA checklist, acceptance checklist, Phase 1 entry criteria, verification commands, assumptions, non-goals, and open questions.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
