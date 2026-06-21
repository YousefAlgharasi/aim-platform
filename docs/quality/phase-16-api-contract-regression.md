# Phase 16 — API Contract Regression

**Task:** P16-020
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Validate public, mobile, admin, and parent API contracts against documentation and client usage. Prevent frontend/backend contract mismatches.

## API Surface Inventory

### Mobile API (Flutter Client)

| Endpoint | Method | Contract Doc | Client Usage | Match |
|---|---|---|---|---|
| `/api/auth/login` | POST | P2 | auth feature | MATCH |
| `/api/auth/register` | POST | P2 | auth feature | MATCH |
| `/api/auth/profile` | GET | P2 | profile feature | MATCH |
| `/api/curriculum/subjects` | GET | P3 | curriculum feature | MATCH |
| `/api/curriculum/lessons/:id` | GET | P3 | lesson feature | MATCH |
| `/api/placement/start` | POST | P4 | placement feature | MATCH |
| `/api/placement/submit` | POST | P4 | placement feature | MATCH |
| `/api/aim/path` | GET | P5 | learning path feature | MATCH |
| `/api/aim/recommendations` | GET | P5 | learning path feature | MATCH |
| `/api/ai-teacher/sessions` | POST | P8 | AI chat feature | MATCH |
| `/api/ai-teacher/messages` | POST | P8 | AI chat feature | MATCH |
| `/api/voice/sessions` | POST | P9 | voice feature | MATCH |
| `/api/assessments/submit` | POST | P10 | assessment feature | MATCH |
| `/api/notifications` | GET | P13 | notification feature | MATCH |
| `/api/billing/plans` | GET | P14 | billing feature | MATCH |
| `/api/billing/subscribe` | POST | P14 | billing feature | MATCH |
| `/api/analytics/student/summary` | GET | P15 | analytics feature | MATCH |

### Admin API (Web Client)

| Endpoint | Method | Contract Doc | Client Usage | Match |
|---|---|---|---|---|
| `/api/admin/users` | GET | P11 | admin users page | MATCH |
| `/api/admin/curriculum/*` | CRUD | P11 | admin curriculum | MATCH |
| `/api/admin/assessments/*` | CRUD | P11 | admin assessments | MATCH |
| `/api/admin/notifications/*` | CRUD | P13 | admin notifications | MATCH |
| `/api/admin/billing/*` | GET | P14 | admin billing | MATCH |
| `/api/analytics/admin/dashboard` | GET | P15 | admin analytics | MATCH |
| `/api/analytics/admin/reports/*` | GET/POST | P15 | admin reports | MATCH |
| `/api/analytics/exports` | POST | P15 | admin exports | MATCH |
| `/api/analytics/exports/:id` | GET | P15 | admin exports | MATCH |

### Parent API (Web Client)

| Endpoint | Method | Contract Doc | Client Usage | Match |
|---|---|---|---|---|
| `/api/parent/children` | GET | P12 | parent dashboard | MATCH |
| `/api/parent/children/:id/progress` | GET | P12 | progress view | MATCH |
| `/api/analytics/parent/reports` | GET | P15 | parent reports | MATCH |
| `/api/analytics/parent/reports/:key/run` | POST | P15 | parent reports | MATCH |
| `/api/analytics/parent/reports/runs/:id` | GET | P15 | parent reports | MATCH |

## Contract Checks

| Check | Status |
|---|---|
| All documented endpoints exist in backend | PASS |
| All client API calls match documented contracts | PASS |
| Request/response DTOs match between client and server | PASS |
| Error response format consistent across all endpoints | PASS |
| Authentication header format consistent | PASS |
| Pagination parameters consistent across list endpoints | PASS |
| Date format (ISO 8601) consistent | PASS |

## Blockers

None identified.

## Known Limitations

1. Contract validation is based on code review and documentation comparison, not automated contract testing tools.
2. Some endpoints may have optional fields not fully documented.

## Verdict

**PASS** — All API contracts match between documentation, backend implementation, and client usage. No mismatches found.
