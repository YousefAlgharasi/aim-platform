# Phase 17 — Post-Launch KPI Map

**Task:** P17-007
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define operational KPIs, support KPIs, incident KPIs, reliability KPIs, product feedback KPIs, and adoption KPIs for post-launch health tracking.

## Operational KPIs

| KPI | Description | Target | Source |
|---|---|---|---|
| API uptime | Percentage of time API returns 200 on health check | >= 99.9% | Health check monitor |
| API p95 latency | 95th percentile response time | < 500ms | Backend metrics |
| Error rate | Percentage of 5xx responses | < 0.5% | Backend logs |
| Database connection pool utilization | Active connections / max connections | < 80% | Supabase metrics |
| Worker job failure rate | Failed jobs / total jobs | < 2% | Worker queue metrics |

## Support KPIs

| KPI | Description | Target | Source |
|---|---|---|---|
| Ticket volume | Total tickets created per day/week | Trending down | support_tickets table |
| First response time | Time from ticket creation to first admin comment | < 4 hours (P0), < 24h (P1) | support_ticket_comments |
| Resolution time | Time from creation to resolved/closed status | < 24h (critical), < 72h (high) | support_tickets |
| Open ticket backlog | Count of tickets in open/in_progress status | < 20 at any time | support_tickets |
| Customer satisfaction | Post-resolution feedback rating | >= 4.0/5.0 | user_feedback |

## Incident KPIs

| KPI | Description | Target | Source |
|---|---|---|---|
| MTTR | Mean time to resolve incidents | < 2 hours (critical), < 8h (major) | incident_records |
| Incident frequency | Number of incidents per month | Trending down | incident_records |
| Postmortem completion | Percentage of resolved incidents with postmortem | 100% for critical/major | incident_records |
| Repeat incident rate | Incidents with same root cause | < 10% | incident_records |

## Reliability KPIs

| KPI | Description | Target | Source |
|---|---|---|---|
| Deployment success rate | Successful deployments / total deployments | >= 95% | Deployment logs |
| Rollback frequency | Rollbacks per month | < 1 per month | Deployment logs |
| Maintenance window adherence | Completed on time / total windows | >= 90% | maintenance_windows |
| Feature flag rollout success | Flags reaching 100% without rollback | >= 90% | feature_flags |

## Product Feedback KPIs

| KPI | Description | Target | Source |
|---|---|---|---|
| Feedback volume | Total feedback submissions per week | Tracking only | user_feedback |
| Feedback sentiment | Average rating across all feedback | >= 3.5/5.0 | user_feedback |
| Feature request volume | New feature requests per month | Tracking only | feature_requests |
| Feature request implementation rate | Completed requests / total requests | Tracking only | feature_requests |
| Bug report rate | Bug category feedback per week | Trending down | user_feedback |

## Adoption KPIs

| KPI | Description | Target | Source |
|---|---|---|---|
| Daily active users (DAU) | Unique authenticated users per day | Tracking growth | Backend auth logs |
| Weekly active users (WAU) | Unique authenticated users per week | Tracking growth | Backend auth logs |
| Session completion rate | Completed learning sessions / started sessions | >= 70% | Session events |
| Parent engagement | Parents viewing child progress per week | Tracking growth | Parent dashboard logs |
| Mobile vs web ratio | Mobile DAU / total DAU | Tracking only | Client analytics |

## KPI Ownership

| KPI Category | Owner | Review Cadence |
|---|---|---|
| Operational | DevOps / Engineering Lead | Daily |
| Support | Support Lead | Daily |
| Incident | Engineering Lead | Per-incident + weekly |
| Reliability | DevOps | Weekly |
| Product Feedback | Product Manager | Weekly |
| Adoption | Product Manager | Weekly |

## Data Sources

All KPIs are computed from backend data. No client-side computation of KPI values. Admin dashboard displays backend-computed KPI summaries.

## Verdict

**READY** — Post-launch KPI map defined. All metrics are backend-sourced with clear targets and ownership.
