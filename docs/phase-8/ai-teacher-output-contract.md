# Phase 8 — AI Teacher Output Contract

**Task:** P8-013
**Branch:** `phase8/P8-013-ai-teacher-output-contract`
**Dependency:** P8-010 (AI Teacher Architecture Document — Done)
**Output:** `docs/phase-8/ai-teacher-output-contract.md`

---

## Purpose

This document defines the exact shape of an AI Teacher response after
it leaves the AI Provider Gateway and Safety Filtering, on its way to
Chat Persistence and the Flutter UI. It keeps AI output predictable,
safe, and directly displayable by the mobile chat UI, without the
Flutter app needing to interpret provider-specific formats or
implement its own learning-decision logic.

---

## Output Contract

A safety-filtered AI Teacher response, as stored and returned by the
backend, has this shape:

```jsonc
{
  "role": "ai_teacher",
  "text": "string — plain, student-facing chat text",
  "createdAt": "string — ISO 8601 timestamp"
}
```

- **`role`** is always the literal `"ai_teacher"` for AI Teacher
  messages (as opposed to `"student"` for the student's own messages
  in chat history).
- **`text`** is plain text intended for direct display in a chat
  bubble. It contains no provider-specific markup that the Flutter UI
  would need special parsing for beyond the app's existing chat
  rendering (e.g. existing Markdown-lite/plain text rendering already
  used by the chat bubble widget).
- **`createdAt`** is a normal timestamp string, used for ordering and
  display, not a learning-decision field.

No other top-level field is part of the contract. In particular, the
following are never included in this output:

| Excluded field | Reason |
|---|---|
| `masteryScore`, `level`, `weakness`, `difficulty`, `recommendation`, `reviewSchedule`, or any similarly named field | AI Teacher output is advisory text; it never carries a learning-decision value (`docs/phase-8/no-aim-replacement-rule.md`). |
| `provider`, `model`, `rawProviderResponse` | Provider details stay backend-internal; never exposed to the client. |
| `promptUsed`, `contextSnapshot` | Internal pipeline detail, not part of the chat display contract; may be stored internally for Chat Persistence/debugging but is not returned to Flutter. |
| `apiKey`, any credential-shaped string | Never present in any AI Teacher output under any circumstance. |

---

## Predictability Rules

- The `text` field is always a string; it is never `null` and never an
  object. If the underlying provider response cannot be safely
  rendered, a backend-defined fallback string is used instead (see
  `docs/phase-8/request-lifecycle.md`, step 9), so Flutter always
  receives a renderable value.
- `text` length is bounded by a backend-enforced maximum, so the
  mobile chat bubble never has to handle an unbounded string.
- `text` is plain text (UTF-8), safe for RTL/Arabic and LTR rendering;
  it carries no embedded directionality control characters and no
  HTML/script content.

---

## Where This Contract Applies

- **Chat Persistence (Group G):** stores each AI Teacher message using
  this shape (plus internal-only fields such as a context snapshot
  reference, which are not re-exposed to the client).
- **AI Teacher API Endpoints (Group H):** the `send message` and `read
  history` endpoints return messages using exactly this shape for
  `role: "ai_teacher"` entries (see `docs/phase-8/ai-teacher-api-map.md`).
- **Flutter AI Teacher Chat UI (Group I):** renders `text` directly in
  a chat bubble; it does not need to parse, score, or transform the
  response to extract a learning-decision value, because none exists
  in this contract.

---

## Validation

- AI Teacher output is defined as predictable, safe, plain-text chat
  content only.
- The contract excludes any learning-decision field, provider detail,
  or secret.
- AI Teacher does not replace AIM Engine authority via this contract.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
