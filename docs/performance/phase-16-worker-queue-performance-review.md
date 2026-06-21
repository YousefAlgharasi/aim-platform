# P16-042: Worker & Queue Performance Review

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Review Complete — Findings Documented

---

## 1. Scope

This review covers the performance characteristics of all background processing, worker queues, and asynchronous job systems in the AIM Platform backend (`services/backend-api/src/`), including:

- Notification delivery workers
- Analytics aggregation and report generation
- Billing webhook processing
- Retry and dead-letter queue handling
- AIM engine analysis pipeline

---

## 2. Notification Delivery System

### 2.1 Components

| File | Role |
|------|------|
| `features/notifications/notification-delivery.worker.ts` | Main delivery worker |
| `features/notifications/notification-queue.service.ts` | Queue management |
| `features/notifications/notification-retry.service.ts` | Retry logic |
| `features/notifications/notification-rate-limit.service.ts` | Rate limiting |
| `features/notifications/notification-digest.service.ts` | Digest batching |
| `features/notifications/notification-scheduling.spec.ts` | Scheduling tests |
| `features/notifications/in-app-notification.service.ts` | In-app delivery |
| `features/notifications/push-provider-adapter.interface.ts` | Push provider interface |
| `features/notifications/email-provider-adapter.interface.ts` | Email provider interface |
| `features/notifications/noop-push-provider.adapter.ts` | No-op push (dev/test) |
| `features/notifications/noop-email-provider.adapter.ts` | No-op email (dev/test) |

### 2.2 Architecture Assessment

The notification system has a well-structured delivery pipeline:

- **Queue Service** (`notification-queue.service.ts`): Manages notification enqueue/dequeue operations.
- **Delivery Worker** (`notification-delivery.worker.ts`): Processes queued notifications for delivery.
- **Retry Service** (`notification-retry.service.ts`): Handles failed delivery retries with backoff.
- **Rate Limiter** (`notification-rate-limit.service.ts`): Prevents provider rate limit violations.
- **Digest Service** (`notification-digest.service.ts`): Batches notifications to prevent overload.

### 2.3 Performance Concerns

| Issue | Severity | Details |
|-------|----------|---------|
| No dedicated queue infrastructure | HIGH | Queue likely runs in-process (no Redis/BullMQ/SQS detected) |
| Worker concurrency model unknown | MEDIUM | Single-threaded processing limits throughput |
| No dead-letter queue (DLQ) | HIGH | Failed notifications after max retries may be lost |
| Rate limit coordination | MEDIUM | Per-instance rate limits don't coordinate across replicas |
| Digest aggregation window | LOW | Window size affects delivery latency vs. batching efficiency |

### 2.4 Throughput Estimates

| Scenario | Est. Notifications/min | Concern |
|----------|----------------------|---------|
| Normal operation (100 students) | 10-50 | Manageable in-process |
| Streak reminder blast (all students) | 500-1000 | May overwhelm single worker |
| Parent summary batch (end of day) | 100-200 | Concentrated burst |
| Assessment completion alerts | 10-20 | Low volume, low risk |

### 2.5 Recommendations

1. Adopt a dedicated queue system (BullMQ with Redis or AWS SQS) for reliable delivery.
2. Implement a dead-letter queue for notifications that exhaust retries.
3. Add worker concurrency configuration (target: 5-10 concurrent deliveries).
4. Implement distributed rate limiting if running multiple backend replicas.

---

## 3. Analytics Aggregation

### 3.1 Components

| File | Role |
|------|------|
| `features/analytics/metric-aggregation.service.ts` | Metric aggregation |
| `features/analytics/metric-aggregation.service.spec.ts` | Aggregation tests |
| `features/analytics/metric-definition.service.ts` | Metric definitions |
| `features/analytics/cohort.service.ts` | Cohort analysis |
| `features/analytics/analytics-event-ingestion.service.ts` | Event ingestion |
| `features/analytics/analytics-event-ingestion.service.spec.ts` | Ingestion tests |
| `features/analytics/dashboard.service.ts` | Dashboard data |
| `features/analytics/analytics.repository.ts` | Data access |

### 3.2 Architecture Assessment

The analytics system includes:

- **Event Ingestion** (`analytics-event-ingestion.service.ts`): Captures learning events for aggregation.
- **Metric Aggregation** (`metric-aggregation.service.ts`): Computes metrics from raw events.
- **Cohort Analysis** (`cohort.service.ts`): Groups students for comparative analysis.
- **Dashboard Service** (`dashboard.service.ts`): Serves pre-aggregated data to dashboards.

### 3.3 Performance Concerns

| Issue | Severity | Details |
|-------|----------|---------|
| No pre-computed aggregation tables | HIGH | Real-time aggregation over raw events will not scale |
| Event ingestion may block API | MEDIUM | Synchronous ingestion slows assessment/lesson endpoints |
| No materialized views | HIGH | Dashboard queries recompute on every request |
| Cohort computation is O(n) | MEDIUM | Grows linearly with student count |

### 3.4 Recommendations

1. Implement materialized views or pre-aggregated summary tables for dashboard metrics.
2. Move event ingestion to an async pipeline (write to event queue, aggregate on schedule).
3. Schedule hourly/daily aggregation jobs for cohort and trend metrics.
4. Add caching layer (Redis) for frequently accessed dashboard aggregations (TTL: 5-15 min).

---

## 4. Report Generation

### 4.1 Components

| File | Role |
|------|------|
| `features/analytics/report-runner.service.ts` | Report execution engine |
| `features/analytics/report-runner.service.spec.ts` | Report runner tests |
| `features/analytics/report-definition.service.ts` | Report templates |
| `features/analytics/report-definition.service.spec.ts` | Report definition tests |
| `features/analytics/analytics-export.service.ts` | Export generation |
| `features/analytics/analytics-export.controller.ts` | Export API |
| `features/reports/reports.service.ts` | General reports service |

### 4.2 Performance Concerns

| Issue | Severity | Details |
|-------|----------|---------|
| Report generation runs synchronously | HIGH | Long reports block the API thread |
| No progress tracking for exports | MEDIUM | Users have no feedback during generation |
| Export size limits not enforced | MEDIUM | Large exports may exhaust memory |
| No report result caching | LOW | Same report regenerated on each request |

### 4.3 Recommendations

1. Move report generation to a background worker with progress callback.
2. Implement export size limits (max rows, max file size).
3. Add report result caching with configurable TTL.
4. Provide polling endpoint for report generation status.

---

## 5. Billing Webhook Processing

### 5.1 Components

| File | Role |
|------|------|
| `features/billing/webhook.controller.ts` | Webhook receiver |
| `features/billing/provider-webhook.service.ts` | Webhook processing |
| `features/billing/billing-idempotency.service.ts` | Idempotency checks |
| `features/billing/payment.service.ts` | Payment processing |
| `features/billing/entitlement.service.ts` | Entitlement updates |
| `features/billing/subscription.service.ts` | Subscription management |

### 5.2 Architecture Assessment

The billing webhook pipeline includes:

- **Webhook Controller**: Receives provider callbacks.
- **Idempotency Service** (`billing-idempotency.service.ts`): Prevents duplicate processing — this is a positive finding.
- **Provider Webhook Service**: Routes webhook events to appropriate handlers.
- **Entitlement Service**: Updates student access based on payment status.

### 5.3 Performance Concerns

| Issue | Severity | Details |
|-------|----------|---------|
| Webhook processing is synchronous | HIGH | Payment provider expects fast response (<5s) |
| No webhook queue for retry | HIGH | If processing fails, webhook is lost |
| Entitlement update may cascade | MEDIUM | Updating entitlements triggers notifications/analytics |
| No webhook event logging | MEDIUM | Cannot replay failed webhooks |

### 5.4 Recommendations

1. Return 200 immediately to payment provider, then process asynchronously.
2. Store raw webhook payload before processing (for replay capability).
3. Implement webhook event queue with retry logic.
4. Add webhook processing time monitoring (target: <2s end-to-end).

---

## 6. AIM Engine Analysis Pipeline

### 6.1 Components

| File | Role |
|------|------|
| `features/aim/pipeline/` | AIM analysis pipeline |
| `features/aim/adapter/` | AIM engine adapter |
| `features/aim/persistence/` | Result persistence |
| `features/aim/result/` | Result processing |

### 6.2 Configuration

From `backend-config.validation.ts`, the AIM engine has explicit timeout configuration:

- `AIM_ENGINE_ANALYSIS_TIMEOUT_MS`: Default 5000ms (per-request timeout)
- `AIM_ENGINE_HEALTH_TIMEOUT_MS`: Default 3000ms
- `AIM_ENGINE_TOTAL_BUDGET_MS`: Default 12000ms (total retry budget)
- `AIM_ENGINE_MAX_RETRY_ATTEMPTS`: Default 3

### 6.3 Performance Assessment

**Positive findings:**
- Explicit timeout and retry configuration exists.
- Total budget prevents unbounded retry loops.
- Health timeout is separate from analysis timeout.

**Concerns:**
| Issue | Severity | Details |
|-------|----------|---------|
| 12s total budget may be too high for synchronous API | HIGH | User waits up to 12s for analysis |
| No circuit breaker pattern | MEDIUM | Persistent AIM engine failures cause cascading timeouts |
| Analysis runs synchronously in request cycle | HIGH | Blocks API thread during processing |
| No fallback for AIM engine outage | MEDIUM | Students cannot progress if AIM engine is down |

### 6.4 Recommendations

1. Implement circuit breaker pattern for AIM engine calls (open after 5 consecutive failures).
2. Add a degraded-mode fallback (e.g., return last known placement, skip adaptive analysis).
3. Consider making analysis async with polling for results.
4. Reduce total budget to 8s for better UX.

---

## 7. Retry Queue Architecture

### 7.1 Current State

| System | Has Retry | Has DLQ | Has Backoff |
|--------|-----------|---------|-------------|
| Notification delivery | YES | NO | LIKELY (via retry service) |
| Billing webhooks | PARTIAL (idempotency) | NO | NO |
| AIM engine calls | YES (max 3) | NO | UNKNOWN |
| Analytics ingestion | NO | NO | NO |
| Report generation | NO | NO | NO |

### 7.2 Recommendations

1. Implement a unified retry/DLQ infrastructure (BullMQ recommended for NestJS).
2. Add exponential backoff with jitter to all retry paths.
3. Create DLQ monitoring dashboard for operations team.
4. Set maximum retry counts: notifications (5), webhooks (3), AIM engine (3 — already set).

---

## 8. Performance Thresholds

| Metric | Target | Current Status |
|--------|--------|----------------|
| Notification delivery latency (p95) | < 5s | NOT MEASURED |
| Notification queue depth | < 100 | NOT MEASURED |
| Analytics aggregation time | < 10s | NOT MEASURED |
| Report generation time (p95) | < 30s | NOT MEASURED |
| Webhook processing time | < 2s | NOT MEASURED |
| AIM analysis response time (p95) | < 5s | CONFIGURED (5s timeout) |
| DLQ depth | 0 (alert if > 0) | NO DLQ EXISTS |

---

## 9. Summary & Go/No-Go Impact

### Critical Findings

1. **No dedicated queue infrastructure** — All background processing appears to run in-process, which is a single point of failure and will not scale.
2. **Synchronous webhook processing** — Payment provider webhooks may time out if processing is slow.
3. **No dead-letter queues** — Failed jobs disappear permanently.
4. **Report generation blocks API** — Long-running reports degrade API performance for all users.

### Recommended Before Launch

- [ ] Implement dedicated job queue (BullMQ with Redis)
- [ ] Make webhook processing asynchronous with raw payload storage
- [ ] Add dead-letter queues to all async processing paths
- [ ] Move report generation to background workers
- [ ] Implement circuit breaker for AIM engine calls
- [ ] Add queue depth and processing time monitoring

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — The system can function at pilot scale (100-200 students) with in-process queues, but will need queue infrastructure before scaling beyond pilot. Webhook processing should be made async before accepting real payments.
