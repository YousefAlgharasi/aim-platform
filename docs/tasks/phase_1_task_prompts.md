# AIM Phase 1 Task Prompts

## Purpose

This file contains the execution prompts for Phase 1 — System Foundation.

Each Notion task in the Phase 1 Tasks database points to one section in this file using:

```
Use docs/tasks/phase_1_task_prompts.md #P1-XXX
```

Phase 1 prepares the technical foundation for the AIM platform. It must not become full feature implementation.

---

## Active Phase 1 Direction

| Area | Decision |
|---|---|
| Phase name | System Foundation |
| Learner client | Flutter Mobile |
| Backend API | NestJS + TypeScript |
| AIM Engine | Python backend service/module |
| Database | Supabase PostgreSQL unless later changed by documented decision |
| Auth | Supabase Auth unless later changed by documented decision |
| Admin surface | Internal Admin Dashboard foundation only |
| AI Teacher | Backend-only gateway foundation |
| Student Web App | Deferred / Optional / Phase 7 or later |

---

## Global Non-Negotiables

Every Phase 1 task must preserve these rules:

- Do not create a Student Web App.
- Do not create React/Next.js learner web app work.
- Do not treat React Web as the future learner client.
- Do not treat FastAPI as the Phase 1 Backend API.
- Do not move AIM Engine logic into Flutter Mobile or any client.
- Do not calculate mastery, student level, weakness, difficulty, retention, or recommendations in any client.
- Do not expose AI provider keys, Supabase service-role keys, database credentials, or privileged backend credentials to any client.
- Do not use speed, response time, average response time, or speed score as a direct mastery, level, or difficulty-increase signal.
- Keep AI Teacher backend-only, lesson-scoped, and validated before delivery.
- Keep learner-facing language educational, non-clinical, non-medical, and non-diagnostic.
- Backend authorization and ownership checks are final.
- Flutter Mobile renders backend-approved outputs only.

---

## Required Claim Input for Every Task

Every agent run must include:

```
TEAM_MEMBER_NOTION_EMAIL=<member-email>
```

The agent must use this email to find the matching Notion user and assign the selected task before starting work.

If `TEAM_MEMBER_NOTION_EMAIL` is missing or cannot be resolved to a Notion user, stop and do not edit the repository.

---

## Agent Master Instruction for Picking Tasks from Notion

You are an AI coding/documentation agent working on the AIM repository.

Repository:

```
https://github.com/YousefAlgharasi/aim-platform
```

Notion Phase 1 Tasks database:

```
https://app.notion.com/p/57e1d1bfdbbd474ea27b35c29e7df571
```

Detailed prompt file:

```
docs/tasks/phase_1_task_prompts.md
```

Workflow:

1. Open the Notion Phase 1 Tasks database.
2. Find a task with `Status = Undone`.
3. Before claiming the task, check its `Dependency` field.
4. A dependency is complete only if:
   - the dependency task `Status` is `Done` in Notion,
   - the dependency has no blocker comment that makes its output unusable,
   - the dependency expected output file(s) from this prompt file exist in the GitHub repository on the target/default branch.
5. If dependencies are not complete, choose another task.
6. If the task is already `In Progress` and has an assigned person, choose another task.
7. Resolve `TEAM_MEMBER_NOTION_EMAIL` to a Notion user.
8. Assign the task to that user in `Assigned`.
9. Set `Status = In Progress`.
10. Read the exact task section in this file.
11. Execute only that task.
12. Do not perform unrelated cleanup, refactors, feature implementation, or architecture changes.
13. When complete, set `Status = Done` and keep `Assigned` filled.
14. If blocked, leave `Assigned` filled, keep or set `Status = In Progress`, and add a clear blocker comment in Notion.

---

## Required Pre-Check for Every Phase 1 Task

Before editing files, verify:

- You read `docs/phase-1/system-foundation-charter.md` if it exists.
- You read relevant Phase 0 docs for the component you are touching.
- The task does not create Student Web App work.
- The task does not move AIM Engine logic into Flutter/client.
- The task does not expose AI provider keys or privileged credentials.
- The task does not use speed as a direct mastery, level, or difficulty signal.
- The task follows the active Phase 1 stack.
- The task has clear output files.
- The task has a Done Test.

If a conflict is found, stop and document it instead of silently choosing a direction.

---

## Phase 1 Task Prompts

---

### P1-001 — Create Phase 1 System Foundation Charter

Task: Create the official transition charter that defines Phase 1 as System Foundation.

Required reading:

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`

Output:

- `docs/phase-1/system-foundation-charter.md`

Requirements:

- Define Phase 1 as System Foundation.
- Lock the active Phase 1 stack.
- Mark Student Web App as Deferred / Optional / Phase 7 or later.
- Add source-of-truth hierarchy.
- Add conflict-resolution rules.
- Add boundaries for Flutter Mobile, Backend API, AIM Engine, and AI Teacher Gateway.
- Add Phase 1 non-goals and acceptance gates.

Done Test:

- The file exists.
- It clearly blocks Student Web App work in Phase 1.
- It clearly blocks client-side AIM logic.
- It separates completed MVP pilot stack from Phase 1 stack.

---

### P1-002 — Update Roadmap: Student Web App Deferred

Task: Update the project roadmap to state that Student Web App is deferred and optional.

Dependency:

- P1-001

Required reading:

- `docs/phase-1/system-foundation-charter.md`
- `docs/product/vision.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`

Output:

- Update the existing roadmap/phase plan file if present.
- If no roadmap file exists, create `docs/phase-1/phase-roadmap.md`.

Requirements:

- Add "Phase 7 — Student Web App" as Deferred / Optional / Later.
- State that Phase 1 does not include Student Web App implementation.
- Do not add new tasks.

Done Test:

- Roadmap clearly shows Student Web App is not Phase 1.
- No Student Web App folder or runtime code is created.

---

### P1-003 — Create Phase 1 Task Execution Rules

Task: Create execution rules for Phase 1 agents/developers.

Dependency:

- P1-001

Output:

- `docs/phase-1/task-execution-rules.md`

Requirements:

- Include task-claim workflow.
- Include dependency validation workflow.
- Include required pre-checks.
- Include stop conditions for conflicts.
- Include Done Test requirements.
- Include rule to keep `Assigned` filled when Done or Blocked.

Done Test:

- File exists and can be followed by a new agent without additional explanation.

---

### P1-004 — Run Phase 0 QA Gate Review

Task: Review Phase 0 QA outputs and decide whether Phase 1 can safely start.

Dependency:

- P0-QA-001..P0-QA-007

Output:

- `docs/quality/phase-1-entry-review.md`

Requirements:

- Check whether required Phase 0 QA documents exist.
- Summarize blockers, major gaps, minor gaps, and safe-to-start status.
- Do not fix the gaps in this task.

Done Test:

- File includes a clear status: `READY`, `READY WITH MINOR GAPS`, or `NOT READY`.

---

### P1-005 — Create Phase 1 Open Decisions Register

Task: Create a register for decisions still open before or during Phase 1.

Dependencies:

- P1-001
- P1-004

Output:

- `docs/phase-1/open-decisions.md`

Requirements:

- Include ORM/migration choice.
- Include deployment provider decision.
- Include parent access decision.
- Include notification delivery method decision.
- Include admin scope decision if not fully settled.

Done Test:

- Each decision has status, owner, impact, and current default handling.

---

### P1-006 — Define Final Monorepo Structure

Task: Define the final repository structure for Phase 1.

Dependency:

- P1-001

Output:

- `docs/phase-1/repo-structure.md`

Requirements:

- Include top-level folders for apps, services, packages, infra, scripts, and docs.
- Show Flutter Mobile under `apps/mobile`.
- Show Admin Dashboard under `apps/admin-dashboard`.
- Show Backend API under `services/backend-api`.
- Show AIM Engine under `services/aim-engine`.
- Show shared contracts under `packages/shared-contracts`.
- Do not include Student Web App.

Done Test:

- The documented structure is implementation-ready and excludes Student Web App.

---

### P1-007 — Create Root Project Structure

Task: Create root folders for the approved monorepo structure.

Dependency:

- P1-006

Output:

- Root folders matching `docs/phase-1/repo-structure.md`.
- Placeholder README files if needed to preserve empty folders.

Requirements:

- Create structure only.
- Do not implement features.
- Do not create Student Web App.

Done Test:

- Expected root folders exist.
- No runtime feature implementation is added.

---

### P1-008 — Create Root README for Local Development

Task: Update root README or create local development docs for the Phase 1 structure.

Dependency:

- P1-007

Output:

- `README.md` update or `docs/phase-1/local-development.md`

Requirements:

- Explain active services and apps.
- Explain how Phase 1 is different from completed MVP pilot.
- Link to the charter and repo structure docs.

Done Test:

- A developer can understand the Phase 1 repository layout from the README/docs.

---

### P1-009 — Create Environment File Strategy

Task: Define environment variable strategy and secret boundaries.

Dependency:

- P1-007

Output:

- `.env.example`
- `docs/phase-1/environment-strategy.md`

Requirements:

- Include service-specific env naming.
- Include no-real-secrets rule.
- Include backend-only AI provider key rule.
- Include Supabase public vs private key handling.

Done Test:

- `.env.example` has placeholders only.
- No real secret is committed.

---

### P1-010 — Create Workspace Tooling Decision

Task: Document package/workspace tooling decision.

Dependency:

- P1-006

Output:

- `docs/phase-1/workspace-tooling.md`

Requirements:

- Decide or document the approved package management approach.
- Explain how backend, admin, Flutter, and Python services are installed/run.
- Do not install heavy dependencies unless required by the task.

Done Test:

- Tooling decision is explicit and does not conflict with repo structure.

---

### P1-011 — Create Shared Contracts Package Skeleton

Task: Create shared contracts package skeleton.

Dependency:

- P1-007

Output:

- `packages/shared-contracts/`
- `packages/shared-contracts/README.md`

Requirements:

- Create folders for API, enums, errors, and safe-field rules.
- Do not implement business logic.

Done Test:

- Shared contracts package exists and is clearly documentation/schema oriented.

---

### P1-012 — Define API Response Envelope Contract

Task: Define standard API response envelope.

Dependency:

- P1-011

Output:

- `packages/shared-contracts/api/response-envelope.md`

Requirements:

- Define success shape.
- Define error shape reference.
- Define metadata shape.
- Include examples.

Done Test:

- Backend, Flutter, and Admin can use the same response format.

---

### P1-013 — Define Error Contract and Error Codes

Task: Define standard error response contract.

Dependency:

- P1-012

Output:

- `packages/shared-contracts/api/errors.md`

Requirements:

- Define validation, auth, forbidden, ownership, not found, conflict, rate limit, and server errors.
- Include error code naming convention.
- Include safe message rules.

Done Test:

- Error contract fits the response envelope.

---

### P1-014 — Define Common Enums

Task: Define common cross-service enums.

Dependency:

- P1-011

Output:

- `packages/shared-contracts/enums/common-enums.md`

Requirements:

- Include user roles.
- Include session statuses.
- Include lesson types.
- Include question types.
- Include recommendation action types.
- Include notification types where applicable.

Done Test:

- Enums are consistent with Phase 0 data/API docs.

---

### P1-015 — Define Learner-Safe vs Internal Fields Contract

Task: Define field exposure boundaries.

Dependencies:

- P1-011
- P1-014

Output:

- `docs/phase-1/safe-field-exposure-contract.md`

Requirements:

- List learner-safe fields.
- List parent-safe fields if parent is later enabled.
- List admin/internal fields.
- List forbidden client fields.
- Include AIM outputs and AI Teacher fields.

Done Test:

- Internal AIM fields are clearly blocked from student/parent surfaces.

---

### P1-016 — Create NestJS Backend API Skeleton

Task: Create NestJS + TypeScript backend skeleton.

Dependencies:

- P1-007
- P1-009

Output:

- `services/backend-api/`

Requirements:

- Use NestJS + TypeScript.
- Create minimal app skeleton.
- Do not implement full features.
- Do not use FastAPI for Phase 1 Backend API.

Done Test:

- Backend service can be installed and started or has clear setup documentation.

---

### P1-017 — Add Backend Config Validation

Task: Add backend config loading and validation.

Dependencies:

- P1-016
- P1-009

Output:

- Backend config module/files.

Requirements:

- Validate required environment variables.
- Fail safely on missing required config.
- Do not commit real secrets.

Done Test:

- Backend config has validation and uses `.env.example` placeholders.

---

### P1-018 — Add Backend Health and Version Endpoints

Task: Add health and version endpoints.

Dependency:

- P1-016

Output:

- Backend `/health` endpoint.
- Backend `/version` endpoint or equivalent.

Requirements:

- Keep endpoints simple.
- Do not expose secrets or internal environment details.

Done Test:

- Health endpoint returns a safe success response.

---

### P1-019 — Add Global API Response and Error Handling

Task: Add global response and error handling foundation.

Dependencies:

- P1-012
- P1-013
- P1-016

Output:

- Backend response/error handling foundation.

Requirements:

- Align with shared response envelope.
- Normalize validation and server errors.
- Avoid leaking stack traces to clients.

Done Test:

- Health and error responses follow the documented contract.

---

### P1-020 — Add Request ID and Logging Foundation

Task: Add request ID and logging foundation.

Dependency:

- P1-019

Output:

- Backend request ID/logging middleware or equivalent.

Requirements:

- Add correlation ID to logs/responses where safe.
- Do not log secrets.
- Do not log raw sensitive learner data.

Done Test:

- Each request can be traced without exposing sensitive data.

---

### P1-021 — Add Supabase JWT Auth Guard Skeleton

Task: Add Supabase JWT auth guard skeleton.

Dependency:

- P1-017

Output:

- Backend auth guard skeleton.

Requirements:

- Validate JWT server-side.
- Do not trust client role claims without backend validation.
- Do not implement full auth UI.

Done Test:

- Guard skeleton exists and documents required Supabase behavior.

---

### P1-022 — Add Role and Ownership Guard Foundation

Task: Add role and ownership guard foundation.

Dependency:

- P1-021

Output:

- Backend role guard/ownership guard skeleton.

Requirements:

- Enforce backend authorization as final authority.
- Block cross-student data access by design.
- Keep implementation minimal.

Done Test:

- Guard structure exists and can be reused by future modules.

---

### P1-023 — Create Backend Feature Module Skeletons

Task: Create backend feature module skeletons.

Dependencies:

- P1-016
- P1-022

Output:

- Backend modules for auth, students, lessons, sessions, aim, ai-teacher, admin, reports.

Requirements:

- Use simple feature-based architecture.
- Do not create excessive clean-architecture layering.
- Do not implement full business logic.

Done Test:

- Feature modules exist and are empty/minimal skeletons.

---

### P1-024 — Add OpenAPI Swagger Foundation

Task: Add OpenAPI/Swagger foundation.

Dependencies:

- P1-012
- P1-013
- P1-014
- P1-023

Output:

- Backend Swagger/OpenAPI setup.

Requirements:

- Document only foundation endpoints or placeholders.
- Do not invent full API implementation.

Done Test:

- Swagger setup exists and does not expose secrets.

---

### P1-025 — Add Backend Testing Foundation

Task: Add backend testing foundation.

Dependencies:

- P1-018
- P1-019

Output:

- Backend test setup.
- Basic health endpoint test.

Requirements:

- Tests should run in CI later.
- Keep scope minimal.

Done Test:

- Backend test command exists and passes for health/foundation test.

---

### P1-026 — Create Python AIM Engine Service Skeleton

Task: Create Python AIM Engine service skeleton.

Dependency:

- P1-007

Output:

- `services/aim-engine/`

Requirements:

- Create Python service/module skeleton.
- Do not implement full adaptive algorithm.
- Preserve AIM as backend-owned.

Done Test:

- AIM Engine folder exists with clear README and app entry structure.

---

### P1-027 — Add AIM Engine Health and Version Endpoints

Task: Add health and version endpoints for AIM Engine.

Dependency:

- P1-026

Output:

- AIM Engine health/version endpoints or CLI checks.

Requirements:

- Keep endpoint output safe.
- Do not expose model/provider secrets.

Done Test:

- AIM Engine can report healthy status.

---

### P1-028 — Create AIM Engine Contract Models

Task: Create AIM Engine contract models.

Dependencies:

- P1-014
- P1-015
- P1-026

Output:

- `services/aim-engine/app/contracts/` or equivalent.

Requirements:

- Include session input contract.
- Include attempt evidence contract.
- Include skill state output contract.
- Include recommendation output contract.
- Include review schedule output contract.

Done Test:

- Contracts exist without implementing full algorithm logic.

---

### P1-029 — Create AIM Pipeline Interface Skeleton

Task: Create session-completion pipeline interface skeleton.

Dependency:

- P1-028

Output:

- `services/aim-engine/app/pipelines/session_completion_pipeline.py` or equivalent.

Requirements:

- Define pipeline interface/placeholder.
- Do not implement full AIM calculations.
- Document expected future steps.

Done Test:

- Pipeline skeleton consumes/returns contract models.

---

### P1-030 — Add No-Speed Mastery Guard Tests

Task: Add guard tests for no-speed mastery rule.

Dependency:

- P1-029

Output:

- AIM Engine test file(s) for speed rule.

Requirements:

- Tests must fail if response time directly affects mastery/level/difficulty increase.
- Keep tests as guard tests, not full algorithm tests.

Done Test:

- No-speed guard test exists and passes.

---

### P1-031 — Add Backend-to-AIM Integration Stub

Task: Add backend internal integration stub for AIM Engine.

Dependencies:

- P1-027
- P1-023

Output:

- Backend AIM client/service stub.

Requirements:

- Backend calls AIM Engine internally only.
- Clients must not call AIM Engine directly.
- Use health/stub endpoint only.

Done Test:

- Backend has an internal AIM client skeleton.

---

### P1-032 — Decide ORM and Migration Strategy

Task: Decide and document ORM/migration strategy.

Dependency:

- P1-001

Output:

- `docs/phase-1/database-implementation-strategy.md`

Requirements:

- Choose or document ORM/migration path.
- Explain why it fits NestJS + Supabase PostgreSQL.
- Do not create full schema yet.

Done Test:

- Database implementation direction is explicit.

---

### P1-033 — Add Database Client Foundation

Task: Add backend database client foundation.

Dependencies:

- P1-032
- P1-017

Output:

- Backend database module/client setup.

Requirements:

- Connect through config validation.
- Do not implement full schema.
- Do not commit credentials.

Done Test:

- Backend database foundation exists and is documented.

---

### P1-034 — Create Initial Migration Folder Structure

Task: Create migration folder structure.

Dependency:

- P1-032

Output:

- Migration folder and README.

Requirements:

- Do not implement full schema unless explicitly required by selected strategy.
- Explain future migration workflow.

Done Test:

- Migration structure exists and matches the selected strategy.

---

### P1-035 — Create Identity Mapping Plan

Task: Document Supabase Auth UID to backend user/profile mapping.

Dependency:

- P1-032

Output:

- `docs/phase-1/identity-mapping-plan.md`

Requirements:

- Define User identity mapping.
- Define StudentProfile relationship.
- Define role source of truth.
- Define ownership-check implication.

Done Test:

- Identity mismatch risk is addressed in writing.

---

### P1-036 — Create Seed Data Strategy

Task: Define safe seed data strategy.

Dependencies:

- P1-032
- P1-035

Output:

- `docs/phase-1/seed-data-strategy.md`

Requirements:

- Include roles, sample skills, sample lessons, and dev-only users if appropriate.
- Do not include real learner data.
- Do not include secrets.

Done Test:

- Seed strategy is safe and implementation-ready.

---

### P1-037 — Create RLS Security Policy Planning Notes

Task: Document RLS/security policy planning notes.

Dependency:

- P1-035

Output:

- `docs/phase-1/database-security-plan.md`

Requirements:

- Define ownership policy direction.
- Define role-scoped access direction.
- Define internal service access direction.
- Do not implement policies unless explicitly scoped.

Done Test:

- Database security plan exists and matches identity mapping.

---

### P1-038 — Create Flutter Mobile Project Shell

Task: Create Flutter Mobile app shell.

Dependencies:

- P1-007
- P1-001

Output:

- `apps/mobile/`

Requirements:

- Create Flutter app shell.
- Do not implement full features.
- Do not add AIM logic.

Done Test:

- Flutter app shell exists and can be analyzed/run at shell level where environment allows.

---

### P1-039 — Add Flutter Core Architecture Folders

Task: Add Flutter core folders.

Dependency:

- P1-038

Output:

- `apps/mobile/lib/core/` folders.

Requirements:

- Include config, networking, errors, routing, theme, localization.
- Keep logic minimal.

Done Test:

- Core architecture folders exist.

---

### P1-040 — Add Feature-First Folder Skeletons

Task: Add Flutter feature-first folder skeletons.

Dependency:

- P1-039

Output:

- Feature folders under `apps/mobile/lib/features/`.

Required features:

- auth
- onboarding
- placement
- home
- lessons
- practice
- ai_teacher
- reviews
- progress
- notifications
- profile

Each feature should follow:

```
data/datasources
data/models
data/repository/repo_impl
logic/entity
logic/provider
logic/repository
ui/pages
ui/widgets
```

Done Test:

- All required feature folders exist.
- No AIM calculations are implemented in Flutter.

---

### P1-041 — Add Riverpod StateNotifier Foundation

Task: Add Riverpod StateNotifier-style foundation.

Dependency:

- P1-039

Output:

- Flutter Riverpod foundation files.

Requirements:

- Add provider/state conventions.
- Use StateNotifier-style structure.
- Do not implement AIM logic.

Done Test:

- Riverpod foundation exists and is documented.

---

### P1-042 — Add Flutter API Client Foundation

Task: Add Flutter API client foundation.

Dependencies:

- P1-012
- P1-013
- P1-038

Output:

- Flutter API client foundation.

Requirements:

- Parse response envelope.
- Parse error contract.
- Handle base URL config.
- Do not call AIM Engine directly.
- Do not call AI providers directly.

Done Test:

- API client points to Backend API only.

---

### P1-043 — Add Flutter Routing Shell

Task: Add Flutter routing shell.

Dependency:

- P1-040

Output:

- Flutter routing setup.

Requirements:

- Add routes for splash, auth, main shell, and placeholder screens.
- Do not implement full features.

Done Test:

- App can navigate between placeholder routes.

---

### P1-044 — Add Main Shell Placeholder Screens

Task: Add main shell placeholder screens.

Dependency:

- P1-043

Output:

- Placeholder pages for Home, Learn, Review, Progress, and Profile.

Requirements:

- Keep screens as placeholders.
- Do not calculate progress locally.
- Do not calculate recommendations locally.

Done Test:

- Main shell tabs/pages exist.

---

### P1-045 — Add Auth UI Placeholder Flow

Task: Add auth UI placeholder flow.

Dependencies:

- P1-043
- P1-042

Output:

- Splash/sign-in/auth state placeholder screens.

Requirements:

- Do not implement full Supabase auth unless needed for shell validation.
- Do not store secrets in Flutter.
- Use Backend API as future session validation authority.

Done Test:

- Auth placeholder flow exists.

---

### P1-046 — Add No-AIM-Logic Flutter Guard Documentation

Task: Document Flutter boundaries.

Dependency:

- P1-040

Output:

- `apps/mobile/README.md` or `apps/mobile/docs/no-aim-logic.md`

Requirements:

- State that Flutter must not calculate AIM outputs.
- State that Flutter sends evidence and renders backend-approved outputs.
- List forbidden calculations.

Done Test:

- Flutter boundary documentation exists and is explicit.

---

### P1-047 — Create Admin Dashboard Project Shell

Task: Create internal Admin Dashboard shell.

Dependency:

- P1-007

Output:

- `apps/admin-dashboard/`

Requirements:

- Create app shell only.
- Do not implement full institute management platform.
- Do not create learner Student Web App.

Done Test:

- Admin Dashboard shell exists.

---

### P1-048 — Add Admin Layout and Routing Foundation

Task: Add admin layout and routing foundation.

Dependency:

- P1-047

Output:

- Admin layout and route placeholders.

Requirements:

- Include sidebar/layout placeholder.
- Include placeholder routes only.
- Do not implement full admin modules.

Done Test:

- Admin shell can display placeholder pages/routes.

---

### P1-049 — Add Admin API Client Foundation

Task: Add admin API client foundation.

Dependencies:

- P1-012
- P1-013
- P1-047

Output:

- Admin API client foundation.

Requirements:

- Use Backend API response envelope.
- Use shared error contract.
- Do not bypass Backend API.
- Do not expose secrets.

Done Test:

- Admin client is configured for Backend API only.

---

### P1-050 — Add Role-Based Menu Placeholder

Task: Add role-based menu placeholder.

Dependency:

- P1-048

Output:

- Admin role-menu placeholder.

Requirements:

- Include pilot_admin, content_manager, human_reviewer, project_owner placeholders.
- Treat UI role checks as UX only.
- Backend remains final authorization authority.

Done Test:

- Menu placeholder exists and is clearly non-authoritative.

---

### P1-051 — Add Admin Module Placeholders

Task: Add admin module placeholders.

Dependency:

- P1-050

Output:

- Placeholder modules for students, content, reports, audit logs, and review queue.

Requirements:

- Create placeholders only.
- Do not implement full dashboard logic.
- Do not expose learner-private internals beyond placeholder labels.

Done Test:

- Admin module placeholders exist.

---

### P1-052 — Document Admin Scope Limits

Task: Document admin scope limits.

Dependency:

- P1-047

Output:

- `apps/admin-dashboard/README.md` or `docs/phase-1/admin-scope-limits.md`

Requirements:

- State that Phase 1 Admin Dashboard is internal foundation only.
- Exclude full institute management.
- Exclude full analytics warehouse.
- Exclude teacher/classroom system unless later approved.

Done Test:

- Admin scope limits are explicit.

---

### P1-053 — Create AI Teacher Gateway Boundary Module

Task: Create backend AI Teacher gateway boundary module.

Dependency:

- P1-023

Output:

- Backend `ai-teacher` module skeleton.

Requirements:

- Backend-only.
- No direct client/provider connection.
- No full provider integration unless explicitly scoped.
- No general chatbot behavior.

Done Test:

- AI Teacher module exists as backend-only boundary.

---

### P1-054 — Define AI Teacher Request Response Contracts

Task: Define AI Teacher request/response contracts.

Dependencies:

- P1-014
- P1-053

Output:

- AI Teacher contract docs/schema.

Requirements:

- Include mode.
- Include skill/lesson/question context.
- Include safe response.
- Include fallback response.
- Include validation status.

Done Test:

- AI Teacher contracts are explicit and backend-only.

---

### P1-055 — Add AI Teacher Safety Validator Stub

Task: Add AI Teacher validator stub.

Dependency:

- P1-054

Output:

- Validator stub and minimal tests/docs.

Requirements:

- Prepare prohibited-language check.
- Prepare off-topic check.
- Prepare answer-leakage check.
- Do not implement full moderation system.

Done Test:

- Validator stub exists and can block unsafe response placeholders.

---

### P1-056 — Add AI Teacher Fallback Response Strategy

Task: Add fallback strategy.

Dependency:

- P1-055

Output:

- AI Teacher fallback strategy doc/stub.

Requirements:

- Define fallback when provider fails.
- Define fallback when validator blocks output.
- Use safe educational wording.
- Do not expose raw provider output.

Done Test:

- Fallback behavior is documented or stubbed.

---

### P1-057 — Create Docker Compose Foundation

Task: Create Docker Compose foundation.

Dependencies:

- P1-016
- P1-026
- P1-033

Output:

- `docker-compose.yml` or `infra/docker/docker-compose.yml`

Requirements:

- Include backend service.
- Include AIM Engine service.
- Include database/support service only if appropriate.
- Do not include Student Web App.

Done Test:

- Compose foundation exists and matches project structure.

---

### P1-058 — Create Local Dev Scripts

Task: Create local development scripts.

Dependency:

- P1-057

Output:

- `scripts/` or Makefile/task runner.

Requirements:

- Include install/check/run/test commands where appropriate.
- Keep scripts safe and documented.
- Do not run destructive commands.

Done Test:

- Local dev scripts are discoverable and documented.

---

### P1-059 — Add CI Pipeline for Docs and Backend

Task: Add CI for docs and backend.

Dependency:

- P1-025

Output:

- GitHub Actions workflow or CI job.

Requirements:

- Check docs where possible.
- Run backend lint/test where possible.
- Do not require unavailable secrets.

Done Test:

- CI job exists and is safe for pull requests.

---

### P1-060 — Add CI Pipeline for AIM Engine

Task: Add CI for Python AIM Engine.

Dependencies:

- P1-026
- P1-030

Output:

- Python CI job.

Requirements:

- Run formatting/linting/tests where available.
- Include no-speed guard tests.
- Do not require production secrets.

Done Test:

- AIM Engine CI job exists.

---

### P1-061 — Add CI Pipeline for Flutter

Task: Add CI for Flutter Mobile.

Dependency:

- P1-038

Output:

- Flutter CI job.

Requirements:

- Run `flutter analyze` where possible.
- Run tests if present.
- Avoid large unnecessary setup if possible.
- Do not require production secrets.

Done Test:

- Flutter CI job exists.

---

### P1-062 — Add CI Pipeline for Admin Dashboard

Task: Add CI for Admin Dashboard.

Dependency:

- P1-047

Output:

- Admin CI job.

Requirements:

- Run lint/build/test where applicable.
- Do not require production secrets.

Done Test:

- Admin CI job exists.

---

### P1-063 — Add Secret Scanning and Env Safety Check

Task: Add secret scanning or env safety checks.

Dependency:

- P1-009

Output:

- Secret-safety CI check, script, or documented guard.

Requirements:

- Prevent real `.env` from being committed.
- Prevent AI provider keys from being committed.
- Prevent Supabase service role keys from being committed.
- Prevent database credentials from being committed.

Done Test:

- Secret safety rule exists in CI/script/docs.

---

### P1-064 — Add Repository Quality Checklist

Task: Add repository PR quality checklist.

Dependencies:

- P1-001
- P1-003

Output:

- `.github/pull_request_template.md`

Requirements:

- Include docs alignment check.
- Include tests run check.
- Include no Student Web App check.
- Include no client AIM logic check.
- Include no secrets check.
- Include no speed-as-mastery check.

Done Test:

- PR template exists and includes all required checks.

---

### P1-065 — Run System Foundation Smoke Test

Task: Run and document system foundation smoke test.

Dependencies:

- P1-018
- P1-027
- P1-044
- P1-048
- P1-059..P1-062

Output:

- `docs/phase-1/system-foundation-smoke-test.md`

Requirements:

- Check backend health.
- Check AIM Engine health.
- Check Flutter shell status.
- Check Admin shell status.
- Check CI foundation status.
- Document failures without fixing unrelated issues.

Done Test:

- Smoke test report exists and has pass/fail status per component.

---

### P1-066 — Run Phase 1 Architecture Compliance Review

Task: Review Phase 1 foundation implementation against architecture rules.

Dependency:

- P1-001..P1-065

Output:

- `docs/phase-1/architecture-compliance-review.md`

Requirements:

- Check no Student Web App.
- Check no client-side AIM logic.
- Check no exposed secrets.
- Check no speed-as-mastery.
- Check active stack compliance.
- Check backend/AIM/Flutter boundaries.

Done Test:

- Compliance review has clear `PASS`, `PASS WITH ISSUES`, or `FAIL` status.

---

### P1-067 — Create Phase 2 Readiness Checklist

Task: Create checklist for moving into Phase 2 feature implementation.

Dependency:

- P1-066

Output:

- `docs/phase-2/readiness-checklist.md`

Requirements:

- Define required foundation readiness.
- Define feature-start gates.
- Define unresolved blocker handling.
- Do not create Phase 2 tasks in this file.

Done Test:

- Checklist clearly says when Phase 2 can begin.

---

### P1-068 — Final Phase 1 Lock and Handoff

Task: Create final Phase 1 review and handoff document.

Dependencies:

- P1-065
- P1-066
- P1-067

Output:

- `docs/phase-1/final-foundation-review.md`

Requirements:

- Summarize completed foundation outputs.
- Summarize open issues.
- Summarize go/no-go decision for Phase 2.
- Confirm no Student Web App was created.
- Confirm no client-side AIM logic exists.
- Confirm no speed-as-mastery exists.

Done Test:

- Final review exists and includes a clear go/no-go status.
