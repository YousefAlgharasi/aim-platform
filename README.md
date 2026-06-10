# AIM Platform

AI-powered English language learning platform. Phase 1 — System Foundation.

---

## Phase 1 Stack

| Layer | Technology |
|---|---|
| Learner client | Flutter Mobile (`apps/mobile/`) |
| Backend API | NestJS + TypeScript (`services/backend-api/`) |
| AIM Engine | Python service/module (`services/aim-engine/`) |
| Admin surface | Internal Admin Dashboard (`apps/admin-dashboard/`) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI Teacher | Backend-only gateway foundation |
| Student Web App | **Deferred — Optional — Phase 7 or later** |

> The existing `apps/web/` directory is a completed MVP pilot artifact. It is not the Phase 1 learner client and must not be extended.

---

## Repository Layout

```
aim-platform/
├── apps/
│   ├── mobile/                    # Flutter Mobile — Phase 1 learner client
│   └── admin-dashboard/           # Internal Admin Dashboard — foundation only
├── services/
│   ├── backend-api/               # NestJS + TypeScript — Phase 1 Backend API
│   └── aim-engine/                # Python — AIM Engine (backend-owned)
├── packages/
│   └── shared-contracts/          # Cross-service API, enums, errors, field contracts
├── infra/
│   └── docker/                    # Docker Compose and container configs
├── scripts/                       # Local dev, CI, and utility scripts
├── docs/
│   ├── phase-1/                   # Phase 1 charter, rules, and decisions
│   └── ...
├── database/
│   └── supabase/                  # Supabase migrations and policies
├── .env.example
├── README.md
└── CONTRIBUTING.md
```

For full folder definitions and constraints, see [`docs/phase-1/repo-structure.md`](docs/phase-1/repo-structure.md).

---

## Local Development

See [`docs/phase-1/local-development.md`](docs/phase-1/local-development.md) for:

- Step-by-step setup for each service.
- Phase 1 vs completed MVP pilot differences.
- Docker Compose multi-service setup.
- Environment variable guidance.

---

## Key Documents

| Document | Purpose |
|---|---|
| [`docs/phase-1/system-foundation-charter.md`](docs/phase-1/system-foundation-charter.md) | Phase 1 definition, stack lock, forbidden work, and acceptance gates |
| [`docs/phase-1/repo-structure.md`](docs/phase-1/repo-structure.md) | Authoritative folder structure and per-folder constraints |
| [`docs/phase-1/workspace-tooling.md`](docs/phase-1/workspace-tooling.md) | Per-service package management and tooling decisions |
| [`docs/phase-1/task-execution-rules.md`](docs/phase-1/task-execution-rules.md) | Task claiming, execution, and completion rules |
| [`docs/phase-1/local-development.md`](docs/phase-1/local-development.md) | Local setup guide for all Phase 1 services |

---

## Phase 1 Constraints

- Do not create a Student Web App or React/Next.js learner interface.
- Do not use FastAPI as the Phase 1 Backend API.
- Do not move AIM Engine logic into Flutter or any client.
- Do not expose AI provider keys or privileged credentials in any client.
- Do not use speed as a direct mastery, level, or difficulty signal.

Phase 1 creates skeleton structure and system foundation only. Full feature implementation begins in Phase 2.
