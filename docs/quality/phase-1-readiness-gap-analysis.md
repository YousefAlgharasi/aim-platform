# AIM Phase 1 Readiness Gap Analysis

## Purpose

This document decides whether AIM Phase 0 documentation is ready to support post-MVP Phase 1 System Foundation work and lists blockers, major gaps, minor gaps, and later work that must be handled before affected implementation starts.

## Scope

This is Phase 0 QA documentation for P0-QA-005.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Database migrations.
- AIM Engine code.
- AI Teacher Gateway code.
- Admin dashboard runtime code.
- A separate Student Web App.

It uses the QA audit files from P0-QA-001 through P0-QA-004 and aligns the readiness verdict with `docs/product/vision.md`.

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
| P0-QA-004 | `docs/quality/phase-0-cross-document-consistency-audit.md` | Present and aligned with current product direction. |
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for product and technical guardrails. |

## Readiness Verdict

| Gate | Verdict |
|---|---|
| Required Phase 0 output files | Ready |
| Content completeness | Ready with follow-up cleanup |
| Duplicate/overlap control | Ready with consolidation follow-up |
| Cross-document consistency | Ready after current wording alignment |
| Completed MVP pilot stack clarity | Ready |
| Post-MVP Phase 1 target stack clarity | Ready |
| Phase 1 start decision | Conditional Go |

Phase 1 may start for system foundation work that respects the current product direction:

- Flutter Mobile learner client.
- NestJS + TypeScript Backend API.
- Python AIM Engine backend service/module.
- Supabase PostgreSQL/Auth as default unless changed by a later documented decision.
- No separate Student Web App.

Affected implementation must still wait where decisions remain conditional, such as parent access, admin depth, deployment topology, exact placement thresholds, exact lesson seed count, and notification scope.

## Gap Classification

| ID | Classification | Gap | Evidence / Source | Required Fix Before Affected Phase 1 Work |
|---|---|---|---|---|
| G-001 | Major | Some docs may still contain stale wording that treats FastAPI as the active Phase 1 Backend API. | Phase 0 audit findings and older API wording. | Keep FastAPI only as completed MVP pilot backend API. Use NestJS + TypeScript for post-MVP Phase 1 Backend API. |
| G-002 | Major | Some docs may still treat Flutter as future, later, or undecided. | Phase 0 audit findings and older mobile/product wording. | State that Flutter Mobile is the approved post-MVP Phase 1 learner client. |
| G-003 | Major | Parent/guardian access is planned but still conditional. | Parent journey, notification scope, roles, and open decisions. | Decide parent access, consent, linking, and data visibility policy before parent auth, reporting, or notification implementation. |
| G-004 | Major | Root-level `AIM_023` through `AIM_027` docs are outside Phase 0 required outputs and may confuse source of truth. | Duplicate content audit and required-files inventory. | Classify as later-phase, archive, or move under a clear pilot/deployment folder in a consolidation task. |
| G-005 | Medium | Readiness checklist may contain stale file paths. | Content completeness audit. | Update paths to match P0-QA-001 canonical inventory if stale paths remain. |
| G-006 | Major | Admin dashboard scope needs Phase 1 foundation versus later production split. | Admin journey, admin sitemap, reports scope. | Label admin modules as Phase 1 foundation, conditional, or later before admin implementation planning. |
| G-007 | Medium | Exact placement test item counts and thresholds remain open. | Placement strategy and open decisions. | Lock thresholds before placement implementation. |
| G-008 | Medium | Exact A1 lesson seed count remains open. | MVP scope, content structure, question standards. | Confirm seed lesson count before content implementation. |
| G-009 | Medium | Notification implementation scope remains conditional. | Notification scope and privacy/safety rules. | Approve notification categories and safe payload rules before implementation. |
| G-010 | Medium | Deployment topology is not finalized. | Open decisions and risk register. | Decide hosting/deployment path for NestJS API, Python AIM Engine, Supabase, and environment secrets before production release. |
| G-011 | Minor | Educational "diagnostic" wording could be misunderstood if used outside safety-boundary context. | Cross-document audit. | Prefer "placement", "learning evidence check", or "behavior signal" in learner-facing copy. |
| G-012 | Later | Word architecture document may contain stale architecture content. | Duplicate content audit. | Manually review, archive, or convert relevant content after higher-priority fixes. |
| G-013 | Later | Repeated guardrail text appears in many docs. | Duplicate content audit. | Add cross-links or index later; do not remove guardrails until consistency is stable. |

## Non-Negotiable Readiness Rules

Phase 1 tasks must preserve:

- AIM Engine logic remains Python/backend-owned.
- Clients must not run, duplicate, approximate, or reimplement AIM Engine logic.
- Clients must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials must never be exposed to clients.
- Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.
- Speed may only be used as educational behavior evidence.
- Learner behavior language must remain educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Safe Phase 1 Work That Can Start

| Workstream | Safe To Start? | Conditions |
|---|---|---|
| Repository and documentation cleanup planning | Yes | Do not delete files without explicit approval. |
| Flutter Mobile project foundation planning | Yes | No AIM calculations in Flutter. Use backend-approved outputs only. |
| NestJS + TypeScript Backend API foundation planning | Yes | Preserve Supabase Auth/PostgreSQL defaults and backend AIM ownership. |
| Python AIM Engine integration planning | Yes | Keep AIM Engine backend-only and Python-owned. |
| Environment/config planning | Yes | Keep provider keys and privileged credentials server-only. |
| Data model planning review | Yes | Do not implement migrations until field naming and privacy rules are confirmed. |
| API contract refinement | Yes | Use backend-owned AIM output contracts and safe response rules. |
| Security/privacy checklist planning | Yes | Enforce backend auth, ownership, audit, and data minimization. |
| Learner-safe progress/report planning | Yes | Do not expose raw AIM internals to students or parents. |

## Phase 1 Work That Must Wait

| Workstream | Wait Reason |
|---|---|
| Parent auth, parent reports, or parent notifications | Blocked until parent access, consent, linking, and visibility rules are explicitly approved. |
| Admin dashboard implementation beyond minimum internal support | Blocked until admin module depth is split into Phase 1 foundation vs later production. |
| Placement implementation | Wait until exact item counts and thresholds are locked. |
| Content implementation beyond seed planning | Wait until exact A1 lesson count and required metadata are confirmed. |
| Notification implementation | Wait until notification categories, payload wording, and user controls are approved. |
| Production deployment | Wait until deployment topology, secrets, and environment plan are defined. |
| Root-level pilot/deployment docs as source of truth | Wait until `AIM_023` through `AIM_027` are classified as later-phase, archive, or active support docs. |

## Go / No-Go Recommendation

| Decision | Recommendation |
|---|---|
| Start Phase 1 System Foundation | Conditional Go |
| Start Flutter Mobile learner foundation | Go, with strict no-AIM-local-logic boundary |
| Start NestJS + TypeScript Backend API foundation | Go, with Supabase/Auth and AIM integration boundaries |
| Start Python AIM Engine integration planning | Go, backend-only |
| Start AIM mastery/difficulty implementation | Go only after no-speed rule is verified in target implementation tasks |
| Start parent feature implementation | No-Go until parent scope and consent/linking/privacy are decided |
| Start admin dashboard implementation | Conditional Go for minimum internal support only |
| Start separate Student Web App | No-Go |
| Start production deployment | No-Go until deployment topology and secrets plan are decided |

## Exact Fixes Required Before Affected Phase 1 Work

1. Verify all active docs separate completed MVP pilot stack from post-MVP Phase 1 stack.
2. Preserve FastAPI only as completed MVP pilot backend API context.
3. Preserve React Web only as completed MVP pilot learner interface context.
4. Preserve Flutter Mobile as the approved post-MVP Phase 1 learner client.
5. Preserve NestJS + TypeScript as the post-MVP Phase 1 Backend API.
6. Preserve Python AIM Engine as backend-owned service/module.
7. Verify no active doc introduces a separate post-MVP Student Web App.
8. Verify speed remains educational behavior evidence only and not a direct mastery, student level, or difficulty signal.
9. Decide parent access before parent implementation.
10. Split admin scope before admin implementation.
11. Lock placement thresholds before placement implementation.
12. Lock seed lesson count before content implementation.
13. Classify root-level `AIM_023` through `AIM_027` docs as later-phase, archive, or active support docs.
14. Verify no Markdown docs contain unresolved merge conflict markers.

## Verification Commands

Run after all wording updates are complete:

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

This readiness analysis does not:

- Rewrite runtime code.
- Create implementation tasks directly.
- Resolve deployment topology.
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
- Parent access is conditional.
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
- `docs/quality/phase-0-duplicate-content-audit.md`
- `docs/quality/phase-0-content-completeness-audit.md`
- `docs/quality/phase-0-cross-document-consistency-audit.md`

## Done Verification

| Check | Result |
|---|---|
| Readiness gap analysis updated at `docs/quality/phase-1-readiness-gap-analysis.md` | Pass |
| Issues classified as Major, Medium, Minor, or Later | Pass |
| Phase 1 start verdict included | Pass |
| Go/no-go recommendation included | Pass |
| Exact fixes before affected Phase 1 work listed | Pass |
| Completed MVP pilot stack and post-MVP Phase 1 stack separated | Pass |
| No runtime source code implemented | Pass |
| No separate Student Web App created | Pass |
| No AIM Engine logic moved into Flutter Mobile, React Web, admin UI, or any other client | Pass |

## Recommendation

P0-QA-005 remains valid after wording alignment. P0-QA-006 should use this analysis and the prior QA audits to maintain a concrete consolidation fix plan that reflects the current product direction.
