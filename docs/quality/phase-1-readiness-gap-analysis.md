# AIM Phase 1 Readiness Gap Analysis

## Purpose

This document decides whether AIM Phase 0 documentation is ready to support Phase 1 System Foundation work and lists the blockers, major gaps, minor gaps, and later work that must be handled.

## Scope

This is a Phase 0 QA document for task P0-QA-005. It uses the QA audit files from P0-QA-001 through P0-QA-004. It does not rewrite source documents, implement app/backend code, create a Student Web App, or move AIM Engine logic into Flutter.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-QA-002 | `docs/quality/phase-0-duplicate-content-audit.md` | Present and marked Done in Notion before this task started. |
| P0-QA-003 | `docs/quality/phase-0-content-completeness-audit.md` | Present and marked Done in Notion before this task started. |
| P0-QA-004 | `docs/quality/phase-0-cross-document-consistency-audit.md` | Present and marked Done in Notion before this task started. |

## Readiness Verdict

| Gate | Verdict |
|---|---|
| Required Phase 0 output files | Ready |
| Content completeness | Mostly ready |
| Duplicate/overlap control | Needs cleanup plan |
| Cross-document consistency | Not fully ready for affected implementation |
| Phase 1 start decision | Conditional Go |

Phase 1 may start only for foundation work that does not depend on unresolved contradictions or product-scope decisions. AIM mastery, difficulty adaptation, parent-specific implementation, and broad frontend task creation must wait for the required fixes listed below.

## Gap Classification

| ID | Classification | Gap | Evidence | Required Fix Before Phase 1 |
|---|---|---|---|---|
| G-001 | Blocker | Speed is documented both as forbidden from mastery and as a mastery component. | P0-QA-003 C-001; P0-QA-004 X-001; `docs/product/phase-0-final-review.md` FR-001. | Correct `docs/data/session-data-capture.md` and `docs/security/ai-safety-privacy-rules.md` so speed is behavioral evidence only. Required before AIM mastery/difficulty implementation. |
| G-002 | Major | First pilot frontend vehicle is not consistently worded across all docs. React web/cloud is canonical, while several docs emphasize Flutter/mobile. | P0-QA-002 D-006; P0-QA-003 C-003; P0-QA-004 X-003 and X-008. | Confirm React web/cloud first in Phase 1 task creation; relabel Flutter docs as future planning unless explicitly approved. |
| G-003 | Major | Parent/guardian access is planned but still conditional. | P0-QA-003 C-004; P0-QA-004 X-004; `docs/product/open-decisions.md` OD-002 and OD-020. | Decide parent access, consent, and linking policy before parent auth, reporting, or notification work. |
| G-004 | Major | Root-level `AIM_023` through `AIM_027` docs are outside Phase 0 required outputs and may confuse source of truth. | P0-QA-001 additional files; P0-QA-002 D-007; P0-QA-004 X-007. | Classify as later-phase, archive, or move under a clear pilot/deployment folder in a consolidation task. |
| G-005 | Major | Readiness checklist contains stale file paths. | P0-QA-003 C-002; P0-QA-004 X-002. | Update paths to match P0-QA-001 canonical inventory. |
| G-006 | Major | Admin dashboard scope needs MVP/future split. | P0-QA-003 C-005; P0-QA-004 X-005. | Label modules as MVP pilot, conditional, or future before admin implementation planning. |
| G-007 | Minor | Educational "diagnostic" wording could be confused with forbidden clinical diagnosis. | P0-QA-004 X-006. | Prefer "placement" or "learning evidence check" in learner-facing docs and copy. |
| G-008 | Minor | Open decisions remain across provider, language mix, analytics depth, notification controls, and retention. | P0-QA-003 C-006; `docs/product/open-decisions.md`. | Keep open decisions visible and convert implementation-critical decisions into Phase 1 tasks. |
| G-009 | Later | Word architecture document may contain stale architecture content. | P0-QA-002 D-009. | Manually review, archive, or convert relevant content after higher-priority fixes. |
| G-010 | Later | Long repeated guardrail text appears in many docs. | P0-QA-002 boilerplate overlap. | Add cross-links or an index later; do not remove guardrails until consistency is stable. |

## Safe Phase 1 Work That Can Start

| Workstream | Safe To Start? | Conditions |
|---|---|---|
| Repository/document cleanup planning | Yes | Do not delete files without explicit approval. |
| Backend foundation planning | Yes | Preserve AIM backend ownership and no-speed mastery rule. |
| Environment/config planning | Yes | Keep provider keys and privileged credentials server-only. |
| Data model planning review | Yes | Do not implement migrations until field naming and privacy rules are confirmed. |
| API contract refinement | Yes | Use backend-owned AIM output contracts and safe response rules. |

## Phase 1 Work That Must Wait

| Workstream | Wait Reason |
|---|---|
| AIM mastery and difficulty implementation | Blocked by G-001 speed/mastery contradiction. |
| Parent auth, parent reports, or parent notifications | Blocked by G-003 parent scope and consent decision. |
| Broad frontend buildout | Blocked by G-002 unless React web/cloud is explicitly locked for Phase 1. |
| Admin dashboard implementation beyond pilot operations | Blocked by G-006 admin scope split. |
| Deployment/pilot operations implementation based on root-level docs | Blocked by G-004 classification of non-required docs. |

## Go / No-Go Recommendation

| Decision | Recommendation |
|---|---|
| Start Phase 1 System Foundation | Conditional Go |
| Start AIM adaptive implementation | No-Go until G-001 is fixed |
| Start parent feature implementation | No-Go until G-003 is decided |
| Start React web pilot frontend | Go only after G-002 is explicitly confirmed as React web/cloud first |
| Start Flutter/mobile implementation | No-Go unless product owner changes MVP vehicle |

## Exact Fixes Required Before Affected Phase 1 Work

1. Remove the two speed-as-mastery statements from `docs/data/session-data-capture.md` and `docs/security/ai-safety-privacy-rules.md`.
2. Update `docs/product/phase-0-readiness-checklist.md` stale paths to match `docs/quality/phase-0-required-files-inventory.md`.
3. Add or preserve clear status language that React web/cloud is first pilot and Flutter is later/future planning.
4. Decide whether parent access is MVP or deferred before any parent-specific implementation task.
5. Split admin dashboard items into MVP pilot, conditional, and future.
6. Classify root-level `AIM_023` through `AIM_027` docs as later-phase or legacy.

## Done Verification

| Check | Result |
|---|---|
| Readiness gap analysis created at `docs/quality/phase-1-readiness-gap-analysis.md` | Pass |
| Issues classified as Blocker, Major, Minor, or Later | Pass |
| Phase 1 start verdict included | Pass |
| Go/no-go recommendation included | Pass |
| Exact fixes before Phase 1 listed | Pass |
| Source documents were not rewritten | Pass |
| No app/backend runtime code implemented | Pass |
| No Student Web App created | Pass |
| No AIM Engine logic moved into Flutter | Pass |

## Recommendation

P0-QA-005 is ready to mark Done in Notion. P0-QA-006 should use this analysis and the prior QA audits to create a concrete consolidation fix plan.
