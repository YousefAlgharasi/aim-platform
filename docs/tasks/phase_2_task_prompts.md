# AIM Phase 2 Task Prompts

## Purpose

This file contains the execution prompts for **Phase 2 — Auth, Users, Roles**.

Each Notion task in the Phase 2 Tasks database points to one section in this file using:

```text
Use docs/tasks/phase_2_task_prompts.md #P2-XXX
```

Phase 2 is intentionally limited to authentication, users, profiles, roles, permissions, ownership, Flutter auth/profile flow, admin users/roles foundation, and security review.

It must not become onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App work.

---

## Active Phase 2 Direction

| Area | Decision |
|---|---|
| Phase name | Auth, Users, Roles |
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| Auth provider | Supabase Auth unless changed by documented decision |
| Backend user source | Internal backend/database users table mapped to Supabase Auth UID |
| Roles and permissions | Backend-owned RBAC foundation |
| Admin scope | Users and roles foundation only |
| AIM Engine | Out of scope for Phase 2 except preserving boundaries |
| Student Web App | Deferred / Optional / Phase 7 or later |

---

## Global Non-Negotiables

Every Phase 2 task must preserve these rules:

- Do not create Student Web App work.
- Do not create React/Next.js learner web app work.
- Do not treat React Web as the Phase 2 learner client.
- Do not treat FastAPI as the Phase 2 Backend API.
- Do not implement onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, or AI Teacher features in Phase 2.
- Do not move AIM Engine logic into Flutter Mobile or any client.
- Do not calculate mastery, student level, weakness, difficulty, retention, or recommendations in any client.
- Do not expose AI provider keys, Supabase service-role keys, database credentials, or privileged backend credentials to any client.
- Do not use speed, response time, average response time, or speed score as a direct mastery, level, or difficulty-increase signal.
- Backend authorization, role checks, permission checks, and ownership checks are final.
- Flutter/Admin UI role checks are UX only and must not be treated as security authority.
- Learner-facing language must remain educational, non-clinical, non-medical, and non-diagnostic.

---

## Required Identity Input

Every agent run must include:

```text
TEAM_MEMBER_NOTION_EMAIL=<member-email>
```

The agent must use this email to find the matching Notion user and assign the selected task before starting work.

If `TEAM_MEMBER_NOTION_EMAIL` is missing or cannot be resolved to a Notion user, stop and do not edit the repository.

---

## Agent Master Instruction for Picking Tasks from Notion

You are an AI coding/documentation agent working on the AIM repository.

Repository:

```text
https://github.com/YousefAlgharasi/aim-platform
```

Notion Phase 2 Tasks database:

```text
https://app.notion.com/p/cde1d6741b4a4e148bbffdde178cdd55
```

Detailed prompt file:

```text
docs/tasks/phase_2_task_prompts.md
```

Open the prompt file and follow this instruction exactly.

### Workflow

1. Open the Notion Phase 2 Tasks database.
2. Find a task with:

```text
Status = Undone
Assigned = empty
```

3. Do not take a task if:

```text
Status = In Progress
Status = Done
Assigned is not empty
```

4. Before claiming the task, check its `Dependency` field.
5. A dependency is complete only if:
   - The dependency task `Status` is `Done` in Notion.
   - The dependency has no unresolved blocker comment.
   - The dependency expected output file(s), from `docs/tasks/phase_2_task_prompts.md`, exist in the GitHub repository on the target/default branch.
   - The dependency output has already been pushed to GitHub.
6. If any dependency is missing, not Done, blocked, or not pushed to GitHub, skip the task and choose another available task.
7. Before claiming, re-check the task one more time:

```text
Status = Undone
Assigned = empty
Dependencies = complete
```

8. Claim the task:

```text
Assigned = Me / TEAM_MEMBER_NOTION_EMAIL
Status = In Progress
```

9. Re-open the Notion task and confirm:

```text
Assigned = current user
Status = In Progress
```

10. Create or switch to the task branch from Notion:

```bash
git checkout main
git pull origin main
git checkout -b <Branch>
git status --short
```

If the branch already exists locally or remotely, use it carefully and pull/rebase from the latest main as appropriate.

11. If `git status --short` shows unrelated local changes, stop and report the blocker.
12. Open:

```text
docs/tasks/phase_2_task_prompts.md
```

13. Find the exact task section by ID, for example:

```text
#P2-001
#P2-021
#P2-045
```

14. Execute only that task.
15. Do not perform unrelated work.
16. Do not add extra tasks.
17. Do not change unrelated files.
18. Do not implement another task in the same commit.

---

## Git and Completion Rules

Every completed task must be committed and pushed separately.

Use this format:

```bash
git status --short
git add <changed-files>
git commit -m "P2-XXX: <short task title>"
git push origin <Branch>
```

Do not mark the Notion task as `Done` until `git push` succeeds.

After a successful push:

1. Re-open the Notion task.
2. Confirm the task is still assigned to you.
3. Confirm the task is still `In Progress`.
4. Add a Notion completion comment with:
   - files created/updated,
   - branch name,
   - commit hash if available,
   - checks/tests run,
   - any limitations.
5. Set `Status = Done`.
6. Keep `Assigned` filled with the current user.

If blocked:

1. Keep the task assigned to the current user.
2. Keep `Status = In Progress`.
3. Add a blocker comment explaining:
   - what blocked the task,
   - which dependency or file is missing,
   - what command failed,
   - what must happen next.

Do not mark blocked work as `Done`.

---

## Required Final Response

At the end of every task, the agent must report:

```text
Task: P2-XXX — <title>
Status: Done / Blocked
Branch: <branch>
Files changed:
- <file>
Commit: <hash or unavailable>
Push: succeeded / failed
Checks:
- <check result>
Notion:
- Assigned to <user/email>
- Status set to Done / In Progress
Notes:
- <important limitation or none>
```

---

# Phase 2 Task Prompts

## #P2-001 — Create Phase 2 Auth, Users, Roles Charter

Branch:

```text
phase2/P2-001-auth-users-roles-charter
```

Task:

Create the official Phase 2 charter that limits this phase to authentication, users, profiles, roles, permissions, ownership, and related security foundations.

Goal:

Prevent onboarding, placement, lessons, AIM integration, dashboard, AI Teacher, or Student Web App work from entering Phase 2.

Dependencies:

```text
P1-068
```

Output:

```text
docs/phase-2/auth-users-roles-charter.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-002 — Create Phase 2 Task Execution Rules

Branch:

```text
phase2/P2-002-phase-2-task-rules
```

Task:

Create execution rules for Phase 2 task claiming, branch usage, dependency validation, commit, push, and Notion completion.

Goal:

Make Phase 2 execution consistent with Phase 0 and Phase 1.

Dependencies:

```text
P2-001
```

Output:

```text
docs/phase-2/task-execution-rules.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-003 — Define Auth Source of Truth

Branch:

```text
phase2/P2-003-auth-source-of-truth
```

Task:

Document the source of truth for authentication, users, roles, profiles, and authorization decisions.

Goal:

Prevent conflicts between Supabase Auth, backend users table, roles, and client-side assumptions.

Dependencies:

```text
P2-001
```

Output:

```text
docs/phase-2/auth-source-of-truth.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-004 — Create Auth API Map

Branch:

```text
phase2/P2-004-auth-api-map
```

Task:

Define the required Phase 2 API endpoints for auth, users, profiles, roles, permissions, and admin user management.

Goal:

Avoid random or duplicated endpoint design during implementation.

Dependencies:

```text
P2-003
```

Output:

```text
docs/phase-2/auth-api-map.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-005 — Create Auth Data Model Map

Branch:

```text
phase2/P2-005-auth-data-model-map
```

Task:

Define the data model for users, student profiles, admin profiles, roles, permissions, user roles, and auth audit logs.

Goal:

Make the Supabase UID to internal user/profile/role relationship explicit before implementation.

Dependencies:

```text
P2-003
```

Output:

```text
docs/phase-2/auth-data-model-map.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-006 — Create Auth Security Rules

Branch:

```text
phase2/P2-006-auth-security-rules
```

Task:

Document security rules for JWT validation, role checks, ownership checks, session handling, logging, and safe field exposure.

Goal:

Prevent permission leakage, unsafe profile access, and client-side trust mistakes.

Dependencies:

```text
P2-003
```

Output:

```text
docs/phase-2/auth-security-rules.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-007 — Update User and Role Enums

Branch:

```text
phase2/P2-007-user-role-enums
```

Task:

Define or update the shared user and role enums required by Phase 2.

Goal:

Keep backend, Flutter, and admin dashboard aligned on role names and user types.

Dependencies:

```text
P1-014
```

Output:

```text
packages/shared-contracts/enums/user-role-enums.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-008 — Define Auth Contracts

Branch:

```text
phase2/P2-008-auth-contracts
```

Task:

Define request and response contracts for current user, session validation, and auth-related backend responses.

Goal:

Unify auth communication between Flutter, admin dashboard, and backend API.

Dependencies:

```text
P2-004
```

Output:

```text
packages/shared-contracts/api/auth-contracts.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-009 — Define User and Profile Contracts

Branch:

```text
phase2/P2-009-user-profile-contracts
```

Task:

Define contracts for User, StudentProfile, AdminProfile, and safe profile update payloads.

Goal:

Separate account identity from student/admin profile data.

Dependencies:

```text
P2-005
```

Output:

```text
packages/shared-contracts/api/user-profile-contracts.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-010 — Define Role and Permission Contracts

Branch:

```text
phase2/P2-010-role-permission-contracts
```

Task:

Define contracts for roles, permissions, role assignment, and role change responses.

Goal:

Prepare a consistent RBAC foundation for backend and admin dashboard.

Dependencies:

```text
P2-007
```

Output:

```text
packages/shared-contracts/api/role-permission-contracts.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-011 — Define Safe Auth Fields

Branch:

```text
phase2/P2-011-safe-auth-fields
```

Task:

Define which user/auth/profile fields can be returned to Flutter and admin dashboard, and which fields must remain internal.

Goal:

Prevent sensitive auth, role, and internal metadata from leaking to clients.

Dependencies:

```text
P1-015
```

Output:

```text
docs/phase-2/safe-auth-fields.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-012 — Define Auth Error Codes

Branch:

```text
phase2/P2-012-auth-error-codes
```

Task:

Add or document auth, users, roles, permissions, and ownership error codes.

Goal:

Keep error handling consistent across backend, Flutter, and admin dashboard.

Dependencies:

```text
P1-013
```

Output:

```text
Update packages/shared-contracts/api/errors.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-013 — Create Users Table Migration

Branch:

```text
phase2/P2-013-users-table-migration
```

Task:

Create the database migration for the internal users table linked to Supabase Auth UID.

Goal:

Ensure every authenticated account has an internal user record.

Dependencies:

```text
P2-005
```

Output:

```text
Database migration for users table
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-014 — Create Student Profiles Table Migration

Branch:

```text
phase2/P2-014-student-profiles-migration
```

Task:

Create the database migration for student_profiles.

Goal:

Separate student learning profile data from account identity data.

Dependencies:

```text
P2-013
```

Output:

```text
Database migration for student_profiles table
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-015 — Create Admin Profiles Table Migration

Branch:

```text
phase2/P2-015-admin-profiles-migration
```

Task:

Create the database migration for admin_profiles.

Goal:

Support admin dashboard identity and profile data without mixing it with student profiles.

Dependencies:

```text
P2-013
```

Output:

```text
Database migration for admin_profiles table
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-016 — Create Roles and Permissions Migrations

Branch:

```text
phase2/P2-016-roles-permissions-migration
```

Task:

Create database migrations for roles and permissions tables.

Goal:

Build the database foundation for role-based access control.

Dependencies:

```text
P2-010
```

Output:

```text
Database migrations for roles and permissions tables
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-017 — Create User Roles Migration

Branch:

```text
phase2/P2-017-user-roles-migration
```

Task:

Create database migration for user_roles relationship table.

Goal:

Allow assigning one or more roles to internal users.

Dependencies:

```text
P2-016
```

Output:

```text
Database migration for user_roles table
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-018 — Create Auth Audit Log Migration

Branch:

```text
phase2/P2-018-auth-audit-log-migration
```

Task:

Create auth audit log storage for sensitive auth and role events.

Goal:

Support security traceability for login/profile/role changes.

Dependencies:

```text
P2-016
```

Output:

```text
Database migration for auth_audit_logs table
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-019 — Add Role Seed Data

Branch:

```text
phase2/P2-019-role-seed-data
```

Task:

Create seed data for the system's initial roles and permissions.

Goal:

Start the system with stable, predefined roles.

Dependencies:

```text
P2-016
```

Output:

```text
Role and permission seed data
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-020 — Create Auth RLS Plan

Branch:

```text
phase2/P2-020-auth-rls-plan
```

Task:

Document or create initial RLS/security policy planning for users, profiles, roles, and audit logs.

Goal:

Prevent unauthorized access to auth-related data.

Dependencies:

```text
P2-013, P2-014, P2-015, P2-016, P2-017, P2-018
```

Output:

```text
docs/phase-2/auth-rls-plan.md or RLS migration if strategy requires it
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-021 — Configure Supabase Auth in Backend

Branch:

```text
phase2/P2-021-supabase-auth-config
```

Task:

Configure backend Supabase Auth integration for JWT validation.

Goal:

Allow the backend to safely verify Supabase-authenticated requests.

Dependencies:

```text
P1-017, P1-021
```

Output:

```text
Backend Supabase auth configuration
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-022 — Implement JWT Auth Guard

Branch:

```text
phase2/P2-022-jwt-auth-guard
```

Task:

Implement backend JWT auth guard for protected routes.

Goal:

Block unauthenticated access to protected backend endpoints.

Dependencies:

```text
P2-021
```

Output:

```text
Backend JWT auth guard
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-023 — Create Current User Decorator

Branch:

```text
phase2/P2-023-current-user-decorator
```

Task:

Create a backend decorator/helper to access the currently authenticated user in controllers/services.

Goal:

Make authorization and ownership checks easier and consistent.

Dependencies:

```text
P2-022
```

Output:

```text
Backend current user decorator/helper
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-024 — Implement Auth Me Endpoint

Branch:

```text
phase2/P2-024-auth-me-endpoint
```

Task:

Implement /auth/me endpoint returning the current user safely.

Goal:

Allow Flutter and admin dashboard to read the current authenticated user from backend.

Dependencies:

```text
P2-023, P2-011
```

Output:

```text
/auth/me backend endpoint
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-025 — Implement Auth Profile Bootstrap

Branch:

```text
phase2/P2-025-auth-profile-bootstrap
```

Task:

Create backend logic to ensure internal User/Profile records exist after first login.

Goal:

Guarantee every authenticated account maps to an internal user/profile record.

Dependencies:

```text
P2-013, P2-014, P2-015
```

Output:

```text
Backend profile bootstrap service/endpoint
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-026 — Implement User Session Validation

Branch:

```text
phase2/P2-026-user-session-validation
```

Task:

Implement backend logic for validating that the current user session is still valid and mapped to an internal user.

Goal:

Support secure Flutter and admin auth-state checks through the backend.

Dependencies:

```text
P2-024
```

Output:

```text
Backend session validation logic
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-027 — Add Auth Logging

Branch:

```text
phase2/P2-027-auth-logging
```

Task:

Add safe backend logging for auth-related events without logging secrets or sensitive tokens.

Goal:

Create an audit trail for sensitive authentication activity.

Dependencies:

```text
P2-018, P2-024
```

Output:

```text
Backend auth logging service
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-028 — Add Backend Auth Tests

Branch:

```text
phase2/P2-028-auth-backend-tests
```

Task:

Add backend tests for JWT guard, current user handling, /auth/me, profile bootstrap, and session validation.

Goal:

Verify that the backend auth foundation works safely and consistently.

Dependencies:

```text
P2-022, P2-023, P2-024, P2-025, P2-026, P2-027
```

Output:

```text
Backend auth test suite
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-029 — Implement Users Service

Branch:

```text
phase2/P2-029-users-service
```

Task:

Implement backend service logic for creating, reading, and managing internal users.

Goal:

Centralize user persistence and prevent duplicated user access logic.

Dependencies:

```text
P2-013
```

Output:

```text
Backend users service
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-030 — Implement Student Profile Service

Branch:

```text
phase2/P2-030-student-profile-service
```

Task:

Implement backend service logic for creating and reading student profiles.

Goal:

Treat StudentProfile as a separate domain object from the user account.

Dependencies:

```text
P2-014
```

Output:

```text
Backend student profile service
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-031 — Implement Admin Profile Service

Branch:

```text
phase2/P2-031-admin-profile-service
```

Task:

Implement backend service logic for creating and reading admin profiles.

Goal:

Support admin dashboard identity without mixing admin and student profile concerns.

Dependencies:

```text
P2-015
```

Output:

```text
Backend admin profile service
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-032 — Implement Profile Read and Update API

Branch:

```text
phase2/P2-032-profile-read-update-api
```

Task:

Implement backend endpoints for reading and safely updating user profile data.

Goal:

Allow users to access and update only safe profile fields.

Dependencies:

```text
P2-029, P2-030, P2-031
```

Output:

```text
Backend profile read/update endpoints
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-033 — Apply Profile Ownership Checks

Branch:

```text
phase2/P2-033-profile-ownership-checks
```

Task:

Apply ownership checks to profile endpoints so users cannot read or update profiles they do not own.

Goal:

Protect user and student profile data from cross-account access.

Dependencies:

```text
P1-022, P2-032
```

Output:

```text
Ownership checks in profile endpoints
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-034 — Add Users and Profile Tests

Branch:

```text
phase2/P2-034-users-profile-tests
```

Task:

Add backend tests for user creation, student/admin profile creation, safe profile read/update, and ownership blocking.

Goal:

Validate the users and profile foundation before role-based features depend on it.

Dependencies:

```text
P2-032, P2-033
```

Output:

```text
Backend users/profile test suite
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-035 — Create Permission Matrix

Branch:

```text
phase2/P2-035-permission-matrix
```

Task:

Document the Phase 2 role and permission matrix for students, admins, content managers, human reviewers, and project owner roles.

Goal:

Make role and permission behavior explicit before enforcing it in code.

Dependencies:

```text
P2-007, P2-010
```

Output:

```text
docs/phase-2/permission-matrix.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-036 — Implement Roles Service

Branch:

```text
phase2/P2-036-roles-service
```

Task:

Implement backend service logic for reading roles, permissions, and user role assignments.

Goal:

Centralize RBAC data access in the backend.

Dependencies:

```text
P2-016, P2-017
```

Output:

```text
Backend roles service
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-037 — Implement Role Guard

Branch:

```text
phase2/P2-037-role-guard
```

Task:

Implement a backend guard for protecting endpoints by role.

Goal:

Prevent users from accessing endpoints that require roles they do not have.

Dependencies:

```text
P2-022, P2-036
```

Output:

```text
Backend role guard
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-038 — Implement Permission Guard

Branch:

```text
phase2/P2-038-permission-guard
```

Task:

Implement a backend guard for protecting endpoints by specific permission.

Goal:

Support fine-grained authorization beyond broad roles.

Dependencies:

```text
P2-036
```

Output:

```text
Backend permission guard
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-039 — Implement Admin Role Assignment API

Branch:

```text
phase2/P2-039-admin-role-assignment-api
```

Task:

Implement backend endpoint for authorized admins to assign or change user roles.

Goal:

Allow controlled role management from the admin dashboard.

Dependencies:

```text
P2-036, P2-037, P2-038
```

Output:

```text
Admin role assignment endpoint
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-040 — Add Role Change Audit Logging

Branch:

```text
phase2/P2-040-role-change-audit
```

Task:

Add audit logging for role assignment and role change events.

Goal:

Track who changed a user's role, when, and why.

Dependencies:

```text
P2-018, P2-039
```

Output:

```text
Audit logging for role changes
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-041 — Add Roles and Permissions Tests

Branch:

```text
phase2/P2-041-roles-permissions-tests
```

Task:

Add backend tests for role guard, permission guard, role assignment, and role change audit logging.

Goal:

Verify RBAC behavior and prevent privilege escalation.

Dependencies:

```text
P2-037, P2-038, P2-039, P2-040
```

Output:

```text
Backend roles/permissions test suite
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-042 — Create Flutter Auth Models

Branch:

```text
phase2/P2-042-flutter-auth-models
```

Task:

Create Flutter auth models and entities for current user, auth response, and session validation response.

Goal:

Keep Flutter auth data aligned with shared contracts.

Dependencies:

```text
P2-008, P2-009
```

Output:

```text
Flutter auth models/entities
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-043 — Create Flutter Auth Remote Datasource

Branch:

```text
phase2/P2-043-flutter-auth-datasource
```

Task:

Create Flutter remote datasource for backend auth endpoints such as /auth/me and session validation.

Goal:

Ensure Flutter talks to the backend API for auth state instead of bypassing backend authority.

Dependencies:

```text
P2-024, P2-026
```

Output:

```text
Flutter auth remote datasource
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-044 — Create Flutter Auth Repository and Provider

Branch:

```text
phase2/P2-044-flutter-auth-repository
```

Task:

Create Flutter auth repository and StateNotifier-style provider foundation.

Goal:

Separate Flutter auth UI from network/data access.

Dependencies:

```text
P2-043
```

Output:

```text
Flutter auth repository and provider
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-045 — Build Flutter Login UI

Branch:

```text
phase2/P2-045-flutter-login-ui
```

Task:

Build the Flutter login screen and related widgets.

Goal:

Allow a user to sign in through the mobile app flow.

Dependencies:

```text
P1-045, P2-044
```

Output:

```text
Flutter login page/widgets
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-046 — Build Flutter Register UI

Branch:

```text
phase2/P2-046-flutter-register-ui
```

Task:

Build the Flutter registration screen and related widgets.

Goal:

Allow a new user to start account creation from the mobile app.

Dependencies:

```text
P2-045
```

Output:

```text
Flutter register page/widgets
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-047 — Connect Flutter Auth State Routing

Branch:

```text
phase2/P2-047-flutter-auth-state-routing
```

Task:

Connect Flutter routing to authenticated, unauthenticated, and profile-ready states.

Goal:

Prevent unauthenticated users from entering protected app areas.

Dependencies:

```text
P1-043, P2-044
```

Output:

```text
Flutter auth-state routing logic
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-048 — Handle Flutter Session Expired State

Branch:

```text
phase2/P2-048-flutter-session-expired
```

Task:

Add Flutter handling for expired sessions and safe sign-out state reset.

Goal:

Improve security and user experience when the backend rejects an expired session.

Dependencies:

```text
P2-047
```

Output:

```text
Flutter session-expired handling
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-049 — Implement Flutter Logout Flow

Branch:

```text
phase2/P2-049-flutter-logout-flow
```

Task:

Implement Flutter logout flow and local auth state cleanup.

Goal:

End the user's session cleanly and safely.

Dependencies:

```text
P2-044
```

Output:

```text
Flutter logout implementation
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-050 — Create Flutter Auth Flow Check

Branch:

```text
phase2/P2-050-flutter-auth-flow-check
```

Task:

Document and/or test the Flutter auth flow including login, register, current user, session expired, and logout.

Goal:

Verify Flutter uses backend-approved auth state and does not bypass backend authority.

Dependencies:

```text
P2-042, P2-043, P2-044, P2-045, P2-046, P2-047, P2-048, P2-049
```

Output:

```text
docs/phase-2/flutter-auth-flow-check.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-051 — Create Flutter Profile Models

Branch:

```text
phase2/P2-051-flutter-profile-models
```

Task:

Create Flutter profile models and entities for UserProfile, StudentProfile, AdminProfile, and safe profile update payloads.

Goal:

Allow Flutter to display and update safe profile data consistently with shared contracts.

Dependencies:

```text
P2-009
```

Output:

```text
Flutter profile models/entities
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-052 — Create Flutter Profile Datasource

Branch:

```text
phase2/P2-052-flutter-profile-datasource
```

Task:

Create Flutter remote datasource for backend profile read/update endpoints.

Goal:

Ensure profile data is loaded and updated only through the backend API.

Dependencies:

```text
P2-032
```

Output:

```text
Flutter profile datasource
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-053 — Create Flutter Profile Repository and Provider

Branch:

```text
phase2/P2-053-flutter-profile-repository
```

Task:

Create Flutter profile repository and StateNotifier-style provider foundation.

Goal:

Separate profile UI logic from backend data access.

Dependencies:

```text
P2-052
```

Output:

```text
Flutter profile repository/provider
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-054 — Build Flutter Profile Screen

Branch:

```text
phase2/P2-054-flutter-profile-screen
```

Task:

Build the Flutter profile screen for displaying safe user and profile fields.

Goal:

Allow users to view account/profile data without exposing internal role/security fields.

Dependencies:

```text
P2-053
```

Output:

```text
Flutter profile page/widgets
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-055 — Build Flutter Basic Edit Profile Flow

Branch:

```text
phase2/P2-055-flutter-edit-profile-basic
```

Task:

Build Flutter UI flow for editing safe basic profile fields only.

Goal:

Allow safe profile updates while preventing client-side role or permission changes.

Dependencies:

```text
P2-054
```

Output:

```text
Flutter basic edit profile flow
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-056 — Add Flutter Role-Aware UI Placeholder

Branch:

```text
phase2/P2-056-flutter-role-aware-ui
```

Task:

Add placeholder role-aware UI behavior for showing or hiding UI elements based on backend-provided role data.

Goal:

Improve UX while keeping backend as the final authorization authority.

Dependencies:

```text
P2-007, P2-044
```

Output:

```text
Flutter role-aware UI placeholder
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-057 — Create Profile Flow Check

Branch:

```text
phase2/P2-057-profile-flow-check
```

Task:

Document and/or test the profile flow for reading, updating, and blocking unauthorized profile access.

Goal:

Verify profile access works through backend ownership checks.

Dependencies:

```text
P2-051, P2-052, P2-053, P2-054, P2-055, P2-056
```

Output:

```text
docs/phase-2/profile-flow-check.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-058 — Protect Admin UI with Auth Guard

Branch:

```text
phase2/P2-058-admin-auth-guard-ui
```

Task:

Add admin dashboard auth guard/routing foundation for protected admin pages.

Goal:

Prevent unauthenticated or unauthorized users from entering admin dashboard areas.

Dependencies:

```text
P1-047, P2-024
```

Output:

```text
Admin dashboard auth guard/routing
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-059 — Implement Admin Users API

Branch:

```text
phase2/P2-059-admin-users-api
```

Task:

Implement backend API for authorized admins to list users safely.

Goal:

Enable initial admin user management through backend-controlled authorization.

Dependencies:

```text
P2-029, P2-037
```

Output:

```text
Admin users list endpoint
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-060 — Build Admin Users List UI

Branch:

```text
phase2/P2-060-admin-users-list-ui
```

Task:

Build admin dashboard UI for listing users returned by the backend admin users API.

Goal:

Provide an initial admin user management surface.

Dependencies:

```text
P2-059
```

Output:

```text
Admin users list page
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-061 — Implement Admin User Detail API

Branch:

```text
phase2/P2-061-admin-user-detail-api
```

Task:

Implement backend API for authorized admins to view a single user's safe details.

Goal:

Allow admin review of user/profile/role information without exposing unsafe internals.

Dependencies:

```text
P2-059
```

Output:

```text
Admin user detail endpoint
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-062 — Build Admin User Detail UI

Branch:

```text
phase2/P2-062-admin-user-detail-ui
```

Task:

Build admin dashboard UI for viewing safe user details.

Goal:

Allow authorized admins to inspect user identity/profile/role information safely.

Dependencies:

```text
P2-061
```

Output:

```text
Admin user detail page
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-063 — Build Admin Role Change UI

Branch:

```text
phase2/P2-063-admin-role-change-ui
```

Task:

Build admin dashboard UI for changing a user's role through the approved backend flow.

Goal:

Allow authorized admins to manage roles from a controlled UI.

Dependencies:

```text
P2-039, P2-062
```

Output:

```text
Admin role change UI
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-064 — Connect Admin Role Change Flow

Branch:

```text
phase2/P2-064-admin-role-change-flow
```

Task:

Connect admin role change UI to backend role assignment API and audit logging.

Goal:

Enable role changes only through backend authorization and audit rules.

Dependencies:

```text
P2-040, P2-063
```

Output:

```text
Admin role change integration flow
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-065 — Create Admin Users and Roles Check

Branch:

```text
phase2/P2-065-admin-users-roles-check
```

Task:

Document and/or test admin users list, user detail, and role change behavior.

Goal:

Verify admin user/role management works without bypassing backend permissions.

Dependencies:

```text
P2-058, P2-059, P2-060, P2-061, P2-062, P2-063, P2-064
```

Output:

```text
docs/phase-2/admin-users-roles-check.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-066 — Run Phase 2 Auth Security Review

Branch:

```text
phase2/P2-066-auth-security-review
```

Task:

Review JWT validation, role checks, ownership checks, secret exposure, and profile field safety.

Goal:

Find and document auth security issues before closing Phase 2.

Dependencies:

```text
P2-028, P2-041, P2-050
```

Output:

```text
docs/quality/phase-2-auth-security-review.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-067 — Run Role and Permission Review

Branch:

```text
phase2/P2-067-role-permission-review
```

Task:

Review role and permission behavior against the permission matrix.

Goal:

Prevent privilege escalation and missing role enforcement.

Dependencies:

```text
P2-035, P2-036, P2-037, P2-038, P2-039, P2-040, P2-041
```

Output:

```text
docs/quality/phase-2-role-permission-review.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-068 — Run Safe Field Exposure Review

Branch:

```text
phase2/P2-068-safe-field-exposure-review
```

Task:

Review all Flutter/admin/backend auth/profile responses for unsafe field exposure.

Goal:

Ensure clients do not receive internal role, auth, audit, or security-sensitive fields.

Dependencies:

```text
P2-011, P2-057, P2-065
```

Output:

```text
docs/quality/phase-2-safe-field-review.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-069 — Run Auth Users Roles E2E Check

Branch:

```text
phase2/P2-069-auth-users-roles-e2e
```

Task:

Run/document an end-to-end check for login/register/current user/profile/roles/admin user management.

Goal:

Verify Phase 2 works as one integrated auth/users/roles system.

Dependencies:

```text
P2-010, P2-057, P2-065
```

Output:

```text
docs/phase-2/auth-users-roles-e2e.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-070 — Run Phase 2 Architecture Review

Branch:

```text
phase2/P2-070-phase-2-architecture-review
```

Task:

Review Phase 2 implementation for scope drift into onboarding, placement, lessons, AIM integration, dashboard, AI Teacher, or Student Web App.

Goal:

Ensure Phase 2 remained strictly Auth, Users, Roles.

Dependencies:

```text
P2-069
```

Output:

```text
docs/quality/phase-2-architecture-review.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.


## #P2-071 — Create Phase 2 Final Review and Handoff

Branch:

```text
phase2/P2-071-phase-2-final-review
```

Task:

Create the final Phase 2 handoff document summarizing completed work, blockers, security status, and readiness for the next phase.

Goal:

Close Phase 2 and decide readiness for Phase 3.

Dependencies:

```text
P2-066, P2-067, P2-068, P2-069, P2-070
```

Output:

```text
docs/phase-2/final-review.md
```

Requirements:

- Read the dependencies and relevant Phase 0/Phase 1 documentation before editing.
- Follow the exact output path or output type defined for this task.
- Keep the implementation/documentation limited to Phase 2: Auth, Users, Roles.
- Do not add onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress, AI Teacher, or Student Web App work.
- Do not expose secrets, service-role keys, database credentials, or privileged backend configuration to any client.
- Keep backend authorization, roles, permissions, and ownership checks as the final authority.
- Keep Flutter/Admin UI role behavior as UX only, not security authority.
- Update or create only files needed for this task.

Done Test:

- The expected output exists.
- The output satisfies the task goal.
- The task follows the Phase 2 scope: Auth, Users, Roles only.
- No out-of-scope Phase 2 feature was introduced.
- No secret or privileged credential was exposed.
- Required checks/tests or review notes are documented.
- The task branch is pushed and the Notion task is updated according to the completion rules.

