# Phase 17 — Support Policy

**Document ID:** P17-004
**Phase:** 17 — Post-Launch Operations
**Author:** GHOST3030
**Date:** 2026-06-21
**Dependency:** P17-001

---

## Purpose

Define support channels, ticket categories, severity levels, response expectations, escalation rules, and privacy limits for the AIM Platform post-launch support operations.

---

## 1. Support Channels

| Channel | Type | Availability | Description |
|---------|------|-------------|-------------|
| In-app support form | Primary | 24/7 submission | Structured ticket submission within AIM Platform |
| Support email | Secondary | 24/7 submission | Email-based ticket creation (auto-converts to ticket) |
| Help center / FAQ | Self-service | 24/7 | Knowledge base for common issues |
| Status page | Informational | 24/7 | Real-time service status and incident updates |

**Note:** No phone support, live chat, or social media support channels are included in Phase 17 scope.

---

## 2. Ticket Categories

| Category | Description | Examples |
|----------|-------------|---------|
| Account | Login, registration, profile, password | Cannot log in, profile update failed |
| Technical | Platform bugs, errors, crashes | Page not loading, API error, app crash |
| Content | Course content, assessment issues | Missing content, incorrect answers, broken media |
| Accessibility | Accessibility barriers, RTL issues | Screen reader incompatibility, contrast issues |
| Billing | Subscription, payment, invoice | Payment failed, invoice request, plan change |
| Other | Anything not covered above | General inquiry, partnership request |

---

## 3. Severity Levels

| Severity | Label | Definition | Example |
|----------|-------|------------|---------|
| P0 | Critical | Platform-wide outage or data loss affecting all users | Database down, auth service failure |
| P1 | Major | Significant feature broken for many users | Assessment engine not grading, payment processing down |
| P2 | Minor | Feature degraded or broken for some users | Slow load times, intermittent errors on one page |
| P3 | Cosmetic | Visual or low-impact issue | Typo, misaligned element, minor UI inconsistency |

**Severity assignment:** Admin/support agent assigns severity during triage. User-submitted severity is treated as a suggestion only.

---

## 4. Response Expectations

| Severity | First Response Target | Update Frequency | Resolution Target |
|----------|-----------------------|-------------------|-------------------|
| P0 | 1 hour | Every 30 minutes | Best effort (ASAP) |
| P1 | 4 hours | Every 2 hours | Best effort (24 hours) |
| P2 | 24 hours | Every 48 hours | Best effort (5 business days) |
| P3 | 48 hours | On status change | Best effort (10 business days) |

**Note:** Response targets are goals, not SLA guarantees. Resolution targets represent best-effort commitments and are not contractually binding.

---

## 5. Escalation Rules

| Escalation Level | Trigger | Escalated To | Action |
|-------------------|---------|-------------|--------|
| Tier 1 to Tier 2 | Ticket unresolved after first response target | Senior support agent | Re-triage, deeper investigation |
| Tier 2 to Engineering | Technical root cause required | Engineering on-call | Bug investigation, hotfix assessment |
| Engineering to Platform Lead | P0/P1 unresolved past resolution target | Platform lead | Priority override, resource allocation |
| Platform Lead to Stakeholder | P0 incident lasting > 4 hours | Project stakeholder | Executive communication, external notice |

### Escalation Timing

| Severity | Auto-escalate to Tier 2 | Auto-escalate to Engineering |
|----------|--------------------------|------------------------------|
| P0 | 30 minutes | 1 hour |
| P1 | 2 hours | 4 hours |
| P2 | 24 hours | 48 hours |
| P3 | Manual only | Manual only |

---

## 6. Ticket Lifecycle

| Status | Description | Transition Rules |
|--------|-------------|-----------------|
| Open | Ticket submitted, awaiting triage | Auto-set on creation |
| In Progress | Agent actively working on ticket | Agent assigns to self |
| Waiting on User | Agent needs more information | Agent requests info; auto-close after 7 days if no response |
| Resolved | Issue resolved, pending user confirmation | Agent marks resolved |
| Closed | Ticket finalized | Auto-close 48 hours after resolved if no reopen request |

**Authority:** Only admin/support agents may transition ticket status. Users may reopen a resolved ticket within 48 hours by replying.

---

## 7. Privacy Limits

| Rule | Description |
|------|-------------|
| No PII in logs | Support agents must not include user PII in internal logs or notes |
| Anonymized screenshots | Any screenshots shared internally must have PII redacted |
| Data access | Support agents access only the data necessary to resolve the ticket |
| No data sharing | User data is not shared between tickets or with other users |
| Retention | Closed tickets retained for 12 months, then anonymized |
| User data requests | Users may request their support ticket history via account settings |
| Third-party disclosure | No user data disclosed to third parties without explicit consent |

---

## 8. Support Agent Guidelines

| Guideline | Description |
|-----------|-------------|
| Language | Professional, clear, empathetic tone |
| Localization | Support available in English and Arabic |
| Response format | Structured response with issue summary, steps taken, next steps |
| Internal notes | Required for all status transitions |
| Knowledge base | Agents must check FAQ before custom response |
| Duplicate detection | Check for existing tickets from same user before creating new |

---

## Verdict

This support policy governs all Phase 17 support operations. All ticket management authority resides with backend/admin per P17-003. Client UI provides ticket submission and read-only status viewing. Severity assignment, triage, escalation, and resolution are admin-only operations. Privacy limits apply to all support interactions.
