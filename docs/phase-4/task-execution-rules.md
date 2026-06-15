# Phase 4 — Task Execution Rules

## Purpose

This document defines the official execution rules for **Phase 4 — Placement Test** tasks in the AIM Platform.

It standardizes how Phase 4 tasks are selected, dependency-checked, claimed in Notion, implemented on Git branches, committed, pushed, documented, and completed.

These rules preserve the Phase 4 scope boundary defined in:

```text
docs/phase-4/placement-test-charter.md
```

## Phase 4 Scope Reminder

Phase 4 is limited to the Placement Test foundation:

- placement test contracts;
- placement sections;
- placement questions;
- placement attempts;
- placement answers;
- placement result generation;
- backend-owned placement scoring;
- backend-owned estimated level output;
- backend-owned skill signal and weakness indicator output;
- backend-owned initial learning path output;
- admin placement configuration backed by protected backend APIs;
- Flutter Mobile placement screens that collect input and display backend output;
- placement security, architecture, coverage, and handoff reviews.

Phase 4 must not include AIM Engine runtime integration, AI Teacher, learner lesson delivery, practice sessions, learning sessions, adaptive recommendations, progress dashboards, retention or review scheduling, Student Web App work, or a React/Next.js learner app.

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

An agent may work on only one Phase 4 task at a time.

Do not start a second task until the current task is completed, pushed, documented, and marked Done in Notion, or blocked, documented in Notion, and left In Progress.

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
5. The dependency output has been pushed to its task branch or the default branch according to the active execution workflow.
6. The dependency output matches the expected path or output type from `docs/tasks/phase_4_task_prompts.md`.

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
git checkout -b phase4/P4-002-phase-4-task-rules
```

For tasks with dependency output that is not yet on `main`, create the task branch from the dependency branch that contains the required output.

If the branch already exists locally:

```bash
git checkout phase4/P4-002-phase-4-task-rules
git pull origin phase4/P4-002-phase-4-task-rules
```

If the branch exists remotely but not locally:

```bash
git fetch origin phase4/P4-002-phase-4-task-rules
git checkout -b phase4/P4-002-phase-4-task-rules origin/phase4/P4-002-phase-4-task-rules
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
docs/tasks/phase_4_task_prompts.md
```

Find the section by ID, for example:

```text
#P4-001
#P4-002
#P4-024
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

Do not modify Phase 0, Phase 1, Phase 2, or Phase 3 decisions unless a documented conflict requires it.

If a conflict is found, stop and report a blocker.

## Phase 4 Architecture Rules

Every task must preserve these rules:

- Backend API and database are the final authority for placement attempts, answers, scoring, results, estimated level, skill signals, weakness indicators, initial path output, roles, permissions, ownership, and audit logging.
- Flutter Mobile role, flow, and validation checks are UX only and must not become final authorization or scoring authority.
- Admin Dashboard role checks are UX only and must not become final authorization.
- Placement configuration write APIs must be protected by backend auth and role or permission checks.
- Learner placement APIs must enforce authenticated learner identity, attempt ownership, safe field exposure, and state transitions.
- Flutter Mobile must not calculate placement score, section score, estimated level, mastery, weakness map, skill proficiency, difficulty, retention, recommendations, or initial learning path.
- AIM Engine runtime integration is out of scope.
- AI Teacher is out of scope.
- Lesson delivery, practice sessions, learning sessions, adaptive recommendations, progress dashboards, retention or review scheduling, Student Web App work, and React/Next.js learner app work are out of scope.
- Speed, response time, average response time, or speed score must not be used as a direct mastery, level, weakness, or difficulty-increase signal.

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

Only public client-safe configuration may be used in clients.

If a task requires a missing secret or credential, stop and report a blocker. Do not invent, hard-code, or commit placeholder secrets.

## Backend Authority Rules

Backend placement services must own:

- active placement test selection;
- attempt start eligibility;
- answer validation;
- completion eligibility;
- placement scoring;
- section scoring;
- estimated level output;
- skill signal output;
- weakness indicator output;
- initial path output;
- retake policy;
- audit events.

Clients may request and display these values, but they must not calculate or override them.

## Flutter Rules

Flutter Mobile work is allowed only when the selected prompt explicitly requires Flutter placement work.

Flutter may:

- render placement intro, section, question, completion, and result screens;
- collect learner input;
- submit answers to backend APIs;
- show loading, empty, success, and error states;
- render backend-generated placement output.

Flutter must not:

- calculate placement results;
- infer level or mastery;
- infer weaknesses;
- generate recommendations;
- generate initial learning paths;
- select lessons;
- expose answer keys or scoring rules;
- bypass backend attempt state.

## Admin Dashboard Rules

Admin Dashboard work is allowed only when the selected prompt explicitly requires admin placement work.

Admin UI may:

- manage placement sections through protected backend APIs;
- manage placement questions through protected backend APIs;
- manage placement question-skill links through protected backend APIs;
- display backend validation and coverage summaries.

Admin UI must not:

- become the source of truth for placement validity;
- expose privileged placement data to unauthorized roles;
- write directly to the database;
- embed service-role keys or privileged configuration;
- implement scoring rules in the browser.

## Commit and Push Rules

Every task must be committed and pushed separately.

Use this commit format:

```bash
git commit -m "P4-XXX: <short task title>"
```

Examples:

```bash
git commit -m "P4-001: create phase 4 placement test charter"
git commit -m "P4-002: create phase 4 task execution rules"
git commit -m "P4-016: create placement backend module skeleton"
```

Push the exact task branch:

```bash
git push -u origin phase4/P4-XXX-...
```

Do not mark the Notion task Done until the push succeeds and the expected output is visible in GitHub.

## Completion Rules

After the push succeeds:

1. Re-open the Notion task.
2. Confirm it is still assigned to the current user.
3. Confirm `Status = In Progress`.
4. Confirm the expected output exists on the pushed branch.
5. Add a completion comment with:
   - files created or updated;
   - branch;
   - commit hash;
   - checks or tests run;
   - limitations.
6. Change `Status` to `Done`.
7. Keep `Assigned` filled.

Do not remove yourself from `Assigned` after completion.

## Blocker Rules

If a task cannot be completed:

1. Keep the task assigned to the current user.
2. Keep `Status = In Progress`, unless the active Notion workflow explicitly provides a `Blocked` status for the task database.
3. Add a blocker comment explaining:
   - what blocked the task;
   - which dependency, file, secret, credential, or prompt conflict is involved;
   - what command failed, if any;
   - what must happen next.

Do not mark blocked work as Done.

Stop immediately and report a blocker if:

- a dependency is missing;
- a dependency output is missing from GitHub;
- Notion and `docs/tasks/phase_4_task_prompts.md` disagree;
- the task requires AIM Engine runtime integration;
- the task requires AI Teacher, lesson delivery, recommendations, or progress dashboard work;
- the task would make Flutter calculate placement scoring, level, mastery, weakness, or initial path;
- a required secret or credential is missing.

## Final Report Format

At the end of each task, report:

```text
Task: P4-XXX — <task title>
Status: Done / Blocked

Files changed:
- <file>

Commit:
<commit hash>

Push:
succeeded / failed

Checks:
- <check result>

Notion:
- Assigned to <email/name>
- Status set to Done / In Progress
```

## Core Rule

Do not take a task unless:

- `Status = Undone`;
- `Assigned = empty`;
- dependencies are Done;
- dependency outputs are pushed to GitHub;
- local git tree is clean.

Do not mark a task Done unless:

- work is complete;
- checks passed or limitations are documented;
- commit is created;
- push succeeds;
- expected output is visible on the pushed branch;
- Notion completion comment is added.
