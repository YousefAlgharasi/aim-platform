# Phase 3 Content System E2E Check

> Phase 3 — P3-068  
> Scope: Curriculum & Content System only

## Check Status

**Status: BLOCKED for full end-to-end approval; partial backend checks pass.**

This task documents the integrated content-system path from curriculum creation through
lesson-skill linking, question skill mapping, asset management, and publishing workflow.
No live database, seeded environment, or authenticated admin session was available in
this workspace, so the check was performed through code/document inspection plus targeted
backend unit tests.

## Intended E2E Flow

1. Create curriculum hierarchy: course -> level -> chapter -> lesson.
2. Create or select skills and objectives.
3. Link lesson to at least one skill and optionally mark one primary skill.
4. Create question-bank questions and link each question to skills, including one primary skill.
5. Add lesson assets as draft content metadata.
6. Run publish validation for lesson and question readiness.
7. Publish eligible content through backend workflow endpoints.
8. Confirm admin UI uses backend APIs and does not mutate status locally.
9. Confirm audit logs and safe field exposure support privileged review.

## Files Reviewed

- `services/backend-api/src/features/curriculum/courses/*`
- `services/backend-api/src/features/curriculum/levels/*`
- `services/backend-api/src/features/curriculum/chapters/*`
- `services/backend-api/src/features/curriculum/lessons/*`
- `services/backend-api/src/features/curriculum/skills/*`
- `services/backend-api/src/features/curriculum/objectives/*`
- `services/backend-api/src/features/curriculum/lesson-skills/*`
- `services/backend-api/src/features/curriculum/question-skills/*`
- `services/backend-api/src/features/curriculum/question-bank/*`
- `services/backend-api/src/features/curriculum/lesson-assets/*`
- `services/backend-api/src/features/curriculum/content-status-workflow/*`
- `services/backend-api/src/features/curriculum/publish-validation/*`
- `apps/admin-dashboard/app/admin/content/**/*`
- `apps/admin-dashboard/lib/api/**/*`
- `docs/phase-3/content-status-workflow-check.md`
- `docs/phase-3/lesson-asset-safety-check.md`
- `docs/phase-3/question-bank-skill-coverage-check.md`
- `docs/quality/phase-3-lesson-skill-linking-review.md`
- `docs/quality/phase-3-curriculum-security-review.md`
- `docs/quality/phase-3-architecture-review.md`

## Results

| ID | Severity | Status | Check | Evidence | Required Follow-up |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | PASS | Closed | Curriculum hierarchy services exist for course, level, chapter, and lesson management. | Backend modules/controllers/services exist with DTO validation and protected admin APIs. | Add a true seeded integration test once the test database path is available. |
| E2E-002 | PASS | Closed | Lesson publish validation checks skill linkage before publish. | `LessonPublishValidationService` and `PublishValidationService` are wired into the status workflow path for publish readiness. | Preserve publish validation as backend-owned. |
| E2E-003 | PASS | Closed | Question-skill mapping has backend service coverage and primary-skill rules. | Targeted `question-skills.service.spec.ts` passed locally. | Add integrated question publish/readiness coverage in a future task. |
| E2E-004 | PASS | Closed | Lesson asset service has backend unit coverage for core create/update/archive behavior. | Targeted `lesson-assets.service.spec.ts` passed locally. | Add safe URL/metadata validation before external consumption. |
| E2E-005 | PASS | Closed | Backend status workflow service unit coverage passes. | Targeted `content-status-workflow.service.spec.ts` passed locally. | Add controller/e2e authorization coverage. |
| E2E-006 | MAJOR | Open | Admin status workflow client is not aligned to backend workflow routes. | P3-062 found backend uses `PATCH /curriculum/workflow/:entityType/:entityId/:action`, while the admin client posts to non-matching content paths and expects a different response shape. | Fix admin workflow client before using admin UI as an E2E status path. |
| E2E-007 | CRITICAL | Open | Published lesson-skill invariant can be broken after publish. | P3-065/P3-066 found lesson-skill mapping mutations can remove links from a published lesson after publish validation succeeds. | Block post-publish invariant-breaking mapping mutations or revalidate transactionally. |
| E2E-008 | MAJOR | Open | Workflow and mapping auditability is incomplete. | P3-066 found publish/archive/restore transitions are not audit logged, and lesson-skill actor attribution is not consistently passed from controller to service. | Wire actor-attributed audit logs into workflow and mapping mutations. |
| E2E-009 | MAJOR | Open | Full local backend test run is blocked by a stale lesson-skills spec constructor. | Targeted test command failed because `lesson-skills.service.spec.ts` constructs `LessonSkillsService` with one argument while the service now requires `DatabaseService` and `CurriculumAuditLogService`. | Update the spec fixture to provide a mock audit-log service, then re-run curriculum tests. |
| E2E-010 | MAJOR | Open | No authenticated seeded E2E environment was available. | This workspace did not provide a running backend, test database, seed data, or admin auth token. | Add a repeatable seeded E2E harness for curriculum content flows. |
| E2E-011 | MAJOR | Open | Lesson asset safety remains incomplete for real integrated delivery. | P3-063 found arbitrary asset URLs and metadata URL-like fields are accepted. | Add allowlisted URL policy and metadata shape validation. |

## Local Checks Run

```text
npm test -- --runInBand \
  src/features/curriculum/content-status-workflow/content-status-workflow.service.spec.ts \
  src/features/curriculum/lesson-skills/lesson-publish-validation.service.spec.ts \
  src/features/curriculum/lesson-skills/lesson-skills.service.spec.ts \
  src/features/curriculum/question-skills/question-skills.service.spec.ts \
  src/features/curriculum/lesson-assets/lesson-assets.service.spec.ts
```

Result:

- PASS: `question-skills.service.spec.ts`
- PASS: `content-status-workflow.service.spec.ts`
- PASS: `lesson-assets.service.spec.ts`
- PASS: `lesson-publish-validation.service.spec.ts`
- FAIL: `lesson-skills.service.spec.ts` does not provide the new audit-log dependency to `LessonSkillsService`.

## E2E Decision

The integrated content system is structurally present, but a full E2E approval is blocked
until the admin workflow route mismatch, post-publish lesson-skill invariant gap,
auditability gaps, stale unit test fixture, and missing seeded E2E harness are resolved.

## Required Follow-up

1. Fix the admin status workflow client contract.
2. Protect published lesson-skill invariants after publication.
3. Wire actor-attributed audit logs into workflow and mapping mutations.
4. Update `lesson-skills.service.spec.ts` for the audit-log dependency.
5. Add a seeded authenticated E2E harness covering hierarchy creation, skill linking,
   question skill mapping, asset creation, publish validation, and publish workflow.
6. Add asset URL and metadata safety validation before external or learner-facing use.

## Out-of-Scope Confirmation

This check did not add or modify onboarding, placement execution, learner lesson
delivery, practice attempts, sessions, AIM runtime integration, dashboard
recommendations, review/retention, progress reports, AI Teacher, or Student Web App
work.
