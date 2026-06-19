# Phase 8 — AI Teacher Security Review

**Task:** P8-096
**Branch:** `phase8/P8-096-ai-teacher-security-review`
**Date:** 2026-06-19
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P8-078, P8-095 — both Done

---

## Scope

Security review of the AI Teacher feature across the backend
(`services/backend-api/src/features/ai-teacher/`) and the Flutter mobile
client (`apps/mobile/lib/features/ai_teacher/`), covering auth, permissions,
secrets, AI provider boundaries, and logging.

## Method

Manual source review of every AI Teacher controller, service, and guard on
the backend, plus the Flutter remote datasource, cross-checked against the
existing `docs/quality/phase-8-no-direct-ai-provider-check.md` and
`docs/quality/phase-8-ai-chat-rtl-arabic-check.md` audits. `grep` across both
feature directories for secret/key patterns and logging statements.

## Findings

### 1. Auth — pass

Every AI Teacher controller is guarded and resolves the student identity
from the verified JWT, never from client input:

- `chat-session-start.controller.ts` — `@UseGuards(SupabaseJwtAuthGuard, RoleGuard)` + `@RequireRoles(AuthorizedRole.STUDENT)`; studentId from `@CurrentUser()`; request body is type-cast as `unknown` so a client-supplied `studentId` field cannot be trusted.
- `chat-session-list-read.controller.ts` — same guard stack; studentId from JWT.
- `chat-history-read.controller.ts` — same guard stack; studentId from JWT; `sessionId` validated server-side before use.
- `chat-message-submit.controller.ts` — same guard stack; studentId from JWT; session ownership/context verified before accepting a message.
- `ai-teacher-feedback-submit.controller.ts` — same guard stack; studentId from JWT.

No endpoint accepts `studentId` from a request body or query parameter.

### 2. Permissions — pass

Session/message ownership is checked server-side on every read/write path:

- `chat-history-read` — loads the session and verifies `session.student_id === user.id` before returning history.
- `chat-message-submit.controller.ts` — explicit check: `session.student_id !== user.id` → `NOT_FOUND`, preventing a student from posting into another student's session.
- `ai-teacher-feedback-submit.service.ts` — verifies `message.student_id !== studentId` is rejected, and confirms the target message is an AI Teacher reply (not the student's own message) before accepting feedback.

No IDOR path was found: cross-student `sessionId`/`messageId` access returns
`404`, not the other student's data.

### 3. Secrets — pass

- `ai-teacher.service.ts` loads the provider key exclusively via `ConfigService.get('AI_PROVIDER_API_KEY')` — an environment variable, never a hardcoded literal.
- `provider-gateway-no-secret-check.service.ts` is a startup guard that rejects placeholder key values (`changeme`, `your_api_key`, etc.), preventing accidental deployment with a dummy/missing key.
- `grep` across `services/backend-api/src/features/ai-teacher/` and `apps/mobile/lib/features/ai_teacher/` for hardcoded keys, `sk-` patterns, `service_role`, and provider credentials returned no matches.

### 4. Provider boundary — pass

- All AI provider calls flow exclusively through `AI_PROVIDER_GATEWAY` inside `orchestrator/ai-teacher-orchestrator.service.ts`; no controller or other service calls a provider directly.
- `provider-gateway-logging.service.ts` logs only metadata (provider name, model, status, latency) — never prompt text or credentials.
- On the Flutter side, `ai_teacher_remote_datasource_impl.dart` routes every network call through `BackendApiClient` against backend-only paths; no AI provider SDK or endpoint is referenced. This reconfirms the dedicated P8-094 audit (`docs/quality/phase-8-no-direct-ai-provider-check.md`) — re-audited here only at a high level, not repeated in full.

### 5. Logs — pass

- `prompt-builder.service.ts`, `context-builder.service.ts`, and `context-budget-policy.service.ts` log only session IDs and token counts — never prompt/message text.
- `orchestrator/ai-teacher-orchestrator.service.ts` logs only the session ID.
- `provider-gateway-logging.service.ts` logs only latency/error metadata.
- No `console.log` calls exist anywhere in AI Teacher source (non-test) files.
- No bearer tokens, full prompts, or student PII are logged anywhere in the feature.

## Result

No security issues were found across auth, permissions, secrets, AI
provider boundary, or logging for the AI Teacher feature. All five areas
pass:

- Every endpoint is JWT-guarded and role-restricted; studentId is always
  server-derived.
- Session/message ownership is enforced server-side; no IDOR path exists.
- No hardcoded secrets/keys; provider key loaded from environment with a
  startup placeholder-value guard.
- AI provider access is confined to a single backend gateway service;
  Flutter never calls a provider directly.
- No sensitive data (tokens, full prompts, PII) is logged.

## Limitations

No automated security scanner (e.g. Semgrep, dependency audit) was run in
this environment; this review is a manual source-code audit of the
controllers, guards, and services listed above plus targeted `grep`
searches, not an automated SAST/dependency-vulnerability scan. No
Flutter/Dart or Node test runner was executed; existing automated test
coverage for these guards/ownership checks is inherited from prior tasks
(P8-076 and others) and was not re-run here.
