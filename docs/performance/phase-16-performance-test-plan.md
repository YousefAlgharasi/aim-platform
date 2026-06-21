# Phase 16 - Performance Test Plan

**Task ID:** P16-036
**Date:** 2026-06-21
**Scope:** Define performance scenarios, thresholds, test data, tools, and pass/fail gates for the AIM Platform.

---

## 1. Overview

This performance test plan defines the scenarios, thresholds, tooling, and pass/fail criteria for validating AIM Platform performance ahead of release. The plan covers backend API response times, database query performance, mobile app responsiveness, and system-level load capacity.

---

## 2. Performance Objectives

### 2.1 Response Time Targets

| Tier | Target | Examples |
|------|--------|---------|
| P0 - Critical path | < 200ms (p95) | Auth, lesson content, question delivery |
| P1 - Interactive | < 500ms (p95) | Dashboard loading, progress updates, search |
| P2 - Background | < 2000ms (p95) | Reports, exports, analytics aggregation |
| P3 - Async | < 5000ms (p95) | Notification delivery, digest generation |

### 2.2 Throughput Targets

| Metric | Target |
|--------|--------|
| Concurrent users | 500 minimum |
| API requests/second | 200 sustained |
| Webhook processing | 50/second burst |
| Notification delivery | 100/minute |

### 2.3 Mobile Performance Targets

| Metric | Target |
|--------|--------|
| Cold start time | < 3 seconds |
| Screen transition | < 300ms |
| API response rendering | < 500ms (data visible) |
| Memory usage | < 150MB active |
| Battery drain | < 5% per 30min active use |

---

## 3. Test Scenarios

### 3.1 Authentication Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| AUTH-01 | JWT verification (valid token) | GET /auth/me | < 100ms p95 |
| AUTH-02 | JWT verification (expired token) | GET /auth/me | < 100ms p95 |
| AUTH-03 | Profile bootstrap (first login) | POST /auth/bootstrap | < 500ms p95 |
| AUTH-04 | Concurrent auth (100 users) | Parallel /auth/me | < 200ms p95 |

### 3.2 Placement Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| PLCE-01 | Placement test start | POST /placement/start | < 300ms p95 |
| PLCE-02 | Question delivery | GET /placement/question | < 200ms p95 |
| PLCE-03 | Answer submission | POST /placement/answer | < 300ms p95 |
| PLCE-04 | Scoring computation | POST /placement/complete | < 1000ms p95 |
| PLCE-05 | Initial learning path generation | POST /placement/learning-path | < 2000ms p95 |

### 3.3 Lesson and Content Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| LSSN-01 | Course list | GET /courses | < 200ms p95 |
| LSSN-02 | Chapter list | GET /courses/:id/chapters | < 200ms p95 |
| LSSN-03 | Lesson content | GET /lessons/:id | < 300ms p95 |
| LSSN-04 | Lesson assets | GET /lessons/:id/assets | < 500ms p95 |

### 3.4 Assessment Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| ASMT-01 | Assessment list | GET /assessments | < 300ms p95 |
| ASMT-02 | Start attempt | POST /assessments/:id/attempt | < 300ms p95 |
| ASMT-03 | Question delivery | GET /assessments/:id/questions | < 200ms p95 |
| ASMT-04 | Answer submission | POST /assessments/:id/answer | < 300ms p95 |
| ASMT-05 | Grading | POST /assessments/:id/grade | < 1000ms p95 |
| ASMT-06 | Result retrieval | GET /assessments/:id/result | < 200ms p95 |
| ASMT-07 | Deadline check | GET /assessments/:id/deadline | < 100ms p95 |

### 3.5 Notification Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| NOTF-01 | Inbox listing | GET /notifications/inbox | < 300ms p95 |
| NOTF-02 | Preference update | PUT /notifications/preferences | < 200ms p95 |
| NOTF-03 | Device token register | POST /notifications/tokens | < 200ms p95 |
| NOTF-04 | Notification delivery (push) | Worker processing | < 2000ms p95 |
| NOTF-05 | Digest generation | Worker processing | < 5000ms p95 |
| NOTF-06 | Reminder scheduling | Worker processing | < 1000ms p95 |

### 3.6 Billing Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| BILL-01 | Pricing display | GET /pricing | < 200ms p95 |
| BILL-02 | Checkout initiation | POST /checkout | < 1000ms p95 |
| BILL-03 | Webhook processing | POST /webhooks | < 500ms p95 |
| BILL-04 | Entitlement check | GET /entitlements | < 100ms p95 |
| BILL-05 | Invoice listing | GET /invoices | < 300ms p95 |
| BILL-06 | Idempotency check | Duplicate webhook | < 100ms p95 |

### 3.7 Analytics Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| ANLY-01 | Dashboard summary | GET /analytics/dashboard | < 1000ms p95 |
| ANLY-02 | Metric aggregation | GET /analytics/metrics | < 2000ms p95 |
| ANLY-03 | Report generation | POST /analytics/reports | < 5000ms p95 |
| ANLY-04 | Data export | POST /analytics/export | < 10000ms p95 |
| ANLY-05 | Cohort analysis | GET /analytics/cohorts | < 3000ms p95 |
| ANLY-06 | Parent reports | GET /parents/reports | < 1000ms p95 |

### 3.8 AI Teacher Scenarios

| ID | Scenario | Method | Threshold |
|----|----------|--------|-----------|
| AI-01 | Chat message submit | POST /ai-teacher/message | < 5000ms p95 |
| AI-02 | Chat history read | GET /ai-teacher/history | < 300ms p95 |
| AI-03 | Voice session start | POST /voice/session | < 1000ms p95 |
| AI-04 | Audio upload | POST /voice/audio | < 2000ms p95 |

---

## 4. Load Test Profiles

### 4.1 Steady State (Normal Load)

- Duration: 30 minutes
- Users: 100 concurrent
- Ramp-up: 5 minutes
- Think time: 2-5 seconds between requests

### 4.2 Peak Load

- Duration: 15 minutes
- Users: 500 concurrent
- Ramp-up: 3 minutes
- Think time: 1-3 seconds between requests

### 4.3 Stress Test

- Duration: 10 minutes
- Users: 1000 concurrent (beyond expected capacity)
- Ramp-up: 2 minutes
- Purpose: Find breaking point, verify graceful degradation

### 4.4 Endurance Test

- Duration: 2 hours
- Users: 200 concurrent
- Purpose: Detect memory leaks, connection pool exhaustion, resource drift

---

## 5. Test Data Requirements

### 5.1 Database Seed Data

| Entity | Minimum Records | Notes |
|--------|----------------|-------|
| Users (students) | 10,000 | Mix of active and inactive |
| Users (parents) | 2,000 | Linked to students |
| Users (admins) | 50 | Various role assignments |
| Courses | 20 | With chapters and lessons |
| Lessons | 500 | With assets |
| Questions | 5,000 | Across question bank |
| Assessments | 100 | With deadlines |
| Assessment attempts | 50,000 | Historical data |
| Notifications | 100,000 | Mix of read/unread |
| Billing subscriptions | 5,000 | Active/expired/cancelled |
| Analytics events | 1,000,000 | 30 days of event data |

### 5.2 Test User Accounts

| Role | Count | Purpose |
|------|-------|---------|
| Load test students | 500 | Concurrent API access |
| Load test parents | 100 | Dashboard access |
| Load test admins | 10 | Analytics/admin access |

---

## 6. Tooling

### 6.1 Recommended Tools

| Tool | Purpose | Use Case |
|------|---------|----------|
| k6 (Grafana) | HTTP load testing | Backend API load tests |
| Artillery | HTTP/WebSocket testing | API and notification testing |
| Flutter DevTools | Mobile profiling | Startup time, memory, jank |
| Lighthouse | Web performance audit | Web dashboard performance |
| pg_stat_statements | PostgreSQL query analysis | Slow query identification |
| Supabase Dashboard | Database monitoring | Connection pool, query stats |

### 6.2 Monitoring During Tests

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| API response time | Backend logs | > 2x target |
| Error rate | Backend logs | > 1% |
| CPU usage | Server metrics | > 80% sustained |
| Memory usage | Server metrics | > 85% |
| DB connections | Supabase metrics | > 80% pool |
| DB query time | pg_stat_statements | > 500ms avg |

---

## 7. Pass/Fail Gates

### 7.1 Must-Pass Gates (Release Blockers)

| Gate | Criteria |
|------|----------|
| P0 response time | All P0 endpoints < 200ms at p95 under normal load |
| Error rate | < 0.1% error rate under normal load |
| No crashes | Zero server crashes during steady-state test |
| Data integrity | No data corruption or loss during load test |
| Graceful degradation | System returns 503 (not crash) under stress |

### 7.2 Should-Pass Gates (Warnings)

| Gate | Criteria |
|------|----------|
| P1 response time | All P1 endpoints < 500ms at p95 under normal load |
| P2 response time | All P2 endpoints < 2000ms at p95 under normal load |
| Peak load | System handles 500 users with < 2x latency increase |
| Memory stability | No memory growth trend during endurance test |
| Connection stability | No connection pool exhaustion during endurance test |

### 7.3 Nice-to-Pass Gates (Observations)

| Gate | Criteria |
|------|----------|
| Stress recovery | System recovers within 60s after load drops |
| Cold start | Mobile app cold start < 3s |
| Web TTI | Web dashboard Time to Interactive < 3s |

---

## 8. Test Execution Schedule

| Day | Activity | Duration |
|-----|----------|----------|
| Day 1 | Environment setup, data seeding | 4 hours |
| Day 1 | Baseline measurements (single user) | 2 hours |
| Day 2 | Steady-state load test | 2 hours |
| Day 2 | Peak load test | 1 hour |
| Day 2 | Stress test | 1 hour |
| Day 3 | Endurance test | 3 hours |
| Day 3 | Mobile performance profiling | 2 hours |
| Day 3 | Web performance audit | 1 hour |
| Day 4 | Results analysis and report | 4 hours |

---

## 9. Summary

This performance test plan covers 35 API scenarios across 8 feature areas with defined thresholds. The test data requirements specify realistic volumes, and the pass/fail gates provide clear release criteria. The plan should be executed using the recommended tooling with monitoring in place to capture system behavior under load.
