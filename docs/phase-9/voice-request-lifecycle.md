# Phase 9 — Voice Request Lifecycle

**Task:** P9-011
**Branch:** `phase9/P9-011-voice-request-lifecycle`
**Dependency:** P9-010 (Voice Mode Architecture Document — Done)
**Output:** `docs/phase-9/voice-request-lifecycle.md`

---

## Purpose

This document explains, step by step, what happens from the moment a
student records and submits a voice turn in the Flutter AI Teacher
Voice UI to the moment the synthesized reply is persisted and played
back. It narrates the same pipeline defined in
`docs/phase-9/voice-architecture.md` and
`docs/phase-9/voice-data-flow.md`, at request/response detail level, so
backend implementers know exactly what each request passes through and
reviewers can verify nothing is skipped. It extends
`docs/phase-8/request-lifecycle.md` — once a transcript exists, the
lifecycle rejoins the unchanged Phase 8 text-mode steps.

---

## Lifecycle Steps

### 1. Student records and submits audio (Flutter)

The student taps record, speaks, taps stop, and Flutter uploads the
clip via `POST /ai-teacher/voice/sessions/:sessionId/turns` (multipart)
with the existing voice session id. Flutter attaches only its standard
authenticated request headers — no STT, TTS, or AI provider credential
is present anywhere in this request, because Flutter never holds one.

### 2. Request reaches the Voice API Endpoint (Group F)

The endpoint authenticates the request and checks that `sessionId`
belongs to the requesting student. If authentication or ownership
fails, the request is rejected immediately with a safe error and the
lifecycle stops here — no further step runs.

### 3. Audio Validation

The uploaded audio is validated for format, size, and duration limits.
An invalid upload is rejected with a safe `400`/`413` error before
anything is sent downstream to the STT Gateway.

### 4. STT Gateway transcribes the audio (Group C)

The Gateway sends the validated audio to the configured STT provider,
using credentials read from backend environment/config. This is the
only point in the entire lifecycle where a network call to the STT
provider is made. If the call fails or times out, the lifecycle returns
a safe error to the endpoint layer and stops — no partial transcript is
used downstream.

### 5. Input safety filtering

The STT transcript is passed through the same safety filter used in
Phase 8 text mode. If the transcript fails filtering (e.g. disallowed
content), the request is rejected with a safe error and no further step
runs — the transcript is not forwarded to the Context Builder or the AI
provider.

### 6. Context Builder reads AIM Engine and curriculum data (Phase 8, reused)

For the student tied to this session, the Context Builder reads the
already-computed AIM Engine outputs (level, weakness, recommendations,
etc.) and relevant curriculum data, unchanged from Phase 8. This is
read-only: no value is computed or changed in this step, regardless of
the turn arriving as transcribed speech rather than typed text.

### 7. Prompt Builder assembles the prompt (Phase 8, reused)

The context from step 6 and the filtered transcript from step 5 are
combined into a single bounded prompt, exactly as in Phase 8. The
prompt asks the AI provider to explain, guide, hint, or tutor — never to
decide or score a learning-decision value from the spoken answer.

### 8. AI Provider Gateway calls the provider (Phase 8, reused)

The Gateway sends the prompt to the configured AI provider, using
credentials read from backend environment/config. This is the only
point in the lifecycle where a network call to the AI provider is made.
If the provider call fails or times out, the lifecycle returns a safe
error and the request stops — no partial or unfiltered content is
persisted or synthesized.

### 9. Output safety filtering

The provider's raw response is filtered before it is used further. If
filtering rejects the content, a safe fallback error/response is used
instead of the raw provider text; the rejected raw text is not
synthesized or persisted as the user-facing reply.

### 10. TTS Gateway synthesizes the reply audio (Group D)

The filtered AI Teacher reply text is sent to the configured TTS
provider, using credentials read from backend environment/config. This
is the only point in the lifecycle where a network call to the TTS
provider is made. The Gateway returns synthesized audio or a reference
to it. If the call fails or times out, the lifecycle returns a safe
error; the textual reply is not returned without a corresponding
successful (or explicitly absent) audio step, per the implementing
task's error contract.

### 11. Voice Persistence stores the exchange (Group E)

The transcript, the filtered AI Teacher reply text, the audio reference
(path/ID to backend-managed storage), and a timestamp are written to
voice-turn storage. No AIM Engine-owned table or column is written in
this step, and no raw audio file is committed to the repository.

### 12. Voice API Endpoint returns the response (Group F)

The endpoint returns `{ transcript, reply, audioRef, createdAt }` to
Flutter. No provider name, provider metadata, internal error detail, or
AIM Engine raw computation state is included in the response.

### 13. Flutter plays back the reply

The voice UI renders the transcript/reply text and streams the
synthesized audio via `GET /ai-teacher/voice/audio/:audioRef` (the only
endpoint that returns audio bytes, per `docs/phase-9/voice-api-map.md`).
The student's existing AIM Engine outputs displayed elsewhere in the app
(mastery, level, weakness, recommendations, review schedule) are
unaffected by this lifecycle — they remain whatever AIM Engine last
computed.

---

## Failure Handling Summary

| Failure point | Result |
|---|---|
| Auth/ownership check fails (step 2) | Safe `403`/`404`-style error; lifecycle stops. |
| Audio validation fails (step 3) | Safe `400`/`413` error; lifecycle stops. |
| STT Gateway call fails/times out (step 4) | Safe error returned; no transcript used downstream. |
| Input safety filter rejects transcript (step 5) | Safe error returned; transcript never reaches Context Builder or AI provider. |
| AI Provider Gateway call fails/times out (step 8) | Safe error/fallback returned; nothing unfiltered is synthesized or persisted. |
| Output safety filter rejects response (step 9) | Safe fallback used instead of raw provider text; raw text not synthesized or persisted as the reply. |
| TTS Gateway call fails/times out (step 10) | Safe error returned per the implementing task's error contract; no partial/raw audio reference is persisted or returned. |

---

## Validation

- Every step from voice recording to backend response persistence and
  playback is explained, in order.
- AI Teacher Voice Mode does not replace AIM Engine authority at any
  step.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly; the only provider calls happen inside the STT Gateway (step
  4), the AI Provider Gateway (step 8), and the TTS Gateway (step 10).
- No secrets are referenced or committed in this document.
