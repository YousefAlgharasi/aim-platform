# Phase 5 — AIM Integration Scope and Out-of-Scope

## Purpose

This document is the authoritative scope boundary for Phase 5 of the AIM Platform. It defines the work that is **In Scope** for AIM Engine Integration, the work that is **Explicitly Out of Scope**, and the rules that apply when a candidate task sits near the boundary.

Every Phase 5 task is judged against this document. If a task brief, design, or implementation would introduce work outside this boundary, it is stopped and a blocker is raised. This document supersedes any feature-area momentum, roadmap pressure, or convenience argument that would pull unrelated work into Phase 5.

## Phase 5 Identity

Phase 5 is the integration phase between the NestJS + TypeScript Backend and the Python AIM Engine (FastAPI). Its single job is to connect the two services through structured contracts, backend-owned validation, backend-owned persistence, and permission-guarded result APIs, so that clients can read backend-approved AIM decisions safely.

Phase 5 does not deliver client features beyond what is required to consume the backend-approved AIM results that already flow through the Phase 4 placement foundation or new Phase 5 result APIs.

## In Scope

Phase 5 work is limited to the following areas.

### 1. AIM Engine Integration Contracts

- Request schemas sent from Backend to AIM Engine for student state, session state, attempt state, and behavioral context.
- Response schemas returned from AIM Engine to Backend for skill state updates, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, and session summaries.
- AIM integration error code catalog.
- Versioning rules and compatibility expectations for the AIM Engine contract.

### 2. Backend AIM Adapter

- Backend-internal AIM adapter module that owns all outbound calls to the AIM Engine.
- Request construction from validated backend state only.
- Response parsing with strict DTO validation before any downstream use.
- Timeout, retry, and circuit breaker policy for AIM calls.
- Safe fallback responses when the AIM Engine is unavailable or returns invalid data.
- AIM Engine health check surface consumed by backend readiness probes.

### 3. Backend-to-AIM Internal Communication

- Internal-only network path between Backend and AIM Engine.
- Backend-to-engine authentication using credentials never exposed to any client.
- No direct client route, proxy route, or public gateway that forwards client requests to the AIM Engine.

### 4. AIM Engine Service Endpoints

- Python AIM Engine endpoints required by the integration: health check, analysis pipeline entrypoint, and any internal supporting endpoints.
- Input validation rules in the AIM Engine for every incoming request.
- Safe failure response shapes for the AIM Engine.
- Python test fixtures and unit tests covering the integration paths.

### 5. Backend-Owned Persistence Through the AIM Pipeline

- Student skill state updates persisted only through the backend AIM pipeline.
- Weakness records persisted only through the backend AIM pipeline.
- Difficulty decisions persisted only through the backend AIM pipeline.
- Recommendations persisted only through the backend AIM pipeline.
- Review schedules persisted only through the backend AIM pipeline.
- Frustration and behavioral signals persisted only through the backend AIM pipeline. These remain educational behavioral signals, not clinical diagnoses.
- Session summaries persisted only through the backend AIM pipeline.
- Database migrations limited to Phase 5 scope tables. Migrations stay additive.

### 6. Backend AIM Result APIs

- Read-only APIs that expose backend-persisted AIM results to authorized clients.
- Permission guards on every AIM result API, applied through the existing Phase 2 auth and role foundation.
- DTO validation on every AIM result API response.
- No write paths that let clients submit mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration values directly.

### 7. AIM Audit Logging

- Audit records for AIM Engine requests, responses, validation outcomes, persistence outcomes, and integration faults.
- Metadata-only logging by default.
- Documented exceptions when a payload field must be logged, with explicit justification next to the log site.

### 8. AIM Integration Testing

- Contract tests for AIM request and response schemas.
- Backend integration tests for the AIM adapter, validation, persistence, and result APIs.
- AIM Engine integration tests for request handling, response shaping, and failure paths.
- Failure-mode tests for timeout, invalid response, partial response, and engine-down scenarios.

### 9. AIM Failure Handling

- Defined fallback behavior for every AIM Engine call site.
- Backend never persists an unvalidated AIM response.
- Backend never propagates an AIM Engine error in a form that exposes internal details to clients.
- Backend never silently masks an AIM failure that would corrupt student state.

### 10. AIM Security and Privacy Review

- Review documents confirming backend-only AIM access, permission coverage on AIM result APIs, persistence integrity, audit log safety, and secret hygiene.
- Review confirming no client-side AIM calculation exists.
- Review confirming no AI Teacher, payments, parent dashboard, voice AI, or unrelated work entered Phase 5.

## Explicitly Out of Scope

Phase 5 must not include any of the following work. Items here are not delayed Phase 5 features; they belong to other phases.

| Area | Phase 5 Decision | Belongs To |
| --- | --- | --- |
| Student Mobile App UI beyond consuming backend AIM result APIs | Out of scope | Later mobile phase |
| Student Web App of any kind | Out of scope | Phase 7+ |
| AI Teacher behavior, dialogue, persona, or pedagogy | Out of scope | Dedicated AI Teacher phase |
| AI Prompt Management surfaces | Out of scope | AI Teacher phase |
| AI Cost Control surfaces | Out of scope | AI Teacher / Ops phase |
| Voice AI features | Out of scope | Dedicated voice phase |
| Payments, billing, subscriptions | Out of scope | Payments phase |
| Parent dashboard, parent reporting, parent notifications | Out of scope | Parent phase |
| Admin Dashboard UI features beyond consuming backend AIM result APIs | Out of scope | Admin phase iterations |
| Full analytics dashboards | Out of scope | Analytics phase |
| Human review workflow | Out of scope | Quality phase |
| Quiz or exam UI authoring tools | Out of scope | Content authoring phase |
| Client-side AIM logic of any kind | Forbidden permanently | Never |
| Flutter calling the AIM Engine directly | Forbidden permanently | Never |
| Admin Dashboard calling the AIM Engine directly | Forbidden permanently | Never |
| Exposing the AIM Engine on any public route | Forbidden permanently | Never |
| Trusting client-submitted mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration values | Forbidden permanently | Never |
| Persisting AIM responses without backend validation | Forbidden permanently | Never |
| Committing real secrets, service-role keys, database credentials, or AI provider keys | Forbidden permanently | Never |

## Edge Cases

Edge cases sit close to the boundary and require an explicit ruling.

### Client UI changes required to display new AIM results

Allowed only when the change is the minimum needed to render a backend-approved AIM result through an existing presentation pattern. New screens, navigation flows, or interaction patterns are out of scope. If the rendering requires more than minor display work, the UI work is deferred to the appropriate later phase.

### Admin Dashboard surfaces for AIM data

Allowed only as a read-only consumer of backend AIM result APIs. No admin computation, override, or write of AIM-owned values. Any admin override workflow belongs to a later quality or admin phase.

### Behavioral signals (timing, hesitation, retries)

Allowed as inputs. The Backend collects raw signals from clients, attaches them to the AIM request, and lets the AIM Engine interpret them. Clients do not aggregate, score, or label behavioral signals beyond passing through raw measurements.

### Frustration and emotional signals

Allowed as educational behavioral signals only. They are never clinical diagnoses, never user-facing mental-health labels, and never persisted in a form that resembles clinical assessment.

### Speed and response time

Allowed only as behavioral context. Speed must never enter mastery, level, or difficulty logic at any layer.

### Spaced repetition and review schedule

Owned by the AIM Engine response contract. Clients display review schedules; clients do not compute them, recompute them, or override them.

### Migrations adjacent to AIM scope

Additive only. New tables must be limited to Phase 5 scope (skill states, weakness records, difficulty decisions, recommendations, review schedules, frustration signals, session summaries, AIM audit). No AI Teacher tables, no payment tables, no parent dashboard tables, no voice AI tables.

### Refactors

Allowed only if directly required by the active task. Opportunistic refactors of unrelated modules are out of scope and must be raised as separate tasks if needed.

### New technology choices

Out of scope unless a Phase 5 task explicitly requires a documented decision. Phase 1 stack remains locked.

## Boundary Test

For any candidate change, all of the following must be true for it to remain inside Phase 5:

1. The change implements work that maps to one of the ten **In Scope** sections above.
2. The change does not implement work that maps to any **Explicitly Out of Scope** row.
3. The change preserves backend-only AIM Engine access.
4. The change does not introduce client-side AIM computation.
5. The change does not expose AIM Engine credentials or any other real secret.
6. The change respects the source-of-truth hierarchy: AIM Engine produces decisions, Backend validates and persists, clients only consume.
7. The change does not silently override Phase 0, Phase 1, Phase 2, Phase 3, or Phase 4 decisions.

If any item fails, the change is outside Phase 5. The task is stopped and a Notion blocker is posted with the matching risk category: AIM adapter risk, AIM pipeline risk, persistence risk, permission risk, client-side AIM risk, AI Teacher scope risk, secret risk, or none.

## Authority Reminder

Phase 5 does not change the existing authority chain. It enforces it.

1. **AIM Engine** is the algorithm authority for mastery, level, weakness, difficulty, recommendations, review schedule, retention, frustration, and session summaries.
2. **Backend** is the only caller of the AIM Engine, the only validator of AIM responses, the only owner of AIM persistence, and the only provider of AIM result APIs.
3. **Clients** consume backend-approved AIM results. They never call the AIM Engine, never compute AIM decisions, and never write AIM-owned values back to the backend.

## Phase Boundary Promise

Phase 5 ends with the AIM Engine integration delivered and reviewed. It does not end with student-facing lesson delivery, adaptive practice UI, AI Teacher behavior, payments, or parent dashboards. Those phases come later and start from a stable Phase 5 foundation.
