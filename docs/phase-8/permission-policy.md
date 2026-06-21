# Phase 8 — AI Teacher Permission Policy

**Task:** P8-015
**Branch:** `phase8/P8-015-ai-teacher-permission-policy`
**Dependency:** P2-050 (Flutter Auth Flow Check — Done), P8-010 (AI Teacher Architecture Document — Done)
**Output:** `docs/phase-8/permission-policy.md`

---

## Purpose

This document defines the permission and ownership policy for AI
Teacher chat sessions and messages, building on the backend-authoritative
auth model already established in Phase 2
(`docs/phase-2/auth-security-rules.md`,
`docs/phase-2/flutter-auth-flow-check.md`). It ensures a student can
only ever access their own AI Teacher chat data, and that Flutter's
auth state is used for display only, never as the security authority.

---

## Core Rule

**A student may only read or write their own AI Teacher chat sessions
and messages. Authorization is enforced on the backend, never assumed
from client-sent identifiers.**

This follows the same principle established in Phase 2: Flutter/Admin
UI auth state is UX only; backend authorization, roles, and ownership
checks are the final authority (`docs/phase-2/auth-security-rules.md`).

---

## Permission Rules

| Action | Who may perform it | Enforcement |
|---|---|---|
| Create a new chat session | The authenticated student, for themselves only | Backend sets `studentId` from the authenticated token; never from a client-supplied field. |
| Send a message in a session | The authenticated student who owns that session | Backend verifies `session.studentId == authenticatedStudentId` before running the pipeline (`docs/phase-8/ai-teacher-data-flow.md`). |
| Read chat history for a session | The authenticated student who owns that session | Same ownership check as send-message. |
| Read another student's session or messages | No one, via the AI Teacher API | Request is rejected with a safe `403`/`404`-style error (`docs/phase-8/ai-teacher-error-policy.md`); existence of another student's session is never confirmed or denied in a way that leaks data. |
| Use the AI Teacher API without authentication | No one | Endpoints require a valid authenticated session/token; unauthenticated requests are rejected before any pipeline step runs. |

---

## Ownership Enforcement Points

- **Session creation (Group H):** the backend derives the owning
  student id from the authenticated request context, not from any
  client-supplied id field.
- **Send-message and read-history endpoints (Group H):** both check
  session ownership before invoking the Context Builder, Prompt
  Builder, AI Provider Gateway, or Chat Persistence.
- **Chat Persistence (Group G):** every stored message and session row
  is tagged with the owning `studentId`, set server-side.
- **Context Builder (Group D):** reads AIM Engine and curriculum data
  scoped to the same authenticated `studentId` used for the ownership
  check — never a different or client-supplied id
  (`docs/phase-8/context-sources.md`).

---

## Relationship to Phase 2 Auth Model

- AI Teacher endpoints reuse the same backend authentication mechanism
  already defined for the platform in Phase 2 — no separate or weaker
  auth path is introduced for AI Teacher.
- As with the rest of the platform, Flutter's locally held auth/session
  state is used only to decide what UI to show (e.g. show chat vs.
  show login); it is never trusted as the source of permission
  decisions. The backend re-validates the token and ownership on every
  request, per `docs/phase-2/auth-security-rules.md`.
- Role/permission distinctions established in Phase 2 (e.g. student
  vs. other roles) continue to apply: AI Teacher endpoints are scoped
  to the student role acting on their own data; no other role is in
  scope for Phase 8 Text Mode.

---

## Validation

- Students can access only their own AI Teacher chat/session data.
- Ownership is enforced on the backend at every relevant step, not
  assumed from client input.
- This policy builds on, and does not weaken, the Phase 2 auth model.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call an AI provider directly.
- No secrets are referenced or committed in this document.
