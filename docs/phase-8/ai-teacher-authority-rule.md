# Phase 8 — AI Teacher Authority Rule

**Task:** P8-004
**Branch:** `phase8/P8-004-ai-teacher-authority-rule`
**Dependency:** P8-003 (AI Teacher Scope and Out-of-Scope — Done)
**Output:** `docs/phase-8/ai-teacher-authority-rule.md`

---

## Purpose

This document makes explicit, in one place, the authority boundary
between AIM Engine and AI Teacher. It exists so that no Phase 8 task —
backend, prompt/context, or Flutter — accidentally lets AI Teacher own,
recompute, or override a learning decision that belongs to AIM Engine.

---

## Core Rule

**AIM Engine owns learning decisions. AI Teacher explains them.**

AI Teacher does not replace AIM Engine, does not run instead of AIM
Engine, and does not produce a second, competing answer for anything
AIM Engine already decides.

---

## AIM Engine Owns (Authoritative)

AIM Engine is the sole source of truth for:

- Mastery calculation
- Level placement
- Weakness detection
- Difficulty selection
- Recommendations
- Review scheduling
- Retention tracking

These values are computed exclusively by AIM Engine. AI Teacher and
Flutter both consume them as **read-only, backend-approved context** —
neither may calculate, estimate, or "correct" them.

---

## AI Teacher May Do (Advisory Only)

Within the boundaries of backend-approved context, AI Teacher may:

- Explain a concept, rule, or piece of content to the student.
- Guide a student through a problem step by step.
- Give hints without revealing AIM-authoritative scoring.
- Tutor and answer learning questions the student asks.

AI Teacher's responses are advisory text shown to the student. They are
never written back into AIM Engine's mastery, level, weakness,
difficulty, recommendation, or review-schedule data, and they never
silently change what AIM Engine has already decided.

---

## AI Teacher May Not Do

- Compute or re-compute mastery, level, weakness, difficulty,
  recommendations, or review schedule.
- Override, contradict-and-replace, or "correct" an AIM Engine output
  inside the same response flow (it may acknowledge AIM Engine's output
  when explaining it, but must not present its own competing value).
- Make a placement, promotion, or remediation decision on behalf of AIM
  Engine.
- Persist any AI-generated value into a field that AIM Engine treats as
  authoritative.

---

## Why This Matters

If AI Teacher were allowed to compute or override learning decisions,
the platform would have two competing sources of truth for the
student's progress, which breaks consistency, auditability, and the
guarantees the rest of the system (mobile UI, recommendations, review
scheduling) depends on. Keeping AI Teacher strictly advisory preserves a
single authority for learning decisions: AIM Engine.

---

## Enforcement Points

- **Context Builder** (Group D): only reads existing AIM Engine /
  curriculum outputs; never derives new learning-decision values.
- **Prompt Builder** (Group E): instructs the AI provider to explain,
  guide, hint, and tutor — never to invent or assert a different
  mastery/level/weakness/difficulty/recommendation/review-schedule
  value.
- **AI Teacher Backend Pipeline** (Group G): does not write AI output
  into AIM Engine-owned tables/fields.
- **AI Teacher API Endpoints** (Group H): expose chat only; never expose
  an endpoint that lets AI Teacher set or change AIM Engine values.
- **Flutter AI Teacher Chat UI** (Group I): renders AI Teacher messages
  as advisory chat content; continues to render AIM Engine outputs
  (mastery, level, weakness, recommendations, review schedule)
  elsewhere in the app exactly as already implemented in Phase 6 — AI
  Teacher does not replace those screens.

---

## Validation

- AIM Engine is documented as the sole owner of learning decisions.
- AI Teacher's role is documented as explain/guide/hint/tutor only.
- No Phase 8 component may calculate or override mastery, level,
  weakness, difficulty, recommendations, or review schedule.
- No AI provider is called directly from Flutter.
- No secrets are referenced or committed in this document.
