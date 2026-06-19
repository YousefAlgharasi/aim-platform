# AIM Phase 16 Task Prompts

Phase 16: QA, Performance, Deployment, and Release Readiness

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion Database: 
https://app.notion.com/p/383af08baaf680389ccafe7a1f0ba201?v=9cc539504c6d4a5993ec31545adf731b

## Global Phase 16 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All release/QA/status UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Phase 16 is release-readiness work, not new product feature expansion.
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- No secrets may be committed.
- All QA, performance, security, and deployment reports must honestly document failures and blockers.

## Stop Conditions

Stop immediately if:
- TEAM_MEMBER_NOTION_EMAIL is missing.
- The Notion task is already assigned.
- The task is not Undone.
- A dependency is incomplete.
- A dependency output is missing from GitHub.
- Working tree has unrelated changes.
- This prompt file or the exact task section is missing.
- A real secret is detected.
- UI work does not follow the AIM design system.
- CI changes weaken release gates.
- Deployment docs include real secrets.
- Reports claim checks passed without evidence.
- New product feature work appears outside release-readiness scope.
- Client-side authority is introduced.
- Permissions, consent, billing provider authority, or analytics privacy checks are bypassed.

---

#P16-001

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-001 only.

Task:
Create Phase 16 Release Readiness Charter

Branch:
phase16/P16-001-release-readiness-charter

Priority:
P0

Description:
Define Phase 16 scope, exclusions, QA rules, performance boundaries, deployment ownership, and release gates.

Goal:
Lock Phase 16 to QA, performance, deployment, observability, and launch readiness.

Expected output:
docs/phase-16/release-readiness-charter.md

Dependencies:
P15-083

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-001

Files created/updated:
- ...

Branch:
phase16/P16-001-release-readiness-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-002

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-002 only.

Task:
Create Release Scope Map

Branch:
phase16/P16-002-release-scope-map

Priority:
P0

Description:
Document all systems included in release readiness: backend, mobile, admin, parent, billing, notifications, analytics, and AIM integration.

Goal:
Define what must be validated before release.

Expected output:
docs/phase-16/release-scope-map.md

Dependencies:
P16-001

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-002

Files created/updated:
- ...

Branch:
phase16/P16-002-release-scope-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-003

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-003 only.

Task:
Create Production Readiness Criteria

Branch:
phase16/P16-003-production-readiness-criteria

Priority:
P0

Description:
Define required checks for correctness, security, privacy, performance, uptime, data integrity, rollback, and monitoring.

Goal:
Create formal go/no-go criteria.

Expected output:
docs/phase-16/production-readiness-criteria.md

Dependencies:
P16-001

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-003

Files created/updated:
- ...

Branch:
phase16/P16-003-production-readiness-criteria

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-004

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-004 only.

Task:
Create Release Risk Register

Branch:
phase16/P16-004-release-risk-register

Priority:
P0

Description:
Document launch risks, owners, severity, mitigation, and unresolved blockers.

Goal:
Make release risk visible and trackable.

Expected output:
docs/phase-16/release-risk-register.md

Dependencies:
P16-002

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-004

Files created/updated:
- ...

Branch:
phase16/P16-004-release-risk-register

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-005

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-005 only.

Task:
Create QA Master Test Plan

Branch:
phase16/P16-005-qa-master-test-plan

Priority:
P0

Description:
Define test strategy across backend, mobile, admin, parent, billing, notifications, analytics, AIM, and regression suites.

Goal:
Guide full QA execution.

Expected output:
docs/quality/phase-16-qa-master-test-plan.md

Dependencies:
P16-002

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-005

Files created/updated:
- ...

Branch:
phase16/P16-005-qa-master-test-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-006

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-006 only.

Task:
Create E2E Test Matrix

Branch:
phase16/P16-006-e2e-test-matrix

Priority:
P0

Description:
Map critical user/admin/parent/student flows to E2E test coverage and owners.

Goal:
Identify release-critical test coverage.

Expected output:
docs/quality/phase-16-e2e-test-matrix.md

Dependencies:
P16-005

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-006

Files created/updated:
- ...

Branch:
phase16/P16-006-e2e-test-matrix

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-007

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-007 only.

Task:
Create Nonfunctional Requirements Checklist

Branch:
phase16/P16-007-nonfunctional-requirements

Priority:
P0

Description:
Define performance, availability, scalability, security, accessibility, localization, observability, and recovery targets.

Goal:
Set release-quality expectations.

Expected output:
docs/phase-16/nonfunctional-requirements-checklist.md

Dependencies:
P16-003

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-007

Files created/updated:
- ...

Branch:
phase16/P16-007-nonfunctional-requirements

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-008

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-008 only.

Task:
Create Design System Release Gate

Branch:
phase16/P16-008-design-system-release-gate

Priority:
P0

Description:
Define UI release requirements for AIM design system compliance across mobile/admin/parent/reporting/billing/notifications.

Goal:
Prevent inconsistent UI from shipping.

Expected output:
docs/quality/phase-16-design-system-release-gate.md

Dependencies:
P16-003, DES-001

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-008

Files created/updated:
- ...

Branch:
phase16/P16-008-design-system-release-gate

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-009

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-009 only.

Task:
Create Release Environment Map

Branch:
phase16/P16-009-release-environment-map

Priority:
P0

Description:
Document local, CI, staging, production, environment variables, service endpoints, and deployment targets.

Goal:
Clarify environment boundaries.

Expected output:
docs/phase-16/release-environment-map.md

Dependencies:
P16-001

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-009

Files created/updated:
- ...

Branch:
phase16/P16-009-release-environment-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-010

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-010 only.

Task:
Create Secret Management Audit

Branch:
phase16/P16-010-secret-management-audit

Priority:
P0

Description:
Audit expected secrets, ownership, storage location, rotation policy, and forbidden secret locations.

Goal:
Prevent secret leakage before release.

Expected output:
docs/security/phase-16-secret-management-audit.md

Dependencies:
P16-009

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-010

Files created/updated:
- ...

Branch:
phase16/P16-010-secret-management-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-011

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-011 only.

Task:
Audit CI Pipeline

Branch:
phase16/P16-011-ci-pipeline-audit

Priority:
P0

Description:
Review GitHub Actions/CI workflows for backend, Flutter, admin, tests, linting, artifacts, and branch protections.

Goal:
Identify CI gaps before release.

Expected output:
docs/quality/phase-16-ci-pipeline-audit.md

Dependencies:
P16-005, P16-009

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-011

Files created/updated:
- ...

Branch:
phase16/P16-011-ci-pipeline-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-012

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-012 only.

Task:
Harden Backend CI Checks

Branch:
phase16/P16-012-ci-backend-checks

Priority:
P0

Description:
Ensure backend lint/test/build/migration checks run reliably in CI.

Goal:
Protect backend release quality.

Expected output:
CI workflow updates for backend

Dependencies:
P16-011

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


CI/Release Requirements:
- Keep CI changes scoped to the requested workflow/check.
- Do not add secrets to workflow files.
- Do not weaken existing checks.
- Preserve branch/release safety gates.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-012

Files created/updated:
- ...

Branch:
phase16/P16-012-ci-backend-checks

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-013

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-013 only.

Task:
Harden Flutter CI Checks

Branch:
phase16/P16-013-ci-flutter-checks

Priority:
P0

Description:
Ensure Flutter analyze/test/build debug or release checks run reliably in CI.

Goal:
Protect mobile release quality.

Expected output:
CI workflow updates for Flutter mobile

Dependencies:
P16-011

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


CI/Release Requirements:
- Keep CI changes scoped to the requested workflow/check.
- Do not add secrets to workflow files.
- Do not weaken existing checks.
- Preserve branch/release safety gates.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-013

Files created/updated:
- ...

Branch:
phase16/P16-013-ci-flutter-checks

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-014

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-014 only.

Task:
Harden Admin Dashboard CI Checks

Branch:
phase16/P16-014-ci-admin-dashboard-checks

Priority:
P1

Description:
Ensure admin dashboard lint/test/build checks run reliably in CI.

Goal:
Protect admin dashboard release quality.

Expected output:
CI workflow updates for admin dashboard

Dependencies:
P16-011

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


CI/Release Requirements:
- Keep CI changes scoped to the requested workflow/check.
- Do not add secrets to workflow files.
- Do not weaken existing checks.
- Preserve branch/release safety gates.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-014

Files created/updated:
- ...

Branch:
phase16/P16-014-ci-admin-dashboard-checks

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-015

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-015 only.

Task:
Configure CI Artifacts and Retention

Branch:
phase16/P16-015-ci-artifact-retention

Priority:
P1

Description:
Ensure build/test artifacts are named, retained, and downloadable for release review.

Goal:
Improve release traceability.

Expected output:
CI artifact updates

Dependencies:
P16-012, P16-013, P16-014

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


CI/Release Requirements:
- Keep CI changes scoped to the requested workflow/check.
- Do not add secrets to workflow files.
- Do not weaken existing checks.
- Preserve branch/release safety gates.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-015

Files created/updated:
- ...

Branch:
phase16/P16-015-ci-artifact-retention

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-016

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-016 only.

Task:
Create Branch Protection Readiness Checklist

Branch:
phase16/P16-016-branch-protection-readiness

Priority:
P1

Description:
Document required protected branches, required checks, review gates, and merge rules.

Goal:
Prepare repository release governance.

Expected output:
docs/phase-16/branch-protection-readiness.md

Dependencies:
P16-011

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-016

Files created/updated:
- ...

Branch:
phase16/P16-016-branch-protection-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-017

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-017 only.

Task:
Run Backend Unit Regression Suite

Branch:
phase16/P16-017-backend-unit-regression-suite

Priority:
P0

Description:
Execute/validate backend unit tests and document failures/blockers.

Goal:
Verify backend correctness.

Expected output:
docs/quality/phase-16-backend-unit-regression.md

Dependencies:
P16-012

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-017

Files created/updated:
- ...

Branch:
phase16/P16-017-backend-unit-regression-suite

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-018

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-018 only.

Task:
Run Backend Integration Regression Suite

Branch:
phase16/P16-018-backend-integration-regression

Priority:
P0

Description:
Execute/validate backend integration tests across auth, curriculum, placement, AIM, assessments, notifications, billing, analytics.

Goal:
Verify backend feature integration.

Expected output:
docs/quality/phase-16-backend-integration-regression.md

Dependencies:
P16-017

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-018

Files created/updated:
- ...

Branch:
phase16/P16-018-backend-integration-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-019

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-019 only.

Task:
Validate Database Migrations

Branch:
phase16/P16-019-database-migration-validation

Priority:
P0

Description:
Test migration order, rollback readiness, constraints, seed data safety, and environment compatibility.

Goal:
Protect production database changes.

Expected output:
docs/quality/phase-16-database-migration-validation.md

Dependencies:
P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-019

Files created/updated:
- ...

Branch:
phase16/P16-019-database-migration-validation

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-020

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-020 only.

Task:
Run API Contract Regression

Branch:
phase16/P16-020-api-contract-regression

Priority:
P0

Description:
Validate public/mobile/admin/parent API contracts against docs and client usage.

Goal:
Prevent frontend/backend mismatch.

Expected output:
docs/quality/phase-16-api-contract-regression.md

Dependencies:
P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-020

Files created/updated:
- ...

Branch:
phase16/P16-020-api-contract-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-021

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-021 only.

Task:
Run AIM Integration Regression

Branch:
phase16/P16-021-aim-integration-regression

Priority:
P0

Description:
Validate backend-to-AIM integration, safe failures, result validation, progress updates, and no client authority.

Goal:
Protect AIM pipeline correctness.

Expected output:
docs/quality/phase-16-aim-integration-regression.md

Dependencies:
P5-086, P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-021

Files created/updated:
- ...

Branch:
phase16/P16-021-aim-integration-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-022

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-022 only.

Task:
Run Auth and Permissions Regression

Branch:
phase16/P16-022-auth-permissions-regression

Priority:
P0

Description:
Validate auth, roles, permissions, ownership, admin guards, parent guards, billing guards, and analytics guards.

Goal:
Protect access control.

Expected output:
docs/quality/phase-16-auth-permissions-regression.md

Dependencies:
P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-022

Files created/updated:
- ...

Branch:
phase16/P16-022-auth-permissions-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-023

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-023 only.

Task:
Run Assessment Regression

Branch:
phase16/P16-023-assessment-regression

Priority:
P0

Description:
Validate quizzes, exams, deadlines, attempts, grading, results, and progress integration.

Goal:
Protect assessment correctness.

Expected output:
docs/quality/phase-16-assessment-regression.md

Dependencies:
P10-076, P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-023

Files created/updated:
- ...

Branch:
phase16/P16-023-assessment-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-024

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-024 only.

Task:
Run Billing Regression

Branch:
phase16/P16-024-billing-regression

Priority:
P0

Description:
Validate checkout, webhook idempotency, subscriptions, invoices, refunds, entitlements, and sensitive data rules.

Goal:
Protect billing correctness.

Expected output:
docs/quality/phase-16-billing-regression.md

Dependencies:
P14-082, P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-024

Files created/updated:
- ...

Branch:
phase16/P16-024-billing-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-025

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-025 only.

Task:
Run Notifications Regression

Branch:
phase16/P16-025-notifications-regression

Priority:
P1

Description:
Validate preferences, tokens, scheduling, queueing, delivery attempts, digests, and notification privacy.

Goal:
Protect notification reliability.

Expected output:
docs/quality/phase-16-notifications-regression.md

Dependencies:
P13-078, P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-025

Files created/updated:
- ...

Branch:
phase16/P16-025-notifications-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-026

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-026 only.

Task:
Run Analytics Regression

Branch:
phase16/P16-026-analytics-regression

Priority:
P1

Description:
Validate metrics, aggregations, reports, exports, permissions, and privacy rules.

Goal:
Protect reporting correctness.

Expected output:
docs/quality/phase-16-analytics-regression.md

Dependencies:
P15-083, P16-018

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-026

Files created/updated:
- ...

Branch:
phase16/P16-026-analytics-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-027

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-027 only.

Task:
Run Mobile E2E Regression

Branch:
phase16/P16-027-mobile-e2e-regression

Priority:
P0

Description:
Validate student mobile flows from auth through learning, placement, lessons, Q/A, assessments, progress, notifications, billing.

Goal:
Verify mobile release readiness.

Expected output:
docs/quality/phase-16-mobile-e2e-regression.md

Dependencies:
P16-006, P16-013

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-027

Files created/updated:
- ...

Branch:
phase16/P16-027-mobile-e2e-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-028

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-028 only.

Task:
Run Admin E2E Regression

Branch:
phase16/P16-028-admin-e2e-regression

Priority:
P0

Description:
Validate admin dashboard flows across users, curriculum, question bank, assessments, analytics, billing, notifications.

Goal:
Verify admin release readiness.

Expected output:
docs/quality/phase-16-admin-e2e-regression.md

Dependencies:
P11-077, P16-006, P16-014

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-028

Files created/updated:
- ...

Branch:
phase16/P16-028-admin-e2e-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-029

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-029 only.

Task:
Run Parent E2E Regression

Branch:
phase16/P16-029-parent-e2e-regression

Priority:
P1

Description:
Validate parent dashboard linking, consent, child selector, reports, progress, assessments, notifications, and billing.

Goal:
Verify parent release readiness.

Expected output:
docs/quality/phase-16-parent-e2e-regression.md

Dependencies:
P12-077, P16-006

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-029

Files created/updated:
- ...

Branch:
phase16/P16-029-parent-e2e-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-030

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-030 only.

Task:
Run Cross-Role E2E Regression

Branch:
phase16/P16-030-cross-role-e2e-regression

Priority:
P0

Description:
Validate student/admin/parent boundaries and cross-role access denial cases.

Goal:
Prevent role leakage.

Expected output:
docs/quality/phase-16-cross-role-e2e-regression.md

Dependencies:
P16-022, P16-027, P16-028, P16-029

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-030

Files created/updated:
- ...

Branch:
phase16/P16-030-cross-role-e2e-regression

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-031

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-031 only.

Task:
Create Mobile Design System Audit

Branch:
phase16/P16-031-mobile-design-system-audit

Priority:
P0

Description:
Audit mobile UI screens for AIM design system consistency, RTL, accessibility, and component reuse.

Goal:
Ensure mobile UI consistency.

Expected output:
docs/quality/phase-16-mobile-design-system-audit.md

Dependencies:
P16-008, P16-027

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-031

Files created/updated:
- ...

Branch:
phase16/P16-031-mobile-design-system-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-032

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-032 only.

Task:
Create Admin Design System Audit

Branch:
phase16/P16-032-admin-design-system-audit

Priority:
P0

Description:
Audit admin UI screens for AIM design system consistency, RTL, accessibility, and component reuse.

Goal:
Ensure admin UI consistency.

Expected output:
docs/quality/phase-16-admin-design-system-audit.md

Dependencies:
P16-008, P16-028

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-032

Files created/updated:
- ...

Branch:
phase16/P16-032-admin-design-system-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-033

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-033 only.

Task:
Create Parent Design System Audit

Branch:
phase16/P16-033-parent-design-system-audit

Priority:
P1

Description:
Audit parent UI screens for AIM design system consistency, RTL, accessibility, and component reuse.

Goal:
Ensure parent UI consistency.

Expected output:
docs/quality/phase-16-parent-design-system-audit.md

Dependencies:
P16-008, P16-029

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-033

Files created/updated:
- ...

Branch:
phase16/P16-033-parent-design-system-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-034

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-034 only.

Task:
Create Accessibility Release Audit

Branch:
phase16/P16-034-accessibility-release-audit

Priority:
P0

Description:
Audit keyboard flow, labels, contrast, focus states, tables, forms, charts, and mobile accessibility.

Goal:
Validate accessibility readiness.

Expected output:
docs/quality/phase-16-accessibility-release-audit.md

Dependencies:
P16-031, P16-032, P16-033

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-034

Files created/updated:
- ...

Branch:
phase16/P16-034-accessibility-release-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-035

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-035 only.

Task:
Create RTL and Localization Release Audit

Branch:
phase16/P16-035-rtl-localization-release-audit

Priority:
P0

Description:
Audit Arabic/English layout, RTL, formatting, dates, numbers, and language fallback across UI.

Goal:
Validate localization readiness.

Expected output:
docs/quality/phase-16-rtl-localization-release-audit.md

Dependencies:
P16-031, P16-032, P16-033

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-035

Files created/updated:
- ...

Branch:
phase16/P16-035-rtl-localization-release-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-036

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-036 only.

Task:
Create Performance Test Plan

Branch:
phase16/P16-036-performance-test-plan

Priority:
P0

Description:
Define performance scenarios, thresholds, test data, tools, and pass/fail gates.

Goal:
Guide performance validation.

Expected output:
docs/performance/phase-16-performance-test-plan.md

Dependencies:
P16-007

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-036

Files created/updated:
- ...

Branch:
phase16/P16-036-performance-test-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-037

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-037 only.

Task:
Run Backend Load Test

Branch:
phase16/P16-037-backend-load-test

Priority:
P0

Description:
Run or document backend load testing for critical APIs and worker queues.

Goal:
Validate backend scalability.

Expected output:
docs/performance/phase-16-backend-load-test.md

Dependencies:
P16-036

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-037

Files created/updated:
- ...

Branch:
phase16/P16-037-backend-load-test

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-038

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-038 only.

Task:
Create Database Performance Review

Branch:
phase16/P16-038-database-performance-review

Priority:
P0

Description:
Review query plans, indexes, slow paths, migration impact, analytics aggregations, and billing/report queries.

Goal:
Validate database performance.

Expected output:
docs/performance/phase-16-database-performance-review.md

Dependencies:
P16-019, P16-037

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-038

Files created/updated:
- ...

Branch:
phase16/P16-038-database-performance-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-039

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-039 only.

Task:
Create AIM Engine Performance Review

Branch:
phase16/P16-039-aim-engine-performance-review

Priority:
P0

Description:
Review AIM integration latency, timeout behavior, retry strategy, and degradation handling.

Goal:
Validate AIM performance readiness.

Expected output:
docs/performance/phase-16-aim-engine-performance-review.md

Dependencies:
P16-021, P16-037

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-039

Files created/updated:
- ...

Branch:
phase16/P16-039-aim-engine-performance-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-040

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-040 only.

Task:
Create Mobile Performance Audit

Branch:
phase16/P16-040-mobile-performance-audit

Priority:
P1

Description:
Audit Flutter startup, navigation, API loading, offline/error states, image/content rendering, and memory issues.

Goal:
Validate mobile performance readiness.

Expected output:
docs/performance/phase-16-mobile-performance-audit.md

Dependencies:
P16-027, P16-036

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-040

Files created/updated:
- ...

Branch:
phase16/P16-040-mobile-performance-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-041

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-041 only.

Task:
Create Admin and Parent Performance Audit

Branch:
phase16/P16-041-admin-parent-performance-audit

Priority:
P1

Description:
Audit dashboard bundle size, page loading, tables, filters, charts, and report rendering performance.

Goal:
Validate web dashboard performance.

Expected output:
docs/performance/phase-16-admin-parent-performance-audit.md

Dependencies:
P16-028, P16-029, P16-036

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-041

Files created/updated:
- ...

Branch:
phase16/P16-041-admin-parent-performance-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-042

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-042 only.

Task:
Create Worker and Queue Performance Review

Branch:
phase16/P16-042-worker-queue-performance-review

Priority:
P1

Description:
Review notification delivery, analytics aggregation, report generation, billing webhook processing, and retry queues.

Goal:
Validate worker readiness.

Expected output:
docs/performance/phase-16-worker-queue-performance-review.md

Dependencies:
P16-025, P16-026, P16-024

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-042

Files created/updated:
- ...

Branch:
phase16/P16-042-worker-queue-performance-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-043

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-043 only.

Task:
Create Performance Remediation Plan

Branch:
phase16/P16-043-performance-remediation-plan

Priority:
P0

Description:
Document failed thresholds, fixes, owners, and go/no-go implications.

Goal:
Track performance blockers.

Expected output:
docs/performance/phase-16-performance-remediation-plan.md

Dependencies:
P16-037..P16-042

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-043

Files created/updated:
- ...

Branch:
phase16/P16-043-performance-remediation-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-044

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-044 only.

Task:
Create Security Test Plan

Branch:
phase16/P16-044-security-test-plan

Priority:
P0

Description:
Define security validation for auth, roles, API permissions, secrets, storage, webhooks, exports, logs, and clients.

Goal:
Guide security release testing.

Expected output:
docs/security/phase-16-security-test-plan.md

Dependencies:
P16-007, P16-010

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-044

Files created/updated:
- ...

Branch:
phase16/P16-044-security-test-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-045

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-045 only.

Task:
Create API Security Audit

Branch:
phase16/P16-045-api-security-audit

Priority:
P0

Description:
Audit backend APIs for auth, authorization, ownership, validation, rate limits, and unsafe fields.

Goal:
Validate API security.

Expected output:
docs/security/phase-16-api-security-audit.md

Dependencies:
P16-044, P16-020, P16-022

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-045

Files created/updated:
- ...

Branch:
phase16/P16-045-api-security-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-046

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-046 only.

Task:
Create Client Security Audit

Branch:
phase16/P16-046-client-security-audit

Priority:
P0

Description:
Audit mobile/admin/parent clients for token handling, secrets, direct DB calls, direct AIM calls, and authority violations.

Goal:
Validate client security.

Expected output:
docs/security/phase-16-client-security-audit.md

Dependencies:
P16-027, P16-028, P16-029

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-046

Files created/updated:
- ...

Branch:
phase16/P16-046-client-security-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-047

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-047 only.

Task:
Create Billing Security Audit

Branch:
phase16/P16-047-billing-security-audit

Priority:
P0

Description:
Audit payment provider secrets, webhook verification, idempotency, sensitive data, invoices, refunds, and entitlement protection.

Goal:
Validate billing release security.

Expected output:
docs/security/phase-16-billing-security-audit.md

Dependencies:
P16-024, P16-044

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-047

Files created/updated:
- ...

Branch:
phase16/P16-047-billing-security-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-048

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-048 only.

Task:
Create Analytics Export Security Audit

Branch:
phase16/P16-048-analytics-export-security-audit

Priority:
P0

Description:
Audit reports/exports for PII, child scope, billing data, sensitive payloads, and permission checks.

Goal:
Validate analytics export security.

Expected output:
docs/security/phase-16-analytics-export-security-audit.md

Dependencies:
P16-026, P16-044

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-048

Files created/updated:
- ...

Branch:
phase16/P16-048-analytics-export-security-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-049

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-049 only.

Task:
Create Notification Security Audit

Branch:
phase16/P16-049-notification-security-audit

Priority:
P1

Description:
Audit device tokens, notification payloads, provider credentials, parent-child scope, and delivery logs.

Goal:
Validate notification security.

Expected output:
docs/security/phase-16-notification-security-audit.md

Dependencies:
P16-025, P16-044

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-049

Files created/updated:
- ...

Branch:
phase16/P16-049-notification-security-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-050

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-050 only.

Task:
Create Security Remediation Plan

Branch:
phase16/P16-050-security-remediation-plan

Priority:
P0

Description:
Document vulnerabilities, severity, owner, fix status, and go/no-go decisions.

Goal:
Track security blockers.

Expected output:
docs/security/phase-16-security-remediation-plan.md

Dependencies:
P16-045..P16-049

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-050

Files created/updated:
- ...

Branch:
phase16/P16-050-security-remediation-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-051

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-051 only.

Task:
Create Observability Plan

Branch:
phase16/P16-051-observability-plan

Priority:
P0

Description:
Define logs, metrics, traces, dashboards, alerts, and incident signals for production.

Goal:
Prepare operational monitoring.

Expected output:
docs/ops/phase-16-observability-plan.md

Dependencies:
P16-007

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-051

Files created/updated:
- ...

Branch:
phase16/P16-051-observability-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-052

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-052 only.

Task:
Create Logging Standardization Review

Branch:
phase16/P16-052-logging-standardization-review

Priority:
P0

Description:
Review logs for consistency, correlation IDs, PII redaction, secret safety, and event coverage.

Goal:
Prepare safe production logs.

Expected output:
docs/ops/phase-16-logging-standardization-review.md

Dependencies:
P16-051

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-052

Files created/updated:
- ...

Branch:
phase16/P16-052-logging-standardization-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-053

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-053 only.

Task:
Create Health Checks Readiness Review

Branch:
phase16/P16-053-health-checks-readiness

Priority:
P0

Description:
Review backend, database, AIM engine, workers, notifications, billing webhooks, and analytics job health checks.

Goal:
Prepare system health visibility.

Expected output:
docs/ops/phase-16-health-checks-readiness.md

Dependencies:
P16-051

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-053

Files created/updated:
- ...

Branch:
phase16/P16-053-health-checks-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-054

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-054 only.

Task:
Create Alerting Rules Readiness

Branch:
phase16/P16-054-alerting-rules-readiness

Priority:
P1

Description:
Define alerts for API failures, auth spikes, worker failures, webhook failures, AIM timeouts, DB errors, and billing failures.

Goal:
Prepare production alerts.

Expected output:
docs/ops/phase-16-alerting-rules-readiness.md

Dependencies:
P16-051, P16-053

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-054

Files created/updated:
- ...

Branch:
phase16/P16-054-alerting-rules-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-055

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-055 only.

Task:
Create Admin System Status UI

Branch:
phase16/P16-055-admin-system-status-ui

Priority:
P1

Description:
Build admin read-only system status page using AIM design system and backend health/status APIs if available.

Goal:
Expose operational status safely.

Expected output:
Admin system status UI or readiness document if APIs missing

Dependencies:
P16-008, P16-053, P11-077

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-055

Files created/updated:
- ...

Branch:
phase16/P16-055-admin-system-status-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-056

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-056 only.

Task:
Create Admin Release Dashboard UI

Branch:
phase16/P16-056-admin-release-dashboard-ui

Priority:
P2

Description:
Build release readiness dashboard/cards using AIM design system or document missing API dependencies.

Goal:
Expose release status to admins safely.

Expected output:
Admin release dashboard UI or readiness document

Dependencies:
P16-008, P16-003, P16-051

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-056

Files created/updated:
- ...

Branch:
phase16/P16-056-admin-release-dashboard-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-057

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-057 only.

Task:
Create Observability Security Review

Branch:
phase16/P16-057-observability-security-review

Priority:
P0

Description:
Verify logs, alerts, dashboards, and traces do not expose secrets or sensitive payloads.

Goal:
Protect operational data.

Expected output:
docs/security/phase-16-observability-security-review.md

Dependencies:
P16-052, P16-054, P16-055

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-057

Files created/updated:
- ...

Branch:
phase16/P16-057-observability-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-058

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-058 only.

Task:
Create Deployment Runbook

Branch:
phase16/P16-058-deployment-runbook

Priority:
P0

Description:
Document production deployment steps, owners, commands, checks, rollback, and verification.

Goal:
Standardize deployment process.

Expected output:
docs/deployment/phase-16-deployment-runbook.md

Dependencies:
P16-009, P16-016

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-058

Files created/updated:
- ...

Branch:
phase16/P16-058-deployment-runbook

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-059

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-059 only.

Task:
Validate Staging Deployment

Branch:
phase16/P16-059-staging-deployment-validation

Priority:
P0

Description:
Deploy or validate staging readiness and document environment-specific blockers.

Goal:
Confirm staging can host release candidate.

Expected output:
docs/deployment/phase-16-staging-deployment-validation.md

Dependencies:
P16-058

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-059

Files created/updated:
- ...

Branch:
phase16/P16-059-staging-deployment-validation

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-060

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-060 only.

Task:
Create Production Deployment Readiness Checklist

Branch:
phase16/P16-060-production-deployment-readiness

Priority:
P0

Description:
Document production infra, env vars, secrets, DB, backups, domains, SSL, stores, and owner approvals.

Goal:
Prepare production deployment.

Expected output:
docs/deployment/phase-16-production-deployment-readiness.md

Dependencies:
P16-059

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-060

Files created/updated:
- ...

Branch:
phase16/P16-060-production-deployment-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-061

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-061 only.

Task:
Create Rollback Runbook

Branch:
phase16/P16-061-rollback-runbook

Priority:
P0

Description:
Document rollback steps for backend, DB migrations, mobile release, admin/parent dashboards, workers, and configs.

Goal:
Prepare safe rollback.

Expected output:
docs/deployment/phase-16-rollback-runbook.md

Dependencies:
P16-058, P16-060

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-061

Files created/updated:
- ...

Branch:
phase16/P16-061-rollback-runbook

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-062

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-062 only.

Task:
Create Database Backup and Restore Runbook

Branch:
phase16/P16-062-database-backup-restore-runbook

Priority:
P0

Description:
Document backup, restore, verification, point-in-time recovery, and access controls.

Goal:
Prepare data recovery.

Expected output:
docs/deployment/phase-16-database-backup-restore-runbook.md

Dependencies:
P16-019, P16-060

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-062

Files created/updated:
- ...

Branch:
phase16/P16-062-database-backup-restore-runbook

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-063

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-063 only.

Task:
Create Mobile Release Readiness Checklist

Branch:
phase16/P16-063-mobile-release-readiness

Priority:
P1

Description:
Document Android/iOS build, signing, store metadata, permissions, privacy labels, and release artifacts.

Goal:
Prepare mobile release.

Expected output:
docs/deployment/phase-16-mobile-release-readiness.md

Dependencies:
P16-027, P16-040

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-063

Files created/updated:
- ...

Branch:
phase16/P16-063-mobile-release-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-064

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-064 only.

Task:
Create Admin and Parent Dashboard Release Readiness

Branch:
phase16/P16-064-admin-parent-release-readiness

Priority:
P1

Description:
Document deployment readiness for admin and parent dashboards, domains, env vars, builds, and smoke tests.

Goal:
Prepare web dashboards release.

Expected output:
docs/deployment/phase-16-admin-parent-release-readiness.md

Dependencies:
P16-028, P16-029, P16-041

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-064

Files created/updated:
- ...

Branch:
phase16/P16-064-admin-parent-release-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-065

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-065 only.

Task:
Create Worker Release Readiness Checklist

Branch:
phase16/P16-065-worker-release-readiness

Priority:
P1

Description:
Document readiness for queues, workers, scheduler, notification delivery, analytics jobs, billing webhooks, and retries.

Goal:
Prepare background job release.

Expected output:
docs/deployment/phase-16-worker-release-readiness.md

Dependencies:
P16-042, P16-060

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-065

Files created/updated:
- ...

Branch:
phase16/P16-065-worker-release-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-066

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-066 only.

Task:
Create Release Smoke Test Plan

Branch:
phase16/P16-066-smoke-test-plan

Priority:
P0

Description:
Define smoke tests after deployment across auth, mobile, admin, parent, lessons, assessments, notifications, billing, analytics, AIM.

Goal:
Prepare deployment verification.

Expected output:
docs/quality/phase-16-smoke-test-plan.md

Dependencies:
P16-060

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-066

Files created/updated:
- ...

Branch:
phase16/P16-066-smoke-test-plan

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-067

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-067 only.

Task:
Execute Release Smoke Tests

Branch:
phase16/P16-067-release-smoke-test-execution

Priority:
P0

Description:
Run or document release smoke tests and blockers.

Goal:
Verify release candidate quickly.

Expected output:
docs/quality/phase-16-release-smoke-test-execution.md

Dependencies:
P16-066

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-067

Files created/updated:
- ...

Branch:
phase16/P16-067-release-smoke-test-execution

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-068

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-068 only.

Task:
Create Release Candidate Report

Branch:
phase16/P16-068-release-candidate-report

Priority:
P0

Description:
Summarize build versions, commits, artifacts, environments, checks, risks, and open blockers.

Goal:
Prepare go/no-go review.

Expected output:
docs/phase-16/release-candidate-report.md

Dependencies:
P16-017..P16-067

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-068

Files created/updated:
- ...

Branch:
phase16/P16-068-release-candidate-report

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-069

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-069 only.

Task:
Create Go/No-Go Checklist

Branch:
phase16/P16-069-go-no-go-checklist

Priority:
P0

Description:
Create final release checklist with required approvals, resolved blockers, and known limitations.

Goal:
Support release decision.

Expected output:
docs/phase-16/go-no-go-checklist.md

Dependencies:
P16-068

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-069

Files created/updated:
- ...

Branch:
phase16/P16-069-go-no-go-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-070

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-070 only.

Task:
Create Incident Response Runbook

Branch:
phase16/P16-070-incident-response-runbook

Priority:
P0

Description:
Document severity levels, owners, escalation, communication, rollback triggers, and postmortem process.

Goal:
Prepare production incidents.

Expected output:
docs/ops/phase-16-incident-response-runbook.md

Dependencies:
P16-051, P16-061

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-070

Files created/updated:
- ...

Branch:
phase16/P16-070-incident-response-runbook

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-071

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-071 only.

Task:
Create Support Handoff Guide

Branch:
phase16/P16-071-support-handoff-guide

Priority:
P1

Description:
Document known issues, common user/admin/parent problems, troubleshooting, and escalation paths.

Goal:
Prepare support handoff.

Expected output:
docs/support/phase-16-support-handoff-guide.md

Dependencies:
P16-068, P16-070

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-071

Files created/updated:
- ...

Branch:
phase16/P16-071-support-handoff-guide

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-072

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-072 only.

Task:
Create Release Notes

Branch:
phase16/P16-072-release-notes

Priority:
P1

Description:
Draft release notes covering student, parent, admin, assessments, billing, notifications, analytics, and limitations.

Goal:
Prepare release communication.

Expected output:
docs/phase-16/release-notes.md

Dependencies:
P16-068

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-072

Files created/updated:
- ...

Branch:
phase16/P16-072-release-notes

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-073

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-073 only.

Task:
Create User-Facing Known Limitations

Branch:
phase16/P16-073-user-facing-known-limitations

Priority:
P1

Description:
Document safe user-facing limitations without exposing security-sensitive details.

Goal:
Set expectations for release.

Expected output:
docs/phase-16/user-facing-known-limitations.md

Dependencies:
P16-068

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-073

Files created/updated:
- ...

Branch:
phase16/P16-073-user-facing-known-limitations

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-074

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-074 only.

Task:
Create Final Design System Release Review

Branch:
phase16/P16-074-design-system-release-review

Priority:
P0

Description:
Verify all UI surfaces passed design system audits and no release-blocking UI inconsistencies remain.

Goal:
Approve UI release readiness.

Expected output:
docs/quality/phase-16-final-design-system-release-review.md

Dependencies:
P16-031..P16-035, P16-055, P16-056

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared QA/release/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-074

Files created/updated:
- ...

Branch:
phase16/P16-074-design-system-release-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-075

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-075 only.

Task:
Create Final Security Release Review

Branch:
phase16/P16-075-final-security-release-review

Priority:
P0

Description:
Summarize all security audits, unresolved risks, mitigations, and release decision.

Goal:
Approve security release readiness.

Expected output:
docs/security/phase-16-final-security-release-review.md

Dependencies:
P16-050, P16-057, P16-070

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-075

Files created/updated:
- ...

Branch:
phase16/P16-075-final-security-release-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-076

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-076 only.

Task:
Create Final Performance Release Review

Branch:
phase16/P16-076-final-performance-release-review

Priority:
P0

Description:
Summarize performance test results, thresholds, blockers, and mitigations.

Goal:
Approve performance release readiness.

Expected output:
docs/performance/phase-16-final-performance-release-review.md

Dependencies:
P16-043

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-076

Files created/updated:
- ...

Branch:
phase16/P16-076-final-performance-release-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-077

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-077 only.

Task:
Create Final Architecture Release Review

Branch:
phase16/P16-077-final-architecture-release-review

Priority:
P0

Description:
Review production architecture, deployment, rollback, observability, and maintainability readiness.

Goal:
Approve architecture release readiness.

Expected output:
docs/quality/phase-16-final-architecture-release-review.md

Dependencies:
P16-058..P16-066, P16-075, P16-076

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-077

Files created/updated:
- ...

Branch:
phase16/P16-077-final-architecture-release-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-078

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-078 only.

Task:
Create Phase 16 Output Completeness Review

Branch:
phase16/P16-078-output-completeness-review

Priority:
P0

Description:
Verify every Phase 16 expected output exists and meets scope/design/security/performance/deployment rules.

Goal:
Approve or block Phase 16 completion.

Expected output:
docs/quality/phase-16-output-completeness-review.md

Dependencies:
P16-074, P16-075, P16-076, P16-077

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-078:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-078

Files created/updated:
- ...

Branch:
phase16/P16-078-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-079

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-079 only.

Task:
Create Phase 17 Readiness Checklist

Branch:
phase16/P16-079-phase-17-readiness-checklist

Priority:
P1

Description:
Document post-launch operations, iteration, and maintenance readiness items.

Goal:
Prepare Phase 17 safely.

Expected output:
docs/phase-17/readiness-from-phase-16.md

Dependencies:
P16-078

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-079:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-079

Files created/updated:
- ...

Branch:
phase16/P16-079-phase-17-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P16-080

You are an AI coding/documentation agent working on AIM Platform Phase 16 — QA, Performance, Deployment, and Release Readiness.

Work on task P16-080 only.

Task:
Create Phase 16 Final Review and Handoff

Branch:
phase16/P16-080-phase-16-final-review

Priority:
P0

Description:
Summarize QA, performance, security, deployment readiness, risks, checks, limitations, and next steps.

Goal:
Close Phase 16.

Expected output:
docs/phase-16/final-review.md

Dependencies:
P16-079

Required workflow:
1. Open the Phase 16 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P16-080:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Release Authority and Safety Rules:
- Do not introduce client-side learning, assessment, billing, notification, analytics, or AIM authority.
- Do not bypass permissions, ownership checks, parent consent rules, billing provider authority, or analytics privacy rules.
- Do not commit secrets, service-role keys, provider keys, signing keys, database credentials, or production tokens.
- All release reports must be evidence-based and must honestly document failures/blockers.

Scope limits:
- Do not implement new product features outside release-readiness scope.
- Do not work on AI Teacher, Voice AI, Payments beyond release validation, Notification delivery beyond release validation, Analytics beyond release validation, or new Student Web App features.
- Do not commit secrets, signing keys, provider keys, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Release/QA evidence is documented honestly.
- No new authority violation is introduced.
- No unrelated feature work is introduced.
- No secrets are present.
- Relevant checks pass or failures are documented as blockers.

Completion comment template:
Completed — P16-080

Files created/updated:
- ...

Branch:
phase16/P16-080-phase-16-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Release validation:
- Scope preserved: yes/no
- AIM design system followed for UI: yes/no/not applicable
- Security/privacy rules preserved: yes/no/not applicable
- Performance/deployment evidence documented: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
