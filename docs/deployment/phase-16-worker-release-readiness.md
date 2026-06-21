# Phase 16 — Worker Release Readiness

**Document ID:** P16-065
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This document assesses the release readiness of background workers, job queues, schedulers, and asynchronous processing components in the AIM Platform.

---

## 1. Worker Architecture Overview

### Current State

The AIM Platform does not have a dedicated, standalone worker service. Background processing is handled through the following mechanisms:

1. **In-process handling** — Async operations within the NestJS backend API (`services/backend-api/`)
2. **Supabase Edge Functions** — Serverless functions for specific triggers (if configured)
3. **Database triggers** — PostgreSQL triggers for real-time notifications (if configured)

**Key finding:** There is no separate `services/workers/` directory or dedicated worker deployment. All background logic is co-located with the backend API.

---

## 2. Background Job Inventory

### 2.1 Notification Delivery

**Location:** `services/backend-api/src/features/notifications/`

| Component | Description | Status |
|-----------|-------------|--------|
| Notification creation | Creates notification records | Implemented |
| Notification delivery | Delivers notifications to users | Implemented |
| Push notification dispatch | Mobile push via FCM/APNS | Not verified |
| Email notification dispatch | Email delivery for parents | Not verified |
| Notification retry | Retry failed deliveries | Not verified |

**Delivery flow:**
1. Backend API creates a notification record.
2. Notification is associated with a user (student/parent/admin).
3. Client polls or receives push notification.

**Current gap:** No dedicated message queue (e.g., BullMQ, RabbitMQ, SQS) is used. Notification delivery appears to be synchronous or database-polling based.

### 2.2 Analytics Aggregation

**Location:** `services/backend-api/src/features/analytics/`

| Component | Description | Status |
|-----------|-------------|--------|
| Analytics event recording | Records raw analytics events | Implemented |
| Analytics aggregation | Aggregates data for dashboards | Architecture unclear |
| Scheduled reports | Periodic analytics summaries | Not implemented |

**Current gap:** No scheduled job runner (e.g., cron, @nestjs/schedule) is configured for periodic analytics aggregation.

### 2.3 Billing Webhooks

**Location:** `services/backend-api/src/features/billing/`

| Component | Description | Status |
|-----------|-------------|--------|
| Webhook receiver | Receives payment provider webhooks | Architecture unclear |
| Payment processing | Processes payment confirmations | Architecture unclear |
| Subscription management | Manages subscription state | Architecture unclear |
| Failed payment retry | Retries failed payments | Not verified |

**Current gap:** The billing feature directory exists but the webhook processing pipeline is not documented. Integration with a payment provider (e.g., Stripe, Paddle) is not evident from the codebase dependencies.

### 2.4 AIM Engine Processing

**Location:** `services/aim-engine/`

| Component | Description | Status |
|-----------|-------------|--------|
| Placement scoring | Processes placement test results | Implemented |
| Lesson recommendations | Generates learning path recommendations | Implemented |
| Progress recalculation | Recalculates student progress | Architecture unclear |

**Processing model:** The AIM engine operates as a synchronous HTTP service called by the backend API via `AIM_ENGINE_URL`. No background queue is used for AIM engine requests.

### 2.5 AI Teacher Processing

**Location:** `services/backend-api/src/features/ai-teacher/`

| Component | Description | Status |
|-----------|-------------|--------|
| Chat orchestration | Manages AI conversation flow | Implemented |
| Chat history persistence | Stores conversation history | Implemented |
| Voice transcription | Processes voice input | Implemented |

**Processing model:** AI teacher requests are processed synchronously via the backend API. Long-running AI provider calls may block the request thread.

---

## 3. Queue Infrastructure

### Current State: No Dedicated Queue

The `services/backend-api/package.json` does not include any queue library dependencies (e.g., `@nestjs/bull`, `bullmq`, `amqplib`).

### Recommended Queue Architecture (Phase 17)

```
[Backend API] --> [Job Queue (BullMQ/Redis)] --> [Worker Process]
                                                     |
                                                     +--> Notification delivery
                                                     +--> Analytics aggregation
                                                     +--> Billing webhook processing
                                                     +--> AI teacher async processing
```

---

## 4. Scheduler

### Current State: No Scheduler

No scheduling library (`@nestjs/schedule`, `node-cron`) is present in the backend API dependencies.

### Scheduled Jobs Needed for Production

| Job | Frequency | Purpose |
|-----|-----------|---------|
| Analytics aggregation | Hourly | Aggregate raw events into dashboard summaries |
| Notification digest | Daily | Send daily notification digests to parents |
| Subscription renewal check | Daily | Check for expiring subscriptions |
| Session cleanup | Daily | Remove expired sessions |
| Backup verification | Daily | Verify database backups completed |

---

## 5. Retry and Error Handling

### Current Retry Capabilities

| Feature | Retry Mechanism | Status |
|---------|----------------|--------|
| API requests | HTTP client retry | Not verified |
| Notification delivery | Retry on failure | Not verified |
| AI provider calls | Retry on timeout | Not verified |
| Database operations | Transaction rollback | Implemented (Prisma) |

### Recommended Retry Strategy

| Operation | Max Retries | Backoff | Dead Letter |
|-----------|-------------|---------|-------------|
| Notification delivery | 3 | Exponential (1s, 5s, 30s) | Dead letter queue |
| Billing webhooks | 5 | Exponential (1m, 5m, 30m, 2h, 24h) | Alert + manual review |
| Analytics aggregation | 2 | Fixed (5m) | Log and skip |
| AI provider calls | 2 | Exponential (2s, 10s) | Return error to user |

---

## 6. Monitoring and Observability

### Current State

No dedicated monitoring for background jobs is configured. The backend API may log errors to stdout, but no structured job monitoring exists.

### Recommended Monitoring

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Queue depth | Job backlog | >100 pending jobs |
| Job processing time | Performance | >30s per job |
| Failed job count | Reliability | >5 failures/hour |
| Dead letter queue size | Unrecoverable errors | >0 items |
| Worker memory usage | Resource health | >80% of limit |

---

## 7. Release Readiness Assessment

### Ready for Release

| Component | Ready | Notes |
|-----------|-------|-------|
| Notification creation | Yes | Synchronous, in-process |
| Analytics event recording | Yes | Synchronous, in-process |
| AIM engine scoring | Yes | Synchronous HTTP calls |
| AI teacher chat | Yes | Synchronous, with caveats |

### Not Ready for Release (Requires Mitigation)

| Component | Blocker | Mitigation |
|-----------|---------|------------|
| Async notification delivery | No queue infrastructure | Deliver synchronously; accept higher latency |
| Analytics aggregation | No scheduler | Aggregate on-demand at query time |
| Billing webhook processing | No webhook handler verified | Defer billing feature to post-launch |
| Failed job retry | No retry infrastructure | Log failures for manual intervention |

---

## 8. Pre-Release Checklist

- [ ] All synchronous background operations handle errors gracefully
- [ ] Long-running operations (AI teacher, AIM engine) have timeouts configured
- [ ] Database transactions are properly scoped (Prisma)
- [ ] Error logging captures enough context for debugging
- [ ] No background process can cause the API to become unresponsive
- [ ] Notification delivery works end-to-end (even if synchronous)

---

## 9. Phase 17 Recommendations

1. **Add a job queue** — Integrate BullMQ with Redis for async job processing.
2. **Create a worker service** — Separate long-running jobs from the API process.
3. **Add scheduling** — Use `@nestjs/schedule` for periodic jobs.
4. **Implement dead letter queues** — For unrecoverable job failures.
5. **Add job monitoring** — Dashboard for queue depth, processing time, and failure rates.
6. **Implement webhook verification** — For billing provider webhooks.
