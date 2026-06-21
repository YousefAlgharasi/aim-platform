# Phase 16 QA Master Test Plan

**Task:** P16-005
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define the overall test strategy for Phase 16 release readiness across all
AIM Platform subsystems: backend API, AIM engine, mobile app, admin
dashboard, parent dashboard, billing, notifications, analytics, and
regression suites.

## Test Strategy Overview

### Test Pyramid

```
         /  E2E  \          <- Manual + automated critical paths
        / Integration \      <- Service-to-service, DB integration
       /   Unit Tests    \   <- Service logic, guards, validators
      /  Static Analysis   \ <- TypeScript, Flutter analyze, ruff
```

### Test Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Local | Developer testing | Seed data from `prisma/seeds/` |
| CI | Automated testing on push/PR | Fresh DB per run |
| Staging | Integration and E2E testing | Production-like seed data |
| Pre-production | Final validation | Anonymized production data copy |

## 1. Backend API Test Plan (`services/backend-api/`)

### 1.1 Unit Tests

**Runner:** Jest (`npm run test`)
**Config:** `jest.config.js`
**Current count:** 256 spec files

| Module | Key Spec Files | Coverage Focus |
|--------|---------------|----------------|
| Auth | `supabase-jwt-auth.guard.spec.ts`, `role.guard.spec.ts`, `permission.guard.spec.ts`, `profile-ownership.guard.spec.ts`, `session-validation.service.spec.ts`, `auth-me.presenter.spec.ts`, `current-user.decorator.spec.ts`, `auth-logging.service.spec.ts`, `auth-profile-bootstrap.service.spec.ts` | JWT verification, role enforcement, session validation, audit logging |
| Assessments | `assessment.controller.spec.ts`, `assessment.service.spec.ts`, `assessment-grading.service.spec.ts`, `answer-submission.service.spec.ts`, `assessment-attempt.service.spec.ts`, `no-client-authority-api.spec.ts`, `assessment-grading.integration.spec.ts` | Grading correctness, attempt lifecycle, backend authority |
| Analytics | `analytics-access-policy.service.spec.ts`, `analytics-access.guard.spec.ts`, `analytics-event-ingestion.service.spec.ts`, `analytics-export.service.spec.ts`, `analytics-export.controller.spec.ts`, `metric-aggregation.service.spec.ts`, `report-runner.service.spec.ts`, `report-definition.service.spec.ts`, `cohort.service.spec.ts`, `analytics.validation.spec.ts`, `parent-reports.controller.spec.ts` | Access control, ingestion safety, export scoping, aggregation |
| Billing | `billing-ownership.guard.spec.ts`, `billing.validation.spec.ts`, `billing.errors.spec.ts`, `billing-permissions.spec.ts`, `checkout-flow.spec.ts`, `entitlement.spec.ts`, `refund.spec.ts`, `sensitive-data.spec.ts`, `webhook-idempotency.spec.ts` | Ownership, idempotency, permissions, sensitive data |
| Notifications | `notification-delivery.spec.ts`, `notification-errors.spec.ts`, `notification-permission.spec.ts`, `notification-privacy.spec.ts`, `notification-scheduling.spec.ts`, `notification-validation.helpers.spec.ts` | Delivery, rate limiting, privacy, permissions |
| Parents | `parent-access-policy.service.spec.ts`, `parent-activity-summary.service.spec.ts`, `parent-assessment-summary.service.spec.ts`, `parent-child-progress.service.spec.ts`, `parent-consent.service.spec.ts`, `parent-dashboard-summary.service.spec.ts`, `parent-invitation.service.spec.ts`, `parent-notification-preference.service.spec.ts`, `parent-report.service.spec.ts`, `parent-readonly-progress.spec.ts`, `parent-assessment-access.spec.ts`, `parent-errors.spec.ts`, `parent-validation.spec.ts`, `parents.controller.spec.ts` | Consent, access policy, child data isolation |
| Placement | `placement.controller.spec.ts`, `placement-permission.guard.spec.ts`, `placement-retake-policy.service.spec.ts`, `placement-scoring.service.spec.ts` | Scoring correctness, retake policy, permissions |
| Curriculum | `curriculum.module.spec.ts` | Module registration |
| AIM | `aim-engine-client.service.spec.ts`, `aim-health-check.service.spec.ts` | Engine communication, health monitoring |
| Config | `backend-config.spec.ts` | Environment validation |
| Admin | `admin.controller.spec.ts`, `admin.service.spec.ts`, `admin-role-assignment.service.spec.ts`, `admin-role-assignment.controller.spec.ts`, `admin-users.service.spec.ts`, `admin-user-detail.service.spec.ts`, `admin-profile.service.spec.ts` | User management, role assignment |

### 1.2 Integration Tests

| Test Area | Approach | Status |
|-----------|----------|--------|
| Auth flow (JWT to role resolution) | Test with real Supabase JWT tokens against running backend | Not yet automated |
| Assessment grading pipeline | `assessment-grading.integration.spec.ts` | Exists |
| Placement scoring pipeline | End-to-end placement attempt to result | Spec files exist |
| AIM Engine integration | Backend to AIM Engine HTTP call | Requires running AIM Engine |
| Notification delivery pipeline | Ingestion to delivery worker | Integration files exist (`deadline-reminder.integration.ts`, etc.) |
| Billing checkout flow | Checkout to entitlement creation | `checkout-flow.spec.ts` exists |
| Analytics pipeline | Event ingestion to report generation | Not yet implemented (flagged in Phase 15) |

### 1.3 Static Analysis

- TypeScript strict mode compilation (`npm run build`)
- ESLint/Prettier (if configured)
- Prisma schema validation (`prisma validate`)

## 2. AIM Engine Test Plan (`services/aim-engine/`)

### 2.1 Unit Tests

**Runner:** pytest
**Linting:** ruff check + ruff format

| Test Area | Focus |
|-----------|-------|
| Mastery computation | Algorithm correctness, edge cases |
| Difficulty adjustment | Level transitions, boundary conditions |
| Weakness detection | Pattern recognition, false positive rate |
| Review scheduling | Spaced repetition timing |
| Recommendation generation | Learning path optimization |

### 2.2 Integration Tests

- Backend API to AIM Engine HTTP contract validation
- Response format verification
- Error handling for malformed requests

## 3. Mobile App Test Plan (`apps/mobile/`)

### 3.1 Unit and Widget Tests

**Runner:** `flutter test`
**Directory:** `test/`

| Test Area | Directory | Focus |
|-----------|-----------|-------|
| Core utilities | `test/core/` | Data models, networking, state management |
| Feature tests | `test/features/` | Per-feature widget and logic tests |
| Regression tests | `test/regression/` | Previously-caught bugs |
| Widget tests | `test/widget_test.dart` | Basic app widget rendering |

### 3.2 Static Analysis

- `flutter analyze --no-fatal-infos`

### 3.3 Manual Testing Checklist

- [ ] Auth flow (Supabase sign-in/sign-up)
- [ ] Placement test completion
- [ ] Lesson navigation and question answering
- [ ] AIM results display
- [ ] Notification display and preference management
- [ ] Billing flow (subscription selection)
- [ ] Profile management
- [ ] RTL/Arabic text rendering
- [ ] Offline behavior
- [ ] Deep linking

## 4. Admin Dashboard Test Plan (`apps/admin-dashboard/`)

### 4.1 Automated Tests

**Runner:** Jest (`jest.config.ts`, `jest.setup.ts`)
**Directory:** `__tests__/`

| Test Area | Focus |
|-----------|-------|
| Typecheck | `npm run typecheck` — full TypeScript compilation |
| Build | `npm run build` — production build succeeds |
| Component tests | `__tests__/` — rendering and interaction |

### 4.2 Manual Testing Checklist

- [ ] Admin login / auth redirect
- [ ] Unauthorized access redirect to `admin-unauthorized`
- [ ] Admin shell layout rendering
- [ ] Navigation component
- [ ] Curriculum management pages
- [ ] Billing management pages
- [ ] Analytics dashboard
- [ ] Notification management
- [ ] User management

## 5. Web App (Parent Dashboard) Test Plan (`apps/web/`)

### 5.1 Automated Tests

- `App.test.js` — basic rendering test
- Feature-specific tests as available

### 5.2 Manual Testing Checklist

- [ ] Parent login
- [ ] Child linking / invitation acceptance
- [ ] Progress dashboard viewing
- [ ] Assessment summary viewing
- [ ] Notification preferences
- [ ] RTL/Arabic rendering

## 6. Cross-System Regression Suites

### 6.1 Security Regression

| Test | Scope |
|------|-------|
| No secrets in source | Grep entire repo for key patterns |
| Auth guard coverage | Every controller endpoint has JWT guard |
| RBAC enforcement | Admin routes reject non-admin tokens |
| Parent data isolation | Parent cannot access other parents' children |
| Student data isolation | Student cannot access other students' data |
| Billing isolation | User cannot access other users' billing |

### 6.2 Backend Authority Regression

| Test | Scope |
|------|-------|
| No client-computed mastery | Assessments, AIM results |
| No client-computed grades | Assessment grading |
| No client-computed reports | Analytics reports |
| No speed-as-mastery | Mastery computation logic |

### 6.3 Privacy Regression

| Test | Scope |
|------|-------|
| Cohort minimum size | Analytics cohort queries |
| PII stripping | Analytics event ingestion |
| Consent enforcement | Parent child access |
| Audit logging | All sensitive operations |

## Test Execution Schedule

| Phase | Activity | Duration |
|-------|----------|----------|
| Week 1 | Run all existing automated tests, fix failures | 2-3 days |
| Week 1 | Security regression audit | 1 day |
| Week 2 | Integration test development and execution | 3-4 days |
| Week 2 | Mobile manual testing | 2 days |
| Week 3 | Admin dashboard manual testing | 1 day |
| Week 3 | Parent dashboard manual testing | 1 day |
| Week 3 | Load testing and performance validation | 2 days |
| Week 4 | Final regression pass | 2 days |
| Week 4 | Release gate verification | 1 day |
