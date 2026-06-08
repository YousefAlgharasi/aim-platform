# AIM Phase 0 Consolidation Fix Plan

## Purpose

This document converts Phase 0 QA findings into a concrete cleanup plan that can be turned into implementation or documentation tasks.

## Scope

This is a Phase 0 QA document for task P0-QA-006. It lists exact file changes needed, files to keep, merge, rename, or classify, missing files to create, and content sections needing completion. It does not perform the fixes, delete files, implement app/backend code, create a Student Web App, or move AIM Engine logic into Flutter.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-QA-005 | `docs/quality/phase-1-readiness-gap-analysis.md` | Present and marked Done in Notion before this task started. |

## Fix Plan Summary

| Category | Count |
|---|---:|
| Required source documents to keep | 28 |
| QA reports to keep | 6 |
| Missing required Phase 0 files | 0 |
| Files needing content correction | 3 |
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

## Exact Content Fixes Needed

| Fix ID | File | Section / Content | Required Change | Priority |
|---|---|---|---|---|
| F-001 | `docs/data/session-data-capture.md` | Behavioral signal section that says "Average Speed metric (one of five mastery formula components, weighted 15%)." | Replace with: "Average response time may be captured for behavioral analysis only. It must not be a mastery formula component, student-level signal, or direct difficulty-increase signal." | P0 |
| F-002 | `docs/security/ai-safety-privacy-rules.md` | AIM Engine safety rule that says speed contributes a 15% mastery component. | Replace with: "Speed contributes no mastery component. It may only inform educational behavior signals such as hesitation, rushing, possible guessing, fatigue/distraction, or low confidence." | P0 |
| F-003 | `docs/product/phase-0-readiness-checklist.md` | Phase 0 Task Checklist path references. | Update stale paths to match P0-QA-001 inventory, including `docs/learning/english-skill-tree.md`, `docs/learning/placement-test-strategy.md`, `docs/ai-teacher/behavior-rules.md`, `docs/aim-engine/boundary-and-io-contract.md`, `docs/data/session-data-capture.md`, and `docs/data/initial-data-model.md`. | P1 |
| F-004 | `docs/mobile/mobile-sitemap.md` | Scope/status wording. | Add or preserve a clear note: future Flutter planning only; React web/cloud remains first pilot unless product owner changes MVP vehicle. | P1 |
| F-005 | `docs/analytics/reports-scope.md` | Client wording such as "mobile app progress screen." | Use neutral "client progress screen" or explicitly state React web first / future Flutter where relevant. | P2 |
| F-006 | `docs/aim-engine/boundary-and-io-contract.md` | Client wording that implies Flutter as only client. | Use "client app" for shared contracts and mention React web first / Flutter later when platform matters. | P2 |
| F-007 | `docs/api/api-planning-baseline.md` | Client wording that implies Flutter as only client. | Use "client app" for shared API behavior and preserve server-only AIM/AI boundaries. | P2 |
| F-008 | `docs/journeys/parent-journey.md` | Parent feature status. | Add explicit "Conditional MVP; do not implement until parent access, consent, and linking are approved." | P1 |
| F-009 | `docs/admin/admin-dashboard-sitemap.md` | Admin module scope. | Label modules as MVP pilot, conditional, or future to prevent broad admin scope creep. | P1 |

## Files To Classify, Move, Or Archive

| File | Current Issue | Recommended Action | Priority |
|---|---|---|---|
| `docs/AIM_023_PILOT_READINESS.md` | Root-level later-phase doc may be confused with P0-023. | Move to `docs/pilot/pilot-readiness.md` or archive as later-phase planning. | P1 |
| `docs/AIM_024_PILOT_OPERATIONS.md` | Root-level later-phase doc may be confused with P0-024. | Move to `docs/pilot/pilot-operations.md` or archive as later-phase planning. | P1 |
| `docs/AIM_025_PILOT_ANALYSIS.md` | Root-level later-phase doc outside Phase 0 outputs. | Move to `docs/pilot/pilot-analysis.md` or archive as later-phase planning. | P1 |
| `docs/AIM_026_PRODUCTION_HARDENING.md` | Root-level production doc outside Phase 0 outputs. | Move to `docs/deployment/production-hardening.md` or archive as later-phase planning. | P1 |
| `docs/AIM_027_CLOUD_DEPLOYMENT.md` | Root-level deployment doc includes implementation/deployment details. | Move to `docs/deployment/cloud-deployment.md` after owner approval. | P1 |
| `docs/AIM_ALGORITHM_TEST_PLAN.md` | Useful algorithm support doc, but outside Phase 0 outputs. | Keep and classify under algorithm validation, such as `docs/algorithm/test-plan.md`. | P2 |
| `docs/AIM_VISUAL_DEMO.md` | Useful demo support doc, but outside Phase 0 outputs. | Keep and classify under demo/dev docs, such as `docs/demo/visual-demo.md`. | P2 |
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
| Mastery fairness | Apply F-001 and F-002 before AIM mastery/difficulty implementation. |
| MVP frontend vehicle | Confirm React web/cloud first; mark Flutter as future unless changed. |
| Parent access | Decide MVP inclusion, consent model, and linked-account policy. |
| Admin dashboard | Split modules into MVP pilot, conditional, and future. |
| Placement | Lock exact placement item counts and thresholds before implementation. |
| Notification controls | Decide reminder mute/disable policy and inbox requirement. |
| Analytics detail | Decide student/parent/admin visible detail levels before reports are built. |
| Data retention/logging | Lock retention periods and redaction fields before production deployment. |

## Suggested Cleanup Task Order

1. Fix no-speed mastery contradictions.
2. Update readiness checklist paths.
3. Confirm React web/cloud first and mark Flutter docs future.
4. Decide parent MVP inclusion.
5. Split admin dashboard modules by MVP/conditional/future.
6. Classify or move root-level later-phase docs.
7. Review `.docx` architecture document.
8. Add a canonical docs index if the team wants one.

## Done Verification

| Check | Result |
|---|---|
| Fix plan created at `docs/quality/phase-0-consolidation-fix-plan.md` | Pass |
| Exact file changes listed | Pass |
| Files to keep listed | Pass |
| Files to merge listed | Pass |
| Files to rename/move/classify listed | Pass |
| Missing files to create listed | Pass |
| Content sections needing completion listed | Pass |
| Fixes were not performed in this task | Pass |
| No app/backend runtime code implemented | Pass |
| No Student Web App created | Pass |
| No AIM Engine logic moved into Flutter | Pass |

## Recommendation

P0-QA-006 is ready to mark Done in Notion. P0-QA-007 can now run the final Phase 0 quality gate and approval decision.
