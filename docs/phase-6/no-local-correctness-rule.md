# No Local Correctness Rule — Flutter Question/Answer Feature

**Task:** P6-092  
**Phase:** 6  
**Status:** Active

## Rule

Flutter **must never** evaluate, compute, or derive answer correctness locally.

The backend is the sole authority for:

- Whether a submitted answer is correct (`isCorrect`)
- The correct answer for any question option (`correct_answer`)
- Any score derived from correct/total counts
- Mastery, skill signals, and grades

## What Flutter may do

| Allowed | Reason |
|---|---|
| Display `AttemptResult.isCorrect` to show feedback | Backend-supplied display value |
| Receive `isCorrect` from `POST /sessions/:id/attempt` | Backend-evaluated, verbatim |
| Show "correct" / "incorrect" text from backend response | Display only — no gating |

## What Flutter must never do

| Forbidden | Reason |
|---|---|
| Compare `selectedOptionId` to a correct answer | Local correctness evaluation |
| Access `correctAnswer` on `AnswerOption` / `Question` | Correct answer must not reach Flutter option model |
| Include `isCorrect` in `AttemptSubmitRequestModel.toJson()` | Backend evaluates; Flutter never tells it |
| Accumulate `correctCount`, `score +=` from results | Local scoring — backend authority only |
| Compute `correct / total` for mastery | Mastery is backend-computed |
| Gate navigation or progression on local correctness | Must wait for backend feedback signal |
| Cache `isCorrect` in local preferences | Backend-evaluated fields must not be persisted locally |

## Regression Check

Run from repo root:

```bash
dart apps/mobile/scripts/no_local_correctness_check.dart
```

Exit 0 = PASS. Exit 1 = violations found.

The check scans `apps/mobile/lib/features/question_answer/` for forbidden patterns.

## References

- P6-004 — Document No Client Authority Rule
- P4-035 — No Client-Side Placement Scoring Rule
- P6-090 — Build Answer Submit Flow
- P6-085 — AttemptSubmitRequestModel / AttemptResult entities
