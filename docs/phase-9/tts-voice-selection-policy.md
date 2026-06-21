# Phase 9 — TTS Voice Selection Policy

**Task:** P9-062
**Branch:** `phase9/P9-062-tts-voice-selection-policy`
**Dependency:** P9-058 (Create TTS Provider Interface — Done)
**Output:** `docs/phase-9/tts-voice-selection-policy.md`

---

## Purpose

The AIM Platform's AI Teacher serves Arabic-speaking A1-level English
learners (per `docs/phase-8/system-prompt-contract.md`), so the AI
Teacher's synthesized reply may be in English, Arabic, or a mix of both
within a single turn. This document defines how the TTS Gateway (Group G)
handles voice selection and language so synthesis stays predictable across
both languages, without ever turning a voice or language choice into a
client-supplied provider setting or a learning-decision signal.

---

## Supported Languages

- The TTS Gateway supports two synthesis languages: **English** and
  **Arabic**.
- These are the only two languages the TTS Gateway is configured to
  synthesize. No other language is added without a new policy decision.

---

## How Voice and Language Are Selected

- The TTS Gateway does not accept a client-supplied voice parameter.
  The request shape (`tts-gateway.types.ts`'s `TtsProviderRequest`)
  carries a `languageCode` field set by the backend (from the AI
  Teacher reply context), never by Flutter directly.
- Voice selection is one of two backend-controlled modes, selected by
  backend configuration (not per-request from client input):
  1. **Provider-default voice** — the TTS provider's default voice for
     the given language code is used when no explicit voice ID is
     configured; the TTS Gateway passes only the language code, and the
     provider selects the appropriate voice.
  2. **Configured voice override** — if a backend-configured voice ID
     is set (per language, via environment/config), the TTS Gateway
     passes that voice ID to the provider, overriding the provider's
     default selection.
- Whichever mode is active, the choice is made once, in backend
  configuration/code, never per-request from client input.
- The `languageCode` in `TtsProviderRequest` is set by the backend
  service that calls the TTS Gateway (e.g., Voice Session
  Orchestration), based on the AI Teacher reply language — it is never
  forwarded from a Flutter request parameter.

---

## What the TTS Gateway Must Never Do for Voice/Language

| Prohibited behavior | Reason |
|---|---|
| Accepting a `voiceId` or `voice` field from the client request | Flutter must not influence provider behavior directly (`docs/phase-9/no-client-provider-rule.md`); voice selection is a backend-controlled setting, not a per-request client choice. |
| Rejecting or failing a synthesis request solely because the text is in Arabic instead of English (or vice versa) | Both languages are equally supported; language is not a validation criterion. |
| Using language or voice to compute or influence mastery, level, weakness, difficulty, recommendation, or review schedule | Voice/language is a synthesis input, never a learning-decision signal (`docs/phase-9/no-aim-authority-change-rule.md`). |
| Exposing the provider voice ID, voice name, or voice metadata in `TtsProviderResponse` | Provider details stay inside the TTS Gateway (`docs/phase-9/no-client-provider-rule.md`); only `audioRef`, `durationMs`, and `contentType` cross the boundary (`docs/phase-9/tts-output-contract.md`). |
| Adding a third language without updating this policy | Keeps the supported-language set explicit and auditable rather than implicitly expanding via provider defaults. |

---

## Audio Output Is Voice-Agnostic

- Regardless of which voice or language was used, the TTS Gateway's
  output shape is unchanged: only `audioRef`, `durationMs`, and
  `contentType`, per `docs/phase-9/tts-output-contract.md`. No `voice`,
  `voiceId`, or `detectedLanguage` field is added to that contract by
  this policy — voice selection stays an internal implementation detail
  of the TTS Gateway and is not exposed to Voice Session Orchestration,
  Voice Persistence, or the client.
- An Arabic synthesis flows through the same output path as an English
  synthesis — no special-casing by language anywhere downstream of the
  TTS Gateway.

---

## Why This Matters

The AIM Platform's target learners interact in Arabic alongside the
English they are learning, so the AI Teacher may reply in either language
depending on context. Treating voice and language as backend-controlled
synthesis settings — never client-supplied parameters, never validation
gates, never learning-decision signals — keeps the TTS Gateway
predictable for both languages while preserving every existing Phase 9
boundary (no client provider control, no AIM authority change, no
provider-detail leak).

---

## Validation

- Exactly two supported languages (English, Arabic) are defined, with no
  client-supplied voice parameter.
- Voice/language is never used to compute or substitute a
  learning-decision value.
- The TTS output contract (`docs/phase-9/tts-output-contract.md`) is
  unchanged by this policy — no new field is added.
- AI Teacher Voice Mode does not replace AIM Engine authority.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets are referenced or committed in this document.
