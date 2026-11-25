# 03 — Technology Stack: What, How, and Why

## 1. Backend & APIs
- **Node.js 24 + TypeScript (`^6.0.3`) + NestJS 11 (`@nestjs/core ^11.1.27`)**:
  - *What*: Enterprise-grade Node.js framework with dependency injection, modular architecture, and decorators.
  - *Where*: `services/backend-api/`.
  - *Why*: Enforces clean separation across 30+ domain modules (`features/`), built-in `ValidationPipe` (`class-validator`), `@nestjs/throttler` rate limiting, and `@nestjs/swagger` OpenAPI generation.
  - *Alternatives*: Express.js (less structured), Fastify (faster raw throughput, less batteries-included), Python Django/FastAPI monolith.
- **Prisma ORM (`7.10.1`) + PostgreSQL (`pg ^8.13.1`)**:
  - *What*: Type-safe ORM generating a TypeScript client from `schema.prisma`.
  - *Why*: Eliminates raw SQL boilerplate, prevents SQL injection via parameterized queries, and manages schema migrations.

## 2. Adaptive & AI Engine
- **Python 3.11+ + FastAPI (`>=0.115.0`) + Pydantic v2 (`>=2.8.0`) + Uvicorn**:
  - *What*: High-performance async Python web framework with automatic OpenAPI & strict runtime data validation.
  - *Where*: `services/aim-engine/`.
  - *Why*: Isolates adaptive-learning math (`packages/ai_core`) and ML tooling (`packages/ml`) in Python.

## 3. Frontend & Mobile Clients
- **Flutter (`sdk >=3.3.0 <4.0.0`) + Riverpod (`^2.5.1`) + GoRouter (`^14.6.2`)**:
  - *Where*: `apps/mobile/`.
  - *Why*: Cross-platform iOS/Android from one codebase, native RTL/LTR localization (`flutter_localizations`, `intl`), and hardware microphone/audio support (`record ^7.1.1`, `audioplayers ^6.8.1`).
- **React 19 + Vite 8 (`^8.0.0`) + Tailwind CSS (`^3.4.17`)**:
  - *Where*: `apps/student-web/`. (Migrated from `react-scripts` to Vite 8, reducing npm audit advisories from 31 to 0).
- **Next.js 16 (`16.4.6`) + React 19 + TanStack Query + Zod**:
  - *Where*: `apps/admin-dashboard/`.

## 4. Authentication, Security & Deployment
- **Supabase Auth + `passport-google-oauth20`**: JWT-based stateless authentication (`SUPABASE_JWT_SECRET`, `SUPABASE_JWT_ISSUER`).
- **Helmet (`^8.2.0`) & Compression (`^1.8.2`)**: HTTP security headers and gzip/brotli response compression.
- **Render (`render.yaml`) + Docker**: Containerized deployment for `aim-backend-api` and `aim-engine`.
