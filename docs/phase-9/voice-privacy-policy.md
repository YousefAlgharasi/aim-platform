# Phase 9 — Voice Privacy Policy

**Task:** P9-017
**Branch:** `phase9/P9-017-voice-privacy-policy`
**Dependency:** P9-010 (Voice Mode Architecture Document — Done)
**Output:** `docs/phase-9/voice-privacy-policy.md`

---

## Purpose

This document defines privacy rules for voice recordings, STT
transcripts, TTS audio, voice-turn logs, and voice-turn storage, so
sensitive student data — including the student's recorded voice — is
never leaked to logs, sent to a provider beyond what's strictly needed,
or retained longer than necessary. It extends
`docs/phase-8/privacy-policy.md` to the voice pipeline: once a voice
turn produces a transcript, every Phase 8 rule about what may/must
never be sent to the AI provider prompt, logging, and chat storage
applies unchanged. This document adds the rules specific to raw audio
and the STT/TTS providers.

---

## What May Be Sent to the STT Provider

- Only the validated audio clip for the current turn (per
  `docs/phase-9/voice-api-map.md` endpoint 1), and only after Audio
  Validation has passed.
- No additional student metadata (name, id, contact info) is attached
  to the STT provider request beyond what the provider's API strictly
  requires to process the audio (e.g. a content-type header).

## What May Be Sent to the AI Provider Prompt (Voice Turns)

Identical to `docs/phase-8/privacy-policy.md` §"What May Be Sent to the
AI Provider Prompt" — the STT transcript stands in for the student's
typed message; no additional voice-specific field (e.g. audio duration,
STT confidence score) is added to the prompt.

## What May Be Sent to the TTS Provider

- Only the already safety-filtered AI Teacher reply text for the
  current turn. No student-identifying field, context snapshot, or
  AIM Engine output is sent to the TTS provider — it only converts text
  to speech and has no tutoring-relevant reason to receive anything
  beyond that text.

---

## What Must Never Be Sent to Any Voice Provider

In addition to every field listed in
`docs/phase-8/privacy-policy.md` §"What Must Never Be Sent to the AI
Provider Prompt" (which applies unchanged to the AI Provider Gateway
call for voice turns):

| Field type | Examples |
|---|---|
| Other students' audio or transcripts | Any voice-turn data belonging to a student other than the one in the session. |
| Raw account/session identifiers beyond what the STT/TTS provider's API requires | Internal database row ids, JWTs, session tokens. |
| AIM Engine raw computation state | Full mastery computation internals — only already-computed, backend-approved values may ever reach a prompt, per `docs/phase-8/privacy-policy.md`, and never the TTS/STT provider at all. |

---

## Raw Audio Handling Rules

- Recorded audio uploaded by the student, and audio synthesized by the
  TTS Gateway, are written only to backend-managed storage; neither is
  ever committed to the repository, in any branch, in any form (per
  `docs/phase-9/voice-scope-boundaries.md` — "Excluded Scope").
- Raw audio is never returned to the client except via the single
  audio-stream endpoint (`docs/phase-9/voice-api-map.md` §3), which
  enforces the same ownership check as every other voice endpoint.
- Raw audio is never forwarded to the AI Provider Gateway; only the STT
  transcript (text) reaches the AI provider.
- Raw audio is never embedded in a database column directly — only an
  opaque `audioRef` (per `docs/phase-9/voice-session-contract.md` and
  `docs/phase-9/tts-output-contract.md`) is persisted; the audio bytes
  themselves live in backend-managed storage, access-controlled the
  same way as the rest of student data.

---

## Logging Rules

In addition to every rule in `docs/phase-8/privacy-policy.md`
§"Logging Rules" (which applies unchanged):

- Application logs for the voice pipeline must never include:
  - Raw audio bytes or a base64/encoded audio payload.
  - The full STT transcript or full AI Teacher reply text, beyond what
    is already permitted (redacted/truncated, non-production only) by
    the Phase 8 logging rules.
  - STT or TTS provider API keys or other credentials, in any form.
- Logs may include non-sensitive operational metadata specific to
  voice: audio duration, content type, turn status, and the same
  request id/session id/latency/error category/status code fields
  already permitted by Phase 8.

---

## Voice Storage Rules

- Voice Persistence (Group E) stores: the transcript text, the AI
  Teacher reply text, an `audioRef` (not raw audio), and a timestamp —
  exactly the Voice Turn shape defined in
  `docs/phase-9/voice-session-contract.md`.
- Voice storage is scoped per student (see
  `docs/phase-8/permission-policy.md` for the ownership/access pattern,
  reused unchanged for voice) and is not queryable by any other
  student.
- Voice storage never includes STT/TTS/AI provider credentials or
  unrelated students' data.
- Raw audio in backend-managed storage follows the same per-student
  access scoping as voice-turn database rows: a student's audio is
  retrievable only via their own `audioRef`, never another student's.

---

## Why This Matters

Voice mode introduces a new sensitive data type — the student's actual
recorded voice — on top of every privacy concern already present in
Phase 8 text mode. Sending more than the minimum necessary audio/text
to STT/TTS/AI providers, writing raw audio or full transcripts into
logs, or retaining raw audio outside backend-managed, access-controlled
storage would create an avoidable data-exposure surface specific to
voice. Limiting provider inputs to the minimum, keeping logs and
storage free of raw audio and unredacted sensitive content, and never
committing private audio to the repository keeps voice mode's privacy
footprint as small as the feature requires.

---

## Validation

- Privacy rules are defined for voice recordings, STT transcripts, TTS
  audio, voice-turn logs, and voice-turn storage.
- Sensitive fields (credentials, contact info, billing, other students'
  data, raw audio beyond the single audio-stream endpoint) are never
  sent to a provider or written to logs.
- AI Teacher Voice Mode does not replace AIM Engine authority.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets or generated private audio files are referenced or
  committed in this document.
