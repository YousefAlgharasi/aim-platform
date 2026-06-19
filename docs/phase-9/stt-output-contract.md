# Phase 9 — Speech-to-Text Output Contract

**Task:** P9-014
**Branch:** `phase9/P9-014-stt-output-contract`
**Dependency:** P9-010 (Voice Mode Architecture Document — Done)
**Output:** `docs/phase-9/stt-output-contract.md`

---

## Purpose

This document defines the exact shape of the output the STT Gateway
(Group C) returns to Voice Session Orchestration after transcribing a
student's recorded audio, per the pipeline defined in
`docs/phase-9/voice-architecture.md` and
`docs/phase-9/voice-request-lifecycle.md` (step 4). It keeps STT output
predictable and provider-agnostic, so no other backend component needs
to understand a specific STT provider's response format, and so no STT
provider detail ever leaks past the Gateway.

---

## Output Contract

A successful STT Gateway call returns this shape internally:

```jsonc
{
  "transcript": "string — plain transcribed text",
  "durationMs": "number — audio duration in milliseconds, as measured by the Gateway"
}
```

- **`transcript`** is plain text (UTF-8); it is the only field consumed
  by the rest of the pipeline (input safety filtering, Context Builder,
  Prompt Builder — per `docs/phase-9/voice-request-lifecycle.md` steps
  5–7).
- **`durationMs`** is an internal observability/validation value (e.g.
  for logging or enforcing the duration limits already checked in
  Audio Validation); it is not a learning-decision field and is not
  required to be persisted or exposed to the client.

No other top-level field is part of the contract. In particular, the
following are never included in STT Gateway output:

| Excluded field | Reason |
|---|---|
| `provider`, `model`, `rawProviderResponse`, `confidenceScore` per-provider metadata | Provider-specific detail stays inside the STT Gateway; no other component needs to know which provider produced the transcript (`docs/phase-9/no-client-provider-rule.md`). |
| `masteryScore`, `level`, `weakness`, `difficulty`, `recommendation`, `reviewSchedule`, or any similarly named field | The STT Gateway only transcribes audio; it never computes or attaches a learning-decision value (`docs/phase-9/no-aim-authority-change-rule.md`). |
| `apiKey`, `endpoint`, or any provider credential/config value | Provider configuration is read once inside the Gateway from environment/config; it never appears in the Gateway's output object. |
| Raw audio bytes or a file path | The STT Gateway consumes validated audio and returns text only; it does not echo back the input audio. |

---

## Failure Contract

If the STT provider call fails, times out, or returns an unusable
result, the STT Gateway does not return a partial or guessed
transcript. It raises a backend-internal error that the calling
component (Voice Session Orchestration) maps to the safe error response
described in `docs/phase-9/voice-request-lifecycle.md` (failure point
"STT Gateway call fails/times out, step 4") and
`docs/phase-9/voice-api-map.md` (endpoint 1 error list). No raw
provider error text, stack trace, or provider error code crosses this
boundary.

---

## Predictability Rules

- `transcript` is always a string when the call succeeds; it is never
  `null`, never an object, and never omitted.
- `transcript` carries no embedded directionality control characters
  and no HTML/script content, so it is safe to pass through input
  safety filtering and, eventually, RTL/Arabic-aware rendering in the
  Flutter voice UI's history view.
- An empty/silent recording resolves to an empty or near-empty
  `transcript` string (provider-dependent), not a failure by itself —
  whether that case is treated as a usable turn or rejected is decided
  by Voice Session Orchestration, not the STT Gateway.

---

## Where This Contract Applies

- **STT Gateway (Group C):** the sole producer of this shape; the sole
  component that talks to the configured STT provider.
- **Voice Session Orchestration (Group B/E):** the sole consumer of
  this shape; passes `transcript` into input safety filtering and
  treats a Gateway failure per the Failure Contract above.
- **Voice Persistence (Group E):** persists only `transcript` (as part
  of the Voice Turn shape defined in
  `docs/phase-9/voice-session-contract.md`), never `durationMs` or any
  provider-specific field from this contract.

---

## Validation

- STT output is defined as a predictable, provider-agnostic shape
  before implementation begins.
- The contract excludes any learning-decision field, provider
  credential, or raw audio payload.
- AI Teacher Voice Mode does not replace AIM Engine authority via this
  contract.
- Flutter does not call an STT provider directly; only the STT Gateway
  talks to the provider.
- No secrets are referenced or committed in this document.
