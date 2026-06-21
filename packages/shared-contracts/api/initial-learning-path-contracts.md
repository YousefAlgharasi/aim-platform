# Initial Learning Path Contract

> Phase 4 — P4-015
> Scope: Placement Test system only. Handoff contract from placement result to future lesson delivery.

---

## 1. Overview

This document defines the shared contract for the initial learning path generated after a completed
placement test in the AIM Platform. It covers the structure, fields, derivation rules, API shape,
Flutter-safe fields, and backend authority rules for the initial learning path output.

The initial learning path is produced once by the backend immediately after a placement result is
finalised. It is a prioritised list of curriculum entry points — skills and sections — that tells
the future lesson delivery system (Phase 5+) where to start the learner.

This contract does not cover lesson delivery, lesson scheduling, AI Teacher, AIM Engine runtime,
practice sessions, recommendations, or the progress dashboard.

---

## 2. Purpose and Scope

### 2.1 What This Contract Covers

- The shape and fields of each initial learning path entry.
- The API response Flutter receives after a placement is completed.
- Backend authority rules for path derivation and immutability.
- Flutter display rules and safe field subset.
- Error codes for path retrieval.

### 2.2 What This Contract Does Not Cover

- How the backend derives the path (see `docs/phase-4/initial-learning-path-rules.md` — P4-034).
- Lesson scheduling or lesson assignment (Phase 5+).
- AI Teacher path recommendation.
- AIM Engine runtime path generation.
- Progress dashboard path display or history.
- Adaptive path adjustment based on lesson performance.

---

## 3. Initial Learning Path Record

### 3.1 Internal Fields (Backend / Database)

Each entry in the `initial_learning_path` table represents one ordered curriculum entry point.

| Field                | Type        | Writable | Description                                                                 |
|----------------------|-------------|----------|-----------------------------------------------------------------------------|
| `id`                 | UUID        | No       | Primary key, backend-generated                                              |
| `placement_result_id`| UUID        | No       | Foreign key to `placement_results`                                          |
| `priority`           | integer     | No       | Rank order (1 = highest priority); positive, unique per result              |
| `entry_type`         | enum        | No       | `section` or `skill`                                                        |
| `skill_code`         | string      | No       | Section skill code for `section`-type entries; null for `skill`-type        |
| `skill_id`           | UUID        | No       | FK to `skills` table for `skill`-type entries; null for `section`-type      |
| `skill_key`          | string      | No       | Dot-delimited stable key (P3-006) for `skill`-type; null for `section`-type |
| `skill_name`         | string      | No       | Human-readable display name                                                 |
| `estimated_level`    | enum        | No       | `A1`, `A2`, or `B1` — copied from `placement_results`                      |
| `source`             | enum        | No       | `weakness_map` or `fallback` — indicates derivation source                  |
| `created_at`         | TIMESTAMPTZ | No       | Set by backend on creation; never modified                                  |

### 3.2 Rules

- All fields are backend-controlled. Flutter cannot write, modify, or override any field.
- The path is derived deterministically from the weakness map and estimated level (P4-034).
- No AIM Engine runtime call, AI Teacher recommendation, or external inference is used.
- Once written, the path is immutable. No retro-active recalculation or admin override is permitted.
- If the learner retakes placement (P4-049), a new result and new path are created; the original is preserved.

### 3.3 Entry Type Values

| Value     | Description                                              |
|-----------|----------------------------------------------------------|
| `section` | Entry targets a placement section by skill code          |
| `skill`   | Entry targets a specific skill by `skill_id`/`skill_key` |

### 3.4 Estimated Level Values

| Value | Description                                   |
|-------|-----------------------------------------------|
| `A1`  | Beginner — very limited English ability        |
| `A2`  | Elementary — basic English ability             |
| `B1`  | Intermediate — conversational English ability  |

B2, C1, and C2 are out of scope for Phase 4 and must not appear in any path entry.

---

## 4. Flutter-Safe Fields

Flutter receives only the following fields per path entry. Internal identifiers, skill keys,
derivation source flags, and raw IDs are never sent to the client.

| Field            | Type    | Description                                              |
|------------------|---------|----------------------------------------------------------|
| `priority`       | integer | Rank order (1 = highest priority)                        |
| `entryType`      | enum    | `section` or `skill`                                     |
| `skillName`      | string  | Human-readable display name                              |
| `estimatedLevel` | enum    | `A1`, `A2`, or `B1`                                     |

Fields **never** exposed to Flutter:

| Field                 | Reason                                    |
|-----------------------|-------------------------------------------|
| `id`                  | Internal primary key                      |
| `placement_result_id` | Internal FK                               |
| `skill_id`            | Internal FK — not safe for client         |
| `skill_code`          | Internal identifier                       |
| `skill_key`           | Dot-delimited internal key                |
| `source`              | Internal derivation metadata              |
| `created_at`          | Not needed for display                    |

---

## 5. API Contract

### 5.1 Endpoint

The initial learning path is returned as part of the placement result response.

```
GET /api/v1/placement/attempts/:id/result
```

Auth: Student session required. The student must own the attempt.

Available only after attempt `status = completed`.

### 5.2 Success Response

```json
{
  "resultId": "uuid",
  "attemptId": "uuid",
  "estimatedLevel": "A2",
  "skillSummary": [
    { "skillName": "Grammar",    "signal": "developing" },
    { "skillName": "Vocabulary", "signal": "developing" },
    { "skillName": "Reading",    "signal": "emerging"   }
  ],
  "initialPath": [
    {
      "priority": 1,
      "entryType": "section",
      "skillName": "Vocabulary",
      "estimatedLevel": "A2"
# Initial Learning Path Contracts

> Phase 4 — P4-015
> Scope: Placement Test system only.

---

## 1. Purpose

Defines the shared contract for the initial learning path — a prioritised list of curriculum entry points derived from the placement result. Produced once per completed placement attempt by backend only.

---

## 2. Data Model

### 2.1 InitialLearningPathEntry (backend-internal)

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| placement_result_id | UUID | FK to placement_results |
| priority | integer | Rank order (1 = highest priority) |
| entry_type | enum | `section` or `skill` |
| skill_code | string | null | Dot-delimited skill identifier (backend only) |
| skill_id | UUID | null | FK to skills table (backend only) |
| skill_key | string | null | Stable skill key (backend only) |
| estimated_level | string | CEFR level context for this entry |
| source | string | `weakness_map` or `fallback` |
| created_at | timestamp | Auto-set |

### 2.2 Student-Safe Fields (returned to Flutter)

| Field | Returned | Reason |
|---|---|---|
| priority | yes | Display ordering |
| entry_type | yes | UI needs to distinguish sections vs skills |
| skill_name | yes | Human-readable label for display |
| estimated_level | yes | Context for student |
| skill_code | **never** | Internal identifier |
| skill_id | **never** | Internal FK |
| skill_key | **never** | Internal key |
| source | **never** | Internal derivation metadata |

---

## 3. API Endpoints

### 3.1 Read Initial Learning Path

Embedded in placement result response (P4-048 / P4-014).

No standalone endpoint — the initial path is returned as part of the placement result when `initialPathReady = true`.

### 3.2 Creation

Backend-only. Triggered automatically after `PlacementResultService.createResult()` completes (P4-046 -> P4-047 pipeline). No client can trigger creation directly.

---

## 4. Response Shape (Student-Safe)

Returned as `initialPath` array inside placement result response:

```json
{
  "initialPathReady": true,
  "initialPath": [
    {
      "priority": 1,
      "entryType": "skill",
      "skillName": "Past Simple — Negative Forms",
      "estimatedLevel": "A1"
    },
    {
      "priority": 2,
      "entryType": "section",
      "skillName": "Reading",
      "estimatedLevel": "A2"
    },
    {
      "priority": 3,
      "entryType": "skill",
      "skillName": "Listening — Main Idea",
      "estimatedLevel": "A2"
    }
  ],
  "initialPathReady": true,
  "completedAt": "2026-06-16T10:25:00Z"
}
```

### 5.3 `initialPath` Array Rules

- Entries are ordered by `priority` ascending (1 = first/highest priority).
- The array is non-empty for every completed placement result (fallback rules in P4-034 guarantee this).
- Flutter must render the path in the order received; it must not sort, filter, or re-rank entries locally.
- Flutter must not derive or infer any entry values from other API fields.

### 5.4 `initialPathReady` Flag

| Value   | Meaning                                                              |
|---------|----------------------------------------------------------------------|
| `true`  | Path has been written and is available in the response               |
| `false` | Attempt is complete but path generation is still processing (rare)   |

Flutter must check `initialPathReady` before rendering the path. If `false`, Flutter should display
a loading state and retry after a short delay. Flutter must not generate or estimate a path locally
while waiting.

### 5.5 Error Codes

| HTTP | Code                    | Condition                                          |
|------|-------------------------|----------------------------------------------------|
| 404  | `RESULT_NOT_FOUND`      | No result exists for this attempt                  |
| 400  | `ATTEMPT_NOT_COMPLETED` | Attempt has not reached `completed` status yet     |
| 403  | `ATTEMPT_NOT_OWNED`     | Student does not own this attempt                  |
| 400  | `INVALID_ATTEMPT`       | Attempt ID is malformed or does not exist          |

---

## 6. Admin View

Admin endpoints may expose additional path fields for review purposes.

| Field                 | Admin Visible | Student Visible |
|-----------------------|:-------------:|:---------------:|
| `priority`            | ✅            | ✅              |
| `entryType`           | ✅            | ✅              |
| `skillName`           | ✅            | ✅              |
| `estimatedLevel`      | ✅            | ✅              |
| `skill_id`            | ✅            | ❌              |
| `skill_code`          | ✅            | ❌              |
| `skill_key`           | ✅            | ❌              |
| `source`              | ✅            | ❌              |
| `placement_result_id` | ✅            | ❌              |
| `created_at`          | ✅            | ❌              |

---

## 7. Backend Authority Rules

| Rule                                 | Detail                                                                              |
|--------------------------------------|-------------------------------------------------------------------------------------|
| Path derivation is backend-only      | No client, Flutter, or admin API caller may trigger, compute, or override the path  |
| Flutter receives display-safe subset | No raw skill keys, internal IDs, or source flags are sent to Flutter                |
| AIM Engine not involved              | Path derivation uses only placement result data and the skills table                |
| Path is written once                 | Triggered immediately when the placement result is finalised                        |
| Path is immutable                    | No modification after creation; retakes produce a new path, not an update           |
| Skill keys come from Phase 3 only    | No new skill definitions are created in Phase 4                                     |
| `initialPathReady` is authoritative  | Flutter must not assume path is ready until backend confirms                        |

---

## 8. Skill Key Format

Path entries that reference skills use the stable dot-delimited key format from P3-006:

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

- Skill keys are stable across display name changes.
- Skill keys are lowercase and dot-delimited.
- Skill keys are internal — never exposed to Flutter.
- Phase 4 does not create new skill key definitions; all keys come from the Phase 3 skills table.

---

## 9. Flutter Display Rules

| Rule                    | Detail                                                                      |
|-------------------------|-----------------------------------------------------------------------------|
| Render in received order| Do not sort, filter, or re-rank path entries locally                        |
| Display-only            | Show `skillName` and `estimatedLevel` per entry; no calculations            |
| No score exposure       | Flutter must not receive or display raw placement scores                    |
| No threshold logic      | Flutter must not contain level-mapping functions or threshold constants     |
| No path generation      | Flutter must not derive or estimate a path from any locally available data  |
| Wait for `initialPathReady` | Display loading state if `false`; retry; do not fabricate a path locally |

---

## 10. Out of Scope

The following are explicitly excluded from this contract and from Phase 4:

- AIM Engine runtime path generation
- AI Teacher path recommendation
- Lesson scheduling or lesson assignment (Phase 5+)
- Adaptive path adjustment based on lesson performance
- Progress dashboard path display or history
- B2, C1, or C2 level path entries
- Student Web App path delivery
- Practice session path generation

---

## 11. References

- `docs/phase-4/initial-learning-path-rules.md` — Derivation rules (P4-034)
- `docs/phase-4/placement-weakness-rules.md` — Weakness map rules (P4-033)
- `docs/phase-4/placement-result-definition.md` — Result semantics (P4-007)
- `docs/phase-4/placement-api-map.md` — Endpoint definitions (P4-006)
- `docs/phase-4/placement-level-thresholds.md` — CEFR level mapping (P4-030)
- `docs/phase-4/placement-test-charter.md` — Phase 4 scope boundary
- `docs/phase-4/no-aim-runtime-rule.md` — No AIM Engine runtime rule
- `docs/phase-4/no-client-side-placement-scoring.md` — No client scoring rule
- `packages/shared-contracts/api/placement-result-contracts.md` — Result contract (P4-014)
- P4-024 — Create Initial Learning Path Migration (DB table definition)
- P4-047 — Implement Initial Learning Path Service (backend implementation)

---

## 12. Metadata

| Field      | Value                                                                   |
|------------|-------------------------------------------------------------------------|
| Task ID    | P4-015                                                                  |
| Branch     | phase4/P4-015-placement-learning-path-contract                          |
| Priority   | P1                                                                      |
| Dependency | P4-014                                                                  |
| Output     | packages/shared-contracts/api/initial-learning-path-contracts.md        |
      "skillName": "Vocabulary — Common Verbs",
      "estimatedLevel": "A1"
    }
  ]
}
```

Fields never returned: `skill_code`, `skill_id`, `skill_key`, `source`, `placement_result_id`, `created_at`.

---

## 5. Derivation Source

Initial learning path entries are derived from the weakness map (P4-033) in rank order. If the weakness map is empty, a fallback path is generated based on the estimated level.

All derivation logic runs on the backend (P4-047). Flutter must never compute, re-derive, or store the initial learning path locally.

---

## 6. Boundaries

- No AIM Engine runtime integration.
- No lesson scheduling or delivery.
- No AI Teacher recommendations.
- No practice session creation.
- The initial learning path is a starting-point record only.
- Actual lesson sequencing is out of scope for Phase 4.
