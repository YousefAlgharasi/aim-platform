# Phase 9 — Voice Data Flow

**Task:** P9-006
**Branch:** `phase9/P9-006-voice-data-flow`
**Dependency:** P9-003 (Voice Mode Scope Boundaries — Done)
**Output:** `docs/phase-9/voice-data-flow.md`

---

## Purpose

This document defines the end-to-end data flow for AI Teacher Voice
Mode, from a student's recorded speech in Flutter to the stored,
played-back spoken response. It connects the components named in
`docs/phase-9/voice-scope-boundaries.md` (STT Gateway, Voice Session
Pipeline reusing the Phase 8 AI Teacher pipeline, TTS Gateway, Voice
Persistence, Voice API Endpoints, Flutter Voice UI) into a single
ordered pipeline, so implementers build matching interfaces and
reviewers can verify no step is skipped or reordered.

This flow wraps, rather than replaces, the Phase 8 text-mode data flow
(`docs/phase-8/ai-teacher-data-flow.md`): a voice turn is converted to
text (STT), run through the existing Phase 8 pipeline unchanged, and the
resulting reply text is converted back to audio (TTS).

---

## Data Flow Overview

```
Flutter Voice UI (record)
      |
      v  (1) HTTPS upload: recorded audio + chat session id
Voice API Endpoint — transcribe (Group F)
      |
      v  (2) audio file validation
Audio Validation (shared)
      |
      v  (3) single outbound call, credentials read from backend config
STT Gateway (Group C)
      |
      v  (4) transcript text
Voice Session Pipeline (Group E)
      |
      v  (5) input safety filter on transcript
Safety Filtering (Phase 8, shared)
      |
      v  (6) read-only fetch of AIM Engine / curriculum outputs
Context Builder (Phase 8, Group D)
      |
      v  (7) assemble bounded prompt from context + transcript
Prompt Builder (Phase 8, Group E)
      |
      v  (8) single outbound call, credentials read from backend config
AI Provider Gateway (Phase 8, Group F)
      |
      v  (9) provider response
Safety Filtering (Phase 8, shared) — output filter
      |
      v  (10) single outbound call, credentials read from backend config
TTS Gateway (Group D)
      |
      v  (11) synthesized audio (stored, referenced — not returned raw inline as a committed file)
Voice Persistence (Group E)
      |
      v  (12) HTTPS response: transcript + filtered reply text + audio reference
Voice API Endpoint — reply (Group F)
      |
      v  (13) render transcript, render reply text, play audio
Flutter Voice UI (Group G)
```

---

## Step-by-Step Description

1. **Flutter Voice UI → Voice API Endpoint.** The student records
   speech and the app uploads the audio to a backend voice endpoint with
   the chat session identifier. Flutter holds no STT/TTS/AI provider
   credentials and builds no provider request.
2. **Audio validation.** The backend validates the uploaded audio
   (format, size/duration limits) before any provider call. Audio that
   fails validation is rejected with an error response and is not sent
   to the STT Gateway.
3. **STT Gateway transcribes.** The Gateway is the only code path that
   talks to the STT provider. It reads provider configuration (API key,
   base URL) from backend environment/config, never hard-coded, and
   sends the validated audio.
4. **Voice Session Pipeline receives the transcript.** The transcript
   text becomes the equivalent of a typed chat message for the rest of
   the flow.
5. **Input safety filtering.** Identical to the Phase 8 input filter,
   applied to the transcript. A transcript that fails filtering is
   rejected and is not sent to the Context Builder or the AI provider.
6. **Context Builder reads AIM Engine output.** Unchanged from Phase 8:
   a read-only fetch of the student's current, already-computed AIM
   Engine and curriculum outputs. No value is computed, estimated, or
   adjusted here.
7. **Prompt Builder assembles the prompt.** Unchanged from Phase 8: the
   backend-approved context plus the filtered transcript are combined
   into a bounded prompt that asks the provider to explain, guide, hint,
   or tutor — never to decide or score a learning-decision value.
8. **AI Provider Gateway makes the single outbound call.** Unchanged
   from Phase 8 — the same gateway, same credential handling, reused for
   voice turns.
9. **Output safety filtering.** Unchanged from Phase 8: the provider's
   raw response is filtered before it is synthesized, persisted, or
   returned.
10. **TTS Gateway synthesizes speech.** The Gateway is the only code
    path that talks to the TTS provider. It reads provider configuration
    from backend environment/config, never hard-coded, and sends the
    filtered reply text.
11. **Voice Persistence stores the exchange.** The transcript, the
    filtered AI Teacher reply text, the context snapshot, a reference to
    the synthesized audio (backend-managed storage path/ID, not a raw
    file committed anywhere), and a timestamp are stored as voice-turn
    history. No AIM-Engine-owned table or column is written by this
    step, and no raw private audio file is committed to the repository.
12. **Voice API Endpoint returns the reply.** The backend endpoint
    returns the transcript, the filtered reply text, and the audio
    reference (excluding provider secrets) to Flutter.
13. **Flutter renders and plays the reply.** The voice UI shows the
    transcript and reply text and plays the synthesized audio fetched
    via the audio reference. Flutter does not derive or adjust any
    learning-decision value from the transcript or reply content; AIM
    Engine outputs shown elsewhere in the app are unaffected by this
    flow.

---

## What Flows Where

| Data | Source | Destination | Notes |
|---|---|---|---|
| Recorded audio | Flutter | Voice API Endpoint → Audio Validation → STT Gateway | Never sent directly to a provider from Flutter. |
| STT transcript | STT Gateway | Voice Session Pipeline → Safety Filter → Prompt Builder | Treated identically to a typed Phase 8 chat message from this point on. |
| AIM Engine outputs (mastery, level, weakness, etc.) | AIM Engine tables | Context Builder | Read-only; never written to by this flow. |
| Assembled prompt | Prompt Builder | AI Provider Gateway | Contains context + transcript only; no provider keys. |
| STT/TTS/AI provider credentials | Backend env/config | Respective gateway only | Never sent to Flutter, never logged in plaintext. |
| AI Teacher reply text | AI Provider Gateway → Safety Filter | TTS Gateway, Voice Persistence, Voice API Endpoint → Flutter | Stored as voice-turn history only. |
| Synthesized audio | TTS Gateway | Backend-managed storage; reference returned to Flutter | Never committed to the repository as a raw file. |
| Voice-turn history | Voice Persistence | Voice API Endpoint (history) → Flutter | Read-only display in voice/chat UI. |

---

## Authority Boundary in This Flow

- Step 3 (STT Gateway) only transcribes audio to text; it never derives
  a learning-decision value from the audio or the transcript.
- Step 6 (Context Builder) only **reads** AIM Engine output; it never
  computes a new value.
- Step 7 (Prompt Builder) never instructs the provider to produce an
  authoritative learning-decision value.
- Step 10 (TTS Gateway) only converts approved reply text to audio; it
  never alters the reply's meaning or adds learning-decision content.
- Step 11 (Voice Persistence) never writes to an AIM Engine-owned table
  or column.
- Step 13 (Flutter) never derives or adjusts a learning-decision value
  from transcript, reply, or audio content.

This matches `docs/phase-9/voice-mode-charter.md` and
`docs/phase-9/no-aim-authority-change-rule.md`.

---

## Validation

- The data flow covers audio upload, validation, transcription, the
  reused Phase 8 text pipeline, synthesis, persistence, and UI playback,
  in order.
- AI Teacher Voice Mode does not replace AIM Engine authority anywhere
  in the flow.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly; all provider access is through the respective backend-only
  gateway.
- No secrets and no generated private audio files are referenced or
  committed in this document.
