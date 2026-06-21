# Phase 16 - Backend Load Test Report

**Task ID:** P16-037
**Date:** 2026-06-21
**Scope:** Document backend load testing for critical APIs and worker queues.

---

## 1. Overview

This document defines backend load test specifications for the AIM Platform's critical API endpoints and background worker queues. The backend is a NestJS application with Supabase (PostgreSQL) as the database, serving mobile (Flutter) and web (React) clients.

**Status:** This document serves as the load test specification. Actual load test execution requires a staging environment with representative data volumes.

---

## 2. Critical API Inventory

### 2.1 Authentication APIs (P0 - Critical Path)

| Endpoint | Method | Handler | Expected RPS |
|----------|--------|---------|-------------|
| `/auth/me` | GET | `auth.controller.ts` | 50 |
| `/auth/session` | POST | `session-validation.service.ts` | 20 |
| `/auth/bootstrap` | POST | `auth-profile-bootstrap.service.ts` | 5 |

### 2.2 Content Delivery APIs (P0 - Critical Path)

| Endpoint | Method | Handler | Expected RPS |
|----------|--------|---------|-------------|
| `/courses` | GET | `curriculum` module | 30 |
| `/lessons/:id` | GET | `lessons.service.ts` | 50 |
| `/placement/question` | GET | `placement-question-delivery.service.ts` | 20 |
| `/assessments/:id/questions` | GET | `question-delivery.service.ts` | 30 |

### 2.3 Submission APIs (P1 - Interactive)

| Endpoint | Method | Handler | Expected RPS |
|----------|--------|---------|-------------|
| `/placement/answer` | POST | `placement-answer-submit.service.ts` | 20 |
| `/assessments/:id/answer` | POST | `answer-submission.service.ts` | 30 |
| `/ai-teacher/message` | POST | `chat-message-submit.service.ts` | 10 |
| `/voice/audio` | POST | `audio-upload.service.ts` | 5 |

### 2.4 Dashboard APIs (P1 - Interactive)

| Endpoint | Method | Handler | Expected RPS |
|----------|--------|---------|-------------|
| `/notifications/inbox` | GET | `inbox.controller.ts` | 20 |
| `/parents/dashboard` | GET | `parent-dashboard-summary.service.ts` | 10 |
| `/parents/progress/:childId` | GET | `parent-child-progress.service.ts` | 10 |
| `/billing/entitlements` | GET | `entitlement.service.ts` | 15 |

### 2.5 Analytics APIs (P2 - Background)

| Endpoint | Method | Handler | Expected RPS |
|----------|--------|---------|-------------|
| `/analytics/dashboard` | GET | `dashboard.service.ts` | 5 |
| `/analytics/metrics` | GET | `metric-aggregation.service.ts` | 3 |
| `/analytics/reports` | POST | `report-runner.service.ts` | 1 |
| `/analytics/export` | POST | `analytics-export.service.ts` | 0.5 |

### 2.6 Webhook APIs (P1 - Event-Driven)

| Endpoint | Method | Handler | Expected RPS |
|----------|--------|---------|-------------|
| `/webhooks/billing` | POST | `webhook.controller.ts` | 5 |

---

## 3. Worker Queue Specifications

### 3.1 Notification Delivery Worker

**File:** `services/backend-api/src/features/notifications/notification-delivery.worker.ts`

| Metric | Specification |
|--------|--------------|
| Queue name | notification-delivery |
| Processing rate | 100 notifications/minute target |
| Retry policy | Via `notification-retry.service.ts` |
| Rate limiting | Via `notification-rate-limit.service.ts` |
| Eligibility check | Via `notification-eligibility.service.ts` |

**Load test scenario:**
1. Seed 10,000 pending notifications
2. Start worker
3. Measure: throughput, error rate, memory growth
4. Verify: no duplicate deliveries, retry behavior for failures

### 3.2 Notification Digest Worker

**File:** `services/backend-api/src/features/notifications/notification-digest.service.ts`

| Metric | Specification |
|--------|--------------|
| Processing rate | 1,000 users/batch target |
| Trigger | Scheduled (daily/weekly) |
| Output | Aggregated digest notifications |

### 3.3 Reminder Schedule Worker

**File:** `services/backend-api/src/features/notifications/reminder-schedule.service.ts`

| Metric | Specification |
|--------|--------------|
| Types | deadline, learning, streak, parent-summary |
| Processing rate | 500 reminders/minute target |
| Integration files | `deadline-reminder.integration.ts`, `learning-reminder.integration.ts`, `streak-reminder.integration.ts`, `parent-summary-reminder.integration.ts` |

### 3.4 Analytics Event Ingestion

**File:** `services/backend-api/src/features/analytics/analytics-event-ingestion.service.ts`

| Metric | Specification |
|--------|--------------|
| Processing rate | 1,000 events/minute target |
| Output | Event records for aggregation |

---

## 4. Load Test Scenarios

### 4.1 Scenario 1: Student Learning Session

Simulates a typical student session: login -> content browse -> lesson -> Q&A -> progress check.

```
Sequence (per virtual user):
1. GET /auth/me                          (auth check)
2. GET /courses                          (browse courses)
3. GET /courses/:id/chapters             (select course)
4. GET /lessons/:id                      (read lesson)
5. POST /ai-teacher/message              (ask question)
6. GET /assessments                      (view assessments)
7. POST /assessments/:id/attempt         (start quiz)
8. GET /assessments/:id/questions        (get questions)
9. POST /assessments/:id/answer (x5)     (answer questions)
10. GET /notifications/inbox             (check notifications)

Think time: 3-5 seconds between steps
Duration: 20 minutes
Virtual users: 200
```

### 4.2 Scenario 2: Parent Dashboard Session

Simulates a parent checking their child's progress.

```
Sequence (per virtual user):
1. GET /auth/me                          (auth check)
2. GET /parents/dashboard                (dashboard summary)
3. GET /parents/progress/:childId        (child progress)
4. GET /parents/assessments/:childId     (assessment summary)
5. GET /parents/reports/:childId         (progress report)
6. GET /notifications/inbox              (check notifications)
7. GET /billing/entitlements             (check subscription)

Think time: 5-8 seconds between steps
Duration: 15 minutes
Virtual users: 50
```

### 4.3 Scenario 3: Admin Analytics Session

Simulates an admin reviewing platform analytics.

```
Sequence (per virtual user):
1. GET /auth/me                          (auth check)
2. GET /analytics/dashboard              (platform overview)
3. GET /analytics/metrics?type=learning  (learning metrics)
4. GET /analytics/metrics?type=assessment(assessment metrics)
5. GET /analytics/metrics?type=revenue   (revenue metrics)
6. POST /analytics/reports               (generate report)
7. POST /analytics/export                (export data)

Think time: 10-15 seconds between steps
Duration: 15 minutes
Virtual users: 10
```

### 4.4 Scenario 4: Webhook Burst

Simulates a burst of payment provider webhooks.

```
Sequence:
1. POST /webhooks/billing (x100 unique events)
2. POST /webhooks/billing (x20 duplicate events)

Duration: 1 minute burst
Expected: 100 processed, 20 deduplicated
```

### 4.5 Scenario 5: Mixed Load (Realistic)

Combines all scenarios proportionally.

```
Composition:
- 70% student sessions (Scenario 1)
- 20% parent sessions (Scenario 2)
- 5% admin sessions (Scenario 3)
- 5% webhook events (Scenario 4)

Total virtual users: 300
Duration: 30 minutes
```

---

## 5. Environment Requirements

### 5.1 Load Test Environment

| Component | Specification |
|-----------|--------------|
| Backend API | Staging deployment matching production config |
| Database | PostgreSQL (Supabase) with production-like schema |
| Data volume | See test data requirements in performance test plan |
| Network | Load generator and API in same region |
| Monitoring | Server metrics, DB metrics, APM |

### 5.2 Load Generator

| Tool | Configuration |
|------|--------------|
| k6 or Artillery | Running on dedicated VM |
| Network | Same region as API server |
| Resources | 4 CPU, 8GB RAM minimum |

---

## 6. Metrics to Capture

### 6.1 API Metrics

| Metric | Measurement |
|--------|-------------|
| Response time (p50, p95, p99) | Per endpoint |
| Throughput (RPS) | Per endpoint |
| Error rate | Per endpoint |
| Status code distribution | 2xx, 4xx, 5xx counts |

### 6.2 System Metrics

| Metric | Measurement |
|--------|-------------|
| CPU utilization | Server average and peak |
| Memory utilization | Server RSS and heap |
| Network I/O | Bytes in/out |
| Disk I/O | Read/write operations |

### 6.3 Database Metrics

| Metric | Measurement |
|--------|-------------|
| Active connections | Count over time |
| Query time (p95) | Per query type |
| Transaction rate | Transactions/second |
| Lock waits | Lock contention events |
| Replication lag | If applicable |

### 6.4 Worker Metrics

| Metric | Measurement |
|--------|-------------|
| Queue depth | Over time |
| Processing rate | Items/minute |
| Error rate | Failed items/total |
| Retry rate | Retries/total |
| Completion time | Time from enqueue to complete |

---

## 7. Expected Failure Modes

| Failure Mode | Detection | Mitigation |
|-------------|-----------|------------|
| DB connection pool exhaustion | Connection count at max | Pool size tuning, connection recycling |
| API timeout cascade | Increasing response times | Circuit breaker, timeout configuration |
| Memory leak | Steady memory growth | Memory profiling, leak detection |
| Worker backlog | Growing queue depth | Worker scaling, rate adjustment |
| Webhook dedup failure | Duplicate processing | Idempotency service validation |

---

## 8. Summary

This load test specification covers 21 API endpoints across 6 priority tiers and 4 worker queues. Five load test scenarios simulate realistic usage patterns from students, parents, admins, and webhook sources. The mixed-load scenario provides the most realistic assessment of system behavior under production-like conditions.

**Test execution status:** PENDING - Requires staging environment deployment with seed data before execution.
