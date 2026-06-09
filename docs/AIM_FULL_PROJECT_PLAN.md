# AIM Platform — Full Project Plan

> **Branch Purpose:** This branch (`planning/aim-platform-roadmap`) is dedicated to preserving the complete AIM Platform project plan so it is never lost or mixed up with algorithm implementation work.

---

## Overview

AIM (Adaptive Intelligence for Mastery) is an adaptive English learning platform targeting Arabic-speaking A1 learners. All adaptive logic lives strictly in the backend AIM Engine; no client-side adaptive logic, no AI provider keys in clients.

---

## Documentation Structure

This `docs/` folder contains the full planning documentation for the platform, split by concern:

| File | Contents |
|---|---|
| `AIM_FULL_PROJECT_PLAN.md` | ← **This file.** Top-level roadmap and build order |
| `AIM_SYSTEM_ARCHITECTURE.md` | Overall system architecture and component map |
| `AIM_BACKEND_PLAN.md` | Backend / AIM Engine design and API contracts |
| `AIM_MOBILE_APP_PLAN.md` | Flutter mobile app plan |
| `AIM_WEB_APP_PLAN.md` | React web app plan |
| `AIM_ADMIN_DASHBOARD_PLAN.md` | Admin dashboard design and feature list |
| `AIM_AI_TEACHER_PLAN.md` | AI Teacher component (hint generation, feedback) |
| `AIM_DATABASE_PLAN.md` | Database schema and data model |
| `AIM_PHASES_AND_TASKS.md` | Phase breakdown with executable task lists |

---

## Recommended Build Order

The team agreed on the following sequence before any implementation begins:

### Step 1 — Lock the Plan in `docs/`
All planning documents must be written and reviewed before a single line of production code is committed. This branch is the source of truth.

### Step 2 — Define the MVP Precisely
Identify the minimum set of features that prove the core value proposition:
- A1 learner can onboard, complete a placement assessment, and receive an adaptive lesson.
- AIM Engine scores responses and adjusts difficulty.
- Progress is persisted and reviewable.

### Step 3 — Extract Features
From the MVP definition, list every discrete feature. Each feature must map to a skill category (Reading, Listening, Speaking, Writing, Vocabulary, Grammar) and a user role (Learner, Teacher, Admin).

### Step 4 — Divide Each Feature into Tasks
Break features into granular, executable tasks. Each task should:
- Be completable in one session.
- Have a clear definition of done.
- Be assigned to exactly one owner.

### Step 5 — Write the Final Project Structure
Define folder structure, naming conventions, and module boundaries for all repos:
- `aim-engine/` — core adaptive logic (backend)
- `mobile/` — Flutter learner app
- `web/` — React learner web app
- `admin/` — Admin dashboard
- `ai-teacher/` — AI feedback and hint generation

### Step 6 — Write the Database Schema
Design all tables, relationships, and indexes. Document in `AIM_DATABASE_PLAN.md` before writing any migrations.

### Step 7 — Write API Contracts
Define every endpoint (method, path, request body, response shape, auth requirements) in `AIM_BACKEND_PLAN.md` before any backend code is written.

### Step 8 — Begin Implementation
With the above locked, implementation proceeds component by component, tracked against `AIM_PHASES_AND_TASKS.md`.

---

## Platform Components

### 1. AIM Engine (Backend)
- Adaptive scoring algorithm
- Skill tree traversal logic
- Session management
- Progress persistence
- REST/GraphQL API for all clients

### 2. Flutter Mobile App
- Primary learner interface (iOS + Android)
- Consumes AIM Engine API exclusively
- No adaptive logic on-device
- Audio playback for Listening exercises
- Speech capture for Speaking exercises (uploaded to backend for scoring)

### 3. React Web App
- Web equivalent of the mobile learner interface
- Shared API contract with mobile
- Pilot-tested MVP already completed

### 4. Admin Dashboard
- Content management (skills, exercises, media)
- Learner progress monitoring
- Cohort and journey management
- Analytics and reporting

### 5. AI Teacher
- Hint generation for stuck learners
- Feedback phrasing for incorrect responses
- No direct AI provider key access from clients — all AI calls proxied through AIM Engine

### 6. Analytics
- Learning outcome tracking
- Engagement metrics
- A/B test result storage

---

## Non-Negotiables (Enforced Across All Work)

| Rule | Rationale |
|---|---|
| No client-side adaptive logic | Prevents algorithm leakage and ensures consistent scoring |
| No AI provider keys in clients | Security — all AI calls go through backend |
| No speed-as-mastery | Correctness and retention are the mastery signal, not response time |
| No clinical or diagnostic learner labels | Ethical — the platform is educational, not diagnostic |
| All work merged to `main` before close | Feature branches are in-flight; `main` is the record |
| Notion status updates are part of task completion | Task hygiene — the board reflects reality |

---

## Branch Naming Convention

| Purpose | Branch Name Pattern |
|---|---|
| Planning / documentation | `planning/<topic>` |
| Feature development | `feature/<component>/<short-description>` |
| Bug fixes | `fix/<short-description>` |
| Hotfixes to main | `hotfix/<short-description>` |

This branch (`planning/aim-platform-roadmap`) follows the convention for a complete platform-level plan — as opposed to algorithm-only work.

---

## Status

- [x] Branch created: `planning/aim-platform-roadmap`
- [x] `docs/` folder initialized
- [x] `AIM_FULL_PROJECT_PLAN.md` written (this file)
- [ ] `AIM_SYSTEM_ARCHITECTURE.md` — pending
- [ ] `AIM_BACKEND_PLAN.md` — pending
- [ ] `AIM_MOBILE_APP_PLAN.md` — pending
- [ ] `AIM_WEB_APP_PLAN.md` — pending
- [ ] `AIM_ADMIN_DASHBOARD_PLAN.md` — pending
- [ ] `AIM_AI_TEACHER_PLAN.md` — pending
- [ ] `AIM_DATABASE_PLAN.md` — pending
- [ ] `AIM_PHASES_AND_TASKS.md` — pending

---

*Last updated: 2026-06-09 | Author: AIM Platform Team*
