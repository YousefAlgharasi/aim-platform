# Phase 6 — Placement Feature Review

**Task:** P6-043  
**Reviewer:** Agent (P6-043)  
**Date:** 2026-06-18  
**Dependency reviewed:** P4-080 (Phase 4 Final Review and Handoff)  
**Scope:** Flutter `features/placement` readiness for Phase 6 mobile MVP integration

---

## 1. Summary

The Phase 4 placement feature is substantially complete and ready for Phase 6 integration. The backend API is fully implemented and secured. The Flutter feature layer covers all seven endpoints, exposes a full set of notifiers, and routes correctly through the app shell. Two pages (`PlacementSectionPage`, `PlacementSubmitPage`) contain hardcoded styling that must be migrated to AIM design system tokens before those screens are shipped. The no-scoring security rule is correctly enforced end-to-end.

**Overall verdict: READY with two design-system gaps to remediate before GA.**

---

## 2. Backend API Readiness

### 2.1 Endpoints (from `PlacementController`)

| # | Method | Path | Status |
|---|--------|------|--------|
| 1 | GET | `/placement/active` | ✅ Implemented |
| 2 | GET | `/placement/sections` | ✅ Implemented |
| 3 | GET | `/placement/questions?sectionId=:id` | ✅ Implemented |
| 4 | POST | `/placement/attempts` | ✅ Implemented |
| 5 | POST | `/placement/attempts/:id/answers` | ✅ Implemented |
| 6 | POST | `/placement/attempts/:id/complete` | ✅ Implemented |
| 7 | GET | `/placement/attempts/:id/result` | ✅ Implemented |

All endpoints are guarded by `SupabaseJwtAuthGuard` (authentication) and `PlacementPermissionGuard` (role enforcement requiring `AuthorizedRole.STUDENT`). `student_id` is always resolved from the JWT — never accepted as a client input.

### 2.2 Backend Authority — Scoring Pipeline

The scoring pipeline (`placement-scoring.service.ts`, P4-045) is fully backend-owned:

- Per-section mastery computation → backend only
- Overall weighted placement score → backend only
- CEFR level mapping → backend only
- Per-skill correctness signals → backend only
- Weakness map ranking → backend only

Raw fields (`overallScore`, `correctnessRatio`, `is_correct`, `correct_answer`, `skillKey`) are **never returned to Flutter**. Flutter receives only: `estimatedLevel`, per-skill `signal` (string), and `weakness_map` (ordered by backend priority).

---

## 3. Flutter Feature Inventory

### 3.1 Data Layer

| File | Status |
|------|--------|
| `PlacementRemoteDatasource` (abstract) | ✅ Covers all 7 endpoints |
| `PlacementRemoteDatasourceImpl` | ✅ Correct `BackendApiClient` usage |
| `PlacementTestModel` | ✅ No scoring fields |
| `PlacementSectionModel` | ✅ No scoring fields |
| `PlacementQuestionModel` | ✅ `correct_answer` absent — confirmed by test |
| `PlacementAnswerModel` | ✅ `is_correct` absent — confirmed by test |
| `PlacementResultModel` | ✅ `overallScore` absent — confirmed by test |
| `PlacementSkillMastery` | ✅ `signal` sourced from backend JSON verbatim |
| `PlacementRepositoryImpl` | ✅ Wraps datasource cleanly |

### 3.2 Logic / Providers

| Provider | State type | Status |
|----------|-----------|--------|
| `placementStartProvider` | `PlacementStartState` | ✅ Loads active test + starts attempt |
| `placementSectionProvider` | `PlacementSectionState` | ✅ Section list + current index |
| `placementQuestionProvider` | `PlacementQuestionState` | ✅ Question delivery + answer selection |
| `placementSubmitProvider` | `PlacementSubmitState` | ✅ Submit + complete flow |
| `placementResultProvider` | `PlacementResultState` | ✅ Result fetch after completion |
| `placementRequiredProvider` | `PlacementRequiredState` | ✅ App-level gate; backend decides requirement |

`PlacementRequiredNotifier` correctly delegates the "must the student take placement?" decision entirely to the backend via `GET /placement/active`. Flutter reads the response and routes — it never evaluates locally.

### 3.3 UI Pages

| Page | Route | Status |
|------|-------|--------|
| `PlacementStartPage` | `placementStart` | ⚠️ Hardcoded padding/typography — see §4 |
| `PlacementSectionPage` | `placementSection` | ⚠️ Hardcoded styling — see §4 |
| `PlacementQuestionPage` | `placementQuestion` | ✅ Uses AIM design system tokens |
| `PlacementSubmitPage` | `placementSubmit` | ⚠️ Hardcoded styling — see §4 |
| `PlacementResultPage` | `placementResult` | ✅ Uses AIM design system tokens |

All five pages are wired into `AppRouter` via named routes.

---

## 4. Design System Compliance Gaps

### 4.1 `PlacementStartPage` — hardcoded styles

| Location | Issue |
|----------|-------|
| Line 113 | `EdgeInsets.all(24)` → should be `AimSpacing.screenPaddingMobile` |
| Line 129 | `fontWeight: FontWeight.w700` → should be `AimTextStyles.h2` or `AimTextStyles.title` |
| Line 157 | `EdgeInsets.all(12)` → should be `AimSpacing.componentGap` |
| Line 205 | `EdgeInsets.all(24)` → should be `AimSpacing.screenPaddingMobile` |
| Line 272 | `fontWeight: FontWeight.w600` → should be a named `AimTextStyles` style |

### 4.2 `PlacementSectionPage` — hardcoded styles

| Location | Issue |
|----------|-------|
| Line 142 | `EdgeInsets.all(24.0)` → `AimSpacing.screenPaddingMobile` |
| Line 164 | `fontWeight: FontWeight.bold` → AimTextStyles token |
| Line 206 | `TextStyle(fontSize: 16)` → `AimTextStyles.bodyMd` |
| Line 245 | `fontWeight: FontWeight.w600` → AimTextStyles token |
| Line 289 | `_colors[skillCode] ?? Colors.grey` → `AimColors` semantic token |
| Line 302–303 | `fontWeight: FontWeight.w600, fontSize: 13` → `AimTextStyles.label` or `AimTextStyles.caption` |
| Line 324 | `EdgeInsets.all(24.0)` → `AimSpacing.screenPaddingMobile` |
| Line 328 | `color: Colors.red` → `aimSoftFillsOf(context).onError` |

### 4.3 `PlacementSubmitPage` — hardcoded styles

| Location | Issue |
|----------|-------|
| Line 113 | `EdgeInsets.all(32.0)` → `AimSpacing.sectionGap` padding |
| Line 128 | `fontWeight: FontWeight.bold` → AimTextStyles token |
| Line 148 | `EdgeInsets.all(12)` → `AimSpacing.componentGap` |
| Line 171 | `TextStyle(fontSize: 16)` → use `AIMButton` widget (already available) |
| Line 195 | `EdgeInsets.all(24.0)` → `AimSpacing.screenPaddingMobile` |
| Line 199 | `color: Colors.red` → `aimSoftFillsOf(context).onError` |

**Recommendation:** Remediate these three pages in a dedicated `P6-028`-style adoption task before GA. `PlacementQuestionPage` and `PlacementResultPage` are already compliant and do not need further work.

---

## 5. RTL / Arabic Compliance

No explicit `TextDirection.ltr` overrides or hardcoded directional layouts were found anywhere in the placement feature. All `Row`, `Column`, and `Wrap` usage is direction-neutral. No `.start` / `.end` alignment is hardcoded against `TextDirection`.

The hardcoded `EdgeInsets.all(...)` instances identified in §4 use symmetric padding, so they will mirror correctly under RTL — they are a design-system compliance issue only, not a layout-direction bug.

**RTL verdict: No blocking issues. No directional regressions from Phase 4.**

---

## 6. Backend Authority — No Local Scoring

Flutter never calculates any of the following:

| Value | Backend authority verified |
|-------|--------------------------|
| Placement score / CEFR level | ✅ `PlacementScoringService` backend-only |
| Skill signal (strong/developing/emerging) | ✅ `PlacementResultModel` stores verbatim |
| Weakness map order/priority | ✅ Ordered as-received from backend |
| `is_correct` | ✅ Never in any Flutter model (`placement_no_scoring_test.dart`) |
| `correct_answer` | ✅ Never in any Flutter model (same test) |
| `overallScore` | ✅ Never returned or stored by Flutter |
| Student ID for attempt creation | ✅ Resolved from JWT backend-side |
| Placement requirement decision | ✅ Delegated to `GET /placement/active` |

Security test coverage: `placement_no_scoring_test.dart` (P4-071) — 14 tests covering all of the above.

---

## 7. Test Coverage

| Test file | Tests | Coverage |
|-----------|-------|----------|
| `placement_models_test.dart` | Models round-trip / field presence | ✅ |
| `placement_no_scoring_test.dart` | 14 security tests | ✅ |
| `placement_required_state_test.dart` | App-gate state machine | ✅ |
| `placement_start_integration_test.dart` | Start flow integration | ✅ |

No test gaps identified for the data and logic layers. UI-level widget tests for placement pages are out of scope for this review (P6-043 covers API readiness only).

---

## 8. Integration Readiness Checklist

| Check | Result |
|-------|--------|
| All 7 backend endpoints implemented and secured | ✅ |
| Flutter datasource covers all 7 endpoints | ✅ |
| All scoring / correctness fields absent from Flutter models | ✅ |
| `estimatedLevel` stored and displayed verbatim | ✅ |
| `signal` stored and displayed verbatim | ✅ |
| Weakness map order preserved from backend | ✅ |
| `student_id` never sent by Flutter | ✅ |
| Placement-required gate delegates to backend | ✅ |
| All pages wired into `AppRouter` | ✅ |
| RTL compliance — no directional overrides | ✅ |
| `PlacementQuestionPage` design system compliant | ✅ |
| `PlacementResultPage` design system compliant | ✅ |
| `PlacementStartPage` design system compliant | ⚠️ Hardcoded styles — remediate before GA |
| `PlacementSectionPage` design system compliant | ⚠️ Hardcoded styles — remediate before GA |
| `PlacementSubmitPage` design system compliant | ⚠️ Hardcoded styles — remediate before GA |

---

## 9. Recommended Follow-Up Tasks

1. **Design system remediation** — migrate `PlacementStartPage`, `PlacementSectionPage`, and `PlacementSubmitPage` hardcoded padding, typography, and colour values to AIM design system tokens. Suggest scoping as a single P6 adoption task.
2. **UI widget tests** — add widget tests for all five placement pages covering loading/error/success states and RTL layout.
3. **`PlacementRequiredNotifier` integration test** — verify the app-gate correctly routes to `placementStart` when backend returns an active test, and bypasses it when none exists.

---

*End of review — P6-043*
