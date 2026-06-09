# Phase 1 — Repository Structure

## Purpose

This document defines the approved monorepo structure for Phase 1 — System Foundation. This structure is authoritative for all Phase 1 implementation tasks. Agents must verify the actual repository structure matches this document before creating service folders.

## Active Phase 1 Stack Reference

| Layer | Technology |
|---|---|
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| AIM Engine | Python service/module |
| Admin surface | Internal Admin Dashboard foundation |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI Teacher | Backend-only gateway foundation |
| Student Web App | **Deferred — not in this repository** |

## Top-Level Structure

```
aim-platform/
├── apps/
│   ├── mobile/                    # Flutter Mobile — learner client
│   └── admin-dashboard/           # Internal Admin Dashboard — foundation only
├── services/
│   ├── backend-api/               # NestJS + TypeScript — Backend API
│   └── aim-engine/                # Python — AIM Engine service/module
├── packages/
│   └── shared-contracts/          # Cross-service API, enums, errors, field contracts
├── infra/
│   └── docker/                    # Docker Compose and container configs
├── scripts/                       # Local dev, CI, and utility scripts
├── docs/
│   ├── phase-1/                   # Phase 1 charter, rules, decisions, and reviews
│   ├── product/                   # Vision, non-negotiables, MVP scope, out-of-scope
│   ├── aim-engine/                # AIM Engine boundary and IO contract
│   ├── api/                       # API planning baseline
│   ├── mobile/                    # Flutter Mobile sitemap
│   ├── security/                  # AI safety and privacy rules
│   ├── admin/                     # Admin dashboard sitemap
│   ├── content/                   # Lesson content structure and question bank standards
│   ├── data/                      # Data model and session capture docs
│   ├── journeys/                  # User journey docs
│   ├── learning/                  # Skill tree and placement test strategy
│   ├── ai-teacher/                # AI teacher behavior rules
│   ├── analytics/                 # Reports scope
│   ├── quality/                   # QA gate and review docs
│   └── tasks/                     # Phase task prompt files
├── database/
│   └── supabase/                  # Supabase migrations, policies, and seed
├── .env.example                   # Environment variable template (placeholders only)
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Folder Definitions

### `apps/mobile/`

Flutter Mobile application. Phase 1 learner client.

**Constraints:**
- Does not calculate mastery, level, weakness, difficulty, retention, or recommendations.
- Does not call AIM Engine or AI Teacher Gateway directly.
- Does not store AI provider keys or privileged backend credentials.
- Renders backend-approved outputs only.

**Phase 1 scope:** App shell, core architecture folders, feature-first folder skeletons, routing placeholder, auth placeholder.

### `apps/admin-dashboard/`

Internal Admin Dashboard. Phase 1 scope is foundation only.

**Constraints:**
- Does not implement a full institute management platform.
- Does not expose learner-private AIM internals to unauthorized roles.
- Backend remains final authorization authority.

**Phase 1 scope:** App shell, layout and routing foundation, API client foundation, role-based menu placeholder, module placeholders.

### `services/backend-api/`

NestJS + TypeScript Backend API. Phase 1 system foundation.

**Constraints:**
- Does not use FastAPI. NestJS + TypeScript is the Phase 1 Backend API.
- Does not expose AI provider keys to any client.
- Does not allow cross-student data access.
- Validates Supabase JWT on every authenticated request.
- Calls AIM Engine through backend-internal integration only.

**Phase 1 scope:** App skeleton, config validation, health and version endpoints, global response and error handling, request ID and logging, auth guard skeleton, role and ownership guard, feature module skeletons, OpenAPI setup, testing foundation.

### `services/aim-engine/`

Python AIM Engine service/module. Backend-owned adaptive intelligence.

**Constraints:**
- Does not run in any client (Flutter, admin dashboard, web).
- `response_time_seconds`, average response time, and speed score do not directly affect mastery, level, or difficulty increase.
- All AIM calculations are owned exclusively by this service.

**Phase 1 scope:** Service skeleton, health and version endpoints, contract models, pipeline interface skeleton, no-speed guard tests.

### `packages/shared-contracts/`

Cross-service contracts. Used by Backend API, Flutter Mobile, and Admin Dashboard.

**Contents:**
- `api/` — Response envelope and error contract documentation.
- `enums/` — Common cross-service enum definitions.
- `safe-fields/` — Learner-safe vs internal field exposure contract.

**Constraints:**
- Does not implement business logic.
- Defines shapes and contracts only.

### `infra/docker/`

Docker Compose foundation for local development. Does not include Student Web App service.

### `scripts/`

Local development, install, test, and CI scripts. Must be documented and safe. No destructive commands.

### `docs/`

All planning, architecture, and Phase 1 documentation. Read-only for most tasks — update only when the task output is a doc file.

### `database/supabase/`

Supabase migration folder, policies, and seed data. Migration and seeding strategy defined in Phase 1 database tasks.

## Files That Must Not Exist Under Phase 1

The following must not be created in this repository during Phase 1:

| Path | Reason |
|---|---|
| `apps/web/` (new) | Student Web App is Deferred |
| `apps/student-web/` | Student Web App is Deferred |
| Any React/Next.js learner app | Student Web App is Deferred |
| `services/fastapi-api/` | FastAPI is completed MVP pilot only |
| AIM calculation logic in `apps/mobile/` | AIM Engine is Python/backend-owned |
| AI provider keys in any `apps/` file | Security non-negotiable |

Note: The existing `apps/web/` directory is a historical MVP pilot artifact. It must not be extended or treated as the Phase 1 learner client. Future cleanup of this directory is outside Phase 1 task scope.

## Implementation Notes

1. Phase 1 creates skeleton structure only. Full feature implementation is Phase 2 and later.
2. Empty folders must contain a `README.md` or `.gitkeep` file to be tracked by git.
3. Each service folder (`apps/`, `services/`) must have its own `README.md` explaining its Phase 1 purpose and constraints.
4. The `packages/shared-contracts/` folder is documentation and schema oriented. No runtime business logic.
5. Any deviation from this structure requires a documented decision in `docs/phase-1/open-decisions.md` before implementation.

## Related Documents

- `docs/phase-1/system-foundation-charter.md`
- `docs/phase-1/task-execution-rules.md`
- `docs/product/non-negotiables.md`
- `docs/aim-engine/boundary-and-io-contract.md`
