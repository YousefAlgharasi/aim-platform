# Phase 9 — Voice Error Policy

**Task:** P9-016
**Branch:** `phase9/P9-016-voice-error-policy`
**Dependency:** P9-010 (Voice Mode Architecture Document — Done)
**Output:** `docs/phase-9/voice-error-policy.md`

---

## Purpose

This document defines how the AI Teacher Voice Mode backend pipeline
handles failures, so every component in
`docs/phase-9/voice-architecture.md` fails safely and predictably. It
ensures audio validation failures, STT/TTS/AI provider outages,
timeouts, and internal errors never leak internals, never crash the
voice flow silently, and never fall back to a client-trusted or
fabricated learning-decision value. It extends
`docs/phase-8/ai-teacher-error-policy.md` with the audio-specific and
STT/TTS-specific failure categories introduced by voice mode; every
category already covered by the Phase 8 policy (input/output safety
rejection, context unavailable, AI provider failure, persistence
failure) applies unchanged once a voice turn has a transcript.

---

## Error Categories

| Category | Example | Where it can occur |
|---|---|---|
| Auth/ownership failure | Invalid token, session/audioRef not owned by requester | Voice API Endpoints (Group F) |
| Validation failure | Missing/malformed request body (e.g. `contextRef`), malformed DTO | Voice API Endpoints (Group F) |
| Audio validation failure | Unsupported format, oversized upload, duration out of bounds | Audio Validation (Group F) |
| STT provider failure | STT provider times out, errors, or returns malformed/empty data | STT Gateway (Group C) |
| Input safety rejection | Transcript fails safety filter | Safety Filtering (input, shared with Phase 8) |
| Context unavailable | AIM Engine/curriculum read fails or times out | Context Builder (Phase 8, reused) |
| AI provider failure | AI provider times out, errors, or returns malformed data | AI Provider Gateway (Phase 8, reused) |
| Output safety rejection | Provider response fails safety filter | Safety Filtering (output, shared with Phase 8) |
| TTS provider failure | TTS provider times out, errors, or returns malformed/empty audio | TTS Gateway (Group D) |
| Persistence failure | Database write fails | Voice Persistence (Group E) |
| Audio retrieval failure | `audioRef` not found, not owned by requester, or storage read fails | Voice API Endpoints (Group F, audio stream endpoint) |

---

## Policy by Category

### Auth/ownership failure
- Return a generic `401`/`403`-style error.
- Do not reveal whether a `sessionId` or `audioRef` exists for another
  student.
- Lifecycle stops immediately; no further step runs.

### Validation failure
- Return a generic `400 Bad Request` with a safe, non-internal message
  (e.g. "Invalid request").
- Do not echo back raw validation internals or stack traces.

### Audio validation failure
- Return a generic `400 Bad Request` or `413 Payload Too Large` per
  `docs/phase-9/voice-api-map.md` endpoint 1.
- Do not forward an invalid upload to the STT Gateway.
- Do not reveal internal limits beyond what is already part of the
  public-facing validation message (e.g. "Recording is too long").

### STT provider failure (timeout, error, malformed/empty response)
- Treat any non-success STT outcome as a failure, not as a silent empty
  transcript used downstream as if it were real speech.
- Return a safe, generic error (e.g. "Couldn't process that recording,
  please try again.") per `docs/phase-9/stt-output-contract.md`'s
  Failure Contract.
- Never expose STT provider error text, status codes, or response
  bodies to the client.
- Do not retry indefinitely; apply a bounded retry/backoff policy at
  the STT Gateway level and fail safely once exhausted.

### Input safety rejection
- Return a safe, generic rejection message to the student (e.g. "This
  can't be processed. Try rephrasing.").
- Do not forward the rejected transcript to the Context Builder or AI
  Provider Gateway.
- Do not persist the rejected raw transcript as a voice-turn entry
  beyond what moderation/audit logging requires internally.

### Context unavailable
- If AIM Engine or curriculum data cannot be read, do not proceed to
  the Prompt Builder with partial or fabricated context.
- Return a safe error indicating AI Teacher Voice Mode is temporarily
  unavailable.
- Never substitute a guessed or default mastery/level/weakness value
  for missing context — missing context is a hard stop, not a reason
  to invent a learning-decision value, regardless of whether the turn
  arrived as speech or text.

### AI provider failure (timeout, error, malformed response)
- Treat any non-success provider outcome as a failure, not as silent
  empty content.
- Return a safe, generic fallback response or error (e.g. "AI Teacher
  is unavailable right now, please try again.").
- Never expose AI provider error text, status codes, or response bodies
  to the client.
- Do not retry indefinitely; apply a bounded retry/backoff policy at
  the Gateway level and fail safely once exhausted.

### Output safety rejection
- If the provider's response fails output safety filtering, do not
  synthesize, persist, or return the raw rejected text.
- Use the same safe fallback response as an AI provider failure.

### TTS provider failure (timeout, error, malformed/empty audio)
- Treat any non-success TTS outcome as a failure, not as a silent empty
  or corrupt `audioRef`.
- The textual `reply` (already safety-filtered) may still be returned
  to the client without an `audioRef`, or the whole turn may be marked
  failed — this policy requires that whichever choice is implemented,
  no broken/placeholder `audioRef` is ever returned, per
  `docs/phase-9/tts-output-contract.md`'s Failure Contract.
- Never expose TTS provider error text, status codes, or response
  bodies to the client.
- Do not retry indefinitely; apply a bounded retry/backoff policy at
  the TTS Gateway level and fail safely once exhausted.

### Persistence failure
- If voice-turn data fails to save, still return the transcript/reply
  to the student if they already passed safety filtering (the student
  should not lose a safe reply because of a storage hiccup), but log
  the persistence failure internally for follow-up.
- Never expose database error detail to the client.

### Audio retrieval failure
- If `audioRef` does not exist, does not belong to the requesting
  student, or storage read fails, return a safe "not found"/"forbidden"
  error per `docs/phase-9/voice-api-map.md` endpoint 3 — never partial
  or corrupted audio bytes.

---

## Cross-Cutting Rules

- **No internals in responses.** No stack trace, SQL error, STT/TTS/AI
  provider response body, or internal file/module path is ever included
  in a client-facing error.
- **No silent learning-decision substitution.** No error path may
  produce a placeholder mastery/level/weakness/difficulty/
  recommendation/review-schedule value; those remain solely AIM
  Engine's responsibility regardless of voice mode's error state.
- **No silent provider-detail leak.** No error path returns an STT,
  TTS, or AI provider name, model id, voice id, or credential, even
  when reporting a failure from that provider.
- **No raw audio on failure.** No error path returns a raw audio file
  path, provider audio URL, or partial/corrupt audio bytes; a failed
  TTS step always results in either no `audioRef` or a fully valid one,
  never something in between.
- **Logging.** Errors are logged server-side with enough detail to
  debug (category, correlation id, non-sensitive metadata), without
  logging provider API keys, other secrets, or raw private audio
  content in plaintext.
- **Consistent shape.** All client-facing Voice Mode errors use the
  same safe error envelope already used by Phase 8 AI Teacher endpoints
  and other backend REST endpoints in this codebase, so Flutter's
  existing error-state UI handles them without special-casing.

---

## Validation

- Safe failure behavior is defined for audio validation, STT, TTS, and
  AI provider errors, and for every category already covered by
  `docs/phase-8/ai-teacher-error-policy.md`.
- No error path exposes secrets, provider details, raw audio, or
  internals.
- No error path lets AI Teacher Voice Mode fabricate or substitute an
  AIM Engine decision.
- AI Teacher Voice Mode does not replace AIM Engine authority.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets or generated private audio files are referenced or
  committed in this document.
