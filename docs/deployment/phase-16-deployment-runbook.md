# Phase 16 — Deployment Runbook

**Task:** P16-058
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document production deployment steps, owners, commands, checks, rollback triggers, and post-deployment verification.

## Pre-Deployment Checklist

| Step | Owner | Status |
|---|---|---|
| All Phase 16 QA checks pass | QA Lead | Required |
| Go/No-Go decision approved | Engineering Lead | Required |
| Database backup completed | DevOps | Required |
| Rollback plan reviewed | Engineering Lead | Required |
| Monitoring/alerting configured | DevOps | Required |
| Staging deployment validated | DevOps | Required |

## Deployment Order

### Step 1: Database Migrations

```
Owner: DevOps
Environment: Production (Supabase)
```

1. Take database backup (see `docs/deployment/phase-16-database-backup-restore-runbook.md`)
2. Run migrations in order:
   - Phase 2-5 core migrations (if not already applied)
   - Phase 8-10 feature migrations
   - Phase 13-14 notification and billing migrations
   - Phase 15 analytics migrations (11 files)
3. Verify migration status:
   - Check all tables created
   - Verify constraints active
   - Run seed data
4. Verify RLS policies active

### Step 2: Backend Deployment

```
Owner: Backend Lead
Environment: Production server
```

1. Build backend from release branch
2. Set environment variables (see environment map)
3. Deploy NestJS application
4. Verify health endpoint responds: `GET /api/health`
5. Verify auth flow: test login/register
6. Verify API endpoints respond with correct status codes

### Step 3: Worker Deployment

```
Owner: Backend Lead
Environment: Production worker instances
```

1. Deploy worker processes
2. Verify job queue processing
3. Verify notification delivery pipeline
4. Verify analytics aggregation jobs

### Step 4: Admin Dashboard Deployment

```
Owner: Frontend Lead
Environment: Admin domain
```

1. Build admin web app from release branch
2. Deploy to hosting (Vercel/Netlify/CDN)
3. Verify admin login and dashboard loading
4. Verify analytics pages render correctly

### Step 5: Parent Dashboard Deployment

```
Owner: Frontend Lead
Environment: Parent domain
```

1. Build parent web app from release branch
2. Deploy to hosting
3. Verify parent login and child progress views
4. Verify parent reporting pages

### Step 6: Mobile App Release

```
Owner: Mobile Lead
Environment: App Store / Play Store
```

1. Build release APK/IPA from release branch
2. Submit to app stores (see `docs/deployment/phase-16-mobile-release-readiness.md`)
3. Monitor store review status
4. Verify app connects to production API after approval

## Post-Deployment Verification

| Check | Command/Action | Expected Result |
|---|---|---|
| Backend health | `GET /api/health` | 200 OK |
| Auth flow | Login with test account | JWT returned |
| Curriculum access | `GET /api/curriculum/subjects` | Subject list |
| Admin dashboard | Load admin URL | Dashboard renders |
| Parent dashboard | Load parent URL | Dashboard renders |
| Mobile app | Open app, login | Home screen loads |
| Analytics ingestion | Trigger test event | Event stored |
| Notifications | Trigger test notification | Notification delivered |

## Rollback Triggers

Initiate rollback if any of the following occur within 2 hours of deployment:

- Backend health endpoint fails for > 5 minutes
- Error rate exceeds 5% of requests
- Auth flow completely broken
- Data corruption detected
- Critical security vulnerability discovered

See `docs/deployment/phase-16-rollback-runbook.md` for rollback procedures.

## Communication Plan

| Event | Channel | Audience |
|---|---|---|
| Deployment start | Slack #deployments | Engineering team |
| Each step completed | Slack #deployments | Engineering team |
| Deployment complete | Slack #general | All team |
| Rollback initiated | Slack #incidents + PagerDuty | Engineering + leads |

## Verdict

**READY** — Deployment runbook complete. All steps, owners, and verification checks documented.
