# AIM Phase 18 Task Prompts

Phase 18: AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls

Repository:
https://github.com/YousefAlgharasi/aim-platform

## Global Phase 18 Rules

- Work on one task only.
- Select a task from Notion first.
- Claim the task before editing files.
- Do not implement first and assign later.
- Use the exact branch from the task.
- Follow the exact task section in this file.
- Do not mark Done until the branch is pushed.
- All AI Teacher/voice/admin AI UI must follow the approved AIM design system from docs/design/source/aim-design-system.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and audit logs.
- AI Teacher must not become the official learning authority.
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- UI may display AI Teacher responses and send user messages through protected backend APIs only.
- Do not expose provider secrets, API keys, raw prompts with secrets, model secrets, private child data outside consent, raw voice payloads, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.
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
- AI Teacher writes official mastery, weakness, recommendations, review schedule, progress, assessment results, or AIM outputs.
- Provider secrets or API keys are committed, exposed, or logged.
- Cost/quota checks are bypassed before provider calls.
- Safety checks are bypassed.
- Private child data is exposed outside consent/ownership rules.
- Phase 19 feature work appears outside explicit readiness documentation.

---

#P18-001

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-001 only.

Task:
Create Phase 18 AI Teacher and Voice Charter

Branch:
phase18/P18-001-ai-teacher-voice-charter

Priority:
P0

Description:
Define Phase 18 scope, exclusions, authority rules, AI safety boundaries, provider boundaries, and dependencies.

Goal:
Lock Phase 18 to AI Teacher, voice tutor, prompt safety, AI gateway, AI observability, and cost controls.

Expected output:
docs/phase-18/ai-teacher-voice-charter.md

Dependencies:
P17-082

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-001:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-001

Files created/updated:
- ...

Branch:
phase18/P18-001-ai-teacher-voice-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-002

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-002 only.

Task:
Create AI Teacher Domain Map

Branch:
phase18/P18-002-ai-teacher-domain-map

Priority:
P0

Description:
Document AI teacher conversations, messages, voice sessions, prompts, model configs, safety checks, feedback, cost events, and audit entities.

Goal:
Establish the AI Teacher domain before implementation.

Expected output:
docs/phase-18/ai-teacher-domain-map.md

Dependencies:
P18-001

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-002:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-002

Files created/updated:
- ...

Branch:
phase18/P18-002-ai-teacher-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-003

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-003 only.

Task:
Create AI Teacher Authority Rules

Branch:
phase18/P18-003-ai-teacher-authority-rules

Priority:
P0

Description:
Define what AI Teacher can and cannot decide relative to AIM Engine, progress, mastery, recommendations, assessment results, and curriculum state.

Goal:
Prevent AI Teacher from becoming an unauthorized learning authority.

Expected output:
docs/phase-18/ai-teacher-authority-rules.md

Dependencies:
P18-001

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-003:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-003

Files created/updated:
- ...

Branch:
phase18/P18-003-ai-teacher-authority-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-004

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-004 only.

Task:
Create AI Safety Policy

Branch:
phase18/P18-004-ai-safety-policy

Priority:
P0

Description:
Define safe tutoring boundaries, blocked content, hallucination handling, minor safety, privacy, and escalation rules.

Goal:
Establish safe AI tutor behavior.

Expected output:
docs/phase-18/ai-safety-policy.md

Dependencies:
P18-001

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-004:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-004

Files created/updated:
- ...

Branch:
phase18/P18-004-ai-safety-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-005

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-005 only.

Task:
Create AI Provider Policy

Branch:
phase18/P18-005-ai-provider-policy

Priority:
P0

Description:
Define provider abstraction, allowed providers, failover boundaries, secret rules, and model configuration ownership.

Goal:
Avoid provider lock-in and secret leakage.

Expected output:
docs/phase-18/ai-provider-policy.md

Dependencies:
P18-002

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-005:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-005

Files created/updated:
- ...

Branch:
phase18/P18-005-ai-provider-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-006

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-006 only.

Task:
Create AI Cost Control Policy

Branch:
phase18/P18-006-ai-cost-control-policy

Priority:
P0

Description:
Define budgets, quotas, rate limits, usage caps, model tiering, and shutdown controls.

Goal:
Prevent uncontrolled AI usage costs.

Expected output:
docs/phase-18/ai-cost-control-policy.md

Dependencies:
P18-002

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-006:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-006

Files created/updated:
- ...

Branch:
phase18/P18-006-ai-cost-control-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-007

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-007 only.

Task:
Create AI Privacy and Data Policy

Branch:
phase18/P18-007-ai-privacy-data-policy

Priority:
P0

Description:
Define conversation retention, redaction, PII handling, minor data rules, voice data rules, and export limits.

Goal:
Protect student/parent data in AI flows.

Expected output:
docs/phase-18/ai-privacy-data-policy.md

Dependencies:
P18-004

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-007:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-007

Files created/updated:
- ...

Branch:
phase18/P18-007-ai-privacy-data-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-008

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-008 only.

Task:
Create AI Teacher API Contract Map

Branch:
phase18/P18-008-ai-api-contract-map

Priority:
P0

Description:
Document backend AI Teacher APIs used by mobile, admin, and parent read-only surfaces.

Goal:
Align backend and UI before implementation.

Expected output:
docs/phase-18/ai-teacher-api-contract-map.md

Dependencies:
P18-002

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-008:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-008

Files created/updated:
- ...

Branch:
phase18/P18-008-ai-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-009

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-009 only.

Task:
Create AI Teacher UI Flow Map

Branch:
phase18/P18-009-ai-ui-flow-map

Priority:
P1

Description:
Document text chat, voice session, feedback, history, safety block, and parent/admin read-only flows.

Goal:
Guide UI implementation using AIM design system.

Expected output:
docs/phase-18/ai-teacher-ui-flow-map.md

Dependencies:
P18-008

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-009:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-009

Files created/updated:
- ...

Branch:
phase18/P18-009-ai-ui-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-010

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-010 only.

Task:
Create AI Teacher UI Design System Rules

Branch:
phase18/P18-010-ai-design-system-rules

Priority:
P0

Description:
Document how all AI Teacher/voice UI must follow the approved AIM design system.

Goal:
Prevent one-off styling in AI Teacher UI.

Expected output:
docs/phase-18/ai-teacher-design-system-rules.md

Dependencies:
P18-001, DES-001

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-010:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-010

Files created/updated:
- ...

Branch:
phase18/P18-010-ai-design-system-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-011

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-011 only.

Task:
Create AI Conversations Migration

Branch:
phase18/P18-011-ai-conversations-migration

Priority:
P0

Description:
Add table for AI teacher conversation sessions, student ID, scope, mode, status, and safe metadata.

Goal:
Store AI conversation sessions safely.

Expected output:
Migration for ai_teacher_conversations

Dependencies:
P18-002

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-011:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-011

Files created/updated:
- ...

Branch:
phase18/P18-011-ai-conversations-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-012

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-012 only.

Task:
Create AI Messages Migration

Branch:
phase18/P18-012-ai-messages-migration

Priority:
P0

Description:
Add table for user/assistant/system-safe messages with redaction status and metadata.

Goal:
Store AI messages safely.

Expected output:
Migration for ai_teacher_messages

Dependencies:
P18-011

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-012:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-012

Files created/updated:
- ...

Branch:
phase18/P18-012-ai-messages-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-013

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-013 only.

Task:
Create AI Voice Sessions Migration

Branch:
phase18/P18-013-ai-voice-sessions-migration

Priority:
P0

Description:
Add table for voice session metadata, duration, status, provider metadata, and safe transcript references.

Goal:
Track voice tutor sessions safely.

Expected output:
Migration for ai_voice_sessions

Dependencies:
P18-011

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-013:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-013

Files created/updated:
- ...

Branch:
phase18/P18-013-ai-voice-sessions-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-014

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-014 only.

Task:
Create AI Prompts Migration

Branch:
phase18/P18-014-ai-prompts-migration

Priority:
P0

Description:
Add table for prompt templates, prompt versions, locale, audience, status, and safety tags.

Goal:
Manage backend-controlled prompts.

Expected output:
Migration for ai_prompt_templates

Dependencies:
P18-002

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-014:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-014

Files created/updated:
- ...

Branch:
phase18/P18-014-ai-prompts-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-015

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-015 only.

Task:
Create AI Model Configs Migration

Branch:
phase18/P18-015-ai-model-configs-migration

Priority:
P0

Description:
Add table for model config names, provider keys by reference, model IDs, limits, and status without secrets.

Goal:
Configure AI provider/model usage safely.

Expected output:
Migration for ai_model_configs

Dependencies:
P18-005

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-015:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-015

Files created/updated:
- ...

Branch:
phase18/P18-015-ai-model-configs-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-016

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-016 only.

Task:
Create AI Safety Events Migration

Branch:
phase18/P18-016-ai-safety-events-migration

Priority:
P0

Description:
Add table for moderation/safety blocks, category, severity, action, and safe metadata.

Goal:
Track AI safety decisions.

Expected output:
Migration for ai_safety_events

Dependencies:
P18-004

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-016:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-016

Files created/updated:
- ...

Branch:
phase18/P18-016-ai-safety-events-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-017

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-017 only.

Task:
Create AI Usage and Cost Events Migration

Branch:
phase18/P18-017-ai-usage-cost-events-migration

Priority:
P0

Description:
Add table for token/voice duration/provider cost events, quotas, model tier, and request IDs.

Goal:
Track AI usage/cost safely.

Expected output:
Migration for ai_usage_cost_events

Dependencies:
P18-006

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-017:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-017

Files created/updated:
- ...

Branch:
phase18/P18-017-ai-usage-cost-events-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-018

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-018 only.

Task:
Create AI Feedback Migration

Branch:
phase18/P18-018-ai-feedback-migration

Priority:
P1

Description:
Add table for student feedback on AI responses and safety/escalation flags.

Goal:
Capture quality feedback.

Expected output:
Migration for ai_teacher_feedback

Dependencies:
P18-012

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-018:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-018

Files created/updated:
- ...

Branch:
phase18/P18-018-ai-feedback-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-019

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-019 only.

Task:
Create AI Audit Migration

Branch:
phase18/P18-019-ai-audit-migration

Priority:
P0

Description:
Add audit table for AI requests, prompt changes, model config changes, safety decisions, and admin actions.

Goal:
Provide AI traceability without logging secrets.

Expected output:
Migration for ai_teacher_audit_logs

Dependencies:
P18-014, P18-015, P18-016

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-019:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-019

Files created/updated:
- ...

Branch:
phase18/P18-019-ai-audit-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-020

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-020 only.

Task:
Add AI Teacher DB Constraints

Branch:
phase18/P18-020-ai-db-constraints

Priority:
P0

Description:
Add foreign keys, statuses, indexes, retention metadata, and safe idempotency constraints.

Goal:
Prevent invalid AI Teacher state.

Expected output:
Updated AI Teacher constraints migration

Dependencies:
P18-011..P18-019

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-020:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-020

Files created/updated:
- ...

Branch:
phase18/P18-020-ai-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-021

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-021 only.

Task:
Add AI Teacher Seed Fixtures

Branch:
phase18/P18-021-ai-seed-fixtures

Priority:
P2

Description:
Add safe development prompt/model/safety fixtures without real provider secrets.

Goal:
Support local development/testing.

Expected output:
AI Teacher seed data/fixtures

Dependencies:
P18-020

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-021:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-021

Files created/updated:
- ...

Branch:
phase18/P18-021-ai-seed-fixtures

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-022

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-022 only.

Task:
Create AI Teacher Backend Module

Branch:
phase18/P18-022-ai-backend-module

Priority:
P0

Description:
Add backend feature module for AI Teacher and voice tutor.

Goal:
Establish backend AI feature boundary.

Expected output:
services/backend-api/src/features/ai-teacher/

Dependencies:
P18-020

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-022:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-022

Files created/updated:
- ...

Branch:
phase18/P18-022-ai-backend-module

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-023

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-023 only.

Task:
Create AI Teacher DTOs and Entities

Branch:
phase18/P18-023-ai-dtos-entities

Priority:
P0

Description:
Define DTOs/entities for conversations, messages, voice sessions, prompts, model configs, safety events, usage, and feedback.

Goal:
Standardize AI Teacher contracts.

Expected output:
AI Teacher DTO/entity files

Dependencies:
P18-022

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-023:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-023

Files created/updated:
- ...

Branch:
phase18/P18-023-ai-dtos-entities

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-024

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-024 only.

Task:
Add AI Teacher Validation Rules

Branch:
phase18/P18-024-ai-validation-rules

Priority:
P0

Description:
Validate chat messages, voice session actions, prompt IDs, model configs, feedback, safety actions, and quota inputs.

Goal:
Reject invalid AI inputs.

Expected output:
Validation helpers/pipes/tests

Dependencies:
P18-023

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-024:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-024

Files created/updated:
- ...

Branch:
phase18/P18-024-ai-validation-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-025

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-025 only.

Task:
Create AI Teacher Repository Layer

Branch:
phase18/P18-025-ai-repository

Priority:
P0

Description:
Add data access for conversations, messages, prompts, configs, safety events, usage, feedback, and audit logs.

Goal:
Encapsulate AI persistence.

Expected output:
AI Teacher repository implementation

Dependencies:
P18-023

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-025:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-025

Files created/updated:
- ...

Branch:
phase18/P18-025-ai-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-026

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-026 only.

Task:
Create AI Provider Adapter Interface

Branch:
phase18/P18-026-ai-provider-adapter-interface

Priority:
P0

Description:
Add provider abstraction for chat, streaming, embeddings if needed, speech-to-text, text-to-speech, and moderation.

Goal:
Avoid provider lock-in and secret leakage.

Expected output:
AI provider adapter interface

Dependencies:
P18-005, P18-025

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-026:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-026

Files created/updated:
- ...

Branch:
phase18/P18-026-ai-provider-adapter-interface

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-027

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-027 only.

Task:
Create Prompt Template Service

Branch:
phase18/P18-027-prompt-template-service

Priority:
P0

Description:
Add backend-controlled prompt resolution/versioning by context, locale, student state, and safety mode.

Goal:
Centralize prompt authority.

Expected output:
Prompt template service

Dependencies:
P18-014, P18-025

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-027:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-027

Files created/updated:
- ...

Branch:
phase18/P18-027-prompt-template-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-028

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-028 only.

Task:
Create Model Config Service

Branch:
phase18/P18-028-model-config-service

Priority:
P0

Description:
Add backend service for selecting allowed model configs and limits without exposing secrets.

Goal:
Centralize model config authority.

Expected output:
Model config service

Dependencies:
P18-015, P18-025

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-028:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-028

Files created/updated:
- ...

Branch:
phase18/P18-028-model-config-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-029

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-029 only.

Task:
Create AI Safety Service

Branch:
phase18/P18-029-ai-safety-service

Priority:
P0

Description:
Add moderation/safety checks before and after AI generation.

Goal:
Enforce AI safety policy.

Expected output:
AI safety service

Dependencies:
P18-016, P18-026

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-029:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-029

Files created/updated:
- ...

Branch:
phase18/P18-029-ai-safety-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-030

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-030 only.

Task:
Create AI Cost and Quota Service

Branch:
phase18/P18-030-ai-cost-quota-service

Priority:
P0

Description:
Add budget/quota/rate-limit checks for student/admin/provider/model usage.

Goal:
Control AI cost before generation.

Expected output:
AI cost/quota service

Dependencies:
P18-017, P18-028

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-030:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-030

Files created/updated:
- ...

Branch:
phase18/P18-030-ai-cost-quota-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-031

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-031 only.

Task:
Create AI Context Builder Service

Branch:
phase18/P18-031-ai-context-builder-service

Priority:
P0

Description:
Build safe tutoring context from backend-approved curriculum/progress/AIM data without exposing hidden internal authority fields.

Goal:
Ground AI Teacher responses safely.

Expected output:
AI context builder service

Dependencies:
P3/P5/P6 outputs, P18-027

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-031:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-031

Files created/updated:
- ...

Branch:
phase18/P18-031-ai-context-builder-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-032

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-032 only.

Task:
Create AI Conversation Service

Branch:
phase18/P18-032-ai-conversation-service

Priority:
P0

Description:
Add start/resume/close conversation lifecycle and message persistence.

Goal:
Centralize AI chat lifecycle.

Expected output:
AI conversation service

Dependencies:
P18-011, P18-012, P18-025

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-032:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-032

Files created/updated:
- ...

Branch:
phase18/P18-032-ai-conversation-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-033

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-033 only.

Task:
Create AI Chat Orchestration Service

Branch:
phase18/P18-033-ai-chat-orchestration-service

Priority:
P0

Description:
Orchestrate context building, safety checks, quota checks, provider call, post-check, persistence, and response formatting.

Goal:
Provide safe AI Teacher replies.

Expected output:
AI chat orchestration service

Dependencies:
P18-026..P18-032

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-033:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-033

Files created/updated:
- ...

Branch:
phase18/P18-033-ai-chat-orchestration-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-034

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-034 only.

Task:
Create AI Streaming Service

Branch:
phase18/P18-034-ai-streaming-service

Priority:
P1

Description:
Add safe streaming response support if supported by provider and frontend contracts.

Goal:
Improve AI chat UX safely.

Expected output:
AI streaming service

Dependencies:
P18-033

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-034:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-034

Files created/updated:
- ...

Branch:
phase18/P18-034-ai-streaming-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-035

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-035 only.

Task:
Create Speech-to-Text Service

Branch:
phase18/P18-035-voice-stt-service

Priority:
P0

Description:
Add backend/provider abstraction for converting speech to text without exposing secrets.

Goal:
Enable voice tutor input.

Expected output:
Speech-to-text service

Dependencies:
P18-013, P18-026, P18-030

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-035:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-035

Files created/updated:
- ...

Branch:
phase18/P18-035-voice-stt-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-036

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-036 only.

Task:
Create Text-to-Speech Service

Branch:
phase18/P18-036-voice-tts-service

Priority:
P0

Description:
Add backend/provider abstraction for converting AI response to speech.

Goal:
Enable voice tutor output.

Expected output:
Text-to-speech service

Dependencies:
P18-013, P18-026, P18-030

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-036:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-036

Files created/updated:
- ...

Branch:
phase18/P18-036-voice-tts-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-037

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-037 only.

Task:
Create Voice Session Service

Branch:
phase18/P18-037-voice-session-service

Priority:
P0

Description:
Add lifecycle for start/stop voice session, transcripts, safety checks, and usage tracking.

Goal:
Centralize voice tutor lifecycle.

Expected output:
Voice session service

Dependencies:
P18-013, P18-035, P18-036

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-037:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-037

Files created/updated:
- ...

Branch:
phase18/P18-037-voice-session-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-038

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-038 only.

Task:
Create AI Feedback Service

Branch:
phase18/P18-038-ai-feedback-service

Priority:
P1

Description:
Add user feedback capture and admin-safe feedback review logic.

Goal:
Improve AI quality monitoring.

Expected output:
AI feedback service

Dependencies:
P18-018, P18-025

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-038:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-038

Files created/updated:
- ...

Branch:
phase18/P18-038-ai-feedback-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-039

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-039 only.

Task:
Create AI Audit Service

Branch:
phase18/P18-039-ai-audit-service

Priority:
P0

Description:
Log safe metadata for AI requests, safety events, prompt/config changes, and cost events.

Goal:
Provide AI traceability without secrets.

Expected output:
AI audit service

Dependencies:
P18-019, P18-025

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-039:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-039

Files created/updated:
- ...

Branch:
phase18/P18-039-ai-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-040

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-040 only.

Task:
Add AI Teacher Permission Guards

Branch:
phase18/P18-040-ai-permission-guards

Priority:
P0

Description:
Protect AI chat, voice, history, admin prompt/config, feedback, and audit APIs.

Goal:
Prevent unauthorized AI access.

Expected output:
AI guards/policies/tests

Dependencies:
P18-022, P18-032..P18-039

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-040:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-040

Files created/updated:
- ...

Branch:
phase18/P18-040-ai-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-041

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-041 only.

Task:
Create Start AI Conversation API

Branch:
phase18/P18-041-start-conversation-api

Priority:
P0

Description:
Add endpoint to start AI Teacher conversation for authenticated student.

Goal:
Enable AI Teacher chat start.

Expected output:
Start conversation endpoint

Dependencies:
P18-032, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-041:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-041

Files created/updated:
- ...

Branch:
phase18/P18-041-start-conversation-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-042

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-042 only.

Task:
Create Send AI Message API

Branch:
phase18/P18-042-send-message-api

Priority:
P0

Description:
Add endpoint to send text message and receive backend-approved AI response.

Goal:
Enable AI Teacher text chat.

Expected output:
Send message endpoint

Dependencies:
P18-033, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-042:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-042

Files created/updated:
- ...

Branch:
phase18/P18-042-send-message-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-043

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-043 only.

Task:
Create AI Streaming Message API

Branch:
phase18/P18-043-stream-message-api

Priority:
P1

Description:
Add optional streaming endpoint with safety and quota enforcement.

Goal:
Enable streaming AI responses safely.

Expected output:
Streaming endpoint

Dependencies:
P18-034, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-043:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-043

Files created/updated:
- ...

Branch:
phase18/P18-043-stream-message-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-044

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-044 only.

Task:
Create AI Conversation History API

Branch:
phase18/P18-044-ai-history-api

Priority:
P1

Description:
Add endpoint to list/read user’s own AI conversation history.

Goal:
Enable chat history safely.

Expected output:
AI history endpoints

Dependencies:
P18-032, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-044:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-044

Files created/updated:
- ...

Branch:
phase18/P18-044-ai-history-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-045

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-045 only.

Task:
Create AI Feedback API

Branch:
phase18/P18-045-ai-feedback-api

Priority:
P1

Description:
Add endpoint to submit feedback on AI response.

Goal:
Capture AI quality signals.

Expected output:
AI feedback endpoint

Dependencies:
P18-038, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-045:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-045

Files created/updated:
- ...

Branch:
phase18/P18-045-ai-feedback-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-046

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-046 only.

Task:
Create Voice Session API

Branch:
phase18/P18-046-voice-session-api

Priority:
P0

Description:
Add endpoints to start/stop voice session and exchange STT/TTS messages safely.

Goal:
Enable voice tutor flow.

Expected output:
Voice session endpoints

Dependencies:
P18-037, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-046:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-046

Files created/updated:
- ...

Branch:
phase18/P18-046-voice-session-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-047

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-047 only.

Task:
Create AI Safety Status API

Branch:
phase18/P18-047-ai-safety-status-api

Priority:
P0

Description:
Add safe response patterns for blocked/limited AI interactions.

Goal:
Expose safe AI block states to clients.

Expected output:
AI safety status handling/API

Dependencies:
P18-029, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-047:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-047

Files created/updated:
- ...

Branch:
phase18/P18-047-ai-safety-status-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-048

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-048 only.

Task:
Create Admin AI Prompt Management API

Branch:
phase18/P18-048-admin-ai-prompts-api

Priority:
P1

Description:
Add admin endpoints for reading/drafting/versioning/publishing prompt templates.

Goal:
Enable controlled prompt management.

Expected output:
Admin prompt endpoints

Dependencies:
P18-027, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-048:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-048

Files created/updated:
- ...

Branch:
phase18/P18-048-admin-ai-prompts-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-049

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-049 only.

Task:
Create Admin AI Model Config API

Branch:
phase18/P18-049-admin-ai-model-config-api

Priority:
P1

Description:
Add admin endpoints for read/update model config metadata without secrets.

Goal:
Enable controlled model configuration.

Expected output:
Admin model config endpoints

Dependencies:
P18-028, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-049:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-049

Files created/updated:
- ...

Branch:
phase18/P18-049-admin-ai-model-config-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-050

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-050 only.

Task:
Create Admin AI Usage and Cost API

Branch:
phase18/P18-050-admin-ai-usage-api

Priority:
P1

Description:
Add admin read-only endpoints for usage, cost events, quotas, and limit status.

Goal:
Enable AI cost monitoring.

Expected output:
Admin AI usage/cost endpoints

Dependencies:
P18-030, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-050:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-050

Files created/updated:
- ...

Branch:
phase18/P18-050-admin-ai-usage-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-051

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-051 only.

Task:
Create Admin AI Safety Review API

Branch:
phase18/P18-051-admin-ai-safety-api

Priority:
P1

Description:
Add admin read-only endpoints for safety events and flagged feedback.

Goal:
Enable safety monitoring.

Expected output:
Admin AI safety endpoints

Dependencies:
P18-029, P18-038, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-051:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-051

Files created/updated:
- ...

Branch:
phase18/P18-051-admin-ai-safety-api

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-052

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-052 only.

Task:
Document AI Teacher API Contracts

Branch:
phase18/P18-052-ai-api-contract-docs

Priority:
P0

Description:
Document chat, voice, feedback, admin prompt/config, safety, usage, and history APIs.

Goal:
Align backend and UI.

Expected output:
docs/phase-18/ai-teacher-api-contracts.md

Dependencies:
P18-041..P18-051

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-052:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-052

Files created/updated:
- ...

Branch:
phase18/P18-052-ai-api-contract-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-053

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-053 only.

Task:
Add AI Teacher Permission Tests

Branch:
phase18/P18-053-ai-permission-tests

Priority:
P0

Description:
Test users cannot access other users' conversations/history/voice sessions and admin APIs require admin permissions.

Goal:
Verify AI access control.

Expected output:
Backend AI permission tests

Dependencies:
P18-040..P18-051

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-053:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-053

Files created/updated:
- ...

Branch:
phase18/P18-053-ai-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-054

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-054 only.

Task:
Add AI Safety Tests

Branch:
phase18/P18-054-ai-safety-tests

Priority:
P0

Description:
Test blocked prompts, unsafe outputs, post-generation checks, minor safety, and escalation behavior.

Goal:
Verify AI safety policy.

Expected output:
Backend AI safety tests

Dependencies:
P18-029, P18-047

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-054:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-054

Files created/updated:
- ...

Branch:
phase18/P18-054-ai-safety-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-055

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-055 only.

Task:
Add AI Cost and Quota Tests

Branch:
phase18/P18-055-ai-cost-quota-tests

Priority:
P0

Description:
Test quotas, budgets, rate limits, model tiering, and denied generation.

Goal:
Verify AI cost controls.

Expected output:
Backend AI cost/quota tests

Dependencies:
P18-030, P18-050

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-055:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-055

Files created/updated:
- ...

Branch:
phase18/P18-055-ai-cost-quota-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-056

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-056 only.

Task:
Add AI Provider Failure Tests

Branch:
phase18/P18-056-ai-provider-failure-tests

Priority:
P0

Description:
Test provider timeout, failure, invalid response, retry/fallback, and graceful degradation.

Goal:
Verify provider resilience.

Expected output:
Backend provider failure tests

Dependencies:
P18-026, P18-033, P18-037

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-056:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-056

Files created/updated:
- ...

Branch:
phase18/P18-056-ai-provider-failure-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-057

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-057 only.

Task:
Add Voice Session Tests

Branch:
phase18/P18-057-voice-session-tests

Priority:
P0

Description:
Test STT/TTS flow, session lifecycle, duration limits, safety checks, and cost tracking.

Goal:
Verify voice tutor backend.

Expected output:
Backend voice session tests

Dependencies:
P18-035..P18-037, P18-046

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-057:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-057

Files created/updated:
- ...

Branch:
phase18/P18-057-voice-session-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-058

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-058 only.

Task:
Add No AI Authority Regression Tests

Branch:
phase18/P18-058-no-ai-authority-regression-tests

Priority:
P0

Description:
Ensure AI Teacher cannot write mastery, weakness, recommendations, progress, assessment results, or AIM outputs directly.

Goal:
Preserve AIM/backend authority.

Expected output:
Backend no-authority regression tests

Dependencies:
P18-033, P18-040

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-058:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


Backend Requirements:
- Use existing backend feature-based architecture.
- Backend owns AI prompt selection, provider calls, model config, safety checks, quotas, cost events, voice sessions, and AI audit logs.
- Protect every AI endpoint with auth, ownership, role, permission, and child-scope guards where applicable.
- Do not trust client-submitted prompt IDs, model config, quota state, safety state, progress/AIM mutations, or provider metadata.
- Validate DTOs and return safe errors.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-058

Files created/updated:
- ...

Branch:
phase18/P18-058-no-ai-authority-regression-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-059

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-059 only.

Task:
Create Mobile AI Teacher Feature Shell

Branch:
phase18/P18-059-mobile-ai-feature-shell

Priority:
P0

Description:
Create Flutter AI Teacher feature folders/models/providers using feature-first architecture.

Goal:
Establish mobile AI feature boundary.

Expected output:
apps/mobile/lib/features/ai_teacher/

Dependencies:
P18-010, P18-052, P6-050

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-059:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-059

Files created/updated:
- ...

Branch:
phase18/P18-059-mobile-ai-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-060

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-060 only.

Task:
Create Mobile AI Chat UI

Branch:
phase18/P18-060-mobile-ai-chat-ui

Priority:
P0

Description:
Build AI Teacher text chat screen using AIM design system.

Goal:
Enable student AI tutoring chat.

Expected output:
Mobile AI chat UI

Dependencies:
P18-042, P18-059

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-060:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-060

Files created/updated:
- ...

Branch:
phase18/P18-060-mobile-ai-chat-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-061

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-061 only.

Task:
Create Mobile AI Streaming UI

Branch:
phase18/P18-061-mobile-ai-streaming-ui

Priority:
P1

Description:
Add safe streaming display states using AIM design system if streaming API exists.

Goal:
Improve chat UX safely.

Expected output:
Mobile AI streaming UI

Dependencies:
P18-043, P18-060

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-061:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-061

Files created/updated:
- ...

Branch:
phase18/P18-061-mobile-ai-streaming-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-062

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-062 only.

Task:
Create Mobile AI History UI

Branch:
phase18/P18-062-mobile-ai-history-ui

Priority:
P1

Description:
Build conversation history list/detail using backend API and AIM design system.

Goal:
Allow students to revisit AI sessions.

Expected output:
Mobile AI history UI

Dependencies:
P18-044, P18-059

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-062:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-062

Files created/updated:
- ...

Branch:
phase18/P18-062-mobile-ai-history-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-063

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-063 only.

Task:
Create Mobile AI Feedback UI

Branch:
phase18/P18-063-mobile-ai-feedback-ui

Priority:
P1

Description:
Build response feedback/report UI using AIM design system.

Goal:
Capture AI quality/safety feedback.

Expected output:
Mobile AI feedback UI

Dependencies:
P18-045, P18-060

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-063:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-063

Files created/updated:
- ...

Branch:
phase18/P18-063-mobile-ai-feedback-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-064

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-064 only.

Task:
Create Mobile AI Safety Block UI

Branch:
phase18/P18-064-mobile-ai-safety-block-ui

Priority:
P0

Description:
Build blocked/limited response states with safe messaging using AIM design system.

Goal:
Handle safety events clearly.

Expected output:
Mobile AI safety block UI

Dependencies:
P18-047, P18-060

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-064:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-064

Files created/updated:
- ...

Branch:
phase18/P18-064-mobile-ai-safety-block-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-065

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-065 only.

Task:
Create Mobile Voice Tutor UI

Branch:
phase18/P18-065-mobile-voice-tutor-ui

Priority:
P0

Description:
Build voice tutor start/stop/listen/speaking/error states using AIM design system.

Goal:
Enable voice learning experience.

Expected output:
Mobile voice tutor UI

Dependencies:
P18-046, P18-059

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-065:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-065

Files created/updated:
- ...

Branch:
phase18/P18-065-mobile-voice-tutor-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-066

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-066 only.

Task:
Create Mobile Voice Transcript UI

Branch:
phase18/P18-066-mobile-voice-transcript-ui

Priority:
P1

Description:
Show voice transcript and AI response safely using AIM design system.

Goal:
Improve voice session clarity.

Expected output:
Mobile voice transcript UI

Dependencies:
P18-065

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-066:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-066

Files created/updated:
- ...

Branch:
phase18/P18-066-mobile-voice-transcript-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-067

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-067 only.

Task:
Create Mobile AI Teacher Settings UI

Branch:
phase18/P18-067-mobile-ai-settings-ui

Priority:
P2

Description:
Build AI Teacher preferences/settings screen for allowed user controls only.

Goal:
Allow safe user preferences.

Expected output:
Mobile AI settings UI

Dependencies:
P18-052, P18-059

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-067:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-067

Files created/updated:
- ...

Branch:
phase18/P18-067-mobile-ai-settings-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-068

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-068 only.

Task:
Add Mobile AI Teacher UI Tests

Branch:
phase18/P18-068-mobile-ai-tests

Priority:
P1

Description:
Test chat, history, feedback, safety block, settings, and no-authority behavior.

Goal:
Verify mobile AI UI behavior.

Expected output:
Flutter AI Teacher tests

Dependencies:
P18-060..P18-067

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-068:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-068

Files created/updated:
- ...

Branch:
phase18/P18-068-mobile-ai-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-069

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-069 only.

Task:
Add Mobile Voice Tutor Tests

Branch:
phase18/P18-069-mobile-voice-tests

Priority:
P1

Description:
Test voice UI states, transcript display, errors, permission states, and backend-only authority.

Goal:
Verify mobile voice tutor behavior.

Expected output:
Flutter voice tutor tests

Dependencies:
P18-065, P18-066

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-069:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-069

Files created/updated:
- ...

Branch:
phase18/P18-069-mobile-voice-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-070

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-070 only.

Task:
Create Parent AI Read-Only Summary UI

Branch:
phase18/P18-070-parent-ai-readonly-ui

Priority:
P2

Description:
Build parent-safe read-only AI usage summary for linked child if consent allows.

Goal:
Allow parents to understand AI usage safely.

Expected output:
Parent AI summary UI

Dependencies:
P12 outputs, P18-052

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-070:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-070

Files created/updated:
- ...

Branch:
phase18/P18-070-parent-ai-readonly-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-071

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-071 only.

Task:
Create Parent AI Safety Summary UI

Branch:
phase18/P18-071-parent-ai-safety-summary-ui

Priority:
P2

Description:
Build parent-safe safety summary without exposing private conversation details.

Goal:
Support parent safety visibility.

Expected output:
Parent AI safety summary UI

Dependencies:
P18-051, P18-070

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-071:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-071

Files created/updated:
- ...

Branch:
phase18/P18-071-parent-ai-safety-summary-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-072

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-072 only.

Task:
Add Parent AI UI Tests

Branch:
phase18/P18-072-parent-ai-ui-tests

Priority:
P2

Description:
Test child-scope, consent, privacy, and read-only AI summary behavior.

Goal:
Verify parent AI visibility safety.

Expected output:
Parent AI UI tests

Dependencies:
P18-070, P18-071

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-072:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-072

Files created/updated:
- ...

Branch:
phase18/P18-072-parent-ai-ui-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-073

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-073 only.

Task:
Create Admin AI Management Feature Shell

Branch:
phase18/P18-073-admin-ai-feature-shell

Priority:
P1

Description:
Create admin AI management routes/components structure using existing admin dashboard conventions.

Goal:
Establish admin AI UI boundary.

Expected output:
Admin AI feature shell

Dependencies:
P11-077, P18-010, P18-052

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-073:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-073

Files created/updated:
- ...

Branch:
phase18/P18-073-admin-ai-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-074

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-074 only.

Task:
Create Admin AI Prompt Management UI

Branch:
phase18/P18-074-admin-ai-prompts-ui

Priority:
P1

Description:
Build prompt template/version/status UI using AIM design system.

Goal:
Enable controlled prompt management.

Expected output:
Admin AI prompts UI

Dependencies:
P18-048, P18-073

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-074:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-074

Files created/updated:
- ...

Branch:
phase18/P18-074-admin-ai-prompts-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-075

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-075 only.

Task:
Create Admin AI Model Config UI

Branch:
phase18/P18-075-admin-ai-model-config-ui

Priority:
P1

Description:
Build model config metadata UI without exposing secrets.

Goal:
Enable safe model configuration.

Expected output:
Admin AI model config UI

Dependencies:
P18-049, P18-073

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-075:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-075

Files created/updated:
- ...

Branch:
phase18/P18-075-admin-ai-model-config-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-076

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-076 only.

Task:
Create Admin AI Usage and Cost UI

Branch:
phase18/P18-076-admin-ai-usage-cost-ui

Priority:
P1

Description:
Build usage/cost/quota dashboard using AIM design system.

Goal:
Monitor AI spend and quotas.

Expected output:
Admin AI usage/cost UI

Dependencies:
P18-050, P18-073

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-076:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-076

Files created/updated:
- ...

Branch:
phase18/P18-076-admin-ai-usage-cost-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-077

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-077 only.

Task:
Create Admin AI Safety Review UI

Branch:
phase18/P18-077-admin-ai-safety-review-ui

Priority:
P1

Description:
Build safety events and flagged feedback review UI using AIM design system.

Goal:
Support AI safety review.

Expected output:
Admin AI safety UI

Dependencies:
P18-051, P18-073

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-077:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-077

Files created/updated:
- ...

Branch:
phase18/P18-077-admin-ai-safety-review-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-078

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-078 only.

Task:
Create Admin AI Audit UI

Branch:
phase18/P18-078-admin-ai-audit-ui

Priority:
P2

Description:
Build AI audit log viewer with safe metadata only.

Goal:
Support AI traceability.

Expected output:
Admin AI audit UI

Dependencies:
P18-039, P18-073

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-078:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-078

Files created/updated:
- ...

Branch:
phase18/P18-078-admin-ai-audit-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-079

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-079 only.

Task:
Add Admin AI UI Tests

Branch:
phase18/P18-079-admin-ai-ui-tests

Priority:
P2

Description:
Test prompt/config/usage/safety/audit pages, permission states, and secret redaction.

Goal:
Verify admin AI UI safety.

Expected output:
Admin AI UI tests

Dependencies:
P18-074..P18-078

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-079:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-079

Files created/updated:
- ...

Branch:
phase18/P18-079-admin-ai-ui-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-080

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-080 only.

Task:
Create AI Teacher Design System Review

Branch:
phase18/P18-080-ai-design-system-review

Priority:
P0

Description:
Verify all AI Teacher/voice/admin AI UI uses AIM design system tokens/components and no one-off styling.

Goal:
Approve or block AI UI consistency.

Expected output:
docs/quality/phase-18-ai-design-system-review.md

Dependencies:
P18-068, P18-069, P18-072, P18-079

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-080:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-080

Files created/updated:
- ...

Branch:
phase18/P18-080-ai-design-system-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-081

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-081 only.

Task:
Create AI Teacher Security Review

Branch:
phase18/P18-081-ai-security-review

Priority:
P0

Description:
Review provider secrets, prompt/config permissions, conversation access, voice data, safety events, logs, and admin APIs.

Goal:
Validate AI Teacher security readiness.

Expected output:
docs/security/phase-18-ai-teacher-security-review.md

Dependencies:
P18-053..P18-058

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-081:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-081

Files created/updated:
- ...

Branch:
phase18/P18-081-ai-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-082

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-082 only.

Task:
Create AI Teacher Privacy Review

Branch:
phase18/P18-082-ai-privacy-review

Priority:
P0

Description:
Review conversations, transcripts, retention, redaction, parent visibility, child data, and PII handling.

Goal:
Validate AI privacy readiness.

Expected output:
docs/security/phase-18-ai-teacher-privacy-review.md

Dependencies:
P18-007, P18-081

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-082:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-082

Files created/updated:
- ...

Branch:
phase18/P18-082-ai-privacy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-083

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-083 only.

Task:
Create AI Teacher Safety Review

Branch:
phase18/P18-083-ai-safety-review

Priority:
P0

Description:
Review safety policy compliance, blocked content, escalation, hallucination handling, and tutor behavior.

Goal:
Validate AI safety readiness.

Expected output:
docs/quality/phase-18-ai-teacher-safety-review.md

Dependencies:
P18-054, P18-064, P18-077

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-083:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-083

Files created/updated:
- ...

Branch:
phase18/P18-083-ai-safety-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-084

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-084 only.

Task:
Create AI Cost Control Review

Branch:
phase18/P18-084-ai-cost-review

Priority:
P0

Description:
Review quotas, budgets, cost events, provider usage, model tiering, and fail-safe shutoff.

Goal:
Validate AI cost readiness.

Expected output:
docs/quality/phase-18-ai-cost-control-review.md

Dependencies:
P18-055, P18-076

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-084:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-084

Files created/updated:
- ...

Branch:
phase18/P18-084-ai-cost-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-085

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-085 only.

Task:
Create AI Teacher Architecture Review

Branch:
phase18/P18-085-ai-architecture-review

Priority:
P0

Description:
Review backend/provider/UI architecture, safety/cost services, streaming, voice, and maintainability.

Goal:
Validate AI Teacher architecture.

Expected output:
docs/quality/phase-18-ai-teacher-architecture-review.md

Dependencies:
P18-080..P18-084

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-085:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-085

Files created/updated:
- ...

Branch:
phase18/P18-085-ai-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-086

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-086 only.

Task:
Create AI Text Chat E2E Check

Branch:
phase18/P18-086-ai-e2e-text-chat

Priority:
P1

Description:
Document or implement E2E check for start conversation → send message → safety/quota → response → feedback.

Goal:
Validate text AI Tutor flow.

Expected output:
docs/quality/phase-18-ai-text-chat-e2e-check.md

Dependencies:
P18-060, P18-068

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-086:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-086

Files created/updated:
- ...

Branch:
phase18/P18-086-ai-e2e-text-chat

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-087

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-087 only.

Task:
Create AI Voice Tutor E2E Check

Branch:
phase18/P18-087-ai-e2e-voice-tutor

Priority:
P1

Description:
Document or implement E2E check for voice session start → STT → chat orchestration → TTS → transcript.

Goal:
Validate voice AI Tutor flow.

Expected output:
docs/quality/phase-18-ai-voice-tutor-e2e-check.md

Dependencies:
P18-065, P18-069

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-087:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-087

Files created/updated:
- ...

Branch:
phase18/P18-087-ai-e2e-voice-tutor

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-088

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-088 only.

Task:
Create Admin AI Management E2E Check

Branch:
phase18/P18-088-ai-e2e-admin-management

Priority:
P1

Description:
Document or implement E2E check for prompt/config/usage/safety/audit admin flow.

Goal:
Validate admin AI management.

Expected output:
docs/quality/phase-18-admin-ai-management-e2e-check.md

Dependencies:
P18-074..P18-079

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-088:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


UI Design System Requirements:
- Follow the approved AIM design system from docs/design/source/aim-design-system.
- Use existing design tokens, spacing, typography, colors, radius, elevation, layout rules, and component contracts.
- Use shared AI Teacher/voice/chat/admin/common components when available.
- Do not introduce one-off styling, random colors, custom spacing, or inconsistent UI primitives.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard flow, safe loading/empty/error states, and safe blocked-content states.

AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-088

Files created/updated:
- ...

Branch:
phase18/P18-088-ai-e2e-admin-management

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-089

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-089 only.

Task:
Create Phase 18 Output Completeness Review

Branch:
phase18/P18-089-output-completeness-review

Priority:
P0

Description:
Verify every Phase 18 expected output exists and meets scope/design/security/privacy/safety/cost rules.

Goal:
Approve or block Phase 18 completion.

Expected output:
docs/quality/phase-18-output-completeness-review.md

Dependencies:
P18-080..P18-088

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-089:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-089

Files created/updated:
- ...

Branch:
phase18/P18-089-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-090

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-090 only.

Task:
Create Phase 19 Readiness Checklist

Branch:
phase18/P18-090-phase-19-readiness-checklist

Priority:
P1

Description:
Document readiness for advanced growth experiments, personalization expansion, or future AI enhancements without implementing them.

Goal:
Prepare Phase 19 safely.

Expected output:
docs/phase-19/readiness-from-phase-18.md

Dependencies:
P18-089

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-090:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-090

Files created/updated:
- ...

Branch:
phase18/P18-090-phase-19-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...


#P18-091

You are an AI coding/documentation agent working on AIM Platform Phase 18 — AI Teacher, Voice Tutor, Prompt Safety, and AI Cost Controls.

Work on task P18-091 only.

Task:
Create Phase 18 Final Review and Handoff

Branch:
phase18/P18-091-phase-18-final-review

Priority:
P0

Description:
Summarize AI Teacher/voice outputs, security/privacy/safety/cost checks, limitations, and next steps.

Goal:
Close Phase 18.

Expected output:
docs/phase-18/final-review.md

Dependencies:
P18-090

Required workflow:
1. Open the Phase 18 Notion database.
2. Pick this task only if Status = Undone and Assigned is empty.
3. Verify all dependencies are Done and their outputs exist in GitHub.
4. Assign the task to yourself before editing.
5. Set Status = In Progress before editing.
6. Re-open the task and confirm assignment/status.
7. Create/use the exact branch listed above.
8. Implement only the expected output for this task.
9. Commit every changed file with a message starting with "P18-091:".
10. Push the branch.
11. Add the completion comment.
12. Set Status = Done only after push succeeds.


AI Authority, Safety, Privacy, and Cost Rules:
- AI Teacher must not write mastery, weakness, difficulty, recommendations, review schedules, progress, assessment results, or AIM outputs directly.
- Backend/AIM Engine remains final authority for learning decisions.
- AI Teacher may explain, tutor, coach, and answer within safe scope using backend-approved context only.
- Do not expose provider secrets, raw prompts with secrets, model secrets, raw voice payloads, private child data outside consent, or sensitive conversation data.
- Cost/quota checks must happen before provider calls.

Scope limits:
- Do not implement new official mastery/progress/AIM decision logic in AI Teacher.
- Do not expose provider secrets, API keys, service-role keys, database credentials, model secrets, signing keys, or production tokens.
- Do not implement Phase 19 features except readiness documentation when this task explicitly asks.
- Do not add payment, analytics, support, or notification feature expansion beyond AI usage/cost/safety integration required for Phase 18.

Done test:
- Expected output exists.
- Task scope is respected.
- UI tasks follow AIM design system when applicable.
- AI Teacher authority limits are preserved.
- AI safety/privacy/cost rules are preserved.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion comment template:
Completed — P18-091

Files created/updated:
- ...

Branch:
phase18/P18-091-phase-18-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

AI Teacher validation:
- Backend/AIM learning authority preserved: yes/no/not applicable
- AI safety checks preserved: yes/no/not applicable
- AI privacy rules preserved: yes/no/not applicable
- Cost/quota controls preserved: yes/no/not applicable
- AIM design system followed for UI: yes/no/not applicable
- Provider secrets excluded: yes/no
- Secrets excluded: yes/no

Limitations:
- ...
