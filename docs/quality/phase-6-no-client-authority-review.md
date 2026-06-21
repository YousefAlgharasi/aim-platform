# Phase 6 — No Client Authority Review

**Task:** P6-127
**Branch:** `phase6/P6-127-no-client-authority-review`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P6-054, P6-092, P6-103, P6-108 — all Done

---

## Scope

Comprehensive audit confirming that the Flutter Student Mobile App MVP never
acts as an authority for any learning decision. Covers placement scoring,
question correctness, mastery calculation, AIM output generation, difficulty
decisions, and AI provider calls. This review is the final gate ensuring
the "no client authority" invariant is preserved across the entire codebase.

---

## The Rule

> Flutter must not calculate:
> mastery, level, weakness, difficulty, recommendations, review schedule,
> retention, frustration score, placement score, correctness authority,
> or learning decisions.
>
> The backend is the only authority for all of the above.

---

## 1. Placement Scoring — PASS

**Source files audited:**
`features/placement/` — all `.dart` files.

| Check | Result |
|---|---|
| `is_correct` field in any model | ✅ Not present |
| `correct_answer` field in any model | ✅ Not present |
| Score threshold constants | ✅ Not present |
| `overallScore` or `masteryScore` calculated locally | ✅ Not present |
| `estimatedLevel` inferred locally | ✅ Not present — displayed as returned |
| CEFR level calculation | ✅ Not present |

**Regression test:** `placement_no_scoring_test.dart` (P4-070/P6-056).

---

## 2. Question Correctness — PASS

**Source files audited:**
`features/question_answer/` — all `.dart` files.

| Check | Result |
|---|---|
| `is_correct` / `isCorrect` in any model | ✅ Not present |
| `correct_answer` in any model | ✅ Not present |
| Correct/incorrect visual state in `AIMAnswerOption` | ✅ Not present — only `default`/`selected` |
| Per-question local score accumulation | ✅ Not present |
| Local grading before submission | ✅ Not present |

**Regression test:** `question_answer_flow_checks_test.dart` (P6-093).

---

## 3. Mastery Calculation — PASS

**Source files audited:**
`features/aim_results/`, `features/progress/`, `features/learning_path/`.

| Check | Result |
|---|---|
| Mastery threshold constants (0.75, 0.40, etc.) | ✅ Not found |
| `masteryScore` computed from question results | ✅ Not found |
| `masterySignal` derived locally | ✅ Not found — displayed as returned |
| Mastery written to any local store | ✅ Not found |

**Regression test:** `no_aim_calculation_regression_test.dart` (P6-103).

---

## 4. Weakness Detection — PASS

| Check | Result |
|---|---|
| Weakness scoring formula | ✅ Not present |
| `priorityRank` calculated locally | ✅ Not present — displayed as returned |
| Weakness written from Flutter | ✅ Not present |

**Regression test:** `no_aim_calculation_regression_test.dart`.

---

## 5. Difficulty Decisions — PASS

| Check | Result |
|---|---|
| Difficulty level calculated locally | ✅ Not present |
| Next question difficulty determined by Flutter | ✅ Not present |
| `difficultyLevel` field mutated locally | ✅ Not present |

**Regression test:** `no_aim_calculation_regression_test.dart`.

---

## 6. Recommendations — PASS

| Check | Result |
|---|---|
| Recommendation generation in Flutter | ✅ Not present |
| Recommendation priority reordered locally | ✅ Not present |
| Recommendation written from Flutter | ✅ Not present |

---

## 7. Review Schedule — PASS

| Check | Result |
|---|---|
| Spaced-repetition algorithm in Flutter | ✅ Not present |
| Due date calculated from local timestamps | ✅ Not present |
| Review schedule written from Flutter | ✅ Not present |

---

## 8. AI Provider Calls — PASS

**Source files audited:** all `apps/mobile/lib/` `.dart` files.

| Check | Result |
|---|---|
| OpenAI API calls | ✅ Not present |
| Anthropic API calls | ✅ Not present |
| Any LLM provider SDK import | ✅ Not present |
| AI Teacher streaming implementation | ✅ Not present — placeholder only |
| Direct AIM Engine HTTP calls | ✅ Not present |
| Python service URLs | ✅ Not present |

**Regression test:** `no_ai_provider_regression_test.dart` (P6-108).

---

## 9. Direct Database Writes — PASS

| Check | Result |
|---|---|
| `supabase.from(...)` write calls | ✅ Not present |
| Direct Supabase RPC calls | ✅ Not present |
| Supabase service-role key usage | ✅ Not present |

All data writes go through backend REST API endpoints.

---

## 10. Summary Table

| Authority Domain | Flutter Role | Status |
|---|---|---|
| Placement scoring | Display backend result | ✅ PASS |
| Question correctness | Display backend feedback | ✅ PASS |
| Mastery | Display backend signal | ✅ PASS |
| Weakness | Display backend records | ✅ PASS |
| Difficulty | Display backend-assigned questions | ✅ PASS |
| Recommendations | Display backend list | ✅ PASS |
| Review schedule | Display backend schedule | ✅ PASS |
| AI Teacher / LLM calls | Excluded (placeholder) | ✅ PASS |
| AIM Engine calls | Excluded | ✅ PASS |
| Direct DB writes | Excluded | ✅ PASS |

---

## Regression Coverage

| Test File | Authority Domain Covered |
|---|---|
| `placement_no_scoring_test.dart` | Placement, correctness |
| `question_answer_flow_checks_test.dart` | Correctness, grading |
| `no_aim_calculation_regression_test.dart` | Mastery, weakness, difficulty, recs, schedule |
| `progress_recommendation_checks_test.dart` | Recommendations |
| `no_ai_provider_regression_test.dart` | AI Teacher, AIM Engine, LLM calls |

---

## Verdict

**PASS.** The no-client-authority invariant is fully upheld across the
entire Flutter codebase. All 10 authority domains are correctly delegated
to the backend. Five regression test suites provide ongoing automated
protection against authority drift.
