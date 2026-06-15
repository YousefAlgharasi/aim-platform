# Phase 4 — Placement Test Charter

## Purpose

This charter defines the official scope boundary for **Phase 4 — Placement Test** in the AIM Platform.

Phase 4 exists to establish the placement test foundation required before AIM Engine runtime integration, AI Teacher behavior, learner lesson delivery, adaptive practice, recommendations, progress dashboards, or retention workflows begin. It covers placement-only contracts, database foundations, backend APIs, backend-owned scoring and result generation, admin configuration surfaces, learner mobile placement flow foundations, and review documents that verify Phase 4 stayed inside placement scope.

This document is intentionally restrictive. It prevents Phase 4 tasks from becoming lesson delivery, practice sessions, learning sessions, AIM runtime integration, recommendations, progress reporting, AI Teacher, or Student Web App work.

## Phase Identity

| Item | Decision |
| --- | --- |
| Phase | Phase 4 |
| Phase name | Placement Test |
| Primary purpose | Build the foundation for a backend-authoritative learner placement test |
| Learner client | Flutter Mobile may host placement test screens and call backend placement APIs |
| Backend API | NestJS + TypeScript remains the backend authority |
| Admin surface | Admin Dashboard may configure placement sections, questions, and skill links through protected backend APIs |
| Backend authority | Backend API and database remain the final authority for placement attempts, answers, scoring, results, level estimates, skill signals, and initial learning path output |
| AIM Engine runtime | Out of scope for Phase 4 |
| AI Teacher | Out of scope for Phase 4 |
| Lesson delivery | Out of scope for Phase 4 |
| Student Web App | Out of scope for Phase 4 |

## In Scope

Phase 4 may include only the following Placement Test areas.

### Placement Contracts

- Placement test, section, question, attempt, answer, result, and initial path contracts.
- Backend request and response shapes for placement-only flows.
- Error codes and validation rules for placement-only operations.
- Documentation that defines how placement data is exchanged without invoking AIM Engine runtime behavior.

### Placement Data Model

- Database tables, migrations, indexes, and seed data for placement tests, sections, questions, question-skill links, attempts, answers, results, and audit records.
- Safe relationships to existing curriculum, question bank, skill, or level foundations when needed for placement configuration.
- Data constraints that protect placement integrity without creating learner lesson delivery or practice-session models.

### Backend Placement APIs

- Read APIs for active placement test structure.
- Attempt start, answer submission, completion, result generation, and result read APIs.
- Backend validation for answer ownership, allowed state transitions, retake policy, and test completion.
- Backend audit logging for placement attempt and result events.

### Backend-Owned Scoring and Result Generation

- Backend services that compute placement score, section score, skill signal, estimated level, weakness indicators, and initial path output.
- Deterministic placement rules documented for Phase 4.
- Backend safeguards that prevent Flutter Mobile or other clients from becoming the source of placement truth.

### Admin Placement Management

- Admin Dashboard foundations for managing placement sections, questions, and question-skill links.
- Admin permission checks through protected backend APIs.
- Admin UI that displays backend validation results and does not bypass backend authority.

### Flutter Mobile Placement Flow

- Placement intro, section, question, answer submission, completion, and result display screens.
- Flutter models, datasource, repository, and state management that call backend placement APIs.
- Client behavior limited to display, input collection, navigation, loading states, and error presentation.

### Placement Reviews

- Security, architecture, scoring, question coverage, skill-linking, end-to-end, no-AIM-runtime, output-completeness, and final handoff review documents.
- Checks that confirm no secrets, service-role keys, database credentials, AI provider keys, or privileged configuration were exposed.

## Explicitly Out of Scope

Phase 4 must not include any of the following work.

| Area | Phase 4 Decision |
| --- | --- |
| AIM Engine runtime integration | Out of scope |
| AI Teacher | Out of scope |
| Lesson delivery | Out of scope |
| Practice attempts | Out of scope |
| Learning sessions | Out of scope |
| Adaptive recommendations | Out of scope |
| Progress dashboards | Out of scope |
| Retention or review scheduling | Out of scope |
| Student Web App | Out of scope |
| React/Next.js learner app | Out of scope |
| Client-side placement scoring | Out of scope |
| Client-side level estimation | Out of scope |
| Client-side mastery calculation | Out of scope |
| Client-side weakness mapping | Out of scope |
| Client-side initial path calculation | Out of scope |

If any Phase 4 task appears to require one of these areas, the task must stop and be reported as blocked or deferred.

## Non-Negotiable Architecture Rules

### Backend Is the Final Authority

The backend is the final authority for:

- placement test availability;
- placement section and question eligibility;
- placement attempt lifecycle;
- answer validation;
- scoring;
- result generation;
- estimated level output;
- skill signal output;
- weakness indicators;
- initial learning path output;
- retake eligibility;
- audit logging;
- role and permission enforcement.

Flutter Mobile and the Admin Dashboard may display backend-approved state, but they must not become the authority for placement scoring, level decisions, mastery, weakness detection, path generation, authorization, or audit outcomes.

### Flutter Must Not Calculate Placement Intelligence

Flutter Mobile may collect answers and render backend responses. It must not calculate:

- placement score;
- section score;
- estimated level;
- mastery;
- weakness map;
- skill proficiency;
- difficulty;
- retention;
- recommendations;
- initial learning path.

Any client-side value used for navigation or presentation must be treated as non-authoritative UI state only.

### No AIM Runtime Integration

Phase 4 may prepare placement outputs that future phases can pass to the AIM Engine, but it must not call, embed, simulate, or integrate AIM Engine runtime behavior.

Phase 4 placement services may produce deterministic placement results and initial path data owned by the backend. They must not introduce adaptive runtime loops, live mastery updates, recommendation engines, or lesson-sequencing behavior that belongs to later phases.

### Admin UI Must Not Bypass Backend Authority

Admin Dashboard controls are UX only. They may guide administrators through placement configuration, but they must not:

- write directly to privileged data stores from the browser;
- rely on client-side role checks as security;
- decide final placement question eligibility without backend validation;
- expose answer keys or privileged placement metadata to unauthorized users;
- expose service-role keys or privileged credentials;
- mark placement configuration valid when backend validation fails.

### Placement APIs Must Be Protected

Placement configuration APIs must require backend authentication and role or permission checks.

Learner placement APIs must enforce authenticated learner identity, attempt ownership, safe field exposure, and state transition rules. They must not expose answer keys, internal scoring formulas beyond approved contract fields, admin notes, privileged audit data, or raw database internals.

### No Speed-As-Mastery

Speed, response time, average response time, or speed score must not be used as a direct mastery, level, weakness, or difficulty-increase signal in Phase 4.

Timing data may be stored only when explicitly required for audit, abuse prevention, UX telemetry, or future analysis, and it must not directly determine placement score or level.

### Secrets Stay Server-Side

Phase 4 must not expose any of the following to Flutter Mobile, Admin Dashboard, public repository files, or other clients:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- privileged backend credentials;
- production-only secrets;
- raw access or refresh tokens.

Only public client-safe configuration may be used in clients.

### Educational, Non-Clinical Language

Any learner-facing placement text introduced during Phase 4 must remain educational, non-clinical, non-medical, and non-diagnostic.

Placement results may describe readiness, recommended starting point, or areas to review. They must not present medical, psychological, diagnostic, or clinical conclusions.

## Required Backend Boundaries

Every protected backend endpoint created or changed in Phase 4 must define which checks apply.

| Endpoint type | Required backend authority |
| --- | --- |
| Placement configuration read | Auth + role or permission check |
| Placement configuration write | Auth + role or permission check + validation |
| Placement question management | Auth + role or permission check + safe answer-key handling |
| Placement skill linking | Auth + role or permission check + backend validation |
| Active placement test read | Authenticated learner + learner-safe fields only |
| Placement attempt start | Authenticated learner + retake policy + active test validation |
| Placement answer submit | Authenticated learner + attempt ownership + state validation |
| Placement completion | Authenticated learner + attempt ownership + completeness validation |
| Placement result generation | Backend-owned scoring + result persistence |
| Placement result read | Authenticated learner or authorized admin + safe field exposure |
| Placement audit log read | Auth + restricted admin/reviewer permission |

No endpoint may rely on Flutter Mobile or Admin Dashboard checks as the only protection.

## Required Flutter Boundaries

Flutter Mobile work in Phase 4 is limited to placement test participation.

Flutter may:

- display placement intro and instructions returned or approved by backend contracts;
- load active placement sections and learner-safe question fields;
- collect selected or typed answers;
- submit answers to backend APIs;
- show loading, error, empty, and completion states;
- render backend-generated placement results;
- navigate through placement-only screens.

Flutter must not:

- calculate placement scores;
- estimate level;
- infer mastery;
- infer weaknesses;
- generate initial learning paths;
- select the next lesson;
- recommend practice;
- expose answer correctness before backend completion;
- cache privileged answer keys or scoring rules;
- bypass backend attempt state.

## Required Admin Boundaries

Admin Dashboard work in Phase 4 is limited to placement configuration and review.

Admin UI may:

- list and manage placement sections through protected backend APIs;
- list and manage placement questions through protected backend APIs;
- link placement questions to skills through protected backend APIs;
- display validation errors returned by the backend;
- show safe summaries of placement configuration coverage.

Admin UI must not:

- become the source of truth for placement validity;
- expose privileged placement data to unauthorized roles;
- write directly to the database;
- embed service-role keys or privileged configuration;
- implement scoring rules in the browser.

## Required Review Gates

Phase 4 completion requires review outputs that confirm:

- placement scope stayed separate from lesson delivery and practice sessions;
- no AIM Engine runtime integration was introduced;
- backend remains the authority for scoring and result generation;
- Flutter does not calculate score, level, mastery, weakness, or initial path;
- placement APIs enforce authentication, authorization, ownership, and safe field exposure;
- admin placement management uses protected backend APIs;
- no secrets or privileged credentials were exposed;
- placement question coverage and skill linking are adequate for the defined Phase 4 scope.

## Handoff to Phase 5

Phase 4 may hand off:

- placement attempt history;
- backend-generated placement result records;
- estimated level output;
- skill signal and weakness indicator output;
- initial learning path output;
- documented contracts for future AIM Engine integration.

Phase 4 must not hand off a live AIM runtime integration. Phase 5 or a later phase must explicitly own any integration with AIM Engine runtime behavior, AI Teacher behavior, adaptive recommendations, learner lesson delivery, practice sessions, progress dashboards, and retention workflows.

## Final Decision

Phase 4 is approved only as the **Placement Test foundation phase**.

All implementation, documentation, tests, and reviews in Phase 4 must preserve the boundary that placement is backend-authoritative, Flutter is non-authoritative, and AIM Engine runtime integration begins after Phase 4.
