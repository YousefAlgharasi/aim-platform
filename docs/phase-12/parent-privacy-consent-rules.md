# Phase 12 — Parent Privacy and Consent Rules

**Date:** 2026-06-20
**Task:** P12-003
**Author:** GHOST3030
**Dependency:** P12-001 (Parent Dashboard Charter)

---

## 1. Purpose

This document defines what parent users may access, what requires consent, and what must remain private. These rules apply to all parent-facing endpoints, UI views, and data flows in Phase 12.

---

## 2. Parent Access Principles

1. **Child-scoped access only** — A parent sees only data for children explicitly linked to them via an active `parent_child_link`.
2. **Consent-gated visibility** — An active link alone is insufficient; specific consent must be granted before data is visible.
3. **Read-only child data** — Parents cannot modify student records, progress, skill states, assessment results, or AIM outputs.
4. **Backend authority** — All access decisions are made server-side. The client UI never determines access rights.
5. **Minimal data exposure** — APIs return only the data needed for the parent view; no raw internal records, algorithm weights, or scoring internals.

---

## 3. What Parents May Access

### 3.1 Without Consent (Own Data)

| Data | Access | Notes |
|---|---|---|
| Own parent profile | Read/Write | Name, email, phone |
| Own notification preferences | Read/Write | Channel and category settings |
| Own invitations (sent) | Read/Write | Send, cancel, view status |
| Own parent-child links | Read | View link status |
| Own consent records | Read | View what consent has been granted |

### 3.2 With Active Link + Consent

| Data Category | Required Consent Type | Access |
|---|---|---|
| Child progress summary | `progress_view` or `full_access` | Read-only |
| Child skill states | `progress_view` or `full_access` | Read-only |
| Child weaknesses | `progress_view` or `full_access` | Read-only |
| Child recommendations | `progress_view` or `full_access` | Read-only |
| Child assessment results | `assessment_view` or `full_access` | Read-only |
| Child assessment deadlines | `assessment_view` or `full_access` | Read-only |
| Child learning activity | `activity_view` or `full_access` | Read-only |
| Child reports | `report_view` or `full_access` | Read-only |

---

## 4. What Requires Consent

### 4.1 Consent Types

| Consent Type | Grants Access To |
|---|---|
| `progress_view` | Progress summary, skill states, weaknesses, recommendations |
| `assessment_view` | Assessment results, deadlines |
| `activity_view` | Learning activity logs, session summaries |
| `report_view` | Generated parent reports |
| `full_access` | All of the above |

### 4.2 Consent Lifecycle

1. **Granting** — Consent is granted by the student (if age-appropriate) or by an admin. The parent cannot self-grant consent.
2. **Granularity** — Consent can be granted per category or as full access.
3. **Revocation** — Consent can be revoked at any time by the grantor. Revocation takes effect immediately.
4. **Re-granting** — After revocation, consent can be re-granted through the same process.
5. **Expiry** — Consent does not expire automatically but may be subject to periodic review (implementation deferred).

### 4.3 Consent Enforcement

- Backend checks consent on **every** child-scoped data request.
- If consent is missing or revoked, the endpoint returns a 403 Forbidden response.
- The UI displays an appropriate "no consent" state — never cached stale data.
- Consent checks are performed after auth and relationship checks in the guard chain.

---

## 5. What Must Remain Private

### 5.1 Never Exposed to Parents

| Data | Reason |
|---|---|
| Other students' data | Not linked to this parent |
| AIM algorithm weights and scoring logic | Internal implementation detail |
| Raw database records | Security boundary |
| Backend service credentials | Security |
| Admin operational data | Role boundary |
| Student private notes (if any) | Student privacy |
| Internal audit logs (admin) | Admin-only |
| Teacher/AI Teacher interactions | Not parent-scoped |
| Placement test raw scoring internals | Backend authority |
| Question bank content (full) | Curriculum IP protection |

### 5.2 Never Modifiable by Parents

| Data | Reason |
|---|---|
| Student profile fields | Owned by student/admin |
| Progress calculations | Backend AIM authority |
| Skill mastery levels | Backend AIM authority |
| Weakness determinations | Backend AIM authority |
| Assessment scores | Backend grading authority |
| Deadline dates | Admin/system authority |
| Review schedules | Backend AIM authority |
| Recommendations | Backend AIM authority |
| Curriculum content | Admin authority |
| Other parents' data | Privacy boundary |

---

## 6. Consent and Link Status Interactions

| Link Status | Consent Status | Parent Access |
|---|---|---|
| `active` | `granted` | Allowed (for consented categories) |
| `active` | `revoked` | Denied (403) |
| `active` | Not yet granted | Denied (403) |
| `pending` | Any | Denied (403) |
| `revoked` | Any | Denied (403) |
| Missing | Any | Denied (403) |

---

## 7. Privacy Rules for UI

### 7.1 Display Rules

- Show a clear "no access" or "consent required" message when data is unavailable due to missing consent.
- Never show partial data from a previous consent state after revocation.
- Never cache child data client-side beyond the current session.
- Show the child selector only with children the parent has active links to.
- Do not display children whose links are pending or revoked.

### 7.2 Error States

| Scenario | UI Behavior |
|---|---|
| No active link | Show "no linked children" state |
| Link pending | Show "invitation pending" state |
| Link revoked | Do not show child in selector |
| Consent missing | Show "consent required" for that data category |
| Consent revoked | Immediately hide data, show "consent revoked" state |
| Auth expired | Redirect to login |
| Forbidden (403) | Show "access denied" state, do not reveal reason details |

---

## 8. Privacy Rules for Backend

### 8.1 API Response Rules

- Never include data for non-linked or non-consented children in any response.
- Never include internal IDs or references that could be used to enumerate other students.
- Sanitize all error messages — do not reveal whether a child exists if the parent is not linked.
- Log all parent access attempts (successful and denied) for audit.

### 8.2 Guard Chain Order

1. Auth Guard (JWT valid, role = parent)
2. Relationship Guard (active parent_child_link)
3. Consent Guard (active consent for requested data type)
4. Child-Scope Guard (filter response to requested child only)

All four guards must pass. Failure at any step returns 403 without revealing which guard failed.

---

## 9. Data Flow Privacy

### 9.1 Invitation Privacy

- Invitation codes must be cryptographically random and unguessable.
- Invitation emails/notifications must not reveal the child's full academic data.
- Expired or cancelled invitations cannot be reused.

### 9.2 Audit Trail

- All parent data access is logged with: parent_id, child_id, action, resource_type, timestamp.
- Audit logs are append-only and immutable.
- Audit logs are accessible only to admins, not to parents.

---

## 10. Compliance Considerations

- These rules support COPPA-like protections by requiring explicit consent before parent access to child data.
- Consent revocation provides immediate data access removal.
- The audit trail supports compliance reporting.
- No child data is shared with third parties through the parent dashboard.
- Parent notification preferences are stored but notifications are not sent until Phase 13.
