# Phase 8 — AI Teacher Privacy Review

**Task:** P8-097
**Branch:** `phase8/P8-097-ai-teacher-privacy-review`
**Date:** 2026-06-19
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P8-096 — Done

---

## Scope

Privacy review of the AI Teacher feature across the backend
(`services/backend-api/src/features/ai-teacher/`) and the Flutter mobile
client (`apps/mobile/lib/features/ai_teacher/`), covering safe context
construction, chat storage, the exact payload sent to the AI provider, and
whether any persisted logs capture sensitive content. This review is
distinct from, and builds on, the P8-096 security review (auth, permissions,
secrets, provider boundary, console logging) — it does not repeat that
work.

## Method

Manual source review of the context/prompt builders, chat persistence
repositories and migrations, the provider request mapper/gateway client,
and the structured logger/audit-log tables in the AI Teacher feature.

## Findings

### 1. Safe context — pass

Context sent to the AI provider is assembled from backend-approved adapters
that expose only safe, minimal fields:

- Student Profile adapter — `displayName`, `preferredLanguage`, `timezone` only.
- Current Lesson adapter — `lessonId`, `title`, `description` only.
- Recent Mistakes adapter — `skillId`, `patternType`, `patternCode`, `occurrenceCount` only.
- Other context sections (curriculum, placement results, weakness patterns, recommendations) follow the same pattern: scoped, non-identifying fields only.

`context-builder.service.ts` explicitly excludes mastery/level/weakness/
recommendation/review-schedule values, and the student's message text is
safety-filtered before inclusion. No `studentId`, email, real name, other
students' data, or raw database rows are ever included in the assembled
context.

### 2. Chat storage — pass

- `ai_chat_messages` stores only the safety-filtered student message text and AI reply text, with a foreign key to `ai_chat_sessions(id)` and a denormalized `student_id` for ownership enforcement. No provider request/response payloads or raw context are stored in this table.
- `ai_context_snapshots` stores the assembled context as JSONB for audit purposes only; it is never returned to the client.
- Both tables are scoped per-student via FK constraints back to `ai_chat_sessions(student_id)` — cross-student data cannot be co-mingled or leaked through these tables.
- Storing message text itself is necessary for conversation history and is not excessive; no provider-internal data is persisted alongside it.

### 3. Provider payloads — pass

The exact request body sent to the AI provider gateway is:

```json
{
  "model": "<from config>",
  "messages": [
    { "role": "system", "content": "<fixed instructions>" },
    { "role": "user", "content": "[context sections]\n\nStudent: <message>" }
  ]
}
```

- No `studentId`, `sessionId`, email, name, or phone number is included anywhere in the request body.
- The provider API key is attached out-of-band as an `Authorization` header by the gateway HTTP client, never embedded in the body.
- The payload is opaque with respect to student identity — a provider-side observer could not associate the request with a specific student account from its contents.

### 4. Logs (privacy angle) — pass

Beyond the console-logging check already done in P8-096, persisted
audit/log tables were checked specifically for sensitive content:

- `ai_provider_logs` stores only `provider`, `model`, `status`, `error_category`, and `latencyMs` — no prompt text, provider response body, or PII.
- `ai_safety_events` records only the filter decision (`allowed`/`rejected`) and a reason category (e.g. `UNSAFE_CONTENT`, `SECRET_LEAK`) — never the rejected text itself.
- Structured logger calls in the context builder, prompt builder, and orchestrator log only session IDs and operational metadata (token counts, latency) — never message text, context payloads, or student identifiers.
- No analytics/telemetry/tracking calls exist anywhere in the AI Teacher feature directory.

## Result

No privacy issues were found. Context sent to the AI provider is minimal
and non-identifying, chat storage is properly scoped per student without
excess data, the provider payload contains no student-identifying
information, and all persisted logs/audit tables capture only operational
metadata rather than message content or PII.

## Limitations

This is a manual source-code and schema review, not a live data audit; no
production database was inspected and no automated privacy/PII-scanning
tool was run. No Flutter/Dart or Node test runner was executed in this
environment — existing automated coverage for the reviewed services is
inherited from prior tasks and was not re-run here.
