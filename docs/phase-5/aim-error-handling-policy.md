# Phase 5 — AIM Integration Error Handling Policy

## Purpose

This policy fixes how the Backend handles failures when integrating with the AIM Engine. It defines timeouts, retries, circuit breaking, idempotency, fallback semantics, the structure of safe error responses, and the audit obligations attached to every failure.

It is the source of truth referenced by:

- The AIM Engine API map (`P5-006`) for transport-level failure mapping.
- The Backend AIM Pipeline Map (`P5-007`) Stage 4, 5, 6, and 8.
- The downstream adapter and engine implementation tasks (`P5-019`, `P5-020`, `P5-023`, `P5-025`).
- The integration error code catalog (`P5-018`).

Concrete error code identifiers are owned by `P5-018`. Concrete fallback response shapes for each AIM result category are owned by the contract tasks. This document fixes the **behavior**.

## Principles

1. **No corruption.** A failure never persists a partial or unvalidated AIM response. The Backend either persists a fully validated response or persists nothing AIM-owned for that call.
2. **No leaks.** Failures returned to clients never contain stack traces, internal model fields, service tokens, database errors, or AIM Engine internals.
3. **Bounded blast radius.** A single failing call does not destabilize unrelated traffic. Retries, timeouts, and circuit breaking are scoped per call site.
4. **Deterministic fallback.** Every call site has a predefined fallback. There is no implicit best-effort behavior.
5. **Auditable.** Every failure produces a metadata-only audit entry with a stable error code from `P5-018`.
6. **Backend authority preserved.** A failure does not let the client substitute its own AIM-owned values. The Backend remains the sole producer of persisted AIM state.

## Failure Taxonomy

The Backend classifies failures into the following categories. Each category has a distinct handling profile.

| Category | Trigger | Retryable | Persistence allowed | Default fallback |
| --- | --- | --- | --- | --- |
| **Transport timeout** | Outbound call exceeds the adapter timeout. | Yes | No | Saved-input-without-AIM acknowledgement or last-known-good read. |
| **Transport connection error** | DNS, TCP, or TLS failure reaching the AIM Engine. | Yes | No | Same as transport timeout. |
| **Transient HTTP** | `429`, `500`, `503`, `504` from the engine. | Yes (per below) | No | Same as transport timeout. |
| **Authentication failure** | `401` from the engine. | No | No | Operator-visible failure. Surface a controlled error to the caller. Open the circuit aggressively. |
| **Authorization failure** | `403` from the engine. | No | No | Same as authentication failure. |
| **Validation failure (outbound)** | `400` or `422` from the engine. | No | No | Caller-visible validation error mapped through the backend error envelope. |
| **Idempotency conflict** | `409` from the engine. | No | No | Treated as a code defect; logged and surfaced as a controlled error. |
| **Contract violation (inbound)** | Engine returned a `200` whose body fails backend DTO validation. | No | No | Same as transport timeout for the caller path. Recorded as a contract-violation event. |
| **Persistence failure** | Database write fails after validation passed. | Owned by orchestration policy, not by the persistence service. | No (for that response) | Roll back the transaction. Surface a controlled error to the caller. |
| **Authorization denial on result read** | Caller lacks permission. | No | N/A | Controlled `403` with the standard error envelope. |

"Persistence allowed: No" means no row in any AIM-owned table is written for that failed call.

## Timeouts

Timeouts are applied per call site and per category. The Backend and the AIM Engine each enforce their own deadlines independently.

| Concern | Default | Notes |
| --- | --- | --- |
| Backend outbound timeout to `POST /aim/v1/analysis` | 5 seconds | Hard upper bound on a single call attempt, including connection. |
| Backend outbound timeout to `GET /health` | 3 seconds | Already enforced by the existing AIM Engine client. |
| AIM Engine internal pipeline deadline | Owned by the engine; engine-side, less than the backend outbound timeout. | The engine returns the safe failure shape if its internal deadline trips. |
| Per-call total budget (including retries) | 12 seconds | The adapter abandons further retries once the budget is exhausted. |

Defaults are environment configuration values, not hard-coded constants. They are set through backend configuration and never exposed to clients.

## Retry Policy

Retries apply only to retryable categories above. The adapter never retries non-retryable categories.

| Property | Value |
| --- | --- |
| Maximum attempts | 3 (initial + 2 retries) |
| Backoff | Exponential with full jitter. Base 200 ms, cap 2 seconds. |
| Idempotency key | `backend_request_id` reused on every attempt. |
| Per-call total budget | 12 seconds (above). |
| Per-host budget | Governed by the circuit breaker (below). |
| Side-effect safety | Retries are safe because `POST /aim/v1/analysis` is side-effect-free and idempotent by `backend_request_id`. |

A retry does not change the request payload. A different payload requires a new `backend_request_id`.

The retry budget is shared with the timeout budget. The adapter abandons further retries once either is exhausted and converts the failure to the fallback path.

## Circuit Breaker

A circuit breaker protects the Backend from a degraded AIM Engine.

| Property | Value |
| --- | --- |
| Scope | Per AIM Engine host. One breaker per host, shared across calls. |
| Failure window | Rolling 30 seconds. |
| Open threshold | 5 consecutive failures or 50 % failure rate over the window with at least 10 calls. |
| Open duration | 30 seconds. |
| Half-open probe | A single trial call after the open duration. |
| Reset condition | Probe succeeds. |
| Re-open condition | Probe fails. |
| Behavior while open | New calls short-circuit to the fallback path without contacting the engine. The breaker is reported as the failure cause in the audit entry. |
| Authentication failures | Count as failures and accelerate opening with a separate, tighter threshold (3 in 30 seconds) because they indicate a configuration or credential issue. |

The breaker never persists AIM-owned values. Short-circuited calls are treated as failed calls for persistence and fallback purposes.

## Idempotency

Idempotency is the foundation of safe retries.

- The Backend issues a `backend_request_id` for every distinct logical analysis request. It is stable across retries for the same logical request.
- The Backend echoes `backend_request_id` in the request body and `X-Request-Id` correlates the call across logs.
- The AIM Engine deduplicates by `backend_request_id` and returns the cached response for the same payload digest, or `409` for a different payload digest.
- A `409` is treated as a code defect. The Backend does not silently mint a new `backend_request_id` to "fix" a `409`. It surfaces a controlled error and audits the conflict.

## Fallback Behavior

Every Backend call site that interacts with the AIM pipeline has a predefined fallback. The two canonical fallback profiles cover the Phase 5 surface.

### Profile A — Write-side caller (attempt submission, session event)

- The Backend has already persisted the raw input (Stage 1) before the pipeline runs (Stage 2).
- On any non-retry-recoverable failure between Stage 4 and Stage 6, the Backend:
  - Does not persist any AIM-owned values for that call.
  - Returns a controlled acknowledgement to the caller indicating the raw input was saved and that adaptive analysis is unavailable for this response.
  - Includes the stable backend integration error code from `P5-018`.
  - Does not surface engine-internal details, stack traces, or contract internals.
  - Records a pipeline-failed audit entry with metadata only.
- The client renders the result of the raw save and a backend-provided fallback message. The client does not compute any AIM-owned value to compensate.

### Profile B — Read-side caller (AIM result API consumer)

- A read API returns the last validated persisted value.
- If no validated value exists yet, the read API returns an empty-state response with a freshness indicator and a stable backend code from `P5-018`.
- The read API never invents, infers, or partially computes AIM-owned values when none have been persisted.
- The read API never proxies a live call to the AIM Engine to populate a missing result.

Both profiles preserve the source-of-truth chain: AIM Engine produces, Backend validates and persists, Clients consume.

## Safe Error Response Shape

All backend error responses for AIM integration follow the standard backend error envelope. The envelope carries only safe fields.

Required fields:

- `code` — stable backend integration error code from `P5-018`.
- `message` — short, user-safe message. No engine internals.
- `request_id` — backend correlation id (`X-Request-Id`).
- `timestamp` — ISO-8601 UTC.

Optional fields (set only when safe):

- `category` — failure category from the taxonomy above.
- `retryable` — boolean reflecting whether the caller may retry the **upstream** action; never the engine call.

Forbidden in error responses:

- Service tokens, AI provider keys, database errors, stack traces, raw engine response bodies, payload digests, internal model fields, secrets of any kind.

The AIM Engine's own safe failure response shape is owned by `P5-025`. The Backend never forwards the engine's safe failure body verbatim to a client; it maps the engine code to a backend code and emits the backend envelope.

## Logging and Auditing

Every failure produces both a backend log line and an AIM audit entry.

Mandatory log fields (metadata only):

- Timestamp
- `request_id` (`X-Request-Id`)
- `backend_request_id`
- Endpoint (`/aim/v1/analysis` or `/health`)
- Outcome (`success`, `transient`, `non_retryable`, `validation_failed`, `contract_violation`, `breaker_open`, `persistence_failed`, `authorization_denied`)
- Integration error code from `P5-018`
- Attempt number and elapsed time

Forbidden log content:

- Request body
- Response body
- Service token
- AI provider keys
- Database connection strings
- Stack traces in error envelopes (full stack traces may live in **backend** logs at debug level only, behind environment guards, never in client-facing responses)

Audit entries are written by the AIM audit service (`features/aim`, Stage 9 of the pipeline) and follow the same metadata-only rule. Sensitive payload fields are recorded only when explicitly required and documented at the log site.

## Operator Surfaces

The Backend exposes only safe operator signals. No human-readable AIM Engine internals leak.

- The AIM Engine health probe is the existing `GET /health` consumed by the backend AIM Engine client. The operator surface reports reachability and the engine's reported phase and environment.
- Circuit breaker state is exposed through internal backend metrics, not through client APIs.
- Failure rate and latency are tracked through standard backend observability tooling. The Backend does not introduce new dashboards as part of `P5-008`.

## Caller-Side Rules

Backend call sites observe the following rules without exception.

1. The adapter is the only call site to the AIM Engine.
2. Every outbound call carries `Authorization`, `X-Request-Id`, `X-Backend-Version`, and `X-Contract-Version` per `P5-006`.
3. Every outbound call uses the timeout, retry, and circuit breaker policy above.
4. Every response, success or failure, is validated through backend DTOs before any downstream use.
5. Every outcome is audited with metadata only.
6. Every failure that prevents persistence triggers the matching fallback profile.
7. No call site bypasses the policy because the path "feels low risk."

## Non-Negotiables Reinforced

- The Backend never persists an unvalidated AIM response.
- The Backend never returns engine internals to a client.
- Retries never change the request payload.
- The circuit breaker never causes an AIM-owned value to be invented.
- Fallback responses never expose secrets, stack traces, or internal model fields.
- Speed and timing remain raw behavioral context. Failure handling does not introduce any client-side or backend-side computation of mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration.
- All real secrets are absent from code, comments, logs, audit entries, fallback messages, and this document.

## Downstream Anchors

| Concern | Owned by |
| --- | --- |
| Integration error code identifiers | `P5-018` |
| AIM Engine safe failure response shape | `P5-025` |
| AIM Engine health endpoint | `P5-019` |
| AIM Engine analysis endpoint | `P5-020` |
| AIM Engine pipeline entrypoint | `P5-023` |
| AIM adapter implementation | downstream adapter task |
| AIM persistence services | downstream persistence tasks |
| AIM result APIs | downstream result API tasks |

This policy does not redefine those concerns. It defines the failure-handling contract they all sit on.
