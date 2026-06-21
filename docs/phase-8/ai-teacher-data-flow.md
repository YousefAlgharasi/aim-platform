# Phase 8 — AI Teacher Data Flow

**Task:** P8-007
**Branch:** `phase8/P8-007-ai-teacher-data-flow`
**Dependency:** P8-003 (AI Teacher Scope Boundaries — Done)
**Output:** `docs/phase-8/ai-teacher-data-flow.md`

---

## Purpose

This document defines the end-to-end data flow for AI Teacher Text Mode,
from a student's chat message in Flutter to the stored, displayed
response. It connects the components named in
`docs/phase-8/ai-teacher-scope-boundaries.md` (Context Builder, Prompt
Builder, AI Provider Gateway, Safety Filtering, Chat Persistence, REST
API, Flutter UI) into a single ordered pipeline, so implementers build
matching interfaces and reviewers can verify no step is skipped or
reordered.

---

## Data Flow Overview

```
Flutter Chat UI
      |
      v  (1) HTTPS request: student message + chat session id
AI Teacher REST API Endpoint (Group H)
      |
      v  (2) input safety filter
Safety Filtering (Group ?, shared)
      |
      v  (3) read-only fetch of AIM Engine / curriculum outputs
Context Builder (Group D)
      |
      v  (4) assemble bounded prompt from context + student message
Prompt Builder (Group E)
      |
      v  (5) single outbound call, credentials read from backend config
AI Provider Gateway (Group F)
      |
      v  (6) provider response
Safety Filtering (Group ?, shared) — output filter
      |
      v  (7) persist message pair + context snapshot
Chat Persistence (Group G)
      |
      v  (8) HTTPS response: filtered AI Teacher reply
AI Teacher REST API Endpoint (Group H)
      |
      v  (9) render in chat bubble
Flutter Chat UI (Group I)
```

---

## Step-by-Step Description

1. **Flutter Chat UI → REST API.** The student types a message and taps
   send. Flutter calls a backend AI Teacher REST endpoint with the
   message text and the chat session identifier. Flutter holds no AI
   provider credentials and builds no provider request.
2. **Input safety filtering.** The backend validates and filters the
   raw student message before it is used for anything else (e.g.
   length limits, disallowed content). A message that fails filtering
   is rejected with an error response and is not sent to the Context
   Builder or the provider.
3. **Context Builder reads AIM Engine output.** The backend fetches the
   student's current, already-computed AIM Engine and curriculum
   outputs (lesson, recent mistakes, weaknesses, level, recommendations).
   This is a read-only step: no value is computed, estimated, or
   adjusted here.
4. **Prompt Builder assembles the prompt.** The backend-approved context
   from step 3 and the filtered student message from step 2 are
   combined into a bounded prompt. The prompt instructs the AI provider
   to explain, guide, hint, and tutor — it never asks the provider to
   decide or score mastery, level, weakness, difficulty,
   recommendations, or review schedule.
5. **AI Provider Gateway makes the single outbound call.** The Gateway
   is the only code path that talks to the AI provider. It reads
   provider configuration (API key, base URL, model id) from backend
   environment/config, never hard-coded, and sends the prompt built in
   step 4.
6. **Output safety filtering.** The provider's raw response is filtered
   before it is persisted or returned. Filtering may redact or block
   unsafe content; it does not add or alter learning-decision values.
7. **Chat Persistence stores the exchange.** The student message, the
   filtered AI Teacher reply, the context snapshot used to build the
   prompt, and a timestamp are stored as chat history. No
   AIM-Engine-owned table or column is written by this step.
8. **REST API returns the reply.** The backend endpoint returns the
   filtered AI Teacher reply (and any needed metadata, excluding
   provider secrets) to Flutter.
9. **Flutter renders the reply.** The chat UI appends the AI Teacher
   reply as a chat bubble. Flutter does not derive or adjust any
   learning-decision value from the reply content; AIM Engine outputs
   shown elsewhere in the app (mastery, level, weakness,
   recommendations, review schedule) are unaffected by this flow.

---

## What Flows Where

| Data | Source | Destination | Notes |
|---|---|---|---|
| Student chat message | Flutter | REST API → Safety Filter → Prompt Builder | Never sent directly to a provider from Flutter. |
| AIM Engine outputs (mastery, level, weakness, etc.) | AIM Engine tables | Context Builder | Read-only; never written to by this flow. |
| Assembled prompt | Prompt Builder | AI Provider Gateway | Contains context + message only; no provider keys. |
| Provider credentials | Backend env/config | AI Provider Gateway only | Never sent to Flutter, never logged in plaintext. |
| AI Teacher reply | AI Provider Gateway → Safety Filter | Chat Persistence + REST API → Flutter | Stored as chat history only. |
| Chat history | Chat Persistence | REST API (history endpoint) → Flutter | Read-only display in chat UI. |

---

## Authority Boundary in This Flow

- Step 3 (Context Builder) only **reads** AIM Engine output; it never
  computes a new value.
- Step 4 (Prompt Builder) never instructs the provider to produce an
  authoritative learning-decision value.
- Step 7 (Chat Persistence) never writes to an AIM Engine-owned table
  or column.
- Step 9 (Flutter) never derives or adjusts a learning-decision value
  from AI Teacher chat content.

This matches `docs/phase-8/ai-teacher-authority-rule.md` and
`docs/phase-8/no-aim-replacement-rule.md`.

---

## Validation

- The data flow covers chat input, context, prompt, provider response,
  safety filter, persistence, and UI display, in order.
- AI Teacher does not replace AIM Engine authority anywhere in the flow.
- Flutter does not call an AI provider directly; all provider access is
  through the backend-only AI Provider Gateway.
- No secrets are referenced or committed in this document.
