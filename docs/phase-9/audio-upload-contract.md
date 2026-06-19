# Phase 9 — Audio Upload Contract

**Task:** P9-013
**Branch:** `phase9/P9-013-audio-upload-contract`
**Dependency:** P9-010 (Voice Mode Architecture Document — Done)
**Output:** `docs/phase-9/audio-upload-contract.md`

---

## Purpose

This document defines the exact contract between the Flutter AI Teacher
Voice UI and the backend `POST /ai-teacher/voice/sessions/:sessionId/turns`
endpoint for audio upload. It specifies what Flutter must send, what the
backend validates before any STT provider call is made, what the backend
returns, and what errors Flutter must handle.

This contract is the implementation reference for Audio Validation
(Group F, `docs/phase-9/voice-architecture.md`) and is consumed
alongside `docs/phase-9/voice-api-map.md` and
`docs/phase-9/voice-request-lifecycle.md`. Flutter sends audio to the
backend only; it never sends audio to any STT, TTS, or AI provider
directly, and it never holds provider credentials.

---

## Endpoint

```
POST /ai-teacher/voice/sessions/:sessionId/turns
```

Auth: required — authenticated student JWT in `Authorization: Bearer <token>` header.

---

## Request

### Headers

| Header | Required | Value |
|---|---|---|
| `Authorization` | Yes | `Bearer <student JWT>` |
| `Content-Type` | Yes | `multipart/form-data` |

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string (UUID) | Yes | ID of the voice session. Must be owned by the authenticated student. |

### Multipart Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `audio` | binary file | Yes | The recorded audio clip. See format and size constraints below. |
| `mimeType` | string | Yes | MIME type of the audio file declared by the client (e.g. `audio/webm`, `audio/mp4`, `audio/ogg`). Backend validates actual file against this. |
| `durationMs` | integer | Yes | Client-declared duration of the audio in milliseconds. Backend validates actual duration does not exceed limits. |

No other fields are accepted. Extra fields are silently ignored or
rejected with `400 Bad Request` at backend discretion.

---

## Audio Format Constraints

These constraints apply to every upload. The backend enforces them all;
Flutter should also enforce them locally before uploading to provide
fast feedback, but local enforcement is not a substitute for backend
validation.

| Constraint | Allowed values / limits |
|---|---|
| **MIME type** | `audio/webm`, `audio/mp4`, `audio/ogg`, `audio/wav`, `audio/x-m4a` |
| **Maximum file size** | 10 MB |
| **Minimum duration** | 200 ms |
| **Maximum duration** | 120 seconds (2 minutes) |
| **Channels** | Mono or stereo |
| **Sample rate** | 8 000 Hz – 48 000 Hz |

The backend does not accept raw PCM streams, playlist formats (HLS/DASH),
or video containers. MIME type sniffing is performed on the actual file
bytes in addition to the client-declared `mimeType` field; a mismatch
between declared and actual MIME type results in `400 Bad Request`.

---

## Backend Validation Sequence

The backend performs these checks in order before any STT provider call
is made. A failed check immediately returns the corresponding error
response; no further checks or provider calls run.

1. **Authentication** — JWT is present, valid, and not expired.
2. **Session ownership** — `sessionId` exists and belongs to the
   authenticated student.
3. **Field presence** — `audio`, `mimeType`, and `durationMs` are all
   present.
4. **File size** — uploaded file does not exceed 10 MB.
5. **MIME type (declared)** — `mimeType` field value is in the allowed
   list.
6. **MIME type (actual)** — file bytes match the declared MIME type.
7. **Duration (declared)** — `durationMs` value is between 200 and
   120 000 (ms).
8. **Duration (actual)** — backend-decoded audio duration is between
   200 ms and 120 seconds.

Only after all eight checks pass does the backend forward the audio to
the STT Gateway. No STT, TTS, or AI provider call is made for audio that
fails any validation step.

---

## Success Response

HTTP `200 OK`.

```json
{
  "transcript": "<transcribed text of the student's speech>",
  "reply": "<safety-filtered AI Teacher reply text>",
  "audioRef": "<opaque reference to the synthesized audio reply>",
  "createdAt": "<ISO 8601 timestamp>"
}
```

| Field | Type | Description |
|---|---|---|
| `transcript` | string | The text transcript produced by the STT Gateway from the uploaded audio. |
| `reply` | string | The AI Teacher's safety-filtered reply text. |
| `audioRef` | string | Opaque backend-assigned reference to the synthesized audio. Resolved via `GET /ai-teacher/voice/audio/:audioRef`. |
| `createdAt` | string (ISO 8601) | Server-side timestamp of the voice turn. |

The response never includes: provider names, provider API keys, provider
response metadata, raw audio bytes, storage paths, AIM Engine internal
fields, or stack traces.

---

## Error Responses

All error responses use a generic, non-leaking message body. Internal
error detail, stack traces, provider error text, and database identifiers
are logged server-side only and never returned to the client.

| Condition | HTTP status | `error` field value |
|---|---|---|
| Missing or invalid JWT | `401 Unauthorized` | `"Unauthorized"` |
| `sessionId` not found or not owned by student | `403 Forbidden` | `"Forbidden"` |
| Missing `audio`, `mimeType`, or `durationMs` field | `400 Bad Request` | `"Bad Request"` |
| File size exceeds 10 MB | `413 Payload Too Large` | `"Payload Too Large"` |
| Declared MIME type not in allowed list | `400 Bad Request` | `"Bad Request"` |
| Actual file bytes do not match declared MIME type | `400 Bad Request` | `"Bad Request"` |
| Declared `durationMs` out of range | `400 Bad Request` | `"Bad Request"` |
| Actual audio duration out of range | `400 Bad Request` | `"Bad Request"` |
| Rate limit exceeded | `429 Too Many Requests` | `"Too Many Requests"` |
| STT, AI, or TTS provider error / timeout | `500 Internal Server Error` | `"Internal Server Error"` |
| Persistence failure | `500 Internal Server Error` | `"Internal Server Error"` |

Error response body shape:

```json
{
  "error": "<value from table above>",
  "statusCode": <HTTP status code as integer>
}
```

---

## Flutter Responsibilities

- Record audio in one of the allowed formats listed above.
- Declare the correct `mimeType` and client-measured `durationMs` in
  the multipart request.
- Enforce local pre-upload checks (file size, duration, MIME type) for
  fast user feedback — but treat these as UX only; backend validation
  is authoritative.
- Send audio only to this backend endpoint. Never send audio to any STT
  provider directly. Never hold STT, TTS, or AI provider credentials.
- Handle all error status codes listed above and display a safe,
  user-facing message without exposing internal error detail.
- Do not derive any AIM Engine-owned value (mastery, level, weakness,
  difficulty, recommendation, review schedule) from the transcript or
  reply text returned in the success response.

---

## Backend Responsibilities

- Authenticate and verify ownership before processing any upload.
- Perform all eight validation steps before forwarding audio to the STT
  Gateway.
- Never return provider credentials, provider error bodies, storage
  paths, or AIM Engine internals to the client.
- Store the voice turn record (transcript, reply, audioRef, timestamp)
  in voice-turn tables only; never write to AIM Engine-owned schema.
- Never commit raw synthesized audio files to the repository; audio is
  referenced only via the opaque `audioRef`.

---

## What This Contract Never Allows

| Prohibited | Reason |
|---|---|
| Flutter sending audio directly to an STT provider | Violates `docs/phase-9/no-client-provider-rule.md` |
| Client supplying an STT/TTS/AI provider key in any field | Provider config is backend-only |
| Backend returning a raw audio storage path or provider URL | Audio served only via `GET /ai-teacher/voice/audio/:audioRef` |
| Client supplying a mastery, level, or weakness value | Violates `docs/phase-9/no-aim-authority-change-rule.md` |
| Skipping any validation step before the STT Gateway call | Required by Audio Validation component responsibility |

---

## Validation

- Contract covers request shape, path parameters, multipart fields,
  format constraints, the eight-step backend validation sequence,
  success response, and all error responses.
- Flutter never sends audio to a provider; all audio goes to this
  backend endpoint only.
- No STT/TTS/AI provider credentials, storage paths, or AIM Engine
  internals appear in any request or response field.
- AIM Engine authority is unchanged; no learning-decision value is
  derived from the uploaded audio or the returned transcript/reply.
- No secrets or generated private audio files are referenced or
  committed in this document.
