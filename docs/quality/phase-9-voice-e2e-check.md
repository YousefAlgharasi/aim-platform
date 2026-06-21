# Phase 9 — Voice End-to-End Check

**Task:** P9-101
**Date:** 2026-06-19
**Result:** End-to-end voice flow verified

## Scope

Traced the complete voice teacher flow from Flutter UI through backend API
controllers, services, and back to the client. Verified route alignment,
data model compatibility, auth enforcement, and backend authority.

## E2E Flow Verification

### 1. Start Voice Session

| Layer | Component | Path/Action |
|-------|-----------|-------------|
| Flutter | `VoiceTeacherRemoteDatasourceImpl.startSession()` | `POST /voice-teacher/sessions` |
| Backend | `VoiceSessionStartController.start()` | `@Post()` on `voice-teacher/sessions` |
| Auth | `SupabaseJwtAuthGuard` | JWT-resolved studentId |
| Response | `StartVoiceSessionResponseModel.fromJson()` | `{ sessionId, createdAt }` |
| **Status** | **ALIGNED** | |

### 2. List Sessions

| Layer | Component | Path/Action |
|-------|-----------|-------------|
| Flutter | `VoiceTeacherRemoteDatasourceImpl.listSessions()` | `GET /voice-teacher/sessions` |
| Backend | `VoiceSessionListController.list()` | `@Get()` on `voice-teacher/sessions` |
| Auth | `SupabaseJwtAuthGuard` | JWT-resolved studentId |
| Response | `VoiceSessionModel.fromJson()` | `{ sessions: [...] }` |
| **Status** | **ALIGNED** | |

### 3. Get Session History

| Layer | Component | Path/Action |
|-------|-----------|-------------|
| Flutter | `VoiceTeacherRemoteDatasourceImpl.getSessionHistory()` | `GET /voice-teacher/sessions/:sessionId/messages` |
| Backend | `VoiceSessionHistoryController.getHistory()` | `@Get(':sessionId/messages')` |
| Auth | `SupabaseJwtAuthGuard` + `VoiceSessionOwnershipGuard` | Student owns session |
| Response | `VoiceMessageModel.fromJson()` | `{ messages: [...] }` |
| **Status** | **ALIGNED** | |

### 4. Submit Audio

| Layer | Component | Path/Action |
|-------|-----------|-------------|
| Flutter | `VoiceTeacherRemoteDatasourceImpl.submitAudio()` | `POST /voice-teacher/sessions/:sessionId/audio` (multipart) |
| Backend | `VoiceAudioSubmitController.submit()` | `@Post(':sessionId/audio')` with `@UseInterceptors(FileInterceptor)` |
| Auth | `SupabaseJwtAuthGuard` + `VoiceSessionOwnershipGuard` | Student owns session |
| Validation | MIME type check, file size limit | Backend-enforced |
| Pipeline | Upload → STT → AI response → TTS → Store | All backend-side |
| Response | `VoiceAudioSubmitResponseModel.fromJson()` | `{ transcript, responseText, audioRef }` |
| **Status** | **ALIGNED** | |

### 5. Audio Playback

| Layer | Component | Path/Action |
|-------|-----------|-------------|
| Flutter | `VoiceTeacherRemoteDatasourceImpl.getAudioPlayback()` | `GET /voice-teacher/audio/:audioRef` |
| Backend | `VoiceAudioPlaybackController.getAudio()` | `@Get(':audioRef')` |
| Auth | `SupabaseJwtAuthGuard` + `VoiceAudioOwnershipGuard` | Student owns audio |
| Response | Raw audio bytes (`Uint8List`) | Binary stream |
| **Status** | **ALIGNED** | |

### 6. Submit Feedback

| Layer | Component | Path/Action |
|-------|-----------|-------------|
| Flutter | `VoiceTeacherRemoteDatasourceImpl.submitFeedback()` | `POST /voice-teacher/sessions/:sessionId/feedback` |
| Backend | `VoiceFeedbackController.submit()` | `@Post(':sessionId/feedback')` |
| Auth | `SupabaseJwtAuthGuard` + `VoiceSessionOwnershipGuard` | Student owns session |
| Validation | `SubmitVoiceFeedbackDto` with class-validator | messageId, rating, comment |
| **Status** | **ALIGNED** | |

## Backend Authority Check

| Authority Area | Backend Controlled | Flutter Direct? |
|---------------|-------------------|----------------|
| STT (Speech-to-Text) | Yes — backend pipeline | No |
| TTS (Text-to-Speech) | Yes — backend pipeline | No |
| AI Response Generation | Yes — voice orchestrator | No |
| Audio Storage | Yes — opaque audioRef | No |
| Mastery/Weakness | Yes — AIM Engine | No |
| Difficulty/Level | Yes — AIM Engine | No |
| Rate Limiting | Yes — VoiceRateLimitPolicyService | No |

## Data Model Compatibility

| Flutter Model | Backend Response | Compatible |
|--------------|-----------------|-----------|
| `VoiceSessionModel` | `{ sessionId, createdAt, messageCount, contextRef }` | Yes |
| `VoiceMessageModel` | `{ id, role, text, audioRef, timestamp }` | Yes |
| `StartVoiceSessionResponseModel` | `{ sessionId, createdAt }` | Yes |
| `VoiceAudioSubmitResponseModel` | `{ transcript, responseText, audioRef }` | Yes |
| `VoiceFeedbackModel` | `{ messageId, rating, comment }` (outbound only) | Yes |

## Auth Enforcement

All 6 endpoints use `SupabaseJwtAuthGuard`. Endpoints accessing session-specific
resources additionally use `VoiceSessionOwnershipGuard` or `VoiceAudioOwnershipGuard`
to verify the authenticated student owns the resource.

## Test Coverage

| Layer | Test Files | Count |
|-------|-----------|-------|
| Backend API | 6 controller spec files + 1 DTO spec | 7 |
| Backend Services | orchestrator, upload, storage, cleanup, rate-limit, etc. | 10+ |
| Flutter Widgets | 5 widget test files | 5 |
| Flutter Models | 1 model test file | 1 |

## Conclusion

The voice teacher E2E flow is fully aligned between Flutter and backend.
All 6 API routes match, data models are compatible, auth is enforced at
every endpoint, and backend authority is maintained for all STT/TTS/AI
operations. No direct provider calls exist in Flutter code.
