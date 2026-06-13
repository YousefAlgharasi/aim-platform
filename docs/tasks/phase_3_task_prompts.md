# AIM Phase 3 Task Prompts

## Purpose

This file contains the execution prompts for **Phase 3 — Curriculum & Content System**.

Each Notion task points to one section in this file using:

```text
Use docs/tasks/phase_3_task_prompts.md #P3-XXX
```

Phase 3 builds the curriculum and content foundation that later phases will use for onboarding, placement, lessons, practice, sessions, recommendations, and AIM integration.

Phase 3 does **not** implement learner execution flows.

---

## Active Phase 3 Direction

| Area | Decision |
|---|---|
| Phase name | Phase 3 — Curriculum & Content System |
| Core scope | Courses, levels, chapters, lessons, skills, objectives, assets, question bank |
| Content status | draft / published / archived |
| Critical rule | Every lesson must be linked to one or more skills |
| Backend authority | Backend owns curriculum data, validation, publishing, and permissions |
| Client role | Admin/Flutter clients display and submit data only |
| AIM relationship | Phase 3 prepares skill-linked content for future AIM use; it does not run AIM |
| Out of scope | Onboarding, placement execution, learner lesson delivery, practice, sessions, AIM runtime integration, dashboard, review/retention, progress, AI Teacher, Student Web App |

---

## Critical Lesson-Skill Requirement

Every lesson must be linked to one or more skills.

Example:

```text
Lesson: Past Simple Basics
Skills:
  grammar.past_simple.forms
  grammar.past_simple.negative
  grammar.past_simple.questions
```

Without this link, future AIM and recommendation systems cannot know what the lesson develops in the student.

No published lesson may exist without at least one skill link.

---

## Required Identity Input

```text
TEAM_MEMBER_NOTION_EMAIL=<member-email>
```

Use this email to claim the task in Notion before editing repository files.

---

## Agent Master Instruction

You are an AI coding/documentation agent working on the AIM repository.

Repository:

```text
https://github.com/YousefAlgharasi/aim-platform
```

Notion Phase 3 Tasks database:

```text
https://app.notion.com/p/daf9a5d992c743e99b6ec6afed4db07a
```

Detailed prompt file:

```text
docs/tasks/phase_3_task_prompts.md
```

### Workflow

1. Open the Notion Phase 3 Tasks database.
2. Pick only one task where `Status = Undone` and `Assigned = empty`.
3. Check all dependencies before claiming.
4. Assign the task to yourself using `TEAM_MEMBER_NOTION_EMAIL`.
5. Set `Status = In Progress`.
6. Use the exact branch from Notion.
7. Open this file and find the exact `#P3-XXX` section.
8. Execute only that task.
9. Run relevant checks.
10. Commit and push the task branch.
11. Add a Notion completion comment.
12. Mark the task Done only after push succeeds.

### Branch Format

```text
phase3/P3-XXX-short-task-name
```

### Commit Format

```text
P3-XXX: <short task title>
```

### Stop Conditions

Stop immediately if:

- A dependency is missing or incomplete.
- The exact prompt section is missing.
- A lesson can be published without skills.
- A content API is unprotected.
- Admin UI bypasses backend authority.
- A real secret is detected.
- Onboarding, placement, learner delivery, practice, sessions, AIM runtime, dashboard recommendations, AI Teacher, progress reports, or Student Web App work appears.

---

## Phase 3 Task Prompts

### #P3-001 — Create Phase 3 Curriculum and Content Charter

**Branch**

```text
phase3/P3-001-curriculum-content-charter
```

**Task**

Create Phase 3 Curriculum and Content Charter

**Description**

Create the official Phase 3 charter for the Curriculum & Content System.

**Goal**

Define Phase 3 scope and prevent onboarding, placement, learner delivery, practice, sessions, AIM runtime integration, AI Teacher, progress, or Student Web App work from entering this phase.

**Dependencies**

```text
P2-071
```

**Output**

```text
docs/phase-3/curriculum-content-system-charter.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/curriculum-content-system-charter.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-001 — Create Phase 3 Curriculum and Content Charter
Status: Done / Blocked

Branch:
phase3/P3-001-curriculum-content-charter

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-002 — Create Phase 3 Task Execution Rules

**Branch**

```text
phase3/P3-002-phase-3-task-rules
```

**Task**

Create Phase 3 Task Execution Rules

**Description**

Create execution rules for Phase 3 task claiming, branch usage, dependency validation, commit, push, and Notion completion.

**Goal**

Make Phase 3 execution consistent with Phase 0, Phase 1, and Phase 2.

**Dependencies**

```text
P3-001
```

**Output**

```text
docs/phase-3/task-execution-rules.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/task-execution-rules.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-002 — Create Phase 3 Task Execution Rules
Status: Done / Blocked

Branch:
phase3/P3-002-phase-3-task-rules

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-003 — Define Curriculum Source of Truth

**Branch**

```text
phase3/P3-003-curriculum-source-of-truth
```

**Task**

Define Curriculum Source of Truth

**Description**

Document which system owns curriculum content, content publishing, content status, and skill mappings.

**Goal**

Prevent clients or downstream learning features from becoming the source of truth for content.

**Dependencies**

```text
P3-001
```

**Output**

```text
docs/phase-3/curriculum-source-of-truth.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/curriculum-source-of-truth.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-003 — Define Curriculum Source of Truth
Status: Done / Blocked

Branch:
phase3/P3-003-curriculum-source-of-truth

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-004 — Create Curriculum API Map

**Branch**

```text
phase3/P3-004-curriculum-api-map
```

**Task**

Create Curriculum API Map

**Description**

Define backend APIs required for courses, levels, chapters, lessons, skills, objectives, assets, questions, and status workflow.

**Goal**

Avoid random or duplicated curriculum endpoints during implementation.

**Dependencies**

```text
P3-003
```

**Output**

```text
docs/phase-3/curriculum-api-map.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: docs/phase-3/curriculum-api-map.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-004 — Create Curriculum API Map
Status: Done / Blocked

Branch:
phase3/P3-004-curriculum-api-map

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-005 — Create Curriculum Data Model Map

**Branch**

```text
phase3/P3-005-curriculum-data-model-map
```

**Task**

Create Curriculum Data Model Map

**Description**

Define the database model for curriculum content and relationships.

**Goal**

Make relationships between courses, levels, chapters, lessons, skills, objectives, assets, and questions explicit before migrations.

**Dependencies**

```text
P3-003
```

**Output**

```text
docs/phase-3/curriculum-data-model-map.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/curriculum-data-model-map.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-005 — Create Curriculum Data Model Map
Status: Done / Blocked

Branch:
phase3/P3-005-curriculum-data-model-map

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-006 — Create Lesson-Skill Linking Rules

**Branch**

```text
phase3/P3-006-lesson-skill-linking-rules
```

**Task**

Create Lesson-Skill Linking Rules

**Description**

Document the mandatory rule that every lesson must link to one or more skills.

**Goal**

Ensure AIM can later understand which skills each lesson develops.

**Dependencies**

```text
P3-005
```

**Output**

```text
docs/phase-3/lesson-skill-linking-rules.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.

**Done Test**

- Expected output exists: docs/phase-3/lesson-skill-linking-rules.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.

**Final Response**

```text
Task: P3-006 — Create Lesson-Skill Linking Rules
Status: Done / Blocked

Branch:
phase3/P3-006-lesson-skill-linking-rules

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-007 — Create Content Status Lifecycle Rules

**Branch**

```text
phase3/P3-007-content-status-lifecycle
```

**Task**

Create Content Status Lifecycle Rules

**Description**

Document the draft, published, and archived content lifecycle.

**Goal**

Make publishing behavior explicit and enforceable before APIs and admin UI are built.

**Dependencies**

```text
P3-005
```

**Output**

```text
docs/phase-3/content-status-lifecycle.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/content-status-lifecycle.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-007 — Create Content Status Lifecycle Rules
Status: Done / Blocked

Branch:
phase3/P3-007-content-status-lifecycle

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-008 — Create Content Publishing Permission Rules

**Branch**

```text
phase3/P3-008-content-publishing-permissions
```

**Task**

Create Content Publishing Permission Rules

**Description**

Document who can create, update, publish, archive, and view content.

**Goal**

Ensure Phase 3 content actions remain protected by Phase 2 roles and permissions.

**Dependencies**

```text
P3-007, P2-035
```

**Output**

```text
docs/phase-3/content-publishing-permissions.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/content-publishing-permissions.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-008 — Create Content Publishing Permission Rules
Status: Done / Blocked

Branch:
phase3/P3-008-content-publishing-permissions

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-009 — Define Course, Level, and Chapter Contracts

**Branch**

```text
phase3/P3-009-course-level-chapter-contracts
```

**Task**

Define Course, Level, and Chapter Contracts

**Description**

Define shared contracts for courses, levels, chapters, ordering, status, and safe fields.

**Goal**

Keep backend and admin dashboard aligned on curriculum hierarchy shapes.

**Dependencies**

```text
P3-004, P3-005
```

**Output**

```text
packages/shared-contracts/api/curriculum-hierarchy-contracts.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: packages/shared-contracts/api/curriculum-hierarchy-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-009 — Define Course, Level, and Chapter Contracts
Status: Done / Blocked

Branch:
phase3/P3-009-course-level-chapter-contracts

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-010 — Define Lesson Contract

**Branch**

```text
phase3/P3-010-lesson-contract
```

**Task**

Define Lesson Contract

**Description**

Define lesson contracts including metadata, content blocks, hierarchy references, status, and safe fields.

**Goal**

Ensure lessons are represented consistently before backend and admin implementation.

**Dependencies**

```text
P3-004, P3-006
```

**Output**

```text
packages/shared-contracts/api/lesson-contracts.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.

**Done Test**

- Expected output exists: packages/shared-contracts/api/lesson-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-010 — Define Lesson Contract
Status: Done / Blocked

Branch:
phase3/P3-010-lesson-contract

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-011 — Define Skill Contract

**Branch**

```text
phase3/P3-011-skill-contract
```

**Task**

Define Skill Contract

**Description**

Define skill contracts including skill key, title, description, domain, parent skill, and status.

**Goal**

Create a stable skill taxonomy contract for lesson and question mapping.

**Dependencies**

```text
P3-006
```

**Output**

```text
packages/shared-contracts/api/skill-contracts.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.

**Done Test**

- Expected output exists: packages/shared-contracts/api/skill-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-011 — Define Skill Contract
Status: Done / Blocked

Branch:
phase3/P3-011-skill-contract

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-012 — Define Objective Contract

**Branch**

```text
phase3/P3-012-objective-contract
```

**Task**

Define Objective Contract

**Description**

Define objective contracts for lesson objectives and skill-related learning objectives.

**Goal**

Represent learning objectives separately from lessons and skills while allowing mappings.

**Dependencies**

```text
P3-010, P3-011
```

**Output**

```text
packages/shared-contracts/api/objective-contracts.md
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: packages/shared-contracts/api/objective-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-012 — Define Objective Contract
Status: Done / Blocked

Branch:
phase3/P3-012-objective-contract

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-013 — Define Lesson Asset Contract

**Branch**

```text
phase3/P3-013-lesson-asset-contract
```

**Task**

Define Lesson Asset Contract

**Description**

Define contracts for lesson assets such as images, audio, video, documents, and external references.

**Goal**

Standardize lesson asset metadata without building learner delivery yet.

**Dependencies**

```text
P3-010
```

**Output**

```text
packages/shared-contracts/api/lesson-asset-contracts.md
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.

**Done Test**

- Expected output exists: packages/shared-contracts/api/lesson-asset-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-013 — Define Lesson Asset Contract
Status: Done / Blocked

Branch:
phase3/P3-013-lesson-asset-contract

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-014 — Define Question Bank Contract

**Branch**

```text
phase3/P3-014-question-bank-contract
```

**Task**

Define Question Bank Contract

**Description**

Define contracts for question bank items, choices, answers, explanations, difficulty labels, and skill mappings.

**Goal**

Prepare reusable question content without implementing practice/session logic.

**Dependencies**

```text
P3-011
```

**Output**

```text
packages/shared-contracts/api/question-bank-contracts.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.

**Done Test**

- Expected output exists: packages/shared-contracts/api/question-bank-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-014 — Define Question Bank Contract
Status: Done / Blocked

Branch:
phase3/P3-014-question-bank-contract

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-015 — Define Content Status Contract

**Branch**

```text
phase3/P3-015-content-status-contract
```

**Task**

Define Content Status Contract

**Description**

Define content status enum and lifecycle response contracts for draft, published, and archived states.

**Goal**

Ensure every content entity uses a consistent lifecycle model.

**Dependencies**

```text
P3-007
```

**Output**

```text
packages/shared-contracts/api/content-status-contracts.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: packages/shared-contracts/api/content-status-contracts.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-015 — Define Content Status Contract
Status: Done / Blocked

Branch:
phase3/P3-015-content-status-contract

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-016 — Define Curriculum Error Codes

**Branch**

```text
phase3/P3-016-curriculum-error-codes
```

**Task**

Define Curriculum Error Codes

**Description**

Add or document error codes for curriculum content validation and publishing rules.

**Goal**

Make curriculum errors consistent across backend and admin dashboard.

**Dependencies**

```text
P3-009, P3-010, P3-011, P3-014, P3-015
```

**Output**

```text
Update packages/shared-contracts/api/errors.md
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: Update packages/shared-contracts/api/errors.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-016 — Define Curriculum Error Codes
Status: Done / Blocked

Branch:
phase3/P3-016-curriculum-error-codes

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-017 — Create Courses Table Migration

**Branch**

```text
phase3/P3-017-courses-migration
```

**Task**

Create Courses Table Migration

**Description**

Create database migration for courses.

**Goal**

Persist top-level curriculum courses.

**Dependencies**

```text
P3-005, P3-009
```

**Output**

```text
Database migration for courses table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for courses table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-017 — Create Courses Table Migration
Status: Done / Blocked

Branch:
phase3/P3-017-courses-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-018 — Create Levels Table Migration

**Branch**

```text
phase3/P3-018-levels-migration
```

**Task**

Create Levels Table Migration

**Description**

Create database migration for levels linked to courses where applicable.

**Goal**

Persist ordered learner levels within the curriculum system.

**Dependencies**

```text
P3-017
```

**Output**

```text
Database migration for levels table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for levels table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-018 — Create Levels Table Migration
Status: Done / Blocked

Branch:
phase3/P3-018-levels-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-019 — Create Chapters Table Migration

**Branch**

```text
phase3/P3-019-chapters-migration
```

**Task**

Create Chapters Table Migration

**Description**

Create database migration for chapters linked to course/level hierarchy.

**Goal**

Persist chapter grouping and ordering for lessons.

**Dependencies**

```text
P3-018
```

**Output**

```text
Database migration for chapters table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for chapters table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-019 — Create Chapters Table Migration
Status: Done / Blocked

Branch:
phase3/P3-019-chapters-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-020 — Create Skills Table Migration

**Branch**

```text
phase3/P3-020-skills-migration
```

**Task**

Create Skills Table Migration

**Description**

Create database migration for skills and optional parent-skill hierarchy.

**Goal**

Persist the skill taxonomy used by lessons and questions.

**Dependencies**

```text
P3-011
```

**Output**

```text
Database migration for skills table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for skills table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-020 — Create Skills Table Migration
Status: Done / Blocked

Branch:
phase3/P3-020-skills-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-021 — Create Objectives Table Migration

**Branch**

```text
phase3/P3-021-objectives-migration
```

**Task**

Create Objectives Table Migration

**Description**

Create database migration for objectives.

**Goal**

Persist lesson and skill objectives as first-class content records.

**Dependencies**

```text
P3-012
```

**Output**

```text
Database migration for objectives table
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for objectives table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-021 — Create Objectives Table Migration
Status: Done / Blocked

Branch:
phase3/P3-021-objectives-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-022 — Create Lessons Table Migration

**Branch**

```text
phase3/P3-022-lessons-migration
```

**Task**

Create Lessons Table Migration

**Description**

Create database migration for lessons linked to curriculum hierarchy and content status.

**Goal**

Persist lessons without implementing learner delivery.

**Dependencies**

```text
P3-019, P3-010, P3-015
```

**Output**

```text
Database migration for lessons table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for lessons table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-022 — Create Lessons Table Migration
Status: Done / Blocked

Branch:
phase3/P3-022-lessons-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-023 — Create Lesson Skills Mapping Migration

**Branch**

```text
phase3/P3-023-lesson-skills-migration
```

**Task**

Create Lesson Skills Mapping Migration

**Description**

Create database migration for many-to-many lesson-to-skill mapping.

**Goal**

Enforce that every lesson can be connected to one or more skills.

**Dependencies**

```text
P3-020, P3-022
```

**Output**

```text
Database migration for lesson_skills table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for lesson_skills table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-023 — Create Lesson Skills Mapping Migration
Status: Done / Blocked

Branch:
phase3/P3-023-lesson-skills-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-024 — Create Lesson Objectives Mapping Migration

**Branch**

```text
phase3/P3-024-lesson-objectives-migration
```

**Task**

Create Lesson Objectives Mapping Migration

**Description**

Create database migration for lesson-to-objective mapping.

**Goal**

Allow lessons to declare explicit learning objectives.

**Dependencies**

```text
P3-021, P3-022
```

**Output**

```text
Database migration for lesson_objectives table
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for lesson_objectives table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-024 — Create Lesson Objectives Mapping Migration
Status: Done / Blocked

Branch:
phase3/P3-024-lesson-objectives-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-025 — Create Lesson Assets Migration

**Branch**

```text
phase3/P3-025-lesson-assets-migration
```

**Task**

Create Lesson Assets Migration

**Description**

Create database migration for lesson assets.

**Goal**

Persist asset metadata for lessons without exposing delivery logic.

**Dependencies**

```text
P3-022, P3-013
```

**Output**

```text
Database migration for lesson_assets table
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for lesson_assets table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-025 — Create Lesson Assets Migration
Status: Done / Blocked

Branch:
phase3/P3-025-lesson-assets-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-026 — Create Question Bank Migration

**Branch**

```text
phase3/P3-026-question-bank-migration
```

**Task**

Create Question Bank Migration

**Description**

Create database migration for question bank items and answer metadata.

**Goal**

Persist reusable question content for future practice and placement phases.

**Dependencies**

```text
P3-014, P3-020
```

**Output**

```text
Database migration for question_bank table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for question_bank table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-026 — Create Question Bank Migration
Status: Done / Blocked

Branch:
phase3/P3-026-question-bank-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-027 — Create Question Skills Mapping Migration

**Branch**

```text
phase3/P3-027-question-skills-migration
```

**Task**

Create Question Skills Mapping Migration

**Description**

Create database migration for question-to-skill mapping.

**Goal**

Ensure questions are tied to the skills they assess or develop.

**Dependencies**

```text
P3-026, P3-020
```

**Output**

```text
Database migration for question_skills table
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for question_skills table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Question bank items can be linked to one or more skills.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-027 — Create Question Skills Mapping Migration
Status: Done / Blocked

Branch:
phase3/P3-027-question-skills-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-028 — Create Curriculum Audit Log Migration

**Branch**

```text
phase3/P3-028-curriculum-audit-log-migration
```

**Task**

Create Curriculum Audit Log Migration

**Description**

Create migration for tracking curriculum content changes and publish/archive actions.

**Goal**

Support traceability for content management actions.

**Dependencies**

```text
P3-008
```

**Output**

```text
Database migration for curriculum_audit_logs table
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use additive, reviewable migrations only.
- Do not introduce onboarding, placement, session, progress, or AIM runtime tables in Phase 3.

**Done Test**

- Expected output exists: Database migration for curriculum_audit_logs table
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Migration is additive and does not create out-of-scope tables.

**Final Response**

```text
Task: P3-028 — Create Curriculum Audit Log Migration
Status: Done / Blocked

Branch:
phase3/P3-028-curriculum-audit-log-migration

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-029 — Add Curriculum Seed Data

**Branch**

```text
phase3/P3-029-curriculum-seed-data
```

**Task**

Add Curriculum Seed Data

**Description**

Add safe MVP seed data for courses, levels, chapters, skills, lessons, lesson-skill links, and questions.

**Goal**

Provide initial content examples while proving lesson-skill and question-skill mappings work.

**Dependencies**

```text
P3-017, P3-018, P3-019, P3-020, P3-022, P3-023, P3-026, P3-027
```

**Output**

```text
Curriculum seed data
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: Curriculum seed data
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-029 — Add Curriculum Seed Data
Status: Done / Blocked

Branch:
phase3/P3-029-curriculum-seed-data

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-030 — Create Curriculum RLS and Security Plan

**Branch**

```text
phase3/P3-030-curriculum-rls-security-plan
```

**Task**

Create Curriculum RLS and Security Plan

**Description**

Document or implement RLS/security policy planning for curriculum content tables.

**Goal**

Ensure curriculum data access aligns with Phase 2 auth and roles.

**Dependencies**

```text
P3-017 through P3-028, P2-035
```

**Output**

```text
docs/phase-3/curriculum-rls-security-plan.md or migration if required
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: docs/phase-3/curriculum-rls-security-plan.md or migration if required
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-030 — Create Curriculum RLS and Security Plan
Status: Done / Blocked

Branch:
phase3/P3-030-curriculum-rls-security-plan

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-031 — Implement Courses Service and API

**Branch**

```text
phase3/P3-031-courses-service-api
```

**Task**

Implement Courses Service and API

**Description**

Implement backend service and API for courses.

**Goal**

Allow authorized users to manage and list courses through backend-controlled APIs.

**Dependencies**

```text
P3-017, P3-009, P3-046
```

**Output**

```text
Backend courses service and API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend courses service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-031 — Implement Courses Service and API
Status: Done / Blocked

Branch:
phase3/P3-031-courses-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-032 — Implement Levels Service and API

**Branch**

```text
phase3/P3-032-levels-service-api
```

**Task**

Implement Levels Service and API

**Description**

Implement backend service and API for levels.

**Goal**

Allow authorized users to manage levels under courses.

**Dependencies**

```text
P3-018, P3-009, P3-046
```

**Output**

```text
Backend levels service and API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend levels service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-032 — Implement Levels Service and API
Status: Done / Blocked

Branch:
phase3/P3-032-levels-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-033 — Implement Chapters Service and API

**Branch**

```text
phase3/P3-033-chapters-service-api
```

**Task**

Implement Chapters Service and API

**Description**

Implement backend service and API for chapters.

**Goal**

Allow authorized users to manage chapter hierarchy and ordering.

**Dependencies**

```text
P3-019, P3-009, P3-046
```

**Output**

```text
Backend chapters service and API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend chapters service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-033 — Implement Chapters Service and API
Status: Done / Blocked

Branch:
phase3/P3-033-chapters-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-034 — Implement Skills Service and API

**Branch**

```text
phase3/P3-034-skills-service-api
```

**Task**

Implement Skills Service and API

**Description**

Implement backend service and API for skill taxonomy.

**Goal**

Allow authorized users to manage and query skills.

**Dependencies**

```text
P3-020, P3-011, P3-046
```

**Output**

```text
Backend skills service and API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend skills service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-034 — Implement Skills Service and API
Status: Done / Blocked

Branch:
phase3/P3-034-skills-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-035 — Implement Objectives Service and API

**Branch**

```text
phase3/P3-035-objectives-service-api
```

**Task**

Implement Objectives Service and API

**Description**

Implement backend service and API for objectives.

**Goal**

Allow authorized users to manage learning objectives.

**Dependencies**

```text
P3-021, P3-012, P3-046
```

**Output**

```text
Backend objectives service and API
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend objectives service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-035 — Implement Objectives Service and API
Status: Done / Blocked

Branch:
phase3/P3-035-objectives-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-036 — Implement Lesson Assets Service and API

**Branch**

```text
phase3/P3-036-lesson-assets-service-api
```

**Task**

Implement Lesson Assets Service and API

**Description**

Implement backend service and API for lesson asset metadata.

**Goal**

Allow authorized users to attach and manage assets for lessons.

**Dependencies**

```text
P3-025, P3-013, P3-046
```

**Output**

```text
Backend lesson assets service and API
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend lesson assets service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-036 — Implement Lesson Assets Service and API
Status: Done / Blocked

Branch:
phase3/P3-036-lesson-assets-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-037 — Implement Lessons Service and API

**Branch**

```text
phase3/P3-037-lessons-service-api
```

**Task**

Implement Lessons Service and API

**Description**

Implement backend service and API for lesson creation, updates, retrieval, and hierarchy placement.

**Goal**

Allow authorized users to manage lessons without learner delivery execution.

**Dependencies**

```text
P3-022, P3-010, P3-046
```

**Output**

```text
Backend lessons service and API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Backend lessons service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-037 — Implement Lessons Service and API
Status: Done / Blocked

Branch:
phase3/P3-037-lessons-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-038 — Implement Lesson Skill Mapping API

**Branch**

```text
phase3/P3-038-lesson-skill-mapping-api
```

**Task**

Implement Lesson Skill Mapping API

**Description**

Implement backend API for attaching and removing skills from lessons.

**Goal**

Make lesson-to-skill mapping editable through backend-controlled APIs.

**Dependencies**

```text
P3-023, P3-034, P3-037
```

**Output**

```text
Lesson-skill mapping API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Lesson-skill mapping API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-038 — Implement Lesson Skill Mapping API
Status: Done / Blocked

Branch:
phase3/P3-038-lesson-skill-mapping-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-039 — Enforce Lesson-Skill Validation

**Branch**

```text
phase3/P3-039-lesson-skill-validation
```

**Task**

Enforce Lesson-Skill Validation

**Description**

Implement backend validation that blocks publishing lessons without at least one skill.

**Goal**

Guarantee the critical requirement that every published lesson has skills.

**Dependencies**

```text
P3-006, P3-038, P3-043
```

**Output**

```text
Lesson-skill publish validation service
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Lesson-skill publish validation service
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.

**Final Response**

```text
Task: P3-039 — Enforce Lesson-Skill Validation
Status: Done / Blocked

Branch:
phase3/P3-039-lesson-skill-validation

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-040 — Implement Lesson Objective Mapping API

**Branch**

```text
phase3/P3-040-lesson-objective-mapping-api
```

**Task**

Implement Lesson Objective Mapping API

**Description**

Implement backend API for mapping objectives to lessons.

**Goal**

Support explicit lesson learning objectives.

**Dependencies**

```text
P3-024, P3-035, P3-037
```

**Output**

```text
Lesson-objective mapping API
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Lesson-objective mapping API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-040 — Implement Lesson Objective Mapping API
Status: Done / Blocked

Branch:
phase3/P3-040-lesson-objective-mapping-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-041 — Implement Question Bank Service and API

**Branch**

```text
phase3/P3-041-question-bank-service-api
```

**Task**

Implement Question Bank Service and API

**Description**

Implement backend service and API for question bank CRUD.

**Goal**

Manage reusable question content for future learner activities.

**Dependencies**

```text
P3-026, P3-014, P3-046
```

**Output**

```text
Question bank service and API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Question bank service and API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-041 — Implement Question Bank Service and API
Status: Done / Blocked

Branch:
phase3/P3-041-question-bank-service-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-042 — Implement Question Skill Mapping API

**Branch**

```text
phase3/P3-042-question-skill-mapping-api
```

**Task**

Implement Question Skill Mapping API

**Description**

Implement backend API for mapping questions to skills.

**Goal**

Ensure questions identify which skills they assess or develop.

**Dependencies**

```text
P3-027, P3-034, P3-041
```

**Output**

```text
Question-skill mapping API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Question-skill mapping API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Question bank items can be linked to one or more skills.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-042 — Implement Question Skill Mapping API
Status: Done / Blocked

Branch:
phase3/P3-042-question-skill-mapping-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-043 — Implement Content Status Workflow API

**Branch**

```text
phase3/P3-043-content-status-workflow-api
```

**Task**

Implement Content Status Workflow API

**Description**

Implement backend workflow for draft, published, and archived content status changes.

**Goal**

Centralize content lifecycle transitions in the backend.

**Dependencies**

```text
P3-007, P3-015
```

**Output**

```text
Content status workflow API
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Content status workflow API
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-043 — Implement Content Status Workflow API
Status: Done / Blocked

Branch:
phase3/P3-043-content-status-workflow-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-044 — Implement Publish Validation Service

**Branch**

```text
phase3/P3-044-publish-validation-service
```

**Task**

Implement Publish Validation Service

**Description**

Implement backend validation for publishing courses/chapters/lessons/questions.

**Goal**

Prevent invalid or incomplete content from becoming published.

**Dependencies**

```text
P3-039, P3-042, P3-043
```

**Output**

```text
Publish validation service
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Publish validation service
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-044 — Implement Publish Validation Service
Status: Done / Blocked

Branch:
phase3/P3-044-publish-validation-service

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-045 — Implement Curriculum Search and Filter APIs

**Branch**

```text
phase3/P3-045-curriculum-search-filters-api
```

**Task**

Implement Curriculum Search and Filter APIs

**Description**

Add list/search/filter behavior for curriculum admin management.

**Goal**

Improve admin content management without learner delivery logic.

**Dependencies**

```text
P3-031, P3-032, P3-033, P3-034, P3-037, P3-041
```

**Output**

```text
Curriculum search/list filter APIs
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Curriculum search/list filter APIs
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-045 — Implement Curriculum Search and Filter APIs
Status: Done / Blocked

Branch:
phase3/P3-045-curriculum-search-filters-api

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-046 — Add Curriculum Permission Guards

**Branch**

```text
phase3/P3-046-curriculum-permission-guards
```

**Task**

Add Curriculum Permission Guards

**Description**

Apply Phase 2 role/permission guards to curriculum management endpoints.

**Goal**

Protect all curriculum write/publish/archive actions.

**Dependencies**

```text
P2-037, P2-038, P3-008
```

**Output**

```text
Backend curriculum permission guards
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: Backend curriculum permission guards
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Backend tests or documented checks cover the new API/service behavior.

**Final Response**

```text
Task: P3-046 — Add Curriculum Permission Guards
Status: Done / Blocked

Branch:
phase3/P3-046-curriculum-permission-guards

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-047 — Add Curriculum DTO Validation

**Branch**

```text
phase3/P3-047-curriculum-dto-validation
```

**Task**

Add Curriculum DTO Validation

**Description**

Add validation for curriculum request payloads.

**Goal**

Prevent invalid content, bad status transitions, and missing required fields.

**Dependencies**

```text
P3-009 through P3-016
```

**Output**

```text
Curriculum DTO validation
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Implement backend-owned validation.
- Protect write/publish/archive endpoints with Phase 2 role/permission guards where applicable.

**Done Test**

- Expected output exists: Curriculum DTO validation
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-047 — Add Curriculum DTO Validation
Status: Done / Blocked

Branch:
phase3/P3-047-curriculum-dto-validation

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-048 — Add Curriculum Backend Tests

**Branch**

```text
phase3/P3-048-curriculum-backend-tests
```

**Task**

Add Curriculum Backend Tests

**Description**

Add backend tests for courses, levels, chapters, skills, lessons, assets, question bank, and guards.

**Goal**

Verify curriculum APIs work and are protected.

**Dependencies**

```text
P3-031 through P3-047
```

**Output**

```text
Backend curriculum test suite
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: Backend curriculum test suite
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-048 — Add Curriculum Backend Tests
Status: Done / Blocked

Branch:
phase3/P3-048-curriculum-backend-tests

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-049 — Add Lesson-Skill Regression Tests

**Branch**

```text
phase3/P3-049-lesson-skill-regression-tests
```

**Task**

Add Lesson-Skill Regression Tests

**Description**

Add tests proving lessons cannot be published without skills and question bank items can be linked to skills.

**Goal**

Protect the critical AIM-readiness requirement.

**Dependencies**

```text
P3-039, P3-042, P3-044
```

**Output**

```text
Lesson-skill and question-skill regression tests
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.

**Done Test**

- Expected output exists: Lesson-skill and question-skill regression tests
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.

**Final Response**

```text
Task: P3-049 — Add Lesson-Skill Regression Tests
Status: Done / Blocked

Branch:
phase3/P3-049-lesson-skill-regression-tests

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-050 — Add Curriculum Audit Logging

**Branch**

```text
phase3/P3-050-curriculum-audit-logging
```

**Task**

Add Curriculum Audit Logging

**Description**

Add audit logging for content creation, updates, publishing, archiving, and mapping changes.

**Goal**

Provide traceability for curriculum management actions.

**Dependencies**

```text
P3-028, P3-043, P3-046
```

**Output**

```text
Curriculum audit logging implementation
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.

**Done Test**

- Expected output exists: Curriculum audit logging implementation
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.

**Final Response**

```text
Task: P3-050 — Add Curriculum Audit Logging
Status: Done / Blocked

Branch:
phase3/P3-050-curriculum-audit-logging

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-051 — Build Admin Curriculum Navigation UI

**Branch**

```text
phase3/P3-051-admin-curriculum-navigation-ui
```

**Task**

Build Admin Curriculum Navigation UI

**Description**

Add admin dashboard navigation for curriculum and content management areas.

**Goal**

Give admins a structured entry point into curriculum management.

**Dependencies**

```text
P1-047, P3-004
```

**Output**

```text
Admin curriculum navigation UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin curriculum navigation UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-051 — Build Admin Curriculum Navigation UI
Status: Done / Blocked

Branch:
phase3/P3-051-admin-curriculum-navigation-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-052 — Build Admin Courses UI

**Branch**

```text
phase3/P3-052-admin-courses-ui
```

**Task**

Build Admin Courses UI

**Description**

Build admin UI for listing, creating, and editing courses.

**Goal**

Allow authorized admins to manage courses from the dashboard.

**Dependencies**

```text
P3-031, P3-051
```

**Output**

```text
Admin courses UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin courses UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-052 — Build Admin Courses UI
Status: Done / Blocked

Branch:
phase3/P3-052-admin-courses-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-053 — Build Admin Levels UI

**Branch**

```text
phase3/P3-053-admin-levels-ui
```

**Task**

Build Admin Levels UI

**Description**

Build admin UI for listing, creating, and editing levels.

**Goal**

Allow authorized admins to manage levels from the dashboard.

**Dependencies**

```text
P3-032, P3-052
```

**Output**

```text
Admin levels UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin levels UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-053 — Build Admin Levels UI
Status: Done / Blocked

Branch:
phase3/P3-053-admin-levels-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-054 — Build Admin Chapters UI

**Branch**

```text
phase3/P3-054-admin-chapters-ui
```

**Task**

Build Admin Chapters UI

**Description**

Build admin UI for listing, creating, and editing chapters.

**Goal**

Allow authorized admins to manage chapter hierarchy.

**Dependencies**

```text
P3-033, P3-053
```

**Output**

```text
Admin chapters UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin chapters UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-054 — Build Admin Chapters UI
Status: Done / Blocked

Branch:
phase3/P3-054-admin-chapters-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-055 — Build Admin Skills UI

**Branch**

```text
phase3/P3-055-admin-skills-ui
```

**Task**

Build Admin Skills UI

**Description**

Build admin UI for skill taxonomy management.

**Goal**

Allow authorized admins to manage skills used by lessons and questions.

**Dependencies**

```text
P3-034, P3-051
```

**Output**

```text
Admin skills UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin skills UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-055 — Build Admin Skills UI
Status: Done / Blocked

Branch:
phase3/P3-055-admin-skills-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-056 — Build Admin Objectives UI

**Branch**

```text
phase3/P3-056-admin-objectives-ui
```

**Task**

Build Admin Objectives UI

**Description**

Build admin UI for objective management.

**Goal**

Allow authorized admins to manage learning objectives.

**Dependencies**

```text
P3-035, P3-055
```

**Output**

```text
Admin objectives UI
```

**Priority**

```text
P2
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin objectives UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-056 — Build Admin Objectives UI
Status: Done / Blocked

Branch:
phase3/P3-056-admin-objectives-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-057 — Build Admin Lessons UI

**Branch**

```text
phase3/P3-057-admin-lessons-ui
```

**Task**

Build Admin Lessons UI

**Description**

Build admin UI for lesson creation and editing.

**Goal**

Allow authorized admins to manage lesson metadata/content without learner delivery.

**Dependencies**

```text
P3-037, P3-054
```

**Output**

```text
Admin lessons UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin lessons UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-057 — Build Admin Lessons UI
Status: Done / Blocked

Branch:
phase3/P3-057-admin-lessons-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-058 — Build Admin Lesson Skill Linking UI

**Branch**

```text
phase3/P3-058-admin-lesson-skill-linking-ui
```

**Task**

Build Admin Lesson Skill Linking UI

**Description**

Build admin UI for linking lessons to one or more skills.

**Goal**

Make the critical lesson-skill link visible and manageable.

**Dependencies**

```text
P3-038, P3-055, P3-057
```

**Output**

```text
Admin lesson-skill linking UI
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin lesson-skill linking UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-058 — Build Admin Lesson Skill Linking UI
Status: Done / Blocked

Branch:
phase3/P3-058-admin-lesson-skill-linking-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-059 — Build Admin Question Bank UI

**Branch**

```text
phase3/P3-059-admin-question-bank-ui
```

**Task**

Build Admin Question Bank UI

**Description**

Build admin UI for question bank management and skill mapping.

**Goal**

Allow authorized admins to manage question bank content without learner practice execution.

**Dependencies**

```text
P3-041, P3-042, P3-055
```

**Output**

```text
Admin question bank UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin question bank UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-059 — Build Admin Question Bank UI
Status: Done / Blocked

Branch:
phase3/P3-059-admin-question-bank-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-060 — Build Admin Content Status Workflow UI

**Branch**

```text
phase3/P3-060-admin-content-status-workflow-ui
```

**Task**

Build Admin Content Status Workflow UI

**Description**

Build admin UI for draft, publish, and archive actions.

**Goal**

Allow authorized admins to change content status through backend-approved workflow.

**Dependencies**

```text
P3-043, P3-044, P3-057, P3-059
```

**Output**

```text
Admin content status workflow UI
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Admin UI must call backend APIs.
- Admin UI must not become the source of truth for publishing or authorization decisions.

**Done Test**

- Expected output exists: Admin content status workflow UI
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- UI uses backend APIs and does not bypass backend content authority.

**Final Response**

```text
Task: P3-060 — Build Admin Content Status Workflow UI
Status: Done / Blocked

Branch:
phase3/P3-060-admin-content-status-workflow-ui

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-061 — Run Curriculum Import and Seed Check

**Branch**

```text
phase3/P3-061-curriculum-import-seed-check
```

**Task**

Run Curriculum Import and Seed Check

**Description**

Verify curriculum seed data can be loaded and respects hierarchy and mappings.

**Goal**

Ensure seed content proves the data model and linking rules.

**Dependencies**

```text
P3-029
```

**Output**

```text
docs/phase-3/curriculum-import-seed-check.md
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-3/curriculum-import-seed-check.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-061 — Run Curriculum Import and Seed Check
Status: Done / Blocked

Branch:
phase3/P3-061-curriculum-import-seed-check

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-062 — Run Content Status Workflow Check

**Branch**

```text
phase3/P3-062-content-status-workflow-check
```

**Task**

Run Content Status Workflow Check

**Description**

Verify draft, published, archived status workflow across backend and admin UI.

**Goal**

Ensure invalid publishing/archiving behavior is blocked.

**Dependencies**

```text
P3-043, P3-044, P3-060
```

**Output**

```text
docs/phase-3/content-status-workflow-check.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-3/content-status-workflow-check.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-062 — Run Content Status Workflow Check
Status: Done / Blocked

Branch:
phase3/P3-062-content-status-workflow-check

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-063 — Run Lesson Asset Safety Check

**Branch**

```text
phase3/P3-063-lesson-asset-safety-check
```

**Task**

Run Lesson Asset Safety Check

**Description**

Review lesson asset metadata, allowed types, and safe exposure behavior.

**Goal**

Prevent unsafe asset references or unmanaged asset metadata.

**Dependencies**

```text
P3-025, P3-036
```

**Output**

```text
docs/phase-3/lesson-asset-safety-check.md
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-3/lesson-asset-safety-check.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-063 — Run Lesson Asset Safety Check
Status: Done / Blocked

Branch:
phase3/P3-063-lesson-asset-safety-check

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-064 — Run Question Bank Skill Coverage Check

**Branch**

```text
phase3/P3-064-question-bank-skill-coverage-check
```

**Task**

Run Question Bank Skill Coverage Check

**Description**

Verify question bank items are linked to skills and do not introduce practice/session logic.

**Goal**

Ensure future learner features can use question content safely.

**Dependencies**

```text
P3-041, P3-042, P3-059
```

**Output**

```text
docs/phase-3/question-bank-skill-coverage-check.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-3/question-bank-skill-coverage-check.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Question bank items can be linked to one or more skills.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-064 — Run Question Bank Skill Coverage Check
Status: Done / Blocked

Branch:
phase3/P3-064-question-bank-skill-coverage-check

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-065 — Run Lesson-Skill Linking Review

**Branch**

```text
phase3/P3-065-lesson-skill-linking-review
```

**Task**

Run Lesson-Skill Linking Review

**Description**

Review database, API, backend tests, seed data, and admin UI for lesson-skill linking.

**Goal**

Confirm the critical requirement is fully enforced.

**Dependencies**

```text
P3-023, P3-038, P3-039, P3-049, P3-058
```

**Output**

```text
docs/quality/phase-3-lesson-skill-linking-review.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Preserve the critical rule that every lesson must be linkable to one or more skills.
- Use stable skill identifiers such as grammar.past_simple.forms; never use display labels as primary identifiers.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/quality/phase-3-lesson-skill-linking-review.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- A lesson cannot be published without at least one skill link.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-065 — Run Lesson-Skill Linking Review
Status: Done / Blocked

Branch:
phase3/P3-065-lesson-skill-linking-review

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-066 — Run Curriculum Security Review

**Branch**

```text
phase3/P3-066-curriculum-security-review
```

**Task**

Run Curriculum Security Review

**Description**

Review content APIs, admin UI, permissions, audit logs, and safe field exposure.

**Goal**

Ensure curriculum management is secure and backend-authorized.

**Dependencies**

```text
P3-046, P3-047, P3-048, P3-050
```

**Output**

```text
docs/quality/phase-3-curriculum-security-review.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/quality/phase-3-curriculum-security-review.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-066 — Run Curriculum Security Review
Status: Done / Blocked

Branch:
phase3/P3-066-curriculum-security-review

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-067 — Run Phase 3 Architecture Review

**Branch**

```text
phase3/P3-067-phase-3-architecture-review
```

**Task**

Run Phase 3 Architecture Review

**Description**

Review Phase 3 for scope drift, architecture violations, and out-of-scope learner/AIM features.

**Goal**

Ensure Phase 3 remained Curriculum & Content System only.

**Dependencies**

```text
P3-061 through P3-066
```

**Output**

```text
docs/quality/phase-3-architecture-review.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/quality/phase-3-architecture-review.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-067 — Run Phase 3 Architecture Review
Status: Done / Blocked

Branch:
phase3/P3-067-phase-3-architecture-review

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-068 — Run Phase 3 E2E Content System Check

**Branch**

```text
phase3/P3-068-content-system-e2e-check
```

**Task**

Run Phase 3 E2E Content System Check

**Description**

Run or document an end-to-end check for curriculum creation, lesson-skill linking, question skill mapping, and publishing workflow.

**Goal**

Prove the content system works as an integrated foundation.

**Dependencies**

```text
P3-048, P3-060, P3-065, P3-066
```

**Output**

```text
docs/phase-3/content-system-e2e-check.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-3/content-system-e2e-check.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-068 — Run Phase 3 E2E Content System Check
Status: Done / Blocked

Branch:
phase3/P3-068-content-system-e2e-check

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-069 — Create Phase 4 Readiness Checklist

**Branch**

```text
phase3/P3-069-phase-4-readiness-checklist
```

**Task**

Create Phase 4 Readiness Checklist

**Description**

Create readiness checklist for the next phase after curriculum content foundation.

**Goal**

Define what the next phase can safely depend on.

**Dependencies**

```text
P3-068
```

**Output**

```text
docs/phase-4/readiness-checklist.md
```

**Priority**

```text
P1
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-4/readiness-checklist.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-069 — Create Phase 4 Readiness Checklist
Status: Done / Blocked

Branch:
phase3/P3-069-phase-4-readiness-checklist

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

### #P3-070 — Create Phase 3 Final Review and Handoff

**Branch**

```text
phase3/P3-070-phase-3-final-review
```

**Task**

Create Phase 3 Final Review and Handoff

**Description**

Create final Phase 3 handoff summarizing completed tasks, blockers, validation results, and readiness for Phase 4.

**Goal**

Close Phase 3 and document readiness state.

**Dependencies**

```text
P3-065, P3-066, P3-067, P3-068, P3-069
```

**Output**

```text
docs/phase-3/final-review.md
```

**Priority**

```text
P0
```

**Requirements**

- Stay within Phase 3 scope: Curriculum & Content System only.
- Do not implement onboarding, placement execution, learner lesson delivery, practice attempts, sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.
- Respect Phase 2 auth, role, permission, and ownership boundaries for backend/admin work.
- Do not expose secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
- Inspect relevant files and document findings clearly.
- Classify findings as PASS, MINOR, MAJOR, or CRITICAL when applicable.

**Done Test**

- Expected output exists: docs/phase-3/final-review.md
- No out-of-scope Phase 3 implementation was added.
- No secrets or sensitive credentials are present.
- Review/check document includes findings, status, and required follow-up.

**Final Response**

```text
Task: P3-070 — Create Phase 3 Final Review and Handoff
Status: Done / Blocked

Branch:
phase3/P3-070-phase-3-final-review

Files changed:
- ...

Commit:
<hash or unavailable>

Push:
succeeded / failed

Checks:
- ...

Notion:
- Assigned to <TEAM_MEMBER_NOTION_EMAIL>
- Status set to Done / In Progress

Notes:
- ...
```

---

