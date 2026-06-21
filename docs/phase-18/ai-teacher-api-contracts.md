# AI Teacher API Contracts

P18-052. Documents the chat, voice, feedback, admin prompt/config, safety,
usage, and history HTTP endpoints implemented for AI Teacher (Phase 18),
to align backend and UI integration.

Scope note: this document describes API shape only. It does not introduce
any new mastery/level/weakness/difficulty/recommendation/review-schedule
logic — the AI Teacher remains advisory-only and the AIM Engine remains
final authority for all learning decisions (see
`docs/phase-8/no-aim-replacement-rule.md`).

All endpoints below require a valid Supabase JWT (`SupabaseJwtAuthGuard`)
unless noted. Student-facing endpoints always resolve `studentId` from the
verified JWT (`@CurrentUser()`) — never from the request body, query, or
route params. Admin endpoints require the `ADMIN` or `SUPER_ADMIN` role
(`RoleGuard` + `RequireRoles`). Ownership of a referenced resource (e.g. a
chat session) is always checked server-side; mismatched or missing
resources return `404 Not Found` (never a `403`, to avoid existence leaks).

No endpoint documented here ever returns a provider secret, API key, or
raw provider credential — only the non-secret `provider_key_ref` reference
string where applicable.

## Chat session

### `POST /ai-teacher/sessions`
Role: `STUDENT`.
Starts a new AI Teacher chat session for the authenticated student.

Request body: none required (subject area context, if any, is resolved
server-side from backend-approved context, never trusted from the client).

Response: the created chat session row (`id`, `student_id`, `created_at`, …).

### `GET /ai-teacher/sessions` (chat session list)
Role: `STUDENT`.
Lists the authenticated student's own chat sessions.

Response: array of session summaries belonging to the caller only.

## Chat messages

### `POST /ai-teacher/sessions/:id/messages`
Role: `STUDENT`.
Submits a student message into an existing session and returns the AI
Teacher's full, safety-filtered reply. The session referenced by `:id`
must belong to the caller (404 otherwise).

Request body: `{ "message": string }`.

Response: the created message pair (student message + AI reply), including
`provider`, `model`, and `isFallback` (whether a fallback path was used).
Never includes mastery/weakness/difficulty/recommendation/review-schedule
fields.

### `GET /ai-teacher/sessions/:id/messages`
Role: `STUDENT`.
Reads the message history for a session owned by the caller.

Response: array of messages ordered by creation time.

### `GET /ai-teacher/sessions/:id/messages/stream` (SSE)
Role: `STUDENT`.
Server-Sent Events stream of an AI Teacher reply for a new turn. The full
reply is generated and passed through the same safety filter as the
non-streaming endpoint **before** any chunk is emitted to the client — the
client never sees unfiltered content streamed live from the provider.

Request body: `{ "message": string }` (sent as the SSE request's body /
initiating request, per the existing streaming dto).

Event stream:
- zero or more `{ "type": "chunk", "text": string }` events, in order.
- exactly one terminal `{ "type": "done", "isFallback": boolean, "provider": string, "model": string }` event.

## Feedback

### `POST /ai-teacher/messages/:messageId/feedback`
Role: `STUDENT`.
Submits a rating (`helpful` | `not_helpful`) for one AI Teacher message.
The message's session must belong to the caller (404 otherwise). Feedback
is advisory only — it is never read by the AIM Engine and never affects
mastery/level/weakness/difficulty/recommendation/review-schedule values.

Request body: `{ "rating": "helpful" | "not_helpful" }`.

Response: `{ "feedbackId": string, "messageId": string, "rating": string, "createdAt": string }`.

## Safety status (student-facing)

### `GET /ai-teacher/sessions/:id/safety-status`
Role: `STUDENT`.
Returns a reduced, student-safe safety status for the session, derived
from recorded safety-filter outcomes — never the raw `reason_category`
taxonomy or any rejected message/response content.

Response: `{ "sessionId": string, "status": "ok" | "limited", "lastCheckedAt": string | null }`.

## Admin: prompt templates

Base path: `/admin/ai/prompts`. Role: `ADMIN` | `SUPER_ADMIN`.

Prompt templates are versioned per `(name, locale, audience)`. `version`
is always server-computed (`MAX(version) + 1`) — never client-supplied.
Publishing atomically retires any previously-active version for the same
`(name, locale, audience)` triple before activating the new one, so at
most one version is ever `active` per triple.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/ai/prompts` | List all templates, any status. |
| `GET` | `/admin/ai/prompts/:id` | Read one template by id. |
| `POST` | `/admin/ai/prompts` | Create a new draft (`{ name, locale, audience, body, safetyTags? }`). |
| `POST` | `/admin/ai/prompts/:id/publish` | Publish a draft/retired version as active; retires the previous active version for the same triple. |
| `POST` | `/admin/ai/prompts/:id/retire` | Retire a version. |

Template row shape: `{ id, name, version, locale, audience, status: 'draft'|'active'|'retired', body, safety_tags, created_at, updated_at }`.

## Admin: model configs

Base path: `/admin/ai/model-configs`. Role: `ADMIN` | `SUPER_ADMIN`.

`provider_key_ref` is always a non-secret reference string; the underlying
provider credential is never read, resolved, or returned by these
endpoints.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/ai/model-configs` | List all model configs, any status. |
| `GET` | `/admin/ai/model-configs/:id` | Read one model config by id. |
| `POST` | `/admin/ai/model-configs/:id/status` | Change status (`{ status: 'draft'\|'active'\|'retired' }`). |
| `POST` | `/admin/ai/model-configs/:id/limits` | Update `limits`/`parameters` (`{ limits: object, parameters: object }`). |

Model config row shape: `{ id, name, provider_key_ref, model_id, tier: 'economy'|'standard'|'premium', status, limits, parameters, created_at, updated_at }`.

## Admin: safety review

Base path: `/admin/ai/safety`. Role: `ADMIN` | `SUPER_ADMIN`. Read-only.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/ai/safety/events?limit=` | Recent rejected safety events (any session). Default limit 100, max 500. |
| `GET` | `/admin/ai/safety/feedback?limit=` | Recent flagged (`not_helpful`) feedback. Default limit 100, max 500. |

Safety event row shape: `{ id, session_id, direction: 'input'|'output', decision: 'allowed'|'rejected', reason_category, created_at }` — never the rejected raw message/response content.

## Admin: usage and cost

Base path: `/admin/ai/usage`. Role: `ADMIN` | `SUPER_ADMIN`. Read-only.
Usage/cost rows are written only by the live provider-call pipeline after
a quota check has passed — these endpoints never write usage data.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/ai/usage?limit=` | Recent usage/cost events across all students. Default limit 100, max 500. |
| `GET` | `/admin/ai/usage/student/:studentId?limit=` | Usage/cost events for one student. |
| `GET` | `/admin/ai/usage/student/:studentId/limit-status` | Daily/monthly quota status for one student: `{ studentId, daily: { allowed, periodSpend, budget }, monthly: { allowed, periodSpend, budget } }`. |

Usage event row shape: `{ id, student_id, event_type: 'text_generation'|'stt'|'tts', model_config_id, request_id, tokens_used, duration_seconds, cost_estimate, quota_period: 'daily'|'monthly', metadata, created_at }`.

## Error shape

All endpoints return errors in the shared `AppError` shape used across the
backend: `{ code: ApiErrorCode, message: string }` with the matching HTTP
status. Validation failures use `ApiErrorCode.VALIDATION_ERROR` /
`400 Bad Request`; missing/unauthorized resources use
`ApiErrorCode.NOT_FOUND` / `404 Not Found`.
