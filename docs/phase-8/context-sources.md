# Phase 8 — AI Teacher Context Sources

**Task:** P8-012
**Branch:** `phase8/P8-012-ai-teacher-context-sources`
**Dependency:** P5-086 (Phase 5 Final Review — Done), P6-130 (Phase 6 Final Review — Done)
**Output:** `docs/phase-8/context-sources.md`

---

## Purpose

This document defines exactly which backend-approved data sources the
Context Builder (Group D, see `docs/phase-8/ai-teacher-architecture.md`)
is allowed to read when assembling AI Teacher prompt context. It exists
so prompts are built only from trusted, already-computed student
learning context — never from client-submitted state or from values
the Context Builder invents itself.

---

## Approved Context Sources

The Context Builder may read the following, and only the following,
backend-owned data for the authenticated, owning student:

| Source | Owner | What it provides |
|---|---|---|
| AIM result APIs (`docs/phase-5/aim-engine-api-map.md`) | AIM Engine / backend AIM result services | Persisted student skill state, weakness records, difficulty decisions, recommendations, review schedule entries, frustration signals, session summaries. |
| Curriculum/lesson data | Backend curriculum module (`features/curriculum`, `features/lessons`) | Current lesson content, topic/skill metadata. |
| Recent attempt/mistake records | Backend AIM result/session services | Recent mistakes tied to the student's attempts, as already recorded by AIM Engine pipelines — not recomputed here. |
| Student profile (non-sensitive fields) | Backend `features/students` / `features/profile` | Display name, level placement, locale — for personalizing tone and language, not for scoring. |

All of the above are read through existing backend service/repository
calls already owned by their respective modules. The Context Builder
does not query the database directly and does not duplicate any of
these modules' read logic.

---

## Explicitly Not a Context Source

| Excluded source | Reason |
|---|---|
| Any value submitted by the Flutter client in the chat request body (e.g. a client-claimed level or mastery score) | Client-submitted learning state is never trusted; see `docs/phase-8/no-aim-replacement-rule.md`. |
| Raw, unprocessed attempt/answer data not yet processed by AIM Engine | The Context Builder reads AIM Engine's finished outputs only; it does not compute from raw data. |
| Another student's records | Ownership filtering (see below) prevents cross-student context leakage. |
| AI Teacher's own prior chat messages as a source of learning-decision context | Chat content is advisory text, not a trusted learning-decision input (`docs/phase-8/no-aim-replacement-rule.md`). |
| Any field not relevant to the current chat/lesson (e.g. another subject's full history) | Context must be filtered for relevance, not just ownership. |

---

## Ownership, Privacy, and Relevance Filtering

- **Ownership:** every read is scoped to the `studentId` resolved from
  the authenticated request's session, never from a client-supplied
  id. A context fetch is never performed for a student other than the
  one who owns the chat session.
- **Privacy:** only fields needed for tutoring context are read (e.g.
  level, weakness, current lesson). Sensitive account fields (contact
  info, billing, credentials, internal admin flags) are never included
  in AI Teacher context.
- **Relevance:** the Context Builder selects only the data relevant to
  the current lesson/topic and recent activity (e.g. current lesson,
  recent mistakes, current weaknesses) — not the student's entire
  historical record — to keep prompts bounded and on-topic.

---

## Why This Matters

If the Context Builder trusted client-submitted state or read
unfiltered/unowned data, AI Teacher could be manipulated into acting on
fabricated learning context, leak another student's data, or expose
unrelated private fields inside an AI provider prompt. Restricting
context to backend-approved, ownership-filtered, privacy-safe,
relevant sources keeps AI Teacher's explanations grounded in the same
trusted state AIM Engine already produced.

---

## Validation

- Context sources are limited to backend-approved AIM Engine and
  curriculum outputs.
- Client-submitted learning state is never trusted as context.
- Context is filtered for ownership, privacy, and relevance.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
