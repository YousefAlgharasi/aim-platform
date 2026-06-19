# AIM Phase 15 Task Prompts

Phase 15: Analytics and Reports

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion Database: 
https://app.notion.com/p/383af08baaf680ae86f1f38539c39d9a?v=0360ada59ca747569aafabfbbbd589f5

## Global Phase 15 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All analytics/reporting UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Backend owns metrics, aggregation, reports, dashboards, exports, cohorts, access policy, and audit logs.
- UI may display backend-approved analytics and request protected exports only.
- UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, or billing outcomes.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.
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
- Client/UI calculates authoritative metrics, reports, exports, progress, AIM outputs, billing outcomes, notification outcomes, or assessment outcomes.
- Analytics API exposes secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.
- Export endpoint lacks permission/scope validation.
- Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payment implementation, or notification delivery work appears outside explicit readiness documentation.

---

#P15-001

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-001 only.

Task:
Create Phase 15 Analytics and Reports Charter

Branch:
phase15/P15-001-analytics-reports-charter

Priority:
P0

Description:
Define Phase 15 scope, exclusions, authority rules, privacy boundaries, reporting boundaries, and dependencies.

Goal:
Lock Phase 15 to analytics, reporting, dashboards, exports, and safe metrics visibility.

Expected output:
docs/phase-15/analytics-reports-charter.md

Dependencies:
P14-082

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-001

Files created/updated:
- ...

Branch:
phase15/P15-001-analytics-reports-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-002

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-002 only.

Task:
Create Analytics Domain Map

Branch:
phase15/P15-002-analytics-domain-map

Priority:
P0

Description:
Document metrics, events, aggregates, dashboards, reports, exports, cohorts, filters, retention, and audit entities.

Goal:
Establish analytics/reporting domain model before implementation.

Expected output:
docs/phase-15/analytics-domain-map.md

Dependencies:
P15-001

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-002

Files created/updated:
- ...

Branch:
phase15/P15-002-analytics-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-003

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-003 only.

Task:
Create Analytics Authority Rules

Branch:
phase15/P15-003-analytics-authority-rules

Priority:
P0

Description:
Define backend authority for metrics, aggregation, reporting, exports, and dashboard data.

Goal:
Prevent client-side analytics authority.

Expected output:
docs/phase-15/analytics-authority-rules.md

Dependencies:
P15-001

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-003

Files created/updated:
- ...

Branch:
phase15/P15-003-analytics-authority-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-004

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-004 only.

Task:
Create Analytics Privacy and Data Safety Rules

Branch:
phase15/P15-004-analytics-privacy-rules

Priority:
P0

Description:
Define anonymization, aggregation, PII boundaries, child data rules, sensitive event rules, and export limits.

Goal:
Protect students, parents, and platform data.

Expected output:
docs/phase-15/analytics-privacy-data-safety-rules.md

Dependencies:
P15-001

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-004

Files created/updated:
- ...

Branch:
phase15/P15-004-analytics-privacy-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-005

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-005 only.

Task:
Create Analytics KPI Catalog

Branch:
phase15/P15-005-analytics-kpi-catalog

Priority:
P0

Description:
Define approved KPIs for learning, placement, curriculum, assessments, notifications, billing, users, and operations.

Goal:
Create a controlled metrics dictionary.

Expected output:
docs/phase-15/analytics-kpi-catalog.md

Dependencies:
P15-002, P15-003

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-005

Files created/updated:
- ...

Branch:
phase15/P15-005-analytics-kpi-catalog

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-006

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-006 only.

Task:
Create Analytics Event Taxonomy

Branch:
phase15/P15-006-analytics-event-taxonomy

Priority:
P0

Description:
Define allowed backend analytics events and safe metadata fields.

Goal:
Standardize event tracking without leaking sensitive data.

Expected output:
docs/phase-15/analytics-event-taxonomy.md

Dependencies:
P15-002, P15-004

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-006

Files created/updated:
- ...

Branch:
phase15/P15-006-analytics-event-taxonomy

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-007

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-007 only.

Task:
Create Reporting Access Map

Branch:
phase15/P15-007-reporting-access-map

Priority:
P0

Description:
Map admin, parent, student, and internal roles to allowed reports and metric scopes.

Goal:
Prevent unauthorized metric visibility.

Expected output:
docs/phase-15/reporting-access-map.md

Dependencies:
P15-003, P15-004, P11/P12 outputs

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-007

Files created/updated:
- ...

Branch:
phase15/P15-007-reporting-access-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-008

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-008 only.

Task:
Create Analytics API Contract Map

Branch:
phase15/P15-008-analytics-api-contract-map

Priority:
P0

Description:
Document backend analytics/reporting APIs needed by admin, parent, and student UIs.

Goal:
Align analytics APIs with UI implementation.

Expected output:
docs/phase-15/analytics-api-contract-map.md

Dependencies:
P15-005, P15-007

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-008

Files created/updated:
- ...

Branch:
phase15/P15-008-analytics-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-009

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-009 only.

Task:
Create Analytics UI Flow Map

Branch:
phase15/P15-009-analytics-ui-flow-map

Priority:
P1

Description:
Document dashboard/report/export/filter flows across admin, parent, and student surfaces.

Goal:
Guide UI implementation using the design system.

Expected output:
docs/phase-15/analytics-ui-flow-map.md

Dependencies:
P15-008

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-009

Files created/updated:
- ...

Branch:
phase15/P15-009-analytics-ui-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-010

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-010 only.

Task:
Create Analytics UI Design System Rules

Branch:
phase15/P15-010-analytics-design-system-rules

Priority:
P0

Description:
Document how all analytics/reporting UI must follow the approved AIM design system.

Goal:
Prevent inconsistent charts, cards, tables, filters, and export UI.

Expected output:
docs/phase-15/analytics-design-system-rules.md

Dependencies:
P15-001, DES-001

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-010

Files created/updated:
- ...

Branch:
phase15/P15-010-analytics-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-011

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-011 only.

Task:
Create Analytics Events Table Migration

Branch:
phase15/P15-011-analytics-events-table-migration

Priority:
P0

Description:
Add table for backend-generated analytics events with safe metadata.

Goal:
Store raw safe events for aggregation.

Expected output:
Migration for analytics_events

Dependencies:
P15-006

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-011

Files created/updated:
- ...

Branch:
phase15/P15-011-analytics-events-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-012

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-012 only.

Task:
Create Metric Definitions Table Migration

Branch:
phase15/P15-012-metric-definitions-table-migration

Priority:
P0

Description:
Add table for approved metric definitions, categories, formula metadata, and visibility scope.

Goal:
Store controlled metric definitions.

Expected output:
Migration for metric_definitions

Dependencies:
P15-005

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-012

Files created/updated:
- ...

Branch:
phase15/P15-012-metric-definitions-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-013

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-013 only.

Task:
Create Metric Aggregates Table Migration

Branch:
phase15/P15-013-metric-aggregates-table-migration

Priority:
P0

Description:
Add table for precomputed metric aggregates by time grain and scope.

Goal:
Support efficient dashboards.

Expected output:
Migration for metric_aggregates

Dependencies:
P15-012

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-013

Files created/updated:
- ...

Branch:
phase15/P15-013-metric-aggregates-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-014

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-014 only.

Task:
Create Report Definitions Table Migration

Branch:
phase15/P15-014-report-definitions-table-migration

Priority:
P0

Description:
Add table for report definitions, allowed filters, schedule metadata, and visibility scope.

Goal:
Store controlled report definitions.

Expected output:
Migration for report_definitions

Dependencies:
P15-005, P15-007

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-014

Files created/updated:
- ...

Branch:
phase15/P15-014-report-definitions-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-015

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-015 only.

Task:
Create Report Runs Table Migration

Branch:
phase15/P15-015-report-runs-table-migration

Priority:
P1

Description:
Add table for report execution history and status.

Goal:
Track report generation lifecycle.

Expected output:
Migration for report_runs

Dependencies:
P15-014

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-015

Files created/updated:
- ...

Branch:
phase15/P15-015-report-runs-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-016

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-016 only.

Task:
Create Dashboard Widgets Table Migration

Branch:
phase15/P15-016-dashboard-widgets-table-migration

Priority:
P1

Description:
Add table for dashboard widget definitions and layout metadata.

Goal:
Support backend-approved dashboards.

Expected output:
Migration for dashboard_widgets

Dependencies:
P15-014

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-016

Files created/updated:
- ...

Branch:
phase15/P15-016-dashboard-widgets-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-017

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-017 only.

Task:
Create Export Jobs Table Migration

Branch:
phase15/P15-017-export-jobs-table-migration

Priority:
P1

Description:
Add table for export job status, format, requester, scope, and safe file metadata.

Goal:
Support safe exports.

Expected output:
Migration for export_jobs

Dependencies:
P15-014

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-017

Files created/updated:
- ...

Branch:
phase15/P15-017-export-jobs-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-018

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-018 only.

Task:
Create Analytics Access Audit Migration

Branch:
phase15/P15-018-analytics-access-audit-table-migration

Priority:
P0

Description:
Add audit table for report/dashboard/export access.

Goal:
Track sensitive analytics access.

Expected output:
Migration for analytics_access_audit_logs

Dependencies:
P15-014, P15-017

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-018

Files created/updated:
- ...

Branch:
phase15/P15-018-analytics-access-audit-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-019

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-019 only.

Task:
Create Cohorts Table Migration

Branch:
phase15/P15-019-cohorts-table-migration

Priority:
P2

Description:
Add cohort definitions and membership snapshots for grouped analytics.

Goal:
Support cohort-based reports.

Expected output:
Migration for analytics_cohorts

Dependencies:
P15-012

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-019

Files created/updated:
- ...

Branch:
phase15/P15-019-cohorts-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-020

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-020 only.

Task:
Add Analytics DB Constraints

Branch:
phase15/P15-020-analytics-db-constraints

Priority:
P0

Description:
Add foreign keys, uniqueness, allowed status checks, retention metadata, and indexes.

Goal:
Prevent invalid analytics/reporting state.

Expected output:
Updated analytics constraints migration

Dependencies:
P15-011..P15-019

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-020

Files created/updated:
- ...

Branch:
phase15/P15-020-analytics-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-021

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-021 only.

Task:
Add Analytics Seed Fixtures

Branch:
phase15/P15-021-analytics-seed-fixtures

Priority:
P2

Description:
Add safe development fixtures for metric definitions, report definitions, and dashboard widgets.

Goal:
Support local analytics testing.

Expected output:
Analytics seed data/fixtures

Dependencies:
P15-020

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-021

Files created/updated:
- ...

Branch:
phase15/P15-021-analytics-seed-fixtures

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-022

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-022 only.

Task:
Create Analytics Backend Module

Branch:
phase15/P15-022-analytics-backend-module

Priority:
P0

Description:
Add backend feature module for analytics and reports.

Goal:
Establish backend feature boundary.

Expected output:
services/backend-api/src/features/analytics/

Dependencies:
P15-020

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-022

Files created/updated:
- ...

Branch:
phase15/P15-022-analytics-backend-module

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-023

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-023 only.

Task:
Create Analytics DTOs and Entities

Branch:
phase15/P15-023-analytics-dtos-entities

Priority:
P0

Description:
Define DTOs/entities for events, metrics, aggregates, reports, dashboards, exports, cohorts, and audit logs.

Goal:
Standardize analytics contracts.

Expected output:
Analytics DTO/entity files

Dependencies:
P15-022

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-023

Files created/updated:
- ...

Branch:
phase15/P15-023-analytics-dtos-entities

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-024

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-024 only.

Task:
Add Analytics Validation Rules

Branch:
phase15/P15-024-analytics-validation-rules

Priority:
P0

Description:
Validate metric IDs, report IDs, filters, date ranges, export formats, scope, and aggregation grain.

Goal:
Reject invalid analytics requests.

Expected output:
Validation helpers/pipes/tests

Dependencies:
P15-023

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-024

Files created/updated:
- ...

Branch:
phase15/P15-024-analytics-validation-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-025

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-025 only.

Task:
Create Analytics Repository Layer

Branch:
phase15/P15-025-analytics-repository

Priority:
P0

Description:
Add data access for analytics events, metric definitions, aggregates, reports, exports, dashboards, cohorts, and audits.

Goal:
Encapsulate analytics persistence.

Expected output:
Analytics repository implementation

Dependencies:
P15-023

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-025

Files created/updated:
- ...

Branch:
phase15/P15-025-analytics-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-026

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-026 only.

Task:
Create Analytics Event Ingestion Service

Branch:
phase15/P15-026-event-ingestion-service

Priority:
P0

Description:
Add backend-only event ingestion for approved event types and safe metadata.

Goal:
Centralize analytics event capture.

Expected output:
Analytics event ingestion service

Dependencies:
P15-011, P15-025

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-026

Files created/updated:
- ...

Branch:
phase15/P15-026-event-ingestion-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-027

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-027 only.

Task:
Create Metric Definition Service

Branch:
phase15/P15-027-metric-definition-service

Priority:
P0

Description:
Add service for approved KPI definitions and visibility scopes.

Goal:
Centralize metric dictionary authority.

Expected output:
Metric definition service

Dependencies:
P15-012, P15-025

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-027

Files created/updated:
- ...

Branch:
phase15/P15-027-metric-definition-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-028

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-028 only.

Task:
Create Metric Aggregation Service

Branch:
phase15/P15-028-aggregation-service

Priority:
P0

Description:
Add aggregation service for learning, assessment, notification, billing, and user metrics.

Goal:
Precompute backend-approved metrics.

Expected output:
Metric aggregation service

Dependencies:
P15-013, P15-026, P15-027

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-028

Files created/updated:
- ...

Branch:
phase15/P15-028-aggregation-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-029

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-029 only.

Task:
Create Report Definition Service

Branch:
phase15/P15-029-report-definition-service

Priority:
P0

Description:
Add service for report definitions, filters, and role-scoped visibility.

Goal:
Centralize report authority.

Expected output:
Report definition service

Dependencies:
P15-014, P15-027

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-029

Files created/updated:
- ...

Branch:
phase15/P15-029-report-definition-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-030

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-030 only.

Task:
Create Report Runner Service

Branch:
phase15/P15-030-report-runner-service

Priority:
P0

Description:
Add report execution service using backend-approved metrics and filters.

Goal:
Generate reports safely.

Expected output:
Report runner service

Dependencies:
P15-015, P15-028, P15-029

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-030

Files created/updated:
- ...

Branch:
phase15/P15-030-report-runner-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-031

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-031 only.

Task:
Create Dashboard Service

Branch:
phase15/P15-031-dashboard-service

Priority:
P0

Description:
Add dashboard service for role-scoped widget data and summaries.

Goal:
Feed admin/parent/student dashboards safely.

Expected output:
Dashboard service

Dependencies:
P15-016, P15-028, P15-029

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-031

Files created/updated:
- ...

Branch:
phase15/P15-031-dashboard-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-032

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-032 only.

Task:
Create Analytics Export Service

Branch:
phase15/P15-032-export-service

Priority:
P1

Description:
Add safe export generation with scope validation, allowed formats, and audit logging.

Goal:
Support controlled exports.

Expected output:
Export service

Dependencies:
P15-017, P15-030

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-032

Files created/updated:
- ...

Branch:
phase15/P15-032-export-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-033

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-033 only.

Task:
Create Cohort Service

Branch:
phase15/P15-033-cohort-service

Priority:
P2

Description:
Add cohort definition/resolution service for grouped analytics.

Goal:
Support cohort reports.

Expected output:
Cohort service

Dependencies:
P15-019, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-033

Files created/updated:
- ...

Branch:
phase15/P15-033-cohort-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-034

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-034 only.

Task:
Create Analytics Access Policy Service

Branch:
phase15/P15-034-analytics-access-policy-service

Priority:
P0

Description:
Apply role, ownership, child-scope, and privacy rules before analytics reads/exports.

Goal:
Protect analytics access.

Expected output:
Analytics access policy service

Dependencies:
P15-007, P15-029

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-034

Files created/updated:
- ...

Branch:
phase15/P15-034-analytics-access-policy-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-035

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-035 only.

Task:
Create Analytics Audit Service

Branch:
phase15/P15-035-analytics-audit-service

Priority:
P1

Description:
Log safe metadata for dashboard/report/export access.

Goal:
Provide analytics traceability.

Expected output:
Analytics audit service

Dependencies:
P15-018, P15-034

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-035

Files created/updated:
- ...

Branch:
phase15/P15-035-analytics-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-036

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-036 only.

Task:
Integrate Learning Metrics

Branch:
phase15/P15-036-learning-metrics-integration

Priority:
P0

Description:
Capture and aggregate backend-approved learning/session/progress metrics.

Goal:
Support learning analytics.

Expected output:
Learning metrics integration

Dependencies:
P5/P6 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-036

Files created/updated:
- ...

Branch:
phase15/P15-036-learning-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-037

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-037 only.

Task:
Integrate Curriculum Metrics

Branch:
phase15/P15-037-curriculum-metrics-integration

Priority:
P0

Description:
Capture course/chapter/lesson/content status and engagement metrics.

Goal:
Support curriculum analytics.

Expected output:
Curriculum metrics integration

Dependencies:
P3/P11 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-037

Files created/updated:
- ...

Branch:
phase15/P15-037-curriculum-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-038

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-038 only.

Task:
Integrate Assessment Metrics

Branch:
phase15/P15-038-assessment-metrics-integration

Priority:
P0

Description:
Capture quiz/exam/deadline/attempt/result metrics from backend-approved results.

Goal:
Support assessment analytics.

Expected output:
Assessment metrics integration

Dependencies:
P10/P11 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-038

Files created/updated:
- ...

Branch:
phase15/P15-038-assessment-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-039

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-039 only.

Task:
Integrate Notification Metrics

Branch:
phase15/P15-039-notification-metrics-integration

Priority:
P1

Description:
Capture notification schedule/delivery/read/dismiss metrics with safe metadata.

Goal:
Support notification analytics.

Expected output:
Notification metrics integration

Dependencies:
P13 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-039

Files created/updated:
- ...

Branch:
phase15/P15-039-notification-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-040

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-040 only.

Task:
Integrate Billing Metrics

Branch:
phase15/P15-040-billing-metrics-integration

Priority:
P1

Description:
Capture subscription/payment/invoice/refund metrics without sensitive payment data.

Goal:
Support billing analytics safely.

Expected output:
Billing metrics integration

Dependencies:
P14 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-040

Files created/updated:
- ...

Branch:
phase15/P15-040-billing-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-041

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-041 only.

Task:
Integrate User and Auth Metrics

Branch:
phase15/P15-041-user-metrics-integration

Priority:
P1

Description:
Capture safe user counts, active users, role distribution, and signup trends.

Goal:
Support operational analytics.

Expected output:
User/auth metrics integration

Dependencies:
P2/P11 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-041

Files created/updated:
- ...

Branch:
phase15/P15-041-user-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-042

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-042 only.

Task:
Integrate Parent Dashboard Metrics

Branch:
phase15/P15-042-parent-metrics-integration

Priority:
P1

Description:
Capture parent-child link, consent, report access, and engagement metrics safely.

Goal:
Support parent analytics.

Expected output:
Parent metrics integration

Dependencies:
P12 outputs, P15-026, P15-028

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-042

Files created/updated:
- ...

Branch:
phase15/P15-042-parent-metrics-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-043

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-043 only.

Task:
Add Analytics Permission Guards

Branch:
phase15/P15-043-analytics-permission-guards

Priority:
P0

Description:
Protect dashboard, report, metric, export, and cohort APIs.

Goal:
Prevent unauthorized analytics access.

Expected output:
Analytics guards/policies/tests

Dependencies:
P15-034

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-043

Files created/updated:
- ...

Branch:
phase15/P15-043-analytics-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-044

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-044 only.

Task:
Create Admin Analytics Dashboard API

Branch:
phase15/P15-044-admin-dashboard-analytics-api

Priority:
P0

Description:
Add admin dashboard endpoint for backend-approved platform metrics.

Goal:
Feed admin analytics UI.

Expected output:
Admin analytics dashboard endpoint

Dependencies:
P15-031, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-044

Files created/updated:
- ...

Branch:
phase15/P15-044-admin-dashboard-analytics-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-045

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-045 only.

Task:
Create Admin Learning Reports API

Branch:
phase15/P15-045-admin-learning-reports-api

Priority:
P0

Description:
Add admin report endpoints for learning, skills, progress, retention, and engagement metrics.

Goal:
Feed admin learning reports.

Expected output:
Admin learning reports endpoints

Dependencies:
P15-030, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-045

Files created/updated:
- ...

Branch:
phase15/P15-045-admin-learning-reports-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-046

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-046 only.

Task:
Create Admin Assessment Reports API

Branch:
phase15/P15-046-admin-assessment-reports-api

Priority:
P0

Description:
Add admin report endpoints for quizzes, exams, attempts, deadlines, and results.

Goal:
Feed admin assessment reports.

Expected output:
Admin assessment reports endpoints

Dependencies:
P15-030, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-046

Files created/updated:
- ...

Branch:
phase15/P15-046-admin-assessment-reports-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-047

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-047 only.

Task:
Create Admin Revenue Reports API

Branch:
phase15/P15-047-admin-revenue-reports-api

Priority:
P1

Description:
Add admin read-only billing/revenue report endpoints using safe billing aggregates.

Goal:
Feed admin revenue reports.

Expected output:
Admin revenue reports endpoints

Dependencies:
P15-030, P15-040, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-047

Files created/updated:
- ...

Branch:
phase15/P15-047-admin-revenue-reports-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-048

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-048 only.

Task:
Create Parent Reporting API

Branch:
phase15/P15-048-parent-reporting-api

Priority:
P0

Description:
Add parent report endpoints scoped to linked children and consent rules.

Goal:
Feed parent reporting UI.

Expected output:
Parent reporting endpoints

Dependencies:
P12 outputs, P15-030, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-048

Files created/updated:
- ...

Branch:
phase15/P15-048-parent-reporting-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-049

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-049 only.

Task:
Create Student Analytics Summary API

Branch:
phase15/P15-049-student-analytics-summary-api

Priority:
P1

Description:
Add student-facing progress/report summary endpoint from backend-approved metrics.

Goal:
Feed student analytics summary UI.

Expected output:
Student analytics summary endpoint

Dependencies:
P6 outputs, P15-031, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-049

Files created/updated:
- ...

Branch:
phase15/P15-049-student-analytics-summary-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-050

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-050 only.

Task:
Create Analytics Export API

Branch:
phase15/P15-050-export-api

Priority:
P1

Description:
Add protected export creation/status/download metadata endpoints.

Goal:
Support controlled exports.

Expected output:
Export endpoints

Dependencies:
P15-032, P15-043

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-050

Files created/updated:
- ...

Branch:
phase15/P15-050-export-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-051

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-051 only.

Task:
Document Analytics API Contracts

Branch:
phase15/P15-051-analytics-api-contract-docs

Priority:
P0

Description:
Document dashboard, report, export, and summary endpoints.

Goal:
Align backend and UI.

Expected output:
docs/phase-15/analytics-api-contracts.md

Dependencies:
P15-044..P15-050

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-051

Files created/updated:
- ...

Branch:
phase15/P15-051-analytics-api-contract-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-052

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-052 only.

Task:
Add Analytics Permission Tests

Branch:
phase15/P15-052-analytics-permission-tests

Priority:
P0

Description:
Test role/ownership/child-scope restrictions across metrics, reports, dashboards, and exports.

Goal:
Verify analytics access control.

Expected output:
Backend permission tests

Dependencies:
P15-043..P15-050

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-052

Files created/updated:
- ...

Branch:
phase15/P15-052-analytics-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-053

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-053 only.

Task:
Add Metric Aggregation Tests

Branch:
phase15/P15-053-aggregation-tests

Priority:
P0

Description:
Test aggregate calculation from backend-approved source data only.

Goal:
Verify metric correctness and authority.

Expected output:
Backend aggregation tests

Dependencies:
P15-028, P15-036..P15-042

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-053

Files created/updated:
- ...

Branch:
phase15/P15-053-aggregation-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-054

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-054 only.

Task:
Add Report Runner Tests

Branch:
phase15/P15-054-report-runner-tests

Priority:
P0

Description:
Test report filters, scopes, date ranges, visibility, empty states, and invalid filters.

Goal:
Verify report generation reliability.

Expected output:
Backend report tests

Dependencies:
P15-030, P15-044..P15-049

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-054

Files created/updated:
- ...

Branch:
phase15/P15-054-report-runner-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-055

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-055 only.

Task:
Add Export Safety Tests

Branch:
phase15/P15-055-export-safety-tests

Priority:
P0

Description:
Test export scope, format, permissions, PII restrictions, and audit logging.

Goal:
Protect export workflows.

Expected output:
Backend export tests

Dependencies:
P15-032, P15-050

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-055

Files created/updated:
- ...

Branch:
phase15/P15-055-export-safety-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-056

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-056 only.

Task:
Add Analytics Privacy Tests

Branch:
phase15/P15-056-analytics-privacy-tests

Priority:
P0

Description:
Ensure analytics APIs do not expose sensitive child data, raw AIM outputs, raw payment payloads, or secrets.

Goal:
Protect analytics privacy.

Expected output:
Backend privacy tests

Dependencies:
P15-004, P15-044..P15-050

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns metrics, events, aggregates, reports, dashboards, exports, cohorts, access policy, and audit logs.
- Protect every analytics endpoint with auth, role, ownership, child-scope, and permission guards.
- Do not trust client-submitted metric values, aggregate values, report outputs, export scope, or privileged filters.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-056

Files created/updated:
- ...

Branch:
phase15/P15-056-analytics-privacy-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-057

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-057 only.

Task:
Create Admin Analytics Feature Shell

Branch:
phase15/P15-057-admin-analytics-feature-shell

Priority:
P0

Description:
Create admin analytics pages/routes/components structure using existing admin dashboard conventions.

Goal:
Establish admin analytics UI boundary.

Expected output:
Admin analytics feature shell

Dependencies:
P11-077, P15-010, P15-051

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-057

Files created/updated:
- ...

Branch:
phase15/P15-057-admin-analytics-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-058

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-058 only.

Task:
Create Admin Analytics Layout Components

Branch:
phase15/P15-058-admin-analytics-layout-components

Priority:
P0

Description:
Build report page layout, filters, KPI card grid, chart shell, and table shell using AIM design system.

Goal:
Standardize analytics UI composition.

Expected output:
Admin analytics layout components

Dependencies:
P15-057

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-058

Files created/updated:
- ...

Branch:
phase15/P15-058-admin-analytics-layout-components

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-059

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-059 only.

Task:
Create Admin Platform Overview Dashboard

Branch:
phase15/P15-059-admin-platform-overview-ui

Priority:
P0

Description:
Build admin overview dashboard for users, learning, curriculum, assessments, notifications, and billing metrics.

Goal:
Provide admin analytics landing dashboard.

Expected output:
Admin platform overview UI

Dependencies:
P15-044, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-059

Files created/updated:
- ...

Branch:
phase15/P15-059-admin-platform-overview-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-060

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-060 only.

Task:
Create Admin Learning Reports UI

Branch:
phase15/P15-060-admin-learning-reports-ui

Priority:
P0

Description:
Build learning/progress/skills/retention report screens using AIM design system.

Goal:
Expose learning analytics safely.

Expected output:
Admin learning reports UI

Dependencies:
P15-045, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-060

Files created/updated:
- ...

Branch:
phase15/P15-060-admin-learning-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-061

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-061 only.

Task:
Create Admin Curriculum Reports UI

Branch:
phase15/P15-061-admin-curriculum-reports-ui

Priority:
P1

Description:
Build curriculum/content performance reports using backend-approved metrics.

Goal:
Expose curriculum analytics safely.

Expected output:
Admin curriculum reports UI

Dependencies:
P15-037, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-061

Files created/updated:
- ...

Branch:
phase15/P15-061-admin-curriculum-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-062

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-062 only.

Task:
Create Admin Assessment Reports UI

Branch:
phase15/P15-062-admin-assessment-reports-ui

Priority:
P0

Description:
Build quizzes/exams/deadlines/attempts/results reports using backend-approved metrics.

Goal:
Expose assessment analytics safely.

Expected output:
Admin assessment reports UI

Dependencies:
P15-046, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-062

Files created/updated:
- ...

Branch:
phase15/P15-062-admin-assessment-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-063

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-063 only.

Task:
Create Admin Notification Reports UI

Branch:
phase15/P15-063-admin-notification-reports-ui

Priority:
P1

Description:
Build notification delivery/read/failure reports using backend-approved metrics.

Goal:
Expose notification analytics safely.

Expected output:
Admin notification reports UI

Dependencies:
P15-039, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-063

Files created/updated:
- ...

Branch:
phase15/P15-063-admin-notification-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-064

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-064 only.

Task:
Create Admin Revenue Reports UI

Branch:
phase15/P15-064-admin-revenue-reports-ui

Priority:
P1

Description:
Build revenue/subscription/invoice/refund reports using safe billing aggregates.

Goal:
Expose billing analytics safely.

Expected output:
Admin revenue reports UI

Dependencies:
P15-047, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-064

Files created/updated:
- ...

Branch:
phase15/P15-064-admin-revenue-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-065

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-065 only.

Task:
Create Admin User Reports UI

Branch:
phase15/P15-065-admin-user-reports-ui

Priority:
P1

Description:
Build signup, active user, role, and engagement reports.

Goal:
Expose user analytics safely.

Expected output:
Admin user reports UI

Dependencies:
P15-041, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-065

Files created/updated:
- ...

Branch:
phase15/P15-065-admin-user-reports-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-066

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-066 only.

Task:
Create Admin Export UI

Branch:
phase15/P15-066-admin-export-ui

Priority:
P1

Description:
Build controlled export creation/status UI with permissions and warnings using AIM design system.

Goal:
Support safe export operations.

Expected output:
Admin export UI

Dependencies:
P15-050, P15-058

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-066

Files created/updated:
- ...

Branch:
phase15/P15-066-admin-export-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-067

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-067 only.

Task:
Add Admin Analytics UI Tests

Branch:
phase15/P15-067-admin-analytics-tests

Priority:
P1

Description:
Test overview, reports, filters, charts, tables, exports, and forbidden states.

Goal:
Verify admin analytics UI behavior.

Expected output:
Admin analytics UI tests

Dependencies:
P15-059..P15-066

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-067

Files created/updated:
- ...

Branch:
phase15/P15-067-admin-analytics-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-068

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-068 only.

Task:
Create Parent Reporting UI

Branch:
phase15/P15-068-parent-reporting-ui

Priority:
P1

Description:
Build parent reports/dashboard summaries for linked children using AIM design system and backend-approved metrics.

Goal:
Expose parent analytics safely.

Expected output:
Parent reporting UI

Dependencies:
P12-077, P15-048, P15-010

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-068

Files created/updated:
- ...

Branch:
phase15/P15-068-parent-reporting-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-069

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-069 only.

Task:
Create Parent Progress Report UI

Branch:
phase15/P15-069-parent-progress-report-ui

Priority:
P1

Description:
Build child progress report view using backend-approved metrics only.

Goal:
Help parent review learning progress safely.

Expected output:
Parent progress report UI

Dependencies:
P15-048, P15-068

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-069

Files created/updated:
- ...

Branch:
phase15/P15-069-parent-progress-report-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-070

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-070 only.

Task:
Create Parent Assessment Report UI

Branch:
phase15/P15-070-parent-assessment-report-ui

Priority:
P1

Description:
Build child assessment report view using backend-approved metrics only.

Goal:
Help parent review assessment outcomes safely.

Expected output:
Parent assessment report UI

Dependencies:
P15-048, P15-068

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-070

Files created/updated:
- ...

Branch:
phase15/P15-070-parent-assessment-report-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-071

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-071 only.

Task:
Add Parent Reporting UI Tests

Branch:
phase15/P15-071-parent-reporting-tests

Priority:
P1

Description:
Test parent report scopes, child selector, consent/forbidden states, and design system UI.

Goal:
Verify parent reporting safety.

Expected output:
Parent reporting UI tests

Dependencies:
P15-068..P15-070

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-071

Files created/updated:
- ...

Branch:
phase15/P15-071-parent-reporting-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-072

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-072 only.

Task:
Create Student Analytics Summary UI

Branch:
phase15/P15-072-student-analytics-summary-ui

Priority:
P2

Description:
Build student-facing learning summary screen using backend-approved metrics and AIM design system.

Goal:
Give students safe progress insights.

Expected output:
Student analytics summary UI

Dependencies:
P6-050, P15-049, P15-010

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-072

Files created/updated:
- ...

Branch:
phase15/P15-072-student-analytics-summary-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-073

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-073 only.

Task:
Add Student Analytics UI Tests

Branch:
phase15/P15-073-student-analytics-tests

Priority:
P2

Description:
Test student summary loading, empty states, metric display, and no local calculation.

Goal:
Verify student analytics UI safety.

Expected output:
Student analytics UI tests

Dependencies:
P15-072

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-073

Files created/updated:
- ...

Branch:
phase15/P15-073-student-analytics-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-074

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-074 only.

Task:
Create Analytics Design System Review

Branch:
phase15/P15-074-analytics-design-system-review

Priority:
P0

Description:
Verify all analytics/reporting UI uses AIM design system tokens/components and no one-off styling.

Goal:
Approve or block analytics UI consistency.

Expected output:
docs/quality/phase-15-analytics-design-system-review.md

Dependencies:
P15-067, P15-071, P15-073

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-074

Files created/updated:
- ...

Branch:
phase15/P15-074-analytics-design-system-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-075

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-075 only.

Task:
Create Analytics Security Review

Branch:
phase15/P15-075-analytics-security-review

Priority:
P0

Description:
Review report permissions, export permissions, audit logs, secrets, and sensitive metric exposure.

Goal:
Validate analytics security readiness.

Expected output:
docs/quality/phase-15-analytics-security-review.md

Dependencies:
P15-052, P15-055, P15-056

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-075

Files created/updated:
- ...

Branch:
phase15/P15-075-analytics-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-076

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-076 only.

Task:
Create Analytics Privacy Review

Branch:
phase15/P15-076-analytics-privacy-review

Priority:
P0

Description:
Review PII, child data, parent scope, billing metrics, AIM outputs, exports, and logs.

Goal:
Validate analytics privacy readiness.

Expected output:
docs/quality/phase-15-analytics-privacy-review.md

Dependencies:
P15-004, P15-056, P15-075

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-076

Files created/updated:
- ...

Branch:
phase15/P15-076-analytics-privacy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-077

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-077 only.

Task:
Create Analytics Architecture Review

Branch:
phase15/P15-077-analytics-architecture-review

Priority:
P0

Description:
Review backend aggregation/API/UI/export architecture, feature boundaries, and maintainability.

Goal:
Validate analytics architecture readiness.

Expected output:
docs/quality/phase-15-analytics-architecture-review.md

Dependencies:
P15-074, P15-075, P15-076

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-077

Files created/updated:
- ...

Branch:
phase15/P15-077-analytics-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-078

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-078 only.

Task:
Create Analytics No-Client-Authority Review

Branch:
phase15/P15-078-analytics-no-client-authority-review

Priority:
P0

Description:
Prove UI does not calculate authoritative metrics, reports, progress, AIM, billing, or assessment outcomes.

Goal:
Preserve backend analytics authority.

Expected output:
docs/quality/phase-15-no-client-analytics-authority-review.md

Dependencies:
P15-067, P15-071, P15-073

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-078:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-078

Files created/updated:
- ...

Branch:
phase15/P15-078-analytics-no-client-authority-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-079

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-079 only.

Task:
Create Admin Analytics E2E Check

Branch:
phase15/P15-079-analytics-e2e-admin

Priority:
P1

Description:
Document or implement E2E check for admin overview/reports/exports flow.

Goal:
Validate admin analytics flow.

Expected output:
docs/quality/phase-15-admin-analytics-e2e-check.md

Dependencies:
P15-059..P15-067

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-079:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-079

Files created/updated:
- ...

Branch:
phase15/P15-079-analytics-e2e-admin

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-080

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-080 only.

Task:
Create Parent Analytics E2E Check

Branch:
phase15/P15-080-analytics-e2e-parent

Priority:
P1

Description:
Document or implement E2E check for parent reports with child-scope/consent rules.

Goal:
Validate parent analytics flow.

Expected output:
docs/quality/phase-15-parent-analytics-e2e-check.md

Dependencies:
P15-068..P15-071

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-080:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared analytics/reporting/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent chart/table/filter/card primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-080

Files created/updated:
- ...

Branch:
phase15/P15-080-analytics-e2e-parent

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-081

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-081 only.

Task:
Create Phase 15 Output Completeness Review

Branch:
phase15/P15-081-output-completeness-review

Priority:
P0

Description:
Verify every Phase 15 expected output exists and meets scope/design/security/privacy/authority rules.

Goal:
Approve or block Phase 15 completion.

Expected output:
docs/quality/phase-15-output-completeness-review.md

Dependencies:
P15-074..P15-080

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-081:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-081

Files created/updated:
- ...

Branch:
phase15/P15-081-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-082

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-082 only.

Task:
Create Phase 16 Readiness Checklist

Branch:
phase15/P15-082-phase-16-readiness-checklist

Priority:
P1

Description:
Document QA/performance/deployment readiness from analytics/reporting outputs.

Goal:
Prepare Phase 16 safely.

Expected output:
docs/phase-16/readiness-from-phase-15.md

Dependencies:
P15-081

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-082:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-082

Files created/updated:
- ...

Branch:
phase15/P15-082-phase-16-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P15-083

You are an AI coding/documentation agent working on AIM Platform Phase 15 — Analytics and Reports.

Work on task P15-083 only.

Task:
Create Phase 15 Final Review and Handoff

Branch:
phase15/P15-083-phase-15-final-review

Priority:
P0

Description:
Summarize implementation, outputs, security/privacy risks, checks, limitations, and next steps.

Goal:
Close Phase 15.

Expected output:
docs/phase-15/final-review.md

Dependencies:
P15-082

Required workflow:
1. Open the Phase 15 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P15-083:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Authority and Privacy Rules:
- Client/UI must not calculate authoritative metrics, aggregates, reports, progress, AIM outputs, assessment outcomes, notification outcomes, billing outcomes, or exports.
- Backend remains final authority for metric definitions, aggregation, dashboard data, report data, export scope, and audit events.
- Analytics outputs must not expose secrets, raw AIM outputs, raw payment payloads, sensitive answers, private child data outside consent scope, or unauthorized PII.

Scope limits:
- Do not work on Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App expansion, Parent Dashboard expansion, Admin Dashboard expansion outside analytics, Payments implementation, or notification delivery implementation.
- Do not implement Phase 16 deployment/performance/QA except readiness documentation when this task explicitly asks.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, payment provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Analytics/reporting authority remains backend-controlled.
- Privacy-safe analytics rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P15-083

Files created/updated:
- ...

Branch:
phase15/P15-083-phase-15-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Analytics validation:
- Backend metric authority preserved: yes/no/not applicable
- Backend aggregation/report authority preserved: yes/no/not applicable
- Export scope/privacy preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- No client-side authoritative metrics added: yes/no/not applicable
- Sensitive data excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...
