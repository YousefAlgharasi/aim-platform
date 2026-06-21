# Phase 5 — AIM Engine Integration Charter

## Purpose

This charter defines the official scope boundary for **Phase 5 — AIM Engine Integration** in the AIM Platform.

Phase 5 exists to connect the Backend (NestJS + TypeScript) with the Python AIM Engine (FastAPI) so that backend-orchestrated learning, session, and attempt data is sent to the AIM Engine, the AIM Engine returns structured learning decisions, and the Backend validates and persists those decisions before any client consumes them.

This document is intentionally restrictive. It prevents Phase 5 tasks from becoming AI Teacher work, AI prompt management, AI cost control, voice AI, payments, parent dashboard, Student Web App, full progress dashboards, or any form of client-side AIM calculation. Phase 5 is the integration boundary, not a UI phase and not an AI pedagogy phase.

## Phase Identity

| Item | Decision |
| --- | --- |
| Phase | Phase 5 |
| Phase name | AIM Engine Integration |
| Primary purpose | Backend-to-AIM Engine integration with backend-owned validation and persistence |
| AIM Engine role | Authoritative algorithm service for mastery, level, weakness, difficulty, recommendations, review schedule, frustration signals, and session summaries |
| Backend role | Sole caller of the AIM Engine, sole owner of AIM persistence, sole owner of AIM result APIs |
| Flutter Mobile role | Consumer of backend-approved AIM results only; never calls the AIM Engine |
| Admin Dashboard role | Consumer of backend-approved AIM results only; never calls the AIM Engine |
| AI Teacher | Out of scope for Phase 5 |
| Student Web App | Out of scope for Phase 5 |
| Payments | Out of scope for Phase 5 |
| Parent dashboard | Out of scope for Phase 5 |
| Voice AI | Out of scope for Phase 5 |

## In Scope

Phase 5 may include only the following AIM Engine Integration areas.

### AIM Engine Request and Response Contracts

- Structured request schemas for student state, session state, attempt state, and behavioral context sent from Backend to AIM Engine.
- Structured response schemas for skill state updates, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, and session summaries returned from AIM Engine to Backend.
- Error code catalog for AIM Engine integration faults.
- Versioning rules for the AIM Engine contract so backend and engine can evolve safely.

### Backend AIM Adapter

- Backend-internal AIM adapter module that owns all outbound calls to the AIM Engine.
- Request construction from validated backend state only.
- Response parsing through strict DTO validation before any downstream use.
- Timeout, retry, and circuit breaker policy.
- Safe fallback responses when the AIM Engine is unavailable or returns invalid data.
- AIM Engine health check surface consumed by backend readiness probes.

### Backend-to-AIM Internal Communication

- Internal-only network path between Backend and AIM Engine.
- Authentication of backend-to-engine calls using non-public credentials never exposed to clients.
- No direct client route, proxy route, or public gateway that forwards client requests to the AIM Engine.
- No reverse path that lets the AIM Engine push to clients.

### Backend-Owned AIM Persistence

- Student skill state updates persisted only through the backend AIM pipeline.
- Weakness records persisted only through the backend AIM pipeline.
- Difficulty decisions persisted only through the backend AIM pipeline.
- Recommendations persisted only through the backend AIM pipeline.
- Review schedules persisted only through the backend AIM pipeline.
- Frustration and behavioral signals persisted only through the backend AIM pipeline and stored as educational signals, not clinical diagnoses.
- Session summaries persisted only through the backend AIM pipeline.
- Database migrations limited to Phase 5 scope tables and additive changes.

### Backend AIM Result APIs

- Read-only APIs that expose backend-persisted AIM results to authorized clients.
- Permission guards on every AIM result API, applied through the existing Phase 2 auth and role foundation.
- DTO validation on every AIM result API response.
- No write paths that let clients submit mastery, level, weakness, difficulty, recommendation, review schedule, or frustration values directly.

### AIM Audit Logging

- Audit log records for AIM Engine requests, responses, validation outcomes, persistence outcomes, and integration faults.
- Metadata-only logging by default.
- Documented exceptions when a payload field must be logged, with explicit justification.
- No secrets, no service-role keys, no database credentials, no AI provider keys, and no Supabase keys in any log line, comment, code, doc, or prompt.

### AIM Integration Tests

- Contract tests for AIM request and response schemas.
- Backend integration tests for the AIM adapter, validation, persistence, and result APIs.
- AIM Engine integration tests for request handling, response shaping, and failure paths.
- Failure-mode tests for timeout, invalid response, partial response, and engine-down scenarios.

### AIM Failure Handling

- Defined fallback behavior for every AIM Engine call site.
- Backend never persists an unvalidated AIM response.
- Backend never propagates an AIM Engine error in a form that exposes internal details to clients.
- Backend never silently masks an AIM failure that would corrupt student state.

### AIM Security and Privacy Review

- Review documents that confirm backend-only AIM access, permission coverage on AIM result APIs, persistence integrity, audit log safety, and secret hygiene.
- Review confirming no client-side AIM calculation was introduced.
- Review confirming no AI Teacher, payments, parent dashboard, or unrelated work entered Phase 5.

## Explicitly Out of Scope

Phase 5 must not include any of the following work.

| Area | Phase 5 Decision |
| --- | --- |
| Student Mobile App UI features beyond consuming backend AIM result APIs | Out of scope |
| Student Web App | Out of scope |
| AI Teacher behavior, dialogue, persona, or pedagogy | Out of scope |
| AI Prompt Management surfaces | Out of scope |
| AI Cost Control surfaces | Out of scope |
| Voice AI features | Out of scope |
| Payments and billing | Out of scope |
| Parent dashboard | Out of scope |
| Admin Dashboard UI features beyond consuming backend AIM result APIs | Out of scope |
| Full analytics dashboard | Out of scope |
| Human review workflow | Out of scope |
| Quiz or exam UI | Out of scope |
| Client-side AIM logic of any kind | Out of scope |
| Flutter calling the AIM Engine directly | Forbidden |
| Admin Dashboard calling the AIM Engine directly | Forbidden |
| Exposing the AIM Engine on any public route | Forbidden |
| Client-submitted mastery, level, weakness, difficulty, recommendation, review schedule, or frustration values trusted as authoritative | Forbidden |

## Authority Hierarchy

The Phase 5 authority hierarchy locks the system against scope drift and client-side overrides.

1. **AIM Engine** — authoritative algorithm service for mastery, level, weakness, difficulty, recommendations, review schedule, frustration signals, and session summaries.
2. **Backend** — sole caller of the AIM Engine, sole validator of AIM responses, sole owner of AIM persistence, sole owner of AIM result APIs, sole enforcer of permissions.
3. **Clients (Flutter Mobile, Admin Dashboard)** — read backend-approved AIM results through permission-guarded APIs. Never call the AIM Engine. Never compute mastery, level, weakness, difficulty, recommendations, review schedule, retention, frustration score, or learning decisions.

Speed and response time may inform behavioral context only. They must never enter mastery, level, or difficulty logic.

When the AI Teacher is added in a later phase, it remains a strict pedagogical interface layer and must never override AIM Engine decisions.

## Source-of-Truth Mapping

| Concern | Source of Truth |
| --- | --- |
| Mastery | AIM Engine output, backend-persisted |
| Level | AIM Engine output, backend-persisted |
| Weakness records | AIM Engine output, backend-persisted |
| Difficulty decisions | AIM Engine output, backend-persisted |
| Recommendations | AIM Engine output, backend-persisted |
| Review schedule | AIM Engine output, backend-persisted |
| Frustration signals | AIM Engine output, backend-persisted, educational only |
| Session summaries | AIM Engine output, backend-persisted |
| AIM audit records | Backend-owned |
| AIM result APIs | Backend-owned |
| AIM Engine health | Backend-owned probe over internal channel |

## Non-Negotiable Constraints

- Backend is the only caller of the AIM Engine.
- Flutter never calls the AIM Engine.
- Admin Dashboard never calls the AIM Engine.
- The AIM Engine is never exposed directly to any client, gateway, or public route.
- Clients never compute mastery, level, weakness, difficulty, recommendations, review schedule, retention, frustration score, or learning decisions.
- All AIM outputs are validated by the backend before persistence.
- AIM result APIs require permission guards.
- Audit logs never contain secrets or unnecessary sensitive payloads.
- No real secret, service-role key, database credential, OpenAI key, or AI provider key is committed to code, documentation, comments, logs, or prompts.
- Migrations introduced under Phase 5 stay additive and stay within Phase 5 scope.

## Conflict Resolution

If a Phase 5 task conflicts with Phase 0, Phase 1, Phase 2, Phase 3, or Phase 4 decisions:

1. Stop work on the task.
2. Document the conflict in the relevant Phase 5 file or task notes.
3. Add a Notion blocker comment listing the exact files and decisions in conflict.
4. Do not silently override prior phase decisions.

Where a Phase 5 task introduces a new decision that supersedes a prior one, the supersession must be explicit, documented, and confined to AIM Engine Integration scope.

## Done Definition for Phase 5

Phase 5 is complete only when:

- Backend-to-AIM contracts, adapter, internal communication, health checks, persistence, result APIs, audit logging, integration tests, failure handling, and security and privacy review are delivered.
- Backend remains the sole caller of the AIM Engine.
- No client-side AIM calculation exists in Flutter Mobile or Admin Dashboard.
- AIM result APIs are permission-guarded and DTO-validated.
- Persistence flows through the backend AIM pipeline only.
- Audit logs are metadata-safe.
- No secrets are present anywhere in Phase 5 artifacts.
- Phase 5 review documents confirm scope safety and source-of-truth integrity.
