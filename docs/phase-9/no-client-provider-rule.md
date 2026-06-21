# Phase 9 — No Client STT/TTS/AI Provider Rule

**Task:** P9-004
**Branch:** `phase9/P9-004-no-client-provider-rule`
**Dependency:** P9-003 (Voice Mode Scope Boundaries — Done)
**Output:** `docs/phase-9/no-client-provider-rule.md`

---

## Purpose

This document locks the rule that **no client may call an STT, TTS, or
AI provider directly**. All STT, TTS, and AI provider access in Phase 9
happens through single backend-owned gateways. This keeps provider
credentials out of any client, gives the backend full control over
cost, safety filtering, and context, and prevents an unbounded/unsafe
channel from the student's device straight to a third-party provider.

This rule extends the Phase 8 no-client-AI-provider rule
(`docs/phase-8/no-client-ai-provider-rule.md`) to cover the two new
provider types introduced in Phase 9: speech-to-text (STT) and
text-to-speech (TTS).

---

## The Rule

**Flutter (and any other client) must never call an STT provider, a TTS
provider, or an AI provider directly.**

This means, for every Phase 9 AI Teacher Voice Mode feature:

- The Flutter app never holds an STT provider API key, a TTS provider
  API key, or an AI provider API key.
- The Flutter app never constructs a request to an STT provider's API,
  a TTS provider's API, or an AI provider's API.
- The Flutter app never receives an STT/TTS/AI provider API key,
  endpoint credential, or any other provider secret from the backend.
- The Flutter app only calls AIM Platform's own backend voice API
  endpoints (Group F) and the existing Phase 8 AI Teacher REST API
  endpoints, and renders the backend's response.

---

## Where Provider Access Lives

- All STT provider calls happen inside the **backend-only STT Gateway**
  (Group C).
- All TTS provider calls happen inside the **backend-only TTS Gateway**
  (Group D).
- All AI provider calls happen inside the **backend-only AI Provider
  Gateway** established in Phase 8 (Group F of Phase 8) and reused,
  unchanged, for voice turns.
- Each gateway is the single integration point between AIM Platform's
  backend and its respective configured provider.
- No other backend module bypasses a gateway to call a provider
  directly — every STT, TTS, or AI request flows through its gateway.

---

## Provider Configuration Rules

- Provider configuration (API keys, base URLs, model/voice identifiers)
  is read from safe environment/config sources on the backend
  (environment variables or a secrets manager) — never hard-coded in
  source files.
- Provider secrets are never committed to the repository, in any
  branch, in any form (plaintext, base64, comments, or example files
  with real values).
- Provider secrets are never returned in any API response to the
  Flutter client or logged in plaintext.
- `.env.example`-style files may list the *names* of required
  environment variables, but never real key values.

---

## Why This Matters

If a client held a provider key or called a provider directly:

- The key could be extracted from the app binary or network traffic and
  abused outside the platform's cost and rate controls.
- The backend would lose the ability to apply safety filtering, context
  approval, transcript/audio persistence, and ownership checks
  consistently, since some traffic would bypass it entirely.
- A compromised or modified client could send arbitrary audio or text
  to a provider under the platform's account, or fetch synthesized audio
  for content the backend never approved.

Keeping all STT, TTS, and AI provider access backend-only closes this
attack surface and keeps a single, auditable choke point per provider
type.

---

## Enforcement Points

- **STT Gateway** (Group C): owns the only code path that talks to the
  STT provider.
- **TTS Gateway** (Group D): owns the only code path that talks to the
  TTS provider.
- **AI Provider Gateway** (Phase 8, Group F): owns the only code path
  that talks to the AI provider; unchanged for voice turns.
- **Voice API Endpoints** (Group F of Phase 9): the only voice surface
  exposed to Flutter; never proxies or forwards a provider credential.
- **Flutter AI Teacher Voice UI** (Group G): implemented to call backend
  endpoints only; code review must confirm no STT/TTS/AI provider SDK,
  API key, or provider base URL is present in client code.
- **Security review** for any Phase 9 task touching configuration or
  client networking must explicitly check for provider keys in client
  code or client-visible responses.

---

## Validation

- Provider access remains backend-only for STT, TTS, and AI.
- Flutter does not call an STT, TTS, or AI provider directly.
- Provider configuration is read from safe environment/config sources.
- No provider secrets are committed.
- AI Teacher does not replace AIM Engine authority (unaffected by this
  rule; restated per Phase 9 task template).
