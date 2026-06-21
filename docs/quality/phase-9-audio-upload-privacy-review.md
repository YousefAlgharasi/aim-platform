# Phase 9 Audio Upload Privacy Review

**Task:** P9-037
**Date:** 2026-06-19

## Scope

Privacy review of the audio upload pipeline in
`services/backend-api/src/features/voice-teacher/audio-upload/`.

## Files Reviewed

| File | Purpose |
|---|---|
| `audio-upload.service.ts` | Upload orchestration |
| `audio-upload.types.ts` | Input/output types |
| `audio-metadata-persistence.service.ts` | Storage + DB persistence |
| `audio-metadata-persistence.types.ts` | Persistence input types |
| `audio-upload-safe-failure.service.ts` | Safe error boundary |
| `audio-upload.constants.ts` | Validation constants |

## Data Collection

| Data Point | Collected | Justification |
|---|---|---|
| Audio bytes | Yes | Required for STT transcription — core feature |
| MIME type | Yes | Required for validation and storage |
| Duration | Yes | Required for policy enforcement |
| Session ID | Yes | Required for ownership and context |
| Student ID | Yes | Required for ownership verification |

## Data Minimization

| Check | Result |
|---|---|
| Only necessary fields collected | **Pass** — No name, email, device ID, or IP stored in upload types |
| No metadata beyond audio content | **Pass** — Only contentType and durationMs alongside audio bytes |
| No client device fingerprinting | **Pass** — Upload service receives no device info |
| No geolocation data | **Pass** — Not collected |

## Data Retention

| Check | Result |
|---|---|
| Audio cleanup policy exists | **Pass** — `AudioCleanupPolicyService` with 4 eligibility buckets |
| Grace period defined | **Pass** — 24h after transcription complete |
| Hard retention cap | **Pass** — 7 days maximum (`maxRetentionMs`) |
| Orphaned audio cleaned up | **Pass** — `session_ended_before_transcription` bucket |

## Data Access Control

| Check | Result |
|---|---|
| Student can only upload to own sessions | **Pass** — `session.student_id !== input.studentId` check |
| Opaque storage references | **Pass** — `assetId` UUID, no filesystem path |
| No direct audio URL returned | **Pass** — Separate playback endpoint with ownership guard |
| No cross-student data access | **Pass** — Session ownership enforced before storage write |

## Provider Data Flow

| Check | Result |
|---|---|
| Audio bytes sent to STT provider | Deferred to STT Gateway (separate service) |
| No provider credentials in upload service | **Pass** — Upload service has no provider imports |
| No provider response data stored in upload | **Pass** — Upload only creates pending message |

## Client Exposure

| Check | Result |
|---|---|
| Response contains only messageId + assetId + status | **Pass** |
| No audio bytes echoed back | **Pass** |
| No storage path in response | **Pass** |
| No student data beyond what client already knows | **Pass** |
| Error messages are generic | **Pass** — "Bad Request", "Forbidden", fixed fallback |

## PII Assessment

| PII Type | Present | Notes |
|---|---|---|
| Voice recording (biometric) | Yes | Inherent to feature; retention-limited |
| Name / email | No | Not in upload pipeline |
| IP address | No | Not stored by upload service |
| Device identifiers | No | Not collected |
| Location | No | Not collected |

## Consent and Transparency

| Check | Result |
|---|---|
| Microphone permission requested before recording | **Pass** — Flutter `microphone_permission_gate.dart` |
| Arabic fallback for permission messages | **Pass** — Bilingual permission flow |
| User initiates recording explicitly | **Pass** — Record button requires active press |

## Logging Privacy

| Check | Result |
|---|---|
| Uploaded audio bytes not logged | **Pass** — Logger only captures error context |
| Student IDs not in public logs | **Pass** — Server-side structured logging only |
| Safe failure hides internal details | **Pass** — Fixed fallback message to client |

## Verdict

**Pass.** The audio upload pipeline collects only data necessary for
voice transcription, enforces student-scoped access, uses opaque
references, limits retention to 7 days maximum, and does not expose
PII or internal details in responses. Voice recordings (biometric data)
are handled with appropriate retention limits and explicit user consent
via microphone permission flow.
