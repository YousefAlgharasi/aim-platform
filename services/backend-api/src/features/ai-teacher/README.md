# AI Teacher Gateway — Boundary Module

## Boundary Rules

This module is backend-only. No client (Flutter Mobile, admin dashboard, or any frontend)
may call this service or any AI provider directly.

- Clients call Backend API endpoints only.
- Backend API calls `AiTeacherService` internally.
- `AiTeacherService` is the sole gateway to the provider layer.
- AI provider keys are read from backend environment only and never exposed to clients.
- Raw provider responses are validated before reaching any client.

## What This Module Does (Phase 1 Scope)

- Defines the AI Teacher invocation contract (`AiTeacherContext`, `AiTeacherResponse`).
- Defines hook type constants (`explain_more`, `give_example`, `explain_step`, `explain_why`, `retry_with_help`).
- Enforces invocation limits per session.
- Validates responses against word limits and answer-leakage rules.
- Returns a safe fallback when the provider is unavailable or validation fails.
- Records invocation metadata for audit and AIM Engine input.

## What This Module Does NOT Do (Phase 1)

- Does not call a live AI provider (provider integration is a later phase).
- Does not implement full prompt engineering or conversation history.
- Does not implement streaming.
- Does not allow clients to bypass the backend gateway.

## Usage

```typescript
const response = await this.aiTeacherService.explain(context);
this.aiTeacherService.recordInvocation(record);
```

Import via the features module barrel or directly from this directory.
