# Phase 19 — AI Agent Execution Instructions

## Git Identity (configure FIRST before any work)

```
git config user.name 'GHOST3030'
git config user.email 'ahmedalalawi41@gmail.com'
```

## Branch

Create and work on a single branch for all Phase 19 tasks:

```
git checkout -b phase19/placement-production-readiness
```

All commits go on this branch. Do NOT create separate branches per task.

## Task Prompts Location

```
docs/tasks/phase_19_task_prompts.md
```

This file contains 10 self-contained task prompts: P19-001 through P19-010.

## Execution Rules

1. Read `docs/tasks/phase_19_task_prompts.md` fully before starting.
2. Execute tasks **in order**: P19-001, P19-002, P19-003, P19-004, P19-005, P19-006, P19-007, P19-008, P19-009, P19-010.
3. For each task:
   - Read the task section from the prompts file (from `#P19-XXX` to the next `---`).
   - Follow every instruction in that section: read the listed files, make the described changes, verify the done test.
   - Commit with message format: `P19-XXX: <task title>`.
   - Do NOT push yet — just commit locally.
   - Move to the next task.
4. After ALL 10 tasks are committed, push the branch once:
   ```
   git push -u origin phase19/placement-production-readiness
   ```
5. Do NOT create a pull request.

## Execution Order

| Order | Task | Title |
|---|---|---|
| 1 | P19-001 | Backend Placement Rows Safety Audit |
| 2 | P19-002 | Extract Scoring Constants to Config |
| 3 | P19-003 | Flutter Design System Token Adoption |
| 4 | P19-004 | Admin Placement Write Endpoints |
| 5 | P19-005 | Student-Web Placement API Path Alignment |
| 6 | P19-006 | Retake Cooldown to Environment Config |
| 7 | P19-007 | Placement Error Codes for i18n |
| 8 | P19-008 | Placement Analytics Service |
| 9 | P19-009 | Placement Integration Tests |
| 10 | P19-010 | Placement Production Sign-Off |

## Commit Format

Every commit message must start with the task ID:

```
P19-001: guard unprotected result.rows[0] accesses in placement services
P19-002: extract scoring constants to placement-scoring.config.ts
P19-003: replace hardcoded styles with AIM design tokens in placement pages
...
```

## What NOT to do

- Do NOT push after each task — push only once at the end.
- Do NOT create pull requests.
- Do NOT skip tasks or change the order.
- Do NOT modify files outside the scope defined in each task.
- Do NOT commit secrets, API keys, or credentials.
- Do NOT use Claude/Anthropic identity in commits — use GHOST3030.
- Do NOT ignore the "Scope limits" or "Done test" sections in each task prompt.

## Verification

After all tasks are committed and before pushing, run:

```
cd services/backend-api && npm run test -- --testPathPattern=placement
```

If tests fail, fix them before pushing. If tests cannot run (missing dependencies/DB), note it in the P19-010 sign-off document.

## Start

Begin by reading `docs/tasks/phase_19_task_prompts.md`, then execute P19-001.
