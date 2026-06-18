# Phase 8 — AI Teacher Scope Boundaries

**Task:** P8-003
**Branch:** `phase8/P8-003-ai-teacher-scope-boundaries`
**Dependency:** P8-001 (Phase 8 AI Teacher Text Mode Charter — Done)
**Output:** `docs/phase-8/ai-teacher-scope-boundaries.md`

---

## Purpose

This document defines, in detail, what Phase 8 includes and excludes.
It exists to prevent Phase 8 from drifting into voice features,
payments, additional dashboards, or AIM Engine authority replacement.
It refines the scope already locked in
`docs/phase-8/ai-teacher-text-charter.md`.

Phase 8 is **AI Teacher Text Mode only**.

Phase 8 depends on:

- **Phase 6** — Student Mobile App MVP (Flutter client, AIM Mobile
  Design System, mobile theming, RTL/Arabic support).
- **Phase 5** — AIM Engine backend outputs (mastery, level, weakness,
  difficulty, recommendations, review schedule, retention).

---

## Included Scope

### Backend

- AI Teacher module living entirely on the backend (NestJS), with no
  AIM Engine logic duplicated inside it.
- Backend-only AI provider gateway: a single backend-owned integration
  point that talks to the configured AI provider. No other backend
  module or client calls a provider directly.
- Context builder: assembles backend-approved learning context (current
  lesson, recent mistakes, weaknesses, level, recommendations) strictly
  from existing AIM Engine and curriculum outputs — read-only, no new
  calculations.
- Prompt builder: constructs safe, bounded prompts from the
  backend-approved context plus the student's message.
- Safety filtering: validates/filters both the student's input and the
  AI's output before it is persisted or returned.
- Chat persistence: storing AI Teacher conversations (messages, context
  snapshots, timestamps) in the database.
- AI Teacher REST API endpoints for the Flutter app to send messages and
  read chat history.

### Flutter (Mobile)

- AI Teacher text chat UI: message list, input box, send action, loading
  and error states.
- Built entirely on the AIM Mobile Design System and existing mobile
  theme/widgets (colors, typography, spacing, radius, buttons, cards,
  inputs, chat bubbles, navigation).
- RTL/Arabic-correct rendering of chat bubbles, input direction, and
  navigation.
- Calls only backend AI Teacher REST API endpoints. No direct provider
  access, no learning calculations.

---

## Excluded Scope

The following are explicitly out of scope for Phase 8 and must not be
implemented under any Phase 8 task:

| Excluded item | Reason |
|---|---|
| Voice AI | Phase 8 is text-only. |
| Speech-to-text | Phase 8 is text-only. |
| Text-to-speech | Phase 8 is text-only. |
| Realtime voice | Phase 8 is text-only. |
| Payments | Not part of AI Teacher Text Mode. |
| Parent dashboard | Separate, later phase/feature. |
| Admin dashboard | Separate, later phase/feature. |
| Student Web App | Deferred; mobile-only client for Phase 8. |
| AIM Engine replacement logic | Mastery, level, weakness, difficulty, recommendations, and review schedule must remain AIM Engine's responsibility — never recomputed in AI Teacher or Flutter. |
| Direct Flutter calls to any AI provider | All AI provider access must go through the backend-only AI Provider Gateway. |
| Prompt management dashboard | Not part of Phase 8 deliverables. |
| Cost-control dashboard | Not part of Phase 8 deliverables. |

---

## Authority and Security Boundaries

- AI Teacher does not replace AIM Engine. AIM Engine remains the sole
  authority for mastery, level, weakness, difficulty, recommendations,
  review schedule, and retention. AI Teacher only explains, guides,
  hints, and tutors using backend-approved context.
- No AI provider is called directly from Flutter; all provider access is
  backend-only, behind the AI Provider Gateway.
- No secrets, AI provider API keys, Supabase service-role keys, database
  credentials, or production tokens are referenced or committed in any
  Phase 8 document or code.

---

## Validation

- Phase 8 is documented as AI Teacher Text Mode only.
- Included and excluded scope are listed clearly above.
- Phase 8 depends on Phase 6 (mobile MVP) and Phase 5 (AIM backend
  outputs).
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
