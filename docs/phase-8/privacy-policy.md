# Phase 8 — AI Teacher Privacy Policy

**Task:** P8-016
**Branch:** `phase8/P8-016-ai-teacher-privacy-policy`
**Dependency:** P8-012 (AI Teacher Context Sources — Done)
**Output:** `docs/phase-8/privacy-policy.md`

---

## Purpose

This document defines privacy rules for AI Teacher context, logs, and
chat storage, so sensitive student data is never leaked to logs or
sent to an AI provider beyond what's strictly needed for tutoring. It
builds on `docs/phase-8/context-sources.md` (which fields are
approved as context) by defining how those fields, plus chat data and
logs, must be handled to protect privacy.

---

## What May Be Sent to the AI Provider Prompt

Only the minimum tutoring-relevant fields defined in
`docs/phase-8/context-sources.md` may appear in a prompt sent to the
AI Provider Gateway:

- Current lesson/topic and skill metadata.
- Recent mistakes tied to the current lesson/topic.
- Current level, weakness, and recommendation summaries (as
  already-computed AIM Engine outputs, read-only).
- The student's current chat message.
- Non-identifying personalization fields needed for tone (e.g.
  display name, locale) — never used to identify the student outside
  the platform.

---

## What Must Never Be Sent to the AI Provider Prompt

| Field type | Examples |
|---|---|
| Account credentials | Password hashes, tokens, session secrets. |
| Contact/identity info | Email address, phone number, physical address. |
| Billing/payment info | Payment method, billing history (also out of Phase 8 scope entirely). |
| Internal identifiers not needed for tutoring | Raw database row ids, internal admin flags, audit metadata. |
| Other students' data | Any field belonging to a student other than the one in the session. |
| Full historical record | Data outside the current lesson/topic and recent activity window (see relevance filtering in `docs/phase-8/context-sources.md`). |

---

## Logging Rules

- Application logs for the AI Teacher pipeline may include
  non-sensitive operational metadata: request id, session id, latency,
  error category, and status code.
- Application logs must never include:
  - The full prompt text sent to the AI provider.
  - The full raw provider response.
  - AI provider API keys or other credentials, in any form (plaintext,
    partially masked, or encoded).
  - Student contact info, payment info, or credentials.
- If prompt/response content must be logged for debugging, it is
  logged only in a redacted or truncated form, and only in
  non-production environments, never with student-identifying or
  sensitive fields intact.

---

## Chat Storage Rules

- Chat Persistence (Group G) stores: the student's message text, the
  AI Teacher reply text, a reference to the context snapshot used
  (not the full provider prompt verbatim, unless needed for audit and
  access-controlled the same as the rest of chat data), and a
  timestamp.
- Chat storage is scoped per student (see
  `docs/phase-8/permission-policy.md` for ownership/access rules) and
  is not queryable by any other student.
- Chat storage never includes AI provider credentials or unrelated
  students' data.

---

## Why This Matters

Sending more than the minimum necessary context to an AI provider, or
writing sensitive fields into logs, creates an avoidable data-exposure
surface: provider-side retention, log aggregation systems, and
debugging tools could all leak student data beyond the platform's
control. Limiting prompts to tutoring-relevant fields and keeping logs
and storage free of sensitive content keeps AI Teacher's privacy
footprint as small as the feature requires.

---

## Validation

- Privacy rules are defined for AI Teacher context, logs, and chat
  storage.
- Sensitive fields (credentials, contact info, billing, other
  students' data) are never sent to the AI provider or written to
  logs.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
