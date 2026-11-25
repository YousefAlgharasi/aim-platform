# 11 — Complete Feature Execution Flows

## Flow 1: User Login (Mobile / Web)
`User enters credentials or taps Google Sign-In` → `apps/mobile` (`google_sign_in` / `http`) → `POST /auth/...` → `services/backend-api/src/auth` → `Supabase Auth / Google OAuth` → `Prisma User/StudentProfile lookup` → `JWT returned` → `Stored in flutter_secure_storage`.

## Flow 2: Student Submits Exercise & Adaptive Update
`Student answers question` → `apps/mobile` / `student-web` → `POST /practice/...` → `services/backend-api/src/features/practice` → `Prisma saves attempt` → `features/aim` calls `POST /aim/v1/analysis` on `aim-engine` → `AimAnalysisPipelineEntrypoint` runs `MasteryCalculator`, `WeaknessDetector`, `DifficultyAdapter`, `RecommendationEngine` → `Returns next action & target difficulty` → `UI updates`.

## Flow 3: Voice Teacher Turn
`Student holds mic button` → `apps/mobile` (`record` package) → `Uploads audio` → `POST /voice-teacher/...` → `services/backend-api/src/features/voice-teacher` → `External STT API` → `Transcript + AiContextSnapshot` → `External LLM API` → `External TTS API` → `Audio + text returned` → `apps/mobile` plays via `audioplayers`.
