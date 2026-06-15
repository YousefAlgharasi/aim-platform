# AIM Phase 4 — Placement Test Task Prompts

## Purpose

This file is the execution prompt source of truth for Phase 4 tasks.
It must match the Phase 4 Notion task database exactly for ID, Task, Branch, Output, Dependency, Priority, and AgentPrompt.

- Repository: `https://github.com/YousefAlgharasi/aim-platform`
- Notion Phase 4 Tasks Database: `https://app.notion.com/p/25c9a6fe1d894914b0c2d13008932dd1`
- Prompt file path: `docs/tasks/phase_4_task_prompts.md`
- Phase name: `Phase 4 — Placement Test`
- Task range: `P4-001` to `P4-080`

---

## Phase 4 Active Direction

Phase 4 builds the Placement Test system only. It creates the foundation for estimating the learner's starting level, initial skill mastery map, weakness map, and initial learning path.

### In Scope

- Placement test rules
- Placement question pools
- Placement question-to-skill linking
- Placement attempts and answers
- Backend-authoritative placement scoring
- Estimated CEFR level: A1 / A2 / B1
- Skill mastery map from placement only
- Weakness map from placement only
- Initial learning path foundation
- Backend placement APIs
- Admin placement management foundation
- Flutter placement flow foundation
- Placement QA, security review, no-AIM runtime review, and Phase 5 readiness

### Out of Scope

- AIM Engine runtime integration
- Lesson delivery
- Practice sessions
- AI Teacher
- AI Prompt Management
- AI Cost Control
- Progress dashboard
- Recommendations after lessons
- Review / retention
- Parent dashboard
- Payments
- Voice AI
- Student Web App

### Non-Negotiable Rules

- Flutter must not calculate placement score locally.
- Flutter must not estimate level locally.
- Flutter must not calculate skill mastery locally.
- Flutter must not calculate weakness locally.
- Backend is the final authority for placement scoring and result generation.
- Phase 4 must not call the AIM Engine runtime.
- Placement questions must be linked to skills before they can produce skill maps or weakness maps.
- Speaking and writing are optional later capabilities and must not block objective placement MVP.

---

## Agent Master Instruction

Use this instruction before executing any task in this file.

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Repository: https://github.com/YousefAlgharasi/aim-platform
Notion Phase 4 Tasks Database: https://app.notion.com/p/25c9a6fe1d894914b0c2d13008932dd1
Prompt file: docs/tasks/phase_4_task_prompts.md

Workflow:
1. Open the Notion Phase 4 Tasks database.
2. Pick exactly one task where Status = Undone and Assigned is empty.
3. Verify all dependencies are Done or have their required outputs present.
4. Assign the task to yourself before implementation.
5. Set Status = In Progress.
6. Create and use the exact branch listed in the task.
7. Open the exact #P4-XXX section in this prompt file.
8. Execute only that task; do not include out-of-scope work.
9. Run required checks.
10. Commit and push using: P4-XXX: <short task title>.
11. Add a Notion completion comment with files changed, commit, checks, and limitations.
12. Mark the task Done only after the output is pushed and verified.

Stop immediately and mark Blocked if:
- A dependency is missing.
- Notion and this prompt file disagree.
- The task requires AIM Engine runtime integration.
- The task requires AI Teacher, lesson delivery, recommendations, or progress dashboard.
- The task would make Flutter calculate placement scoring, level, mastery, or weakness.
- A required secret or credential is missing.
```

---

## Task Index

| ID | Task | Branch | Priority | Dependency | Output | AgentPrompt |
|---|---|---|---|---|---|---|
| P4-001 | Create Phase 4 Placement Test Charter | `phase4/P4-001-placement-test-charter` | P0 | P3-070 | `docs/phase-4/placement-test-charter.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-001` |
| P4-002 | Create Phase 4 Task Execution Rules | `phase4/P4-002-phase-4-task-rules` | P0 | P4-001 | `docs/phase-4/task-execution-rules.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-002` |
| P4-003 | Define Placement Scope and Out-of-Scope | `phase4/P4-003-placement-scope-boundaries` | P0 | P4-001 | `docs/phase-4/placement-scope-boundaries.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-003` |
| P4-004 | Document No-AIM-Runtime Rule for Phase 4 | `phase4/P4-004-no-aim-runtime-rule` | P0 | P4-001 | `docs/phase-4/no-aim-runtime-rule.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-004` |
| P4-005 | Create Placement Data Flow Document | `phase4/P4-005-placement-data-flow` | P0 | P4-003 | `docs/phase-4/placement-data-flow.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-005` |
| P4-006 | Create Placement API Map | `phase4/P4-006-placement-api-map` | P0 | P4-005 | `docs/phase-4/placement-api-map.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-006` |
| P4-007 | Define Placement Result Semantics | `phase4/P4-007-placement-result-definition` | P0 | P4-003 | `docs/phase-4/placement-result-definition.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-007` |
| P4-008 | Define Placement Skill Map Rules | `phase4/P4-008-placement-skill-map-rules` | P0 | P3-006, P4-007 | `docs/phase-4/placement-skill-map-rules.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-008` |
| P4-009 | Define Placement Test Contract | `phase4/P4-009-placement-test-contract` | P0 | P4-006 | `packages/shared-contracts/api/placement-test-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-009` |
| P4-010 | Define Placement Section Contract | `phase4/P4-010-placement-section-contract` | P0 | P4-009 | `packages/shared-contracts/api/placement-section-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-010` |
| P4-011 | Define Placement Question Contract | `phase4/P4-011-placement-question-contract` | P0 | P3-014, P4-010 | `packages/shared-contracts/api/placement-question-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-011` |
| P4-012 | Define Placement Answer Contract | `phase4/P4-012-placement-answer-contract` | P0 | P4-011 | `packages/shared-contracts/api/placement-answer-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-012` |
| P4-013 | Define Placement Attempt Contract | `phase4/P4-013-placement-attempt-contract` | P0 | P4-012 | `packages/shared-contracts/api/placement-attempt-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-013` |
| P4-014 | Define Placement Result Contract | `phase4/P4-014-placement-result-contract` | P0 | P4-007, P4-013 | `packages/shared-contracts/api/placement-result-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-014` |
| P4-015 | Define Initial Learning Path Contract | `phase4/P4-015-placement-learning-path-contract` | P1 | P4-014 | `packages/shared-contracts/api/initial-learning-path-contracts.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-015` |
| P4-016 | Add Placement Error Codes | `phase4/P4-016-placement-error-codes` | P1 | P4-009, P4-010, P4-011, P4-012, P4-013, P4-014, P4-015 | `Update packages/shared-contracts/api/errors.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-016` |
| P4-017 | Create Placement Tests Migration | `phase4/P4-017-placement-tests-migration` | P0 | P4-009 | `DB migration for placement_tests` | `Use docs/tasks/phase_4_task_prompts.md #P4-017` |
| P4-018 | Create Placement Sections Migration | `phase4/P4-018-placement-sections-migration` | P0 | P4-010 | `DB migration for placement_sections` | `Use docs/tasks/phase_4_task_prompts.md #P4-018` |
| P4-019 | Create Placement Questions Migration | `phase4/P4-019-placement-questions-migration` | P0 | P4-011 | `DB migration for placement_questions` | `Use docs/tasks/phase_4_task_prompts.md #P4-019` |
| P4-020 | Create Placement Question Skills Mapping | `phase4/P4-020-placement-question-skills-migration` | P0 | P3-020, P4-019 | `DB migration for placement_question_skills` | `Use docs/tasks/phase_4_task_prompts.md #P4-020` |
| P4-021 | Create Placement Attempts Migration | `phase4/P4-021-placement-attempts-migration` | P0 | P4-013 | `DB migration for placement_attempts` | `Use docs/tasks/phase_4_task_prompts.md #P4-021` |
| P4-022 | Create Placement Answers Migration | `phase4/P4-022-placement-answers-migration` | P0 | P4-012, P4-021 | `DB migration for placement_answers` | `Use docs/tasks/phase_4_task_prompts.md #P4-022` |
| P4-023 | Create Placement Results Migration | `phase4/P4-023-placement-results-migration` | P0 | P4-014, P4-022 | `DB migration for placement_results` | `Use docs/tasks/phase_4_task_prompts.md #P4-023` |
| P4-024 | Create Initial Learning Path Migration | `phase4/P4-024-initial-learning-path-migration` | P1 | P4-015, P4-023 | `DB migration for initial learning path records` | `Use docs/tasks/phase_4_task_prompts.md #P4-024` |
| P4-025 | Create Placement Audit Log Migration | `phase4/P4-025-placement-audit-log-migration` | P1 | P4-021 | `DB migration for placement audit events` | `Use docs/tasks/phase_4_task_prompts.md #P4-025` |
| P4-026 | Add Placement Performance Indexes | `phase4/P4-026-placement-indexes` | P1 | P4-017, P4-018, P4-019, P4-020, P4-021, P4-022, P4-023, P4-024, P4-025 | `DB indexes for placement flow` | `Use docs/tasks/phase_4_task_prompts.md #P4-026` |
| P4-027 | Add Placement Seed Data | `phase4/P4-027-placement-seed-data` | P0 | P4-019, P4-020 | `Seed test, sections, sample questions` | `Use docs/tasks/phase_4_task_prompts.md #P4-027` |
| P4-028 | Create Placement Data Integrity Check | `phase4/P4-028-placement-data-integrity-check` | P1 | P4-027 | `docs/phase-4/placement-data-integrity-check.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-028` |
| P4-029 | Define Placement Blueprint Rules | `phase4/P4-029-placement-blueprint-rules` | P0 | P4-007, P4-008 | `docs/phase-4/placement-blueprint-rules.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-029` |
| P4-030 | Define CEFR Level Thresholds | `phase4/P4-030-placement-level-thresholds` | P0 | P4-029 | `docs/phase-4/placement-level-thresholds.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-030` |
| P4-031 | Define Section Weighting Rules | `phase4/P4-031-placement-section-weighting` | P1 | P4-029 | `docs/phase-4/placement-section-weighting.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-031` |
| P4-032 | Define Skill Scoring Rules | `phase4/P4-032-placement-skill-scoring-rules` | P0 | P4-008, P4-030 | `docs/phase-4/placement-skill-scoring-rules.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-032` |
| P4-033 | Define Weakness Map Rules | `phase4/P4-033-placement-weakness-rules` | P0 | P4-032 | `docs/phase-4/placement-weakness-rules.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-033` |
| P4-034 | Define Initial Learning Path Rules | `phase4/P4-034-placement-initial-learning-path-rules` | P0 | P4-033, P3-006 | `docs/phase-4/initial-learning-path-rules.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-034` |
| P4-035 | Document No Client-Side Scoring Rule | `phase4/P4-035-placement-no-client-scoring-rule` | P0 | P4-030, P4-031, P4-032, P4-033, P4-034 | `docs/phase-4/no-client-side-placement-scoring.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-035` |
| P4-036 | Document Speaking/Writing Deferral | `phase4/P4-036-placement-speaking-writing-deferral` | P2 | P4-003 | `docs/phase-4/speaking-writing-deferral.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-036` |
| P4-037 | Create Backend Placement Feature Module | `phase4/P4-037-placement-feature-module` | P0 | P4-006, P4-017 | `Backend placement module skeleton` | `Use docs/tasks/phase_4_task_prompts.md #P4-037` |
| P4-038 | Implement Placement Test Read API | `phase4/P4-038-placement-test-read-api` | P0 | P4-009, P4-037 | `API to get active placement test metadata` | `Use docs/tasks/phase_4_task_prompts.md #P4-038` |
| P4-039 | Implement Placement Sections API | `phase4/P4-039-placement-sections-api` | P0 | P4-010, P4-038 | `API to list placement sections` | `Use docs/tasks/phase_4_task_prompts.md #P4-039` |
| P4-040 | Implement Placement Question Delivery API | `phase4/P4-040-placement-question-delivery-api` | P0 | P4-011, P4-019, P4-020 | `API to deliver placement questions` | `Use docs/tasks/phase_4_task_prompts.md #P4-040` |
| P4-041 | Implement Placement Attempt Start API | `phase4/P4-041-placement-attempt-start-api` | P0 | P4-013, P4-021 | `API to start placement attempt` | `Use docs/tasks/phase_4_task_prompts.md #P4-041` |
| P4-042 | Implement Placement Answer Submit API | `phase4/P4-042-placement-answer-submit-api` | P0 | P4-012, P4-022 | `API to submit placement answer` | `Use docs/tasks/phase_4_task_prompts.md #P4-042` |
| P4-043 | Implement Placement Attempt Complete API | `phase4/P4-043-placement-attempt-complete-api` | P0 | P4-021, P4-022 | `API to complete placement attempt` | `Use docs/tasks/phase_4_task_prompts.md #P4-043` |
| P4-044 | Implement Answer Validation Service | `phase4/P4-044-placement-answer-validation-service` | P0 | P4-042 | `Backend validates objective answers` | `Use docs/tasks/phase_4_task_prompts.md #P4-044` |
| P4-045 | Implement Placement Scoring Service | `phase4/P4-045-placement-scoring-service` | P0 | P4-030, P4-031, P4-032, P4-033, P4-034, P4-044 | `Backend scoring service` | `Use docs/tasks/phase_4_task_prompts.md #P4-045` |
| P4-046 | Implement Placement Result Service | `phase4/P4-046-placement-result-service` | P0 | P4-014, P4-023, P4-045 | `Create estimated level, skill map, weakness map` | `Use docs/tasks/phase_4_task_prompts.md #P4-046` |
| P4-047 | Implement Initial Learning Path Service | `phase4/P4-047-initial-learning-path-service` | P0 | P4-015, P4-024, P4-046 | `Create initial learning path from result` | `Use docs/tasks/phase_4_task_prompts.md #P4-047` |
| P4-048 | Implement Placement Result Read API | `phase4/P4-048-placement-result-read-api` | P0 | P4-046 | `API to fetch placement result` | `Use docs/tasks/phase_4_task_prompts.md #P4-048` |
| P4-049 | Implement Placement Retake Policy | `phase4/P4-049-placement-retake-policy-api` | P1 | P4-041, P4-048 | `Backend retake restrictions` | `Use docs/tasks/phase_4_task_prompts.md #P4-049` |
| P4-050 | Add Placement Audit Logging | `phase4/P4-050-placement-audit-logging` | P1 | P4-025, P4-041, P4-042, P4-043, P4-048 | `Audit logs for start/submit/complete/result` | `Use docs/tasks/phase_4_task_prompts.md #P4-050` |
| P4-051 | Add Placement Permission Guards | `phase4/P4-051-placement-permission-guards` | P0 | P2-037, P2-038, P4-037 | `Backend guards for student/admin access` | `Use docs/tasks/phase_4_task_prompts.md #P4-051` |
| P4-052 | Add Placement Backend Tests | `phase4/P4-052-placement-backend-tests` | P0 | P4-037, P4-038, P4-039, P4-040, P4-041, P4-042, P4-043, P4-044, P4-045, P4-046, P4-047, P4-048, P4-049, P4-050, P4-051 | `Backend tests for placement flow` | `Use docs/tasks/phase_4_task_prompts.md #P4-052` |
| P4-053 | Add Admin Placement Navigation | `phase4/P4-053-admin-placement-navigation` | P1 | P4-006 | `Admin dashboard navigation entry` | `Use docs/tasks/phase_4_task_prompts.md #P4-053` |
| P4-054 | Build Admin Placement Tests List | `phase4/P4-054-admin-placement-tests-list` | P1 | P4-038, P4-053 | `Admin placement tests page` | `Use docs/tasks/phase_4_task_prompts.md #P4-054` |
| P4-055 | Build Admin Placement Sections UI | `phase4/P4-055-admin-placement-sections-ui` | P1 | P4-039, P4-054 | `Admin section management UI` | `Use docs/tasks/phase_4_task_prompts.md #P4-055` |
| P4-056 | Build Admin Placement Questions UI | `phase4/P4-056-admin-placement-questions-ui` | P1 | P4-040, P4-055 | `Admin placement questions UI` | `Use docs/tasks/phase_4_task_prompts.md #P4-056` |
| P4-057 | Build Admin Placement Skill Linking UI | `phase4/P4-057-admin-placement-skill-linking-ui` | P1 | P4-020, P4-056 | `Admin links placement questions to skills` | `Use docs/tasks/phase_4_task_prompts.md #P4-057` |
| P4-058 | Build Admin Placement Status UI | `phase4/P4-058-admin-placement-status-ui` | P1 | P4-038, P4-054 | `Admin draft/published placement control` | `Use docs/tasks/phase_4_task_prompts.md #P4-058` |
| P4-059 | Build Admin Placement Results View | `phase4/P4-059-admin-placement-results-view` | P1 | P4-048, P4-053 | `Admin can view placement results` | `Use docs/tasks/phase_4_task_prompts.md #P4-059` |
| P4-060 | Add Admin Placement Permission Check | `phase4/P4-060-admin-placement-permission-check` | P1 | P4-051, P4-053, P4-054, P4-055, P4-056, P4-057, P4-058, P4-059 | `Admin UI respects backend permissions` | `Use docs/tasks/phase_4_task_prompts.md #P4-060` |
| P4-061 | Create Flutter Placement Feature Skeleton | `phase4/P4-061-flutter-placement-feature-skeleton` | P0 | P4-006 | `Flutter feature/placement_test structure` | `Use docs/tasks/phase_4_task_prompts.md #P4-061` |
| P4-062 | Add Flutter Placement Models | `phase4/P4-062-flutter-placement-models` | P0 | P4-009, P4-010, P4-011, P4-012, P4-013, P4-014, P4-061 | `Flutter models/entities for placement` | `Use docs/tasks/phase_4_task_prompts.md #P4-062` |
| P4-063 | Add Flutter Placement Datasource | `phase4/P4-063-flutter-placement-datasource` | P0 | P4-038, P4-039, P4-040, P4-041, P4-042, P4-043, P4-048, P4-062 | `Remote datasource for placement APIs` | `Use docs/tasks/phase_4_task_prompts.md #P4-063` |
| P4-064 | Add Flutter Placement Repository | `phase4/P4-064-flutter-placement-repository` | P0 | P4-063 | `Repository/provider layer` | `Use docs/tasks/phase_4_task_prompts.md #P4-064` |
| P4-065 | Build Placement Start Page | `phase4/P4-065-flutter-placement-start-page` | P0 | P4-041, P4-064 | `Student starts placement test` | `Use docs/tasks/phase_4_task_prompts.md #P4-065` |
| P4-066 | Build Placement Section Page | `phase4/P4-066-flutter-placement-section-page` | P0 | P4-039, P4-065 | `Student sees current section` | `Use docs/tasks/phase_4_task_prompts.md #P4-066` |
| P4-067 | Build Placement Question Page | `phase4/P4-067-flutter-placement-question-page` | P0 | P4-040, P4-066 | `Student answers question` | `Use docs/tasks/phase_4_task_prompts.md #P4-067` |
| P4-068 | Build Placement Submit Flow | `phase4/P4-068-flutter-placement-answer-submit-flow` | P0 | P4-042, P4-067 | `Submit answers to backend` | `Use docs/tasks/phase_4_task_prompts.md #P4-068` |
| P4-069 | Build Placement Result Page | `phase4/P4-069-flutter-placement-result-page` | P0 | P4-048, P4-068 | `Show estimated level and safe summary` | `Use docs/tasks/phase_4_task_prompts.md #P4-069` |
| P4-070 | Add Flutter No-Scoring Regression Check | `phase4/P4-070-flutter-no-placement-scoring-check` | P0 | P4-069, P4-035 | `Prove Flutter does not score placement locally` | `Use docs/tasks/phase_4_task_prompts.md #P4-070` |
| P4-071 | Add Flutter Placement Flow Checks | `phase4/P4-071-flutter-placement-flow-tests` | P1 | P4-061, P4-062, P4-063, P4-064, P4-065, P4-066, P4-067, P4-068, P4-069, P4-070 | `flutter analyze and tests if available` | `Use docs/tasks/phase_4_task_prompts.md #P4-071` |
| P4-072 | Review Placement Question Coverage | `phase4/P4-072-placement-question-coverage-review` | P1 | P4-027, P4-057 | `docs/quality/phase-4-placement-question-coverage-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-072` |
| P4-073 | Review Placement Skill Linking | `phase4/P4-073-placement-skill-linking-review` | P0 | P4-020, P4-057 | `docs/quality/phase-4-placement-skill-linking-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-073` |
| P4-074 | Review Placement Scoring Rules | `phase4/P4-074-placement-scoring-review` | P0 | P4-045, P4-046 | `docs/quality/phase-4-placement-scoring-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-074` |
| P4-075 | Run Placement Security Review | `phase4/P4-075-placement-security-review` | P0 | P4-051, P4-052 | `docs/quality/phase-4-placement-security-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-075` |
| P4-076 | Run Placement E2E Check | `phase4/P4-076-placement-e2e-check` | P0 | P4-052, P4-071 | `docs/phase-4/placement-e2e-check.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-076` |
| P4-077 | Run No-AIM Runtime Review | `phase4/P4-077-no-aim-runtime-review` | P0 | P4-046, P4-070 | `docs/quality/phase-4-no-aim-runtime-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-077` |
| P4-078 | Create Phase 5 Readiness Checklist | `phase4/P4-078-phase-5-readiness-checklist` | P0 | P4-072, P4-073, P4-074, P4-075, P4-076, P4-077 | `docs/phase-5/readiness-checklist.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-078` |
| P4-079 | Review Phase 4 Output Completeness | `phase4/P4-079-phase-4-output-completeness-review` | P0 | P4-078 | `docs/quality/phase-4-output-completeness-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-079` |
| P4-080 | Create Phase 4 Final Review and Handoff | `phase4/P4-080-phase-4-final-review` | P0 | P4-079 | `docs/phase-4/final-review.md` | `Use docs/tasks/phase_4_task_prompts.md #P4-080` |

---

## Group A — Phase 4 Control & Scope

### #P4-001 — Create Phase 4 Placement Test Charter

- **Task:** Create Phase 4 Placement Test Charter
- **ID:** P4-001
- **Branch:** `phase4/P4-001-placement-test-charter`
- **Description:** Define Phase 4 as the Placement Test phase only.
- **Goal:** Lock Phase 4 scope and prevent lesson delivery, AIM runtime, or AI Teacher work.
- **Output:** `docs/phase-4/placement-test-charter.md`
- **Priority:** P0
- **Dependency:** P3-070
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-001`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-001 only.
Task: Create Phase 4 Placement Test Charter
Branch: phase4/P4-001-placement-test-charter
Description: Define Phase 4 as the Placement Test phase only.
Goal: Lock Phase 4 scope and prevent lesson delivery, AIM runtime, or AI Teacher work.
Required output: docs/phase-4/placement-test-charter.md
Priority: P0
Dependencies: P3-070

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-test-charter.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-002 — Create Phase 4 Task Execution Rules

- **Task:** Create Phase 4 Task Execution Rules
- **ID:** P4-002
- **Branch:** `phase4/P4-002-phase-4-task-rules`
- **Description:** Create execution rules for Phase 4 tasks.
- **Goal:** Ensure team members execute one scoped placement task at a time.
- **Output:** `docs/phase-4/task-execution-rules.md`
- **Priority:** P0
- **Dependency:** P4-001
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-002`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-002 only.
Task: Create Phase 4 Task Execution Rules
Branch: phase4/P4-002-phase-4-task-rules
Description: Create execution rules for Phase 4 tasks.
Goal: Ensure team members execute one scoped placement task at a time.
Required output: docs/phase-4/task-execution-rules.md
Priority: P0
Dependencies: P4-001

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/task-execution-rules.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-003 — Define Placement Scope and Out-of-Scope

- **Task:** Define Placement Scope and Out-of-Scope
- **ID:** P4-003
- **Branch:** `phase4/P4-003-placement-scope-boundaries`
- **Description:** Document allowed and forbidden work for Placement Test.
- **Goal:** Prevent Phase 4 from absorbing AIM integration, lessons, progress, or AI Teacher.
- **Output:** `docs/phase-4/placement-scope-boundaries.md`
- **Priority:** P0
- **Dependency:** P4-001
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-003`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-003 only.
Task: Define Placement Scope and Out-of-Scope
Branch: phase4/P4-003-placement-scope-boundaries
Description: Document allowed and forbidden work for Placement Test.
Goal: Prevent Phase 4 from absorbing AIM integration, lessons, progress, or AI Teacher.
Required output: docs/phase-4/placement-scope-boundaries.md
Priority: P0
Dependencies: P4-001

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-scope-boundaries.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-004 — Document No-AIM-Runtime Rule for Phase 4

- **Task:** Document No-AIM-Runtime Rule for Phase 4
- **ID:** P4-004
- **Branch:** `phase4/P4-004-no-aim-runtime-rule`
- **Description:** Document that Phase 4 must not call the AIM Engine runtime.
- **Goal:** Keep AIM Engine integration reserved for Phase 5.
- **Output:** `docs/phase-4/no-aim-runtime-rule.md`
- **Priority:** P0
- **Dependency:** P4-001
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-004`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-004 only.
Task: Document No-AIM-Runtime Rule for Phase 4
Branch: phase4/P4-004-no-aim-runtime-rule
Description: Document that Phase 4 must not call the AIM Engine runtime.
Goal: Keep AIM Engine integration reserved for Phase 5.
Required output: docs/phase-4/no-aim-runtime-rule.md
Priority: P0
Dependencies: P4-001

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/no-aim-runtime-rule.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-005 — Create Placement Data Flow Document

- **Task:** Create Placement Data Flow Document
- **ID:** P4-005
- **Branch:** `phase4/P4-005-placement-data-flow`
- **Description:** Describe placement flow from start to result.
- **Goal:** Make data movement clear from Flutter to Backend to database.
- **Output:** `docs/phase-4/placement-data-flow.md`
- **Priority:** P0
- **Dependency:** P4-003
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-005`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-005 only.
Task: Create Placement Data Flow Document
Branch: phase4/P4-005-placement-data-flow
Description: Describe placement flow from start to result.
Goal: Make data movement clear from Flutter to Backend to database.
Required output: docs/phase-4/placement-data-flow.md
Priority: P0
Dependencies: P4-003

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-data-flow.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-006 — Create Placement API Map

- **Task:** Create Placement API Map
- **ID:** P4-006
- **Branch:** `phase4/P4-006-placement-api-map`
- **Description:** Map all required placement endpoints and payloads.
- **Goal:** Guide backend and Flutter placement implementation.
- **Output:** `docs/phase-4/placement-api-map.md`
- **Priority:** P0
- **Dependency:** P4-005
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-006`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-006 only.
Task: Create Placement API Map
Branch: phase4/P4-006-placement-api-map
Description: Map all required placement endpoints and payloads.
Goal: Guide backend and Flutter placement implementation.
Required output: docs/phase-4/placement-api-map.md
Priority: P0
Dependencies: P4-005

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-api-map.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-007 — Define Placement Result Semantics

- **Task:** Define Placement Result Semantics
- **ID:** P4-007
- **Branch:** `phase4/P4-007-placement-result-definition`
- **Description:** Define estimated level, skill map, weakness map, and initial learning path semantics.
- **Goal:** Avoid inconsistent interpretation of placement outputs.
- **Output:** `docs/phase-4/placement-result-definition.md`
- **Priority:** P0
- **Dependency:** P4-003
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-007`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-007 only.
Task: Define Placement Result Semantics
Branch: phase4/P4-007-placement-result-definition
Description: Define estimated level, skill map, weakness map, and initial learning path semantics.
Goal: Avoid inconsistent interpretation of placement outputs.
Required output: docs/phase-4/placement-result-definition.md
Priority: P0
Dependencies: P4-003

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-result-definition.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-008 — Define Placement Skill Map Rules

- **Task:** Define Placement Skill Map Rules
- **ID:** P4-008
- **Branch:** `phase4/P4-008-placement-skill-map-rules`
- **Description:** Define how placement questions map to skills.
- **Goal:** Ensure placement results can produce skill-level diagnostic data.
- **Output:** `docs/phase-4/placement-skill-map-rules.md`
- **Priority:** P0
- **Dependency:** P3-006, P4-007
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-008`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-008 only.
Task: Define Placement Skill Map Rules
Branch: phase4/P4-008-placement-skill-map-rules
Description: Define how placement questions map to skills.
Goal: Ensure placement results can produce skill-level diagnostic data.
Required output: docs/phase-4/placement-skill-map-rules.md
Priority: P0
Dependencies: P3-006, P4-007

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-skill-map-rules.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group B — Shared Contracts

### #P4-009 — Define Placement Test Contract

- **Task:** Define Placement Test Contract
- **ID:** P4-009
- **Branch:** `phase4/P4-009-placement-test-contract`
- **Description:** Define shared contract for placement test metadata.
- **Goal:** Create stable backend/client contract for placement tests.
- **Output:** `packages/shared-contracts/api/placement-test-contracts.md`
- **Priority:** P0
- **Dependency:** P4-006
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-009`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-009 only.
Task: Define Placement Test Contract
Branch: phase4/P4-009-placement-test-contract
Description: Define shared contract for placement test metadata.
Goal: Create stable backend/client contract for placement tests.
Required output: packages/shared-contracts/api/placement-test-contracts.md
Priority: P0
Dependencies: P4-006

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/placement-test-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-010 — Define Placement Section Contract

- **Task:** Define Placement Section Contract
- **ID:** P4-010
- **Branch:** `phase4/P4-010-placement-section-contract`
- **Description:** Define sections such as grammar, vocabulary, reading, listening.
- **Goal:** Standardize placement test sections.
- **Output:** `packages/shared-contracts/api/placement-section-contracts.md`
- **Priority:** P0
- **Dependency:** P4-009
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-010`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-010 only.
Task: Define Placement Section Contract
Branch: phase4/P4-010-placement-section-contract
Description: Define sections such as grammar, vocabulary, reading, listening.
Goal: Standardize placement test sections.
Required output: packages/shared-contracts/api/placement-section-contracts.md
Priority: P0
Dependencies: P4-009

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/placement-section-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-011 — Define Placement Question Contract

- **Task:** Define Placement Question Contract
- **ID:** P4-011
- **Branch:** `phase4/P4-011-placement-question-contract`
- **Description:** Define placement question shape and allowed question types.
- **Goal:** Standardize placement question delivery.
- **Output:** `packages/shared-contracts/api/placement-question-contracts.md`
- **Priority:** P0
- **Dependency:** P3-014, P4-010
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-011`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-011 only.
Task: Define Placement Question Contract
Branch: phase4/P4-011-placement-question-contract
Description: Define placement question shape and allowed question types.
Goal: Standardize placement question delivery.
Required output: packages/shared-contracts/api/placement-question-contracts.md
Priority: P0
Dependencies: P3-014, P4-010

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/placement-question-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-012 — Define Placement Answer Contract

- **Task:** Define Placement Answer Contract
- **ID:** P4-012
- **Branch:** `phase4/P4-012-placement-answer-contract`
- **Description:** Define answer submission payloads for placement questions.
- **Goal:** Standardize placement answer submission.
- **Output:** `packages/shared-contracts/api/placement-answer-contracts.md`
- **Priority:** P0
- **Dependency:** P4-011
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-012`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-012 only.
Task: Define Placement Answer Contract
Branch: phase4/P4-012-placement-answer-contract
Description: Define answer submission payloads for placement questions.
Goal: Standardize placement answer submission.
Required output: packages/shared-contracts/api/placement-answer-contracts.md
Priority: P0
Dependencies: P4-011

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/placement-answer-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-013 — Define Placement Attempt Contract

- **Task:** Define Placement Attempt Contract
- **ID:** P4-013
- **Branch:** `phase4/P4-013-placement-attempt-contract`
- **Description:** Define attempt lifecycle contract.
- **Goal:** Standardize start, submit, complete, and result states.
- **Output:** `packages/shared-contracts/api/placement-attempt-contracts.md`
- **Priority:** P0
- **Dependency:** P4-012
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-013`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-013 only.
Task: Define Placement Attempt Contract
Branch: phase4/P4-013-placement-attempt-contract
Description: Define attempt lifecycle contract.
Goal: Standardize start, submit, complete, and result states.
Required output: packages/shared-contracts/api/placement-attempt-contracts.md
Priority: P0
Dependencies: P4-012

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/placement-attempt-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-014 — Define Placement Result Contract

- **Task:** Define Placement Result Contract
- **ID:** P4-014
- **Branch:** `phase4/P4-014-placement-result-contract`
- **Description:** Define response contract for placement results.
- **Goal:** Standardize estimated level, skill mastery map, weakness map, and initial path output.
- **Output:** `packages/shared-contracts/api/placement-result-contracts.md`
- **Priority:** P0
- **Dependency:** P4-007, P4-013
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-014`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-014 only.
Task: Define Placement Result Contract
Branch: phase4/P4-014-placement-result-contract
Description: Define response contract for placement results.
Goal: Standardize estimated level, skill mastery map, weakness map, and initial path output.
Required output: packages/shared-contracts/api/placement-result-contracts.md
Priority: P0
Dependencies: P4-007, P4-013

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/placement-result-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-015 — Define Initial Learning Path Contract

- **Task:** Define Initial Learning Path Contract
- **ID:** P4-015
- **Branch:** `phase4/P4-015-placement-learning-path-contract`
- **Description:** Define initial learning path contract generated after placement.
- **Goal:** Prepare handoff from placement to later learning path execution.
- **Output:** `packages/shared-contracts/api/initial-learning-path-contracts.md`
- **Priority:** P1
- **Dependency:** P4-014
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-015`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-015 only.
Task: Define Initial Learning Path Contract
Branch: phase4/P4-015-placement-learning-path-contract
Description: Define initial learning path contract generated after placement.
Goal: Prepare handoff from placement to later learning path execution.
Required output: packages/shared-contracts/api/initial-learning-path-contracts.md
Priority: P1
Dependencies: P4-014

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `packages/shared-contracts/api/initial-learning-path-contracts.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-016 — Add Placement Error Codes

- **Task:** Add Placement Error Codes
- **ID:** P4-016
- **Branch:** `phase4/P4-016-placement-error-codes`
- **Description:** Add placement-specific error codes to shared errors.
- **Goal:** Provide consistent placement error handling.
- **Output:** `Update packages/shared-contracts/api/errors.md`
- **Priority:** P1
- **Dependency:** P4-009, P4-010, P4-011, P4-012, P4-013, P4-014, P4-015
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-016`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-016 only.
Task: Add Placement Error Codes
Branch: phase4/P4-016-placement-error-codes
Description: Add placement-specific error codes to shared errors.
Goal: Provide consistent placement error handling.
Required output: Update packages/shared-contracts/api/errors.md
Priority: P1
Dependencies: P4-009, P4-010, P4-011, P4-012, P4-013, P4-014, P4-015

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Update packages/shared-contracts/api/errors.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group C — Placement Database Foundation

### #P4-017 — Create Placement Tests Migration

- **Task:** Create Placement Tests Migration
- **ID:** P4-017
- **Branch:** `phase4/P4-017-placement-tests-migration`
- **Description:** Create database structure for placement tests.
- **Goal:** Store placement test definitions.
- **Output:** `DB migration for placement_tests`
- **Priority:** P0
- **Dependency:** P4-009
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-017`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-017 only.
Task: Create Placement Tests Migration
Branch: phase4/P4-017-placement-tests-migration
Description: Create database structure for placement tests.
Goal: Store placement test definitions.
Required output: DB migration for placement_tests
Priority: P0
Dependencies: P4-009

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_tests` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-018 — Create Placement Sections Migration

- **Task:** Create Placement Sections Migration
- **ID:** P4-018
- **Branch:** `phase4/P4-018-placement-sections-migration`
- **Description:** Create database structure for placement sections.
- **Goal:** Store grammar, vocabulary, reading, and listening sections.
- **Output:** `DB migration for placement_sections`
- **Priority:** P0
- **Dependency:** P4-010
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-018`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-018 only.
Task: Create Placement Sections Migration
Branch: phase4/P4-018-placement-sections-migration
Description: Create database structure for placement sections.
Goal: Store grammar, vocabulary, reading, and listening sections.
Required output: DB migration for placement_sections
Priority: P0
Dependencies: P4-010

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_sections` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-019 — Create Placement Questions Migration

- **Task:** Create Placement Questions Migration
- **ID:** P4-019
- **Branch:** `phase4/P4-019-placement-questions-migration`
- **Description:** Create database structure for placement questions.
- **Goal:** Store placement question bank separately from runtime attempts.
- **Output:** `DB migration for placement_questions`
- **Priority:** P0
- **Dependency:** P4-011
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-019`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-019 only.
Task: Create Placement Questions Migration
Branch: phase4/P4-019-placement-questions-migration
Description: Create database structure for placement questions.
Goal: Store placement question bank separately from runtime attempts.
Required output: DB migration for placement_questions
Priority: P0
Dependencies: P4-011

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_questions` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-020 — Create Placement Question Skills Mapping

- **Task:** Create Placement Question Skills Mapping
- **ID:** P4-020
- **Branch:** `phase4/P4-020-placement-question-skills-migration`
- **Description:** Create mapping between placement questions and skills.
- **Goal:** Allow placement results to produce skill maps and weakness maps.
- **Output:** `DB migration for placement_question_skills`
- **Priority:** P0
- **Dependency:** P3-020, P4-019
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-020`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-020 only.
Task: Create Placement Question Skills Mapping
Branch: phase4/P4-020-placement-question-skills-migration
Description: Create mapping between placement questions and skills.
Goal: Allow placement results to produce skill maps and weakness maps.
Required output: DB migration for placement_question_skills
Priority: P0
Dependencies: P3-020, P4-019

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_question_skills` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-021 — Create Placement Attempts Migration

- **Task:** Create Placement Attempts Migration
- **ID:** P4-021
- **Branch:** `phase4/P4-021-placement-attempts-migration`
- **Description:** Create database structure for placement attempts.
- **Goal:** Track each student placement attempt.
- **Output:** `DB migration for placement_attempts`
- **Priority:** P0
- **Dependency:** P4-013
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-021`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-021 only.
Task: Create Placement Attempts Migration
Branch: phase4/P4-021-placement-attempts-migration
Description: Create database structure for placement attempts.
Goal: Track each student placement attempt.
Required output: DB migration for placement_attempts
Priority: P0
Dependencies: P4-013

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_attempts` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-022 — Create Placement Answers Migration

- **Task:** Create Placement Answers Migration
- **ID:** P4-022
- **Branch:** `phase4/P4-022-placement-answers-migration`
- **Description:** Create database structure for placement answers.
- **Goal:** Persist answers submitted during placement.
- **Output:** `DB migration for placement_answers`
- **Priority:** P0
- **Dependency:** P4-012, P4-021
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-022`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-022 only.
Task: Create Placement Answers Migration
Branch: phase4/P4-022-placement-answers-migration
Description: Create database structure for placement answers.
Goal: Persist answers submitted during placement.
Required output: DB migration for placement_answers
Priority: P0
Dependencies: P4-012, P4-021

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_answers` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-023 — Create Placement Results Migration

- **Task:** Create Placement Results Migration
- **ID:** P4-023
- **Branch:** `phase4/P4-023-placement-results-migration`
- **Description:** Create database structure for placement results.
- **Goal:** Persist estimated level, skill map, weakness map, and result metadata.
- **Output:** `DB migration for placement_results`
- **Priority:** P0
- **Dependency:** P4-014, P4-022
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-023`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-023 only.
Task: Create Placement Results Migration
Branch: phase4/P4-023-placement-results-migration
Description: Create database structure for placement results.
Goal: Persist estimated level, skill map, weakness map, and result metadata.
Required output: DB migration for placement_results
Priority: P0
Dependencies: P4-014, P4-022

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement_results` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-024 — Create Initial Learning Path Migration

- **Task:** Create Initial Learning Path Migration
- **ID:** P4-024
- **Branch:** `phase4/P4-024-initial-learning-path-migration`
- **Description:** Create structure for initial learning path records.
- **Goal:** Persist placement-derived initial path foundation.
- **Output:** `DB migration for initial learning path records`
- **Priority:** P1
- **Dependency:** P4-015, P4-023
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-024`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-024 only.
Task: Create Initial Learning Path Migration
Branch: phase4/P4-024-initial-learning-path-migration
Description: Create structure for initial learning path records.
Goal: Persist placement-derived initial path foundation.
Required output: DB migration for initial learning path records
Priority: P1
Dependencies: P4-015, P4-023

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for initial learning path records` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-025 — Create Placement Audit Log Migration

- **Task:** Create Placement Audit Log Migration
- **ID:** P4-025
- **Branch:** `phase4/P4-025-placement-audit-log-migration`
- **Description:** Create audit events for placement lifecycle.
- **Goal:** Support debugging and accountability for placement flow.
- **Output:** `DB migration for placement audit events`
- **Priority:** P1
- **Dependency:** P4-021
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-025`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-025 only.
Task: Create Placement Audit Log Migration
Branch: phase4/P4-025-placement-audit-log-migration
Description: Create audit events for placement lifecycle.
Goal: Support debugging and accountability for placement flow.
Required output: DB migration for placement audit events
Priority: P1
Dependencies: P4-021

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB migration for placement audit events` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-026 — Add Placement Performance Indexes

- **Task:** Add Placement Performance Indexes
- **ID:** P4-026
- **Branch:** `phase4/P4-026-placement-indexes`
- **Description:** Add indexes for placement test, attempts, answers, and results.
- **Goal:** Keep placement queries efficient.
- **Output:** `DB indexes for placement flow`
- **Priority:** P1
- **Dependency:** P4-017, P4-018, P4-019, P4-020, P4-021, P4-022, P4-023, P4-024, P4-025
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-026`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-026 only.
Task: Add Placement Performance Indexes
Branch: phase4/P4-026-placement-indexes
Description: Add indexes for placement test, attempts, answers, and results.
Goal: Keep placement queries efficient.
Required output: DB indexes for placement flow
Priority: P1
Dependencies: P4-017, P4-018, P4-019, P4-020, P4-021, P4-022, P4-023, P4-024, P4-025

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `DB indexes for placement flow` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-027 — Add Placement Seed Data

- **Task:** Add Placement Seed Data
- **ID:** P4-027
- **Branch:** `phase4/P4-027-placement-seed-data`
- **Description:** Seed active placement test, sections, and sample questions.
- **Goal:** Enable development and testing of placement flow.
- **Output:** `Seed test, sections, sample questions`
- **Priority:** P0
- **Dependency:** P4-019, P4-020
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-027`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-027 only.
Task: Add Placement Seed Data
Branch: phase4/P4-027-placement-seed-data
Description: Seed active placement test, sections, and sample questions.
Goal: Enable development and testing of placement flow.
Required output: Seed test, sections, sample questions
Priority: P0
Dependencies: P4-019, P4-020

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Seed test, sections, sample questions` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-028 — Create Placement Data Integrity Check

- **Task:** Create Placement Data Integrity Check
- **ID:** P4-028
- **Branch:** `phase4/P4-028-placement-data-integrity-check`
- **Description:** Verify placement seed data and mappings.
- **Goal:** Catch missing questions, sections, or skill links.
- **Output:** `docs/phase-4/placement-data-integrity-check.md`
- **Priority:** P1
- **Dependency:** P4-027
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-028`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-028 only.
Task: Create Placement Data Integrity Check
Branch: phase4/P4-028-placement-data-integrity-check
Description: Verify placement seed data and mappings.
Goal: Catch missing questions, sections, or skill links.
Required output: docs/phase-4/placement-data-integrity-check.md
Priority: P1
Dependencies: P4-027

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-data-integrity-check.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group D — Placement Scoring & Rules

### #P4-029 — Define Placement Blueprint Rules

- **Task:** Define Placement Blueprint Rules
- **ID:** P4-029
- **Branch:** `phase4/P4-029-placement-blueprint-rules`
- **Description:** Define placement structure, section order, question counts, and coverage.
- **Goal:** Ensure placement test is balanced and measurable.
- **Output:** `docs/phase-4/placement-blueprint-rules.md`
- **Priority:** P0
- **Dependency:** P4-007, P4-008
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-029`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-029 only.
Task: Define Placement Blueprint Rules
Branch: phase4/P4-029-placement-blueprint-rules
Description: Define placement structure, section order, question counts, and coverage.
Goal: Ensure placement test is balanced and measurable.
Required output: docs/phase-4/placement-blueprint-rules.md
Priority: P0
Dependencies: P4-007, P4-008

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-blueprint-rules.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-030 — Define CEFR Level Thresholds

- **Task:** Define CEFR Level Thresholds
- **ID:** P4-030
- **Branch:** `phase4/P4-030-placement-level-thresholds`
- **Description:** Define thresholds for A1, A2, and B1.
- **Goal:** Make estimated level consistent and explainable.
- **Output:** `docs/phase-4/placement-level-thresholds.md`
- **Priority:** P0
- **Dependency:** P4-029
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-030`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-030 only.
Task: Define CEFR Level Thresholds
Branch: phase4/P4-030-placement-level-thresholds
Description: Define thresholds for A1, A2, and B1.
Goal: Make estimated level consistent and explainable.
Required output: docs/phase-4/placement-level-thresholds.md
Priority: P0
Dependencies: P4-029

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-level-thresholds.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-031 — Define Section Weighting Rules

- **Task:** Define Section Weighting Rules
- **ID:** P4-031
- **Branch:** `phase4/P4-031-placement-section-weighting`
- **Description:** Define weighting of grammar, vocabulary, reading, and listening.
- **Goal:** Control how section performance contributes to placement output.
- **Output:** `docs/phase-4/placement-section-weighting.md`
- **Priority:** P1
- **Dependency:** P4-029
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-031`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-031 only.
Task: Define Section Weighting Rules
Branch: phase4/P4-031-placement-section-weighting
Description: Define weighting of grammar, vocabulary, reading, and listening.
Goal: Control how section performance contributes to placement output.
Required output: docs/phase-4/placement-section-weighting.md
Priority: P1
Dependencies: P4-029

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-section-weighting.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-032 — Define Skill Scoring Rules

- **Task:** Define Skill Scoring Rules
- **ID:** P4-032
- **Branch:** `phase4/P4-032-placement-skill-scoring-rules`
- **Description:** Define how skill-level score is calculated from placement answers.
- **Goal:** Produce skill mastery map from placement only.
- **Output:** `docs/phase-4/placement-skill-scoring-rules.md`
- **Priority:** P0
- **Dependency:** P4-008, P4-030
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-032`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-032 only.
Task: Define Skill Scoring Rules
Branch: phase4/P4-032-placement-skill-scoring-rules
Description: Define how skill-level score is calculated from placement answers.
Goal: Produce skill mastery map from placement only.
Required output: docs/phase-4/placement-skill-scoring-rules.md
Priority: P0
Dependencies: P4-008, P4-030

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-skill-scoring-rules.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-033 — Define Weakness Map Rules

- **Task:** Define Weakness Map Rules
- **ID:** P4-033
- **Branch:** `phase4/P4-033-placement-weakness-rules`
- **Description:** Define how weak skills are identified from placement.
- **Goal:** Produce initial weakness map without AIM runtime.
- **Output:** `docs/phase-4/placement-weakness-rules.md`
- **Priority:** P0
- **Dependency:** P4-032
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-033`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-033 only.
Task: Define Weakness Map Rules
Branch: phase4/P4-033-placement-weakness-rules
Description: Define how weak skills are identified from placement.
Goal: Produce initial weakness map without AIM runtime.
Required output: docs/phase-4/placement-weakness-rules.md
Priority: P0
Dependencies: P4-032

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-weakness-rules.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-034 — Define Initial Learning Path Rules

- **Task:** Define Initial Learning Path Rules
- **ID:** P4-034
- **Branch:** `phase4/P4-034-placement-initial-learning-path-rules`
- **Description:** Define how initial learning path is derived from placement result.
- **Goal:** Create initial path foundation for future lesson flow.
- **Output:** `docs/phase-4/initial-learning-path-rules.md`
- **Priority:** P0
- **Dependency:** P4-033, P3-006
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-034`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-034 only.
Task: Define Initial Learning Path Rules
Branch: phase4/P4-034-placement-initial-learning-path-rules
Description: Define how initial learning path is derived from placement result.
Goal: Create initial path foundation for future lesson flow.
Required output: docs/phase-4/initial-learning-path-rules.md
Priority: P0
Dependencies: P4-033, P3-006

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/initial-learning-path-rules.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-035 — Document No Client-Side Scoring Rule

- **Task:** Document No Client-Side Scoring Rule
- **ID:** P4-035
- **Branch:** `phase4/P4-035-placement-no-client-scoring-rule`
- **Description:** Document that Flutter must not score placement locally.
- **Goal:** Keep scoring and level decisions backend-authoritative.
- **Output:** `docs/phase-4/no-client-side-placement-scoring.md`
- **Priority:** P0
- **Dependency:** P4-030, P4-031, P4-032, P4-033, P4-034
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-035`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-035 only.
Task: Document No Client-Side Scoring Rule
Branch: phase4/P4-035-placement-no-client-scoring-rule
Description: Document that Flutter must not score placement locally.
Goal: Keep scoring and level decisions backend-authoritative.
Required output: docs/phase-4/no-client-side-placement-scoring.md
Priority: P0
Dependencies: P4-030, P4-031, P4-032, P4-033, P4-034

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/no-client-side-placement-scoring.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-036 — Document Speaking/Writing Deferral

- **Task:** Document Speaking/Writing Deferral
- **ID:** P4-036
- **Branch:** `phase4/P4-036-placement-speaking-writing-deferral`
- **Description:** Document speaking and writing as optional later capabilities.
- **Goal:** Keep Phase 4 focused on objective placement MVP.
- **Output:** `docs/phase-4/speaking-writing-deferral.md`
- **Priority:** P2
- **Dependency:** P4-003
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-036`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-036 only.
Task: Document Speaking/Writing Deferral
Branch: phase4/P4-036-placement-speaking-writing-deferral
Description: Document speaking and writing as optional later capabilities.
Goal: Keep Phase 4 focused on objective placement MVP.
Required output: docs/phase-4/speaking-writing-deferral.md
Priority: P2
Dependencies: P4-003

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/speaking-writing-deferral.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group E — Backend Placement APIs

### #P4-037 — Create Backend Placement Feature Module

- **Task:** Create Backend Placement Feature Module
- **ID:** P4-037
- **Branch:** `phase4/P4-037-placement-feature-module`
- **Description:** Create feature-based backend module for placement.
- **Goal:** Provide module structure for placement APIs/services.
- **Output:** `Backend placement module skeleton`
- **Priority:** P0
- **Dependency:** P4-006, P4-017
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-037`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-037 only.
Task: Create Backend Placement Feature Module
Branch: phase4/P4-037-placement-feature-module
Description: Create feature-based backend module for placement.
Goal: Provide module structure for placement APIs/services.
Required output: Backend placement module skeleton
Priority: P0
Dependencies: P4-006, P4-017

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Backend placement module skeleton` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-038 — Implement Placement Test Read API

- **Task:** Implement Placement Test Read API
- **ID:** P4-038
- **Branch:** `phase4/P4-038-placement-test-read-api`
- **Description:** Implement API to fetch active placement test metadata.
- **Goal:** Allow clients to start from current active placement test.
- **Output:** `API to get active placement test metadata`
- **Priority:** P0
- **Dependency:** P4-009, P4-037
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-038`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-038 only.
Task: Implement Placement Test Read API
Branch: phase4/P4-038-placement-test-read-api
Description: Implement API to fetch active placement test metadata.
Goal: Allow clients to start from current active placement test.
Required output: API to get active placement test metadata
Priority: P0
Dependencies: P4-009, P4-037

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to get active placement test metadata` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-039 — Implement Placement Sections API

- **Task:** Implement Placement Sections API
- **ID:** P4-039
- **Branch:** `phase4/P4-039-placement-sections-api`
- **Description:** Implement API to list placement sections.
- **Goal:** Allow ordered section delivery.
- **Output:** `API to list placement sections`
- **Priority:** P0
- **Dependency:** P4-010, P4-038
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-039`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-039 only.
Task: Implement Placement Sections API
Branch: phase4/P4-039-placement-sections-api
Description: Implement API to list placement sections.
Goal: Allow ordered section delivery.
Required output: API to list placement sections
Priority: P0
Dependencies: P4-010, P4-038

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to list placement sections` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-040 — Implement Placement Question Delivery API

- **Task:** Implement Placement Question Delivery API
- **ID:** P4-040
- **Branch:** `phase4/P4-040-placement-question-delivery-api`
- **Description:** Implement API to deliver placement questions safely.
- **Goal:** Serve questions without exposing scoring authority to client.
- **Output:** `API to deliver placement questions`
- **Priority:** P0
- **Dependency:** P4-011, P4-019, P4-020
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-040`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-040 only.
Task: Implement Placement Question Delivery API
Branch: phase4/P4-040-placement-question-delivery-api
Description: Implement API to deliver placement questions safely.
Goal: Serve questions without exposing scoring authority to client.
Required output: API to deliver placement questions
Priority: P0
Dependencies: P4-011, P4-019, P4-020

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to deliver placement questions` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-041 — Implement Placement Attempt Start API

- **Task:** Implement Placement Attempt Start API
- **ID:** P4-041
- **Branch:** `phase4/P4-041-placement-attempt-start-api`
- **Description:** Implement API to start placement attempt.
- **Goal:** Create controlled placement attempt lifecycle.
- **Output:** `API to start placement attempt`
- **Priority:** P0
- **Dependency:** P4-013, P4-021
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-041`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-041 only.
Task: Implement Placement Attempt Start API
Branch: phase4/P4-041-placement-attempt-start-api
Description: Implement API to start placement attempt.
Goal: Create controlled placement attempt lifecycle.
Required output: API to start placement attempt
Priority: P0
Dependencies: P4-013, P4-021

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to start placement attempt` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-042 — Implement Placement Answer Submit API

- **Task:** Implement Placement Answer Submit API
- **ID:** P4-042
- **Branch:** `phase4/P4-042-placement-answer-submit-api`
- **Description:** Implement API to submit placement answers.
- **Goal:** Persist answers and keep validation server-side.
- **Output:** `API to submit placement answer`
- **Priority:** P0
- **Dependency:** P4-012, P4-022
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-042`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-042 only.
Task: Implement Placement Answer Submit API
Branch: phase4/P4-042-placement-answer-submit-api
Description: Implement API to submit placement answers.
Goal: Persist answers and keep validation server-side.
Required output: API to submit placement answer
Priority: P0
Dependencies: P4-012, P4-022

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to submit placement answer` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-043 — Implement Placement Attempt Complete API

- **Task:** Implement Placement Attempt Complete API
- **ID:** P4-043
- **Branch:** `phase4/P4-043-placement-attempt-complete-api`
- **Description:** Implement API to complete placement attempt.
- **Goal:** Trigger scoring and result generation only after completion.
- **Output:** `API to complete placement attempt`
- **Priority:** P0
- **Dependency:** P4-021, P4-022
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-043`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-043 only.
Task: Implement Placement Attempt Complete API
Branch: phase4/P4-043-placement-attempt-complete-api
Description: Implement API to complete placement attempt.
Goal: Trigger scoring and result generation only after completion.
Required output: API to complete placement attempt
Priority: P0
Dependencies: P4-021, P4-022

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to complete placement attempt` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-044 — Implement Answer Validation Service

- **Task:** Implement Answer Validation Service
- **ID:** P4-044
- **Branch:** `phase4/P4-044-placement-answer-validation-service`
- **Description:** Implement backend validation for objective placement answers.
- **Goal:** Validate correctness server-side.
- **Output:** `Backend validates objective answers`
- **Priority:** P0
- **Dependency:** P4-042
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-044`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-044 only.
Task: Implement Answer Validation Service
Branch: phase4/P4-044-placement-answer-validation-service
Description: Implement backend validation for objective placement answers.
Goal: Validate correctness server-side.
Required output: Backend validates objective answers
Priority: P0
Dependencies: P4-042

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Backend validates objective answers` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-045 — Implement Placement Scoring Service

- **Task:** Implement Placement Scoring Service
- **ID:** P4-045
- **Branch:** `phase4/P4-045-placement-scoring-service`
- **Description:** Implement server-side placement scoring.
- **Goal:** Generate consistent scores without AIM runtime.
- **Output:** `Backend scoring service`
- **Priority:** P0
- **Dependency:** P4-030, P4-031, P4-032, P4-033, P4-034, P4-044
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-045`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-045 only.
Task: Implement Placement Scoring Service
Branch: phase4/P4-045-placement-scoring-service
Description: Implement server-side placement scoring.
Goal: Generate consistent scores without AIM runtime.
Required output: Backend scoring service
Priority: P0
Dependencies: P4-030, P4-031, P4-032, P4-033, P4-034, P4-044

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Backend scoring service` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-046 — Implement Placement Result Service

- **Task:** Implement Placement Result Service
- **ID:** P4-046
- **Branch:** `phase4/P4-046-placement-result-service`
- **Description:** Implement service to create placement result.
- **Goal:** Create estimated level, skill map, and weakness map.
- **Output:** `Create estimated level, skill map, weakness map`
- **Priority:** P0
- **Dependency:** P4-014, P4-023, P4-045
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-046`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-046 only.
Task: Implement Placement Result Service
Branch: phase4/P4-046-placement-result-service
Description: Implement service to create placement result.
Goal: Create estimated level, skill map, and weakness map.
Required output: Create estimated level, skill map, weakness map
Priority: P0
Dependencies: P4-014, P4-023, P4-045

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Create estimated level, skill map, weakness map` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-047 — Implement Initial Learning Path Service

- **Task:** Implement Initial Learning Path Service
- **ID:** P4-047
- **Branch:** `phase4/P4-047-initial-learning-path-service`
- **Description:** Implement initial path generation from placement result.
- **Goal:** Prepare student learning path foundation for later phases.
- **Output:** `Create initial learning path from result`
- **Priority:** P0
- **Dependency:** P4-015, P4-024, P4-046
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-047`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-047 only.
Task: Implement Initial Learning Path Service
Branch: phase4/P4-047-initial-learning-path-service
Description: Implement initial path generation from placement result.
Goal: Prepare student learning path foundation for later phases.
Required output: Create initial learning path from result
Priority: P0
Dependencies: P4-015, P4-024, P4-046

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Create initial learning path from result` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-048 — Implement Placement Result Read API

- **Task:** Implement Placement Result Read API
- **ID:** P4-048
- **Branch:** `phase4/P4-048-placement-result-read-api`
- **Description:** Implement API to fetch placement result.
- **Goal:** Allow student/admin to read final placement output safely.
- **Output:** `API to fetch placement result`
- **Priority:** P0
- **Dependency:** P4-046
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-048`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-048 only.
Task: Implement Placement Result Read API
Branch: phase4/P4-048-placement-result-read-api
Description: Implement API to fetch placement result.
Goal: Allow student/admin to read final placement output safely.
Required output: API to fetch placement result
Priority: P0
Dependencies: P4-046

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `API to fetch placement result` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-049 — Implement Placement Retake Policy

- **Task:** Implement Placement Retake Policy
- **ID:** P4-049
- **Branch:** `phase4/P4-049-placement-retake-policy-api`
- **Description:** Implement backend rules for placement retakes.
- **Goal:** Prevent abuse and inconsistent repeated results.
- **Output:** `Backend retake restrictions`
- **Priority:** P1
- **Dependency:** P4-041, P4-048
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-049`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-049 only.
Task: Implement Placement Retake Policy
Branch: phase4/P4-049-placement-retake-policy-api
Description: Implement backend rules for placement retakes.
Goal: Prevent abuse and inconsistent repeated results.
Required output: Backend retake restrictions
Priority: P1
Dependencies: P4-041, P4-048

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Backend retake restrictions` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-050 — Add Placement Audit Logging

- **Task:** Add Placement Audit Logging
- **ID:** P4-050
- **Branch:** `phase4/P4-050-placement-audit-logging`
- **Description:** Add audit logging around placement lifecycle.
- **Goal:** Track start, submit, complete, and result events.
- **Output:** `Audit logs for start/submit/complete/result`
- **Priority:** P1
- **Dependency:** P4-025, P4-041, P4-042, P4-043, P4-048
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-050`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-050 only.
Task: Add Placement Audit Logging
Branch: phase4/P4-050-placement-audit-logging
Description: Add audit logging around placement lifecycle.
Goal: Track start, submit, complete, and result events.
Required output: Audit logs for start/submit/complete/result
Priority: P1
Dependencies: P4-025, P4-041, P4-042, P4-043, P4-048

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Audit logs for start/submit/complete/result` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-051 — Add Placement Permission Guards

- **Task:** Add Placement Permission Guards
- **ID:** P4-051
- **Branch:** `phase4/P4-051-placement-permission-guards`
- **Description:** Add backend permission checks for placement APIs.
- **Goal:** Protect student/admin placement access.
- **Output:** `Backend guards for student/admin access`
- **Priority:** P0
- **Dependency:** P2-037, P2-038, P4-037
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-051`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-051 only.
Task: Add Placement Permission Guards
Branch: phase4/P4-051-placement-permission-guards
Description: Add backend permission checks for placement APIs.
Goal: Protect student/admin placement access.
Required output: Backend guards for student/admin access
Priority: P0
Dependencies: P2-037, P2-038, P4-037

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Backend guards for student/admin access` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-052 — Add Placement Backend Tests

- **Task:** Add Placement Backend Tests
- **ID:** P4-052
- **Branch:** `phase4/P4-052-placement-backend-tests`
- **Description:** Add tests for placement backend flow.
- **Goal:** Verify APIs, scoring, results, and guards.
- **Output:** `Backend tests for placement flow`
- **Priority:** P0
- **Dependency:** P4-037, P4-038, P4-039, P4-040, P4-041, P4-042, P4-043, P4-044, P4-045, P4-046, P4-047, P4-048, P4-049, P4-050, P4-051
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-052`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-052 only.
Task: Add Placement Backend Tests
Branch: phase4/P4-052-placement-backend-tests
Description: Add tests for placement backend flow.
Goal: Verify APIs, scoring, results, and guards.
Required output: Backend tests for placement flow
Priority: P0
Dependencies: P4-037, P4-038, P4-039, P4-040, P4-041, P4-042, P4-043, P4-044, P4-045, P4-046, P4-047, P4-048, P4-049, P4-050, P4-051

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Backend tests for placement flow` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group F — Admin Placement Management Foundation

### #P4-053 — Add Admin Placement Navigation

- **Task:** Add Admin Placement Navigation
- **ID:** P4-053
- **Branch:** `phase4/P4-053-admin-placement-navigation`
- **Description:** Add placement section to admin navigation.
- **Goal:** Prepare admin access to placement management.
- **Output:** `Admin dashboard navigation entry`
- **Priority:** P1
- **Dependency:** P4-006
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-053`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-053 only.
Task: Add Admin Placement Navigation
Branch: phase4/P4-053-admin-placement-navigation
Description: Add placement section to admin navigation.
Goal: Prepare admin access to placement management.
Required output: Admin dashboard navigation entry
Priority: P1
Dependencies: P4-006

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin dashboard navigation entry` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-054 — Build Admin Placement Tests List

- **Task:** Build Admin Placement Tests List
- **ID:** P4-054
- **Branch:** `phase4/P4-054-admin-placement-tests-list`
- **Description:** Build admin page to list placement tests.
- **Goal:** Allow admins/content managers to review placement tests.
- **Output:** `Admin placement tests page`
- **Priority:** P1
- **Dependency:** P4-038, P4-053
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-054`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-054 only.
Task: Build Admin Placement Tests List
Branch: phase4/P4-054-admin-placement-tests-list
Description: Build admin page to list placement tests.
Goal: Allow admins/content managers to review placement tests.
Required output: Admin placement tests page
Priority: P1
Dependencies: P4-038, P4-053

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin placement tests page` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-055 — Build Admin Placement Sections UI

- **Task:** Build Admin Placement Sections UI
- **ID:** P4-055
- **Branch:** `phase4/P4-055-admin-placement-sections-ui`
- **Description:** Build admin UI for placement sections.
- **Goal:** Allow management of section order and metadata.
- **Output:** `Admin section management UI`
- **Priority:** P1
- **Dependency:** P4-039, P4-054
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-055`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-055 only.
Task: Build Admin Placement Sections UI
Branch: phase4/P4-055-admin-placement-sections-ui
Description: Build admin UI for placement sections.
Goal: Allow management of section order and metadata.
Required output: Admin section management UI
Priority: P1
Dependencies: P4-039, P4-054

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin section management UI` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-056 — Build Admin Placement Questions UI

- **Task:** Build Admin Placement Questions UI
- **ID:** P4-056
- **Branch:** `phase4/P4-056-admin-placement-questions-ui`
- **Description:** Build admin UI for placement questions.
- **Goal:** Allow content managers to manage placement questions.
- **Output:** `Admin placement questions UI`
- **Priority:** P1
- **Dependency:** P4-040, P4-055
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-056`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-056 only.
Task: Build Admin Placement Questions UI
Branch: phase4/P4-056-admin-placement-questions-ui
Description: Build admin UI for placement questions.
Goal: Allow content managers to manage placement questions.
Required output: Admin placement questions UI
Priority: P1
Dependencies: P4-040, P4-055

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin placement questions UI` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-057 — Build Admin Placement Skill Linking UI

- **Task:** Build Admin Placement Skill Linking UI
- **ID:** P4-057
- **Branch:** `phase4/P4-057-admin-placement-skill-linking-ui`
- **Description:** Build admin UI to link placement questions to skills.
- **Goal:** Ensure question skill coverage is visible and manageable.
- **Output:** `Admin links placement questions to skills`
- **Priority:** P1
- **Dependency:** P4-020, P4-056
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-057`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-057 only.
Task: Build Admin Placement Skill Linking UI
Branch: phase4/P4-057-admin-placement-skill-linking-ui
Description: Build admin UI to link placement questions to skills.
Goal: Ensure question skill coverage is visible and manageable.
Required output: Admin links placement questions to skills
Priority: P1
Dependencies: P4-020, P4-056

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin links placement questions to skills` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-058 — Build Admin Placement Status UI

- **Task:** Build Admin Placement Status UI
- **ID:** P4-058
- **Branch:** `phase4/P4-058-admin-placement-status-ui`
- **Description:** Build admin UI for draft/published placement status.
- **Goal:** Control which placement test is active.
- **Output:** `Admin draft/published placement control`
- **Priority:** P1
- **Dependency:** P4-038, P4-054
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-058`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-058 only.
Task: Build Admin Placement Status UI
Branch: phase4/P4-058-admin-placement-status-ui
Description: Build admin UI for draft/published placement status.
Goal: Control which placement test is active.
Required output: Admin draft/published placement control
Priority: P1
Dependencies: P4-038, P4-054

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin draft/published placement control` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-059 — Build Admin Placement Results View

- **Task:** Build Admin Placement Results View
- **ID:** P4-059
- **Branch:** `phase4/P4-059-admin-placement-results-view`
- **Description:** Build admin view for placement results.
- **Goal:** Allow authorized staff to inspect placement outcomes.
- **Output:** `Admin can view placement results`
- **Priority:** P1
- **Dependency:** P4-048, P4-053
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-059`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-059 only.
Task: Build Admin Placement Results View
Branch: phase4/P4-059-admin-placement-results-view
Description: Build admin view for placement results.
Goal: Allow authorized staff to inspect placement outcomes.
Required output: Admin can view placement results
Priority: P1
Dependencies: P4-048, P4-053

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin can view placement results` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-060 — Add Admin Placement Permission Check

- **Task:** Add Admin Placement Permission Check
- **ID:** P4-060
- **Branch:** `phase4/P4-060-admin-placement-permission-check`
- **Description:** Verify admin placement UI respects backend permissions.
- **Goal:** Prevent UI from bypassing backend authority.
- **Output:** `Admin UI respects backend permissions`
- **Priority:** P1
- **Dependency:** P4-051, P4-053, P4-054, P4-055, P4-056, P4-057, P4-058, P4-059
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-060`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-060 only.
Task: Add Admin Placement Permission Check
Branch: phase4/P4-060-admin-placement-permission-check
Description: Verify admin placement UI respects backend permissions.
Goal: Prevent UI from bypassing backend authority.
Required output: Admin UI respects backend permissions
Priority: P1
Dependencies: P4-051, P4-053, P4-054, P4-055, P4-056, P4-057, P4-058, P4-059

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Admin UI respects backend permissions` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group G — Flutter Placement Flow

### #P4-061 — Create Flutter Placement Feature Skeleton

- **Task:** Create Flutter Placement Feature Skeleton
- **ID:** P4-061
- **Branch:** `phase4/P4-061-flutter-placement-feature-skeleton`
- **Description:** Create Flutter feature-first placement structure.
- **Goal:** Prepare mobile placement implementation.
- **Output:** `Flutter feature/placement_test structure`
- **Priority:** P0
- **Dependency:** P4-006
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-061`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-061 only.
Task: Create Flutter Placement Feature Skeleton
Branch: phase4/P4-061-flutter-placement-feature-skeleton
Description: Create Flutter feature-first placement structure.
Goal: Prepare mobile placement implementation.
Required output: Flutter feature/placement_test structure
Priority: P0
Dependencies: P4-006

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Flutter feature/placement_test structure` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-062 — Add Flutter Placement Models

- **Task:** Add Flutter Placement Models
- **ID:** P4-062
- **Branch:** `phase4/P4-062-flutter-placement-models`
- **Description:** Add Flutter placement models/entities.
- **Goal:** Represent placement contracts in Flutter without scoring locally.
- **Output:** `Flutter models/entities for placement`
- **Priority:** P0
- **Dependency:** P4-009, P4-010, P4-011, P4-012, P4-013, P4-014, P4-061
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-062`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-062 only.
Task: Add Flutter Placement Models
Branch: phase4/P4-062-flutter-placement-models
Description: Add Flutter placement models/entities.
Goal: Represent placement contracts in Flutter without scoring locally.
Required output: Flutter models/entities for placement
Priority: P0
Dependencies: P4-009, P4-010, P4-011, P4-012, P4-013, P4-014, P4-061

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Flutter models/entities for placement` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-063 — Add Flutter Placement Datasource

- **Task:** Add Flutter Placement Datasource
- **ID:** P4-063
- **Branch:** `phase4/P4-063-flutter-placement-datasource`
- **Description:** Add remote datasource for placement APIs.
- **Goal:** Allow Flutter to call backend placement endpoints.
- **Output:** `Remote datasource for placement APIs`
- **Priority:** P0
- **Dependency:** P4-038, P4-039, P4-040, P4-041, P4-042, P4-043, P4-048, P4-062
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-063`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-063 only.
Task: Add Flutter Placement Datasource
Branch: phase4/P4-063-flutter-placement-datasource
Description: Add remote datasource for placement APIs.
Goal: Allow Flutter to call backend placement endpoints.
Required output: Remote datasource for placement APIs
Priority: P0
Dependencies: P4-038, P4-039, P4-040, P4-041, P4-042, P4-043, P4-048, P4-062

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Remote datasource for placement APIs` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-064 — Add Flutter Placement Repository

- **Task:** Add Flutter Placement Repository
- **ID:** P4-064
- **Branch:** `phase4/P4-064-flutter-placement-repository`
- **Description:** Add repository/provider layer for placement.
- **Goal:** Keep Flutter placement feature structured and testable.
- **Output:** `Repository/provider layer`
- **Priority:** P0
- **Dependency:** P4-063
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-064`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-064 only.
Task: Add Flutter Placement Repository
Branch: phase4/P4-064-flutter-placement-repository
Description: Add repository/provider layer for placement.
Goal: Keep Flutter placement feature structured and testable.
Required output: Repository/provider layer
Priority: P0
Dependencies: P4-063

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Repository/provider layer` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-065 — Build Placement Start Page

- **Task:** Build Placement Start Page
- **ID:** P4-065
- **Branch:** `phase4/P4-065-flutter-placement-start-page`
- **Description:** Build UI for starting placement test.
- **Goal:** Let student start placement flow.
- **Output:** `Student starts placement test`
- **Priority:** P0
- **Dependency:** P4-041, P4-064
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-065`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-065 only.
Task: Build Placement Start Page
Branch: phase4/P4-065-flutter-placement-start-page
Description: Build UI for starting placement test.
Goal: Let student start placement flow.
Required output: Student starts placement test
Priority: P0
Dependencies: P4-041, P4-064

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Student starts placement test` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-066 — Build Placement Section Page

- **Task:** Build Placement Section Page
- **ID:** P4-066
- **Branch:** `phase4/P4-066-flutter-placement-section-page`
- **Description:** Build UI for current placement section.
- **Goal:** Show progress through placement sections.
- **Output:** `Student sees current section`
- **Priority:** P0
- **Dependency:** P4-039, P4-065
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-066`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-066 only.
Task: Build Placement Section Page
Branch: phase4/P4-066-flutter-placement-section-page
Description: Build UI for current placement section.
Goal: Show progress through placement sections.
Required output: Student sees current section
Priority: P0
Dependencies: P4-039, P4-065

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Student sees current section` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-067 — Build Placement Question Page

- **Task:** Build Placement Question Page
- **ID:** P4-067
- **Branch:** `phase4/P4-067-flutter-placement-question-page`
- **Description:** Build UI for placement questions and answers.
- **Goal:** Let student answer placement questions.
- **Output:** `Student answers question`
- **Priority:** P0
- **Dependency:** P4-040, P4-066
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-067`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-067 only.
Task: Build Placement Question Page
Branch: phase4/P4-067-flutter-placement-question-page
Description: Build UI for placement questions and answers.
Goal: Let student answer placement questions.
Required output: Student answers question
Priority: P0
Dependencies: P4-040, P4-066

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Student answers question` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-068 — Build Placement Submit Flow

- **Task:** Build Placement Submit Flow
- **ID:** P4-068
- **Branch:** `phase4/P4-068-flutter-placement-answer-submit-flow`
- **Description:** Implement answer submit flow to backend.
- **Goal:** Submit answers without client scoring.
- **Output:** `Submit answers to backend`
- **Priority:** P0
- **Dependency:** P4-042, P4-067
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-068`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-068 only.
Task: Build Placement Submit Flow
Branch: phase4/P4-068-flutter-placement-answer-submit-flow
Description: Implement answer submit flow to backend.
Goal: Submit answers without client scoring.
Required output: Submit answers to backend
Priority: P0
Dependencies: P4-042, P4-067

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Submit answers to backend` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-069 — Build Placement Result Page

- **Task:** Build Placement Result Page
- **ID:** P4-069
- **Branch:** `phase4/P4-069-flutter-placement-result-page`
- **Description:** Build safe placement result UI.
- **Goal:** Show estimated level and safe summary only.
- **Output:** `Show estimated level and safe summary`
- **Priority:** P0
- **Dependency:** P4-048, P4-068
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-069`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-069 only.
Task: Build Placement Result Page
Branch: phase4/P4-069-flutter-placement-result-page
Description: Build safe placement result UI.
Goal: Show estimated level and safe summary only.
Required output: Show estimated level and safe summary
Priority: P0
Dependencies: P4-048, P4-068

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Show estimated level and safe summary` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-070 — Add Flutter No-Scoring Regression Check

- **Task:** Add Flutter No-Scoring Regression Check
- **ID:** P4-070
- **Branch:** `phase4/P4-070-flutter-no-placement-scoring-check`
- **Description:** Add check proving Flutter does not score placement locally.
- **Goal:** Protect backend-authoritative scoring rule.
- **Output:** `Prove Flutter does not score placement locally`
- **Priority:** P0
- **Dependency:** P4-069, P4-035
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-070`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-070 only.
Task: Add Flutter No-Scoring Regression Check
Branch: phase4/P4-070-flutter-no-placement-scoring-check
Description: Add check proving Flutter does not score placement locally.
Goal: Protect backend-authoritative scoring rule.
Required output: Prove Flutter does not score placement locally
Priority: P0
Dependencies: P4-069, P4-035

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `Prove Flutter does not score placement locally` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-071 — Add Flutter Placement Flow Checks

- **Task:** Add Flutter Placement Flow Checks
- **ID:** P4-071
- **Branch:** `phase4/P4-071-flutter-placement-flow-tests`
- **Description:** Add Flutter analyze/tests for placement flow.
- **Goal:** Verify Flutter placement implementation quality.
- **Output:** `flutter analyze and tests if available`
- **Priority:** P1
- **Dependency:** P4-061, P4-062, P4-063, P4-064, P4-065, P4-066, P4-067, P4-068, P4-069, P4-070
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-071`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-071 only.
Task: Add Flutter Placement Flow Checks
Branch: phase4/P4-071-flutter-placement-flow-tests
Description: Add Flutter analyze/tests for placement flow.
Goal: Verify Flutter placement implementation quality.
Required output: flutter analyze and tests if available
Priority: P1
Dependencies: P4-061, P4-062, P4-063, P4-064, P4-065, P4-066, P4-067, P4-068, P4-069, P4-070

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `flutter analyze and tests if available` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Group H — Placement QA & Handoff

### #P4-072 — Review Placement Question Coverage

- **Task:** Review Placement Question Coverage
- **ID:** P4-072
- **Branch:** `phase4/P4-072-placement-question-coverage-review`
- **Description:** Review placement question coverage across sections and skills.
- **Goal:** Ensure placement test has enough balanced content.
- **Output:** `docs/quality/phase-4-placement-question-coverage-review.md`
- **Priority:** P1
- **Dependency:** P4-027, P4-057
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-072`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-072 only.
Task: Review Placement Question Coverage
Branch: phase4/P4-072-placement-question-coverage-review
Description: Review placement question coverage across sections and skills.
Goal: Ensure placement test has enough balanced content.
Required output: docs/quality/phase-4-placement-question-coverage-review.md
Priority: P1
Dependencies: P4-027, P4-057

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/quality/phase-4-placement-question-coverage-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-073 — Review Placement Skill Linking

- **Task:** Review Placement Skill Linking
- **ID:** P4-073
- **Branch:** `phase4/P4-073-placement-skill-linking-review`
- **Description:** Review placement question-to-skill linking.
- **Goal:** Ensure placement output can produce skill and weakness maps.
- **Output:** `docs/quality/phase-4-placement-skill-linking-review.md`
- **Priority:** P0
- **Dependency:** P4-020, P4-057
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-073`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-073 only.
Task: Review Placement Skill Linking
Branch: phase4/P4-073-placement-skill-linking-review
Description: Review placement question-to-skill linking.
Goal: Ensure placement output can produce skill and weakness maps.
Required output: docs/quality/phase-4-placement-skill-linking-review.md
Priority: P0
Dependencies: P4-020, P4-057

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/quality/phase-4-placement-skill-linking-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-074 — Review Placement Scoring Rules

- **Task:** Review Placement Scoring Rules
- **ID:** P4-074
- **Branch:** `phase4/P4-074-placement-scoring-review`
- **Description:** Review scoring implementation against rules.
- **Goal:** Ensure estimated level and maps are consistent.
- **Output:** `docs/quality/phase-4-placement-scoring-review.md`
- **Priority:** P0
- **Dependency:** P4-045, P4-046
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-074`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-074 only.
Task: Review Placement Scoring Rules
Branch: phase4/P4-074-placement-scoring-review
Description: Review scoring implementation against rules.
Goal: Ensure estimated level and maps are consistent.
Required output: docs/quality/phase-4-placement-scoring-review.md
Priority: P0
Dependencies: P4-045, P4-046

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/quality/phase-4-placement-scoring-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-075 — Run Placement Security Review

- **Task:** Run Placement Security Review
- **ID:** P4-075
- **Branch:** `phase4/P4-075-placement-security-review`
- **Description:** Review placement permissions, data access, and abuse risks.
- **Goal:** Ensure placement flow is secure.
- **Output:** `docs/quality/phase-4-placement-security-review.md`
- **Priority:** P0
- **Dependency:** P4-051, P4-052
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-075`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-075 only.
Task: Run Placement Security Review
Branch: phase4/P4-075-placement-security-review
Description: Review placement permissions, data access, and abuse risks.
Goal: Ensure placement flow is secure.
Required output: docs/quality/phase-4-placement-security-review.md
Priority: P0
Dependencies: P4-051, P4-052

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/quality/phase-4-placement-security-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-076 — Run Placement E2E Check

- **Task:** Run Placement E2E Check
- **ID:** P4-076
- **Branch:** `phase4/P4-076-placement-e2e-check`
- **Description:** Run end-to-end placement flow check.
- **Goal:** Verify start, answer, complete, result, and initial path flow.
- **Output:** `docs/phase-4/placement-e2e-check.md`
- **Priority:** P0
- **Dependency:** P4-052, P4-071
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-076`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-076 only.
Task: Run Placement E2E Check
Branch: phase4/P4-076-placement-e2e-check
Description: Run end-to-end placement flow check.
Goal: Verify start, answer, complete, result, and initial path flow.
Required output: docs/phase-4/placement-e2e-check.md
Priority: P0
Dependencies: P4-052, P4-071

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/placement-e2e-check.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-077 — Run No-AIM Runtime Review

- **Task:** Run No-AIM Runtime Review
- **ID:** P4-077
- **Branch:** `phase4/P4-077-no-aim-runtime-review`
- **Description:** Review code to ensure Phase 4 does not call AIM Engine runtime.
- **Goal:** Keep AIM integration reserved for Phase 5.
- **Output:** `docs/quality/phase-4-no-aim-runtime-review.md`
- **Priority:** P0
- **Dependency:** P4-046, P4-070
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-077`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-077 only.
Task: Run No-AIM Runtime Review
Branch: phase4/P4-077-no-aim-runtime-review
Description: Review code to ensure Phase 4 does not call AIM Engine runtime.
Goal: Keep AIM integration reserved for Phase 5.
Required output: docs/quality/phase-4-no-aim-runtime-review.md
Priority: P0
Dependencies: P4-046, P4-070

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/quality/phase-4-no-aim-runtime-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-078 — Create Phase 5 Readiness Checklist

- **Task:** Create Phase 5 Readiness Checklist
- **ID:** P4-078
- **Branch:** `phase4/P4-078-phase-5-readiness-checklist`
- **Description:** Create checklist for AIM Engine Integration readiness.
- **Goal:** Prepare handoff to Phase 5.
- **Output:** `docs/phase-5/readiness-checklist.md`
- **Priority:** P0
- **Dependency:** P4-072, P4-073, P4-074, P4-075, P4-076, P4-077
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-078`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-078 only.
Task: Create Phase 5 Readiness Checklist
Branch: phase4/P4-078-phase-5-readiness-checklist
Description: Create checklist for AIM Engine Integration readiness.
Goal: Prepare handoff to Phase 5.
Required output: docs/phase-5/readiness-checklist.md
Priority: P0
Dependencies: P4-072, P4-073, P4-074, P4-075, P4-076, P4-077

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-5/readiness-checklist.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-079 — Review Phase 4 Output Completeness

- **Task:** Review Phase 4 Output Completeness
- **ID:** P4-079
- **Branch:** `phase4/P4-079-phase-4-output-completeness-review`
- **Description:** Review all Phase 4 outputs and missing files.
- **Goal:** Ensure Phase 4 has no missing deliverables.
- **Output:** `docs/quality/phase-4-output-completeness-review.md`
- **Priority:** P0
- **Dependency:** P4-078
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-079`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-079 only.
Task: Review Phase 4 Output Completeness
Branch: phase4/P4-079-phase-4-output-completeness-review
Description: Review all Phase 4 outputs and missing files.
Goal: Ensure Phase 4 has no missing deliverables.
Required output: docs/quality/phase-4-output-completeness-review.md
Priority: P0
Dependencies: P4-078

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/quality/phase-4-output-completeness-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

### #P4-080 — Create Phase 4 Final Review and Handoff

- **Task:** Create Phase 4 Final Review and Handoff
- **ID:** P4-080
- **Branch:** `phase4/P4-080-phase-4-final-review`
- **Description:** Create final review and handoff document for Phase 4.
- **Goal:** Close Phase 4 and authorize Phase 5 start.
- **Output:** `docs/phase-4/final-review.md`
- **Priority:** P0
- **Dependency:** P4-079
- **AgentPrompt:** `Use docs/tasks/phase_4_task_prompts.md #P4-080`

#### Execution Prompt

```text
You are an AI coding/documentation agent working on the AIM Platform repository.

Execute task P4-080 only.
Task: Create Phase 4 Final Review and Handoff
Branch: phase4/P4-080-phase-4-final-review
Description: Create final review and handoff document for Phase 4.
Goal: Close Phase 4 and authorize Phase 5 start.
Required output: docs/phase-4/final-review.md
Priority: P0
Dependencies: P4-079

Before starting:
- Confirm the Notion task row matches this section exactly.
- Confirm dependencies are Done or their required outputs exist.
- Confirm the task is still Undone and unassigned.
- Assign the task to yourself and set it In Progress.

Implementation rules:
- Stay inside Phase 4 — Placement Test scope.
- Do not implement AIM Engine runtime integration.
- Do not implement AI Teacher.
- Do not implement lesson delivery or practice sessions.
- Do not implement recommendations or progress dashboard.
- Do not allow Flutter/client to calculate placement score, estimated level, skill mastery, weakness map, or initial path.
- Backend remains the final authority for placement scoring and result generation.
- Preserve security: no secrets, no service-role keys, no privileged config in source code.

Done test:
- The required output `docs/phase-4/final-review.md` exists or is implemented as described.
- The implementation or documentation matches the task scope.
- No out-of-scope Phase 5+ work was added.
- Relevant checks were run, or limitations are clearly documented.
- Notion completion comment includes files changed, commit, checks, and any limitations.
```

---

## Phase 4 Completion Criteria

Phase 4 can be considered complete only when:

- All `P4-001` to `P4-080` tasks are Done.
- Placement questions are linked to skills.
- Backend scoring produces estimated level, skill map, weakness map, and initial learning path foundation.
- Flutter does not calculate score, level, mastery, weakness, or initial path locally.
- No AIM Engine runtime calls exist in Phase 4.
- Placement security review passes.
- Placement E2E check passes.
- Phase 5 readiness checklist exists.
- Phase 4 final review exists.
