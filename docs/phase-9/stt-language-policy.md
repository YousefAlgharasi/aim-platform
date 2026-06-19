# Phase 9 — STT Language Policy

**Task:** P9-042
**Branch:** `phase9/P9-042-stt-language-policy`
**Dependency:** P9-038 (Create STT Provider Interface — Done)
**Output:** `docs/phase-9/stt-language-policy.md`

---

## Purpose

The AIM Platform's AI Teacher serves Arabic-speaking A1-level English
learners (per `docs/phase-8/system-prompt-contract.md`), so a recorded
voice turn may be spoken in Arabic, in English, or a mix of both within
the same recording. This document defines how the STT Gateway (Group E)
handles language so transcription stays predictable across both
languages, without ever turning a language choice into a client-supplied
provider setting or a learning-decision signal.

---

## Supported Languages

- The STT Gateway supports two transcription languages: **English** and
  **Arabic**.
- These are the only two languages the STT Gateway is configured to
  recognize. No other language is added without a new policy decision.

---

## How Language Is Selected

- The STT Gateway does not accept a client-supplied language parameter.
  The request shape (`docs/phase-9/audio-upload-contract.md`,
  `stt-gateway.types.ts`'s `SttProviderRequest`) carries no `language`
  field — Flutter never chooses or sends a language code.
- Language handling is one of two backend-controlled modes, selected by
  backend configuration (not per-request):
  1. **Auto-detect** — the STT provider's own language identification is
     used when the configured provider supports it; the STT Gateway
     passes no language hint, and the provider returns whichever of the
     two supported languages it detects.
  2. **Fixed-language fallback** — if the configured provider does not
     support auto-detection, the STT Gateway defaults to English unless
     a backend-configured default language code (one of the two
     supported languages, never client-supplied) is set.
- Whichever mode is active, the choice is made once, in backend
  configuration/code, never per-request from client input.

---

## What the STT Gateway Must Never Do for Language

| Prohibited behavior | Reason |
|---|---|
| Accepting a `language` field from the client request | Flutter must not influence provider behavior directly (`docs/phase-9/no-client-provider-rule.md`); language is a backend-controlled setting, not a per-request client choice. |
| Rejecting or failing a recording solely because it is in Arabic instead of English (or vice versa) | Both languages are equally supported; language is not a validation criterion (audio format/size/duration validation, per `docs/phase-9/voice-error-policy.md`, is unrelated and unaffected). |
| Using detected/configured language to compute or influence mastery, level, weakness, difficulty, recommendation, or review schedule | Language is a transcription input, never a learning-decision signal (`docs/phase-9/no-aim-authority-change-rule.md`). |
| Adding a third language without updating this policy | Keeps the supported-language set explicit and auditable rather than implicitly expanding via provider defaults. |

---

## Transcript Output Is Language-Agnostic

- Regardless of which supported language was spoken or detected, the STT
  Gateway's output shape is unchanged: only `transcript` (plain UTF-8
  text) and `durationMs`, per `docs/phase-9/stt-output-contract.md`. No
  `language` or `detectedLanguage` field is added to that contract by
  this policy — language detection, if used, stays an internal
  implementation detail of the STT Gateway and is not exposed to Voice
  Session Orchestration, Voice Persistence, or the client.
- An Arabic transcript flows through input safety filtering, the Context
  Builder, and the Prompt Builder exactly like an English transcript —
  no special-casing by language anywhere downstream of the STT Gateway.
- Arabic transcripts must render correctly under the existing RTL-aware
  history view referenced by `docs/phase-9/stt-output-contract.md`'s
  Predictability Rules (no embedded directionality control characters,
  no HTML/script content).

---

## Why This Matters

The AIM Platform's target learners write and speak Arabic alongside the
English they are learning, so a voice turn recorded in either language is
an expected, ordinary input rather than an edge case. Treating language
as a backend-controlled transcription setting — never a client-supplied
parameter, never a validation gate, never a learning-decision signal —
keeps the STT Gateway predictable for both languages while preserving
every existing Phase 9 boundary (no client provider control, no AIM
authority change, no provider-detail leak).

---

## Validation

- Exactly two supported languages (English, Arabic) are defined, with no
  client-supplied language parameter.
- Language is never used to compute or substitute a learning-decision
  value.
- The STT output contract (`docs/phase-9/stt-output-contract.md`) is
  unchanged by this policy — no new field is added.
- AI Teacher Voice Mode does not replace AIM Engine authority.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets are referenced or committed in this document.
