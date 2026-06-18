# Phase 8 — AI Teacher Architecture Document

**Task:** P8-010
**Branch:** `phase8/P8-010-ai-teacher-architecture-doc`
**Dependency:** P8-009 (Backend AI Teacher Feature Skeleton — Done)
**Output:** `docs/phase-8/ai-teacher-architecture.md`

---

## Purpose

This document defines the components and boundaries of the AI Teacher
backend pipeline before implementation. It is the architectural
reference for `services/backend-api/src/features/ai-teacher/` and
related modules, and must be consulted before any Group C–H backend
implementation task is started, to keep component responsibilities and
boundaries consistent with `docs/phase-8/ai-teacher-data-flow.md` and
`docs/phase-8/ai-teacher-api-map.md`.

---

## Component Map

```
                  ┌─────────────────────────────┐
                  │   Flutter AI Teacher Chat UI │  (Group I)
                  └───────────────┬─────────────┘
                                  │ HTTPS (backend REST only)
                  ┌───────────────▼─────────────┐
                  │  AI Teacher API Endpoints    │  (Group H)
                  │  - session create            │
                  │  - send message               │
                  │  - read history               │
                  │  - auth + ownership guards    │
                  │  - DTO validation             │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Safety Filtering            │  (shared, input)
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Context Builder             │  (Group D)
                  │  - reads AIM Engine outputs  │
                  │  - reads curriculum data      │
                  │  - read-only, no computation  │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Prompt Builder               │  (Group E)
                  │  - bounded prompt assembly    │
                  │  - explain/guide/hint/tutor   │
                  │    instructions only          │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  AI Provider Gateway          │  (Group F)
                  │  - sole provider integration  │
                  │  - reads config/env secrets   │
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Safety Filtering             │  (shared, output)
                  └───────────────┬─────────────┘
                                  │
                  ┌───────────────▼─────────────┐
                  │  Chat Persistence             │  (Group G)
                  │  - chat history storage       │
                  │  - context snapshot storage   │
                  └───────────────┬─────────────┘
                                  │
                  back up through API Endpoints to Flutter
```

---

## Components and Responsibilities

### AI Teacher API Endpoints (Group H)
- The only HTTP surface Flutter calls for AI Teacher features.
- Owns authentication, session-ownership checks, and DTO validation
  (see `docs/phase-8/ai-teacher-api-map.md`).
- Delegates all business logic to the pipeline below; holds no
  learning-decision logic itself.

### Safety Filtering (shared)
- Applied to the student's raw input before it reaches the Context
  Builder, and to the AI provider's raw output before it is persisted
  or returned.
- Stateless validation/filtering; does not read or write AIM Engine
  data.

### Context Builder (Group D)
- Reads existing AIM Engine outputs (mastery, level, weakness,
  difficulty, recommendations, review schedule) and curriculum data
  (current lesson, recent mistakes) strictly as read-only context.
- Never computes, estimates, or adjusts any learning-decision value.

### Prompt Builder (Group E)
- Combines Context Builder output and the filtered student message
  into a single bounded prompt.
- Instructs the AI provider to explain, guide, hint, and tutor only —
  never to decide or score a learning-decision value.

### AI Provider Gateway (Group F)
- The single backend-owned integration point with the configured AI
  provider.
- Reads provider configuration (API key, base URL, model id) from
  environment/config only; never hard-coded, never returned to a
  client, never logged in plaintext.
- No other component calls the provider directly.

### Chat Persistence (Group G)
- Stores chat messages, the AI Teacher reply, the context snapshot
  used to build the prompt, and timestamps.
- Writes only to chat-history tables; never writes to any AIM
  Engine-owned table or column.

### Flutter AI Teacher Chat UI (Group I)
- Calls only the AI Teacher API Endpoints (Group H).
- Renders chat messages and AIM Engine outputs (level, weakness,
  mastery, recommendations, review schedule) using existing Phase 6
  screens; does not derive or adjust those values from chat content.

---

## Boundaries

- **Authority boundary:** AIM Engine remains the only writer of
  mastery, level, weakness, difficulty, recommendations, review
  schedule, and retention. No component in this architecture computes
  or overrides those values; the Context Builder only reads them.
- **Provider boundary:** Only the AI Provider Gateway talks to the AI
  provider. No other backend module, and no client, calls the provider
  directly or holds provider credentials.
- **Persistence boundary:** Chat Persistence writes only to AI Teacher
  chat-history tables. It never writes to AIM Engine-owned schema.
- **Client boundary:** Flutter calls only the AI Teacher REST API; it
  has no access to provider credentials, context-builder internals, or
  prompt-builder internals.

---

## Sequencing for Implementation

Group order matches the dependency chain already established by the
Phase 8 task list:

1. Group D — Context Builder
2. Group E — Prompt Builder
3. Group F — AI Provider Gateway
4. Shared Safety Filtering
5. Group G — Chat Persistence
6. Group H — AI Teacher API Endpoints
7. Group I — Flutter AI Teacher Chat UI

Each group is implemented as its own Phase 8 task, scoped individually
in `docs/tasks/phase8_prompts.md`.

---

## Validation

- Components and boundaries are defined before implementation begins.
- AI Teacher does not replace AIM Engine authority in this
  architecture.
- Flutter does not call an AI provider directly; all provider access
  goes through the AI Provider Gateway.
- No secrets are referenced or committed in this document.
