# Phase 2 — Permission Matrix

## Purpose

This document defines the role and permission matrix for Phase 2 — Auth, Users, Roles.

It makes the exact permission set for each Phase 2 role explicit before backend guards, role services, and admin dashboard role UIs are implemented.

All Phase 2 tasks that implement role or permission enforcement, admin role management, or client role display must reference this document.

---

## Dependencies

| Dependency | Document |
|---|---|
| P2-007 | `packages/shared-contracts/enums/user-role-enums.md` |
| P2-010 | `packages/shared-contracts/api/role-permission-contracts.md` |

---

## RBAC Principles

- Roles are backend-owned. Clients do not assign or validate roles.
- Permissions are backend-owned and backend-enforced. Missing permission denies access.
- Ownership checks are independent of role checks. Backend must verify both.
- System roles (`super_admin`) are protected from unsafe mutation or deletion.
- Flutter Mobile and Admin Dashboard render backend-approved role/permission state for UX only.
- Backend remains the final authority for all authorization decisions.

---

## Roles

| Role Key | Display Name | Type | Description |
|---|---|---|---|
| `student` | Student | system | Standard authenticated learner. Access limited to own profile and own data. |
| `admin` | Admin | system | Platform administrator. User management, role assignment, admin dashboard access. |
| `super_admin` | Super Admin | system | Highest administrative authority. Full access including role/permission management and audit log access. Protected system role. |
| `reviewer` | Reviewer | system | Content or quality reviewer. Backend-approved read-only access to user profiles and user data. |
| `support` | Support | system | Support agent. Backend-approved read access to user records and admin user list for issue resolution. |

System roles must not be deleted or renamed without a documented backend migration and conflict review.

---

## Permissions

| Permission Key | Scope | Description |
|---|---|---|
| `profiles.read.own` | `profiles` | Read own student or admin profile. |
| `profiles.update.own` | `profiles` | Update own student or admin profile safe fields. |
| `profiles.read.any` | `profiles` | Read any user profile. Backend-approved access only. |
| `profiles.update.any` | `profiles` | Update any user profile. Backend-approved access only. Restricted to `super_admin`. |
| `users.read` | `users` | Read internal AIM user records. Backend-approved access only. |
| `users.manage` | `users` | Manage internal AIM user records including status changes. |
| `roles.read` | `roles` | Read role definitions. |
| `roles.manage` | `roles` | Create, update, or delete roles and role-permission mappings. Restricted to `super_admin`. |
| `permissions.read` | `permissions` | Read permission definitions. |
| `permissions.manage` | `permissions` | Manage role-permission mappings. Restricted to `super_admin`. |
| `admin.users.read` | `admin.users` | Admin — read user list and user detail in admin dashboard. |
| `admin.users.manage` | `admin.users` | Admin — manage users including role assignment and status changes. |
| `auth.audit.read` | `auth.audit` | Read auth audit log. Restricted to `super_admin`. |

---

## Permission Matrix

`✓` — permission granted for role.
`—` — permission not granted; backend denies access.

| Permission Key | `student` | `admin` | `super_admin` | `reviewer` | `support` |
|---|:---:|:---:|:---:|:---:|:---:|
| `profiles.read.own` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `profiles.update.own` | ✓ | ✓ | ✓ | — | — |
| `profiles.read.any` | — | ✓ | ✓ | ✓ | ✓ |
| `profiles.update.any` | — | — | ✓ | — | — |
| `users.read` | — | ✓ | ✓ | ✓ | ✓ |
| `users.manage` | — | ✓ | ✓ | — | — |
| `roles.read` | — | ✓ | ✓ | — | — |
| `roles.manage` | — | — | ✓ | — | — |
| `permissions.read` | — | ✓ | ✓ | — | — |
| `permissions.manage` | — | — | ✓ | — | — |
| `admin.users.read` | — | ✓ | ✓ | — | ✓ |
| `admin.users.manage` | — | ✓ | ✓ | — | — |
| `auth.audit.read` | — | — | ✓ | — | — |

---

## Role Summaries

### student

Access is restricted to the authenticated user's own data.

Granted:
- `profiles.read.own`
- `profiles.update.own`

Cannot: read other users, manage users, access admin dashboard, view audit logs, assign roles.

---

### admin

Full user and admin management within the platform. Cannot modify the permission system or read audit logs.

Granted:
- `profiles.read.own`
- `profiles.update.own`
- `profiles.read.any`
- `users.read`
- `users.manage`
- `roles.read`
- `permissions.read`
- `admin.users.read`
- `admin.users.manage`

Cannot: update profiles they do not own beyond backend-approved admin workflows, manage roles/permissions system, read auth audit logs.

---

### super_admin

Full access to all Phase 2 resources. Protected system role.

Granted: all 13 permissions.

Mutation of the `super_admin` role definition itself requires backend protection from unsafe changes (system role flag enforced).

---

### reviewer

Backend-approved read-only access to user profiles and records.

Granted:
- `profiles.read.own`
- `profiles.read.any`
- `users.read`

Cannot: update profiles, manage users, access admin dashboard, assign roles, read audit logs.

---

### support

Backend-approved read access for issue resolution. Includes admin user list access but not user management.

Granted:
- `profiles.read.own`
- `profiles.read.any`
- `users.read`
- `admin.users.read`

Cannot: update profiles, manage users, assign roles, manage admin users, read audit logs.

---

## Multi-Role Behavior

A user may hold more than one role simultaneously.

The effective permission set is the union of all permissions granted by all active role assignments.

Example: a user with both `student` and `reviewer` roles holds the union of student and reviewer permissions.

Backend must evaluate all active role assignments when resolving effective permissions for a request.

---

## Authorization Resolution

For each protected request, the backend must:

```text
1. Validate the Supabase Auth JWT.
2. Resolve the internal AIM user by supabase_auth_uid.
3. Reject if user not found or user.status != 'active'.
4. Load all active user_roles → roles → role_permissions → permissions for that user.
5. Compute the effective permission set (union).
6. Check required permission(s) for the requested operation.
7. If ownership check is required, verify user.id matches the resource owner.
8. Deny if any required check fails.
9. Log a safe auth audit event.
```

Client-side role or permission checks are UX helpers only. They are not security authority.

---

## Ownership Checks

Ownership checks are separate from permission checks and must both pass for profile and user data access.

| Resource | Ownership Rule |
|---|---|
| student_profiles | `student_profiles.user_id = authenticated_user.internal_id` |
| admin_profiles | `admin_profiles.user_id = authenticated_user.internal_id` |
| users | `users.id = authenticated_user.internal_id` (for own-user reads) |

Exceptions:
- `profiles.read.any` and `admin.users.read` relax ownership for backend-approved admin roles.
- Backend must still validate the caller holds the required permission before bypassing ownership.

---

## Protected Operations

| Operation | Required Permission | Ownership Required |
|---|---|---|
| Read own student profile | `profiles.read.own` | yes |
| Update own student profile | `profiles.update.own` | yes |
| Read own admin profile | `profiles.read.own` | yes |
| Update own admin profile | `profiles.update.own` | yes |
| Read any profile (admin) | `profiles.read.any` | no |
| Update any profile (super_admin only) | `profiles.update.any` | no |
| Read own user record | `users.read` | yes |
| Read any user record (admin) | `users.read` | no |
| Change user status | `users.manage` | no |
| Read role list | `roles.read` | no |
| Assign/revoke role | `admin.users.manage` | no |
| Manage role definitions | `roles.manage` | no |
| Read permission list | `permissions.read` | no |
| Manage permission mappings | `permissions.manage` | no |
| Read admin user list | `admin.users.read` | no |
| Read admin user detail | `admin.users.read` | no |
| Admin user management actions | `admin.users.manage` | no |
| Read auth audit log | `auth.audit.read` | no |

---

## System Role Protection Rules

`super_admin` role:

- Cannot be deleted.
- Cannot have its key renamed.
- Its permission set cannot be reduced to below full access without a documented architecture decision and conflict review against this document.

`admin` and `super_admin` role assignments:

- Must only be made by a caller with `admin.users.manage` permission.
- Self-grant is not permitted.
- Assignments are auditable via `auth_audit_logs`.

---

## Out of Scope

This matrix does not define permissions for:

- onboarding flows;
- placement tests;
- lessons, practice, or sessions;
- AIM Engine or AI Teacher access;
- dashboard analytics or reporting;
- Student Web App.

Those areas belong to Phase 3+.

---

## Conflict Rules

If a later Phase 2 implementation task proposes:

- granting `auth.audit.read` to any role other than `super_admin`;
- granting `roles.manage` or `permissions.manage` to `admin`;
- granting `profiles.update.any` to `admin`;
- removing ownership checks from any `*.own` permission;
- allowing clients to compute final authorization;

it must stop and report a conflict against this document before proceeding.

---

## Done Criteria

This document satisfies P2-035 when:

- all five Phase 2 roles are defined with descriptions and types;
- all 13 permission keys are listed with scope and description;
- the permission matrix covers all role × permission combinations;
- role summaries state what each role can and cannot do;
- multi-role union behavior is documented;
- authorization resolution flow references this matrix;
- ownership check rules are stated separately from permission checks;
- protected operations are listed with required permissions;
- system role protection rules are stated;
- out-of-scope areas are excluded;
- no secrets, credentials, or privileged configuration are present.
