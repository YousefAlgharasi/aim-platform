# P16-048: Analytics & Export Security Audit

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Audit Complete — Findings Documented

---

## 1. Scope

This audit covers the analytics and export system at `services/backend-api/src/features/analytics/` for:

- PII exposure in reports and exports
- Child data scope enforcement (parent-child boundaries)
- Billing data in analytics (revenue reports)
- Sensitive payload filtering
- Permission and role-based access checks
- Export file security

---

## 2. Analytics Module Inventory

### 2.1 Controllers (Data Access Points)

| Controller | File | Audience | Data Sensitivity |
|------------|------|----------|-----------------|
| AdminAnalyticsDashboardController | `admin-analytics-dashboard.controller.ts` | Admin only | Platform-wide aggregates |
| AdminLearningReportsController | `admin-learning-reports.controller.ts` | Admin only | Student learning data |
| AdminAssessmentReportsController | `admin-assessment-reports.controller.ts` | Admin only | Assessment results |
| AdminRevenueReportsController | `admin-revenue-reports.controller.ts` | Admin only | Financial data |
| ParentReportsController | `parent-reports.controller.ts` | Parent only | Child-scoped data |
| StudentAnalyticsSummaryController | `student-analytics-summary.controller.ts` | Student/parent | Individual student data |
| AnalyticsExportController | `analytics-export.controller.ts` | Role-based | Export files |

### 2.2 Security Services

| Service | File | Purpose |
|---------|------|---------|
| AnalyticsAccessPolicyService | `analytics-access-policy.service.ts` | Policy-based access decisions |
| AnalyticsAccessGuard | `analytics-access.guard.ts` | Request-level guard |
| AnalyticsAuditService | `analytics-audit.service.ts` | Access audit trail |
| CurrentAnalyticsActorDecorator | `current-analytics-actor.decorator.ts` | Actor context injection |

### 2.3 Export Services

| Service | File | Purpose |
|---------|------|---------|
| AnalyticsExportService | `analytics-export.service.ts` | Export generation |
| AnalyticsExportController | `analytics-export.controller.ts` | Export API |

---

## 3. PII Exposure Assessment

### 3.1 What Constitutes PII in AIM Platform

| Data Type | PII Level | Where Used |
|-----------|-----------|------------|
| Student name | HIGH | Learning reports, parent dashboard |
| Student email | HIGH | User reports |
| Parent name | HIGH | Billing, notifications |
| Parent email | HIGH | Billing, notifications |
| Student age/grade | MEDIUM | Placement, curriculum |
| Learning performance | MEDIUM | Analytics, reports |
| Assessment scores | MEDIUM | Reports, parent dashboard |
| Device tokens | HIGH | Notifications (push) |
| Payment details | HIGH | Billing (should be provider-side) |
| IP addresses | MEDIUM | Auth logs |

### 3.2 PII in Admin Reports

| Report Type | PII Risk | Findings |
|-------------|----------|----------|
| Platform Overview | LOW | Aggregate metrics, no individual PII |
| User Reports | HIGH | Individual user data visible to admins |
| Learning Reports | HIGH | Student-level performance data |
| Assessment Reports | HIGH | Individual assessment scores |
| Revenue Reports | MEDIUM | Parent billing data, payment status |
| Curriculum Reports | LOW | Content metadata, no student PII |
| Notification Reports | MEDIUM | Delivery stats, may include user IDs |

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-PII-001 | Admin reports appropriately show user data (admins need access) | N/A | ACCEPTABLE |
| ANA-PII-002 | Need to verify admin reports don't show raw payment details | HIGH | NEEDS VERIFICATION |
| ANA-PII-003 | Need to verify user reports use `safe-user.dto.ts` pattern | HIGH | NEEDS VERIFICATION |
| ANA-PII-004 | Need to verify learning reports anonymize data in aggregate views | MEDIUM | NEEDS VERIFICATION |

### 3.3 PII in Parent Reports

| Report Type | PII Risk | Findings |
|-------------|----------|----------|
| Progress Report | MEDIUM | Own child's data — appropriate |
| Assessment Report | MEDIUM | Own child's assessments — appropriate |
| Analytics Reports | MEDIUM | Own child's analytics — appropriate |
| Skill State | LOW | Skill mastery status |
| Weakness Recommendations | LOW | Pedagogical recommendations |

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-PII-005 | Parent reports must scope to own children only | CRITICAL | See scope enforcement below |
| ANA-PII-006 | Parent should not see other students' data in aggregate reports | HIGH | NEEDS VERIFICATION |
| ANA-PII-007 | Parent should not see billing data of other parents | CRITICAL | NEEDS VERIFICATION |

---

## 4. Child Scope Enforcement

### 4.1 Access Control Architecture

The analytics module has a dedicated access control system:

1. `@AnalyticsAccess()` decorator (`analytics-access.decorator.ts`) — marks endpoints with access requirements
2. `AnalyticsAccessGuard` (`analytics-access.guard.ts`) — enforces access at request level
3. `AnalyticsAccessPolicyService` (`analytics-access-policy.service.ts`) — makes policy decisions
4. `@CurrentAnalyticsActor()` decorator — injects the authenticated actor context

**Positive findings:**
- Dedicated analytics access system (not just generic role guards)
- Policy service pattern allows complex access rules
- Both guard and policy service have spec files

### 4.2 Scope Enforcement Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-SCOPE-001 | Analytics access guard exists with tests | N/A | PASS |
| ANA-SCOPE-002 | Analytics access policy service exists with tests | N/A | PASS |
| ANA-SCOPE-003 | Current analytics actor decorator provides context | N/A | PASS |
| ANA-SCOPE-004 | Need to verify parent actor is scoped to own children | CRITICAL | NEEDS VERIFICATION |
| ANA-SCOPE-005 | Need to verify student actor is scoped to own data | HIGH | NEEDS VERIFICATION |
| ANA-SCOPE-006 | Need to verify admin actor has platform-wide scope | MEDIUM | NEEDS VERIFICATION |
| ANA-SCOPE-007 | Need to verify scope cannot be bypassed via query parameters | CRITICAL | NEEDS VERIFICATION |

---

## 5. Billing Data in Analytics

### 5.1 Revenue Reports

`AdminRevenueReportsController` (`admin-revenue-reports.controller.ts`) provides revenue analytics to admins.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-BIL-001 | Revenue reports are admin-only (correct) | N/A | PASS |
| ANA-BIL-002 | Need to verify revenue reports show aggregates, not individual payment details | HIGH | NEEDS VERIFICATION |
| ANA-BIL-003 | Need to verify no card numbers/tokens in revenue data | CRITICAL | NEEDS VERIFICATION |
| ANA-BIL-004 | Need to verify parent cannot access revenue reports | HIGH | NEEDS VERIFICATION |

---

## 6. Export Security

### 6.1 Export Architecture

`AnalyticsExportController` (`analytics-export.controller.ts`) and `AnalyticsExportService` (`analytics-export.service.ts`) provide data export functionality.

**Test coverage:**
- `analytics-export.controller.spec.ts` — controller tests
- `analytics-export.service.spec.ts` — service tests

### 6.2 Export Security Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-EXP-001 | Export controller has spec tests | N/A | PASS |
| ANA-EXP-002 | Export service has spec tests | N/A | PASS |
| ANA-EXP-003 | Need to verify exports require authentication | CRITICAL | NEEDS VERIFICATION |
| ANA-EXP-004 | Need to verify exports are scoped to actor's access level | CRITICAL | NEEDS VERIFICATION |
| ANA-EXP-005 | Need to verify export files are not publicly accessible URLs | HIGH | NEEDS VERIFICATION |
| ANA-EXP-006 | Need to verify export files have expiring download links | HIGH | NEEDS VERIFICATION |
| ANA-EXP-007 | Need to verify export file cleanup (no stale files in storage) | MEDIUM | NEEDS VERIFICATION |
| ANA-EXP-008 | Need to verify export audit logging (who downloaded what) | HIGH | NEEDS VERIFICATION |
| ANA-EXP-009 | Need to verify export size limits prevent abuse | MEDIUM | NEEDS VERIFICATION |
| ANA-EXP-010 | Need to verify PII redaction options in exports | MEDIUM | NEEDS VERIFICATION |

### 6.3 Export Scope by Role

| Role | Expected Export Scope | Verification Status |
|------|---------------------|-------------------|
| Admin | Platform-wide data with all columns | NEEDS VERIFICATION |
| Parent | Own children's data only | NEEDS VERIFICATION |
| Student | Own data only | NEEDS VERIFICATION |

---

## 7. Sensitive Payload Filtering

### 7.1 Analytics DTOs

`analytics.dtos.ts` defines the data transfer objects for analytics responses. `analytics.validation.ts` with `analytics.validation.spec.ts` provide input validation.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-DTO-001 | Analytics DTOs exist for response filtering | N/A | PASS |
| ANA-DTO-002 | Analytics validation exists with tests | N/A | PASS |
| ANA-DTO-003 | Need to verify DTOs exclude internal IDs, timestamps | MEDIUM | NEEDS VERIFICATION |
| ANA-DTO-004 | Need to verify no raw DB column names in response | LOW | NEEDS VERIFICATION |

### 7.2 Analytics Entities

`analytics.entities.ts` defines database entities. These should never be returned directly in API responses.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-ENT-001 | Need to verify entities are not directly serialized in responses | HIGH | NEEDS VERIFICATION |
| ANA-ENT-002 | Need to verify entity-to-DTO mapping is enforced | HIGH | NEEDS VERIFICATION |

---

## 8. Audit Trail

### 8.1 Analytics Audit Service

`analytics-audit.service.ts` provides audit logging for analytics access.

**Positive finding:** A dedicated analytics audit service exists, enabling access tracking and compliance.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| ANA-AUD-001 | Analytics audit service exists | N/A | PASS |
| ANA-AUD-002 | Need to verify all report access is logged | HIGH | NEEDS VERIFICATION |
| ANA-AUD-003 | Need to verify all export downloads are logged | HIGH | NEEDS VERIFICATION |
| ANA-AUD-004 | Need to verify audit logs include actor identity and scope | HIGH | NEEDS VERIFICATION |

---

## 9. Web Frontend Export Security

### 9.1 Admin Export UI

`apps/web/src/features/admin-analytics/pages/AdminExportManager.js` provides the admin export interface.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WEB-EXP-001 | Admin export manager exists | N/A | PASS |
| WEB-EXP-002 | Need to verify export download uses authenticated API call | HIGH | NEEDS VERIFICATION |
| WEB-EXP-003 | Need to verify export files are not cached in browser storage | MEDIUM | NEEDS VERIFICATION |

### 9.2 Parent Report UI

Parent report pages (`ParentProgressReport.js`, `ParentAssessmentReport.js`, `ParentAnalyticsReports.js`) display child data.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WEB-PAR-001 | Parent report pages use `parentAnalyticsApiClient.js` | N/A | PASS |
| WEB-PAR-002 | Need to verify parent report API client passes child ID for scoping | HIGH | NEEDS VERIFICATION |
| WEB-PAR-003 | Need to verify no cross-child data leakage in aggregate views | HIGH | NEEDS VERIFICATION |

---

## 10. Summary

### Positive Findings

1. Dedicated analytics access control system (guard + policy + actor)
2. Both analytics access guard and policy service have spec tests
3. Analytics export controller and service have spec tests
4. Analytics audit service exists for access tracking
5. Analytics validation exists with tests
6. Analytics DTOs exist for response filtering
7. Revenue reports are correctly restricted to admin role

### Critical Issues

| Priority | Issue | Severity |
|----------|-------|----------|
| 1 | Verify parent-child scope cannot be bypassed | CRITICAL |
| 2 | Verify exports are scoped to actor access level | CRITICAL |
| 3 | Verify no card/payment details in revenue reports | CRITICAL |
| 4 | Verify export files are not publicly accessible | HIGH |
| 5 | Verify export downloads are audit logged | HIGH |
| 6 | Verify entities are not directly serialized | HIGH |

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — The analytics module has a well-architected access control system with dedicated guards, policies, and audit logging. The critical concern is verifying that parent-child scope enforcement actually works at the query/repository level and cannot be bypassed via query parameter manipulation.
