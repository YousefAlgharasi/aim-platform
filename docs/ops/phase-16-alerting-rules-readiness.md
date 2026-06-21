# Phase 16 — Alerting Rules Readiness

**Task:** P16-054
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define production alerting rules for API failures, auth spikes, worker failures, webhook failures, AIM timeouts, database errors, and billing failures.

## Alert Definitions

### Critical Alerts (P0 — Immediate Response)

| Alert Name | Condition | Threshold | Channel |
|---|---|---|---|
| API 5xx Spike | HTTP 5xx rate > threshold | > 5% of requests in 5min | PagerDuty + Slack |
| Database Connection Failure | Connection pool exhausted | 0 available connections | PagerDuty |
| Auth Service Down | Auth endpoint unresponsive | 3 consecutive failures | PagerDuty + Slack |
| Billing Webhook Failure | Webhook processing errors | > 3 failures in 10min | PagerDuty + Slack |
| Migration Failure | Migration execution error | Any failure | PagerDuty |

### High Alerts (P1 — Respond Within 30 Minutes)

| Alert Name | Condition | Threshold | Channel |
|---|---|---|---|
| AIM Engine Timeout | AIM API response > timeout | > 10% timeout rate in 15min | Slack |
| Worker Queue Backlog | Pending jobs exceed threshold | > 100 pending jobs | Slack |
| Auth Spike | Login attempts exceed normal | > 5x baseline in 5min | Slack |
| Notification Delivery Failure | Delivery error rate high | > 10% failure rate in 15min | Slack |
| Export Job Stuck | Export job running > max time | > 30min without completion | Slack |

### Warning Alerts (P2 — Review During Business Hours)

| Alert Name | Condition | Threshold | Channel |
|---|---|---|---|
| API Latency Degradation | p95 latency > target | > 2s p95 for 15min | Slack |
| Disk Usage High | Storage utilization high | > 80% disk usage | Slack |
| Memory Usage High | Backend memory elevated | > 85% memory usage | Slack |
| Certificate Expiry | SSL cert approaching expiry | < 30 days remaining | Slack |
| Analytics Aggregation Delay | Aggregation job delayed | > 1h behind schedule | Slack |

## Alert Configuration

### Escalation Policy

1. **Level 1:** On-call engineer (immediate for P0, 30min for P1)
2. **Level 2:** Engineering lead (escalate after 15min for P0, 1h for P1)
3. **Level 3:** CTO (escalate after 30min for P0)

### Silencing Rules

- Maintenance windows: suppress non-critical alerts during scheduled deployments
- Alert grouping: deduplicate related alerts within 5min window
- Auto-resolve: clear alerts when condition returns to normal for 5min

## Integration Points

| System | Alert Source | Status |
|---|---|---|
| Backend API | HTTP error rates, latency metrics | Ready (requires metrics collection) |
| Database | Connection pool, query errors | Ready (Supabase monitoring) |
| Workers | Job queue depth, failure counts | Ready (requires instrumentation) |
| AIM Engine | Response times, error rates | Ready (requires instrumentation) |
| Billing | Webhook processing status | Ready (requires instrumentation) |

## Blockers

- Alerting rules are defined but require a monitoring platform (e.g., Datadog, Grafana) to be configured in production.
- Instrumentation code for custom metrics is not yet implemented.

## Recommendations

1. Set up monitoring platform in staging before production deployment.
2. Configure alert channels (PagerDuty, Slack) with on-call rotation.
3. Run alert rule validation during staging smoke tests.
4. Establish baseline metrics for 1 week before enabling threshold-based alerts.

## Verdict

**PASS** — Alert rules defined and ready for configuration. Monitoring platform setup is a deployment dependency.
