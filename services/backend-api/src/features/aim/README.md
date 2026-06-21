# Backend AIM Feature

This feature owns all backend-side AIM Engine integration per Phase 5.

## P5-043 — Phase 5 skeleton

Extends the existing feature with the subdirectory structure defined in
`docs/phase-5/backend-aim-pipeline-map.md`.

### Directory layout

```
aim/
├── adapter/                     # AIM Engine HTTP adapter (sole caller)
│   └── aim-engine-adapter.service.ts
├── pipeline/                    # Pipeline orchestrator + state assembly
│   ├── aim-pipeline-orchestrator.service.ts
│   └── aim-state-assembly.service.ts
├── persistence/                 # AIM result persistence + audit log
│   ├── aim-persistence.service.ts
│   └── aim-audit.service.ts
├── result/                      # Read-only AIM result APIs
│   └── aim-result.service.ts
├── aim-engine-client.service.ts # Health check client (pre-Phase 5)
├── aim-engine-client.types.ts   # Health result types (pre-Phase 5)
├── aim.module.ts                # NestJS module (updated P5-043)
└── aim.service.ts               # Facade service (pre-Phase 5)
```

### Pipeline stage ownership

| Stage | Directory | Task |
|-------|-----------|------|
| 2 — Pipeline trigger | `pipeline/` | P5-056 |
| 3 — State assembly | `pipeline/` | P5-047, P5-052–P5-055 |
| 4 — AIM Engine call | `adapter/` | P5-045, P5-049–P5-050 |
| 5 — Response validation | `adapter/` | P5-048 |
| 6 — Persistence | `persistence/` | P5-057–P5-062 |
| 7 — Result APIs | `result/` | P5-064 |
| 8 — Safe fallback | `adapter/` | P5-050 |
| Audit | `persistence/` | P5-063 |

### Non-negotiable boundaries

- **Only this module** calls the AIM Engine. No other module, controller,
  or client may call `POST /aim/v1/analysis` or any AIM Engine endpoint.
- Flutter, Admin Dashboard, and all clients are prohibited from calling
  the AIM Engine directly.
- No AIM-owned value (mastery, level, weakness, difficulty, recommendations,
  review schedules, retention, frustration) is computed by the Backend.
  These are exclusively AIM Engine outputs validated and persisted here.
- No unvalidated AIM response is ever persisted.
- Speed and response-time signals are forwarded as raw behavioral context
  only — never used to compute mastery, level, or difficulty.
- No secrets, service-role keys, database credentials, or AI provider keys
  are stored, logged, or exposed here.
