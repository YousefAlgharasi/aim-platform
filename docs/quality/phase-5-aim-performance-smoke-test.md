# Phase 5 — AIM Performance Smoke Test

**Task:** P5-082  
**Date:** 2026-06-17  
**Branch:** `phase5/P5-082-aim-performance-smoke-test`  
**Dependency:** P5-077 (AIM pipeline integration tests — merged to `main`)  
**Scope:** Backend AIM Engine integration only. No client-side AIM logic. No AI Teacher. No secrets.

---

## Purpose

This document records the results of a basic performance smoke test for the Phase 5 AIM pipeline. The goal is to identify latency or throughput risks in the AIM backend integration before Phase 6 begins.

The smoke test is conducted against the unit and integration test suite — the AIM Engine is not deployed in CI, so HTTP round-trip latency to the live Python service is not measured here. Instead, the test measures:

- **Test suite execution time** across all 25 AIM-scoped test files (417 tests)
- **Per-test execution time** for latency-sensitive paths (integration pipeline, retry/backoff policy)
- **Structural performance risks** identified through code review of the pipeline, timeout policy, and retry logic

---

## Environment

| Property | Value |
|---|---|
| Platform | Ubuntu 24 (CI container) |
| Node.js | Runtime per backend-api package |
| Test runner | Jest (ts-jest) |
| Test scope | `services/backend-api/src/features/aim/**` |
| AIM Engine | Not deployed — HTTP boundary stubbed |
| Date of run | 2026-06-17 |

---

## Test Execution Results

### 1. Full AIM test suite (25 suites / 417 tests)

| Run | Duration |
|---|---|
| Run 1 | 6.562 s |
| Run 2 | 6.386 s |
| Run 3 | 6.421 s |
| **Average** | **6.456 s** |

**Result: PASS — 417/417 tests, 25/25 suites.**

No test failures. No flaky tests observed across three consecutive runs.

---

### 2. Pipeline integration suite (P5-077 output)

File: `src/features/aim/pipeline/aim-pipeline-integration.spec.ts`

**Suite duration:** 4.109 s — 39/39 tests passing.

Selected per-test latencies (from Jest verbose output):

| Test | Duration |
|---|---|
| Success path: returns ok: true | 6 ms |
| Calls state assembly with pipeline context | 2 ms |
| Calls AIM Engine HTTP client exactly once | 2 ms |
| Calls persistence exactly once with validated response | 1 ms |
| Records success audit entry at audit_close_out | 1 ms |
| backendRequestId matches audit correlation id | 1 ms |
| studentId from pipeline context — never client-supplied | 1 ms |
| No AIM-owned values computed by pipeline | 2 ms |
| State assembly failure: returns ok: false | 2 ms |
| Does not call AIM Engine when state assembly fails | 1 ms |
| Does not call persistence when state assembly fails | 1 ms |
| AIM Engine unavailable: returns ok: false | 7 ms |
| Does not call persistence on engine failure | 1 ms |
| Persistence failure: returns ok: false | 1 ms |
| Audit called on all four pipeline paths | 1–19 ms |
| Stage ordering — state assembly before adapter | 18 ms |
| Stage ordering — adapter before persistence | 3 ms |
| Persistence skipped on ok: false (Profile A fallback) | 1 ms |

**Observation:** All individual test latencies are well within noise range for unit tests (< 25 ms). The 18–21 ms outliers are caused by Jest's internal timer mocking setup, not pipeline logic.

---

### 3. Retry and timeout policy suite (P5-049 output)

File: `src/features/aim/adapter/aim-adapter-timeout-policy.service.spec.ts`

**Suite duration:** 4.047 s — 14/14 tests passing.

Key behaviors verified by the policy:

| Behavior | Result |
|---|---|
| Success on first attempt | ✓ |
| Retries TRANSPORT_TIMEOUT up to `maxRetryAttempts` | ✓ |
| Retries TRANSPORT_CONNECTION_ERROR | ✓ |
| Retries TRANSIENT_HTTP | ✓ |
| Does NOT retry AUTH_INVALID | ✓ |
| Does NOT retry VALIDATION_ERROR | ✓ |
| Does NOT retry IDEMPOTENCY_CONFLICT | ✓ |
| `budgetExhausted: true` when budget is zero | ✓ |
| Backoff delay for attempt 1 is within [0, 200] ms | ✓ |
| Backoff delay is within [0, 2000] ms cap | ✓ |

---

## Configuration — Configured Latency Budget

The timeout and retry policy (P5-008, P5-049) defines the following runtime budget:

| Parameter | Default | Env Var |
|---|---|---|
| `analysisTimeoutMs` | 5,000 ms | `AIM_ENGINE_ANALYSIS_TIMEOUT_MS` |
| `healthTimeoutMs` | 3,000 ms | `AIM_ENGINE_HEALTH_TIMEOUT_MS` |
| `totalBudgetMs` | 12,000 ms | `AIM_ENGINE_TOTAL_BUDGET_MS` |
| `maxRetryAttempts` | 3 | `AIM_ENGINE_MAX_RETRY_ATTEMPTS` |
| Backoff base | 200 ms | hardcoded |
| Backoff cap | 2,000 ms | hardcoded |

**Worst-case latency budget (no retries succeed):**  
3 attempts × 5,000 ms (analysis timeout) + 2 backoff intervals × up to 2,000 ms = up to 19,000 ms.  
The `totalBudgetMs` hard cap of 12,000 ms limits the actual worst case.

**This budget is acceptable for a background pipeline call** (triggered after a lesson attempt, not blocking a UI interaction). No performance risk identified at these values.

---

## Structural Risk Assessment

### Risks assessed — none blocking

| Area | Assessment | Risk |
|---|---|---|
| HTTP call count per pipeline run | Exactly 1 per `postAnalysis` attempt; retry logic adds at most 2 more | Low |
| Sequential stage execution | Stages 3→4→5→6→9 are sequential by design (no parallelism needed) | Low |
| Retry backoff jitter | Full jitter per P5-008; reduces thundering-herd risk on AIM Engine recovery | Mitigated |
| Total budget cap | Hard cap at 12,000 ms; budget exhaustion returns a typed failure, never throws | Mitigated |
| Audit logging | Per-stage audit write; uses `DatabaseService.query` — same connection pool as other persistence | Low (acceptable) |
| Persistence fanout | `AimPersistenceService` delegates to 6 specialised services; all called sequentially | Low |
| State assembly | Reads from DB; latency depends on data size, not AIM pipeline logic | Acceptable |

### Identified limitation

The smoke test does not measure **live HTTP round-trip latency** to the Python AIM Engine because the engine is not deployed in the CI environment. The `AimEngineClientService.postAnalysis` HTTP call is stubbed in all test suites. Live-environment performance profiling (response time from the Python service, database write throughput under concurrent session load) is out of scope for Phase 5 and should be addressed in Phase 6 load testing.

---

## Backend Authority Verification

| Rule | Status |
|---|---|
| Backend is the only caller of the AIM Engine | ✓ Enforced — `AimEngineClientService` is private to the AIM module |
| Flutter does not call the AIM Engine | ✓ No Flutter AIM HTTP calls exist in the repo |
| Admin Dashboard does not call the AIM Engine | ✓ No admin AIM HTTP calls exist in the repo |
| Clients do not calculate mastery, difficulty, or learning decisions | ✓ All AIM outputs originate from the engine and are validated by the backend |
| No secrets in this document | ✓ |

---

## Conclusion

**No latency or throughput risks identified** that would block Phase 6.

The AIM pipeline executes efficiently in the unit/integration test environment. The configured timeout budget (12,000 ms total, 5,000 ms per attempt, 3 retries) is appropriate for a background pipeline. All 417 AIM-scoped tests pass consistently across repeated runs.

The one open item — live HTTP latency profiling against the deployed Python AIM Engine — is explicitly deferred to Phase 6 load testing and does not block Phase 5 completion.
