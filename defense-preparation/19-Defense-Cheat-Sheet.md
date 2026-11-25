# 19 — Defense Cheat Sheet (Quick Reference)

- **Backend**: NestJS 11 + TypeScript + Prisma 7.10.1 + PostgreSQL (Supabase), Port `3000`.
- **Adaptive Engine**: Python 3.11+ FastAPI (`services/aim-engine`), endpoint `POST /aim/v1/analysis`, protected by `AIM_ENGINE_SERVICE_TOKEN`.
- **Mobile**: Flutter + Riverpod + GoRouter + `record` + `audioplayers` + `flutter_secure_storage`.
- **Web**: `student-web` (React 19 + Vite 8), `admin-dashboard` (Next.js 16 + TanStack Query).
- **Readiness Formula**: `0.45*mastery + 0.25*consistency + 0.20*retention + 0.10*(reliability*100)`.
- **Test Counts**: Backend `3,916` passed; Admin `246` passed; Student Web `666` passed.
