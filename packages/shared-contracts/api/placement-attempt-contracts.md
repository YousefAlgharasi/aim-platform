# Placement Attempt Contract

> Phase 4 — P4-013
> Scope: Placement Test Attempts only.

---

## 1. Overview

This document defines the shared contract for placement test attempts in the AIM Platform. It covers attempt fields, lifecycle states, safe client fields, and backend authority rules.

All backend and Flutter implementations must conform to this contract. This contract does not cover AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or progress dashboard.

---

## 2. Placement Attempt Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| id | uuid | No | Primary key, set by backend |
| student_id | uuid | No | Foreign key to students |
| placement_test_id | uuid | No | Foreign key to placement_tests |
| status | enum | No | Controlled by backend only |
| started_at | timestamp | No | Set by backend on attempt start |
| submitted_at | timestamp | No | Set by backend on attempt submission |
| completed_at | timestamp | No | Set by backend on attempt completion |
| created_at | timestamp | No | Set by backend on creation |

### 2.2 Rules

- All fields are backend-controlled — Flutter cannot write any field directly.
- Only one active attempt per student per placement test is allowed at a time.
- status transitions are strictly ordered (see 2.3).
- Flutter triggers transitions via dedicated endpoints — it does not set status directly.
- A student cannot start a new attempt while one is active.

### 2.3 Attempt Status Values

| Status | Meaning |
|---|---|
| active | Attempt has been started — student is answering questions |
| submitted | Student has submitted all answers — backend is evaluating |
| completed | Backend has finished evaluation — result is available |
| abandoned | Attempt was not submitted within the allowed time window |

### 2.4 Status Transition Rules

| From | To | Trigger |
|---|---|---|
| — | active | POST /placement/attempts (start) |
| active | submitted | POST /placement/attempts/:id/submit |
| submitted | completed | Backend evaluation complete |
| active | abandoned | Backend timeout enforcement |

---

## 3. Student Request and Response Shapes

### 3.1 Start Placement Attempt

Request: No body required.

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | Backend-generated |
| student_id | uuid | |
| placement_test_id | uuid | |
| status | enum | Always active on creation |
| started_at | timestamp | |

Errors:

| Code | Condition |
|---|---|
| ACTIVE_ATTEMPT_EXISTS | Student already has an active attempt |
| NO_ACTIVE_TEST | No placement test is currently published |

### 3.2 Submit Placement Attempt

Request: No body required.

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| status | enum | Always submitted |
| submitted_at | timestamp | |

Errors:

| Code | Condition |
|---|---|
| ATTEMPT_NOT_FOUND | Attempt ID does not exist or does not belong to student |
| ATTEMPT_NOT_ACTIVE | Attempt is not in active status |

### 3.3 Get Attempt Result

Available only after status = completed.

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| status | enum | Always completed |
| completed_at | timestamp | |
| total_questions | integer | |
| total_answered | integer | |

Note: Scoring, level assignment, and weakness analysis are out of scope for Flutter — backend handles these internally.

---

## 4. Student-Safe Fields

Students (Flutter Mobile) receive only the following fields:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| placement_test_id | uuid | |
| status | enum | |
| started_at | timestamp | |
| submitted_at | timestamp | null until submitted |
| completed_at | timestamp | null until completed |

Fields never exposed to students:

| Field | Reason |
|---|---|
| student_id | Internal |
| created_at | Internal |

---

## 5. Backend Authority Rules

- Backend is the sole authority for all status transitions.
- Backend enforces the single-active-attempt constraint at the start endpoint.
- Backend enforces the timeout window and marks abandoned attempts automatically.
- Backend computes evaluation results after submission — Flutter must not infer scoring.
- Flutter must poll GET /placement/attempts/:id to check for status changes.

---

## 6. Out of Scope

The following are explicitly excluded from this contract:

- AIM Engine runtime attempt configuration
- Lesson or practice attempt records
- AI Teacher attempt management
- Scoring, level assignment, or weakness analysis in Flutter
- Student Web App attempt delivery

---

## 7. References

- docs/phase-4/placement-api-map.md — Endpoint definitions (P4-006)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule
- P4-012 — Placement Answer Contract
- P4-014 — Placement Result Contract
- P4-021 — Placement Attempts Migration

---

## 8. Metadata

| Field | Value |
|---|---|
| Task ID | P4-013 |
| Branch | phase4/P4-013-placement-attempt-contract |
| Priority | P0 |
| Dependency | P4-012 |
| Output | packages/shared-contracts/api/placement-attempt-contracts.md |