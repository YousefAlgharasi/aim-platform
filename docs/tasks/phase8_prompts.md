# AIM Phase 8 Task Prompts

Phase: Phase 8 — AI Teacher Text Mode

Repository:

```text
https://github.com/YousefAlgharasi/aim-platform
```

Notion database:

```text
https://app.notion.com/p/401949fa0b4f4f95b5c5d5e01ec4b383
```

Task prompt file path:

```text
docs/tasks/phase8_prompts.md
```

## Phase 8 Active Direction

Phase 8 builds the text-based AI Teacher. It includes backend AI Teacher module, backend-only AI provider gateway, prompt/context builder, safety filtering, chat persistence, AI Teacher APIs, and Flutter AI Teacher text chat UI.

Phase 8 must use backend-approved learning context from previous phases. AIM Engine remains the learning-decision authority.

## UI Rule

All Flutter UI tasks in Phase 8 must use the AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.

Do not hard-code random colors, spacing, typography, buttons, cards, chat bubbles, or inputs.

Do not ignore RTL/Arabic rules.

## Out of Scope

Do not implement Voice AI, speech-to-text, text-to-speech, realtime voice, payments, parent dashboard, admin dashboard, Student Web App, or AIM Engine replacement logic.

---

### #P8-001 — Create Phase 8 AI Teacher Text Mode Charter

**Task ID:** `P8-001`  
**Branch:** `phase8/P8-001-ai-teacher-text-charter`  
**Priority:** `P0`  
**Dependency:** `P6-130`  
**Output:** `docs/phase-8/ai-teacher-text-charter.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-001`

#### Description

Create Phase 8 AI Teacher Text Mode Charter

#### Goal

Lock Phase 8 as AI Teacher Text Mode with backend AI pipeline and Flutter text chat UI.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Document Phase 8 as AI Teacher Text Mode only.
- List included and excluded scope clearly.
- State that Phase 8 depends on Phase 6 mobile MVP and Phase 5 AIM backend outputs.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-text-charter.md.
- Branch is exactly: phase8/P8-001-ai-teacher-text-charter.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-001

Files created/updated:
- ...

Branch:
phase8/P8-001-ai-teacher-text-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-002 — Create Phase 8 Task Execution Rules

**Task ID:** `P8-002`  
**Branch:** `phase8/P8-002-phase-8-task-rules`  
**Priority:** `P0`  
**Dependency:** `P8-001`  
**Output:** `docs/phase-8/task-execution-rules.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-002`

#### Description

Create task execution rules for Phase 8.

#### Goal

Standardize how agents claim, implement, test, push, and close Phase 8 tasks.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/task-execution-rules.md.
- Branch is exactly: phase8/P8-002-phase-8-task-rules.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-002

Files created/updated:
- ...

Branch:
phase8/P8-002-phase-8-task-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-003 — Define AI Teacher Scope and Out-of-Scope

**Task ID:** `P8-003`  
**Branch:** `phase8/P8-003-ai-teacher-scope-boundaries`  
**Priority:** `P0`  
**Dependency:** `P8-001`  
**Output:** `docs/phase-8/ai-teacher-scope-boundaries.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-003`

#### Description

Define what Phase 8 includes and excludes.

#### Goal

Prevent Phase 8 from drifting into voice, payments, dashboards, or AIM authority replacement.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Document Phase 8 as AI Teacher Text Mode only.
- List included and excluded scope clearly.
- State that Phase 8 depends on Phase 6 mobile MVP and Phase 5 AIM backend outputs.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-scope-boundaries.md.
- Branch is exactly: phase8/P8-003-ai-teacher-scope-boundaries.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-003

Files created/updated:
- ...

Branch:
phase8/P8-003-ai-teacher-scope-boundaries

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-004 — Document AI Teacher Authority Rules

**Task ID:** `P8-004`  
**Branch:** `phase8/P8-004-ai-teacher-authority-rule`  
**Priority:** `P0`  
**Dependency:** `P8-003`  
**Output:** `docs/phase-8/ai-teacher-authority-rule.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-004`

#### Description

Document AI Teacher authority boundaries.

#### Goal

Ensure AI Teacher explains/guides but does not own mastery, level, weakness, difficulty, recommendations, or review schedule.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Make clear that AIM Engine owns learning decisions.
- AI Teacher may explain, guide, hint, and tutor but must not modify AIM decisions.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-authority-rule.md.
- Branch is exactly: phase8/P8-004-ai-teacher-authority-rule.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-004

Files created/updated:
- ...

Branch:
phase8/P8-004-ai-teacher-authority-rule

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-005 — Document No Client AI Provider Rule

**Task ID:** `P8-005`  
**Branch:** `phase8/P8-005-no-client-ai-provider-rule`  
**Priority:** `P0`  
**Dependency:** `P8-004`  
**Output:** `docs/phase-8/no-client-ai-provider-rule.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-005`

#### Description

Document that clients must not call AI providers directly.

#### Goal

Keep AI provider calls backend-only and prevent key exposure.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: docs/phase-8/no-client-ai-provider-rule.md.
- Branch is exactly: phase8/P8-005-no-client-ai-provider-rule.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-005

Files created/updated:
- ...

Branch:
phase8/P8-005-no-client-ai-provider-rule

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-006 — Document No AIM Replacement Rule

**Task ID:** `P8-006`  
**Branch:** `phase8/P8-006-no-aim-replacement-rule`  
**Priority:** `P0`  
**Dependency:** `P8-004`  
**Output:** `docs/phase-8/no-aim-replacement-rule.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-006`

#### Description

Document that AI Teacher must not replace AIM Engine decisions.

#### Goal

Preserve AIM Engine as the learning-decision authority.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Make clear that AIM Engine owns learning decisions.
- AI Teacher may explain, guide, hint, and tutor but must not modify AIM decisions.

#### Done Test

- Expected output exists: docs/phase-8/no-aim-replacement-rule.md.
- Branch is exactly: phase8/P8-006-no-aim-replacement-rule.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-006

Files created/updated:
- ...

Branch:
phase8/P8-006-no-aim-replacement-rule

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-007 — Create AI Teacher Data Flow

**Task ID:** `P8-007`  
**Branch:** `phase8/P8-007-ai-teacher-data-flow`  
**Priority:** `P0`  
**Dependency:** `P8-003`  
**Output:** `docs/phase-8/ai-teacher-data-flow.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-007`

#### Description

Create backend and mobile data flow for AI Teacher Text Mode.

#### Goal

Define how chat input, context, prompt, provider response, safety filter, persistence, and UI display connect.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-data-flow.md.
- Branch is exactly: phase8/P8-007-ai-teacher-data-flow.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-007

Files created/updated:
- ...

Branch:
phase8/P8-007-ai-teacher-data-flow

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-008 — Create AI Teacher API Map

**Task ID:** `P8-008`  
**Branch:** `phase8/P8-008-ai-teacher-api-map`  
**Priority:** `P0`  
**Dependency:** `P8-007`  
**Output:** `docs/phase-8/ai-teacher-api-map.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-008`

#### Description

Create API map for Phase 8 endpoints.

#### Goal

Define API surface consumed by Flutter AI Teacher UI.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-api-map.md.
- Branch is exactly: phase8/P8-008-ai-teacher-api-map.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-008

Files created/updated:
- ...

Branch:
phase8/P8-008-ai-teacher-api-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-009 — Create Backend AI Teacher Feature Skeleton

**Task ID:** `P8-009`  
**Branch:** `phase8/P8-009-ai-teacher-backend-feature-skeleton`  
**Priority:** `P0`  
**Dependency:** `P8-008`  
**Output:** `Backend ai-teacher feature/module`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-009`

#### Description

Create backend ai-teacher feature/module skeleton.

#### Goal

Prepare backend structure for AI Teacher orchestration.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Backend ai-teacher feature/module.
- Branch is exactly: phase8/P8-009-ai-teacher-backend-feature-skeleton.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-009

Files created/updated:
- ...

Branch:
phase8/P8-009-ai-teacher-backend-feature-skeleton

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-010 — Create AI Teacher Architecture Document

**Task ID:** `P8-010`  
**Branch:** `phase8/P8-010-ai-teacher-architecture-doc`  
**Priority:** `P0`  
**Dependency:** `P8-009`  
**Output:** `docs/phase-8/ai-teacher-architecture.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-010`

#### Description

Create architecture document for AI Teacher backend pipeline.

#### Goal

Define components and boundaries before implementation.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-architecture.md.
- Branch is exactly: phase8/P8-010-ai-teacher-architecture-doc.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-010

Files created/updated:
- ...

Branch:
phase8/P8-010-ai-teacher-architecture-doc

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-011 — Document AI Teacher Request Lifecycle

**Task ID:** `P8-011`  
**Branch:** `phase8/P8-011-ai-teacher-request-lifecycle`  
**Priority:** `P1`  
**Dependency:** `P8-010`  
**Output:** `docs/phase-8/request-lifecycle.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-011`

#### Description

Document AI Teacher request lifecycle.

#### Goal

Explain each step from mobile message to backend response persistence.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/request-lifecycle.md.
- Branch is exactly: phase8/P8-011-ai-teacher-request-lifecycle.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-011

Files created/updated:
- ...

Branch:
phase8/P8-011-ai-teacher-request-lifecycle

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-012 — Define AI Teacher Context Sources

**Task ID:** `P8-012`  
**Branch:** `phase8/P8-012-ai-teacher-context-sources`  
**Priority:** `P0`  
**Dependency:** `P5-086, P6-130`  
**Output:** `docs/phase-8/context-sources.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-012`

#### Description

Define backend-approved context sources for AI Teacher.

#### Goal

Ensure prompts use trusted student learning context only.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: docs/phase-8/context-sources.md.
- Branch is exactly: phase8/P8-012-ai-teacher-context-sources.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-012

Files created/updated:
- ...

Branch:
phase8/P8-012-ai-teacher-context-sources

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-013 — Define AI Teacher Output Contract

**Task ID:** `P8-013`  
**Branch:** `phase8/P8-013-ai-teacher-output-contract`  
**Priority:** `P0`  
**Dependency:** `P8-010`  
**Output:** `docs/phase-8/ai-teacher-output-contract.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-013`

#### Description

Define output contract for AI Teacher responses.

#### Goal

Keep AI output predictable, safe, and displayable by mobile UI.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-output-contract.md.
- Branch is exactly: phase8/P8-013-ai-teacher-output-contract.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-013

Files created/updated:
- ...

Branch:
phase8/P8-013-ai-teacher-output-contract

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-014 — Define AI Teacher Error Policy

**Task ID:** `P8-014`  
**Branch:** `phase8/P8-014-ai-teacher-error-policy`  
**Priority:** `P1`  
**Dependency:** `P8-010`  
**Output:** `docs/phase-8/ai-teacher-error-policy.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-014`

#### Description

Define backend error handling policy for AI Teacher.

#### Goal

Provide safe failure behavior for AI provider/API errors.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/ai-teacher-error-policy.md.
- Branch is exactly: phase8/P8-014-ai-teacher-error-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-014

Files created/updated:
- ...

Branch:
phase8/P8-014-ai-teacher-error-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-015 — Define AI Teacher Permission Policy

**Task ID:** `P8-015`  
**Branch:** `phase8/P8-015-ai-teacher-permission-policy`  
**Priority:** `P0`  
**Dependency:** `P2-050, P8-010`  
**Output:** `docs/phase-8/permission-policy.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-015`

#### Description

Define permission and ownership policy for AI Teacher chat.

#### Goal

Ensure students access only their own chat/session data.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/permission-policy.md.
- Branch is exactly: phase8/P8-015-ai-teacher-permission-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-015

Files created/updated:
- ...

Branch:
phase8/P8-015-ai-teacher-permission-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-016 — Define AI Teacher Privacy Policy

**Task ID:** `P8-016`  
**Branch:** `phase8/P8-016-ai-teacher-privacy-policy`  
**Priority:** `P0`  
**Dependency:** `P8-012`  
**Output:** `docs/phase-8/privacy-policy.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-016`

#### Description

Define privacy rules for AI Teacher context, logs, and chat storage.

#### Goal

Avoid leaking sensitive data to logs/provider prompts.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: docs/phase-8/privacy-policy.md.
- Branch is exactly: phase8/P8-016-ai-teacher-privacy-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-016

Files created/updated:
- ...

Branch:
phase8/P8-016-ai-teacher-privacy-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-017 — Add AI Teacher Feature Configuration

**Task ID:** `P8-017`  
**Branch:** `phase8/P8-017-ai-teacher-feature-config`  
**Priority:** `P1`  
**Dependency:** `P8-009`  
**Output:** `Backend AI Teacher config`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-017`

#### Description

Add backend AI Teacher feature config.

#### Goal

Enable safe configuration without committed secrets.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Backend AI Teacher config.
- Branch is exactly: phase8/P8-017-ai-teacher-feature-config.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-017

Files created/updated:
- ...

Branch:
phase8/P8-017-ai-teacher-feature-config

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-018 — Create AI Chat Sessions Table

**Task ID:** `P8-018`  
**Branch:** `phase8/P8-018-ai-chat-sessions-migration`  
**Priority:** `P0`  
**Dependency:** `P8-010`  
**Output:** `DB migration for ai_chat_sessions`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-018`

#### Description

Create database migration for AI chat sessions.

#### Goal

Persist AI Teacher chat sessions per student.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: DB migration for ai_chat_sessions.
- Branch is exactly: phase8/P8-018-ai-chat-sessions-migration.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-018

Files created/updated:
- ...

Branch:
phase8/P8-018-ai-chat-sessions-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-019 — Create AI Chat Messages Table

**Task ID:** `P8-019`  
**Branch:** `phase8/P8-019-ai-chat-messages-migration`  
**Priority:** `P0`  
**Dependency:** `P8-018`  
**Output:** `DB migration for ai_chat_messages`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-019`

#### Description

Create database migration for AI chat messages.

#### Goal

Persist student and AI messages safely.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: DB migration for ai_chat_messages.
- Branch is exactly: phase8/P8-019-ai-chat-messages-migration.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-019

Files created/updated:
- ...

Branch:
phase8/P8-019-ai-chat-messages-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-020 — Create AI Context Snapshots Table

**Task ID:** `P8-020`  
**Branch:** `phase8/P8-020-ai-teacher-context-snapshots-migration`  
**Priority:** `P1`  
**Dependency:** `P8-019`  
**Output:** `DB migration for ai_context_snapshots`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-020`

#### Description

Create database migration for context snapshots.

#### Goal

Allow auditable context snapshots without unsafe sensitive logging.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: DB migration for ai_context_snapshots.
- Branch is exactly: phase8/P8-020-ai-teacher-context-snapshots-migration.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-020

Files created/updated:
- ...

Branch:
phase8/P8-020-ai-teacher-context-snapshots-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-021 — Create AI Provider Logs Table

**Task ID:** `P8-021`  
**Branch:** `phase8/P8-021-ai-teacher-provider-logs-migration`  
**Priority:** `P1`  
**Dependency:** `P8-019`  
**Output:** `DB migration for provider logs`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-021`

#### Description

Create database migration for AI provider logs.

#### Goal

Store provider metadata for observability without secrets.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: DB migration for provider logs.
- Branch is exactly: phase8/P8-021-ai-teacher-provider-logs-migration.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-021

Files created/updated:
- ...

Branch:
phase8/P8-021-ai-teacher-provider-logs-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-022 — Create AI Safety Events Table

**Task ID:** `P8-022`  
**Branch:** `phase8/P8-022-ai-teacher-safety-events-migration`  
**Priority:** `P1`  
**Dependency:** `P8-019`  
**Output:** `DB migration for safety events`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-022`

#### Description

Create database migration for AI safety events.

#### Goal

Track safety filter events and policy decisions.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: DB migration for safety events.
- Branch is exactly: phase8/P8-022-ai-teacher-safety-events-migration.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-022

Files created/updated:
- ...

Branch:
phase8/P8-022-ai-teacher-safety-events-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-023 — Create AI Teacher Feedback Table

**Task ID:** `P8-023`  
**Branch:** `phase8/P8-023-ai-teacher-feedback-migration`  
**Priority:** `P2`  
**Dependency:** `P8-019`  
**Output:** `DB migration for student feedback on AI replies`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-023`

#### Description

Create database migration for student feedback on AI replies.

#### Goal

Allow students to mark responses helpful/not helpful.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: DB migration for student feedback on AI replies.
- Branch is exactly: phase8/P8-023-ai-teacher-feedback-migration.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-023

Files created/updated:
- ...

Branch:
phase8/P8-023-ai-teacher-feedback-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-024 — Add AI Chat Indexes

**Task ID:** `P8-024`  
**Branch:** `phase8/P8-024-ai-chat-indexes`  
**Priority:** `P1`  
**Dependency:** `P8-018..P8-023`  
**Output:** `DB indexes for chat/session reads`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-024`

#### Description

Add indexes for AI chat tables.

#### Goal

Support efficient session and message reads.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: DB indexes for chat/session reads.
- Branch is exactly: phase8/P8-024-ai-chat-indexes.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-024

Files created/updated:
- ...

Branch:
phase8/P8-024-ai-chat-indexes

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-025 — Review RLS/Permission Policy for AI Chat Tables

**Task ID:** `P8-025`  
**Branch:** `phase8/P8-025-ai-chat-rls-policy-review`  
**Priority:** `P0`  
**Dependency:** `P8-018..P8-023`  
**Output:** `docs/quality/phase-8-ai-chat-rls-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-025`

#### Description

Review row-level security and permission policy for AI chat tables.

#### Goal

Verify students cannot access other students' AI chats.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-ai-chat-rls-review.md.
- Branch is exactly: phase8/P8-025-ai-chat-rls-policy-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-025

Files created/updated:
- ...

Branch:
phase8/P8-025-ai-chat-rls-policy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-026 — Add Backend AI Chat Repositories

**Task ID:** `P8-026`  
**Branch:** `phase8/P8-026-ai-chat-repositories`  
**Priority:** `P0`  
**Dependency:** `P8-018..P8-023`  
**Output:** `Backend persistence repositories`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-026`

#### Description

Add backend repositories for AI chat persistence.

#### Goal

Provide backend-controlled persistence abstraction.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Backend persistence repositories.
- Branch is exactly: phase8/P8-026-ai-chat-repositories.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-026

Files created/updated:
- ...

Branch:
phase8/P8-026-ai-chat-repositories

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-027 — Add AI Chat Repository Tests

**Task ID:** `P8-027`  
**Branch:** `phase8/P8-027-ai-chat-repository-tests`  
**Priority:** `P1`  
**Dependency:** `P8-026`  
**Output:** `Backend repository tests`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-027`

#### Description

Add repository tests for AI chat storage.

#### Goal

Validate session/message persistence behavior.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Backend repository tests.
- Branch is exactly: phase8/P8-027-ai-chat-repository-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-027

Files created/updated:
- ...

Branch:
phase8/P8-027-ai-chat-repository-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-028 — Create AI Teacher Context Builder Skeleton

**Task ID:** `P8-028`  
**Branch:** `phase8/P8-028-context-builder-skeleton`  
**Priority:** `P0`  
**Dependency:** `P8-012`  
**Output:** `Backend context builder service`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-028`

#### Description

Create AI Teacher context builder service skeleton.

#### Goal

Prepare backend context assembly pipeline.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Backend context builder service.
- Branch is exactly: phase8/P8-028-context-builder-skeleton.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-028

Files created/updated:
- ...

Branch:
phase8/P8-028-context-builder-skeleton

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-029 — Add Student Profile Context

**Task ID:** `P8-029`  
**Branch:** `phase8/P8-029-context-student-profile`  
**Priority:** `P1`  
**Dependency:** `P2-020, P8-028`  
**Output:** `Profile context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-029`

#### Description

Add student profile context adapter.

#### Goal

Include safe profile context in AI Teacher prompts.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Profile context adapter.
- Branch is exactly: phase8/P8-029-context-student-profile.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-029

Files created/updated:
- ...

Branch:
phase8/P8-029-context-student-profile

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-030 — Add Current Lesson Context

**Task ID:** `P8-030`  
**Branch:** `phase8/P8-030-context-current-lesson`  
**Priority:** `P0`  
**Dependency:** `P3-037, P8-028`  
**Output:** `Lesson context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-030`

#### Description

Add current lesson context adapter.

#### Goal

Make AI Teacher lesson-aware.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Lesson context adapter.
- Branch is exactly: phase8/P8-030-context-current-lesson.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-030

Files created/updated:
- ...

Branch:
phase8/P8-030-context-current-lesson

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-031 — Add Curriculum Skill Context

**Task ID:** `P8-031`  
**Branch:** `phase8/P8-031-context-curriculum-skill`  
**Priority:** `P0`  
**Dependency:** `P3-014, P8-028`  
**Output:** `Skill/curriculum context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-031`

#### Description

Add curriculum skill context adapter.

#### Goal

Include skill/course context in tutoring responses.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Skill/curriculum context adapter.
- Branch is exactly: phase8/P8-031-context-curriculum-skill.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-031

Files created/updated:
- ...

Branch:
phase8/P8-031-context-curriculum-skill

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-032 — Add Placement Result Context

**Task ID:** `P8-032`  
**Branch:** `phase8/P8-032-context-placement-result`  
**Priority:** `P1`  
**Dependency:** `P4-069, P8-028`  
**Output:** `Placement context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-032`

#### Description

Add placement result context adapter.

#### Goal

Let AI Teacher understand student starting level without calculating it.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Placement context adapter.
- Branch is exactly: phase8/P8-032-context-placement-result.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-032

Files created/updated:
- ...

Branch:
phase8/P8-032-context-placement-result

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-033 — Add AIM Skill State Context

**Task ID:** `P8-033`  
**Branch:** `phase8/P8-033-context-skill-state`  
**Priority:** `P0`  
**Dependency:** `P5-069, P8-028`  
**Output:** `AIM skill state context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-033`

#### Description

Add AIM skill state context adapter.

#### Goal

Use backend-approved skill state as read-only AI context.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: AIM skill state context adapter.
- Branch is exactly: phase8/P8-033-context-skill-state.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-033

Files created/updated:
- ...

Branch:
phase8/P8-033-context-skill-state

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-034 — Add Weakness Context

**Task ID:** `P8-034`  
**Branch:** `phase8/P8-034-context-weakness-records`  
**Priority:** `P0`  
**Dependency:** `P5-070, P8-028`  
**Output:** `Weakness context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-034`

#### Description

Add weakness records context adapter.

#### Goal

Let AI Teacher explain and target weaknesses without recalculating them.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Weakness context adapter.
- Branch is exactly: phase8/P8-034-context-weakness-records.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-034

Files created/updated:
- ...

Branch:
phase8/P8-034-context-weakness-records

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-035 — Add Recommendation Context

**Task ID:** `P8-035`  
**Branch:** `phase8/P8-035-context-recommendations`  
**Priority:** `P0`  
**Dependency:** `P5-071, P8-028`  
**Output:** `Recommendation context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-035`

#### Description

Add recommendations context adapter.

#### Goal

Let AI Teacher guide using backend-approved recommendations.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Recommendation context adapter.
- Branch is exactly: phase8/P8-035-context-recommendations.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-035

Files created/updated:
- ...

Branch:
phase8/P8-035-context-recommendations

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-036 — Add Review Schedule Context

**Task ID:** `P8-036`  
**Branch:** `phase8/P8-036-context-review-schedule`  
**Priority:** `P1`  
**Dependency:** `P5-072, P8-028`  
**Output:** `Review schedule context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-036`

#### Description

Add review schedule context adapter.

#### Goal

Let AI Teacher reference backend-approved reviews without generating schedules.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Review schedule context adapter.
- Branch is exactly: phase8/P8-036-context-review-schedule.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-036

Files created/updated:
- ...

Branch:
phase8/P8-036-context-review-schedule

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-037 — Add Recent Mistakes Context

**Task ID:** `P8-037`  
**Branch:** `phase8/P8-037-context-recent-mistakes`  
**Priority:** `P0`  
**Dependency:** `P5-035, P5-036, P8-028`  
**Output:** `Mistake/history context adapter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-037`

#### Description

Add recent mistakes/history context adapter.

#### Goal

Support mistake explanation and targeted hints.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Mistake/history context adapter.
- Branch is exactly: phase8/P8-037-context-recent-mistakes.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-037

Files created/updated:
- ...

Branch:
phase8/P8-037-context-recent-mistakes

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-038 — Add Context Token Budget Policy

**Task ID:** `P8-038`  
**Branch:** `phase8/P8-038-context-token-budget-policy`  
**Priority:** `P1`  
**Dependency:** `P8-028`  
**Output:** `Context trimming and priority rules`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-038`

#### Description

Add token budget and context prioritization policy.

#### Goal

Prevent prompt bloat and keep most important learning context.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Context trimming and priority rules.
- Branch is exactly: phase8/P8-038-context-token-budget-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-038

Files created/updated:
- ...

Branch:
phase8/P8-038-context-token-budget-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-039 — Persist Context Snapshots

**Task ID:** `P8-039`  
**Branch:** `phase8/P8-039-context-snapshot-persistence`  
**Priority:** `P1`  
**Dependency:** `P8-020, P8-028`  
**Output:** `Stored AI context snapshots`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-039`

#### Description

Persist safe AI Teacher context snapshots.

#### Goal

Enable observability while preserving privacy.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.

#### Done Test

- Expected output exists: Stored AI context snapshots.
- Branch is exactly: phase8/P8-039-context-snapshot-persistence.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-039

Files created/updated:
- ...

Branch:
phase8/P8-039-context-snapshot-persistence

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-040 — Add Context Builder Tests

**Task ID:** `P8-040`  
**Branch:** `phase8/P8-040-context-builder-tests`  
**Priority:** `P0`  
**Dependency:** `P8-029..P8-039`  
**Output:** `Backend context tests`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-040`

#### Description

Add tests for context builder pipeline.

#### Goal

Verify context is backend-approved, scoped, and safe.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Backend context tests.
- Branch is exactly: phase8/P8-040-context-builder-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-040

Files created/updated:
- ...

Branch:
phase8/P8-040-context-builder-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-041 — Create AI Teacher Prompt Builder Skeleton

**Task ID:** `P8-041`  
**Branch:** `phase8/P8-041-prompt-builder-skeleton`  
**Priority:** `P0`  
**Dependency:** `P8-028`  
**Output:** `Backend prompt builder service`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-041`

#### Description

Create backend prompt builder skeleton.

#### Goal

Prepare structured prompt rendering pipeline.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Backend prompt builder service.
- Branch is exactly: phase8/P8-041-prompt-builder-skeleton.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-041

Files created/updated:
- ...

Branch:
phase8/P8-041-prompt-builder-skeleton

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-042 — Define System Prompt Contract

**Task ID:** `P8-042`  
**Branch:** `phase8/P8-042-system-prompt-contract`  
**Priority:** `P0`  
**Dependency:** `P8-041`  
**Output:** `docs/phase-8/system-prompt-contract.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-042`

#### Description

Define system prompt contract.

#### Goal

Create stable policy for AI Teacher behavior and boundaries.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: docs/phase-8/system-prompt-contract.md.
- Branch is exactly: phase8/P8-042-system-prompt-contract.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-042

Files created/updated:
- ...

Branch:
phase8/P8-042-system-prompt-contract

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-043 — Create Tutoring Behavior Prompt Template

**Task ID:** `P8-043`  
**Branch:** `phase8/P8-043-tutoring-behavior-prompt`  
**Priority:** `P0`  
**Dependency:** `P8-042`  
**Output:** `Prompt template for tutoring behavior`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-043`

#### Description

Create tutoring behavior prompt template.

#### Goal

Guide AI Teacher to act like an educational English tutor.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: Prompt template for tutoring behavior.
- Branch is exactly: phase8/P8-043-tutoring-behavior-prompt.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-043

Files created/updated:
- ...

Branch:
phase8/P8-043-tutoring-behavior-prompt

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-044 — Create Lesson Help Prompt Template

**Task ID:** `P8-044`  
**Branch:** `phase8/P8-044-lesson-help-prompt`  
**Priority:** `P1`  
**Dependency:** `P8-042`  
**Output:** `Prompt template for lesson help`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-044`

#### Description

Create lesson help prompt template.

#### Goal

Support lesson-aware explanations and help.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: Prompt template for lesson help.
- Branch is exactly: phase8/P8-044-lesson-help-prompt.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-044

Files created/updated:
- ...

Branch:
phase8/P8-044-lesson-help-prompt

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-045 — Create Mistake Explanation Prompt Template

**Task ID:** `P8-045`  
**Branch:** `phase8/P8-045-mistake-explanation-prompt`  
**Priority:** `P1`  
**Dependency:** `P8-042`  
**Output:** `Prompt template for mistake explanation`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-045`

#### Description

Create mistake explanation prompt template.

#### Goal

Explain student mistakes clearly and safely.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: Prompt template for mistake explanation.
- Branch is exactly: phase8/P8-045-mistake-explanation-prompt.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-045

Files created/updated:
- ...

Branch:
phase8/P8-045-mistake-explanation-prompt

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-046 — Create Hint Generation Prompt Template

**Task ID:** `P8-046`  
**Branch:** `phase8/P8-046-hint-generation-prompt`  
**Priority:** `P1`  
**Dependency:** `P8-042`  
**Output:** `Prompt template for hints`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-046`

#### Description

Create hint generation prompt template.

#### Goal

Provide hints without directly giving answers unless appropriate.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: Prompt template for hints.
- Branch is exactly: phase8/P8-046-hint-generation-prompt.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-046

Files created/updated:
- ...

Branch:
phase8/P8-046-hint-generation-prompt

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-047 — Create Answer Explanation Prompt Template

**Task ID:** `P8-047`  
**Branch:** `phase8/P8-047-answer-explanation-prompt`  
**Priority:** `P1`  
**Dependency:** `P8-042`  
**Output:** `Prompt template for answer explanation`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-047`

#### Description

Create answer explanation prompt template.

#### Goal

Explain backend-approved answer feedback.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: Prompt template for answer explanation.
- Branch is exactly: phase8/P8-047-answer-explanation-prompt.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-047

Files created/updated:
- ...

Branch:
phase8/P8-047-answer-explanation-prompt

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-048 — Create Safety Instruction Prompt Template

**Task ID:** `P8-048`  
**Branch:** `phase8/P8-048-safety-instruction-prompt`  
**Priority:** `P0`  
**Dependency:** `P8-042`  
**Output:** `Prompt safety template`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-048`

#### Description

Create safety instruction prompt template.

#### Goal

Keep AI Teacher safe, educational, and non-clinical.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.

#### Done Test

- Expected output exists: Prompt safety template.
- Branch is exactly: phase8/P8-048-safety-instruction-prompt.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-048

Files created/updated:
- ...

Branch:
phase8/P8-048-safety-instruction-prompt

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-049 — Add No Diagnosis Policy

**Task ID:** `P8-049`  
**Branch:** `phase8/P8-049-no-diagnosis-policy`  
**Priority:** `P0`  
**Dependency:** `P8-048`  
**Output:** `Educational-only safety rule`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-049`

#### Description

Add no diagnosis policy to AI Teacher prompts.

#### Goal

Prevent clinical/medical psychological diagnosis.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Educational-only safety rule.
- Branch is exactly: phase8/P8-049-no-diagnosis-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-049

Files created/updated:
- ...

Branch:
phase8/P8-049-no-diagnosis-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-050 — Add No Learning Authority Change Policy

**Task ID:** `P8-050`  
**Branch:** `phase8/P8-050-no-authority-change-policy`  
**Priority:** `P0`  
**Dependency:** `P8-048`  
**Output:** `Prompt rule preserving AIM authority`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-050`

#### Description

Add no learning authority change policy to prompts.

#### Goal

Prevent AI Teacher from overriding AIM decisions.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Make clear that AIM Engine owns learning decisions.
- AI Teacher may explain, guide, hint, and tutor but must not modify AIM decisions.

#### Done Test

- Expected output exists: Prompt rule preserving AIM authority.
- Branch is exactly: phase8/P8-050-no-authority-change-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-050

Files created/updated:
- ...

Branch:
phase8/P8-050-no-authority-change-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-051 — Build Prompt Renderer

**Task ID:** `P8-051`  
**Branch:** `phase8/P8-051-prompt-renderer`  
**Priority:** `P0`  
**Dependency:** `P8-041..P8-050`  
**Output:** `Prompt renderer with context injection`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-051`

#### Description

Build prompt renderer with context injection.

#### Goal

Render stable prompts from templates and backend-approved context.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Prompt renderer with context injection.
- Branch is exactly: phase8/P8-051-prompt-renderer.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-051

Files created/updated:
- ...

Branch:
phase8/P8-051-prompt-renderer

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-052 — Add Prompt Builder Tests

**Task ID:** `P8-052`  
**Branch:** `phase8/P8-052-prompt-builder-tests`  
**Priority:** `P0`  
**Dependency:** `P8-051`  
**Output:** `Prompt rendering tests`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-052`

#### Description

Add tests for prompt builder and renderer.

#### Goal

Verify prompt safety, authority boundaries, and context rendering.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Prompt rendering tests.
- Branch is exactly: phase8/P8-052-prompt-builder-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-052

Files created/updated:
- ...

Branch:
phase8/P8-052-prompt-builder-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-053 — Create AI Provider Interface

**Task ID:** `P8-053`  
**Branch:** `phase8/P8-053-ai-provider-interface`  
**Priority:** `P0`  
**Dependency:** `P8-013`  
**Output:** `Backend AI provider abstraction`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-053`

#### Description

Create backend AI provider abstraction.

#### Goal

Avoid direct provider coupling in business logic.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Backend AI provider abstraction.
- Branch is exactly: phase8/P8-053-ai-provider-interface.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-053

Files created/updated:
- ...

Branch:
phase8/P8-053-ai-provider-interface

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-054 — Add AI Provider Configuration

**Task ID:** `P8-054`  
**Branch:** `phase8/P8-054-ai-provider-config`  
**Priority:** `P0`  
**Dependency:** `P8-053`  
**Output:** `Provider config without committed secrets`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-054`

#### Description

Add AI provider configuration without committed secrets.

#### Goal

Configure provider through safe environment/config pattern.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Provider config without committed secrets.
- Branch is exactly: phase8/P8-054-ai-provider-config.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-054

Files created/updated:
- ...

Branch:
phase8/P8-054-ai-provider-config

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-055 — Create AI Provider Request Mapper

**Task ID:** `P8-055`  
**Branch:** `phase8/P8-055-ai-provider-request-mapper`  
**Priority:** `P1`  
**Dependency:** `P8-051, P8-053`  
**Output:** `Backend provider request mapper`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-055`

#### Description

Create AI provider request mapper.

#### Goal

Convert internal AI Teacher request to provider-specific request.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Backend provider request mapper.
- Branch is exactly: phase8/P8-055-ai-provider-request-mapper.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-055

Files created/updated:
- ...

Branch:
phase8/P8-055-ai-provider-request-mapper

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-056 — Create AI Provider Response Mapper

**Task ID:** `P8-056`  
**Branch:** `phase8/P8-056-ai-provider-response-mapper`  
**Priority:** `P1`  
**Dependency:** `P8-053`  
**Output:** `Backend provider response mapper`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-056`

#### Description

Create AI provider response mapper.

#### Goal

Convert provider response to internal AI Teacher output contract.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Backend provider response mapper.
- Branch is exactly: phase8/P8-056-ai-provider-response-mapper.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-056

Files created/updated:
- ...

Branch:
phase8/P8-056-ai-provider-response-mapper

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-057 — Add AI Provider Timeout Policy

**Task ID:** `P8-057`  
**Branch:** `phase8/P8-057-ai-provider-timeout-policy`  
**Priority:** `P1`  
**Dependency:** `P8-053`  
**Output:** `Timeout and retry rules`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-057`

#### Description

Add timeout and retry policy.

#### Goal

Protect user experience from slow/failed provider calls.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Timeout and retry rules.
- Branch is exactly: phase8/P8-057-ai-provider-timeout-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-057

Files created/updated:
- ...

Branch:
phase8/P8-057-ai-provider-timeout-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-058 — Add AI Provider Safe Failure Handling

**Task ID:** `P8-058`  
**Branch:** `phase8/P8-058-ai-provider-safe-failure`  
**Priority:** `P0`  
**Dependency:** `P8-014, P8-057`  
**Output:** `Safe fallback response`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-058`

#### Description

Add safe failure handling for AI provider issues.

#### Goal

Return safe fallback responses without exposing internals.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Safe fallback response.
- Branch is exactly: phase8/P8-058-ai-provider-safe-failure.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-058

Files created/updated:
- ...

Branch:
phase8/P8-058-ai-provider-safe-failure

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-059 — Add AI Provider Logging

**Task ID:** `P8-059`  
**Branch:** `phase8/P8-059-ai-provider-logging`  
**Priority:** `P1`  
**Dependency:** `P8-021, P8-053`  
**Output:** `Provider request metadata logs`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-059`

#### Description

Add AI provider metadata logging.

#### Goal

Track usage safely without logging secrets or sensitive full payloads.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.

#### Done Test

- Expected output exists: Provider request metadata logs.
- Branch is exactly: phase8/P8-059-ai-provider-logging.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-059

Files created/updated:
- ...

Branch:
phase8/P8-059-ai-provider-logging

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-060 — Add No Secret Check for AI Provider Config

**Task ID:** `P8-060`  
**Branch:** `phase8/P8-060-ai-provider-no-secret-check`  
**Priority:** `P0`  
**Dependency:** `P8-054`  
**Output:** `Secret safety validation`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-060`

#### Description

Add no-secret validation for provider config.

#### Goal

Prevent provider secrets from being committed or exposed.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Secret safety validation.
- Branch is exactly: phase8/P8-060-ai-provider-no-secret-check.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-060

Files created/updated:
- ...

Branch:
phase8/P8-060-ai-provider-no-secret-check

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-061 — Add AI Provider Gateway Tests

**Task ID:** `P8-061`  
**Branch:** `phase8/P8-061-ai-provider-tests`  
**Priority:** `P0`  
**Dependency:** `P8-053..P8-060`  
**Output:** `Backend provider gateway tests`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-061`

#### Description

Add tests for provider gateway.

#### Goal

Verify mapping, timeout, failure, and secret-safety behavior.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Backend provider gateway tests.
- Branch is exactly: phase8/P8-061-ai-provider-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-061

Files created/updated:
- ...

Branch:
phase8/P8-061-ai-provider-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-062 — Build AI Teacher Orchestrator

**Task ID:** `P8-062`  
**Branch:** `phase8/P8-062-ai-teacher-orchestrator`  
**Priority:** `P0`  
**Dependency:** `P8-040, P8-052, P8-061`  
**Output:** `Backend AI Teacher orchestration service`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-062`

#### Description

Build AI Teacher orchestration service.

#### Goal

Coordinate context, prompt, provider, safety, and persistence.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Backend AI Teacher orchestration service.
- Branch is exactly: phase8/P8-062-ai-teacher-orchestrator.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-062

Files created/updated:
- ...

Branch:
phase8/P8-062-ai-teacher-orchestrator

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-063 — Build Chat Session Start Service

**Task ID:** `P8-063`  
**Branch:** `phase8/P8-063-ai-chat-session-start`  
**Priority:** `P0`  
**Dependency:** `P8-026, P8-062`  
**Output:** `Backend start session service`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-063`

#### Description

Build backend chat session start service.

#### Goal

Create student-owned AI chat sessions.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Backend start session service.
- Branch is exactly: phase8/P8-063-ai-chat-session-start.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-063

Files created/updated:
- ...

Branch:
phase8/P8-063-ai-chat-session-start

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-064 — Build Student Message Submit Service

**Task ID:** `P8-064`  
**Branch:** `phase8/P8-064-ai-chat-message-submit`  
**Priority:** `P0`  
**Dependency:** `P8-026, P8-062`  
**Output:** `Backend student message submit flow`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-064`

#### Description

Build backend student message submit flow.

#### Goal

Receive student text and start AI response pipeline.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Backend student message submit flow.
- Branch is exactly: phase8/P8-064-ai-chat-message-submit.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-064

Files created/updated:
- ...

Branch:
phase8/P8-064-ai-chat-message-submit

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-065 — Build AI Response Generation Flow

**Task ID:** `P8-065`  
**Branch:** `phase8/P8-065-ai-response-generation`  
**Priority:** `P0`  
**Dependency:** `P8-062, P8-064`  
**Output:** `AI response pipeline`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-065`

#### Description

Build AI response generation flow.

#### Goal

Generate AI Teacher response through backend-only provider gateway.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: AI response pipeline.
- Branch is exactly: phase8/P8-065-ai-response-generation.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-065

Files created/updated:
- ...

Branch:
phase8/P8-065-ai-response-generation

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-066 — Add AI Response Safety Filter

**Task ID:** `P8-066`  
**Branch:** `phase8/P8-066-ai-response-safety-filter`  
**Priority:** `P0`  
**Dependency:** `P8-022, P8-065`  
**Output:** `Backend safety filter`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-066`

#### Description

Add backend AI response safety filter.

#### Goal

Validate AI response before persistence/display.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Backend safety filter.
- Branch is exactly: phase8/P8-066-ai-response-safety-filter.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-066

Files created/updated:
- ...

Branch:
phase8/P8-066-ai-response-safety-filter

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-067 — Persist AI Chat Messages

**Task ID:** `P8-067`  
**Branch:** `phase8/P8-067-ai-message-persistence`  
**Priority:** `P0`  
**Dependency:** `P8-019, P8-065`  
**Output:** `Persist student and AI messages`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-067`

#### Description

Persist student and AI messages.

#### Goal

Store conversation history safely.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Persist student and AI messages.
- Branch is exactly: phase8/P8-067-ai-message-persistence.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-067

Files created/updated:
- ...

Branch:
phase8/P8-067-ai-message-persistence

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-068 — Build AI Teacher Feedback Service

**Task ID:** `P8-068`  
**Branch:** `phase8/P8-068-ai-teacher-feedback-service`  
**Priority:** `P2`  
**Dependency:** `P8-023, P8-067`  
**Output:** `Student feedback service`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-068`

#### Description

Build service for feedback on AI replies.

#### Goal

Allow students to rate AI responses.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Student feedback service.
- Branch is exactly: phase8/P8-068-ai-teacher-feedback-service.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-068

Files created/updated:
- ...

Branch:
phase8/P8-068-ai-teacher-feedback-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-069 — Add AI Teacher Rate Limit Policy

**Task ID:** `P8-069`  
**Branch:** `phase8/P8-069-ai-teacher-rate-limit-policy`  
**Priority:** `P1`  
**Dependency:** `P8-062`  
**Output:** `Backend rate limit policy`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-069`

#### Description

Add rate limit policy for AI Teacher.

#### Goal

Protect system cost and abuse risk.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.

#### Done Test

- Expected output exists: Backend rate limit policy.
- Branch is exactly: phase8/P8-069-ai-teacher-rate-limit-policy.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-069

Files created/updated:
- ...

Branch:
phase8/P8-069-ai-teacher-rate-limit-policy

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-070 — Add AI Teacher Pipeline Tests

**Task ID:** `P8-070`  
**Branch:** `phase8/P8-070-ai-teacher-pipeline-tests`  
**Priority:** `P0`  
**Dependency:** `P8-062..P8-069`  
**Output:** `Backend pipeline tests`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-070`

#### Description

Add tests for full backend AI Teacher pipeline.

#### Goal

Verify orchestrator, safety, persistence, and no authority violation.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Backend pipeline tests.
- Branch is exactly: phase8/P8-070-ai-teacher-pipeline-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-070

Files created/updated:
- ...

Branch:
phase8/P8-070-ai-teacher-pipeline-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-071 — Create Start Chat API

**Task ID:** `P8-071`  
**Branch:** `phase8/P8-071-ai-chat-start-api`  
**Priority:** `P0`  
**Dependency:** `P8-063`  
**Output:** `POST /ai-teacher/sessions`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-071`

#### Description

Create API endpoint to start AI chat session.

#### Goal

Allow mobile client to start backend-controlled session.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: POST /ai-teacher/sessions.
- Branch is exactly: phase8/P8-071-ai-chat-start-api.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-071

Files created/updated:
- ...

Branch:
phase8/P8-071-ai-chat-start-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-072 — Create Send Message API

**Task ID:** `P8-072`  
**Branch:** `phase8/P8-072-ai-chat-send-message-api`  
**Priority:** `P0`  
**Dependency:** `P8-064, P8-065`  
**Output:** `POST /ai-teacher/sessions/:id/messages`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-072`

#### Description

Create API endpoint to send chat message.

#### Goal

Allow mobile client to submit message to backend AI Teacher pipeline.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: POST /ai-teacher/sessions/:id/messages.
- Branch is exactly: phase8/P8-072-ai-chat-send-message-api.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-072

Files created/updated:
- ...

Branch:
phase8/P8-072-ai-chat-send-message-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-073 — Create Chat History API

**Task ID:** `P8-073`  
**Branch:** `phase8/P8-073-ai-chat-history-api`  
**Priority:** `P1`  
**Dependency:** `P8-067`  
**Output:** `GET /ai-teacher/sessions/:id/messages`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-073`

#### Description

Create API endpoint to read chat history.

#### Goal

Allow mobile client to display previous messages.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: GET /ai-teacher/sessions/:id/messages.
- Branch is exactly: phase8/P8-073-ai-chat-history-api.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-073

Files created/updated:
- ...

Branch:
phase8/P8-073-ai-chat-history-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-074 — Create Chat Session List API

**Task ID:** `P8-074`  
**Branch:** `phase8/P8-074-ai-chat-session-list-api`  
**Priority:** `P2`  
**Dependency:** `P8-063`  
**Output:** `GET /ai-teacher/sessions`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-074`

#### Description

Create API endpoint to list chat sessions.

#### Goal

Allow mobile client to resume/select sessions.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: GET /ai-teacher/sessions.
- Branch is exactly: phase8/P8-074-ai-chat-session-list-api.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-074

Files created/updated:
- ...

Branch:
phase8/P8-074-ai-chat-session-list-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-075 — Create AI Teacher Feedback API

**Task ID:** `P8-075`  
**Branch:** `phase8/P8-075-ai-teacher-feedback-api`  
**Priority:** `P2`  
**Dependency:** `P8-068`  
**Output:** `Feedback endpoint`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-075`

#### Description

Create API endpoint for AI reply feedback.

#### Goal

Allow mobile feedback actions.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: Feedback endpoint.
- Branch is exactly: phase8/P8-075-ai-teacher-feedback-api.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-075

Files created/updated:
- ...

Branch:
phase8/P8-075-ai-teacher-feedback-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-076 — Add AI Teacher API Guards

**Task ID:** `P8-076`  
**Branch:** `phase8/P8-076-ai-teacher-api-guards`  
**Priority:** `P0`  
**Dependency:** `P8-015, P8-071..P8-075`  
**Output:** `Auth/ownership guards`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-076`

#### Description

Add auth and ownership guards for AI Teacher endpoints.

#### Goal

Protect chat/session ownership and API access.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: Auth/ownership guards.
- Branch is exactly: phase8/P8-076-ai-teacher-api-guards.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-076

Files created/updated:
- ...

Branch:
phase8/P8-076-ai-teacher-api-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-077 — Add AI Teacher API DTO Validation

**Task ID:** `P8-077`  
**Branch:** `phase8/P8-077-ai-teacher-api-dto-validation`  
**Priority:** `P0`  
**Dependency:** `P8-071..P8-075`  
**Output:** `Backend DTO validation`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-077`

#### Description

Add DTO validation for AI Teacher API.

#### Goal

Validate input payloads before pipeline execution.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.

#### Done Test

- Expected output exists: Backend DTO validation.
- Branch is exactly: phase8/P8-077-ai-teacher-api-dto-validation.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-077

Files created/updated:
- ...

Branch:
phase8/P8-077-ai-teacher-api-dto-validation

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-078 — Add AI Teacher API Tests

**Task ID:** `P8-078`  
**Branch:** `phase8/P8-078-ai-teacher-api-tests`  
**Priority:** `P0`  
**Dependency:** `P8-071..P8-077`  
**Output:** `Backend API tests`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-078`

#### Description

Add tests for AI Teacher API endpoints.

#### Goal

Verify auth, validation, ownership, and API behavior.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Protect endpoints with auth and ownership rules.
- Validate DTOs before pipeline execution.
- Return safe errors without exposing internals.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Backend API tests.
- Branch is exactly: phase8/P8-078-ai-teacher-api-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- Auth/ownership guards and DTO validation are present where required.

#### Completion Comment Template

```text
Completed — P8-078

Files created/updated:
- ...

Branch:
phase8/P8-078-ai-teacher-api-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-079 — Review Phase 6 AI Teacher Shell

**Task ID:** `P8-079`  
**Branch:** `phase8/P8-079-flutter-ai-teacher-shell-review`  
**Priority:** `P1`  
**Dependency:** `P6-105..P6-109`  
**Output:** `docs/quality/phase-8-ai-teacher-shell-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-079`

#### Description

Review existing Flutter AI Teacher shell from Phase 6.

#### Goal

Confirm shell readiness before enabling text chat UI.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-ai-teacher-shell-review.md.
- Branch is exactly: phase8/P8-079-flutter-ai-teacher-shell-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-079

Files created/updated:
- ...

Branch:
phase8/P8-079-flutter-ai-teacher-shell-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-080 — Create Flutter AI Teacher Feature Structure

**Task ID:** `P8-080`  
**Branch:** `phase8/P8-080-flutter-ai-teacher-feature-structure`  
**Priority:** `P0`  
**Dependency:** `P8-079`  
**Output:** `features/ai_tutor/...`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-080`

#### Description

Create/complete Flutter AI Teacher feature structure.

#### Goal

Prepare feature-first UI/data layers for chat.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: features/ai_tutor/....
- Branch is exactly: phase8/P8-080-flutter-ai-teacher-feature-structure.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-080

Files created/updated:
- ...

Branch:
phase8/P8-080-flutter-ai-teacher-feature-structure

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-081 — Add Flutter AI Chat Models

**Task ID:** `P8-081`  
**Branch:** `phase8/P8-081-flutter-ai-chat-models`  
**Priority:** `P0`  
**Dependency:** `P8-071..P8-075`  
**Output:** `Chat session/message models`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-081`

#### Description

Add Flutter AI chat session/message models.

#### Goal

Match backend AI Teacher API contracts.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Chat session/message models.
- Branch is exactly: phase8/P8-081-flutter-ai-chat-models.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-081

Files created/updated:
- ...

Branch:
phase8/P8-081-flutter-ai-chat-models

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-082 — Add Flutter AI Chat Datasource

**Task ID:** `P8-082`  
**Branch:** `phase8/P8-082-flutter-ai-chat-datasource`  
**Priority:** `P0`  
**Dependency:** `P8-071..P8-075, P8-081`  
**Output:** `Backend AI Teacher datasource`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-082`

#### Description

Add mobile datasource for backend AI Teacher APIs.

#### Goal

Ensure Flutter calls backend only, never AI provider.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Backend AI Teacher datasource.
- Branch is exactly: phase8/P8-082-flutter-ai-chat-datasource.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-082

Files created/updated:
- ...

Branch:
phase8/P8-082-flutter-ai-chat-datasource

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-083 — Add AI Chat Repository/Provider

**Task ID:** `P8-083`  
**Branch:** `phase8/P8-083-flutter-ai-chat-repository-provider`  
**Priority:** `P0`  
**Dependency:** `P8-082`  
**Output:** `Repository/provider for chat`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-083`

#### Description

Add repository/provider for AI chat feature.

#### Goal

Expose chat state to UI using project state pattern.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Repository/provider for chat.
- Branch is exactly: phase8/P8-083-flutter-ai-chat-repository-provider.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-083

Files created/updated:
- ...

Branch:
phase8/P8-083-flutter-ai-chat-repository-provider

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-084 — Build AI Teacher Entry Card

**Task ID:** `P8-084`  
**Branch:** `phase8/P8-084-flutter-ai-teacher-entry-card`  
**Priority:** `P1`  
**Dependency:** `P6-027, P6-028, P6-029, P8-083`  
**Output:** `Entry card using AIM Mobile Design System`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-084`

#### Description

Build entry card for AI Teacher using AIM Mobile Design System.

#### Goal

Let students open AI Teacher text chat from mobile UI.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Entry card using AIM Mobile Design System.
- Branch is exactly: phase8/P8-084-flutter-ai-teacher-entry-card.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-084

Files created/updated:
- ...

Branch:
phase8/P8-084-flutter-ai-teacher-entry-card

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-085 — Build AI Teacher Chat Screen

**Task ID:** `P8-085`  
**Branch:** `phase8/P8-085-flutter-ai-chat-screen`  
**Priority:** `P0`  
**Dependency:** `P6-027, P6-028, P6-029, P8-083`  
**Output:** `Chat screen using design system`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-085`

#### Description

Build AI Teacher chat screen using AIM Mobile Design System.

#### Goal

Provide main text chat UI.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Chat screen using design system.
- Branch is exactly: phase8/P8-085-flutter-ai-chat-screen.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-085

Files created/updated:
- ...

Branch:
phase8/P8-085-flutter-ai-chat-screen

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-086 — Build AI Chat Message Bubbles

**Task ID:** `P8-086`  
**Branch:** `phase8/P8-086-flutter-ai-message-bubbles`  
**Priority:** `P0`  
**Dependency:** `P6-014, P6-029, P8-085`  
**Output:** `Student/AI message bubbles with RTL support`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-086`

#### Description

Build student/AI message bubbles using AIM Mobile Design System.

#### Goal

Display messages consistently with RTL/Arabic support.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Student/AI message bubbles with RTL support.
- Branch is exactly: phase8/P8-086-flutter-ai-message-bubbles.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-086

Files created/updated:
- ...

Branch:
phase8/P8-086-flutter-ai-message-bubbles

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-087 — Build AI Message Input

**Task ID:** `P8-087`  
**Branch:** `phase8/P8-087-flutter-ai-message-input`  
**Priority:** `P0`  
**Dependency:** `P6-027, P6-028, P6-029, P8-085`  
**Output:** `Chat input using design system`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-087`

#### Description

Build chat message input using AIM Mobile Design System.

#### Goal

Allow student to type and submit text messages.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Chat input using design system.
- Branch is exactly: phase8/P8-087-flutter-ai-message-input.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-087

Files created/updated:
- ...

Branch:
phase8/P8-087-flutter-ai-message-input

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-088 — Build AI Typing/Loading State

**Task ID:** `P8-088`  
**Branch:** `phase8/P8-088-flutter-ai-typing-loading-state`  
**Priority:** `P1`  
**Dependency:** `P6-025, P8-085`  
**Output:** `AI typing/loading UI`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-088`

#### Description

Build AI typing/loading UI state.

#### Goal

Show safe loading feedback during backend AI response generation.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: AI typing/loading UI.
- Branch is exactly: phase8/P8-088-flutter-ai-typing-loading-state.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-088

Files created/updated:
- ...

Branch:
phase8/P8-088-flutter-ai-typing-loading-state

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-089 — Build AI Error State

**Task ID:** `P8-089`  
**Branch:** `phase8/P8-089-flutter-ai-error-state`  
**Priority:** `P1`  
**Dependency:** `P6-025, P8-085`  
**Output:** `Safe chat error UI`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-089`

#### Description

Build safe chat error UI using design system.

#### Goal

Show safe error state without exposing provider internals.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Safe chat error UI.
- Branch is exactly: phase8/P8-089-flutter-ai-error-state.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-089

Files created/updated:
- ...

Branch:
phase8/P8-089-flutter-ai-error-state

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-090 — Build Lesson Context Header

**Task ID:** `P8-090`  
**Branch:** `phase8/P8-090-flutter-ai-lesson-context-header`  
**Priority:** `P1`  
**Dependency:** `P8-030, P8-085`  
**Output:** `Lesson-aware chat header`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-090`

#### Description

Build lesson-aware chat header using design system.

#### Goal

Show current lesson/context when available.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use backend-approved context sources only.
- Filter context for ownership, privacy, and relevance.
- Do not trust client-submitted learning state.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Lesson-aware chat header.
- Branch is exactly: phase8/P8-090-flutter-ai-lesson-context-header.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.
- Context is backend-approved, ownership-safe, and privacy-safe.

#### Completion Comment Template

```text
Completed — P8-090

Files created/updated:
- ...

Branch:
phase8/P8-090-flutter-ai-lesson-context-header

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-091 — Build Suggested Prompts UI

**Task ID:** `P8-091`  
**Branch:** `phase8/P8-091-flutter-ai-suggested-prompts`  
**Priority:** `P1`  
**Dependency:** `P6-027, P6-028, P8-085`  
**Output:** `Suggested prompt chips/buttons`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-091`

#### Description

Build suggested prompt chips/buttons using AIM Mobile Design System.

#### Goal

Help students start useful tutoring conversations.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep prompts educational, safe, non-clinical, and bounded by AIM authority.
- Do not include secrets or unnecessary sensitive data in prompts.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Suggested prompt chips/buttons.
- Branch is exactly: phase8/P8-091-flutter-ai-suggested-prompts.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-091

Files created/updated:
- ...

Branch:
phase8/P8-091-flutter-ai-suggested-prompts

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-092 — Build AI Reply Feedback Actions

**Task ID:** `P8-092`  
**Branch:** `phase8/P8-092-flutter-ai-feedback-actions`  
**Priority:** `P2`  
**Dependency:** `P8-075, P8-085`  
**Output:** `Helpful/not helpful actions`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-092`

#### Description

Build feedback actions for AI replies using design system.

#### Goal

Allow helpful/not helpful feedback on AI responses.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Helpful/not helpful actions.
- Branch is exactly: phase8/P8-092-flutter-ai-feedback-actions.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-092

Files created/updated:
- ...

Branch:
phase8/P8-092-flutter-ai-feedback-actions

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-093 — Run AI Chat RTL/Arabic Check

**Task ID:** `P8-093`  
**Branch:** `phase8/P8-093-flutter-ai-chat-rtl-arabic-check`  
**Priority:** `P0`  
**Dependency:** `P8-086..P8-092`  
**Output:** `docs/quality/phase-8-ai-chat-rtl-arabic-check.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-093`

#### Description

Run AI chat RTL/Arabic check.

#### Goal

Ensure Arabic/RTL layout is respected and not ignored.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.
- Treat RTL/Arabic as mandatory, not optional.
- Document all RTL gaps and fixes.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-ai-chat-rtl-arabic-check.md.
- Branch is exactly: phase8/P8-093-flutter-ai-chat-rtl-arabic-check.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-093

Files created/updated:
- ...

Branch:
phase8/P8-093-flutter-ai-chat-rtl-arabic-check

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-094 — Verify No Direct AI Provider Calls in Flutter

**Task ID:** `P8-094`  
**Branch:** `phase8/P8-094-flutter-no-direct-ai-provider-check`  
**Priority:** `P0`  
**Dependency:** `P8-082..P8-092`  
**Output:** `Regression check`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-094`

#### Description

Verify Flutter has no direct AI provider calls.

#### Goal

Preserve backend-only AI provider boundary.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Keep provider access behind backend gateway only.
- Read provider config from safe environment/config sources.
- Never commit provider secrets.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.

#### Done Test

- Expected output exists: Regression check.
- Branch is exactly: phase8/P8-094-flutter-no-direct-ai-provider-check.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.
- Provider access remains backend-only and secrets are not committed.

#### Completion Comment Template

```text
Completed — P8-094

Files created/updated:
- ...

Branch:
phase8/P8-094-flutter-no-direct-ai-provider-check

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-095 — Add Flutter AI Chat Tests

**Task ID:** `P8-095`  
**Branch:** `phase8/P8-095-flutter-ai-chat-tests`  
**Priority:** `P0`  
**Dependency:** `P8-080..P8-094`  
**Output:** `Flutter AI Teacher UI checks`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-095`

#### Description

Add Flutter checks/tests for AI chat UI.

#### Goal

Verify UI, state, backend datasource, RTL/Arabic, and no provider calls.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Use AIM Mobile Design System from the design-system branch and existing mobile theme/widgets.
- Use shared colors, typography, spacing, radius, buttons, cards, inputs, loading states, empty/error states, and chat components where available.
- Do not hard-code random colors, spacing, text styles, buttons, cards, or one-off UI styles.
- If a needed component/token is missing, extend the shared design-system layer instead of adding isolated styling inside the feature.
- Do not ignore RTL/Arabic rules.
- Review text direction, alignment, icon direction, layout direction, spacing, and message bubble behavior for Arabic/RTL.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: Flutter AI Teacher UI checks.
- Branch is exactly: phase8/P8-095-flutter-ai-chat-tests.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.
- UI uses AIM Mobile Design System tokens/widgets.
- No one-off random styling was introduced.
- RTL/Arabic behavior was checked and not ignored.

#### Completion Comment Template

```text
Completed — P8-095

Files created/updated:
- ...

Branch:
phase8/P8-095-flutter-ai-chat-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-096 — Run AI Teacher Security Review

**Task ID:** `P8-096`  
**Branch:** `phase8/P8-096-ai-teacher-security-review`  
**Priority:** `P0`  
**Dependency:** `P8-078, P8-095`  
**Output:** `docs/quality/phase-8-security-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-096`

#### Description

Run Phase 8 AI Teacher security review.

#### Goal

Verify auth, permissions, secrets, provider boundaries, and logs.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-security-review.md.
- Branch is exactly: phase8/P8-096-ai-teacher-security-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-096

Files created/updated:
- ...

Branch:
phase8/P8-096-ai-teacher-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-097 — Run AI Teacher Privacy Review

**Task ID:** `P8-097`  
**Branch:** `phase8/P8-097-ai-teacher-privacy-review`  
**Priority:** `P0`  
**Dependency:** `P8-096`  
**Output:** `docs/quality/phase-8-privacy-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-097`

#### Description

Run Phase 8 AI Teacher privacy review.

#### Goal

Verify safe context, chat storage, provider payloads, and logs.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-privacy-review.md.
- Branch is exactly: phase8/P8-097-ai-teacher-privacy-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-097

Files created/updated:
- ...

Branch:
phase8/P8-097-ai-teacher-privacy-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-098 — Run AI Teacher Safety Review

**Task ID:** `P8-098`  
**Branch:** `phase8/P8-098-ai-teacher-safety-review`  
**Priority:** `P0`  
**Dependency:** `P8-096`  
**Output:** `docs/quality/phase-8-safety-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-098`

#### Description

Run Phase 8 AI Teacher safety review.

#### Goal

Verify educational-only behavior, no diagnosis, safe fallback, and response filtering.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-safety-review.md.
- Branch is exactly: phase8/P8-098-ai-teacher-safety-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-098

Files created/updated:
- ...

Branch:
phase8/P8-098-ai-teacher-safety-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-099 — Run No Authority Violation Review

**Task ID:** `P8-099`  
**Branch:** `phase8/P8-099-ai-teacher-no-authority-review`  
**Priority:** `P0`  
**Dependency:** `P8-096`  
**Output:** `docs/quality/phase-8-no-authority-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-099`

#### Description

Run Phase 8 AI Teacher no-authority violation review.

#### Goal

Verify AI Teacher does not replace AIM Engine decisions.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Make clear that AIM Engine owns learning decisions.
- AI Teacher may explain, guide, hint, and tutor but must not modify AIM decisions.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/quality/phase-8-no-authority-review.md.
- Branch is exactly: phase8/P8-099-ai-teacher-no-authority-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-099

Files created/updated:
- ...

Branch:
phase8/P8-099-ai-teacher-no-authority-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

### #P8-100 — Create Phase 8 Final Review and Handoff

**Task ID:** `P8-100`  
**Branch:** `phase8/P8-100-phase-8-final-review`  
**Priority:** `P0`  
**Dependency:** `P8-096..P8-099`  
**Output:** `docs/phase-8/final-review.md`  
**AgentPrompt:** `Use docs/tasks/phase8_prompts.md #P8-100`

#### Description

Create final review and handoff for Phase 8.

#### Goal

Close Phase 8 with outputs, limitations, checks, and readiness for next phase.

#### Requirements

- Use the exact Branch, Output, and Dependency values shown in this section.
- Keep work limited to this task only.
- Do not implement unrelated Phase 8 tasks.
- Do not add Voice AI, Speech-to-Text, Text-to-Speech, realtime voice, payments, parent dashboard, admin dashboard, or Student Web App.
- Do not let AI Teacher replace AIM Engine authority.
- Do not calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter.
- Do not call any AI provider directly from Flutter.
- Do not expose secrets, provider keys, Supabase service-role keys, database credentials, or production tokens.
- Run relevant tests/checks when possible.
- Document exact commands and results.
- If a check cannot run, document why.

#### Done Test

- Expected output exists: docs/phase-8/final-review.md.
- Branch is exactly: phase8/P8-100-phase-8-final-review.
- No out-of-scope Phase 8 work was added.
- No secrets are committed.
- AI Teacher does not replace AIM Engine authority.
- Flutter does not call AI provider directly.

#### Completion Comment Template

```text
Completed — P8-100

Files created/updated:
- ...

Branch:
phase8/P8-100-phase-8-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Phase 8 validation:
- Backend-only AI provider access preserved: yes/no/not applicable
- No direct Flutter AI provider call: yes/no/not applicable
- AIM Engine authority preserved: yes/no/not applicable
- No client-side learning authority added: yes/no/not applicable
- AIM Mobile Design System used for UI: yes/no/not applicable
- RTL/Arabic checked for UI: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...
```

---

