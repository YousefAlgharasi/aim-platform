# Phase 6 — Question/Answer E2E Check

**Task:** P6-123
**Branch:** `phase6/P6-123-mobile-question-answer-e2e-check`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependency:** P6-093 (Add Question/Answer Flow Checks) — Done

---

## Scope

End-to-end review of the Flutter question/answer session flow for lesson
practice: question display → answer collection → attempt submission →
backend feedback display. Confirms no local correctness calculation,
no client-side scoring, and read-only display of backend-approved feedback.

---

## Feature Files Reviewed

```
apps/mobile/lib/features/question_answer/
  data/datasources/
    question_remote_datasource.dart / _impl.dart
    attempt_remote_datasource.dart / _impl.dart
    session_feedback_remote_datasource.dart / _impl.dart
  data/models/
    question_model.dart
    answer_option_model.dart
    attempt_submit_request_model.dart
    attempt_submit_response_model.dart
    session_feedback_model.dart
  data/repository/repo_impl/question_answer_repository_impl.dart
  logic/entity/
    question.dart, answer_option.dart
    question_session_state.dart
    attempt_result.dart, session_feedback.dart
  logic/provider/
    question_answer_notifier.dart
    question_answer_provider.dart
  ui/pages/question_page.dart
  ui/widgets/
    question_stem_card.dart
    question_options_list.dart
    question_fill_blank_input.dart
    answer_submit_flow.dart
    attempt_acknowledgement_card.dart
    session_feedback_card.dart
apps/mobile/test/features/question_answer/
  question_answer_flow_checks_test.dart
  question_datasource_test.dart
  attempt_submit_datasource_test.dart
  question_answer_repository_test.dart
  question_models_test.dart
  attempt_submit_models_test.dart
```

---

## E2E Flow Trace

### 1. Question Load

- `QuestionAnswerNotifier.loadQuestions(token, lessonId)` →
  `GET /lessons/:lessonId/questions`.
- Returns `List<QuestionModel>` — type, stem, `List<AnswerOptionModel>`.
- `AnswerOptionModel` contains `id` and `label` only. No `is_correct` field.

**Result:** ✅ Correctness data never sent to Flutter.

### 2. Answer Collection

- `QuestionPage` renders per question type:
  - Multiple-choice / true-false → `QuestionOptionsList` → radio-style
    `AIMAnswerOption` widgets. Selection stored in `QuestionSessionState.selectedOptionId`.
  - Fill-blank → `QuestionFillBlankInput` → text stored in
    `QuestionSessionState.textAnswer`.
- No grading state: `AIMAnswerOption` has only `default` / `selected` states —
  no `correct` / `incorrect` visual state exists in this widget.
- `key: ValueKey(question.id)` used on input subtree to prevent stale text
  carrying across questions.

**Result:** ✅ Selection is UI state only — not scored locally.

### 3. Attempt Submission

- Student taps "Submit Answer" → `QuestionAnswerNotifier.submitAttempt(token)`.
- `AttemptSubmitRequestModel`: `{ lessonId, questionId, answerValue }`.
  No `studentId` — JWT-resolved server-side. No `isCorrect` field sent.
- `POST /lessons/:lessonId/attempts` → `AttemptSubmitResponseModel`:
  `{ attemptId, status }`. No `isCorrect` or score returned at this stage.

**Result:** ✅ Submit is fire-and-acknowledge. Backend evaluates correctness.

### 4. Session Feedback Display

- After completing all questions in a session:
  `GET /lessons/:lessonId/attempts/:attemptId/feedback` →
  `SessionFeedbackModel`.
- Fields: `totalQuestions`, `correctCount`, `skillSignals`, `nextRecommendation`.
- `SessionFeedbackCard` displays these read-only.
- `correctCount` is backend-computed — Flutter shows the number as-is,
  does not derive it from per-question results.

**Result:** ✅ Feedback is read-only. `correctCount` never calculated in Flutter.

### 5. Attempt Acknowledgement

- `AttemptAcknowledgementCard` shows per-question result cards ONLY if the
  backend includes `questionResults` in the feedback response.
- Flutter does not reconstruct per-question correctness — it only shows
  what the backend explicitly provides.

**Result:** ✅ No local correctness reconstruction.

---

## No-Correctness Verification

Grep across `apps/mobile/lib/features/question_answer/`:

| Pattern | Found |
|---|---|
| `is_correct` / `isCorrect` / `correct_answer` | Not found (no model field) |
| Local score calculation | Not found |
| Mastery threshold constants | Not found |
| AIM Engine / Python service URLs | Not found |
| `student_id` sent as request field | Not found |

Covered by `question_answer_flow_checks_test.dart` regression suite (P6-093).

---

## Design System

- `QuestionPage` uses `AIMTopAppBar`, `AIMProgressBar`, `AIMFullScreenLoading/Error`.
- `QuestionStemCard` uses `AIMCard`, `AimTextStyles`.
- `QuestionOptionsList` uses `AIMAnswerOption` (design system component).
- `QuestionFillBlankInput` uses `AIMTextarea`.
- `AnswerSubmitFlow` uses `AIMButton` (fullWidth, primary).
- `SessionFeedbackCard` uses `AIMCard`, `AIMBadge` for skill signals.

---

## RTL / Arabic

- No `TextDirection.ltr` hard-coded.
- Question stem and option text use ambient direction.
- `QuestionFillBlankInput` uses `textDirection: null` — inherits from locale.

---

## Gaps / Limitations

| Gap | Severity | Owner |
|---|---|---|
| Session feedback endpoint not yet fully wired to the post-lesson nav flow | Medium | P6-096 |
| `QuestionPage` not yet registered in `AppRouter` | High | Router registration task |

---

## Mobile Validation Checklist

- Flutter does not calculate correctness: ✅
- Flutter does not calculate score: ✅
- Flutter does not calculate mastery: ✅
- Backend-approved feedback displayed only: ✅
- No `is_correct` in any model: ✅
- Secrets excluded: ✅

---

## Verdict

**PASS.** The Q/A E2E flow is correct for Phase 6 MVP. Correctness authority
is fully backend-delegated. Feedback is read-only display of backend response.
No local scoring found anywhere in the feature.
