# Phase 9 — AI Teacher Voice Mode Charter

**Task:** P9-001
**Branch:** `phase9/P9-001-voice-mode-charter`
**Dependency:** P8-100 (Phase 8 Final Review and Handoff) — Done
**Status:** Locked

---

## Purpose

This charter locks the scope of Phase 9 as **AI Teacher Voice Mode**: a
backend-driven extension of Phase 8's AI Teacher Text Mode that adds
speech input (STT) and speech output (TTS) on top of the existing AI
Teacher pipeline, AIM Engine, and Student Mobile App. It defines what is
in scope, what is explicitly excluded, and the authority boundaries that
all Phase 9 work must respect.

Phase 9 depends on:

- **Phase 8** — AI Teacher Text Mode being complete, including the
  backend AI Teacher pipeline, AI provider gateway, chat persistence,
  REST APIs, and Flutter chat UI (`docs/phase-8/final-review.md`).
- **Phase 6** — Student Mobile App MVP being complete, including the
  AIM Mobile Design System, mobile theming, and RTL/Arabic support.
- **Phase 5** — AIM Engine backend outputs (mastery, level, weakness,
  difficulty, recommendations, review schedule, retention) being
  available, stable, and read-only.

---

## Authority Rule

**AI Teacher Voice Mode does not replace AIM Engine, and voice does not
change AI Teacher's role.**

AIM Engine remains the sole authority for:

- Mastery calculation
- Level placement
- Weakness detection
- Difficulty selection
- Recommendations
- Review scheduling
- Retention tracking
- Any other learning decision

AI Teacher's role, with or without voice, is strictly limited to:

- Explaining concepts
- Guiding students through problems
- Giving hints
- Tutoring/answering learning questions

Voice is a new input/output **modality** for the existing AI Teacher
pipeline. It does not introduce new tutoring authority, and it does not
allow the client to bypass backend-approved context, prompt building, or
safety filtering.

---

## In Scope (Phase 9)

- Backend speech-to-text (STT) gateway (no direct client access to any
  STT provider)
- Backend text-to-speech (TTS) gateway (no direct client access to any
  TTS provider)
- Backend voice session orchestration that reuses the Phase 8 AI Teacher
  pipeline (context builder, prompt builder, safety filter, AI provider
  gateway, persistence) for voice turns
- Backend APIs for the Flutter app to upload audio for transcription and
  request synthesized audio for AI Teacher replies
- Voice-turn persistence (transcripts and audio references; no raw
  provider credentials or private audio files committed to the repo)
- Flutter AI Teacher **voice** UI (record/playback controls, voice
  session state), built on the AIM Mobile Design System and existing
  mobile theme/widgets, and the existing Phase 8 chat UI foundation

---

## Out of Scope (Phase 9)

The following are explicitly excluded from Phase 9 and must not be
implemented as part of any Phase 9 task:

- Direct Flutter calls to any STT provider
- Direct Flutter calls to any TTS provider
- Direct Flutter calls to any AI provider
- Direct Flutter calls to the AIM Engine
- AIM Engine replacement logic (mastery/level/weakness/difficulty/
  recommendation/review-schedule/retention calculations inside AI
  Teacher or Flutter)
- Realtime/streaming voice protocols beyond what is explicitly defined
  per-task
- Payments
- Parent dashboard
- Admin dashboard
- Student Web App
- Prompt management dashboard
- Cost-control dashboard

---

## UI Rule

All Phase 9 Flutter UI work must:

- Use the AIM Mobile Design System and existing mobile theme/widgets for
  colors, typography, spacing, radius, buttons, cards, inputs, loading
  states, error states, voice controls, and navigation.
- Never hard-code one-off colors, spacing, typography, buttons, cards, or
  styles.
- Respect RTL/Arabic behavior: text direction, alignment, icon direction,
  layout direction, spacing, and voice control orientation must all be
  verified for Arabic/RTL locales.

---

## Security Rule

No Phase 9 task may expose:

- STT provider API keys
- TTS provider API keys
- AI provider API keys
- Supabase service-role keys
- Database credentials
- Production tokens or other secrets
- Generated private audio files

All STT, TTS, and AI provider access is backend-only, gated behind
backend gateway services. Generated audio files must not be committed to
the repository.

---

## Phase 9 Task Groups

| Group | Focus |
|---|---|
| Group A | Phase 9 Control & Scope |
| Group B | Voice Architecture |
| Group C | STT Gateway |
| Group D | TTS Gateway |
| Group E | Voice Session Pipeline & Persistence |
| Group F | Voice API Endpoints |
| Group G | Flutter AI Teacher Voice UI |

---

## Validation

- Phase 9 is documented as AI Teacher Voice Mode only.
- Included and excluded scope are listed clearly above.
- Phase 9 depends on Phase 8 (AI Teacher Text Mode), Phase 6 (mobile
  MVP), and Phase 5 (AIM backend outputs).
- AIM Engine authority is preserved; AI Teacher does not calculate
  learning decisions, in text or voice mode.
- No STT, TTS, or AI provider is called directly from Flutter.
- No secrets or generated private audio files are referenced or
  committed in this document.
