# Phase 9 — Voice API Map

**Task:** P9-007
**Branch:** `phase9/P9-007-voice-api-map`
**Dependency:** P9-006 (Voice Data Flow — Done)
**Output:** `docs/phase-9/voice-api-map.md`

---

## Purpose

This document defines the API surface that the Flutter AI Teacher Voice
UI is allowed to call. It is the contract between Group F (Voice API
Endpoints) and Group G (Flutter AI Teacher Voice UI), and is the
reference used to verify that no endpoint lets a client compute, set, or
read STT/TTS/AI provider secrets, retrieve raw private audio files
outside backend-managed storage, or replace an AIM Engine decision.

This map describes endpoint shape and behavior only. It does not
implement controllers, services, or DTOs — those belong to later
backend implementation tasks (Group F). It extends, and is consumed
alongside, `docs/phase-8/ai-teacher-api-map.md` — voice turns flow
through the same underlying chat session/message model defined there.

---

## Endpoint Surface

All endpoints below are served by the backend (NestJS) and are the
**only** Phase 9 endpoints the Flutter app calls for AI Teacher Voice
Mode functionality.

### 1. `POST /ai-teacher/voice/sessions/:sessionId/turns`

- **Purpose:** Upload a recorded audio clip for a voice turn and
  receive the transcript, the AI Teacher's filtered reply text, and a
  reference to the synthesized audio reply.
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** The backend verifies `sessionId` belongs to the
  requesting student before processing. A session owned by another
  student returns a safe "not found" / "forbidden" error, not session
  data.
- **Request:** Multipart upload containing the audio file, validated
  for format, size, and duration limits (Audio Validation) before
  entering the pipeline (STT Gateway → Safety Filter → Context Builder →
  Prompt Builder → AI Provider Gateway → Safety Filter → TTS Gateway →
  Persistence).
- **Response:** `{ transcript: string, reply: string, audioRef: string,
  createdAt: string }` — the transcript, the filtered AI Teacher reply
  text, and an opaque reference to the synthesized audio (resolved via
  endpoint 3). Never includes provider name, provider response
  metadata, API keys, or internal error detail.
- **Errors:** Generic, safe error bodies (e.g. `400 Bad Request`,
  `403 Forbidden`, `413 Payload Too Large`, `429 Too Many Requests`,
  `500 Internal Server Error`) with no stack traces, provider error
  text, or internal identifiers exposed.

### 2. `GET /ai-teacher/voice/sessions/:sessionId/turns`

- **Purpose:** Retrieve voice-turn history for a session, for display
  in the Flutter voice/chat UI.
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** Same ownership check as endpoint 1 — a student can only
  read their own session's voice-turn history.
- **Request DTO:** Optional pagination query params (`cursor`, `limit`),
  validated and bounded.
- **Response:** `{ turns: [{ transcript: string, reply: string,
  audioRef: string, createdAt: string }] }`. No context snapshot
  internals, no provider data, no AIM Engine raw fields are included —
  only the data needed to render transcript/reply text and offer
  playback.
- **Errors:** Same safe-error pattern as endpoint 1.

### 3. `GET /ai-teacher/voice/audio/:audioRef`

- **Purpose:** Stream or download the synthesized audio for a given
  `audioRef` so Flutter can play back an AI Teacher reply.
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** The backend verifies the `audioRef` belongs to a voice
  turn owned by the requesting student before streaming. An `audioRef`
  owned by another student returns a safe "not found" / "forbidden"
  error, not audio data.
- **Request:** Path parameter `audioRef` only; no body.
- **Response:** Audio byte stream with an appropriate content type.
  This is the only endpoint that returns audio bytes; it never returns
  STT/TTS provider credentials or provider-internal metadata.
- **Errors:** Same safe-error pattern as endpoint 1.

### 4. `POST /ai-teacher/voice/sessions`

- **Purpose:** Start a new AI Teacher voice session (e.g. when the
  student opens voice mode for a given lesson/topic). Mirrors the Phase
  8 `POST /ai-teacher/sessions` endpoint but is scoped to voice usage if
  a separate session record is required by the implementation; may
  resolve to the same session model as Phase 8 if voice and text share
  one session type.
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** The created session is owned by the requesting
  student; the backend sets ownership server-side, never from a
  client-supplied student id.
- **Request DTO:** `{ contextRef: string }` (e.g. lesson or topic
  identifier used to seed the Context Builder), validated for presence
  and format.
- **Response:** `{ sessionId: string, createdAt: string }`.
- **Errors:** Same safe-error pattern as endpoint 1.

---

## What This API Surface Never Does

| Excluded behavior | Reason |
|---|---|
| Returning an STT, TTS, or AI provider API key, base URL, or model/voice identifier to the client | Violates `docs/phase-9/no-client-provider-rule.md`; provider config stays backend-only. |
| Accepting a client-supplied mastery/level/weakness/difficulty/recommendation/review-schedule value | Violates `docs/phase-9/no-aim-authority-change-rule.md`; those values come only from AIM Engine. |
| Returning raw AIM Engine internals (e.g. full mastery computation state) in a voice-turn response | Voice endpoints expose transcript/reply/audio reference only, not engine internals. |
| Returning a raw audio file path on disk, a provider audio URL, or any non-backend-mediated audio location | Audio is only ever served through endpoint 3, via an opaque `audioRef`. |
| Exposing stack traces, provider error bodies, or database error detail in any response | Required by "return safe errors without exposing internals." |
| Allowing a request to act on another student's session id or audioRef | Required by ownership guard rule. |

---

## Auth, Ownership, and Validation Summary

- **Auth:** every endpoint above requires a valid authenticated student
  token; no endpoint is anonymous.
- **Ownership:** every endpoint that reads or writes a session, turn, or
  audio reference checks that it belongs to the authenticated student
  before any pipeline step runs.
- **DTO/upload validation:** every request body, upload, or query is
  validated (presence, type, format, bounds) before it reaches the STT
  Gateway, Context Builder, Prompt Builder, AI Provider Gateway, or TTS
  Gateway.
- **Safe errors:** every error response uses a generic, non-leaking
  message and status code; internal exceptions are logged server-side
  only, never returned to the client.

---

## Validation

- API surface is limited to voice session create, submit-audio-turn,
  read-turn-history, and stream-audio endpoints consumed by the Flutter
  AI Teacher Voice UI.
- No endpoint lets AI Teacher Voice Mode replace AIM Engine authority.
- No endpoint allows Flutter to call an STT, TTS, or AI provider
  directly, or retrieve provider credentials.
- No endpoint exposes a raw private audio file location outside the
  backend-mediated `audioRef` stream endpoint.
- Auth and ownership guards, and request/upload validation, are
  specified for every endpoint.
- No secrets are referenced or committed in this document.
