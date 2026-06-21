# Phase 5 — Backend AIM Pipeline Map

## Purpose

This document maps the **backend-side orchestration** that runs from an authenticated client input through the AIM Engine call to the validated, persisted, and exposed AIM result. It is the implementation guide for the downstream backend tasks that build the AIM adapter, AIM pipeline services, AIM persistence services, and AIM result APIs.

It is the backend mirror of `docs/phase-5/aim-engine-api-map.md` (`P5-006`). Where that document fixes the AIM Engine's surface, this one fixes the backend's orchestration around it.

Concrete request and response field shapes remain owned by the contract tasks (`P5-009` through `P5-018`, plus `P5-021`/`P5-022`). Persistence tables remain owned by the migration tasks (`P5-029` and onward). This document fixes the **stages**, **boundaries**, **ownership**, and **failure handling** inside the backend.

## Backend Topology

The Phase 5 backend pipeline lives in the existing NestJS feature-based architecture under `services/backend-api/src/features/`. It does not introduce a new feature root. It extends the existing `aim` feature and uses sibling features in read-only ways.

| Module | Existing or new in Phase 5 | Role in the AIM pipeline |
| --- | --- | --- |
| `features/aim` | Existing; extended in Phase 5 | Owns the AIM adapter, AIM pipeline orchestrator, AIM persistence services, AIM audit, and AIM result APIs. Sole module that talks to the AIM Engine. |
| `features/sessions` | Existing | Provides session entities and lifecycle. Read by the AIM pipeline. Does not call the AIM Engine. |
| `features/lessons` | Existing | Provides lesson attempt entities. Read by the AIM pipeline. Does not call the AIM Engine. |
| `features/placement` | Existing (Phase 4) | Owner of placement result and initial path. Read by the AIM pipeline when initial AIM state is derived from placement. |
| `features/students` | Existing | Provides student entity and read access. Used by the AIM pipeline for student id resolution. |
| `features/curriculum` | Existing (Phase 3) | Provides skill and level taxonomy. Read by the AIM pipeline for skill references. |
| `features/ai-teacher` | Existing skeleton | **Not** in the Phase 5 pipeline path. The AIM pipeline does not call the AI Teacher. The AI Teacher does not override AIM decisions. |
| `features/admin` | Existing | Consumes AIM result APIs in read-only form. Does not call the AIM Engine. |
| `auth` and `common` | Existing | Authentication, role guards, DTOs, error filters. Reused by the AIM pipeline. |
| `database` | Existing | Provides Prisma access. Persistence services use it through repository-style providers. |

Sibling consumers of AIM results (`features/admin`, future client-facing endpoints) are restricted to the read APIs exposed by `features/aim`. They never bypass the adapter.

## Pipeline Stages

The backend pipeline runs in nine ordered stages. Each stage has a single owner module, a defined input, a defined output, a defined failure mode, and an audit obligation.

### Stage 1 — Client API entry

- **Owner:** existing client-facing controllers in `features/sessions`, `features/lessons`, and any future Phase 5 client endpoints inside `features/aim`.
- **Input:** authenticated client request carrying raw attempt, answer, or session-event data and raw behavioral signals.
- **Output:** validated, identity-bound input DTO.
- **Obligations:**
  - Authentication and role guards from `auth` and `common` run first.
  - DTOs validate types, ranges, ownership, and strip any AIM-owned fields the client must not provide (mastery, level, weakness, difficulty, recommendation, review schedule, retention, frustration). Stripped fields are recorded as a validation event.
  - The controller stores raw attempt or session data through its own feature service before triggering the AIM pipeline.
- **Failure:** validation error → `400` with the standard error envelope; no AIM call.

### Stage 2 — Pipeline trigger

- **Owner:** `features/aim` → AIM pipeline orchestrator (new in Phase 5).
- **Input:** persisted raw attempt or session-event id plus context required to compose the AIM request.
- **Output:** an in-memory pipeline context object holding student id, session id, attempt id, contract version, request id, and references to the records read in Stage 3.
- **Obligations:**
  - The trigger is invoked synchronously inside the controller transaction boundary **only** if the analysis must precede the controller response; otherwise it is dispatched as a background unit of work and the controller responds with the raw-input acknowledgement.
  - Either path records a pipeline-started audit entry with metadata only.
- **Failure:** missing context (orphaned attempt, missing student record) → abort pipeline, record audit entry, return a controlled error to the caller path. No AIM call.

### Stage 3 — State assembly

- **Owner:** `features/aim` → AIM state assembly service (new in Phase 5).
- **Input:** pipeline context.
- **Output:** structured AIM Engine request payload conforming to the contracts in `P5-009`, `P5-010`, `P5-011`, `P5-021`.
- **Obligations:**
  - Reads prior `student_skill_states`, relevant `weakness_records`, recent attempt history, and required curriculum references through read-only repository providers.
  - Attaches raw behavioral signals from Stage 1 unchanged. Speed and timing remain raw context.
  - Does not pre-compute mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration.
  - Stamps `backend_request_id`, `X-Request-Id` correlation, `X-Backend-Version`, and `X-Contract-Version`.
- **Failure:** state assembly cannot build a valid request (e.g., contract violation, missing required reference) → abort pipeline, record audit entry with the integration error code, return a controlled error to the caller path. No AIM call.

### Stage 4 — AIM Engine call

- **Owner:** `features/aim` → AIM Engine client (`aim-engine-client.service.ts`, extended in Phase 5).
- **Input:** the structured request from Stage 3.
- **Output:** the raw HTTP response from the AIM Engine.
- **Obligations:**
  - Single call site. No other backend module calls the AIM Engine.
  - Sends the headers required by `P5-006`: `Authorization`, `Content-Type`, `X-Request-Id`, `X-Backend-Version`, `X-Contract-Version`.
  - Applies the timeout, retry, and circuit breaker policy from `P5-008`.
  - Honors idempotency by sending the same `backend_request_id` on retries.
  - Records a request-sent audit entry with metadata only. Never logs the request body or the service token.
- **Failure:** transport timeout, connection error, `429`, `500`, `503`, `504` after retries → propagate as a typed adapter failure with the matching integration error code. The pipeline moves to Stage 8 (fallback).

### Stage 5 — Response validation

- **Owner:** `features/aim` → AIM response validation service (new in Phase 5).
- **Input:** the raw response body from Stage 4.
- **Output:** a validated AIM response object whose categories conform to the contracts in `P5-011`, `P5-012` through `P5-017`, and `P5-022`.
- **Obligations:**
  - Validates structure, required and optional categories, value ranges, referenced entity ids, and category-specific invariants.
  - Cross-checks that the response is for the same `student_id` / `session_id` / `attempt_id` the request carried.
  - Rejects responses whose structure or contract version does not match.
- **Failure:** any validation failure → typed adapter failure with the validation integration error code. The pipeline moves to Stage 8 (fallback). The invalid response is never persisted.

### Stage 6 — Persistence

- **Owner:** `features/aim` → AIM persistence services (new in Phase 5, one service per category).
- **Input:** the validated AIM response object from Stage 5.
- **Output:** persisted rows in the Phase 5 tables.
- **Obligations:**
  - Each AIM-owned category persists through its dedicated service: student skill state, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, session summaries.
  - Persistence for a single AIM response is transactional. A partial write rolls back to a consistent state for that response.
  - Persistence services never accept input from any module other than the pipeline orchestrator.
  - Persistence services never accept client-submitted values for AIM-owned fields, even if a client somehow reaches them. They are not exposed to controllers that handle client write paths.
- **Failure:** database write error after validation passed → roll back the transaction for that AIM response, record a persistence-failed audit entry with metadata and the integration error code, surface a controlled error to the caller path. The pipeline does not retry persistence inside the same call; retry is owned by the higher-level orchestration policy.

### Stage 7 — Result emission

- **Owner:** `features/aim` → AIM result APIs (new in Phase 5).
- **Input:** persisted AIM rows.
- **Output:** validated read-API responses returned to authorized clients.
- **Obligations:**
  - Read-only endpoints. No write paths for AIM-owned values.
  - Permission guards from the Phase 2 auth and role foundation apply to every endpoint.
  - Response DTOs validate every payload before it leaves the backend.
  - Caching is `no-store` by default. Any caching introduced later is owned by a separate task.
- **Failure:** authorization denial → controlled `403` with the standard error envelope; record a denial audit entry. No AIM-owned data leaks.

### Stage 8 — Safe fallback

- **Owner:** `features/aim` → fallback policy module (anchored in `P5-008`; consumed here).
- **Trigger:** any typed adapter failure from Stages 4, 5, or 6.
- **Behavior:**
  - The backend never persists an unvalidated AIM response.
  - The backend returns a controlled response to the caller path. The shape of that response depends on the entry point: an attempt-submission caller receives a saved-attempt-without-AIM acknowledgement; a result-read caller receives the last known good persisted state with a freshness indicator.
  - The pipeline records the failure with the integration error code from `P5-018`.
  - Higher-level retry, requeue, or human-review escalation is owned by separate tasks and not embedded in the pipeline itself.

### Stage 9 — Audit close-out

- **Owner:** `features/aim` → AIM audit service (new in Phase 5).
- **Input:** the final outcome of the pipeline.
- **Output:** an audit entry per pipeline execution that includes start timestamp, end timestamp, outcome status, integration error code if any, durations per stage, and stable identifiers (`backend_request_id`, `student_id`, `session_id`, `attempt_id`, `X-Request-Id`).
- **Obligations:**
  - Metadata only by default. Payload fields are logged only when explicitly required and documented at the log site.
  - No secrets, no service tokens, no provider credentials, no client identifiers beyond what the audit needs.

## Ownership Matrix

| Concern | Owner module | Notes |
| --- | --- | --- |
| Calling the AIM Engine | `features/aim` AIM Engine client | Sole call site. No other module may call it. |
| Composing the AIM request | `features/aim` state assembly | Reads from sibling features through read-only providers. |
| Validating the AIM response | `features/aim` response validation | Rejects mismatched, malformed, or out-of-contract responses. |
| Persisting student skill states | `features/aim` skill state persistence service | Backed by Phase 5 migrations. |
| Persisting weakness records | `features/aim` weakness persistence service | Backed by Phase 5 migrations. |
| Persisting difficulty decisions | `features/aim` difficulty persistence service | Backed by Phase 5 migrations. |
| Persisting recommendations | `features/aim` recommendation persistence service | Backed by Phase 5 migrations. |
| Persisting review schedules | `features/aim` review schedule persistence service | Backed by Phase 5 migrations. |
| Persisting frustration signals | `features/aim` frustration persistence service | Educational signal only. |
| Persisting session summaries | `features/aim` session summary persistence service | Backed by Phase 5 migrations. |
| Exposing AIM result APIs | `features/aim` result controllers | Permission-guarded, DTO-validated, read-only. |
| AIM audit logging | `features/aim` audit service | Metadata only by default. |
| Fallback policy | `features/aim` fallback module (defined by P5-008, used by stages 4/5/6) | Single source of fallback behavior. |
| Auth and role guards | `auth` and `common` | Reused. Not duplicated inside `features/aim`. |
| Database access | `database` | Through repository-style providers per service. |

## Direction Rules

- One-way orchestration: client API → state assembly → AIM client → validation → persistence → result API. Backward calls (persistence reading from validation, validation calling the client) are forbidden.
- No cross-feature writes to AIM-owned tables. Sibling features that need AIM data read through the result APIs, never through direct DB access.
- No cross-feature calls into the AIM Engine client. Sibling features that need AIM analysis call the AIM pipeline orchestrator, which then talks to the client.
- No backend route forwards client traffic to the AIM Engine. All AIM Engine traffic originates inside the backend process.

## Failure Routing

| Failure point | Backend behavior | Audit code source |
| --- | --- | --- |
| Stage 1 validation | Reject input. No AIM call. | Backend validation error codes. |
| Stage 2 missing context | Abort pipeline. Controlled error to caller. | `P5-018` integration error catalog. |
| Stage 3 state assembly violation | Abort pipeline. Controlled error to caller. | `P5-018`. |
| Stage 4 timeout, connection, `429`, `500`, `503`, `504` | Retry per `P5-008`, then fallback. | `P5-018`. |
| Stage 4 `400`, `401`, `403`, `409`, `422` | No retry. Fallback. | `P5-018`. |
| Stage 5 invalid response | No persistence. Fallback. | `P5-018`. |
| Stage 6 DB write failure | Roll back. Controlled error to caller. Pipeline-level retry decided by orchestration policy, not by the persistence service. | `P5-018`. |
| Stage 7 authorization denial | `403` with standard envelope. Denial audit entry. | Backend authorization error codes. |
| Any stage | Audit close-out runs regardless of outcome. | Pipeline audit codes. |

## Sequence Summary

```
Stage 1   client API entry            (sessions/lessons/aim controllers)
Stage 2   pipeline trigger             (features/aim orchestrator)
Stage 3   state assembly               (features/aim state assembly)
Stage 4   AIM Engine call              (features/aim AIM Engine client)
Stage 5   response validation          (features/aim response validation)
Stage 6   persistence                  (features/aim persistence services)
Stage 7   result emission              (features/aim result APIs)
Stage 8   safe fallback (on failure)   (features/aim fallback module)
Stage 9   audit close-out              (features/aim audit service)
```

The result-emission stage runs on read calls; the rest of the chain runs on write or session-event calls. Both chains terminate in audit close-out.

## Conformance Checklist for Downstream Backend Tasks

- The AIM Engine client remains the sole call site to the AIM Engine.
- The state assembly service does not compute AIM-owned values.
- The response validation service rejects all out-of-contract responses.
- The persistence services accept input only from the pipeline orchestrator.
- The result APIs are read-only, permission-guarded, and DTO-validated.
- The audit service records metadata only by default.
- No client controller bypasses the pipeline orchestrator to write AIM-owned values.
- No sibling feature reads AIM-owned tables directly; it goes through the result APIs.
- No backend code calls the AIM Engine outside `features/aim`.
- No real secret appears in code, comments, logs, audit entries, or DTO defaults.

## Non-Negotiables Reinforced

- Backend is the only caller of the AIM Engine, and inside the backend, `features/aim` is the only caller.
- Clients never compute AIM-owned values, and the backend strips any such fields from inbound payloads.
- The backend validates every AIM response before persistence.
- Persistence flows through dedicated `features/aim` services only.
- Result APIs are permission-guarded and DTO-validated.
- Speed and timing remain raw behavioral context. They never enter mastery, level, or difficulty logic at any layer.
- AIM audit logging is metadata-only by default.
