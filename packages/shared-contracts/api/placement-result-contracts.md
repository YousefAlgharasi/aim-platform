# Placement Result Contract

> Phase 4 — P4-014
> Scope: Placement Test Results only.

---

## 1. Overview

This document defines the shared contract for placement test results in the AIM Platform. It covers result fields, estimated level, skill mastery map, weakness map, initial path output, and backend authority rules.

All backend and Flutter implementations must conform to this contract. This contract does not cover AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or progress dashboard.

---

## 2. Placement Result Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| id | uuid | No | Primary key, set by backend |
| placement_attempt_id | uuid | No | Foreign key to placement_attempts |
| student_id | uuid | No | Foreign key to students |
| estimated_level | string | No | Computed by backend only |
| skill_mastery_map | object | No | Computed by backend only |
| weakness_map | object | No | Computed by backend only |
| initial_path_id | uuid | No | Assigned by backend only |
| created_at | timestamp | No | Set by backend on creation |

### 2.2 Rules

- All fields are backend-controlled — Flutter cannot write any field directly.
- estimated_level is computed by backend from answer correctness and skill codes.
- skill_mastery_map is computed by backend — Flutter must never calculate or infer it.
- weakness_map is computed by backend — Flutter must never calculate or infer it.
- initial_path_id is assigned by backend based on estimated_level and weakness_map.
- Flutter receives result only after attempt status = completed.

### 2.3 Estimated Level Values

| Level | Description |
|---|---|
| beginner | Student scored at beginner range |
| elementary | Student scored at elementary range |
| intermediate | Student scored at intermediate range |
| upper_intermediate | Student scored at upper intermediate range |
| advanced | Student scored at advanced range |

---

## 3. Skill Mastery Map Shape

The skill_mastery_map is a JSON object with one entry per skill_code:

| Field | Type | Notes |
|---|---|---|
| skill_code | string | One of: grammar, vocabulary, reading, listening |
| total_questions | integer | Total questions answered for this skill |
| correct_answers | integer | Number of correct answers for this skill |
| mastery_score | number | Percentage correct (0.0 to 1.0) |

Example:

```json
{
  "grammar": {
    "total_questions": 10,
    "correct_answers": 7,
    "mastery_score": 0.7
  },
  "vocabulary": {
    "total_questions": 10,
    "correct_answers": 4,
    "mastery_score": 0.4
  }
}
```

---

## 4. Weakness Map Shape

The weakness_map is a JSON object listing skill codes where mastery_score is below threshold:

| Field | Type | Notes |
|---|---|---|
| skill_code | string | Skill with low mastery |
| mastery_score | number | Score below threshold |
| priority | integer | 1 = highest priority weakness |

Example:

```json
{
  "weaknesses": [
    { "skill_code": "vocabulary", "mastery_score": 0.4, "priority": 1 },
    { "skill_code": "listening", "mastery_score": 0.5, "priority": 2 }
  ]
}
```

---

## 5. Student Response Shape

### 5.1 Get Placement Result

Available only after attempt status = completed.

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| placement_attempt_id | uuid | |
| estimated_level | string | One of the level values |
| skill_mastery_map | object | Per-skill mastery data |
| weakness_map | object | Weakness priority list |
| initial_path_id | uuid | Assigned learning path |
| created_at | timestamp | |

Errors:

| Code | Condition |
|---|---|
| RESULT_NOT_FOUND | Result does not exist for this attempt |
| ATTEMPT_NOT_COMPLETED | Attempt has not reached completed status yet |

---

## 6. Student-Safe Fields

Students (Flutter Mobile) receive only the following fields:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| placement_attempt_id | uuid | |
| estimated_level | string | |
| skill_mastery_map | object | |
| weakness_map | object | |
| initial_path_id | uuid | |
| created_at | timestamp | |

Fields never exposed to students:

| Field | Reason |
|---|---|
| student_id | Internal |

---

## 7. Backend Authority Rules

- Backend is the sole authority for estimated_level, skill_mastery_map, weakness_map, and initial_path_id.
- Flutter must never calculate or infer placement scoring, level, mastery, or weakness.
- Flutter must call GET /placement/attempts/:id/result to retrieve the result after completion.
- Backend evaluates results only after attempt status = submitted.
- initial_path_id is assigned by backend — Flutter must not select or override it.

---

## 8. Out of Scope

The following are explicitly excluded from this contract:

- AIM Engine runtime result configuration
- Lesson or practice result records
- AI Teacher result management
- Progress dashboard result display
- Student Web App result delivery

---

## 9. References

- docs/phase-4/placement-api-map.md — Endpoint definitions (P4-006)
- docs/phase-4/placement-result-definition.md — Result semantics (P4-007)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule
- P4-013 — Placement Attempt Contract
- P4-022 — Placement Results Migration

---

## 10. Metadata

| Field | Value |
|---|---|
| Task ID | P4-014 |
| Branch | phase4/P4-014-placement-result-contract |
| Priority | P0 |
| Dependency | P4-007, P4-013 |
| Output | packages/shared-contracts/api/placement-result-contracts.md |