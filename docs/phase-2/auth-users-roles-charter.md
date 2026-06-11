# Phase 2 — Auth, Users, Roles Charter

## Purpose

This charter defines the official scope boundary for **Phase 2 — Auth, Users, Roles** in the AIM Platform.

Phase 2 exists to establish the identity, authentication, user, profile, role, permission, ownership, backend guard, Flutter auth/profile, admin users/roles, and security foundations required before later learning-product work begins.

This document is intentionally restrictive. It prevents onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App work from entering Phase 2.

---

## Phase Identity

| Item | Decision |
|---|---|
| Phase | Phase 2 |
| Phase name | Auth, Users, Roles |
| Primary purpose | Establish backend-owned identity, authorization, ownership, and role foundations |
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| Auth provider | Supabase Auth unless changed by a documented architecture decision |
| Backend authority | Backend API and database authorization rules |
| Admin scope | Users and roles foundation only |
| AIM Engine scope | Out of scope except preserving security and boundary rules |
| Student Web App scope | Out of scope |

---

## In Scope

Phase 2 may include only the following areas.

### Authentication

- Supabase Auth integration planning and implementation.
- Backend verification of authenticated user identity.
- Authenticated session validation.
- Backend `/me` or equivalent identity endpoints.
- Login/logout flow support for Flutter Mobile.
- Auth error handling that does not leak secrets or privileged implementation details.

### Users

- Internal backend user records mapped to Supabase Auth user IDs.
- User identity lifecycle needed for authentication and authorization.
- User lookup, current-user retrieval, and admin-safe user listing foundations.
- User fields required for identity, status, and role assignment.

### Profiles

- Backend-owned user profile records.
- Profile ownership checks.
- Flutter profile loading and display using backend-approved data only.
- Profile update flows only where ownership and backend validation are enforced.

### Roles

- Backend-owned role model.
- Role assignment foundation.
- Role lookup and role-safe admin foundations.
- Role checks enforced by backend guards or equivalent backend authorization mechanisms.

### Permissions

- Backend-owned permission model or permission map.
- Permission checks enforced server-side.
- Permission documentation for auth, profile, user, and admin-user operations.
- Client-side permission rendering as UX only.

### Ownership

- Student/user ownership rules for profile and user-owned resources.
- Backend ownership guards.
- Tests or review notes confirming users cannot access profiles or records they do not own.

### Backend Guards

- Auth guards.
- Role guards.
- Permission guards.
- Ownership guards.
- Guard documentation and task-specific implementation required for Phase 2 endpoints.

### Flutter Auth/Profile Flow

- Flutter login, logout, auth state, current-user state, and profile state.
- Riverpod/StateNotifier-style state management where applicable.
- Flutter rendering based only on backend-approved identity/profile/role data.
- No client-side authorization authority.

### Admin Users/Roles Foundation

- Admin foundation for users and roles only.
- Admin user listing or role-management groundwork only when backed by backend authorization.
- No broader dashboard recommendation, learning analytics, onboarding, lesson, or placement administration.

### Security Review

- Auth security review.
- Role/permission security review.
- Ownership review.
- Secret exposure review.
- Client authorization boundary review.

---

## Explicitly Out of Scope

Phase 2 must not include any of the following work.

| Area | Phase 2 Decision |
|---|---|
| Onboarding | Out of scope |
| Placement tests | Out of scope |
| Lessons | Out of scope |
| Practice | Out of scope |
| Sessions | Out of scope |
| AIM integration | Out of scope |
| AIM mastery calculation | Out of scope |
| Difficulty adaptation | Out of scope |
| Weakness detection | Out of scope |
| Recommendation generation | Out of scope |
| Retention/review scheduling | Out of scope |
| Dashboard recommendations | Out of scope |
| Progress reports | Out of scope |
| AI Teacher | Out of scope |
| Student Web App | Out of scope |
| React/Next.js learner client | Out of scope |

If any Phase 2 task appears to require one of these areas, the task must stop and be reported as blocked or deferred.

---

## Non-Negotiable Architecture Rules

### Backend Is the Final Authority

The backend is the final authority for:

- authentication;
- user identity;
- role checks;
- permission checks;
- ownership checks;
- admin access;
- profile access;
- protected user data access.

Flutter Mobile and Admin Dashboard may display backend-approved state, but they must not become the security authority.

### Clients Are UX Only for Authorization

Client-side role or permission checks are allowed only for user experience, such as hiding or showing buttons.

Client-side checks must never be relied on to protect data or execute privileged actions.

Every protected operation must be enforced by backend authorization.

### Supabase Service Role and Secrets Must Stay Server-Side

Phase 2 must not expose any of the following to Flutter Mobile, Admin Dashboard, public repository files, or other clients:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- privileged backend credentials;
- production-only secrets;
- private infrastructure credentials.

Only public client-safe configuration may be used in Flutter/Admin clients.

### No AIM Logic in Clients

Phase 2 must not move AIM Engine or learning intelligence logic into Flutter Mobile, Admin Dashboard, or any client.

Clients must not calculate:

- mastery;
- student level;
- weakness;
- difficulty;
- retention;
- recommendations;
- learning progress conclusions.

These areas are outside Phase 2 and remain backend/AIM-engine concerns for later phases.

### No Speed-As-Mastery

Phase 2 must preserve the existing foundation rule that speed, response time, average response time, or speed score must not be used as a direct mastery, level, or difficulty-increase signal.

### Educational, Non-Clinical Language

Any learner-facing text introduced during Phase 2 must remain educational, non-clinical, non-medical, and non-diagnostic.

---

## Required Backend Boundaries

Every protected backend endpoint created or changed in Phase 2 must define which checks apply.

| Endpoint type | Required backend authority |
|---|---|
| Current user identity | Auth/session validation |
| User profile read | Auth + ownership or admin permission |
| User profile update | Auth + ownership or admin permission |
| User listing | Auth + admin role/permission |
| Role listing | Auth + admin role/permission unless explicitly public-safe |
| Role assignment | Auth + admin role/permission |
| Permission-protected action | Auth + permission check |
| Ownership-protected action | Auth + ownership check |

A task must not rely on Flutter/Admin UI checks as the only protection.

---

## Required Flutter Boundaries

Flutter Mobile work in Phase 2 is limited to authentication and profile flow.

Flutter may:

- start login/logout flows;
- store client-safe session state through approved libraries;
- request current user data from the backend;
- render profile data returned by the backend;
- show or hide UI based on backend-approved roles/permissions;
- handle auth/profile errors safely.

Flutter must not:

- decide final access rights;
- bypass backend authorization;
- write protected role or permission data directly;
- calculate learning intelligence;
- call AIM Engine directly;
- contain service-role keys or privileged credentials.

---

## Required Admin Boundaries

Admin work in Phase 2 is limited to users and roles foundation.

Admin UI may:

- render backend-approved user lists;
- render backend-approved role data;
- call backend admin endpoints;
- show or hide controls based on backend-approved permissions.

Admin UI must not:

- perform privileged user or role actions without backend authorization;
- become the source of truth for roles or permissions;
- include onboarding, placement, lessons, AIM integration, recommendations, or learning analytics;
- expose service-role keys or backend secrets.

---

## Dependency and Foundation Reference

Phase 2 starts from the Phase 1 foundation handoff.

Dependency:

```text
P1-068 — Final Phase 1 Lock and Handoff
```

Expected dependency output:

```text
docs/phase-1/final-foundation-review.md
```

Phase 2 must preserve the Phase 1 foundation confirmations, including:

- no Student Web App creation;
- no client-side AIM logic;
- no speed-as-mastery;
- no secrets committed;
- AIM Engine remains backend-only;
- backend owns authorization.

---

## Task Execution Rules for This Phase

Every Phase 2 task must:

1. stay within Auth, Users, Roles scope;
2. check dependencies before claiming or implementing;
3. use the exact task branch from Notion;
4. edit only files required for the task;
5. preserve backend authority for auth, roles, permissions, and ownership;
6. avoid out-of-scope learning-product work;
7. avoid exposing secrets or privileged credentials;
8. document checks or limitations before completion;
9. commit and push before marking the Notion task Done.

A task is not complete until it is implemented, checked or review-documented, committed, pushed, documented in Notion, and marked Done.

---

## Stop Conditions

Stop immediately and report a blocker if any task requires:

- onboarding work;
- placement work;
- lesson/practice/session work;
- AIM integration work;
- dashboard recommendation work;
- progress report work;
- AI Teacher work;
- Student Web App work;
- client-side authorization as final authority;
- Flutter-side mastery, level, weakness, difficulty, retention, or recommendation calculation;
- exposing secrets or privileged credentials;
- changing Phase 0 or Phase 1 decisions without documenting a conflict.

---

## Done Criteria for Phase 2 Scope Compliance

A Phase 2 task is scope-compliant only when:

- the work is limited to authentication, users, profiles, roles, permissions, ownership, backend guards, Flutter auth/profile flow, admin users/roles foundation, or security review;
- backend authorization remains final;
- Flutter/Admin behavior remains UX-only for authorization;
- no out-of-scope learning-product feature is introduced;
- no AIM logic is moved into a client;
- no protected credential is exposed;
- any conflict or blocker is documented instead of guessed.

---

## Review Notes

This charter is a documentation-only output for P2-001.

No runtime backend, Flutter, admin dashboard, database, or infrastructure files are changed by this task.

Checks for this task are documentation review checks:

- expected output path is `docs/phase-2/auth-users-roles-charter.md`;
- content is limited to Phase 2 Auth, Users, Roles scope;
- out-of-scope areas are explicitly blocked;
- backend authority over auth, roles, permissions, and ownership is explicitly preserved;
- Flutter/Admin authorization behavior is defined as UX-only;
- no secrets or privileged credentials are included.
