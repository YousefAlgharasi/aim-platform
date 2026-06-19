# AIM Phase 13 Task Prompts

Phase 13: Notifications and Reminders

Repository:
https://github.com/YousefAlgharasi/aim-platform

Notion Database:
https://app.notion.com/p/383af08baaf6807a9290db62e8fce032?v=2cc42e1a03384521979ff13d2d50c0ca

## Global Phase 13 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All notification/reminder UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Backend owns scheduling, eligibility, preferences, quiet hours, rate limits, queueing, delivery attempts, and delivery state.
- UI may display notifications, register device tokens through backend APIs, and update preferences through protected backend APIs only.
- UI must not decide final schedule state, delivery state, quiet-hour override, or access scope.
- Notification payloads must be privacy-safe and must not include secrets, provider keys, full sensitive answers, private child data, or raw AIM outputs.
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
- Client/UI decides notification eligibility, scheduling authority, delivery state, or quiet-hour override.
- Notification payloads leak secrets, provider metadata, sensitive answers, private child data, or raw AIM outputs.
- Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics work appears outside explicit readiness documentation.

---

#P13-001

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-001 only.

Task:
Create Phase 13 Notifications and Reminders Charter

Branch:
phase13/P13-001-notifications-reminders-charter

Priority:
P0

Description:
Define Phase 13 scope, exclusions, channels, privacy rules, delivery boundaries, and dependencies.

Goal:
Lock Phase 13 to notifications, reminders, scheduling, preferences, and delivery reliability.

Expected output:
docs/phase-13/notifications-reminders-charter.md

Dependencies:
P12-077

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-001

Files created/updated:
- ...

Branch:
phase13/P13-001-notifications-reminders-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-002

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-002 only.

Task:
Create Notification Domain Map

Branch:
phase13/P13-002-notification-domain-map

Priority:
P0

Description:
Document notification, reminder, template, schedule, preference, device token, delivery, digest, and audit entities.

Goal:
Establish the notification/reminder domain model before implementation.

Expected output:
docs/phase-13/notification-domain-map.md

Dependencies:
P13-001

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-002

Files created/updated:
- ...

Branch:
phase13/P13-002-notification-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-003

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-003 only.

Task:
Create Notification Authority Rules

Branch:
phase13/P13-003-notification-authority-rules

Priority:
P0

Description:
Define backend authority for scheduling, eligibility, quiet hours, preferences, and delivery status.

Goal:
Prevent client-side notification authority.

Expected output:
docs/phase-13/notification-authority-rules.md

Dependencies:
P13-001

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-003

Files created/updated:
- ...

Branch:
phase13/P13-003-notification-authority-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-004

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-004 only.

Task:
Create Notification Channel Policy

Branch:
phase13/P13-004-notification-channel-policy

Priority:
P0

Description:
Define supported channels, push/email/in-app boundaries, fallback rules, and disabled channels.

Goal:
Clarify delivery behavior and prevent unsafe channel assumptions.

Expected output:
docs/phase-13/notification-channel-policy.md

Dependencies:
P13-002

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-004

Files created/updated:
- ...

Branch:
phase13/P13-004-notification-channel-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-005

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-005 only.

Task:
Create Notification Privacy Rules

Branch:
phase13/P13-005-notification-privacy-rules

Priority:
P0

Description:
Define safe notification content, no sensitive payload rules, parent/child privacy, and audit expectations.

Goal:
Prevent data leakage through notifications.

Expected output:
docs/phase-13/notification-privacy-rules.md

Dependencies:
P13-002, P12 privacy outputs

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-005

Files created/updated:
- ...

Branch:
phase13/P13-005-notification-privacy-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-006

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-006 only.

Task:
Create Notification API Contract Map

Branch:
phase13/P13-006-notification-api-contract-map

Priority:
P0

Description:
Document backend APIs used by mobile/parent/admin notification UIs.

Goal:
Align API contracts before implementation.

Expected output:
docs/phase-13/notification-api-contract-map.md

Dependencies:
P13-002

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-006

Files created/updated:
- ...

Branch:
phase13/P13-006-notification-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-007

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-007 only.

Task:
Create Notification UI Flow Map

Branch:
phase13/P13-007-notification-ui-flow-map

Priority:
P1

Description:
Document notification inbox, preferences, reminder settings, and digest display flows.

Goal:
Guide UI tasks with design system consistency.

Expected output:
docs/phase-13/notification-ui-flow-map.md

Dependencies:
P13-006

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-007

Files created/updated:
- ...

Branch:
phase13/P13-007-notification-ui-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-008

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-008 only.

Task:
Create Notification UI Design System Rules

Branch:
phase13/P13-008-notification-design-system-rules

Priority:
P0

Description:
Document how notification/reminder UI must use the approved AIM design system.

Goal:
Prevent one-off styling in notification UI.

Expected output:
docs/phase-13/notification-design-system-rules.md

Dependencies:
P13-001, DES-001

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-008

Files created/updated:
- ...

Branch:
phase13/P13-008-notification-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-009

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-009 only.

Task:
Create Notification Templates Migration

Branch:
phase13/P13-009-notification-templates-migration

Priority:
P0

Description:
Add table for notification templates, locale, channel, status, and safe content metadata.

Goal:
Store reusable notification templates safely.

Expected output:
Migration for notification_templates

Dependencies:
P13-002

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-009

Files created/updated:
- ...

Branch:
phase13/P13-009-notification-templates-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-010

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-010 only.

Task:
Create Notification Preferences Migration

Branch:
phase13/P13-010-notification-preferences-migration

Priority:
P0

Description:
Add student/parent notification preference tables or extend existing Phase 12 preferences.

Goal:
Store user-level notification controls.

Expected output:
Migration for notification_preferences

Dependencies:
P13-002, P12 notification preferences outputs

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-010

Files created/updated:
- ...

Branch:
phase13/P13-010-notification-preferences-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-011

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-011 only.

Task:
Create Device Tokens Migration

Branch:
phase13/P13-011-device-tokens-migration

Priority:
P0

Description:
Add table for mobile push tokens, platform, device metadata, status, and last seen.

Goal:
Support push notifications safely.

Expected output:
Migration for device_tokens

Dependencies:
P13-002

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-011

Files created/updated:
- ...

Branch:
phase13/P13-011-device-tokens-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-012

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-012 only.

Task:
Create Notification Events Migration

Branch:
phase13/P13-012-notification-events-migration

Priority:
P0

Description:
Add notification event table for scheduled, queued, sent, failed, dismissed, and read states.

Goal:
Track notification lifecycle.

Expected output:
Migration for notification_events

Dependencies:
P13-002

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-012

Files created/updated:
- ...

Branch:
phase13/P13-012-notification-events-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-013

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-013 only.

Task:
Create Reminder Schedules Migration

Branch:
phase13/P13-013-reminder-schedules-migration

Priority:
P0

Description:
Add reminder schedules for learning plans, review schedules, deadlines, streaks, and custom reminders.

Goal:
Persist backend-controlled reminder plans.

Expected output:
Migration for reminder_schedules

Dependencies:
P13-002

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-013

Files created/updated:
- ...

Branch:
phase13/P13-013-reminder-schedules-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-014

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-014 only.

Task:
Create Delivery Attempts Migration

Branch:
phase13/P13-014-delivery-attempts-migration

Priority:
P0

Description:
Add table for channel delivery attempts, provider metadata, error codes, and retry count.

Goal:
Track delivery reliability.

Expected output:
Migration for notification_delivery_attempts

Dependencies:
P13-012

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-014

Files created/updated:
- ...

Branch:
phase13/P13-014-delivery-attempts-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-015

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-015 only.

Task:
Create Notification Digests Migration

Branch:
phase13/P13-015-notification-digests-migration

Priority:
P1

Description:
Add digest records for grouped daily/weekly summaries.

Goal:
Support digest notifications without spamming users.

Expected output:
Migration for notification_digests

Dependencies:
P13-012

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-015

Files created/updated:
- ...

Branch:
phase13/P13-015-notification-digests-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-016

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-016 only.

Task:
Create Quiet Hours Migration

Branch:
phase13/P13-016-quiet-hours-migration

Priority:
P1

Description:
Add quiet-hour settings for student and parent accounts.

Goal:
Respect user notification timing preferences.

Expected output:
Migration for notification_quiet_hours

Dependencies:
P13-010

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-016

Files created/updated:
- ...

Branch:
phase13/P13-016-quiet-hours-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-017

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-017 only.

Task:
Create Notification Audit Migration

Branch:
phase13/P13-017-notification-audit-migration

Priority:
P1

Description:
Add safe audit table for scheduling, preference, delivery, and token events.

Goal:
Support traceability without leaking sensitive data.

Expected output:
Migration for notification_audit_logs

Dependencies:
P13-012, P13-014

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-017

Files created/updated:
- ...

Branch:
phase13/P13-017-notification-audit-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-018

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-018 only.

Task:
Add Notification DB Constraints

Branch:
phase13/P13-018-notification-db-constraints

Priority:
P0

Description:
Add foreign keys, uniqueness, status checks, retention columns, and indexes.

Goal:
Prevent invalid notification state.

Expected output:
Updated notification constraints migration

Dependencies:
P13-009..P13-017

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-018

Files created/updated:
- ...

Branch:
phase13/P13-018-notification-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-019

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-019 only.

Task:
Create Notifications Backend Module

Branch:
phase13/P13-019-notifications-backend-module

Priority:
P0

Description:
Add backend feature module for notifications and reminders.

Goal:
Establish backend feature boundary.

Expected output:
services/backend-api/src/features/notifications/

Dependencies:
P13-018

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-019

Files created/updated:
- ...

Branch:
phase13/P13-019-notifications-backend-module

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-020

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-020 only.

Task:
Create Notification DTOs and Entities

Branch:
phase13/P13-020-notification-dtos-entities

Priority:
P0

Description:
Define DTOs/entities for templates, preferences, device tokens, events, schedules, delivery attempts, and digests.

Goal:
Standardize notification contracts.

Expected output:
Notification DTO/entity files

Dependencies:
P13-019

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-020

Files created/updated:
- ...

Branch:
phase13/P13-020-notification-dtos-entities

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-021

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-021 only.

Task:
Add Notification Validation Rules

Branch:
phase13/P13-021-notification-validation-rules

Priority:
P0

Description:
Validate templates, preferences, schedules, quiet hours, device tokens, and delivery payloads.

Goal:
Reject invalid notification data.

Expected output:
Validation helpers/pipes/tests

Dependencies:
P13-020

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-021

Files created/updated:
- ...

Branch:
phase13/P13-021-notification-validation-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-022

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-022 only.

Task:
Create Notification Repository Layer

Branch:
phase13/P13-022-notification-repository

Priority:
P0

Description:
Add data access for templates, preferences, device tokens, events, schedules, deliveries, and audits.

Goal:
Encapsulate notification persistence.

Expected output:
Notification repository implementation

Dependencies:
P13-020

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-022

Files created/updated:
- ...

Branch:
phase13/P13-022-notification-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-023

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-023 only.

Task:
Create Notification Template Service

Branch:
phase13/P13-023-template-service

Priority:
P0

Description:
Add service for resolving active templates by locale/channel/event type.

Goal:
Centralize template resolution.

Expected output:
Notification template service

Dependencies:
P13-009, P13-022

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-023

Files created/updated:
- ...

Branch:
phase13/P13-023-template-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-024

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-024 only.

Task:
Create Notification Preference Service

Branch:
phase13/P13-024-preference-service

Priority:
P0

Description:
Add service for reading/updating student and parent preferences.

Goal:
Centralize preference authority.

Expected output:
Notification preference service

Dependencies:
P13-010, P13-022

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-024

Files created/updated:
- ...

Branch:
phase13/P13-024-preference-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-025

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-025 only.

Task:
Create Device Token Service

Branch:
phase13/P13-025-device-token-service

Priority:
P0

Description:
Add registration, rotation, disable, and cleanup logic for device tokens.

Goal:
Manage mobile push tokens safely.

Expected output:
Device token service

Dependencies:
P13-011, P13-022

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-025

Files created/updated:
- ...

Branch:
phase13/P13-025-device-token-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-026

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-026 only.

Task:
Create Reminder Schedule Service

Branch:
phase13/P13-026-reminder-schedule-service

Priority:
P0

Description:
Add backend scheduling logic for learning reminders, reviews, deadlines, and streaks.

Goal:
Centralize reminder authority.

Expected output:
Reminder schedule service

Dependencies:
P13-013, P13-022

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-026

Files created/updated:
- ...

Branch:
phase13/P13-026-reminder-schedule-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-027

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-027 only.

Task:
Create Notification Eligibility Service

Branch:
phase13/P13-027-notification-eligibility-service

Priority:
P0

Description:
Apply preferences, quiet hours, relationship/consent scope, and rate limits before queueing.

Goal:
Prevent unwanted or unauthorized notifications.

Expected output:
Eligibility service

Dependencies:
P13-024, P13-026, P12 consent outputs

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-027

Files created/updated:
- ...

Branch:
phase13/P13-027-notification-eligibility-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-028

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-028 only.

Task:
Create Notification Queue Service

Branch:
phase13/P13-028-notification-queue-service

Priority:
P0

Description:
Queue notification events after eligibility checks.

Goal:
Prepare reliable delivery processing.

Expected output:
Notification queue service

Dependencies:
P13-012, P13-027

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-028

Files created/updated:
- ...

Branch:
phase13/P13-028-notification-queue-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-029

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-029 only.

Task:
Create Push Provider Adapter Interface

Branch:
phase13/P13-029-push-provider-adapter

Priority:
P0

Description:
Add provider abstraction for push delivery without hardcoding provider secrets.

Goal:
Prepare push integration safely.

Expected output:
Push provider adapter interface

Dependencies:
P13-025, P13-028

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-029

Files created/updated:
- ...

Branch:
phase13/P13-029-push-provider-adapter

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-030

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-030 only.

Task:
Create In-App Notification Service

Branch:
phase13/P13-030-in-app-notification-service

Priority:
P0

Description:
Add backend support for in-app notification inbox events.

Goal:
Support notification display inside AIM apps.

Expected output:
In-app notification service

Dependencies:
P13-012, P13-028

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-030

Files created/updated:
- ...

Branch:
phase13/P13-030-in-app-notification-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-031

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-031 only.

Task:
Create Email Provider Readiness Layer

Branch:
phase13/P13-031-email-provider-readiness

Priority:
P2

Description:
Add interface/docs for future email delivery without committing provider secrets.

Goal:
Prepare email channel safely.

Expected output:
Email provider interface/readiness docs

Dependencies:
P13-004, P13-028

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-031

Files created/updated:
- ...

Branch:
phase13/P13-031-email-provider-readiness

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-032

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-032 only.

Task:
Create Notification Delivery Worker

Branch:
phase13/P13-032-delivery-worker

Priority:
P0

Description:
Implement worker/job for processing queued notifications and recording delivery attempts.

Goal:
Send queued notifications reliably.

Expected output:
Delivery worker/job

Dependencies:
P13-014, P13-028, P13-029, P13-030

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-032

Files created/updated:
- ...

Branch:
phase13/P13-032-delivery-worker

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-033

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-033 only.

Task:
Create Retry and Backoff Service

Branch:
phase13/P13-033-retry-backoff-service

Priority:
P1

Description:
Add retry policy for failed delivery attempts.

Goal:
Improve delivery reliability.

Expected output:
Retry/backoff service

Dependencies:
P13-014, P13-032

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-033

Files created/updated:
- ...

Branch:
phase13/P13-033-retry-backoff-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-034

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-034 only.

Task:
Create Notification Digest Service

Branch:
phase13/P13-034-digest-service

Priority:
P1

Description:
Group eligible notifications into daily/weekly digests.

Goal:
Reduce spam and support parent/student summaries.

Expected output:
Digest service

Dependencies:
P13-015, P13-027

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-034

Files created/updated:
- ...

Branch:
phase13/P13-034-digest-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-035

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-035 only.

Task:
Create Notification Audit Service

Branch:
phase13/P13-035-notification-audit-service

Priority:
P1

Description:
Log safe metadata for preferences, tokens, schedules, delivery, and failures.

Goal:
Provide safe notification audit trail.

Expected output:
Notification audit service

Dependencies:
P13-017, P13-022

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-035

Files created/updated:
- ...

Branch:
phase13/P13-035-notification-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-036

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-036 only.

Task:
Create Notification Rate Limit Service

Branch:
phase13/P13-036-notification-rate-limit-service

Priority:
P0

Description:
Enforce per-user/channel notification limits.

Goal:
Prevent spam and accidental notification storms.

Expected output:
Rate limit service

Dependencies:
P13-027, P13-028

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-036

Files created/updated:
- ...

Branch:
phase13/P13-036-notification-rate-limit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-037

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-037 only.

Task:
Integrate Learning Plan Reminders

Branch:
phase13/P13-037-learning-reminder-integration

Priority:
P0

Description:
Create reminders from backend-approved learning plan/review data.

Goal:
Notify students about learning work safely.

Expected output:
Learning reminder integration

Dependencies:
P5/P6 review schedule outputs, P13-026

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-037

Files created/updated:
- ...

Branch:
phase13/P13-037-learning-reminder-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-038

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-038 only.

Task:
Integrate Deadline Reminders

Branch:
phase13/P13-038-deadline-reminder-integration

Priority:
P0

Description:
Create reminders from backend-approved quiz/exam deadlines.

Goal:
Notify students/parents about deadlines safely.

Expected output:
Deadline reminder integration

Dependencies:
P10 deadline outputs, P13-026

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-038

Files created/updated:
- ...

Branch:
phase13/P13-038-deadline-reminder-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-039

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-039 only.

Task:
Integrate Streak Reminder Rules

Branch:
phase13/P13-039-streak-reminder-integration

Priority:
P1

Description:
Create optional reminders for streak continuation without client authority.

Goal:
Encourage activity safely.

Expected output:
Streak reminder integration

Dependencies:
P6 progress outputs, P13-026

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-039

Files created/updated:
- ...

Branch:
phase13/P13-039-streak-reminder-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-040

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-040 only.

Task:
Integrate Parent Summary Reminders

Branch:
phase13/P13-040-parent-summary-reminder-integration

Priority:
P1

Description:
Create parent digest/reminder rules based on Phase 12 preferences and consent.

Goal:
Support parent summaries safely.

Expected output:
Parent summary reminder integration

Dependencies:
P12-077, P13-034

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-040

Files created/updated:
- ...

Branch:
phase13/P13-040-parent-summary-reminder-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-041

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-041 only.

Task:
Add Notification Permission Guards

Branch:
phase13/P13-041-notification-permission-guards

Priority:
P0

Description:
Protect notification, preference, token, schedule, and inbox APIs.

Goal:
Prevent unauthorized notification access.

Expected output:
Notification guards/policies/tests

Dependencies:
P13-019, P13-024, P13-025

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-041

Files created/updated:
- ...

Branch:
phase13/P13-041-notification-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-042

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-042 only.

Task:
Create Register Device Token API

Branch:
phase13/P13-042-register-device-token-api

Priority:
P0

Description:
Add endpoint for authenticated clients to register/update push token.

Goal:
Enable push delivery setup.

Expected output:
Device token endpoint

Dependencies:
P13-025, P13-041

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-042

Files created/updated:
- ...

Branch:
phase13/P13-042-register-device-token-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-043

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-043 only.

Task:
Create Notification Preferences API

Branch:
phase13/P13-043-notification-preferences-api

Priority:
P0

Description:
Add read/update endpoints for student and parent preferences.

Goal:
Allow users to control notifications.

Expected output:
Preferences endpoints

Dependencies:
P13-024, P13-041

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-043

Files created/updated:
- ...

Branch:
phase13/P13-043-notification-preferences-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-044

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-044 only.

Task:
Create In-App Notifications API

Branch:
phase13/P13-044-in-app-notifications-api

Priority:
P0

Description:
Add list/read/dismiss endpoints for in-app notification inbox.

Goal:
Feed notification center UI.

Expected output:
In-app notification endpoints

Dependencies:
P13-030, P13-041

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-044

Files created/updated:
- ...

Branch:
phase13/P13-044-in-app-notifications-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-045

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-045 only.

Task:
Create Reminder Schedules API

Branch:
phase13/P13-045-reminder-schedules-api

Priority:
P1

Description:
Add read/update allowed reminder settings where user-controlled.

Goal:
Expose reminder settings safely.

Expected output:
Reminder schedule endpoints

Dependencies:
P13-026, P13-041

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-045

Files created/updated:
- ...

Branch:
phase13/P13-045-reminder-schedules-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-046

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-046 only.

Task:
Create Admin Notification Read-Only API

Branch:
phase13/P13-046-admin-notification-readonly-api

Priority:
P1

Description:
Add admin read-only endpoints for notification delivery/audit status.

Goal:
Support operations visibility without unsafe mutations.

Expected output:
Admin notification read-only endpoints

Dependencies:
P13-035, P13-041, P11 admin outputs

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-046

Files created/updated:
- ...

Branch:
phase13/P13-046-admin-notification-readonly-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-047

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-047 only.

Task:
Document Notification API Contracts

Branch:
phase13/P13-047-notification-api-contract-docs

Priority:
P0

Description:
Document notification endpoints, payloads, and error states.

Goal:
Align backend with mobile/parent/admin UI.

Expected output:
docs/phase-13/notification-api-contracts.md

Dependencies:
P13-042..P13-046

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-047

Files created/updated:
- ...

Branch:
phase13/P13-047-notification-api-contract-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-048

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-048 only.

Task:
Add Notification Error Handling

Branch:
phase13/P13-048-notification-error-handling

Priority:
P1

Description:
Standardize errors for invalid token, disabled channel, forbidden, quiet hours, provider failure, and rate limited.

Goal:
Improve notification API/worker reliability.

Expected output:
Error handling helpers/tests

Dependencies:
P13-042..P13-046

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-048

Files created/updated:
- ...

Branch:
phase13/P13-048-notification-error-handling

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-049

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-049 only.

Task:
Add Notification Permission Tests

Branch:
phase13/P13-049-notification-backend-permission-tests

Priority:
P0

Description:
Test user cannot access or update another user’s notifications/preferences/tokens.

Goal:
Verify notification security.

Expected output:
Backend permission tests

Dependencies:
P13-041..P13-045

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-049

Files created/updated:
- ...

Branch:
phase13/P13-049-notification-backend-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-050

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-050 only.

Task:
Add Notification Scheduling Tests

Branch:
phase13/P13-050-notification-scheduling-tests

Priority:
P0

Description:
Test reminder schedule creation, quiet hours, preference filtering, and eligibility.

Goal:
Verify backend scheduling authority.

Expected output:
Backend scheduling tests

Dependencies:
P13-026, P13-027, P13-037..P13-040

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-050

Files created/updated:
- ...

Branch:
phase13/P13-050-notification-scheduling-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-051

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-051 only.

Task:
Add Notification Delivery Tests

Branch:
phase13/P13-051-notification-delivery-tests

Priority:
P0

Description:
Test queue, delivery attempts, retries, failed providers, and in-app notifications.

Goal:
Verify delivery reliability.

Expected output:
Backend delivery tests

Dependencies:
P13-028..P13-033

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-051

Files created/updated:
- ...

Branch:
phase13/P13-051-notification-delivery-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-052

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-052 only.

Task:
Add Notification Privacy Tests

Branch:
phase13/P13-052-notification-privacy-tests

Priority:
P0

Description:
Ensure notification payloads do not leak sensitive child, assessment, or AIM data.

Goal:
Protect notification content privacy.

Expected output:
Backend privacy tests

Dependencies:
P13-005, P13-037..P13-040

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns notification scheduling, eligibility, quiet hours, preferences, rate limits, queueing, delivery attempts, and audit logs.
- Protect every notification endpoint with auth and ownership/relationship guards.
- Do not trust client-submitted schedule authority, delivery status, user ownership, or provider metadata.
- Validate DTOs and return safe errors.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-052

Files created/updated:
- ...

Branch:
phase13/P13-052-notification-privacy-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-053

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-053 only.

Task:
Create Student Mobile Notification Feature Shell

Branch:
phase13/P13-053-student-mobile-notification-shell

Priority:
P0

Description:
Create mobile notification feature folders/models/providers using feature-first architecture.

Goal:
Establish mobile notification UI boundary.

Expected output:
apps/mobile/lib/features/notifications/

Dependencies:
P13-047, P6-050

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-053

Files created/updated:
- ...

Branch:
phase13/P13-053-student-mobile-notification-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-054

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-054 only.

Task:
Implement Student Mobile Device Token Registration

Branch:
phase13/P13-054-student-mobile-device-token-registration

Priority:
P0

Description:
Add mobile client flow to register/update device token through backend API.

Goal:
Enable push setup without storing privileged secrets.

Expected output:
Mobile device token registration

Dependencies:
P13-042, P13-053

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-054

Files created/updated:
- ...

Branch:
phase13/P13-054-student-mobile-device-token-registration

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-055

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-055 only.

Task:
Create Student Mobile Notification Inbox

Branch:
phase13/P13-055-student-mobile-notification-inbox

Priority:
P0

Description:
Build in-app notification center using AIM design system and backend API.

Goal:
Allow student to view notifications safely.

Expected output:
Student notification inbox UI

Dependencies:
P13-044, P13-053

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-055

Files created/updated:
- ...

Branch:
phase13/P13-055-student-mobile-notification-inbox

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-056

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-056 only.

Task:
Create Student Mobile Notification Detail UI

Branch:
phase13/P13-056-student-mobile-notification-detail

Priority:
P1

Description:
Build notification detail/read/dismiss UI using AIM design system.

Goal:
Allow safe notification interaction.

Expected output:
Student notification detail UI

Dependencies:
P13-055

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-056

Files created/updated:
- ...

Branch:
phase13/P13-056-student-mobile-notification-detail

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-057

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-057 only.

Task:
Create Student Notification Preferences UI

Branch:
phase13/P13-057-student-mobile-preferences-ui

Priority:
P0

Description:
Build preferences screen for channels, reminder types, quiet hours, and digests.

Goal:
Allow student notification control.

Expected output:
Student notification preferences UI

Dependencies:
P13-043, P13-045, P13-053

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-057

Files created/updated:
- ...

Branch:
phase13/P13-057-student-mobile-preferences-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-058

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-058 only.

Task:
Create Student Reminder Settings UI

Branch:
phase13/P13-058-student-mobile-reminder-settings-ui

Priority:
P1

Description:
Build learning/review/deadline reminder settings UI using AIM design system.

Goal:
Allow safe reminder configuration.

Expected output:
Student reminder settings UI

Dependencies:
P13-045, P13-057

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-058

Files created/updated:
- ...

Branch:
phase13/P13-058-student-mobile-reminder-settings-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-059

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-059 only.

Task:
Create Student Notification Badges

Branch:
phase13/P13-059-student-mobile-notification-badges

Priority:
P1

Description:
Add unread badges/indicators to relevant navigation using AIM design system.

Goal:
Improve notification discoverability.

Expected output:
Student notification badges UI

Dependencies:
P13-055

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-059

Files created/updated:
- ...

Branch:
phase13/P13-059-student-mobile-notification-badges

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-060

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-060 only.

Task:
Add Student Mobile Notification Tests

Branch:
phase13/P13-060-student-mobile-notification-tests

Priority:
P1

Description:
Test inbox, detail, preferences, token registration, and error states.

Goal:
Verify mobile notification UX.

Expected output:
Flutter notification tests

Dependencies:
P13-054..P13-059

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-060

Files created/updated:
- ...

Branch:
phase13/P13-060-student-mobile-notification-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-061

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-061 only.

Task:
Create Parent Notification UI Shell

Branch:
phase13/P13-061-parent-notification-ui-shell

Priority:
P1

Description:
Create parent notification UI integration using Phase 12 parent dashboard conventions.

Goal:
Establish parent notification UI boundary.

Expected output:
Parent notification shell UI

Dependencies:
P12-077, P13-047

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-061

Files created/updated:
- ...

Branch:
phase13/P13-061-parent-notification-ui-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-062

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-062 only.

Task:
Create Parent Notification Inbox UI

Branch:
phase13/P13-062-parent-notification-inbox-ui

Priority:
P1

Description:
Build parent notification inbox with child-scoped safe content using AIM design system.

Goal:
Allow parents to view notifications safely.

Expected output:
Parent notification inbox UI

Dependencies:
P13-044, P13-061

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-062

Files created/updated:
- ...

Branch:
phase13/P13-062-parent-notification-inbox-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-063

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-063 only.

Task:
Create Parent Notification Preferences UI

Branch:
phase13/P13-063-parent-notification-preferences-ui

Priority:
P1

Description:
Build parent preferences/quiet hours/digest settings using AIM design system.

Goal:
Allow parent notification control.

Expected output:
Parent notification preferences UI

Dependencies:
P13-043, P13-045, P13-061

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-063

Files created/updated:
- ...

Branch:
phase13/P13-063-parent-notification-preferences-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-064

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-064 only.

Task:
Create Parent Deadline Reminder UI

Branch:
phase13/P13-064-parent-deadline-reminder-ui

Priority:
P1

Description:
Show child-scoped deadline reminder settings/status using backend-approved data.

Goal:
Help parents track child deadlines safely.

Expected output:
Parent deadline reminder UI

Dependencies:
P13-038, P13-063

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-064

Files created/updated:
- ...

Branch:
phase13/P13-064-parent-deadline-reminder-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-065

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-065 only.

Task:
Add Parent Notification UI Tests

Branch:
phase13/P13-065-parent-notification-tests

Priority:
P1

Description:
Test parent inbox/preferences/deadline reminders and child-scope restrictions.

Goal:
Verify parent notification UI safety.

Expected output:
Parent notification UI tests

Dependencies:
P13-062..P13-064

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-065

Files created/updated:
- ...

Branch:
phase13/P13-065-parent-notification-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-066

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-066 only.

Task:
Create Admin Notification Monitor UI

Branch:
phase13/P13-066-admin-notification-monitor-ui

Priority:
P1

Description:
Build admin read-only notification delivery/audit monitor using AIM design system.

Goal:
Allow operations visibility without unsafe mutation.

Expected output:
Admin notification monitor UI

Dependencies:
P13-046, P11-077

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-066

Files created/updated:
- ...

Branch:
phase13/P13-066-admin-notification-monitor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-067

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-067 only.

Task:
Create Admin Template Read-Only UI

Branch:
phase13/P13-067-admin-template-readonly-ui

Priority:
P2

Description:
Build read-only notification template list/detail using AIM design system.

Goal:
Allow admins to inspect active templates.

Expected output:
Admin template read-only UI

Dependencies:
P13-023, P13-046

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-067

Files created/updated:
- ...

Branch:
phase13/P13-067-admin-template-readonly-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-068

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-068 only.

Task:
Add Admin Notification UI Tests

Branch:
phase13/P13-068-admin-notification-tests

Priority:
P2

Description:
Test admin monitor/template read-only views and permission states.

Goal:
Verify admin notification UI safety.

Expected output:
Admin notification UI tests

Dependencies:
P13-066, P13-067

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-068

Files created/updated:
- ...

Branch:
phase13/P13-068-admin-notification-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-069

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-069 only.

Task:
Create Notification Design System Review

Branch:
phase13/P13-069-notification-design-system-review

Priority:
P0

Description:
Verify all notification UI follows AIM design system tokens/components and no one-off styling.

Goal:
Approve or block notification UI consistency.

Expected output:
docs/quality/phase-13-notification-design-system-review.md

Dependencies:
P13-060, P13-065, P13-068

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-069

Files created/updated:
- ...

Branch:
phase13/P13-069-notification-design-system-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-070

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-070 only.

Task:
Create Notification Security Review

Branch:
phase13/P13-070-notification-security-review

Priority:
P0

Description:
Review permissions, device tokens, provider secrets, payload safety, rate limits, and audit logs.

Goal:
Validate notification security readiness.

Expected output:
docs/quality/phase-13-notification-security-review.md

Dependencies:
P13-049, P13-051, P13-052

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-070

Files created/updated:
- ...

Branch:
phase13/P13-070-notification-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-071

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-071 only.

Task:
Create Notification Privacy Review

Branch:
phase13/P13-071-notification-privacy-review

Priority:
P0

Description:
Review sensitive content, parent/child data exposure, quiet hours, digests, and logs.

Goal:
Validate notification privacy readiness.

Expected output:
docs/quality/phase-13-notification-privacy-review.md

Dependencies:
P13-052, P13-070

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-071

Files created/updated:
- ...

Branch:
phase13/P13-071-notification-privacy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-072

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-072 only.

Task:
Create Notification Architecture Review

Branch:
phase13/P13-072-notification-architecture-review

Priority:
P0

Description:
Review backend worker/API/UI architecture, provider abstraction, and maintainability.

Goal:
Validate notification architecture readiness.

Expected output:
docs/quality/phase-13-notification-architecture-review.md

Dependencies:
P13-069, P13-070, P13-071

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-072

Files created/updated:
- ...

Branch:
phase13/P13-072-notification-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-073

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-073 only.

Task:
Create Student Notification E2E Check

Branch:
phase13/P13-073-notification-e2e-student

Priority:
P1

Description:
Document or implement E2E check for student token registration, inbox, preferences, reminders.

Goal:
Validate student notification flow.

Expected output:
docs/quality/phase-13-student-notification-e2e-check.md

Dependencies:
P13-054..P13-060

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-073

Files created/updated:
- ...

Branch:
phase13/P13-073-notification-e2e-student

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-074

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-074 only.

Task:
Create Parent Notification E2E Check

Branch:
phase13/P13-074-notification-e2e-parent

Priority:
P1

Description:
Document or implement E2E check for parent inbox/preferences/deadline reminders.

Goal:
Validate parent notification flow.

Expected output:
docs/quality/phase-13-parent-notification-e2e-check.md

Dependencies:
P13-061..P13-065

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared notification/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, and safe loading/empty/error states.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-074

Files created/updated:
- ...

Branch:
phase13/P13-074-notification-e2e-parent

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-075

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-075 only.

Task:
Create Notification Delivery E2E Check

Branch:
phase13/P13-075-notification-e2e-delivery

Priority:
P1

Description:
Document or implement E2E check for schedule to queue to delivery attempt to read/dismiss lifecycle.

Goal:
Validate delivery lifecycle.

Expected output:
docs/quality/phase-13-notification-delivery-e2e-check.md

Dependencies:
P13-032, P13-044, P13-051

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-075

Files created/updated:
- ...

Branch:
phase13/P13-075-notification-e2e-delivery

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-076

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-076 only.

Task:
Create Phase 13 Output Completeness Review

Branch:
phase13/P13-076-output-completeness-review

Priority:
P0

Description:
Verify every Phase 13 expected output exists and meets scope/design/security/privacy rules.

Goal:
Approve or block Phase 13 completion.

Expected output:
docs/quality/phase-13-output-completeness-review.md

Dependencies:
P13-069..P13-075

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-076

Files created/updated:
- ...

Branch:
phase13/P13-076-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-077

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-077 only.

Task:
Create Phase 14 Readiness Checklist

Branch:
phase13/P13-077-phase-14-readiness-checklist

Priority:
P1

Description:
Document payment/billing notification readiness and handoff items without implementing payments.

Goal:
Prepare Phase 14 safely.

Expected output:
docs/phase-14/readiness-from-phase-13.md

Dependencies:
P13-076

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-077

Files created/updated:
- ...

Branch:
phase13/P13-077-phase-14-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P13-078

You are an AI coding/documentation agent working on AIM Platform Phase 13 — Notifications and Reminders.

Work on task P13-078 only.

Task:
Create Phase 13 Final Review and Handoff

Branch:
phase13/P13-078-phase-13-final-review

Priority:
P0

Description:
Summarize implementation, outputs, security/privacy risks, checks, limitations, and next steps.

Goal:
Close Phase 13.

Expected output:
docs/phase-13/final-review.md

Dependencies:
P13-077

Required workflow:
1. Open the Phase 13 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P13-078:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.

Authority and Privacy Rules:
- Flutter/parent/admin UI must not decide notification eligibility, final schedule state, delivery status, quiet-hour override, or user access scope.
- Backend remains final authority for notification timing, dispatch, preferences, token validity, and delivery state.
- Notification payloads must not contain secrets, service tokens, full sensitive answers, private child data, or raw AIM outputs.

Scope limits:
- Do not work on Payments, Voice AI, AI Teacher, AI Prompt Management, AI Cost Control, Student Web App, Parent Dashboard expansion, Admin Dashboard expansion, or full analytics dashboard.
- Do not implement Phase 14 payments except readiness documentation when this task explicitly asks.
- Do not commit secrets, provider keys, service-role keys, database credentials, AI provider keys, or production tokens.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- Notification scheduling/delivery authority remains backend-controlled.
- Privacy-safe payload rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P13-078

Files created/updated:
- ...

Branch:
phase13/P13-078-phase-13-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Notification validation:
- Backend scheduling authority preserved: yes/no/not applicable
- Backend delivery authority preserved: yes/no/not applicable
- Preference/quiet-hour rules preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Privacy-safe payloads preserved: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...
