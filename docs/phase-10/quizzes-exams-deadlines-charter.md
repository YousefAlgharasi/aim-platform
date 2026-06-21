# Phase 10 — Quizzes, Exams, and Deadlines Charter

## Purpose

This charter defines the official scope boundary for **Phase 10 — Quizzes, Exams, and Deadlines** in the AIM Platform.

Phase 10 exists to build the assessment foundation: quiz and exam definitions, assessment deadlines and open/close windows, the attempt lifecycle, answer submission, backend-controlled grading, backend-approved results, assessment result history, and the mobile quiz/exam/deadline UI that displays backend-approved state. It covers assessment database schema, backend assessment services and APIs, mobile assessment screens, assessment-progress integration limited to backend-approved results, and the reviews that confirm Phase 10 stayed inside assessment scope.

This document is intentionally restrictive. It prevents Phase 10 tasks from becoming AI Teacher work, payments, parent dashboard, admin management UI, client-side grading, or client-side assessment authority of any kind.

## Phase Identity

| Item | Decision |
| --- | --- |
| Phase | Phase 10 |
| Phase name | Quizzes, Exams, and Deadlines |
| Primary purpose | Build a backend-authoritative assessment system covering quizzes, exams, deadlines, attempts, grading, and results |
| Learner client | Flutter Mobile may host quiz/exam/deadline/attempt/result screens and call backend assessment APIs |
| Backend API | NestJS + TypeScript remains the backend authority |
| Admin surface | Quiz/exam management UI is deferred to Phase 11; Phase 10 backend APIs may exist without an admin UI |
| Backend authority | Backend API and database remain the final authority for assessment definitions, deadlines, attempt lifecycle, grading, scoring, pass/fail, and result persistence |
| AI Teacher | Out of scope for Phase 10 |
| Payments | Out of scope for Phase 10 |
| Parent dashboard | Out of scope for Phase 10 |
| Admin dashboard UI | Out of scope for Phase 10 (deferred to Phase 11) |
| Deadline notifications | Out of scope for Phase 10 (deferred to Phase 13 unless a Phase 10 task explicitly says otherwise) |

## In Scope

Phase 10 may include only the following assessment areas.

### Assessment Data Model

- Database tables, migrations, indexes, and seed data for assessment definitions, sections, assessment-question links, settings, deadlines, attempts, answers, results, result breakdowns, deadline events, and audit logs.
- Additive migrations with safe constraints that protect invalid assessment state.
- Student ownership preserved on attempt, answer, and result records.

### Backend Assessment APIs

- Student assessment read APIs (quiz/exam definitions, sections, questions).
- Student deadline read APIs.
- Attempt start, resume, and submission APIs.
- Answer submission APIs.
- Assessment result and result history APIs.
- Permission guards and DTO validation on every endpoint.

### Backend Grading and Score Policy

- Backend-only grading service.
- Backend-only score policy, pass/fail calculation, and late penalty enforcement.
- Backend-only deadline authority (open, upcoming, closed, missed, late, extended, expired, eligible-for-attempt, eligible-for-submission).
- Backend-only attempt eligibility, duplicate-submission protection, and max-attempt enforcement.
- Result persistence owned by the backend.

### Mobile Assessment Feature

- Quiz/exam list, detail, attempt, deadline, and result screens.
- Flutter models, datasource, repository, and state management that call backend assessment APIs only.
- Client behavior limited to display, answer collection, draft UI state, submission, navigation, loading states, and error presentation.

### Assessment-Progress Integration

- Backend-controlled integration that allows only backend-approved assessment results to affect progress/AIM state.
- Consistency with Phase 5 AIM authority rules.

### Assessment Reviews

- Security, architecture, no-client-authority, and final handoff review documents.
- Phase 11 readiness notes.
- Checks that confirm no secrets, service-role keys, database credentials, or AI provider keys were exposed.

## Explicitly Out of Scope

Phase 10 must not include any of the following work.

| Area | Phase 10 Decision |
| --- | --- |
| AI Teacher | Out of scope |
| AI prompt management | Out of scope |
| AI cost control | Out of scope |
| Voice AI | Out of scope |
| Payments | Out of scope |
| Parent dashboard | Out of scope |
| Admin dashboard UI | Out of scope (deferred to Phase 11) |
| Student web app | Out of scope |
| Full analytics dashboard | Out of scope |
| Human review workflow | Out of scope |
| Client-side grading | Out of scope |
| Client-side scoring | Out of scope |
| Client-side deadline authority | Out of scope |
| Client-side mastery calculation | Out of scope |
| Direct Flutter database writes | Out of scope |
| Direct Flutter AIM/progress writes | Out of scope |
| Deadline notifications | Out of scope (deferred to Phase 13 unless explicitly stated otherwise) |

If any Phase 10 task appears to require one of these areas, the task must stop and be reported as blocked or deferred.

## Non-Negotiable Architecture Rules

### Backend Is the Final Authority

The backend is the final authority for:

- correctness;
- score;
- pass/fail;
- deadline validity;
- late penalty;
- attempt eligibility;
- exam completion state;
- mastery, level, weakness, difficulty, recommendations, review schedule, progress updates, and AIM outputs derived from assessment results;
- audit logging;
- role and permission enforcement.

Flutter Mobile may display backend-approved state, but it must never become the authority for grading, scoring, deadline decisions, attempt eligibility, or progress/AIM outputs.

### Flutter Must Not Calculate Assessment Intelligence

Flutter may only:

- display backend-provided questions;
- collect user answers;
- submit answers to backend;
- display backend-approved results;
- display backend-approved deadlines;
- display backend-approved assessment history;
- store safe, non-authoritative UI draft state before submission.

Flutter must never calculate or decide correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, exam completion state, mastery, level, weakness, difficulty, recommendations, review schedule, progress updates, or AIM outputs.

### Backend Must Not Trust Client-Submitted Authority Fields

Backend assessment services must not trust client-submitted score, correctness, or deadline-state fields. Any unauthorized client authority field must be rejected or ignored.

### Grading Service Boundaries

The grading service must be backend-only. It must not expose grading metadata to Flutter, and it must not send correct answers to Flutter unless explicitly allowed for post-result feedback and backend-approved. Clients must never be able to override a grading outcome.

### Deadline Authority Boundaries

Deadline authority must be backend-only. The backend decides open, upcoming, closed, missed, late, extended, expired, eligible-for-attempt, and eligible-for-submission state. Flutter may only display deadline state returned by the backend and must never calculate final deadline status locally.

### Assessment APIs Must Be Protected

Student assessment APIs must be permission-protected. Students must not access other students' attempts, answers, results, result history, user-specific deadlines, or progress-related assessment output. Sensitive internal fields, correct answers before allowed, and grading policy internals must not be exposed.

### Assessment-Progress Integration Boundaries

Only backend-approved assessment results may affect progress/AIM state. Flutter must never write progress, skill states, weaknesses, recommendations, review schedules, or AIM outputs directly. Assessment-progress integration must remain consistent with Phase 5 AIM authority rules.

### Secrets Stay Server-Side

Phase 10 must not expose any of the following to Flutter Mobile, public repository files, or other clients:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- privileged backend credentials;
- production-only secrets;
- raw access or refresh tokens.

### Audit Logging Boundaries

Audit logs may capture safe metadata only. They must not log secrets, service-role keys, full sensitive answer payloads (unless explicitly required and documented), AI provider keys, or database credentials.

## Required Backend Boundaries

Every protected backend endpoint created or changed in Phase 10 must define which checks apply.

| Endpoint type | Required backend authority |
| --- | --- |
| Assessment definition read | Authenticated student + learner-safe fields only |
| Assessment deadline read | Authenticated student + ownership where user-specific |
| Attempt start | Authenticated student + eligibility + deadline validation |
| Attempt resume | Authenticated student + attempt ownership + state validation |
| Answer submission | Authenticated student + attempt ownership + duplicate-submission protection |
| Attempt submission | Authenticated student + attempt ownership + max-attempt enforcement |
| Grading | Backend-owned grading service; no client-submitted score/correctness trusted |
| Result persistence | Backend-owned; no client override |
| Result read | Authenticated student (own results only) or authorized reviewer |
| Result history read | Authenticated student (own history only) |
| Assessment audit log read | Auth + restricted admin/reviewer permission |

No endpoint may rely on Flutter Mobile checks as the only protection.

## Required Flutter Boundaries

Flutter Mobile work in Phase 10 is limited to assessment participation.

Flutter may:

- display backend-provided quiz/exam questions and instructions;
- collect and locally draft answers before submission;
- submit answers to backend APIs;
- display backend-approved deadlines, attempt state, and results;
- show loading, error, empty, and completion states;
- navigate through assessment-only screens.

Flutter must not:

- calculate correctness, score, or pass/fail;
- calculate deadline validity or late penalty;
- calculate attempt eligibility or exam completion state;
- calculate mastery, weakness, difficulty, recommendations, review schedule, or AIM outputs;
- write directly to the database;
- call the AIM Engine or Python services directly;
- write progress, skill states, weaknesses, recommendations, or review schedules directly.

## Required Review Gates

Phase 10 completion requires review outputs that confirm:

- assessment scope stayed separate from AI Teacher, payments, parent dashboard, and admin management UI;
- backend remains the authority for grading, scoring, pass/fail, and deadline decisions;
- Flutter does not calculate correctness, score, pass/fail, deadline validity, eligibility, or AIM outputs;
- assessment APIs enforce authentication, authorization, ownership, and safe field exposure;
- no secrets or privileged credentials were exposed;
- assessment-progress integration only consumes backend-approved results.

## Handoff to Phase 11

Phase 10 may hand off:

- backend-generated assessment attempt, answer, and result records;
- backend-approved assessment result history;
- documented contracts for admin quiz/exam management UI.

Phase 10 must not hand off a client-authoritative grading, scoring, or deadline system. Phase 11 must explicitly own admin quiz/exam management UI, and Phase 13 must explicitly own deadline notifications, unless a Phase 10 task states otherwise.

## Final Decision

Phase 10 is approved only as the **Quizzes, Exams, and Deadlines assessment foundation phase**.

All implementation, documentation, tests, and reviews in Phase 10 must preserve the boundary that assessment grading, scoring, deadlines, and attempt lifecycle are backend-authoritative, and Flutter is non-authoritative.
