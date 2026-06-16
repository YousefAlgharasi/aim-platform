# Initial Learning Path Rules

> Phase 4 — P4-034
> Scope: Placement Test system only.

---

## 1. Purpose

This document defines exactly how the backend derives the **initial learning path** from a completed placement result. The initial learning path is a prioritised list of curriculum entry points — skills and sections — that tells the future lesson delivery system where to start the learner.

The initial learning path is produced once, immediately after the weakness map is written (P4-033). It is stored in the `initial_learning_path` table (P4-024) and is a foundational output of Phase 4.

The initial learning path is **not** lesson delivery, lesson scheduling, practice, or the progress dashboard. It is a starting point record. Actual lesson sequencing is out of scope for Phase 4.

All derivation logic runs on the backend only. Flutter must never compute, re-derive, or store the initial learning path locally.

---

## 2. Inputs

| Input | Source | Description |
|---|---|---|
| `weakness_map` | placement_results | Ranked list of weak sections and skills (P4-033) |
| `estimated_level` | placement_results | CEFR level assigned by scoring service (P4-030) |
| `skill_map` | placement_results | Per-skill signals from scoring (P4-032) |
| `skills` | skills table (P3-020) | Skill metadata — key, name, domain |
| Skill identifier convention | P3-006 | Dot-delimited stable skill keys |

No AIM Engine runtime call, AI Teacher recommendation, or external inference is used. All derivation is deterministic and based on placement result data only.

---

## 3. Derivation Rules

### 3.1 Primary Rule — Follow the Weakness Map

The initial learning path is derived directly from the weakness map, in rank order.

For each entry in the weakness map (rank 1, 2, 3, …):

1. If the entry is `type: section` — add the section's skill code as a path entry with priority equal to the weakness rank.
2. If the entry is `type: skill` — add the skill (by `skill_id` and `skill_key`) as a path entry with priority equal to the weakness rank.

The result is an ordered list of curriculum entry points, from highest to lowest priority.

### 3.2 Fallback Rule — Empty Weakness Map

If the weakness map is empty (the learner scored above all thresholds with all `strong` signals), the backend applies the following fallback:

- Set the first path entry to the section with the lowest mastery score (i.e. the section the learner found hardest even if they passed it).
- If all sections are tied, default to `grammar` as the first entry.
- Add remaining sections in ascending mastery order.

The fallback produces a non-empty path for all learners regardless of placement performance.

### 3.3 Estimated Level Annotation

Each path entry is annotated with the learner's `estimated_level` (A1, A2, or B1). This annotation is informational — it tells the future lesson delivery system the learner's starting level for that skill area.

The annotation does not alter the priority order. Priority is always determined by the weakness map rank (or fallback mastery order).

---

## 4. Path Entry Structure

### 4.1 Internal Path Entry (per entry in initial_learning_path table)

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, backend-generated |
| `placement_result_id` | UUID | FK to placement_results |
| `priority` | integer | Rank order (1 = highest priority); must be positive and unique per result |
| `entry_type` | enum | `section` or `skill` |
| `skill_code` | string | Section skill code (for section-type); null for skill-type |
| `skill_id` | UUID | FK to skills table (for skill-type); null for section-type |
| `skill_key` | string | Dot-delimited stable key from P3-006 (for skill-type); null for section-type |
| `skill_name` | string | Human-readable display name |
| `estimated_level` | enum | A1 / A2 / B1 — from placement_results |
| `source` | enum | `weakness_map` or `fallback` — indicates derivation source |
| `created_at` | TIMESTAMPTZ | Set by backend on creation |

### 4.2 Flutter-Safe Path Fields (via result API)

Flutter receives only the following fields per path entry:

| Field | Type | Description |
|---|---|---|
| `priority` | integer | Rank order |
| `entryType` | enum | `section` or `skill` |
| `skillName` | string | Display name |
| `estimatedLevel` | enum | A1 / A2 / B1 |

Fields never exposed to Flutter: `skill_id`, `skill_code`, `skill_key`, `source`, `placement_result_id`.

---

## 5. Skill Identifier Rules

Path entries that reference skills must use the stable dot-delimited skill key format established in P3-006:

```
domain.topic.skill.variant
```

Examples:
```
grammar.past_simple.forms
grammar.past_simple.negative_forms
vocabulary.travel.airport_checkin
listening.main_idea.short_dialogue
```

Rules inherited from P3-006:
- Skill keys must be stable across display name changes.
- Skill keys must be lowercase and dot-delimited.
- Display labels must not be used as primary identifiers in path records.
- Phase 4 does not create new skill key definitions — all keys come from the Phase 3 skills table.

---

## 6. Maximum Path Size

The initial learning path has no hard cap on entries. In practice:

- With 4 sections and up to ~20 skills, the path will typically contain 2–12 entries.
- All weakness map entries become path entries in rank order.
- Fallback entries add at most 4 entries (one per section).

No truncation is applied. The full ranked path is written to `initial_learning_path`.

---

## 7. Deduplication

If the same skill or section appears in the weakness map more than once (possible when a skill is linked to questions in multiple sections), it is included in the path only once — at its highest-priority occurrence.

Section-type entries take precedence over skill-type entries for the same skill code if both appear. The section-type entry is kept at the higher rank; the skill-type entry is dropped.

---

## 8. Immutability

Once written, the initial learning path for a completed placement result must not be modified.

- No retro-active recalculation is permitted.
- No admin override of path entries is permitted.
- If the learner retakes the placement (when permitted per P4-049), a new result is created with a new initial learning path. The original is preserved.

---

## 9. Relationship to Lesson Delivery

The initial learning path is a **starting-point record only**. It does not:

- Schedule lessons.
- Assign specific lesson IDs or content.
- Trigger AIM Engine runtime.
- Invoke AI Teacher recommendations.
- Create practice sessions.
- Update the progress dashboard.

The lesson delivery system (Phase 5+) will read the initial learning path to determine where to begin the learner's curriculum. How it uses the path is out of scope for Phase 4.

---

## 10. Data Flow

```
placement_answers
    ↓ (P4-032 skill scoring)
skill_map (per-skill signal)
    ↓ (P4-031 section scoring)
section_scores (per-section mastery)
    ↓ (P4-033 weakness map)
weakness_map (ranked weak sections and skills)
    ↓ (P4-034 — this document)
initial_learning_path (ordered curriculum entry points)
```

---

## 11. Backend Authority Rules

| Rule | Detail |
|---|---|
| Path derivation is backend-only | No client, Flutter, or admin API caller may trigger or override the path |
| Flutter receives display-safe subset only | No raw skill keys, IDs, or source flags are sent to Flutter |
| AIM Engine not involved | Path derivation uses only placement result data and the skills table |
| Path is written once | Triggered immediately when the placement result is finalised |
| Skill keys come from Phase 3 only | No new skill definitions are created in Phase 4 |

---

## 12. Out of Scope

The following must not be added here or in Phase 4 initial learning path logic:

- Lesson scheduling or lesson assignment (Phase 5+)
- AI Teacher path recommendation
- AIM Engine runtime path generation
- Progress dashboard path display or history
- Adaptive path adjustment based on lesson performance
- B2, C1, or C2 level path entries

---

## 13. References

- `docs/phase-4/placement-weakness-rules.md` — Weakness map rules (P4-033)
- `docs/phase-4/placement-skill-scoring-rules.md` — Skill signal computation (P4-032)
- `docs/phase-4/placement-section-weighting.md` — Section mastery and thresholds (P4-031)
- `docs/phase-4/placement-level-thresholds.md` — CEFR level mapping (P4-030)
- `docs/phase-3/lesson-skill-linking-rules.md` — Skill key format foundation (P3-006)
- `docs/phase-4/placement-result-definition.md` — Result semantics (P4-007)
- `docs/phase-4/placement-test-charter.md` — Phase 4 scope boundary
- `docs/phase-4/no-aim-runtime-rule.md` — No AIM Engine runtime rule
- P4-024 — Create Initial Learning Path Migration (DB table)
- P4-047 — Implement Initial Learning Path Service (backend implementation)
- `packages/shared-contracts/api/placement-result-contracts.md` — Result contract (P4-014)

---

## 14. Metadata

| Field | Value |
|---|---|
| Task ID | P4-034 |
| Branch | phase4/P4-034-placement-initial-learning-path-rules |
| Priority | P0 |
| Dependency | P4-033, P3-006 |
| Output | docs/phase-4/initial-learning-path-rules.md |
