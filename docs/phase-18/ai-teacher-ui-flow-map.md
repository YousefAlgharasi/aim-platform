# Phase 18 — AI Teacher UI Flow Map

**Task:** P18-009
**Date:** 2026-06-21
**Dependency:** P18-008 (`docs/phase-18/ai-teacher-api-contract-map.md`)

## Purpose

Document the text chat, voice session, feedback, history, safety-block, and parent/admin read-only flows for AI Teacher, mapped to AIM design system components, to guide UI implementation.

## Design System Components Used

| Component | Source | Used for |
|---|---|---|
| `AIFeedbackBubble` | `components/learning/AIFeedbackBubble.jsx` | AI Teacher chat message bubble (assistant gradient styling already encodes "AI generated") |
| `RecordButton` | `components/learning/RecordButton.jsx` | Voice tutor mic control, with pulse animation respecting `prefers-reduced-motion` |
| `AlertBanner` | `components/feedback/AlertBanner.jsx` | Safety-block messages, quota-exceeded notices, offline/error states |
| `Badge` / `Chip` | `components/feedback/Badge.jsx`, `Chip.jsx` | Conversation status (active/archived/blocked), safety-flag indicators in admin view |
| `Skeleton` | `components/feedback/Skeleton.jsx` | Loading states for conversation history, message send-in-flight |
| `TopAppBar` | `components/navigation/TopAppBar.jsx` | Chat/voice screen headers, with RTL-aware back chevron |
| `Card` | `components/learning/Card.jsx` | Admin/parent summary cards (usage, safety counts) |
| `ProgressBar` / `CircularProgress` | `components/learning/*` | Quota usage indicators (e.g., daily AI minutes used) — display only, not learning progress |

## Flow 1 — Student Text Chat (Mobile)

1. **Entry**: Student opens AI Teacher from mobile nav; `TopAppBar` shows "AI Teacher" title.
2. **Empty state**: New conversation shows a friendly empty state card inviting the first question.
3. **Loading**: `Skeleton` bubbles shown while conversation history loads.
4. **Sending**: Student types and sends; their message renders immediately (optimistic), assistant reply renders in `AIFeedbackBubble` once backend responds (typing-dots animation while waiting).
5. **Safety block**: If backend returns a blocked outcome, render the fallback message in an `AlertBanner` (warning tone) instead of a normal bubble, clearly distinct from a tutoring answer.
6. **Quota exceeded**: `AlertBanner` (neutral/warning tone) explains the daily/monthly limit and when it resets; input is disabled until quota allows.
7. **Feedback**: Each assistant bubble has a thumbs up/down affordance (using existing icon-button pattern) that posts `AiFeedback`.

## Flow 2 — Student Voice Session (Mobile)

1. **Entry**: Student opens Voice Tutor; `TopAppBar` + large central `RecordButton`.
2. **Permission**: If microphone permission isn't granted, show an `AlertBanner` explaining why permission is needed before the record button activates.
3. **Recording**: `RecordButton` pulses (respecting reduced-motion) while capturing; transcript text streams in below as it's recognized.
4. **Assistant reply**: Synthesized speech plays; reply transcript renders in an `AIFeedbackBubble`-style block beneath, so voice sessions are visually consistent with text chat.
5. **Duration/cost limit reached**: Session ends gracefully with an `AlertBanner` explaining the limit; partial transcript remains visible.
6. **Safety block (voice)**: Same `AlertBanner` treatment as text; no unsafe audio is ever played.
7. **End session**: Explicit end button returns to a session summary (duration, message count) using `Card`.

## Flow 3 — Conversation/Voice History

1. List of past conversations/voice sessions as `Card` rows with status `Badge` (active/archived/blocked).
2. Tapping opens the read-only or continuable thread, reusing chat bubble components.

## Flow 4 — Safety Block / Blocked Conversation State

- A conversation marked `blocked` by an admin shows a top-level `AlertBanner` ("This conversation has been paused for review") and disables the input field, rather than silently failing.

## Flow 5 — Parent Read-Only AI Summary

1. Parent dashboard surface (web) shows a `Card` with consent-gated summary: usage (minutes/messages this period via `ProgressBar`), and safety event count (`Badge`/`Chip` for flagged/blocked counts) — never raw conversation text.
2. If consent isn't granted for this view, show an explanatory empty/forbidden state instead of an error.

## Flow 6 — Admin Prompt/Config/Usage/Safety/Audit UI

1. Table views (existing admin table pattern from Phase 17 Operations admin pages) list `AiPromptTemplate`, `AiModelConfig`, `AiSafetyCheck` events, `AiUsageCostEvent` aggregates, and `AiAuditLogEntry` entries.
2. Model config rows never display secret values — only label/model name/tier/status `Badge`.
3. Prompt/config edit forms use existing shared form components; activate/retire actions use existing confirm-dialog pattern.
4. Safety event list supports filtering by outcome (`allowed`/`flagged`/`blocked`) using `Chip` filter controls.

## RTL / Accessibility Notes

- All chat bubbles, record button, and banners must mirror correctly under `dir="rtl"` (already handled by base components per design system).
- Mic button and send button require `ariaLabel`s (icon-only controls).
- Typing/recording indicators must respect `prefers-reduced-motion`.
- Minimum touch target 44px for record button and bubble action icons.

## Out of Scope

This map documents flow structure only; it does not implement screens. Implementation tasks (mobile chat UI, mobile voice UI, admin pages, parent summary) follow this map and `docs/phase-18/ai-teacher-design-system-rules.md` (P18-010).
