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
