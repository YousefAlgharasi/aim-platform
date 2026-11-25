# 00 — Project Overview

## 1. What Is the AIM Platform?

### Simple Explanation (Non-Technical)
The **AIM Platform** is an intelligent, adaptive English-learning ecosystem designed for Arabic-speaking learners (with full Arabic RTL and English LTR support). Instead of giving every student the same static lessons, AIM watches how each student answers questions, detects their specific weaknesses (such as grammar rules, vocabulary retention, or pronunciation), adjusts exercise difficulty in real time, and provides an AI Teacher and Voice Teacher for interactive practice. It also includes an Admin Dashboard for content/operations management, a Student Web portal, and Parent Dashboard capabilities.

### Advanced Explanation (Technical Examiners)
**AIM Platform** is a polyglot, multi-service monorepo implementing an adaptive English-learning system:
- **Client Layer**:
  - `apps/mobile`: Flutter (`>=3.3.0 <4.0.0`) learner mobile app using `flutter_riverpod`, `go_router`, `flutter_secure_storage`, `record`, and `audioplayers`.
  - `apps/student-web`: React 19 + TypeScript + Vite 8 + Tailwind CSS web portal for students.
  - `apps/admin-dashboard`: Next.js 16 (`^16.2.9` / `16.4.6` in lockfile) + React 19 + TanStack Query + Zod internal admin portal.
  - `apps/web`: Retained pilot web application containing parent-dashboard functionality.
- **Application & Orchestration Layer**:
  - `services/backend-api`: NestJS 11 (`@nestjs/core ^11.1.27`) TypeScript API gateway and business-logic service using Prisma 7.10.1 (`@prisma/client`) over PostgreSQL (Supabase), JWT/Google OAuth (`passport-google-oauth20`), `@nestjs/throttler`, `helmet`, and `compression`.
- **Adaptive & AI Analysis Layer**:
  - `services/aim-engine`: Python 3.11+ FastAPI (`>=0.115.0`) microservice (`AimAnalysisPipelineEntrypoint`) that executes the adaptive-learning pipeline, importing domain algorithms from `services/api/src/aim/domain/services` and `packages/ai_core`.
  - `services/backend-api/src/features/ai-teacher` and `voice-teacher`: Integrates external LLM (`AI_PROVIDER_API_KEY`), Speech-to-Text (`STT_PROVIDER_API_KEY`), and Text-to-Speech (`TTS_PROVIDER_API_KEY`) providers, keeping all credentials and adaptive decisions on the backend.

---

## 2. Problem Statement & Importance

### What Problem Does It Solve?
1. **One-Size-Fits-All Language Learning**: Traditional e-learning platforms present a fixed linear curriculum regardless of a learner's prior knowledge, forgetting curve, or specific error patterns.
2. **Lack of Immediate, Contextualized Feedback**: Learners—especially Arabic speakers learning English—struggle with L1-to-L2 transfer errors (e.g., tense usage, prepositions, pronunciation) without an available tutor.
3. **Disconnected Assessment & Practice**: Placement tests, daily lessons, vocabulary review, and conversational practice are often siloed rather than feeding into a unified learner model.

### Why Is This Problem Important?
- Personalized, mastery-based instruction significantly improves retention and reduces learner frustration.
- Combining **quantitative adaptive modeling** (mastery calculation, retention tracking, weakness detection, difficulty adaptation) with **qualitative conversational AI** (AI Teacher & Voice Teacher) bridges the gap between structured curriculum and real-world communication.

---

## 3. Target Users

1. **Primary Users (Learners / Students)**: Arabic-speaking and English-learning students using `apps/mobile` (Flutter) or `apps/student-web` (React).
2. **Parents / Guardians**: Tracking student progress via parent-dashboard endpoints (`services/backend-api/src/features/parents`) and `apps/web`.
3. **Administrators & Content Managers**: Managing curriculum, billing/coupons, operations, and analytics via `apps/admin-dashboard` (Next.js).

---

## 4. Functional & Non-Functional Requirements

### Functional Requirements
- **Authentication & Onboarding**: Email/password & Google OAuth (`apps/mobile`, `services/backend-api/src/auth`), placement testing (`features/placement`).
- **Structured Curriculum**: Courses, chapters, lessons, exercises, vocabulary library (`features/curriculum`, `student-courses`, `student-chapters`, `student-lessons`, `vocabulary-library`).
- **Adaptive Learning Engine**: Performance analysis, mastery calculation, weakness detection, difficulty adaptation, retention tracking, and micro-goal/recommendation generation (`services/aim-engine`, `packages/ai_core`).
- **AI & Voice Tutoring**: Text-based AI Teacher (`features/ai-teacher`) and audio-based Voice Teacher (`features/voice-teacher`) with STT/TTS.
- **Engagement & Gamification**: Achievements, certificates, streaks/engagement, notifications (`features/achievements`, `certificates`, `engagement`, `notifications`).
- **Billing & Access Control**: Course billing, coupon/payment approval (`features/billing`, `course-billing`).

### Non-Functional Requirements
- **Security**: Backend-only adaptive decisions and API credentials, Helmet HTTP headers, CORS allowlisting, rate limiting (`@nestjs/throttler`), JWT verification (Supabase), `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **Performance**: Gzip/Brotli response compression (`compression` threshold 1024 bytes, skipping `text/event-stream` and `audio/`), slow-request logging (`SLOW_REQUEST_MS=800`).
- **Localization**: Arabic (RTL) and English (LTR) support in `apps/mobile`.
- **Reliability & Maintainability**: Automated CI workflows, unit/integration test suites (Jest for Node, Pytest for Python, Flutter test), and artifact/security checks (`scripts/check-repository-artifacts.cjs`).

---

## 5. Differentiation, Contributions & Limitations

### What Makes AIM Different?
- **Hybrid Architecture**: Separates transactional/auth/API orchestration (NestJS + Prisma) from mathematical/adaptive analysis (Python FastAPI `aim-engine`).
- **Multi-Dimensional Learner Model**: `packages/ai_core` models not just accuracy, but confidence (`confidence_matrix.py`), retention (`retention_tracker.py`), error patterns (`error_pattern_classifier.py`), skill graphs (`skill_graph.py`), and emotional/frustration signals (`emotional_state_detector.py`).
- **Voice + Text AI Tutoring**: Real microphone recording (`record` package in Flutter) integrated with backend STT/LLM/TTS pipelines.

### Academic & Technical Contributions
- **Technical Contribution**: A production-structured, multi-client, polyglot microservices architecture with strict contract validation, comprehensive test suites (3,916 backend tests, 246 admin tests, 666 student-web tests reported in `CLEANUP_README.md`), and containerized deployment (`render.yaml`).
- **Academic Contribution**: Integration of rule-based/statistical adaptive learning algorithms (mastery, spaced retention, skill dependency graphs, difficulty adaptation) with LLM-based conversational tutoring.

### Honest Limitations (Critical Self-Awareness)
1. **No Custom-Trained LLM**: The AI Teacher uses external LLM/STT/TTS provider APIs (`AI_PROVIDER_API_KEY`), not a custom-trained or LoRA fine-tuned model.
2. **Heuristic/Rule-Based Adaptation**: The adaptive algorithms in `packages/ai_core` and `services/aim-engine` are primarily deterministic/statistical heuristics rather than deep-learning knowledge tracing (DKT) trained on large-scale student datasets.
3. **Legacy Tree Retention**: Both `services/api` and `apps/web` are retained alongside `services/aim-engine` and `apps/student-web`, creating architectural duplication that requires future consolidation.
