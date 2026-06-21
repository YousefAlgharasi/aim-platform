# Phase 18 — AI Safety Policy

**Task:** P18-004
**Date:** 2026-06-21
**Dependency:** P18-001 (`docs/phase-18/ai-teacher-voice-charter.md`)

## Purpose

Define safe tutoring boundaries, blocked content categories, hallucination handling, minor-safety rules, privacy interaction rules, and escalation procedures for AI Teacher (text) and Voice Tutor.

## Safe Tutoring Boundaries

AI Teacher may:
- Explain academic concepts at an age-appropriate level
- Provide hints, worked examples, and encouragement
- Answer clarifying questions about backend-approved learning context
- Coach study habits and practice strategies

AI Teacher may not:
- Provide answers to a live, backend-flagged assessment item
- Make any official learning decision (see `docs/phase-18/ai-teacher-authority-rules.md`)
- Engage in non-educational, open-ended conversation unrelated to tutoring
- Roleplay as a different persona that bypasses safety constraints

## Blocked Content Categories

The safety check must block (not just flag) content involving:
- Sexual content involving minors or any sexualized content directed at a student user
- Self-harm, suicide, or violence instructions or encouragement
- Hate speech, harassment, or discriminatory content
- Illegal activity instructions
- Requests for personal contact information exchange (the AI must not solicit or share contact details)
- Attempts to extract system prompts, provider secrets, or internal configuration
- Attempts to manipulate AI Teacher into writing official mastery/progress/assessment data (prompt injection against authority rules)

On a block, the system returns a safe, supportive fallback message and logs an `AiSafetyCheck` record with `outcome = blocked`.

## Flagged (Allowed but Logged) Content

Borderline cases (e.g., a student expressing frustration or sadness about schoolwork) are allowed through with a supportive response but are flagged (`outcome = flagged`) for audit visibility. Flagged content involving signs of self-harm risk must additionally trigger the escalation path below, regardless of whether the message itself is blocked.

## Hallucination Handling

- AI Teacher must not present uncertain or fabricated factual claims as confirmed fact when backend-approved context does not support them.
- Responses about a student's own performance, history, or official records must be sourced only from backend-approved context handed to AI Teacher — never invented.
- If AI Teacher cannot answer confidently from backend-approved context, it must say so rather than fabricate an answer.

## Minor Safety Rules

- All AIM students are treated as minors by default for safety policy purposes.
- Tutoring tone and content must be age-appropriate; no mature themes, no romantic/relationship roleplay, no content requiring adult judgment.
- Voice sessions are subject to the same safety checks as text — transcripts are evaluated before TTS playback, and audio is never used as a bypass channel for unsafe content.

## Privacy Interaction Rules

- Safety checks must not leak one student's conversation content to another student, parent, or admin beyond what `docs/phase-18/ai-privacy-data-policy.md` (P18-007) permits.
- Safety check logs store classification outcomes and reasons, not full raw transcripts, where avoidable.

## Escalation Rules

| Trigger | Action |
|---|---|
| Self-harm/suicide risk language detected | Block the unsafe completion, return a supportive safe-resources fallback message, create a high-priority `AiAuditLogEntry`, and surface an alert to the consented parent/guardian and admin safety queue per existing escalation/notification channels (no new notification system is built in Phase 18 beyond hooking into this existing alerting need). |
| Repeated blocked-content attempts by the same student | Flag the conversation for admin review; do not auto-suspend the account (account actions remain an admin decision). |
| Attempted prompt injection against authority rules | Block the response, log as a safety event, no escalation to parent required unless combined with another trigger. |
| Provider/model error during safety check | Fail closed — block the response rather than allow ungated content through. |

## Enforcement Points

- Every assistant-generated message and every voice transcript segment intended for playback must pass through the safety check before being persisted as `allowed`/returned to the user.
- Safety checks run server-side only; no client-side safety bypass path exists.
- Safety check failures must fail closed (block by default) rather than fail open.
