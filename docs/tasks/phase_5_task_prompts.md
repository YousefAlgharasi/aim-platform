# AIM Phase 5 Task Prompts — AIM Engine Integration

Source path: `docs/tasks/phase_5_task_prompts.md`

This file is the execution prompt source for AIM Platform Phase 5 tasks. It is designed to match the Phase 5 Notion task database fields for `ID`, `Task`, `Branch`, `Output`, `Dependency`, `Priority`, and `AgentPrompt`.

## Phase 5 Direction

Phase 5 is only about Backend-to-AIM Engine integration. The Backend API calls the Python AIM Engine internally. Clients must never call AIM Engine directly and must never calculate mastery, weakness, difficulty, recommendations, review schedules, or AIM decisions.

### In Scope

- AIM Engine readiness
- Backend AIM adapter
- Backend-to-AIM contracts
- Session/attempt input mapping
- AIM response mapping
- Student skill state persistence
- Weakness, difficulty, recommendations, review schedules, frustration signals, and session summary persistence
- AIM result APIs protected by backend permissions
- Integration, contract, security, privacy, failure-mode, and output-completeness reviews

### Out of Scope

- AI Teacher
- AI Prompt Management
- AI Cost Control
- Student Mobile App MVP screens
- Student Web App
- Parent Dashboard
- Payments
- Voice AI
- Full progress dashboard UI
- Human review workflow
- Quizzes / exams

---
# AIM Phase 5 Master Instruction

You are working on AIM Platform — Phase 5: AIM Engine Integration.

Your job is to complete one task at a time from the Phase 5 Notion task database and follow the exact prompt section for that task.

Repository:

https://github.com/YousefAlgharasi/aim-platform

Phase 5 Notion Tasks Database:

https://app.notion.com/p/66badd6f20994a849de64da65f2e8a66

Phase 5 task prompt file:

docs/tasks/phase_5_task_prompts.md

Before starting, prepare your Notion email:

TEAM_MEMBER_NOTION_EMAIL=<your-notion-email>


GitHub commit author/user expected for this workflow:

YousefAlgharasi

Important security rule:

Never paste GitHub PATs, Supabase keys, service-role keys, database credentials, API keys, OpenAI keys, AI provider keys, or production secrets into prompts, comments, commits, docs, logs, or chat messages.

---

## 1. Phase 5 Scope

Phase 5 is only about:

AIM Engine Integration
Backend-to-AIM internal communication
AIM Engine health checks
AIM Engine request schemas
AIM Engine response schemas
Backend AIM adapter
Backend AIM pipeline
Session input contract
Attempt input contract
AIM Engine response contract
Student skill state updates
Mastery update persistence
Weakness update persistence
Difficulty decision persistence
Recommendation output persistence
Review schedule persistence
Frustration / emotional signal persistence
Session summary persistence
AIM audit logging
AIM result APIs
AIM integration tests
No-client-AIM regression checks

The Backend sends structured session/attempt data to the AIM Engine.

The AIM Engine returns structured learning decisions.

The Backend persists those decisions.

Clients must never call the AIM Engine directly.

---

## 2. Out of Scope

Do not work on:

AI Teacher
AI Prompt Management
AI Cost Control
Student Mobile App MVP screens
Student Web App
Parent Dashboard
Admin Analytics Dashboard
Payments
Voice AI
Full progress dashboard UI
Human review workflow
Quizzes / exams
Placement test execution
Curriculum CMS changes unless required by dependency validation
Lesson delivery UI
Practice UI

If a task seems to require one of these excluded areas, stop and report a blocker.

---

## 3. Critical Phase 5 Rules

Backend is the only allowed caller of the AIM Engine.

Flutter must not call the AIM Engine.

Admin Dashboard must not call the AIM Engine.

Flutter must not calculate:

mastery
level
weakness
difficulty
recommendation
review schedule
frustration score
learning decision

Admin Dashboard must not calculate:

mastery
weakness
difficulty
recommendation
AIM decisions

AIM Engine must not be exposed publicly to clients.

AIM Engine communication must be backend-internal only.

AIM Engine errors must not break the student experience unsafely.

No secrets may be committed.

No AI provider keys may be exposed.

No OpenAI or external AI provider integration belongs in Phase 5 unless the exact task explicitly says so.

AI Teacher belongs to a later phase.

---

## 4. Pick One Task Only

Open the Notion Phase 5 Tasks database.

Choose only a task where:

Status = Undone
Assigned = empty

Do not take a task if:

Status = In Progress
Status = Done
Status = Blocked
Assigned is not empty
A blocker comment exists
Dependency is missing
Dependency is not Done
Dependency output is not pushed to GitHub

Never take a task already assigned to someone else.

Never work on more than one task in the same run.

---

## 5. Before Starting Any Task, Summarize It

Before executing the task, write a short task summary.

Task Summary format:

Task Summary — P5-XXX

Task: <task title>

Purpose: <what this task achieves>

Expected output: <file or feature output>

Dependencies checked:

* <dependency 1>
* <dependency 2>

Scope confirmation:

* AIM Engine Integration only: yes/no
* Backend-only AIM access: yes/no/not applicable
* No client-side AIM logic: yes/no
* AI Teacher excluded: yes/no
* Secrets excluded: yes/no

Planned files:

* <file/path>
* <file/path>

Do not start implementation until the task summary is clear.

---

## 6. Check Dependencies Before Claiming

Before assigning the task to yourself, check the Dependency field.

A dependency is complete only if:

1. The dependency task exists in Notion.
2. The dependency Status is Done.
3. The dependency has no unresolved blocker comment.
4. The dependency expected output exists in GitHub.
5. The dependency output is pushed to main/default branch.

If a dependency is incomplete, skip the task and choose another available task.

If Notion says a dependency is Done but the expected file is missing from GitHub, treat it as incomplete.

---

## 7. Claim the Task in Notion

Before editing files:

1. Re-check that Status = Undone.
2. Re-check that Assigned = empty.
3. Re-check that all dependencies are complete.
4. Assign the task to yourself using TEAM_MEMBER_NOTION_EMAIL.
5. Set Status = In Progress.
6. Re-open the task and confirm:

   * Assigned = you
   * Status = In Progress

Do not edit files before the task is assigned to you.

---

## 8. Create and Use the Task Branch

Every task has a Branch value in Notion.

Use exactly that branch.

Example:

git checkout main
git pull origin main
git checkout -b phase5/P5-001-aim-engine-integration-charter

If the branch already exists:

git checkout phase5/P5-001-aim-engine-integration-charter
git pull origin phase5/P5-001-aim-engine-integration-charter

Before editing, verify the working tree is clean:

git status --short

If there are unrelated local changes, stop and report a blocker.

---

## 9. Read the Exact Task Prompt

Open:

docs/tasks/phase_5_task_prompts.md

Find the exact task section.

Example:

#P5-001
#P5-029
#P5-056
#P5-086

Follow only that task section.

You must follow:

Task
Dependencies
Output
Requirements
Done Test

Do not implement unrelated tasks.

Do not perform unrelated cleanup.

Do not refactor unrelated files.

---

## 10. Phase 5 Non-Negotiables

You must not:

Create Student Web App work.
Create AI Teacher work.
Create AI Prompt Management work.
Create AI Cost Control work.
Create payment work.
Create parent dashboard work.
Create voice AI work.
Create full progress dashboard UI.
Move AIM Engine logic into Flutter.
Move AIM Engine logic into Admin Dashboard.
Let Flutter call AIM Engine.
Let Admin Dashboard call AIM Engine.
Expose AIM Engine to public client routes.
Expose AI provider keys.
Expose Supabase service-role keys.
Expose database credentials.
Trust client-submitted mastery, weakness, difficulty, recommendation, or level.
Allow client-side AIM calculations.
Allow AIM result APIs without permission guards.
Persist unsafe raw secrets in AIM audit logs.
Log full sensitive student data unless required and documented.

Backend is the final authority for:

AIM Engine calls
AIM request construction
AIM response validation
Student skill state updates
Mastery updates
Weakness updates
Difficulty decisions
Recommendations
Review schedules
Frustration/emotional signals
Session summaries
AIM audit logs
AIM result permissions

The AIM Engine is the algorithm service.

The Backend orchestrates the system.

Clients only consume backend-approved outputs.

---

## 11. Implementation Rules

While working:

Edit only files required by the task.
Keep the change small and task-specific.
Use the existing Phase 1 architecture.
Use the Phase 2 auth/roles/permissions foundation.
Use the Phase 3 curriculum/content/skills/question-bank foundation.
Use the Phase 4 placement result foundation.
Use feature-based backend structure.
Use the existing Python AIM Engine service structure.
Do not introduce new technology choices unless the task asks for a documented decision.
Do not delete existing documentation unless the task explicitly requires it.
Do not change Phase 0, Phase 1, Phase 2, Phase 3, or Phase 4 decisions without documenting a conflict.

For AIM integration work:

AIM Engine requests must be structured.
AIM Engine responses must be structured.
AIM Engine errors must be handled safely.
AIM Engine health must be checkable.
Backend must own all persistence.
Backend must validate AIM responses before saving.
Backend must not blindly trust invalid AIM output.
Student skill states must be updated only by backend/AIM pipeline.
Recommendations must be saved as AIM outputs, not invented by Flutter.
Review schedules must be saved as AIM outputs.
Frustration/emotional signals must remain educational/behavioral, not clinical diagnosis.
Audit logs must avoid secrets and excessive sensitive data.

If you find a conflict between Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, and Phase 5:

Stop.
Document the conflict.
Add a Notion blocker comment.
Report the exact files involved.
Do not guess.

---

## 12. Commit Rule

Commit after finishing every single file.

Use small commits.

Each commit message must include the task ID.

Recommended commit format:

git add <single-file>
git commit -m "P5-XXX: <short task title>"

Example:

git add docs/phase-5/aim-engine-integration-charter.md
git commit -m "P5-001: create AIM engine integration charter"

If one task changes multiple files, commit each completed file separately.

After all task files are committed, push the task branch:

git push origin <task-branch>

Do not mark the Notion task as Done until the push succeeds.

---

## 13. Run Checks Before Push

Before pushing, always run:

git status --short

If backend files changed, run backend lint/test if available:

npm run lint
npm test

If AIM Engine files changed, run Python checks/tests if available:

python -m pytest

or the project-specific AIM Engine test command.

If admin dashboard files changed, run available admin checks:

npm run lint
npm run build

If Flutter files changed, run:

flutter analyze

if the Flutter project exists and the environment supports it.

If database migrations changed, verify:

Migration is additive.
No out-of-scope tables were added.
student_skill_states are represented when required.
sessions and session_events are represented when required.
lesson_attempts and answers are represented when required.
weakness_records are represented when required.
recommendations and review_schedules are represented when required.
No AI Teacher tables were added in Phase 5 unless explicitly required.
No payment, parent dashboard, or voice AI tables were added in Phase 5.

If checks cannot run because tooling is not ready, document that clearly in the Notion comment and final response.

---

## 14. Push

After commits are ready:

git push origin <task-branch>

Do not mark the Notion task as Done until the push succeeds.

If the push fails, keep the task In Progress and report the blocker.

Never paste a GitHub PAT into the terminal output, Notion, code, docs, or chat.

---

## 15. After Successful Push

After pushing:

1. Re-open the Notion task.
2. Confirm it is still assigned to you.
3. Confirm Status is In Progress.
4. Add a completion comment.
5. Set Status = Done.
6. Keep Assigned filled with your user.

Completion comment format:

Completed — P5-XXX

Files created/updated:

* ...

Branch:
phase5/P5-XXX-task-name

Commits:

* <commit hash> — <message>
* <commit hash> — <message>

Checks:

* ...

AIM validation:

* Backend-only AIM access preserved: yes/no/not applicable
* No client-side AIM logic added: yes/no/not applicable
* AIM request contract followed: yes/no/not applicable
* AIM response contract followed: yes/no/not applicable
* AIM persistence handled safely: yes/no/not applicable
* Permission guards preserved: yes/no/not applicable
* Secrets excluded: yes/no

Limitations:

* ...

Never remove yourself from Assigned after completion.

---

## 16. If Blocked

If you cannot complete the task:

1. Keep Assigned = you.
2. Keep Status = In Progress.
3. Add a blocker comment in Notion.
4. Do not mark the task Done.
5. Do not continue to another task unless instructed.

Blocker comment format:

Blocked — P5-XXX

Reason: <what blocked the task>

Missing dependency/file: <dependency or file>

Failed command: <command and result>

Phase 5 risk:
<AIM adapter risk / AIM pipeline risk / persistence risk / permission risk / client-side AIM risk / AI Teacher scope risk / secret risk / none>

Next required action: <what must happen next>

---

## 17. Final Report Format

At the end of the run, report:

Task: P5-XXX — <task title>
Status: Done / Blocked

Branch: <task branch>

Files changed:

* <file>
* <file>

Commits:

* <commit hash> — <message>
* <commit hash> — <message>

Push:
succeeded / failed

Checks:

* <check result>
* <check result>

AIM validation:

* Backend-only AIM access preserved: yes/no/not applicable
* No client-side AIM logic added: yes/no/not applicable
* AIM request contract followed: yes/no/not applicable
* AIM response contract followed: yes/no/not applicable
* AIM persistence handled safely: yes/no/not applicable
* Permission guards preserved: yes/no/not applicable
* Secrets excluded: yes/no

Notion:

* Assigned to <TEAM_MEMBER_NOTION_EMAIL>
* Status set to Done / In Progress

Notes:

* <important limitation or none>

---

## 18. Stop Conditions

Stop immediately if:

TEAM_MEMBER_NOTION_EMAIL is missing.
Notion task database cannot be accessed.
The task is already assigned.
The task is not Undone.
A dependency is incomplete.
A dependency output is missing from GitHub.
The working tree has unrelated changes.
docs/tasks/phase_5_task_prompts.md is missing.
The exact task section is missing.
A Phase 0 vs Phase 1 vs Phase 2 vs Phase 3 vs Phase 4 vs Phase 5 conflict is found.
A real secret is detected.
Student Web App work is detected.
AI Teacher work is detected.
AI Prompt Management work is detected.
AI Cost Control work is detected.
Payment work is detected.
Parent dashboard work is detected.
Voice AI work is detected.
Client-side AIM Engine calls are detected.
Flutter calculates mastery, weakness, difficulty, recommendations, review schedule, or level.
Admin Dashboard calculates AIM decisions.
AIM Engine is exposed directly to clients.
AIM result API is missing role/permission protection.
AIM response is persisted without validation.
AIM audit logs include secrets.
Clinical/medical psychological diagnosis is introduced.

Do not continue silently after a stop condition.

---

## 19. Core Rule

A task is only Done when it is:

claimed in Notion
assigned to you
dependency-safe
scope-safe
architecture-safe
implemented according to its exact prompt
checked/tested or clearly documented
committed file-by-file
pushed to its task branch
documented in Notion
marked Done in Notion

For Phase 5, it must also be:

AIM-integration-safe
backend-only-AIM-safe
no-client-AIM-safe
contract-safe
persistence-safe
permission-safe
secret-safe
AI-Teacher-scope-safe

If any of these is missing, the task is not Done.

### #P5-001 — Create Phase 5 AIM Engine Integration Charter

**Task:** Create Phase 5 AIM Engine Integration Charter
**ID:** `P5-001`
**Branch:** `phase5/P5-001-aim-engine-integration-charter`
**Description:** Define Phase 5 as the AIM Engine Integration phase only.
**Goal:** Lock scope around Backend-to-AIM Engine integration and prevent AI Teacher/mobile UI scope creep.
**Output:** `docs/phase-5/aim-engine-integration-charter.md`
**Priority:** `P0`
**Dependencies:** `P4-080`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-001`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/aim-engine-integration-charter.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-002 — Create Phase 5 Task Execution Rules

**Task:** Create Phase 5 Task Execution Rules
**ID:** `P5-002`
**Branch:** `phase5/P5-002-phase-5-task-rules`
**Description:** Create execution rules for Phase 5 tasks.
**Goal:** Ensure each task is executed safely, one scoped task at a time.
**Output:** `docs/phase-5/task-execution-rules.md`
**Priority:** `P0`
**Dependencies:** `P5-001`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-002`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/task-execution-rules.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-003 — Define AIM Integration Scope & Out-of-Scope

**Task:** Define AIM Integration Scope & Out-of-Scope
**ID:** `P5-003`
**Branch:** `phase5/P5-003-aim-integration-scope-boundaries`
**Description:** Document allowed and forbidden work for AIM Engine Integration.
**Goal:** Prevent Phase 5 from absorbing AI Teacher, mobile MVP, dashboards, payments, or voice work.
**Output:** `docs/phase-5/aim-integration-scope-boundaries.md`
**Priority:** `P0`
**Dependencies:** `P5-001`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-003`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/aim-integration-scope-boundaries.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-004 — Document No Client-Side AIM Rule

**Task:** Document No Client-Side AIM Rule
**ID:** `P5-004`
**Branch:** `phase5/P5-004-no-client-aim-rule`
**Description:** Document that Flutter/Admin clients must never call AIM Engine or compute AIM decisions.
**Goal:** Preserve backend authority and protect AIM algorithm boundaries.
**Output:** `docs/phase-5/no-client-aim-rule.md`
**Priority:** `P0`
**Dependencies:** `P5-001`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-004`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/no-client-aim-rule.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-005 — Create AIM Data Flow Document

**Task:** Create AIM Data Flow Document
**ID:** `P5-005`
**Branch:** `phase5/P5-005-aim-data-flow`
**Description:** Describe full data movement from backend attempts to AIM Engine and persisted results.
**Goal:** Make AIM integration flow clear and reviewable.
**Output:** `docs/phase-5/aim-data-flow.md`
**Priority:** `P0`
**Dependencies:** `P5-003`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-005`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/aim-data-flow.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-006 — Create AIM Engine API Map

**Task:** Create AIM Engine API Map
**ID:** `P5-006`
**Branch:** `phase5/P5-006-aim-engine-api-map`
**Description:** Map AIM Engine internal endpoints and payloads.
**Goal:** Guide backend adapter and Python AIM Engine endpoint implementation.
**Output:** `docs/phase-5/aim-engine-api-map.md`
**Priority:** `P0`
**Dependencies:** `P5-005`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-006`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/aim-engine-api-map.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-007 — Create Backend AIM Pipeline Map

**Task:** Create Backend AIM Pipeline Map
**ID:** `P5-007`
**Branch:** `phase5/P5-007-aim-backend-pipeline-map`
**Description:** Document backend orchestration from session/attempt input to AIM persistence.
**Goal:** Define backend pipeline boundaries and sequence.
**Output:** `docs/phase-5/backend-aim-pipeline-map.md`
**Priority:** `P0`
**Dependencies:** `P5-005`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-007`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/backend-aim-pipeline-map.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-008 — Define AIM Integration Error Handling Policy

**Task:** Define AIM Integration Error Handling Policy
**ID:** `P5-008`
**Branch:** `phase5/P5-008-phase-5-error-handling-policy`
**Description:** Define timeout, retry, fallback, and safe error behavior for AIM integration.
**Goal:** Prevent unsafe failures and protect user experience when AIM Engine is unavailable.
**Output:** `docs/phase-5/aim-error-handling-policy.md`
**Priority:** `P0`
**Dependencies:** `P5-006`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-008`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/aim-error-handling-policy.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-009 — Define AIM Session Input Contract

**Task:** Define AIM Session Input Contract
**ID:** `P5-009`
**Branch:** `phase5/P5-009-aim-session-input-contract`
**Description:** Define the backend-to-AIM session input contract.
**Goal:** Standardize session-level payloads sent to AIM Engine.
**Output:** `packages/shared-contracts/api/aim-session-input-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-006`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-009`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/aim-session-input-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-010 — Define AIM Attempt Input Contract

**Task:** Define AIM Attempt Input Contract
**ID:** `P5-010`
**Branch:** `phase5/P5-010-aim-attempt-input-contract`
**Description:** Define attempt-level input payload sent to AIM Engine.
**Goal:** Standardize question, answer, correctness, retry, difficulty, confidence, and skill context input.
**Output:** `packages/shared-contracts/api/aim-attempt-input-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-009`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-010`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/aim-attempt-input-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-011 — Define AIM Engine Response Contract

**Task:** Define AIM Engine Response Contract
**ID:** `P5-011`
**Branch:** `phase5/P5-011-aim-engine-response-contract`
**Description:** Define structured AIM Engine response payload.
**Goal:** Standardize mastery, weakness, difficulty, recommendation, review, frustration, and summary outputs.
**Output:** `packages/shared-contracts/api/aim-engine-response-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-009`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-011`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/aim-engine-response-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-012 — Define Student Skill State Contract

**Task:** Define Student Skill State Contract
**ID:** `P5-012`
**Branch:** `phase5/P5-012-student-skill-state-contract`
**Description:** Define student skill state contract.
**Goal:** Standardize persisted AIM memory per student and skill.
**Output:** `packages/shared-contracts/api/student-skill-state-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-012`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/student-skill-state-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-013 — Define Weakness Record Contract

**Task:** Define Weakness Record Contract
**ID:** `P5-013`
**Branch:** `phase5/P5-013-weakness-record-contract`
**Description:** Define weakness record contract.
**Goal:** Standardize weakness detection outputs and persistence format.
**Output:** `packages/shared-contracts/api/weakness-record-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-013`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/weakness-record-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-014 — Define Difficulty Decision Contract

**Task:** Define Difficulty Decision Contract
**ID:** `P5-014`
**Branch:** `phase5/P5-014-difficulty-decision-contract`
**Description:** Define difficulty decision contract.
**Goal:** Standardize AIM difficulty decision output.
**Output:** `packages/shared-contracts/api/difficulty-decision-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-014`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/difficulty-decision-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-015 — Define AIM Recommendation Contract

**Task:** Define AIM Recommendation Contract
**ID:** `P5-015`
**Branch:** `phase5/P5-015-aim-recommendation-contract`
**Description:** Define AIM recommendation contract.
**Goal:** Standardize recommendation outputs from AIM Engine.
**Output:** `packages/shared-contracts/api/aim-recommendation-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-015`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/aim-recommendation-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-016 — Define Review Schedule Contract

**Task:** Define Review Schedule Contract
**ID:** `P5-016`
**Branch:** `phase5/P5-016-review-schedule-contract`
**Description:** Define review schedule contract.
**Goal:** Standardize review scheduling output from AIM Engine.
**Output:** `packages/shared-contracts/api/review-schedule-contracts.md`
**Priority:** `P0`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-016`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/review-schedule-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-017 — Define AIM Session Summary Contract

**Task:** Define AIM Session Summary Contract
**ID:** `P5-017`
**Branch:** `phase5/P5-017-aim-session-summary-contract`
**Description:** Define AIM session summary contract.
**Goal:** Standardize persisted session summary output.
**Output:** `packages/shared-contracts/api/aim-session-summary-contracts.md`
**Priority:** `P1`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-017`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `packages/shared-contracts/api/aim-session-summary-contracts.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-018 — Add AIM Integration Error Codes

**Task:** Add AIM Integration Error Codes
**ID:** `P5-018`
**Branch:** `phase5/P5-018-aim-error-codes`
**Description:** Add AIM integration error codes to shared errors.
**Goal:** Ensure consistent backend/API error handling for AIM integration.
**Output:** `Update packages/shared-contracts/api/errors.md`
**Priority:** `P1`
**Dependencies:** `P5-009, P5-010, P5-011, P5-012, P5-013, P5-014, P5-015, P5-016, P5-017`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-018`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Update packages/shared-contracts/api/errors.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-019 — Add AIM Engine Health Endpoint

**Task:** Add AIM Engine Health Endpoint
**ID:** `P5-019`
**Branch:** `phase5/P5-019-aim-engine-health-endpoint`
**Description:** Add health endpoint to AIM Engine service.
**Goal:** Allow backend and deployment checks to verify AIM Engine availability.
**Output:** `AIM Engine health endpoint`
**Priority:** `P0`
**Dependencies:** `P5-006`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-019`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `AIM Engine health endpoint` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-020 — Add AIM Analysis Endpoint

**Task:** Add AIM Analysis Endpoint
**ID:** `P5-020`
**Branch:** `phase5/P5-020-aim-engine-analysis-endpoint`
**Description:** Add analysis endpoint to AIM Engine service.
**Goal:** Expose backend-internal endpoint for AIM analysis requests.
**Output:** `AIM Engine analysis endpoint`
**Priority:** `P0`
**Dependencies:** `P5-009, P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-020`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `AIM Engine analysis endpoint` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-021 — Add AIM Engine Request Schema

**Task:** Add AIM Engine Request Schema
**ID:** `P5-021`
**Branch:** `phase5/P5-021-aim-engine-request-schema`
**Description:** Add Python request schema for AIM analysis input.
**Goal:** Validate backend-to-AIM Engine input shape.
**Output:** `Python request schema`
**Priority:** `P0`
**Dependencies:** `P5-009, P5-010`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-021`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Python request schema` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-022 — Add AIM Engine Response Schema

**Task:** Add AIM Engine Response Schema
**ID:** `P5-022`
**Branch:** `phase5/P5-022-aim-engine-response-schema`
**Description:** Add Python response schema for AIM analysis output.
**Goal:** Validate AIM Engine response shape.
**Output:** `Python response schema`
**Priority:** `P0`
**Dependencies:** `P5-011`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-022`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Python response schema` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-023 — Create AIM Pipeline Entrypoint

**Task:** Create AIM Pipeline Entrypoint
**ID:** `P5-023`
**Branch:** `phase5/P5-023-aim-engine-pipeline-entrypoint`
**Description:** Create Python pipeline entrypoint for analysis flow.
**Goal:** Connect AIM request to analyzers/calculators/detectors/generators.
**Output:** `Python pipeline entrypoint`
**Priority:** `P0`
**Dependencies:** `P5-020, P5-021, P5-022`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-023`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Python pipeline entrypoint` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-024 — Add AIM Engine Input Validation

**Task:** Add AIM Engine Input Validation
**ID:** `P5-024`
**Branch:** `phase5/P5-024-aim-engine-input-validation`
**Description:** Add input validation rules to AIM Engine.
**Goal:** Reject invalid session/attempt payloads safely.
**Output:** `Python validation rules`
**Priority:** `P0`
**Dependencies:** `P5-021`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-024`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Python validation rules` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-025 — Add Safe Failure Response

**Task:** Add Safe Failure Response
**ID:** `P5-025`
**Branch:** `phase5/P5-025-aim-engine-safe-failure-response`
**Description:** Add structured safe failure response from AIM Engine.
**Goal:** Ensure predictable backend behavior during AIM failures.
**Output:** `AIM safe error response structure`
**Priority:** `P1`
**Dependencies:** `P5-008, P5-022`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-025`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `AIM safe error response structure` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-026 — Add AIM Engine Test Fixtures

**Task:** Add AIM Engine Test Fixtures
**ID:** `P5-026`
**Branch:** `phase5/P5-026-aim-engine-test-fixtures`
**Description:** Add test fixtures for AIM request and response examples.
**Goal:** Support reliable AIM Engine tests.
**Output:** `Python test fixture inputs/outputs`
**Priority:** `P1`
**Dependencies:** `P5-021, P5-022`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-026`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Python test fixture inputs/outputs` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-027 — Add AIM Engine Unit Tests

**Task:** Add AIM Engine Unit Tests
**ID:** `P5-027`
**Branch:** `phase5/P5-027-aim-engine-unit-tests`
**Description:** Add Python unit tests for AIM Engine integration entrypoints.
**Goal:** Verify AIM request validation, pipeline entry, and response shape.
**Output:** `Python AIM unit tests`
**Priority:** `P0`
**Dependencies:** `P5-023, P5-024, P5-026`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-027`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Python AIM unit tests` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-028 — Review AIM Engine Readiness

**Task:** Review AIM Engine Readiness
**ID:** `P5-028`
**Branch:** `phase5/P5-028-aim-engine-readiness-review`
**Description:** Review AIM Engine readiness for backend integration.
**Goal:** Confirm Python AIM service endpoints, schemas, validation, and tests are ready.
**Output:** `docs/quality/phase-5-aim-engine-readiness-review.md`
**Priority:** `P0`
**Dependencies:** `P5-019, P5-020, P5-021, P5-022, P5-023, P5-024, P5-025, P5-026, P5-027`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-028`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-aim-engine-readiness-review.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-029 — Create Student Skill States Migration

**Task:** Create Student Skill States Migration
**ID:** `P5-029`
**Branch:** `phase5/P5-029-student-skill-states-migration`
**Description:** Create database migration for student skill states.
**Goal:** Persist AIM memory per student and skill.
**Output:** `DB migration for student_skill_states`
**Priority:** `P0`
**Dependencies:** `P5-012, P4-023`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-029`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for student_skill_states` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-030 — Create Learning Sessions Migration

**Task:** Create Learning Sessions Migration
**ID:** `P5-030`
**Branch:** `phase5/P5-030-learning-sessions-migration`
**Description:** Create database migration for learning sessions.
**Goal:** Persist session lifecycle used by AIM analysis.
**Output:** `DB migration for sessions`
**Priority:** `P0`
**Dependencies:** `P5-009`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-030`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for sessions` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-031 — Create Session Events Migration

**Task:** Create Session Events Migration
**ID:** `P5-031`
**Branch:** `phase5/P5-031-session-events-migration`
**Description:** Create database migration for session events.
**Goal:** Persist events inside a learning session.
**Output:** `DB migration for session_events`
**Priority:** `P1`
**Dependencies:** `P5-030`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-031`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for session_events` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-032 — Create Lesson Attempts Migration

**Task:** Create Lesson Attempts Migration
**ID:** `P5-032`
**Branch:** `phase5/P5-032-lesson-attempts-migration`
**Description:** Create database migration for lesson attempts.
**Goal:** Persist raw attempt data for AIM analysis.
**Output:** `DB migration for lesson_attempts`
**Priority:** `P0`
**Dependencies:** `P3-022, P5-010`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-032`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for lesson_attempts` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-033 — Create Answers Migration

**Task:** Create Answers Migration
**ID:** `P5-033`
**Branch:** `phase5/P5-033-answers-migration`
**Description:** Create database migration for answers.
**Goal:** Persist submitted answer details for attempts.
**Output:** `DB migration for answers`
**Priority:** `P0`
**Dependencies:** `P5-032`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-033`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for answers` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-034 — Create Mistakes Migration

**Task:** Create Mistakes Migration
**ID:** `P5-034`
**Branch:** `phase5/P5-034-mistakes-migration`
**Description:** Create database migration for mistakes.
**Goal:** Persist mistake records derived from answers.
**Output:** `DB migration for mistakes`
**Priority:** `P1`
**Dependencies:** `P5-013, P5-033`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-034`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for mistakes` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-035 — Create Error Patterns Migration

**Task:** Create Error Patterns Migration
**ID:** `P5-035`
**Branch:** `phase5/P5-035-error-patterns-migration`
**Description:** Create database migration for error patterns.
**Goal:** Persist classified error patterns.
**Output:** `DB migration for error_patterns`
**Priority:** `P1`
**Dependencies:** `P5-034`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-035`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for error_patterns` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-036 — Create Weakness Records Migration

**Task:** Create Weakness Records Migration
**ID:** `P5-036`
**Branch:** `phase5/P5-036-weakness-records-migration`
**Description:** Create database migration for weakness records.
**Goal:** Persist AIM weakness updates.
**Output:** `DB migration for weakness_records`
**Priority:** `P0`
**Dependencies:** `P5-013`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-036`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for weakness_records` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-037 — Create Difficulty Decisions Migration

**Task:** Create Difficulty Decisions Migration
**ID:** `P5-037`
**Branch:** `phase5/P5-037-difficulty-decisions-migration`
**Description:** Create database migration for difficulty decisions.
**Goal:** Persist AIM difficulty decisions.
**Output:** `DB migration for difficulty decisions`
**Priority:** `P0`
**Dependencies:** `P5-014`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-037`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for difficulty decisions` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-038 — Create AIM Recommendations Migration

**Task:** Create AIM Recommendations Migration
**ID:** `P5-038`
**Branch:** `phase5/P5-038-aim-recommendations-migration`
**Description:** Create database migration for AIM recommendations.
**Goal:** Persist AIM recommendation outputs.
**Output:** `DB migration for recommendations`
**Priority:** `P0`
**Dependencies:** `P5-015`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-038`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for recommendations` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-039 — Create Review Schedules Migration

**Task:** Create Review Schedules Migration
**ID:** `P5-039`
**Branch:** `phase5/P5-039-review-schedules-migration`
**Description:** Create database migration for review schedules.
**Goal:** Persist review schedule outputs from AIM Engine.
**Output:** `DB migration for review_schedules`
**Priority:** `P0`
**Dependencies:** `P5-016`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-039`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for review_schedules` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-040 — Create AIM Session Summaries Migration

**Task:** Create AIM Session Summaries Migration
**ID:** `P5-040`
**Branch:** `phase5/P5-040-aim-session-summaries-migration`
**Description:** Create database migration for session summaries.
**Goal:** Persist AIM session summaries and emotional signals where applicable.
**Output:** `DB migration for session summaries`
**Priority:** `P1`
**Dependencies:** `P5-017`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-040`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for session summaries` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-041 — Create AIM Audit Log Migration

**Task:** Create AIM Audit Log Migration
**ID:** `P5-041`
**Branch:** `phase5/P5-041-aim-audit-log-migration`
**Description:** Create database migration for AIM audit events.
**Goal:** Persist safe AIM request/response metadata.
**Output:** `DB migration for AIM audit events`
**Priority:** `P1`
**Dependencies:** `P5-008`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-041`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB migration for AIM audit events` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-042 — Add AIM Integration Indexes

**Task:** Add AIM Integration Indexes
**ID:** `P5-042`
**Branch:** `phase5/P5-042-aim-integration-indexes`
**Description:** Add indexes for AIM state and output tables.
**Goal:** Improve query and update performance for AIM integration.
**Output:** `DB indexes for AIM state/query performance`
**Priority:** `P1`
**Dependencies:** `P5-029, P5-030, P5-031, P5-032, P5-033, P5-034, P5-035, P5-036, P5-037, P5-038, P5-039, P5-040, P5-041`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-042`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `DB indexes for AIM state/query performance` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-043 — Create Backend AIM Feature Module

**Task:** Create Backend AIM Feature Module
**ID:** `P5-043`
**Branch:** `phase5/P5-043-aim-feature-module`
**Description:** Create backend AIM feature module skeleton.
**Goal:** Prepare NestJS feature-based structure for AIM integration.
**Output:** `Backend AIM feature module skeleton`
**Priority:** `P0`
**Dependencies:** `P5-006`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-043`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend AIM feature module skeleton` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-044 — Add AIM Engine Backend Config

**Task:** Add AIM Engine Backend Config
**ID:** `P5-044`
**Branch:** `phase5/P5-044-aim-engine-config`
**Description:** Add backend config for internal AIM Engine URL, timeout, and retry settings.
**Goal:** Centralize AIM Engine adapter configuration.
**Output:** `Backend config for AIM Engine internal URL/timeouts`
**Priority:** `P0`
**Dependencies:** `P5-043`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-044`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend config for AIM Engine internal URL/timeouts` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-045 — Implement AIM Engine HTTP Client

**Task:** Implement AIM Engine HTTP Client
**ID:** `P5-045`
**Branch:** `phase5/P5-045-aim-engine-http-client`
**Description:** Implement backend HTTP client for AIM Engine.
**Goal:** Allow backend-to-AIM internal service communication.
**Output:** `Backend internal client for AIM Engine`
**Priority:** `P0`
**Dependencies:** `P5-044`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-045`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend internal client for AIM Engine` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-046 — Implement AIM Health Check Service

**Task:** Implement AIM Health Check Service
**ID:** `P5-046`
**Branch:** `phase5/P5-046-aim-engine-health-check-service`
**Description:** Implement backend health check for AIM Engine.
**Goal:** Allow backend to verify AIM service availability.
**Output:** `Backend service checks AIM availability`
**Priority:** `P1`
**Dependencies:** `P5-019, P5-045`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-046`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend service checks AIM availability` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-047 — Implement AIM Request Mapper

**Task:** Implement AIM Request Mapper
**ID:** `P5-047`
**Branch:** `phase5/P5-047-aim-request-mapper`
**Description:** Map backend session/attempt data to AIM request contract.
**Goal:** Protect contract consistency before calling AIM Engine.
**Output:** `Backend maps session/attempt data to AIM request`
**Priority:** `P0`
**Dependencies:** `P5-009, P5-010, P5-045`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-047`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend maps session/attempt data to AIM request` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-048 — Implement AIM Response Mapper

**Task:** Implement AIM Response Mapper
**ID:** `P5-048`
**Branch:** `phase5/P5-048-aim-response-mapper`
**Description:** Map AIM response to internal backend DTOs.
**Goal:** Normalize AIM output before persistence.
**Output:** `Backend maps AIM response to internal DTOs`
**Priority:** `P0`
**Dependencies:** `P5-011, P5-045`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-048`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend maps AIM response to internal DTOs` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-049 — Add AIM Adapter Timeout Policy

**Task:** Add AIM Adapter Timeout Policy
**ID:** `P5-049`
**Branch:** `phase5/P5-049-aim-adapter-timeout-policy`
**Description:** Add timeout, retry, and fallback policy for AIM adapter.
**Goal:** Avoid hanging requests and unsafe retries.
**Output:** `Backend timeout/retry/fallback rules`
**Priority:** `P1`
**Dependencies:** `P5-008, P5-045`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-049`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend timeout/retry/fallback rules` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-050 — Add AIM Adapter Error Handling

**Task:** Add AIM Adapter Error Handling
**ID:** `P5-050`
**Branch:** `phase5/P5-050-aim-adapter-error-handling`
**Description:** Add safe error handling for AIM adapter.
**Goal:** Handle AIM Engine failures without corrupting learning state.
**Output:** `Backend handles AIM errors safely`
**Priority:** `P0`
**Dependencies:** `P5-008, P5-049`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-050`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend handles AIM errors safely` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-051 — Add AIM Adapter Tests

**Task:** Add AIM Adapter Tests
**ID:** `P5-051`
**Branch:** `phase5/P5-051-aim-adapter-tests`
**Description:** Add backend tests for AIM client, mappers, timeout, and errors.
**Goal:** Verify backend adapter reliability.
**Output:** `Backend tests for AIM client/mapper/errors`
**Priority:** `P0`
**Dependencies:** `P5-045, P5-046, P5-047, P5-048, P5-049, P5-050`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-051`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend tests for AIM client/mapper/errors` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-052 — Implement Session Start Service

**Task:** Implement Session Start Service
**ID:** `P5-052`
**Branch:** `phase5/P5-052-session-start-service`
**Description:** Implement service to create learning sessions.
**Goal:** Prepare session lifecycle for AIM analysis.
**Output:** `Backend service creates learning session`
**Priority:** `P0`
**Dependencies:** `P5-030, P5-043`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-052`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend service creates learning session` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-053 — Implement Session Event Service

**Task:** Implement Session Event Service
**ID:** `P5-053`
**Branch:** `phase5/P5-053-session-event-service`
**Description:** Implement service to record session events.
**Goal:** Capture structured session timeline for AIM and auditing.
**Output:** `Backend service records session events`
**Priority:** `P1`
**Dependencies:** `P5-031, P5-052`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-053`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend service records session events` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-054 — Implement Lesson Attempt Service

**Task:** Implement Lesson Attempt Service
**ID:** `P5-054`
**Branch:** `phase5/P5-054-lesson-attempt-service`
**Description:** Implement service to record lesson attempts and answers.
**Goal:** Persist raw attempt data before AIM analysis.
**Output:** `Backend service records lesson attempts`
**Priority:** `P0`
**Dependencies:** `P5-032, P5-033`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-054`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend service records lesson attempts` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-055 — Implement Attempt Skill Context Service

**Task:** Implement Attempt Skill Context Service
**ID:** `P5-055`
**Branch:** `phase5/P5-055-attempt-skill-context-service`
**Description:** Resolve lesson/question skill context for AIM input.
**Goal:** Ensure AIM Engine receives correct skill identifiers.
**Output:** `Backend resolves lesson/question skills for AIM input`
**Priority:** `P0`
**Dependencies:** `P3-023, P3-027, P5-047`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-055`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend resolves lesson/question skills for AIM input` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-056 — Implement AIM Analysis Orchestrator

**Task:** Implement AIM Analysis Orchestrator
**ID:** `P5-056`
**Branch:** `phase5/P5-056-aim-analysis-orchestrator`
**Description:** Orchestrate attempt to AIM Engine analysis and persistence.
**Goal:** Make backend the central AIM pipeline authority.
**Output:** `Backend orchestrates attempt → AIM Engine → persistence`
**Priority:** `P0`
**Dependencies:** `P5-047, P5-048, P5-054, P5-055`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-056`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend orchestrates attempt → AIM Engine → persistence` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-057 — Implement Student Skill State Update Service

**Task:** Implement Student Skill State Update Service
**ID:** `P5-057`
**Branch:** `phase5/P5-057-student-skill-state-update-service`
**Description:** Persist mastery/confidence/skill state updates from AIM output.
**Goal:** Update AIM memory in student_skill_states.
**Output:** `Persist mastery/confidence/skill updates`
**Priority:** `P0`
**Dependencies:** `P5-012, P5-029, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-057`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist mastery/confidence/skill updates` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-058 — Implement Weakness Update Service

**Task:** Implement Weakness Update Service
**ID:** `P5-058`
**Branch:** `phase5/P5-058-weakness-update-service`
**Description:** Persist weakness updates from AIM output.
**Goal:** Store weakness records for later dashboards/reviews.
**Output:** `Persist weakness updates`
**Priority:** `P0`
**Dependencies:** `P5-013, P5-036, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-058`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist weakness updates` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-059 — Implement Difficulty Decision Service

**Task:** Implement Difficulty Decision Service
**ID:** `P5-059`
**Branch:** `phase5/P5-059-difficulty-decision-service`
**Description:** Persist next difficulty decisions from AIM output.
**Goal:** Store adaptive difficulty decisions for future lesson flow.
**Output:** `Persist next difficulty decisions`
**Priority:** `P0`
**Dependencies:** `P5-014, P5-037, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-059`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist next difficulty decisions` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-060 — Implement Recommendation Output Service

**Task:** Implement Recommendation Output Service
**ID:** `P5-060`
**Branch:** `phase5/P5-060-recommendation-output-service`
**Description:** Persist AIM recommendation outputs.
**Goal:** Store recommendations produced by AIM Engine.
**Output:** `Persist AIM recommendation outputs`
**Priority:** `P0`
**Dependencies:** `P5-015, P5-038, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-060`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist AIM recommendation outputs` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-061 — Implement Review Schedule Output Service

**Task:** Implement Review Schedule Output Service
**ID:** `P5-061`
**Branch:** `phase5/P5-061-review-schedule-output-service`
**Description:** Persist review schedule outputs.
**Goal:** Store scheduled review decisions from AIM Engine.
**Output:** `Persist review schedules`
**Priority:** `P0`
**Dependencies:** `P5-016, P5-039, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-061`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist review schedules` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-062 — Implement Frustration Signal Persistence

**Task:** Implement Frustration Signal Persistence
**ID:** `P5-062`
**Branch:** `phase5/P5-062-frustration-signal-service`
**Description:** Persist frustration/emotional signals from AIM output.
**Goal:** Store educational emotional signal outputs without clinical diagnosis.
**Output:** `Persist frustration/emotional signals`
**Priority:** `P1`
**Dependencies:** `P5-011, P5-040, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-062`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist frustration/emotional signals` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-063 — Implement Session Summary Persistence

**Task:** Implement Session Summary Persistence
**ID:** `P5-063`
**Branch:** `phase5/P5-063-session-summary-service`
**Description:** Persist AIM-generated session summary.
**Goal:** Store summary output for later progress/reporting layers.
**Output:** `Persist AIM session summary`
**Priority:** `P1`
**Dependencies:** `P5-017, P5-040, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-063`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Persist AIM session summary` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-064 — Implement AIM Audit Logging Service

**Task:** Implement AIM Audit Logging Service
**ID:** `P5-064`
**Branch:** `phase5/P5-064-aim-audit-logging-service`
**Description:** Log AIM request/response metadata safely.
**Goal:** Enable debugging without exposing sensitive payloads.
**Output:** `Log AIM request/response metadata safely`
**Priority:** `P1`
**Dependencies:** `P5-041, P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-064`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Log AIM request/response metadata safely` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-065 — Add AIM Pipeline Transaction Policy

**Task:** Add AIM Pipeline Transaction Policy
**ID:** `P5-065`
**Branch:** `phase5/P5-065-aim-pipeline-transaction-policy`
**Description:** Define and implement consistency policy for AIM persistence.
**Goal:** Avoid partial/corrupt AIM state updates.
**Output:** `Document/implement consistency rules`
**Priority:** `P0`
**Dependencies:** `P5-056, P5-057, P5-058, P5-059, P5-060, P5-061, P5-062, P5-063, P5-064`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-065`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Document/implement consistency rules` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-066 — Implement Session Start API

**Task:** Implement Session Start API
**ID:** `P5-066`
**Branch:** `phase5/P5-066-session-start-api`
**Description:** Implement backend API to start a learning session.
**Goal:** Expose controlled session start through backend API.
**Output:** `Backend API to start session`
**Priority:** `P0`
**Dependencies:** `P5-052`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-066`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API to start session` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-067 — Implement Attempt Submit + AIM Analysis API

**Task:** Implement Attempt Submit + AIM Analysis API
**ID:** `P5-067`
**Branch:** `phase5/P5-067-attempt-submit-analysis-api`
**Description:** Implement API to submit attempt and run AIM pipeline.
**Goal:** Connect attempt submission to backend AIM orchestrator.
**Output:** `Backend API submits attempt and runs AIM pipeline`
**Priority:** `P0`
**Dependencies:** `P5-056`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-067`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API submits attempt and runs AIM pipeline` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-068 — Implement Session State Read API

**Task:** Implement Session State Read API
**ID:** `P5-068`
**Branch:** `phase5/P5-068-session-state-read-api`
**Description:** Implement API to read current session AIM state.
**Goal:** Expose backend-approved AIM session state.
**Output:** `Backend API reads current session AIM state`
**Priority:** `P1`
**Dependencies:** `P5-057, P5-058, P5-059, P5-060, P5-061, P5-062, P5-063`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-068`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API reads current session AIM state` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-069 — Implement Student Skill State Read API

**Task:** Implement Student Skill State Read API
**ID:** `P5-069`
**Branch:** `phase5/P5-069-student-skill-state-read-api`
**Description:** Implement API to read student skill state.
**Goal:** Expose backend-approved student_skill_states.
**Output:** `Backend API reads skill state`
**Priority:** `P1`
**Dependencies:** `P5-057`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-069`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API reads skill state` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-070 — Implement Weakness Records Read API

**Task:** Implement Weakness Records Read API
**ID:** `P5-070`
**Branch:** `phase5/P5-070-weakness-records-read-api`
**Description:** Implement API to read weakness records.
**Goal:** Expose backend-approved weakness outputs.
**Output:** `Backend API reads weakness records`
**Priority:** `P1`
**Dependencies:** `P5-058`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-070`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API reads weakness records` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-071 — Implement Recommendation Read API

**Task:** Implement Recommendation Read API
**ID:** `P5-071`
**Branch:** `phase5/P5-071-recommendation-read-api`
**Description:** Implement API to read AIM recommendations.
**Goal:** Expose backend-approved recommendations for later UI phases.
**Output:** `Backend API reads AIM recommendations`
**Priority:** `P1`
**Dependencies:** `P5-060`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-071`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API reads AIM recommendations` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-072 — Implement Review Schedule Read API

**Task:** Implement Review Schedule Read API
**ID:** `P5-072`
**Branch:** `phase5/P5-072-review-schedule-read-api`
**Description:** Implement API to read review schedules.
**Goal:** Expose backend-approved review schedule output.
**Output:** `Backend API reads review schedule`
**Priority:** `P1`
**Dependencies:** `P5-061`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-072`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API reads review schedule` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-073 — Add AIM Result Permission Guards

**Task:** Add AIM Result Permission Guards
**ID:** `P5-073`
**Branch:** `phase5/P5-073-aim-result-permission-guards`
**Description:** Add permission guards to AIM result APIs.
**Goal:** Protect student AIM state and outputs.
**Output:** `Backend guards for AIM result APIs`
**Priority:** `P0`
**Dependencies:** `P2-037, P2-038, P5-066, P5-067, P5-068, P5-069, P5-070, P5-071, P5-072`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-073`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend guards for AIM result APIs` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-074 — Add AIM Result DTO Validation

**Task:** Add AIM Result DTO Validation
**ID:** `P5-074`
**Branch:** `phase5/P5-074-aim-result-dto-validation`
**Description:** Add validation for AIM result API DTOs.
**Goal:** Protect backend APIs from invalid payloads/responses.
**Output:** `Backend DTO validation for AIM APIs`
**Priority:** `P1`
**Dependencies:** `P5-066, P5-067, P5-068, P5-069, P5-070, P5-071, P5-072`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-074`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend DTO validation for AIM APIs` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-075 — Add AIM Result API Tests

**Task:** Add AIM Result API Tests
**ID:** `P5-075`
**Branch:** `phase5/P5-075-aim-result-api-tests`
**Description:** Add tests for AIM result APIs.
**Goal:** Verify session, attempt, skill state, weakness, recommendation, and review APIs.
**Output:** `Backend API tests for AIM result endpoints`
**Priority:** `P0`
**Dependencies:** `P5-066, P5-067, P5-068, P5-069, P5-070, P5-071, P5-072, P5-073, P5-074`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-075`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Backend API tests for AIM result endpoints` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-076 — Add AIM Engine Contract Tests

**Task:** Add AIM Engine Contract Tests
**ID:** `P5-076`
**Branch:** `phase5/P5-076-aim-engine-contract-tests`
**Description:** Add contract tests between backend and AIM Engine.
**Goal:** Ensure backend request/response contracts match Python AIM schemas.
**Output:** `Contract tests between backend and AIM Engine`
**Priority:** `P0`
**Dependencies:** `P5-020, P5-045, P5-047, P5-048`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-076`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Contract tests between backend and AIM Engine` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-077 — Add AIM Pipeline Integration Tests

**Task:** Add AIM Pipeline Integration Tests
**ID:** `P5-077`
**Branch:** `phase5/P5-077-aim-pipeline-integration-tests`
**Description:** Add full pipeline integration tests.
**Goal:** Verify attempt → AIM Engine → persistence flow.
**Output:** `Full attempt → AIM → persistence tests`
**Priority:** `P0`
**Dependencies:** `P5-056, P5-057, P5-058, P5-059, P5-060, P5-061, P5-062, P5-063, P5-064`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-077`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Full attempt → AIM → persistence tests` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-078 — Add No Client AIM Regression Check

**Task:** Add No Client AIM Regression Check
**ID:** `P5-078`
**Branch:** `phase5/P5-078-no-client-aim-regression-check`
**Description:** Add check proving clients do not call AIM Engine directly.
**Goal:** Preserve backend-only AIM Engine boundary.
**Output:** `Test/search check proving Flutter/Admin do not call AIM Engine`
**Priority:** `P0`
**Dependencies:** `P5-004, P5-043`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-078`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `Test/search check proving Flutter/Admin do not call AIM Engine` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-079 — Run No AI Teacher Scope Review

**Task:** Run No AI Teacher Scope Review
**ID:** `P5-079`
**Branch:** `phase5/P5-079-no-ai-teacher-scope-review`
**Description:** Review Phase 5 for accidental AI Teacher implementation.
**Goal:** Keep AI Teacher reserved for later phases.
**Output:** `docs/quality/phase-5-no-ai-teacher-scope-review.md`
**Priority:** `P0`
**Dependencies:** `P5-075`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-079`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-no-ai-teacher-scope-review.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-080 — Run AIM Engine Security Review

**Task:** Run AIM Engine Security Review
**ID:** `P5-080`
**Branch:** `phase5/P5-080-aim-engine-security-review`
**Description:** Run security review of AIM Engine integration.
**Goal:** Check internal-only access, secrets, logs, permissions, and safe failures.
**Output:** `docs/quality/phase-5-aim-engine-security-review.md`
**Priority:** `P0`
**Dependencies:** `P5-043, P5-044, P5-045, P5-046, P5-047, P5-048, P5-049, P5-050, P5-051, P5-052, P5-053, P5-054, P5-055, P5-056, P5-057, P5-058, P5-059, P5-060, P5-061, P5-062, P5-063, P5-064, P5-065, P5-066, P5-067, P5-068, P5-069, P5-070, P5-071, P5-072, P5-073, P5-074, P5-075`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-080`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-aim-engine-security-review.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-081 — Run AIM Data Privacy Review

**Task:** Run AIM Data Privacy Review
**ID:** `P5-081`
**Branch:** `phase5/P5-081-aim-data-privacy-review`
**Description:** Review AIM data handling and logging privacy.
**Goal:** Ensure PII and sensitive learning data are protected.
**Output:** `docs/quality/phase-5-aim-data-privacy-review.md`
**Priority:** `P0`
**Dependencies:** `P5-064, P5-073`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-081`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-aim-data-privacy-review.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-082 — Run AIM Performance Smoke Test

**Task:** Run AIM Performance Smoke Test
**ID:** `P5-082`
**Branch:** `phase5/P5-082-aim-performance-smoke-test`
**Description:** Run basic performance smoke test for AIM pipeline.
**Goal:** Identify latency or throughput risks before Phase 6.
**Output:** `docs/quality/phase-5-aim-performance-smoke-test.md`
**Priority:** `P1`
**Dependencies:** `P5-077`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-082`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-aim-performance-smoke-test.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-083 — Run AIM Failure Mode Test

**Task:** Run AIM Failure Mode Test
**ID:** `P5-083`
**Branch:** `phase5/P5-083-aim-failure-mode-test`
**Description:** Test timeout, error, and unavailable-AIM scenarios.
**Goal:** Ensure safe behavior when AIM Engine fails.
**Output:** `docs/quality/phase-5-aim-failure-mode-test.md`
**Priority:** `P0`
**Dependencies:** `P5-049, P5-050, P5-077`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-083`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-aim-failure-mode-test.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-084 — Review Phase 5 Output Completeness

**Task:** Review Phase 5 Output Completeness
**ID:** `P5-084`
**Branch:** `phase5/P5-084-phase-5-output-completeness-review`
**Description:** Review all Phase 5 deliverables and missing outputs.
**Goal:** Ensure Phase 5 has no missing task outputs.
**Output:** `docs/quality/phase-5-output-completeness-review.md`
**Priority:** `P0`
**Dependencies:** `P5-076, P5-077, P5-078, P5-079, P5-080, P5-081, P5-082, P5-083`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-084`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/quality/phase-5-output-completeness-review.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-085 — Create Phase 6 Readiness Checklist

**Task:** Create Phase 6 Readiness Checklist
**ID:** `P5-085`
**Branch:** `phase5/P5-085-phase-6-readiness-checklist`
**Description:** Create checklist for Student Mobile App MVP readiness.
**Goal:** Prepare handoff to Phase 6.
**Output:** `docs/phase-6/readiness-checklist.md`
**Priority:** `P0`
**Dependencies:** `P5-084`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-085`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-6/readiness-checklist.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---

### #P5-086 — Create Phase 5 Final Review and Handoff

**Task:** Create Phase 5 Final Review and Handoff
**ID:** `P5-086`
**Branch:** `phase5/P5-086-phase-5-final-review`
**Description:** Create final review and handoff document for Phase 5.
**Goal:** Close AIM Engine Integration phase and authorize Phase 6 start.
**Output:** `docs/phase-5/final-review.md`
**Priority:** `P0`
**Dependencies:** `P5-085`
**AgentPrompt:** `Use docs/tasks/phase_5_task_prompts.md #P5-086`

#### Requirements

- Work only on this task and its declared output.
- Use the exact branch name from this prompt and Notion.
- Verify all dependencies are `Done` in Notion and their outputs exist in GitHub before starting.
- Preserve Phase 5 scope: Backend-to-AIM Engine integration only.
- Do not add AI Teacher, Student Web App, voice, payments, parent dashboard, or unrelated UI work.
- Do not move AIM logic into Flutter or Admin UI.
- Backend remains the authority for AIM calls, persistence, permissions, and result access.
- Do not expose secrets, service-role keys, database credentials, or AI provider keys.

#### Done Test

- `docs/phase-5/final-review.md` exists or the described implementation is present.
- The output matches the task scope and does not implement unrelated Phase 5 tasks.
- Any changed backend, AIM Engine, admin, Flutter, or migration files pass applicable checks, or limitations are documented.
- No client-side AIM calculation or direct AIM Engine client call is introduced.
- Notion has a completion comment with branch, commits, files changed, checks, limitations, and scope validation.

---
