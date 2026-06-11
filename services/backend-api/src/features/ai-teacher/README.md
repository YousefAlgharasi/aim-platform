# services/backend-api/src/features/ai-teacher

AI Teacher gateway boundary module. Backend-owned. Never exposed to any client.

## Boundary Rules

- This module is the only entry point to AI Teacher functionality.
- No client (Flutter Mobile, Admin Dashboard) calls this module directly.
- No AI provider API key is passed to, stored in, or read from any client.
- No general chatbot behavior. AI Teacher is scoped to AIM lesson and skill context only.
- No full provider integration in Phase 1. This is a gateway boundary skeleton.
- All AI Teacher requests must carry lesson context, skill context, mode, and student-safe field constraints.
- All AI Teacher responses must pass safety validation before reaching any consumer.

## Phase 1 Scope

Phase 1 creates the module boundary, service stub, and contract foundation only. Full provider integration is Phase 2 work.

## Files

- `ai-teacher.module.ts` — NestJS module. Imports ConfigModule. Exports AiTeacherService.
- `ai-teacher.service.ts` — Gateway service stub. Reads AI_PROVIDER_API_KEY from ConfigService only.
  Exposes `isAvailable()` for health/readiness checks.

## Forbidden

- Exposing `AI_PROVIDER_API_KEY` to any response, log, or client.
- Implementing general conversational AI behavior.
- Calling the AI provider from Flutter Mobile or Admin Dashboard.
- Bypassing safety validation on AI Teacher responses.

## Related

- `docs/ai-teacher/behavior-rules.md` — Behavioral rules and constraints.
- `packages/shared-contracts/api/ai-teacher-contracts.md` — Request/response contracts (P1-054).
- `services/backend-api/src/features/ai-teacher/` — This module.
