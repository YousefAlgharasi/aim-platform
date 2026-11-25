# 02 — Complete File and Folder Structure

## 1. Repository Tree (Top-Level & Key Subtrees)

```text
aim-platform/
├── apps/
│   ├── mobile/                  # Flutter learner app (Riverpod, GoRouter, audio recording)
│   ├── student-web/             # React 19 + Vite 8 + Tailwind CSS student web portal
│   ├── admin-dashboard/         # Next.js 16 + React 19 + TanStack Query admin portal
│   └── web/                     # Retained pilot web app (includes parent-dashboard)
├── services/
│   ├── backend-api/             # NestJS 11 TypeScript API & BFF
│   │   ├── prisma/              # schema.prisma & migrations
│   │   └── src/
│   │       ├── main.ts          # Bootstrap: Helmet, Compression, CORS, ValidationPipe, OpenAPI
│   │       ├── app.module.ts    # Root module wiring Config, Prisma, Throttler, Features
│   │       ├── auth/            # Supabase JWT & Google OAuth 2.0 guards/strategies
│   │       ├── config/          # Environment & BackendConfigService
│   │       ├── database/        # PrismaService lifecycle
│   │       └── features/        # 30+ domain modules (ai-teacher, voice-teacher, aim, billing, etc.)
│   ├── aim-engine/              # Python 3.11+ FastAPI adaptive-learning microservice
│   │   └── app/
│   │       ├── main.py          # FastAPI factory, AimAnalysisPipelineEntrypoint, safe error handler
│   │       ├── api/             # router.py, analysis.py, system.py
│   │       ├── core/            # config.py, service_info.py, auth
│   │       ├── domain/          # Domain adapters
│   │       ├── errors/          # AimSafeFailureBuilder (no stack trace leaks)
│   │       ├── pipeline/        # AimAnalysisPipelineEntrypoint
│   │       ├── schemas/         # Pydantic v2 request/response contracts
│   │       └── validation/      # Input validation
│   └── api/                     # Legacy Python API; aim.domain.services still imported by aim-engine
├── packages/
│   ├── ai_core/                 # 14 Python adaptive-learning & cognitive modeling modules
│   ├── ml/                      # ML data pipeline, training, evaluation, A/B testing scripts
│   ├── content/                 # Shared curriculum/content assets
│   └── shared-contracts/        # Shared API/schema contracts
├── database/                    # SQL migrations, schema, and seed sources
├── infra/                       # Docker & infrastructure configuration
├── scripts/                     # Repository guard scripts (check-repository-artifacts.cjs)
├── docs/                        # Phase history, architecture, operations docs
├── render.yaml                  # Render.com Blueprint for aim-backend-api & aim-engine
└── CLEANUP_README.md            # Repository cleanup & verification audit
```

---

## 2. Most Important Files to Understand Before Your Defense

| File Path | Purpose & Why It Matters | What Happens If Removed |
| :--- | :--- | :--- |
| `services/backend-api/src/main.ts` | Entry point of the NestJS API; configures `helmet`, `compression`, `ValidationPipe`, CORS, trust proxy, and OpenAPI. | Backend API cannot start. |
| `services/backend-api/prisma/schema.prisma` | Defines the entire PostgreSQL relational data model (users, courses, lessons, attempts, billing). | Prisma client generation and all DB queries fail. |
| `services/backend-api/src/features/ai-teacher/` | Orchestrates LLM-based text tutoring using `AI_PROVIDER_API_KEY`. | AI Teacher chat stops working. |
| `services/backend-api/src/features/voice-teacher/` | Orchestrates STT -> LLM -> TTS voice tutoring pipeline. | Voice Teacher feature breaks. |
| `services/backend-api/src/features/aim/` | Bridges NestJS backend with the Python `aim-engine` service. | Adaptive recommendations/analysis stop. |
| `services/aim-engine/app/main.py` | FastAPI entry point initializing `AimAnalysisPipelineEntrypoint` and safe failure handling. | AIM Engine microservice cannot boot. |
| `services/aim-engine/app/pipeline/aim_analysis_pipeline.py` | Coordinates the end-to-end adaptive analysis pipeline. | `/analyze` endpoint fails. |
| `packages/ai_core/mastery_calculator.py` | Computes learner mastery scores per skill. | Mastery tracking breaks. |
| `packages/ai_core/weakness_detector.py` | Identifies weak skills and error patterns. | Weakness detection breaks. |
| `packages/ai_core/recommendation_engine.py` | Generates personalized next-step learning recommendations. | Adaptive lesson/exercise selection breaks. |
| `render.yaml` | Defines production deployment topology for Render. | Automated Render Blueprint deployment breaks. |
