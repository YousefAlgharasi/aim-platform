# Phase 9 — Voice API Security Review

**Task:** P9-077  
**Date:** 2026-06-19  
**Scope:** Voice Teacher API endpoints (P9-068 through P9-076)

## 1. Authentication

| Endpoint | Guard | Status |
|---|---|---|
| POST /voice-teacher/sessions | SupabaseJwtAuthGuard | Pass |
| POST /voice-teacher/sessions/:id/audio | SupabaseJwtAuthGuard | Pass |
| GET /voice-teacher/sessions/:id/messages | SupabaseJwtAuthGuard | Pass |
| GET /voice-teacher/sessions | SupabaseJwtAuthGuard | Pass |
| GET /voice-teacher/audio/:audioRef | SupabaseJwtAuthGuard | Pass |
| POST /voice-teacher/sessions/:id/feedback | SupabaseJwtAuthGuard | Pass |

All endpoints require a valid JWT. No unauthenticated access is possible.

## 2. Authorization & Ownership

| Resource | Guard | Validation |
|---|---|---|
| Voice session | VoiceSessionOwnershipGuard | studentId from JWT must own the session |
| Audio playback | VoiceAudioOwnershipGuard | studentId from JWT must own the audio |

Students cannot access other students' sessions or audio. Ownership is resolved from the JWT token, not from request parameters — preventing IDOR attacks.

## 3. Input Validation

| DTO | Validators | Status |
|---|---|---|
| StartVoiceSessionDto | @IsOptional, @IsString, @MaxLength(255) | Pass |
| SubmitVoiceFeedbackDto | @IsUUID, @IsEnum, @IsOptional, @IsString, @MaxLength(1000) | Pass |
| Audio upload | MIME type whitelist (audio/webm, audio/wav, audio/ogg, audio/mpeg), 10MB size limit | Pass |

- class-validator decorators enforce type and length constraints
- Audio MIME type validation prevents arbitrary file upload
- File size limit prevents denial-of-service via large uploads

## 4. Backend Authority Enforcement

| Concern | Status | Notes |
|---|---|---|
| STT provider calls | Backend only | SttGateway is an injectable backend service |
| TTS provider calls | Backend only | TtsGateway is an injectable backend service |
| AI provider calls | Backend only | AI Teacher service runs server-side |
| AIM Engine decisions | Backend only | Mastery, weakness, difficulty, recommendations, review schedule never exposed to client |
| Audio storage | Backend only | Opaque audioRef pattern — no provider URLs or filesystem paths leak to client |
| API keys/credentials | Backend only | Injected via ConfigService, never sent in responses |

Flutter receives only opaque references and text responses. No provider endpoints, API keys, or internal paths are exposed.

## 5. Data Exposure

- Session history returns only: message ID, role, text, audioRef (opaque), timestamp
- Session list returns only: session ID, creation date, message count
- Audio playback streams binary data with Content-Type header — no metadata leakage
- Feedback endpoint accepts and stores data; no sensitive information returned

## 6. Common Vulnerability Checks

| Vulnerability | Status | Notes |
|---|---|---|
| SQL Injection | N/A | No raw SQL — uses ORM/service layer |
| XSS | N/A | API-only, no HTML rendering |
| CSRF | Mitigated | JWT Bearer token auth (not cookie-based) |
| IDOR | Mitigated | Ownership guards validate JWT-resolved studentId |
| File upload attacks | Mitigated | MIME whitelist + size limit |
| Path traversal | N/A | audioRef is opaque UUID, not a filesystem path |
| Secret leakage | Pass | No API keys, tokens, or credentials in responses or committed code |

## 7. Summary

The Voice API security posture is sound:
- All endpoints are authenticated via SupabaseJwtAuthGuard
- Ownership guards prevent cross-student data access
- Input validation constrains all user-provided data
- Backend authority over STT, TTS, AI, and AIM decisions is preserved
- No secrets or provider details are exposed to the client
- Opaque audioRef pattern prevents path traversal and information leakage

No critical or high-severity issues found.
