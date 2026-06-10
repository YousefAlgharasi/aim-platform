# Phase 1 — Local Development Guide

## Purpose

This document explains the Phase 1 repository layout, active services, local setup approach, and how Phase 1 differs from the completed MVP pilot. Any developer onboarding to this repository should read this document first.

---

## Phase 1 vs Completed MVP Pilot

Phase 1 is System Foundation. It is **not** a continuation of the MVP pilot stack.

| Area | Completed MVP Pilot | Phase 1 — System Foundation |
|---|---|---|
| Learner client | React Web (`apps/web/`) | Flutter Mobile (`apps/mobile/`) |
| Backend API | FastAPI (Python) | NestJS + TypeScript (`services/backend-api/`) |
| AIM Engine | Python backend module | Python service/module (`services/aim-engine/`) |
| Database | Supabase PostgreSQL | Supabase PostgreSQL |
| Auth | Supabase Auth | Supabase Auth |
| Admin surface | None | Internal Admin Dashboard foundation (`apps/admin-dashboard/`) |
| Student Web App | React Web | **Deferred — Optional — Phase 7 or later** |

The existing `apps/web/` directory is a historical MVP pilot artifact. It must not be extended or treated as the Phase 1 learner client.

FastAPI is the completed pilot API. It is **not** the Phase 1 Backend API. Do not add FastAPI routes, modules, or services as Phase 1 work.

---

## Active Phase 1 Services and Apps

### `apps/mobile/` — Flutter Mobile

Phase 1 learner client. App shell and architecture skeleton only in Phase 1.

- Does not calculate mastery, level, weakness, difficulty, retention, or recommendations.
- Does not call AIM Engine or AI Teacher Gateway directly.
- Renders backend-approved outputs only.

### `apps/admin-dashboard/` — Internal Admin Dashboard

Internal-use admin surface. Foundation skeleton only in Phase 1.

- Not a public-facing product.
- Phase 1 scope is layout, routing, and module placeholder only.

### `services/backend-api/` — NestJS + TypeScript

Phase 1 Backend API. Owns auth, authorization, orchestration, and safe response shaping.

- Validates Supabase JWT on every authenticated request.
- Calls the AIM Engine through backend-internal integration only.
- Does not expose AI provider keys to any client.

### `services/aim-engine/` — Python AIM Engine

Backend-owned adaptive intelligence service. Never runs in any client.

- Owns mastery calculation, student level, weakness, difficulty, retention, and recommendations.
- Speed (`response_time_seconds`, `avg_response_time`, `speed_score`) does not directly affect mastery, student level, or difficulty increase.

### `packages/shared-contracts/` — Shared Contracts

Cross-service contract definitions. Used by Backend API, Flutter Mobile, and Admin Dashboard. Documentation and schema only — no runtime business logic.

### `infra/docker/` — Docker Compose

Local multi-service orchestration. Recommended for running all services together locally.

### `scripts/` — Scripts

Convenience scripts for install, run, and test workflows. See `scripts/README.md`.

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
│   ├── phase-1/                   # Phase 1 charter, rules, decisions, and reviews
│   └── ...                        # Additional product, API, mobile, security docs
├── database/
│   └── supabase/                  # Supabase migrations, policies, and seed
├── .env.example                   # Environment variable template (placeholders only)
├── README.md
└── CONTRIBUTING.md
```

For the full folder definitions and constraints, see `docs/phase-1/repo-structure.md`.

---

## Local Setup

Each service manages its own dependencies. There is no root-level workspace manager.

### Backend API (`services/backend-api/`)

```bash
cd services/backend-api
npm install
npm run start:dev
```

### AIM Engine (`services/aim-engine/`)

```bash
cd services/aim-engine
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Flutter Mobile (`apps/mobile/`)

```bash
cd apps/mobile
flutter pub get
flutter run
```

### Admin Dashboard (`apps/admin-dashboard/`)

```bash
cd apps/admin-dashboard
npm install
npm run dev
```

### All Services via Docker Compose

```bash
cd infra/docker
docker compose up
```

See `infra/docker/README.md` for service configuration and port assignments.

---

## Environment Variables

Copy `.env.example` to the appropriate service directory and fill in real values locally. Never commit real credentials.

```bash
cp .env.example services/backend-api/.env
```

The `.env.example` file contains placeholders only. No real secrets are stored in the repository.

---

## Phase 1 Scope

Phase 1 creates skeleton structure and system foundation only. Full feature implementation begins in Phase 2.

**Phase 1 does not include:**

- Full feature implementation of any service.
- Student Web App or React/Next.js learner interface.
- Production-grade admin platform.
- AIM logic in any client (Flutter, admin, web).
- AI provider keys or privileged credentials in any client.
- Speed as a direct mastery, level, or difficulty signal.

---

## Related Documents

- `docs/phase-1/system-foundation-charter.md` — Phase 1 definition, stack lock, and forbidden work.
- `docs/phase-1/repo-structure.md` — Authoritative folder structure and folder constraints.
- `docs/phase-1/workspace-tooling.md` — Per-service tooling decisions.
- `docs/phase-1/task-execution-rules.md` — Task claiming, execution, and completion rules.
