# Phase 3 — Task Execution Rules

## Purpose

This document defines the official execution rules for **Phase 3 — Curriculum and Content System** tasks in the AIM Platform.

It standardizes how Phase 3 tasks are selected, dependency-checked, claimed in Notion, implemented on Git branches, committed, pushed, documented, and completed.

These rules exist to keep Phase 3 consistent with the Phase 0, Phase 1, and Phase 2 execution model while preserving the Phase 3 scope boundary defined in:

```text
docs/phase-3/curriculum-content-system-charter.md
```

## Phase 3 Scope Reminder

Phase 3 is limited to the Curriculum and Content System foundation:

- courses;
- levels;
- chapters;
- lessons;
- skills;
- objectives;
- lesson assets;
- question bank content;
- content lifecycle;
- validation;
- publishing controls;
- curriculum review;
- admin curriculum/content management backed by protected backend APIs.

Phase 3 must not include onboarding, placement execution, learner lesson delivery, practice attempts, learning sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, AI Teacher, or Student Web App work.

If a task appears to require excluded work, stop and report a blocker.

## Required Identity Input

Every task run must have a team member email.

```text
TEAM_MEMBER_NOTION_EMAIL=<member-email>
```

Current execution email:

```text
TEAM_MEMBER_NOTION_EMAIL=yousefalgharasi2@gmail.com
```

The task must be assigned in Notion to the user matching this email before any file is edited.

If the email is missing or cannot be resolved to a Notion user, stop immediately.

## One Task Only Rule

An agent may work on only one Phase 3 task at a time.

Do not start a second task until the current task is either completed, pushed, documented, and marked Done in Notion, or blocked, documented in Notion, and left In Progress.

Never bundle multiple task outputs into one branch or one commit.

## Task Selection Rules

A task may be selected only when all of the following are true:

```text
Status = Undone
Assigned = empty
Dependency = empty or complete
```

Do not take a task if any of the following are true:

```text
Status = In Progress
Status = Done
Assigned is not empty
Dependency is incomplete
Dependency output is missing from GitHub
Dependency has an unresolved blocker
```

If more than one task is available, select the earliest dependency-safe task by task ID unless instructed otherwise.

## Dependency Validation Rules

Before claiming a task, check every dependency listed in the Notion `Dependency` field.

A dependency is complete only when:

1. The dependency task exists in Notion.
2. The dependency task Status is Done.
3. The dependency has no unresolved blocker comment that makes its output unusable.
4. The dependency expected output exists in GitHub.
5. The dependency output has been pushed to its task branch or default branch according to the active execution workflow.
6. The dependency output matches the expected path or output type from `docs/tasks/phase_3_task_prompts.md`.

If Notion says a dependency is Done but the expected file is missing from GitHub, treat the dependency as incomplete.

Do not guess around missing dependency output.

## Claiming Rules

Before editing files, re-check the task in Notion.

Confirm:

```text
Status = Undone
Assigned = empty
Dependencies = complete
```

Then claim the task:

```text
Assigned = TEAM_MEMBER_NOTION_EMAIL
Status = In Progress
```

After claiming, re-open the Notion task and confirm:

```text
Assigned = current user
Status = In Progress
```

If the task is already assigned to someone else, stop immediately.

## Branch Rules

Each task must use exactly the branch listed in the Notion `Branch` property.

Example:

```bash
git checkout main
git pull origin main
git checkout -b phase3/P3-002-phase-3-task-rules
```

If the branch already exists locally:

```bash
git checkout phase3/P3-002-phase-3-task-rules
git pull origin phase3/P3-002-phase-3-task-rules
```

If the branch exists remotely but not locally:

```bash
git fetch origin phase3/P3-002-phase-3-task-rules
git checkout -b phase3/P3-002-phase-3-task-rules origin/phase3/P3-002-phase-3-task-rules
```

Do not use a different branch name.

Do not reuse another task branch.

## Working Tree Rules

Before editing files, run:

```bash
git status --short
```

If there are unrelated local changes, stop and report a blocker.

Allowed changes are only the files required by the selected task.

Do not perform unrelated cleanup, formatting, refactoring, package upgrades, dependency changes, or architecture changes.

## Prompt File Rules

Every task must follow the exact matching section in:

```text
docs/tasks/phase_3_task_prompts.md
```

Find the section by ID, for example:

```text
#P3-001
#P3-002
#P3-024
```

Follow only that task section.

The task section controls branch, task, goal, dependencies, output, requirements, and done test.

Do not implement requirements from another task.

## File Editing Rules

Edit only files required by the current task.

For documentation-only tasks, create or update only the requested documentation file unless the prompt explicitly requires more.

For backend tasks, edit only the relevant backend files.

For database tasks, edit only the relevant migration, schema, seed, or database documentation files.

For admin dashboard tasks, edit only the relevant admin files.

For Flutter tasks, edit only the relevant Flutter files when the prompt explicitly allows Flutter work.

Do not modify Phase 0, Phase 1, or Phase 2 decisions unless a documented conflict requires it.

If a conflict is found, stop and report a blocker.

## Phase 3 Architecture Rules

Every task must preserve these rules:

- Backend API and database are the final authority for curriculum hierarchy, content state, publishing, roles, permissions, ownership, and audit logging.
- Admin Dashboard role checks are UX only and must not become final authorization.
- Content write, publish, archive, import, export, and audit APIs must be protected by backend auth and role or permission checks.
- Lessons must not be publishable without required skill linkage.
- Clients must not receive service-role keys, database credentials, JWT secrets, AI provider keys, private storage credentials, raw tokens, or privileged credentials.
- Clients must not calculate mastery, level, weakness, difficulty, retention, recommendations, or progress conclusions.
- Student Web App work is out of scope.
- Onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention workflows, progress reports, and AI Teacher work are out of scope.

## Secret Handling Rules

Never commit or expose:

- `.env` files;
- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- private storage credentials;
- private backend credentials;
- production secrets;
- privileged infrastructure credentials;
- raw access or refresh tokens.

If a real secret is found in a file, stop and report a blocker.

Do not copy secrets into documentation, comments, examples, Flutter code, admin code, backend code, migrations, seeds, or tests.

Use placeholders only, such as:

```text
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret>
DATABASE_URL=<server-only-database-url>
JWT_SECRET=<server-only-jwt-secret>
```

## Commit Rules

Each task must have exactly one task-specific commit unless a blocker requires otherwise.

Before committing, run:

```bash
git status --short
```

Stage only the changed files required by the task.

Commit format:

```bash
git add <changed-files>
git commit -m "P3-XXX: <short task title>"
```

Example:

```bash
git add docs/phase-3/task-execution-rules.md
git commit -m "P3-002: create phase 3 task execution rules"
```

Do not include unrelated files in the commit.

## Push Rules

After committing, push the exact task branch:

```bash
git push origin <task-branch>
```

Example:

```bash
git push origin phase3/P3-002-phase-3-task-rules
```

Do not mark the Notion task as Done until the push succeeds.

If push fails, keep the task In Progress and add a blocker comment in Notion.

## Check Rules

Before completion, run relevant checks.

Always run:

```bash
git status --short
```

For documentation-only tasks, perform a documentation review and record it in Notion.

For backend tasks, run backend lint/test commands if available.

For database tasks, run migration/schema validation commands if available.

For admin dashboard tasks, run the available lint/build/test command if available.

For Flutter tasks, run:

```bash
flutter analyze
```

when the Flutter project exists and the environment supports it.

If tooling cannot run, document the limitation clearly in the Notion completion comment.

## Completion Comment Rules

After a successful push, add a completion comment in Notion using this format:

```text
Completed — P3-XXX

Files created/updated:
- ...

Branch:
...

Commit:
...

Checks:
- ...

Limitations:
- ...
```

The comment must identify files changed, branch pushed, commit hash if available, checks or review notes, and limitations if any.

## Notion Completion Rules

After successful push and completion comment:

1. Re-open the Notion task.
2. Confirm it is still assigned to the current user.
3. Confirm Status is still In Progress.
4. Add the completion comment.
5. Set Status to Done.
6. Keep Assigned filled.

Do not remove the assignee after completion.

## Blocker Rules

If a task cannot be completed, keep it assigned and In Progress.

Add a blocker comment in Notion using this format:

```text
Blocked — P3-XXX

Reason:
<what blocked the task>

Missing dependency/file:
<dependency or file>

Failed command:
<command and result>

Next required action:
<what must happen next>
```

Do not mark blocked work as Done.

Do not silently skip blocker documentation.

## Stop Conditions

Stop immediately if any of the following happens:

- `TEAM_MEMBER_NOTION_EMAIL` is missing.
- The Notion task database cannot be accessed.
- The Notion user cannot be resolved.
- The selected task is already assigned.
- The selected task is not Undone.
- A dependency is incomplete.
- A dependency expected output is missing from GitHub.
- The exact task section is missing from `docs/tasks/phase_3_task_prompts.md`.
- The required branch is missing or cannot be created.
- The working tree has unrelated changes.
- A Phase 0, Phase 1, Phase 2, or Phase 3 charter conflict is found.
- A real secret is detected.
- A lesson can be published without skills.
- A content API is unprotected.
- Admin UI bypasses backend authority.
- The task requires Student Web App work.
- The task requires onboarding, placement execution, learner lesson delivery, practice, sessions, AIM runtime integration, dashboard recommendations, progress reports, review/retention, or AI Teacher work.
- The task relies on client-side authorization as final authority.
- The task moves AIM calculation into Flutter/Admin/client code.

## Final Report Format

At the end of each task run, report:

```text
Task: P3-XXX — <task title>
Status: Done / Blocked

Branch:
<task branch>

Files changed:
- <file>

Commit:
<commit hash or unavailable>

Push:
succeeded / failed

Checks:
- <check result>

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- <important limitation or none>
```

## Done Criteria

A Phase 3 task is Done only when:

- the task was dependency-safe;
- the task was claimed in Notion before editing;
- the exact task branch was used;
- the exact task prompt was followed;
- only task-required files were edited;
- Phase 3 curriculum/content scope was preserved;
- backend authority boundaries were preserved;
- content API protection rules were preserved;
- lesson skill-link publication rules were preserved;
- no secrets were exposed;
- checks or review notes were completed;
- the task commit was created;
- the task branch was pushed;
- a Notion completion comment was added;
- the Notion task was marked Done;
- the assignee remained filled.

If any item is missing, the task is not Done.
