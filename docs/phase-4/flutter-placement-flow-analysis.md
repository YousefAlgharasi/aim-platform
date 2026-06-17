# Flutter Placement Flow Analysis Report

> Phase 4 — P4-071
> Scope: Placement Test phase only.

---

## Purpose

This document records the static code analysis of the Flutter placement flow
(P4-061 through P4-070). It replaces the `flutter analyze` output that cannot
be produced in the agent environment (Flutter toolchain unavailable). All checks
are performed by manual inspection of source files on `main`.

---

## 1. Files Analyzed

### UI Pages

| File | Lines | Task |
|------|-------|------|
| `placement_start_page.dart` | 278 | P4-065 |
| `placement_section_page.dart` | 346 | P4-066 |
| `placement_question_page.dart` | 558 | P4-067 |
| `placement_submit_page.dart` | 213 | P4-068 |
| `placement_result_page.dart` | 472 | P4-069 |

### Providers / Notifiers

| File | Task |
|------|------|
| `placement_start_notifier.dart` | P4-065 |
| `placement_section_notifier.dart` | P4-066 |
| `placement_question_notifier.dart` | P4-067 |
| `placement_submit_notifier.dart` | P4-068 |
| `placement_result_notifier.dart` | P4-069 |
| `placement_provider.dart` | P4-064 |

### Data Layer

| File | Task |
|------|------|
| `placement_test_model.dart` | P4-062 |
| `placement_section_model.dart` | P4-062 |
| `placement_question_model.dart` | P4-062 |
| `placement_answer_model.dart` | P4-062 |
| `placement_attempt_model.dart` | P4-062 |
| `placement_result_model.dart` | P4-069 |
| `placement_remote_datasource_impl.dart` | P4-063 |
| `placement_repository_impl.dart` | P4-064 |

### Entities

| File | Task |
|------|------|
| `placement_test.dart` | P4-062 |
| `placement_section.dart` | P4-062 |
| `placement_question.dart` | P4-062 |
| `placement_answer.dart` | P4-062 |
| `placement_attempt.dart` | P4-062 |
| `placement_result.dart` | P4-069 |
| `placement_skill_mastery.dart` | P4-069 |

---

## 2. Security Checks

### 2.1 Scoring Threshold Constants

**Check:** No scoring threshold constants (0.75, 0.40, 0.55, 0.70, 0.85, 0.60)
appear in any Flutter placement file (outside comments).

**Result:** ✓ PASS — zero occurrences found.

These thresholds are backend configuration only (P4-031, P4-032). Flutter must
never hardcode them.

### 2.2 correct_answer Field

**Check:** `correct_answer` (singular — the answer key) must never appear in any
Flutter model, response parser, or UI widget.

**Result:** ✓ PASS — zero occurrences of `correct_answer` found in Flutter
placement source code.

**Note:** `correct_answers` (plural — aggregate count of correct answers in a
mastery map entry) appears in `placement_result_model.dart` lines 53 and 84. This
is a read-only aggregate count included in the skill mastery map for display
purposes, not an answer key. It does not expose the correct answer for any
individual question. This is acceptable per P4-012 §4.

### 2.3 is_correct Field

**Check:** `is_correct` must never appear in any Flutter placement model or
response parser — it is a backend-only field.

**Result:** ✓ PASS — zero occurrences of `is_correct` found.

### 2.4 overallScore Field

**Check:** `overall_score` / `overallScore` must never be returned to Flutter.
Only `estimated_level` is sent to Flutter as the top-level level result.

**Result:** ✓ PASS — zero occurrences of `overallScore` or `overall_score` in
Flutter placement output.

### 2.5 student_id Submission

**Check:** Flutter must never include `student_id` in any request body.
Backend resolves student identity from the JWT.

**Result:** ✓ PASS — zero occurrences of `student_id` in request-building code.

### 2.6 Local Signal Computation (P4-070 fix)

**Check:** `PlacementSkillMastery.signal` must come from the backend JSON field
`signal`. Flutter must never compute signal from `masteryScore` using threshold
constants.

**Result:** ✓ PASS — `signal` in `_parseSkillMasteryMap()` (placement_result_model.dart
line ~84) uses `data['signal'] as String? ?? 'unknown'`. No `if (masteryScore >= 0.75)`
or equivalent logic exists anywhere in the data or logic layers.

Previous violation (removed in P4-070): a `_signal()` helper that computed signal
from `masteryScore` using 0.75 and 0.40 thresholds was present in an earlier revision
of `placement_result_page.dart`. Confirmed removed in commit `546081a`.

### 2.7 Local Level Mapping

**Check:** Flutter must never map an overall score to a CEFR level. Level is
provided by the backend as `estimated_level`.

**Result:** ✓ PASS — `PlacementResultModel.estimatedLevel` is stored and forwarded
exactly as received from the backend JSON field `estimated_level`. No score-to-level
mapping logic exists in Flutter.

### 2.8 Local Weakness Computation

**Check:** Flutter must never compute weaknesses by comparing mastery scores to
thresholds. Weakness list comes from `weakness_map` in the backend response.

**Result:** ✓ PASS — `_parseWeaknesses()` reads the pre-ranked `weaknesses` list
directly from the backend response. No local filtering or threshold comparison.

---

## 3. Architecture Checks

### 3.1 Backend Authority Preserved

| Rule | Status |
|------|--------|
| estimatedLevel sourced from backend | ✓ |
| signal sourced from backend | ✓ |
| weakness priority sourced from backend | ✓ |
| initialPathId sourced from backend | ✓ |
| attempt completion triggers backend scoring | ✓ |

### 3.2 Flutter Submission Pattern

- Flutter submits `answer_value` (the student's selected option letter/text) via
  `POST /placement/attempts/:id/answers`.
- Flutter never validates or scores the answer locally before submission.
- Flutter never persists attempt state to local storage — it is always backend-sourced.

### 3.3 No Excluded Scope

| Scope rule | Status |
|-----------|--------|
| No AIM Engine runtime integration | ✓ |
| No AI Teacher | ✓ |
| No lesson delivery | ✓ |
| No practice sessions | ✓ |
| No progress dashboard | ✓ |
| No Phase 5+ features | ✓ |

---

## 4. Test Coverage Summary

Unit tests written in P4-071:

| Test file | Tests | Coverage |
|-----------|-------|---------|
| `placement_models_test.dart` | 22 | PlacementTestModel, PlacementSectionModel, PlacementQuestionModel, PlacementAnswerModel, PlacementResultModel — fromJson/toJson round-trips, nullable fields, missing fields graceful handling |
| `placement_no_scoring_test.dart` | 13 | PlacementSkillMastery backend-only signal, correct_answer/is_correct absent from all models, estimatedLevel levels 5×, weakness map ordering and empty state |

**Total: 35 tests written.** All are runnable with `flutter test` when the Flutter
toolchain is available.

---

## 5. flutter analyze Status

`flutter analyze` was not executable in the agent environment (Flutter toolchain
unavailable). To run:

```bash
cd apps/mobile
flutter analyze lib/features/placement/
```

Expected result: no errors, no warnings (code follows existing project linting
patterns established in Phase 1–3 and enforced by `flutter_lints: ^4.0.0`).

---

## 6. Known Limitations

| # | Limitation | Impact |
|---|-----------|--------|
| 1 | `flutter analyze` not run in agent environment | Medium — must be verified in CI |
| 2 | `flutter test` not run in agent environment | Medium — 35 tests to run in CI |
| 3 | Widget tests (interaction) not written | Low — covered by integration testing in P4-075 |
| 4 | `masteryScore` is present in `PlacementSkillMastery` — it is never used for signal computation but is available in the object | None — informational only; no threshold checks on it |

---

## 7. Scope Confirmation

- Placement Test phase only: yes
- AIM Engine runtime integration: not present
- AI Teacher: not present
- Lesson delivery: not present
- Client-side scoring: not present
- Flutter scoring authority: not applicable — backend is sole authority
