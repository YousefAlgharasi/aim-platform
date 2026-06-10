# services/backend-api — NestJS Backend API

Phase 1 Backend API. NestJS + TypeScript.

**Phase 1 scope:** App skeleton, config validation, health and version endpoints, global response and error handling, request ID and logging, auth guard skeleton, role and ownership guards, feature module skeletons, OpenAPI setup, and testing foundation.

**Constraints:**
- NestJS + TypeScript is the Phase 1 Backend API. FastAPI is the completed MVP pilot only.
- Does not expose AI provider keys to any client.
- Does not allow cross-student data access.
- Validates Supabase JWT on every authenticated request.
- Calls AIM Engine through backend-internal integration only.

See `docs/phase-1/repo-structure.md` and `docs/phase-1/system-foundation-charter.md`.

## Skeleton

This directory contains the minimal NestJS application shell for Phase 1:

- `src/main.ts` bootstraps the Nest application.
- `src/app.module.ts` defines the empty root module.
- `package.json` defines install, build, and start scripts.
- `tsconfig.json`, `tsconfig.build.json`, and `nest-cli.json` define the TypeScript/Nest build setup.

No feature modules, config validation, health endpoints, auth guards, OpenAPI setup, or business logic are implemented in this task. Those are separate Phase 1 tasks.

## Setup

From this directory:

```bash
npm install
npm run build
npm run start:dev
```

Use Node.js 20 or newer for the supported NestJS dependency line.

The service reads `PORT` from the environment and defaults to `3000` when it is not set.
