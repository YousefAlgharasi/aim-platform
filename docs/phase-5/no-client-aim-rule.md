# Phase 5 — No Client-Side AIM Rule

## Purpose

This rule prohibits any client application — Flutter Mobile, Admin Dashboard, future Student Web App, or any other client — from calling the AIM Engine directly or computing AIM decisions locally. It exists to preserve backend authority, protect the AIM algorithm boundary, and prevent corrupted or forged learning state from entering persistence.

This rule is part of the Phase 5 source-of-truth hierarchy and is binding on every Phase 5 task, every backend feature module, every client application, and every reviewer.

## Scope

This rule applies to all of the following AIM-owned concerns:

- Mastery
- Level
- Weakness records
- Difficulty decisions
- Recommendations
- Review schedules
- Retention scores
- Frustration and behavioral signals
- Session summaries
- Any other learning decision returned by the AIM Engine

Wherever this document says "AIM decisions" it means values produced by, or derived from, the AIM Engine response contract.

## Authority Model

The authority chain is fixed:

1. **AIM Engine** computes AIM decisions. It is the only producer.
2. **Backend** is the only caller of the AIM Engine. The Backend validates every AIM response, persists every accepted decision, and exposes read-only AIM result APIs to authorized clients.
3. **Clients** read backend-approved AIM results through permission-guarded backend APIs. Clients are pure consumers.

Clients never compute, mutate, or substitute AIM decisions. Display rounding, formatting, ordering for presentation, and accessibility transformations of already-persisted values are not considered AIM computation and remain allowed.

## Forbidden Client Behavior

Clients (Flutter Mobile, Admin Dashboard, future Student Web App, and any other client) must not:

- Open a network connection to the AIM Engine host, port, or internal address.
- Resolve, hard-code, or read from configuration any URL pointing to the AIM Engine.
- Hold or use credentials that authenticate to the AIM Engine.
- Construct AIM Engine request payloads.
- Parse AIM Engine raw responses.
- Compute mastery from attempts, answers, timing, or behavioral data.
- Compute level from placement results, lesson outcomes, or any other source.
- Compute weakness records from attempt history.
- Compute or override difficulty decisions for the next lesson, question, or practice item.
- Compute recommendations, learning paths, or next-step lists.
- Compute review schedules, retention scores, or spaced-repetition intervals.
- Compute frustration scores or other behavioral aggregates intended to mirror AIM output.
- Persist any of the above directly to the backend through write APIs.
- Send any of the above to the backend in request bodies expecting the backend to accept them as truth.

Speed and response time may be collected as behavioral context and sent to the backend as raw signals only. They must not enter any client-side mastery, level, or difficulty calculation.

## Required Client Behavior

Clients must:

- Read AIM results exclusively through backend-provided, permission-guarded result APIs.
- Treat the backend response as the authoritative value for every AIM-owned concern.
- Submit only raw attempt, answer, and behavioral signal data through the backend's defined client APIs. The backend, not the client, decides what reaches the AIM Engine.
- Display loading, empty, error, and fallback states when AIM results are not yet available or have failed validation server-side.

## Backend Obligations

The backend enforces this rule by:

- Owning the AIM adapter as a backend-internal module with no client-reachable route.
- Validating every AIM Engine response through DTOs before persistence.
- Rejecting client-submitted values for mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration. Such fields, if present in a client payload, are dropped, never persisted, and logged as a validation event.
- Exposing AIM results only through read APIs guarded by the Phase 2 auth and role foundation.
- Never forwarding client traffic to the AIM Engine. Even pass-through proxies, debugging routes, and admin escape hatches are forbidden.

## Network and Deployment Constraints

- The AIM Engine listens only on the internal network reachable from the backend. It is not exposed through any public load balancer, ingress, gateway, or reverse proxy.
- AIM Engine credentials are issued only to the backend service. They are never embedded in mobile bundles, web bundles, admin bundles, or client environment files.
- Public CORS configuration on the AIM Engine, if any framework default exists, must be locked down to deny all client origins.

## Allowed Client Surfaces

Clients may, without violating this rule:

- Display backend-persisted mastery, level, weakness records, recommendations, review schedules, and session summaries.
- Render UI hints, badges, and progress indicators derived from backend-approved values.
- Submit attempts, answers, and raw behavioral signals through backend client APIs.
- Show backend-provided fallback messaging when the AIM Engine is degraded.
- Cache backend-approved AIM results locally for offline display only, with no client-side recomputation when the value is missing or stale.

## Violation Detection

A change violates this rule when any of the following appear in client code:

- Direct HTTP, gRPC, or socket calls to the AIM Engine host.
- AIM Engine URLs, hostnames, or credentials in client configuration, environment files, or bundled assets.
- Client functions that compute mastery, level, weakness, difficulty, recommendations, review schedule, retention, or frustration from local data.
- Client write paths that send any AIM-owned value to backend write APIs.
- Backend routes that proxy client traffic to the AIM Engine.

Any of the above must be removed before merge. A task that introduces any of the above must be stopped and a Notion blocker comment must be posted with risk category `client-side AIM risk`.

## Review Checklist

Phase 5 reviewers verify, for every change touching client code or AIM-adjacent backend code:

- No client file references the AIM Engine host or credentials.
- No client function computes an AIM-owned value.
- No backend route forwards client traffic to the AIM Engine.
- AIM result APIs require permission guards from the Phase 2 foundation.
- Client payloads to backend write APIs do not include AIM-owned fields. Server-side DTOs strip them if present.

## Conflict Resolution

If a feature request, design, or task brief would require client-side AIM computation or a client-reachable AIM Engine path:

1. Stop work.
2. Document the conflict in the relevant Phase 5 file or task notes.
3. Post a Notion blocker comment with risk category `client-side AIM risk`.
4. Do not implement the feature until the design is corrected to route through the backend AIM pipeline.

This rule supersedes any feature convenience, latency argument, or offline argument that would otherwise place AIM computation on a client.
