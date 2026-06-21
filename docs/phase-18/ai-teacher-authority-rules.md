# Phase 18 — AI Teacher Authority Rules

**Task:** P18-003
**Date:** 2026-06-21
**Dependency:** P18-001 (`docs/phase-18/ai-teacher-voice-charter.md`)

## Purpose

Define precisely what AI Teacher can and cannot decide relative to the AIM Engine, so AI Teacher never becomes an unauthorized learning authority.

## Authority Matrix

| Decision domain | Owner | AI Teacher role |
|---|---|---|
| Mastery level | AIM Engine | None — cannot read raw mastery scores or write mastery values |
| Weakness identification | AIM Engine | None — cannot write weakness tags |
| Difficulty calibration | AIM Engine | None — cannot write difficulty values |
| Recommendations (what to study next) | AIM Engine | None — may restate backend-approved recommendations verbatim, never generate new ones |
| Review schedules | AIM Engine | None — cannot create, modify, or cancel review schedules |
| Official progress | AIM Engine | None — cannot write progress records |
| Assessment results | AIM Engine | None — cannot grade, score, or write assessment outcomes |
| Placement results | AIM Engine | None — cannot write placement decisions |
| Curriculum state | AIM Engine | None — cannot modify curriculum sequencing or content state |
| Concept explanation | AI Teacher | Full — may explain concepts freely within safety policy |
| Practice help / coaching | AI Teacher | Full — may provide hints, worked examples, encouragement |
| Summarizing backend-approved context | AI Teacher | Full — may summarize context the backend explicitly hands it |
| Tutoring conversation tone/pacing | AI Teacher | Full — within safety policy |

## Hard Rules

1. AI Teacher must never receive write access to mastery, weakness, difficulty, recommendation, review-schedule, progress, assessment-result, placement, or curriculum-state tables or services.
2. AI Teacher must never be the source of truth read by any AIM Engine decision. AIM Engine reads only from its own existing data sources.
3. Any AI Teacher output that *resembles* a recommendation or assessment of student ability is informational only and must be visually/contextually distinct from official AIM outputs in the UI (see `docs/phase-18/ai-teacher-ui-flow-map.md`, P18-009).
4. If a tutoring interaction surfaces information that could be useful as a signal (e.g., "the student seems confused about fractions"), that signal may only be logged as AI feedback/audit data — it must never be auto-applied to mastery/weakness/progress. A human or an existing, separately-authorized AIM Engine pipeline decides whether and how to use such signals.
5. Backend services implementing AI Teacher must be deployed in their own feature module, with no direct write dependency on AIM Engine's mastery/progress/assessment repositories.
6. Any contract or API exposing AI Teacher functionality must omit endpoints that mutate mastery/weakness/difficulty/recommendation/review-schedule/progress/assessment/placement/curriculum entities.

## Enforcement Points

- **Code review**: PRs touching AI Teacher backend code must be checked for any import of or write call into AIM Engine's authoritative repositories.
- **API contract review**: `docs/phase-18/ai-teacher-api-contract-map.md` (P18-008) must list only read-style context endpoints and AI Teacher's own entities — no mutation endpoints into AIM Engine domains.
- **Safety review**: Any AI-generated text suggesting progress/mastery change must be caught by safety/authority checks and either rephrased as informational or rejected before being shown to the user.

## What AI Teacher May Do (Restated)

AI Teacher may explain concepts, answer learning questions, coach students, provide practice help, summarize backend-approved learning context, generate safe tutoring responses, and support voice/text tutoring — always using backend-approved context only, and always subordinate to AIM Engine for any official learning decision.
