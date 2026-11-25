# 16 — Graduation Defense Question Bank

## 1. General & Contribution Questions
1. **What exactly did you develop yourself?**
   - *EN*: We architected and implemented the multi-client AIM Platform: the NestJS backend (`services/backend-api`), the FastAPI adaptive engine (`services/aim-engine`) with explainable mastery/weakness/difficulty/recommendation algorithms (`services/api/src/aim/domain/services`), the PostgreSQL/Prisma schema, and the Flutter/React/Next.js interfaces.
   - *AR*: قمنا بتصميم وتطوير منصة AIM متعددة الواجهات: الخادم الخلفي بـ NestJS، ومحرك التعلم التكيفي بـ FastAPI مع خوارزميات حساب الإتقان واكتشاف نقاط الضعف وتكييف الصعوبة، وقاعدة بيانات PostgreSQL عبر Prisma، وتطبيقات Flutter و React و Next.js.
2. **Why not just use ChatGPT directly?**
   - *EN*: ChatGPT has no persistent learner model, no structured curriculum state, no mastery/retention tracking, and cannot enforce difficulty adaptation or Arabic-English pedagogical guardrails.

## 2. Adaptive Learning & AI Questions
3. **Why is response time excluded from `MasteryCalculator`?**
   - *EN*: `mastery_calculator.py` intentionally excludes response time so thoughtful learners are not penalized for reading carefully; speed is handled separately from mastery evidence.
4. **How does `DifficultyAdapter` decide to increase or decrease difficulty?**
   - *EN*: It computes `readiness_score = 0.45*mastery + 0.25*consistency + 0.20*retention + 0.10*(reliability*100)`, but evaluates risk signals (`weakness_score`, `frustration_score`, `repeated_failure_count`) **first** to safely decrease difficulty before considering an increase.
5. **Why didn't you fine-tune your own LLM?**
   - *EN*: Fine-tuning requires large curated datasets and GPU hosting. Our contribution is the **adaptive learner model + context-injected orchestration** using external LLM/STT/TTS APIs, which is cost-effective and avoids small-model hallucinations.

## 3. Architecture, Security & Database Questions
6. **Why separate `services/backend-api` (NestJS) and `services/aim-engine` (FastAPI)?**
   - *EN*: Separation of concerns: NestJS handles auth, RBAC, Prisma DB, and billing; Python/FastAPI isolates adaptive math and future ML (`packages/ml`) behind an internal `HTTPBearer` service token.
7. **How do you prevent SQL Injection and Mass Assignment?**
   - *EN*: Prisma ORM uses parameterized queries, and NestJS `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true`) strips/rejects unexpected fields.
8. **How do you prove your system works?**
   - *EN*: Automated verification: 3,916 backend tests, 246 admin tests, and 666 student-web tests pass locally (`CLEANUP_README.md`).
