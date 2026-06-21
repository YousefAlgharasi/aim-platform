# Phase 18 — AI Teacher and Voice Charter

**Task:** P18-001
**Date:** 2026-06-21

## Purpose

This charter locks the scope of Phase 18 before any implementation begins. It defines what Phase 18 builds, what it explicitly excludes, the authority boundaries between AI Teacher and the AIM Engine, the safety/privacy/cost guardrails that apply to every task in the phase, and the dependencies Phase 18 relies on from earlier phases.

## In Scope

Phase 18 delivers:

- AI Teacher conversations and messages (text-based tutoring)
- Voice tutor sessions (speech-to-text and text-to-speech)
- Backend-controlled prompt templates
- Backend-controlled model configurations
- AI safety checks (content and behavior moderation)
- AI privacy controls (retention, redaction, consent)
- AI usage and cost tracking
- Quotas and rate limits for AI usage
- AI feedback collection
- AI audit logs
- Mobile AI chat UI (student)
- Mobile voice tutor UI (student)
- Parent read-only AI safety/usage summaries, gated by consent
- Admin prompt/config/usage/safety/audit management UI
- AI security/privacy/safety/cost review documents

## Out of Scope (Exclusions)

Phase 18 does **not** build:

- New mastery, weakness, or difficulty scoring logic
- New recommendation or review-scheduling logic
- Changes to official progress, assessment results, placement results, or curriculum state
- Payment, billing, or subscription features
- General analytics platforms beyond AI usage/cost/safety metrics
- Notification systems beyond what AI safety/cost alerts require
- Any Phase 19 feature work, except explicit readiness documentation when a task calls for it

## Authority Rules

- The AIM Engine and backend remain the sole, final authority for all official learning decisions: mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, placement results, and curriculum state.
- AI Teacher is a tutoring assistant. It may explain concepts, answer learning questions, coach students, provide practice help, summarize backend-approved learning context, and generate safe tutoring responses (text and voice).
- AI Teacher must use only backend-approved context. It must never read or write directly against raw AIM internal state.
- If an AI Teacher response implies a progress or mastery change, that signal must be validated and applied (if at all) through the existing AIM authority pipeline — never written directly by the AI Teacher feature.

## Safety Boundaries

- All AI Teacher and voice tutor interactions must pass backend safety checks before a response is returned to the user.
- Unsafe, harmful, or out-of-scope content must be blocked with a safe fallback response.
- Safety checks apply equally to text and voice modalities.
- Detailed safety rules are defined in `docs/phase-18/ai-safety-policy.md` (P18-004).

## Provider Boundaries

- The backend owns all AI provider calls (text generation, STT, TTS). No client (mobile, admin, parent web) calls a provider directly.
- Provider API keys, model secrets, service-role keys, and signing keys must never be exposed to clients, logged in plaintext, or committed to the repository.
- Provider abstraction and selection rules are defined in `docs/phase-18/ai-provider-policy.md` (P18-005).

## Privacy Boundaries

- Student conversations and voice transcripts are private by default and scoped to the owning student and consented parent/guardian.
- Admins may access conversation data only through protected backend APIs and only as far as policy allows (see `docs/phase-18/ai-privacy-data-policy.md`, P18-007).
- Parents see read-only, consent-gated safety/usage summaries — not full raw conversation content unless policy explicitly allows it.

## Cost Boundaries

- Every AI provider call (text, STT, TTS) must pass a cost/quota check before the call is made.
- Budgets, quotas, rate limits, and model tiering are defined in `docs/phase-18/ai-cost-control-policy.md` (P18-006).

## Design System Boundary

- All Phase 18 UI (mobile chat, mobile voice, admin AI management, parent AI summaries) must use the approved AIM design system at `docs/design/source/aim-design-system`. No one-off styling is permitted.

## Dependencies

- **P17-082 / P17-081** — Phase 17 readiness checklist (`docs/phase-18/readiness-from-phase-17.md`), confirming the Operations module, audit pattern, and admin dashboard conventions Phase 18 builds alongside.

## Verdict

Phase 18 scope is locked to: AI Teacher, voice tutor, prompt safety, AI gateway, AI observability (usage/cost/audit), and cost controls, as enumerated above. Any task that falls outside this charter's "In Scope" list must be deferred or flagged as out of scope.
