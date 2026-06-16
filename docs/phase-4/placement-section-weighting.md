# Phase 4 — Placement Section Weighting Rules

> Phase 4 — P4-031
> Scope: Placement Test phase only.

---

## Purpose

This document defines how each placement test section contributes to the overall placement score. It ensures that the final score reflects a learner's balanced ability across grammar, vocabulary, and listening — with weights calibrated to the AIM platform's pedagogical priorities.

All weighting logic runs on the backend only. Flutter and other clients must never compute, replicate, or override section weights locally.

---

## 1. Section Weights

The Phase 4 placement test contains three sections. Each section contributes to the final placement score (0–100) according to the following weights:

| Section | Skill Area | Weight | Max Contribution |
|---|---|---|---|
| Grammar | Grammar & Verb Forms | 40% | 40 points |
| Vocabulary | Vocabulary & Reading | 35% | 35 points |
| Listening | Listening Comprehension | 25% | 25 points |

**Total weight: 100%. Total maximum score: 100 points.**

### 1.1 Rationale

- **Grammar (40%)** is weighted highest because grammatical accuracy is the most reliable predictor of CEFR level in the AIM curriculum's A1–B1 range.
- **Vocabulary (35%)** is the second highest contributor; lexical range and reading comprehension strongly differentiate A2 from B1.
- **Listening (25%)** is weighted lower because audio comprehension at A1–B1 is strongly correlated with grammar and vocabulary scores, reducing its marginal information value.

---

## 2. Section Score Calculation

### 2.1 Raw Section Score

Each section has 10 questions. Each correct answer scores 1 point; each incorrect answer or skip scores 0 points. The raw section score is the count of correct answers: **0–10**.

### 2.2 Weighted Section Contribution

```
section_contribution = (correct_answers / total_questions) × section_weight × 100
```

Where:
- `correct_answers` = number of questions answered correctly in the section (0–10)
- `total_questions` = 10 (fixed per section — see P4-029)
- `section_weight` = the decimal weight for the section (e.g. 0.40 for Grammar)

**Examples:**

| Section | Correct | Raw Score | Weight | Contribution |
|---|---|---|---|---|
| Grammar | 8/10 | 0.80 | 0.40 | 32.0 pts |
| Vocabulary | 6/10 | 0.60 | 0.35 | 21.0 pts |
| Listening | 5/10 | 0.50 | 0.25 | 12.5 pts |
| **Total** | | | | **65.5 → 66 pts** |

### 2.3 Final Score Rounding

The final placement score is the sum of all weighted section contributions, **rounded to the nearest integer**.

```
placement_score = round(grammar_contribution + vocabulary_contribution + listening_contribution)
```

- Rounding uses standard half-up rounding (0.5 rounds up).
- The result is always an integer in the range 0–100.
- The backend maps this score to a CEFR level using the thresholds in P4-030.

---

## 3. Skipped Sections

If a student abandons the test mid-way, any incomplete section is treated as follows:

| Situation | Treatment |
|---|---|
| Section started, some questions answered | Score = correct answers in that section only |
| Section not started at all | Score = 0 for that section |
| All sections incomplete | Score = 0; confidence = `insufficient` (see P4-030 §3) |

- Skipped sections reduce the placement score proportionally but do not invalidate the result.
- The backend still assigns a CEFR level from the partial score.
- The result is flagged with the appropriate confidence level (P4-030 §3).

---

## 4. Weight Configuration Rules

- Section weights are **backend configuration** — they are defined in this document and implemented as constants in the scoring service (P4-045).
- Weights must not be stored in the database or exposed via any API endpoint.
- Weights must not appear in Flutter source code, environment files, or any client-facing config.
- If weights are revised in a future phase, this document must be updated with a versioned change note, and the scoring service constants updated accordingly.

---

## 5. Pseudocode (Backend Only)

```
const SECTION_WEIGHTS = {
  grammar:    0.40,
  vocabulary: 0.35,
  listening:  0.25,
}

function computePlacementScore(sectionResults: SectionResults): int {
  let total = 0.0
  for section in [grammar, vocabulary, listening] {
    const raw = sectionResults[section].correctCount / 10
    total += raw * SECTION_WEIGHTS[section] * 100
  }
  return round(total)
}
```

This logic must be implemented server-side only (P4-045). It must not be reproduced in Flutter, the web app, or any client.

---

## 6. Flutter Rules

| Rule | Detail |
|---|---|
| No weights in client | Flutter must not contain `SECTION_WEIGHTS` or any equivalent constants |
| No score computation | Flutter must not compute `section_contribution` or `placement_score` |
| Display only | Flutter shows the `estimatedLevel` field from the placement result API |
| No raw scores exposed | Flutter must not receive per-section correct counts or raw contribution values |

---

## 7. Out of Scope

The following must not be defined here or added in Phase 4:

- Per-question weights or difficulty multipliers (defined in P4-032)
- Adaptive weight adjustment based on learner history
- B2, C1, or C2 section weights
- Speaking or writing section weights (deferred — see P4-036)
- AIM Engine runtime integration
- AI Teacher integration

---

## 8. References

- `docs/phase-4/placement-blueprint-rules.md` (P4-029)
- `docs/phase-4/placement-level-thresholds.md` (P4-030)
- `docs/phase-4/placement-result-definition.md` (P4-007)
- P4-032 — Define Skill Scoring Rules
- P4-045 — Implement Placement Scoring Service

---

## Metadata

| Field | Value |
|---|---|
| Task ID | P4-031 |
| Branch | phase4/P4-031-placement-section-weighting |
| Priority | P1 |
| Dependency | P4-029 |
| Output | docs/phase-4/placement-section-weighting.md |
