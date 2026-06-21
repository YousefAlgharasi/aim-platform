# Phase 9 — TTS Secret Safety Check

**Task:** P9-067
**Branch:** `phase9/P9-067-tts-no-secret-check`
**Dependency:** P9-059 (Add TTS Provider Config — Done)
**Output:** `docs/quality/phase-9-tts-secret-check.md`

---

## Purpose

Verify that no TTS provider secrets (API keys, credentials, tokens) are
committed to the repository in any TTS Gateway source file, configuration
file, test fixture, or documentation.

---

## Scan Results

### 1. TTS Gateway Source Files (`tts-gateway/`)

| File | `apiKey` references | Verdict |
|---|---|---|
| `tts-gateway.config.ts` | Declares `apiKey` in `TtsGatewayConfig` interface; reads it from `BackendConfigService.ttsProvider` (environment variable). No hardcoded value. | PASS |
| `tts-gateway.interface.ts` | No `apiKey` reference — `TtsGateway` abstract class and `TTS_GATEWAY` injection token carry no credential field. | PASS |
| `tts-gateway.types.ts` | No `apiKey` reference — `TtsProviderRequest` and `TtsProviderResponse` carry no credential field. | PASS |
| `tts-request-mapper.types.ts` | No `apiKey` reference — `TtsCompletionRequest` carries `model`, `text`, `languageCode` only. | PASS |
| `tts-request.mapper.ts` | No `apiKey` reference — reads only `model` from config, never `apiKey`. | PASS |
| `tts-response-mapper.types.ts` | No `apiKey` reference. | PASS |
| `tts-response.mapper.ts` | No `apiKey` reference. | PASS |

### 2. Environment Variable References

| Location | Reference | Verdict |
|---|---|---|
| `backend-config.validation.ts` | `readRequiredString(env, 'TTS_PROVIDER_API_KEY', issues)` — reads from `process.env`, no default or hardcoded value. | PASS |
| `.env.example` | No `TTS_PROVIDER_API_KEY` entry yet (to be added when the HTTP client task lands). | N/A |

### 3. Broader Repository Scan

- `grep -rn "TTS_PROVIDER_API_KEY"` across all non-node_modules files:
  only `backend-config.validation.ts` and a JSDoc comment in
  `tts-gateway.config.ts`.
- No `.env` file with actual TTS credentials exists in the repository.
- No hardcoded API key patterns (`sk-`, `Bearer`, long alphanumeric
  tokens) found in `tts-gateway/` source files.

### 4. Request/Response Contract Check

- `TtsProviderRequest` carries `text` and `languageCode` only.
- `TtsProviderResponse` carries `status`, `audioRef`, `durationMs`,
  `contentType`, and optional `errorCategory` only.
- `TtsCompletionRequest` carries `model`, `text`, `languageCode` only —
  no `apiKey` field.
- The API key is confined to `TtsGatewayConfigService.getConfig()` and
  is intended for the HTTP client (a later task) to attach out-of-band
  via an Authorization header, never in the request body.

---

## Verdict

**PASS** — No TTS provider secrets are committed. The `apiKey` is read
from environment variables at runtime, confined to the config service,
and never appears in request/response types, mappers, policies, or
documentation as an actual value.

---

## Validation

- Secret safety check output exists and is complete.
- No secrets, API keys, or provider credentials are committed.
- No Flutter direct provider calls exist in TTS Gateway code.
- AIM Engine remains the source of learning decisions.
