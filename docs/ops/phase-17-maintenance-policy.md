# Phase 17 — Maintenance Policy

**Document ID:** P17-006
**Phase:** 17 — Post-Launch Operations
**Author:** GHOST3030
**Date:** 2026-06-21
**Dependency:** P17-001

---

## Purpose

Define planned maintenance, emergency maintenance, downtime notification, rollback procedures, and user communication rules for the AIM Platform post-launch operations.

---

## 1. Maintenance Types

| Type | Definition | Notice Required | Approval |
|------|-----------|-----------------|----------|
| Planned maintenance | Scheduled infrastructure, database, or application updates | 48 hours minimum | Admin approval required |
| Emergency maintenance | Unscheduled maintenance to address critical issues | Immediate notice | Admin approval (expedited) |
| Hot-fix deployment | Targeted code fix with no expected downtime | No downtime notice | Admin approval |
| Database migration | Schema or data changes requiring careful coordination | 72 hours minimum | Admin + engineering approval |

---

## 2. Planned Maintenance Rules

| Rule | Description |
|------|-------------|
| Advance notice | Minimum 48 hours before scheduled start |
| Preferred window | Off-peak hours (Friday/Saturday nights, Gulf timezone) |
| Duration limit | Maximum 4 hours per planned window |
| Frequency limit | No more than 2 planned maintenance windows per month |
| Staging first | All maintenance changes must pass staging environment |
| Rollback plan | Every maintenance must have a documented rollback procedure |
| Status page update | Status page must reflect scheduled maintenance |
| In-app banner | In-app maintenance banner shown 24 hours before start |

---

## 3. Emergency Maintenance Rules

| Rule | Description |
|------|-------------|
| Authorization | Platform lead or designated on-call admin |
| Immediate notice | Status page updated within 5 minutes of decision |
| User notification | Push notification and in-app banner immediately |
| Duration | Target resolution within 2 hours |
| Post-event summary | Required within 24 hours of completion |
| Incident linkage | Emergency maintenance must link to an incident record |
| Approval shortcut | Single admin approval sufficient (vs. dual for planned) |

---

## 4. Downtime Notice Requirements

| Notice Type | Timing | Channel | Content |
|-------------|--------|---------|---------|
| Advance notice (planned) | 48 hours before | Status page, in-app banner, email | Date, time, duration, affected services |
| Reminder (planned) | 2 hours before | In-app banner, push notification | Reminder with countdown |
| Start notice | At maintenance start | Status page, in-app banner | Maintenance in progress, expected end time |
| Completion notice | At maintenance end | Status page, in-app banner | Services restored, summary |
| Emergency start | Immediately | Status page, push notification, in-app | Issue description, expected resolution |
| Emergency update | Every 30 minutes | Status page | Progress update |
| Emergency completion | At resolution | Status page, push notification | Resolution summary |

---

## 5. Rollback Procedures

| Step | Action | Owner |
|------|--------|-------|
| 1 | Identify rollback trigger (failed health checks, error spike, user reports) | On-call engineer |
| 2 | Confirm rollback decision with admin | Admin |
| 3 | Execute rollback (revert deployment, restore database snapshot) | Engineering |
| 4 | Verify rollback success (health checks, smoke tests) | Engineering |
| 5 | Update status page | Admin |
| 6 | Notify users of rollback completion | System (automated) |
| 7 | Document rollback in incident record | Admin |

### Rollback Requirements

| Requirement | Description |
|-------------|-------------|
| Pre-deployment snapshot | Database snapshot taken before every deployment |
| Deployment versioning | Every deployment tagged with version for easy revert |
| Health check gate | Automated health checks must pass within 5 minutes post-deploy |
| Auto-rollback | If health checks fail, auto-rollback triggers (when configured) |
| Rollback testing | Rollback procedure tested quarterly in staging |

---

## 6. User Communication Rules

| Rule | Description |
|------|-------------|
| Transparency | All maintenance communicated proactively; no silent downtime |
| Language | Notices in English and Arabic |
| Tone | Professional, clear, non-technical for user-facing notices |
| Technical detail | Internal post-mortem may include technical detail; user notices must not |
| Status page | Single source of truth for operational status |
| No blame | User-facing notices must not blame individuals or teams |
| Estimated time | Always provide estimated completion time (update if it changes) |
| Follow-up | Post-maintenance summary required for all planned maintenance |

---

## 7. Maintenance Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Schedule maintenance | Admin only | Display upcoming windows (read-only) |
| Cancel maintenance | Admin only | Remove from display |
| Start maintenance | Admin only | Display maintenance banner |
| End maintenance | Admin only | Remove maintenance banner |
| Send notices | System (admin-triggered) | Display notification |
| Execute rollback | Engineering + admin | Not available in client |

**Rule:** All maintenance authority resides with backend/admin per P17-003. Client UI displays maintenance state but never controls it.

---

## 8. Maintenance Checklist Template

| Phase | Checklist Item | Required |
|-------|---------------|----------|
| Pre-maintenance | Staging environment tested | Yes |
| Pre-maintenance | Rollback plan documented | Yes |
| Pre-maintenance | Database snapshot taken | Yes |
| Pre-maintenance | Status page updated (scheduled) | Yes |
| Pre-maintenance | User notice sent (48h advance) | Yes (planned) |
| During | Status page updated (in progress) | Yes |
| During | Health checks monitored | Yes |
| During | Engineering on standby for rollback | Yes |
| Post-maintenance | Health checks pass | Yes |
| Post-maintenance | Status page updated (completed) | Yes |
| Post-maintenance | User notice sent (completion) | Yes |
| Post-maintenance | Post-maintenance summary written | Yes |

---

## Verdict

This maintenance policy governs all Phase 17 maintenance operations. Planned maintenance requires 48-hour notice and rollback plans. Emergency maintenance requires immediate notice and post-event summary. All maintenance authority is backend/admin-only. Client UI displays maintenance state read-only. User communication must be transparent, bilingual, and professional.
