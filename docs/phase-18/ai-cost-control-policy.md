# Phase 18 — AI Cost Control Policy

**Task:** P18-006
**Date:** 2026-06-21
**Dependency:** P18-002 (`docs/phase-18/ai-teacher-domain-map.md`)

## Purpose

Define budgets, quotas, rate limits, usage caps, model tiering, and shutdown controls that prevent uncontrolled AI usage costs.

## Principle

Every AI provider call (text generation, STT, TTS) must pass a cost/quota check **before** the call is made. No exceptions, including failover calls.

## Budget Levels

| Level | Scope | Enforcement |
|---|---|---|
| Platform budget | Total AI spend across all users for a billing period | Soft alert + hard shutdown switch (admin-controlled kill switch) |
| Per-student daily quota | Messages/voice-minutes per student per day | Hard cap — request rejected with a friendly "daily AI tutor limit reached" message once exceeded |
| Per-student monthly quota | Messages/voice-minutes per student per month | Hard cap, same UX as daily |
| Per-conversation rate limit | Requests per minute within a single conversation | Hard cap to prevent spam/abuse |

## Quota Check Flow

1. Client sends a tutoring message or starts a voice session.
2. Backend resolves the student's current usage against daily/monthly quota and per-conversation rate limit.
3. If any quota is exceeded, the backend rejects the request **before** calling the provider, returns a safe quota-exceeded response, and logs an `AiUsageCostEvent`-adjacent quota-rejection record (no provider cost incurred).
4. If quota allows, the backend proceeds to safety-checked provider call.
5. After the provider call completes, the backend writes an `AiUsageCostEvent` with actual usage (tokens or audio seconds) and updates the running quota counters.

## Model Tiering

- `AiModelConfig` records are tagged with a cost `tier` (e.g., `economy`, `standard`, `premium`).
- The backend gateway selects the lowest viable tier for a given capability by default; premium tiers are reserved for cases explicitly configured by the backend (e.g., specific subjects), never selected by the client.
- As platform budget utilization approaches its threshold, the backend may automatically downgrade new requests to a cheaper tier (graceful degradation) rather than stopping service outright, where a cheaper tier is configured.

## Rate Limits

- Per-student rate limits apply at the conversation level (messages/minute) and the voice-session level (sessions/hour, max session duration).
- Rate limits are enforced server-side; the limit configuration is backend-controlled and not exposed to or trusted from the client.

## Shutdown Controls

- An admin-controlled kill switch can disable AI Teacher / Voice Tutor platform-wide or per capability (text, STT, TTS) independently, without a deployment.
- When the kill switch is active, requests fail closed with a safe "AI Teacher is temporarily unavailable" message — never silently degrade into an unmetered or unmoderated path.
- Kill-switch activation/deactivation is written to `AiAuditLogEntry`.

## Observability

- Usage and cost data aggregate from `AiUsageCostEvent` records for admin dashboards (usage/cost summaries) per `docs/phase-18/ai-teacher-api-contract-map.md` (P18-008).
- Cost summaries surfaced to parents (read-only, consent-gated) show high-level usage (e.g., minutes used, messages sent) — not raw cost-per-token figures or provider billing detail.

## Non-Bypass Rule

- No client-submitted field (quota state, usage count, tier selection) is trusted by the backend. All quota and cost state is computed server-side from persisted `AiUsageCostEvent` records.
