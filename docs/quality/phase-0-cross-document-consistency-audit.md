# AIM Phase 0 Cross-Document Consistency Audit

## Purpose

This document audits Phase 0 planning documents for contradictions across MVP scope, roles, journeys, learning data, data model, API planning, AI Teacher rules, AIM Engine contract, notifications, analytics, and safety rules.

## Scope

This is a Phase 0 QA document for task P0-QA-004. It identifies contradictions, affected files, expected resolution, severity, and recommended owner or follow-up task. It does not rewrite source documents, implement app/backend code, create a Student Web App, or move AIM Engine logic into Flutter.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-QA-001 | `docs/quality/phase-0-required-files-inventory.md` | Present and marked Done in Notion before this audit started. |
| P0-QA-003 | `docs/quality/phase-0-content-completeness-audit.md` | Present and marked Done in Notion before this audit started. |

## Summary

| Result | Count |
|---|---:|
| Major consistency issues found | 8 |
| Critical / blocker issues | 1 |
| High severity issues | 2 |
| Medium severity issues | 4 |
| Low severity issues | 1 |

Phase 0 is mostly consistent at the product-rule level. The main blocker is the no-speed mastery contradiction. Other issues are cleanup or product-decision gaps: stale paths, mobile versus React web wording, parent feature conditionality, and old root-level pilot/deployment documents that may be mistaken for active Phase 0 outputs.

## Consistency Findings

| ID | Severity | Contradiction / Inconsistency | Affected Files | Expected Resolution | Recommended Owner / Task |
|---|---|---|---|---|---|
| X-001 | Critical | Speed is both forbidden from mastery and described as a mastery component. Most docs say response time/speed must not affect mastery, student level, or direct difficulty increase. `docs/data/session-data-capture.md` says "Average Speed metric (one of five mastery formula components, weighted 15%)." `docs/security/ai-safety-privacy-rules.md` says "Speed contributes only the Speed component (15% weight)." | `docs/product/non-negotiables.md`; `docs/product/vision.md`; `docs/product/out-of-scope.md`; `docs/journeys/student-journey.md`; `docs/data/session-data-capture.md`; `docs/security/ai-safety-privacy-rules.md`; `docs/product/phase-0-final-review.md` | Canonical rule: response time, average response time, and speed score must not affect mastery, student level, or direct difficulty increase. Rewrite the two contradictory lines to say speed is behavioral evidence only. | Product / AIM Lead; required before AIM mastery/difficulty implementation. |
| X-002 | High | Readiness checklist uses stale file paths that do not match the actual Phase 0 prompt outputs or local files. Examples include `docs/content/english-skill-tree.md`, `docs/content/placement-diagnostic-rules.md`, `docs/ai/ai-teacher-behavior-rules.md`, and `docs/ai/aim-engine-io-contract.md`, while canonical outputs are under `docs/learning/`, `docs/ai-teacher/`, and `docs/aim-engine/`. | `docs/product/phase-0-readiness-checklist.md`; `docs/tasks/phase_0_task_prompts.md`; `docs/quality/phase-0-required-files-inventory.md` | Update checklist paths to match the prompt file and P0-QA-001 inventory. | Documentation Owner; cleanup task. |
| X-003 | High | First pilot is repeatedly defined as React web/cloud, but several docs frame mobile/Flutter as the primary client surface without consistently marking it future or conditional. This creates implementation-scope ambiguity even though the product vision excludes Flutter from the first pilot. | `docs/product/vision.md`; `docs/product/out-of-scope.md`; `docs/mobile/mobile-sitemap.md`; `docs/analytics/reports-scope.md`; `docs/aim-engine/boundary-and-io-contract.md`; `docs/api/api-planning-baseline.md`; `docs/product/open-decisions.md`; `docs/product/phase-0-final-review.md` | Standardize wording: first pilot client is React web; Flutter/mobile docs are future planning unless explicitly approved. Use "client" or "future Flutter client" where the surface is not first-pilot-specific. | Product Owner / Documentation Owner; blocks broad frontend task scoping. |
| X-004 | Medium | Parent/guardian role is documented as conditional, but parent journey, reports, notifications, and analytics include enough detail that a reader could assume parent access is in MVP. | `docs/product/roles-and-permissions.md`; `docs/journeys/parent-journey.md`; `docs/analytics/reports-scope.md`; `docs/product/notification-scope.md`; `docs/product/out-of-scope.md`; `docs/product/open-decisions.md`; `docs/product/phase-0-final-review.md` | Add a clear banner or status note to parent-specific docs: "Conditional MVP; do not implement until parent access, consent, and linking are approved." | Product Owner; required before parent auth/reporting/notification tasks. |
| X-005 | Medium | Admin dashboard depth is planned in detail, but MVP scope repeatedly warns against broad institute/admin expansion. The sitemap could be interpreted as more than pilot operations without a stricter MVP/future split. | `docs/product/mvp-scope.md`; `docs/product/out-of-scope.md`; `docs/journeys/admin-journey.md`; `docs/admin/admin-dashboard-sitemap.md`; `docs/product/risk-register.md`; `docs/product/open-decisions.md` | Mark admin modules as MVP pilot, conditional, or future. Keep Phase 1 admin scope limited to pilot operations and QA visibility. | Product / Admin Lead; before admin implementation planning. |
| X-006 | Medium | "Diagnostic" appears in educational placement context, while safety rules also prohibit clinical/diagnostic learner labels. This is not a direct contradiction if "diagnostic" means educational placement, but the vocabulary could confuse contributors. | `docs/journeys/student-journey.md`; `docs/learning/placement-test-strategy.md`; `docs/product/non-negotiables.md`; `docs/security/ai-safety-privacy-rules.md`; `docs/analytics/reports-scope.md` | Prefer "placement" or "learning evidence check" in learner-facing contexts. Reserve "diagnostic" only for internal educational assessment and explicitly distinguish it from clinical diagnosis. | Product / Learning Design; copy cleanup. |
| X-007 | Medium | Root-level docs `AIM_023` through `AIM_027` look like active implementation/pilot/deployment tasks, but they are not part of the Phase 0 required prompt outputs. Their numbering overlaps conceptually with P0-023/P0-024 and can confuse task status/source of truth. | `docs/AIM_023_PILOT_READINESS.md`; `docs/AIM_024_PILOT_OPERATIONS.md`; `docs/AIM_025_PILOT_ANALYSIS.md`; `docs/AIM_026_PRODUCTION_HARDENING.md`; `docs/AIM_027_CLOUD_DEPLOYMENT.md`; `docs/tasks/phase_0_task_prompts.md`; `docs/quality/phase-0-duplicate-content-audit.md` | Classify these as later-phase docs, archive them, or move them under a clear `docs/pilot/` or `docs/deployment/` path. Do not treat them as Phase 0 required outputs. | Project Lead / Documentation Owner; consolidation plan. |
| X-008 | Low | Several docs use "mobile app progress screen" or "Flutter client" in reporting/API/AIM contexts where a React web first pilot is the approved direction. The intent is usually "client surface", but wording is inconsistent. | `docs/analytics/reports-scope.md`; `docs/api/api-planning-baseline.md`; `docs/aim-engine/boundary-and-io-contract.md`; `docs/mobile/mobile-sitemap.md` | Use neutral "client app" wording for shared contracts, and mention React web first / Flutter later when platform matters. | Documentation Owner; editorial cleanup. |

## Canonical Rules To Preserve

| Topic | Canonical Rule | Primary Source |
|---|---|---|
| Mastery fairness | Speed and response time must not affect mastery, student level, or direct difficulty increase. | `docs/product/non-negotiables.md` |
| Pilot platform | First pilot is React web, FastAPI, Supabase PostgreSQL, and Supabase Auth. | `docs/product/vision.md` |
| AIM Engine location | AIM algorithm logic stays in Python/backend. Clients consume outputs only. | `docs/product/non-negotiables.md` |
| Safety language | Learner behavior language must remain educational, not clinical or diagnostic. | `docs/security/ai-safety-privacy-rules.md` |
| Phase 0 boundary | Phase 0 is documentation and planning only. | `docs/tasks/phase_0_task_prompts.md` |
| Credential safety | AI provider keys and privileged credentials remain backend/server-only. | `docs/product/non-negotiables.md` |

## Prioritized Resolution Plan

| Priority | Issue IDs | Required Action |
|---|---|---|
| P0 | X-001 | Fix speed/mastery contradictions before AIM mastery, difficulty, recommendation, or safety implementation begins. |
| P0 | X-003 | Confirm frontend vehicle for Phase 1 task creation: React web first, Flutter later unless explicitly changed. |
| P1 | X-002 | Correct stale file paths in the readiness checklist so it matches canonical output paths. |
| P1 | X-004 | Decide parent MVP inclusion before parent-specific implementation. |
| P1 | X-005 | Split admin dashboard modules into MVP pilot versus future. |
| P1 | X-007 | Classify or move root-level later-phase docs to avoid task/source-of-truth confusion. |
| P2 | X-006, X-008 | Clean up terminology and client wording for consistency. |

## Done Verification

| Check | Result |
|---|---|
| Audit created at `docs/quality/phase-0-cross-document-consistency-audit.md` | Pass |
| Contradictions and inconsistencies listed | Pass |
| Affected files identified | Pass |
| Expected resolution included | Pass |
| Severity and owner/task included | Pass |
| Source documents were not rewritten | Pass |
| No app/backend runtime code implemented | Pass |
| No Student Web App created | Pass |
| No AIM Engine logic moved into Flutter | Pass |

## Recommendation

P0-QA-004 is ready to mark Done in Notion. The next available task is P0-QA-005, because it depends on P0-QA-002, P0-QA-003, and P0-QA-004 and should convert these findings into a Phase 1 readiness verdict.
