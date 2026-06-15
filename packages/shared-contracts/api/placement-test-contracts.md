# Placement Test Contract

> Phase 4 — P4-009
> Scope: Placement Test system only.

---

## 1. Overview

This document defines the shared contract for placement test metadata in the AIM Platform. It covers placement test fields, status values, safe client fields, and backend authority rules.

All backend and Flutter implementations must conform to this contract. This contract does not cover AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or progress dashboard.

---

## 2. Placement Test Record

### 2.1 Fields

| Field | Type | Writable | Description |
|---|---|---|---|
| id | uuid | No | Primary key, set by backend |
| title | string | Yes (admin only) | Display title of the placement test |
| status | enum | No | Controlled by backend only (draft, published) |
| estimated_minutes | integer | Yes (admin only) | Estimated completion time in minutes |
| total_sections | integer | No | Computed by backend from linked sections |
| created_at | timestamp | No | Set by backend on creation |
| updated_at | timestamp | No | Updated by backend on mutation |

### 2.2 Rules

- id, status, total_sections, created_at, and updated_at are never writable by clients.
- title must be a non-empty string.
- estimated_minutes must be a positive integer.
- Only one placement test may have status = published at a time.
- Admin must unpublish the current test before publishing a new one.
- total_sections is derived from the count of sections linked to this test — admin cannot set it directly.

### 2.3 Status Values

| Status | Meaning |
|---|---|
| draft | Test is under construction — not visible to students |
| published | Test is active — available to students for placement |

---

## 3. Admin Request and Response Shapes

### 3.1 Create Placement Test

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | Yes | Non-empty |
| estimated_minutes | integer | Yes | Positive integer |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | Backend-generated |
| title | string | |
| status | enum | Always draft on creation |
| estimated_minutes | integer | |
| total_sections | integer | Always 0 on creation |
| created_at | timestamp | |

### 3.2 Update Placement Test Status

Request:

| Field | Type | Required | Notes |
|---|---|---|---|
| status | enum | Yes | draft or published |

Response:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| status | enum | Updated value |
| updated_at | timestamp | |

Errors:

| Code | Condition |
|---|---|
| ACTIVE_TEST_EXISTS | Another test is already published |
| TEST_NOT_FOUND | Test ID does not exist |

---

## 4. Student-Safe Fields

Students (Flutter Mobile) receive only the following fields when fetching the active placement test:

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| title | string | |
| status | enum | Always published (student cannot see draft) |
| total_sections | integer | |
| estimated_minutes | integer | |

Fields never exposed to students:

| Field | Reason |
|---|---|
| created_at | Internal |
| updated_at | Internal |

---

## 5. Backend Authority Rules

- Backend is the sole authority for status transitions.
- Backend enforces the single-active-test constraint at the publish endpoint.
- Backend computes total_sections from the sections table — clients cannot override it.
- Flutter must not infer test availability from any local state — it must call GET /placement/active to determine if a test exists.

---

## 6. Out of Scope

The following are explicitly excluded from this contract:

- AIM Engine runtime test configuration
- Lesson or practice test records
- AI Teacher test management
- Adaptive test generation
- Student Web App test delivery

---

## 7. References

- docs/phase-4/placement-api-map.md — Endpoint definitions (P4-006)
- docs/phase-4/placement-test-charter.md — Phase 4 scope boundary
- docs/phase-4/no-aim-runtime-rule.md — No AIM Engine rule
- P4-010 — Placement Section Contract
- P4-017 — Placement Tests Migration

---

## 8. Metadata

| Field | Value |
|---|---|
| Task ID | P4-009 |
| Branch | phase4/P4-009-placement-test-contract |
| Priority | P0 |
| Dependency | P4-006 |
| Output | packages/shared-contracts/api/placement-test-contracts.md |