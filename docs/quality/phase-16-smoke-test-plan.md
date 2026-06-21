# Phase 16 — Smoke Test Plan

**Document ID:** P16-066
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This document defines the smoke tests to be executed immediately after each deployment of the AIM Platform. Smoke tests verify that core functionality works end-to-end without performing exhaustive regression testing.

---

## 1. Smoke Test Principles

- **Scope:** Critical user paths only — not full regression.
- **Duration:** Complete suite should finish in under 30 minutes.
- **Trigger:** Run after every production deployment.
- **Failure response:** Any smoke test failure blocks the deployment and triggers rollback evaluation.
- **Environments:** Tests should be executed against staging first, then production.

---

## 2. Authentication Smoke Tests

### 2.1 Supabase Auth (All Clients)

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| AUTH-01 | Student login | Enter valid student credentials | Session created, JWT issued, redirect to home |
| AUTH-02 | Parent login | Enter valid parent credentials | Session created, redirect to parent dashboard |
| AUTH-03 | Admin login | Enter valid admin credentials | Session created, redirect to admin dashboard |
| AUTH-04 | Invalid login | Enter wrong password | Error message displayed, no session created |
| AUTH-05 | Session persistence | Login, close app, reopen | Session restored from secure storage |
| AUTH-06 | Session expiry | Wait for token expiry | Auto-refresh or redirect to login |
| AUTH-07 | Logout | Tap/click logout | Session cleared, redirect to login |

**Backend verification:**
- `POST /auth/me` returns correct user profile and role
- JWT verification via `supabase-jwt-verifier.service.ts` succeeds
- Role guard (`role.guard.ts`) enforces correct access

---

## 3. Mobile App Smoke Tests

### 3.1 Core Learning Flow

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-01 | App launch | Open app | Splash screen, then home or login |
| MOB-02 | Onboarding | New user first launch | Onboarding flow completes |
| MOB-03 | Home screen | Login as student | Home screen loads with learning path |
| MOB-04 | Learning path | Navigate to learning path | Curriculum structure displayed |
| MOB-05 | Start lesson | Tap on an available lesson | Lesson content loads |
| MOB-06 | Complete lesson | Work through lesson steps | Lesson marked complete, progress updated |
| MOB-07 | Practice mode | Navigate to practice | Practice questions load |
| MOB-08 | Profile view | Navigate to profile | Student profile displays correctly |

### 3.2 Placement Test

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-09 | Start placement | New student initiates placement | Placement test loads |
| MOB-10 | Complete placement | Answer all placement questions | Level assigned, learning path generated |

### 3.3 AI Teacher

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-11 | Open AI chat | Navigate to AI teacher | Chat interface loads |
| MOB-12 | Send message | Type and send a question | AI response received within timeout |
| MOB-13 | Voice input | Tap voice button, speak | Speech recognized, response generated |

### 3.4 Assessments

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-14 | View assessments | Navigate to assessments | Assessment list loads |
| MOB-15 | Take assessment | Start and complete an assessment | Results displayed, score recorded |

### 3.5 Notifications

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-16 | View notifications | Navigate to notifications | Notification list loads |
| MOB-17 | Notification detail | Tap a notification | Notification content displays |

### 3.6 Billing

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-18 | View billing | Navigate to billing | Subscription status displays |

### 3.7 Analytics

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| MOB-19 | View analytics | Navigate to analytics summary | Analytics charts/data render |
| MOB-20 | View progress | Navigate to progress | Progress data displays |

---

## 4. Admin Dashboard Smoke Tests

### 4.1 Admin Core Functions

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| ADM-01 | Dashboard load | Login as admin | Admin dashboard renders |
| ADM-02 | User list | Navigate to user management | User list loads |
| ADM-03 | User detail | Click on a user | User detail page renders |
| ADM-04 | Role management | View roles | Role list displays |
| ADM-05 | Analytics overview | Navigate to admin analytics | Analytics dashboard renders with data |
| ADM-06 | Notification management | Navigate to admin notifications | Notification management interface loads |
| ADM-07 | System status | Navigate to status | System status page renders |

### 4.2 Admin Data Integrity

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| ADM-08 | Student count | Check student count on dashboard | Matches database count |
| ADM-09 | Recent activity | Check recent activity feed | Shows recent student activity |

---

## 5. Parent Dashboard Smoke Tests

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| PAR-01 | Dashboard load | Login as parent | Parent dashboard renders |
| PAR-02 | Student list | View linked students | Linked students displayed |
| PAR-03 | Student progress | Click on a student | Student progress data loads |
| PAR-04 | Notifications | View notifications | Parent notifications display |
| PAR-05 | Analytics | View analytics | Parent analytics charts render |

---

## 6. AIM Engine Smoke Tests

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| AIM-01 | Engine health | Check AIM engine health endpoint | Returns 200 |
| AIM-02 | Placement scoring | Submit a placement test result | Score and level returned |
| AIM-03 | Recommendation | Request lesson recommendation | Valid lesson recommendations returned |

---

## 7. Backend API Smoke Tests

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| API-01 | Health check | `GET /health` | Returns 200 |
| API-02 | Swagger docs | `GET /api` | Swagger UI renders |
| API-03 | Auth endpoint | `GET /auth/me` with valid JWT | Returns user profile |
| API-04 | Curriculum endpoint | `GET /curriculum/...` with auth | Returns curriculum data |
| API-05 | CORS check | Request from allowed origin | CORS headers present |
| API-06 | Unauthorized access | Request without JWT | Returns 401 |
| API-07 | Role enforcement | Student JWT on admin endpoint | Returns 403 |

---

## 8. Cross-Cutting Smoke Tests

| ID | Test | Steps | Expected Result |
|----|------|-------|-----------------|
| XCT-01 | RTL rendering | Switch to Arabic locale | All visible UI renders RTL correctly |
| XCT-02 | Error handling | Trigger a 404 | Appropriate error page/message displayed |
| XCT-03 | Offline behavior | Disconnect network on mobile | Graceful offline message |
| XCT-04 | Deep linking | Open a deep link to a lesson | Correct lesson opens (or login redirect) |

---

## 9. Smoke Test Execution Matrix

| Test Group | Staging | Production | Automated |
|------------|---------|------------|-----------|
| Authentication (AUTH-*) | Required | Required | Partial |
| Mobile (MOB-*) | Required | Manual only | No |
| Admin (ADM-*) | Required | Required | No |
| Parent (PAR-*) | Required | Required | No |
| AIM Engine (AIM-*) | Required | Required | Partial |
| Backend API (API-*) | Required | Required | Yes |
| Cross-cutting (XCT-*) | Required | Sampling | No |

---

## 10. Test Data Requirements

| Data | Purpose | Source |
|------|---------|--------|
| Test student account | Mobile and API tests | Seed data or Supabase auth |
| Test parent account | Parent dashboard tests | Seed data or Supabase auth |
| Test admin account | Admin dashboard tests | Seed data or Supabase auth |
| Sample curriculum | Lesson and learning path tests | Seed data |
| Sample assessments | Assessment tests | Seed data |

**Important:** Test accounts must use non-production credentials. See `database/supabase/seed/` for seed data configuration.

---

## 11. Failure Handling

| Failure Severity | Action |
|-----------------|--------|
| Any AUTH test fails | Block release, rollback |
| Any MOB core flow fails (MOB-01 to MOB-06) | Block release, rollback |
| AI teacher fails (MOB-11 to MOB-13) | Document as known issue, proceed with warning |
| Admin analytics fails | Document, proceed if non-critical |
| Billing test fails | Document, proceed if billing is not launched |
| RTL rendering issue | Document, proceed if minor |
