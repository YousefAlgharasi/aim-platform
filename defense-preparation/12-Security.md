# 12 — Security Analysis

## 1. Implemented Security Controls
- **HTTP Headers & CORS**: `helmet()` and explicit `CORS_ORIGINS` allowlist in `services/backend-api/src/main.ts`.
- **Input Validation**: Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` prevents mass-assignment/prototype pollution.
- **Rate Limiting**: `@nestjs/throttler` with `trust proxy` = 1 (`main.ts` lines 17–18) so rate limits apply per real client IP behind nginx/Render.
- **Authentication**: Supabase JWT verification (`SUPABASE_JWT_SECRET`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE`) + Google OAuth 2.0 (`passport-google-oauth20`). Mobile stores tokens in `flutter_secure_storage`.
- **Service-to-Service Auth**: `aim-engine` `/aim/v1/analysis` enforces `HTTPBearer` token verified with `secrets.compare_digest` (constant-time comparison).
- **Safe Error Handling**: `AimSafeFailureBuilder` in `aim-engine/app/main.py` strips stack traces and exception messages from HTTP responses.
- **SQL Injection Protection**: Prisma ORM parameterized queries.
- **Secrets Hygiene**: `scripts/check-repository-artifacts.cjs` rejects tracked `.db` or local account files.

## 2. Recommended Improvements & Known Risks
- **Credential Rotation**: `CLEANUP_README.md` notes 7 exposed pilot account passwords in Git history (`pilot_accounts.local.md` was removed from the working tree, but history purge/password reset is still required).
- **Remaining npm Audit Advisories**: Backend has 6 advisories (3 high via Prisma 7 `@prisma/config` -> `effect`, 3 moderate); Admin has 18 moderate advisories.
- **Prompt Injection**: Backend should enforce strict system-prompt boundaries and output length/schema checks when passing user text to `AI_PROVIDER_MODEL`.
