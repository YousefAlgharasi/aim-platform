# AIM Phase 12 Task Prompts

Phase 12: Parent Dashboard

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion Database: 
https://app.notion.com/p/383af08baaf680cd8c17f16ef1cfd61c?v=39a054c860924924813335abcb9c6a1f

## Global Phase 12 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All parent UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Parent Dashboard must be child-scoped and consent-aware.
- Parent UI must be read-only for progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- No secrets may be committed.

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
- Parent UI calculates learning/assessment/AIM authority locally.
- Parent access is not child-scoped.
- Consent/privacy rules are bypassed.
- Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics work appears outside explicit readiness documentation.

---

#P12-001

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-001 only.

Task:
Create Phase 12 Parent Dashboard Charter

Branch:
phase12/P12-001-parent-dashboard-charter

Priority:
P0

Description:
Define Phase 12 scope, exclusions, privacy boundaries, parent authority limits, and dependencies.

Goal:
Lock Phase 12 to Parent Dashboard and parent/guardian visibility workflows only.

Expected output:
docs/phase-12/parent-dashboard-charter.md

Dependencies:
P11-077

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-001

Files created/updated:
- ...

Branch:
phase12/P12-001-parent-dashboard-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-002

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-002 only.

Task:
Create Parent Domain Map

Branch:
phase12/P12-002-parent-domain-map

Priority:
P0

Description:
Document parent, guardian, child link, consent, invitation, visibility, reports, and communication entities.

Goal:
Establish the parent dashboard domain model before implementation.

Expected output:
docs/phase-12/parent-domain-map.md

Dependencies:
P12-001

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-002

Files created/updated:
- ...

Branch:
phase12/P12-002-parent-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-003

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-003 only.

Task:
Create Parent Privacy and Consent Rules

Branch:
phase12/P12-003-parent-privacy-policy-rules

Priority:
P0

Description:
Define what parent users may access, what requires consent, and what must remain private.

Goal:
Protect student privacy and child data boundaries.

Expected output:
docs/phase-12/parent-privacy-consent-rules.md

Dependencies:
P12-001

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-003

Files created/updated:
- ...

Branch:
phase12/P12-003-parent-privacy-policy-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-004

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-004 only.

Task:
Create Parent Dashboard Design System Rules

Branch:
phase12/P12-004-parent-design-system-rules

Priority:
P0

Description:
Document how all parent UI must use the approved AIM design system.

Goal:
Prevent one-off styling and inconsistent parent dashboard UI.

Expected output:
docs/phase-12/parent-design-system-rules.md

Dependencies:
P12-001, DES-001

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-004

Files created/updated:
- ...

Branch:
phase12/P12-004-parent-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-005

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-005 only.

Task:
Create Parent Route and Permission Map

Branch:
phase12/P12-005-parent-route-permission-map

Priority:
P0

Description:
Map parent dashboard routes to required parent/guardian permissions and child access checks.

Goal:
Ensure parent routes are protected and child-scoped.

Expected output:
docs/phase-12/parent-route-permission-map.md

Dependencies:
P12-002, P12-003

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-005

Files created/updated:
- ...

Branch:
phase12/P12-005-parent-route-permission-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-006

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-006 only.

Task:
Create Parent API Contract Map

Branch:
phase12/P12-006-parent-api-contract-map

Priority:
P0

Description:
Document backend APIs required by parent dashboard UI.

Goal:
Align backend and parent UI before implementation.

Expected output:
docs/phase-12/parent-api-contract-map.md

Dependencies:
P12-002, P12-005

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-006

Files created/updated:
- ...

Branch:
phase12/P12-006-parent-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-007

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-007 only.

Task:
Create Parent Dashboard Flow Map

Branch:
phase12/P12-007-parent-dashboard-flow-map

Priority:
P1

Description:
Document parent onboarding, child linking, dashboard, progress, assessments, and reports flows.

Goal:
Guide UI implementation without violating privacy or backend authority.

Expected output:
docs/phase-12/parent-dashboard-flow-map.md

Dependencies:
P12-006

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-007

Files created/updated:
- ...

Branch:
phase12/P12-007-parent-dashboard-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-008

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-008 only.

Task:
Create Parent Data Retention Rules

Branch:
phase12/P12-008-parent-data-retention-rules

Priority:
P1

Description:
Document retention and audit expectations for parent-child access and invitations.

Goal:
Prepare safe data lifecycle handling.

Expected output:
docs/phase-12/parent-data-retention-rules.md

Dependencies:
P12-003

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-008

Files created/updated:
- ...

Branch:
phase12/P12-008-parent-data-retention-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-009

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-009 only.

Task:
Create Parent Child Links Migration

Branch:
phase12/P12-009-parent-child-links-migration

Priority:
P0

Description:
Add table for parent/guardian to student relationships with status and scope.

Goal:
Persist child access relationships safely.

Expected output:
Migration for parent_child_links

Dependencies:
P12-002

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-009

Files created/updated:
- ...

Branch:
phase12/P12-009-parent-child-links-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-010

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-010 only.

Task:
Create Parent Invitations Migration

Branch:
phase12/P12-010-parent-invitations-migration

Priority:
P0

Description:
Add table for parent invitation tokens/status/expiry metadata.

Goal:
Support secure parent-child linking workflow.

Expected output:
Migration for parent_invitations

Dependencies:
P12-009

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-010

Files created/updated:
- ...

Branch:
phase12/P12-010-parent-invitations-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-011

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-011 only.

Task:
Create Parent Consents Migration

Branch:
phase12/P12-011-parent-consents-migration

Priority:
P0

Description:
Add table for consent grants, revocations, visibility scope, and timestamps.

Goal:
Track parent/guardian consent decisions.

Expected output:
Migration for parent_consents

Dependencies:
P12-009

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-011

Files created/updated:
- ...

Branch:
phase12/P12-011-parent-consents-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-012

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-012 only.

Task:
Create Parent Access Audit Migration

Branch:
phase12/P12-012-parent-access-audit-migration

Priority:
P1

Description:
Add audit table for parent access to child data.

Goal:
Provide traceability for privacy-sensitive reads/actions.

Expected output:
Migration for parent_access_audit_logs

Dependencies:
P12-009, P12-011

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-012

Files created/updated:
- ...

Branch:
phase12/P12-012-parent-access-audit-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-013

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-013 only.

Task:
Create Parent Notification Preferences Migration

Branch:
phase12/P12-013-parent-notification-preferences-migration

Priority:
P2

Description:
Add notification preference table for future Phase 13 integration without sending notifications now.

Goal:
Prepare future parent notifications safely.

Expected output:
Migration for parent_notification_preferences

Dependencies:
P12-009

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-013

Files created/updated:
- ...

Branch:
phase12/P12-013-parent-notification-preferences-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-014

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-014 only.

Task:
Add Parent Dashboard DB Constraints

Branch:
phase12/P12-014-parent-db-constraints

Priority:
P0

Description:
Add foreign keys, uniqueness, status checks, expiry constraints, and indexes for parent tables.

Goal:
Prevent invalid parent-child access state.

Expected output:
Updated parent dashboard constraints migration

Dependencies:
P12-009..P12-013

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-014

Files created/updated:
- ...

Branch:
phase12/P12-014-parent-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-015

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-015 only.

Task:
Add Parent Dashboard Seed Fixtures

Branch:
phase12/P12-015-parent-seed-fixtures

Priority:
P2

Description:
Add safe development fixtures for parent-child links and invitations.

Goal:
Support local backend/UI testing.

Expected output:
Seed data or fixtures

Dependencies:
P12-014

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-015

Files created/updated:
- ...

Branch:
phase12/P12-015-parent-seed-fixtures

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-016

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-016 only.

Task:
Create Parent Backend Module

Branch:
phase12/P12-016-parent-backend-module

Priority:
P0

Description:
Add backend feature module for parent dashboard domain.

Goal:
Establish backend feature boundary for parent access.

Expected output:
services/backend-api/src/features/parents/

Dependencies:
P12-014

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-016

Files created/updated:
- ...

Branch:
phase12/P12-016-parent-backend-module

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-017

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-017 only.

Task:
Create Parent DTOs and Entities

Branch:
phase12/P12-017-parent-dtos-entities

Priority:
P0

Description:
Define DTOs/entities for links, invitations, consent, access scope, dashboard summary, and child reports.

Goal:
Standardize parent backend contracts.

Expected output:
Parent DTO/entity files

Dependencies:
P12-016

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-017

Files created/updated:
- ...

Branch:
phase12/P12-017-parent-dtos-entities

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-018

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-018 only.

Task:
Add Parent Validation Rules

Branch:
phase12/P12-018-parent-validation-rules

Priority:
P0

Description:
Validate invitation, link status, consent status, child IDs, and access scope.

Goal:
Reject invalid parent access requests.

Expected output:
Parent validation helpers/pipes/tests

Dependencies:
P12-017

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-018

Files created/updated:
- ...

Branch:
phase12/P12-018-parent-validation-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-019

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-019 only.

Task:
Create Parent Repository Layer

Branch:
phase12/P12-019-parent-repository

Priority:
P0

Description:
Add data access methods for links, invitations, consents, and audit logs.

Goal:
Encapsulate parent persistence.

Expected output:
Parent repository implementation

Dependencies:
P12-017

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-019

Files created/updated:
- ...

Branch:
phase12/P12-019-parent-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-020

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-020 only.

Task:
Create Parent Child Link Service

Branch:
phase12/P12-020-parent-link-service

Priority:
P0

Description:
Add service for creating, accepting, revoking, and resolving parent-child relationships.

Goal:
Centralize parent-child link authority.

Expected output:
Parent child link service

Dependencies:
P12-019

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-020

Files created/updated:
- ...

Branch:
phase12/P12-020-parent-link-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-021

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-021 only.

Task:
Create Parent Invitation Service

Branch:
phase12/P12-021-parent-invitation-service

Priority:
P0

Description:
Add secure invitation creation/acceptance/expiry logic.

Goal:
Support safe parent onboarding and child linking.

Expected output:
Parent invitation service

Dependencies:
P12-010, P12-020

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-021

Files created/updated:
- ...

Branch:
phase12/P12-021-parent-invitation-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-022

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-022 only.

Task:
Create Parent Consent Service

Branch:
phase12/P12-022-parent-consent-service

Priority:
P0

Description:
Add consent grant/revoke/visibility scope logic.

Goal:
Centralize consent rules.

Expected output:
Parent consent service

Dependencies:
P12-011, P12-020

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-022

Files created/updated:
- ...

Branch:
phase12/P12-022-parent-consent-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-023

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-023 only.

Task:
Create Parent Access Policy Service

Branch:
phase12/P12-023-parent-access-policy-service

Priority:
P0

Description:
Add policy service that verifies parent access before any child data read.

Goal:
Protect child data access.

Expected output:
Parent access policy service

Dependencies:
P12-020, P12-022

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-023

Files created/updated:
- ...

Branch:
phase12/P12-023-parent-access-policy-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-024

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-024 only.

Task:
Create Parent Access Audit Service

Branch:
phase12/P12-024-parent-audit-service

Priority:
P1

Description:
Log safe metadata when parent accesses child information or performs link actions.

Goal:
Provide privacy audit trail.

Expected output:
Parent access audit service

Dependencies:
P12-012, P12-023

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-024

Files created/updated:
- ...

Branch:
phase12/P12-024-parent-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-025

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-025 only.

Task:
Add Parent Permission Guards

Branch:
phase12/P12-025-parent-permission-guards

Priority:
P0

Description:
Protect parent APIs with auth, relationship, consent, and child ownership checks.

Goal:
Prevent unauthorized child access.

Expected output:
Parent guards/policies/tests

Dependencies:
P12-023

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-025

Files created/updated:
- ...

Branch:
phase12/P12-025-parent-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-026

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-026 only.

Task:
Create Parent Dashboard Summary Service

Branch:
phase12/P12-026-parent-dashboard-summary-service

Priority:
P0

Description:
Aggregate backend-approved child summary data for parent dashboard.

Goal:
Provide safe parent overview.

Expected output:
Parent dashboard summary service

Dependencies:
P12-025, P6/P10 outputs

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-026

Files created/updated:
- ...

Branch:
phase12/P12-026-parent-dashboard-summary-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-027

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-027 only.

Task:
Create Parent Child Progress Service

Branch:
phase12/P12-027-parent-child-progress-service

Priority:
P0

Description:
Expose read-only child progress, skill states, weaknesses, and recommendations through backend-approved data.

Goal:
Allow parent progress inspection without mutation.

Expected output:
Parent child progress service

Dependencies:
P12-025, P5/P6 outputs

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-027

Files created/updated:
- ...

Branch:
phase12/P12-027-parent-child-progress-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-028

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-028 only.

Task:
Create Parent Assessment Summary Service

Branch:
phase12/P12-028-parent-assessment-service

Priority:
P0

Description:
Expose read-only quiz/exam/deadline results and upcoming assessments for linked children.

Goal:
Allow parents to inspect assessments safely.

Expected output:
Parent assessment summary service

Dependencies:
P12-025, P10 outputs

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-028

Files created/updated:
- ...

Branch:
phase12/P12-028-parent-assessment-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-029

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-029 only.

Task:
Create Parent Activity Summary Service

Branch:
phase12/P12-029-parent-attendance-activity-service

Priority:
P1

Description:
Expose safe activity/session summary for linked children.

Goal:
Allow parents to understand recent learning activity.

Expected output:
Parent activity summary service

Dependencies:
P12-025, P5/P6 outputs

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-029

Files created/updated:
- ...

Branch:
phase12/P12-029-parent-attendance-activity-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-030

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-030 only.

Task:
Create Parent Report Service

Branch:
phase12/P12-030-parent-report-service

Priority:
P1

Description:
Create backend-approved weekly/monthly child report summaries.

Goal:
Support parent reporting without full analytics scope.

Expected output:
Parent report service

Dependencies:
P12-026, P12-027, P12-028

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-030

Files created/updated:
- ...

Branch:
phase12/P12-030-parent-report-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-031

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-031 only.

Task:
Create Parent Children API

Branch:
phase12/P12-031-parent-api-list-children

Priority:
P0

Description:
Return linked children visible to authenticated parent.

Goal:
Feed parent child selector/dashboard.

Expected output:
Parent children endpoint

Dependencies:
P12-025

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-031

Files created/updated:
- ...

Branch:
phase12/P12-031-parent-api-list-children

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-032

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-032 only.

Task:
Create Parent Dashboard Summary API

Branch:
phase12/P12-032-parent-api-dashboard-summary

Priority:
P0

Description:
Return safe backend-approved child dashboard summary.

Goal:
Feed parent dashboard home.

Expected output:
Parent dashboard summary endpoint

Dependencies:
P12-026, P12-031

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-032

Files created/updated:
- ...

Branch:
phase12/P12-032-parent-api-dashboard-summary

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-033

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-033 only.

Task:
Create Parent Child Progress API

Branch:
phase12/P12-033-parent-api-child-progress

Priority:
P0

Description:
Return read-only child progress and skill-state summaries.

Goal:
Feed parent progress page.

Expected output:
Parent child progress endpoint

Dependencies:
P12-027, P12-031

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-033

Files created/updated:
- ...

Branch:
phase12/P12-033-parent-api-child-progress

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-034

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-034 only.

Task:
Create Parent Child Assessments API

Branch:
phase12/P12-034-parent-api-assessments

Priority:
P0

Description:
Return read-only child assessment results/deadlines.

Goal:
Feed parent assessments page.

Expected output:
Parent assessments endpoint

Dependencies:
P12-028, P12-031

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-034

Files created/updated:
- ...

Branch:
phase12/P12-034-parent-api-assessments

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-035

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-035 only.

Task:
Create Parent Child Activity API

Branch:
phase12/P12-035-parent-api-activity

Priority:
P1

Description:
Return safe recent activity/session summaries.

Goal:
Feed parent activity page.

Expected output:
Parent activity endpoint

Dependencies:
P12-029, P12-031

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-035

Files created/updated:
- ...

Branch:
phase12/P12-035-parent-api-activity

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-036

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-036 only.

Task:
Create Parent Reports API

Branch:
phase12/P12-036-parent-api-reports

Priority:
P1

Description:
Return backend-approved parent reports for linked child.

Goal:
Feed parent reports page.

Expected output:
Parent reports endpoint

Dependencies:
P12-030, P12-031

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-036

Files created/updated:
- ...

Branch:
phase12/P12-036-parent-api-reports

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-037

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-037 only.

Task:
Create Parent Invitation APIs

Branch:
phase12/P12-037-parent-api-invitations

Priority:
P0

Description:
Add create/accept/revoke/status invitation endpoints where authorized.

Goal:
Support parent-child linking flow.

Expected output:
Parent invitation endpoints

Dependencies:
P12-021, P12-025

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-037

Files created/updated:
- ...

Branch:
phase12/P12-037-parent-api-invitations

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-038

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-038 only.

Task:
Create Parent Consent APIs

Branch:
phase12/P12-038-parent-api-consents

Priority:
P0

Description:
Add grant/revoke/read consent endpoints where authorized.

Goal:
Support parent visibility control.

Expected output:
Parent consent endpoints

Dependencies:
P12-022, P12-025

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-038

Files created/updated:
- ...

Branch:
phase12/P12-038-parent-api-consents

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-039

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-039 only.

Task:
Create Parent Notification Preferences API

Branch:
phase12/P12-039-parent-api-notification-preferences

Priority:
P2

Description:
Add read/update preferences without sending notifications.

Goal:
Prepare Phase 13 integration.

Expected output:
Parent notification preferences endpoint

Dependencies:
P12-013, P12-025

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-039

Files created/updated:
- ...

Branch:
phase12/P12-039-parent-api-notification-preferences

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-040

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-040 only.

Task:
Document Parent API Contracts

Branch:
phase12/P12-040-parent-api-contract-docs

Priority:
P0

Description:
Document all parent endpoints and response shapes for UI implementation.

Goal:
Stabilize parent frontend/backend contracts.

Expected output:
docs/phase-12/parent-api-contracts.md

Dependencies:
P12-031..P12-039

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-040

Files created/updated:
- ...

Branch:
phase12/P12-040-parent-api-contract-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-041

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-041 only.

Task:
Add Parent Permission Tests

Branch:
phase12/P12-041-parent-backend-permission-tests

Priority:
P0

Description:
Test parent cannot access unlinked child data and revoked links fail.

Goal:
Verify child data protection.

Expected output:
Backend permission tests

Dependencies:
P12-025, P12-031..P12-038

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-041

Files created/updated:
- ...

Branch:
phase12/P12-041-parent-backend-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-042

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-042 only.

Task:
Add Parent Invitation Tests

Branch:
phase12/P12-042-parent-invitation-tests

Priority:
P0

Description:
Test invite create/accept/expiry/revoke and invalid token states.

Goal:
Verify parent linking workflow.

Expected output:
Backend invitation tests

Dependencies:
P12-021, P12-037

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-042

Files created/updated:
- ...

Branch:
phase12/P12-042-parent-invitation-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-043

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-043 only.

Task:
Add Parent Consent Tests

Branch:
phase12/P12-043-parent-consent-tests

Priority:
P0

Description:
Test consent grant/revoke/scope enforcement.

Goal:
Verify privacy rules.

Expected output:
Backend consent tests

Dependencies:
P12-022, P12-038

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-043

Files created/updated:
- ...

Branch:
phase12/P12-043-parent-consent-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-044

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-044 only.

Task:
Add Parent Read-Only Progress Tests

Branch:
phase12/P12-044-parent-readonly-progress-tests

Priority:
P0

Description:
Ensure parent APIs do not mutate progress, skills, weaknesses, recommendations, or AIM outputs.

Goal:
Preserve AIM/backend authority.

Expected output:
Backend read-only progress tests

Dependencies:
P12-027, P12-033

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-044

Files created/updated:
- ...

Branch:
phase12/P12-044-parent-readonly-progress-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-045

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-045 only.

Task:
Add Parent Assessment Access Tests

Branch:
phase12/P12-045-parent-assessment-access-tests

Priority:
P0

Description:
Test parent assessment reads are child-scoped and read-only.

Goal:
Protect assessment data.

Expected output:
Backend assessment access tests

Dependencies:
P12-028, P12-034

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-045

Files created/updated:
- ...

Branch:
phase12/P12-045-parent-assessment-access-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-046

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-046 only.

Task:
Add Parent API Error Handling

Branch:
phase12/P12-046-parent-error-handling

Priority:
P1

Description:
Standardize errors for forbidden, unlinked child, revoked consent, expired invitation, and invalid scope.

Goal:
Improve parent API reliability.

Expected output:
Error handling helpers/tests

Dependencies:
P12-031..P12-039

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every parent endpoint with auth, relationship, consent, and child-scope guards.
- Do not trust client-submitted child links, consent state, progress, assessment results, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-046

Files created/updated:
- ...

Branch:
phase12/P12-046-parent-error-handling

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-047

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-047 only.

Task:
Create Parent Dashboard Feature Shell

Branch:
phase12/P12-047-parent-dashboard-feature-shell

Priority:
P0

Description:
Create parent dashboard app/feature structure using existing project conventions.

Goal:
Establish parent UI boundary.

Expected output:
Parent dashboard feature/app shell

Dependencies:
P12-004, P12-006, P12-040

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-047

Files created/updated:
- ...

Branch:
phase12/P12-047-parent-dashboard-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-048

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-048 only.

Task:
Implement Parent Layout System

Branch:
phase12/P12-048-parent-layout-system

Priority:
P0

Description:
Implement parent sidebar/header/mobile nav/content shell using AIM design system.

Goal:
Create consistent parent dashboard foundation.

Expected output:
Parent layout components

Dependencies:
P12-004, P12-047

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-048

Files created/updated:
- ...

Branch:
phase12/P12-048-parent-layout-system

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-049

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-049 only.

Task:
Implement Parent Common Components

Branch:
phase12/P12-049-parent-common-components

Priority:
P0

Description:
Create reusable parent cards, tables, badges, chart shells, progress blocks, empty/error/loading states using AIM design system.

Goal:
Avoid duplicated parent UI patterns.

Expected output:
Parent common components

Dependencies:
P12-048

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-049

Files created/updated:
- ...

Branch:
phase12/P12-049-parent-common-components

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-050

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-050 only.

Task:
Create Parent API Client Layer

Branch:
phase12/P12-050-parent-api-client

Priority:
P0

Description:
Add parent dashboard API client for authenticated backend calls.

Goal:
Standardize parent API access.

Expected output:
Parent API client files

Dependencies:
P12-040, P12-047

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-050

Files created/updated:
- ...

Branch:
phase12/P12-050-parent-api-client

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-051

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-051 only.

Task:
Implement Parent Auth Guard UI

Branch:
phase12/P12-051-parent-auth-guard-ui

Priority:
P0

Description:
Protect parent dashboard pages and show forbidden/empty access states using AIM design system.

Goal:
Prevent unauthorized parent UI access.

Expected output:
Parent route guards/UI states

Dependencies:
P12-005, P12-048, P12-050

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-051

Files created/updated:
- ...

Branch:
phase12/P12-051-parent-auth-guard-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-052

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-052 only.

Task:
Create Parent Child Selector UI

Branch:
phase12/P12-052-parent-child-selector-ui

Priority:
P0

Description:
Build child selector for linked children with safe empty/no-link state.

Goal:
Allow parent to switch between linked children.

Expected output:
Parent child selector UI

Dependencies:
P12-031, P12-049, P12-050

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-052

Files created/updated:
- ...

Branch:
phase12/P12-052-parent-child-selector-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-053

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-053 only.

Task:
Create Parent Onboarding UI

Branch:
phase12/P12-053-parent-onboarding-ui

Priority:
P1

Description:
Build parent onboarding/start page with invitation/child-link entry points using AIM design system.

Goal:
Guide parent setup.

Expected output:
Parent onboarding UI

Dependencies:
P12-037, P12-049, P12-050

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-053

Files created/updated:
- ...

Branch:
phase12/P12-053-parent-onboarding-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-054

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-054 only.

Task:
Create Invitation Accept UI

Branch:
phase12/P12-054-parent-invitation-accept-ui

Priority:
P0

Description:
Build invitation token accept/status/expired/revoked screens.

Goal:
Support secure parent-child linking UX.

Expected output:
Parent invitation accept UI

Dependencies:
P12-037, P12-053

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-054

Files created/updated:
- ...

Branch:
phase12/P12-054-parent-invitation-accept-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-055

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-055 only.

Task:
Create Parent Consent UI

Branch:
phase12/P12-055-parent-consent-ui

Priority:
P0

Description:
Build consent grant/revoke/status UI with clear visibility scope text.

Goal:
Allow safe consent management.

Expected output:
Parent consent UI

Dependencies:
P12-038, P12-049

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-055

Files created/updated:
- ...

Branch:
phase12/P12-055-parent-consent-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-056

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-056 only.

Task:
Create Parent Dashboard Home UI

Branch:
phase12/P12-056-parent-dashboard-home-ui

Priority:
P0

Description:
Build overview page with child summary, progress snapshot, deadlines, and recent activity.

Goal:
Provide parent landing dashboard.

Expected output:
Parent dashboard home UI

Dependencies:
P12-032, P12-049, P12-052

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-056

Files created/updated:
- ...

Branch:
phase12/P12-056-parent-dashboard-home-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-057

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-057 only.

Task:
Create Parent Progress Summary UI

Branch:
phase12/P12-057-parent-progress-summary-ui

Priority:
P0

Description:
Build read-only progress summary page using backend-approved child progress.

Goal:
Allow parents to view learning progress safely.

Expected output:
Parent progress summary UI

Dependencies:
P12-033, P12-049, P12-052

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-057

Files created/updated:
- ...

Branch:
phase12/P12-057-parent-progress-summary-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-058

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-058 only.

Task:
Create Parent Skill State UI

Branch:
phase12/P12-058-parent-skill-state-ui

Priority:
P0

Description:
Build read-only skill state/mastery visualization using backend-approved data.

Goal:
Show skill development without local calculation.

Expected output:
Parent skill state UI

Dependencies:
P12-033, P12-057

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-058

Files created/updated:
- ...

Branch:
phase12/P12-058-parent-skill-state-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-059

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-059 only.

Task:
Create Parent Weakness and Recommendation UI

Branch:
phase12/P12-059-parent-weakness-recommendation-ui

Priority:
P0

Description:
Build read-only weaknesses and recommendations display.

Goal:
Show backend-approved AIM insights safely.

Expected output:
Parent weakness/recommendation UI

Dependencies:
P12-033, P12-057

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-059

Files created/updated:
- ...

Branch:
phase12/P12-059-parent-weakness-recommendation-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-060

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-060 only.

Task:
Create Parent Assessments UI

Branch:
phase12/P12-060-parent-assessments-ui

Priority:
P0

Description:
Build read-only quizzes/exams/deadlines/results page.

Goal:
Allow parents to inspect assessments safely.

Expected output:
Parent assessments UI

Dependencies:
P12-034, P12-049, P12-052

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-060

Files created/updated:
- ...

Branch:
phase12/P12-060-parent-assessments-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-061

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-061 only.

Task:
Create Parent Deadline Status UI

Branch:
phase12/P12-061-parent-deadline-status-ui

Priority:
P1

Description:
Build due/upcoming/missed/closed status cards using AIM design system.

Goal:
Help parents track deadlines.

Expected output:
Parent deadline status UI

Dependencies:
P12-034, P12-060

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-061

Files created/updated:
- ...

Branch:
phase12/P12-061-parent-deadline-status-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-062

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-062 only.

Task:
Create Parent Activity UI

Branch:
phase12/P12-062-parent-activity-ui

Priority:
P1

Description:
Build recent learning activity/session summary page using backend-approved data.

Goal:
Help parents understand learning activity.

Expected output:
Parent activity UI

Dependencies:
P12-035, P12-049, P12-052

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-062

Files created/updated:
- ...

Branch:
phase12/P12-062-parent-activity-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-063

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-063 only.

Task:
Create Parent Reports UI

Branch:
phase12/P12-063-parent-reports-ui

Priority:
P1

Description:
Build weekly/monthly report page using backend-approved report summaries.

Goal:
Support parent review of child learning.

Expected output:
Parent reports UI

Dependencies:
P12-036, P12-049, P12-052

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-063

Files created/updated:
- ...

Branch:
phase12/P12-063-parent-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-064

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-064 only.

Task:
Create Parent Notification Preferences UI

Branch:
phase12/P12-064-parent-notification-preferences-ui

Priority:
P2

Description:
Build preference form without sending notifications yet.

Goal:
Prepare Phase 13 parent notifications.

Expected output:
Parent notification preferences UI

Dependencies:
P12-039, P12-049

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-064

Files created/updated:
- ...

Branch:
phase12/P12-064-parent-notification-preferences-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-065

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-065 only.

Task:
Apply Parent Responsive and RTL UI Pass

Branch:
phase12/P12-065-parent-responsive-rtl-ui-pass

Priority:
P1

Description:
Review and fix parent UI responsive/RTL issues using AIM design system.

Goal:
Ensure parent dashboard usability across layouts.

Expected output:
Parent UI responsive/RTL updates

Dependencies:
P12-048..P12-064

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-065

Files created/updated:
- ...

Branch:
phase12/P12-065-parent-responsive-rtl-ui-pass

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-066

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-066 only.

Task:
Apply Parent Accessibility UI Pass

Branch:
phase12/P12-066-parent-accessibility-ui-pass

Priority:
P1

Description:
Review and fix forms, tables, labels, focus states, and keyboard navigation.

Goal:
Improve parent dashboard accessibility.

Expected output:
Parent UI accessibility updates

Dependencies:
P12-048..P12-064

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-066

Files created/updated:
- ...

Branch:
phase12/P12-066-parent-accessibility-ui-pass

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-067

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-067 only.

Task:
Add Parent UI No-Authority Tests

Branch:
phase12/P12-067-parent-ui-no-authority-tests

Priority:
P0

Description:
Ensure parent UI does not calculate progress, mastery, assessment scores, recommendations, or AIM outputs.

Goal:
Protect backend authority.

Expected output:
Parent UI authority tests

Dependencies:
P12-056..P12-063

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-067

Files created/updated:
- ...

Branch:
phase12/P12-067-parent-ui-no-authority-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-068

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-068 only.

Task:
Add Parent UI Permission/Error Tests

Branch:
phase12/P12-068-parent-ui-permission-tests

Priority:
P0

Description:
Test forbidden, unlinked child, revoked consent, no children, expired invitation, and loading/error states.

Goal:
Verify parent UI access handling.

Expected output:
Parent UI permission/error tests

Dependencies:
P12-051..P12-055

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-068

Files created/updated:
- ...

Branch:
phase12/P12-068-parent-ui-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-069

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-069 only.

Task:
Create Parent UI Design System Review

Branch:
phase12/P12-069-parent-ui-design-system-review

Priority:
P0

Description:
Verify all parent UI uses AIM design system tokens/components and no one-off styling.

Goal:
Approve or block design consistency.

Expected output:
docs/quality/phase-12-parent-ui-design-system-review.md

Dependencies:
P12-065, P12-066

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-069

Files created/updated:
- ...

Branch:
phase12/P12-069-parent-ui-design-system-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-070

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-070 only.

Task:
Create Parent Dashboard Security Review

Branch:
phase12/P12-070-parent-security-review

Priority:
P0

Description:
Review backend guards, child access, consent, invitations, secrets, logs, and UI access controls.

Goal:
Validate parent dashboard security readiness.

Expected output:
docs/quality/phase-12-parent-security-review.md

Dependencies:
P12-041..P12-046, P12-068

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-070

Files created/updated:
- ...

Branch:
phase12/P12-070-parent-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-071

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-071 only.

Task:
Create Parent Dashboard Privacy Review

Branch:
phase12/P12-071-parent-privacy-review

Priority:
P0

Description:
Review child data visibility, consent, audit logs, report scope, and sensitive field exposure.

Goal:
Validate parent privacy readiness.

Expected output:
docs/quality/phase-12-parent-privacy-review.md

Dependencies:
P12-003, P12-070

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-071

Files created/updated:
- ...

Branch:
phase12/P12-071-parent-privacy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-072

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-072 only.

Task:
Create Parent Dashboard Architecture Review

Branch:
phase12/P12-072-parent-architecture-review

Priority:
P0

Description:
Review backend/frontend architecture, boundaries, API usage, and maintainability.

Goal:
Validate Phase 12 architecture readiness.

Expected output:
docs/quality/phase-12-parent-architecture-review.md

Dependencies:
P12-069, P12-070, P12-071

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-072

Files created/updated:
- ...

Branch:
phase12/P12-072-parent-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-073

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-073 only.

Task:
Create Parent Linking E2E Check

Branch:
phase12/P12-073-parent-e2e-linking

Priority:
P1

Description:
Document or implement E2E check for invitation, consent, and child selector flow.

Goal:
Validate parent linking flow.

Expected output:
docs/quality/phase-12-parent-linking-e2e-check.md

Dependencies:
P12-054, P12-055, P12-068

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-073

Files created/updated:
- ...

Branch:
phase12/P12-073-parent-e2e-linking

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-074

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-074 only.

Task:
Create Parent Dashboard E2E Check

Branch:
phase12/P12-074-parent-e2e-dashboard

Priority:
P1

Description:
Document or implement E2E check for dashboard home, progress, assessments, activity, and reports.

Goal:
Validate parent dashboard flow.

Expected output:
docs/quality/phase-12-parent-dashboard-e2e-check.md

Dependencies:
P12-056..P12-063

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared parent/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-074

Files created/updated:
- ...

Branch:
phase12/P12-074-parent-e2e-dashboard

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-075

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-075 only.

Task:
Create Phase 12 Output Completeness Review

Branch:
phase12/P12-075-output-completeness-review

Priority:
P0

Description:
Verify every Phase 12 expected output exists and meets scope/design/privacy/authority rules.

Goal:
Approve or block Phase 12 completion.

Expected output:
docs/quality/phase-12-output-completeness-review.md

Dependencies:
P12-069..P12-074

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-075

Files created/updated:
- ...

Branch:
phase12/P12-075-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-076

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-076 only.

Task:
Create Phase 13 Readiness Checklist

Branch:
phase12/P12-076-phase-13-readiness-checklist

Priority:
P1

Description:
Document notification/reminder readiness items produced by Phase 12.

Goal:
Prepare Phase 13 without implementing notifications now.

Expected output:
docs/phase-13/readiness-from-phase-12.md

Dependencies:
P12-075

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-076

Files created/updated:
- ...

Branch:
phase12/P12-076-phase-13-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P12-077

You are an AI coding/documentation agent working on AIM Platform Phase 12 — Parent Dashboard.

Work on task P12-077 only.

Task:
Create Phase 12 Final Review and Handoff

Branch:
phase12/P12-077-phase-12-final-review

Priority:
P0

Description:
Summarize implementation, outputs, privacy/security risks, checks, limitations, and next steps.

Goal:
Close Phase 12.

Expected output:
docs/phase-12/final-review.md

Dependencies:
P12-076

Required workflow:
1. Open the Phase 12 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P12-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Parent UI must be read-only for student progress, skill states, weaknesses, recommendations, review schedules, assessment results, and AIM outputs.
- Parent UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for child access, consent, progress, assessment results, and AIM outputs.
- Parent access must be child-scoped and consent-aware.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 13 notifications except readiness documentation or preferences storage/UI when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Parent access is child-scoped and consent-aware.
- No client-side learning/assessment/AIM authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P12-077

Files created/updated:
- ...

Branch:
phase12/P12-077-phase-12-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Parent validation:
- Parent access protection preserved: yes/no/not applicable
- Consent/privacy rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
