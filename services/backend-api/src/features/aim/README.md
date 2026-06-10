# Backend AIM Feature Boundary

This feature contains the Backend API side of the AIM Engine integration.

## P1-031 scope

P1-031 adds only an internal backend-to-AIM integration stub.

It provides:

- `AimEngineClientService`
- `AimService`
- typed AIM Engine health result models

## Current integration

The only supported call in this task is:

```text
GET {AIM_ENGINE_URL}/health
```

The Backend API reads the AIM Engine base URL from validated backend config.

## Non-negotiable boundaries

- Flutter Mobile must not call AIM Engine directly.
- Admin Dashboard must not call AIM Engine directly.
- Public clients must call the Backend API only.
- Backend API is the integration owner for AIM Engine.
- Do not expose AIM Engine internals directly to clients.
- Do not add adaptive-learning calculations in this task.
- Do not log secrets, tokens, learner answers, or provider keys.

## Future tasks

Later tasks may add internal endpoints, DTOs, and orchestration calls after the AIM Engine contracts and pipeline boundaries are stable.
