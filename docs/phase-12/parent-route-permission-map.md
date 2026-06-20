# Phase 12 — Parent Route and Permission Map

**Date:** 2026-06-20
**Task:** P12-005
**Author:** GHOST3030
**Dependencies:** P12-002 (Domain Map), P12-003 (Privacy and Consent Rules)

---

## 1. Purpose

Map every parent dashboard route to its required permissions, guards, and child access checks. Every route must be protected — no parent route is publicly accessible.

---

## 2. Guard Chain

All parent routes pass through this guard chain in order:

1. **Auth Guard** — Valid JWT with role = `parent`
2. **Relationship Guard** — Active `parent_child_link` for the requested child (child-scoped routes only)
3. **Consent Guard** — Active consent for the requested data category (child-data routes only)
4. **Child-Scope Guard** — Response filtered to the requested child only

Failure at any guard returns 403 without revealing which guard failed.

---

## 3. Route Map

### 3.1 Parent-Only Routes (No Child Scope)

These routes require auth but do not require a specific child context.

| Route | Method | Auth | Link | Consent | Description |
|---|---|---|---|---|---|
| `/parent/onboarding` | GET | Parent | — | — | Parent onboarding page |
| `/parent/onboarding/complete` | POST | Parent | — | — | Complete onboarding |
| `/parent/profile` | GET | Parent | — | — | View own profile |
| `/parent/profile` | PUT | Parent | — | — | Update own profile |
| `/parent/dashboard` | GET | Parent | — | — | Dashboard home (child selector) |
| `/parent/invitations` | GET | Parent | — | — | List own sent invitations |
| `/parent/invitations` | POST | Parent | — | — | Send new invitation |
| `/parent/invitations/:id/cancel` | POST | Parent | — | — | Cancel own invitation |
| `/parent/preferences` | GET | Parent | — | — | View notification preferences |
| `/parent/preferences` | PUT | Parent | — | — | Update notification preferences |
| `/parent/children` | GET | Parent | — | — | List linked children (active links only) |

### 3.2 Child-Scoped Routes (Require Link + Consent)

These routes require an active parent-child link and appropriate consent.

| Route | Method | Auth | Link | Consent Type | Description |
|---|---|---|---|---|---|
| `/parent/children/:childId/overview` | GET | Parent | Active | `progress_view` / `full_access` | Child progress overview |
| `/parent/children/:childId/progress` | GET | Parent | Active | `progress_view` / `full_access` | Detailed progress summary |
| `/parent/children/:childId/skills` | GET | Parent | Active | `progress_view` / `full_access` | Child skill states |
| `/parent/children/:childId/weaknesses` | GET | Parent | Active | `progress_view` / `full_access` | Child weaknesses and recommendations |
| `/parent/children/:childId/assessments` | GET | Parent | Active | `assessment_view` / `full_access` | Child assessment results |
| `/parent/children/:childId/deadlines` | GET | Parent | Active | `assessment_view` / `full_access` | Child upcoming deadlines |
| `/parent/children/:childId/activity` | GET | Parent | Active | `activity_view` / `full_access` | Child learning activity log |
| `/parent/children/:childId/reports` | GET | Parent | Active | `report_view` / `full_access` | Child reports |
| `/parent/children/:childId/consent` | GET | Parent | Active | — | View consent state for this child |

### 3.3 Consent Management Routes

| Route | Method | Auth | Link | Consent | Description |
|---|---|---|---|---|---|
| `/parent/children/:childId/consent` | GET | Parent | Active | — | View consent records |
| `/parent/consent/grant` | POST | Student/Admin | — | — | Grant consent (not parent-initiated) |
| `/parent/consent/revoke` | POST | Student/Admin | — | — | Revoke consent (not parent-initiated) |

**Note:** Parents cannot self-grant or self-revoke consent. These actions are performed by the student or admin through separate routes.

---

## 4. UI Route Map

### 4.1 Parent Dashboard Pages

| UI Route | Page | Guards | Data Source |
|---|---|---|---|
| `/parent` | Dashboard home | Auth | Own children list |
| `/parent/onboarding` | Onboarding flow | Auth | Own profile |
| `/parent/profile` | Profile settings | Auth | Own profile |
| `/parent/invitations` | Invitation management | Auth | Own invitations |
| `/parent/preferences` | Notification preferences | Auth | Own preferences |
| `/parent/children/:childId` | Child overview | Auth + Link + Consent | Backend child data |
| `/parent/children/:childId/progress` | Progress detail | Auth + Link + Consent(progress) | Backend progress |
| `/parent/children/:childId/skills` | Skill states | Auth + Link + Consent(progress) | Backend skills |
| `/parent/children/:childId/weaknesses` | Weaknesses | Auth + Link + Consent(progress) | Backend weaknesses |
| `/parent/children/:childId/assessments` | Assessment results | Auth + Link + Consent(assessment) | Backend assessments |
| `/parent/children/:childId/deadlines` | Deadlines | Auth + Link + Consent(assessment) | Backend deadlines |
| `/parent/children/:childId/activity` | Activity log | Auth + Link + Consent(activity) | Backend activity |
| `/parent/children/:childId/reports` | Reports | Auth + Link + Consent(report) | Backend reports |
| `/parent/children/:childId/consent` | Consent status | Auth + Link | Backend consent |

### 4.2 Redirect Rules

| Condition | Redirect To |
|---|---|
| Not authenticated | `/login` |
| Authenticated but not parent role | `/unauthorized` |
| Parent but onboarding incomplete | `/parent/onboarding` |
| No linked children | `/parent` (empty state with invite CTA) |
| No active consent for requested data | Child consent page with "consent required" message |

---

## 5. Permission Matrix

### 5.1 Role-Based Access

| Route Category | Parent | Student | Admin | Guest |
|---|---|---|---|---|
| Parent dashboard routes | Allowed | Denied | Denied | Denied |
| Child data routes | Allowed (with link + consent) | Denied | Denied | Denied |
| Consent grant/revoke | Denied | Allowed (own data) | Allowed | Denied |
| Parent profile | Allowed (own) | Denied | Denied | Denied |
| Invitation routes | Allowed (own) | Denied | Denied | Denied |

### 5.2 Child-Scope Enforcement

- Every `:childId` parameter must be validated against the parent's active links.
- If `childId` does not match an active link, return 403.
- Do not return 404 — this would reveal whether the child exists.
- Always use 403 for both "child not found" and "no access" to prevent enumeration.

---

## 6. Security Rules

### 6.1 Route Protection Checklist

Every parent route must:

- [ ] Require valid JWT
- [ ] Verify role = `parent`
- [ ] Verify active parent_child_link (for child routes)
- [ ] Verify active consent (for child data routes)
- [ ] Filter response to requested child only
- [ ] Log access attempt
- [ ] Return 403 on any guard failure
- [ ] Not reveal which guard failed

### 6.2 Forbidden Actions from Parent Routes

- No route allows parents to modify student records
- No route allows parents to modify progress, skills, or assessment data
- No route allows parents to access admin endpoints
- No route allows parents to access other parents' data
- No route allows parents to grant their own consent
- No route allows parents to bypass the guard chain
