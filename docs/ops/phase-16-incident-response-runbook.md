# Phase 16 — Incident Response Runbook

**Document ID:** P16-070
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This runbook defines the incident response process for the AIM Platform, including severity levels, ownership, escalation procedures, communication protocols, rollback triggers, and postmortem process.

---

## 1. Severity Levels

| Level | Name | Definition | Response Time | Resolution Target |
|-------|------|-----------|---------------|-------------------|
| P0 | Critical | Complete service outage, data loss, security breach | Immediate (< 15 min) | < 1 hour |
| P1 | Major | Core feature broken (auth, learning flow, assessments), significant data integrity issue | < 30 min | < 4 hours |
| P2 | Moderate | Non-core feature broken (analytics, notifications), degraded performance | < 2 hours | < 24 hours |
| P3 | Minor | Cosmetic issue, minor UI bug, non-user-facing error | Next business day | < 1 week |

### P0 Examples
- Backend API completely unresponsive
- Supabase authentication service down
- Database corruption or data loss
- Security breach (unauthorized access to student data)
- Mobile app crashes on launch for all users

### P1 Examples
- Students cannot start or complete lessons
- Placement test returns incorrect results
- Admin dashboard cannot load user data
- Parent-student linking broken
- Payment processing failures

### P2 Examples
- Analytics dashboards showing stale data
- Notifications not delivered (but other features work)
- AI teacher responses slow (> 30s)
- RTL rendering broken on specific pages
- Billing status display incorrect

### P3 Examples
- Minor styling inconsistency
- Typo in UI text
- Non-critical log noise
- Performance slightly below target on non-critical path

---

## 2. Incident Ownership

### On-Call Responsibilities

| Role | Responsibility |
|------|---------------|
| On-call engineer | First responder; triage, diagnose, and resolve or escalate |
| Engineering lead | Escalation point; owns P0/P1 resolution coordination |
| Product owner | Communication with stakeholders; decides feature-level impact |
| DevOps engineer | Infrastructure issues, deployment rollbacks, database operations |
| Mobile engineer | Mobile app crashes, store-related issues |

### Component Ownership

| Component | Primary Owner | Backup |
|-----------|--------------|--------|
| Backend API (`services/backend-api/`) | Backend team | Engineering lead |
| AIM Engine (`services/aim-engine/`) | Backend team | Engineering lead |
| Mobile App (`apps/mobile/`) | Mobile team | Engineering lead |
| Web App (`apps/web/`) | Frontend team | Engineering lead |
| Database (Supabase) | DevOps | Backend team |
| Auth (Supabase Auth) | Backend team | DevOps |
| AI Teacher / Voice Teacher | Backend team | Engineering lead |
| Infrastructure | DevOps | Engineering lead |

---

## 3. Incident Response Process

### Step 1: Detection and Triage (0-15 minutes)

1. **Detect** — Incident reported via monitoring alert, user report, or team observation.
2. **Acknowledge** — On-call engineer acknowledges the incident.
3. **Triage** — Assign severity level (P0-P3) based on Section 1 criteria.
4. **Create incident record** — Log the incident with timestamp, severity, symptoms, and affected components.

### Step 2: Diagnosis (15-60 minutes)

1. **Identify affected components:**
   - Backend API: Check health endpoint, review logs
   - AIM Engine: Check health endpoint, review logs
   - Database: Check Supabase dashboard, query performance
   - Mobile: Check crash reports, user feedback
   - Web: Check browser console errors, network failures

2. **Check recent changes:**
   - Review recent deployments (git log, CI/CD history)
   - Review recent configuration changes
   - Review recent database migrations

3. **Isolate the root cause:**
   - Is it a code change? Check the most recent deployment.
   - Is it an infrastructure issue? Check Supabase status, cloud provider status.
   - Is it a data issue? Check for corrupted or missing data.
   - Is it an external dependency? Check AI provider status, payment provider status.

### Step 3: Resolution

**Option A: Fix Forward**
- Apply a hotfix to resolve the issue.
- Deploy via normal CI/CD pipeline.
- Suitable when the fix is small, well-understood, and low-risk.

**Option B: Rollback**
- Follow the rollback runbook (`docs/deployment/phase-16-rollback-runbook.md`).
- Suitable when the root cause is a recent deployment.
- See Section 5 for rollback triggers.

**Option C: Mitigate**
- Disable the affected feature (e.g., via configuration change).
- Redirect traffic, scale resources, or apply workaround.
- Suitable when a fix or rollback is not immediately possible.

### Step 4: Verification

1. Confirm the incident is resolved by running relevant smoke tests.
2. Monitor for recurrence for at least 30 minutes (P0) or 2 hours (P1).
3. Update the incident record with resolution details.

### Step 5: Communication

1. Notify stakeholders that the incident is resolved.
2. Provide a brief summary of what happened and what was done.
3. Schedule a postmortem if the incident was P0 or P1.

---

## 4. Communication Protocol

### Internal Communication

| Severity | Channel | Frequency |
|----------|---------|-----------|
| P0 | Team chat (dedicated incident channel) + phone | Every 15 minutes during active incident |
| P1 | Team chat (dedicated incident channel) | Every 30 minutes |
| P2 | Team chat (general channel) | Initial report + resolution |
| P3 | Issue tracker | Resolution only |

### External Communication (if applicable)

| Severity | Audience | Channel | Timing |
|----------|----------|---------|--------|
| P0 | All users | Status page + in-app notice | Within 30 minutes of detection |
| P1 | Affected users | Status page | Within 1 hour |
| P2 | None | N/A | N/A |
| P3 | None | N/A | N/A |

### Communication Template

```
INCIDENT: [Title]
SEVERITY: P[0-3]
STATUS: [Investigating / Identified / Monitoring / Resolved]
IMPACT: [What users are experiencing]
NEXT UPDATE: [Time]
```

---

## 5. Rollback Triggers

A rollback should be initiated immediately when:

| Trigger | Severity | Action |
|---------|----------|--------|
| API returns 5xx for > 5 minutes | P0 | Rollback backend API |
| Authentication broken | P0 | Rollback backend API + check Supabase |
| Data corruption detected | P0 | Rollback API + restore database backup |
| Mobile app crash rate > 5% | P0 | Submit rollback to app stores |
| Core learning flow broken | P1 | Rollback backend API |
| Error rate > 10x baseline | P1 | Rollback most recent deployment |
| Database migration caused issues | P1 | Rollback migration (manual SQL) |

**Decision authority:** On-call engineer can initiate rollback for P0 without waiting for approval. P1 rollback requires engineering lead approval.

---

## 6. Postmortem Process

### When to Conduct a Postmortem

- All P0 incidents (mandatory)
- All P1 incidents (mandatory)
- P2 incidents that affected > 100 users or lasted > 4 hours (recommended)
- Any incident from which the team can learn (optional)

### Postmortem Timeline

| Step | Timing |
|------|--------|
| Schedule postmortem meeting | Within 24 hours of resolution |
| Conduct postmortem meeting | Within 3 business days of resolution |
| Publish postmortem document | Within 5 business days of resolution |
| Complete action items | Per agreed timelines |

### Postmortem Document Template

```markdown
# Postmortem: [Incident Title]

## Summary
- Date/time: [start] to [end]
- Duration: [total duration]
- Severity: P[0-3]
- Impact: [what was affected and how many users]

## Timeline
- [HH:MM] — [event]
- [HH:MM] — [event]

## Root Cause
[What caused the incident]

## Resolution
[What was done to resolve it]

## What Went Well
- [item]

## What Went Poorly
- [item]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [item] | [name] | [date] | Open |
```

### Postmortem Principles

1. **Blameless** — Focus on systems and processes, not individuals.
2. **Thorough** — Identify all contributing factors, not just the proximate cause.
3. **Actionable** — Every action item must have an owner and due date.
4. **Shared** — Postmortems are shared with the full team for learning.

---

## 7. Runbook Quick Reference

### Backend API Down

```
1. Check health: curl https://<api-host>/health
2. Check logs: [deployment platform logs]
3. Check Supabase: https://supabase.com/dashboard
4. If recent deployment: rollback (see rollback runbook)
5. If database issue: check connections, restore if needed
```

### Mobile App Crashes

```
1. Check crash reports: [crash reporting dashboard]
2. Check recent releases: app store release history
3. If related to API: check backend API first
4. If client-side: prepare hotfix or app store rollback
```

### Database Issues

```
1. Check Supabase dashboard
2. Check query performance: pg_stat_activity
3. Check for long-running queries or locks
4. If data corruption: restore from backup (see backup runbook)
5. If migration issue: rollback migration
```

---

## 8. Current Gaps

1. **No monitoring/alerting system** — Incident detection is currently manual.
2. **No status page** — No public-facing status page for user communication.
3. **No on-call rotation** — On-call schedule not established.
4. **No crash reporting (mobile)** — No automated crash detection for the mobile app.
5. **No error tracking (web)** — No Sentry or similar for the web app.
6. **No structured logging** — Backend API uses default NestJS logging without structured format.

These gaps should be addressed as high-priority items in Phase 17.
