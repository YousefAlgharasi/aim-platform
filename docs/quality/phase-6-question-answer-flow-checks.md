# Phase 6 — Q/A Mobile Flow Checks (P6-093)

## Scope

Static and unit-level checks across the question/answer feature (P6-083..P6-092).

## Security Invariants

| # | Check | Status |
|---|-------|--------|
| 1 | `AttemptSubmitRequestModel.toJson` contains `itemId`, `answerValue`, `startedAt` | ✅ Unit test |
| 2 | `toJson` NEVER contains `isCorrect` | ✅ Unit test |
| 3 | `toJson` NEVER contains `skillIds` | ✅ Unit test |
| 4 | `toJson` NEVER contains `studentId` | ✅ Unit test |
| 5 | `AttemptSubmitResponseModel` has no `isCorrect` accessor | ✅ Unit test |
| 6 | `AttemptSubmitResponseModel.toJson` has no `isCorrect` key | ✅ Unit test |
| 7 | `SessionFeedbackModel.found == false` when backend pipeline not done | ✅ Unit test |
| 8 | Session aggregate counts parsed verbatim from backend | ✅ Unit test |
| 9 | `AnswerOptionModel.fromJson` silently drops `isCorrect` from JSON | ✅ Unit test |
| 10 | `QuestionModel.fromJson` parses options without correctness info | ✅ Unit test |
| 11 | `AttemptResult` entity has no `isCorrect` field | ✅ Compile-time + unit test |
| 12 | `SessionFeedback.itemsCorrect` is nullable (pending valid) | ✅ Unit test |
| 13 | `QuestionSessionState.copyWith(clearSelectedOption: true)` clears option | ✅ Unit test |
| 14 | `AttemptSubmitRequestModel.toJson` has exactly 3 keys | ✅ Unit test |
| 15 | `SessionFeedbackModel.fromJson` parses `skillsTouched` list | ✅ Unit test |

## Flow Coverage

| Layer | File | Coverage |
|-------|------|----------|
| Models | `AttemptSubmitRequestModel`, `AttemptSubmitResponseModel` | P6-085 tests + P6-093 |
| Models | `QuestionModel`, `AnswerOptionModel` | P6-084 tests + P6-093 |
| Models | `SessionFeedbackModel` | P6-093 |
| Datasource | `QuestionRemoteDatasource` | P6-086 tests |
| Datasource | `AttemptRemoteDatasource` | P6-087 tests |
| Datasource | `SessionFeedbackRemoteDatasource` | P6-093 (static) |
| Repository | `QuestionAnswerRepository` | P6-088 tests |
| State | `QuestionSessionState` | P6-093 |
| UI | `QuestionPage`, `AnswerSubmitFlow`, `SessionFeedbackCard` | Static design-system review |

## Design System Checks

- `AIMAnswerOption` used for all MCQ/true_false options — no raw widget
- `AIMCard` (elevated/ai variants) for stem and feedback cards
- `AIMButton` for submit — no raw `ElevatedButton`
- `AIMAlertBanner` for error states
- `AIMBadge` for skill tags and difficulty
- `AimSpacing.*` throughout — no raw literals
- `AimTextStyles.*` throughout — no inline `TextStyle`

## RTL/Arabic Checks

- `EdgeInsets.symmetric` used in all padding — RTL-safe
- `CrossAxisAlignment.start` in Column — direction-aware
- `AIMTopAppBar` handles leading icon mirroring internally
- `AIMAnswerOption` uses leading-edge text alignment internally
- No `TextDirection.ltr` hard-coded in feature files
- `Wrap` used for skill badges — mirrors correctly in RTL

## Backend Authority Checks

- Flutter NEVER evaluates correctness locally — no `isCorrect` in any Flutter entity writable by UI
- `itemsCorrect` is a backend aggregate count displayed verbatim only
- `overallMasteryShift` is an opaque AIM Engine string displayed verbatim
- `sessionId` and `questionId` always sourced from backend-supplied session data
- `studentId` JWT-resolved by backend; passed from `authContextProvider` only

## Runtime Check Status

`flutter test` and `flutter analyze` unavailable (no Flutter SDK in sandbox).
All checks are static + unit-level. Runtime execution is a pre-merge manual prerequisite.
