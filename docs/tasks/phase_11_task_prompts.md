# AIM Phase 11 Task Prompts

Phase 11: Admin Dashboard

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion database: https://app.notion.com/p/383af08baaf6801ca4b3c2eedb238032?v=4ea494e45f834d03813c74eaa8f10633
## Global Phase 11 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All admin UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Admin UI must use shared design tokens/components and must not introduce one-off styling.
- Backend remains final authority for identity, permissions, content publishing, assessment grading, progress, and AIM outputs.
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
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
- Admin UI calculates learning/assessment/AIM authority locally.
- Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, or full analytics work appears outside explicit readiness documentation.

---

#P11-001

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-001 only.

Task:
Create Phase 11 Admin Dashboard Charter

Branch:
phase11/P11-001-admin-dashboard-charter

Priority:
P0

Description:
Define Phase 11 scope, exclusions, UI rules, admin authority boundaries, and dependencies.

Goal:
Lock Phase 11 to Admin Dashboard and admin management workflows only.

Expected output:
docs/phase-11/admin-dashboard-charter.md

Dependencies:
P10-076

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-001

Files created/updated:
- ...

Branch:
phase11/P11-001-admin-dashboard-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-002

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-002 only.

Task:
Create Admin Capability Map

Branch:
phase11/P11-002-admin-capability-map

Priority:
P0

Description:
Document all admin capabilities needed for users, roles, curriculum, assessments, deadlines, content, reports, and audits.

Goal:
Define the complete admin capability boundary before implementation.

Expected output:
docs/phase-11/admin-capability-map.md

Dependencies:
P11-001

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-002

Files created/updated:
- ...

Branch:
phase11/P11-002-admin-capability-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-003

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-003 only.

Task:
Create Admin Design System Rules

Branch:
phase11/P11-003-admin-design-system-rules

Priority:
P0

Description:
Document how all admin UI must use the approved AIM design system.

Goal:
Prevent one-off styling and inconsistent UI implementation.

Expected output:
docs/phase-11/admin-design-system-rules.md

Dependencies:
P11-001, DES-001

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-003

Files created/updated:
- ...

Branch:
phase11/P11-003-admin-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-004

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-004 only.

Task:
Create Admin Route and Permission Map

Branch:
phase11/P11-004-admin-route-permission-map

Priority:
P0

Description:
Map admin routes to required permissions and roles.

Goal:
Ensure every admin page is permission-protected.

Expected output:
docs/phase-11/admin-route-permission-map.md

Dependencies:
P11-002, P2 roles/permissions outputs

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-004

Files created/updated:
- ...

Branch:
phase11/P11-004-admin-route-permission-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-005

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-005 only.

Task:
Create Admin API Contract Map

Branch:
phase11/P11-005-admin-api-contract-map

Priority:
P0

Description:
Document backend admin APIs needed by the dashboard.

Goal:
Align admin UI with backend APIs before implementation.

Expected output:
docs/phase-11/admin-api-contract-map.md

Dependencies:
P11-002

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-005

Files created/updated:
- ...

Branch:
phase11/P11-005-admin-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-006

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-006 only.

Task:
Audit Admin Dashboard Shell

Branch:
phase11/P11-006-admin-dashboard-shell-audit

Priority:
P0

Description:
Review existing admin dashboard structure, routing, auth, layout, and design system usage.

Goal:
Find gaps before building admin features.

Expected output:
docs/quality/phase-11-admin-shell-audit.md

Dependencies:
P11-003, P11-004

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-006

Files created/updated:
- ...

Branch:
phase11/P11-006-admin-dashboard-shell-audit

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-007

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-007 only.

Task:
Review Admin Auth and Permission Guards

Branch:
phase11/P11-007-admin-auth-guard-review

Priority:
P0

Description:
Verify admin dashboard routes use backend-approved auth and permissions.

Goal:
Prevent unauthorized admin access.

Expected output:
docs/quality/phase-11-admin-auth-guard-review.md

Dependencies:
P11-004, P11-006

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-007

Files created/updated:
- ...

Branch:
phase11/P11-007-admin-auth-guard-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-008

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-008 only.

Task:
Implement Admin Layout System

Branch:
phase11/P11-008-admin-layout-system

Priority:
P0

Description:
Implement or align sidebar, header, content shell, loading states, and empty states with AIM design system.

Goal:
Create consistent admin dashboard foundation.

Expected output:
apps/admin-dashboard/components/layout/ or existing admin layout files

Dependencies:
P11-003, P11-006

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-008

Files created/updated:
- ...

Branch:
phase11/P11-008-admin-layout-system

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-009

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-009 only.

Task:
Implement Admin Common Components

Branch:
phase11/P11-009-admin-common-components

Priority:
P0

Description:
Create reusable tables, forms, badges, cards, confirmation dialogs, filters, and pagination using AIM design system.

Goal:
Avoid duplicated UI patterns across admin pages.

Expected output:
apps/admin-dashboard/components/common/ or existing shared component path

Dependencies:
P11-008

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-009

Files created/updated:
- ...

Branch:
phase11/P11-009-admin-common-components

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-010

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-010 only.

Task:
Create Admin API Client Layer

Branch:
phase11/P11-010-admin-api-client

Priority:
P0

Description:
Add admin dashboard API client utilities for authenticated backend calls.

Goal:
Standardize admin API access.

Expected output:
apps/admin-dashboard/lib/api/ or existing API client path

Dependencies:
P11-005, P11-007

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-010

Files created/updated:
- ...

Branch:
phase11/P11-010-admin-api-client

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-011

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-011 only.

Task:
Implement Admin Error Handling UX

Branch:
phase11/P11-011-admin-error-handling

Priority:
P1

Description:
Add reusable error, forbidden, validation, loading, and retry states using AIM design system.

Goal:
Improve admin reliability and consistency.

Expected output:
Admin error/loading components and docs

Dependencies:
P11-009, P11-010

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-011

Files created/updated:
- ...

Branch:
phase11/P11-011-admin-error-handling

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-012

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-012 only.

Task:
Create Admin Dashboard Home

Branch:
phase11/P11-012-admin-dashboard-home

Priority:
P1

Description:
Create overview/admin landing page with scoped cards and quick links using AIM design system.

Goal:
Provide admin entry point.

Expected output:
apps/admin-dashboard/app/admin/page.tsx or equivalent

Dependencies:
P11-008, P11-009

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-012

Files created/updated:
- ...

Branch:
phase11/P11-012-admin-dashboard-home

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-013

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-013 only.

Task:
Create Admin Users API

Branch:
phase11/P11-013-admin-users-api

Priority:
P0

Description:
Add backend admin endpoints for listing, searching, filtering, reading, and updating safe user admin fields.

Goal:
Enable secure user administration.

Expected output:
Backend admin users API

Dependencies:
P2 users/roles outputs, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every admin endpoint with permission guards.
- Do not trust client-submitted roles, permissions, scores, progress, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-013

Files created/updated:
- ...

Branch:
phase11/P11-013-admin-users-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-014

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-014 only.

Task:
Add Admin Users API Tests

Branch:
phase11/P11-014-admin-users-tests

Priority:
P0

Description:
Test permissions, filtering, safe updates, and forbidden access.

Goal:
Verify user admin API security.

Expected output:
Backend tests for admin users API

Dependencies:
P11-013

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Protect every admin endpoint with permission guards.
- Do not trust client-submitted roles, permissions, scores, progress, AIM outputs, or privileged state.
- Validate DTOs and return safe errors.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-014

Files created/updated:
- ...

Branch:
phase11/P11-014-admin-users-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-015

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-015 only.

Task:
Create Admin Users List UI

Branch:
phase11/P11-015-admin-users-list-ui

Priority:
P0

Description:
Build user list with search, filters, pagination, role/status badges using AIM design system.

Goal:
Allow admins to inspect users.

Expected output:
Admin users list page

Dependencies:
P11-009, P11-010, P11-013

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-015

Files created/updated:
- ...

Branch:
phase11/P11-015-admin-users-list-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-016

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-016 only.

Task:
Create Admin User Detail UI

Branch:
phase11/P11-016-admin-user-detail-ui

Priority:
P0

Description:
Build user detail page showing profile, role, status, safe metadata, and linked student profile.

Goal:
Allow admins to inspect one user safely.

Expected output:
Admin user detail page

Dependencies:
P11-015

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-016

Files created/updated:
- ...

Branch:
phase11/P11-016-admin-user-detail-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-017

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-017 only.

Task:
Create Admin User Status Actions

Branch:
phase11/P11-017-admin-user-status-actions

Priority:
P1

Description:
Add safe suspend/activate/admin-state actions with confirmation dialogs and audit metadata.

Goal:
Allow controlled user status management.

Expected output:
Admin user status actions UI/API wiring

Dependencies:
P11-013, P11-016

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-017

Files created/updated:
- ...

Branch:
phase11/P11-017-admin-user-status-actions

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-018

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-018 only.

Task:
Create Roles and Permissions UI

Branch:
phase11/P11-018-admin-roles-permissions-ui

Priority:
P0

Description:
Build read/manage UI for roles and permissions based on existing backend rules.

Goal:
Allow admins to inspect and manage roles safely.

Expected output:
Admin roles/permissions pages

Dependencies:
P2 roles/permissions outputs, P11-009, P11-010

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-018

Files created/updated:
- ...

Branch:
phase11/P11-018-admin-roles-permissions-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-019

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-019 only.

Task:
Create Users/Roles Permission Review

Branch:
phase11/P11-019-admin-users-permission-review

Priority:
P0

Description:
Review user and role management authorization paths.

Goal:
Confirm no admin privilege escalation exists.

Expected output:
docs/quality/phase-11-users-roles-permission-review.md

Dependencies:
P11-014, P11-018

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-019

Files created/updated:
- ...

Branch:
phase11/P11-019-admin-users-permission-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-020

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-020 only.

Task:
Review Curriculum Admin APIs

Branch:
phase11/P11-020-admin-curriculum-api-review

Priority:
P0

Description:
Verify existing curriculum admin APIs cover courses, chapters, lessons, content blocks, publishing, and skills.

Goal:
Identify missing backend endpoints before UI work.

Expected output:
docs/quality/phase-11-curriculum-admin-api-review.md

Dependencies:
P3 curriculum outputs, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-020

Files created/updated:
- ...

Branch:
phase11/P11-020-admin-curriculum-api-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-021

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-021 only.

Task:
Create Admin Courses List UI

Branch:
phase11/P11-021-admin-courses-list-ui

Priority:
P0

Description:
Build courses list with search, filters, status badges, and actions using AIM design system.

Goal:
Allow admins to manage courses.

Expected output:
Admin courses list page

Dependencies:
P11-020, P11-009, P11-010

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-021

Files created/updated:
- ...

Branch:
phase11/P11-021-admin-courses-list-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-022

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-022 only.

Task:
Create Admin Course Editor UI

Branch:
phase11/P11-022-admin-course-editor-ui

Priority:
P0

Description:
Build create/edit course UI using validated forms and design system controls.

Goal:
Allow controlled course editing.

Expected output:
Admin course editor page/form

Dependencies:
P11-021

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-022

Files created/updated:
- ...

Branch:
phase11/P11-022-admin-course-editor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-023

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-023 only.

Task:
Create Admin Chapters UI

Branch:
phase11/P11-023-admin-chapters-ui

Priority:
P0

Description:
Build chapter list/editor nested under courses using AIM design system.

Goal:
Allow admins to manage chapters.

Expected output:
Admin chapters UI

Dependencies:
P11-022

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-023

Files created/updated:
- ...

Branch:
phase11/P11-023-admin-chapters-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-024

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-024 only.

Task:
Create Admin Lessons List UI

Branch:
phase11/P11-024-admin-lessons-list-ui

Priority:
P0

Description:
Build lesson list with status, skill links, filters, and publish state indicators.

Goal:
Allow admins to manage lessons.

Expected output:
Admin lessons list UI

Dependencies:
P11-023

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-024

Files created/updated:
- ...

Branch:
phase11/P11-024-admin-lessons-list-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-025

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-025 only.

Task:
Create Admin Lesson Editor UI

Branch:
phase11/P11-025-admin-lesson-editor-ui

Priority:
P0

Description:
Build lesson editor for metadata/content references using AIM design system.

Goal:
Allow safe lesson editing.

Expected output:
Admin lesson editor UI

Dependencies:
P11-024

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-025

Files created/updated:
- ...

Branch:
phase11/P11-025-admin-lesson-editor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-026

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-026 only.

Task:
Create Lesson Content Blocks UI

Branch:
phase11/P11-026-admin-lesson-content-blocks-ui

Priority:
P1

Description:
Build UI to manage lesson content blocks and ordering.

Goal:
Allow content managers to edit lesson content.

Expected output:
Admin lesson content blocks UI

Dependencies:
P11-025

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-026

Files created/updated:
- ...

Branch:
phase11/P11-026-admin-lesson-content-blocks-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-027

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-027 only.

Task:
Create Admin Skills Management UI

Branch:
phase11/P11-027-admin-skills-management-ui

Priority:
P0

Description:
Build UI for skill taxonomy, skill links, and lesson-skill mapping using AIM design system.

Goal:
Allow content managers to maintain skills without placeholders.

Expected output:
Admin skills management UI

Dependencies:
P3 skills outputs, P11-009, P11-010

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-027

Files created/updated:
- ...

Branch:
phase11/P11-027-admin-skills-management-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-028

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-028 only.

Task:
Create Publishing Workflow UI

Branch:
phase11/P11-028-admin-publishing-workflow-ui

Priority:
P0

Description:
Build draft/published indicators, publish/unpublish controls, and guardrail messages.

Goal:
Allow controlled content publishing.

Expected output:
Admin publishing workflow UI

Dependencies:
P11-024, P11-025

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-028

Files created/updated:
- ...

Branch:
phase11/P11-028-admin-publishing-workflow-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-029

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-029 only.

Task:
Add Curriculum Admin UI Tests

Branch:
phase11/P11-029-admin-curriculum-ui-tests

Priority:
P1

Description:
Test course/chapter/lesson/skills pages and design system usage.

Goal:
Verify curriculum admin UI behavior.

Expected output:
Admin curriculum UI tests

Dependencies:
P11-021..P11-028

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-029

Files created/updated:
- ...

Branch:
phase11/P11-029-admin-curriculum-ui-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-030

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-030 only.

Task:
Create Curriculum Admin Completeness Review

Branch:
phase11/P11-030-admin-curriculum-completeness-review

Priority:
P0

Description:
Verify all curriculum admin outputs exist and replace placeholders.

Goal:
Approve or block curriculum admin readiness.

Expected output:
docs/quality/phase-11-curriculum-admin-completeness-review.md

Dependencies:
P11-029

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-030

Files created/updated:
- ...

Branch:
phase11/P11-030-admin-curriculum-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-031

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-031 only.

Task:
Review Question Bank Admin APIs

Branch:
phase11/P11-031-admin-question-bank-api-review

Priority:
P0

Description:
Verify APIs for question listing, filtering, creation, editing, choices, skills, and validation.

Goal:
Prepare question bank UI safely.

Expected output:
docs/quality/phase-11-question-bank-api-review.md

Dependencies:
P3 question bank outputs, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-031

Files created/updated:
- ...

Branch:
phase11/P11-031-admin-question-bank-api-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-032

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-032 only.

Task:
Create Question Bank List UI

Branch:
phase11/P11-032-admin-question-bank-list-ui

Priority:
P0

Description:
Build question list with type, skill, difficulty, status, and filters using AIM design system.

Goal:
Allow admins to inspect questions.

Expected output:
Admin question bank list page

Dependencies:
P11-031, P11-009, P11-010

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-032

Files created/updated:
- ...

Branch:
phase11/P11-032-admin-question-bank-list-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-033

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-033 only.

Task:
Create Question Editor UI

Branch:
phase11/P11-033-admin-question-editor-ui

Priority:
P0

Description:
Build create/edit question form for supported question types and choices.

Goal:
Allow safe question authoring.

Expected output:
Admin question editor UI

Dependencies:
P11-032

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-033

Files created/updated:
- ...

Branch:
phase11/P11-033-admin-question-editor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-034

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-034 only.

Task:
Create Question Validation UI

Branch:
phase11/P11-034-admin-question-validation-ui

Priority:
P1

Description:
Show validation errors for missing answers, malformed choices, missing skills, and invalid difficulty.

Goal:
Prevent invalid question authoring.

Expected output:
Question validation UI

Dependencies:
P11-033

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-034

Files created/updated:
- ...

Branch:
phase11/P11-034-admin-question-validation-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-035

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-035 only.

Task:
Create Question Preview UI

Branch:
phase11/P11-035-admin-question-preview-ui

Priority:
P1

Description:
Build read-only student-like preview for questions using AIM design system.

Goal:
Help content managers verify questions.

Expected output:
Question preview UI

Dependencies:
P11-033

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-035

Files created/updated:
- ...

Branch:
phase11/P11-035-admin-question-preview-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-036

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-036 only.

Task:
Add Question Bank Admin Tests

Branch:
phase11/P11-036-admin-question-bank-tests

Priority:
P1

Description:
Test list/editor/validation/preview behavior and API permissions.

Goal:
Verify question bank admin reliability.

Expected output:
Admin question bank tests

Dependencies:
P11-032..P11-035

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-036

Files created/updated:
- ...

Branch:
phase11/P11-036-admin-question-bank-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-037

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-037 only.

Task:
Review Assessment Admin APIs

Branch:
phase11/P11-037-admin-assessments-api-review

Priority:
P0

Description:
Verify Phase 10 APIs support admin assessment management or identify missing endpoints.

Goal:
Prepare admin quizzes/exams UI.

Expected output:
docs/quality/phase-11-assessment-admin-api-review.md

Dependencies:
P10-076, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-037

Files created/updated:
- ...

Branch:
phase11/P11-037-admin-assessments-api-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-038

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-038 only.

Task:
Create Assessments List UI

Branch:
phase11/P11-038-admin-assessments-list-ui

Priority:
P0

Description:
Build quiz/exam list with filters, status, deadline indicators, and actions using AIM design system.

Goal:
Allow admins to inspect assessments.

Expected output:
Admin assessments list page

Dependencies:
P11-037, P11-009, P11-010

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-038

Files created/updated:
- ...

Branch:
phase11/P11-038-admin-assessments-list-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-039

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-039 only.

Task:
Create Assessment Editor UI

Branch:
phase11/P11-039-admin-assessment-editor-ui

Priority:
P0

Description:
Build assessment create/edit form for quiz/exam metadata and settings.

Goal:
Allow admins to manage assessments.

Expected output:
Admin assessment editor UI

Dependencies:
P11-038

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-039

Files created/updated:
- ...

Branch:
phase11/P11-039-admin-assessment-editor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-040

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-040 only.

Task:
Create Assessment Question Builder UI

Branch:
phase11/P11-040-admin-assessment-question-builder-ui

Priority:
P0

Description:
Build UI to attach/reorder questions from question bank.

Goal:
Allow admins to assemble quizzes/exams.

Expected output:
Assessment question builder UI

Dependencies:
P11-039, P11-032

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-040

Files created/updated:
- ...

Branch:
phase11/P11-040-admin-assessment-question-builder-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-041

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-041 only.

Task:
Create Assessment Settings UI

Branch:
phase11/P11-041-admin-assessment-settings-ui

Priority:
P0

Description:
Build settings UI for duration, attempts, randomization, visibility, and grading policy.

Goal:
Allow safe assessment behavior configuration.

Expected output:
Assessment settings UI

Dependencies:
P11-039

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-041

Files created/updated:
- ...

Branch:
phase11/P11-041-admin-assessment-settings-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-042

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-042 only.

Task:
Create Deadline Management UI

Branch:
phase11/P11-042-admin-deadline-management-ui

Priority:
P0

Description:
Build deadline/open-close window UI for assessments using AIM design system.

Goal:
Allow admins to manage deadlines.

Expected output:
Deadline management UI

Dependencies:
P10 deadline outputs, P11-038

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-042

Files created/updated:
- ...

Branch:
phase11/P11-042-admin-deadline-management-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-043

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-043 only.

Task:
Create Assessment Publishing UI

Branch:
phase11/P11-043-admin-assessment-publishing-ui

Priority:
P0

Description:
Build publish/unpublish/archive states and safe confirmation dialogs.

Goal:
Control quiz/exam availability.

Expected output:
Assessment publishing UI

Dependencies:
P11-039, P11-042

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-043

Files created/updated:
- ...

Branch:
phase11/P11-043-admin-assessment-publishing-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-044

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-044 only.

Task:
Create Assessment Preview UI

Branch:
phase11/P11-044-admin-assessment-preview-ui

Priority:
P1

Description:
Build read-only preview of quiz/exam as student would see it without answer leakage.

Goal:
Help admins validate assessment before publishing.

Expected output:
Assessment preview UI

Dependencies:
P11-040, P11-041

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-044

Files created/updated:
- ...

Branch:
phase11/P11-044-admin-assessment-preview-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-045

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-045 only.

Task:
Create Assessment Results UI

Branch:
phase11/P11-045-admin-assessment-results-ui

Priority:
P1

Description:
Build admin results list/detail for attempts and backend-approved scores.

Goal:
Allow admins to inspect assessment performance safely.

Expected output:
Assessment results UI

Dependencies:
P10 results APIs, P11-038

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-045

Files created/updated:
- ...

Branch:
phase11/P11-045-admin-assessment-results-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-046

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-046 only.

Task:
Add Assessment Admin UI Tests

Branch:
phase11/P11-046-admin-assessment-tests

Priority:
P1

Description:
Test assessment list/editor/question builder/settings/deadlines/results pages.

Goal:
Verify assessment admin UI behavior.

Expected output:
Admin assessment UI tests

Dependencies:
P11-038..P11-045

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-046

Files created/updated:
- ...

Branch:
phase11/P11-046-admin-assessment-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-047

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-047 only.

Task:
Create Assessment Admin Authority Review

Branch:
phase11/P11-047-admin-assessment-no-client-authority-review

Priority:
P0

Description:
Prove admin UI does not grade or calculate authoritative results client-side.

Goal:
Preserve Phase 10 backend authority.

Expected output:
docs/quality/phase-11-assessment-admin-authority-review.md

Dependencies:
P11-046

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-047

Files created/updated:
- ...

Branch:
phase11/P11-047-admin-assessment-no-client-authority-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-048

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-048 only.

Task:
Review Placement Admin APIs

Branch:
phase11/P11-048-admin-placement-api-review

Priority:
P1

Description:
Verify admin APIs for placement question/attempt/result inspection and configuration readiness.

Goal:
Prepare admin placement workflows.

Expected output:
docs/quality/phase-11-placement-admin-api-review.md

Dependencies:
P4 placement outputs, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-048

Files created/updated:
- ...

Branch:
phase11/P11-048-admin-placement-api-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-049

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-049 only.

Task:
Create Placement Results Admin UI

Branch:
phase11/P11-049-admin-placement-results-ui

Priority:
P1

Description:
Build placement attempts/results inspection page using AIM design system.

Goal:
Allow admins to inspect placement outcomes safely.

Expected output:
Admin placement results UI

Dependencies:
P11-048, P11-009

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-049

Files created/updated:
- ...

Branch:
phase11/P11-049-admin-placement-results-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-050

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-050 only.

Task:
Create Placement Config Readiness Notes

Branch:
phase11/P11-050-admin-placement-config-readiness

Priority:
P2

Description:
Document remaining needs for admin placement configuration if not fully supported.

Goal:
Avoid unsafe scope expansion.

Expected output:
docs/phase-11/placement-config-readiness.md

Dependencies:
P11-049

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-050

Files created/updated:
- ...

Branch:
phase11/P11-050-admin-placement-config-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-051

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-051 only.

Task:
Review Progress/AIM Admin APIs

Branch:
phase11/P11-051-admin-progress-api-review

Priority:
P0

Description:
Verify read-only admin APIs for progress, skills, weaknesses, recommendations, sessions, and AIM audit outputs.

Goal:
Prepare read-only learning analytics views.

Expected output:
docs/quality/phase-11-progress-aim-admin-api-review.md

Dependencies:
P5-086, P6-050, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-051

Files created/updated:
- ...

Branch:
phase11/P11-051-admin-progress-api-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-052

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-052 only.

Task:
Create Student Progress Admin UI

Branch:
phase11/P11-052-admin-student-progress-ui

Priority:
P0

Description:
Build read-only student progress page using backend-approved data and AIM design system.

Goal:
Allow admins to inspect progress safely.

Expected output:
Admin student progress UI

Dependencies:
P11-051, P11-009

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-052

Files created/updated:
- ...

Branch:
phase11/P11-052-admin-student-progress-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-053

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-053 only.

Task:
Create Skill State Admin UI

Branch:
phase11/P11-053-admin-skill-state-ui

Priority:
P0

Description:
Build read-only skill state view for a student.

Goal:
Allow admins to inspect mastery state without editing it.

Expected output:
Admin skill state UI

Dependencies:
P11-052

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-053

Files created/updated:
- ...

Branch:
phase11/P11-053-admin-skill-state-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-054

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-054 only.

Task:
Create Weaknesses and Recommendations Admin UI

Branch:
phase11/P11-054-admin-weaknesses-recommendations-ui

Priority:
P0

Description:
Build read-only weakness/recommendation display using backend-approved AIM outputs.

Goal:
Allow admins to inspect AIM outcomes safely.

Expected output:
Admin weakness/recommendation UI

Dependencies:
P11-052

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-054

Files created/updated:
- ...

Branch:
phase11/P11-054-admin-weaknesses-recommendations-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-055

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-055 only.

Task:
Create Session Summary Admin UI

Branch:
phase11/P11-055-admin-session-summary-ui

Priority:
P1

Description:
Build read-only session summary/history UI.

Goal:
Allow admins to inspect learning sessions safely.

Expected output:
Admin session summary UI

Dependencies:
P11-052

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-055

Files created/updated:
- ...

Branch:
phase11/P11-055-admin-session-summary-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-056

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-056 only.

Task:
Create AIM Audit Log Admin UI

Branch:
phase11/P11-056-admin-aim-audit-log-ui

Priority:
P1

Description:
Build read-only AIM audit log viewer with safe metadata only.

Goal:
Allow admins to inspect AIM pipeline events safely.

Expected output:
Admin AIM audit log UI

Dependencies:
P5 audit outputs, P11-051

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-056

Files created/updated:
- ...

Branch:
phase11/P11-056-admin-aim-audit-log-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-057

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-057 only.

Task:
Add Admin Progress No-Authority Tests

Branch:
phase11/P11-057-admin-progress-no-authority-tests

Priority:
P0

Description:
Ensure admin UI cannot mutate skill states, weaknesses, recommendations, or AIM outputs.

Goal:
Preserve backend/AIM authority.

Expected output:
Admin progress authority tests

Dependencies:
P11-052..P11-056

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-057

Files created/updated:
- ...

Branch:
phase11/P11-057-admin-progress-no-authority-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-058

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-058 only.

Task:
Create Admin Reports Scope Document

Branch:
phase11/P11-058-admin-reports-scope-doc

Priority:
P1

Description:
Define limited Phase 11 admin reporting scope and what remains for Phase 15 analytics.

Goal:
Prevent full analytics dashboard scope creep.

Expected output:
docs/phase-11/admin-reports-scope.md

Dependencies:
P11-001

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-058

Files created/updated:
- ...

Branch:
phase11/P11-058-admin-reports-scope-doc

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-059

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-059 only.

Task:
Create Basic Admin Reports UI

Branch:
phase11/P11-059-admin-basic-reports-ui

Priority:
P1

Description:
Build simple backend-approved counts/cards for users, courses, assessments, attempts, and content status.

Goal:
Provide basic operational reporting.

Expected output:
Admin basic reports UI

Dependencies:
P11-058, P11-009

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-059

Files created/updated:
- ...

Branch:
phase11/P11-059-admin-basic-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-060

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-060 only.

Task:
Create Admin Export Readiness Notes

Branch:
phase11/P11-060-admin-export-readiness-doc

Priority:
P2

Description:
Document safe export needs and restrictions without implementing broad export system.

Goal:
Prepare future reporting/export work.

Expected output:
docs/phase-11/admin-export-readiness.md

Dependencies:
P11-059

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-060

Files created/updated:
- ...

Branch:
phase11/P11-060-admin-export-readiness-doc

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-061

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-061 only.

Task:
Review Admin Activity Logs API

Branch:
phase11/P11-061-admin-activity-logs-api-review

Priority:
P1

Description:
Verify APIs for safe admin activity/audit logs.

Goal:
Prepare audit UI.

Expected output:
docs/quality/phase-11-admin-activity-logs-api-review.md

Dependencies:
P2/P3/P5/P10 audit outputs, P11-005

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-061

Files created/updated:
- ...

Branch:
phase11/P11-061-admin-activity-logs-api-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-062

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-062 only.

Task:
Create Admin Activity Logs UI

Branch:
phase11/P11-062-admin-activity-logs-ui

Priority:
P1

Description:
Build activity/audit log table with filters and safe metadata display.

Goal:
Allow admins to inspect platform operations.

Expected output:
Admin activity logs UI

Dependencies:
P11-061, P11-009

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-062

Files created/updated:
- ...

Branch:
phase11/P11-062-admin-activity-logs-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-063

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-063 only.

Task:
Create Admin Audit Log Safety Review

Branch:
phase11/P11-063-admin-audit-log-safety-review

Priority:
P0

Description:
Verify logs do not expose secrets or sensitive payloads.

Goal:
Protect sensitive data.

Expected output:
docs/quality/phase-11-admin-audit-log-safety-review.md

Dependencies:
P11-062

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-063

Files created/updated:
- ...

Branch:
phase11/P11-063-admin-audit-log-safety-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-064

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-064 only.

Task:
Create Admin Notifications Readiness Notes

Branch:
phase11/P11-064-admin-notifications-readiness-doc

Priority:
P2

Description:
Document future notification management needs for Phase 13 without implementing them.

Goal:
Prepare Phase 13.

Expected output:
docs/phase-13/admin-notifications-readiness.md

Dependencies:
P11-001

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-064

Files created/updated:
- ...

Branch:
phase11/P11-064-admin-notifications-readiness-doc

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-065

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-065 only.

Task:
Create Admin Billing Readiness Notes

Branch:
phase11/P11-065-admin-billing-readiness-doc

Priority:
P2

Description:
Document future payment/billing admin needs for Phase 14 without implementation.

Goal:
Prepare Phase 14 and prevent payment scope creep.

Expected output:
docs/phase-14/admin-billing-readiness.md

Dependencies:
P11-001

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-065

Files created/updated:
- ...

Branch:
phase11/P11-065-admin-billing-readiness-doc

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-066

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-066 only.

Task:
Create Admin Responsive and RTL Review

Branch:
phase11/P11-066-admin-responsive-rtl-review

Priority:
P1

Description:
Review admin UI responsiveness, Arabic/RTL readiness, and design system consistency.

Goal:
Ensure admin UI meets design requirements.

Expected output:
docs/quality/phase-11-admin-responsive-rtl-review.md

Dependencies:
P11-008..P11-062

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-066

Files created/updated:
- ...

Branch:
phase11/P11-066-admin-responsive-rtl-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-067

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-067 only.

Task:
Create Admin Accessibility Review

Branch:
phase11/P11-067-admin-accessibility-review

Priority:
P1

Description:
Review keyboard, contrast, labels, tables, dialogs, and form accessibility.

Goal:
Improve admin usability.

Expected output:
docs/quality/phase-11-admin-accessibility-review.md

Dependencies:
P11-008..P11-062

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-067

Files created/updated:
- ...

Branch:
phase11/P11-067-admin-accessibility-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-068

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-068 only.

Task:
Create Admin Design System Compliance Review

Branch:
phase11/P11-068-admin-design-system-compliance-review

Priority:
P0

Description:
Verify all UI tasks follow AIM design system contracts and components.

Goal:
Prevent inconsistent UI.

Expected output:
docs/quality/phase-11-admin-design-system-compliance-review.md

Dependencies:
P11-066, P11-067, DES-001

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-068

Files created/updated:
- ...

Branch:
phase11/P11-068-admin-design-system-compliance-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-069

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-069 only.

Task:
Create Phase 11 Admin Security Review

Branch:
phase11/P11-069-admin-security-review

Priority:
P0

Description:
Review route protection, permissions, API access, secrets, logs, and no-client-authority risks.

Goal:
Validate admin security readiness.

Expected output:
docs/quality/phase-11-admin-security-review.md

Dependencies:
P11-019, P11-047, P11-057, P11-063

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-069

Files created/updated:
- ...

Branch:
phase11/P11-069-admin-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-070

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-070 only.

Task:
Create Phase 11 Admin Architecture Review

Branch:
phase11/P11-070-admin-architecture-review

Priority:
P0

Description:
Review backend/admin-dashboard architecture, feature boundaries, API usage, and maintainability.

Goal:
Validate architecture readiness.

Expected output:
docs/quality/phase-11-admin-architecture-review.md

Dependencies:
P11-068, P11-069

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-070

Files created/updated:
- ...

Branch:
phase11/P11-070-admin-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-071

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-071 only.

Task:
Create Admin User Management E2E Check

Branch:
phase11/P11-071-admin-e2e-user-management

Priority:
P1

Description:
Document or implement E2E check for user list/detail/status/roles flow.

Goal:
Validate user management flow.

Expected output:
docs/quality/phase-11-admin-user-management-e2e-check.md

Dependencies:
P11-015..P11-019

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-071

Files created/updated:
- ...

Branch:
phase11/P11-071-admin-e2e-user-management

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-072

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-072 only.

Task:
Create Admin Curriculum E2E Check

Branch:
phase11/P11-072-admin-e2e-curriculum

Priority:
P1

Description:
Document or implement E2E check for courses/chapters/lessons/skills/publishing flow.

Goal:
Validate curriculum management flow.

Expected output:
docs/quality/phase-11-admin-curriculum-e2e-check.md

Dependencies:
P11-021..P11-030

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-072

Files created/updated:
- ...

Branch:
phase11/P11-072-admin-e2e-curriculum

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-073

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-073 only.

Task:
Create Admin Assessments E2E Check

Branch:
phase11/P11-073-admin-e2e-assessments

Priority:
P1

Description:
Document or implement E2E check for quizzes/exams/deadlines/results flow.

Goal:
Validate assessment management flow.

Expected output:
docs/quality/phase-11-admin-assessments-e2e-check.md

Dependencies:
P11-038..P11-047

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-073

Files created/updated:
- ...

Branch:
phase11/P11-073-admin-e2e-assessments

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-074

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-074 only.

Task:
Create Admin Progress Read-Only E2E Check

Branch:
phase11/P11-074-admin-e2e-progress-readonly

Priority:
P1

Description:
Document or implement E2E check for student progress/AIM read-only inspection.

Goal:
Validate no-authority progress display.

Expected output:
docs/quality/phase-11-admin-progress-readonly-e2e-check.md

Dependencies:
P11-052..P11-057

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-074

Files created/updated:
- ...

Branch:
phase11/P11-074-admin-e2e-progress-readonly

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-075

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-075 only.

Task:
Create Phase 11 Output Completeness Review

Branch:
phase11/P11-075-output-completeness-review

Priority:
P0

Description:
Verify every Phase 11 expected output exists and meets scope/design/authority rules.

Goal:
Approve or block Phase 11 completion.

Expected output:
docs/quality/phase-11-output-completeness-review.md

Dependencies:
P11-069..P11-074

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-075

Files created/updated:
- ...

Branch:
phase11/P11-075-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-076

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-076 only.

Task:
Create Phase 12 Readiness Checklist

Branch:
phase11/P11-076-phase-12-readiness-checklist

Priority:
P1

Description:
Document parent dashboard readiness items and safe dependencies from admin outputs.

Goal:
Prepare Phase 12 without building it now.

Expected output:
docs/phase-12/readiness-from-phase-11.md

Dependencies:
P11-075

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-076

Files created/updated:
- ...

Branch:
phase11/P11-076-phase-12-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P11-077

You are an AI coding/documentation agent working on AIM Platform Phase 11 — Admin Dashboard.

Work on task P11-077 only.

Task:
Create Phase 11 Final Review and Handoff

Branch:
phase11/P11-077-phase-11-final-review

Priority:
P0

Description:
Summarize implementation, outputs, risks, checks, limitations, and next steps.

Goal:
Close Phase 11.

Expected output:
docs/phase-11/final-review.md

Dependencies:
P11-076

Required workflow:
1. Open the Phase 11 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P11-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority Rules:
- Admin UI must not calculate mastery, weakness, placement score, assessment score, correctness, recommendations, review schedule, or AIM decisions.
- Backend remains final authority for identity, permissions, curriculum publishing, assessment grading, progress, and AIM outputs.
- Admin UI may display backend-approved data and send admin actions only through protected backend APIs.

Scope limits:
- Do not work on Parent Dashboard, Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, or Student Web App.
- Do not implement Phase 12/13/14/15 features except readiness documentation when this task explicitly asks for it.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Admin permissions are preserved.
- No client-side authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P11-077

Files created/updated:
- ...

Branch:
phase11/P11-077-phase-11-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Admin validation:
- Admin permission protection preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authority added: yes/no/not applicable
- Backend APIs used safely: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
