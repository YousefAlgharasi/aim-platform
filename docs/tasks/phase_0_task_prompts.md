# AIM Phase 0 Task Prompts

This file is the source of truth for detailed Codex execution prompts for Phase 0.

Notion is only the task tracker. Notion should contain:
- ID
- Task
- Dependency
- Status
- Priority
- Description
- Short Codex Prompt reference to this file

Detailed instructions live here.

## Team Workflow

1. Open the Phase 0 Tasks database in Notion.
2. Choose any task with Status = `Undone`.
3. Check dependencies in Notion.
4. Set the task to `In Progress`.
5. Open this file.
6. Search for the task ID, for example `P0-005`.
7. Copy the full Codex Execution Prompt for that task.
8. Run it in Codex inside the GitHub repository.
9. Codex must inspect the repo and verify dependency task outputs before doing work.
10. When tests/checks pass, set the Notion task to `Done`.

## Parallel Work Rule

The team can work together because each task has explicit dependencies. A developer may take any task whose dependencies are already `Done`.

Do not wait for a fixed owner. There are no permanent task owners.

## Required Notion Status Values

- `Undone`
- `In Progress`
- `Done`

## Global Phase 0 Rules

- Phase 0 is planning and documentation only.
- Do not implement app/backend/runtime code.
- Do not create Student Web App.
- Do not move AIM algorithm into Flutter.
- Do not expose AI provider keys to clients.
- Keep learner behavior analysis educational, not clinical.

---

# Codex Master Instruction for Picking Tasks from Notion

Use this instruction when you want Codex to select and execute an available task:

```text
You are Codex working on the AIM GitHub repository.

Your task is to select one available Phase 0 task from Notion and execute it using the local Markdown prompt file.

Notion workspace/database:
https://app.notion.com/p/e4f16b32fab045f7b684a0150950ea00?v=582e0ce34d904b80a8cbe5104408cd22

Detailed prompt file:
docs/tasks/phase_0_task_prompts.md

Workflow:
1. Open the Notion Phase 0 Tasks database.
2. Find a task with Status = Undone.
3. Check its Dependency field.
4. Confirm every dependency task is Done in Notion.
5. If dependencies are not Done, choose another available task.
6. When you choose a task, set its Status to In Progress.
7. In the repo, open docs/tasks/phase_0_task_prompts.md.
8. Search for the selected task ID.
9. Follow the exact Codex Execution Prompt for that task.
10. Before editing files, inspect the repo and verify whether the task or dependency outputs already exist.
11. Execute only the selected task.
12. Run the Done Test / Verification section from the prompt.
13. If successful, set the Notion task Status to Done.
14. If blocked, keep Status as In Progress and write the blocker clearly in Notion.

Important:
- Do not take a task if dependencies are not done.
- Do not work on multiple tasks at the same time unless explicitly instructed.
- Do not implement code during Phase 0.
- Do not create a Student Web App.
- Do not move AIM Engine logic into Flutter.
```

---

# Phase 0 Task Prompts

## P0-001 — Confirm AIM Product Vision and Non-Negotiables

**Priority:** P0  
**Dependencies:** None  
**Output files:** `docs/product/vision.md; docs/product/non-negotiables.md`

### Task Description
Define the final AIM product vision, platform components, exclusions, and hard technical/product rules.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-001

TASK NAME:
Confirm AIM Product Vision and Non-Negotiables

TASK DESCRIPTION:
Define the final AIM product vision, platform components, exclusions, and hard technical/product rules.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: None

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/vision.md; docs/product/non-negotiables.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/vision.md; docs/product/non-negotiables.md`
- Dependency outputs checked: `None`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-002 — Create Phase 0 Readiness Checklist

**Priority:** P0  
**Dependencies:** P0-001  
**Output files:** `docs/product/phase-0-readiness-checklist.md`

### Task Description
Define the checklist that determines when Phase 0 is complete and Phase 1 may start.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-002

TASK NAME:
Create Phase 0 Readiness Checklist

TASK DESCRIPTION:
Define the checklist that determines when Phase 0 is complete and Phase 1 may start.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-001

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/phase-0-readiness-checklist.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/phase-0-readiness-checklist.md`
- Dependency outputs checked: `P0-001`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-003 — Define User Roles and Permissions Matrix

**Priority:** P0  
**Dependencies:** P0-001  
**Output files:** `docs/product/roles-and-permissions.md`

### Task Description
Define all user roles, access boundaries, and permission rules for MVP and future expansion.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-003

TASK NAME:
Define User Roles and Permissions Matrix

TASK DESCRIPTION:
Define all user roles, access boundaries, and permission rules for MVP and future expansion.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-001

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/roles-and-permissions.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/roles-and-permissions.md`
- Dependency outputs checked: `P0-001`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-004 — Define MVP Scope and Out-of-Scope Boundary

**Priority:** P0  
**Dependencies:** P0-001  
**Output files:** `docs/product/mvp-scope.md; docs/product/out-of-scope.md`

### Task Description
Separate MVP scope from future scope to prevent implementation scope creep.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-004

TASK NAME:
Define MVP Scope and Out-of-Scope Boundary

TASK DESCRIPTION:
Separate MVP scope from future scope to prevent implementation scope creep.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-001

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/mvp-scope.md; docs/product/out-of-scope.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/mvp-scope.md; docs/product/out-of-scope.md`
- Dependency outputs checked: `P0-001`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-005 — Define Student Journey and Learning Session Flow

**Priority:** P0  
**Dependencies:** P0-003, P0-004  
**Output files:** `docs/journeys/student-journey.md`

### Task Description
Define the student journey from onboarding to placement, lesson, AI tutoring, attempts, feedback, progress, and review.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-005

TASK NAME:
Define Student Journey and Learning Session Flow

TASK DESCRIPTION:
Define the student journey from onboarding to placement, lesson, AI tutoring, attempts, feedback, progress, and review.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-003, P0-004

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/journeys/student-journey.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/journeys/student-journey.md`
- Dependency outputs checked: `P0-003, P0-004`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-006 — Define Parent Journey and Weekly Report Scope

**Priority:** P1  
**Dependencies:** P0-003, P0-004  
**Output files:** `docs/journeys/parent-journey.md`

### Task Description
Define parent access, child linking, progress reports, alerts, and privacy boundaries.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-006

TASK NAME:
Define Parent Journey and Weekly Report Scope

TASK DESCRIPTION:
Define parent access, child linking, progress reports, alerts, and privacy boundaries.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-003, P0-004

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/journeys/parent-journey.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/journeys/parent-journey.md`
- Dependency outputs checked: `P0-003, P0-004`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-007 — Define Admin and Content Manager Journey

**Priority:** P0  
**Dependencies:** P0-003, P0-004  
**Output files:** `docs/journeys/admin-journey.md; docs/journeys/content-manager-journey.md`

### Task Description
Define admin dashboard and content manager workflows for managing students, content, questions, analytics, and settings.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-007

TASK NAME:
Define Admin and Content Manager Journey

TASK DESCRIPTION:
Define admin dashboard and content manager workflows for managing students, content, questions, analytics, and settings.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-003, P0-004

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/journeys/admin-journey.md; docs/journeys/content-manager-journey.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/journeys/admin-journey.md; docs/journeys/content-manager-journey.md`
- Dependency outputs checked: `P0-003, P0-004`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-008 — Define Human Reviewer Journey

**Priority:** P1  
**Dependencies:** P0-003, P0-004  
**Output files:** `docs/journeys/human-reviewer-journey.md`

### Task Description
Define reviewer workflow for disputed or high-stakes grading and future review queue behavior.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-008

TASK NAME:
Define Human Reviewer Journey

TASK DESCRIPTION:
Define reviewer workflow for disputed or high-stakes grading and future review queue behavior.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-003, P0-004

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/journeys/human-reviewer-journey.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/journeys/human-reviewer-journey.md`
- Dependency outputs checked: `P0-003, P0-004`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-009 — Draft English Skill Tree for MVP

**Priority:** P0  
**Dependencies:** P0-004  
**Output files:** `docs/learning/english-skill-tree.md`

### Task Description
Create the first MVP English skill tree for beginner learners with skill IDs, prerequisites, and categories.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-009

TASK NAME:
Draft English Skill Tree for MVP

TASK DESCRIPTION:
Create the first MVP English skill tree for beginner learners with skill IDs, prerequisites, and categories.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-004

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/learning/english-skill-tree.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/learning/english-skill-tree.md`
- Dependency outputs checked: `P0-004`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-010 — Define Placement Test Strategy and Rules

**Priority:** P0  
**Dependencies:** P0-009  
**Output files:** `docs/learning/placement-test-strategy.md`

### Task Description
Define placement test goal, levels, question distribution, scoring, routing rules, and fallback cases.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-010

TASK NAME:
Define Placement Test Strategy and Rules

TASK DESCRIPTION:
Define placement test goal, levels, question distribution, scoring, routing rules, and fallback cases.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-009

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/learning/placement-test-strategy.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/learning/placement-test-strategy.md`
- Dependency outputs checked: `P0-009`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-011 — Define Lesson Content Structure

**Priority:** P0  
**Dependencies:** P0-009  
**Output files:** `docs/content/lesson-content-structure.md`

### Task Description
Define lesson structure, required fields, content blocks, practice blocks, AI teacher hooks, and metadata.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-011

TASK NAME:
Define Lesson Content Structure

TASK DESCRIPTION:
Define lesson structure, required fields, content blocks, practice blocks, AI teacher hooks, and metadata.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-009

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/content/lesson-content-structure.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/content/lesson-content-structure.md`
- Dependency outputs checked: `P0-009`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-012 — Define Question Bank Standards

**Priority:** P1  
**Dependencies:** P0-009, P0-010, P0-011  
**Output files:** `docs/content/question-bank-standards.md`

### Task Description
Define how questions are authored, tagged, validated, versioned, and connected to skills and placement/lessons.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-012

TASK NAME:
Define Question Bank Standards

TASK DESCRIPTION:
Define how questions are authored, tagged, validated, versioned, and connected to skills and placement/lessons.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-009, P0-010, P0-011

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/content/question-bank-standards.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/content/question-bank-standards.md`
- Dependency outputs checked: `P0-009, P0-010, P0-011`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-013 — Define AI Teacher Behavior Rules

**Priority:** P0  
**Dependencies:** P0-005, P0-009, P0-011  
**Output files:** `docs/ai-teacher/behavior-rules.md`

### Task Description
Define how the AI Teacher explains, asks, corrects, adapts, and stays within educational safety rules.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-013

TASK NAME:
Define AI Teacher Behavior Rules

TASK DESCRIPTION:
Define how the AI Teacher explains, asks, corrects, adapts, and stays within educational safety rules.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-005, P0-009, P0-011

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/ai-teacher/behavior-rules.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/ai-teacher/behavior-rules.md`
- Dependency outputs checked: `P0-005, P0-009, P0-011`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-014 — Define AIM Engine Boundary and Input Output Contract

**Priority:** P0  
**Dependencies:** P0-005, P0-009, P0-013  
**Output files:** `docs/aim-engine/boundary-and-io-contract.md`

### Task Description
Define what data is sent to AIM Engine, what it returns, and what must not run in Flutter.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-014

TASK NAME:
Define AIM Engine Boundary and Input Output Contract

TASK DESCRIPTION:
Define what data is sent to AIM Engine, what it returns, and what must not run in Flutter.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-005, P0-009, P0-013

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/aim-engine/boundary-and-io-contract.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/aim-engine/boundary-and-io-contract.md`
- Dependency outputs checked: `P0-005, P0-009, P0-013`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-015 — Define Data Captured During Learning Session

**Priority:** P0  
**Dependencies:** P0-005, P0-014  
**Output files:** `docs/data/session-data-capture.md`

### Task Description
Define every data point captured during lessons and attempts for backend, AIM Engine, analytics, and reports.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-015

TASK NAME:
Define Data Captured During Learning Session

TASK DESCRIPTION:
Define every data point captured during lessons and attempts for backend, AIM Engine, analytics, and reports.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-005, P0-014

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/data/session-data-capture.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/data/session-data-capture.md`
- Dependency outputs checked: `P0-005, P0-014`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-016 — Draft Initial Data Model and Entity List

**Priority:** P0  
**Dependencies:** P0-003, P0-015  
**Output files:** `docs/data/initial-data-model.md`

### Task Description
Draft the initial database/entity model for users, content, attempts, AIM states, recommendations, reports, and audit logs.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-016

TASK NAME:
Draft Initial Data Model and Entity List

TASK DESCRIPTION:
Draft the initial database/entity model for users, content, attempts, AIM states, recommendations, reports, and audit logs.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-003, P0-015

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/data/initial-data-model.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/data/initial-data-model.md`
- Dependency outputs checked: `P0-003, P0-015`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-017 — Draft API Planning Baseline

**Priority:** P1  
**Dependencies:** P0-014, P0-016  
**Output files:** `docs/api/api-planning-baseline.md`

### Task Description
Create a planning-level API baseline before implementation for mobile, admin, backend, AIM Engine, and AI Teacher gateway.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-017

TASK NAME:
Draft API Planning Baseline

TASK DESCRIPTION:
Create a planning-level API baseline before implementation for mobile, admin, backend, AIM Engine, and AI Teacher gateway.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-014, P0-016

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/api/api-planning-baseline.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/api/api-planning-baseline.md`
- Dependency outputs checked: `P0-014, P0-016`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-018 — Define Mobile App Sitemap and Navigation Scope

**Priority:** P1  
**Dependencies:** P0-005, P0-006, P0-017  
**Output files:** `docs/mobile/mobile-sitemap.md`

### Task Description
Define mobile app screens, navigation flow, feature boundaries, and MVP/non-MVP screens.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-018

TASK NAME:
Define Mobile App Sitemap and Navigation Scope

TASK DESCRIPTION:
Define mobile app screens, navigation flow, feature boundaries, and MVP/non-MVP screens.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-005, P0-006, P0-017

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/mobile/mobile-sitemap.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/mobile/mobile-sitemap.md`
- Dependency outputs checked: `P0-005, P0-006, P0-017`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-019 — Define Admin Dashboard Sitemap and Modules

**Priority:** P1  
**Dependencies:** P0-007, P0-008, P0-017  
**Output files:** `docs/admin/admin-dashboard-sitemap.md`

### Task Description
Define admin dashboard modules, pages, tables, filters, actions, and MVP admin boundaries.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-019

TASK NAME:
Define Admin Dashboard Sitemap and Modules

TASK DESCRIPTION:
Define admin dashboard modules, pages, tables, filters, actions, and MVP admin boundaries.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-007, P0-008, P0-017

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/admin/admin-dashboard-sitemap.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/admin/admin-dashboard-sitemap.md`
- Dependency outputs checked: `P0-007, P0-008, P0-017`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-020 — Define Notification Scope and Rules

**Priority:** P2  
**Dependencies:** P0-005, P0-006, P0-018  
**Output files:** `docs/product/notification-scope.md`

### Task Description
Define notification types, triggers, user controls, parent notifications, and MVP limits.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-020

TASK NAME:
Define Notification Scope and Rules

TASK DESCRIPTION:
Define notification types, triggers, user controls, parent notifications, and MVP limits.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-005, P0-006, P0-018

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/notification-scope.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/notification-scope.md`
- Dependency outputs checked: `P0-005, P0-006, P0-018`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-021 — Define Analytics and Reports Scope

**Priority:** P1  
**Dependencies:** P0-005, P0-007, P0-015, P0-016  
**Output files:** `docs/analytics/reports-scope.md`

### Task Description
Define student, parent, admin, and AIM analytics reports for MVP.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-021

TASK NAME:
Define Analytics and Reports Scope

TASK DESCRIPTION:
Define student, parent, admin, and AIM analytics reports for MVP.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-005, P0-007, P0-015, P0-016

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/analytics/reports-scope.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/analytics/reports-scope.md`
- Dependency outputs checked: `P0-005, P0-007, P0-015, P0-016`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-022 — Define AI Safety Privacy and Data Rules

**Priority:** P0  
**Dependencies:** P0-003, P0-013, P0-015  
**Output files:** `docs/security/ai-safety-privacy-rules.md`

### Task Description
Define safety, privacy, data minimization, AI teacher constraints, and educational-only behavior analysis rules.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-022

TASK NAME:
Define AI Safety Privacy and Data Rules

TASK DESCRIPTION:
Define safety, privacy, data minimization, AI teacher constraints, and educational-only behavior analysis rules.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-003, P0-013, P0-015

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/security/ai-safety-privacy-rules.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/security/ai-safety-privacy-rules.md`
- Dependency outputs checked: `P0-003, P0-013, P0-015`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-023 — Create Risk Register and Open Decisions Log

**Priority:** P1  
**Dependencies:** P0-001 to P0-022  
**Output files:** `docs/product/risk-register.md; docs/product/open-decisions.md`

### Task Description
Collect product, technical, AI, data, cost, security, and team workflow risks plus unresolved decisions.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-023

TASK NAME:
Create Risk Register and Open Decisions Log

TASK DESCRIPTION:
Collect product, technical, AI, data, cost, security, and team workflow risks plus unresolved decisions.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-001 to P0-022

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/risk-register.md; docs/product/open-decisions.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/risk-register.md; docs/product/open-decisions.md`
- Dependency outputs checked: `P0-001 to P0-022`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.

## P0-024 — Phase 0 Final Review and Lock

**Priority:** P0  
**Dependencies:** P0-001 to P0-023  
**Output files:** `docs/product/phase-0-final-review.md`

### Task Description
Review all Phase 0 outputs and produce a go/no-go decision for Phase 1 System Foundation.

### Codex Execution Prompt
```text
You are Codex working inside the AIM GitHub repository.

TASK ID:
P0-024

TASK NAME:
Phase 0 Final Review and Lock

TASK DESCRIPTION:
Review all Phase 0 outputs and produce a go/no-go decision for Phase 1 System Foundation.

IMPORTANT WORKFLOW RULES:
1. Do not start implementation immediately.
2. First inspect the repository structure and existing docs.
3. Check whether this task is already done.
4. Check whether dependency tasks are already done by verifying their expected output files and content.
5. If a dependency is missing or incomplete, stop and report exactly what is missing. Do not create unrelated files to bypass dependencies.
6. If dependencies are complete, execute only this task.
7. Keep the work documentation-focused because this is Phase 0.
8. Do not implement backend, Flutter, admin dashboard, AIM Engine code, database migrations, or API runtime code in Phase 0.
9. Do not create a Student Web App.
10. Do not assign task ownership in code. Team members choose available tasks from Notion.
11. Keep AIM project rules:
    - Flutter uses feature-first architecture later.
    - Backend uses simplified feature-based architecture later.
    - AIM algorithm runs only in Python/backend AIM Engine.
    - Flutter consumes AIM outputs only.
    - AI behavior analysis must stay educational/behavioral, not clinical or medical diagnosis.
    - AI provider keys must never be exposed to client apps.

DEPENDENCY CHECK:
Dependencies for this task: P0-001 to P0-023

Before doing the task:
- Search the repo for existing Phase 0 docs.
- Verify dependency outputs exist and are meaningful.
- If this task output already exists, improve it only if incomplete.
- If there is conflict between docs, preserve existing project decisions and add an "Open Decision" note instead of silently changing direction.

FILES TO CREATE OR UPDATE:
docs/product/phase-0-final-review.md

HOW TO DO THE TASK:
1. Create the required folder(s) if missing.
2. Create or update the output document(s).
3. Use clear Markdown headings.
4. Include practical bullet points and tables where helpful.
5. Include assumptions, decisions, non-goals, and open questions.
6. Cross-reference related Phase 0 docs when relevant.
7. Keep wording implementation-ready so Phase 1 tasks can be created from it.

DONE TEST / VERIFICATION:
After finishing, verify:
- All required output files exist.
- Each output file has a title, purpose, scope, and acceptance-ready content.
- Dependencies were checked and noted.
- No runtime source code was created.
- No Student Web App was added.
- No AIM algorithm code was moved into Flutter.
- Markdown has no empty placeholder sections.
- Run this command if available:
  git diff --stat
- Report:
  1. Files created/updated
  2. Dependencies checked
  3. Any open questions
  4. Whether the task is ready to mark Done in Notion

NOTION UPDATE RULE:
When the task is complete, update the matching Notion task status to Done.
If blocked, leave status as In Progress and write the blocker in the task notes/comment.
```

### Done Test Summary
- Output file(s) exist: `docs/product/phase-0-final-review.md`
- Dependency outputs checked: `P0-001 to P0-023`
- No code implementation added.
- Task can be marked `Done` in Notion only after the verification report is clean.
