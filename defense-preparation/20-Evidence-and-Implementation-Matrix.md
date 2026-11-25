# 20 — Evidence and Implementation Matrix

| Project Claim | Actual File / Symbol | Verification Status |
| :--- | :--- | :--- |
| **NestJS Backend with Security Middleware** | `services/backend-api/src/main.ts` (`helmet`, `compression`, `ValidationPipe`) | Verified in source; 3,916 tests pass (`CLEANUP_README.md`) |
| **FastAPI Adaptive Engine** | `services/aim-engine/app/main.py` (`AimAnalysisPipelineEntrypoint`) | Verified in source |
| **Service-Token Guard on `/aim/v1/analysis`** | `services/aim-engine/app/api/analysis.py` (`secrets.compare_digest`) | Verified in source |
| **Mastery Calculation V2 (No Speed)** | `services/api/src/aim/domain/services/mastery_calculator.py` (`AttemptSnapshot`) | Verified in source |
| **Weakness Detection V2** | `services/api/src/aim/domain/services/weakness_detector.py` (`WeaknessDetector`) | Verified in source |
| **Difficulty Adaptation V2** | `services/api/src/aim/domain/services/difficulty_adapter.py` (`DifficultyAdapter.decide`) | Verified in source |
| **Recommendation Engine V2** | `services/api/src/aim/domain/services/recommendation_engine.py` (`RecommendationActionType`) | Verified in source |
| **PostgreSQL + Prisma Schema** | `services/backend-api/prisma/schema.prisma` (`User`, `AiChatSession`, `VoiceSession`) | Verified in source |
| **External AI/STT/TTS Integration** | `render.yaml` (`AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, `TTS_PROVIDER_API_KEY`) | Verified in config |
| **Flutter Mobile Audio & Auth** | `apps/mobile/pubspec.yaml` (`record`, `audioplayers`, `google_sign_in`) | Verified in manifest |
