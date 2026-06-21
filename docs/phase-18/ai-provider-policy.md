# Phase 18 — AI Provider Policy

**Task:** P18-005
**Date:** 2026-06-21
**Dependency:** P18-002 (`docs/phase-18/ai-teacher-domain-map.md`)

## Purpose

Define the provider abstraction layer, allowed providers, failover boundaries, secret-handling rules, and ownership of model configuration for AI Teacher and Voice Tutor.

## Provider Abstraction

- All provider calls (text generation, speech-to-text, text-to-speech) go through a single backend `AiProviderGateway` abstraction. No feature code calls a provider SDK/API directly.
- The gateway exposes capability-based interfaces (`generateText`, `transcribeSpeech`, `synthesizeSpeech`) rather than provider-specific methods, so providers can be swapped without changing calling code.
- Clients (mobile, admin, parent web) never hold provider credentials and never call providers directly — only the backend gateway does.

## Allowed Providers

- Phase 18 supports a primary text-generation provider and a primary speech provider (STT/TTS), selected and configured via `AiModelConfig` records (see P18-002).
- Provider identity is abstracted in code as a string identifier (e.g., `"primary"`, `"secondary"`) resolved server-side to actual provider configuration — never hard-coded provider names scattered through business logic.
- Adding a new provider requires only a new `AiModelConfig` entry and a corresponding gateway adapter; it must not require changes to AI Teacher conversation/voice logic.

## Failover Boundaries

- If the primary provider fails (error, timeout, outage), the gateway may fail over to a configured secondary `AiModelConfig` of the same capability tier, if one is marked `active`.
- Failover must preserve all safety and cost/quota checks — a failover call is still subject to the same pre-call quota check and post-call safety check as a primary call.
- If no failover provider is configured or available, the request fails closed with a safe, generic "AI Teacher is temporarily unavailable" response — never falls back to an unmoderated or unmetered path.
- Failover events are logged via `AiAuditLogEntry` for observability.

## Secret Rules

- Provider API keys, model secrets, and any signing keys live only in backend environment configuration / secret manager — never in code, never in client bundles, never in documentation, never in logs.
- Raw provider request/response payloads are not persisted in full if they could contain secrets or sensitive metadata; only the fields needed for `AiMessage`, `AiVoiceTranscriptSegment`, and `AiUsageCostEvent` are persisted.
- Error logs from provider calls must redact authorization headers, API keys, and full request bodies.
- No task in Phase 18 commits a real provider key, sandbox key, or token to the repository.

## Model Configuration Ownership

- `AiModelConfig` (provider, model name, parameters, tier, status) is owned and selected entirely by the backend.
- Clients may request a *capability* (e.g., "tutor chat", "voice reply") but never specify a provider, model name, or model parameters directly — the backend resolves the active `AiModelConfig` for that capability.
- Admin UI may manage (create/update/retire) `AiModelConfig` records through protected backend APIs but must never display the underlying provider secret value — only non-secret fields (provider label, model name, tier, status).

## Cost Interaction

- Provider/model tiering interacts with `docs/phase-18/ai-cost-control-policy.md` (P18-006): cheaper tiers may be selected automatically based on quota state, but the selection logic lives in the backend gateway, not the client.

## Out of Scope

- This policy does not implement actual provider SDK integration code; it defines the boundary contract that implementation tasks must follow.
