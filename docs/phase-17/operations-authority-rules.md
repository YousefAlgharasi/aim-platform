# Phase 17 — Operations Authority Rules

**Document ID:** P17-003
**Phase:** 17 — Post-Launch Operations
**Author:** GHOST3030
**Date:** 2026-06-21
**Dependency:** P17-001

---

## Purpose

Define backend/admin authority for all operational state including support status, maintenance state, feature flags, incident state, and release communications. This document prevents client-side operational authority and establishes the immutable rule that all operational decisions flow from backend/admin.

---

## 1. Core Authority Principle

**All operational authority resides with backend/admin. Client-side UI is display-only for operational state. No client-side code may create, update, or delete operational records without a backend-authorized API call.**

---

## 2. Support Status Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Create support ticket | User (via backend API) | Submit form; backend validates and persists |
| View own tickets | User (via backend API) | Display read-only ticket list |
| Assign ticket | Admin only | Not available in client |
| Change ticket status | Admin only | Not available in client |
| Set ticket priority | Admin only | Not available in client |
| Add resolution notes | Admin only | Not available in client |
| Close ticket | Admin only | Not available in client |
| Reopen ticket | Admin (policy-gated) | Not available in client |

**Violation rule:** Any client-side code that directly modifies support ticket status, priority, or assignment without backend API authorization is a Phase 17 violation.

---

## 3. Maintenance State Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Schedule maintenance | Admin only | Not available in client |
| Cancel maintenance | Admin only | Not available in client |
| Start maintenance | Admin only | Not available in client |
| End maintenance | Admin only | Not available in client |
| Send maintenance notice | Admin only (system-triggered) | Not available in client |
| View maintenance schedule | Public (via backend API) | Display upcoming windows |
| View maintenance status | Public (via backend API) | Display current status |

**Violation rule:** Client-side code must not alter maintenance window state. The client reads and displays only.

---

## 4. Feature Flag Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Create feature flag | Admin only | Not available in client |
| Update flag state | Admin only | Not available in client |
| Set rollout percentage | Admin only | Not available in client |
| Delete feature flag | Admin only | Not available in client |
| Evaluate flag for user | Backend (server-evaluated) | Client receives boolean result |
| Override flag per user | Admin only | Not available in client |

**Violation rule:** Feature flags must be evaluated server-side. Client-side flag evaluation (e.g., reading flag config directly) is prohibited. The client receives only the resolved boolean value per flag per user session.

---

## 5. Incident State Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Create incident | Admin only | Not available in client |
| Update incident status | Admin only | Not available in client |
| Set incident severity | Admin only | Not available in client |
| Post incident update | Admin only | Not available in client |
| Resolve incident | Admin only | Not available in client |
| Publish post-mortem | Admin only | Not available in client |
| View active incidents | Public (via backend API) | Display on status page |
| View incident history | Public (via backend API) | Display on status page |

**Violation rule:** Client-side code must not create, modify, or close incidents. All incident lifecycle actions are admin-only backend operations.

---

## 6. Release Communication Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Draft release note | Admin only | Not available in client |
| Publish release note | Admin only | Not available in client |
| Archive release note | Admin only | Not available in client |
| Edit published note | Admin only | Not available in client |
| View published notes | Public (via backend API) | Display release notes list |

**Violation rule:** Release notes are admin-authored and admin-published. Client displays published notes read-only.

---

## 7. Operational Status Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Update service status | Admin only | Not available in client |
| Link incident to status | Admin only | Not available in client |
| Link maintenance to status | Admin only | Not available in client |
| View service status | Public (via backend API) | Display status page |

**Violation rule:** Service operational status is admin-controlled. Client-side code must not infer or set service status based on local observations (e.g., failed API calls do not equal "service down" from the client perspective).

---

## 8. Audit Authority

| Action | Authority | Client Role |
|--------|-----------|-------------|
| Generate audit record | System (automatic) | Not available in client |
| View audit log | Admin only | Display in admin dashboard |
| Export audit log | Admin only | Download via admin dashboard |
| Modify audit record | Prohibited | Not available anywhere |
| Delete audit record | Prohibited | Not available anywhere |

**Violation rule:** Audit records are immutable. No actor (including admin) may modify or delete audit records after creation.

---

## 9. Authority Enforcement Summary

| Enforcement Point | Mechanism |
|--------------------|-----------|
| API authorization | JWT + role-based access control (RBAC) |
| Admin role check | Backend middleware validates admin role before mutation |
| Client restriction | Client codebase contains no admin-mutation endpoints |
| Audit trail | All admin actions generate audit records |
| Feature flag evaluation | Server-side only; client receives resolved values |
| Rate limiting | API rate limits prevent abuse of public endpoints |

---

## 10. Authority Violation Response

| Violation Type | Response |
|----------------|----------|
| Client-side operational mutation | Code review rejection; immediate revert |
| Unauthorized admin action | Audit log alert; access review |
| Feature flag client evaluation | Code review rejection; refactor to server evaluation |
| Audit record tampering | Security incident; immediate investigation |

---

## Verdict

Backend/admin owns all operational authority in Phase 17. Client-side UI is strictly display-only for operational state. Feature flags are server-evaluated. Audit records are immutable. Any code that violates these rules must be reverted and corrected before merge. This authority model applies to all Phase 17 entities defined in P17-002.
