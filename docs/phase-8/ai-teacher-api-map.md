# Phase 8 — AI Teacher API Map

**Task:** P8-008
**Branch:** `phase8/P8-008-ai-teacher-api-map`
**Dependency:** P8-007 (AI Teacher Data Flow — Done)
**Output:** `docs/phase-8/ai-teacher-api-map.md`

---

## Purpose

This document defines the API surface that the Flutter AI Teacher Chat
UI is allowed to call. It is the contract between Group H (AI Teacher
API Endpoints) and Group I (Flutter AI Teacher Chat UI), and is the
reference used to verify that no endpoint lets a client compute, set,
or read AI provider secrets, or replace an AIM Engine decision.

This map describes endpoint shape and behavior only. It does not
implement controllers, services, or DTOs — those belong to later
backend implementation tasks (Group H).

---

## Endpoint Surface

All endpoints below are served by the backend (NestJS) and are the
**only** Phase 8 endpoints the Flutter app calls for AI Teacher
functionality.

### 1. `POST /ai-teacher/sessions/:sessionId/messages`

- **Purpose:** Send a student chat message and receive the AI Teacher's
  filtered reply.
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** The backend verifies `sessionId` belongs to the
  requesting student before processing. A session owned by another
  student returns a safe "not found" / "forbidden" error, not session
  data.
- **Request DTO:** `{ message: string }`, validated for presence,
  type, and a bounded max length before entering the pipeline (Context
  Builder → Prompt Builder → AI Provider Gateway → Safety Filter →
  Persistence).
- **Response:** `{ reply: string, createdAt: string }` — the filtered
  AI Teacher reply only. Never includes provider name, provider
  response metadata, API keys, or internal error detail.
- **Errors:** Generic, safe error bodies (e.g. `400 Bad Request`,
  `403 Forbidden`, `429 Too Many Requests`, `500 Internal Server
  Error`) with no stack traces, provider error text, or internal
  identifiers exposed.

### 2. `GET /ai-teacher/sessions/:sessionId/messages`

- **Purpose:** Retrieve chat history for a session, for display in the
  Flutter chat list.
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** Same ownership check as endpoint 1 — a student can
  only read their own session's history.
- **Request DTO:** Optional pagination query params (`cursor`, `limit`),
  validated and bounded.
- **Response:** `{ messages: [{ role: "student" | "ai_teacher", text:
  string, createdAt: string }] }`. No context snapshot internals, no
  provider data, no AIM Engine raw fields are included — only the chat
  text needed to render bubbles.
- **Errors:** Same safe-error pattern as endpoint 1.

### 3. `POST /ai-teacher/sessions`

- **Purpose:** Start a new AI Teacher chat session (e.g. when the
  student opens the chat for a given lesson/topic).
- **Auth:** Required. Authenticated student JWT/session token.
- **Ownership:** The created session is owned by the requesting
  student; the backend sets ownership server-side, never from a
  client-supplied student id.
- **Request DTO:** `{ contextRef: string }` (e.g. lesson or topic
  identifier used to seed the Context Builder), validated for presence
  and format.
- **Response:** `{ sessionId: string, createdAt: string }`.
- **Errors:** Same safe-error pattern as endpoint 1.

---

## What This API Surface Never Does

| Excluded behavior | Reason |
|---|---|
| Returning an AI provider API key, base URL, or model identifier to the client | Violates `docs/phase-8/no-client-ai-provider-rule.md`; provider config stays backend-only. |
| Accepting a client-supplied mastery/level/weakness/difficulty/recommendation/review-schedule value | Violates `docs/phase-8/no-aim-replacement-rule.md`; those values come only from AIM Engine. |
| Returning raw AIM Engine internals (e.g. full mastery computation state) in a chat response | Chat endpoints expose chat text only, not engine internals. |
| Exposing stack traces, provider error bodies, or database error detail in any response | Required by "return safe errors without exposing internals." |
| Allowing a request to act on another student's session id | Required by ownership guard rule. |

---

## Auth, Ownership, and Validation Summary

- **Auth:** every endpoint above requires a valid authenticated student
  token; no endpoint is anonymous.
- **Ownership:** every endpoint that reads or writes a session checks
  that the session belongs to the authenticated student before any
  pipeline step runs.
- **DTO validation:** every request body/query is validated (presence,
  type, bounds) before it reaches the Context Builder, Prompt Builder,
  or AI Provider Gateway.
- **Safe errors:** every error response uses a generic, non-leaking
  message and status code; internal exceptions are logged server-side
  only, never returned to the client.

---

## Validation

- API surface is limited to chat session create, send-message, and
  read-history endpoints consumed by the Flutter AI Teacher UI.
- No endpoint lets AI Teacher replace AIM Engine authority.
- No endpoint allows Flutter to call an AI provider directly or
  retrieve provider credentials.
- Auth and ownership guards, and DTO validation, are specified for
  every endpoint.
- No secrets are referenced or committed in this document.
