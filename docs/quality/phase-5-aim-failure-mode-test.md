# Phase 5 — AIM Failure Mode Test

**Task:** P5-083  
**Date:** 2026-06-17  
**Branch:** `phase5/P5-083-aim-failure-mode-test`  
**Dependencies:** P5-049 (timeout/retry policy), P5-050 (error handler & fallback profiles), P5-077 (pipeline integration tests) — all merged to `main`  
**Scope:** Backend AIM Engine integration only. No client-side AIM logic. No AI Teacher. No secrets.

---

## Purpose

This document records the results of the Phase 5 AIM failure mode test. It verifies that the AIM pipeline behaves safely across all defined failure scenarios: timeout, engine unavailability, transport errors, authentication failures, validation failures, contract violations, budget exhaustion, and persistence failures.

Coverage is drawn from five existing test suites that together exercise every failure path defined in `docs/phase-5/aim-error-handling-policy.md` (P5-008).

---

## Failure Scenarios Tested

### Scenario 1 — Transport timeout (AIM Engine too slow)

**Error code:** `TRANSPORT_TIMEOUT`  
**Trigger:** `AbortSignal.timeout` fires before the AIM Engine responds.  
**Policy (P5-008):** Retryable. Up to `maxRetryAttempts` (default 3) with exponential + full-jitter backoff.

| Test | Suite | Result |
|---|---|---|
| Returns `TRANSPORT_TIMEOUT` on AbortSignal timeout | `aim-engine-client.service.spec.ts` | ✓ PASS |
| Retries `TRANSPORT_TIMEOUT` up to `maxRetryAttempts` | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Returns last failure after exhausting all attempts | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| `budgetExhausted: true` when total budget is zero | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies `TRANSPORT_TIMEOUT` as `transport_timeout`, retryable: true | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |

**Outcome:** The pipeline retries on timeout up to the configured limit, then returns a typed `ok: false` outcome with `reason: aim_engine_unavailable`. Persistence is skipped. Audit is written. The orchestrator never throws.

---

### Scenario 2 — Network connection failure (AIM Engine unreachable)

**Error code:** `TRANSPORT_CONNECTION_ERROR`  
**Trigger:** `fetch` throws a network-level error (DNS failure, connection refused).  
**Policy (P5-008):** Retryable. Same retry/backoff policy as timeout.

| Test | Suite | Result |
|---|---|---|
| Returns `TRANSPORT_CONNECTION_ERROR` on network failure | `aim-engine-client.service.spec.ts` | ✓ PASS |
| Retries `TRANSPORT_CONNECTION_ERROR` | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies as `transport_connection_error`, retryable: true | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| Returns `available: false` when health check is unreachable | `aim-health-check.service.spec.ts` | ✓ PASS |
| `checkAvailability` never throws | `aim-health-check.service.spec.ts` | ✓ PASS |

**Outcome:** All three retry attempts fail; the pipeline returns `ok: false, reason: aim_engine_unavailable`. Health check endpoint returns `available: false` without throwing.

---

### Scenario 3 — Transient HTTP error (5xx from AIM Engine)

**Error code:** `TRANSIENT_HTTP`  
**Trigger:** AIM Engine returns a 5xx status code interpreted as a transient failure.  
**Policy (P5-008):** Retryable.

| Test | Suite | Result |
|---|---|---|
| Retries `TRANSIENT_HTTP` | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies as `transient_http`, retryable: true | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |

**Outcome:** Retried under the same budget policy as other transport errors.

---

### Scenario 4 — Authentication failure (invalid service token)

**Error code:** `AUTH_INVALID`  
**Trigger:** AIM Engine returns 401 (invalid or missing `Authorization: Bearer` token).  
**Policy (P5-008):** Non-retryable. Retrying with the same bad token would always fail.

| Test | Suite | Result |
|---|---|---|
| Returns `ok: false` on 401 | `aim-engine-client.service.spec.ts` | ✓ PASS |
| Does NOT retry `AUTH_INVALID` | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies `AUTH_INVALID` as `authentication_failure`, retryable: false | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| Service token is NOT included in failure result fields | `aim-engine-client.service.spec.ts` | ✓ PASS |
| Exception message does not contain service token or internals | `aim-health-check.service.spec.ts` | ✓ PASS |

**Outcome:** Immediate non-retryable failure. The service token is never leaked into logs, error responses, or result fields.

---

### Scenario 5 — Authorization failure (forbidden)

**Error code:** `FORBIDDEN`  
**Trigger:** AIM Engine returns 403.  
**Policy (P5-008):** Non-retryable.

| Test | Suite | Result |
|---|---|---|
| Classifies `FORBIDDEN` as `authorization_failure`, retryable: false | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |

**Outcome:** Immediate non-retryable failure.

---

### Scenario 6 — Request validation failure (bad payload)

**Error code:** `VALIDATION_ERROR`  
**Trigger:** AIM Engine returns 400 (malformed request body).  
**Policy (P5-008):** Non-retryable. A structurally invalid request would always fail.

| Test | Suite | Result |
|---|---|---|
| Returns `ok: false` with `statusCode` on 400 | `aim-engine-client.service.spec.ts` | ✓ PASS |
| Does NOT retry `VALIDATION_ERROR` | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies `VALIDATION_ERROR` as `validation_failure`, retryable: false | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| Returns `ok: false` with fallback code when error body is unparseable | `aim-engine-client.service.spec.ts` | ✓ PASS |

**Outcome:** Immediate non-retryable failure. An unparseable error body degrades gracefully to a safe fallback error code.

---

### Scenario 7 — Idempotency conflict

**Error code:** `IDEMPOTENCY_CONFLICT`  
**Trigger:** AIM Engine detects a duplicate `backendRequestId` for a conflicting request.  
**Policy (P5-008):** Non-retryable. Retrying would replay the same conflicting ID.

| Test | Suite | Result |
|---|---|---|
| Does NOT retry `IDEMPOTENCY_CONFLICT` | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies as `idempotency_conflict`, retryable: false | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |

**Outcome:** Immediate non-retryable failure. The `backendRequestId` is preserved across retries (idempotency contract intact).

---

### Scenario 8 — Contract / correlation violation

**Trigger:** AIM Engine response contains a mismatched `backendRequestId` or unsupported `contractVersion`.  
**Policy (P5-008):** Classified as `contract_violation`. Non-retryable.

| Test | Suite | Result |
|---|---|---|
| Returns `ok: false` with `contract_violation` on response correlation mismatch | `aim-engine-adapter.service.spec.ts` | ✓ PASS |
| Returns `ok: false` when `contractVersion` is unsupported | `aim-engine-adapter.service.spec.ts` | ✓ PASS |
| Classifies mapping failure as `contract_violation` | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |

**Outcome:** An unvalidated AIM response is never persisted. The pipeline returns `ok: false` immediately.

---

### Scenario 9 — Total budget exhaustion

**Trigger:** All retry attempts consume the full `totalBudgetMs` (default 12,000 ms) before a success.  
**Policy (P5-008):** Budget hard cap. Returns `budgetExhausted: true` in the retry outcome.

| Test | Suite | Result |
|---|---|---|
| `budgetExhausted: true` when budget is zero at start of attempt | `aim-adapter-timeout-policy.service.spec.ts` | ✓ PASS |
| Classifies budget exhaustion as `budget_exhausted`, retryable: false | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |

**Outcome:** Pipeline terminates immediately when budget is exhausted, returning a typed failure. Never hangs indefinitely.

---

### Scenario 10 — State assembly failure (upstream data missing)

**Trigger:** `AimStateAssemblyService.assemble` throws before the AIM Engine is called.  
**Policy:** Pipeline aborts at Stage 3; AIM Engine and persistence are never reached.

| Test | Suite | Result |
|---|---|---|
| Returns `ok: false, reason: state_assembly_failed` | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Does NOT call AIM Engine adapter when state assembly fails | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Does NOT call persistence when state assembly fails | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Audit is still called on state assembly failure | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Does NOT call AIM Engine when state assembly returns null (stub phase) | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Does NOT call persistence when state assembly returns null | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Records `state_assembly` audit entry with `non_retryable` outcome | `aim-pipeline-integration.spec.ts` | ✓ PASS |

**Outcome:** The pipeline fails safely at the earliest possible point. No unnecessary AIM Engine calls are made.

---

### Scenario 11 — Persistence failure (database write error)

**Trigger:** `AimPersistenceService.persist` throws after a successful AIM Engine response.  
**Policy:** Pipeline returns `ok: false, reason: persistence_failed`. Audit is still written.

| Test | Suite | Result |
|---|---|---|
| Returns `ok: false, reason: persistence_failed` | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Audit is still called on persistence failure | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Never throws — returns typed failure outcome | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Records `persistence` audit entry with `persistence_failed` outcome | `aim-pipeline-integration.spec.ts` | ✓ PASS |

**Outcome:** The AIM Engine call succeeds but its output is not persisted. The audit trail captures the failure. The caller receives a typed `ok: false` outcome.

---

### Scenario 12 — Fallback profiles (P5-050)

**Profile A** — write-side fallback: raw input saved, AIM output not applied.  
**Profile B** — read-side fallback: last persisted value returned; empty if none exists.

| Test | Suite | Result |
|---|---|---|
| `applyFallbackA` returns profile A with `rawInputSaved: true` | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| `applyFallbackA` output contains no secrets or internals | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| `applyFallbackB` returns profile B with `null lastPersistedValue` | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| `applyFallbackB` echoes `lastPersistedValue` when provided | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| Error message is user-safe (no engine internals) | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| Error timestamp is a valid ISO string | `aim-adapter-error-handler.service.spec.ts` | ✓ PASS |
| Returns Profile A fallback on transport failure | `aim-engine-adapter.service.spec.ts` | ✓ PASS |
| Persistence skipped when adapter returns `ok: false` (Profile A) | `aim-pipeline-integration.spec.ts` | ✓ PASS |

**Outcome:** Both fallback profiles behave correctly. No AIM-owned values are invented or inferred during fallback. Error output never contains secrets or engine internals.

---

### Scenario 13 — Never throws (universal invariant)

All pipeline paths must return typed outcomes, never throw unhandled exceptions.

| Test | Suite | Result |
|---|---|---|
| Never throws — all failures return typed outcomes | `aim-pipeline-orchestrator.service.spec.ts` | ✓ PASS |
| Never throws — returns typed failure outcome (state assembly) | `aim-pipeline-integration.spec.ts` | ✓ PASS |
| Never throws — returns typed failure outcome (engine unavailable) | `aim-pipeline-integration.spec.ts` | ✓ PASS |
| Never throws — returns typed failure outcome (persistence) | `aim-pipeline-integration.spec.ts` | ✓ PASS |
| `checkAvailability` never throws | `aim-health-check.service.spec.ts` | ✓ PASS |

---

## Test Suite Summary

| Suite | Tests | Result | Duration |
|---|---|---|---|
| `aim-adapter-error-handler.service.spec.ts` | 22 | ✓ All pass | ~4.1 s |
| `aim-adapter-timeout-policy.service.spec.ts` | 13 | ✓ All pass | ~3.9 s |
| `aim-engine-adapter.service.spec.ts` | 9 | ✓ All pass | ~4.0 s |
| `aim-engine-client.service.spec.ts` | 14 | ✓ All pass | ~4.0 s |
| `aim-health-check.service.spec.ts` | 12 | ✓ All pass | ~3.9 s |
| `aim-pipeline-orchestrator.service.spec.ts` | 29 | ✓ All pass | ~4.0 s |
| `aim-pipeline-integration.spec.ts` | 39 | ✓ All pass | ~4.1 s |
| **Total (failure-relevant suites)** | **138** | **✓ All pass** | — |

Full AIM suite (25 suites / 417 tests): all passing.

---

## Backend Authority Verification

| Rule | Status |
|---|---|
| AIM Engine is never called directly by clients | ✓ All AIM HTTP calls originate from `AimEngineClientService` inside the backend AIM module |
| AIM output is never persisted without validation | ✓ Adapter's `ok: false` path skips persistence in all scenarios |
| No AIM-owned values computed or inferred during failure | ✓ Fallback profiles contain no mastery, level, difficulty, or recommendation fields |
| Service token is never logged or returned in error output | ✓ Verified by dedicated secret-exclusion tests |
| Orchestrator never throws — all failures are typed outcomes | ✓ Verified across all four pipeline failure paths |
| Audit is written on every pipeline path including failures | ✓ Verified for success, state_assembly_failed, aim_engine_unavailable, persistence_failed |
| No secrets in this document | ✓ |

---

## Conclusion

**All 13 failure scenarios pass.** The AIM pipeline handles every defined failure mode — timeout, connection error, authentication failure, contract violation, budget exhaustion, state assembly failure, and persistence failure — with typed outcomes, no unhandled exceptions, safe fallback profiles, and complete audit coverage.

No gaps or regressions were identified. The failure-handling implementation is safe to carry into Phase 6.

**Limitation:** Failure behavior under concurrent load (e.g., multiple simultaneous sessions with AIM Engine down) is not covered by the current unit/integration suite. This is deferred to Phase 6 load testing.
