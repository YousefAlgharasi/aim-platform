# Phase 18 — AI Teacher API Contract Map

**Task:** P18-008
**Date:** 2026-06-21
**Dependency:** P18-002 (`docs/phase-18/ai-teacher-domain-map.md`)

## Purpose

Document the backend AI Teacher APIs used by mobile (student), admin, and parent read-only surfaces, so backend and UI implementation stay aligned. This map lists endpoint intent and payload shape at a contract level — concrete route paths/DTOs are finalized during implementation tasks.

## Authority Note

No endpoint listed below mutates mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, placement results, or curriculum state. See `docs/phase-18/ai-teacher-authority-rules.md`.

## Student (Mobile) Endpoints

| Endpoint intent | Method | Request | Response | Notes |
|---|---|---|---|---|
| Start/get conversation | POST/GET | studentId (from auth), optional subjectContext ref | AiConversation | Backend resolves context; client never supplies promptTemplateId/modelConfigId |
| Send message | POST | conversationId, content | AiMessage (assistant reply) | Quota + safety checks run server-side before provider call |
| List conversation messages | GET | conversationId, pagination | AiMessage[] | Scoped to authenticated student |
| Start voice session | POST | optional conversationId | AiVoiceSession | Subject to voice quota/duration limits |
| Send voice audio chunk | POST/stream | voiceSessionId, audio chunk | AiVoiceTranscriptSegment (student) + AiVoiceTranscriptSegment (assistant, with TTS audio stream) | Raw audio not persisted after transcription |
| End voice session | POST | voiceSessionId | AiVoiceSession (status=completed) | Triggers final AiUsageCostEvent |
| Submit feedback | POST | messageId, rating, optional comment | AiFeedback | Student-owned |
| Get my AI usage summary | GET | — (from auth) | quota/usage summary (non-sensitive) | Shows remaining daily/monthly quota |

## Admin Endpoints

| Endpoint intent | Method | Request | Response | Notes |
|---|---|---|---|---|
| List prompt templates | GET | filters | AiPromptTemplate[] | No secret content |
| Create/update prompt template | POST/PUT | name, version, body, status | AiPromptTemplate | Writes AiAuditLogEntry |
| Activate/retire prompt template | POST | promptTemplateId, status | AiPromptTemplate | Writes AiAuditLogEntry |
| List model configs | GET | filters | AiModelConfig[] | Excludes secret values; shows provider label, model name, tier, status only |
| Create/update model config | POST/PUT | provider, modelName, tier, parameters, status | AiModelConfig | Secrets resolved server-side from secret manager, never accepted in request body |
| List safety check events | GET | filters (date, outcome, student if authorized) | AiSafetyCheck[] | Aggregated/redacted per privacy policy |
| List usage/cost summary | GET | filters (date range, student) | AiUsageCostEvent aggregates | Cost figures visible to admin only |
| List audit log | GET | filters | AiAuditLogEntry[] | Standard audit viewer pattern from Phase 17 Operations module |
| Block/unblock a conversation | POST | conversationId, reason | AiConversation (status updated) | Manual safety action, writes AiAuditLogEntry |
| Toggle AI kill switch | POST | capability (text/stt/tts), enabled | system config | Writes AiAuditLogEntry; see Cost Control Policy |

## Parent (Read-Only) Endpoints

| Endpoint intent | Method | Request | Response | Notes |
|---|---|---|---|---|
| Get child AI safety/usage summary | GET | childId (must be consented relationship) | safety event counts, usage summary | No raw conversation content; consent-gated |

## Cross-Cutting Rules

- All endpoints require authentication; student endpoints additionally require resource ownership checks.
- All write endpoints that touch prompts, model configs, or safety/audit actions are admin-only and require the existing admin authorization guard pattern from prior phases.
- No endpoint accepts a client-submitted `promptTemplateId`, `modelConfigId`, quota state, or safety outcome as authoritative input — these are always resolved/computed server-side.
- All endpoints are subject to the safety and cost/quota checks defined in `docs/phase-18/ai-safety-policy.md` and `docs/phase-18/ai-cost-control-policy.md` where applicable (i.e., any endpoint that triggers a provider call).
