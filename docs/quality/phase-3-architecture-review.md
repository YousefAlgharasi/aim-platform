# Phase 3 Architecture Review

> Phase 3 — P3-067  
> Scope: Curriculum & Content System only

## Review Status

**Status: CONDITIONAL PASS with release blockers.**

Phase 3 stayed architecturally focused on the Curriculum & Content System. The reviewed
work did not introduce learner delivery, placement execution, practice attempts, learning
session orchestration, AIM runtime integration, dashboard recommendations, progress
reports, AI Teacher behavior, or Student Web App work as Phase 3 implementation.

The foundation is directionally sound: content hierarchy, status lifecycle, protected
backend APIs, admin content surfaces, question bank, lesson assets, and skill mappings
all remain backend-authorized curriculum infrastructure. The architecture is not yet
production-ready because several integration and invariant gaps remain open.

## Files Reviewed

- `docs/phase-3/curriculum-content-system-charter.md`
- `docs/phase-3/task-execution-rules.md`
- `docs/phase-3/curriculum-source-of-truth.md`
- `docs/phase-3/curriculum-data-model-map.md`
- `docs/phase-3/curriculum-api-map.md`
- `docs/phase-3/content-status-lifecycle.md`
- `docs/phase-3/content-publishing-permissions.md`
- `docs/phase-3/curriculum-permission-guards.md`
- `docs/phase-3/curriculum-rls-security-plan.md`
- `docs/phase-3/content-status-workflow-check.md`
- `docs/phase-3/lesson-asset-safety-check.md`
- `docs/phase-3/question-bank-skill-coverage-check.md`
- `docs/quality/phase-3-lesson-skill-linking-review.md`
- `docs/quality/phase-3-curriculum-security-review.md`
- `services/backend-api/src/features/curriculum/**/*`
- `apps/admin-dashboard/app/admin/content/**/*`
- `apps/admin-dashboard/lib/api/**/*`

## Findings

| ID | Severity | Status | Finding | Evidence | Required Follow-up |
| --- | --- | --- | --- | --- | --- |
| AR-001 | PASS | Closed | Phase 3 remained bounded to curriculum/content architecture. | Reviewed docs and implementation focus on hierarchy, skills, objectives, question bank, lesson assets, status workflow, audit, and admin content tooling. | Keep future learner/runtime work in later phase tasks only. |
| AR-002 | PASS | Closed | Backend remains the authority for curriculum state and authorization. | Charter, source-of-truth, RLS plan, permission docs, and controllers consistently route privileged operations through backend APIs and Phase 2 auth/permission guards. | Do not let admin UI or clients write curriculum database state directly. |
| AR-003 | PASS | Closed | Lifecycle status is centralized around backend workflow endpoints instead of client-writable DTO fields. | DTO validators reject client-supplied `status`; workflow controller owns publish/archive/restore. | Preserve this contract for new curriculum entities. |
| AR-004 | PASS | Closed | Admin dashboard work is an internal curriculum-management surface, not a learner app. | Admin content routes manage curriculum records, mappings, and workflow controls; learner runtime routes were not added by Phase 3 content work. | Keep admin UX checks as convenience only; backend remains authoritative. |
| AR-005 | PASS | Closed | Question bank and skill mapping are modeled as curriculum foundations, not practice/session runtime. | Question-bank coverage review confirms no practice attempt, session, or AIM runtime execution was added. | Later runtime phases must consume published, safe backend APIs rather than reusing admin APIs. |
| AR-006 | CRITICAL | Open | Published lesson invariants can be broken after publication. | P3-065 and P3-066 found lesson-skill mappings can be mutated after a lesson is published, including removing the last skill link. | Enforce draft-only mutation or transactional revalidation for published lessons before Phase 4 depends on published lesson-skill data. |
| AR-007 | MAJOR | Open | Workflow transitions are not consistently audit logged. | P3-066 found publish/archive/restore transitions update status without inserting actor-attributed audit events. | Wire curriculum audit logging into workflow transitions before production use. |
| AR-008 | MAJOR | Open | Admin status workflow integration is not contract-aligned. | P3-062 found admin status client paths/methods and response shape do not match backend workflow endpoints. | Align admin client with `PATCH /curriculum/workflow/:entityType/:entityId/:action`. |
| AR-009 | MAJOR | Open | Lesson asset safety validation is incomplete. | P3-063 found arbitrary asset URLs, thumbnail URLs, and URL-like metadata can be accepted without an allowlist or type-specific metadata shape. | Add safe URL policy and metadata validators before external or learner-facing asset consumption. |
| AR-010 | MAJOR | Open | Documentation and implementation drift remains in older route/permission references. | Some docs still reference entity-specific publish routes or legacy permission names while implementation uses shared workflow routes and `curriculum.content.*` permissions. | Refresh Phase 3 API/security docs as a cleanup task. |
| AR-011 | MINOR | Open | Executable architecture coverage is uneven. | Service and DTO unit tests exist, but route-level auth/permission and integrated admin-to-backend workflow tests are limited. | Add focused controller/e2e coverage for workflow, audit, assets, and mapping endpoints. |

## Boundary Review

| Boundary | Result | Notes |
| --- | --- | --- |
| Curriculum hierarchy | PASS | Courses, levels, chapters, lessons, skills, objectives, assets, and question bank remain the Phase 3 domain. |
| Backend authority | PASS | Backend APIs own status, validation, permissions, and persistence. |
| Admin dashboard authority | PASS with gaps | Admin UI is not final authority, but some clients are not yet aligned to backend contracts. |
| Published content stability | BLOCKED | Published lesson validity can still be invalidated by mapping mutations. |
| Auditability | BLOCKED | Workflow and mapping changes need consistent actor-attributed audit events. |
| Learner/runtime scope | PASS | No Phase 3 learner delivery, practice/session execution, AIM runtime, or AI Teacher implementation was added. |
| Secret handling | PASS | This review did not add secrets or credential-bearing files. |

## Architecture Decision

Phase 3 can be considered architecturally aligned with the Curriculum & Content System
scope, but it should not be treated as production-ready until the open CRITICAL and MAJOR
items are resolved or explicitly accepted by engineering leadership.

## Required Follow-up

1. Protect published lesson-skill invariants from post-publish mutation.
2. Add actor-attributed audit logs for status workflow and mapping mutations.
3. Align admin workflow clients with backend routes and response contracts.
4. Add safe asset URL and metadata validation.
5. Refresh stale Phase 3 route/permission documentation.
6. Add route-level auth and integration tests for privileged curriculum flows.
