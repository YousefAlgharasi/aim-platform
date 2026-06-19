# Phase 9 — STT Confidence Policy

**Task:** P9-043
**Branch:** `phase9/P9-043-stt-confidence-policy`
**Dependency:** P9-041 (Create STT Response Mapper — Done)
**Output:** `Low-confidence transcript handling`

---

## Purpose

Some STT providers report a per-transcription confidence score alongside
the transcribed text. A very low score usually means the provider
guessed at unclear or noisy audio rather than reliably transcribing real
speech. This document defines how the STT Gateway (Group E) handles that
case, implemented in `stt-confidence-policy.service.ts` and
`stt-confidence-policy.constants.ts`.

---

## Policy

- If the configured STT provider reports a confidence score, the STT
  Gateway compares it against `STT_LOW_CONFIDENCE_THRESHOLD` (currently
  `0.4`) after `SttResponseMapperService` (P9-041) has already mapped the
  raw provider response into the internal `SttProviderResponse` shape.
- A score **below** the threshold downgrades an otherwise-`success`
  response to the same `error` shape used for any other STT provider
  failure (`errorCategory: 'STT_LOW_CONFIDENCE'`), per the "STT provider
  failure" category in `docs/phase-9/voice-error-policy.md`. The
  transcript is discarded (`transcript: null`), never passed downstream
  as if it were reliable speech.
- A score at or above the threshold, or a provider that does not report
  confidence at all (`rawConfidence === null`), leaves the mapped
  response unchanged.
- The raw confidence value never appears in `SttProviderResponse`
  (`stt-gateway.types.ts`) — it is consumed only inside this policy step,
  consistent with the excluded-fields table in
  `docs/phase-9/stt-output-contract.md`, which keeps per-provider
  confidence metadata out of the STT output contract entirely.

---

## What This Policy Must Never Do

| Prohibited behavior | Reason |
|---|---|
| Adding a `confidenceScore` field to `SttProviderResponse` | The contract is fixed by `docs/phase-9/stt-output-contract.md`; confidence stays an internal gateway concern. |
| Using confidence to compute or influence mastery, level, weakness, difficulty, recommendation, or review schedule | Confidence is a transcription-quality signal, never a learning-decision signal (`docs/phase-9/no-aim-authority-change-rule.md`). |
| Silently passing through a low-confidence transcript as real speech | Would let unreliable, possibly-fabricated text reach the AI provider prompt as if the student said it. |
| Exposing the raw confidence value, or the threshold, to the client | The client-facing error for a low-confidence rejection is the same generic STT-failure message as any other STT provider failure (`docs/phase-9/voice-error-policy.md`); no internal score or threshold is ever returned. |

---

## Why This Matters

Treating a low-confidence transcript as a failure — rather than feeding a
likely-wrong guess into the AI Teacher pipeline — protects the rest of
the voice pipeline (input safety filtering, Context Builder, Prompt
Builder, AI Provider Gateway) from acting on text the STT provider itself
was unsure about, while keeping the confidence signal entirely internal
to the STT Gateway.

---

## Validation

- A defined, internal confidence threshold downgrades low-confidence
  transcripts to a safe `error` outcome instead of passing them through.
- No new field is added to the STT output contract.
- Confidence is never used to compute or substitute a learning-decision
  value.
- AI Teacher Voice Mode does not replace AIM Engine authority.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets are referenced or committed in this document.
