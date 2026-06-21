# Phase 16 End-to-End Test Matrix

**Task:** P16-006
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Map critical user flows across all roles (student, admin, parent) to E2E
test coverage status and ownership. Each flow represents a real user
journey that must work correctly before production release.

## Flow Priority Levels

| Priority | Definition |
|----------|------------|
| **P0** | Launch blocker — must be tested and passing |
| **P1** | Important — should be tested before launch |
| **P2** | Nice to have — can be tested post-launch |

## Student Flows (Mobile App)

| ID | Flow | Steps | Priority | Coverage | Owner |
|----|------|-------|----------|----------|-------|
| S-01 | Student registration | Open app -> Sign up -> Email verification -> Profile creation | P0 | Manual only | Mobile team |
| S-02 | Student login | Open app -> Sign in -> JWT issued -> Home screen | P0 | Manual only | Mobile team |
| S-03 | Placement test | Login -> Start placement -> Answer questions -> View result -> Initial learning path assigned | P0 | Backend specs exist (`placement.controller.spec.ts`, `placement-scoring.service.spec.ts`) | Mobile team + Backend team |
| S-04 | Lesson flow | Select lesson -> View content -> Answer questions -> Submit answers -> View results | P0 | Backend specs exist (`answer-submission.service.spec.ts`) | Mobile team + Backend team |
| S-05 | Assessment attempt | Start assessment -> Answer questions -> Submit -> View grade -> View feedback | P0 | Backend specs exist (`assessment-attempt.service.spec.ts`, `assessment-grading.service.spec.ts`, `assessment-grading.integration.spec.ts`) | Mobile team + Backend team |
| S-06 | AIM recommendation | Complete lesson -> AIM engine computes recommendation -> Next lesson presented | P0 | Backend specs exist (`aim-engine-client.service.spec.ts`) | Mobile team + Algorithm team |
| S-07 | View progress | Login -> Navigate to progress -> View mastery levels, skill states | P1 | Widget tests in `test/features/` | Mobile team |
| S-08 | AI Teacher chat | Open AI teacher -> Send message -> Receive response -> View history | P1 | Backend specs exist (`chat-message-submit.controller.spec.ts`, `ai-teacher-orchestrator.service.spec.ts`) | Mobile team + Backend team |
| S-09 | Voice interaction | Open voice mode -> Speak -> STT transcription -> Response | P1 | Manual only | Mobile team + Backend team |
| S-10 | Notification receipt | Backend sends notification -> Mobile receives push/in-app -> User views in inbox | P1 | Backend specs exist (`notification-delivery.spec.ts`) | Mobile team + Backend team |
| S-11 | Billing subscription | View plans -> Select plan -> Checkout -> Payment -> Entitlement granted | P1 | Backend specs exist (`checkout-flow.spec.ts`, `entitlement.spec.ts`) | Mobile team + Backend team |
| S-12 | Profile management | View profile -> Edit name/avatar -> Save -> Verify persistence | P2 | Manual only | Mobile team |
| S-13 | Achievements | Complete milestones -> View achievements screen | P2 | Widget tests in `test/features/achievements/` | Mobile team |
| S-14 | Review sessions | AIM schedules review -> Student completes review -> Mastery updated | P1 | Manual only | Mobile team + Algorithm team |
| S-15 | Analytics summary | Login -> View analytics summary -> Verify data from backend | P2 | Manual only | Mobile team |

## Admin Flows (Admin Dashboard)

| ID | Flow | Steps | Priority | Coverage | Owner |
|----|------|-------|----------|----------|-------|
| A-01 | Admin login | Open dashboard -> Supabase auth -> Admin role verified -> Admin shell | P0 | Build verified in CI; manual flow | Frontend team |
| A-02 | Unauthorized redirect | Non-admin user attempts admin URL -> Redirected to `admin-unauthorized` | P0 | Route exists (`app/admin-unauthorized/`) | Frontend team |
| A-03 | User management | Login -> Users list -> View user detail -> Assign role | P0 | Backend specs exist (`admin-users.service.spec.ts`, `admin-role-assignment.service.spec.ts`) | Frontend team + Backend team |
| A-04 | Curriculum management | Login -> View courses -> Edit lesson -> Publish | P1 | Backend curriculum module specs exist | Frontend team + Backend team |
| A-05 | Content status workflow | Login -> View content items -> Change status -> Audit log created | P1 | `components/content-status-workflow.tsx` exists | Frontend team + Backend team |
| A-06 | Billing overview | Login -> View billing dashboard -> View invoices, subscriptions | P1 | `components/billing/` exists | Frontend team + Backend team |
| A-07 | Analytics dashboard | Login -> View admin analytics -> Dashboard widgets render | P1 | Backend specs exist for dashboard service | Frontend team + Backend team |
| A-08 | Learning reports | Login -> View learning reports -> Run report -> View results | P1 | Backend `admin-learning-reports.controller.ts` exists; report runner is a stub | Frontend team + Backend team |
| A-09 | Assessment reports | Login -> View assessment reports -> Run report | P1 | Backend `admin-assessment-reports.controller.ts` exists | Frontend team + Backend team |
| A-10 | Revenue reports | Login -> View revenue reports -> Run report | P1 | Backend `admin-revenue-reports.controller.ts` exists | Frontend team + Backend team |
| A-11 | Notification management | Login -> View notifications -> Configure templates | P1 | `src/features/admin-notifications/` exists in web app | Frontend team + Backend team |
| A-12 | Analytics export | Login -> Request export -> Download file | P2 | Backend specs exist (`analytics-export.controller.spec.ts`, `analytics-export.service.spec.ts`) | Frontend team + Backend team |

## Parent Flows (Web App)

| ID | Flow | Steps | Priority | Coverage | Owner |
|----|------|-------|----------|----------|-------|
| P-01 | Parent registration | Open web app -> Sign up -> Profile creation | P0 | Manual only | Frontend team |
| P-02 | Parent login | Open web app -> Sign in -> Parent dashboard | P0 | Manual only | Frontend team |
| P-03 | Child linking | Login -> Enter invitation code -> Link to child -> Consent flow | P0 | Backend specs exist (`parent-invitation.service.spec.ts`, `parent-consent.service.spec.ts`) | Frontend team + Backend team |
| P-04 | View child progress | Login -> Select child -> View progress summary | P0 | Backend specs exist (`parent-child-progress.service.spec.ts`, `parent-dashboard-summary.service.spec.ts`) | Frontend team + Backend team |
| P-05 | View child assessments | Login -> Select child -> View assessment results | P1 | Backend specs exist (`parent-assessment-summary.service.spec.ts`, `parent-assessment-access.spec.ts`) | Frontend team + Backend team |
| P-06 | View child activity | Login -> Select child -> View recent activity | P1 | Backend specs exist (`parent-activity-summary.service.spec.ts`) | Frontend team + Backend team |
| P-07 | Parent reports | Login -> View reports -> Run parent report | P1 | Backend specs exist (`parent-reports.controller.spec.ts`, `parent-report.service.spec.ts`) | Frontend team + Backend team |
| P-08 | Notification preferences | Login -> Settings -> Configure notification preferences | P2 | Backend specs exist (`parent-notification-preference.service.spec.ts`) | Frontend team + Backend team |

## Cross-Role Flows

| ID | Flow | Steps | Priority | Coverage | Owner |
|----|------|-------|----------|----------|-------|
| X-01 | Admin creates assessment, student takes it | Admin publishes assessment -> Student sees it -> Student completes -> Admin views results | P0 | Individual specs exist; no E2E automation | All teams |
| X-02 | Parent links to child, views progress | Parent registers -> Admin/student links -> Parent views child data | P0 | Individual specs exist; no E2E automation | All teams |
| X-03 | Admin sends notification, student receives | Admin triggers notification -> Backend queues -> Student receives in-app | P1 | Individual specs exist | All teams |
| X-04 | Billing entitlement enables features | Student subscribes -> Entitlement created -> Premium features unlocked | P1 | Backend specs exist | All teams |

## Coverage Summary

| Category | Total Flows | P0 Flows | Backend Specs | E2E Automated | Manual Only |
|----------|-------------|----------|---------------|---------------|-------------|
| Student | 15 | 6 | 10 | 0 | 5 |
| Admin | 12 | 3 | 9 | 0 | 3 |
| Parent | 8 | 4 | 7 | 0 | 1 |
| Cross-role | 4 | 2 | 4 | 0 | 0 |
| **Total** | **39** | **15** | **30** | **0** | **9** |

## Gaps and Recommendations

1. **No automated E2E tests exist.** All flows are verified through
   individual backend unit tests or manual testing. Consider adding
   Playwright or Cypress tests for the top P0 flows (S-01 through S-06,
   A-01, P-01 through P-04).

2. **Cross-role flows have no integration coverage.** The X-01 through X-04
   flows are the most critical for production confidence and currently rely
   entirely on independent per-service tests.

3. **Report runner is a stub** (flagged in R-001 of the risk register).
   Flows A-08, A-09, A-10, and P-07 cannot be fully validated until the
   runner is implemented.

4. **Voice interaction (S-09) is manual-only** and depends on STT provider
   integration, which uses noop adapters in the current codebase.
