# Question Bank Contract

> Phase 3 — P3-014
> Scope: Curriculum & Content System only.

---

## 1. Overview

This document defines the shared contracts for question bank items in the AIM platform. It covers question items, answer choices, correct answers, explanations, difficulty labels, and skill mappings.

Questions are reusable curriculum content. They are authored and managed within the Curriculum & Content System and may be referenced by future practice/session systems in later phases. This contract does **not** implement practice attempts, sessions, learner delivery, AIM runtime integration, or scoring logic.

All backend and admin implementations must conform to this contract.

---

## 2. Question Types

| Type | Description |
|---|---|
| `multiple_choice` | One correct answer from a list of choices |
| `multiple_select` | One or more correct answers from a list of choices |
| `true_false` | A binary true/false question |
| `fill_in_the_blank` | One or more blanks to complete within a sentence or passage |
| `short_answer` | Free-text response (graded by admin/teacher, not automated) |
| `ordering` | Arrange items in the correct sequence |
| `matching` | Match items from two columns |

---

## 3. Difficulty Labels

| Label | Description |
|---|---|
| `beginner` | Foundational concept; no prior exposure expected |
| `elementary` | Basic application; minimal prior knowledge needed |
| `intermediate` | Requires working knowledge of the skill |
| `upper_intermediate` | Requires solid skill grasp with nuance |
| `advanced` | Complex application; edge cases or exceptions |

---

## 4. Question Item Record

### 4.1 Fields

| Field | Type | Writable | Required | Description |
|---|---|---|---|---|
| `id` | `uuid` | ❌ | — | Primary key, set by backend |
| `type` | `enum` | ✅ (create only) | ✅ | One of the question types in Section 2 |
| `stem` | `string` | ✅ | ✅ | The question text presented to the learner |
| `rich_stem` | `object \| null` | ✅ | ❌ | Optional structured/rich-text representation of the stem |
| `difficulty` | `enum` | ✅ | ✅ | One of the difficulty labels in Section 3 |
| `explanation` | `string \| null` | ✅ | ❌ | General post-answer explanation shown after submission |
| `hint` | `string \| null` | ✅ | ❌ | Optional hint surfaced before or during answering |
| `tags` | `string[]` | ✅ | ❌ | Free-form admin tags for search and organization |
| `status` | `enum` | ❌ | — | Backend-controlled: `draft`, `published`, `archived` |
| `created_by` | `uuid` | ❌ | — | Set by backend from authenticated user |
| `created_at` | `timestamp` | ❌ | — | Set by backend on creation |
| `updated_at` | `timestamp` | ❌ | — | Updated by backend on any mutation |

### 4.2 Rules

- `id`, `status`, `created_by`, `created_at`, and `updated_at` are never writable by clients.
- `type` is set on creation and cannot be changed after.
- `stem` must be a non-empty string.
- `difficulty` must be one of the allowed enum values.
- A question cannot be published without at least one linked published skill (see Section 7).
- A question cannot be published without a valid answer defined (see Section 5).

---

## 5. Answer Choices

Answer choices apply to `multiple_choice`, `multiple_select`, `true_false`, and `ordering` / `matching` types.

### 5.1 Choice Record Fields

| Field | Type | Writable | Required | Description |
|---|---|---|---|---|
| `id` | `uuid` | ❌ | — | Primary key, set by backend |
| `question_id` | `uuid` | ✅ (create only) | ✅ | Parent question reference |
| `text` | `string` | ✅ | ✅ | Display text of this choice |
| `rich_text` | `object \| null` | ✅ | ❌ | Optional structured/rich-text version of the choice text |
| `is_correct` | `boolean` | ✅ | ✅ | Whether this choice is a correct answer |
| `order` | `integer` | ✅ | ✅ | Display order within the question |
| `explanation` | `string \| null` | ✅ | ❌ | Per-choice explanation shown after submission |

### 5.2 Choice Rules

- `question_id` is set on creation and cannot be changed.
- `text` must be non-empty.
- `order` must be a positive integer, unique within the parent question.
- For `multiple_choice`: exactly one choice must have `is_correct = true`.
- For `multiple_select`: one or more choices must have `is_correct = true`.
- For `true_false`: exactly two choices must exist, one `true` and one `false`.
- For `ordering`: no `is_correct` flag; correct order is defined by a separate answer record (see Section 6).
- For `matching`: no `is_correct` flag; correct pairings are defined in answer records.
- `short_answer` and `fill_in_the_blank` do not use the choices table.

---

## 6. Answer Record

For question types that require an explicit answer definition separate from choices (`fill_in_the_blank`, `short_answer`, `ordering`, `matching`), an answer record is used.

### 6.1 Answer Record Fields

| Field | Type | Writable | Required | Description |
|---|---|---|---|---|
| `id` | `uuid` | ❌ | — | Primary key |
| `question_id` | `uuid` | ✅ (create only) | ✅ | Parent question reference |
| `answer_type` | `enum` | ✅ (create only) | ✅ | One of: `fill_blank`, `short_text`, `ordered_sequence`, `matched_pairs` |
| `value` | `object` | ✅ | ✅ | Type-specific answer value (see Section 6.2) |
| `explanation` | `string \| null` | ✅ | ❌ | Post-answer explanation for this specific answer |

### 6.2 `value` Shapes by Answer Type

**`fill_blank`** — one or more blank slots with accepted values:

```json
{
  "blanks": [
    { "position": 1, "accepted_values": ["went", "had gone"] },
    { "position": 2, "accepted_values": ["was"] }
  ],
  "case_sensitive": false
}
```

**`short_text`** — model answer for teacher grading reference:

```json
{
  "model_answer": "The past simple is used to describe completed actions.",
  "grading_note": "Accept any answer that identifies a completed action in the past."
}
```

**`ordered_sequence`** — correct ordering of choice IDs:

```json
{
  "sequence": ["choice-uuid-3", "choice-uuid-1", "choice-uuid-4", "choice-uuid-2"]
}
```

**`matched_pairs`** — correct pairings of choice IDs from two columns:

```json
{
  "pairs": [
    { "left": "choice-uuid-a1", "right": "choice-uuid-b3" },
    { "left": "choice-uuid-a2", "right": "choice-uuid-b1" }
  ]
}
```

---

## 7. Skill Mapping

A question must be linked to one or more skills before it can be published. Skill keys must use stable machine-readable identifiers (see `skill-objective-contracts.md`, P3-011).

### 7.1 Question–Skill Mapping Fields

| Field | Type | Description |
|---|---|---|
| `question_id` | `uuid` | Reference to the question |
| `skill_id` | `uuid` | Reference to the skill |
| `skill_key` | `string` | Stable skill key (e.g. `grammar.past_simple.forms`) |
| `is_primary` | `boolean` | Whether this is the primary skill being assessed |

### 7.2 Skill Mapping Rules

- A question must have at least one skill mapping with `is_primary = true` before it can be published.
- Exactly one mapping per question may have `is_primary = true`.
- `skill_key` must reference a published skill.
- Display labels must never be used as skill identifiers; only `skill_key` values are authoritative.

---

## 8. Status Lifecycle

```
draft → published → archived
```

| Status | Meaning |
|---|---|
| `draft` | Authored but not yet usable in curriculum |
| `published` | Active; available for reference by lessons and future practice systems |
| `archived` | Hidden from use; retained for audit |

- Only backend endpoints control `status` transitions.
- A question cannot be published unless:
  - It has at least one linked published skill with a primary mapping.
  - It has a valid answer (choice with `is_correct = true`, or an answer record for other types).
  - Its `stem` is non-empty.
- Once `archived`, a question cannot be re-published without backend intervention.

---

## 9. Safe Client Fields

The following fields may be safely returned to authenticated admin and teacher clients:

```
id, type, stem, rich_stem, difficulty, explanation, hint, tags, status,
created_by, created_at, updated_at

choices: id, question_id, text, rich_text, is_correct, order, explanation

answers: id, question_id, answer_type, value, explanation

skill_mappings: question_id, skill_id, skill_key, is_primary
```

**Never expose:** `is_correct` to learner-facing clients during active sessions. Admin/teacher clients may see it.

---

## 10. Admin API Shape (Reference)

### 10.1 Create Question Request

```json
{
  "type": "multiple_choice",
  "stem": "Which sentence uses the past simple correctly?",
  "difficulty": "elementary",
  "explanation": "The past simple uses the base form + -ed for regular verbs.",
  "hint": "Think about what happened yesterday.",
  "tags": ["grammar", "past_simple", "A2"]
}
```

### 10.2 Create Question Response (201 Created)

```json
{
  "id": "uuid",
  "type": "multiple_choice",
  "stem": "Which sentence uses the past simple correctly?",
  "rich_stem": null,
  "difficulty": "elementary",
  "explanation": "The past simple uses the base form + -ed for regular verbs.",
  "hint": "Think about what happened yesterday.",
  "tags": ["grammar", "past_simple", "A2"],
  "status": "draft",
  "created_by": "uuid",
  "created_at": "2026-06-14T10:00:00Z",
  "updated_at": "2026-06-14T10:00:00Z"
}
```

### 10.3 Add Choice Request

```json
{
  "question_id": "uuid",
  "text": "She walk to school every day.",
  "is_correct": false,
  "order": 1,
  "explanation": "This is present simple, not past simple."
}
```

### 10.4 Add Skill Mapping Request

```json
{
  "question_id": "uuid",
  "skill_id": "uuid",
  "skill_key": "grammar.past_simple.forms",
  "is_primary": true
}
```

### 10.5 List Questions Response (200 OK)

```json
{
  "questions": [
    {
      "id": "uuid",
      "type": "multiple_choice",
      "stem": "Which sentence uses the past simple correctly?",
      "difficulty": "elementary",
      "status": "published",
      "skill_mappings": [
        { "skill_id": "uuid", "skill_key": "grammar.past_simple.forms", "is_primary": true }
      ],
      "created_at": "2026-06-14T10:00:00Z",
      "updated_at": "2026-06-14T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 11. Validation Errors

| Code | Trigger |
|---|---|
| `QUESTION_MISSING_STEM` | `stem` is absent or empty |
| `QUESTION_INVALID_TYPE` | `type` is not one of the allowed enum values |
| `QUESTION_INVALID_DIFFICULTY` | `difficulty` is not one of the allowed enum values |
| `QUESTION_NO_PRIMARY_SKILL` | Publishing attempted without a primary skill mapping |
| `QUESTION_SKILL_NOT_PUBLISHED` | Referenced skill is not in `published` status |
| `QUESTION_NO_CORRECT_ANSWER` | Publishing attempted without a valid correct answer or answer record |
| `QUESTION_CHOICE_CONFLICT` | Multiple choices marked `is_correct` for `multiple_choice` type |
| `QUESTION_TRUE_FALSE_INVALID` | `true_false` question does not have exactly two choices |
| `QUESTION_INVALID_CHOICE_ORDER` | `order` conflicts with an existing choice in the same question |
| `QUESTION_ANSWER_TYPE_MISMATCH` | `answer_type` does not match the question `type` |
| `QUESTION_ARCHIVED` | Cannot modify or re-publish an archived question |

---

## 12. Relation to Other Contracts

| Contract | Relation |
|---|---|
| `skill-objective-contracts.md` (P3-011) | Skills must be published before a question can reference them |
| `lesson-contracts.md` (P3-010) | Questions are independent of lessons but share the same skill linking rules |
| `content-status-contracts.md` (P3-015) | Status enum and lifecycle transitions follow the shared content status contract |
| `role-permission-contracts.md` | Only admin/teacher roles may create or modify questions |
| `response-envelope.md` | All API responses wrap in the standard envelope |
| `errors.md` | All error codes follow the standard error shape |
