# Phase 6 — Task Execution Rules

**Phase:** 6  
**Task:** P6-002  
**Branch:** `phase6/P6-002-phase-6-task-rules`  
**Dependency:** P6-001 (Student Mobile MVP Charter — Done)  
**Output:** `docs/phase-6/task-execution-rules.md`

---

## 1. Purpose

This document defines how agents claim, execute, validate, and close Phase 6 tasks. Every contributor must follow these rules precisely. Deviation is a stop condition.

---

## 2. Task Lifecycle

### Step 1 — Pick a Task

- Open the Phase 6 Notion database.
- Select one task where **Status = Undone** and **Assigned is empty**.
- Do not pick a task that is already assigned, In Progress, Done, or Blocked.
- Work one task at a time. Do not batch tasks.

### Step 2 — Verify Dependencies

- Read the task's **Dependency** field.
- For each listed dependency, confirm its Status = Done in Notion.
- If any dependency is not Done: **stop**. Do not proceed. Do not set the task to In Progress.
- If a dependency's output file is declared, confirm the file exists in the repository on the main branch.

### Step 3 — Verify the Prompt Section

- Open `docs/tasks/phase6_prompts.md`.
- Confirm a section matching `#<TASK-ID>` exists.
- If the section is missing: **stop**. Do not improvise the task.

### Step 4 — Claim the Task

- Set **Assigned** = `t7emonster0@gmail.com` in Notion.
- Set **Status** = `In Progress` in Notion.
- Both updates must happen before any code or file work begins.

### Step 5 — Use the Exact Branch

- Check out the branch name listed in the task's **Branch** field exactly as written.
- Do not rename, abbreviate, or alter the branch name.
- Branch from `main` (or the current default branch).

### Step 6 — Execute Against the Prompt

- Follow only the instructions in the `#<TASK-ID>` section of `docs/tasks/phase6_prompts.md`.
- Do not do unrelated cleanup, refactoring, or work from other tasks.
- Produce only the declared **Output** file(s).

### Step 7 — Commit File-by-File

- Stage and commit each output file individually.
- Commit message format: `<TASK-ID>: <short description>`
- Example: `P6-002: create phase 6 task execution rules`
- Do not bundle unrelated files in a single commit.
- Do not commit secrets, credentials, API keys, or tokens.

### Step 8 — Run Done Test

Before pushing, verify all Done Test conditions from the prompt:

- [ ] Expected output file(s) exist at the declared path.
- [ ] Task is limited to the declared output only.
- [ ] UI tasks: all UI uses AIM Mobile Design System tokens and widgets.
- [ ] UI tasks: RTL/Arabic layout is verified on every screen.
- [ ] Flutter does not calculate backend-owned learning values.
- [ ] Flutter does not call AIM Engine or any AI provider directly.
- [ ] No secrets are committed.
- [ ] Checks are run (if applicable) or documented as N/A.

### Step 9 — Push the Branch

- Push to `origin/<branch-name>`.
- Confirm the push succeeds with exit code 0.
- If push fails: investigate, fix, and retry. Do not mark Done on a failed push.

### Step 10 — Add Completion Comment

- In Notion, insert a completion comment on the task page with:
  - Files created or modified.
  - Branch name.
  - Commit hash(es).
  - Done Test results (pass/fail per item).
  - Limitations, if any.

### Step 11 — Mark Done

- Set **Status** = `Done` in Notion.
- This is the final step. Do not set Done before the push succeeds.

---

## 3. Stop Conditions

Stop immediately and do not proceed if any of the following are true:

| Condition | Action |
|---|---|
| Task is already Assigned | Stop. Pick a different task. |
| Task Status is not Undone | Stop. Pick a different task. |
| A dependency is not Done | Stop. Wait for dependency. |
| A dependency output file is missing | Stop. Escalate. |
| The prompt section is missing in `phase6_prompts.md` | Stop. Do not improvise. |
| Secrets or credentials are found in task inputs | Stop. Do not commit. |
| The task would cause Flutter to call AIM Engine or AI providers | Stop. Redesign to backend call. |
| The task would cause Flutter to calculate learning values | Stop. Move logic to backend. |
| UI work ignores the AIM Mobile Design System | Stop. Use design system. |
| UI work ignores RTL/Arabic rules | Stop. Fix layout. |
| Push fails | Stop marking Done. Fix and retry. |

---

## 4. Quality Rules

### 4.1 Secrets

- Never commit API keys, tokens, passwords, connection strings, or private credentials.
- Scan output files before committing: `grep -r "sk-\|ghp_\|AIza\|Bearer " <file>` (or equivalent).
- If a secret is found, remove it and use environment variables or secure config references.

### 4.2 Scope Discipline

- Each task produces exactly its declared output. Nothing more.
- Do not fix unrelated bugs, rename unrelated files, or refactor code outside the task scope.
- If you notice a problem outside the task scope, log it separately.

### 4.3 Flutter Authority Boundary

- Flutter is a display client. It calls backend APIs and renders responses.
- Flutter must not contain business logic for: scoring, mastery, weaknesses, difficulty, recommendations, or review schedules.
- If a task appears to require such logic in Flutter, stop and escalate.

### 4.4 Design System Compliance

- All colors must come from `AimColors` or equivalent theme token class.
- All typography must use `AimTextStyles` or equivalent.
- All spacing must use `AimSpacing` or equivalent constants.
- Shared components (buttons, cards, inputs, etc.) must use the widget library.
- Hard-coded style values (`Color(0xFF...)`, `EdgeInsets.all(16)`, `TextStyle(fontSize: 14)`) in feature code are a violation.

### 4.5 RTL/Arabic Compliance

- Use `Directionality` or locale-driven direction — never `TextDirection.ltr` forced in feature code.
- Use `EdgeInsetsDirectional` for asymmetric padding.
- Use `CrossAxisAlignment.start` (not `.end`) with RTL awareness.
- Mirror icons that imply direction (back arrows, navigation chevrons).
- Test Arabic text rendering in every screen before marking Done.

---

## 5. Task Execution Summary (Quick Reference)

```
1. Pick → Status=Undone, Assigned=empty
2. Verify → All dependencies Done, output files exist
3. Verify → Prompt section #P6-XXX exists
4. Claim → Set Assigned + Status=In Progress
5. Branch → Use exact branch name from task
6. Execute → Follow prompt, produce declared output only
7. Commit → File-by-file, task ID in message, no secrets
8. Done Test → All checklist items pass
9. Push → Confirm success
10. Comment → Add completion note to Notion
11. Done → Set Status=Done
```

---

## 6. References

- Phase 6 Charter: `docs/phase-6/student-mobile-mvp-charter.md`
- Phase 6 Prompts: `docs/tasks/phase6_prompts.md`
- Notion Database: https://app.notion.com/p/17276463d164480fa204dc5b524bb012
- Repository: https://github.com/YousefAlgharasi/aim-platform

---

*Task execution rules created: P6-002 | Branch: phase6/P6-002-phase-6-task-rules*
