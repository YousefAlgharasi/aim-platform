# Phase 15 — Analytics KPI Catalog

## Purpose

Define the approved, controlled set of KPIs across learning, placement,
curriculum, assessments, notifications, billing, users, and operations. This is
the metrics dictionary that `metric_definitions` rows must conform to — no
metric outside this catalog (or a future-approved extension of it) may be
surfaced as authoritative.

## Learning

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `learning_sessions_completed` | Learning Sessions Completed | count | session completion events |
| `learning_minutes_active` | Active Learning Minutes | sum | session activity events |
| `lesson_completion_rate` | Lesson Completion Rate | rate | lesson started/completed events |
| `daily_active_students` | Daily Active Students | distinct count | session/lesson events |

## Placement

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `placement_tests_completed` | Placement Tests Completed | count | placement test events |
| `placement_level_distribution` | Placement Level Distribution | grouped count | placement result events |

## Curriculum

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `curriculum_unit_completion_rate` | Curriculum Unit Completion Rate | rate | curriculum progress events |
| `curriculum_path_adoption` | Curriculum Path Adoption | grouped count | curriculum assignment events |

## Assessments

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `assessment_completion_rate` | Assessment Completion Rate | rate | assessment submitted/assigned events |
| `assessment_average_score` | Assessment Average Score | average | assessment scored events |
| `quiz_pass_rate` | Quiz Pass Rate | rate | quiz result events |

## Notifications

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `notification_delivery_rate` | Notification Delivery Rate | rate | notification delivery events |
| `notification_read_rate` | Notification Read Rate | rate | notification read events |
| `reminder_engagement_rate` | Reminder Engagement Rate | rate | reminder delivered/acted events |

## Billing

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `mrr` | Monthly Recurring Revenue | sum | subscription/invoice events |
| `active_subscriptions` | Active Subscriptions | count | subscription status events |
| `churn_rate` | Subscription Churn Rate | rate | subscription cancellation events |
| `payment_success_rate` | Payment Success Rate | rate | payment events |

## Users

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `new_signups` | New Signups | count | user registration events |
| `monthly_active_users` | Monthly Active Users | distinct count | session/login events |
| `role_distribution` | Role Distribution | grouped count | user role events |

## Operations

| Key | Name | Aggregation | Source |
|---|---|---|---|
| `analytics_export_volume` | Analytics Export Volume | count | export job events |
| `analytics_access_denials` | Analytics Access Denials | count | access audit events |

## Versioning Rule

Each `metric_definitions` row carries a `version`. Changing the computation
method of an existing KPI requires a new version, not a silent redefinition,
so historical aggregates remain interpretable.

## Dependencies

- P15-002 — Analytics Domain Map.
- P15-003 — Analytics Authority Rules.
