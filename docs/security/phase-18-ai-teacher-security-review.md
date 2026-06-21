# Phase 18 — AI Teacher Security Review

**Task:** P18-081
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Validate AI Teacher/Voice Tutor security readiness: provider secret
handling, prompt/config permissions, conversation access control, voice
data handling, safety event recording, audit/log exposure, and admin API
authorization.

## Review Scope

All AI Teacher, Voice Tutor, and Admin AI surfaces introduced in Phase 18:
1. Provider/model secrets (`services/backend-api/src/features/ai-teacher/governance/`)
2. Prompt template and model config admin APIs
3. Chat session/message/history access control
4. Voice session access control and raw audio handling
5. Safety event recording (chat + voice)
6. AI Teacher audit logs
7. Admin AI management APIs (prompts, model configs, usage/cost, safety review, audit)
8. Cost/quota enforcement ordering

## Findings

### 1. Provider/Model Secrets

| Check | Status |
|---|---|
| `AiModelConfigRepository` only selects/returns `provider_key_ref` (non-secret reference string), never a raw key/credential column | PASS |
| Admin model config API (`AdminModelConfigController`) never returns a secret field | PASS |
| Admin AI web UI (`AdminAiModelConfig.js`) renders only `provider_key_ref`; verified by `admin-ai-model-config-ui.test.js` forbidden-pattern checks (`apiKey`, `api_key`, `provider_secret`, `providerSecret`) | PASS |
| No `.env`/secret manager values are read by any admin AI controller or repository in this review scope | PASS |

### 2. Prompt/Config Permissions

| Check | Status |
|---|---|
| `AdminPromptController`/`AdminModelConfigController`/`AdminUsageCostController`/`AdminSafetyReviewController`/`AdminAuditController` all apply `SupabaseJwtAuthGuard` + `RoleGuard` with `@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)` | PASS |
| Prompt template version/status transitions (`draft` → `active` → `retired`) are computed server-side only; no client-supplied version/status literal is persisted | PASS |
| Model config status/limits mutations go through dedicated `setModelConfigStatus`/`updateModelConfigLimits` endpoints, not a generic patch that could bypass validation | PASS |

### 3. Conversation Access Control

| Check | Status |
|---|---|
| `chat-history-read.service.ts` re-verifies `session.student_id === studentId` before returning any message, as defense in depth against session-ID guessing | PASS |
| Admin safety/audit endpoints expose only decision/reason_category/action/resource metadata — never raw chat message or response content (`AiSafetyEventRow` has no `message`/`response` field; confirmed by `AdminSafetyReviewController` spec) | PASS |
| Parent-facing AI summary endpoints (P18-070/P18-071) gate every read behind `ParentAccessPolicyService.assertAccess(parentId, childId, 'activity_view')` before querying any repository | PASS |

### 4. Voice Data Handling

| Check | Status |
|---|---|
| Voice session repository/service scope reads by `student_id`, consistent with the chat session ownership pattern | PASS |
| `VoiceSafetyEventRepository` records only `decision`/`reason_category`/`direction`, never raw audio or transcript content | PASS |
| Admin safety review surface does not expose voice transcript/audio fields — only the safety decision rollup | PASS |

### 5. Safety Event Recording

| Check | Status |
|---|---|
| `ai_safety_events` / `voice_safety_events` rows never store rejected raw content, only `decision`, `reason_category`, `direction` | PASS |
| Admin safety review API (`/admin/ai/safety/events`, `/admin/ai/safety/feedback`) returns only these safe fields | PASS |
| Parent AI safety summary returns only an aggregate `blockedInteractionCount`, never per-event detail | PASS |

### 6. AI Teacher Audit Logs

| Check | Status |
|---|---|
| `AiTeacherAuditLogRepository` records `actor_id`, `action`, `resource_type`, `resource_id`, and a `details` JSON blob populated by the writer at call time | PASS |
| No call site in `governance/` passes a provider secret, API key, or raw provider payload into `details` | PASS |
| New `/admin/ai/audit/logs` endpoint (added in P18-078) is admin/super_admin-gated like every other admin AI route, and the frontend audit viewer renders `details` only as opaque JSON, never parsing out a secret-shaped field | PASS |

### 7. Admin AI Management APIs

| Check | Status |
|---|---|
| All five admin AI controllers (prompts, model-configs, usage, safety, audit) live under `admin/ai/*` and share the same guard stack | PASS |
| `usage/student/:studentId` and `usage/student/:studentId/limit-status` are admin-only lookups, not student-self-service — no student JWT can reach them without the ADMIN/SUPER_ADMIN role | PASS |
| No admin AI endpoint accepts a client-supplied `cost_estimate`, `decision`, or `status` value that bypasses server computation (status changes go through validated state-transition endpoints only) | PASS |

### 8. Cost/Quota Enforcement Ordering

| Check | Status |
|---|---|
| `AiCostQuotaService` quota checks run before any provider call in the chat pipeline, per the documented contract in `governance/ai-cost-quota.service.ts` | PASS |
| Usage/cost event rows are written only after a successful quota check, never speculatively | PASS |
| Admin usage/cost UI is read-only and never writes a usage row or computes a cost estimate client-side (verified by `admin-ai-usage-cost-ui.test.js` forbidden-pattern checks) | PASS |

## Summary

No provider secrets, raw conversation content, raw voice payloads, or
unauthorized cross-student/cross-role access paths were found across the
AI Teacher, Voice Tutor, or Admin AI Management surfaces reviewed. All
admin AI routes correctly require ADMIN/SUPER_ADMIN role; all
parent-facing AI summaries correctly gate on consent; all safety/audit
recording redacts raw content by construction (the schema itself has no
column to store it). Cost/quota enforcement happens server-side, before
any provider call, independent of any UI.

**Overall verdict: Pass.**
