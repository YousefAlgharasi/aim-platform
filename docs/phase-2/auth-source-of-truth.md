# Phase 2 — Auth Source of Truth

## Purpose

This document defines the authentication source of truth for **Phase 2 — Auth, Users, Roles** in the AIM Platform.

The purpose is to prevent ambiguity between Supabase Auth, backend user records, Flutter Mobile state, Admin UI state, and database authorization.

Phase 2 authentication must remain backend-controlled and must not allow any client to become the authority for identity, roles, permissions, or ownership.

---

## Decision

The authentication source of truth for Phase 2 is:

```text
Supabase Auth identity + backend/database user record mapped by auth UID
```

Supabase Auth owns the external authenticated identity.

The backend/database owns the internal AIM user record, role assignments, permissions, profile ownership, and authorization decisions.

Flutter Mobile and Admin Dashboard may store and render session state, but they are not the source of truth for authorization.

---

## Identity Model

A signed-in user is recognized by a validated Supabase Auth user ID.

The backend must map that Supabase Auth user ID to an internal AIM user record.

The internal user record is the application-level identity used for:

- profile ownership;
- role assignment;
- permission checks;
- admin access;
- backend audit context;
- user status;
- future Phase 2-protected resources.

---

## Source Responsibilities

| Layer | Responsibility | Source of Truth? |
|---|---|---|
| Supabase Auth | Authenticated external identity and session token | Yes, for external auth identity |
| Backend API | Token verification, user lookup, authorization, ownership checks | Yes, for AIM authorization |
| Database | Internal user records, profile ownership, role/permission persistence | Yes, for persisted AIM identity data |
| Flutter Mobile | Login/logout UX and rendering backend-approved state | No |
| Admin Dashboard | Admin UX and rendering backend-approved state | No |
| AIM Engine | Out of scope for Phase 2 auth | No |
| Student Web App | Out of scope for Phase 2 | No |

---

## Backend Authority

The backend is the final authority for:

- verifying authenticated requests;
- resolving the current AIM user;
- deciding whether a user can access a profile;
- deciding whether a user has a role;
- deciding whether a user has a permission;
- deciding whether a user can perform an admin action;
- denying access when identity, role, permission, or ownership checks fail.

No Phase 2 endpoint may rely on Flutter Mobile or Admin Dashboard as the final authorization authority.

---

## Required UID Mapping

Each internal AIM user record must map to the authenticated Supabase Auth user ID.

The required identity relationship is:

```text
Supabase Auth user id -> AIM backend/database user record
```

The exact database schema may be defined by later Phase 2 implementation tasks, but the rule is fixed:

```text
AIM backend/database user identity must be mapped to the authenticated provider UID.
```

The UID mapping must be stable and must not be invented by the client.

---

## Client Boundary

Flutter Mobile and Admin Dashboard may:

- start login and logout flows;
- hold client-safe session state;
- send authenticated requests to the backend;
- render the current user returned by the backend;
- show or hide UI based on backend-approved roles or permissions;
- clear local auth state on logout.

Flutter Mobile and Admin Dashboard must not:

- create their own trusted user ID;
- decide final role membership;
- decide final permission membership;
- decide final ownership;
- directly write privileged role or permission data;
- store or use Supabase service-role keys;
- store or use database credentials;
- bypass backend authorization checks.

---

## Token Validation Rule

Every protected backend request must validate the authenticated request before returning protected data.

At minimum, protected backend access must validate:

1. an authenticated Supabase Auth session or token;
2. the authenticated user ID;
3. the matching internal AIM user record where required;
4. role, permission, or ownership checks where required.

If validation fails, the backend must deny access.

---

## Current User Rule

A current-user endpoint, such as `/me`, must return only backend-approved identity data.

It may return:

- internal user ID;
- auth provider user ID when safe and needed;
- email or phone when safe and required;
- profile status;
- role names or permissions approved for client rendering;
- profile summary needed for Phase 2 UX.

It must not return:

- service-role keys;
- database credentials;
- privileged backend secrets;
- internal security implementation details;
- permissions that are not meant for client rendering.

---

## Profile Ownership Rule

A normal authenticated user may access only their own profile unless a backend-approved role or permission allows broader access.

Profile access must be checked by backend/database authorization.

Client-provided profile IDs must never be trusted without backend validation.

---

## Role and Permission Rule

Roles and permissions are backend-owned.

Flutter Mobile and Admin Dashboard may render backend-approved roles and permissions for UX, but they must not become the authority.

Admin actions must require backend role or permission checks.

A malicious client changing local state must not gain access to protected data or admin behavior.

---

## Admin Access Rule

Admin access is allowed only when the backend confirms the authenticated user has the required admin role or permission.

The Admin Dashboard must not enforce admin access only by frontend route guards.

Frontend route guards are allowed as UX helpers, but backend guards are required for security.

---

## Database Authorization Rule

Database-level policies and backend service rules must align with this source-of-truth decision.

The database should not allow users to access protected user/profile/role/permission data without a valid backend-approved identity, ownership, role, or permission path.

Any service-role or privileged database access must remain server-side only.

---

## Out-of-Scope Auth Areas

This decision does not implement:

- onboarding;
- placement;
- lessons;
- practice;
- sessions;
- AIM integration;
- recommendations;
- progress reports;
- AI Teacher;
- Student Web App;
- learner React/Next.js web app.

Those areas remain outside Phase 2.

---

## Security Non-Negotiables

Phase 2 auth work must never expose:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- production secrets;
- privileged backend credentials.

Only public client-safe configuration may be used in Flutter Mobile or Admin Dashboard.

---

## Implementation Guidance for Later Tasks

Later Phase 2 implementation tasks should follow this decision when creating:

- backend auth module;
- backend current-user endpoint;
- backend guards;
- users table or equivalent user storage;
- profiles table or equivalent profile storage;
- roles table or equivalent role storage;
- permissions model;
- Flutter auth state;
- Flutter profile state;
- Admin users/roles foundation.

Any implementation that conflicts with this source-of-truth decision must stop and report a blocker.

---

## Done Criteria

This source-of-truth decision is satisfied when the project documentation clearly states:

- Supabase Auth is the external auth identity provider;
- backend/database user records are the AIM application identity source;
- authenticated provider UID maps to internal backend/database user records;
- backend authorization is final;
- Flutter Mobile and Admin Dashboard are UX clients only for auth/authorization state;
- roles, permissions, ownership, and admin access are backend-owned;
- no Phase 2 client may receive privileged secrets;
- out-of-scope learning-product features remain excluded.
