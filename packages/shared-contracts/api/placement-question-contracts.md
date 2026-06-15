# Placement Question Contract

> Phase 4 — P4-011
> Scope: Placement Test Questions only.

---

## 1. Overview

This document defines the shared contract for placement test questions in the AIM Platform. It covers question fields, allowed question types, safe client fields, and backend authority rules.

All backend and Flutter implementations must conform to this contract. This contract does not cover AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or progress dashboard.

---

## 2. Placement Question Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| id | uuid | No | Primary key, set by backend |
| placement_section_id | uuid | No | Foreign key to placement_sections |
| question_type | enum | Yes (admin only) | Type of question (see 2.3) |
| prompt | string | Yes (admin only) | Question text shown to student |
| media_url | string | Yes (admin only) | Optional audio or image URL |
| order_index | integer | Yes (admin only) | Display order within the section |
| skill_code | string | No | Inherited from parent section |
| created_at | timestamp | No | Set by backend on creation |
| updated_at | timestamp | No | Updated by backend on mutation |

### 2.2 Rules

- id, placement_section_id, skill_code, created_at, and updated_at are never writable by clients.
- prompt must be a non-empty string.
- question_type must be one of the allowed values (see 2.3).
- order_index must be a positive integer and unique within a placement section.
- media_url is optional — only required for listening question types.
- skill_code is inherited from the parent section and cannot be set directly on the question.
- A question must belong to exactly one placement section.

### 2.3 Question Type Values

| Question Type | Description |
|---|---|
| multiple_choice | Single correct answer from options |
| true_false | True or false answer |
| fill_blank | Student fills in a missing word |
| listening_choice | Audio-based multiple choice |

---

## 3. Admin Request and Response Shapes

### 3.1 Create Placement Question

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| placement_section_id | uuid | Yes | Must reference an existing section |
| question_type | enum | Yes | One of the allowed types |
| prompt | string | Yes | Non-empty |
| media_url | string | No | Required for listening_choice type |
| order_index | integer | Yes | Positive integer, unique within section |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | Backend-generated |
| placement_section_id | uuid | |
| question_type | enum | |
| prompt | string | |
| media_url | string | null if not provided |
| order_index | integer | |
| skill_code | string | Inherited from section |
| created_at | timestamp | |

### 3.2 Update Placement Question

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| prompt | string | No | Non-empty if provided |
| media_url | string | No | |
| order_index | integer | No | Must remain unique within section |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| prompt | string | Updated value |
| order_index | integer | Updated value |
| updated_at | timestamp | |

Errors:

| Code | Condition |
|---|---|
| QUESTION_NOT_FOUND | Question ID does not exist |
| DUPLICATE_ORDER_INDEX | Another question has the same order_index in this section |
| INVALID_QUESTION_TYPE | question_type is not one of the allowed values |
| MISSING_MEDIA_URL | listening_choice type requires media_url |

---

## 4. Student-Safe Fields

Students (Flutter Mobile) receive only the following fields when fetching questions:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| question_type | enum | |
| prompt | string | |
| media_url | string | null if not applicable |
| order_index | integer | |
| skill_code | string | |

Fields never exposed to students:

| Field | Reason |
|---|---|
| placement_section_id | Internal |
| created_at | Internal |
| updated_at | Internal |

---

## 5. Backend Authority Rules

- Backend is the sole authority for skill_code — inherited from the parent section.
- Backend enforces unique order_index per placement section at the create and update endpoints.
- Backend enforces valid question_type values — rejects unknown types.
- Backend enforces media_url requirement for listening_choice questions.
- Flutter must not infer question content from local state — it must call GET /placement/active/sections/:id/questions to retrieve questions.

---

## 6. Out of Scope

The following are explicitly excluded from this contract:

- AIM Engine runtime question configuration
- Lesson or practice question records
- AI Teacher question management
- Adaptive question generation
- Student Web App question delivery

---

## 7. References

- docs/phase-4/placement-api-map.md — Endpoint definitions (P4-006)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule
- P4-010 — Placement Section Contract
- P4-012 — Placement Answer Contract
- P4-019 — Placement Questions Migration

---

## 8. Metadata

| Field | Value |
|---|---|
| Task ID | P4-011 |
| Branch | phase4/P4-011-placement-question-contract |
| Priority | P0 |
| Dependency | P3-014, P4-010 |
| Output | packages/shared-contracts/api/placement-question-contracts.md |