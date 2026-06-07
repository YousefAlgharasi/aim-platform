# AIM Phase 0 Readiness Checklist

## Purpose

This checklist defines when AIM Phase 0 planning is complete enough for Phase 1 System Foundation work to begin.

## Scope

This document covers product, journey, content, AIM Engine boundary, data, API, security, analytics, risk, and final review readiness gates. It is planning documentation only and does not implement backend, frontend, database, Flutter, admin dashboard, or AIM Engine runtime code.

## Readiness Rule

Phase 1 may start only when every P0 required Phase 0 output is complete, internally consistent, and safe for implementation planning.

| Gate | Required Before Phase 1 |
|---|---|
| Product direction | Vision, non-negotiables, MVP scope, and out-of-scope boundaries are documented. |
| User workflows | Student, parent, admin/content manager, and reviewer journeys are documented where included in MVP. |
| Learning model | Skill tree, placement rules, lesson structure, question bank rules, and AI teacher rules are documented. |
| AIM boundary | AIM Engine inputs, outputs, ownership, and client restrictions are documented. |
| Data planning | Lesson/session data capture and initial entity model are documented. |
| API planning | Planning-level API baseline exists before runtime implementation. |
| Navigation planning | Mobile/client and admin sitemaps are documented at planning level. |
| Safety and privacy | AI safety, privacy, credential, and educational-language rules are documented. |
| Reporting | Analytics and reports scope is documented. |
| Project control | Risks, open decisions, and final go/no-go review are documented. |

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked locally and present. |
| P0-001 | `docs/product/non-negotiables.md` | Checked locally and present. |

## Phase 0 Task Checklist

| Task | Output | Required For Phase 1 | Done Criteria |
|---|---|---|---|
| P0-001 Confirm AIM Product Vision and Non-Negotiables | `docs/product/vision.md`; `docs/product/non-negotiables.md` | Yes | Product direction and hard rules are clear. |
| P0-002 Create Phase 0 Readiness Checklist | `docs/product/phase-0-readiness-checklist.md` | Yes | This checklist exists and defines Phase 1 entry gates. |
| P0-003 Define User Roles and Permissions Matrix | `docs/product/roles-and-permissions.md` | Yes | MVP roles, access boundaries, and future expansion boundaries are clear. |
| P0-004 Define MVP Scope and Out-of-Scope Boundary | `docs/product/mvp-scope.md`; `docs/product/out-of-scope.md` | Yes | MVP and future scope cannot be confused during implementation. |
| P0-005 Define Student Journey and Learning Session Flow | `docs/journeys/student-journey.md` | Yes | Student path from onboarding through review is documented. |
| P0-006 Define Parent or Guardian Journey | `docs/journeys/parent-journey.md` | If parent role is in MVP | Parent visibility, limits, and communication rules are documented. |
| P0-007 Define Admin and Content Manager Journey | `docs/journeys/admin-content-manager-journey.md` | Yes | Internal content and pilot operations workflows are documented. |
| P0-008 Define Human Reviewer Journey | `docs/journeys/reviewer-journey.md` | If review workflow is in MVP | Human review responsibilities and boundaries are documented. |
| P0-009 Draft English Skill Tree for MVP | `docs/content/english-skill-tree.md` | Yes | A1 skill structure and prerequisites are implementation-ready. |
| P0-010 Define Placement and Diagnostic Rules | `docs/content/placement-diagnostic-rules.md` | Yes | Placement and diagnostic evidence rules are clear. |
| P0-011 Define Lesson Content Structure | `docs/content/lesson-content-structure.md` | Yes | Lesson and question metadata requirements are documented. |
| P0-012 Define Question Bank Rules | `docs/content/question-bank-rules.md` | Yes | Question quality, metadata, difficulty, and review rules are documented. |
| P0-013 Define AI Teacher Behavior Rules | `docs/ai/ai-teacher-behavior-rules.md` | Yes | Tutor behavior, allowed support, and safety boundaries are documented. |
| P0-014 Define AIM Engine Boundary and Input Output Contract | `docs/ai/aim-engine-io-contract.md` | Yes | Backend/client/AIM ownership and response contract are documented. |
| P0-015 Define Lesson Data Capture | `docs/data/lesson-data-capture.md` | Yes | Attempt, session, and analytics evidence fields are documented. |
| P0-016 Draft Database Entities | `docs/data/database-entities.md` | Yes | Initial product data model is clear before migrations. |
| P0-017 Draft API Planning Baseline | `docs/api/api-planning-baseline.md` | Yes | API surface is planned before implementation. |
| P0-018 Define Mobile App Sitemap and Navigation Scope | `docs/mobile/mobile-sitemap.md` | If mobile planning remains in Phase 0 | Client navigation scope is documented without implementation. |
| P0-019 Define Admin Dashboard Sitemap | `docs/admin/admin-dashboard-sitemap.md` | Yes | Internal dashboard surfaces are planned without implementation. |
| P0-020 Define Notification Scope and Rules | `docs/product/notification-scope.md` | If notifications are in MVP | Notification types, triggers, limits, and controls are documented. |
| P0-021 Define Analytics and Reports Scope | `docs/analytics/reports-scope.md` | Yes | Student, parent, admin, and AIM reporting needs are documented. |
| P0-022 Define AI Safety Privacy and Data Rules | `docs/security/ai-safety-privacy-rules.md` | Yes | Safety, privacy, minimization, and educational-only rules are documented. |
| P0-023 Create Risk Register and Open Decisions Log | `docs/product/risk-register.md`; `docs/product/open-decisions.md` | Yes | Known risks and unresolved decisions are visible. |
| P0-024 Phase 0 Final Review and Lock | `docs/product/phase-0-final-review.md` | Yes | Final go/no-go decision is recorded. |

## Acceptance Checklist

Phase 0 is ready for Phase 1 when all of the following are true:

- [ ] Every required Phase 0 output file exists.
- [ ] Every required output file has a title, purpose, scope, and acceptance-ready content.
- [ ] No required document contains empty placeholder sections.
- [ ] Product vision and non-negotiables are referenced by later planning docs where relevant.
- [ ] MVP scope is separated from future scope.
- [ ] Role permissions are clear enough for backend and frontend planning.
- [ ] Student journey is clear enough to design session APIs and UI flows.
- [ ] Admin, content manager, parent, and reviewer boundaries are clear where those roles are in scope.
- [ ] English A1 skill tree and prerequisite relationships are documented.
- [ ] Placement and diagnostic rules are documented before implementation.
- [ ] Lesson content and question metadata requirements are documented.
- [ ] AIM Engine input and output contract is documented.
- [ ] AIM Engine logic remains assigned to Python/backend only.
- [ ] Client apps consume AIM outputs only.
- [ ] Lesson/session data capture is defined before database implementation.
- [ ] Database entities are planned before migrations.
- [ ] API baseline is planned before runtime endpoints are implemented.
- [ ] Admin and client navigation are scoped before screens are built.
- [ ] Analytics and report outputs are scoped.
- [ ] Notification behavior is scoped or explicitly deferred.
- [ ] AI safety, privacy, and data minimization rules are documented.
- [ ] AI provider keys and privileged backend credentials are server-only.
- [ ] Learner behavior language remains educational and non-diagnostic.
- [ ] Speed is not allowed as a mastery, student level, or direct difficulty-increase signal.
- [ ] Risk register and open decisions log exist.
- [ ] Final Phase 0 review records a go/no-go decision for Phase 1.

## Phase 1 Entry Criteria

Phase 1 work may begin when:

1. P0-001 through P0-024 are marked `Done` in Notion.
2. The final review document records `Go` or a narrow conditional `Go`.
3. Any remaining open decisions are explicitly assigned to a Phase 1 owner or deferred from MVP.
4. No Phase 0 document contradicts the product non-negotiables.
5. The team can create implementation tasks without guessing major product, safety, data, or AIM boundary decisions.

## Non-Goals

- This checklist does not implement the Student Web App.
- This checklist does not create backend runtime code.
- This checklist does not create database migrations.
- This checklist does not move AIM Engine logic into Flutter or any client.
- This checklist does not replace task-specific acceptance criteria in Notion.

## Assumptions

- Notion remains the task status source of truth.
- Local Markdown documents remain the detailed planning source of truth.
- The first pilot remains React web, FastAPI, Supabase Auth, and Supabase PostgreSQL.
- Flutter remains outside the first pilot implementation scope.
- Phase 0 documentation may be revised if later tasks reveal conflicts, but non-negotiables require explicit documented decisions to change.

## Open Questions

| Question | Current Handling |
|---|---|
| Which conditional tasks are mandatory if their feature is deferred from MVP? | Final review should mark each conditional task as complete, deferred, or not applicable with a reason. |
| Should mobile sitemap planning stay in Phase 0 if Flutter is not part of the first pilot? | Keep as planning only unless the final review explicitly defers it. |
| Who approves the final Phase 0 lock? | Final review task should name the reviewer or decision owner. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/tasks/phase_0_task_prompts.md`
- `AGENTS.md`
- `README.md`

## Acceptance Notes

- Dependencies checked: P0-001.
- This document has a title, purpose, scope, acceptance checklist, Phase 1 entry criteria, assumptions, non-goals, and open questions.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.

