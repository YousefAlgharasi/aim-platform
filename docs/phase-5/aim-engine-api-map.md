# Phase 5 — AIM Engine API Map

## Purpose

This document maps the internal HTTP API of the Python AIM Engine (FastAPI) for Phase 5. It is the implementation guide for the AIM Engine endpoint tasks (`P5-019`, `P5-020`, `P5-023`) and for the NestJS backend adapter that consumes them.

Concrete request and response field shapes are defined by the contract tasks (`P5-009`, `P5-010`, `P5-011`, `P5-021`, `P5-022`). This document fixes endpoint paths, methods, status codes, headers, semantics, idempotency, ordering, and failure shapes.

## Network Boundary

- The AIM Engine listens on the internal service network only.
- The base URL used by the backend adapter is `http://<aim-engine-internal-host>:<port>`. The exact host and port come from backend configuration, never from client configuration.
- No public ingress, no API gateway forwarding, no reverse proxy from a client-reachable domain.
- The OpenAPI docs and ReDoc routes (`/docs`, `/redoc`, `/openapi.json`) are enabled only in non-production environments. They are disabled in production.

## Authentication

- All Phase 5 endpoints except `/health` and `/version` require a backend service token, sent in the `Authorization` header as `Bearer <token>`.
- The token is provisioned to the backend service only. It is never embedded in any client bundle, never returned to a client, and never logged.
- Token verification is the first concern in every protected request. Failure returns the unauthenticated failure shape with status `401`.

## Standard Headers

| Header | Direction | Purpose |
| --- | --- | --- |
| `Authorization: Bearer <token>` | Inbound | Backend service authentication. Required on every protected endpoint. |
| `Content-Type: application/json` | Inbound, outbound | All bodies are JSON. |
| `X-Request-Id` | Inbound, outbound | Backend-issued correlation id. Echoed in the response. Logged in metadata. |
| `X-Backend-Version` | Inbound | Backend release identifier. Used by the engine for compatibility logging. |
| `X-Contract-Version` | Inbound, outbound | AIM contract version requested by the backend and acknowledged by the engine. |
| `Cache-Control: no-store` | Outbound | All AIM Engine responses are non-cacheable. |

## Versioning

- AIM Engine endpoints live under a versioned prefix: `/aim/v1/...`.
- Unversioned endpoints exist only for system probes: `/health`, `/version`.
- A breaking contract change introduces a new prefix (`/aim/v2/...`) and runs alongside the previous prefix until the backend cuts over.

## Endpoint Catalog

The Phase 5 endpoint set is intentionally small. Each row links to the task that implements it.

| Method | Path | Auth | Implementer | Caller | Purpose |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/health` | none | `P5-019` | Backend readiness probe | Service-level liveness/readiness. Safe metadata only. |
| `GET` | `/version` | none | existing | Backend deploy verification | Service version, phase, environment. |
| `POST` | `/aim/v1/analysis` | service token | `P5-020`, `P5-023` | Backend AIM adapter | Single analysis pipeline call. Returns structured AIM decisions or a safe failure response. |

No other endpoint is in scope for Phase 5. Direct read endpoints for skill state, weakness, difficulty, recommendations, review schedule, frustration, and session summary are explicitly **not** added to the AIM Engine. Those are owned by the backend AIM result APIs.

## `GET /health`

Implemented by `P5-019`. Already exists in skeleton form and is finalized in `P5-019`.

- **Method:** `GET`
- **Auth:** none
- **Request body:** none
- **Success status:** `200 OK`
- **Response body:** safe health metadata. Fields: stable service identifier, status, UTC ISO-8601 timestamp, process uptime seconds, phase identifier, environment name. No secrets, no database connection details, no provider credentials, no adaptive-learning internals.
- **Failure status:** `503 Service Unavailable` if the engine cannot self-attest readiness. The body uses the same safe metadata shape with `status` set to a non-ok value.

The `/health` endpoint is the single readiness signal consumed by the backend readiness probe defined in Phase 5.

## `GET /version`

Already implemented by the service skeleton. Kept stable in Phase 5.

- **Method:** `GET`
- **Auth:** none
- **Request body:** none
- **Success status:** `200 OK`
- **Response body:** stable service identifier, application version, phase identifier, environment name.

`/version` is not used in the request path of any analysis call. It exists for deployment verification only.

## `POST /aim/v1/analysis`

Implemented by `P5-020` (route) and `P5-023` (pipeline entrypoint). Input validation is defined by `P5-024`. Safe failure response shape is defined by `P5-025`.

- **Method:** `POST`
- **Auth:** required (service token)
- **Idempotency:** Idempotent per `(backend_request_id, attempt_id)` pair carried in the request body and `X-Request-Id` header. Re-submitting the same `backend_request_id` for the same attempt returns the original analysis result without re-running the pipeline.
- **Concurrency:** Sequential per `student_id`. The engine serializes analysis for a single student. Cross-student concurrency is allowed.
- **Side effects:** None. The engine does not write to the database. It only returns a response payload.
- **Request body:** structured analysis request, shape defined by `P5-009`, `P5-010`, `P5-011`, `P5-021`. The body conveys: backend request metadata, student id, session id, attempt id, raw attempt and answer data, raw behavioral signals (timing, retries, hesitation), and prior skill state references required by the analysis.
- **Validation:** governed by `P5-024`. Invalid input returns the safe failure shape with status `400` and a validation error code from `P5-018`.
- **Success status:** `200 OK`
- **Success response body:** structured analysis response, shape defined by `P5-011` and `P5-022`. May contain decisions across the AIM-owned categories: student skill state updates, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, session summaries. Each category is optional per call; the response carries only the categories the pipeline produced for that request.
- **Failure statuses and shape:** the safe failure response (`P5-025`) is returned for every non-success outcome. It carries an integration error code (`P5-018`), a stable code identifier, and metadata safe for logging. It never contains stack traces, internal model fields, or secrets.

### Failure Status Map

| Status | Meaning | Returned when |
| --- | --- | --- |
| `400 Bad Request` | Validation failure | Request body fails schema validation per `P5-024`. |
| `401 Unauthorized` | Missing or invalid service token | Authorization header missing, malformed, or rejected. |
| `403 Forbidden` | Token authenticated but not authorized for this endpoint | Reserved for future fine-grained service tokens. |
| `404 Not Found` | Referenced entity unknown to the engine | Reserved; the engine does not own entity existence. The Backend should ensure referenced entities exist before calling. |
| `409 Conflict` | Idempotency mismatch | Same `backend_request_id` reused with a different payload. |
| `422 Unprocessable Entity` | Structurally valid but semantically invalid | Reserved for semantic checks the engine performs beyond schema validation. |
| `429 Too Many Requests` | Engine self-throttling | Engine load shedding. The Backend applies the retry policy from `P5-008`. |
| `500 Internal Server Error` | Unexpected engine fault | Engine returns the safe failure shape with a generic integration error code. |
| `503 Service Unavailable` | Engine not ready | Returned by `/health` only; not expected from `/aim/v1/analysis`. |
| `504 Gateway Timeout` | Pipeline exceeded internal deadline | The engine applies its own internal deadline; the Backend applies its own timeout independently. |

### Timeouts and Retries

- The Backend applies an outbound timeout policy from `P5-008`.
- The engine applies its own internal deadline to the pipeline. The engine times bounded; on internal timeout it returns the safe failure shape.
- Safe retries (idempotent) are allowed for `429`, `500`, `503`, `504`. The Backend retry policy is owned by `P5-008`. The engine does not retry internally.
- Non-retryable: `400`, `401`, `403`, `409`, `422`.

### Idempotency Behavior

- The request carries `backend_request_id` in the body.
- For the first call with a given `backend_request_id`, the engine runs the pipeline and stores the response in an internal short-lived cache keyed by `backend_request_id`.
- For subsequent calls with the same `backend_request_id` and an identical payload digest, the engine returns the cached response with the same status.
- For subsequent calls with the same `backend_request_id` and a different payload digest, the engine returns `409` with the conflict error code.
- The cache window length is defined by the engine configuration. Outside the window, the request is treated as new.

### Ordering and Concurrency

- The engine serializes analysis per `student_id`. Two concurrent calls for the same student do not interleave inside the pipeline.
- The engine processes requests for different students in parallel up to its configured worker pool size.
- The Backend must not depend on cross-student ordering. The Backend is responsible for ordering its own writes against its own state for a given student.

### Audit Surface

- The engine logs metadata only: timestamp, `X-Request-Id`, `backend_request_id`, `student_id`, `session_id`, `attempt_id`, status, error code if any, pipeline duration.
- The engine never logs the raw request body or the raw response body.
- The engine never logs the service token, secrets, or provider credentials.

## What the AIM Engine Will Not Expose

The following endpoints are not added to the AIM Engine under any Phase 5 task:

- Endpoints that return persisted skill state, weakness, difficulty, recommendation, review schedule, frustration, or session summary records. Those are owned by backend AIM result APIs.
- Endpoints that write to the database.
- Endpoints intended for client traffic.
- Endpoints that accept client tokens.
- Endpoints that proxy AI provider calls.
- Endpoints that return model internals, tuning parameters, or adaptive-learning intermediates.

## Backend Adapter Contract (Caller View)

The backend AIM adapter calls the API map above with these expectations:

1. The adapter is the only caller. No other backend module bypasses it.
2. Every call includes the `Authorization`, `X-Request-Id`, `X-Backend-Version`, and `X-Contract-Version` headers.
3. The adapter applies the timeout, retry, and circuit breaker policy from `P5-008`.
4. The adapter parses successful responses through DTOs defined by `P5-011` / `P5-022`. Invalid responses are treated as failures and never propagated to persistence.
5. The adapter maps safe failure responses to backend integration error codes from `P5-018`.
6. The adapter records request, response, and outcome metadata in the AIM audit log, with no payload bodies and no secrets.

## Conformance Checklist for `P5-019` and `P5-020`

- Service network only. No public route.
- `/health` returns safe metadata. No secrets, no DB URLs, no provider credentials, no algorithm internals.
- `/aim/v1/analysis` requires a service token and rejects unauthenticated calls with `401`.
- `/aim/v1/analysis` validates the request per `P5-024` and returns the safe failure shape on validation errors.
- `/aim/v1/analysis` is side-effect-free. It does not write to the database.
- `/aim/v1/analysis` echoes `X-Request-Id`.
- `/aim/v1/analysis` produces a response that conforms to `P5-011` / `P5-022`.
- Idempotency by `backend_request_id` is honored.
- OpenAPI docs are disabled in production environments.

## Conformance Checklist for the Backend Adapter

- The adapter is the only call site to `/aim/v1/analysis` in the backend.
- All requests include the standard headers above.
- All responses are validated through backend DTOs before any downstream use.
- Failures map to the integration error code catalog and trigger the documented fallback behavior.
- Audit entries record metadata only.

## Non-Negotiables Reinforced

- Backend is the only caller of the AIM Engine.
- AIM Engine has no public route.
- AIM Engine has no client credentials.
- AIM Engine has no database write paths.
- Speed and timing are inputs to the pipeline as raw behavioral context only and never enter mastery, level, or difficulty logic at any layer.
- No real secret appears in logs, error bodies, audit entries, or documentation.
