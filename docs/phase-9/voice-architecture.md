# Phase 9 — Voice Mode Architecture Document

**Task:** P9-010
**Branch:** `phase9/P9-010-voice-architecture-doc`
**Dependency:** P9-009 (Backend Voice Feature Skeleton — Done)
**Output:** `docs/phase-9/voice-architecture.md`

---

## Purpose

This document defines the components and boundaries of the AI Teacher
Voice Mode backend pipeline before implementation. It is the
architectural reference for
`services/backend-api/src/features/voice-teacher/` and related
modules, and must be consulted before any Group C–G Phase 9 backend
implementation task is started, to keep component responsibilities and
boundaries consistent with `docs/phase-9/voice-data-flow.md` and
`docs/phase-9/voice-api-map.md`. It extends
`docs/phase-8/ai-teacher-architecture.md` — voice turns reuse the
existing Context Builder, Prompt Builder, AI Provider Gateway, and
Safety Filtering components defined there, adding only the STT/TTS
gateways and voice-specific orchestration/persistence/API layers.

---

## Component Map

```
                  ┌─────────────────────────────┐
                  │ Flutter AI Teacher Voice UI  │  (Group G)
                  └───────────────┬─────────────┘
                                  │ HTTPS (backend REST only)
                  ┌───────────────▼─────────────┐
                  │  Voice API Endpoints         │  (Group F)
                  │  - voice session create      │
                  │  - submit audio turn         │
                  │  - read turn history         │
                  │  - stream audio reply        │
                  │  - auth + ownership guards   │
                  │  - upload/DTO validation     │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Audio Validation             │  (Group F)
                  │  - format/size/duration checks│
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  STT Gateway                  │  (Group C)
                  │  - sole STT provider integ.   │
                  │  - reads config/env secrets   │
                  └───────────────┬─────────────┘
                                  │ transcript
                  ┌───────────────▼─────────────┐
                  │  Voice Session Orchestration  │  (Group B/E)
                  │  - reuses Phase 8 pipeline    │
                  │  - no parallel tutoring logic │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Safety Filtering             │  (shared, input)
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Context Builder (Phase 8)    │
                  │  - reads AIM Engine outputs   │
                  │  - read-only, no computation  │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Prompt Builder (Phase 8)      │
                  │  - bounded prompt assembly     │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  AI Provider Gateway (Phase 8) │
                  │  - sole AI provider integ.     │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Safety Filtering              │  (shared, output)
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  TTS Gateway                   │  (Group D)
                  │  - sole TTS provider integ.     │
                  │  - reads config/env secrets     │
                  └───────────────┬─────────────┘
                                  │ audioRef
                  ┌───────────────▼─────────────┐
                  │  Voice Persistence              │  (Group E)
                  │  - transcript/reply/audioRef     │
                  │  - never AIM-owned tables         │
                  └───────────────┬─────────────┘
                                  │
                  back up through Voice API Endpoints to Flutter
```

---

## Components and Responsibilities

### Voice API Endpoints (Group F)
- The only HTTP surface Flutter calls for AI Teacher Voice Mode
  features (see `docs/phase-9/voice-api-map.md`).
- Owns authentication, session/audioRef-ownership checks, and
  upload/DTO validation.
- Delegates all business logic to the pipeline below; holds no
  learning-decision logic and no provider integration itself.

### Audio Validation (Group F)
- Validates uploaded audio for format, size, and duration limits before
  it reaches the STT Gateway.
- Stateless validation; does not read or write AIM Engine data.

### STT Gateway (Group C)
- The single backend-owned integration point with the configured STT
  provider.
- Reads provider configuration (API key, base URL, model id) from
  environment/config only; never hard-coded, never returned to a
  client, never logged in plaintext.
- No other component calls the STT provider directly.

### Voice Session Orchestration (Group B/E)
- Coordinates a voice turn through the existing Phase 8 AI Teacher
  pipeline (Context Builder, Prompt Builder, AI Provider Gateway,
  Safety Filtering) using the STT transcript as the turn's text input.
- Implements no parallel/duplicate tutoring logic; reuses Phase 8
  components unchanged.

### Safety Filtering (shared, reused from Phase 8)
- Applied to the transcript before it reaches the Context Builder, and
  to the AI provider's raw output before it is synthesized or
  persisted.
- Stateless validation/filtering; does not read or write AIM Engine
  data.

### Context Builder, Prompt Builder, AI Provider Gateway (reused from Phase 8)
- Unchanged from `docs/phase-8/ai-teacher-architecture.md`. The Context
  Builder remains read-only over AIM Engine outputs; the Prompt Builder
  assembles bounded explain/guide/hint/tutor prompts only; the AI
  Provider Gateway remains the sole AI-provider integration point.

### TTS Gateway (Group D)
- The single backend-owned integration point with the configured TTS
  provider.
- Sends the filtered AI Teacher reply text to the TTS provider and
  returns synthesized audio or a reference to it.
- Reads provider configuration from environment/config only; never
  hard-coded, never returned to a client, never logged in plaintext.
- No other component calls the TTS provider directly.

### Voice Persistence (Group E)
- Stores the transcript, the AI Teacher reply, and an audio reference
  (path/ID to backend-managed storage), plus timestamps.
- Writes only to voice-turn/chat-history tables; never writes to any
  AIM Engine-owned table or column.
- Never stores raw private audio files as committed repository content.

### Flutter AI Teacher Voice UI (Group G)
- Calls only the Voice API Endpoints (Group F) and the existing Phase 8
  AI Teacher REST API endpoints.
- Renders transcript, reply text, and audio playback, and renders AIM
  Engine outputs (level, weakness, mastery, recommendations, review
  schedule) using existing Phase 6/8 screens; does not derive or adjust
  those values from voice content.

---

## Boundaries

- **Authority boundary:** AIM Engine remains the only writer of
  mastery, level, weakness, difficulty, recommendations, review
  schedule, and retention. No component in this architecture computes
  or overrides those values; the Context Builder only reads them,
  exactly as in Phase 8.
- **Provider boundary:** Only the STT Gateway talks to the STT
  provider, only the TTS Gateway talks to the TTS provider, and only
  the AI Provider Gateway talks to the AI provider. No other backend
  module, and no client, calls any provider directly or holds provider
  credentials.
- **Persistence boundary:** Voice Persistence writes only to voice-turn
  tables. It never writes to AIM Engine-owned schema, and never stores
  raw audio files in the repository.
- **Client boundary:** Flutter calls only the Voice API Endpoints and
  the Phase 8 AI Teacher REST API; it has no access to provider
  credentials, STT/TTS Gateway internals, Context Builder internals, or
  Prompt Builder internals.

---

## Sequencing for Implementation

Group order matches the dependency chain established by the Phase 9
task list:

1. Group B — Voice Architecture & Contracts (this document and related
   contracts)
2. Group C — STT Gateway
3. Group D — TTS Gateway
4. Group E — Voice Session Orchestration & Persistence (reusing Phase 8
   Context Builder, Prompt Builder, AI Provider Gateway, Safety
   Filtering)
5. Group F — Voice API Endpoints
6. Group G — Flutter AI Teacher Voice UI

Each group is implemented as its own Phase 9 task, scoped individually
in `docs/tasks/phase9_prompts.md`.

---

## Validation

- Components and boundaries are defined before implementation begins.
- AI Teacher Voice Mode does not replace AIM Engine authority in this
  architecture.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly; all provider access goes through the respective gateway.
- No secrets are referenced or committed in this document.
