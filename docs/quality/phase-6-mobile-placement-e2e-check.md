# Phase 6 — Mobile Placement E2E Check

**Task:** P6-120  
**Branch:** `phase6/P6-120-mobile-placement-e2e-check`  
**Date:** 2026-06-18  
**Reviewer:** GHOST (autonomous agent)  
**Dependency:** P6-056 (Add Placement Mobile Flow Tests) — Done

---

## Scope

End-to-end review of the Flutter mobile placement test flow: entry route →
test start → section navigation → per-question answer collection → attempt
submission → result display → post-placement routing to main shell.

Confirms no local scoring, no AIM Engine calls, no client-side correctness
authority, and correct read-only display of backend placement result.

---

## Feature Files Reviewed

```
apps/mobile/lib/features/placement/
  data/datasources/
    placement_remote_datasource.dart
    placement_remote_datasource_impl.dart
  data/models/
    placement_answer_model.dart
    placement_attempt_model.dart
    placement_question_model.dart
    placement_result_model.dart
    placement_section_model.dart
    placement_test_model.dart
  data/repository/repo_impl/placement_repository_impl.dart
  logic/entity/
    placement_question.dart
    placement_result.dart
    placement_section.dart
    placement_skill_mastery.dart
  logic/provider/
    placement_provider.dart
    placement_question_notifier.dart
    placement_result_notifier.dart
    placement_section_notifier.dart
    placement_start_notifier.dart
    placement_submit_notifier.dart
  ui/pages/
    placement_question_page.dart
    placement_result_page.dart
    placement_section_page.dart
    placement_start_page.dart
    placement_submit_page.dart
apps/mobile/lib/core/routing/app_router.dart (placement route cases)
apps/mobile/test/features/placement/placement_no_scoring_test.dart
```

---

## E2E Flow Trace

### 1. Entry Route

- `AppRouter` switch-case `AppRoutePaths.placementStart` → `PlacementStartPage()`
  with no arguments (correct — start page loads the active test itself).
- Route is in `_protectedRoutes` — unauthenticated access redirects to sign-in.

**Result:** ✅

### 2. Placement Start

- `PlacementStartPage` mounts → `PlacementStartNotifier.loadActivePlacementTest(token)`.
- API: `GET /placement/tests/active` → `PlacementTestModel` (id, sections count, title).
- Student taps "Begin" → `PlacementStartNotifier.startAttempt(token, testId)`.
- API: `POST /placement/attempts` body: `{ "placement_test_id": testId }`.
  `student_id` is JWT-resolved server-side — never sent from Flutter.
- On `PlacementStarted`: navigates to `placementSection` with
  `{ attemptId, testId }` arguments.

**Result:** ✅ No local scoring. No client-side attempt creation outside of API call.

### 3. Section Navigation

- `PlacementSectionPage` loads sections via
  `GET /placement/tests/:testId/sections` → ordered `List<PlacementSectionModel>`.
- Displays section index, title, skill area, question count.
- Student taps "Start Section" → navigates to `placementQuestion` with
  `{ sectionId, attemptId, sectionTitle, sectionIndex, totalSections }`.
- After question page returns: if `isLastSection` → navigate to `placementSubmit`;
  else `advanceToNextSection()` (local UI cursor advance only — no scoring).

**Result:** ✅ Section cursor is UI state. No mastery calculated locally.

### 4. Question + Answer Collection

- `PlacementQuestionPage` loads questions via
  `GET /placement/sections/:sectionId/questions`.
- Question types: `multiple_choice`, `true_false`, `fill_blank`.
- Student selects/types answer → local UI state only
  (`PlacementQuestionState.selectedOptionId` / `textAnswer`).
- Student confirms answer → `PlacementQuestionNotifier.submitCurrentAnswer(token)`.
- API: `POST /placement/attempts/:attemptId/answers`
  body: `{ placementAttemptId, placementQuestionId, answerValue }`.
- Response: `PlacementAnswerModel` — contains only submission metadata.
  `is_correct` and `correct_answer` are **never** returned to Flutter.
- On last question, page pops back to section page (which then routes to submit).

**Result:** ✅ Correctness is entirely server-side. Confirmed by
`placement_no_scoring_test.dart` (P4-070, P6-056).

### 5. Attempt Submission

- `PlacementSubmitPage` mounts with `attemptId`.
- `PlacementSubmitNotifier.completeAttempt(token, attemptId)`.
- API: `POST /placement/attempts/:attemptId/complete`.
- Response: confirmation only — no scoring data.
- On `PlacementSubmitSuccess` → navigates to `placementResult` with
  `{ attemptId }`.

**Result:** ✅ Submit is a fire-and-confirm. No score returned to Flutter.

### 6. Result Display

- `PlacementResultPage` mounts with `attemptId`.
- `PlacementResultNotifier.loadResult(token, attemptId)` with polling for
  `PlacementResultPending` state (backend still scoring).
- API: `GET /placement/attempts/:attemptId/result`.
- `PlacementResultModel` fields consumed:
  - `estimatedLevel` — displayed as-is from backend.
  - `skillMasteryMap` — per-skill `signal` (strong/developing/emerging) displayed via `AIMBadge`.
  - `weaknesses` — displayed in priority order from backend.
  - `initialPathId` — triggers `AIMAlertBanner` indicating path readiness.
- `masteryScore` raw number is **never displayed** — only the backend-provided
  qualitative `signal` string is shown.
- "Continue to Home" → `pushNamedAndRemoveUntil(AppRoutePaths.mainShell, ...)`.

**Result:** ✅ All result data is backend-provided and read-only in Flutter.

---

## No-Scoring Verification

Grep audit across `apps/mobile/lib/features/placement/`:

| Pattern | Found |
|---|---|
| `is_correct` / `correct_answer` / `isCorrect` | Not found (doc-comments only) |
| `overallScore` / `overall_score` | Not found |
| Threshold constants (0.75, 0.40) | Not found |
| `student_id` sent as request field | Not found |
| AIM Engine / Python service URLs | Not found |
| OpenAI / AI provider imports | Not found |

Covered by existing `placement_no_scoring_test.dart` regression suite.

---

## Router Gap (Fixed in P6-045)

Pre-P6-045, `AppRouter.onGenerateRoute` had no cases for any placement route —
the entire flow was unreachable via named routes. This was fixed in P6-045
(branch `phase6/P6-045-flutter-placement-entry-route`, merged to main).
All 5 placement routes are now wired with defensive argument parsing and
placed in `_protectedRoutes`.

---

## Design System

All 5 placement pages use AIM Mobile Design System:
- `AIMTopAppBar`, `AIMFullScreenLoading`, `AIMFullScreenError`
- `AIMProgressBar` (question progress)
- `AIMAnswerOption` (multiple-choice / true-false)
- `AIMTextarea` (fill-blank)
- `AIMCard` (level, skill summary, weakness)
- `AIMBadge` (skill signal, weakness priority)
- `AIMAlertBanner` (path status, errors)
- `AIMButton` (navigation CTAs)

No hard-coded colors, radius, spacing, or typography literals found.

---

## RTL / Arabic

- No `TextDirection.ltr` hard-coded in any placement page.
- `key: ValueKey(question.id)` added in P6-049 prevents stale controller
  text from carrying across questions (including fill-blank in RTL).
- Arabic labels can be swapped via locale system without widget changes.

---

## Gaps / Limitations

| Gap | Severity | Owner |
|---|---|---|
| Placement entry trigger (deciding *when* to route a student to placement vs. home) not yet implemented — `HomePlaceholderPage` has no placement-required gate | High | P6-046 (Add Placement Required State) |
| `PlacementSectionPage` and `PlacementSubmitPage` still use raw `AppBar`/`CircularProgressIndicator` Material widgets instead of design system | Low | Future polish task |
| Polling for backend-scoring result uses a hard-coded max-poll count — no user-visible retry if polling expires | Low | Phase 7 |

---

## Mobile Validation Checklist

- Flutter does not call AIM Engine: ✅
- Flutter does not call Python services: ✅
- Flutter does not calculate placement score: ✅
- Flutter does not calculate CEFR level: ✅
- Flutter does not calculate mastery: ✅
- Flutter does not calculate correctness: ✅
- All placement result data comes from backend: ✅
- Backend APIs consumed via shared network layer with interceptor: ✅
- Secrets excluded: ✅
- Feature-first architecture preserved: ✅

---

## Verdict

**PASS.** The mobile placement E2E flow is complete and correct for Phase 6
MVP scope. All six API calls are wired. No scoring logic exists in Flutter.
Result is read-only display of backend-provided data. One high-severity gap
(placement entry trigger) is documented and owned by P6-046.
