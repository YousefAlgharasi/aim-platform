# Phase 9 — No AIM Authority Change Rule

**Task:** P9-005
**Branch:** `phase9/P9-005-no-aim-authority-change-rule`
**Dependency:** P9-003 (Voice Mode Scope Boundaries — Done)
**Output:** `docs/phase-9/no-aim-authority-change-rule.md`

---

## Purpose

`docs/phase-9/voice-mode-charter.md` (P9-001) establishes that AIM
Engine owns learning decisions and that voice is a new input/output
modality only, not new tutoring authority. This document is the
operational counterpart for Phase 9: it lists concrete, checkable
prohibitions so that any Phase 9 implementer or reviewer can verify, at
the code level, that AI Teacher Voice Mode never replaces an AIM Engine
decision. It extends the Phase 8 no-AIM-replacement rule
(`docs/phase-8/no-aim-replacement-rule.md`) to the voice pipeline (STT
transcription, voice session orchestration, TTS synthesis).

---

## The Rule

**AI Teacher Voice Mode must never replace, recompute, or silently
override any AIM Engine decision.**

AIM Engine remains the only authority for:

- Mastery
- Level
- Weakness
- Difficulty
- Recommendations
- Review schedule
- Retention

This holds regardless of whether a tutoring turn arrives as typed text
(Phase 8) or as transcribed speech (Phase 9).

---

## Concrete Prohibited Patterns

The following implementation patterns are explicitly forbidden anywhere
in Phase 9 backend or Flutter code:

| Pattern | Why it's forbidden |
|---|---|
| STT transcript or voice-turn content is used by AI Teacher backend service to compute a mastery/level/weakness/difficulty/recommendation/review-schedule value | Duplicates AIM Engine's job; creates a second source of truth. |
| Voice session orchestration writes to any database table or column that AIM Engine treats as authoritative (e.g. mastery scores, skill levels, weakness flags, review schedule entries) | Lets voice-turn output silently overwrite AIM Engine's decisions. |
| Prompt builder asks the AI provider to "decide" or "score" a student's level/mastery/weakness from a spoken answer and that value is then persisted or displayed as authoritative | Outsources a learning decision to an unaudited AI provider call, same risk as Phase 8 but via voice input. |
| Flutter computes or adjusts a mastery/level/weakness/difficulty/recommendation/review-schedule value locally based on a transcript or a TTS-spoken reply | Moves backend-owned authority into the client. |
| TTS output (synthesized audio) or its source text is fed back into AIM Engine's calculation pipeline as if it were a new learning signal outside the existing AIM Engine inputs | Creates a feedback loop where AI-generated voice content influences the authoritative engine instead of the other way around. |

---

## Allowed Pattern

AI Teacher Voice Mode may **read** AIM Engine's existing,
already-computed outputs as context, and explain or speak them in
natural language:

> Spoken reply: "Your current level is B1, and your AIM-identified
> weakness is past tense irregular verbs — let's practice that."

This is allowed because the level and weakness values are unchanged,
backend-approved, and only being explained/spoken — not recalculated,
exactly as in Phase 8's text mode.

---

## Review Checklist

Before any Phase 9 task (STT gateway, TTS gateway, voice session
pipeline, or Flutter voice UI) is marked Done, confirm:

- [ ] No new code path computes mastery, level, weakness, difficulty,
      recommendations, review schedule, or retention outside AIM
      Engine, whether from a transcript or from voice-session metadata.
- [ ] No voice-pipeline code writes to an AIM Engine-owned table or
      field.
- [ ] No prompt instructs the AI provider to produce an authoritative
      learning-decision value from spoken/transcribed input.
- [ ] No Flutter code derives or adjusts a learning-decision value from
      a transcript, a voice session, or a TTS-spoken reply.
- [ ] Voice-turn output (transcript, AI reply, synthesized audio
      reference) is persisted only as chat/voice-turn history, not as a
      learning-decision record.

---

## Validation

- AI Teacher Voice Mode does not replace AIM Engine authority.
- AIM Engine remains the sole owner of learning decisions.
- Flutter does not call an STT, TTS, or AI provider, or the AIM Engine,
  directly.
- No secrets are referenced or committed in this document.
