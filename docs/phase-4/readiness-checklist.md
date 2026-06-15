# Phase 4 Readiness Checklist

> Phase 3 — P3-069  
> Source phase: Curriculum & Content System

## Readiness Decision

**Status: NOT READY for unrestricted Phase 4 dependency.**

Phase 4 may begin planning against the Phase 3 curriculum foundation, but it should not
depend on production-ready published lesson delivery, asset delivery, or workflow
auditability until the blocking checklist items below are resolved.

## Ready Foundations

| Area | Status | Evidence |
| --- | --- | --- |
| Curriculum hierarchy model | Ready | Course, level, chapter, and lesson backend services/controllers exist with admin API coverage. |
| Skill and objective foundation | Ready | Skill/objective contracts and backend services are present for curriculum authoring. |
| Question bank foundation | Ready with follow-up | Question bank and question-skill mapping exist; primary skill mapping has backend coverage. |
| Status lifecycle model | Ready with follow-up | Backend workflow endpoints own publish/archive/restore; DTOs reject direct status mutation. |
| Admin content management surface | Partial | Admin pages and API clients exist for major content areas, but workflow client integration needs correction. |
| Security architecture | Conditional | Phase 2 auth/permission boundaries are used, but audit and invariant gaps remain. |
| Phase 3 scope boundary | Ready | Reviews found no Phase 3 implementation of learner delivery, practice/session runtime, AIM runtime, AI Teacher, dashboard recommendations, or Student Web App work. |

## Blocking Gates

| Gate | Required Before Phase 4 Can Depend On It | Current State | Owner |
| --- | --- | --- | --- |
| Published lesson-skill invariants | Published lessons cannot lose required skill links after publish. | BLOCKED: mapping mutations can invalidate published lessons. | Backend |
| Workflow auditability | Publish, archive, restore, and privileged mapping changes emit actor-attributed audit records. | BLOCKED: workflow transitions are not audit logged; some mapping events lack actor ID. | Backend |
| Admin workflow integration | Admin status controls call implemented backend workflow routes and decode the real response shape. | BLOCKED: admin client route/method/response mismatch remains open. | Admin Dashboard |
| Asset safety | Lesson asset URLs, thumbnails, and URL-like metadata are validated against a safe policy. | BLOCKED: arbitrary strings can be accepted. | Backend |
| Executable E2E harness | Seeded authenticated flow covers hierarchy creation, skill linking, question mapping, assets, validation, and publish. | BLOCKED: no seeded E2E environment is available. | Platform |
| Test fixture health | Curriculum test suite can run without stale constructor errors. | BLOCKED: `lesson-skills.service.spec.ts` needs the audit-log dependency mock. | Backend |

## Phase 4 Allowed Dependencies

Phase 4 planning may safely reference:

- Curriculum hierarchy concepts and IDs.
- Backend-owned lifecycle status model.
- Draft/admin content authoring APIs as protected internal foundations.
- Question bank and skill mapping data model concepts.
- Published-only content visibility requirements as a contract.
- Phase 3 findings as required preconditions.

## Phase 4 Must Not Depend On Yet

Phase 4 implementation must not assume:

- Published lesson-skill links are immutable or always valid after publication.
- Admin status controls currently execute the backend workflow successfully.
- Publish/archive/restore actions are fully audit logged.
- Lesson asset URLs are safe for client rendering without additional validation.
- A complete seeded E2E test harness exists.
- Any learner-facing delivery API can expose question correctness or admin-only fields.

## Required Before Learner-Facing Consumption

1. Fix post-publish lesson-skill mutation rules.
2. Fix admin status workflow route and response integration.
3. Add actor-attributed audit logging for workflow and mapping mutations.
4. Add safe lesson asset URL and metadata validation.
5. Add learner-safe published content read contracts that exclude draft/archived content and answer correctness.
6. Add seeded authenticated E2E coverage for the full content authoring and publish path.
7. Re-run architecture, security, and E2E checks after fixes land.

## Readiness Checklist

| Checklist Item | Status |
| --- | --- |
| Phase 3 output documents exist for security, architecture, and E2E review. | Done |
| Phase 3 stayed within Curriculum & Content System scope. | Done |
| Backend remains final authority for content state. | Done |
| Direct client status mutation is rejected by DTO validators. | Done |
| Lesson publish validation requires skill links before publish. | Done |
| Published lesson-skill invariants are protected after publish. | Not ready |
| Workflow changes are actor-attributed in audit logs. | Not ready |
| Admin workflow client matches backend workflow contract. | Not ready |
| Lesson asset safe URL/metadata validation is implemented. | Not ready |
| Authenticated seeded E2E coverage exists. | Not ready |
| Curriculum tests run without stale fixtures. | Not ready |

## Final Recommendation

Phase 4 may start as **planning and prerequisite-fix work**. It should not start
learner-facing delivery, practice/session runtime, AIM runtime integration, dashboard
recommendations, progress reports, AI Teacher behavior, or Student Web App work on top of
Phase 3 content until the blocking gates are closed.
