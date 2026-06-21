# Phase 18 — AI Teacher Privacy Review

**Task:** P18-082
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Validate AI Teacher/Voice Tutor privacy readiness: conversation and
transcript handling, retention, redaction, parent visibility, child data
exposure, and PII handling.

## Review Scope

1. Chat conversation/message storage (`ai-teacher/repositories/`)
2. Voice session/transcript storage (`voice-teacher/`)
3. Parent-facing AI summary/safety endpoints (`parents/parent-ai-*-summary.service.ts`)
4. Admin AI surfaces (usage/cost, safety review, audit)
5. Data retention policy

## Findings

### 1. Chat Conversation/Message Storage

| Check | Status |
|---|---|
| Chat history reads are scoped to the requesting student's own sessions (`chat-history-read.service.ts` re-checks `session.student_id`) | PASS |
| Rejected message/response content is never persisted in `ai_safety_events` — only `decision`/`reason_category`/`direction` | PASS |
| Feedback rows (`ai_teacher_feedback`) store only `message_id`/`student_id`/`rating`, no free-text comment field that could carry PII | PASS |

### 2. Voice Session/Transcript Storage

| Check | Status |
|---|---|
| Voice safety events follow the same redacted-by-schema pattern as chat safety events — no raw audio or transcript column | PASS |
| Admin-facing voice safety rollups (via shared `AdminSafetyReviewController`/parent AI safety summary) expose only aggregate counts, never per-session transcript | PASS |

### 3. Parent-Facing AI Summary/Safety Endpoints

| Check | Status |
|---|---|
| `ParentAiSummaryService`/`ParentAiSafetySummaryService` gate every read behind `ParentAccessPolicyService.assertAccess(parentId, childId, 'activity_view')` | PASS |
| Parent AI safety summary returns only `blockedInteractionCount`, never `reasonCategory`, transcript, or message content (confirmed by spec assertions in `parent-ai-safety-summary.service.spec.ts`) | PASS |
| Web UI pages (`ParentAiSummary.js`, `ParentAiSafetySummary.js`) only render the `childId`-scoped summary, never accept or forward a `parentId` override (confirmed by `parent-ai-ui-tests.test.js`) | PASS |

### 4. Admin AI Surfaces

| Check | Status |
|---|---|
| Admin usage/cost lookup is per-`studentId`, not a free-text search across unrelated child PII fields | PASS |
| Admin safety review surfaces decision/reason_category only, no child name/PII beyond the already-authorized `student_id` foreign key | PASS |
| Admin audit log `details` field is populated by the writer at call time; no call site in the repository's callers passes a child's raw conversation text into `details` | PASS |

### 5. Data Retention Policy

| Check | Status |
|---|---|
| A dedicated retention/purge job for `ai_chat_sessions`/`ai_chat_messages`/`voice_sessions`/safety event tables | **GAP — not found** |

**Note on the retention gap:** no `retention`/`purge`/TTL-style job was
found anywhere under `ai-teacher/` or `voice-teacher/`. This mirrors a
pre-existing, not-yet-scheduled gap rather than a Phase 18 regression —
no earlier phase's task list assigned AI Teacher/Voice Tutor data
retention to a specific task ID in this document. It is flagged here as
an open item for a future phase rather than blocking this review, since
no Phase 18 task explicitly required implementing retention/purge.

## Summary

Conversation, transcript, and safety-event data are correctly scoped to
the owning student at read time, and every parent-facing read additionally
requires explicit consent (`activity_view`) before any AI data is
returned. No endpoint reviewed exposes raw conversation/transcript/audio
content to a parent or admin — only backend-recorded decision/aggregate
fields. The one open item is the absence of a formal retention/purge
policy for AI conversation and safety-event tables, which should be
scheduled as a follow-up task rather than treated as a blocking finding
for Phase 18.

**Overall verdict: Pass, with one follow-up item (data retention policy).**
