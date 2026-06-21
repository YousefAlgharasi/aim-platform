# Phase 8 — No AIM Replacement Rule

**Task:** P8-006
**Branch:** `phase8/P8-006-no-aim-replacement-rule`
**Dependency:** P8-004 (AI Teacher Authority Rule — Done)
**Output:** `docs/phase-8/no-aim-replacement-rule.md`

---

## Purpose

`docs/phase-8/ai-teacher-authority-rule.md` (P8-004) establishes that
AIM Engine owns learning decisions and AI Teacher is advisory-only. This
document is the operational counterpart: it lists concrete, checkable
prohibitions so that any Phase 8 implementer or reviewer can verify, at
the code level, that AI Teacher never replaces an AIM Engine decision.

---

## The Rule

**AI Teacher must never replace, recompute, or silently override any
AIM Engine decision.**

AIM Engine remains the only authority for:

- Mastery
- Level
- Weakness
- Difficulty
- Recommendations
- Review schedule
- Retention

---

## Concrete Prohibited Patterns

The following implementation patterns are explicitly forbidden anywhere
in Phase 8 backend or Flutter code:

| Pattern | Why it's forbidden |
|---|---|
| AI Teacher backend service computes a mastery/level/weakness/difficulty/recommendation/review-schedule value from raw attempt or answer data | Duplicates AIM Engine's job; creates a second source of truth. |
| AI Teacher writes to any database table or column that AIM Engine treats as authoritative (e.g. mastery scores, skill levels, weakness flags, review schedule entries) | Lets AI output silently overwrite AIM Engine's decisions. |
| Prompt builder asks the AI provider to "decide" or "score" a student's level/mastery/weakness and that value is then persisted or displayed as authoritative | Outsources a learning decision to an unaudited AI provider call. |
| Flutter computes or adjusts a mastery/level/weakness/difficulty/recommendation/review-schedule value locally based on AI Teacher chat content | Moves backend-owned authority into the client. |
| AI Teacher response is used as an input to AIM Engine's calculation pipeline | Creates a feedback loop where AI text influences the authoritative engine instead of the other way around. |

---

## Allowed Pattern

AI Teacher may **read** AIM Engine's existing, already-computed outputs
as context, and explain them in natural language:

> "Your current level is B1, and your AIM-identified weakness is past
> tense irregular verbs — let's practice that."

This is allowed because the level and weakness values are unchanged,
backend-approved, and only being explained — not recalculated.

---

## Review Checklist

Before any Phase 8 task (backend, context/prompt builder, or Flutter UI)
is marked Done, confirm:

- [ ] No new code path computes mastery, level, weakness, difficulty,
      recommendations, review schedule, or retention outside AIM
      Engine.
- [ ] No AI Teacher code writes to an AIM Engine-owned table or field.
- [ ] No prompt instructs the AI provider to produce an authoritative
      learning-decision value.
- [ ] No Flutter code derives or adjusts a learning-decision value from
      AI Teacher chat content.
- [ ] AI Teacher output is persisted only as chat history, not as a
      learning-decision record.

---

## Validation

- AI Teacher does not replace AIM Engine authority.
- AIM Engine remains the sole owner of learning decisions.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
