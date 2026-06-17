# Phase 4 — Placement Scoring Rules Review

> **Task:** P4-074  
> **Branch:** `phase4/P4-074-placement-scoring-review`  
> **Reviewer:** AIM Agent  
> **Date:** 2026-06-17  
> **Scope:** Placement Test phase only — backend scoring pipeline only.  
> **Files reviewed:** `placement-scoring.service.ts` (P4-045), `placement-result.service.ts` (P4-046), `placement-scoring.types.ts`, `placement-answer-validation.service.ts` (P4-044)  
> **Reference documents:** `docs/phase-4/placement-skill-scoring-rules.md` (P4-032), `docs/phase-4/placement-weakness-rules.md` (P4-033), `docs/design/phase-4-placement-scoring-blueprint.md` (P4-031)

---

## 1. Review Summary

| Check | Result |
|---|---|
| Section mastery formula matches P4-031 §3 | ✅ PASS |
| Section weights match P4-031 §2 | ✅ PASS |
| Overall score formula matches P4-031 §4 | ✅ PASS |
| Level thresholds match P4-031 §5 | ✅ PASS |
| Skill signal thresholds match P4-032 §4.2 | ✅ PASS |
| Weakness map tier ordering matches P4-033 §4 | ✅ PASS |
| Section weakness thresholds match P4-033 §3.1 | ✅ PASS |
| `overallScore` never persisted or returned to clients | ✅ PASS |
| `is_correct` never returned to Flutter | ✅ PASS |
| `correct_answer` never returned to Flutter | ✅ PASS |
| Raw scoring fields stripped before Flutter response | ✅ PASS |
| `student_id` sourced from attempt row only | ✅ PASS |
| No AIM Engine runtime integration | ✅ PASS |
| Idempotency guard on `createResult` | ✅ PASS |
| Answer validation precondition enforced | ✅ PASS |

**Overall: 15/15 checks PASS — no violations found.**

---

## 2. Section Mastery Score (P4-031 §3)

### Rule
`section_mastery_score = correct_answers_in_section / total_questions_in_section`  
Skipped questions count as incorrect. Result clamped to `[0.00, 1.00]`.

### Implementation (`computeSectionScores`)
```
masteryScore = data.correct / data.total   (data.total > 0)
masteryScore = 0                           (data.total == 0)
```

**Result: ✅ PASS.** Formula matches exactly. Zero-total guard is correct — skipped sections return `0.0`, consistent with treating all skipped answers as incorrect.

---

## 3. Section Weights (P4-031 §2)

### Rule
| Section | Weight |
|---|---|
| Grammar | 0.30 |
| Vocabulary | 0.30 |
| Reading | 0.25 |
| Listening | 0.15 |
| **Total** | **1.00** |

### Implementation (`SECTION_WEIGHTS` constant)
```typescript
const SECTION_WEIGHTS: Record<string, number> = {
  grammar: 0.30,
  vocabulary: 0.30,
  reading: 0.25,
  listening: 0.15,
};
```

**Result: ✅ PASS.** Weights match exactly. Sum = 1.00. Stored as backend config constants — not in DB, not exposed via any API.

---

## 4. Overall Weighted Score (P4-031 §4)

### Rule
`overall_score = Σ (section_weight × section_mastery_score)` across all sections.  
Clamped to `[0.0, 1.0]`.

### Implementation (`computeOverallScore`)
```typescript
let weighted = 0;
for (const section of sectionScores) {
  const weight = SECTION_WEIGHTS[section.skillCode] ?? 0;
  weighted += section.masteryScore * weight;
}
return Math.min(1.0, Math.max(0.0, weighted));
```

**Result: ✅ PASS.** Formula matches. `Math.min/max` clamp guards against floating-point edge cases. Default weight `?? 0` means unknown sections contribute zero — safe.

---

## 5. Level Thresholds (P4-031 §5)

### Rule
| Score Range | Level |
|---|---|
| ≥ 0.85 | `advanced` |
| ≥ 0.70 | `upper_intermediate` |
| ≥ 0.55 | `intermediate` |
| ≥ 0.40 | `elementary` |
| ≥ 0.00 | `beginner` |

### Implementation (`LEVEL_THRESHOLDS` + `mapScoreToLevel`)
```typescript
const LEVEL_THRESHOLDS = [
  { min: 0.85, level: 'advanced' },
  { min: 0.70, level: 'upper_intermediate' },
  { min: 0.55, level: 'intermediate' },
  { min: 0.40, level: 'elementary' },
  { min: 0.00, level: 'beginner' },
];
```

Evaluated highest-first; first match wins.

**Result: ✅ PASS.** Thresholds match exactly. Evaluated highest-first is the correct approach — a score of 0.72 correctly returns `upper_intermediate`, not `elementary`. Final `return 'beginner'` fallback is safe (unreachable given `min: 0.00` in the array).

---

## 6. Skill Signal Thresholds (P4-032 §4.2)

### Rule
| Signal | Threshold |
|---|---|
| `strong` | `correctness_ratio ≥ 0.75` |
| `developing` | `0.40 ≤ correctness_ratio < 0.75` |
| `emerging` | `correctness_ratio < 0.40` |
| Zero answers | `emerging` (special case) |

### Implementation (`SIGNAL_STRONG_THRESHOLD`, `SIGNAL_DEVELOPING_THRESHOLD`, `mapRatioToSignal`)
```typescript
const SIGNAL_STRONG_THRESHOLD = 0.75;
const SIGNAL_DEVELOPING_THRESHOLD = 0.40;

if (totalAnswered === 0) return 'emerging';
if (ratio >= SIGNAL_STRONG_THRESHOLD) return 'strong';
if (ratio >= SIGNAL_DEVELOPING_THRESHOLD) return 'developing';
return 'emerging';
```

**Result: ✅ PASS.** Thresholds match exactly. Zero-answer edge case handled first — returns `emerging` before ratio check.

---

## 7. Section Weakness Thresholds (P4-033 §3.1)

### Rule
| Section | Weakness Threshold |
|---|---|
| Grammar | < 0.60 |
| Vocabulary | < 0.60 |
| Reading | < 0.55 |
| Listening | < 0.55 |

### Implementation (`SECTION_WEAKNESS_THRESHOLDS`)
```typescript
const SECTION_WEAKNESS_THRESHOLDS: Record<string, number> = {
  grammar: 0.60,
  vocabulary: 0.60,
  reading: 0.55,
  listening: 0.55,
};
```

```typescript
const isWeakness = masteryScore < threshold;
const weaknessGap = isWeakness ? threshold - masteryScore : 0;
```

**Result: ✅ PASS.** Thresholds match exactly. `isWeakness` uses strict less-than (`<`) consistent with the rule definition. `weaknessGap` correctly captures `threshold - masteryScore` (only when `isWeakness = true`), which is used for ranked ordering.

---

## 8. Weakness Map Tier Ordering (P4-033 §4)

### Rule (from P4-033 §4 and §4.1)
1. **Tier 1** — section-level weaknesses, ordered by `weaknessGap DESC`
2. **Tier 2** — skill-level `emerging` signals (non-low-coverage), ordered by `correctnessRatio ASC`
3. **Tier 3** — skill-level `developing` signals (non-low-coverage), ordered by `correctnessRatio ASC`
4. **Tier 4** — low-coverage weaknesses (`emerging` or `developing`), ordered by `correctnessRatio ASC`

### Implementation (`buildWeaknessMap`)
```typescript
// Tier 1
const sectionWeaknesses = sectionScores
  .filter((s) => s.isWeakness)
  .sort((a, b) => b.weaknessGap - a.weaknessGap);

// Tier 2
const emergingSkills = skillScores
  .filter((s) => s.signal === 'emerging' && !s.lowCoverage)
  .sort((a, b) => a.correctnessRatio - b.correctnessRatio);

// Tier 3
const developingSkills = skillScores
  .filter((s) => s.signal === 'developing' && !s.lowCoverage)
  .sort((a, b) => a.correctnessRatio - b.correctnessRatio);

// Tier 4
const lowCoverageWeaknesses = skillScores
  .filter((s) => s.lowCoverage && (s.signal === 'emerging' || s.signal === 'developing'))
  .sort((a, b) => a.correctnessRatio - b.correctnessRatio);
```

Final `priority` assigned as 1-based index after concatenation.

**Result: ✅ PASS.** Four tiers match the P4-033 ordering rules exactly. Low-coverage skills (`totalAnswered < 2`) are correctly isolated into Tier 4, preventing low-confidence signals from inflating priority.

**One minor note (non-blocking):** Tier 1 section-level entries use `section.skillCode` as both `skillCode` and `skillName` (placeholder). This is a known simplification — section-level skill display names are not separately stored in `skills`. Acceptable for Phase 4. A future task could join against a section_labels lookup if required.

---

## 9. `overallScore` Security Boundary

### Rule
`overallScore` is backend-internal only — never persisted in `placement_results`, never returned to Flutter.

### Implementation
In `PlacementResultService.createResult()`:
```typescript
const scoringResult = await this.scoring.scoreAttempt(attemptId);
// ... scoringResult.overallScore is used for level mapping only
// INSERT INTO placement_results: estimated_level, skill_mastery_map, weakness_map
// overallScore is NOT in the INSERT statement
```

The `placement_results` table stores: `estimated_level`, `skill_mastery_map`, `weakness_map`, `initial_path_id`.  
`overallScore` is computed in memory, passed to `mapScoreToLevel()`, and discarded.

**Result: ✅ PASS.** `overallScore` is never written to DB and never in any API response shape.

---

## 10. `is_correct` and `correct_answer` Security Boundary

### Rule
- `is_correct` is set by `PlacementAnswerValidationService` (P4-044) and used only by `PlacementScoringService` (P4-045). Never returned to Flutter.
- `correct_answer` is read from `placement_questions` only by the validation service. Never returned to Flutter.

### Implementation
`PlacementAnswerValidationService` updates `is_correct` in-place via `UPDATE placement_answers SET is_correct = ...`. The scoring service reads `is_correct` via SQL query but does not include it in `PlacementScoringResult`. The result service builds JSON payloads without `is_correct`.

The `PlacementResultReadService` (P4-048) exposes only `estimatedLevel`, `skillSummary[]` (with `signal` only), and `weaknesses[]` — confirmed by its type definitions.

**Result: ✅ PASS.**

---

## 11. Raw Scoring Fields Stripped Before Flutter Response

### Rule
Raw fields (`correctnessRatio`, `correctCount`, `totalAnswered`, `lowCoverage`, `skillKey`) must be stripped before any response reaching Flutter.

### Implementation
`PlacementResultService.buildSkillMasteryMapJson()` produces:
```json
{ "[skill_code]": { "total_questions": N, "correct_answers": N, "mastery_score": 0.XXXX } }
```

The `PlacementResultReadService` (P4-048) reads `skill_mastery_map` from the DB row and reshapes it to the student-safe `skillSummary[]` format: `{ skillCode, skillName, signal }` — raw counts and ratios are dropped.

**Result: ✅ PASS.**

---

## 12. `student_id` Authority

### Rule
`student_id` must be sourced from the attempt row — never from any client input.

### Implementation
```typescript
const attempt = attemptResult.rows[0];
// ...
INSERT INTO placement_results (... student_id ...) VALUES (... attempt.student_id ...)
```

`student_id` is taken from `placement_attempts.student_id`, which was set by the backend during attempt creation (P4-041) from the JWT.

**Result: ✅ PASS.**

---

## 13. No AIM Engine Runtime Integration

### Rule
Scoring must be deterministic, DB-only. No AIM Engine runtime, AI Teacher, or external inference service calls.

### Implementation
`PlacementScoringService` uses only `DatabaseService` (SQL queries). All computation is pure arithmetic on retrieved rows. No HTTP calls, no external services.

**Result: ✅ PASS.**

---

## 14. Idempotency Guard

### Rule
`createResult` should be safe to call twice (e.g., retry on network failure).

### Implementation
```typescript
if (attempt.status === 'completed') {
  const existing = await this.db.query(
    'SELECT id, estimated_level FROM placement_results WHERE placement_attempt_id = $1 LIMIT 1',
    [attemptId],
  );
  if ((existing.rowCount ?? 0) > 0) {
    return { resultId: existing.rows[0].id, ... };
  }
}
```

**Result: ✅ PASS.** Early return on `completed` status with existing result row. Prevents double-scoring.

---

## 15. Answer Validation Precondition

### Rule
`PlacementAnswerValidationService.validateAnswersForAttempt()` must run before scoring so `is_correct` is populated.

### Implementation
Call sequence enforced in `createResult`:
1. Check attempt is `submitted`
2. Call `answerValidation.validateAnswersForAttempt(attemptId)` — writes `is_correct`
3. Call `scoring.scoreAttempt(attemptId)` — reads `is_correct`

**Result: ✅ PASS.** Sequence is enforced within a single method — no way to call scoring without prior validation.

---

## 16. Known Limitations and Deferred Items

| Item | Severity | Notes |
|---|---|---|
| Section names in Tier-1 weakness entries use `skillCode` as `skillName` | Low | Cosmetic — admin-facing only. Flutter receives only `skillCode` and `signal`. Can be improved post-Phase 4 with a section label lookup. |
| No transaction wrapper around the validate → score → insert → update sequence | Low | If the process crashes between steps, a retry will re-score. The idempotency guard on `completed` status catches the fully-completed case; a partially-completed case (answers validated, result not yet written) would re-validate harmlessly. Consider wrapping in a DB transaction in Phase 5. |
| `SECTION_WEIGHTS` fallback of `?? 0` for unknown skill codes | Info | Safe — unknown sections contribute 0 weight. Only an issue if new sections are added without updating the weights constant. |
| `skill_mastery_map` JSONB stores section-level data (by `skill_code`), not individual skill-level data | Info | P4-014 §3 defines this shape. The skill-level detail is in `PlacementScoringResult.skillMasteryMap` but `buildSkillMasteryMapJson` only writes section aggregates. Skill-level detail is not currently in `placement_results` — this may matter for admin analytics in Phase 5+. |

---

## 17. Conclusion

The placement scoring implementation in P4-045 and P4-046 is **fully consistent** with the scoring rules defined in P4-031, P4-032, and P4-033. All 15 checks pass. The security boundary between backend-only scoring data and Flutter-visible fields is correctly maintained throughout the pipeline.

No changes to the implementation are required. The deferred items listed in §16 are non-blocking and suitable for Phase 5+ attention.
