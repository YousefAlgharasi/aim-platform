# Phase 11 — Admin Reports Scope

**Date:** 2026-06-20
**Author:** GHOST3030
**Scope:** Define limited Phase 11 admin reporting capabilities

## Purpose

Define what reporting is available in Phase 11 and what is deferred to
Phase 15 (Analytics Dashboard) to prevent scope creep.

## Phase 11 Reporting — In Scope

Phase 11 provides **basic operational reporting** using backend-approved
summary endpoints. All metrics are backend-computed.

### Available Report APIs

| API | Endpoint | Metrics |
|-----|----------|---------|
| Enrollment Report | `GET /admin/reports/enrollments` | totalEnrollments, newEnrollments, activeCourses |
| Assessment Report | `GET /admin/reports/assessments` | totalAttempts, passed, failed, avgScore (backend-computed) |
| Active Users Report | `GET /admin/reports/active-users` | dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers |

### Phase 11 Report UI Capabilities

1. **Summary cards** — Display backend-approved counts for users, courses,
   assessments, and content status
2. **Date range filtering** — Optional from/to date parameters on report APIs
3. **Read-only display** — All values rendered as-is from backend responses

### What Phase 11 Reports Do NOT Include

- No charts, graphs, or data visualizations
- No trend analysis or time-series data
- No cohort comparison or student segmentation
- No export to CSV/Excel/PDF
- No scheduled reports or email delivery
- No custom report builder
- No raw data access or SQL queries

## Phase 15 Analytics — Deferred

The following capabilities are explicitly deferred to Phase 15:

| Feature | Reason for Deferral |
|---------|-------------------|
| Interactive dashboards with charts | Requires charting library integration |
| Learning analytics (engagement, retention) | Requires aggregation pipeline |
| AIM Engine performance metrics | Requires internal metrics exposure |
| Comparative analytics (cohort vs cohort) | Requires complex queries |
| Export system (CSV, PDF) | Requires server-side generation |
| Scheduled reports | Requires job scheduling infrastructure |
| Custom report builder | Requires dynamic query building |
| Student outcome prediction | Requires ML pipeline integration |

## Authority Rules for Reports

1. **All metrics are backend-computed** — The admin UI never aggregates, averages,
   or calculates report values
2. **avgScore is received as-is** — No client-side score averaging
3. **Pass/fail counts are received as-is** — No client-side counting
4. **Active user counts are received as-is** — No client-side user tracking
5. **No raw AIM Engine internals** — Reports display safe summaries only

## Conclusion

Phase 11 reporting is intentionally limited to backend-approved summary
cards. This provides basic operational visibility while keeping the full
analytics dashboard implementation cleanly scoped to Phase 15.
