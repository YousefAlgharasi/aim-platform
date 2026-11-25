# 10 — APIs and Communication

## 1. Communication Architecture
- **Clients -> Backend API**: HTTPS REST + JSON (with Bearer JWT from Supabase/Google OAuth).
- **Backend API -> AIM Engine**: Internal HTTP `POST /aim/v1/analysis` (`services/aim-engine/app/api/analysis.py`) authenticated via `AIM_ENGINE_SERVICE_TOKEN` (`HTTPBearer`).
- **Backend API -> External AI/Speech**: HTTPS REST calls using `AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, `TTS_PROVIDER_API_KEY`.

## 2. Key Backend Feature Modules (`services/backend-api/src/features/`)
- `auth/` — Login, registration, Google OAuth, JWT validation.
- `placement/` — Initial placement test.
- `student-home/`, `student-courses/`, `student-chapters/`, `student-lessons/` — Learner curriculum navigation.
- `practice/`, `assessments/` — Exercise submission and grading.
- `aim/` — Adapter calling `aim-engine` `POST /aim/v1/analysis`.
- `ai-teacher/` — Text-based AI tutor chat.
- `voice-teacher/` — Audio STT -> LLM -> TTS voice tutor.
- `billing/`, `course-billing/` — Course purchases and coupon approval.
- `parents/`, `admin/`, `reports/`, `analytics/` — Parent & Admin dashboards.

## 3. Security & Validation on Every Endpoint
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` in `services/backend-api/src/main.ts` strips/rejects unknown fields.
- `@nestjs/throttler` enforces rate limiting per real client IP (`trust proxy` = 1).
- `aim-engine` never logs raw request/response bodies or service tokens (`analysis.py` lines 24–28).
