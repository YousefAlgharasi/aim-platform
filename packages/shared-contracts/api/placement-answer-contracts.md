# Placement Answer Contract

> Phase 4 — P4-012
> Scope: Placement Test Answers only.

---

## 1. Overview

This document defines the shared contract for placement test answer submissions in the AIM Platform. It covers answer fields, allowed answer formats per question type, safe client fields, and backend authority rules.

All backend and Flutter implementations must conform to this contract. This contract does not cover AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or progress dashboard.

---

## 2. Placement Answer Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| id | uuid | No | Primary key, set by backend |
| placement_attempt_id | uuid | No | Foreign key to placement_attempts |
| placement_question_id | uuid | No | Foreign key to placement_questions |
| answer_value | string | Yes (student) | The student's submitted answer |
| is_correct | boolean | No | Evaluated by backend only |
| skill_code | string | No | Inherited from parent question |
| created_at | timestamp | No | Set by backend on creation |

### 2.2 Rules

- id, placement_attempt_id, is_correct, skill_code, and created_at are never writable by clients.
- answer_value must be a non-empty string.
- answer_value format depends on question_type (see 2.3).
- Flutter must submit one answer per question — duplicate submissions for the same question in the same attempt are rejected.
- is_correct is evaluated by backend only — Flutter must never send or infer this value.
- skill_code is inherited from the parent question and cannot be set directly on the answer.

### 2.3 Answer Value Format by Question Type

| Question Type | answer_value Format | Example |
|---|---|---|
| multiple_choice | Option letter (A, B, C, or D) | "B" |
| true_false | "true" or "false" (lowercase string) | "true" |
| fill_blank | Student's written text | "present perfect" |
| listening_choice | Option letter (A, B, C, or D) | "A" |

---

## 3. Student Request and Response Shapes

### 3.1 Submit Placement Answer

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| placement_attempt_id | uuid | Yes | Must reference an active attempt |
| placement_question_id | uuid | Yes | Must reference a question in the active test |
| answer_value | string | Yes | Non-empty, format per question type |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | Backend-generated |
| placement_attempt_id | uuid | |
| placement_question_id | uuid | |
| answer_value | string | |
| created_at | timestamp | |

Note: is_correct is never returned to the student during the attempt.

Errors:

| Code | Condition |
|---|---|
| ATTEMPT_NOT_FOUND | Attempt ID does not exist or is not active |
| QUESTION_NOT_FOUND | Question ID does not exist in the active test |
| DUPLICATE_ANSWER | An answer for this question already exists in this attempt |
| INVALID_ANSWER_VALUE | answer_value format does not match question type |

---

## 4. Student-Safe Fields

Students (Flutter Mobile) receive only the following fields after submitting an answer:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| placement_attempt_id | uuid | |
| placement_question_id | uuid | |
| answer_value | string | |
| created_at | timestamp | |

Fields never exposed to students:

| Field | Reason |
|---|---|
| is_correct | Must not be revealed during attempt |
| skill_code | Internal |

---

## 5. Backend Authority Rules

- Backend is the sole authority for is_correct — evaluated after attempt submission.
- Backend enforces one answer per question per attempt.
- Backend validates answer_value format against the question type.
- Backend inherits skill_code from the parent question — clients cannot set it.
- Flutter must not cache or infer correctness — it must wait for the result endpoint after attempt completion.

---

## 6. Out of Scope

The following are explicitly excluded from this contract:

- AIM Engine runtime answer evaluation
- Lesson or practice answer records
- AI Teacher answer management
- Adaptive scoring or feedback during the attempt
- Student Web App answer submission

---

## 7. References

- docs/phase-4/placement-api-map.md — Endpoint definitions (P4-006)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule
- P4-011 — Placement Question Contract
- P4-013 — Placement Attempt Contract
- P4-020 — Placement Answers Migration

---

## 8. Metadata

| Field | Value |
|---|---|
| Task ID | P4-012 |
| Branch | phase4/P4-012-placement-answer-contract |
| Priority | P0 |
| Dependency | P4-011 |
| Output | packages/shared-contracts/api/placement-answer-contracts.md |