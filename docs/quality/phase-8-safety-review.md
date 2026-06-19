# Phase 8 — AI Teacher Safety Review

**Task:** P8-098
**Branch:** `phase8/P8-098-ai-teacher-safety-review`
**Date:** 2026-06-19
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P8-096 — Done

---

## Scope

Content-safety review of the AI Teacher feature
(`services/backend-api/src/features/ai-teacher/`), covering whether the AI
Teacher is constrained to educational-only behavior, forbidden from
diagnosis/authority overreach, falls back safely on provider failure, and
filters its own responses before they reach the student. This review is
distinct from, and builds on, P8-096 (security) and P8-097 (privacy) — it
does not repeat that work.

## Method

Manual source review of the prompt-builder constants/templates/policies,
the provider-gateway failure-handling service, the orchestrator, the
response-safety filter service, and the mobile error-state widget.

## Findings

### 1. Educational-only behavior — pass

The system prompt and safety-instruction template explicitly constrain the
AI Teacher to English-tutoring only:

- `prompt-builder.constants.ts` — base instruction: "You are the AIM Platform AI Teacher, a text-based tutor for Arabic-speaking A1-level English learners. You may explain, guide, hint, and answer learning questions using only the backend-approved context provided below."
- `safety-instruction.template.ts` — "Stay educational, safe, and non-clinical at all times... If the student asks something unrelated to English learning or outside this tutoring scope, gently redirect them back to the lesson instead of answering it."
- `tutoring-behavior.template.ts` — "Stay strictly within English-learning tutoring; do not give advice on unrelated topics."

### 2. No diagnosis / no authority overreach — pass

Two dedicated policy templates enforce this boundary in the system prompt:

- `no-diagnosis.policy.ts` (P8-049) — "You are an educational English tutor only, never a clinical, medical, or psychological professional. Never diagnose, name, label, or suggest a learning disability, developmental disorder, mental health condition, or medical condition, even if the student describes symptoms, struggles, or behavior that might resemble one... Always frame your response as educational tutoring support only, never as a diagnosis, assessment, or clinical opinion."
- `no-authority-change.policy.ts` (P8-050) — "AIM Engine is the sole owner of every learning decision: mastery, level, weakness, difficulty, recommendation, and review schedule. You must never modify, override, contradict, recalculate, or invent a different mastery, level, weakness, difficulty, recommendation, or review-schedule value than what the context already states."

### 3. Safe fallback — pass

- `provider-gateway-safe-failure.service.ts` (P8-058) — any non-success/unusable provider response is replaced with a fixed safe message before it reaches the orchestrator: `AI Provider Safe Fallback Message` constant — "AI Teacher is unavailable right now, please try again in a moment."
- `ai-teacher-orchestrator.service.ts` (P8-062) — converts any non-success provider response to the safe fallback before persistence/return; no internal error detail, stack trace, or provider error message reaches the client.
- Mobile `ai_chat_error_state.dart` (P8-089) — shows a safe, generic message on failure: "AI Teacher is temporarily unavailable. Your progress is safe, and you can try again." No backend/provider internals are surfaced in the UI.

### 4. Response filtering — pass

`response-safety-filter.service.ts` (P8-066) applies an outbound filter to
every AI reply before it is shown to the student, checking three
categories:

1. `LEARNING_AUTHORITY_VIOLATION` — pattern-matches `mastery`, `level`, `weakness(es)`, `difficulty`, `recommendation(s)`, `review[- ]?schedule` to catch the AI asserting a learning-authority value it should never compute.
2. `SECRET_LEAK` — pattern-matches provider API key formats (`sk-...`) and bearer tokens.
3. `UNSAFE_CONTENT` — pattern-matches self-harm/suicide language.

Any match replaces the reply with a fixed safe message: "AI Teacher can't
share that response, please rephrase your question." `ai-safety-event.repository.ts`
(P8-026) records only the decision and reason category — never the
rejected text itself, consistent with the no-content-logging finding from
P8-097.

**Observation (not a defect):** this filter runs on AI **output** only.
Student **input** is validated structurally (non-empty, trimmed) but is not
content-filtered before being sent to the provider as a tutoring message.
Given the system prompt's instruction to redirect off-topic/unsafe
requests rather than answer them, and that the only safety-sensitive
surface exposed to the student is the AI's own reply (which is filtered),
this is consistent with the task's "response filtering" goal and is not
flagged as an issue — noted here for completeness.

## Result

No safety issues were found. The AI Teacher is constrained to
educational-only tutoring by its system prompt, explicitly forbidden from
diagnosis and from overriding AIM Engine's learning-authority values,
falls back to a safe generic message on any provider failure without
leaking internal details, and filters its own responses for
learning-authority violations, secret leaks, and unsafe content before
they reach the student.

## Limitations

This is a manual source-code/prompt-text review, not a live red-team test
of the AI provider's actual outputs; no adversarial prompts were sent to a
live provider in this environment. No Flutter/Dart or Node test runner was
executed — existing automated coverage for the reviewed services
(prompt-builder, safety policies, response-safety filter) is inherited
from prior tasks and was not re-run here.
