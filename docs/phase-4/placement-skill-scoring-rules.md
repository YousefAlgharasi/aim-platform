# Placement Skill Scoring Rules

> Phase 4 — P4-032
> Scope: Placement Test system only.

---

## 1. Purpose

This document defines exactly how the backend computes skill-level scores from a completed placement attempt. It specifies the inputs, computation steps, signal thresholds, edge cases, and the fields written to the placement result.

Skill scoring produces the **skill mastery map** — a per-skill correctness signal that feeds directly into the weakness map (P4-033) and the initial learning path (P4-034).

All skill scoring runs on the backend only. Flutter must never recompute, re-derive, or store skill scores or signals locally.

---

## 2. Inputs

The skill scoring service receives the following inputs after an attempt is marked complete:

| Input | Source | Description |
|---|---|---|
| `placement_attempt_id` | placement_attempts | The completed attempt being scored |
| `placement_answers` | placement_answers | All answers submitted during the attempt |
| `placement_question_skills` | placement_question_skills | Skill links for every question in the test |
| `skills` | skills (P3-020) | Skill display metadata (name, key) |

The scoring service must not call the AIM Engine runtime, AI Teacher, or any external inference service. All computation is deterministic and based solely on the above tables.

---

## 3. Section Score (Per-Section Mastery)

Before skill scoring, the backend computes a raw mastery score per section. This feeds section weighting (P4-031) and also anchors the skill scores to the same denominator.

### 3.1 Section Mastery Formula

```
section_mastery_score = correct_answers_in_section / total_questions_in_section
```

- `correct_answers_in_section` — count of `placement_answers` rows where `is_correct = true` for questions belonging to this section.
- `total_questions_in_section` — total question count for the section (always 10 per blueprint, P4-029 §2.2).
- Result is a decimal in range **0.00 – 1.00**.
- A skipped question counts as incorrect (`is_correct = false`).

### 3.2 Section Score Table

| Section | Skill Code | Total Questions |
|---|---|---|
| Grammar | `grammar` | 10 |
| Vocabulary | `vocabulary` | 10 |
| Reading | `reading` | 10 |
| Listening | `listening` | 10 |

---

## 4. Skill-Level Score Computation

After section scores are computed, the backend produces a per-skill signal from the `placement_question_skills` mapping.

### 4.1 Steps

For each skill that has at least one question linked in this test:

1. **Collect linked questions** — query `placement_question_skills` for all rows where `placement_question_id` belongs to the current attempt's test and `skill_id` matches the current skill.

2. **Collect answers** — from `placement_answers`, find all rows where `placement_question_id` is in the set from step 1 and `placement_attempt_id` matches.

3. **Count** — compute:
   - `correct_count` = number of answers where `is_correct = true`
   - `total_answered` = total number of answers retrieved (skipped questions are included with `is_correct = false`)

4. **Compute correctness ratio**:
   ```
   correctness_ratio = correct_count / total_answered
   ```
   - If `total_answered = 0` (no answers for this skill), set `correctness_ratio = 0.0` and `signal = "emerging"`.

5. **Map to signal** using the threshold table in §4.2.

6. **Record coverage** — if `total_answered < 2`, set `low_coverage = true`.

### 4.2 Signal Threshold Table

| Correctness Ratio | Signal |
|---|---|
| 0.75 and above | `strong` |
| 0.40 to 0.74 | `developing` |
| Below 0.40 | `emerging` |

Thresholds are **inclusive on the lower bound**: a ratio of exactly 0.75 maps to `strong`; a ratio of exactly 0.40 maps to `developing`.

### 4.3 Signal Definitions

| Signal | Meaning |
|---|---|
| `strong` | Learner demonstrated solid placement-level ability in this skill |
| `developing` | Learner demonstrated partial placement-level ability in this skill |
| `emerging` | Learner demonstrated little or no placement-level ability in this skill |

Signals reflect placement performance only. They do not represent lesson mastery or longitudinal proficiency.

---

## 5. Multi-Skill Question Handling

A placement question may be linked to more than one skill (up to 3 per P4-008 Rule 1). When a question is linked to multiple skills, its answer contributes independently to each linked skill's score.

### 5.1 Rule

- A correct answer to question Q linked to skills S1 and S2 increments `correct_count` for both S1 and S2.
- An incorrect or skipped answer to Q increments `total_answered` for both S1 and S2 but does not increment `correct_count` for either.

### 5.2 Example

Question Q1 is linked to skills: Grammar (S1), Vocabulary (S2).

| Event | S1 correct_count | S1 total_answered | S2 correct_count | S2 total_answered |
|---|---|---|---|---|
| Q1 answered correctly | +1 | +1 | +1 | +1 |
| Q1 answered incorrectly | +0 | +1 | +0 | +1 |
| Q1 skipped | +0 | +1 | +0 | +1 |

---

## 6. Primary vs. Secondary Skill Links

Each placement question must have exactly one `is_primary = true` skill link (enforced at activation — see P4-020). Additional links with `is_primary = false` are secondary.

- All linked skills (primary and secondary) receive the answer contribution per §4 and §5.
- The `is_primary` flag is used by the weakness map (P4-033) to prioritise which skill to surface when a question is linked to multiple skills.
- Skill scoring itself does not differentiate between primary and secondary links when computing correctness ratio — both are treated equally.

---

## 7. Coverage Rules

### 7.1 Minimum Coverage

A skill must have at least 2 questions answered to produce a reliable signal.

| Questions Answered | Coverage Flag |
|---|---|
| 0 | `low_coverage: true`, signal forced to `"emerging"` |
| 1 | `low_coverage: true`, signal computed normally |
| 2 or more | `low_coverage: false`, signal computed normally |

### 7.2 Low Coverage Handling

- `low_coverage` is a backend-internal field written to the skill map record.
- It is never exposed to Flutter or shown to students.
- Admin endpoints may expose `low_coverage` for review purposes.
- A low-coverage signal is still written — it is not withheld.

---

## 8. Unlinked Questions

Questions that exist in a placement section but have no entry in `placement_question_skills` are scored for section mastery (§3) but do not contribute to any skill's correctness ratio.

- Such questions increment `total_questions_in_section` for section mastery.
- They do not appear in any skill's `total_answered` count.
- They do not influence the skill map or weakness map.

Unlinked questions should not exist in a published test — the backend must warn admin if any live questions are unlinked at publish time (enforcement belongs to the admin activation endpoint).

---

## 9. Skill Score Output Structure

The backend writes the skill map as part of the `placement_results` record.

### 9.1 Internal Skill Score Record (per skill)

| Field | Type | Description |
|---|---|---|
| `skill_id` | UUID | Reference to skill from Phase 3 skills table |
| `skill_key` | string | Stable dot-delimited skill key (e.g. `grammar.past_simple.forms`) |
| `skill_name` | string | Human-readable display name |
| `correct_count` | integer | Count of correct answers for this skill |
| `total_answered` | integer | Count of questions answered (including skips) |
| `correctness_ratio` | decimal | `correct_count / total_answered`, or `0.0` if no answers |
| `signal` | enum | `strong` / `developing` / `emerging` |
| `low_coverage` | boolean | True if `total_answered < 2` |

### 9.2 Flutter-Safe Skill Score Fields (via result API)

Flutter receives only the following fields per skill:

| Field | Type | Description |
|---|---|---|
| `skillId` | UUID | |
| `skillName` | string | Display name |
| `signal` | enum | `strong` / `developing` / `emerging` |

Fields never exposed to Flutter: `correct_count`, `total_answered`, `correctness_ratio`, `low_coverage`, `skill_key`.

---

## 10. Immutability

Once written, the skill map for a completed attempt must not be modified.

- No retro-active recalculation is permitted.
- No admin override of individual signal values is permitted.
- If the learner retakes the placement (when retake is permitted per P4-049), a new attempt is created with a new skill map. The original is preserved.

---

## 11. Backend Authority Rules

| Rule | Detail |
|---|---|
| Skill scoring is backend-only | No client, Flutter, or admin API caller may trigger or override scoring |
| Signal thresholds are backend config | They are not stored in the database and must not be exposed via any API |
| Flutter receives signals, not scores | Raw `correctness_ratio` and `correct_count` are never sent to Flutter |
| AIM Engine not involved | Skill scoring uses only placement tables and the shared skills table |
| Scoring runs once | Triggered immediately when the attempt is marked complete |

---

## 12. Relationship to Other Rules

| Document | Relationship |
|---|---|
| `docs/phase-4/placement-skill-map-rules.md` (P4-008) | Defines question-to-skill linking and signal definitions |
| `docs/phase-4/placement-level-thresholds.md` (P4-030) | Defines CEFR level mapping from overall placement score |
| `docs/phase-4/placement-section-weighting.md` (P4-031) | Defines section weights used in overall placement score formula |
| P4-033 — Define Weakness Map Rules | Consumes skill signals to identify and rank weak skills |
| P4-034 — Define Initial Learning Path Rules | Consumes weakness map to order the initial learning path |
| P4-045 — Implement Placement Scoring Service | Backend implementation of the rules in this document |

---

## 13. Out of Scope

The following must not be implemented here or referenced from Phase 4 skill scoring:

- Lesson-level skill mastery (Phase 5+)
- AIM Engine runtime skill tracking or adaptive difficulty
- AI Teacher skill inference
- Progress dashboard skill display or history
- Student Web App skill score visualisation
- B2, C1, or C2 level skill scoring

---

## 14. References

- `docs/phase-4/placement-skill-map-rules.md` — Question-to-skill linking rules (P4-008)
- `docs/phase-4/placement-level-thresholds.md` — CEFR level thresholds (P4-030)
- `docs/phase-4/placement-section-weighting.md` — Section weighting (P4-031)
- `docs/phase-4/placement-blueprint-rules.md` — Test structure (P4-029)
- `docs/phase-4/placement-result-definition.md` — Result semantics (P4-007)
- `docs/phase-4/placement-test-charter.md` — Phase 4 scope boundary
- `docs/phase-4/no-aim-runtime-rule.md` — No AIM Engine runtime rule
- `packages/shared-contracts/api/placement-result-contracts.md` — Result contract (P4-014)

---

## 15. Metadata

| Field | Value |
|---|---|
| Task ID | P4-032 |
| Branch | phase4/P4-032-placement-skill-scoring-rules |
| Priority | P0 |
| Dependency | P4-008, P4-030 |
| Output | docs/phase-4/placement-skill-scoring-rules.md |
