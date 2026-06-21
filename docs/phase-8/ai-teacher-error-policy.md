# Phase 8 — AI Teacher Error Policy

**Task:** P8-014
**Branch:** `phase8/P8-014-ai-teacher-error-policy`
**Dependency:** P8-010 (AI Teacher Architecture Document — Done)
**Output:** `docs/phase-8/ai-teacher-error-policy.md`

---

## Purpose

This document defines how the AI Teacher backend pipeline handles
failures, so every component in `docs/phase-8/ai-teacher-architecture.md`
fails safely and predictably. It ensures provider outages, timeouts,
and internal errors never leak internals, never crash the chat flow
silently, and never fall back to a client-trusted or fabricated
learning-decision value.

---

## Error Categories

| Category | Example | Where it can occur |
|---|---|---|
| Auth/ownership failure | Invalid token, session not owned by requester | AI Teacher API Endpoints (Group H) |
| Validation failure | Missing/oversized message, malformed DTO | AI Teacher API Endpoints (Group H) |
| Input safety rejection | Message fails safety filter | Safety Filtering (input) |
| Context unavailable | AIM Engine/curriculum read fails or times out | Context Builder (Group D) |
| Provider failure | AI provider times out, errors, or returns malformed data | AI Provider Gateway (Group F) |
| Output safety rejection | Provider response fails safety filter | Safety Filtering (output) |
| Persistence failure | Database write fails | Chat Persistence (Group G) |

---

## Policy by Category

### Auth/ownership failure
- Return a generic `401`/`403`-style error.
- Do not reveal whether a session id exists for another student.
- Lifecycle stops immediately; no further step runs.

### Validation failure
- Return a generic `400 Bad Request` with a safe, non-internal message
  (e.g. "Invalid request").
- Do not echo back raw validation internals or stack traces.

### Input safety rejection
- Return a safe, generic rejection message to the student (e.g.
  "This message can't be sent. Try rephrasing.").
- Do not forward the rejected message to the Context Builder or AI
  Provider Gateway.
- Do not persist the rejected raw message as a chat entry beyond what
  moderation/audit logging requires internally.

### Context unavailable
- If AIM Engine or curriculum data cannot be read, do not proceed to
  the Prompt Builder with partial or fabricated context.
- Return a safe error indicating AI Teacher is temporarily unavailable.
- Never substitute a guessed or default mastery/level/weakness value
  for missing context — missing context is a hard stop, not a reason
  to invent a learning-decision value.

### Provider failure (timeout, error, malformed response)
- Treat any non-success provider outcome as a failure, not as silent
  empty content.
- Return a safe, generic fallback response or error (e.g. "AI Teacher
  is unavailable right now, please try again.") per
  `docs/phase-8/ai-teacher-output-contract.md`'s predictability rules.
- Never expose provider error text, status codes, or response bodies
  to the client.
- Do not retry indefinitely; apply a bounded retry/backoff policy at
  the Gateway level and fail safely once exhausted.

### Output safety rejection
- If the provider's response fails output safety filtering, do not
  persist or return the raw rejected text.
- Use the same safe fallback response as a provider failure.

### Persistence failure
- If chat history fails to save, still return the AI Teacher reply to
  the student if it already passed safety filtering (the student
  should not lose a safe reply because of a storage hiccup), but log
  the persistence failure internally for follow-up.
- Never expose database error detail to the client.

---

## Cross-Cutting Rules

- **No internals in responses.** No stack trace, SQL error, provider
  response body, or internal file/module path is ever included in a
  client-facing error.
- **No silent learning-decision substitution.** No error path may
  produce a placeholder mastery/level/weakness/difficulty/
  recommendation/review-schedule value; those remain solely AIM
  Engine's responsibility regardless of AI Teacher's error state.
- **Logging.** Errors are logged server-side with enough detail to
  debug (category, correlation id, non-sensitive metadata), without
  logging provider API keys or other secrets in plaintext.
- **Consistent shape.** All client-facing AI Teacher errors use the
  same safe error envelope already used by other backend REST
  endpoints in this codebase, so Flutter's existing error-state UI
  handles them without special-casing.

---

## Validation

- Safe failure behavior is defined for AI provider and API errors.
- No error path exposes secrets, provider details, or internals.
- No error path lets AI Teacher fabricate or substitute an AIM Engine
  decision.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
