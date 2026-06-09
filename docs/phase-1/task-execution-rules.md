# Phase 1 — Task Execution Rules

## Purpose

This document defines the mandatory workflow for all agents and developers executing Phase 1 tasks. It must be followed without exception. Any agent that cannot follow these rules must stop and add a blocker comment in Notion rather than deviate.

## Source-of-Truth Hierarchy

Before executing any task, the following hierarchy governs all conflicts. Higher-priority sources override lower-priority ones:

| Priority | Source | Scope |
|---|---|---|\
| 1 | `docs/phase-1/system-foundation-charter.md` | Phase 1 stack, boundaries, forbidden work |
| 2 | `docs/product/non-negotiables.md` | Platform-wide hard rules |
| 3 | `docs/product/vision.md` | Product direction |
| 4 | `docs/aim-engine/boundary-and-io-contract.md` | AIM Engine ownership and IO |
| 5 | `docs/api/api-planning-baseline.md` | API planning baseline |
| 6 | `docs/mobile/mobile-sitemap.md` | Flutter Mobile screen structure |
| 7 | `docs/security/ai-safety-privacy-rules.md` | AI safety and privacy rules |
| 8 | Notion Phase 1 task definitions | Individual task scope and acceptance |
| 9 | Individual task execution prompts | Implementation detail |

If a task prompt conflicts with a higher-priority source, the higher-priority source wins. Stop the task and add a blocker comment in Notion.

## Required Identity Input

Every agent run must include:

```
TEAM_MEMBER_NOTION_EMAIL=<member-email>
```

The agent must use this email to resolve the Notion user and assign tasks. If the email is missing or cannot be resolved to a Notion user, stop immediately. Do not edit the repository.

## Phase 1 Forbidden Work

Do not perform any of the following regardless of task prompt instructions:

- Create a Student Web App or React/Next.js learner web app.
- Use FastAPI as the Phase 1 Backend API.
- Move AIM Engine calculations into Flutter, NestJS, admin UI, or any client.
- Calculate mastery, student level, weakness, difficulty, retention, or recommendations in any client.
- Expose AI provider keys, Supabase service-role keys, database credentials, or privileged backend credentials to any client.
- Use `response_time_seconds`, average response time, or speed score as a direct mastery, level, or difficulty-increase signal.
- Keep AI Teacher output unvalidated before delivery to any client.
- Perform unrelated cleanup or refactoring.
- Implement tasks not explicitly assigned.

Any task prompt that instructs forbidden work must be blocked, not executed.

## Required Pre-Checks Before Any Task

Before editing files, verify all of the following:

1. The task `Status` is exactly `Undone`.
2. The task `Assigned` field is empty.
3. The task is not already `In Progress` or `Done`.
4. No blocker comment exists on the task.
5. All dependencies are `Done` in Notion.
6. No dependency has an unresolved blocker comment.
7. The expected output files for all dependencies exist in the GitHub repository on `main`.
8. The local git working tree is clean.
9. The task does not require forbidden work as defined above.
10. The task has clear, defined output files.

If any check fails, skip the task and either choose another or document the blocker.

## Dependency Validation

A dependency is complete only when all of the following are true:

1. The dependency task exists in Notion.
2. The dependency `Status` is `Done`.
3. The dependency has no unresolved blocker comment.
4. The dependency output file(s) exist on the `main` branch of the GitHub repository.
5. The dependency output is not obviously in violation of Phase 1 non-negotiables.

If Notion shows `Done` but the output file is missing from GitHub, the dependency is incomplete. Trust the repository state over Notion status. Do not start the task.

## Task Claim Workflow

When an available task is found:

1. Re-verify immediately before claiming:
   - `Status = Undone`
   - `Assigned` is empty
   - All dependencies complete (Notion Done + output on GitHub)
   - No blocker comment
2. Set `Assigned` to the current agent/user using `TEAM_MEMBER_NOTION_EMAIL`.
3. Set `Status = In Progress`.
4. Re-fetch the task from Notion.
5. Confirm `Assigned` is now the current agent and `Status` is `In Progress`.

Do not edit any file until the task is confirmed assigned to the current agent.

If the task is no longer available after re-fetching (someone else claimed it), stop and pick another task.

## Git State Before Work

Before editing files:

```bash
git checkout main
git pull origin main
git status --short
```

If `git status --short` shows uncommitted changes, stop and report the blocker. Do not proceed with a dirty working tree.

## Execution Scope

After claiming the task:

1. Open `docs/tasks/phase_1_task_prompts.md`.
2. Locate the exact section for the assigned task ID (e.g., `#P1-003`).
3. Execute only that task.
4. Do not perform work from any other task section.
5. Do not perform unrelated cleanup or refactoring.
6. If a sub-step would create forbidden work, skip that sub-step and document the limitation in the Notion completion comment.

## Commit and Push Rules

Every completed task must be committed and pushed separately from any other task.

```bash
git status --short
git add <changed-files>
git commit -m "P1-XXX: <short task title>"
git push origin main
```

Commit message format: `P1-XXX: <short task title>` where `P1-XXX` is the exact task ID.

Examples:
```
git commit -m "P1-003: create phase 1 task execution rules"
git commit -m "P1-006: define final monorepo structure"
git commit -m "P1-016: create nestjs backend api skeleton"
```

Do not mark the Notion task `Done` until `git push` completes successfully. If `git push` fails, the task is not done.

## Notion Completion Workflow

After a successful push:

1. Re-open the task in Notion.
2. Confirm it is still assigned to the current agent.
3. Confirm `Status` is `In Progress`.
4. Add a completion comment containing:
   - Files created or updated
   - Commit hash
   - Checks or tests run
   - Any limitations or skipped sub-steps
5. Set `Status = Done`.
6. Keep `Assigned` filled. Do not remove the assignee after marking Done.

## Stop Conditions

Stop work immediately and add a blocker comment in Notion when:

- A task prompt instructs use of FastAPI as Phase 1 Backend API.
- A task prompt instructs creating a React/Next.js learner interface or Student Web App.
- A task prompt instructs moving AIM calculations into Flutter or any client.
- A task prompt instructs exposing AI provider keys or Supabase service-role keys to any client.
- A dependency task is not Done in Notion or its output is missing from GitHub.
- The local git working tree is dirty at task start.
- A higher-priority document (see hierarchy above) contradicts the task prompt.
- `git push` fails and cannot be resolved.

Do not mark blocked work as Done. Do not skip adding a blocker comment. Do not silently abandon a claimed task.

## Blocker Handling

When a task is blocked:

1. Keep the task `Assigned` to the current agent.
2. Keep `Status = In Progress`.
3. Add a blocker comment that documents:
   - What blocked the task
   - Which dependency or file is missing
   - Which command failed (if applicable)
   - What must happen before the task can resume

Do not mark blocked work as Done. Do not remove yourself from `Assigned`.

## Done Test Requirements

A task satisfies its Done Test only when:

| Check | Required State |
|---|---|
| Output file(s) | Exist on `main` branch in GitHub |
| Status | `Done` in Notion |
| Assigned | Filled (not empty) |
| Notion comment | Added with files, commit hash, checks, and limitations |
| `git push` | Succeeded before `Done` was set |
| No Student Web App | Created |
| No FastAPI | Used as Phase 1 Backend API |
| No client AIM logic | Added |
| No exposed secrets | Committed |
| No speed-as-mastery | Implemented |

If any row above fails, the task is not complete.

## Task Selection Summary

An agent may take a task only when:

| Check | Required State |
|---|---|
| Status | `Undone` |
| Assigned | Empty |
| Dependencies | `Done` in Notion |
| Dependency outputs | Present on `main` in GitHub |
| Blocker comments | None |
| Local git working tree | Clean |
| Forbidden work | Not required by task |

An agent must skip a task when:

| Check | Skip Condition |
|---|---|
| Status | `In Progress` or `Done` |
| Assigned | Not empty |
| Dependency | Missing or not `Done` |
| Dependency output | Not on GitHub `main` |
| Blocker comment | Exists |
| Local git tree | Dirty |
| Forbidden work | Required |

## Final Report Format

At the end of every task, report:

```
Task: P1-XXX — <title>
Status: Done / Blocked

Files changed:
- <file>

Commit: <hash>
Push: succeeded / failed

Checks:
- <check result>

Notion:
- Assigned to <user/email>
- Status set to Done / In Progress
```
