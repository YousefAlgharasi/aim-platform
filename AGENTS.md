# AGENTS.md

> **Project:** AIM Platform
> **Repository:** `YousefAlgharasi/aim-platform`
> **Primary Agent:** Codex
> **Scope:** Phase 1 — System Foundation
> **Notion Team Email:** `ahmedalalawi2022@gmail.com`

---

## Core Context

You are working on the AIM Platform repository.

Your responsibility is to complete tasks from **Phase 1 — System Foundation** using the Notion task database and the detailed prompt file.

Repository:

```text
https://github.com/YousefAlgharasi/aim-platform
```

Notion Phase 1 Tasks database:

```text
https://app.notion.com/p/57e1d1bfdbbd474ea27b35c29e7df571
```

Detailed task prompt file:

```text
docs/tasks/phase_1_task_prompts.md
```

Before starting, you must have your Notion team email ready:

```bash
TEAM_MEMBER_NOTION_EMAIL=ahmedalalawi2022@gmail.com
```

---

## 1. Task Picking Rules

Before taking any task from Notion, verify:

- `Status = Undone`
- `Assigned = empty`
- `Dependency = complete`
- No blocker comment exists

You must not take a task if:

- `Status = In Progress`
- `Status = Done`
- `Assigned` is not empty
- Another member already claimed it
- Dependency is missing
- Dependency is not `Done`
- Dependency output is not pushed to GitHub
- There is an unresolved blocker comment

If the task is already assigned to someone else, skip it.

---

## 2. Dependency Rules

A dependency is complete only when all of these are true:

1. The dependency task exists in Notion.
2. The dependency `Status` is `Done`.
3. The dependency has no unresolved blocker comment.
4. The expected output file exists in GitHub.
5. The dependency output is pushed to the `main` branch.

If Notion says the dependency is `Done` but the expected output file does not exist in GitHub, treat the dependency as incomplete.

Do not start a task with incomplete dependencies.

---

## 3. Claiming the Task

When you find an available task:

1. Re-check that `Status` is `Undone`.
2. Re-check that `Assigned` is empty.
3. Re-check that all dependencies are complete.
4. Assign the task to yourself using `TEAM_MEMBER_NOTION_EMAIL`.
5. Change `Status` to `In Progress`.
6. Re-open the Notion task and confirm it is assigned to you.

Do not begin editing files until the task is assigned to you.

---

## 4. Before Editing Code or Docs

Before making changes:

```bash
git checkout main
git pull origin main
git status --short
```

If the working tree is not clean, stop and fix or report the issue.

Then open:

```text
docs/tasks/phase_1_task_prompts.md
```

Find your exact task section:

```text
#P1-XXX
```

Examples:

```text
#P1-001
#P1-016
#P1-038
```

Execute only that task.

---

## 5. Work Scope Rules

You must not:

- Create Student Web App work
- Create React/Next.js learner app work
- Use FastAPI as Phase 1 Backend API
- Move AIM Engine logic into Flutter
- Calculate mastery in Flutter
- Calculate level in Flutter
- Calculate weakness in Flutter
- Calculate difficulty in Flutter
- Calculate retention in Flutter
- Calculate recommendations in Flutter
- Expose AI provider keys
- Expose Supabase service-role keys
- Expose database credentials
- Use speed as direct mastery/level/difficulty signal
- Perform unrelated cleanup
- Refactor unrelated files
- Implement extra tasks

Phase 1 is System Foundation, not full feature implementation.

---

## 6. Commit and Push Rules

Every task must be committed and pushed separately.

Use this format:

```bash
git status --short
git add <changed-files>
git commit -m "P1-XXX: <short task title>"
git push origin main
```

Examples:

```bash
git commit -m "P1-001: create phase 1 system foundation charter"
git commit -m "P1-016: create backend API skeleton"
git commit -m "P1-038: create Flutter mobile project shell"
```

You must not mark the Notion task as `Done` until `git push` succeeds.

---

## 7. After Push

After the push succeeds:

1. Re-open the Notion task.
2. Confirm it is still assigned to you.
3. Confirm `Status` is `In Progress`.
4. Add a completion comment with:
   - Files created or updated
   - Commit hash
   - Checks/tests run
   - Any limitations
5. Change `Status` to `Done`.
6. Keep `Assigned` filled with your name.

Do not remove yourself from `Assigned` after completion.

After commit and finishing any task, move it from `In Progress` to `Done`.

---

## 8. If Blocked

If you cannot complete the task:

1. Keep the task assigned to yourself.
2. Keep `Status` as `In Progress`.
3. Add a blocker comment explaining:
   - What blocked you
   - Which dependency/file is missing
   - What command failed
   - What must happen next

Do not mark blocked work as `Done`.

---

## 9. Final Report Format

At the end of each task, report:

```text
Task: P1-XXX — <task title>
Status: Done / Blocked

Files changed:
- <file>
- <file>

Commit:
<commit hash>

Push:
succeeded / failed

Checks:
- <check result>
- <check result>

Notion:
- Assigned to <your email/name>
- Status set to Done / In Progress
```

---

## 10. Core Rule

Do not take a task unless:

- `Status = Undone`
- `Assigned = empty`
- `Dependencies = Done`
- Dependency outputs are pushed to GitHub
- Local git tree is clean

Do not mark a task `Done` unless:

- Work completed
- Checks passed or are documented
- Commit created
- Git push succeeded
- Notion comment added

