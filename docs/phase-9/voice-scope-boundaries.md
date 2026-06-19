# Phase 9 — Voice Mode Scope Boundaries

**Task:** P9-003
**Branch:** `phase9/P9-003-voice-scope-boundaries`
**Dependency:** P9-001 (Phase 9 Voice Mode Charter — Done)
**Output:** `docs/phase-9/voice-scope-boundaries.md`

---

## Purpose

This document defines, in detail, what Phase 9 includes and excludes.
It exists to prevent Phase 9 from drifting into realtime/streaming voice
protocols beyond what is defined per-task, payments, additional
dashboards, or AIM Engine authority replacement. It refines the scope
already locked in `docs/phase-9/voice-mode-charter.md`.

Phase 9 is **AI Teacher Voice Mode only** — speech input and speech
output layered on top of the existing Phase 8 AI Teacher Text Mode
pipeline.

Phase 9 depends on:

- **Phase 8** — AI Teacher Text Mode (backend pipeline, AI provider
  gateway, chat persistence, REST APIs, Flutter chat UI).
- **Phase 6** — Student Mobile App MVP (Flutter client, AIM Mobile
  Design System, mobile theming, RTL/Arabic support).
- **Phase 5** — AIM Engine backend outputs (mastery, level, weakness,
  difficulty, recommendations, review schedule, retention).

---

## Included Scope

### Backend

- Backend-only STT gateway: a single backend-owned integration point
  that sends recorded audio to the configured STT provider and returns a
  transcript. No other backend module or client calls an STT provider
  directly.
- Backend-only TTS gateway: a single backend-owned integration point
  that sends AI Teacher text replies to the configured TTS provider and
  returns synthesized audio (or a reference to it). No other backend
  module or client calls a TTS provider directly.
- Voice session orchestration that reuses the existing Phase 8 AI
  Teacher pipeline (context builder, prompt builder, safety filter, AI
  provider gateway, persistence) for the transcribed text of a voice
  turn — no parallel/duplicate tutoring logic.
- Voice-turn persistence: storing transcripts and audio references
  (paths/IDs to backend-managed storage), not raw private audio files, in
  the database.
- Voice REST/API endpoints for the Flutter app to upload recorded audio
  for transcription and to request synthesized audio for AI Teacher
  replies.

### Flutter (Mobile)

- AI Teacher voice UI: record control, playback control, voice session
  state (recording/transcribing/replying/speaking), loading and error
  states.
- Built entirely on the AIM Mobile Design System and existing mobile
  theme/widgets (colors, typography, spacing, radius, buttons, cards,
  inputs, voice controls, chat bubbles, navigation), reusing the Phase 8
  chat UI foundation where applicable.
- RTL/Arabic-correct rendering of voice controls, chat bubbles, input
  direction, and navigation.
- Calls only backend voice REST/API endpoints. No direct STT, TTS, or AI
  provider access, no direct AIM Engine access, no learning
  calculations.

---

## Excluded Scope

The following are explicitly out of scope for Phase 9 and must not be
implemented under any Phase 9 task:

| Excluded item | Reason |
|---|---|
| Direct Flutter calls to any STT provider | All STT access must go through the backend-only STT Gateway. |
| Direct Flutter calls to any TTS provider | All TTS access must go through the backend-only TTS Gateway. |
| Direct Flutter calls to any AI provider | All AI provider access must go through the backend-only AI Provider Gateway (Phase 8). |
| Direct Flutter calls to the AIM Engine | AIM Engine access must remain backend-mediated. |
| Realtime/streaming voice protocols beyond what is explicitly defined per-task | Phase 9 scope is request/response voice turns unless a specific task states otherwise. |
| AIM Engine replacement logic | Mastery, level, weakness, difficulty, recommendations, and review schedule must remain AIM Engine's responsibility — never recomputed in AI Teacher or Flutter, in text or voice mode. |
| Payments | Not part of AI Teacher Voice Mode. |
| Parent dashboard | Separate, later phase/feature. |
| Admin dashboard | Separate, later phase/feature. |
| Student Web App | Deferred; mobile-only client for Phase 9. |
| Prompt management dashboard | Not part of Phase 9 deliverables. |
| Cost-control dashboard | Not part of Phase 9 deliverables. |
| Committing generated private audio files | Audio must be referenced via backend-managed storage, never committed to the repository. |

---

## Authority and Security Boundaries

- AI Teacher Voice Mode does not replace AIM Engine. AIM Engine remains
  the sole authority for mastery, level, weakness, difficulty,
  recommendations, review schedule, and retention. Voice is a new
  input/output modality only; it adds no new tutoring authority.
- No STT, TTS, or AI provider is called directly from Flutter; all
  provider access is backend-only, behind the respective gateway.
- No secrets — STT/TTS/AI provider API keys, Supabase service-role keys,
  database credentials, or production tokens — and no generated private
  audio files are referenced or committed in any Phase 9 document or
  code.

---

## Validation

- Phase 9 is documented as AI Teacher Voice Mode only.
- Included and excluded scope are listed clearly above.
- Phase 9 depends on Phase 8 (AI Teacher Text Mode), Phase 6 (mobile
  MVP), and Phase 5 (AIM backend outputs).
- AI Teacher Voice Mode does not replace AIM Engine authority.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets or generated private audio files are referenced or
  committed in this document.
