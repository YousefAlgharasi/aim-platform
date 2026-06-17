# Phase 5 — AIM Data Flow

## Purpose

This document describes the full data movement of the AIM Engine integration: how the Backend collects learner inputs, how it composes structured requests to the AIM Engine, how the AIM Engine returns structured decisions, and how the Backend validates, persists, and exposes those decisions to authorized clients.

It is reference material for every Phase 5 task. Where a downstream task defines contracts, endpoints, persistence, or APIs, those tasks are the source of truth for shapes and field names; this document is the source of truth for the **direction**, **ordering**, and **trust boundaries** of data movement.

## Actors

| Actor | Role in Phase 5 |
| --- | --- |
| Client (Flutter Mobile, Admin Dashboard) | Submits raw learner inputs and behavioral signals through backend client APIs. Reads backend-approved AIM results. Never calls the AIM Engine. Never computes AIM decisions. |
| Backend (NestJS + TypeScript) | Sole caller of the AIM Engine. Owns input collection, request construction, response validation, persistence, audit logging, and result APIs. |
| AIM Engine (Python + FastAPI) | Algorithm service. Accepts structured requests, runs the analysis pipeline, returns structured learning decisions and a safe failure shape on error. Has no public route, no client credentials, no client traffic. |
| Database (Supabase PostgreSQL) | Persists all AIM-pipeline outputs through backend-owned migrations and DTOs only. |

## Trust Boundaries

The integration crosses four trust boundaries. Each boundary requires validation and is the place where untrusted data becomes trusted data.

1. **Client → Backend**: Raw client input is untrusted. Backend DTOs validate it, strip any AIM-owned fields the client must not provide, and bind it to the authenticated identity.
2. **Backend → AIM Engine**: Backend constructs an AIM request from already-validated state. The AIM Engine treats backend input as trusted within its own input-validation rules but still validates structure.
3. **AIM Engine → Backend**: AIM Engine output is treated as untrusted by the Backend until backend DTOs validate it. An invalid response is never persisted.
4. **Backend → Client**: Backend exposes AIM results only through permission-guarded read APIs with validated response DTOs.

## End-to-End Flow

The flow below is the canonical Phase 5 path. Concrete endpoints, payload shapes, and error codes are defined by downstream tasks (`P5-006` through `P5-027` and the contract tasks `P5-009` through `P5-018`).

### 1. Client submits raw input

- The client calls a backend client API (for example, a lesson attempt submission or a session event).
- The request contains raw inputs: attempt content, answers, raw behavioral signals (timing, retries, hesitation), and references to existing entities (session id, attempt id, skill id).
- The client must not include mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration values. If present, the backend strips them and records a validation event.

### 2. Backend validates input

- Backend DTOs validate types, ranges, and ownership.
- Backend confirms the authenticated identity is allowed to submit input for the referenced session, attempt, or skill, using the Phase 2 auth and role foundation.
- Backend stores raw attempt and session data in the appropriate tables before any AIM call.

### 3. Backend composes the AIM request

- Backend reads the relevant student, session, attempt, and skill state from the database.
- Backend assembles a structured request payload matching the AIM Engine request contract (defined by `P5-009`, `P5-010`, and `P5-011` and consumed by `P5-021`).
- Behavioral signals are passed as raw context for the AIM Engine to interpret. Speed and timing remain context only.
- The Backend does not pre-compute mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration.

### 4. Backend calls the AIM Engine

- The call goes through the backend-internal AIM adapter, over the internal network, authenticated with backend-only credentials.
- Timeout, retry, and circuit breaker policy apply (defined by `P5-008`).
- The adapter records a request audit entry with metadata only.

### 5. AIM Engine validates input

- The AIM Engine validates the structured request against its Python schema (`P5-021`).
- Invalid input returns a safe failure response (`P5-025`) and the engine performs no analysis.

### 6. AIM Engine runs the analysis pipeline

- The pipeline entrypoint (`P5-023`) executes the algorithm.
- The pipeline produces decisions in the categories owned by the AIM Engine: student skill state updates, weakness records, difficulty decisions, recommendations, review schedules, frustration signals (educational only), and session summaries.
- The pipeline does not write to the database. It returns a response payload to the Backend only.

### 7. AIM Engine returns a structured response

- A successful response matches the AIM Engine response contract (`P5-011`, `P5-022`) and contains only the categories required by the request.
- An unsuccessful response matches the safe failure response shape (`P5-025`) with an integration error code from the catalog (`P5-018`).

### 8. Backend validates the response

- Backend DTOs validate every field of the AIM Engine response.
- Validation covers structure, required categories, value ranges, referenced entity ids, and category-specific invariants (defined by the contract tasks `P5-012` through `P5-017`).
- An invalid response is never persisted. The Backend records a validation failure audit entry and applies the fallback for the originating call site.

### 9. Backend persists validated outputs

- Validated outputs are written to the database through backend-owned migrations and services only.
- Student skill states, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, and session summaries each go to their dedicated tables introduced in Phase 5 (the migrations `P5-029` and onward).
- Persistence is transactional per AIM response. A partial persistence failure rolls back to a consistent state for that response.
- Backend records a persistence audit entry with metadata only.

### 10. Backend exposes results through read APIs

- Read-only AIM result APIs (defined later in Phase 5) return backend-persisted values to authorized clients.
- Every result API enforces a permission guard from the Phase 2 auth and role foundation.
- Every response is validated against a backend response DTO before leaving the Backend.

### 11. Client renders results

- The client renders the backend-approved values.
- The client does not recompute, override, or re-derive AIM-owned values.
- Allowed transformations are display rounding, formatting, ordering for presentation, and accessibility transformations of already-persisted values.

## Sequence Summary

```
Client            Backend                              AIM Engine            Database
  |                  |                                      |                    |
  |--raw input------>|                                      |                    |
  |                  |--validate DTOs                       |                    |
  |                  |--persist raw attempt/session------------------------------>|
  |                  |--compose AIM request------>          |                    |
  |                  |                                      |                    |
  |                  |---POST analysis (internal)-----------> validate input     |
  |                  |                                      | run pipeline       |
  |                  |<--structured response or safe failure|                    |
  |                  |--validate response DTOs              |                    |
  |                  |--persist validated outputs--------------------------------->|
  |                  |--audit metadata (request, response, validation, persist)   |
  |<--READ AIM result API (permission-guarded, validated)---|                    |
  |--render values---|                                      |                    |
```

## Direction and Allowed Channels

| Channel | Direction | Allowed | Notes |
| --- | --- | --- | --- |
| Client → Backend | Inbound | Yes | Raw input only. Auth required. AIM-owned fields stripped if present. |
| Backend → AIM Engine | Internal | Yes | Internal network only. Backend-only credentials. Structured request contract. |
| AIM Engine → Backend | Internal | Yes | Structured response or safe failure shape. Validated by Backend before any downstream use. |
| Backend → Database | Internal | Yes | Through backend-owned services and migrations only. Transactional per AIM response. |
| Backend → Client | Outbound | Yes | Read-only AIM result APIs with permission guards and DTO validation. |
| Client → AIM Engine | Direct | **Forbidden** | The AIM Engine is internal-only. Clients never reach it. |
| AIM Engine → Client | Direct | **Forbidden** | The AIM Engine never pushes to clients. |
| AIM Engine → Database | Direct | **Forbidden** | Persistence is owned by the Backend. The AIM Engine returns values; it does not write. |
| Client → Backend (write paths for AIM-owned values) | Inbound | **Forbidden** | Backend rejects client-supplied mastery, level, weakness, difficulty, recommendation, review schedule, retention, frustration. |

## Failure Paths

Each step has a defined failure mode. The backend never silently masks a failure that would corrupt student state.

| Failure point | Backend behavior |
| --- | --- |
| Client input invalid | Reject with validation error. No AIM call. No persistence beyond audit. |
| Backend cannot compose AIM request (missing state) | Skip AIM call. Return a safe state to the client. Log integration error. |
| AIM Engine timeout | Apply timeout policy from `P5-008`. Use safe fallback for the call site. Audit the failure. Do not persist AIM-owned values for this response. |
| AIM Engine returns safe failure shape | Treat as no-decision. Apply fallback. Audit with the returned error code. |
| AIM Engine returns invalid structure | Treat as no-decision. Apply fallback. Audit a validation failure. Never persist. |
| Backend DTO validation fails on response | Treat as no-decision. Apply fallback. Audit. Never persist. |
| Database write fails after validation passes | Roll back the transaction for that AIM response. Audit. Surface a controlled error to the originating call site. |
| Result API authorization fails | Return a controlled authorization error. No data leaks. Audit the denial. |

## Persistence Contracts (Direction Only)

Phase 5 introduces or extends the following backend-owned tables. Field shapes are defined by the contract tasks; this section fixes the **owner** of each table.

| Table | Owner | Writer |
| --- | --- | --- |
| `student_skill_states` | Backend AIM pipeline | Backend service, after AIM response validation |
| `weakness_records` | Backend AIM pipeline | Backend service, after AIM response validation |
| `difficulty_decisions` | Backend AIM pipeline | Backend service, after AIM response validation |
| `recommendations` | Backend AIM pipeline | Backend service, after AIM response validation |
| `review_schedules` | Backend AIM pipeline | Backend service, after AIM response validation |
| `frustration_signals` | Backend AIM pipeline | Backend service, after AIM response validation |
| `session_summaries` | Backend AIM pipeline | Backend service, after AIM response validation |
| `aim_audit_log` | Backend | Backend AIM adapter and pipeline |

No client writes to any of these tables. No AIM Engine writes to any of these tables.

## Audit Logging

Audit entries are recorded at each integration step. Defaults:

- Metadata only (timestamps, identifiers, error codes, duration, outcome).
- No raw secrets, credentials, or AI provider keys.
- Sensitive payload fields are logged only when explicitly required and documented at the log site.

## Non-Negotiables Reinforced

- Backend is the only caller of the AIM Engine.
- The AIM Engine is not exposed to clients on any route.
- Clients never compute AIM-owned values.
- Backend validates every AIM response before persistence.
- Persistence flows through the backend AIM pipeline only.
- AIM result APIs require permission guards.
- Audit logs avoid secrets and excessive sensitive payloads.
- Speed and timing remain behavioral context, never inputs to mastery, level, or difficulty logic at any layer.

## Downstream Anchors

| Concern | Defined by |
| --- | --- |
| AIM request payload shape | P5-006, P5-009, P5-010, P5-011, P5-021 |
| AIM response payload shape | P5-011, P5-022 |
| Backend AIM adapter | downstream backend adapter task |
| AIM Engine endpoints | P5-019, P5-020, P5-023 |
| AIM Engine input validation | P5-024 |
| AIM Engine safe failure response | P5-025 |
| AIM Engine test fixtures and unit tests | P5-026, P5-027 |
| AIM error code catalog | P5-008, P5-018 |
| Persistence migrations | P5-029 and onward |
| AIM result APIs | downstream backend API tasks |
| AIM audit log | downstream audit task |

This document does not redefine those shapes. It locks the **flow** they all sit on.
