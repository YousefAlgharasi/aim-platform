# Phase 8 — AI Teacher Request Lifecycle

**Task:** P8-011
**Branch:** `phase8/P8-011-ai-teacher-request-lifecycle`
**Dependency:** P8-010 (AI Teacher Architecture Document — Done)
**Output:** `docs/phase-8/request-lifecycle.md`

---

## Purpose

This document explains, step by step, what happens from the moment a
student sends a message in the Flutter AI Teacher Chat UI to the
moment the response is persisted and the student sees it. It narrates
the same pipeline defined in `docs/phase-8/ai-teacher-architecture.md`
and `docs/phase-8/ai-teacher-data-flow.md`, at request/response detail
level, so backend implementers know exactly what each request passes
through and reviewers can verify nothing is skipped.

---

## Lifecycle Steps

### 1. Student composes and sends a message (Flutter)

The student types a message in the AI Teacher chat input and taps
send. Flutter calls `POST /ai-teacher/sessions/:sessionId/messages`
with the message text and the existing session id. Flutter attaches
only its standard authenticated request headers — no AI provider
credential is present anywhere in this request, because Flutter never
holds one.

### 2. Request reaches the AI Teacher API Endpoint (Group H)

The endpoint authenticates the request and checks that `sessionId`
belongs to the requesting student. If authentication or ownership
fails, the request is rejected immediately with a safe error and the
lifecycle stops here — no further step runs.

### 3. DTO validation

The request body is validated (presence, type, max length). An
invalid body is rejected with a safe `400` error before anything is
sent downstream.

### 4. Input safety filtering

The validated message text is passed through the safety filter. If
the message fails filtering (e.g. disallowed content), the request is
rejected with a safe error and no further step runs — the message is
not forwarded to the Context Builder or the AI provider.

### 5. Context Builder reads AIM Engine and curriculum data (Group D)

For the student tied to this session, the Context Builder reads the
already-computed AIM Engine outputs (level, weakness, recommendations,
etc.) and relevant curriculum data (current lesson, recent mistakes).
This is read-only: no value is computed or changed in this step.

### 6. Prompt Builder assembles the prompt (Group E)

The context from step 5 and the filtered message from step 4 are
combined into a single bounded prompt. The prompt asks the AI provider
to explain, guide, hint, or tutor — never to decide or score a
learning-decision value.

### 7. AI Provider Gateway calls the provider (Group F)

The Gateway sends the prompt to the configured AI provider, using
credentials read from backend environment/config. This is the only
point in the entire lifecycle where a network call to the AI provider
is made.

### 8. Provider responds

The AI provider returns a text response to the Gateway. If the
provider call fails or times out, the lifecycle returns a safe error
to the endpoint layer and the request stops — no partial or
unfiltered content is persisted or returned.

### 9. Output safety filtering

The provider's raw response is filtered before it is used further. If
filtering rejects the content, a safe fallback error/response is used
instead of the raw provider text; the rejected raw text is not
persisted as the user-facing reply.

### 10. Chat Persistence stores the exchange (Group G)

The student's message, the filtered AI Teacher reply, the context
snapshot from step 5, and a timestamp are written to chat-history
storage. No AIM Engine-owned table or column is written in this step.

### 11. API Endpoint returns the response (Group H)

The endpoint returns `{ reply, createdAt }` to Flutter. No provider
name, provider metadata, internal error detail, or AIM Engine raw
computation state is included in the response.

### 12. Flutter renders the reply

The chat UI appends the AI Teacher reply as a chat bubble. The
student's existing AIM Engine outputs displayed elsewhere in the app
(mastery, level, weakness, recommendations, review schedule) are
unaffected by this lifecycle — they remain whatever AIM Engine last
computed.

---

## Failure Handling Summary

| Failure point | Result |
|---|---|
| Auth/ownership check fails (step 2) | Safe `403`/`404`-style error; lifecycle stops. |
| DTO validation fails (step 3) | Safe `400` error; lifecycle stops. |
| Input safety filter rejects message (step 4) | Safe error returned; message never reaches Context Builder or provider. |
| AI Provider Gateway call fails/times out (step 7–8) | Safe error/fallback returned; nothing unfiltered is persisted. |
| Output safety filter rejects response (step 9) | Safe fallback used instead of raw provider text; raw text not persisted as the reply. |

---

## Validation

- Every step from mobile message to backend response persistence is
  explained, in order.
- AI Teacher does not replace AIM Engine authority at any step.
- Flutter does not call an AI provider directly; the only provider
  call happens inside the AI Provider Gateway (step 7).
- No secrets are referenced or committed in this document.
