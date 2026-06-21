# Phase 18 — AI Privacy and Data Policy

**Task:** P18-007
**Date:** 2026-06-21
**Dependency:** P18-004 (`docs/phase-18/ai-safety-policy.md`)

## Purpose

Define conversation retention, redaction, PII handling, minor-data rules, voice-data rules, and export limits for AI Teacher and Voice Tutor data.

## Data Ownership

- `AiConversation`, `AiMessage`, `AiVoiceSession`, and `AiVoiceTranscriptSegment` records are owned by the student who created them.
- A parent/guardian may view consent-gated, read-only safety/usage summaries of their child's AI Teacher activity — not full raw conversation content — unless an explicit, separate policy and consent flow grants more, which is out of scope for Phase 18.
- Admins access conversation data only through protected backend APIs, only for safety review, support, or audit purposes, and such access is itself logged via `AiAuditLogEntry`.

## Retention

- `AiMessage` and `AiVoiceTranscriptSegment` content is retained for a bounded period sufficient for tutoring continuity and safety/audit review (default: retained while the student's account is active, subject to platform-wide data retention policy from prior phases).
- `AiUsageCostEvent` and `AiAuditLogEntry` records are retained per the existing platform audit retention policy (longer-lived, aggregate/metadata only).
- Raw voice audio is **not** retained beyond the time needed to produce a transcript; only the transcribed text (`AiVoiceTranscriptSegment`) is persisted.

## Redaction

- Safety check logs (`AiSafetyCheck`) store classification outcome and reason category, not the full triggering text, wherever the reason category alone is sufficient for audit purposes.
- Any detected PII (e.g., a student typing a phone number or address into chat) is flagged by the safety check; AI Teacher's response must not echo back or request such PII.
- Admin-facing conversation views must redact or mask any incidentally-shared sensitive data (e.g., other students' names) before display, where feasible.

## PII Handling

- AI Teacher must not request, store as a first-class field, or transmit PII (full name beyond what's already on the account, address, phone number, financial data) to the AI provider beyond what is strictly necessary for tutoring context.
- Provider calls send the minimum context necessary (e.g., subject, grade level, backend-approved learning context) — not full student profile or family data.

## Minor Data Rules

- All AIM students are treated as minors for data-handling purposes by default, consistent with `docs/phase-18/ai-safety-policy.md`.
- Conversation and voice data for minors is never used for AI provider model training (where the provider contract allows opting out, the platform opts out by default).
- Parental consent state (inherited from existing platform consent infrastructure) gates whether any AI Teacher feature, including voice, is available to a given student at all.

## Voice Data Rules

- Raw audio is processed transiently for STT and is not persisted after transcription completes.
- TTS output (synthesized audio) is streamed to the client and not persisted server-side beyond what's needed to serve the response.
- Voice session metadata (duration, status, timestamps) is retained for cost/quota and audit purposes; transcript text is retained per the retention rules above.

## Export Limits

- Phase 18 does not introduce a bulk data export feature for AI Teacher conversations.
- Any future export capability must go through existing platform data-export/consent mechanisms and is out of scope for Phase 18 unless a specific task explicitly adds a scoped, consent-gated export endpoint.

## Cross-User Isolation

- A student's AI Teacher conversations and voice sessions must never be visible to another student.
- Backend authorization checks must scope all AI Teacher reads/writes to the authenticated student (or the consented parent/admin acting through protected APIs), consistent with `docs/phase-18/ai-teacher-authority-rules.md` enforcement points.
