# Phase 18 — AI Teacher Domain Map

**Task:** P18-002
**Date:** 2026-06-21
**Dependency:** P18-001 (`docs/phase-18/ai-teacher-voice-charter.md`)

## Purpose

Establish the AI Teacher domain entities, relationships, and lifecycle states before implementation begins, consistent with the authority and scope boundaries set in the Phase 18 charter.

## Entities

### AiConversation
A text tutoring thread between one student and AI Teacher.

| Field | Notes |
|---|---|
| id | UUID primary key |
| studentId | Owner of the conversation |
| subjectContext | Backend-approved learning context reference (read-only) |
| status | active, archived, blocked |
| createdAt / updatedAt | Timestamps |

### AiMessage
A single message within an `AiConversation`.

| Field | Notes |
|---|---|
| id | UUID primary key |
| conversationId | FK to AiConversation |
| role | student, assistant, system |
| content | Message text |
| promptTemplateId | FK to AiPromptTemplate used to generate assistant replies |
| modelConfigId | FK to AiModelConfig used to generate assistant replies |
| safetyCheckId | FK to AiSafetyCheck result for this message |
| createdAt | Timestamp |

### AiVoiceSession
A voice tutoring session (speech-to-text in, text-to-speech out).

| Field | Notes |
|---|---|
| id | UUID primary key |
| studentId | Owner of the session |
| conversationId | Optional FK linking voice session to a text conversation |
| status | active, completed, blocked, expired |
| durationSeconds | Used for cost/quota accounting |
| startedAt / endedAt | Timestamps |

### AiVoiceTranscriptSegment
A transcribed segment within a voice session (not raw audio).

| Field | Notes |
|---|---|
| id | UUID primary key |
| voiceSessionId | FK to AiVoiceSession |
| role | student, assistant |
| text | Transcribed/spoken text |
| createdAt | Timestamp |

### AiPromptTemplate
Backend-controlled prompt template selected by the backend, never by the client.

| Field | Notes |
|---|---|
| id | UUID primary key |
| name | Template identifier |
| version | Version number |
| status | draft, active, retired |
| body | Template content (no embedded secrets) |

### AiModelConfig
Backend-controlled model configuration (provider, model name, parameters, tier).

| Field | Notes |
|---|---|
| id | UUID primary key |
| provider | Provider identifier (abstracted) |
| modelName | Model identifier |
| tier | Cost tier |
| status | draft, active, retired |
| parameters | Non-secret generation parameters |

### AiSafetyCheck
Result of a safety evaluation run against a message or voice segment.

| Field | Notes |
|---|---|
| id | UUID primary key |
| targetType | message, voice_segment |
| targetId | FK to the checked entity |
| outcome | allowed, blocked, flagged |
| reason | Non-sensitive classification reason |
| createdAt | Timestamp |

### AiFeedback
Student-submitted feedback on an AI Teacher response.

| Field | Notes |
|---|---|
| id | UUID primary key |
| messageId | FK to AiMessage |
| studentId | Submitter |
| rating | Numeric or thumbs up/down |
| comment | Optional text |
| createdAt | Timestamp |

### AiUsageCostEvent
A cost/usage record created for every provider call.

| Field | Notes |
|---|---|
| id | UUID primary key |
| studentId | Attributed user |
| eventType | text_generation, stt, tts |
| modelConfigId | FK to AiModelConfig |
| tokensOrSeconds | Usage quantity |
| costEstimate | Estimated cost |
| createdAt | Timestamp |

### AiAuditLogEntry
Audit trail for AI Teacher administrative and safety-relevant actions.

| Field | Notes |
|---|---|
| id | UUID primary key |
| actorId | Admin or system actor |
| action | e.g. prompt_updated, config_activated, conversation_blocked |
| resourceType / resourceId | Target of the action |
| details | Non-sensitive metadata |
| createdAt | Timestamp |

## Relationships

- `AiConversation` 1—N `AiMessage`
- `AiConversation` 0..1—N `AiVoiceSession` (a voice session may optionally link to a text conversation)
- `AiVoiceSession` 1—N `AiVoiceTranscriptSegment`
- `AiMessage` 1—1 `AiSafetyCheck` (per assistant message)
- `AiMessage` 0..1—N `AiFeedback`
- `AiMessage` / `AiVoiceSession` —> `AiUsageCostEvent` (one or more per provider call)
- `AiPromptTemplate` and `AiModelConfig` are referenced by `AiMessage`, never owned by the student or client.

## Lifecycle Notes

- `AiPromptTemplate` and `AiModelConfig` are selected exclusively by the backend at generation time; clients cannot submit or override these IDs.
- `AiSafetyCheck` runs before an assistant message or voice reply is persisted/returned; a `blocked` outcome short-circuits the response with a safe fallback.
- `AiUsageCostEvent` is created only after a cost/quota check has passed and the provider call has completed (or failed), never before the quota check.
- `AiAuditLogEntry` is written for all admin-facing mutations (prompt/config changes, manual conversation blocks) — not for routine student tutoring traffic.

## Authority Note

No entity in this domain map stores or represents mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or curriculum state. Those remain owned by existing AIM Engine domains from prior phases.
