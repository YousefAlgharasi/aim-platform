# Phase 8 — AI Teacher Text Mode Charter

**Task:** P8-001
**Branch:** `phase8/P8-001-ai-teacher-text-charter`
**Dependency:** P6-130 (Phase 6 Final Review and Handoff) — Done
**Status:** Locked

---

## Purpose

This charter locks the scope of Phase 8 as **AI Teacher Text Mode**: a
backend-driven, text-only AI tutoring feature layered on top of the
existing AIM Engine and Phase 6 Student Mobile App. It defines what is
in scope, what is explicitly excluded, and the authority boundaries that
all Phase 8 work must respect.

Phase 8 depends on:

- **Phase 5** — AIM Engine backend outputs (mastery, level, weakness,
  difficulty, recommendations, review schedule, retention) being
  available, stable, and read-only.
- **Phase 6** — Student Mobile App MVP being complete, including the
  AIM Mobile Design System, mobile theming, and RTL/Arabic support.

---

## Authority Rule

**AI Teacher does not replace AIM Engine.**

AIM Engine remains the sole authority for:

- Mastery calculation
- Level placement
- Weakness detection
- Difficulty selection
- Recommendations
- Review scheduling
- Retention tracking
- Any other learning decision

AI Teacher's role is strictly limited to:

- Explaining concepts
- Guiding students through problems
- Giving hints
- Tutoring/answering learning questions

All AI Teacher responses are generated using **backend-approved context**
derived from AIM Engine outputs. AI Teacher never computes, overrides, or
second-guesses AIM Engine decisions.

---

## In Scope (Phase 8)

- Backend AI Teacher module (server-side only)
- Backend-only AI provider gateway (no direct client access to any AI
  provider)
- Backend context builder that assembles backend-approved learning
  context (current lesson, recent mistakes, weaknesses, etc.) for prompts
- Prompt builder with safety filtering on both input and AI output
- Chat persistence (storing AI Teacher conversations)
- AI Teacher REST APIs for the Flutter app to consume
- Flutter AI Teacher **text** chat UI, built on the AIM Mobile Design
  System and existing mobile theme/widgets

---

## Out of Scope (Phase 8)

The following are explicitly excluded from Phase 8 and must not be
implemented as part of any Phase 8 task:

- Voice AI
- Speech-to-text
- Text-to-speech
- Realtime voice
- Payments
- Parent dashboard
- Admin dashboard
- Student Web App
- AIM Engine replacement logic (mastery/level/weakness/difficulty/
  recommendation/review-schedule/retention calculations inside AI
  Teacher or Flutter)
- Direct Flutter calls to any AI provider
- Prompt management dashboard
- Cost-control dashboard

---

## UI Rule

All Phase 8 Flutter UI work must:

- Use the AIM Mobile Design System (from the `design-system` branch) and
  existing mobile theme/widgets for colors, typography, spacing, radius,
  buttons, cards, inputs, loading states, error states, chat bubbles, and
  navigation.
- Never hard-code one-off colors, spacing, typography, buttons, cards, or
  styles.
- Respect RTL/Arabic behavior: text direction, alignment, icon direction,
  layout direction, spacing, and chat bubble orientation must all be
  verified for Arabic/RTL locales.

---

## Security Rule

No Phase 8 task may expose:

- AI provider API keys
- Supabase service-role keys
- Database credentials
- Production tokens or other secrets

All AI provider access is backend-only, gated behind the AI Provider
Gateway (Group F).

---

## Phase 8 Task Groups

| Group | Focus |
|---|---|
| Group A | Phase 8 Control & Scope |
| Group B | AI Teacher Architecture |
| Group C | Database & Persistence |
| Group D | Context Builder |
| Group E | Prompt Builder & Safety |
| Group F | AI Provider Gateway |
| Group G | AI Teacher Backend Pipeline |
| Group H | AI Teacher API Endpoints |
| Group I | Flutter AI Teacher Chat UI |

---

## Validation

- Phase 8 is documented as AI Teacher Text Mode only.
- Included and excluded scope are listed clearly above.
- Phase 8 depends on Phase 6 (mobile MVP) and Phase 5 (AIM backend
  outputs).
- AIM Engine authority is preserved; AI Teacher does not calculate
  learning decisions.
- No AI provider is called directly from Flutter.
- No secrets are referenced or committed in this document.
