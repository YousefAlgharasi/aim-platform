# Phase 3 Lesson-Skill Linking Review

> Phase 3 — P3-065  
> Scope: Curriculum & Content System only.

## Summary

Status: **CRITICAL follow-up required**

This review checked the database, backend API, publish validation, regression tests, seed data, audit logging, and admin UI for the critical Phase 3 rule:

```text
A lesson cannot be published unless it is linked to at least one published skill.
```

The publish-time gate exists and is covered by tests. However, a published lesson can still have skill links removed through the lesson-skill API because `removeSkillFromLesson` does not check the lesson status or preserve a minimum published-skill count for published lessons. That can invalidate a published lesson after the publish gate has passed.

No onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App work was added.

## Files Reviewed

- `docs/phase-3/lesson-skill-linking-rules.md`
- `services/backend-api/prisma/migrations/20260614150000_create_lesson_skills_table/migration.sql`
- `services/backend-api/prisma/seeds/03_curriculum_content.sql`
- `services/backend-api/src/features/curriculum/lesson-skills/lesson-skills.types.ts`
- `services/backend-api/src/features/curriculum/lesson-skills/lesson-skills.service.ts`
- `services/backend-api/src/features/curriculum/lesson-skills/lesson-skills.controller.ts`
- `services/backend-api/src/features/curriculum/lesson-skills/lesson-publish-validation.service.ts`
- `services/backend-api/src/features/curriculum/lesson-skills/lesson-skill-regression.spec.ts`
- `services/backend-api/src/features/curriculum/publish-validation/publish-validation.service.ts`
- `services/backend-api/src/features/curriculum/content-status-workflow/content-status-workflow.service.ts`
- `apps/admin-dashboard/app/admin/content/lessons/[lessonId]/skills/page.tsx`
- `apps/admin-dashboard/app/admin/content/lessons/[lessonId]/skills/skill-linker.tsx`
- `apps/admin-dashboard/lib/api/admin-lesson-skills-api.ts`

## Findings

| ID | Severity | Status | Finding | Evidence | Required follow-up |
|---|---|---:|---|---|---|
| LSL-001 | PASS | Closed | Database mapping table exists with duplicate prevention and referential integrity. | `lesson_skills` has composite primary key `(lesson_id, skill_id)`, FK to `lessons(id)` with cascade on lesson removal, FK to `skills(id)` with restrict on skill removal, and reverse lookup index on `skill_id`. | None. |
| LSL-002 | PASS | Closed | Backend lesson-skill CRUD validates lesson and skill existence. | `LessonSkillsService.addSkillToLesson` calls `assertLessonExists` and `assertSkillExists`; duplicate links return `409 CONFLICT`. | None. |
| LSL-003 | PASS | Closed | Lesson publish gate counts only published linked skills. | `countPublishedSkillsForLesson` joins `lesson_skills` to `skills` and filters `s.status = 'published'`. Regression tests cover draft/unpublished skills not counting. | None. |
| LSL-004 | PASS | Closed | Publish workflow uses backend-owned validation. | `PublishValidationService.validateLesson` requires at least one linked published skill before publish; `ContentStatusWorkflowService` calls publish validation before updating status to `published`. | None. |
| LSL-005 | PASS | Closed | Regression tests cover the critical publish gate. | `lesson-skill-regression.spec.ts` checks zero published skills, draft linked skills, one published skill, multiple published skills, and published-only counting. | None. |
| LSL-006 | PASS | Closed | Seed data includes lesson-skill links using stable skill records. | `03_curriculum_content.sql` inserts stable skill keys such as `grammar.past_simple.forms` and links each seeded lesson through `lesson_skills`. | None. |
| LSL-007 | PASS | Closed | Admin UI makes the requirement visible. | Lesson skill-linking page shows a no-skills warning and the status workflow page disables lesson publish when `skillLinkCount === 0`; both state backend authority. | None. |
| LSL-008 | CRITICAL | Open | Published lessons can be invalidated by removing their skill links after publication. | `removeSkillFromLesson` deletes the link after only checking lesson existence. It does not check lesson status, block mutation on published lessons, or prevent removing the final published skill from a published lesson. | Block lesson-skill add/remove for non-draft lessons, or at minimum prevent unlinking the final published skill from a published lesson. Add regression tests for published lesson unlink attempts. |
| LSL-009 | MAJOR | Open | Lesson-skill audit events do not include the actor from the controller. | `LessonSkillsService.addSkillToLesson` and `removeSkillFromLesson` accept `actorUserId`, but `LessonSkillsController` does not read `req.user` or pass an actor, so audit rows are written with `actorUserId: null`. | Pass authenticated actor ID from the controller into service calls and add tests for audit metadata. |
| LSL-010 | MAJOR | Open | Lesson-skill API tests do not cover add/remove lifecycle restrictions. | Existing regression tests cover publish readiness and question-skill behavior, but not controller/service behavior for add/remove against published/archived lessons. | Add tests for draft-only link mutations and final-link removal behavior. |
| LSL-011 | MINOR | Open | Legacy `LessonPublishValidationService` and newer `PublishValidationService` overlap. | Both services can check lesson skill readiness. The workflow now uses `PublishValidationService`, while regression tests still directly cover `LessonPublishValidationService`. | Decide whether to keep the legacy service as a narrow helper or consolidate tests onto the active workflow validation service. |
| LSL-012 | MINOR | Open | Admin UI can display a published lesson with no links but cannot repair the backend invariant by itself. | `SkillLinker` shows a "Critical" warning if a published lesson has no skills, but the backend API still allows link mutation regardless of status. | Treat the warning as diagnostic only; backend must enforce the invariant. |

## Critical Rule Assessment

Current state:

- A draft lesson with zero published skills cannot pass backend publish validation.
- A draft lesson linked only to draft/archived skills cannot pass backend publish validation.
- A draft lesson linked to at least one published skill can pass the skill portion of publish validation.
- Seed data includes lesson-skill links and stable skill keys.
- Admin UI surfaces missing links before publish.

Gap:

- A lesson that is already `published` can lose all skill links through `DELETE /curriculum/lessons/:lessonId/skills/:skillId`. This violates the durable form of the critical rule.

## Security And Scope Review

- No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys were found in reviewed lesson-skill files.
- Lesson-skill records remain curriculum/content mapping data only.
- No learner progress, mastery, placement, practice attempt, session, recommendation, progress report, AI Teacher, or Student Web App logic was introduced.
- Stable skill keys are used in seed/admin display; backend links by skill UUID while `skills.key` remains the stable identifier.

## Required Follow-Up

1. Enforce draft-only lesson-skill mutations, or explicitly block final published-skill removal for published lessons.
2. Pass authenticated actor IDs into lesson-skill audit log calls.
3. Add backend regression tests for published/archived lesson skill mutation attempts.
4. Align active validation tests around the current publish workflow service, or document why the legacy lesson-only validation service remains.

## Final Status

P3-065 output exists and documents the lesson-skill linking review with classified findings. No runtime code was changed by this task.
