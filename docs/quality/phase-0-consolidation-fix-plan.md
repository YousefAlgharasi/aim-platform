# AIM Phase 0 Consolidation Fix Plan

## Purpose

This document converts Phase 0 QA findings into a concrete cleanup plan that can be turned into documentation or implementation-preparation tasks.

It focuses on aligning active planning docs with `docs/product/vision.md` while preserving completed MVP pilot history and post-MVP Phase 1 direction.

## Scope

This is Phase 0 QA documentation for P0-QA-006.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AIM Engine runtime code.
- AI Teacher Gateway code.
- Admin dashboard runtime code.
- A separate Student Web App.

It lists exact file changes needed, files to keep, files to classify, missing files, and content sections needing completion. It does not perform runtime implementation.

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

| Dependency | Required Output | Status |
|---|---|---|
| P0-QA-001 | `docs/quality/phase-0-required-files-inventory.md` | Present. |
| P0-QA-002 | `docs/quality/phase-0-duplicate-content-audit.md` | Present and cleaned. |
| P0-QA-003 | `docs/quality/phase-0-content-completeness-audit.md` | Present and cleaned. |
| P0-QA-004 | `docs/quality/phase-0-cross-document-consistency-audit.md` | Present and aligned. |
| P0-QA-005 | `docs/quality/phase-1-readiness-gap-analysis.md` | Present and aligned. |
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |

## Fix Plan Summary

| Category | Count |
|---|---:|
| Required source documents to keep | 28 |
| QA reports to keep | 7 |
| Missing required Phase 0 files | 0 |
| Active files needing product-direction wording alignment | 13 |
| Files needing classification or move decision | 8 |
| Files recommended for immediate deletion | 0 |

## Files To Keep As Canonical

| Area | Files |
|---|---|
| Product | `docs/product/vision.md`; `docs/product/non-negotiables.md`; `docs/product/mvp-scope.md`; `docs/product/out-of-scope.md`; `docs/product/phase-0-readiness-checklist.md`; `docs/product/notification-scope.md`; `docs/product/risk-register.md`; `docs/product/open-decisions.md`; `docs/product/phase-0-final-review.md` |
| Roles and journeys | `docs/product/roles-and-permissions.md`; `docs/journeys/student-journey.md`; `docs/journeys/parent-journey.md`; `docs/journeys/admin-journey.md`; `docs/journeys/content-manager-journey.md`; `docs/journeys/human-reviewer-journey.md` |
| Learning/content | `docs/learning/english-skill-tree.md`; `docs/learning/placement-test-strategy.md`; `docs/content/lesson-content-structure.md`; `docs/content/question-bank-standards.md` |
| AI/AIM/data/API | `docs/ai-teacher/behavior-rules.md`; `docs/aim-engine/boundary-and-io-contract.md`; `docs/data/session-data-capture.md`; `docs/data/initial-data-model.md`; `docs/api/api-planning-baseline.md`; `docs/security/ai-safety-privacy-rules.md` |
| Interfaces/reporting | `docs/mobile/mobile-sitemap.md`; `docs/admin/admin-dashboard-sitemap.md`; `docs/analytics/reports-scope.md` |

## QA Reports To Keep

| Report | Purpose |
|---|---|
| `docs/quality/phase-0-required-files-inventory.md` | Required file/path inventory. |
| `docs/quality/phase-0-duplicate-content-audit.md` | Duplicate and overlap audit. |
| `docs/quality/phase-0-content-completeness-audit.md` | Completeness and readiness scoring. |
| `docs/quality/phase-0-cross-document-consistency-audit.md` | Contradiction and consistency audit. |
| `docs/quality/phase-1-readiness-gap-analysis.md` | Phase 1 readiness gap analysis. |
| `docs/quality/phase-0-consolidation-fix-plan.md` | Concrete cleanup plan. |
| `docs/quality/phase-0-final-quality-gate.md` | Final Phase 0 quality gate. |

## Exact Content Fixes Needed

| Fix ID | File | Required Change | Priority |
|---|---|---|---|
| F-001 | `docs/product/non-negotiables.md` | Preserve current direction, strict AIM/client boundaries, no-speed rule, backend-only AI Gateway, and no separate Student Web App. | P0 |
| F-002 | `docs/product/mvp-scope.md` | Separate completed MVP pilot stack from post-MVP Phase 1 stack. React Web/FastAPI are completed pilot context; Flutter/NestJS are Phase 1 direction. | P0 |
| F-003 | `docs/product/out-of-scope.md` | Clarify that Flutter was excluded only from the completed MVP pilot, not from post-MVP Phase 1. | P0 |
| F-004 | `docs/product/risk-register.md` | Update risks so stack confusion is handled as React Web/FastAPI completed pilot vs Flutter/NestJS Phase 1. | P0 |
| F-005 | `docs/product/open-decisions.md` | Mark learner client and backend API stack as decided: Flutter Mobile and NestJS + TypeScript for Phase 1. | P0 |
| F-006 | `docs/product/phase-0-final-review.md` | Replace old unresolved frontend/API direction wording with locked current direction from `vision.md`. | P0 |
| F-007 | `docs/api/api-planning-baseline.md` | Preserve FastAPI only as completed MVP pilot context and use NestJS + TypeScript as the Phase 1 Backend API. | P0 |
| F-008 | `docs/mobile/mobile-sitemap.md` | State clearly that Flutter Mobile is the approved post-MVP Phase 1 learner client. | P0 |
| F-009 | `docs/aim-engine/boundary-and-io-contract.md` | Use all-client boundary wording and clarify Python AIM Engine as backend service/module behind Phase 1 Backend API. | P0 |
| F-010 | `docs/analytics/reports-scope.md` | Clarify reporting surfaces: Flutter Mobile for Phase 1 learner progress, React Web only completed pilot context, no Student Web App. | P0 |
| F-011 | `docs/quality/phase-0-cross-document-consistency-audit.md` | Update consistency findings and canonical wording with current product direction. | P0 |
| F-012 | `docs/quality/phase-1-readiness-gap-analysis.md` | Remove old React-first/Flutter-future blocker and replace with current Phase 1 readiness gaps. | P0 |
| F-013 | `docs/quality/phase-0-final-quality-gate.md` | Update final gate to approve current direction: Flutter Mobile + NestJS Phase 1, with conditional areas noted. | P0 |
| F-014 | `docs/data/session-data-capture.md` | Verify speed is behavioral evidence only and not a mastery, student-level, or direct difficulty signal. | P1 |
| F-015 | `docs/security/ai-safety-privacy-rules.md` | Verify no sentence says speed contributes directly to mastery. Preserve backend-only AI Gateway and server-only credentials. | P1 |
| F-016 | `docs/product/phase-0-readiness-checklist.md` | Update stale paths to match P0-QA-001 inventory if still stale. | P1 |
| F-017 | `docs/journeys/parent-journey.md` | Keep parent access conditional until consent, linking, and privacy are approved. | P1 |
| F-018 | `docs/admin/admin-dashboard-sitemap.md` | Label admin modules as Phase 1 foundation, conditional, or later to prevent scope creep. | P1 |

## Files To Classify, Move, Or Archive

| File | Current Issue | Recommended Action | Priority |
|---|---|---|---|
| `docs/AIM_023_PILOT_READINESS.md` | Root-level later-phase doc may be confused with P0-023. | Move to `docs/pilot/pilot-readiness.md` or archive as later-phase planning after owner approval. | P1 |
| `docs/AIM_024_PILOT_OPERATIONS.md` | Root-level later-phase doc may be confused with P0-024. | Move to `docs/pilot/pilot-operations.md` or archive as later-phase planning after owner approval. | P1 |
| `docs/AIM_025_PILOT_ANALYSIS.md` | Root-level later-phase doc outside Phase 0 outputs. | Move to `docs/pilot/pilot-analysis.md` or archive as later-phase planning after owner approval. | P1 |
| `docs/AIM_026_PRODUCTION_HARDENING.md` | Root-level production doc outside Phase 0 outputs. | Move to `docs/deployment/production-hardening.md` or archive as later-phase planning after owner approval. | P1 |
| `docs/AIM_027_CLOUD_DEPLOYMENT.md` | Root-level deployment doc includes implementation/deployment details. | Move to `docs/deployment/cloud-deployment.md` after owner approval. | P1 |
| `docs/AIM_ALGORITHM_TEST_PLAN.md` | Useful algorithm support doc, but outside Phase 0 required outputs. | Keep and classify under algorithm validation, such as `docs/algorithm/test-plan.md`, if the team wants a cleaner tree. | P2 |
| `docs/AIM_VISUAL_DEMO.md` | Useful demo support doc, but outside Phase 0 required outputs. | Keep and classify under demo/dev docs, such as `docs/demo/visual-demo.md`, if the team wants a cleaner tree. | P2 |
| `docs/AIM Complete Architecture EN.docx` | Potential stale architecture duplicate. | Human review required; archive or convert current content to Markdown. | P2 |

## Files To Merge

| Merge Candidate | Recommendation |
|---|---|
| None immediately. | The Phase 0 canonical documents overlap intentionally but serve different planning layers. Prefer cross-links and cleanup over merging. |

## Missing Files To Create

| Missing File | Recommendation |
|---|---|
| None. | P0-QA-001 found all required Phase 0 files present. |

## Sections Needing Completion Or Decision

| Area | Needed Decision / Completion |
|---|---|
| Parent access | Decide Phase 1 inclusion, consent model, linked-account policy, and visible report scope before parent implementation. |
| Admin dashboard | Split modules into Phase 1 foundation, conditional, and later production scope. |
| Placement | Lock exact placement item counts and thresholds before implementation. |
| Lesson seed content | Lock exact A1 lesson count and metadata requirements before content buildout. |
| Notification controls | Decide reminder mute/disable policy, inbox requirement, and safe lock-screen payloads. |
| Analytics detail | Decide student/parent/admin visible detail levels before reports are built. |
| Deployment topology | Decide hosting/deployment path for NestJS API, Python AIM Engine, Supabase, and environment secrets. |
| Data retention/logging | Lock retention periods and redaction fields before production deployment. |
| Root-level docs | Classify later-phase root-level docs as active support, moved docs, or archive docs. |

## Suggested Cleanup Task Order

1. Remove unresolved merge conflict markers from active Markdown docs.
2. Align completed MVP pilot versus post-MVP Phase 1 wording across product docs.
3. Align API docs so FastAPI is completed pilot context and NestJS + TypeScript is Phase 1 Backend API.
4. Align mobile docs so Flutter Mobile is approved Phase 1 learner client.
5. Align AIM Engine docs so Python AIM Engine remains backend-owned service/module.
6. Align analytics/reporting docs so learner progress is Flutter Mobile Phase 1 and no Student Web App is introduced.
7. Update QA docs to reflect the current product direction.
8. Verify speed/no-speed mastery language in data and security docs.
9. Decide parent, admin, placement, lesson seed, notification, analytics, and deployment details before affected implementation.
10. Classify or move root-level later-phase docs.
11. Review `.docx` architecture document.
12. Add a canonical docs index if the team wants one.

## Verification Commands

Run after all planned wording updates are complete:

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

This fix plan does not:

- Delete files.
- Move files automatically.
- Create runtime implementation.
- Create implementation tasks directly.
- Implement Flutter Mobile.
- Implement NestJS.
- Implement FastAPI.
- Implement database migrations.
- Implement AIM Engine runtime code.
- Create a separate Student Web App.
- Move AIM Engine logic into clients.
- Remove completed MVP pilot history.

## Assumptions

- `docs/product/vision.md` is the active product direction source of truth.
- Completed MVP pilot history must be preserved.
- React Web and FastAPI are completed MVP pilot context.
- Flutter Mobile and NestJS + TypeScript are post-MVP Phase 1 direction.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless changed by a later documented decision.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Parent access remains conditional.
- Phase 0 remains documentation/planning only.

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/product/risk-register.md`
- `docs/product/open-decisions.md`
- `docs/product/phase-0-final-review.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/analytics/reports-scope.md`
- `docs/quality/phase-0-required-files-inventory.md`
- `docs/quality/phase-0-duplicate-content-audit.md`
- `docs/quality/phase-0-content-completeness-audit.md`
- `docs/quality/phase-0-cross-document-consistency-audit.md`
- `docs/quality/phase-1-readiness-gap-analysis.md`
- `docs/quality/phase-0-final-quality-gate.md`

## Done Verification

| Check | Result |
|---|---|
| Fix plan updated at `docs/quality/phase-0-consolidation-fix-plan.md` | Pass |
| Exact file changes listed | Pass |
| Files to keep listed | Pass |
| Files to merge listed | Pass |
| Files to rename/move/classify listed | Pass |
| Missing files to create listed | Pass |
| Content sections needing completion listed | Pass |
| Completed MVP pilot stack and post-MVP Phase 1 stack separated | Pass |
| Fixes were not implemented as runtime code | Pass |
| No app/backend runtime code implemented | Pass |
| No separate Student Web App created | Pass |
| No AIM Engine logic moved into Flutter Mobile, React Web, admin UI, or any other client | Pass |

## Recommendation

P0-QA-006 remains valid after wording alignment. P0-QA-007 can now run the final Phase 0 quality gate and approval decision using the current product direction from `docs/product/vision.md`.
