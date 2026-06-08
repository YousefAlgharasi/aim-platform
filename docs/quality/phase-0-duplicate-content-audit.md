# AIM Phase 0 Duplicate Content Audit

## Purpose

This document audits the AIM `docs/` folder for duplicate files, repeated document purposes, old versus new versions, and overlapping content that should be consolidated before Phase 1.

## Scope

This is a Phase 0 QA document for task P0-QA-002. It reviews planning documents only and recommends keep, merge, rename, or delete candidates. It does not delete files, rewrite source documents, implement app/backend code, create a Student Web App, or move AIM Engine logic into Flutter.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-QA-001 | `docs/quality/phase-0-required-files-inventory.md` | Present and marked Done in Notion before this audit started. |

## Executive Summary

| Finding Type | Count | Highest Severity |
|---|---:|---|
| Likely duplicate or overlapping document groups | 8 | High |
| Required Phase 0 files that should be kept | 28 | None |
| Non-required root-level documents needing classification | 8 | High |
| Files recommended for immediate deletion | 0 | None |

No file should be deleted by this task. The safest cleanup path is to keep the required Phase 0 files as canonical, classify root-level non-required docs as post-Phase-0 or legacy, and then decide whether to move/archive them in a separate consolidation task.

## Duplicate and Overlap Groups

| Group | Files Involved | Severity | Recommendation | Rationale |
|---|---|---|---|---|
| D-001 Phase 0 lock and readiness review | `docs/product/phase-0-readiness-checklist.md`; `docs/product/phase-0-final-review.md`; `docs/quality/phase-0-required-files-inventory.md` | Medium | Keep all. Add clear cross-links in a cleanup task if needed. | These files have related but distinct purposes: readiness criteria, final go/no-go review, and required-file inventory. Some checklist and inventory tables overlap by design. |
| D-002 Product scope boundaries | `docs/product/vision.md`; `docs/product/mvp-scope.md`; `docs/product/out-of-scope.md`; `docs/product/non-negotiables.md`; `docs/product/open-decisions.md` | Medium | Keep all as canonical Phase 0 product set. Avoid merging. | The documents repeat core rules such as web/cloud pilot first, no Student Web App, no AIM logic in Flutter, and no provider keys in clients. This overlap is intentional but should remain consistent. |
| D-003 Admin and content operations | `docs/journeys/admin-journey.md`; `docs/journeys/content-manager-journey.md`; `docs/admin/admin-dashboard-sitemap.md` | Medium | Keep all. Treat journey docs as workflow sources and sitemap as interface/module scope. | Admin/content manager responsibilities overlap with dashboard modules, but they are different planning layers. Consolidation should be limited to cross-references, not file removal. |
| D-004 AI safety and AI teacher behavior | `docs/product/non-negotiables.md`; `docs/ai-teacher/behavior-rules.md`; `docs/security/ai-safety-privacy-rules.md`; `docs/data/session-data-capture.md`; `docs/analytics/reports-scope.md` | High | Keep all, but run a consistency fix task before affected implementation. | These files intentionally repeat educational-only safety rules. However, the final review identified a contradiction in `docs/security/ai-safety-privacy-rules.md` about speed contributing to mastery. Canonical rule: speed must not affect mastery, level, or direct difficulty increase. |
| D-005 AIM Engine, data, and API boundary | `docs/aim-engine/boundary-and-io-contract.md`; `docs/data/session-data-capture.md`; `docs/data/initial-data-model.md`; `docs/api/api-planning-baseline.md` | Medium | Keep all. Use the AIM Engine contract as canonical for adaptive IO and the API baseline as route planning. | These documents naturally repeat session fields, adaptive output names, and backend-owned AIM boundaries. The overlap is useful but needs consistency review in P0-QA-004. |
| D-006 Mobile, React web, and pilot vehicle | `docs/product/vision.md`; `docs/product/mvp-scope.md`; `docs/mobile/mobile-sitemap.md`; `docs/product/open-decisions.md`; `docs/product/phase-0-final-review.md` | High | Keep all, but clarify status labels. Mobile sitemap should remain future/planning unless product owner explicitly brings Flutter into MVP. | The project direction says React web/cloud first, while mobile planning exists. This is not a duplicate file problem, but it is an overlapping product-scope concern. |
| D-007 Root-level pilot lifecycle docs | `docs/AIM_023_PILOT_READINESS.md`; `docs/AIM_024_PILOT_OPERATIONS.md`; `docs/AIM_025_PILOT_ANALYSIS.md`; `docs/AIM_026_PRODUCTION_HARDENING.md`; `docs/AIM_027_CLOUD_DEPLOYMENT.md` | High | Do not delete now. Classify as post-Phase-0 / later-phase docs or move under a future `docs/pilot/` or `docs/deployment/` structure in a consolidation task. | These files overlap with Phase 0 product, API, analytics, operations, deployment, and readiness concepts but are not required Phase 0 outputs. Their numbering may be confused with P0-023/P0-024 and should be clarified. |
| D-008 Demo and algorithm validation docs | `docs/AIM_VISUAL_DEMO.md`; `docs/AIM_ALGORITHM_TEST_PLAN.md`; `docs/aim-engine/boundary-and-io-contract.md`; `docs/api/api-planning-baseline.md` | Medium | Keep as algorithm/demo support docs, but label them outside Phase 0 required outputs. | These files support algorithm testing and demo flows. They overlap with API/AIM Engine boundary topics but are not duplicates of Phase 0 planning docs. |
| D-009 Word architecture document | `docs/AIM Complete Architecture EN.docx`; Phase 0 canonical Markdown docs | Medium | Manual review required. If it contains old architecture decisions, archive or convert relevant current content to Markdown. | The `.docx` content was not compared deeply in this Markdown audit. Its root-level placement and broad architecture title create potential old-versus-new duplication risk. |

## Canonical Keep List

The following required Phase 0 documents should remain canonical and should not be deleted or merged without explicit team approval:

| Area | Canonical Files |
|---|---|
| Product | `docs/product/vision.md`; `docs/product/non-negotiables.md`; `docs/product/mvp-scope.md`; `docs/product/out-of-scope.md`; `docs/product/phase-0-readiness-checklist.md`; `docs/product/notification-scope.md`; `docs/product/risk-register.md`; `docs/product/open-decisions.md`; `docs/product/phase-0-final-review.md` |
| Roles and journeys | `docs/product/roles-and-permissions.md`; `docs/journeys/student-journey.md`; `docs/journeys/parent-journey.md`; `docs/journeys/admin-journey.md`; `docs/journeys/content-manager-journey.md`; `docs/journeys/human-reviewer-journey.md` |
| Learning/content | `docs/learning/english-skill-tree.md`; `docs/learning/placement-test-strategy.md`; `docs/content/lesson-content-structure.md`; `docs/content/question-bank-standards.md` |
| AI/AIM/data/API | `docs/ai-teacher/behavior-rules.md`; `docs/aim-engine/boundary-and-io-contract.md`; `docs/data/session-data-capture.md`; `docs/data/initial-data-model.md`; `docs/api/api-planning-baseline.md`; `docs/security/ai-safety-privacy-rules.md` |
| Interfaces/reporting | `docs/mobile/mobile-sitemap.md`; `docs/admin/admin-dashboard-sitemap.md`; `docs/analytics/reports-scope.md` |
| QA outputs | `docs/quality/phase-0-required-files-inventory.md`; `docs/quality/phase-0-duplicate-content-audit.md` |

## Files Recommended for Later Classification

| File | Recommended Classification | Reason |
|---|---|---|
| `docs/AIM_023_PILOT_READINESS.md` | Post-Phase-0 pilot planning | Overlaps with readiness and pilot scope, but appears later-phase. |
| `docs/AIM_024_PILOT_OPERATIONS.md` | Post-Phase-0 pilot operations | Operational runbook, not Phase 0 required output. |
| `docs/AIM_025_PILOT_ANALYSIS.md` | Post-Phase-0 pilot analysis | Analysis closeout plan, not Phase 0 required output. |
| `docs/AIM_026_PRODUCTION_HARDENING.md` | Later production hardening | Overlaps with deployment/security scope, but belongs after pilot validation. |
| `docs/AIM_027_CLOUD_DEPLOYMENT.md` | Later deployment package | Contains implementation/deployment assets and should not be confused with Phase 0 planning. |
| `docs/AIM_ALGORITHM_TEST_PLAN.md` | Algorithm validation support | Useful, but outside Phase 0 required-output list. |
| `docs/AIM_VISUAL_DEMO.md` | Demo support | Useful, but outside Phase 0 required-output list. |
| `docs/AIM Complete Architecture EN.docx` | Architecture archive/manual review | Potential old architecture duplicate; needs human review or conversion decision. |

## Boilerplate Overlap

Many Phase 0 docs repeat these rules:

- No runtime source code in Phase 0.
- No Student Web App.
- No AIM Engine logic in Flutter.
- AI provider keys remain backend-only.
- Learner behavior language remains educational and non-diagnostic.

This repetition is intentional and should not be treated as duplicate content requiring deletion. It is useful guardrail text as long as the wording stays consistent.

## Recommended Cleanup Plan

| Priority | Action | Owner |
|---|---|---|
| P0 | Correct the speed/mastery contradiction in `docs/security/ai-safety-privacy-rules.md`. | Product / AIM Lead |
| P0 | Decide whether root-level `AIM_023` through `AIM_027` docs are active later-phase docs or legacy artifacts. | Project Lead |
| P1 | Add a short "Canonical Phase 0 Docs" index or section that points to the required Markdown outputs. | Documentation Owner |
| P1 | Move or relabel non-required root-level docs so they are not mistaken for Phase 0 required outputs. | Documentation Owner |
| P1 | Manually review `docs/AIM Complete Architecture EN.docx` for stale decisions and decide whether to archive or convert. | Project Lead |
| P2 | Add cross-reference links between overlapping canonical docs instead of duplicating long explanatory sections. | Documentation Owner |

## Done Verification

| Check | Result |
|---|---|
| Audit created at `docs/quality/phase-0-duplicate-content-audit.md` | Pass |
| Duplicate groups listed | Pass |
| Files involved, severity, recommendation, and rationale included | Pass |
| No files deleted | Pass |
| No app/backend runtime code implemented | Pass |
| No Student Web App created | Pass |
| No AIM Engine logic moved into Flutter | Pass |

## Recommendation

P0-QA-002 is ready to mark Done in Notion. The next available task is P0-QA-003, because it depends on P0-QA-001 and should evaluate content completeness against the original prompts.
