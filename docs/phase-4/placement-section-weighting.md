# Placement Section Weighting Rules

> Phase 4 — P4-031
> Scope: Section weighting for placement test scoring only.

---

## 1. Overview

This document defines how each placement test section contributes to the overall placement output. It covers section weights, mastery thresholds, and how backend uses weights to compute the estimated level and weakness map.

All backend implementations must conform to this document. Flutter must never calculate or apply section weights — this is backend authority only.

---

## 2. Section Weights

Each skill section has a fixed weight that determines its contribution to the overall placement score.

| Section | Skill Code | Weight |
|---|---|---|
| Grammar | grammar | 30% |
| Vocabulary | vocabulary | 30% |
| Reading | reading | 25% |
| Listening | listening | 15% |

Total weight: 100%

### 2.1 Weight Rules

- Weights are fixed and defined by this document — admin cannot change them at runtime.
- Weights must always sum to 100%.
- Backend applies weights when computing the overall placement score after attempt completion.
- Flutter must never receive, store, or apply weight values.

---

## 3. Mastery Thresholds

Each section has a mastery threshold. If a student's mastery score falls below the threshold, the section is flagged as a weakness.

| Section | Skill Code | Weakness Threshold |
|---|---|---|
| Grammar | grammar | < 0.60 (60%) |
| Vocabulary | vocabulary | < 0.60 (60%) |
| Reading | reading | < 0.55 (55%) |
| Listening | listening | < 0.55 (55%) |

### 3.1 Threshold Rules

- Thresholds are fixed — admin cannot change them at runtime.
- A section is flagged as a weakness if mastery_score < threshold.
- Backend populates the weakness_map with all sections below their threshold.
- Weakness priority is ordered by the gap between threshold and actual score (largest gap = highest priority).

---

## 4. Weighted Score Computation

Backend computes the overall weighted score as follows:

1. For each section: compute mastery_score = correct_answers / total_questions
2. Multiply mastery_score by the section weight
3. Sum all weighted scores to get the overall placement score

Example:

| Section | Mastery Score | Weight | Weighted Score |
|---|---|---|---|
| Grammar | 0.70 | 30% | 0.21 |
| Vocabulary | 0.50 | 30% | 0.15 |
| Reading | 0.80 | 25% | 0.20 |
| Listening | 0.60 | 15% | 0.09 |
| **Total** | | | **0.65** |

---

## 5. Level Assignment from Weighted Score

Backend maps the overall weighted score to an estimated level:

| Score Range | Estimated Level |
|---|---|
| 0.00 — 0.39 | beginner |
| 0.40 — 0.54 | elementary |
| 0.55 — 0.69 | intermediate |
| 0.70 — 0.84 | upper_intermediate |
| 0.85 — 1.00 | advanced |

### 5.1 Level Assignment Rules

- Backend is the sole authority for level assignment.
- Flutter must never compute or infer the estimated level.
- Level is stored in placement_results.estimated_level after attempt completion.

---

## 6. Backend Authority Rules

- Backend owns all weight values, thresholds, and score computation.
- Flutter receives only the final estimated_level, skill_mastery_map, and weakness_map from the result endpoint.
- No weight or threshold value is ever exposed to Flutter or the student.
- Changes to weights or thresholds require a backend deployment — they are not stored in the database.

---

## 7. Out of Scope

The following are explicitly excluded from this document:

- AIM Engine runtime scoring
- Lesson or practice section weighting
- AI Teacher scoring
- Progress dashboard weighting
- Student Web App score display

---

## 8. References

- docs/phase-4/placement-result-definition.md — Result semantics (P4-007)
- docs/phase-4/placement-blueprint-rules.md — Blueprint rules (P4-029)
- packages/shared-contracts/api/placement-result-contracts.md — Result contract (P4-014)
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule

---

## 9. Metadata

| Field | Value |
|---|---|
| Task ID | P4-031 |
| Branch | phase4/P4-031-placement-section-weighting |
| Priority | P1 |
| Dependency | P4-029 |
| Output | docs/phase-4/placement-section-weighting.md |