# Phase 2 — User and Role Enums

## Purpose

This document defines the shared user and role enums required by Phase 2 — Auth, Users, Roles.

The goal is to keep Backend, Flutter Mobile, and Admin Dashboard aligned on user types, role names, profile types, user status values, and permission-related naming before implementation.

This is a shared contracts documentation file. It does not implement backend code, Flutter code, admin dashboard code, database migrations, or runtime behavior.

---

## Scope

This document is limited to Phase 2 identity and authorization foundations:

- user type enum;
- user status enum;
- profile type enum;
- role key enum;
- permission scope naming;
- assignment status naming;
- shared naming rules for backend/client contracts.

This document does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

These enums must follow the Phase 2 documents:

```text
docs/phase-2/auth-users-roles-charter.md
docs/phase-2/auth-source-of-truth.md
docs/phase-2/auth-api-map.md
docs/phase-2/auth-data-model-map.md
docs/phase-2/auth-security-rules.md
```

Backend authorization remains the final authority.

Flutter Mobile and Admin Dashboard may use these enum values for typed models and UX rendering, but they must not treat local enum values as proof of authorization.

---

## Naming Rules

Enum keys must use stable lowercase snake_case values.

Examples:

```text
student
admin
super_admin
active
disabled
profiles.read.own
```

Rules:

- Do not rename enum values without a documented migration.
- Do not use display labels as persisted enum values.
- Do not trust client-submitted enum values as authorization authority.
- Backend must validate enum values before storing or using them.
- UI labels may be localized separately from enum keys.

---

## UserType

`UserType` identifies the broad user category for shared contracts and UX.

Recommended enum values:

```text
student
admin
reviewer
support
system
```

| Value | Meaning |
|---|---|
| `student` | Learner using Flutter Mobile |
| `admin` | Administrative user |
| `reviewer` | User allowed to review/inspect auth/user workflows when backend-approved |
| `support` | Support/admin-assist user when backend-approved |
| `system` | Internal system actor for audit or automation records |

Rules:

- `UserType` is not enough for authorization.
- Authorization must use backend role/permission checks.
- Flutter/Admin may render UI based on backend-approved `UserType`, but that is UX-only.

---

## UserStatus

`UserStatus` represents whether an AIM user may access protected backend resources.

Recommended enum values:

```text
active
pending
disabled
deleted
```

| Value | Meaning |
|---|---|
| `active` | User may access allowed protected resources |
| `pending` | User exists but access may be limited until setup/approval |
| `disabled` | User must not access protected resources |
| `deleted` | Soft-deleted or unavailable user record |

Rules:

- Disabled or deleted users must fail backend protected access checks.
- The backend must enforce status checks.
- Clients may display status but must not enforce final access decisions.

---

## ProfileType

`ProfileType` identifies the profile category connected to an internal AIM user.

Recommended enum values:

```text
student_profile
admin_profile
```

| Value | Meaning |
|---|---|
| `student_profile` | Student-facing profile linked to an AIM user |
| `admin_profile` | Admin-facing profile linked to an AIM user |

Rules:

- Profile type does not grant permissions.
- Profile ownership must be checked by backend logic.
- Admin profile existence does not prove admin authority.

---

## RoleKey

`RoleKey` identifies backend-owned roles.

Recommended enum values:

```text
student
admin
super_admin
reviewer
support
```

| Value | Meaning |
|---|---|
| `student` | Standard learner role |
| `admin` | Administrative role |
| `super_admin` | Highest administrative role, protected from unsafe mutation |
| `reviewer` | Review/inspection role for backend-approved workflows |
| `support` | Support role for limited admin assistance |

Rules:

- Roles are backend-owned.
- Clients must not assign roles locally.
- Role checks in Flutter/Admin UI are UX-only.
- Backend role and permission checks remain final.

---

## PermissionScope

`PermissionScope` groups permission keys by protected resource area.

Recommended scope values:

```text
profiles
users
roles
permissions
admin.users
auth.audit
```

| Value | Meaning |
|---|---|
| `profiles` | User profile access and updates |
| `users` | Internal AIM user records |
| `roles` | Role definitions and user-role assignment |
| `permissions` | Permission definitions and role-permission mapping |
| `admin.users` | Admin user management |
| `auth.audit` | Auth and security audit logs |

Rules:

- Permission scopes are organization aids only.
- The backend must enforce full permission keys.
- Clients must not infer authorization only from a scope.

---

## PermissionKey

`PermissionKey` represents specific backend-enforced actions.

Recommended permission keys:

```text
profiles.read.own
profiles.update.own
profiles.read.any
profiles.update.any
users.read
users.manage
roles.read
roles.manage
permissions.read
permissions.manage
admin.users.read
admin.users.manage
auth.audit.read
```

| Value | Meaning |
|---|---|
| `profiles.read.own` | Read own profile |
| `profiles.update.own` | Update own profile safe fields |
| `profiles.read.any` | Read profiles beyond ownership when backend-approved |
| `profiles.update.any` | Update profiles beyond ownership when backend-approved |
| `users.read` | Read user records when backend-approved |
| `users.manage` | Manage user records/status when backend-approved |
| `roles.read` | Read role data when backend-approved |
| `roles.manage` | Create/update/delete roles and assignments when backend-approved |
| `permissions.read` | Read permission data when backend-approved |
| `permissions.manage` | Manage role-permission mappings when backend-approved |
| `admin.users.read` | Read admin users list/details |
| `admin.users.manage` | Manage admin-facing user fields |
| `auth.audit.read` | Read auth audit logs when backend-approved |

Rules:

- Permission keys must be enforced by backend guards/services.
- Missing permission must deny access.
- Flutter/Admin may only render permissions returned by backend.
- Client-side permission checks must remain UX-only.

---

## UserRoleAssignmentStatus

`UserRoleAssignmentStatus` represents the status of a user-role assignment if assignment status is needed.

Recommended enum values:

```text
active
revoked
```

| Value | Meaning |
|---|---|
| `active` | Role assignment is currently valid |
| `revoked` | Role assignment is no longer active |

Rules:

- Revoked assignments must not grant access.
- The backend must decide whether assignment status is needed in implementation.
- Role assignment changes should be auditable.

---

## AuthAuditEventType

`AuthAuditEventType` identifies important auth/security events.

Recommended enum values:

```text
auth.user_synced
auth.me_requested
auth.login_seen
auth.logout_seen
auth.access_denied
profile.read_denied
profile.update_denied
roles.assigned
roles.removed
permissions.changed
admin.user_status_changed
```

| Value | Meaning |
|---|---|
| `auth.user_synced` | Auth identity was synced to internal AIM user |
| `auth.me_requested` | Current-user endpoint was requested |
| `auth.login_seen` | Login/session activity was observed |
| `auth.logout_seen` | Logout/session cleanup activity was observed |
| `auth.access_denied` | Backend denied protected access |
| `profile.read_denied` | Profile read was denied |
| `profile.update_denied` | Profile update was denied |
| `roles.assigned` | Role was assigned to a user |
| `roles.removed` | Role was removed from a user |
| `permissions.changed` | Role-permission mapping changed |
| `admin.user_status_changed` | Admin changed user status |

Rules:

- Audit events must not store secrets.
- Audit events must not store raw access tokens or refresh tokens.
- Audit metadata must be minimized and safe.

---

## Backend Contract Rules

Backend may use these enum values for:

- DTO validation;
- database persisted values;
- API response contracts;
- guard/permission checks;
- audit event names.

Backend must not:

- trust enum values from clients without validation;
- grant access based only on client-provided role/permission values;
- expose internal-only enum values unless explicitly safe.

---

## Flutter Mobile Contract Rules

Flutter Mobile may use these enum values for:

- typed auth/current-user models;
- profile UI logic;
- safe display labels;
- conditional UX rendering from backend-approved state.

Flutter Mobile must not:

- become the role source of truth;
- become the permission source of truth;
- calculate final authorization;
- bypass backend ownership checks;
- store service-role keys or privileged credentials.

---

## Admin Dashboard Contract Rules

Admin Dashboard may use these enum values for:

- typed admin user models;
- roles and permissions UI;
- safe labels and filters;
- backend-approved admin UX rendering.

Admin Dashboard must not:

- directly mutate privileged records without backend checks;
- rely on frontend route guards as security;
- become the final authorization authority;
- expose internal-only data to unauthorized users.

---

## Done Test Review

This document satisfies P2-007 when:

- `packages/shared-contracts/enums/user-role-enums.md` exists;
- it defines shared user and role enums required by Phase 2;
- it includes user types, user statuses, profile types, role keys, permission keys, assignment status, and audit event names;
- it keeps backend, Flutter, and Admin Dashboard aligned on names;
- it keeps backend authorization as final authority;
- it treats Flutter/Admin UI role behavior as UX only;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
