# Phase 4 — Placement Scope Boundaries

## Purpose

This document defines what Phase 4 may and must not include for the AIM Platform Placement Test work.

It supports the Phase 4 charter in:

```text
docs/phase-4/placement-test-charter.md
```

Phase 4 is a placement foundation phase. It is not the start of AIM Engine runtime integration, AI Teacher behavior, lesson delivery, practice sessions, adaptive recommendations, or progress dashboards.

## Scope Decision

| Area | Phase 4 Decision |
| --- | --- |
| Placement test setup | In scope |
| Placement sections | In scope |
| Placement questions | In scope |
| Placement attempts | In scope |
| Placement answer submission | In scope |
| Backend-owned scoring | In scope |
| Backend-owned result generation | In scope |
| Backend-owned estimated level output | In scope |
| Backend-owned skill signal output | In scope |
| Backend-owned weakness indicators | In scope |
| Backend-owned initial learning path output | In scope |
| Admin placement configuration | In scope |
| Flutter placement participation flow | In scope |
| AIM Engine runtime integration | Out of scope |
| AI Teacher | Out of scope |
| Lesson delivery | Out of scope |
| Practice sessions | Out of scope |
| Learning sessions | Out of scope |
| Adaptive recommendations | Out of scope |
| Progress dashboard | Out of scope |
| Retention or review scheduling | Out of scope |
| Student Web App | Out of scope |
| React/Next.js learner app | Out of scope |

## Allowed Work

Phase 4 tasks may create or update artifacts in the categories below when the matching task prompt explicitly requires them.

### Placement Documentation

Allowed documentation includes:

- placement charter and execution rules;
- placement scope boundaries;
- no-AIM-runtime rules;
- placement data flow;
- placement blueprint and section rules;
- scoring and result semantics;
- security, architecture, coverage, and handoff reviews.

### Placement Contracts

Allowed contracts include:

- placement test metadata contracts;
- placement section contracts;
- placement question contracts;
- placement attempt contracts;
- placement answer submission contracts;
- placement result contracts;
- placement error codes.

Contracts must describe backend-owned placement behavior without invoking AIM Engine runtime integration.

### Placement Database Foundations

Allowed database work includes:

- placement test tables;
- placement section tables;
- placement question tables;
- placement question-skill mapping tables;
- placement attempt tables;
- placement answer tables;
- placement result tables;
- placement audit tables;
- indexes and seeds required by placement-only flows.

Database work must not create lesson delivery, practice attempt, learning session, recommendation, progress dashboard, or AIM runtime tables as part of Phase 4.

### Backend Placement APIs and Services

Allowed backend work includes:

- active placement test read APIs;
- attempt start APIs;
- answer submission APIs;
- attempt completion APIs;
- result read APIs;
- backend scoring services;
- backend result generation services;
- backend retake policy enforcement;
- backend audit logging;
- backend permission checks for placement configuration.

Backend services must remain deterministic placement services. They must not call AIM Engine runtime services or introduce adaptive runtime loops.

### Admin Placement Configuration

Allowed Admin Dashboard work includes:

- placement navigation;
- placement section management;
- placement question management;
- placement question-skill linking;
- placement permission checks;
- backend validation display;
- safe placement configuration summaries.

Admin Dashboard work must use protected backend APIs and must not become the source of truth for placement validity, scoring, authorization, or audit state.

### Flutter Mobile Placement Flow

Allowed Flutter Mobile work includes:

- placement intro screens;
- placement start screens;
- placement section screens;
- placement question screens;
- answer input collection;
- answer submission through backend APIs;
- completion screens;
- result display screens;
- local loading, error, retry, and navigation state.

Flutter must treat backend responses as authoritative and must not calculate placement intelligence.

## Forbidden Work

Phase 4 tasks must not implement, scaffold, or silently prepare any of the following unless a later phase explicitly owns it.

### AIM Engine Runtime Integration

Forbidden work includes:

- calling AIM Engine runtime services;
- embedding AIM Engine runtime logic in the backend;
- embedding AIM Engine runtime logic in Flutter;
- simulating AIM runtime behavior as a replacement for later integration;
- creating adaptive runtime loops that update mastery or recommendations during placement.

Phase 4 may create backend-owned placement outputs that future phases can pass to AIM Engine, but it must not perform the integration.

### AI Teacher

Forbidden work includes:

- AI Teacher chat;
- AI-generated hints;
- AI-generated explanations;
- conversational tutoring;
- lesson coaching;
- AI feedback loops based on placement answers.

Placement can show static educational copy and backend-approved result text only.

### Lesson Delivery and Practice

Forbidden work includes:

- learner lesson pages;
- lesson playback;
- lesson content delivery;
- practice attempts;
- practice question sessions;
- learning sessions;
- post-placement lesson sequencing;
- direct lesson launch from placement results.

Phase 4 may output an initial path recommendation record from the backend, but actual delivery belongs to later phases.

### Recommendations and Progress

Forbidden work includes:

- adaptive recommendation engines;
- dashboard recommendations;
- progress dashboards;
- mastery dashboards;
- review scheduling;
- retention scheduling;
- learner progress reports.

Placement results may include backend-generated starting point and review area outputs, but they must not become ongoing progress or recommendation features.

### Client-Side Learning Intelligence

Flutter Mobile, Admin Dashboard, and any other client must not calculate:

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

Clients may only collect input, call backend APIs, and render backend-approved output.

### Secret or Privileged Configuration Exposure

Forbidden work includes committing or exposing:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- privileged backend credentials;
- production-only secrets;
- raw access or refresh tokens.

If a task requires a missing secret or privileged credential, stop and report a blocker.

## Backend Authority Boundary

The backend is the final authority for all placement decisions.

| Decision | Authority |
| --- | --- |
| Which placement test is active | Backend |
| Which sections are available | Backend |
| Which questions are eligible | Backend |
| Whether an attempt can start | Backend |
| Whether an answer is accepted | Backend |
| Whether an attempt can complete | Backend |
| Placement score | Backend |
| Section score | Backend |
| Estimated level | Backend |
| Skill signals | Backend |
| Weakness indicators | Backend |
| Initial learning path output | Backend |
| Retake eligibility | Backend |
| Audit records | Backend |
| Role and permission enforcement | Backend |

Client-side checks may improve UX, but they do not replace backend validation or authorization.

## Flutter Boundary

Flutter is a placement participant client in Phase 4.

Flutter may:

- render backend-provided placement structure;
- capture learner answers;
- submit learner answers;
- display backend result fields;
- preserve local UI state for navigation and loading.

Flutter must not:

- own scoring formulas;
- infer level;
- infer mastery;
- infer weaknesses;
- generate recommendations;
- generate initial paths;
- expose answer keys;
- choose lessons for the learner;
- bypass backend attempt state.

## Admin Boundary

Admin Dashboard is a placement configuration client in Phase 4.

Admin Dashboard may:

- create and edit placement sections through backend APIs;
- create and edit placement questions through backend APIs;
- link placement questions to skills through backend APIs;
- show backend validation and coverage results.

Admin Dashboard must not:

- write placement records directly to the database;
- decide final question eligibility without backend validation;
- implement scoring rules in the browser;
- expose privileged placement metadata to unauthorized users;
- bypass backend role or permission checks.

## Stop Conditions

Stop the task and report a blocker if the work requires:

- AIM Engine runtime integration;
- AI Teacher behavior;
- lesson delivery;
- practice sessions;
- learning sessions;
- recommendation generation;
- progress dashboards;
- Flutter-side scoring or level estimation;
- Flutter-side mastery, weakness, or initial path calculation;
- missing secrets or privileged credentials;
- changes outside the selected task prompt.

## Review Checklist

Before completing a Phase 4 task, confirm:

- the work matches the exact `#P4-XXX` prompt section;
- the required output file exists;
- the work is placement-only;
- backend authority is preserved;
- Flutter remains non-authoritative;
- Admin Dashboard remains non-authoritative;
- no AIM Engine runtime integration was added;
- no AI Teacher work was added;
- no lesson delivery, practice, recommendation, or progress dashboard work was added;
- no secrets or privileged configuration were exposed.
