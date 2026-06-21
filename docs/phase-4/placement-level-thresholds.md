# Phase 4 — Placement Level Thresholds

> Phase 4 — P4-030
> Scope: Placement Test phase only.

---

## Purpose

This document defines the exact score thresholds used by the backend scoring service to assign an estimated CEFR level from a completed placement test. It ensures that level assignment is consistent, explainable, and deterministic.

All level assignment logic runs on the backend only. Flutter and other clients must never compute, estimate, or override the level locally.

---

## 1. Placement Score

### 1.1 Definition

The placement score is a single integer value in the range **0–100**, computed by the backend scoring service from a completed placement attempt.

It represents the learner's weighted performance across all placement test sections. The formula is defined in P4-031 (section weighting) and P4-032 (skill scoring).

### 1.2 Properties

- The score is always an integer: 0 to 100 inclusive.
- The score is computed once, immediately after the attempt is marked complete.
- The score does not change after the placement result is written.
- The score is a backend-internal value and is **never exposed to students**.

---

## 2. CEFR Level Thresholds

The backend maps the placement score to one of three CEFR levels using the following threshold table.

| Placement Score | Estimated Level | Meaning |
|---|---|---|
| 0 – 39 | A1 | Beginner — very limited English ability |
| 40 – 69 | A2 | Elementary — basic English ability |
| 70 – 100 | B1 | Intermediate — conversational English ability |

### 2.1 Threshold Rules

- Thresholds are **inclusive on both ends**: a score of 40 maps to A2; a score of 69 maps to A2; a score of 70 maps to B1.
- The minimum possible level is **A1**. A score of 0 returns A1.
- The maximum possible level in Phase 4 is **B1**. A score of 100 returns B1.
- B2, C1, and C2 are **out of scope for Phase 4**. They must not be returned by the scoring service or stored in placement results.
- If the placement score is null or cannot be computed (e.g. all questions skipped), the backend defaults to **A1** and records a `low_confidence` flag on the result.

### 2.2 Mapping Logic (Pseudocode)

```
function mapScoreToLevel(score: int): CefrLevel {
  if score >= 70 return "B1"
  if score >= 40 return "A2"
  return "A1"
}
```

This logic must be implemented server-side only. It must not be reproduced in Flutter, the web app, or any client.

---

## 3. Score Confidence

The backend attaches a confidence indicator to every placement result to help admin interpret results with few valid answers.

| Condition | Confidence |
|---|---|
| ≥ 20 of 30 questions answered (not skipped) | `normal` |
| 10–19 questions answered | `low` |
| < 10 questions answered | `very_low` |
| All questions skipped | `insufficient` |

- Confidence is a backend-internal field used for admin review only.
- Students are never shown the confidence indicator.
- A `low`, `very_low`, or `insufficient` confidence result still produces a valid estimated level — it is not withheld.
- Admin may use confidence to flag learners for manual re-testing in a future phase.

---

## 4. Flutter Display Rules

Flutter receives the estimated level label from the placement result API and displays it as-is. The following rules apply strictly:

| Rule | Detail |
|---|---|
| Display only | Flutter shows the `estimatedLevel` field (e.g. `"A2"`) from the API response |
| No recalculation | Flutter must not derive or adjust the level from any local data |
| No score exposure | Flutter must never receive, store, or display the raw placement score |
| No threshold logic | Flutter must not contain threshold constants or level-mapping functions |
| No confidence exposure | Flutter must not display the confidence indicator to students |

---

## 5. Admin Display Rules

Admin endpoints may expose additional fields for review purposes:

| Field | Admin Visible | Student Visible |
|---|---|---|
| `estimatedLevel` | ✅ | ✅ |
| `placementScore` | ✅ | ❌ |
| `confidence` | ✅ | ❌ |
| Raw section scores | ✅ | ❌ |
| Score thresholds | ❌ (config only) | ❌ |

Score thresholds are not stored in the database — they are backend configuration defined in this document. They must not be exposed via any API endpoint.

---

## 6. Future Phases

Phase 4 covers A1, A2, and B1 only. If B2, C1, or C2 levels are added in a future phase:

- New threshold ranges must be defined in a new versioned document.
- The scoring service must be updated with a migration or feature flag.
- This document must not be modified retroactively.
- The placement test blueprint (P4-029) must be updated to include higher-difficulty questions.

---

## 7. Out of Scope

The following must not be added here or in Phase 4:

- B2, C1, or C2 level thresholds
- Adaptive threshold adjustment based on learner history
- AIM Engine runtime integration
- Lesson delivery or practice session scoring
- AI Teacher integration
- Flutter-side level computation

---

## 8. References

- `docs/phase-4/placement-blueprint-rules.md` (P4-029)
- `docs/phase-4/placement-result-definition.md` (P4-007)
- `docs/phase-4/placement-skill-map-rules.md` (P4-008)
- P4-031 — Define Section Weighting Rules
- P4-032 — Define Skill Scoring Rules
- P4-045 — Implement Placement Scoring Service

---

## Metadata

| Field | Value |
|---|---|
| Task ID | P4-030 |
| Branch | phase4/P4-030-placement-level-thresholds |
| Priority | P0 |
| Dependency | P4-029 |
| Output | docs/phase-4/placement-level-thresholds.md |
