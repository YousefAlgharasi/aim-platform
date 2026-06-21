# Phase 5 AIM Engine Security Review

**Task:** P5-080  
**Branch:** `phase5/P5-080-aim-engine-security-review`  
**Date:** 2026-06-18  
**Reviewer:** Codex  
**Scope:** AIM Engine Integration security boundary only

---

## 1. Purpose

This review verifies the Phase 5 AIM Engine integration security controls:

- AIM Engine access remains backend-internal.
- Service tokens and other secrets are not exposed.
- AIM request and response logging is metadata-only.
- AIM result APIs enforce authentication, role, ownership, and UUID boundary validation.
- Invalid, unavailable, or unsafe AIM Engine responses fail safely.
- No client-side AIM calculation or direct AIM Engine call is introduced.

This task is documentation-only. No backend, AIM Engine, mobile, admin, or
migration behavior is changed by this review.

---

## 2. Files Reviewed

### Backend AIM integration

- `services/backend-api/src/features/aim/aim-engine-client.service.ts`
- `services/backend-api/src/features/aim/adapter/aim-engine-adapter.service.ts`
- `services/backend-api/src/features/aim/adapter/aim-adapter-timeout-policy.service.ts`
- `services/backend-api/src/features/aim/adapter/aim-adapter-error-handler.service.ts`
- `services/backend-api/src/features/aim/adapter/aim-response-mapper.service.ts`
- `services/backend-api/src/features/aim/pipeline/aim-pipeline-orchestrator.service.ts`
- `services/backend-api/src/features/aim/persistence/aim-audit.service.ts`
- `services/backend-api/src/features/aim/persistence/aim-persistence.service.ts`
- `services/backend-api/src/features/aim/result/aim-result.controller.ts`
- `services/backend-api/src/features/aim/result/aim-result.dto.ts`

### AIM Engine service

- `services/aim-engine/app/api/analysis.py`
- `services/aim-engine/app/api/system.py`
- `services/aim-engine/app/core/config.py`
- `services/aim-engine/app/main.py`
- `services/aim-engine/app/errors/aim_safe_failure.py`
- `services/aim-engine/app/validation/aim_request_validator.py`

### Scope and regression evidence

- `docs/phase-5/aim-engine-api-map.md`
- `docs/phase-5/backend-aim-pipeline-map.md`
- `docs/phase-5/aim-error-handling-policy.md`
- `docs/phase-5/no-client-aim-rule.md`
- `docs/quality/phase-5-no-client-aim-regression-check.md`
- `scripts/checks/no-client-aim-regression-check.sh`

---

## 3. Security Review Summary

| Domain | Result | Notes |
|---|---:|---|
| Backend-only AIM Engine caller | PASS | Backend `AimEngineClientService` is the only HTTP caller of `/aim/v1/analysis`. |
| AIM Engine endpoint authentication | PASS | Analysis endpoint requires bearer service token and uses constant-time comparison. |
| Secret handling | PASS | Service token is sent in the Authorization header only and is not logged or returned. |
| Metadata-only logging | PASS | Backend and AIM Engine logs avoid raw request/response bodies and token values. |
| Response validation before persistence | PASS | Backend adapter validates AIM envelope and categories before Stage 6 persistence. |
| Safe failure handling | PASS | Transport, timeout, auth, validation, and contract failures return safe fallback paths. |
| Result API permissions | PASS | Result reads use JWT guard, student ownership guard, role metadata, and UUID pipes. |
| Client-side AIM boundary | PASS | Regression check confirms clients do not call AIM Engine or compute AIM-owned values. |
| Infrastructure exposure | WATCH | Code enforces auth; deployment must keep AIM Engine network-internal. |

**Overall result: PASS with one operational watch item.**

---

## 4. Findings

### 4.1 Backend-Only AIM Engine Access

**Result: PASS**

`AimEngineClientService.postAnalysis()` is the backend HTTP caller for
`POST /aim/v1/analysis`. The adapter path is:

1. `AimPipelineOrchestratorService.trigger()`
2. `AimRequestMapperService.map()`
3. `AimEngineAdapterService.analyze()`
4. `AimEngineClientService.postAnalysis()`
5. `AimResponseMapperService.map()`
6. `AimPersistenceService.persist()`

The reviewed client regression script checks Flutter, Admin Dashboard, and
web app source paths for direct AIM Engine route references, AIM Engine URL
usage, AIM Engine client imports, AIM analysis request construction, and local
mastery/difficulty calculations.

No reviewed client path calls the AIM Engine directly.

---

### 4.2 AIM Engine Service Token

**Result: PASS**

The AIM Engine analysis route uses a FastAPI `HTTPBearer` dependency. Missing,
malformed, or invalid bearer credentials produce HTTP 401 responses with safe
error bodies. Token comparison uses `secrets.compare_digest()`.

The backend sends the token only from
`AimEngineClientService.buildAuthHeaders()`:

- `Authorization: Bearer <service token>`
- `X-Request-Id`
- `X-Backend-Version`
- `X-Contract-Version`

The token is not interpolated into any logger call. Backend transport error
logging uses `toSafeErrorMessage()`, which returns only the error name.

**Security note:** `AimEngineSettings.service_token` defaults to
`local-dev-token` for local/test environments. Staging and production must set
`AIM_ENGINE_SERVICE_TOKEN` through deployment secret management.

---

### 4.3 Internal-Only Endpoint Exposure

**Result: PASS in application code; WATCH in deployment**

Application-level controls are present:

- `POST /aim/v1/analysis` requires the bearer service token.
- The endpoint description explicitly states it is backend-internal and not
  accessible to Flutter, Admin Dashboard, or other clients.
- OpenAPI docs are disabled in production via `AimEngineSettings.enable_docs`.
- Analysis responses include `Cache-Control: no-store`.

Infrastructure exposure cannot be fully proven from source code alone.
Deployment must keep the AIM Engine bound to the internal service network and
must not publish `/aim/v1/analysis` through a public gateway, reverse proxy,
or client-accessible route.

---

### 4.4 Request and Response Logging

**Result: PASS**

The AIM Engine analysis route logs metadata only:

- `x_request_id`
- `backend_request_id`
- `student_id`
- `session_id`
- `attempt_count`
- `contract_version`
- backend/contract header versions
- response status and duration

The route does not log:

- Authorization header or bearer token
- raw request body
- raw response body
- student answer text
- stack traces
- provider credentials or database credentials

Backend AIM logs are also metadata-oriented. The pipeline logs correlation IDs,
stage names, failure codes, duration, retry attempts, and dropped validation
codes. The audit service documentation explicitly forbids raw request bodies,
raw response bodies, tokens, AI provider keys, database credentials, and stack
traces inside `metadata`.

---

### 4.5 Response Validation Before Persistence

**Result: PASS**

`AimResponseMapperService` performs Stage 5 validation before persistence:

- Envelope must match originating `backendRequestId`, `studentId`, and
  `sessionId`.
- `contractVersion` must be supported.
- `generatedAt` must be valid ISO-8601.
- `categories` must be present and object-shaped.
- Each category applies type, enum, range, timestamp, and relationship checks.

Envelope failures reject the full response. Category entry failures are dropped
without blocking other valid categories, and dropped validation codes are
recorded for operational visibility.

`AimPipelineOrchestratorService` calls `AimPersistenceService.persist()` only
when the adapter returns `ok: true`. On adapter failure, it records a safe audit
entry and skips persistence.

---

### 4.6 Persistence Transaction Safety

**Result: PASS**

`AimPersistenceService.persist()` writes validated AIM output categories inside
a single explicit PostgreSQL transaction:

- `BEGIN`
- skill state updates
- weakness records
- difficulty decision
- recommendations
- review schedule
- session summary
- `COMMIT`

On any category write failure, the service issues `ROLLBACK` and rethrows so
the orchestrator can record a `persistence_failed` outcome. Audit writes are
intentionally outside the transaction and best-effort, so audit failures cannot
break the learning flow.

---

### 4.7 Safe Failure Behavior

**Result: PASS**

Backend adapter failures are classified into stable categories:

- transport timeout
- transport connection error
- transient HTTP
- authentication failure
- authorization failure
- validation failure
- idempotency conflict
- contract violation
- budget exhausted
- internal error

Write-side failures use Profile A fallback: raw input was saved, adaptive
analysis is unavailable for this call, and no AIM-owned values are written.
Read-side fallback policy is Profile B: return last validated-persisted values
or empty state, never proxy a live AIM Engine call.

No failure path returns engine internals, stack traces, tokens, raw payloads, or
AI provider details.

---

### 4.8 AIM Result API Security

**Result: PASS**

All AIM result read endpoints are guarded:

- `SupabaseJwtAuthGuard`
- `StudentOwnershipGuard`
- `RequireRoles(AuthorizedRole.STUDENT)`
- `RequireStudentOwnership({ paramName: 'studentId' })`
- `ParseUUIDPipe` for route UUID parameters

Endpoints return only backend-persisted, backend-validated values:

- skill states
- review schedules
- session AIM state
- weakness records
- recommendations

No endpoint proxies a live AIM Engine call. No endpoint accepts client-written
AIM-owned values.

---

### 4.9 Secrets and Credentials

**Result: PASS**

No reviewed AIM integration path exposes:

- Supabase service-role keys
- database credentials
- AI provider keys
- AIM Engine service token
- production environment variable values

The AIM Engine config file contains only a local/test default token placeholder
and documents that staging/production must provide a real token through the
environment.

---

### 4.10 No Client-Side AIM Calculation

**Result: PASS**

The P5-078 regression check covers client paths and verifies no direct AIM
Engine route usage, AIM Engine URL usage, AIM Engine client imports, AIM request
construction, local mastery calculation, local difficulty calculation, or
admin-side mastery/weakness calculation.

The P5-080 review found no new client code or UI changes.

---

## 5. Risk Register

| Risk | Severity | Status | Required action |
|---|---:|---|---|
| AIM Engine accidentally exposed publicly by deployment config | High | Open operational watch | Keep AIM Engine on internal network only; block public gateway routing to `/aim/v1/analysis`. |
| Production service token not overridden from local default | High | Open operational watch | Require `AIM_ENGINE_SERVICE_TOKEN` in staging/production secret management. |
| Future audit metadata call sites add sensitive payload fragments | Medium | Controlled by convention | Keep audit metadata schema narrow; consider a validator/lint rule in a later phase. |
| Production logs expose learning-decision metadata to broad operators | Low | Operational watch | Restrict log aggregation access to authorized engineering/operations staff. |

No code-level blocker was found for P5-080.

---

## 6. Scope Confirmation

| Rule | Result |
|---|---:|
| Phase 5 Backend-to-AIM Engine integration only | PASS |
| Backend remains the only AIM Engine caller | PASS |
| Flutter does not call AIM Engine | PASS |
| Admin Dashboard does not call AIM Engine | PASS |
| No Student Web App work introduced | PASS |
| No AI Teacher behavior introduced | PASS |
| No voice, payments, parent dashboard, or unrelated UI work introduced | PASS |
| No client-side mastery, level, weakness, difficulty, retention, recommendation, or review schedule calculation | PASS |
| No secrets, service-role keys, database credentials, or AI provider keys exposed | PASS |

---

## 7. Conclusion

The Phase 5 AIM Engine integration passes the security review at the code and
contract level. Backend-only AIM access is preserved, the AIM Engine analysis
endpoint is protected by a service token, logging is metadata-only, result APIs
are permission-guarded, unvalidated responses are not persisted, and failures
resolve to safe fallback paths.

The only remaining concerns are operational: deployment must keep the AIM
Engine network-internal, staging/production must provide a non-default service
token through secret management, and production log access should be restricted
to authorized staff.
