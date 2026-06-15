# Content Status Workflow Check

> Phase 3 — P3-062  
> Scope: Curriculum & Content System only.

## Summary

Status: **MAJOR follow-up required**

This check reviewed the draft, published, and archived status workflow across the backend curriculum workflow API, backend publish validation, and admin dashboard status workflow UI. It stays within the Phase 3 Curriculum & Content System scope and does not add onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App work.

Backend transition authority is present and guarded: status changes run through `ContentStatusWorkflowController`, use Phase 2 auth/permission guards, validate legal transitions, and call backend publish validation before any publish update. However, the admin dashboard status workflow client does not currently call the implemented backend workflow route, and it decodes a different response shape than the backend returns. That means admin UI status buttons may render but fail at runtime until the route/method/response contract is aligned.

## Files Reviewed

- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.controller.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.service.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.types.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.module.ts`
- `services/backend-api/src/features/curriculum/publish-validation/publish-validation.service.ts`
- `services/backend-api/src/features/curriculum/validation/content-status.ts`
- `services/backend-api/src/features/curriculum/curriculum.module.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.service.spec.ts`
- `services/backend-api/src/features/curriculum/publish-validation/publish-validation.service.spec.ts`
- `apps/admin-dashboard/lib/api/admin-content-status-api.ts`
- `apps/admin-dashboard/components/content-status-workflow.tsx`
- `apps/admin-dashboard/app/admin/content/courses/[courseId]/status/page.tsx`
- `apps/admin-dashboard/app/admin/content/lessons/[lessonId]/status/page.tsx`
- `docs/phase-3/content-status-lifecycle.md`
- `packages/shared-contracts/api/content-status-contracts.md`

## Findings

| ID | Severity | Status | Finding | Evidence | Required follow-up |
|---|---|---:|---|---|---|
| CSW-001 | PASS | Closed | Backend owns status transitions. | `ContentStatusWorkflowController` exposes publish/archive/restore endpoints and delegates transition execution to `ContentStatusWorkflowService`; create/update DTOs do not own status transitions. | None. |
| CSW-002 | PASS | Closed | Backend workflow endpoints are protected by Phase 2 guards. | Controller uses `SupabaseJwtAuthGuard`, `PermissionGuard`, and action-specific `CurriculumPermission.CONTENT_PUBLISH`, `CONTENT_ARCHIVE`, and `CONTENT_RESTORE`. | None. |
| CSW-003 | PASS | Closed | Invalid status transitions are blocked. | `isAllowedStatusTransition` permits only `draft -> published`, `draft -> archived`, `published -> archived`, and `archived -> draft`; service rejects same-state, `published -> draft`, and `archived -> published`. Tests cover representative rejected transitions. | None. |
| CSW-004 | PASS | Closed | Publish attempts call backend-owned publish validation before updating status. | `ContentStatusWorkflowService` calls `PublishValidationService.validateReadyForPublish` for `targetStatus === 'published'` before running the `UPDATE`. Tests assert validation is called and a failed validation prevents the update. | None. |
| CSW-005 | PASS | Closed | Lesson publish gate exists in backend validation. | `PublishValidationService.validateLesson` requires lesson title, description, at least one linked published skill, and at least one published lesson asset. Tests cover rejection without published skill/asset. | None. |
| CSW-006 | PASS | Closed | Admin UI does not mutate local status directly. | `ContentStatusWorkflow` calls server actions, which call `publishContent`, `archiveContent`, or `restoreContent`; the component refreshes after backend success instead of changing status locally. | None. |
| CSW-007 | PASS | Closed | Admin lesson UI surfaces the skill-link publish gate early. | Lesson status page fetches skill links and `ContentStatusWorkflow` disables publish when `skillLinkCount === 0`. Backend remains authoritative. | None. |
| CSW-008 | MAJOR | Open | Admin status API client calls paths that do not match the implemented backend workflow controller. | Backend exposes `PATCH /curriculum/workflow/:entityType/:entityId/publish|archive|restore`. Admin client posts to `/curriculum/:entityType/:entityId/:action`, and uses a special question-bank path for questions. | Align admin client with backend: call `PATCH /curriculum/workflow/{entityType}/{entityId}/{action}` or add backend-compatible route aliases in a dedicated task. |
| CSW-009 | MAJOR | Open | Admin status API client decodes a different response shape than the backend returns. | Backend returns `{ id, entityType, previousStatus, currentStatus, updatedAt }`; admin client expects `{ id, status }` and falls back to `draft` if `status` is absent. | Update the admin decoder/type to read `currentStatus`, or change backend response contract intentionally and update tests/docs. |
| CSW-010 | MAJOR | Open | Admin UI coverage is partial. | P3-060 status pages exist for courses and lessons only. Reusable component exists, but no status pages were found for levels, chapters, skills, objectives, or questions. | Add status pages/routes for remaining workflow entity types or document the staged rollout explicitly. |
| CSW-011 | MINOR | Open | Admin client entity type omits `objectives`, while backend workflow supports `objectives`. | Backend `WORKFLOW_ENTITY_TYPES` includes `objectives`; admin `ContentEntityType` omits it. | Add `objectives` to admin workflow client once an objective status page is introduced. |
| CSW-012 | MAJOR | Open | Workflow audit logging is not wired into status transitions. | `CurriculumAuditLogModule` exists, but `ContentStatusWorkflowService` injects only `DatabaseService` and `PublishValidationService`; no audit event is emitted on publish/archive/restore. | Wire curriculum audit logging into workflow transitions before production use, or document a separate audit integration task as a release blocker. |
| CSW-013 | MINOR | Open | Swagger error text still references lesson-only publish validation. | Publish endpoint response says "Transition not allowed or lesson missing published skill" even though P3-044 now validates multiple entity types. | Update API docs text to mention publish validation failures generically. |
| CSW-014 | MINOR | Open | Backend workflow service tests are unit-level only. | Existing tests cover service transition logic and publish-validation delegation, but not guarded controller routing/methods or admin-to-backend integration. | Add controller/e2e tests for PATCH workflow endpoints and admin client route compatibility. |

## Backend Workflow Coverage

Backend status lifecycle:

- `draft -> published`: allowed only after `PublishValidationService` passes.
- `draft -> archived`: allowed.
- `published -> archived`: allowed.
- `archived -> draft`: allowed by status rules and protected by `CONTENT_RESTORE`.
- `published -> draft`: blocked.
- `archived -> published`: blocked.
- same-state transitions: blocked.

Backend publish readiness checks currently cover:

- courses: title, description, at least one published level;
- levels: title, published parent course, at least one published chapter;
- chapters: title, published parent level, at least one published lesson;
- lessons: title, description, at least one linked published skill, at least one published asset;
- skills: key, title, at least one objective link;
- objectives: title, at least one published skill link;
- questions: stem, type-specific correct answer definition, published primary skill mapping.

## Admin Workflow Coverage

Admin UI status workflow coverage:

- Course status page exists.
- Lesson status page exists and checks skill-link count.
- Reusable status workflow component exists.
- Client-side allowed transition map matches the 3-state lifecycle.
- UI labels restore as Super Admin only, but backend permission remains authoritative.

Admin UI integration gaps:

- Client endpoint paths do not match the backend workflow controller.
- Client response decoder does not match backend response shape.
- Status pages for levels, chapters, skills, objectives, and questions are not implemented.

## Checks Run

- Reviewed backend status workflow controller, service, module, types, and transition helpers.
- Reviewed backend publish validation service and tests.
- Reviewed admin content status API client, reusable workflow component, and course/lesson status pages.
- Reviewed route references for publish/archive/restore/workflow paths.
- Ran secret-pattern scan over the new check document and reviewed workflow files.
- Ran scope scan for prohibited Phase 3 areas.

## Required Follow-Up

1. Align admin status API paths/methods with the backend workflow controller.
2. Align admin transition response decoding with the backend `currentStatus` response shape.
3. Add guarded backend controller/e2e tests for publish/archive/restore endpoints.
4. Add admin workflow pages or explicit coverage plan for levels, chapters, skills, objectives, and questions.
5. Wire curriculum audit logging into status transitions.
6. Update Swagger/API docs for generic publish validation errors.

## Final Status

P3-062 output exists and documents the workflow review with classified findings. No runtime code was changed by this task.
