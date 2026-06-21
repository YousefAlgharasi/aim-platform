# AIM Phase 17 Task Prompts

Phase 17: Post-Launch Operations, Support, Feedback, and Continuous Improvement

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion Database:
https://app.notion.com/p/383af08baaf6805aac38c79312eecd82?v=1e6ce2ac89504365b5c4928a9b10ad41

## Global Phase 17 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All support/operations/status UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Backend/admin permissions own support ticket state, feedback triage, incident state, maintenance state, release note publishing, feature flag rollout, and audit logs.
- UI may display backend-approved operational data and send allowed actions through protected backend APIs only.
- UI must not decide admin-only operational state, incident status, maintenance status, feature flag rollout, release publishing state, or operational health state.
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
- Client/UI decides admin-only operations authority.
- Support/feedback APIs expose private user/child/parent data without permission.
- Feature flags, maintenance, release notes, or incidents can be changed without admin permissions.
- AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, or Admin Dashboard expansion outside operations appears outside explicit readiness documentation.

---

#P17-001

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-001 only.

Task:
Create Phase 17 Post-Launch Operations Charter

Branch:
phase17/P17-001-post-launch-operations-charter

Priority:
P0

Description:
Define Phase 17 scope, exclusions, post-launch ownership, support boundaries, maintenance rules, and dependencies.

Goal:
Lock Phase 17 to post-launch operations, support, feedback, maintenance, and controlled improvement workflows.

Expected output:
docs/phase-17/post-launch-operations-charter.md

Dependencies:
P16-080

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-001

Files created/updated:
- ...

Branch:
phase17/P17-001-post-launch-operations-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-002

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-002 only.

Task:
Create Post-Launch Domain Map

Branch:
phase17/P17-002-post-launch-domain-map

Priority:
P0

Description:
Document incidents, support tickets, feedback, feature requests, maintenance windows, release notes, operational status, and audit entities.

Goal:
Establish post-launch operations domain before implementation.

Expected output:
docs/phase-17/post-launch-domain-map.md

Dependencies:
P17-001

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-002

Files created/updated:
- ...

Branch:
phase17/P17-002-post-launch-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-003

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-003 only.

Task:
Create Operations Authority Rules

Branch:
phase17/P17-003-operations-authority-rules

Priority:
P0

Description:
Define backend/admin authority for support status, maintenance state, feature flags, incident state, and release communications.

Goal:
Prevent client-side operational authority.

Expected output:
docs/phase-17/operations-authority-rules.md

Dependencies:
P17-001

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-003

Files created/updated:
- ...

Branch:
phase17/P17-003-operations-authority-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-004

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-004 only.

Task:
Create Support Policy

Branch:
phase17/P17-004-support-policy

Priority:
P0

Description:
Define support channels, ticket categories, severity, response expectations, escalation rules, and privacy limits.

Goal:
Standardize post-launch support workflow.

Expected output:
docs/support/phase-17-support-policy.md

Dependencies:
P17-001

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-004

Files created/updated:
- ...

Branch:
phase17/P17-004-support-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-005

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-005 only.

Task:
Create Feedback and Feature Request Policy

Branch:
phase17/P17-005-feedback-policy

Priority:
P0

Description:
Define how feedback, bug reports, feature requests, prioritization, and triage are handled.

Goal:
Create controlled product iteration workflow.

Expected output:
docs/support/phase-17-feedback-feature-request-policy.md

Dependencies:
P17-001

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-005

Files created/updated:
- ...

Branch:
phase17/P17-005-feedback-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-006

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-006 only.

Task:
Create Maintenance Policy

Branch:
phase17/P17-006-maintenance-policy

Priority:
P0

Description:
Define planned maintenance, emergency maintenance, downtime notices, rollback, and user communication rules.

Goal:
Control maintenance safely.

Expected output:
docs/ops/phase-17-maintenance-policy.md

Dependencies:
P17-001

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-006

Files created/updated:
- ...

Branch:
phase17/P17-006-maintenance-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-007

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-007 only.

Task:
Create Post-Launch KPI Map

Branch:
phase17/P17-007-post-launch-kpi-map

Priority:
P1

Description:
Define operational KPIs, support KPIs, incident KPIs, reliability KPIs, product feedback KPIs, and adoption KPIs.

Goal:
Track post-launch health consistently.

Expected output:
docs/phase-17/post-launch-kpi-map.md

Dependencies:
P17-002, P15-083

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-007

Files created/updated:
- ...

Branch:
phase17/P17-007-post-launch-kpi-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-008

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-008 only.

Task:
Create Operations UI Design System Rules

Branch:
phase17/P17-008-ops-ui-design-system-rules

Priority:
P0

Description:
Document how all operations/support/status UI must follow the approved AIM design system.

Goal:
Prevent one-off styling in post-launch UI.

Expected output:
docs/phase-17/operations-ui-design-system-rules.md

Dependencies:
P17-001, DES-001

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-008

Files created/updated:
- ...

Branch:
phase17/P17-008-ops-ui-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-009

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-009 only.

Task:
Create Post-Launch API Contract Map

Branch:
phase17/P17-009-post-launch-api-contract-map

Priority:
P0

Description:
Document backend APIs required by student/parent/admin support and operations UI.

Goal:
Align post-launch APIs with UI implementation.

Expected output:
docs/phase-17/post-launch-api-contract-map.md

Dependencies:
P17-002

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-009

Files created/updated:
- ...

Branch:
phase17/P17-009-post-launch-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-010

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-010 only.

Task:
Create Post-Launch UI Flow Map

Branch:
phase17/P17-010-post-launch-ui-flow-map

Priority:
P1

Description:
Document help, support tickets, feedback, status, release notes, and admin operations flows.

Goal:
Guide post-launch UI with design-system consistency.

Expected output:
docs/phase-17/post-launch-ui-flow-map.md

Dependencies:
P17-009

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-010

Files created/updated:
- ...

Branch:
phase17/P17-010-post-launch-ui-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-011

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-011 only.

Task:
Create Support Tickets Migration

Branch:
phase17/P17-011-support-tickets-migration

Priority:
P0

Description:
Add table for support tickets, requester, category, severity, status, assigned owner, and safe metadata.

Goal:
Store support requests safely.

Expected output:
Migration for support_tickets

Dependencies:
P17-002

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-011

Files created/updated:
- ...

Branch:
phase17/P17-011-support-tickets-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-012

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-012 only.

Task:
Create Support Ticket Comments Migration

Branch:
phase17/P17-012-support-ticket-comments-migration

Priority:
P0

Description:
Add table for support ticket comments/messages with visibility and safe metadata.

Goal:
Support support conversation history.

Expected output:
Migration for support_ticket_comments

Dependencies:
P17-011

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-012

Files created/updated:
- ...

Branch:
phase17/P17-012-support-ticket-comments-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-013

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-013 only.

Task:
Create Feedback Migration

Branch:
phase17/P17-013-feedback-migration

Priority:
P0

Description:
Add table for user feedback, rating, category, source surface, status, and safe metadata.

Goal:
Store product feedback safely.

Expected output:
Migration for user_feedback

Dependencies:
P17-005

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-013

Files created/updated:
- ...

Branch:
phase17/P17-013-feedback-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-014

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-014 only.

Task:
Create Feature Requests Migration

Branch:
phase17/P17-014-feature-requests-migration

Priority:
P1

Description:
Add table for feature requests, votes, status, priority, and triage metadata.

Goal:
Track product improvement requests.

Expected output:
Migration for feature_requests

Dependencies:
P17-005

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-014

Files created/updated:
- ...

Branch:
phase17/P17-014-feature-requests-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-015

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-015 only.

Task:
Create Incident Records Migration

Branch:
phase17/P17-015-incident-records-migration

Priority:
P0

Description:
Add table for incidents, severity, status, impact, start/end times, owner, and postmortem link.

Goal:
Track production incidents.

Expected output:
Migration for incident_records

Dependencies:
P17-002

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-015

Files created/updated:
- ...

Branch:
phase17/P17-015-incident-records-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-016

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-016 only.

Task:
Create Maintenance Windows Migration

Branch:
phase17/P17-016-maintenance-windows-migration

Priority:
P1

Description:
Add table for planned/emergency maintenance windows, status, affected services, and user message metadata.

Goal:
Track maintenance events.

Expected output:
Migration for maintenance_windows

Dependencies:
P17-006

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-016

Files created/updated:
- ...

Branch:
phase17/P17-016-maintenance-windows-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-017

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-017 only.

Task:
Create Release Notes Migration

Branch:
phase17/P17-017-release-notes-migration

Priority:
P1

Description:
Add table for release notes, version, audience, status, published date, and safe content.

Goal:
Track release communication.

Expected output:
Migration for release_notes

Dependencies:
P17-002

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-017

Files created/updated:
- ...

Branch:
phase17/P17-017-release-notes-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-018

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-018 only.

Task:
Create Operational Status Migration

Branch:
phase17/P17-018-operational-status-migration

Priority:
P1

Description:
Add table for service status snapshots and component health states.

Goal:
Support status visibility.

Expected output:
Migration for operational_status

Dependencies:
P17-002

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-018

Files created/updated:
- ...

Branch:
phase17/P17-018-operational-status-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-019

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-019 only.

Task:
Create Feature Flags Migration

Branch:
phase17/P17-019-feature-flags-migration

Priority:
P1

Description:
Add table for safe feature flags, rollout state, audience, owner, and audit metadata.

Goal:
Support controlled post-launch rollout.

Expected output:
Migration for feature_flags

Dependencies:
P17-003

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-019

Files created/updated:
- ...

Branch:
phase17/P17-019-feature-flags-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-020

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-020 only.

Task:
Create Operations Audit Migration

Branch:
phase17/P17-020-ops-audit-migration

Priority:
P1

Description:
Add audit table for support, incidents, maintenance, release notes, feature flags, and admin operations.

Goal:
Provide post-launch traceability.

Expected output:
Migration for operations_audit_logs

Dependencies:
P17-011..P17-019

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-020

Files created/updated:
- ...

Branch:
phase17/P17-020-ops-audit-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-021

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-021 only.

Task:
Add Post-Launch DB Constraints

Branch:
phase17/P17-021-post-launch-db-constraints

Priority:
P0

Description:
Add foreign keys, statuses, indexes, uniqueness, and safe retention metadata.

Goal:
Prevent invalid operations/support state.

Expected output:
Updated post-launch constraints migration

Dependencies:
P17-011..P17-020

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-021

Files created/updated:
- ...

Branch:
phase17/P17-021-post-launch-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-022

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-022 only.

Task:
Add Post-Launch Seed Fixtures

Branch:
phase17/P17-022-post-launch-seed-fixtures

Priority:
P2

Description:
Add safe development fixtures for support categories, status components, and sample release notes.

Goal:
Support local post-launch UI/API testing.

Expected output:
Post-launch seed data/fixtures

Dependencies:
P17-021

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-022

Files created/updated:
- ...

Branch:
phase17/P17-022-post-launch-seed-fixtures

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-023

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-023 only.

Task:
Create Operations Backend Module

Branch:
phase17/P17-023-operations-backend-module

Priority:
P0

Description:
Add backend feature module for post-launch operations and support.

Goal:
Establish post-launch feature boundary.

Expected output:
services/backend-api/src/features/operations/

Dependencies:
P17-021

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-023

Files created/updated:
- ...

Branch:
phase17/P17-023-operations-backend-module

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-024

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-024 only.

Task:
Create Operations DTOs and Entities

Branch:
phase17/P17-024-operations-dtos-entities

Priority:
P0

Description:
Define DTOs/entities for tickets, feedback, feature requests, incidents, maintenance, release notes, status, flags, and audits.

Goal:
Standardize post-launch contracts.

Expected output:
Operations DTO/entity files

Dependencies:
P17-023

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-024

Files created/updated:
- ...

Branch:
phase17/P17-024-operations-dtos-entities

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-025

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-025 only.

Task:
Add Operations Validation Rules

Branch:
phase17/P17-025-operations-validation-rules

Priority:
P0

Description:
Validate ticket categories, severity, statuses, visibility, feedback fields, maintenance windows, and feature flags.

Goal:
Reject invalid post-launch data.

Expected output:
Validation helpers/pipes/tests

Dependencies:
P17-024

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-025

Files created/updated:
- ...

Branch:
phase17/P17-025-operations-validation-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-026

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-026 only.

Task:
Create Operations Repository Layer

Branch:
phase17/P17-026-operations-repository

Priority:
P0

Description:
Add data access for tickets, comments, feedback, incidents, maintenance, release notes, status, flags, and audits.

Goal:
Encapsulate operations persistence.

Expected output:
Operations repository implementation

Dependencies:
P17-024

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-026

Files created/updated:
- ...

Branch:
phase17/P17-026-operations-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-027

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-027 only.

Task:
Create Support Ticket Service

Branch:
phase17/P17-027-support-ticket-service

Priority:
P0

Description:
Add create/read/update/status service for user support tickets.

Goal:
Centralize support ticket authority.

Expected output:
Support ticket service

Dependencies:
P17-011, P17-012, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-027

Files created/updated:
- ...

Branch:
phase17/P17-027-support-ticket-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-028

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-028 only.

Task:
Create Feedback Service

Branch:
phase17/P17-028-feedback-service

Priority:
P0

Description:
Add create/read/triage service for product feedback.

Goal:
Centralize feedback workflow.

Expected output:
Feedback service

Dependencies:
P17-013, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-028

Files created/updated:
- ...

Branch:
phase17/P17-028-feedback-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-029

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-029 only.

Task:
Create Feature Request Service

Branch:
phase17/P17-029-feature-request-service

Priority:
P1

Description:
Add feature request creation, triage, status, and voting logic.

Goal:
Track improvement requests safely.

Expected output:
Feature request service

Dependencies:
P17-014, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-029

Files created/updated:
- ...

Branch:
phase17/P17-029-feature-request-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-030

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-030 only.

Task:
Create Incident Service

Branch:
phase17/P17-030-incident-service

Priority:
P0

Description:
Add incident creation/status/update/postmortem logic for admin operations.

Goal:
Centralize incident records.

Expected output:
Incident service

Dependencies:
P17-015, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-030

Files created/updated:
- ...

Branch:
phase17/P17-030-incident-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-031

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-031 only.

Task:
Create Maintenance Window Service

Branch:
phase17/P17-031-maintenance-service

Priority:
P1

Description:
Add planned/emergency maintenance scheduling and status logic.

Goal:
Centralize maintenance communication.

Expected output:
Maintenance service

Dependencies:
P17-016, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-031

Files created/updated:
- ...

Branch:
phase17/P17-031-maintenance-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-032

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-032 only.

Task:
Create Release Notes Service

Branch:
phase17/P17-032-release-notes-service

Priority:
P1

Description:
Add release notes draft/publish/read service by audience.

Goal:
Centralize release communication.

Expected output:
Release notes service

Dependencies:
P17-017, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-032

Files created/updated:
- ...

Branch:
phase17/P17-032-release-notes-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-033

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-033 only.

Task:
Create Operational Status Service

Branch:
phase17/P17-033-operational-status-service

Priority:
P1

Description:
Add status component read/update service for admins and public status display.

Goal:
Centralize status visibility.

Expected output:
Operational status service

Dependencies:
P17-018, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-033

Files created/updated:
- ...

Branch:
phase17/P17-033-operational-status-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-034

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-034 only.

Task:
Create Feature Flag Service

Branch:
phase17/P17-034-feature-flag-service

Priority:
P1

Description:
Add controlled feature flag read/update/evaluate service.

Goal:
Support safe rollout without client authority.

Expected output:
Feature flag service

Dependencies:
P17-019, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-034

Files created/updated:
- ...

Branch:
phase17/P17-034-feature-flag-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-035

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-035 only.

Task:
Create Operations Audit Service

Branch:
phase17/P17-035-operations-audit-service

Priority:
P1

Description:
Log safe metadata for support, feedback, incident, maintenance, release note, and flag actions.

Goal:
Provide operations traceability.

Expected output:
Operations audit service

Dependencies:
P17-020, P17-026

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-035

Files created/updated:
- ...

Branch:
phase17/P17-035-operations-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-036

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-036 only.

Task:
Add Operations Permission Guards

Branch:
phase17/P17-036-operations-permission-guards

Priority:
P0

Description:
Protect support/admin operations APIs with ownership, role, and permission checks.

Goal:
Prevent unauthorized operations access.

Expected output:
Operations guards/policies/tests

Dependencies:
P17-023, P17-027..P17-035

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-036

Files created/updated:
- ...

Branch:
phase17/P17-036-operations-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-037

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-037 only.

Task:
Create User Support Ticket API

Branch:
phase17/P17-037-user-support-ticket-api

Priority:
P0

Description:
Add endpoints for authenticated users to create/list/read their own tickets and add comments.

Goal:
Enable user support workflow.

Expected output:
User support ticket endpoints

Dependencies:
P17-027, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-037

Files created/updated:
- ...

Branch:
phase17/P17-037-user-support-ticket-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-038

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-038 only.

Task:
Create User Feedback API

Branch:
phase17/P17-038-user-feedback-api

Priority:
P0

Description:
Add endpoints for authenticated users to submit feedback and view their own submissions if allowed.

Goal:
Enable product feedback capture.

Expected output:
User feedback endpoints

Dependencies:
P17-028, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-038

Files created/updated:
- ...

Branch:
phase17/P17-038-user-feedback-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-039

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-039 only.

Task:
Create Feature Request API

Branch:
phase17/P17-039-feature-request-api

Priority:
P1

Description:
Add endpoints for viewing/submitting/voting feature requests if enabled.

Goal:
Enable controlled feature request workflow.

Expected output:
Feature request endpoints

Dependencies:
P17-029, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-039

Files created/updated:
- ...

Branch:
phase17/P17-039-feature-request-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-040

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-040 only.

Task:
Create Release Notes API

Branch:
phase17/P17-040-release-notes-api

Priority:
P1

Description:
Add audience-scoped endpoints for published release notes.

Goal:
Expose safe release notes.

Expected output:
Release notes endpoints

Dependencies:
P17-032, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-040

Files created/updated:
- ...

Branch:
phase17/P17-040-release-notes-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-041

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-041 only.

Task:
Create Operational Status API

Branch:
phase17/P17-041-operational-status-api

Priority:
P1

Description:
Add public/authenticated status endpoints with safe component states.

Goal:
Expose operational status safely.

Expected output:
Operational status endpoints

Dependencies:
P17-033, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-041

Files created/updated:
- ...

Branch:
phase17/P17-041-operational-status-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-042

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-042 only.

Task:
Create Maintenance Window API

Branch:
phase17/P17-042-maintenance-api

Priority:
P1

Description:
Add endpoints for reading active/upcoming maintenance windows.

Goal:
Expose maintenance state safely.

Expected output:
Maintenance endpoints

Dependencies:
P17-031, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-042

Files created/updated:
- ...

Branch:
phase17/P17-042-maintenance-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-043

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-043 only.

Task:
Create Admin Support API

Branch:
phase17/P17-043-admin-support-api

Priority:
P0

Description:
Add admin endpoints for ticket triage, assignment, status, comments, and safe metadata.

Goal:
Enable support operations.

Expected output:
Admin support endpoints

Dependencies:
P17-027, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-043

Files created/updated:
- ...

Branch:
phase17/P17-043-admin-support-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-044

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-044 only.

Task:
Create Admin Incident API

Branch:
phase17/P17-044-admin-incident-api

Priority:
P0

Description:
Add admin endpoints for incident records and postmortem references.

Goal:
Enable incident operations.

Expected output:
Admin incident endpoints

Dependencies:
P17-030, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-044

Files created/updated:
- ...

Branch:
phase17/P17-044-admin-incident-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-045

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-045 only.

Task:
Create Admin Maintenance API

Branch:
phase17/P17-045-admin-maintenance-api

Priority:
P1

Description:
Add admin endpoints for planned/emergency maintenance windows.

Goal:
Enable maintenance operations.

Expected output:
Admin maintenance endpoints

Dependencies:
P17-031, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-045

Files created/updated:
- ...

Branch:
phase17/P17-045-admin-maintenance-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-046

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-046 only.

Task:
Create Admin Release Notes API

Branch:
phase17/P17-046-admin-release-notes-api

Priority:
P1

Description:
Add admin endpoints for drafting, editing, publishing, and archiving release notes.

Goal:
Enable release communication management.

Expected output:
Admin release notes endpoints

Dependencies:
P17-032, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-046

Files created/updated:
- ...

Branch:
phase17/P17-046-admin-release-notes-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-047

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-047 only.

Task:
Create Admin Feature Flags API

Branch:
phase17/P17-047-admin-feature-flags-api

Priority:
P1

Description:
Add admin endpoints for controlled feature flag visibility and rollout state.

Goal:
Enable safe rollout operations.

Expected output:
Admin feature flag endpoints

Dependencies:
P17-034, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-047

Files created/updated:
- ...

Branch:
phase17/P17-047-admin-feature-flags-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-048

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-048 only.

Task:
Create Admin Operations Dashboard API

Branch:
phase17/P17-048-admin-operations-dashboard-api

Priority:
P1

Description:
Add admin endpoint for support, incident, maintenance, status, feedback, and release summary cards.

Goal:
Feed operations dashboard.

Expected output:
Admin operations dashboard endpoint

Dependencies:
P17-027..P17-035, P17-036

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-048

Files created/updated:
- ...

Branch:
phase17/P17-048-admin-operations-dashboard-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-049

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-049 only.

Task:
Document Post-Launch API Contracts

Branch:
phase17/P17-049-post-launch-api-contract-docs

Priority:
P0

Description:
Document support, feedback, status, maintenance, release notes, incidents, flags, and admin operations APIs.

Goal:
Align APIs with UI implementation.

Expected output:
docs/phase-17/post-launch-api-contracts.md

Dependencies:
P17-037..P17-048

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-049

Files created/updated:
- ...

Branch:
phase17/P17-049-post-launch-api-contract-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-050

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-050 only.

Task:
Add Operations Permission Tests

Branch:
phase17/P17-050-operations-permission-tests

Priority:
P0

Description:
Test ownership/role restrictions across support, feedback, incidents, maintenance, release notes, flags, and dashboard APIs.

Goal:
Verify operations access control.

Expected output:
Backend permission tests

Dependencies:
P17-036..P17-048

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-050

Files created/updated:
- ...

Branch:
phase17/P17-050-operations-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-051

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-051 only.

Task:
Add Support Workflow Tests

Branch:
phase17/P17-051-support-workflow-tests

Priority:
P0

Description:
Test ticket create/comment/triage/assign/close and forbidden access cases.

Goal:
Verify support workflow reliability.

Expected output:
Backend support tests

Dependencies:
P17-027, P17-037, P17-043

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-051

Files created/updated:
- ...

Branch:
phase17/P17-051-support-workflow-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-052

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-052 only.

Task:
Add Feedback Workflow Tests

Branch:
phase17/P17-052-feedback-workflow-tests

Priority:
P1

Description:
Test feedback submit/triage/status and feature request flow if enabled.

Goal:
Verify feedback workflow reliability.

Expected output:
Backend feedback tests

Dependencies:
P17-028, P17-029, P17-038, P17-039

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-052

Files created/updated:
- ...

Branch:
phase17/P17-052-feedback-workflow-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-053

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-053 only.

Task:
Add Incident and Maintenance Tests

Branch:
phase17/P17-053-incident-maintenance-tests

Priority:
P1

Description:
Test incident records, maintenance windows, status updates, and safe visibility.

Goal:
Verify operational state management.

Expected output:
Backend incident/maintenance tests

Dependencies:
P17-030, P17-031, P17-041, P17-042, P17-044, P17-045

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-053

Files created/updated:
- ...

Branch:
phase17/P17-053-incident-maintenance-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-054

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-054 only.

Task:
Add Release Notes and Feature Flag Tests

Branch:
phase17/P17-054-release-notes-flag-tests

Priority:
P1

Description:
Test release note publishing and feature flag permission/state behavior.

Goal:
Verify safe rollout communication.

Expected output:
Backend release notes/flag tests

Dependencies:
P17-032, P17-034, P17-040, P17-046, P17-047

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend/admin permissions own support, feedback, incidents, maintenance, release notes, status, feature flags, and audit workflows.
- Protect every operations endpoint with auth, ownership, role, and permission guards.
- Do not trust client-submitted ownership, severity, admin-only status, feature flag rollout, maintenance state, incident status, or release-note publishing state.
- Validate DTOs and return safe errors.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-054

Files created/updated:
- ...

Branch:
phase17/P17-054-release-notes-flag-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-055

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-055 only.

Task:
Create Student Support Feature Shell

Branch:
phase17/P17-055-student-support-feature-shell

Priority:
P1

Description:
Create student mobile support/help/feedback feature structure.

Goal:
Establish mobile support UI boundary.

Expected output:
apps/mobile/lib/features/support/

Dependencies:
P17-008, P17-049, P6-050

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-055

Files created/updated:
- ...

Branch:
phase17/P17-055-student-support-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-056

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-056 only.

Task:
Create Student Help Center UI

Branch:
phase17/P17-056-student-help-center-ui

Priority:
P1

Description:
Build mobile help center page using AIM design system.

Goal:
Give students help entry point.

Expected output:
Student help center UI

Dependencies:
P17-055

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-056

Files created/updated:
- ...

Branch:
phase17/P17-056-student-help-center-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-057

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-057 only.

Task:
Create Student Support Ticket UI

Branch:
phase17/P17-057-student-support-ticket-ui

Priority:
P1

Description:
Build ticket list/detail/create/comment UI using AIM design system and backend APIs.

Goal:
Allow students to request support.

Expected output:
Student support ticket UI

Dependencies:
P17-037, P17-055

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-057

Files created/updated:
- ...

Branch:
phase17/P17-057-student-support-ticket-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-058

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-058 only.

Task:
Create Student Feedback UI

Branch:
phase17/P17-058-student-feedback-ui

Priority:
P1

Description:
Build feedback submission UI with safe categories and optional rating.

Goal:
Capture student feedback.

Expected output:
Student feedback UI

Dependencies:
P17-038, P17-055

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-058

Files created/updated:
- ...

Branch:
phase17/P17-058-student-feedback-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-059

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-059 only.

Task:
Create Student Release Notes UI

Branch:
phase17/P17-059-student-release-notes-ui

Priority:
P2

Description:
Build audience-scoped release notes display using AIM design system.

Goal:
Inform students about updates.

Expected output:
Student release notes UI

Dependencies:
P17-040, P17-055

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-059

Files created/updated:
- ...

Branch:
phase17/P17-059-student-release-notes-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-060

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-060 only.

Task:
Create Student Status and Maintenance UI

Branch:
phase17/P17-060-student-status-maintenance-ui

Priority:
P2

Description:
Build operational status/maintenance notice UI using AIM design system.

Goal:
Inform students about platform status.

Expected output:
Student status/maintenance UI

Dependencies:
P17-041, P17-042, P17-055

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-060

Files created/updated:
- ...

Branch:
phase17/P17-060-student-status-maintenance-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-061

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-061 only.

Task:
Add Student Support UI Tests

Branch:
phase17/P17-061-student-support-ui-tests

Priority:
P2

Description:
Test help center, ticket flow, feedback, release notes, status, and error states.

Goal:
Verify student support UI behavior.

Expected output:
Student support UI tests

Dependencies:
P17-056..P17-060

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-061

Files created/updated:
- ...

Branch:
phase17/P17-061-student-support-ui-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-062

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-062 only.

Task:
Create Parent Support UI

Branch:
phase17/P17-062-parent-support-ui

Priority:
P2

Description:
Build parent help/ticket/feedback/status entry points using AIM design system.

Goal:
Support parent post-launch needs.

Expected output:
Parent support UI

Dependencies:
P12-077, P17-037..P17-042

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-062

Files created/updated:
- ...

Branch:
phase17/P17-062-parent-support-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-063

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-063 only.

Task:
Add Parent Support UI Tests

Branch:
phase17/P17-063-parent-support-ui-tests

Priority:
P2

Description:
Test parent help/ticket/feedback/status flows and permission/error states.

Goal:
Verify parent support UI behavior.

Expected output:
Parent support UI tests

Dependencies:
P17-062

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-063

Files created/updated:
- ...

Branch:
phase17/P17-063-parent-support-ui-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-064

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-064 only.

Task:
Create Admin Operations Feature Shell

Branch:
phase17/P17-064-admin-operations-feature-shell

Priority:
P1

Description:
Create admin operations/support/status feature structure using existing admin dashboard conventions.

Goal:
Establish admin operations UI boundary.

Expected output:
Admin operations feature shell

Dependencies:
P11-077, P17-008, P17-049

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-064

Files created/updated:
- ...

Branch:
phase17/P17-064-admin-operations-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-065

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-065 only.

Task:
Create Admin Operations Dashboard UI

Branch:
phase17/P17-065-admin-operations-dashboard-ui

Priority:
P1

Description:
Build operations dashboard cards/tables for tickets, incidents, maintenance, status, feedback, and releases using AIM design system.

Goal:
Give admins post-launch operations overview.

Expected output:
Admin operations dashboard UI

Dependencies:
P17-048, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-065

Files created/updated:
- ...

Branch:
phase17/P17-065-admin-operations-dashboard-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-066

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-066 only.

Task:
Create Admin Support Tickets UI

Branch:
phase17/P17-066-admin-support-tickets-ui

Priority:
P1

Description:
Build ticket queue/detail/assignment/status UI using AIM design system.

Goal:
Enable support triage.

Expected output:
Admin support tickets UI

Dependencies:
P17-043, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-066

Files created/updated:
- ...

Branch:
phase17/P17-066-admin-support-tickets-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-067

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-067 only.

Task:
Create Admin Feedback UI

Branch:
phase17/P17-067-admin-feedback-ui

Priority:
P1

Description:
Build feedback/feature request triage UI using AIM design system.

Goal:
Enable product feedback review.

Expected output:
Admin feedback UI

Dependencies:
P17-038, P17-039, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-067

Files created/updated:
- ...

Branch:
phase17/P17-067-admin-feedback-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-068

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-068 only.

Task:
Create Admin Incidents UI

Branch:
phase17/P17-068-admin-incidents-ui

Priority:
P1

Description:
Build incident list/detail/status/postmortem reference UI using AIM design system.

Goal:
Enable incident management.

Expected output:
Admin incidents UI

Dependencies:
P17-044, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-068

Files created/updated:
- ...

Branch:
phase17/P17-068-admin-incidents-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-069

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-069 only.

Task:
Create Admin Maintenance UI

Branch:
phase17/P17-069-admin-maintenance-ui

Priority:
P2

Description:
Build maintenance window list/create/update UI using AIM design system.

Goal:
Enable maintenance management.

Expected output:
Admin maintenance UI

Dependencies:
P17-045, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-069

Files created/updated:
- ...

Branch:
phase17/P17-069-admin-maintenance-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-070

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-070 only.

Task:
Create Admin Release Notes UI

Branch:
phase17/P17-070-admin-release-notes-ui

Priority:
P2

Description:
Build release notes draft/publish/archive UI using AIM design system.

Goal:
Enable release communication management.

Expected output:
Admin release notes UI

Dependencies:
P17-046, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-070

Files created/updated:
- ...

Branch:
phase17/P17-070-admin-release-notes-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-071

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-071 only.

Task:
Create Admin Feature Flags UI

Branch:
phase17/P17-071-admin-feature-flags-ui

Priority:
P2

Description:
Build controlled feature flag list/detail/update UI using AIM design system.

Goal:
Enable safe rollout management.

Expected output:
Admin feature flags UI

Dependencies:
P17-047, P17-064

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-071

Files created/updated:
- ...

Branch:
phase17/P17-071-admin-feature-flags-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-072

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-072 only.

Task:
Add Admin Operations UI Tests

Branch:
phase17/P17-072-admin-operations-ui-tests

Priority:
P2

Description:
Test operations dashboard, tickets, feedback, incidents, maintenance, release notes, and feature flags UI.

Goal:
Verify admin operations UI behavior.

Expected output:
Admin operations UI tests

Dependencies:
P17-065..P17-071

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-072

Files created/updated:
- ...

Branch:
phase17/P17-072-admin-operations-ui-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-073

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-073 only.

Task:
Create Operations Design System Review

Branch:
phase17/P17-073-ops-design-system-review

Priority:
P0

Description:
Verify all support/operations/status UI uses AIM design system tokens/components and no one-off styling.

Goal:
Approve or block post-launch UI consistency.

Expected output:
docs/quality/phase-17-ops-design-system-review.md

Dependencies:
P17-061, P17-063, P17-072

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-073

Files created/updated:
- ...

Branch:
phase17/P17-073-ops-design-system-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-074

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-074 only.

Task:
Create Post-Launch Security Review

Branch:
phase17/P17-074-post-launch-security-review

Priority:
P0

Description:
Review support data, ticket visibility, feature flags, release notes, incident records, permissions, logs, and secrets.

Goal:
Validate post-launch security readiness.

Expected output:
docs/security/phase-17-post-launch-security-review.md

Dependencies:
P17-050..P17-054, P17-073

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-074

Files created/updated:
- ...

Branch:
phase17/P17-074-post-launch-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-075

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-075 only.

Task:
Create Post-Launch Privacy Review

Branch:
phase17/P17-075-post-launch-privacy-review

Priority:
P0

Description:
Review support/feedback data, parent-child visibility, operational status messages, and logs for sensitive data exposure.

Goal:
Validate privacy readiness.

Expected output:
docs/security/phase-17-post-launch-privacy-review.md

Dependencies:
P17-004, P17-005, P17-074

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-075

Files created/updated:
- ...

Branch:
phase17/P17-075-post-launch-privacy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-076

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-076 only.

Task:
Create Post-Launch Architecture Review

Branch:
phase17/P17-076-post-launch-architecture-review

Priority:
P0

Description:
Review operations/support backend/UI architecture, feature flags, status, maintenance, and support workflows.

Goal:
Validate architecture readiness.

Expected output:
docs/quality/phase-17-post-launch-architecture-review.md

Dependencies:
P17-073, P17-074, P17-075

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-076

Files created/updated:
- ...

Branch:
phase17/P17-076-post-launch-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-077

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-077 only.

Task:
Create Post-Launch Support E2E Check

Branch:
phase17/P17-077-post-launch-e2e-support

Priority:
P1

Description:
Document or implement E2E check for user ticket → admin triage → resolution flow.

Goal:
Validate support flow.

Expected output:
docs/quality/phase-17-support-e2e-check.md

Dependencies:
P17-057, P17-066

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-077

Files created/updated:
- ...

Branch:
phase17/P17-077-post-launch-e2e-support

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-078

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-078 only.

Task:
Create Post-Launch Feedback E2E Check

Branch:
phase17/P17-078-post-launch-e2e-feedback

Priority:
P1

Description:
Document or implement E2E check for user feedback → admin triage → status update flow.

Goal:
Validate feedback flow.

Expected output:
docs/quality/phase-17-feedback-e2e-check.md

Dependencies:
P17-058, P17-067

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-078:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-078

Files created/updated:
- ...

Branch:
phase17/P17-078-post-launch-e2e-feedback

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-079

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-079 only.

Task:
Create Incidents and Maintenance E2E Check

Branch:
phase17/P17-079-post-launch-e2e-incidents-maintenance

Priority:
P1

Description:
Document or implement E2E check for incident/maintenance creation → status visibility → user notice flow.

Goal:
Validate operations flow.

Expected output:
docs/quality/phase-17-incidents-maintenance-e2e-check.md

Dependencies:
P17-060, P17-068, P17-069

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-079:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared support/operations/status/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-079

Files created/updated:
- ...

Branch:
phase17/P17-079-post-launch-e2e-incidents-maintenance

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-080

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-080 only.

Task:
Create Phase 17 Output Completeness Review

Branch:
phase17/P17-080-output-completeness-review

Priority:
P0

Description:
Verify every Phase 17 expected output exists and meets scope/design/security/privacy/operations rules.

Goal:
Approve or block Phase 17 completion.

Expected output:
docs/quality/phase-17-output-completeness-review.md

Dependencies:
P17-073..P17-079

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-080:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-080

Files created/updated:
- ...

Branch:
phase17/P17-080-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-081

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-081 only.

Task:
Create Phase 18 Readiness Checklist

Branch:
phase17/P17-081-phase-18-readiness-checklist

Priority:
P1

Description:
Document next-phase readiness items for future AI Teacher/voice/advanced growth work without implementing it.

Goal:
Prepare Phase 18 safely.

Expected output:
docs/phase-18/readiness-from-phase-17.md

Dependencies:
P17-080

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-081:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-081

Files created/updated:
- ...

Branch:
phase17/P17-081-phase-18-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P17-082

You are an AI coding/documentation agent working on AIM Platform Phase 17 — Post-Launch Operations, Support, Feedback, and Continuous Improvement.

Work on task P17-082 only.

Task:
Create Phase 17 Final Review and Handoff

Branch:
phase17/P17-082-phase-17-final-review

Priority:
P0

Description:
Summarize post-launch operations outputs, risks, checks, limitations, and next steps.

Goal:
Close Phase 17.

Expected output:
docs/phase-17/final-review.md

Dependencies:
P17-081

Required workflow:
1. Open the Phase 17 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P17-082:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Operations Authority and Safety Rules:
- Client/UI must not decide admin-only support status, incident status, maintenance status, release publishing status, feature flag rollout state, or operational health state.
- Backend remains final authority for support tickets, feedback triage, incidents, maintenance windows, release notes, status, feature flags, and audits.
- Do not expose secrets, private support data, sensitive child/parent data, raw logs, production tokens, or provider credentials.

Scope limits:
- Do not work on AI Teacher, Voice AI, AI Prompt Management, AI Cost Control, new paid features, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside operations, or analytics expansion beyond operations KPIs.
- Do not implement Phase 18 features except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, provider keys, signing keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Operations authority remains backend/admin-controlled.
- Privacy-safe support/feedback rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P17-082

Files created/updated:
- ...

Branch:
phase17/P17-082-phase-17-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Operations validation:
- Backend/admin operations authority preserved: yes/no/not applicable
- Support/feedback privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side operations authority added: yes/no/not applicable
- Feature flag/maintenance/incident authority protected: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
