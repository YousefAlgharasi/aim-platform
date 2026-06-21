# P16-051: Observability Plan

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Plan Defined — Infrastructure Pending

---

## 1. Purpose

Define the observability strategy for the AIM Platform in production, covering logs, metrics, traces, dashboards, alerts, and incident response signals. This plan ensures the operations team can detect, diagnose, and resolve issues before they impact users.

---

## 2. Observability Pillars

### 2.1 Architecture Overview

```
[Mobile App] --> [Backend API (NestJS)] --> [Supabase (DB/Auth)]
[Web App]   -->        |                --> [AIM Engine]
                       |                --> [Push Provider (FCM/APNs)]
                       |                --> [Email Provider]
                       |                --> [Payment Provider]
```

Each component requires monitoring at different levels:

| Pillar | Coverage | Tool Recommendation |
|--------|----------|-------------------|
| **Logs** | Structured application logs | ELK Stack, CloudWatch Logs, or Datadog Logs |
| **Metrics** | System and business metrics | Prometheus + Grafana, or Datadog Metrics |
| **Traces** | Request flow tracing | OpenTelemetry, Jaeger, or Datadog APM |
| **Dashboards** | Visual monitoring | Grafana or Datadog Dashboards |
| **Alerts** | Proactive incident detection | PagerDuty, OpsGenie, or Datadog Monitors |

---

## 3. Logging Strategy

### 3.1 Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Unrecoverable failures requiring attention | DB connection failure, provider timeout |
| WARN | Recoverable issues, degraded operations | Retry triggered, rate limit hit |
| INFO | Business events, state transitions | User login, payment completed, notification sent |
| DEBUG | Diagnostic information (non-production) | Query parameters, intermediate state |

### 3.2 Structured Log Format

All logs should use JSON format with standard fields:

```json
{
  "timestamp": "2026-06-21T10:30:00.000Z",
  "level": "INFO",
  "service": "backend-api",
  "correlationId": "req-abc123",
  "userId": "user-xyz",
  "action": "payment.completed",
  "metadata": { "amount": 29.99, "currency": "SAR" },
  "duration_ms": 1234
}
```

### 3.3 Required Log Events

| Event | Level | Service | Metadata |
|-------|-------|---------|----------|
| User login success | INFO | auth | userId, role, method |
| User login failure | WARN | auth | reason (no PII) |
| JWT validation failure | WARN | auth | reason, IP |
| API request completed | INFO | backend-api | method, path, status, duration |
| AIM analysis requested | INFO | aim | studentId, duration |
| AIM analysis failed | ERROR | aim | error type, timeout |
| Notification queued | INFO | notifications | type, channel |
| Notification delivered | INFO | notifications | type, channel, latency |
| Notification failed | ERROR | notifications | type, channel, reason |
| Payment webhook received | INFO | billing | event type, idempotency key |
| Payment completed | INFO | billing | amount, currency (no card data) |
| Payment failed | ERROR | billing | reason (no sensitive data) |
| Entitlement granted | INFO | billing | studentId, plan |
| Entitlement revoked | WARN | billing | studentId, reason |
| Export generated | INFO | analytics | format, rows, requester |
| Health check response | DEBUG | health | status, uptime |

### 3.4 Log Redaction Rules

| Data Type | Rule | Implementation |
|-----------|------|---------------|
| JWT tokens | Never log | Redact from headers |
| API keys | Never log | Mask in config logging |
| Passwords | Never log | Never in scope |
| Card numbers | Never log | Never stored |
| Student names | ID-only in logs | Use studentId, not name |
| Email addresses | Redact in production | Use userId, not email |
| Device tokens | Redact | Truncate to last 8 chars |
| IP addresses | Retain for security | Needed for abuse detection |

---

## 4. Metrics Strategy

### 4.1 System Metrics

| Metric | Type | Labels | Threshold |
|--------|------|--------|-----------|
| `http_request_duration_seconds` | Histogram | method, path, status | p95 < 500ms |
| `http_requests_total` | Counter | method, path, status | Monitor trend |
| `active_connections` | Gauge | — | < 100 |
| `process_cpu_usage` | Gauge | — | < 80% |
| `process_memory_usage_bytes` | Gauge | — | < 512MB |
| `nodejs_event_loop_lag_seconds` | Histogram | — | p95 < 100ms |

### 4.2 Business Metrics

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `aim_analysis_duration_seconds` | Histogram | outcome | AIM engine performance |
| `aim_analysis_total` | Counter | outcome (success/failure/timeout) | AIM reliability |
| `notifications_queued_total` | Counter | type, channel | Queue throughput |
| `notifications_delivered_total` | Counter | type, channel | Delivery success |
| `notifications_failed_total` | Counter | type, channel, reason | Failure tracking |
| `payment_webhooks_total` | Counter | event_type, outcome | Payment processing |
| `entitlements_active` | Gauge | plan | Active subscriptions |
| `active_learning_sessions` | Gauge | — | Student engagement |
| `assessment_completions_total` | Counter | — | Learning outcomes |
| `export_generation_duration_seconds` | Histogram | format | Export performance |
| `auth_login_total` | Counter | method, outcome | Auth monitoring |
| `auth_failures_total` | Counter | reason | Security monitoring |

### 4.3 Queue Metrics

| Metric | Type | Labels | Threshold |
|--------|------|--------|-----------|
| `notification_queue_depth` | Gauge | — | < 100 |
| `notification_queue_processing_time` | Histogram | — | p95 < 5s |
| `webhook_queue_depth` | Gauge | — | < 10 |
| `dlq_depth` | Gauge | queue_name | = 0 (alert if > 0) |

---

## 5. Tracing Strategy

### 5.1 OpenTelemetry Integration

Recommended: Add `@opentelemetry/sdk-node` and NestJS-compatible instrumentation.

### 5.2 Trace Spans

| Span | Parent | Purpose |
|------|--------|---------|
| `http.request` | Root | Full request lifecycle |
| `auth.jwt.verify` | http.request | JWT verification time |
| `auth.guard.check` | http.request | Authorization time |
| `db.query` | http.request | Database query time |
| `aim.engine.analyze` | http.request | AIM engine call time |
| `notification.deliver` | worker.process | Notification delivery |
| `payment.webhook.process` | http.request | Webhook processing |
| `report.generate` | http.request | Report generation |
| `export.generate` | http.request | Export generation |

### 5.3 Correlation IDs

Every incoming request should receive a correlation ID that propagates through:
- Log entries
- Database queries
- External service calls (AIM engine, providers)
- Async job processing

**Current state:** No correlation ID system detected in the codebase. This is a gap that needs implementation.

---

## 6. Dashboard Plan

### 6.1 Operations Dashboard

| Panel | Metrics | Refresh |
|-------|---------|---------|
| Request rate (RPM) | `http_requests_total` | 10s |
| Error rate (%) | `http_requests_total{status=5xx}` / total | 10s |
| Response time (p50, p95, p99) | `http_request_duration_seconds` | 10s |
| Active connections | `active_connections` | 10s |
| CPU / Memory usage | system metrics | 30s |
| Event loop lag | `nodejs_event_loop_lag_seconds` | 10s |

### 6.2 AIM Engine Dashboard

| Panel | Metrics | Refresh |
|-------|---------|---------|
| Analysis success rate | `aim_analysis_total` by outcome | 30s |
| Analysis latency (p95) | `aim_analysis_duration_seconds` | 30s |
| Timeout rate | `aim_analysis_total{outcome=timeout}` | 30s |
| Circuit breaker state | Custom metric | 10s |

### 6.3 Notification Dashboard

| Panel | Metrics | Refresh |
|-------|---------|---------|
| Queue depth | `notification_queue_depth` | 10s |
| Delivery rate | `notifications_delivered_total` | 30s |
| Failure rate | `notifications_failed_total` | 30s |
| Delivery latency | processing time histogram | 30s |

### 6.4 Billing Dashboard

| Panel | Metrics | Refresh |
|-------|---------|---------|
| Webhook processing rate | `payment_webhooks_total` | 30s |
| Active entitlements | `entitlements_active` | 60s |
| Payment failures | `payment_webhooks_total{outcome=failure}` | 30s |

### 6.5 Business Dashboard

| Panel | Metrics | Refresh |
|-------|---------|---------|
| Active learning sessions | `active_learning_sessions` | 60s |
| Daily active users | Aggregated from auth events | 5min |
| Assessment completions | `assessment_completions_total` | 60s |
| Export activity | `export_generation_duration_seconds` | 5min |

---

## 7. Alerting Strategy

See P16-054 for detailed alerting rules. Summary of alert categories:

| Category | Priority | Notification Channel |
|----------|----------|---------------------|
| Service down | P1 — Critical | PagerDuty / Phone |
| Error rate spike | P1 — Critical | PagerDuty / Phone |
| AIM engine timeout | P2 — High | Slack + PagerDuty |
| Payment failure | P2 — High | Slack + PagerDuty |
| Queue depth high | P2 — High | Slack |
| DLQ items present | P3 — Medium | Slack |
| Auth failure spike | P3 — Medium | Slack |
| Disk/memory warning | P3 — Medium | Slack |

---

## 8. Incident Response Signals

### 8.1 Severity Definitions

| Severity | Definition | Response Time | Example |
|----------|-----------|---------------|---------|
| SEV-1 | Service completely down | 15 min | Backend API not responding |
| SEV-2 | Major feature broken | 30 min | Payments failing, AIM engine down |
| SEV-3 | Minor feature degraded | 2 hours | Notifications delayed, slow dashboards |
| SEV-4 | Cosmetic/low-impact | Next business day | UI rendering issue, log noise |

### 8.2 Runbook Links

Each alert should link to a runbook with:
- What the alert means
- How to diagnose
- How to mitigate
- Who to escalate to

---

## 9. Current State Assessment

| Capability | Status | Gap |
|------------|--------|-----|
| Structured logging | PARTIAL — NestJS default logging | Need structured JSON format |
| Correlation IDs | NOT IMPLEMENTED | Need request-level correlation |
| Metrics collection | NOT IMPLEMENTED | Need Prometheus/StatsD integration |
| Distributed tracing | NOT IMPLEMENTED | Need OpenTelemetry setup |
| Dashboards | NOT IMPLEMENTED | Need Grafana/Datadog setup |
| Alerting | NOT IMPLEMENTED | Need PagerDuty/OpsGenie integration |
| Health endpoint | IMPLEMENTED | `health/health.controller.ts` exists |
| Audit logging | PARTIAL | Billing, analytics, notification audit services exist |

---

## 10. Implementation Priority

| Phase | Items | Effort |
|-------|-------|--------|
| Pre-launch | Structured logging, correlation IDs, basic alerts | 3-5 days |
| Launch week | System metrics, operations dashboard, on-call rotation | 3-5 days |
| Post-launch (week 1) | Business metrics, feature dashboards | 3-5 days |
| Post-launch (month 1) | Distributed tracing, advanced alerting | 5-8 days |
