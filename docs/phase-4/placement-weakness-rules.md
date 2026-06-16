# Placement Weakness Map Rules

> Phase 4 — P4-033
> Scope: Placement Test system only.

---

## 1. Purpose

This document defines exactly how the backend identifies weak skills and produces the **weakness map** from a completed placement attempt — without invoking the AIM Engine runtime, AI Teacher, or any external inference service.

The weakness map is a ranked list of skills the learner struggled with during placement. It feeds directly into the initial learning path (P4-034) and is stored as part of the `placement_results` record.

All weakness map computation runs on the backend only. Flutter must never compute, re-derive, or store the weakness map locally.

---

## 2. Inputs

The weakness map is produced immediately after skill scoring (P4-032) completes. It consumes:

| Input | Source | Description |
|---|---|---|
| Skill map | placement_results (skill_map field) | Per-skill signals computed by P4-032 |
| Section mastery scores | placement_results (section_scores field) | Per-section correct ratio computed by P4-031 |
| Section weakness thresholds | Backend config (P4-031 §3) | Fixed thresholds per section skill code |
| Skill signal thresholds | Backend config (P4-032 §4.2) | `emerging` and `developing` signal definitions |

No external service call is required. All inputs come from tables populated during the attempt.

---

## 3. Weakness Identification

### 3.1 Section-Level Weakness

A section is identified as a weakness when its mastery score falls below its fixed threshold (defined in P4-031 §3).

| Section | Skill Code | Weakness Threshold |
|---|---|---|
| Grammar | `grammar` | < 0.60 |
| Vocabulary | `vocabulary` | < 0.60 |
| Reading | `reading` | < 0.55 |
| Listening | `listening` | < 0.55 |

- `mastery_score = correct_answers_in_section / total_questions_in_section`
- A section where `mastery_score < threshold` is a **section-level weakness**.
- Section-level weaknesses are always included in the weakness map at the top of the ranked list.

### 3.2 Skill-Level Weakness

Within each section, individual skills are identified as weaknesses when their signal (P4-032 §4.2) is `emerging` or `developing`.

| Signal | Included in Weakness Map? |
|---|---|
| `strong` | No |
| `developing` | Yes — lower priority than section weakness |
| `emerging` | Yes — higher priority than `developing` |

- A skill signal of `strong` means the learner demonstrated solid ability; it is not a weakness.
- Both `emerging` and `developing` signals indicate need for attention and are included.
- Skills with `low_coverage: true` (fewer than 2 questions answered) are included if their signal is `emerging` or `developing`, but are ranked last within their priority tier.

---

## 4. Weakness Ranking

The backend ranks all identified weaknesses into a single ordered list. The ranking rules are applied in strict priority order.

### 4.1 Priority Order

1. **Section-level weaknesses first** — ordered by gap size (largest gap between threshold and mastery score = highest priority).
2. **Skill-level `emerging` signals** — ordered by correctness ratio ascending (lowest ratio = highest priority within this tier).
3. **Skill-level `developing` signals** — ordered by correctness ratio ascending.
4. **Low-coverage weaknesses** — appended last within their signal tier.

### 4.2 Gap Calculation (Section-Level)

```
gap = threshold - mastery_score
```

The section with the largest `gap` is ranked first among section-level weaknesses.

**Example:**

| Section | Threshold | Mastery Score | Gap | Rank |
|---|---|---|---|---|
| Grammar | 0.60 | 0.30 | 0.30 | 1st |
| Vocabulary | 0.60 | 0.50 | 0.10 | 2nd |
| Listening | 0.55 | 0.60 | — (no weakness) | — |
| Reading | 0.55 | 0.40 | 0.15 | — (skill-level only) |

> Note: Reading is below its section threshold (0.40 < 0.55), gap = 0.15. In this example it would rank 2nd after Grammar if Vocabulary were not also a weakness — or 3rd overall.

### 4.3 Tie-Breaking

- If two sections have the same gap, the section with the lower `skill_code` alphabetically is ranked first (deterministic ordering).
- If two skills have the same `correctness_ratio`, the skill with the lower `skill_key` alphabetically is ranked first.

---

## 5. Weakness Map Output Structure

### 5.1 Internal Weakness Map Record (per entry)

| Field | Type | Description |
|---|---|---|
| `rank` | integer | Position in the weakness list (1 = highest priority) |
| `type` | enum | `section` or `skill` |
| `skill_code` | string | Section skill code (`grammar`, `vocabulary`, `reading`, `listening`) for section-type; `skill_key` for skill-type |
| `skill_id` | UUID | Only for skill-type entries; null for section-type |
| `skill_name` | string | Display name |
| `signal` | enum | `emerging` or `developing` (for skill-type); null for section-type |
| `mastery_score` | decimal | Section mastery (for section-type); `correctness_ratio` (for skill-type) |
| `gap` | decimal | `threshold - mastery_score` (section-type only); null for skill-type |
| `low_coverage` | boolean | True if fewer than 2 questions answered (skill-type only) |

### 5.2 Flutter-Safe Weakness Map Fields (via result API)

Flutter receives only the following fields per weakness entry:

| Field | Type | Description |
|---|---|---|
| `rank` | integer | Priority rank |
| `type` | enum | `section` or `skill` |
| `skillName` | string | Display name |
| `signal` | enum | `emerging` / `developing` / null (for section-type) |

Fields never exposed to Flutter: `mastery_score`, `gap`, `low_coverage`, `skill_id`, `skill_code`, `skill_key`, raw threshold values.

---

## 6. Empty Weakness Map

If the learner scores above all section thresholds and all skill signals are `strong`, the weakness map is empty.

- An empty weakness map is valid and must be written as an empty array `[]` to `placement_results`.
- The initial learning path (P4-034) handles an empty weakness map by defaulting to a general curriculum start.
- Flutter must not interpret an empty weakness map as an error.

---

## 7. Maximum Weakness Map Size

The weakness map has no hard cap on the number of entries. In practice, with 4 sections and up to approximately 20 distinct skills across a 30-question test, the map will typically contain 2–10 entries.

No truncation is applied. The full ranked list is written to `placement_results` and passed to the initial learning path service.

---

## 8. Relationship to Section Mastery and Skill Signals

The weakness map unifies section-level and skill-level signals into a single ranked list. The hierarchy is:

```
placement_answers
    ↓ (P4-032 skill scoring)
skill_map (per-skill correctness ratio → signal)
    ↓ (P4-031 section weighting)
section_scores (per-section mastery_score)
    ↓ (P4-033 — this document)
weakness_map (ranked list of weak sections and skills)
    ↓ (P4-034 initial learning path)
initial_learning_path (ordered curriculum entry points)
```

---

## 9. Immutability

Once written, the weakness map for a completed placement attempt must not be modified.

- No retro-active recalculation is permitted.
- No admin override of weakness entries is permitted.
- If the learner retakes the placement (when permitted per P4-049), a new attempt produces a new weakness map. The original is preserved.

---

## 10. Backend Authority Rules

| Rule | Detail |
|---|---|
| Weakness identification is backend-only | No client, Flutter, or admin API caller may trigger or override the weakness map |
| Thresholds are backend config | Not stored in the database; not exposed via any API |
| Flutter receives a display-safe subset | No raw scores, gaps, or thresholds are sent to Flutter |
| AIM Engine not involved | Weakness map uses only placement tables and backend config constants |
| Computation runs once | Triggered immediately when attempt scoring completes |

---

## 11. Out of Scope

The following must not be added here or in Phase 4 weakness map logic:

- Lesson-level weakness tracking (Phase 5+)
- AIM Engine runtime weakness inference or adaptive adjustment
- AI Teacher weakness recommendation
- Progress dashboard weakness history
- Weakness derived from practice sessions or lesson performance
- B2, C1, or C2 level weakness criteria

---

## 12. References

- `docs/phase-4/placement-skill-scoring-rules.md` — Skill signal computation (P4-032)
- `docs/phase-4/placement-section-weighting.md` — Section thresholds and mastery formula (P4-031)
- `docs/phase-4/placement-skill-map-rules.md` — Question-to-skill linking rules (P4-008)
- `docs/phase-4/placement-level-thresholds.md` — CEFR level mapping (P4-030)
- `docs/phase-4/placement-result-definition.md` — Result semantics (P4-007)
- `docs/phase-4/placement-test-charter.md` — Phase 4 scope boundary
- `docs/phase-4/no-aim-runtime-rule.md` — No AIM Engine runtime rule
- P4-034 — Define Initial Learning Path Rules (consumer of this document)
- P4-045 — Implement Placement Scoring Service (backend implementation)
- P4-046 — Implement Placement Result Service (writes weakness map to result)

---

## 13. Metadata

| Field | Value |
|---|---|
| Task ID | P4-033 |
| Branch | phase4/P4-033-placement-weakness-rules |
| Priority | P0 |
| Dependency | P4-032 |
| Output | docs/phase-4/placement-weakness-rules.md |
