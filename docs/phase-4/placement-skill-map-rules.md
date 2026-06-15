# Phase 4 — Placement Skill Map Rules

## Purpose

This document defines the rules for how placement questions map to skills, and how the backend uses those mappings to produce a skill-level diagnostic signal from placement answers.

These rules ensure that placement results can produce meaningful skill-level data without invoking the AIM Engine runtime.

---

## Core Principle

Every placement question must be linked to at least one skill before it can contribute to the skill map. Questions without skill links are scored but do not influence the skill map.

---

## Rule 1 — Question-Skill Linking

### Rule

Every placement question that should contribute to the skill map must be linked to one or more skills in the placement_question_skills table before the test is published.

### Linking Constraints

| Constraint | Value |
|---|---|
| Minimum skills per question | 1 (if question contributes to skill map) |
| Maximum skills per question | 3 |
| Skills must exist in | The shared skills table from Phase 3 |
| Linking is done by | Admin only, via the admin skill linking UI (P4-057) |
| Linking is stored in | placement_question_skills table (P4-020) |

### Questions Without Skill Links

A question may exist without a skill link if it is used for general scoring only. Such questions:

- Are scored and contribute to the section score.
- Do not contribute to the skill map.
- Do not contribute to the weakness map.
- Must be explicitly marked as skill_linked: false in the admin UI.

---

## Rule 2 — Skill Signal Computation

### Rule

After a placement attempt is completed, the backend computes a correctness ratio for each skill and maps it to a signal value.

### Computation Steps

1. For each skill linked to at least one question in the test:
   - Collect all questions linked to this skill (placement_question_skills).
   - Collect all answers submitted by the learner for those questions (placement_answers).
   - Count correct answers and total answered questions for this skill.
   - Compute correctness ratio: correct_count / total_answered.

2. Map the correctness ratio to a signal:

| Correctness Ratio | Signal |
|---|---|
| 0.75 and above | strong |
| 0.40 to 0.74 | developing |
| Below 0.40 | emerging |

3. If a skill has zero linked questions answered, assign signal "emerging" by default.

### Signal Definitions

| Signal | Meaning |
|---|---|
| strong | Learner demonstrated solid placement-level ability in this skill |
| developing | Learner demonstrated partial placement-level ability in this skill |
| emerging | Learner demonstrated little or no placement-level ability in this skill |

### Important Limits

- Signal values reflect placement performance only — not lesson mastery.
- Signal values are not updated after placement is complete.
- Signal values are not recalculated by Flutter.
- Signal values are not produced by the AIM Engine runtime.

---

## Rule 3 — Multi-Skill Questions

### Rule

When a question is linked to more than one skill, the correctness of the answer contributes to the ratio of each linked skill independently.

### Example

Question Q1 is linked to skills: Grammar, Vocabulary.

- If the learner answers Q1 correctly:
  - Grammar receives +1 correct answer.
  - Vocabulary receives +1 correct answer.
- If the learner answers Q1 incorrectly:
  - Grammar receives +0 correct answers (total answered still increments).
  - Vocabulary receives +0 correct answers (total answered still increments).

---

## Rule 4 — Minimum Question Coverage

### Rule

A skill must have at least 2 questions linked to it within a placement test to produce a reliable signal. Skills with only 1 linked question produce a signal but it is marked as low_coverage: true in the result record.

| Coverage | Signal Reliability |
|---|---|
| 1 question | Signal generated, low_coverage: true |
| 2 or more questions | Signal generated, low_coverage: false |

The low_coverage flag is an internal backend field. It is not exposed to Flutter.

---

## Rule 5 — Skill Map Output Structure

### Rule

The backend writes the skill map as part of the placement_results record after scoring is complete.

### Skill Map Fields (Internal)

| Field | Type | Description |
|---|---|---|
| skill_id | UUID | Reference to skill from Phase 3 skills table |
| skill_name | String | Skill display name |
| correct_count | Integer | Number of correct answers for this skill |
| total_answered | Integer | Total questions answered for this skill |
| correctness_ratio | Decimal | correct_count / total_answered |
| signal | Enum | strong / developing / emerging |
| low_coverage | Boolean | True if fewer than 2 questions were linked |

### Flutter-Safe Output (via API)

Flutter receives only:

| Field | Description |
|---|---|
| skillId | UUID |
| skillName | Display name |
| signal | strong / developing / emerging |

Flutter never receives correct_count, total_answered, correctness_ratio, or low_coverage.

---

## Rule 6 — Skill Map Immutability

### Rule

Once written, the skill map for a completed placement attempt must not be modified.

- No retro-active recalculation is allowed.
- No admin override of signal values is allowed.
- If the learner retakes the placement (when permitted), a new attempt and new skill map are created — the old one is preserved.

---

## Rule 7 — Skill Source

### Rule

Skills used in placement question linking must come from the shared skills foundation established in Phase 3 (P3-006). Phase 4 does not create new skill definitions.

- Admin links questions to existing skills only.
- No new skill types are introduced in Phase 4.
- Placement skill signals feed into the weakness map and initial learning path but do not alter the skill definitions themselves.

---

## Relationship to Other Rules

| Rule Document | Relationship |
|---|---|
| docs/phase-4/placement-result-definition.md | Defines what skill map means in the result |
| P4-030 — CEFR Level Thresholds | Level is derived from section scores, not skill map |
| P4-032 — Skill Scoring Rules | Expands on signal computation thresholds |
| P4-033 — Weakness Map Rules | Uses skill map signals to identify weak skills |
| P4-034 — Initial Learning Path Rules | Uses weakness map to order the learning path |

---

## What This Rule Does Not Cover

- Lesson-level skill mastery (Phase 5+)
- AIM Engine runtime skill tracking
- AI Teacher skill inference
- Progress dashboard skill display
- Adaptive difficulty based on skill signals

---

## References

- docs/phase-3/lesson-skill-linking-rules.md — Phase 3 skill linking foundation (P3-006)
- docs/phase-4/placement-result-definition.md — Result semantics (P4-007)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule

---

## Metadata

| Field | Value |
|---|---|
| Task ID | P4-008 |
| Branch | phase4/P4-008-placement-skill-map-rules |
| Priority | P0 |
| Dependency | P3-006, P4-007 |
| Output | docs/phase-4/placement-skill-map-rules.md |