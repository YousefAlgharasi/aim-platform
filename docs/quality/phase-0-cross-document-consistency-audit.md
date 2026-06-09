# AIM Phase 0 Cross-Document Consistency Audit

## Purpose

This document audits active Phase 0 planning documents for cross-document contradictions, stale wording, duplicated assumptions, stack confusion, and scope conflicts before Phase 1 implementation planning proceeds.

## Scope

This is Phase 0 QA documentation only.

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
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for product and technical rules. |

## Audit Method

1. Use `docs/product/vision.md` as the primary source of truth.
2. Compare active Phase 0 planning documents against the confirmed product direction.
3. Identify contradictions, stale references, vague wording, and unsafe wording.
4. Classify each issue by severity.
5. Recommend exact cleanup action.
6. Preserve completed MVP pilot context while clarifying post-MVP Phase 1 direction.

## Severity Guide

| Severity | Meaning |
|---|---|
| Critical | Could cause unsafe behavior, security exposure, or wrong implementation architecture. |
| High | Could cause Phase 1 tasks to implement the wrong stack, wrong client, or wrong AIM boundary. |
| Medium | Could create confusion, duplicated work, or planning drift. |
| Low | Editorial cleanup or minor wording inconsistency. |

## Executive Summary

Phase 0 documents are broadly aligned after cleanup, but the main consistency requirement is to keep the completed MVP pilot stack separate from the post-MVP Phase 1 target stack.

The canonical direction is:

- React Web and FastAPI are completed MVP pilot context.
- Flutter Mobile and NestJS + TypeScript are post-MVP Phase 1 direction.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless changed by a later documented decision.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- Clients must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
- Speed must not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language must remain educational, non-clinical, non-medical, and non-diagnostic.

## Consistency Findings

| ID | Severity | Area | Finding | Required Fix |
|---|---|---|---|---|
| X-001 | High | Stack direction | Some older docs may describe FastAPI as the active Phase 1 Backend API. | Preserve FastAPI only as completed MVP pilot backend API. Use NestJS + TypeScript for post-MVP Phase 1 Backend API. |
| X-002 | High | Learner client | Some older docs may describe Flutter as merely future, later, or undecided. | State that Flutter Mobile is the approved post-MVP Phase 1 learner client. |
| X-003 | High | Student Web App | Some wording may imply a future Student Web App after the React Web pilot. | State that no separate Student Web App is planned for post-MVP unless a later documented product decision changes this. |
| X-004 | Critical | AIM boundary | Any wording that allows clients to calculate AIM outputs conflicts with non-negotiables. | Keep mastery, level, weakness, difficulty, retention, and recommendations backend-owned. |
| X-005 | Critical | AI Gateway / credentials | Any wording that allows client-side AI provider calls or client-held keys is unsafe. | Keep AI Teacher Gateway backend-only and secrets server-only. |
| X-006 | Critical | Speed fairness | Any wording that makes speed a direct mastery, student level, or difficulty factor is unsafe. | Speed may only be educational behavior evidence. |
| X-007 | Critical | Safety language | Any clinical, medical, diagnostic, or shame-based learner label is unsafe. | Use educational, non-clinical, non-medical, non-diagnostic language only. |
| X-008 | Medium | Reporting surfaces | Some reports may say "mobile" without specifying Phase 1 Flutter Mobile or historical React Web context. | Use clear client wording: Flutter Mobile for Phase 1; React Web only for completed pilot context. |
| X-009 | Medium | Admin scope | Admin/internal views may be confused with learner-facing surfaces. | Keep admin/internal support role-scoped and not a Student Web App. |
| X-010 | Medium | Parent scope | Parent access appears in several docs but remains conditional. | Keep parent access conditional until consent, linking, privacy, and visibility rules are approved. |

## Canonical Wording Rules

Use these phrases consistently across active Phase 0 and Phase 1 planning docs.

| Topic | Canonical Wording |
|---|---|
| Completed MVP pilot stack | The completed MVP pilot used React Web as the learner interface, FastAPI as the backend API, Python backend AIM Engine, Supabase PostgreSQL, and Supabase Auth. |
| Post-MVP learner client | Flutter Mobile is the approved post-MVP Phase 1 learner client. |
| Post-MVP Backend API | NestJS + TypeScript is the post-MVP Phase 1 Backend API. |
| AIM Engine | Python AIM Engine remains backend-owned as a backend service/module. |
| Database/auth | Supabase PostgreSQL/Auth remain the default unless changed by a later documented decision. |
| Student Web App | No separate Student Web App is planned for post-MVP unless a later documented product decision changes this. |
| Client boundary | Clients must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally. |
| AI Teacher Gateway | AI Teacher Gateway remains backend-only. |
| Secrets | AI provider keys and privileged backend credentials must never be exposed to clients. |
| Speed | Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase. |
| Speed evidence | Speed may only be used as educational behavior evidence. |
| Safety language | Learner behavior language must remain educational, non-clinical, non-medical, and non-diagnostic. |
| Phase 0 | Phase 0 is planning/documentation only and does not implement runtime code. |

## Files Requiring Wording Alignment

| File | Main Risk | Required Direction |
|---|---|---|
| `docs/product/non-negotiables.md` | Stack and client wording must stay strict. | Preserve hard rules and current product direction. |
| `docs/product/mvp-scope.md` | Completed MVP pilot may be confused with Phase 1. | Keep React Web/FastAPI historical and Flutter/NestJS Phase 1. |
| `docs/product/out-of-scope.md` | Flutter may be wrongly treated as out of scope after MVP. | Clarify Flutter was out of completed MVP pilot but in post-MVP Phase 1. |
| `docs/product/risk-register.md` | Risks may mention old unresolved mobile decision. | Treat Flutter Mobile Phase 1 as decided. |
| `docs/product/open-decisions.md` | Old OD items may still show learner client/API stack as open. | Mark Flutter Mobile and NestJS + TypeScript as decided. |
| `docs/product/phase-0-final-review.md` | Old final review may block frontend due to unresolved stack decision. | Mark stack direction resolved by `vision.md`. |
| `docs/api/api-planning-baseline.md` | May show FastAPI as active Phase 1 API. | Use NestJS + TypeScript for Phase 1; FastAPI as completed pilot only. |
| `docs/mobile/mobile-sitemap.md` | May call Flutter future/undecided. | Flutter Mobile is approved Phase 1 learner client. |
| `docs/aim-engine/boundary-and-io-contract.md` | May speak only about Flutter or only about same-process backend. | Use all-clients boundary and Python backend service/module wording. |
| `docs/analytics/reports-scope.md` | May say MVP/mobile without clarifying Phase 1 Flutter. | Clarify reporting surfaces and no Student Web App. |
| `docs/quality/phase-1-readiness-gap-analysis.md` | May carry old readiness blockers. | Update gaps to current product direction. |
| `docs/quality/phase-0-consolidation-fix-plan.md` | May recommend old React-first/Flutter-future wording. | Update fix plan to current product direction. |
| `docs/quality/phase-0-final-quality-gate.md` | May preserve old accepted risk about Flutter. | Update final gate to current product direction. |

## Cross-Document Rules by Domain

### Product Documents

Product docs must:

- Preserve completed MVP pilot context.
- Separate completed pilot from post-MVP Phase 1.
- Avoid introducing a separate Student Web App.
- Keep parent access conditional.
- Keep admin/internal surfaces distinct from learner-facing surfaces.

### API Documents

API docs must:

- Use NestJS + TypeScript for post-MVP Phase 1 Backend API.
- Preserve FastAPI only as completed MVP pilot context.
- Keep AIM Engine backend-internal.
- Keep AI Teacher Gateway backend-only.
- Keep Supabase JWT validation backend-side.
- Prevent clients from computing AIM state locally.

### Mobile Documents

Mobile docs must:

- Describe Flutter Mobile as approved post-MVP Phase 1 learner client.
- Avoid language that makes Flutter undecided.
- Keep Flutter as a display/interaction client only.
- Prevent local AIM logic.
- Use backend-approved progress, recommendations, and feedback only.

### AIM Engine Documents

AIM Engine docs must:

- Keep AIM Engine Python/backend-owned.
- Define input/output boundaries clearly.
- Preserve no-speed mastery and difficulty rules.
- Keep recommendation authority backend-owned.
- Keep emotional/behavioral signals educational and non-diagnostic.

### Analytics Documents

Analytics docs must:

- Keep learner-facing analytics safe and simple.
- Avoid raw AIM internals for students/parents.
- Use speed only as internal educational behavior evidence.
- Keep admin reports role-restricted and privacy-aware.
- Avoid clinical, medical, or diagnostic labels.

### Security Documents

Security docs must:

- Keep AI provider keys and privileged credentials server-only.
- Keep AI Teacher Gateway backend-only.
- Protect student privacy and ownership boundaries.
- Avoid exposing raw sensitive learner data in notifications or reports.
- Preserve audit rules for admin/internal actions.

## Cleanup Priority

| Priority | Work |
|---|---|
| P0 | Remove conflict markers from QA documents. |
| P0 | Align stack wording with `docs/product/vision.md`. |
| P0 | Clarify completed MVP pilot versus post-MVP Phase 1 across product/API/mobile/AIM docs. |
| P0 | Preserve no-speed mastery and difficulty rules. |
| P0 | Preserve backend-only AI Gateway and secrets rules. |
| P1 | Align reporting/admin/parent conditional wording. |
| P1 | Convert remaining open implementation choices into Phase 1 tasks. |
| P2 | Classify root-level legacy or later-phase docs if they still create confusion. |

## Verification Commands

Run these after all wording updates are complete:

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

This audit does not:

- Rewrite runtime code.
- Create implementation tasks.
- Resolve deployment topology.
- Create Flutter code.
- Create NestJS code.
- Create FastAPI code.
- Create database migrations.
- Create AIM Engine runtime code.
- Create a separate Student Web App.
- Move AIM Engine logic into clients.
- Remove historical completed MVP pilot context.

## Assumptions

- `docs/product/vision.md` is the active product direction source of truth.
- Completed MVP pilot history must be preserved, not erased.
- React Web and FastAPI are valid completed MVP pilot context.
- Flutter Mobile and NestJS + TypeScript are valid post-MVP Phase 1 direction.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless changed by a later documented decision.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
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
- `docs/security/ai-safety-privacy-rules.md`
- `docs/quality/phase-0-duplicate-content-audit.md`
- `docs/quality/phase-0-content-completeness-audit.md`

## Acceptance Notes

- This document has a title, purpose, scope, current product direction, audit method, findings, canonical wording, domain rules, cleanup priority, verification commands, assumptions, non-goals, and related documents.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
