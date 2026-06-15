# Placement Section Contract

> Phase 4 — P4-010
> Scope: Placement Test Sections only.

---

## 1. Overview

This document defines the shared contract for placement test sections in the AIM Platform. It covers section fields, status values, safe client fields, and backend authority rules.

All backend and Flutter implementations must conform to this contract. This contract does not cover AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or progress dashboard.

---

## 2. Placement Section Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| id | uuid | No | Primary key, set by backend |
| placement_test_id | uuid | No | Foreign key to placement_tests |
| title | string | Yes (admin only) | Display title (e.g. Grammar, Vocabulary) |
| skill_code | string | Yes (admin only) | Skill identifier (e.g. grammar, vocabulary, reading, listening) |
| order_index | integer | Yes (admin only) | Display order within the test |
| total_questions | integer | No | Computed by backend from linked questions |
| created_at | timestamp | No | Set by backend on creation |
| updated_at | timestamp | No | Updated by backend on mutation |

### 2.2 Rules

- id, placement_test_id, total_questions, created_at, and updated_at are never writable by clients.
- title must be a non-empty string.
- skill_code must be one of: grammar, vocabulary, reading, listening.
- order_index must be a positive integer and unique within a placement test.
- total_questions is derived from the count of questions linked to this section — admin cannot set it directly.
- A section must belong to exactly one placement test.

### 2.3 Skill Code Values

| Skill Code | Description |
|---|---|
| grammar | Grammar section |
| vocabulary | Vocabulary section |
| reading | Reading comprehension section |
| listening | Listening comprehension section |

---

## 3. Admin Request and Response Shapes

### 3.1 Create Placement Section

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| placement_test_id | uuid | Yes | Must reference an existing test |
| title | string | Yes | Non-empty |
| skill_code | string | Yes | One of: grammar, vocabulary, reading, listening |
| order_index | integer | Yes | Positive integer, unique within test |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | Backend-generated |
| placement_test_id | uuid | |
| title | string | |
| skill_code | string | |
| order_index | integer | |
| total_questions | integer | Always 0 on creation |
| created_at | timestamp | |

### 3.2 Update Placement Section

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | No | Non-empty if provided |
| order_index | integer | No | Must remain unique within test |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| title | string | Updated value |
| order_index | integer | Updated value |
| updated_at | timestamp | |

Errors:

| Code | Condition |
|---|---|
| SECTION_NOT_FOUND | Section ID does not exist |
| DUPLICATE_ORDER_INDEX | Another section has the same order_index in this test |
| INVALID_SKILL_CODE | skill_code is not one of the allowed values |

---

## 4. Student-Safe Fields

Students (Flutter Mobile) receive only the following fields when fetching sections:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| title | string | |
| skill_code | string | |
| order_index | integer | |
| total_questions | integer | |

Fields never exposed to students:

| Field | Reason |
|---|---|
| placement_test_id | Internal |
| created_at | Internal |
| updated_at | Internal |

---

## 5. Backend Authority Rules

- Backend is the sole authority for total_questions — computed from the questions table.
- Backend enforces unique order_index per placement test at the create and update endpoints.
- Backend enforces valid skill_code values — rejects unknown codes.
- Flutter must not infer section content from local state — it must call GET /placement/active/sections to retrieve sections.

---

## 6. Out of Scope

The following are explicitly excluded from this contract:

- AIM Engine runtime section configuration
- Lesson or practice section records
- AI Teacher section management
- Adaptive section generation
- Student Web App section delivery

---

## 7. References

- docs/phase-4/placement-api-map.md — Endpoint definitions (P4-006)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule
- P4-009 — Placement Test Contract
- P4-011 — Placement Question Contract
- P4-018 — Placement Sections Migration

---

## 8. Metadata

| Field | Value |
|---|---|
| Task ID | P4-010 |
| Branch | phase4/P4-010-placement-section-contract |
| Priority | P0 |
| Dependency | P4-009 |
| Output | packages/shared-contracts/api/placement-section-contracts.md |