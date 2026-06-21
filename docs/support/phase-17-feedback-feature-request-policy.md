# Phase 17 — Feedback and Feature Request Policy

**Document ID:** P17-005
**Phase:** 17 — Post-Launch Operations
**Author:** GHOST3030
**Date:** 2026-06-21
**Dependency:** P17-001

---

## Purpose

Define how user feedback, bug reports, and feature requests are collected, categorized, prioritized, triaged, and tracked within the AIM Platform post-launch operations.

---

## 1. Feedback Collection Channels

| Channel | Type | Access | Description |
|---------|------|--------|-------------|
| In-app feedback form | Primary | Authenticated users | Structured form within the AIM Platform |
| In-app bug report | Primary | Authenticated users | Bug-specific form with screenshot attachment |
| Post-assessment prompt | Contextual | Students | Optional feedback after assessment completion |
| Support ticket escalation | Secondary | Support agents | Feedback extracted from support tickets by admin |

**Rule:** All feedback is persisted via backend API. Client-side forms submit to backend; no local-only feedback storage.

---

## 2. Feedback Categories

| Category | Description | Examples |
|----------|-------------|---------|
| Bug report | Something is broken or behaving incorrectly | Crash, wrong data, broken navigation |
| Usability | Difficulty using a feature that works correctly | Confusing flow, unclear labels, hard to find |
| Performance | Slow or laggy experience | Long load times, animation stutter |
| Content | Issues with course content or assessments | Incorrect question, missing content, broken media |
| General | Positive feedback, suggestions, other | Compliment, general idea, off-topic |

---

## 3. Feedback Lifecycle

| Status | Description | Transition Authority |
|--------|-------------|---------------------|
| Received | Feedback submitted by user | System (auto-set) |
| Reviewed | Admin has read and categorized | Admin only |
| Actionable | Feedback linked to a task or feature request | Admin only |
| Deferred | Valid but not prioritized for current phase | Admin only |
| Archived | No action needed or duplicate | Admin only |

**Authority:** Users submit feedback and view their own submissions. All status transitions are admin-only.

---

## 4. Feature Request Collection

| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | Short descriptive title |
| Description | Yes | Detailed description of the desired feature |
| Use case | Optional | Why the user wants this feature |
| Category | Auto-assigned | Categorized by admin during triage |

---

## 5. Feature Request Lifecycle

| Status | Description | Transition Authority |
|--------|-------------|---------------------|
| Submitted | User has submitted the request | System (auto-set) |
| Under Review | Admin is evaluating the request | Admin only |
| Planned | Accepted and scheduled for future work | Admin only |
| In Progress | Development has started | Admin only |
| Shipped | Feature has been released | Admin only |
| Declined | Request will not be implemented | Admin only |

---

## 6. Feature Request Voting

| Rule | Description |
|------|-------------|
| Eligible voters | Authenticated users only |
| Vote limit | One vote per user per feature request |
| Vote change | Users may remove their vote at any time |
| Vote visibility | Total vote count visible to all authenticated users |
| Vote influence | Vote count informs priority but does not determine it |
| Admin override | Admin may prioritize regardless of vote count |

---

## 7. Prioritization Framework

| Priority | Label | Criteria |
|----------|-------|----------|
| Critical | P0 | Blocks core platform functionality; affects many users |
| High | P1 | Significant improvement; high vote count; aligns with roadmap |
| Medium | P2 | Useful improvement; moderate demand; no urgency |
| Low | P3 | Nice-to-have; low demand; may revisit later |

### Prioritization Inputs

| Input | Weight | Description |
|-------|--------|-------------|
| Vote count | Medium | User demand signal |
| Support ticket volume | High | Recurring issues indicate priority |
| Platform strategy alignment | High | Alignment with product roadmap |
| Implementation effort | Medium | Cost-benefit analysis |
| User impact scope | High | Number of users affected |
| Accessibility impact | High | Accessibility barriers receive priority boost |

**Authority:** Prioritization is admin-only. User votes inform but do not dictate priority.

---

## 8. Triage Process

| Step | Action | Owner |
|------|--------|-------|
| 1 | Review new feedback/requests daily | Admin/support agent |
| 2 | Categorize and deduplicate | Admin |
| 3 | Link related feedback items | Admin |
| 4 | Assign priority using prioritization framework | Admin |
| 5 | Update status (under review, planned, declined) | Admin |
| 6 | Notify user of status change (optional) | System (automated) |
| 7 | Link planned items to release milestones | Admin |

### Triage SLA

| Item Type | Triage Target |
|-----------|---------------|
| Bug report | Within 24 hours |
| Feature request | Within 5 business days |
| General feedback | Within 5 business days |

---

## 9. User Communication

| Event | Communication | Channel |
|-------|---------------|---------|
| Feedback received | Acknowledgment message | In-app notification |
| Feature request status change | Status update notification | In-app notification |
| Feature shipped | Release note reference | In-app notification + release notes |
| Request declined | Decline reason (optional) | In-app notification |

**Rule:** All communication respects user notification preferences. No email spam.

---

## 10. Privacy and Data Rules

| Rule | Description |
|------|-------------|
| Anonymized aggregation | Feedback may be aggregated anonymously for trend analysis |
| No PII in reports | Internal reports must not contain user PII |
| User data ownership | Users may view and delete their own feedback |
| Retention | Feedback retained for 24 months, then anonymized |

---

## Verdict

Feedback and feature requests are collected via structured in-app channels, triaged by admin, and prioritized using a defined framework. Users submit and vote; admin owns all triage, categorization, prioritization, and status decisions. Client UI provides submission and read-only viewing. No client-side code may alter feedback or feature request status.
