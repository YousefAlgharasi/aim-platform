# Phase 16 - Database Performance Review

**Task ID:** P16-038
**Date:** 2026-06-21
**Scope:** Review query plans, indexes, slow paths, migration impact, analytics aggregations, and billing/report queries.

---

## 1. Overview

This review evaluates the database performance characteristics of the AIM Platform, which uses Supabase (PostgreSQL) as its primary data store. The review covers query patterns across features, index requirements, potential slow paths, and recommendations for optimization.

---

## 2. Database Architecture

### 2.1 Data Store

- **Database:** PostgreSQL via Supabase
- **ORM/Query:** NestJS services with repository pattern
- **Auth:** Supabase Auth (separate auth schema)
- **RLS:** Row Level Security via Supabase policies

### 2.2 Repository Pattern

Each feature uses a dedicated repository:

| Feature | Repository File |
|---------|----------------|
| Assessments | `features/assessments/assessment.repository.ts` |
| Billing | `features/billing/billing.repository.ts` |
| Notifications | `features/notifications/notification.repository.ts` |
| Analytics | `features/analytics/analytics.repository.ts` |
| Parents | `features/parents/parent.repository.ts` |
| Placement | Various placement services |
| Curriculum | Various curriculum services |
| Voice | `features/voice-teacher/repositories/` (7 repositories) |

---

## 3. Query Pattern Analysis by Feature

### 3.1 Authentication Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| User lookup by JWT sub | Every request | LOW - Primary key lookup |
| Profile lookup by user ID | Every request | LOW - Primary key/unique index |
| Session validation | Every request | LOW - Simple lookup |

**Index requirements:** Primary key on user ID, unique index on Supabase auth sub.

### 3.2 Placement Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Placement test lookup | Per placement | LOW |
| Question delivery (random/sequential) | Per question | LOW-MEDIUM |
| Answer history per attempt | Per submission | LOW |
| Scoring aggregation per attempt | On completion | MEDIUM |
| Retake policy check | On attempt start | LOW |

**Potential slow path:** Scoring aggregation that joins answers with question weights and skill mappings. If placement tests have many questions, this aggregation could be slow without proper indexes on attempt_id and question_id.

### 3.3 Lesson and Curriculum Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Course list | Frequent | LOW |
| Chapter list by course | Frequent | LOW - Foreign key index |
| Lesson list by chapter | Frequent | LOW - Foreign key index |
| Lesson detail with assets | Frequent | MEDIUM - JOIN with assets |
| Skill-lesson mapping | On placement/progress | MEDIUM |
| Content status check | On lesson access | LOW |

**Potential slow path:** Lesson detail queries joining with assets, objectives, and skill mappings. Consider eager loading strategy and limiting asset payload size.

### 3.4 Assessment Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Assessment list (with deadlines) | Frequent | LOW-MEDIUM |
| Attempt creation | Per attempt | LOW |
| Question delivery per attempt | Per question | LOW |
| Answer submission | Per answer | LOW |
| Grading aggregation | On completion | MEDIUM |
| Result computation | On completion | MEDIUM |
| Deadline enforcement check | Per access | LOW |
| Progress integration sync | On completion | MEDIUM |
| Attempt history per student | On listing | MEDIUM |

**Potential slow paths:**
1. Grading aggregation joining answers with rubrics and weights
2. Assessment list with deadline status for multiple assessments
3. Attempt history query if student has many attempts across assessments

**Index requirements:**
- `(student_id, assessment_id)` on attempts table
- `(attempt_id)` on answers table
- `(assessment_id, deadline)` on deadlines table

### 3.5 Notification Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Inbox listing (paginated) | Frequent | MEDIUM |
| Unread count | Frequent | MEDIUM |
| Preference lookup | On send | LOW |
| Delivery attempt logging | Per delivery | LOW |
| Digest aggregation | Batch | HIGH |
| Queue drain (pending notifications) | Continuous | MEDIUM |
| Quiet hours check | Per send | LOW |
| Template lookup | Per send | LOW |
| Rate limit check | Per send | LOW |

**Potential slow paths:**
1. **Inbox listing** with read/unread status and sorting by created_at - needs index on `(user_id, created_at DESC)`
2. **Unread count** - count query can be slow with many notifications; consider materialized counter
3. **Digest aggregation** - batch query across many users' notifications for digest generation
4. **Queue drain** - selecting pending notifications from queue table under load

**Index requirements:**
- `(user_id, created_at DESC)` on notifications table
- `(user_id, read)` on notifications table (for unread count)
- `(status, scheduled_at)` on notification queue table
- `(user_id)` on notification preferences table

### 3.6 Billing Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Entitlement check | Per API call | MEDIUM |
| Subscription lookup | Per auth | LOW |
| Invoice listing | On billing page | LOW |
| Webhook idempotency check | Per webhook | LOW |
| Checkout status | Polling | LOW |
| Revenue reporting (admin) | On demand | HIGH |

**Potential slow paths:**
1. **Entitlement check** - if performed on every API call, this becomes a hot query. Should be cached.
2. **Revenue reporting** - aggregation across all billing records with date range filtering
3. **Invoice listing** with related subscription and payment data joins

**Index requirements:**
- `(user_id, status)` on subscriptions table
- `(provider_event_id)` on webhook events table (idempotency)
- `(user_id, created_at)` on invoices table

### 3.7 Analytics Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Event ingestion | Continuous | MEDIUM |
| Metric aggregation | On dashboard load | HIGH |
| Report generation | On demand | HIGH |
| Cohort analysis | On demand | HIGH |
| Data export | On demand | HIGH |
| Parent reports (scoped) | On demand | MEDIUM |

**Potential slow paths:**
1. **Metric aggregation** - time-series aggregation over large event tables
2. **Report generation** - complex queries joining multiple tables
3. **Cohort analysis** - group-by queries with date range filtering
4. **Data export** - full table scans for export
5. **Event ingestion** under high write load competing with reads

**Index requirements:**
- `(event_type, created_at)` on analytics events table
- `(user_id, event_type, created_at)` for user-specific queries
- Consider **partitioning** analytics events by month for query performance
- Consider **materialized views** for common aggregation patterns

### 3.8 Parent Queries

| Query Pattern | Frequency | Performance Risk |
|---------------|-----------|-----------------|
| Parent-child link lookup | Per request | LOW |
| Child progress query | On dashboard | MEDIUM |
| Assessment summary | On reports | MEDIUM |
| Activity summary | On dashboard | MEDIUM |
| Consent status check | Per access | LOW |

**Index requirements:**
- `(parent_id, child_id)` on parent-child links table
- `(child_id)` on progress/assessment tables for parent queries

---

## 4. Voice Teacher Repositories

The voice teacher feature has 7 dedicated repositories:

| Repository | File | Performance Concern |
|-----------|------|-------------------|
| Voice session | `voice-session.repository.ts` | Session lookup by user |
| Voice message | `voice-message.repository.ts` | Message history by session |
| Voice transcript | `voice-transcript.repository.ts` | Transcript storage |
| Voice audio asset | `voice-audio-asset.repository.ts` | Binary asset references |
| Voice feedback | `voice-feedback.repository.ts` | Feedback records |
| Voice provider log | `voice-provider-log.repository.ts` | External API logs |
| Voice safety event | `voice-safety-event.repository.ts` | Safety incident logs |

**Performance observation:** Voice repositories are write-heavy (logging external API interactions). These should be non-blocking and should not impact request latency. Consider async insertion or write-behind patterns.

---

## 5. Migration Impact Assessment

### 5.1 Migration Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding NOT NULL column to large table | Table lock during migration | Add nullable first, backfill, then add constraint |
| Creating index on large table | Blocking writes during index creation | Use `CREATE INDEX CONCURRENTLY` |
| Schema changes to analytics tables | Query plan invalidation | Run `ANALYZE` after migration |
| RLS policy changes | Auth query performance | Test RLS policy performance |

### 5.2 Current Schema Size Concerns

Tables likely to be largest:
1. Analytics events - highest write volume
2. Notification records - per-user, per-event records
3. Assessment attempts/answers - per-student, per-assessment
4. Voice messages/transcripts - per-session records
5. Audit logs - per-action records

---

## 6. Optimization Recommendations

### 6.1 Immediate Actions

| Priority | Recommendation | Feature |
|----------|---------------|---------|
| HIGH | Add compound index on notification inbox query | Notifications |
| HIGH | Cache entitlement checks (TTL: 5min) | Billing |
| HIGH | Partition analytics events table by month | Analytics |
| MEDIUM | Materialized view for dashboard metrics | Analytics |
| MEDIUM | Connection pool sizing review | All |
| MEDIUM | Query timeout configuration (30s max) | All |

### 6.2 Pre-Release Actions

| Priority | Recommendation | Feature |
|----------|---------------|---------|
| HIGH | Run `EXPLAIN ANALYZE` on all repository queries | All |
| HIGH | Enable `pg_stat_statements` for slow query identification | All |
| MEDIUM | Review RLS policy performance impact | Auth |
| MEDIUM | Test concurrent write performance on analytics ingestion | Analytics |
| LOW | Consider read replicas for analytics/reporting queries | Analytics |

### 6.3 Post-Release Monitoring

| Metric | Alert Threshold | Source |
|--------|----------------|--------|
| Slow queries (> 500ms) | > 10/minute | pg_stat_statements |
| Connection pool utilization | > 80% | Supabase dashboard |
| Table bloat | > 20% dead tuples | pg_stat_user_tables |
| Index usage | Unused indexes | pg_stat_user_indexes |
| Lock waits | > 5 seconds | pg_stat_activity |

---

## 7. Summary

| Feature Area | Query Risk Level | Key Concern |
|-------------|-----------------|-------------|
| Auth | LOW | High frequency but simple lookups |
| Placement | LOW-MEDIUM | Scoring aggregation on completion |
| Lessons | LOW-MEDIUM | Asset JOINs on lesson detail |
| Assessments | MEDIUM | Grading aggregation, attempt history |
| Notifications | MEDIUM-HIGH | Inbox pagination, digest generation |
| Billing | MEDIUM | Entitlement check frequency, revenue reports |
| Analytics | HIGH | All aggregation queries, event ingestion volume |
| Parents | MEDIUM | Multi-table JOINs for child data |
| Voice | LOW-MEDIUM | Write-heavy logging |

**Overall database performance status: REQUIRES OPTIMIZATION BEFORE RELEASE**

The analytics feature presents the highest database performance risk due to aggregation queries over large event tables. Notification inbox queries and billing entitlement checks are medium-risk due to frequency. Recommended immediate actions: index optimization, analytics table partitioning, and entitlement caching.
