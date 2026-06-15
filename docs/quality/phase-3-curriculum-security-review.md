# Phase 3 Curriculum Security Review

> Phase 3 — P3-066  
> Scope: Curriculum & Content System only

## Review Status

**Status: CRITICAL follow-up required before production release.**

The reviewed backend curriculum APIs are generally protected by Phase 2 authentication
and permission guards, and status is not client-writable through normal create/update
DTOs. However, the review found open authorization-integrity and audit gaps that can
leave published curriculum content in an invalid state or make privileged changes hard
to trace.

## Files Reviewed

- `docs/tasks/phase_3_task_prompts.md`
- `docs/phase-3/curriculum-content-system-charter.md`
- `docs/phase-3/curriculum-rls-security-plan.md`
- `docs/phase-3/content-publishing-permissions.md`
- `docs/phase-3/curriculum-permission-guards.md`
- `docs/phase-3/content-status-workflow-check.md`
- `docs/phase-3/lesson-asset-safety-check.md`
- `docs/quality/phase-3-lesson-skill-linking-review.md`
- `services/backend-api/src/features/curriculum/curriculum.permissions.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.controller.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.service.ts`
- `services/backend-api/src/features/curriculum/curriculum-audit-log/*`
- `services/backend-api/src/features/curriculum/dto/*`
- `services/backend-api/src/features/curriculum/lesson-assets/*`
- `services/backend-api/src/features/curriculum/lesson-skills/*`
- `services/backend-api/src/features/curriculum/lessons/*`
- `apps/admin-dashboard/app/admin/content/**/*`
- `apps/admin-dashboard/lib/api/**/*`

## Findings

| ID | Severity | Status | Finding | Evidence | Required Follow-up |
| --- | --- | --- | --- | --- | --- |
| CSR-001 | PASS | Closed | Curriculum backend controllers use backend authorization for protected content operations. | The status workflow controller uses `SupabaseJwtAuthGuard`, `PermissionGuard`, `@ApiBearerAuth()`, and action-specific `@RequirePermissions(...)`; entity controllers reviewed follow the same Phase 2 guard pattern for admin operations. | Keep guard coverage mandatory for every new curriculum controller and add route-level regression tests where absent. |
| CSR-002 | PASS | Closed | Restore-to-draft is represented as a super-admin-only permission boundary. | `CurriculumPermission.CONTENT_RESTORE` exists and `CURRICULUM_RESTORE_ROLES` maps restore authority to `AuthorizedRole.SUPER_ADMIN`. The restore endpoint requires `CONTENT_RESTORE`. | Ensure permission seeding and role-permission assignment continue to grant restore only to super admins. |
| CSR-003 | PASS | Closed | Client payloads cannot directly set lifecycle status through normal create/update DTOs. | Course, level, chapter, lesson, skill, objective, question, and lesson asset DTO validators reject client-supplied `status` fields, routing transitions through workflow endpoints instead. | Maintain this rule for new curriculum entity DTOs. |
| CSR-004 | PASS | Closed | Audit log reads are protected. | `CurriculumAuditLogController` is under backend auth and requires `CurriculumPermission.AUDIT_READ`. | Add e2e coverage proving non-admin users cannot read audit logs. |
| CSR-005 | PASS | Closed | Question list exposure avoids answer correctness leakage. | Prior question-bank review confirmed list responses exclude answer correctness details; answer-sensitive review remains restricted to admin APIs. | Keep answer/correctness fields out of any learner-facing or broad list responses. |
| CSR-006 | CRITICAL | Open | Published lesson validity can be broken after publication by mutating skill links. | P3-065 confirmed the lesson-skill mapping API validates skill links before publish, but add/remove/set-primary operations do not reject changes when the parent lesson is already `published`. Removing the last link after publish violates the required "published lessons must have skills" invariant without changing status. | Enforce draft-only mutation for lesson-skill mapping changes, or re-run publish validation transactionally and block mutations that would leave a published lesson invalid. Add tests for removing the last skill from a published lesson. |
| CSR-007 | MAJOR | Open | Status workflow transitions are not audit logged. | `CurriculumAuditLogModule` exists, but `ContentStatusWorkflowService` injects only `DatabaseService` and `PublishValidationService`; publish/archive/restore updates do not emit audit events. | Wire audit logging into publish, archive, and restore transitions with actor ID, entity type, previous status, new status, and timestamp. |
| CSR-008 | MAJOR | Open | Some mutation audit events lack actor attribution. | P3-065 found lesson-skill service methods accept `actorUserId`, but the controller does not provide the authenticated user ID, so audit records can be created with a null actor for privileged link changes. | Extract the authenticated admin user from the request in mapping controllers and pass the actor ID to audit-writing services. |
| CSR-009 | MAJOR | Open | Admin status workflow client does not match backend authority routes. | P3-062 found the backend exposes `PATCH /curriculum/workflow/:entityType/:entityId/:action`, while the admin client posts to non-matching content paths and expects a different response shape. | Align admin server actions/API client with backend workflow routes and response contracts before relying on the UI for privileged status changes. |
| CSR-010 | MAJOR | Open | Lesson asset URL and metadata safety validation is incomplete. | P3-063 found asset `url`, `thumbnailUrl`, and metadata URL-like values accept arbitrary strings; metadata is not type-specific per asset type. | Add an allowlisted URL policy, reject unsafe schemes, validate metadata shape by asset type, and cover these rules with tests. |
| CSR-011 | MAJOR | Open | Published-content mutation rules are inconsistent across related mapping APIs. | Lesson create/update and asset update services enforce draft-only updates, but mapping endpoints such as lesson-skill changes have confirmed post-publish mutation gaps. Similar mapping surfaces should be reviewed for the same invariant risk. | Audit all curriculum mapping endpoints and enforce lifecycle checks consistently for published or archived parent entities. |
| CSR-012 | MINOR | Open | Security documentation has route and permission drift. | `docs/phase-3/curriculum-permission-guards.md` and older API docs still reference legacy permission names and entity-specific publish routes, while implementation uses `curriculum.content.*` permissions and the shared workflow controller. | Refresh docs to match implemented permission names, workflow routes, and admin client contracts. |
| CSR-013 | MINOR | Open | Guard and permission behavior needs broader executable coverage. | Unit coverage exists for selected services and DTOs, but controller/e2e tests proving unauthenticated, under-permissioned, and wrong-role requests are rejected are limited. | Add controller or e2e tests for publish, archive, restore, audit-log read, asset mutation, and mapping mutation endpoints. |

## Security Conclusions

- Backend authority is the correct source of truth for curriculum status transitions.
- Core curriculum write endpoints are not openly exposed, and no reviewed route should be made client-authoritative.
- The main release risk is not missing guards on every reviewed API; it is that validly authenticated admins can still perform mutations that break publish-time invariants after content is already published.
- Audit logging exists as a capability, but privileged workflow and mapping mutations are not yet consistently tied to actor-attributed audit records.
- No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys were added by this review.

## Required Follow-up Before Release

1. Block or revalidate post-publish mapping mutations that can invalidate published lessons.
2. Wire actor-attributed audit logging into publish, archive, restore, and mapping mutations.
3. Fix the admin status workflow client to call backend workflow endpoints exactly.
4. Add safe URL and metadata validation for lesson assets.
5. Add route-level auth/permission regression tests for protected curriculum APIs.
6. Refresh Phase 3 security docs so they match implemented route and permission names.

## Out-of-Scope Confirmation

This review did not add or modify onboarding, placement execution, learner lesson
delivery, practice attempts, sessions, AIM runtime integration, dashboard
recommendations, review/retention, progress reports, AI Teacher, or Student Web App
work.
