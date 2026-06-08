# AIM Phase 0 Required Files Inventory

## Purpose

This document audits whether every required Phase 0 output file exists in the repository at the path specified by `docs/tasks/phase_0_task_prompts.md`.

## Scope

This is a Phase 0 QA document for task P0-QA-001. It checks file existence, expected path alignment, and whether files appear empty or misplaced. It does not rewrite Phase 0 documents, implement app/backend code, create a Student Web App, or move AIM Engine logic into Flutter.

## Dependency Check

| Dependency | Required Status | Verification |
|---|---|---|
| P0-001 to P0-024 | Done in Notion | Checked before claiming P0-QA-001. P0-024 was marked Done before this audit started. |

## Inventory Summary

| Result | Count |
|---|---:|
| Required files checked | 28 |
| Present at expected path | 28 |
| Missing | 0 |
| Empty | 0 |
| Wrong path | 0 |
| Misplaced duplicate requiring review | 0 |

## Required Files Inventory

| Task ID | Required File | Exists | Status | Notes |
|---|---|---|---|---|
| P0-001 | `docs/product/vision.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-001 | `docs/product/non-negotiables.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-002 | `docs/product/phase-0-readiness-checklist.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-003 | `docs/product/roles-and-permissions.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-004 | `docs/product/mvp-scope.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-004 | `docs/product/out-of-scope.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-005 | `docs/journeys/student-journey.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-006 | `docs/journeys/parent-journey.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-007 | `docs/journeys/admin-journey.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-007 | `docs/journeys/content-manager-journey.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-008 | `docs/journeys/human-reviewer-journey.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-009 | `docs/learning/english-skill-tree.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-010 | `docs/learning/placement-test-strategy.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-011 | `docs/content/lesson-content-structure.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-012 | `docs/content/question-bank-standards.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-013 | `docs/ai-teacher/behavior-rules.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-015 | `docs/data/session-data-capture.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-016 | `docs/data/initial-data-model.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-017 | `docs/api/api-planning-baseline.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-018 | `docs/mobile/mobile-sitemap.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-019 | `docs/admin/admin-dashboard-sitemap.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-020 | `docs/product/notification-scope.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-021 | `docs/analytics/reports-scope.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-023 | `docs/product/risk-register.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-023 | `docs/product/open-decisions.md` | Yes | Present | Expected path exists and contains planning content. |
| P0-024 | `docs/product/phase-0-final-review.md` | Yes | Present | Expected path exists and contains final review content. |

## Additional Phase 0 Related Files Observed

These files are present in `docs/` but are not required outputs from `docs/tasks/phase_0_task_prompts.md`. They are not counted as missing or wrong-path items for this inventory.

| File | Note |
|---|---|
| `docs/AIM_023_PILOT_READINESS.md` | Legacy or adjacent pilot planning document. |
| `docs/AIM_024_PILOT_OPERATIONS.md` | Legacy or adjacent pilot planning document. |
| `docs/AIM_025_PILOT_ANALYSIS.md` | Legacy or adjacent pilot planning document. |
| `docs/AIM_026_PRODUCTION_HARDENING.md` | Legacy or adjacent production planning document. |
| `docs/AIM_027_CLOUD_DEPLOYMENT.md` | Legacy or adjacent deployment planning document. |
| `docs/AIM_ALGORITHM_TEST_PLAN.md` | Algorithm test planning document outside Phase 0 required-output list. |
| `docs/AIM_VISUAL_DEMO.md` | Visual/demo planning document outside Phase 0 required-output list. |
| `docs/AIM Complete Architecture EN.docx` | Word architecture document outside Phase 0 required-output list. |

## Findings

- No required Phase 0 output file is missing.
- No required Phase 0 output file is empty.
- No required Phase 0 output file is present only at a wrong path.
- Additional non-required documents exist and should be reviewed by P0-QA-002 for duplication or overlap.

## Done Verification

| Check | Result |
|---|---|
| Inventory file created at `docs/quality/phase-0-required-files-inventory.md` | Pass |
| Every Phase 0 required output from `docs/tasks/phase_0_task_prompts.md` checked | Pass |
| Missing, misplaced, empty, and wrong-path files marked | Pass |
| No app/backend runtime code implemented | Pass |
| No Student Web App created | Pass |
| No AIM Engine logic moved into Flutter | Pass |

## Recommendation

P0-QA-001 is ready to mark Done in Notion. The next available task is P0-QA-002, because it depends on P0-QA-001 and should review duplicate or overlapping documents, including the additional Phase 0 related files listed above.
