# Phase 9 — STT Secret Safety Check

**Task:** P9-047
**Branch:** `phase9/P9-047-stt-no-secret-check`
**Dependency:** P9-039 (Add STT Provider Config — Done)
**Output:** `docs/quality/phase-9-stt-secret-check.md`

---

## Purpose

Verify that no STT provider secrets (API keys, credentials, tokens) are
committed to the repository in any STT Gateway source file, configuration
file, test fixture, or documentation.

---

## Scan Results

### 1. STT Gateway Source Files (`stt-gateway/`)

| File | `apiKey` references | Verdict |
|---|---|---|
| `stt-gateway.config.ts` | Declares `apiKey` in `SttGatewayConfig` interface; reads it from `BackendConfigService.sttProvider` (environment variable). No hardcoded value. | PASS |
| `stt-gateway.interface.ts` | No `apiKey` reference. | PASS |
| `stt-gateway.types.ts` | No `apiKey` reference — `SttProviderRequest` and `SttProviderResponse` carry no credential field. | PASS |
| `stt-request-mapper.types.ts` | No `apiKey` reference — `SttCompletionRequest` carries `model`, `audio`, `contentType` only. | PASS |
| `stt-request.mapper.ts` | No `apiKey` reference — reads only `model` from config, never `apiKey`. | PASS |
| `stt-response-mapper.types.ts` | No `apiKey` reference. | PASS |
| `stt-response.mapper.ts` | No `apiKey` reference. | PASS |
| `stt-confidence-policy.constants.ts` | No `apiKey` reference. | PASS |
| `stt-confidence-policy.service.ts` | No `apiKey` reference. | PASS |
| `stt-safe-failure.constants.ts` | No `apiKey` reference. | PASS |
| `stt-safe-failure.service.ts` | No `apiKey` reference. | PASS |

### 2. Environment Variable References

| Location | Reference | Verdict |
|---|---|---|
| `backend-config.validation.ts` | `readRequiredString(env, 'STT_PROVIDER_API_KEY', issues)` — reads from `process.env`, no default or hardcoded value. | PASS |
| `backend-config.spec.ts` | Uses placeholder `'stt-key'` in test fixture — not a real credential. | PASS |
| `.env.example` | `STT_PROVIDER_API_KEY=<placeholder>` — placeholder only. | PASS |

### 3. Broader Repository Scan

- `grep -rn "STT_PROVIDER_API_KEY"` across all non-node_modules files:
  only the three locations listed above.
- No `.env` file with actual STT credentials exists in the repository.
- No hardcoded API key patterns (`sk-`, `Bearer`, long alphanumeric
  tokens) found in `stt-gateway/` source files.

### 4. Request/Response Contract Check

- `SttProviderRequest` carries `audio` (Buffer) and `contentType` only.
- `SttProviderResponse` carries `status`, `transcript`, `durationMs`,
  and optional `errorCategory` only.
- `SttCompletionRequest` carries `model`, `audio`, `contentType` only —
  no `apiKey` field.
- The API key is confined to `SttGatewayConfigService.getConfig()` and
  is intended for the HTTP client (a later task) to attach out-of-band
  via an Authorization header, never in the request body.

---

## Verdict

**PASS** — No STT provider secrets are committed. The `apiKey` is read
from environment variables at runtime, confined to the config service,
and never appears in request/response types, mappers, policies, or
documentation as an actual value.

---

## Validation

- Secret safety check output exists and is complete.
- No secrets, API keys, or provider credentials are committed.
- No Flutter direct provider calls exist in STT Gateway code.
- AIM Engine remains the source of learning decisions.
