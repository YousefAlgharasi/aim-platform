# No Client Authority Review — P10-073

**Date**: 2026-06-20
**Scope**: `apps/mobile/lib/features/assessments/` (all 39 Dart source files)
**Purpose**: Prove that the Flutter mobile client does not own grading, scoring, deadlines, or AIM decisions. All authority lives on the backend.

---

## 1. No Client-Side Scoring

**Claim**: Flutter never adds, sums, multiplies, or derives scores or points.

**Files scanned**:
- `data/models/attempt_result_model.dart`
- `data/models/result_history_model.dart`
- `data/models/assessment_detail_model.dart`
- `logic/entity/attempt_result.dart`
- `logic/entity/result_history.dart`
- `ui/pages/assessment_result_page.dart`

**Patterns verified absent**:
- `score + `, `score * `, `score / `, `score - ` (arithmetic on score fields)
- `points + `, `points * `, `points / ` (arithmetic on points fields)
- `calculateScore`, `computeScore`, `calcScore`

**Finding**: All score values (`score`, `maxScore`, `pointsAwarded`, `pointsPossible`, `scorePercent`) are received via `fromJson` deserialization in models and passed as read-only fields through entities to UI widgets. No arithmetic is performed on these values anywhere in the client.

**Backend contrast**: `assessment-grading.service.ts` (P10-027) computes `score` by summing `pointsAwarded` across `GradingOutcome[]` items. `assessment-score-policy.service.ts` (P10-028) applies section weights and produces `finalScore`. These calculations exist exclusively server-side.

---

## 2. No Client-Side Correctness

**Claim**: Flutter never compares student answers to correct answers or assigns `isCorrect`.

**Files scanned**:
- `data/models/attempt_result_model.dart`
- `logic/entity/attempt_result.dart`
- `logic/provider/answer_draft_notifier.dart`
- `logic/provider/attempt_notifier.dart`
- `ui/pages/attempt_page.dart`
- `ui/pages/submit_attempt_page.dart`

**Patterns verified absent**:
- `isCorrect =` (outside fromJson context)
- `correctAnswer`, `correct_answer` (correct answer lookup)
- `answer == `, `selectedChoice == ` (comparison against correct values)

**Finding**: `AnswerDraftNotifier` stores the student's selected choice ID only. It calls `repository.submitAnswer()` to POST the selection to the backend. The `AttemptResult` entity receives `isCorrect` per-question breakdown via `fromJson` — it is never computed locally. The backend `assessment-grading.service.ts` looks up `correct_choice_id` from `question_choices` and compares it against the submitted answer.

---

## 3. No Client-Side Pass/Fail

**Claim**: Flutter never evaluates whether a student passed or failed.

**Files scanned**:
- `data/models/attempt_result_model.dart`
- `logic/entity/attempt_result.dart`
- `ui/pages/assessment_result_page.dart`

**Patterns verified absent**:
- `passed =` (outside fromJson context)
- `score >= passThreshold`, `score >= threshold`
- `calculateGrade`, `computeGrade`, `gradeSubmission`

**Finding**: The `passed` boolean is a read-only field on `AttemptResult`, populated via `fromJson`. The result page displays it with conditional styling (green/red) but never derives it. The backend `assessment-grading.service.ts` applies `pass_threshold` from `assessment_settings` to determine `passed`.

---

## 4. No Client-Side Deadline Enforcement

**Claim**: Flutter never blocks actions based on deadline comparison. Countdown display is permitted.

**Files scanned**:
- `ui/widgets/deadline_status_widgets.dart`
- `ui/widgets/attempt_timer_widget.dart`
- `ui/pages/deadlines_page.dart`
- `logic/provider/deadlines_notifier.dart`
- `logic/entity/student_deadline.dart`
- `data/models/student_deadline_model.dart`
- `ui/pages/start_attempt_page.dart`

**Patterns verified absent**:
- `DateTime.now().*isAfter.*deadline` (local deadline gate)
- `DateTime.now().*isBefore.*deadline`
- `checkDeadline` function definitions
- Any conditional that disables submit buttons based on local time comparison

**Finding**: `AttemptTimerWidget` displays a countdown using the server-provided `remainingSeconds` value. `DeadlineStatusWidgets` shows deadline info with status values (`upcoming`, `past_due`, `completed`) that are strings received from the backend — not computed locally. `StartAttemptPage` reads `canStart` (a boolean from the backend) to show/hide the start button. The backend `assessment-deadline.service.spec.ts` and `deadline-enforcement.spec.ts` confirm that deadline enforcement is server-side.

---

## 5. No Client-Side Attempt Eligibility

**Claim**: Flutter never checks if a student can start another attempt.

**Files scanned**:
- `logic/entity/assessment_detail.dart`
- `ui/pages/start_attempt_page.dart`
- `logic/provider/attempt_notifier.dart`

**Patterns verified absent**:
- `attemptsRemaining <`, `attemptsRemaining ==`, `attemptsLeft <=`
- `canAttempt =` (outside fromJson context)
- `maxAttempts >`, `maxAttempts ==`
- `isEligible` function definitions

**Finding**: `AssessmentDetail` entity contains `canStart` (boolean) and `attemptsRemaining` (int), both populated via `fromJson`. The UI reads `canStart` to show/hide the start button. It displays `attemptsRemaining` as informational text. Neither value is computed or derived locally. The backend `assessment-attempt.service.ts` and `attempt-lifecycle.spec.ts` handle eligibility logic.

---

## 6. No Client-Side Late Penalty

**Claim**: Flutter never applies late penalty calculations.

**Files scanned**:
- All 39 Dart files under `assessments/`

**Patterns verified absent**:
- `latePenalty`, `late_penalty`, `penaltyRate`, `penaltyPercent`, `applyLatePenalty`
- `applyPenalty` function definitions
- Any arithmetic involving penalty multipliers

**Finding**: No penalty-related logic exists in the Flutter codebase. The `AttemptResult` entity contains a `latePenaltyApplied` boolean received from the server for display only. The backend `assessment-grading.service.ts` loads `late_penalty_percent` from `assessment_settings` and adjusts the score. `assessment-score-policy.service.ts` (P10-028) confirms penalties are applied server-side.

---

## 7. No Client-Side AIM/Progress Mutation

**Claim**: Flutter never writes to the progress pipeline or mutates AIM state.

**Files scanned**:
- All provider files (`logic/provider/*.dart`)
- `data/datasources/assessment_remote_datasource.dart`
- `data/datasources/assessment_remote_datasource_impl.dart`
- `data/repository/assessment_data_repository.dart`
- `logic/repository/assessment_repository.dart`

**Patterns verified absent**:
- `updateProgress`, `writeProgress`, `mutateProgress`
- `aimEngine`, `aim_engine`, `progressPipeline`
- Any POST/PUT/PATCH calls to progress-related endpoints

**Finding**: The datasource interface defines only assessment-specific API calls: `getAssessments`, `getAssessmentDetail`, `getResultHistory`, `getDeadlines`, `startAttempt`, `submitAnswer`, `submitAttempt`, `getAttemptResult`. None of these write to the progress pipeline. The backend `assessment-progress-integration.service.ts` handles progress updates after grading — this is triggered server-side, never by Flutter.

---

## 8. Evidence from Tests

**Reference**: `apps/mobile/test/features/assessments/no_local_grading_test.dart`

The test file contains 9 automated checks that scan all Dart source files under `lib/features/assessments/` for violations:

| Test | What it checks |
|------|---------------|
| `no local score arithmetic` | No `score [+-*/=]` outside fromJson |
| `no local points arithmetic` | No `points [+-*/=]` outside fromJson |
| `no local pass/fail boolean assignment` | No `passed =` outside fromJson |
| `no local isCorrect assignment` | No `isCorrect =` outside fromJson |
| `no local deadline enforcement via DateTime.now()` | No `DateTime.now()...isAfter/isBefore...deadline` |
| `no local grade calculation functions` | No `calculateScore/computeScore/calculateGrade/computeGrade/gradeSubmission` |
| `no generic grading logic keywords` | No function definitions named `grade/grading/calcScore/applyPenalty/checkDeadline/isEligible` |
| `no local late penalty computation` | No `latePenalty/penaltyRate/penaltyPercent/applyLatePenalty` outside fromJson |
| `no local attempt eligibility checks` | No `attemptsRemaining/attemptsLeft/canAttempt/maxAttempts [<>=!]` outside fromJson |

These tests act as a continuous regression guard — any future code that introduces local grading logic will cause test failures.

---

## 9. Evidence from Entities

**Files reviewed**:
- `logic/entity/assessment_detail.dart`
- `logic/entity/assessment_list_item.dart`
- `logic/entity/attempt_result.dart`
- `logic/entity/result_history.dart`
- `logic/entity/student_deadline.dart`
- `logic/entity/answer_draft.dart`

**Finding**: All entity classes are immutable data holders. Grading-related fields (`score`, `maxScore`, `passed`, `scorePercent`, `pointsAwarded`, `pointsPossible`, `isCorrect`, `latePenaltyApplied`, `attemptsRemaining`, `canStart`) are `final` fields populated exclusively through model `fromJson` factories. No entity contains methods that compute, derive, or transform grading values. `AnswerDraft` is the only entity with mutable-like behavior (via `copyWith`), and it stores only the student's selected choice ID — no grading data.

---

## 10. Evidence from Notifiers

**Files reviewed**:
- `logic/provider/assessment_list_notifier.dart`
- `logic/provider/assessment_detail_notifier.dart`
- `logic/provider/attempt_notifier.dart`
- `logic/provider/answer_draft_notifier.dart`
- `logic/provider/result_notifier.dart`
- `logic/provider/deadlines_notifier.dart`

**Finding**: Every notifier follows the same pattern: accept parameters (bearer token, IDs), call a repository method, and set state to the returned value. No notifier performs arithmetic, comparisons, or transformations on grading data.

Specific method inventory:
- `AssessmentListNotifier.load()` calls `repository.getAssessments()`
- `AssessmentDetailNotifier.load()` calls `repository.getAssessmentDetail()`
- `AttemptNotifier.start()` calls `repository.startAttempt()`
- `AttemptNotifier.submit()` calls `repository.submitAttempt()`
- `AnswerDraftNotifier.select()` updates local draft state (choice ID only)
- `AnswerDraftNotifier.submit()` calls `repository.submitAnswer()`
- `ResultNotifier.load()` calls `repository.getAttemptResult()`
- `DeadlinesNotifier.load()` calls `repository.getDeadlines()`

No notifier contains `if`, `switch`, or ternary expressions that evaluate grading outcomes.

---

## Summary

All 10 claims are substantiated. The Flutter assessment feature is a pure display and input-capture layer. Every grading, scoring, pass/fail, deadline enforcement, eligibility, penalty, and progress decision is made by the backend services (`assessment-grading.service.ts`, `assessment-score-policy.service.ts`, `assessment-attempt.service.ts`, `assessment-progress-integration.service.ts`). The `no_local_grading_test.dart` test suite provides continuous automated enforcement of these boundaries.
