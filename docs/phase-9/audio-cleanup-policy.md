# Phase 9 — Audio Cleanup Policy

**Task:** P9-033  
**Branch:** `phase9/P9-033-audio-cleanup-policy`  
**Dependency:** P9-017 (Voice Privacy Policy), P9-032 (Persist Audio Metadata)  
**Output:** `docs/phase-9/audio-cleanup-policy.md`

---

## Purpose

This document defines when and how raw audio files and their associated
`voice_audio_assets` metadata records are deleted after they have served
their purpose in the voice pipeline. It operationalises the privacy
principle in `docs/phase-9/voice-privacy-policy.md` §"Raw Audio Handling
Rules" — that audio should not be retained longer than necessary — by
naming concrete retention windows and specifying the backend service that
enforces them.

---

## Scope

This policy covers:

- **Student-uploaded audio** — raw bytes received via the audio-upload
  endpoint and stored in backend-managed storage by
  `AudioMetadataPersistenceService` (P9-032). Tracked by
  `voice_audio_assets` rows.
- **TTS-generated audio** — audio files produced by the TTS Gateway
  (P9-063/P9-064) and stored in the same backend-managed storage.
  Tracked by `voice_audio_assets` rows with `content_type` of a TTS
  output MIME type.

This policy does **not** cover:

- `voice_transcripts` rows (text, not audio bytes).
- `voice_messages`, `voice_sessions`, or other relational records not
  associated with stored audio bytes.
- AIM Engine outputs (mastery, weakness, difficulty, recommendations,
  review schedules) — those follow the Phase 8 retention policy and
  are outside Phase 9 scope.

---

## Retention Windows

| Audio type | Trigger event | Retention window |
|---|---|---|
| Student-uploaded audio | Voice message status reaches `transcribed` (STT completed successfully) | Delete within **24 hours** of the status transition |
| Student-uploaded audio (STT never completed) | Voice session status reaches `ended` | Delete within **24 hours** of session end |
| TTS-generated audio | Audio has been streamed to the client (audio-stream endpoint confirms delivery), or voice session status reaches `ended`, whichever comes first | Delete within **24 hours** |
| Any audio whose session is older than 7 days | Session `created_at` > 7 days ago | Delete regardless of status (hard cap) |

The 7-day hard cap ensures audio is never retained indefinitely even if
session-end events are missed (e.g. crash before session-end is written).

---

## What Is Deleted

For each expired audio asset:

1. The raw audio file is deleted from backend-managed storage via
   `AudioStorageAdapter.delete(storageKey)`.
2. The corresponding `voice_audio_assets` row is deleted from the
   database.

The `voice_messages.audio_ref` column that references the asset is set
to `NULL` (not deleted — the message row is a conversation history record
and may be retained per the Phase 8 text-chat retention policy).

---

## Who Performs Cleanup

- **`AudioCleanupService`** (P9-033) is the sole backend service
  authorised to delete audio assets. It is called by:
  - A scheduled backend job that runs on a configurable interval
    (default: every 6 hours; overridable via `VOICE_AUDIO_CLEANUP_INTERVAL_MS`).
  - Directly by the voice session-end flow (opportunistic inline cleanup
    for a specific session, in addition to the scheduled sweep).

- Flutter (the mobile client) must never trigger or request audio
  deletion directly. The client has no knowledge of `storageKey` values
  and no endpoint exists to request deletion by key.

---

## What Must Never Happen During Cleanup

- `AudioCleanupService` must not call any STT, TTS, or AI provider.
- `AudioCleanupService` must not read or write any AIM Engine-owned
  field (mastery, weakness, difficulty, recommendation, review schedule).
- Raw audio bytes must never be logged during the deletion process
  (per `docs/phase-9/voice-privacy-policy.md` §"Logging Rules").
- `storageKey` values may be logged at DEBUG level only, never at INFO
  or above in production.
- Cleanup must be idempotent: attempting to delete an already-deleted
  asset (adapter returns without error for an unknown key, DB row
  already gone) must not throw.

---

## No Secrets Committed

- No STT/TTS/AI provider credentials are referenced here.
- No generated private audio files are referenced here.

---

## Validation

- `voice_audio_assets` rows eligible for deletion (per the retention
  windows above) are identified by `AudioCleanupPolicyService` using
  only the `created_at`, `message_id`, and implicit session-status
  join — never by reading audio bytes.
- `AudioCleanupService.runCleanup()` deletes bytes via the storage
  adapter, then deletes the DB row, then nullifies `audio_ref` on the
  parent message row.
- After cleanup, no `voice_audio_assets` row references a file that no
  longer exists in storage, and no storage file exists without a
  corresponding DB row (within the cleanup interval tolerance).
- AIM Engine authority is unaffected: cleanup touches only the audio
  storage layer, never mastery or learning state.
