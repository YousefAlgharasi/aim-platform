# Phase 8 — No Client AI Provider Rule

**Task:** P8-005
**Branch:** `phase8/P8-005-no-client-ai-provider-rule`
**Dependency:** P8-004 (AI Teacher Authority Rule — Done)
**Output:** `docs/phase-8/no-client-ai-provider-rule.md`

---

## Purpose

This document locks the rule that **no client may call an AI provider
directly**. All AI provider access in Phase 8 happens through a single
backend-owned gateway. This keeps provider credentials out of any
client, gives the backend full control over cost, safety filtering, and
context, and prevents an unbounded/unsafe channel from the student's
device straight to a third-party AI provider.

---

## The Rule

**Flutter (and any other client) must never call an AI provider
directly.**

This means, for every Phase 8 AI Teacher feature:

- The Flutter app never holds an AI provider API key.
- The Flutter app never constructs a request to an AI provider's API.
- The Flutter app never receives an AI provider API key, endpoint
  credential, or any other provider secret from the backend.
- The Flutter app only calls AIM Platform's own backend AI Teacher REST
  API endpoints (Group H) and renders the backend's response.

---

## Where Provider Access Lives

- All AI provider calls happen inside the **backend-only AI Provider
  Gateway** (Group F).
- The gateway is the single integration point between AIM Platform's
  backend and the configured AI provider.
- No other backend module bypasses the gateway to call a provider
  directly — every AI Teacher request flows through it.

---

## Provider Configuration Rules

- Provider configuration (API keys, base URLs, model identifiers) is
  read from safe environment/config sources on the backend
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
  approval, and chat persistence consistently, since some traffic would
  bypass it entirely.
- A compromised or modified client could send arbitrary prompts to the
  provider under the platform's account.

Keeping all provider access backend-only closes this attack surface and
keeps a single, auditable choke point for AI usage.

---

## Enforcement Points

- **AI Provider Gateway** (Group F): owns the only code path that talks
  to the AI provider.
- **AI Teacher API Endpoints** (Group H): the only AI Teacher surface
  exposed to Flutter; never proxies or forwards a provider credential.
- **Flutter AI Teacher Chat UI** (Group I): implemented to call backend
  endpoints only; code review must confirm no provider SDK, API key, or
  provider base URL is present in client code.
- **Security review** for any Phase 8 task touching configuration or
  client networking must explicitly check for provider keys in client
  code or client-visible responses.

---

## Validation

- Provider access remains backend-only.
- Flutter does not call an AI provider directly.
- Provider configuration is read from safe environment/config sources.
- No provider secrets are committed.
- AI Teacher does not replace AIM Engine authority (unaffected by this
  rule; restated per Phase 8 task template).
